"use client";

import Link from "next/link";
import { authRedirectOrigin } from "@/lib/auth-redirect";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PasswordRecoveryForm({ mode, invalidLink = false }: { mode: "request" | "reset"; invalidLink?: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(value => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || (mode === "request" && cooldown > 0)) return;
    setError("");
    if (mode === "reset" && (password.length < 8 || password !== confirmation)) {
      setError(password.length < 8 ? "Usa al menos 8 caracteres." : "Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      if (mode === "request") {
        const redirectTo = new URL("/auth/callback", authRedirectOrigin(window.location.href));
        redirectTo.searchParams.set("next", "/reset-password");
        const result = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
          redirectTo: redirectTo.toString(),
        });
        if (result.error) throw result.error;
        setSent(true);
        setCooldown(60);
      } else {
        const result = await supabase.auth.updateUser({ password });
        if (result.error) throw result.error;
        if (!result.data.user) throw new Error("Missing user after password update");
        setPassword("");
        setConfirmation("");
        setDone(true);
      }
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  if (done) return <div className="space-y-5">
    <p role="status" className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm">Tu contraseña se actualizó correctamente. Úsala la próxima vez que inicies sesión.</p>
    <Link className="block font-medium text-primary" href="/dashboard">Continuar a mi cuenta</Link>
  </div>;

  return <form onSubmit={submit} className="space-y-5">
    {invalidLink && !sent && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">El enlace no es válido o ha caducado. Solicita uno nuevo y ábrelo en el mismo navegador donde lo pediste.</p>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {sent && <p role="status" className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm">Si existe una cuenta con ese correo, recibirás un enlace para cambiar tu contraseña. Revisa también spam y abre el enlace en este navegador.</p>}
    {mode === "request" ? <div className="space-y-2">
      <label htmlFor="recovery-email" className="text-sm font-medium">Correo electrónico</label>
      <Input id="recovery-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="tu@ejemplo.com" disabled={busy} />
    </div> : <>
      <div className="space-y-2">
        <label htmlFor="new-password" className="text-sm font-medium">Nueva contraseña</label>
        <Input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} disabled={busy} />
        <p className="text-xs text-muted-foreground">Usa al menos 8 caracteres.</p>
      </div>
      <div className="space-y-2">
        <label htmlFor="confirm-password" className="text-sm font-medium">Repite la nueva contraseña</label>
        <Input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={event => setConfirmation(event.target.value)} disabled={busy} />
      </div>
    </>}
    <Button type="submit" size="lg" className="w-full" loading={busy} disabled={mode === "request" && cooldown > 0}>
      {mode === "reset" ? "Guardar nueva contraseña" : cooldown > 0 ? "Reenviar en " + cooldown + " s" : sent ? "Reenviar enlace" : "Enviar enlace de recuperación"}
    </Button>
    <Link className="block text-center text-sm font-medium text-primary" href="/login">Volver a iniciar sesión</Link>
  </form>;
}
