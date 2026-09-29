"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Plus, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import type { Profile, Class } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SUBJECTS_WITH_ICONS } from "@/lib/constants";
import { getGreeting } from "@/lib/utils";

interface TeacherDashboardViewProps {
  profile: Profile;
  classes: Class[];
}

export function TeacherDashboardView({ profile, classes }: TeacherDashboardViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("General");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const name_ = profile?.name?.split(" ")[0] || "Docente";

  async function createClass_() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", name: name.trim(), subject }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo crear la clase.");
      toast.success(`Class "${name}" created! Share the join code with students.`);
      setShowForm(false);
      setName("");
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear la clase.");
    } finally {
      setCreating(false);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{getGreeting()}, {name_}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestiona tus clases y consulta el progreso de tus estudiantes.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />  Nueva clase
        </Button>
      </div>

      {showForm && (
        <Card className="border-brand-200 bg-brand-50/50">
          <CardHeader><CardTitle className="text-sm">Crear una clase</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input aria-label="Nombre de la clase" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la clase (ej.: Ciencias de secundaria)" />
            <select aria-label="Materia de la clase" value={subject} onChange={(e) => setSubject(e.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
              {SUBJECTS_WITH_ICONS.map((s) => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
            </select>
            <div className="flex gap-2">
              <Button onClick={createClass_} loading={creating} disabled={!name.trim()}>Crear clase</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Mis clases</h2>
        {classes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Users className="mx-auto h-10 w-10 text-zinc-300" />
              <p className="mt-4 text-sm text-muted-foreground">Aún no tienes clases. Crea una para comenzar.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {classes.map((cls) => {
              
              return (
                <div key={cls.id}>
                  <Card className="transition-shadow hover:shadow-sm cursor-pointer h-full">
                    <CardContent className="py-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <Users className="h-6 w-6 text-primary" />
                          <h3 className="mt-4 font-semibold"><Link href={`/teacher/classes/${cls.id}`} className="hover:text-primary">{cls.name}</Link></h3>
                          <p className="text-xs text-zinc-400">{cls.subject}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <button type="button" aria-label={`Copy join code for ${cls.name}`}
                          className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1.5 font-mono text-sm font-bold tracking-wider cursor-pointer"
                          onClick={() => copyCode(cls.join_code)}
                        >
                          {cls.join_code}
                          {copied === cls.join_code ? <Check className="h-3 w-3 text-brand-500" /> : <Copy className="h-3 w-3 text-zinc-400" />}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
