import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusiness } from "@/services/businessService";
import { AppShell } from "@/components/layout/app-shell";
import { BusinessView } from "@/components/business/business-view";

export const metadata: Metadata = {
  title: "Business plan",
};

interface BusinessPageProps {
  params: Promise<{ id: string }>;
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading your business…</p>
      </div>
    );
  }

  const { business, tasks } = await getBusiness(supabase, id, user.id);

  if (!business) {
    notFound();
  }

  return (
    <AppShell businessId={business.id}>
      <BusinessView business={business} tasks={tasks} />
    </AppShell>
  );
}
