import { safeNextPath } from "@/lib/auth-redirect";
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNextPath((await searchParams).next);
  return (
    <AuthLayout>
      <div className="w-full">

        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Bienvenido de nuevo</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Inicia sesión para seguir aprendiendo con IA.
          </p>
        </div>
        <Suspense fallback={<div className="h-52 animate-pulse rounded-xl bg-zinc-100" />}>
          <AuthForm mode="login" />
        </Suspense>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Eres nuevo en MindForge?{" "}
          <Link
            href={"/signup?next=" + encodeURIComponent(next)}
            className="font-medium text-primary hover:text-primary-hover"
          >
            Crea una cuenta
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
