"use client";

import { useState } from "react";
import { Loader2, Puzzle, CheckCircle, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Subject, Difficulty, ActivityType } from "@/types";
import { ACTIVITIES, SUBJECTS_WITH_ICONS, DIFFICULTY_LEVELS } from "@/lib/constants";

interface Challenge {
  title: string;
  description: string;
  content: string;
  correctAnswer: string;
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

  async function fetchChallenge() {
    setLoading(true);
    setChallenge(null);
    setAnswer("");
    setHintsRevealed(0);
    setSubmitted(false);
    setScore(null);
    try {
      const res = await fetch(`/api/challenge?type=${selectedType}&subject=${subject}&difficulty=${difficulty}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load challenge.");
      setChallenge(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load challenge.");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!challenge || !answer.trim()) return;
    setSubmitted(true);
    // Simple scoring: based on answer length and hints used
    const hasContent = answer.trim().length > 20;
    const calculatedScore = hasContent ? Math.min(100, 60 + (hintsRevealed === 0 ? 40 : hintsRevealed === 1 ? 25 : 10)) : 30;
    setScore(calculatedScore);

    try {
      const res = await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_type: selectedType,
          activity_title: challenge.title,
          subject,
          score: calculatedScore,
          hints_used: hintsRevealed,
          was_independent: hintsRevealed === 0,
        }),
      });
      const data = await res.json();
      if (data.attempt?.xp_earned) {
        setXpEarned(data.attempt.xp_earned);
        setTotalXp((prev) => prev + data.attempt.xp_earned);
      }
    } catch {
      // XP tracking failed silently — challenge still counts
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
          <Puzzle className="h-3.5 w-3.5" /> Challenge Mode
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Choose Your Challenge</h1>
        <p className="mt-2 text-muted-foreground">Test your skills and earn XP. Total earned: <span className="font-semibold text-emerald-600">{totalXp} XP</span></p>
      </div>

      {/* Activity Type Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIVITIES.map((a) => (
          <button key={a.type} type="button" onClick={() => setSelectedType(a.type)}
            className={cn("flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
              selectedType === a.type ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500" : "border-zinc-200 bg-white hover:border-zinc-300"
            )}>
            <span className="text-2xl">{a.icon}</span>
            <div>
              <p className="text-sm font-semibold">{a.label}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{a.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Subject & Difficulty */}
      <div className="flex flex-wrap gap-3">
        <select value={subject} onChange={(e) => setSubject(e.target.value as Subject)}
          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm">
          {SUBJECTS_WITH_ICONS.map((s) => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
        </select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm">
          {DIFFICULTY_LEVELS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <Button onClick={fetchChallenge} loading={loading}>Get Challenge</Button>
      </div>

      {/* Challenge Content */}
      {challenge && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{challenge.title}</span>
              <Badge variant="default">+{challenge.xpBase} XP possible</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">{challenge.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-zinc-50 p-4 text-sm leading-relaxed whitespace-pre-wrap">{challenge.content}</div>

            {!submitted ? (
              <>
                <textarea value={answer} onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Write your answer here..." rows={4}
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />

                {challenge.hints.length > 0 && (
                  <div>
                    <Button variant="ghost" size="sm" onClick={() => setHintsRevealed((h) => Math.min(h + 1, challenge.hints.length))}
                      disabled={hintsRevealed >= challenge.hints.length}>
                      <Lightbulb className="h-4 w-4" /> Reveal Hint ({hintsRevealed}/{challenge.hints.length})
                    </Button>
                    <div className="mt-2 space-y-1">
                      {challenge.hints.slice(0, hintsRevealed).map((hint, i) => (
                        <p key={i} className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">Hint {i + 1}: {hint}</p>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={submitAnswer} disabled={!answer.trim()} className="w-full">Submit Answer</Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className={cn("rounded-xl p-4 text-center", score! >= 70 ? "bg-emerald-50" : "bg-amber-50")}>
                  <CheckCircle className={cn("mx-auto h-8 w-8", score! >= 70 ? "text-emerald-500" : "text-amber-500")} />
                  <p className="mt-2 text-2xl font-bold">{score}%</p>
                  <p className="text-sm text-emerald-600">+{xpEarned} XP earned</p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase text-zinc-400">Correct Answer</p>
                  <p className="mt-1 text-sm">{challenge.correctAnswer}</p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase text-zinc-400">Explanation</p>
                  <p className="mt-1 text-sm">{challenge.explanation}</p>
                </div>
                <Button onClick={fetchChallenge} className="w-full">Next Challenge</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!challenge && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Puzzle className="mx-auto h-10 w-10 text-zinc-300" />
            <p className="mt-4 text-sm text-muted-foreground">Select a challenge type above and click "Get Challenge" to begin.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
