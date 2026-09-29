"use client";

import { useState } from "react";
import { AIStatus } from "@/components/ui/ai-status";
import { FileText, Copy, Check } from "lucide-react";
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
      if (!res.ok) throw new Error(data.error || "No se pudo construir el prompt.");
      setResult(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "El constructor de prompts falló.");
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
        <div className="inline-flex items-center gap-2 rounded-full bg-ai-50 px-3 py-1 text-xs font-medium text-ai-700">
          <FileText className="h-3.5 w-3.5" /> Constructor de Prompts
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Construye mejores prompts</h1>
        <p className="mt-2 text-muted-foreground">Describe lo que necesitas y aprende por qué funciona este prompt.</p>
      </div>

      <div className="tool-workspace grid gap-7 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Tu objetivo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">¿Qué quieres lograr? *</label>
              <textarea aria-label="¿Qué quieres lograr?" value={goal} onChange={(e) => setGoal(e.target.value)}
                placeholder="p. ej. Necesito ayuda para estudiar la Revolución Francesa" rows={3}
                className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm outline-none focus:border-ai-500 focus:ring-2 focus:ring-ai-500/20" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Contexto</label>
              <Input value={context} onChange={(e) => setContext(e.target.value)} placeholder="p. ej. Estoy en 10.º grado, el examen es la próxima semana" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Restricciones</label>
              <Input value={constraints} onChange={(e) => setConstraints(e.target.value)} placeholder="p. ej. Que no pase de 500 palabras, sin jerga" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Formato de salida</label>
              <Input value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} placeholder="p. ej. Viñetas, formato de guía de estudio" />
            </div>
            <Button onClick={build} loading={loading} disabled={!goal.trim()} className="w-full">
              <FileText className="h-4 w-4" /> Construir prompt
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {result && (
            <>
              <Card className="ai-response">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Prompt optimizado</CardTitle>
                    <Button variant="ghost" size="sm" onClick={copyPrompt}>
                      {copied ? <Check className="h-4 w-4 text-ai-500" /> : <Copy className="h-4 w-4" />}
                      {copied ? "¡Copiado!" : "Copiar"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap rounded-lg bg-white p-3 text-sm border border-ai-200">{result.optimizedPrompt}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm">Por qué funciona este prompt</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{result.explanation}</p>
                  <ul className="mt-3 space-y-1">
                    {result.whyGood.map((r, i) => (
                      <li key={i} className="flex gap-2 text-sm"><span className="text-ai-500">✓</span> {r}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm">Consejos para la próxima vez</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1">
                    {result.tips.map((t, i) => (
                      <li key={i} className="flex gap-2 text-sm"><Badge variant="outline" className="shrink-0">Consejo {i + 1}</Badge> {t}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}

          {loading && <AIStatus />}
          {!result && !loading && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto h-10 w-10 text-zinc-300" />
                <p className="mt-4 text-sm text-muted-foreground">Escribe tu objetivo y pulsa «Construir prompt» para ver la versión optimizada.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
