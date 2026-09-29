"use client";

import { useState, type CSSProperties } from "react";
import { SchoolConfetti } from "./school-confetti";
import { AIStatus } from "@/components/ui/ai-status";
import { Puzzle, CheckCircle, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import type { Subject, Difficulty, ActivityType } from "@/types";
import { ACTIVITIES, SUBJECTS_WITH_ICONS, DIFFICULTY_LEVELS } from "@/lib/constants";

interface Challenge {
  title: string;
  description: string;
  content: string;
  ticket: string;
  options?: string[];
  hints: string[];
  explanation: string;
  xpBase: number;
}

export function ChallengesView() {
  const [selectedType, setSelectedType] = useState<ActivityType>("solve_it");
  const [subject, setSubject] = useState<Subject>("General");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [solution, setSolution] = useState({ correctAnswer: "", explanation: "" });
  const [celebrate, setCelebrate] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [streak, setStreak] = useState(0);

  async function fetchChallenge() {
    if (loading || evaluating) return;
    setCelebrate(false);
    setXpEarned(0);
    setFeedback("");
    setLoading(true);
    setChallenge(null);
    setAnswer("");
    setHintsRevealed(0);
    setSubmitted(false);
    setScore(null);
    try {
      const res = await fetch(`/api/challenge?type=${selectedType}&subject=${subject}&difficulty=${difficulty}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo cargar el desafío.");
      setChallenge(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar el desafío.");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!challenge || !answer.trim() || evaluating || submitted) return;
    setEvaluating(true);
    try {
      const res = await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket: challenge.ticket, answer, hints_used: hintsRevealed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo evaluar tu respuesta.");
      setScore(data.score);
      setFeedback(data.feedback);
      setSolution({ correctAnswer: data.correctAnswer, explanation: data.explanation });
      setSubmitted(true);
      setRounds((prev) => prev + 1);
      setStreak((prev) => data.correct ? prev + 1 : 0);
      setCelebrate(data.correct === true);
      const earned = data.attempt?.xp_earned ?? 0;
      setXpEarned(earned);
      setTotalXp((prev) => prev + earned);
      if (!data.saved) toast("Tu respuesta fue evaluada, pero no se pudo guardar el progreso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo evaluar tu respuesta.");
    } finally { setEvaluating(false); }
  }

  return (
    <div className="space-y-8">
      {celebrate && <SchoolConfetti />}
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
        <span className="rounded-full bg-brand-50 px-3 py-2 text-brand-700">Ronda {rounds + 1}</span>
        <span className="rounded-full bg-gold-50 px-3 py-2 text-gold-800">{streak > 0 ? streak + " aciertos seguidos" : "Cada intento cuenta"}</span>
      </div>
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-gold-50 px-3 py-1 text-xs font-medium text-gold-700">
          <Puzzle className="h-3.5 w-3.5" /> Modo Desafío
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Tu próxima misión</h1>
        <p className="mt-2 text-muted-foreground">Pon a prueba tus habilidades y gana XP. Total ganado: <span className="font-semibold text-brand-600">{totalXp} XP</span></p>
      </div>

      {/* Activity Type Grid */}
      <div className="tool-workspace grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIVITIES.map((a, index) => (
          <button key={a.type} type="button" aria-pressed={selectedType === a.type} disabled={evaluating || loading} onClick={() => setSelectedType(a.type)}
            className={cn("flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
              selectedType === a.type ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-zinc-200 bg-white hover:border-zinc-300"
            )}>
            <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted font-mono text-xs text-primary">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <p className="text-sm font-semibold">{a.label}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{a.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Subject & Difficulty */}
      <div className="flex flex-wrap gap-3">
        <select disabled={evaluating || loading} aria-label="Materia" value={subject} onChange={(e) => setSubject(e.target.value as Subject)}
          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm">
          {SUBJECTS_WITH_ICONS.map((s) => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
        </select>
        <select disabled={evaluating || loading} aria-label="Dificultad" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm">
          {DIFFICULTY_LEVELS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <Button onClick={fetchChallenge} loading={loading} disabled={evaluating}>Obtener desafío</Button>
      </div>

      {/* Challenge Content */}
      {challenge && (
        <Card className="challenge-arena overflow-hidden">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center justify-between gap-3">
              <span>{challenge.title}</span>
              <Badge variant="default">+{challenge.xpBase} XP posibles</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">{challenge.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-zinc-50 p-4 text-sm leading-relaxed whitespace-pre-wrap">{challenge.content}</div>

            {!submitted ? (
              <>
                {challenge.options?.length === 4 ? (
                  <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Opciones de respuesta">
                    {challenge.options.map((option, index) => (
                      <button key={option} type="button" className="challenge-option"
                        aria-pressed={answer === option} disabled={evaluating}
                        style={{ "--option-color": ["#39318c", "#b52822", "#24736b", "#9b741b"][index] } as CSSProperties}
                        onClick={() => setAnswer(option)}>
                        <span className="challenge-option-letter" aria-hidden="true">{["A", "B", "C", "D"][index]}</span>
                        <span className="text-sm font-medium">{option}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea aria-label="Tu respuesta" value={answer} onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Tu idea importa. Escribe una respuesta breve..." rows={4} maxLength={5000} disabled={evaluating}
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                )}


                {challenge.hints.length > 0 && (
                  <div>
                    <Button variant="ghost" size="sm" onClick={() => setHintsRevealed((h) => Math.min(h + 1, challenge.hints.length))}
                      disabled={evaluating || hintsRevealed >= challenge.hints.length}>
                      <Lightbulb className="h-4 w-4" /> Mostrar pista ({hintsRevealed}/{challenge.hints.length})
                    </Button>
                    <div className="mt-2 space-y-1">
                      {challenge.hints.slice(0, hintsRevealed).map((hint, i) => (
                        <p key={i} className="rounded-lg bg-gold-50 px-3 py-2 text-xs text-gold-800">Pista {i + 1}: {hint}</p>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={submitAnswer} loading={evaluating} disabled={!answer.trim()} className="w-full">{evaluating ? "Revisando tu idea..." : "Confirmar respuesta"}</Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className={cn("challenge-score rounded-xl p-7 text-center", score! >= 80 ? "bg-achievement-soft" : "bg-gold-50")}>
                  <CheckCircle className={cn("mx-auto h-8 w-8", score! >= 80 ? "text-achievement-ink" : "text-gold-500")} />
                  <p className="mt-2 text-lg font-semibold">{score! >= 80 ? "¡Misión superada!" : "Un paso más para aprender"}</p>
                  <p className="mt-2 text-4xl font-bold">{score}<span className="text-lg font-normal"> / 100</span></p>
                  <p role="status" className="mx-auto mt-3 max-w-lg text-sm leading-relaxed">{feedback}</p>
                  <p className="text-sm text-brand-600">+{xpEarned} XP ganados</p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase text-zinc-400">Respuesta correcta</p>
                  <p className="mt-1 text-sm">{solution.correctAnswer}</p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase text-zinc-400">Explicación</p>
                  <p className="mt-1 text-sm">{solution.explanation}</p>
                </div>
                <Button onClick={fetchChallenge} className="w-full">Siguiente desafío</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {loading && <AIStatus>Preparando una misión para ti...</AIStatus>}
      {!challenge && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Puzzle className="mx-auto h-10 w-10 text-zinc-300" />
            <p className="mt-4 text-sm text-muted-foreground">Selecciona un tipo de desafío arriba y pulsa «Obtener desafío» para comenzar.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
