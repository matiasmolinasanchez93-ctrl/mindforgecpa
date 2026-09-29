import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { JoinClassView } from "@/components/classes/join-class-view";

export const metadata: Metadata = { title: "Join a Class" };

export default async function JoinClassPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/classes");

  return (
    <AppShell role="student">
      <JoinClassView />
    </AppShell>
  );
}
