import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinesses } from "@/services/businessService";
import { AppShell } from "@/components/layout/app-shell";
import { CoachView } from "@/components/coach/coach-view";

export const metadata: Metadata = { title: "Asesor IA" };
export const revalidate = 0;

interface CoachPageProps {
  searchParams: Promise<{ business?: string | string[] }>;
}

export default async function CoachPage({ searchParams }: CoachPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/coach");

  const businesses = await getBusinesses(supabase, user.id);
  if (businesses.length === 0) redirect("/onboarding");

  const query = await searchParams;
  const requestedId = typeof query.business === "string" ? query.business : undefined;
  const business = businesses.find((item) => item.id === requestedId) ?? businesses[0];
  const { data: messages } = await supabase
    .from("coach_messages")
    .select("id, role, content, created_at")
    .eq("user_id", user.id)
    .eq("business_id", business.id)
    .order("created_at", { ascending: false }).order("id", { ascending: false })
    .limit(100);

  return (
    <AppShell businessId={business.id}>
      <CoachView business={business} initialMessages={(messages ?? []).reverse()} />
    </AppShell>
  );
}
