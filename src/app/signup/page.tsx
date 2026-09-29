import { safeNextPath } from "@/lib/auth-redirect";
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

interface SignupPageProps {
  searchParams: Promise<{ role?: string; next?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const defaultRole = params.role === "teacher" ? "teacher" : "student";

  return (
    <AuthLayout>
      <div className="w-full">

        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            {defaultRole === "teacher" ? "Crea tu cuenta docente" : "Empieza a aprender con IA"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {defaultRole === "teacher"
              ? "Configura tu cuenta para empezar a gestionar clases."
              : "Crea tu cuenta y desarrolla tus habilidades con IA."}
          </p>
        </div>
        <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-zinc-100" />}>
          <AuthForm mode="signup" defaultRole={defaultRole as "student" | "teacher"} />
        </Suspense>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          
          ¿Ya tienes una cuenta?{" "}
          <Link
            href={"/login?next=" + encodeURIComponent(safeNextPath(params.next))}
            className="font-medium text-primary hover:text-primary-hover"
          >
            
            Iniciar sesión
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
