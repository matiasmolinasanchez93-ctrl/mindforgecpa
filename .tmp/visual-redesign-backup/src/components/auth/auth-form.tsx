"use client";

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
  const next = searchParams.get("next") ?? "/dashboard";

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
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { name, role },
          },
        });
        if (error) throw error;

        if (data.user && !data.session) {
          toast.success("Check your email to confirm your account.");
          return;
        }
        toast.success("Account created. Welcome!");
        router.push(next);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        toast.success("Welcome back!");
        router.push(next);
        router.refresh();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Authentication failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSignup && (
        <>
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium text-zinc-700">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">I am a...</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setRole("student")}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                  role === "student" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                }`}>
                🎓 Student
              </button>
              <button type="button" onClick={() => setRole("teacher")}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                  role === "teacher" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                }`}>
                👨‍🏫 Teacher
              </button>
            </div>
          </div>
        </>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={8}
          required
        />
      </div>

      <Button type="submit" size="lg" className="w-full" loading={loading}>
        {isSignup ? "Create account" : "Sign in"}
      </Button>
    </form>
  );
}
