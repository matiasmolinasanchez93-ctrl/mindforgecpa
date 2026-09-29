import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { ChallengesView } from "@/components/challenges/challenges-view";

export const metadata: Metadata = { title: "Retos" };

export default async function ChallengesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/challenges");

  return (
    <AppShell role="student">
      <ChallengesView />
    </AppShell>
  );
}
