"use client";

import { safeNextPath } from "@/lib/auth-redirect";
import { authErrorMessage } from "@/lib/auth-errors";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuthFormProps {
  mode: "login" | "signup";
  defaultRole?: "student" | "teacher";
}

export function AuthForm({ mode, defaultRole = "student" }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">(defaultRole);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";
  const [formError, setFormError] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [resendRemaining, setResendRemaining] = useState(0);

  useEffect(() => {
    if (resendRemaining <= 0) return;
    const timer = setTimeout(() => setResendRemaining((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendRemaining]);

  async function resendConfirmation() {
    if (!confirmationEmail || loading || resendRemaining > 0) return;
    setLoading(true);
    setFormError("");
    try {
      const { error } = await createClient().auth.resend({
        type: "signup", email: confirmationEmail,
        options: { emailRedirectTo: window.location.origin + "/auth/callback?next=" + encodeURIComponent(next) },
      });
      if (error) throw error;
      setResendRemaining(60);
      toast.success("Solicitud de reenvío recibida. Revisa también la carpeta de spam.");
    } catch (error) {
      setFormError(authErrorMessage(error));
    } finally { setLoading(false); }
  }



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    setFormError("");
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const supabase = createClient();
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
            data: { name, role },
          },
        });
        if (error) throw error;

        if (data.user && !data.session) {
          setConfirmationEmail(normalizedEmail);
          setResendRemaining(60);
          setPassword("");
          return;
        }
        if (!data.session) throw new Error("Missing signup session");
        toast.success("Cuenta creada. ¡Bienvenido!");
        router.replace(next);
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (error) throw error;

        if (!data.session) throw new Error("Missing login session");
        toast.success("¡Bienvenido de nuevo!");
        router.replace(next);
        router.refresh();
      }
    } catch (error) {
      const message = authErrorMessage(error);
      setFormError(message);
      if ((error as { code?: string })?.code === "email_not_confirmed") setConfirmationEmail(normalizedEmail);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  if (confirmationEmail) return (
    <section className="space-y-4" aria-label="Confirmar correo">
      <div role="status" className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
        <h2 className="font-semibold">Confirma tu correo para entrar</h2>
        <p className="mt-2 break-words text-sm">La confirmación de tu cuenta está pendiente. Revisa {confirmationEmail}, incluida la carpeta de spam.</p>
        <p className="mt-2 text-xs text-muted-foreground">Si no recibes el mensaje, puedes solicitar otro. Si ya confirmaste una cuenta con este correo, inicia sesión.</p>
      </div>
      {formError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
      <Button type="button" className="w-full" onClick={resendConfirmation} loading={loading} disabled={resendRemaining > 0}>
        {resendRemaining > 0 ? "Reenviar en " + resendRemaining + " s" : "Reenviar confirmación"}
      </Button>
      <Button type="button" variant="outline" className="w-full" disabled={loading} onClick={() => { setConfirmationEmail(null); setFormError(""); router.replace("/login?next=" + encodeURIComponent(next)); }}>Ya confirmé mi correo</Button>
      <button type="button" className="text-sm text-brand-700" disabled={loading} onClick={() => { setConfirmationEmail(null); setFormError(""); }}>Corregir mi correo</button>
    </section>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
      {searchParams.get("error") === "auth" && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">El enlace de acceso no es válido o ha caducado. Inicia sesión o solicita un nuevo enlace.</p>}
      {isSignup && (
        <>
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium text-zinc-700">
              Nombre
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              autoComplete="name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Soy...</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" aria-pressed={role === "student"} onClick={() => setRole("student")}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                  role === "student" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                }`}>
                Estudiante
              </button>
              <button type="button" aria-pressed={role === "teacher"} onClick={() => setRole("teacher")}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                  role === "teacher" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                }`}>
                Docente
              </button>
            </div>
          </div>
        </>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
          Correo electrónico
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@ejemplo.com"
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700">
          Contraseña
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Al menos 8 caracteres"
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={8}
          required
        />
      </div>

      <Button type="submit" size="lg" className="w-full" loading={loading}>
        {isSignup ? "Crear cuenta" : "Iniciar sesión"}
      </Button>
    </form>
  );
}
