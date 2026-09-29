import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Create account",
};

interface SignupPageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const defaultRole = params.role === "teacher" ? "teacher" : "student";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {defaultRole === "teacher" ? "Create your teacher account" : "Start learning with AI"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {defaultRole === "teacher"
              ? "Set up your account to start managing classes."
              : "Create your account and start building AI skills."}
          </p>
        </div>
        <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-zinc-100" />}>
          <AuthForm mode="signup" defaultRole={defaultRole as "student" | "teacher"} />
        </Suspense>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary-hover"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
