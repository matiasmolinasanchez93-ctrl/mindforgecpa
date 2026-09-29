import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { TutorView, type TutorSessionSnapshot } from "@/components/tutor/tutor-view";
import { getProfile } from "@/services/studentService";

export const metadata: Metadata = { title: "Tutor IA" };
export const revalidate = 0;

export default async function TutorPage({ searchParams }: { searchParams: Promise<{ session?: string; new?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=" + encodeURIComponent("/tutor" + (params.session ? "?session=" + params.session : "")));
  const profile = await getProfile(supabase, user.id);
  const { data: sessions, error } = await supabase.from("ai_sessions")
    .select("id, title, subject, topic, difficulty").eq("student_id", user.id)
    .order("updated_at", { ascending: false }).limit(12);
  if (error) console.warn("[tutor] conversations unavailable:", error.message);
  let selected = params.new === "1" ? null : sessions?.find((s) => s.id === params.session) ?? (!params.session ? sessions?.[0] : null);
  if (params.session && params.new !== "1" && !selected) {
    if (!z.string().uuid().safeParse(params.session).success) redirect("/tutor");
    const result = await supabase.from("ai_sessions").select("id, title, subject, topic, difficulty")
      .eq("id", params.session).eq("student_id", user.id).maybeSingle();
    if (!result.data) redirect("/tutor");
    selected = result.data;
  }
  let initialSession: TutorSessionSnapshot | null = null;
  if (selected) {
    const result = await supabase.from("ai_session_messages").select("id, role, content")
      .eq("session_id", selected.id).order("created_at", { ascending: false })
      .order("id", { ascending: false }).limit(20);
    if (!result.error) initialSession = {
      ...selected,
      messages: (result.data ?? []).reverse(),
    } as TutorSessionSnapshot;
  }
  return <AppShell role={profile?.role === "teacher" ? "teacher" : "student"}>
    <TutorView key={initialSession?.id ?? "new"} userName={profile?.name?.split(" ")[0] || "Estudiante"}
      initialSession={initialSession} conversations={(sessions ?? []).map((s) => ({ id: s.id, title: s.title || "Conversación" }))} />
  </AppShell>;
}
