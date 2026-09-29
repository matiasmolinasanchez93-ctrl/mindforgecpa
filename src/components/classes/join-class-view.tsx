"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function JoinClassView() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function join() {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", join_code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo unir a la clase.");
      toast.success(`Joined "${data.className}"!`);
      setCode("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo unir a la clase.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 py-8">
      <div className="text-center">
        <Users className="mx-auto h-10 w-10 text-brand-500" />
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Unirte a una clase</h1>
        <p className="mt-2 text-muted-foreground">Introduce el código de 6 caracteres que te dio tu docente.</p>
      </div>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Input
            aria-label="Código de la clase"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ej.: A7K92P"
            className="text-center text-lg font-mono tracking-[0.2em] uppercase"
            maxLength={6}
          />
          <Button onClick={join} loading={loading} disabled={!code.trim()} className="w-full">
            
            Unirme a la clase
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
