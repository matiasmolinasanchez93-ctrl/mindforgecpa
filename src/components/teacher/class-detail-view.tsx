"use client";

import { useState } from "react";
import { ArrowLeft, Copy, Check, Users, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { Class } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { SKILL_DISPLAY_NAMES } from "@/types";
import { ALL_SKILLS } from "@/types";

interface Member {
  student_id: string;
  student: { id: string; name: string; email: string; xp: number; level: number; streak: number } | null;
}

interface Skill {
  student_id: string;
  skill_name: string;
  score: number;
}

interface ClassDetailViewProps {
  cls: Class;
  members: Member[];
  skills: Skill[];
}

export function ClassDetailView({ cls, members, skills }: ClassDetailViewProps) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(cls.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Calculate average skills
  const skillAverages: Record<string, number> = {};
  const skillCounts: Record<string, number> = {};
  for (const s of skills) {
    skillAverages[s.skill_name] = (skillAverages[s.skill_name] || 0) + Number(s.score);
    skillCounts[s.skill_name] = (skillCounts[s.skill_name] || 0) + 1;
  }
  for (const key of Object.keys(skillAverages)) {
    skillAverages[key] = Math.round(skillAverages[key] / (skillCounts[key] || 1));
  }

  const weakSkills = ALL_SKILLS.filter((s) => skillCounts[s] > 0 && skillAverages[s] < 60);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/teacher">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" />  Volver</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{cls.name}</h1>
          <p className="mt-1 text-muted-foreground">{cls.subject}</p>
        </div>
        <button type="button" onClick={copyCode}
          className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 px-6 py-4 transition-colors hover:bg-brand-100">
          <div className="text-center">
            <p className="text-xs font-medium text-brand-600">Código de acceso</p>
            <p className="text-2xl font-bold tracking-[0.2em] text-brand-800">{cls.join_code}</p>
          </div>
          {copied ? <Check className="h-5 w-5 text-brand-500" /> : <Copy className="h-5 w-5 text-brand-400" />}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Students */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />  Estudiantes ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Aún no hay estudiantes. Comparte el código de acceso.</p>
            ) : (
              <div className="divide-y divide-zinc-100">
                {members.map((m) => (
                  <div key={m.student_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-medium">{m.student?.name || "Sin nombre"}</p>
                      <p className="text-xs text-zinc-400">{m.student?.email}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="outline">Nv.{m.student?.level || 1}</Badge>
                      <span className="text-brand-600 font-medium">{m.student?.xp || 0} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills Overview */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Promedios de habilidades de la clase</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {ALL_SKILLS.map((skill) => (
                <div key={skill}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-600">{SKILL_DISPLAY_NAMES[skill]}</span>
                    <span className="font-medium">{skillCounts[skill] ? `${skillAverages[skill]}%` : "Sin evaluar"}</span>
                  </div>
                  <ProgressBar value={skillAverages[skill] ?? 0} label={SKILL_DISPLAY_NAMES[skill]} className="mt-1 h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>

          {weakSkills.length > 0 && (
            <Card className="border-gold-200 bg-gold-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-gold-500" />  Áreas que necesitan atención
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1">
                  {weakSkills.map((s) => (
                    <li key={s} className="text-sm text-gold-800">
                      • {SKILL_DISPLAY_NAMES[s]} ({skillAverages[s]}%)
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
