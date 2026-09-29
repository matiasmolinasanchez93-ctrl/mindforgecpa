import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { TutorView } from "@/components/tutor/tutor-view";
import { getProfile } from "@/services/studentService";

export const metadata: Metadata = { title: "AI Tutor" };
export const revalidate = 0;

export default async function TutorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/tutor");

  const profile = await getProfile(supabase, user.id);

  return (
    <AppShell role="student">
      <TutorView userName={profile?.name?.split(" ")[0] || "Student"} />
    </AppShell>
  );
}
