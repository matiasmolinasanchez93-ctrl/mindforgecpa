import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { TeacherDashboardView } from "@/components/teacher/teacher-dashboard-view";
import { getProfile, getTeacherClasses } from "@/services/studentService";

export const metadata: Metadata = { title: "Panel docente" };
export const revalidate = 0;

export default async function TeacherPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/teacher");

  const profile = await getProfile(supabase, user.id);
  if (!profile) {
    return (
      <AppShell role="teacher">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold">No encontramos tu perfil</p>
            <p className="mt-2 text-sm text-muted-foreground">No pudimos cargar tu perfil. Vuelve a iniciar sesión o contacta al administrador.</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (profile.role !== "teacher") redirect("/dashboard");

  const classes = await getTeacherClasses(supabase, user.id);

  return (
    <AppShell role="teacher">
      <TeacherDashboardView profile={profile} classes={classes} />
    </AppShell>
  );
}
