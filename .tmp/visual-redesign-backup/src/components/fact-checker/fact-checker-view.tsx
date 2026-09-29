"use client";

import { useState } from "react";
import { Search, AlertTriangle, CheckCircle, HelpCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Claim {
  statement: string;
  status: "likely_accurate" | "needs_verification" | "likely_inaccurate" | "uncertain";
  explanation: string;
  suggestedVerification: string;
}

interface FactCheckResult {
  overallAssessment: string;
  claims: Claim[];
  keyWarnings: string[];
  questionsToInvestigate: string[];
  confidenceNote: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: typeof CheckCircle }> = {
  likely_accurate: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle },
  needs_verification: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: HelpCircle },
  likely_inaccurate: { color: "text-red-700", bg: "bg-red-50 border-red-200", icon: AlertTriangle },
  uncertain: { color: "text-zinc-700", bg: "bg-zinc-50 border-zinc-200", icon: HelpCircle },
};

export function FactCheckerView() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/fact-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      setResult(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fact check failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
          <Search className="h-3.5 w-3.5" /> Fact Checker
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">AI Fact Checker</h1>
        <p className="mt-2 text-muted-foreground">Paste AI-generated text to identify what needs verification.</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste AI-generated text here to check its accuracy..."
            rows={6}
            maxLength={5000}
            className="w-full rounded-xl border border-zinc-200 bg-white p-4 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">{text.length}/5000</span>
            <Button onClick={analyze} loading={loading} disabled={!text.trim()}>
              <Search className="h-4 w-4" /> Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card className="border-violet-200 bg-violet-50/50">
            <CardHeader><CardTitle className="text-sm">Overall Assessment</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">{result.overallAssessment}</p>
              <p className="mt-2 text-xs text-violet-600 italic">{result.confidenceNote}</p>
            </CardContent>
          </Card>

          <div>
            <h2 className="mb-4 text-lg font-semibold">Claims Found</h2>
            <div className="space-y-3">
              {result.claims.map((claim, i) => {
                const config = STATUS_CONFIG[claim.status] || STATUS_CONFIG.uncertain;
                const Icon = config.icon;
                return (
                  <Card key={i} className={config.bg}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.color)} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{claim.statement}</p>
                          <Badge variant="outline" className="mt-1 text-xs">{claim.status.replace(/_/g, " ")}</Badge>
                          <p className="mt-2 text-sm text-zinc-600">{claim.explanation}</p>
                          <p className="mt-1 text-xs text-zinc-500">How to verify: {claim.suggestedVerification}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {result.keyWarnings.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Key Warnings</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1">
                  {result.keyWarnings.map((w, i) => (
                    <li key={i} className="flex gap-2 text-sm"><span className="text-amber-500">⚠</span> {w}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {result.questionsToInvestigate.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Questions to Investigate</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1">
                  {result.questionsToInvestigate.map((q, i) => (
                    <li key={i} className="flex gap-2 text-sm"><span className="text-violet-500">?</span> {q}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!result && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Search className="mx-auto h-10 w-10 text-zinc-300" />
            <p className="mt-4 text-sm text-muted-foreground">Paste AI-generated text above to check it for accuracy.</p>
            <p className="mt-1 text-xs text-zinc-400">AI can sound confident while being wrong. Let's find out.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
