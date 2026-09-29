import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { ClassDetailView } from "@/components/teacher/class-detail-view";

export const metadata: Metadata = { title: "Class Details" };
export const revalidate = 0;

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/teacher");

  const { data: cls } = await supabase.from("classes").select("*").eq("id", id).maybeSingle();
  if (!cls || cls.teacher_id !== user.id) notFound();

  const { data: members } = await supabase
    .from("class_members")
    .select("*, student:profiles(id, name, email, xp, level, streak)")
    .eq("class_id", id);

  const memberIds = (members ?? []).map((m: { student_id: string }) => m.student_id);
  const { data: skills } = memberIds.length > 0
    ? await supabase.from("student_skills").select("skill_name, score, student_id").in("student_id", memberIds)
    : { data: [] };

  return (
    <AppShell role="teacher">
      <ClassDetailView cls={cls} members={members ?? []} skills={skills ?? []} />
    </AppShell>
  );
}
