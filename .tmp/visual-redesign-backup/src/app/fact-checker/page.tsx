import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { FactCheckerView } from "@/components/fact-checker/fact-checker-view";

export const metadata: Metadata = { title: "Fact Checker" };

export default async function FactCheckerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/fact-checker");

  return (
    <AppShell role="student">
      <FactCheckerView />
    </AppShell>
  );
}
