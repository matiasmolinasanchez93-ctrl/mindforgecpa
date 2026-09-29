"use client";

import { useState } from "react";
import { AIStatus } from "@/components/ui/ai-status";
import { Search, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
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
  likely_accurate: { color: "text-success", bg: "bg-success-soft border-success/20", icon: CheckCircle },
  needs_verification: { color: "text-gold-700", bg: "bg-gold-50 border-gold-200", icon: HelpCircle },
  likely_inaccurate: { color: "text-error-700", bg: "bg-error-50 border-error-200", icon: AlertTriangle },
  uncertain: { color: "text-zinc-700", bg: "bg-zinc-50 border-zinc-200", icon: HelpCircle },
};

const STATUS_LABELS: Record<string, string> = {
  likely_accurate: "probablemente correcta",
  needs_verification: "necesita verificación",
  likely_inaccurate: "probablemente incorrecta",
  uncertain: "incierta",
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
      if (!res.ok) throw new Error(data.error || "El análisis falló.");
      setResult(data);
      if (data.saved === false) toast("El resultado está listo, pero no se pudo guardar en tu resumen.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "La verificación falló.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-ai-50 px-3 py-1 text-xs font-medium text-ai-700">
          <Search className="h-3.5 w-3.5" /> Verificador de Datos
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Verificador de datos con IA</h1>
        <p className="mt-2 text-muted-foreground">Pega texto generado por IA para identificar qué necesita verificación.</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Pega aquí texto generado por IA para comprobar su exactitud..."
            aria-label="Texto a verificar"
            rows={6}
            maxLength={5000}
            className="w-full rounded-xl border border-zinc-200 bg-white p-4 text-sm outline-none focus:border-ai-500 focus:ring-2 focus:ring-ai-500/20"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">{text.length}/5000</span>
            <Button onClick={analyze} loading={loading} disabled={!text.trim()}>
              <Search className="h-4 w-4" /> Analizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card className="ai-response">
            <CardHeader><CardTitle className="text-sm">Evaluación general</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">{result.overallAssessment}</p>
              <p className="mt-2 text-xs text-ai-600 italic">{result.confidenceNote}</p>
            </CardContent>
          </Card>

          <div>
            <h2 className="mb-4 text-lg font-semibold">Afirmaciones encontradas</h2>
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
                          <Badge variant="outline" className="mt-1 text-xs">{STATUS_LABELS[claim.status] ?? claim.status.replace(/_/g, " ")}</Badge>
                          <p className="mt-2 text-sm text-zinc-600">{claim.explanation}</p>
                          <p className="mt-1 text-xs text-zinc-500">Cómo verificarlo: {claim.suggestedVerification}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {result.keyWarnings.length > 0 && (
            <Card className="border-gold-200 bg-gold-50/50">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-gold-500" /> Advertencias clave</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1">
                  {result.keyWarnings.map((w, i) => (
                    <li key={i} className="flex gap-2 text-sm"><span className="text-gold-500">⚠</span> {w}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {result.questionsToInvestigate.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Preguntas por investigar</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1">
                  {result.questionsToInvestigate.map((q, i) => (
                    <li key={i} className="flex gap-2 text-sm"><span className="text-ai-500">?</span> {q}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {loading && <AIStatus />}
          {!result && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Search className="mx-auto h-10 w-10 text-zinc-300" />
            <p className="mt-4 text-sm text-muted-foreground">Pega arriba texto generado por IA para comprobar su exactitud.</p>
            <p className="mt-1 text-xs text-zinc-400">La IA puede sonar segura y estar equivocada. Vamos a comprobarlo.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
