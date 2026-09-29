"use client";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, GraduationCap, Puzzle, FileText, Search, Trophy, Flame, Clock3 } from "lucide-react";
import type { Profile, StudentSkill, ActivityAttempt, StudentAchievement, Achievement } from "@/types";
import { SKILL_DISPLAY_NAMES, xpProgressInLevel, ALL_SKILLS } from "@/types";
import { ACTIVITY_TYPE_LABELS, SUBJECTS_WITH_ICONS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { LearningArt } from "@/components/ui/learning-art";
import { getGreeting } from "@/lib/utils";

interface DashboardViewProps {
  profile: Profile; skills: StudentSkill[]; recentActivity: ActivityAttempt[];
  classes: { class: { id: string; name: string; subject: string } }[];
  achievements: (StudentAchievement & { achievement: Achievement })[];
}
const SUBJECT_LABELS: Record<string, string> = Object.fromEntries(
  SUBJECTS_WITH_ICONS.map((subject) => [subject.value, subject.label])
);
const activityLabel = (value: string): string =>
  (ACTIVITY_TYPE_LABELS as Record<string, string>)[value] ?? value.replace(/_/g, " ");
const subjectLabel = (value: string): string => SUBJECT_LABELS[value] ?? value;
const tools = [
  { href: "/tutor", title: "Tutor IA", detail: "Encuentra tu propia comprensión.", icon: GraduationCap },
  { href: "/challenges", title: "Desafíos", detail: "Pon tu pensamiento a prueba.", icon: Puzzle },
  { href: "/prompt-builder", title: "Constructor de Prompts", detail: "Mejores preguntas. Mejores resultados.", icon: FileText },
  { href: "/fact-checker", title: "Verificador de Datos", detail: "Ve más allá de la primera respuesta.", icon: Search },
];
export function DashboardView({ profile, skills, recentActivity, classes, achievements }: DashboardViewProps) {
  if (!profile) return <p role="status" className="py-20 text-center text-muted-foreground">Cargando tu espacio de aprendizaje…</p>;
  const xp = xpProgressInLevel(profile.xp || 0);
  const skillMap = new Map(skills.map(s => [s.skill_name, Number(s.score)]));
  const latest = recentActivity[0];
  const weakest = skills.filter(s => s.total_attempts > 0).sort((a,b) => Number(a.score) - Number(b.score))[0];
  const streak = profile.streak || 0;
  return <div className="space-y-9 animate-fade-in-up">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="eyebrow mb-3">Tu próximo capítulo</p><h1 className="page-heading">{getGreeting()}, {profile.name?.split(" ")[0] || "Estudiante"}.</h1><p className="mt-3 text-sm text-muted-foreground">Haz espacio para un pequeño descubrimiento hoy.</p></div>
      <span className="flex items-center gap-2 rounded-full border border-card-border bg-white px-4 py-2 text-xs"><Flame size={16} className="text-achievement-ink" /><strong>{streak} {streak === 1 ? "día" : "días"}</strong> de racha</span>
    </header>
    <section aria-labelledby="continue-title" className="panel relative overflow-hidden">
      <div className="grid md:grid-cols-[1fr_280px]">
        <div className="p-6 sm:p-9"><div className="flex flex-wrap items-center gap-3"><span className="eyebrow text-primary">Continúa aprendiendo</span><span className="h-1 w-1 rounded-full bg-zinc-300" /><span className="text-xs text-muted-foreground">{latest?.subject ? subjectLabel(latest.subject) : "Pensamiento independiente"}</span></div>
          <h2 id="continue-title" className="mt-5 max-w-lg text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{latest ? "Convierte lo que aprendiste en lo que sabes." : "Las grandes preguntas son solo el principio."}</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{latest ? `Última actividad: ${latest.activity_title || activityLabel(latest.activity_type)}. Súmale otro desafío.` : "Explora una idea con tu tutor IA y luego hazla tuya con la práctica."}</p>
          <div className="mt-7 flex flex-wrap items-center gap-5"><Link href={latest ? "/challenges" : "/tutor"} className="action-link">{latest ? "Empezar el siguiente desafío" : "Empezar a aprender"}<ArrowRight size={16} /></Link><span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 size={14} />Sesión sugerida · 10–15 min</span></div>
        </div>
        <div className="hidden border-l border-card-border bg-primary/[0.025] md:grid"><LearningArt /></div>
      </div>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-card-border bg-background/50 px-6 py-4 sm:px-9"><span className="ai-label">Aprender con IA</span><p className="text-xs text-muted-foreground">Explora una idea <span className="mx-2 text-zinc-300">/</span> Practica de forma independiente <span className="mx-2 text-zinc-300">/</span> Reflexiona y crece</p></div>
    </section>
    <section aria-label="Tu progreso" className="grid grid-cols-2 gap-6 border-b border-card-border pb-8 lg:grid-cols-[1fr_1fr_1.6fr]">
      <div><p className="eyebrow">Experiencia total</p><p className="mt-2 text-3xl font-semibold tracking-tight">{(profile.xp || 0).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">XP</span></p></div>
      <div><p className="eyebrow">Logros</p><p className="mt-2 flex items-center gap-3 text-3xl font-semibold">{achievements.length}<Trophy size={23} className="text-achievement-ink" /></p></div>
      <div className="col-span-2 lg:col-span-1"><div className="flex justify-between text-xs"><span className="font-semibold">Nivel {profile.level || 1}</span><span className="text-muted-foreground">{xp.currentLevelXp} / {xp.neededForNext} XP para el siguiente nivel</span></div><ProgressBar value={xp.percent} label="Progreso al siguiente nivel" className="mt-3 h-2.5" indicatorClassName="bg-achievement" /><p className="mt-2 text-xs text-muted-foreground">Cada intento independiente te hace avanzar.</p></div>
    </section>
    <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
      <section><div className="mb-5 flex items-baseline justify-between"><h2 className="text-lg font-semibold">Tu mapa de habilidades</h2><span className="text-xs text-muted-foreground">Construido con la práctica</span></div>
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">{ALL_SKILLS.map(key => <div key={key}><div className="mb-2.5 flex justify-between gap-3 text-xs"><span className="font-medium">{SKILL_DISPLAY_NAMES[key]}</span><span className="text-muted-foreground">{skillMap.has(key) ? `${Math.round(skillMap.get(key)!)}%` : "Sin evaluar"}</span></div><ProgressBar value={skillMap.get(key) ?? 0} label={SKILL_DISPLAY_NAMES[key]} className="h-1.5" /></div>)}</div>
      </section>
      <aside className="rounded-2xl border border-ai/15 bg-white p-6"><span className="ai-label">Tu siguiente paso</span><h2 className="mt-4 text-xl font-semibold tracking-tight">{weakest ? `Haz espacio para ${(SKILL_DISPLAY_NAMES[weakest.skill_name as keyof typeof SKILL_DISPLAY_NAMES] || weakest.skill_name).toLowerCase()}.` : "Intenta explicarlo con tus propias palabras."}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{weakest ? "Según las puntuaciones registradas de tus habilidades, esta es un área útil para practicar con tu tutor." : "Elige un tema que te despierte curiosidad. Tu tutor te ayudará a razonarlo, una pregunta a la vez."}</p><Link href="/tutor" className="text-link mt-5">Explora con tu tutor<ArrowUpRight size={15} /></Link></aside>
    </div>
    <section><h2 className="mb-5 text-lg font-semibold">Tu caja de herramientas de aprendizaje</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{tools.map((tool, i) => <Link href={tool.href} key={tool.href} className="group rounded-xl border border-card-border bg-white p-5 hover:border-primary/30 hover:shadow-sm"><div className="flex justify-between"><tool.icon size={20} className={i === 0 ? "text-ai" : "text-primary"} /><ArrowUpRight size={15} className="text-zinc-400 group-hover:text-primary" /></div><h3 className="mt-5 text-sm font-semibold">{tool.title}</h3><p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{tool.detail}</p></Link>)}</div></section>
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <section><h2 className="mb-4 text-lg font-semibold">Actividad reciente</h2><div className="panel divide-y divide-card-border">{recentActivity.length ? recentActivity.slice(0,5).map(a => <div key={a.id} className="flex items-center justify-between gap-4 p-5"><div className="min-w-0"><p className="text-sm font-medium">{a.activity_title || activityLabel(a.activity_type)}</p><p className="mt-1 text-xs text-muted-foreground">{subjectLabel(a.subject)}</p></div><div className="shrink-0 text-right"><Badge variant={a.score >= 70 ? "success" : "warning"}>{Math.round(a.score)}%</Badge><p className="mt-1 text-xs text-achievement-ink">+{a.xp_earned} XP</p></div></div>) : <div className="p-7"><p className="text-sm font-medium">Tu historia empieza con un intento.</p><p className="mt-2 text-xs text-muted-foreground">Los desafíos completados aparecerán aquí.</p><Link href="/challenges" className="text-link mt-4">Prueba tu primer desafío<ArrowRight size={14} /></Link></div>}</div></section>
      <div className="space-y-7"><section><div className="mb-4 flex justify-between"><h2 className="text-lg font-semibold">Mis clases</h2><Link href="/classes" className="text-link">Únete a una clase<ArrowUpRight size={14} /></Link></div>{classes.length ? classes.map(c => <div key={c.class.id} className="border-b border-card-border py-3"><p className="text-sm font-medium">{c.class.name}</p><p className="mt-1 text-xs text-muted-foreground">{subjectLabel(c.class.subject)}</p></div>) : <p className="text-sm text-muted-foreground">¿Aprenden juntos? Únete con el código de tu docente.</p>}</section><section><h2 className="mb-3 text-sm font-semibold">Hitos que vale la pena conservar</h2>{achievements.length ? <div className="flex flex-wrap gap-2">{achievements.map(a => <Badge key={a.id} variant="warning" title={a.achievement.description}>{a.achievement.icon} {a.achievement.name}</Badge>)}</div> : <p className="text-xs leading-relaxed text-muted-foreground">Tu primer logro está por llegar. Completa desafíos para conseguirlo.</p>}</section></div>
    </div>
  </div>;
}
