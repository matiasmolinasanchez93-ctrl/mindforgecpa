import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getProfile, getStudentSkills, getRecentActivity, getStudentClasses, getStudentAchievements } from "@/services/studentService";

export const metadata: Metadata = { title: "Inicio" };
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const profile = await getProfile(supabase, user.id);
  if (!profile) {
    return (
      <AppShell role="student">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold">No encontramos tu perfil</p>
            <p className="mt-2 text-sm text-muted-foreground">No pudimos cargar tu perfil. Vuelve a iniciar sesión o contacta al administrador.</p>
            <p className="mt-1 text-xs text-zinc-400">Si el problema continúa, solicita ayuda al administrador.</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (profile.role === "teacher") redirect("/teacher");

  const [skills, recentActivity, classes, achievements, chats, chatCount, activityCount, promptCount, checkCount] = await Promise.all([
    getStudentSkills(supabase, user.id), getRecentActivity(supabase, user.id),
    getStudentClasses(supabase, user.id), getStudentAchievements(supabase, user.id),
    supabase.from("ai_sessions").select("id,title,subject,updated_at").eq("student_id", user.id).order("updated_at", { ascending: false }).limit(6),
    supabase.from("ai_sessions").select("id", { count: "exact", head: true }).eq("student_id", user.id),
    supabase.from("activity_attempts").select("id", { count: "exact", head: true }).eq("student_id", user.id),
    supabase.from("activity_attempts").select("id", { count: "exact", head: true }).eq("student_id", user.id).eq("activity_type", "prompt_builder"),
    supabase.from("activity_attempts").select("id", { count: "exact", head: true }).eq("student_id", user.id).eq("activity_type", "fact_checker"),
  ]);
  const summary = {
    conversations: chatCount.error ? null : chatCount.count ?? 0,
    activities: activityCount.error ? null : activityCount.count ?? 0,
    prompts: promptCount.error ? null : promptCount.count ?? 0,
    checks: checkCount.error ? null : checkCount.count ?? 0,
  };

  return (
    <AppShell role="student">
      <DashboardView
        profile={profile}
        conversations={chats.data ?? []}
        summary={summary}
        skills={skills}
        recentActivity={recentActivity}
        classes={classes}
        achievements={achievements}
      />
    </AppShell>
  );
}
