import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { TeacherDashboardView } from "@/components/teacher/teacher-dashboard-view";
import { getProfile, getTeacherClasses } from "@/services/studentService";

export const metadata: Metadata = { title: "Mis clases" };
export const revalidate = 0;

export default async function TeacherClassesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/teacher/classes");

  const profile = await getProfile(supabase, user.id);
  const classes = await getTeacherClasses(supabase, user.id);

  return (
    <AppShell role="teacher">
      <TeacherDashboardView profile={profile!} classes={classes} />
    </AppShell>
  );
}
