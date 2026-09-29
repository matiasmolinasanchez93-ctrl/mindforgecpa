import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordRecoveryForm } from "@/components/auth/password-recovery-form";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <AuthLayout><div className="w-full">
    <h1 className="text-3xl font-semibold tracking-tight">Recupera tu cuenta</h1>
    <p className="mb-8 mt-2 text-sm text-muted-foreground">Te enviaremos un enlace para elegir una contraseña nueva.</p>
    <PasswordRecoveryForm mode="request" invalidLink={params.error === "recovery"} />
  </div></AuthLayout>;
}
