import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordRecoveryForm } from "@/components/auth/password-recovery-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Nueva contraseña" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return <AuthLayout><div className="w-full">
    <h1 className="text-3xl font-semibold tracking-tight">Elige tu nueva contraseña</h1>
    <p className="mb-8 mt-2 text-sm text-muted-foreground">Guarda una contraseña segura para volver a tu cuenta.</p>
    {user && !error ? <PasswordRecoveryForm mode="reset" /> : <div className="space-y-4">
      <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">Necesitas un enlace de recuperación válido. Si ha caducado, solicita otro.</p>
      <Link className="font-medium text-primary" href="/forgot-password">Solicitar un nuevo enlace</Link>
    </div>}
  </div></AuthLayout>;
}
