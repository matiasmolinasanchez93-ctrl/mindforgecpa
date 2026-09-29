"use client";

import { useState } from "react";
import { Loader2, FileText, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PromptResult {
  optimizedPrompt: string;
  explanation: string;
  whyGood: string[];
  tips: string[];
}

export function PromptBuilderView() {
  const [goal, setGoal] = useState("");
  const [context, setContext] = useState("");
  const [constraints, setConstraints] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [result, setResult] = useState<PromptResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function build() {
    if (!goal.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/prompt-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, context, constraints, outputFormat }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to build prompt.");
      setResult(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Prompt builder failed.");
    } finally {
      setLoading(false);
    }
  }

  function copyPrompt() {
    if (!result?.optimizedPrompt) return;
    navigator.clipboard.writeText(result.optimizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
          <FileText className="h-3.5 w-3.5" /> Prompt Builder
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Build Better Prompts</h1>
        <p className="mt-2 text-muted-foreground">Describe what you need and learn why this prompt works.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Your Goal</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">What do you want to achieve? *</label>
              <textarea value={goal} onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. I need help studying the French Revolution" rows={3}
                className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Context</label>
              <Input value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g. I'm a 10th grader, test is next week" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Constraints</label>
              <Input value={constraints} onChange={(e) => setConstraints(e.target.value)} placeholder="e.g. Keep it under 500 words, no jargon" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Output Format</label>
              <Input value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} placeholder="e.g. Bullet points, study guide format" />
            </div>
            <Button onClick={build} loading={loading} disabled={!goal.trim()} className="w-full">
              <FileText className="h-4 w-4" /> Build Prompt
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {result && (
            <>
              <Card className="border-sky-200 bg-sky-50/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Optimized Prompt</CardTitle>
                    <Button variant="ghost" size="sm" onClick={copyPrompt}>
                      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap rounded-lg bg-white p-3 text-sm border border-sky-200">{result.optimizedPrompt}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm">Why This Prompt Works</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{result.explanation}</p>
                  <ul className="mt-3 space-y-1">
                    {result.whyGood.map((r, i) => (
                      <li key={i} className="flex gap-2 text-sm"><span className="text-emerald-500">✓</span> {r}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm">Tips for Next Time</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1">
                    {result.tips.map((t, i) => (
                      <li key={i} className="flex gap-2 text-sm"><Badge variant="outline" className="shrink-0">Tip {i + 1}</Badge> {t}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}

          {!result && !loading && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto h-10 w-10 text-zinc-300" />
                <p className="mt-4 text-sm text-muted-foreground">Enter your goal and click "Build Prompt" to see the optimized version.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
