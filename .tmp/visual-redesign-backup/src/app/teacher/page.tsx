import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { TeacherDashboardView } from "@/components/teacher/teacher-dashboard-view";
import { getProfile, getTeacherClasses } from "@/services/studentService";

export const metadata: Metadata = { title: "Teacher Dashboard" };
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
            <p className="text-lg font-semibold">Profile not found</p>
            <p className="mt-2 text-sm text-muted-foreground">Please run the database migration first.</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const classes = await getTeacherClasses(supabase, user.id);

  return (
    <AppShell role="teacher">
      <TeacherDashboardView profile={profile} classes={classes} />
    </AppShell>
  );
}
