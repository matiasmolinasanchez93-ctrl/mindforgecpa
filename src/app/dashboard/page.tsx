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

  const skills = await getStudentSkills(supabase, user.id);
  const recentActivity = await getRecentActivity(supabase, user.id);
  const classes = await getStudentClasses(supabase, user.id);
  const achievements = await getStudentAchievements(supabase, user.id);

  return (
    <AppShell role="student">
      <DashboardView
        profile={profile}
        skills={skills}
        recentActivity={recentActivity}
        classes={classes}
        achievements={achievements}
      />
    </AppShell>
  );
}
