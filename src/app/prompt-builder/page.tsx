import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { PromptBuilderView } from "@/components/prompt-builder/prompt-builder-view";

export const metadata: Metadata = { title: "Creador de prompts" };

export default async function PromptBuilderPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/prompt-builder");

  return (
    <AppShell role="student">
      <PromptBuilderView />
    </AppShell>
  );
}
