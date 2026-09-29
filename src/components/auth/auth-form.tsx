"use client";

import { safeNextPath } from "@/lib/auth-redirect";
import { useState } from "react";
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
            data: { name, role },
          },
        });
        if (error) throw error;

        if (data.user && !data.session) {
          toast.success("Revisa tu correo para confirmar tu cuenta.");
          return;
        }
        toast.success("Cuenta creada. ¡Bienvenido!");
        router.replace(next);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        toast.success("¡Bienvenido de nuevo!");
        router.replace(next);
        router.refresh();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "La autenticación falló. Inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
