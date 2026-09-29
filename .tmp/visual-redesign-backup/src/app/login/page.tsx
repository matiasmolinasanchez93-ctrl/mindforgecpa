import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue learning with AI.
          </p>
        </div>
        <Suspense fallback={<div className="h-52 animate-pulse rounded-xl bg-zinc-100" />}>
          <AuthForm mode="login" />
        </Suspense>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to MindForge?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary hover:text-primary-hover"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
