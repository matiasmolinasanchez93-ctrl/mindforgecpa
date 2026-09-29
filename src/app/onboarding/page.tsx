import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Crea tu negocio",
};

export default async function OnboardingPage() {
  const { user, profile } = await getAuth();
  if (!user) {
    redirect("/login?next=/onboarding");
  }

  const displayName = profile?.name || "";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50/50">
      <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <span className="text-sm text-muted-foreground">
            {displayName ? `Welcome, ${displayName.split(" ")[0]}` : "Comencemos"}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <OnboardingForm />
      </main>
    </div>
  );
}
