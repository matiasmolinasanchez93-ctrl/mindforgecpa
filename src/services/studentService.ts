import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Profile,
  StudentSkill,
  SkillKey,
  ActivityType,
  ActivityAttempt,
  Achievement,
  StudentAchievement,
} from "@/types";
import { calculateLevel } from "@/types";
import { ACTIVITY_SKILL_WEIGHTS } from "@/lib/constants";

// ─── Profile ─────────────────────────────────────────────────

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (data || error) return data as Profile | null;
  // Repair only the authenticated user's missing profile, never another account.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) return null;
  const { error: insertError } = await supabase.from("profiles").upsert({
    id: user.id, name: String(user.user_metadata?.name ?? ""), email: user.email ?? "",
    role: user.user_metadata?.role === "teacher" ? "teacher" : "student",
  }, { onConflict: "id", ignoreDuplicates: true });
  if (insertError) { console.warn("[profile] creation failed:", insertError.message); return null; }
  const result = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return result.data as Profile | null;
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<Pick<Profile, "name" | "role" | "onboarding_completed" | "grade" | "school_name">>
): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  return data as Profile | null;
}

// ─── Skills ──────────────────────────────────────────────────

export async function getStudentSkills(
  supabase: SupabaseClient,
  studentId: string
): Promise<StudentSkill[]> {
  const { data } = await supabase
    .from("student_skills")
    .select("*")
    .eq("student_id", studentId);
  return (data ?? []) as StudentSkill[];
}

export async function upsertSkill(
  supabase: SupabaseClient,
  studentId: string,
  skillName: string,
  scoreChange: number
): Promise<StudentSkill | null> {
  // Try to get existing skill
  const { data: existing } = await supabase
    .from("student_skills")
    .select("*")
    .eq("student_id", studentId)
    .eq("skill_name", skillName)
    .maybeSingle();

  if (existing) {
    const newScore = Math.min(100, Math.max(0, Number(existing.score) + scoreChange));
    const { data } = await supabase
      .from("student_skills")
      .update({
        score: newScore,
        total_attempts: existing.total_attempts + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();
    return data as StudentSkill | null;
  }

  const { data } = await supabase
    .from("student_skills")
    .insert({
      student_id: studentId,
      skill_name: skillName,
      score: Math.min(100, Math.max(0, 50 + scoreChange)),
      total_attempts: 1,
    })
    .select()
    .single();
  return data as StudentSkill | null;
}

// ─── XP and Gamification ─────────────────────────────────────

export async function addXp(
  supabase: SupabaseClient,
  studentId: string,
  xpAmount: number
): Promise<Profile | null> {
  const profile = await getProfile(supabase, studentId);
  if (!profile) return null;

  const newXp = profile.xp + xpAmount;
  const newLevel = calculateLevel(newXp);

  const updates: Partial<Profile> = { xp: newXp, level: newLevel };

  // Check streak
  const today = new Date().toISOString().slice(0, 10);
  if (profile.last_active_date !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (profile.last_active_date === yesterday) {
      updates.streak = profile.streak + 1;
    } else if (profile.last_active_date !== today) {
      updates.streak = 1;
    }
    updates.last_active_date = today;
  }

  const { data } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", studentId)
    .select()
    .single();

  // Check level 5 achievement
  if (newLevel >= 5) {
    await unlockAchievement(supabase, studentId, "level_5");
  }

  return data as Profile | null;
}

// ─── Activity Recording ──────────────────────────────────────

export async function recordActivityAttempt(
  supabase: SupabaseClient,
  input: {
    student_id: string;
    activity_type: ActivityType;
    activity_title: string;
    subject: string;
    score: number;
    hints_used: number;
    was_independent: boolean;
    details?: Record<string, unknown>;
  }
): Promise<ActivityAttempt | null> {
  const xpBase =
    input.activity_type === "solve_it" ? 35 :
    input.activity_type === "prompt_battle" ? 30 :
    input.activity_type === "ai_detective" ? 25 :
    input.activity_type === "fact_check" ? 25 :
    input.activity_type === "explain_it" ? 20 : 25;

  // XP calculation: base * (independent bonus) * (score/100) * (hint penalty)
  const independentBonus = input.was_independent ? 1.5 : 1.0;
  const hintPenalty = Math.max(0.3, 1 - input.hints_used * 0.15);
  const xpEarned = Math.round(xpBase * independentBonus * (input.score / 100) * hintPenalty);

  const { data: attempt } = await supabase
    .from("activity_attempts")
    .insert({
      ...input,
      xp_earned: xpEarned,
    })
    .select()
    .single();

  if (attempt) {
    // Add XP
    await addXp(supabase, input.student_id, xpEarned);

    // Update skills
    const weights = ACTIVITY_SKILL_WEIGHTS[input.activity_type] ?? {};
    for (const [skill, weight] of Object.entries(weights)) {
      const skillScoreChange = Math.round(
        (input.score - 50) * weight * (input.was_independent ? 1.2 : 0.8)
      );
      await upsertSkill(supabase, input.student_id, skill, skillScoreChange);
    }

    // Update AI Independence
    if (input.activity_type === "solve_it") {
      const independenceChange = input.was_independent ? 3 : -1;
      await upsertSkill(supabase, input.student_id, "ai_independence", independenceChange);
    }

    // Check achievements
    await checkAchievements(supabase, input.student_id);
  }

  return attempt as ActivityAttempt | null;
}

// ─── Achievements ────────────────────────────────────────────

export async function unlockAchievement(
  supabase: SupabaseClient,
  studentId: string,
  achievementKey: string
): Promise<boolean> {
  // Get achievement
  const { data: achievement } = await supabase
    .from("achievements")
    .select("*")
    .eq("key", achievementKey)
    .maybeSingle();

  if (!achievement) return false;

  // Check if already earned
  const { data: existing } = await supabase
    .from("student_achievements")
    .select("id")
    .eq("student_id", studentId)
    .eq("achievement_id", achievement.id)
    .maybeSingle();

  if (existing) return false;

  // Earn it
  await supabase.from("student_achievements").insert({
    student_id: studentId,
    achievement_id: achievement.id,
  });

  // Award XP
  await addXp(supabase, studentId, achievement.xp_reward);

  return true;
}

export async function getStudentAchievements(
  supabase: SupabaseClient,
  studentId: string
): Promise<(StudentAchievement & { achievement: Achievement })[]> {
  const { data } = await supabase
    .from("student_achievements")
    .select("*, achievement:achievements(*)")
    .eq("student_id", studentId)
    .order("earned_at", { ascending: false });

  return (data ?? []) as (StudentAchievement & { achievement: Achievement })[];
}

export async function getAllAchievements(
  supabase: SupabaseClient
): Promise<Achievement[]> {
  const { data } = await supabase
    .from("achievements")
    .select("*")
    .order("name");
  return (data ?? []) as Achievement[];
}

async function checkAchievements(
  supabase: SupabaseClient,
  studentId: string
): Promise<void> {
  // Count various activities
  const { data: attempts } = await supabase
    .from("activity_attempts")
    .select("activity_type, was_independent")
    .eq("student_id", studentId);

  if (!attempts) return;

  const totalAttempts = attempts.length;
  const promptAttempts = attempts.filter((a) => a.activity_type === "prompt_battle").length;
  const detectiveAttempts = attempts.filter((a) => a.activity_type === "ai_detective").length;
  const factCheckAttempts = attempts.filter((a) => a.activity_type === "fact_check").length;
  const independentSolves = attempts.filter(
    (a) => a.activity_type === "solve_it" && a.was_independent
  ).length;

  if (totalAttempts >= 1) await unlockAchievement(supabase, studentId, "first_tutor_session");
  if (promptAttempts >= 1) await unlockAchievement(supabase, studentId, "first_prompt");
  if (promptAttempts >= 10) await unlockAchievement(supabase, studentId, "prompt_master");
  if (detectiveAttempts >= 1) await unlockAchievement(supabase, studentId, "ai_detective");
  if (factCheckAttempts >= 5) await unlockAchievement(supabase, studentId, "skeptic");
  if (factCheckAttempts >= 10) await unlockAchievement(supabase, studentId, "fact_checker");
  if (independentSolves >= 3) await unlockAchievement(supabase, studentId, "independent_solver");
}

// ─── Recent Activity ─────────────────────────────────────────

export async function getRecentActivity(
  supabase: SupabaseClient,
  studentId: string,
  limit = 10
): Promise<ActivityAttempt[]> {
  const { data } = await supabase
    .from("activity_attempts")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as ActivityAttempt[];
}

// ─── Classes ─────────────────────────────────────────────────

export async function joinClassByCode(
  supabase: SupabaseClient,
  studentId: string,
  joinCode: string
): Promise<{ success: boolean; error?: string; className?: string }> {
  const { data: cls } = await supabase
    .from("classes")
    .select("id, name")
    .eq("join_code", joinCode.toUpperCase().trim())
    .maybeSingle();

  if (!cls) {
    return { success: false, error: "Invalid class code. Please check and try again." };
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from("class_members")
    .select("id")
    .eq("class_id", cls.id)
    .eq("student_id", studentId)
    .maybeSingle();

  if (existing) {
    return { success: false, error: "You're already in this class." };
  }

  const { error } = await supabase.from("class_members").insert({
    class_id: cls.id,
    student_id: studentId,
  });

  if (error) {
    return { success: false, error: "Couldn't join class. Please try again." };
  }

  return { success: true, className: cls.name };
}

export async function getStudentClasses(
  supabase: SupabaseClient,
  studentId: string
) {
  const { data } = await supabase
    .from("class_members")
    .select("class:classes(id, name, subject, teacher_id)")
    .eq("student_id", studentId);

  return (data ?? []) as unknown as { class: { id: string; name: string; subject: string; teacher_id: string } }[];
}

// ─── Teacher: Classes ────────────────────────────────────────

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createClass(
  supabase: SupabaseClient,
  teacherId: string,
  name: string,
  subject: string
) {
  const joinCode = generateJoinCode();
  const { data, error } = await supabase
    .from("classes")
    .insert({
      teacher_id: teacherId,
      name,
      subject,
      join_code: joinCode,
    })
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function getTeacherClasses(
  supabase: SupabaseClient,
  teacherId: string
) {
  const { data } = await supabase
    .from("classes")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getClassMembers(
  supabase: SupabaseClient,
  classId: string
) {
  const { data } = await supabase
    .from("class_members")
    .select("*, student:profiles(id, name, email, xp, level, streak)")
    .eq("class_id", classId);

  return data ?? [];
}

export async function getClassStudentSkills(
  supabase: SupabaseClient,
  classId: string
) {
  const { data: members } = await supabase
    .from("class_members")
    .select("student_id")
    .eq("class_id", classId);

  if (!members || members.length === 0) return [];

  const studentIds = members.map((m) => m.student_id);

  const { data } = await supabase
    .from("student_skills")
    .select("*, student:profiles(name)")
    .in("student_id", studentIds);

  return data ?? [];
}

export async function createAssignment(
  supabase: SupabaseClient,
  input: {
    class_id: string;
    teacher_id: string;
    title: string;
    description: string;
    activity_type: string;
    subject: string;
    difficulty: string;
    due_date?: string;
  }
) {
  const { data, error } = await supabase
    .from("assignments")
    .insert(input)
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function getClassAttempts(
  supabase: SupabaseClient,
  classId: string
) {
  const { data: members } = await supabase
    .from("class_members")
    .select("student_id")
    .eq("class_id", classId);

  if (!members || members.length === 0) return [];

  const studentIds = members.map((m) => m.student_id);

  const { data } = await supabase
    .from("activity_attempts")
    .select("*, student:profiles(name)")
    .in("student_id", studentIds)
    .order("created_at", { ascending: false })
    .limit(100);

  return data ?? [];
}
