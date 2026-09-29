import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentSkills, getStudentAchievements, getAllAchievements } from "@/services/studentService";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const skills = await getStudentSkills(supabase, user.id);
  const earnedAchievements = await getStudentAchievements(supabase, user.id);
  const allAchievements = await getAllAchievements(supabase);

  // Get profile for XP/level info
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp, level, streak")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({
    skills,
    achievements: earnedAchievements,
    allAchievements,
    profile,
  });
}
