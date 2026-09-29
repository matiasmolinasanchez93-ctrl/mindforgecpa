"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Plus, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import type { Profile, Class } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  const name_ = profile?.name?.split(" ")[0] || "Teacher";

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
      if (!res.ok) throw new Error(data.error || "Failed to create class.");
      toast.success(`Class "${name}" created! Share the join code with students.`);
      setShowForm(false);
      setName("");
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create class.");
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
          <p className="mt-1 text-sm text-muted-foreground">Manage your classes and track student progress.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> New Class
        </Button>
      </div>

      {showForm && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardHeader><CardTitle className="text-sm">Create New Class</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Class name (e.g. 10th Grade Science)" />
            <select value={subject} onChange={(e) => setSubject(e.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
              {SUBJECTS_WITH_ICONS.map((s) => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
            </select>
            <div className="flex gap-2">
              <Button onClick={createClass_} loading={creating} disabled={!name.trim()}>Create Class</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">My Classes</h2>
        {classes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Users className="mx-auto h-10 w-10 text-zinc-300" />
              <p className="mt-4 text-sm text-muted-foreground">No classes yet. Create one to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => {
              const subjectIcon = SUBJECTS_WITH_ICONS.find((s) => s.value === cls.subject)?.icon || "📚";
              return (
                <Link key={cls.id} href={`/teacher/classes/${cls.id}`}>
                  <Card className="transition-shadow hover:shadow-md cursor-pointer h-full">
                    <CardContent className="py-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-2xl">{subjectIcon}</p>
                          <h3 className="mt-2 font-semibold">{cls.name}</h3>
                          <p className="text-xs text-zinc-400">{cls.subject}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div
                          className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1.5 font-mono text-sm font-bold tracking-wider cursor-pointer"
                          onClick={(e) => { e.preventDefault(); copyCode(cls.join_code); }}
                        >
                          {cls.join_code}
                          {copied === cls.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-zinc-400" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
