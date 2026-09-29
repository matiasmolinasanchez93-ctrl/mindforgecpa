"use client";

import { useRouter } from "next/navigation";
import { boundHistory } from "@/lib/tutor-memory";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Send, GraduationCap } from "lucide-react";
import { AIStatus } from "@/components/ui/ai-status";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Subject, Difficulty } from "@/types";
import { SUBJECTS_WITH_ICONS, DIFFICULTY_LEVELS } from "@/lib/constants";

export interface TutorSessionSnapshot {
  id: string; subject: Subject; topic: string; difficulty: Difficulty; messages: Message[];
}
interface TutorViewProps {
  userName: string;
  initialSession?: TutorSessionSnapshot | null;
  conversations?: { id: string; title: string }[];
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  usedFallback?: boolean;
}

const subjectLabel = (value: string): string =>
  SUBJECTS_WITH_ICONS.find((subject) => subject.value === value)?.label ?? value;
const difficultyLabel = (value: string): string =>
  DIFFICULTY_LEVELS.find((level) => level.value === value)?.label ?? value;

export function TutorView({ userName, initialSession = null, conversations = [] }: TutorViewProps) {
  const router = useRouter();
  const conversationId = useRef<string | undefined>(undefined);
  const [storageWarning, setStorageWarning] = useState(false);
  const [subject, setSubject] = useState<Subject>(initialSession?.subject ?? "General");
  const [topic, setTopic] = useState(initialSession?.topic ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(initialSession?.difficulty ?? "medium");
  const [sessionId, setSessionId] = useState<string | null>(initialSession?.id ?? null);
  const [messages, setMessages] = useState<Message[]>(initialSession?.messages ?? []);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [setupDone, setSetupDone] = useState(!!initialSession);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  function startSession() {
    setSetupDone(true);
  }

  async function send(text = input) {
    const content = text.trim();
    if (!content || sending) return;

    conversationId.current ??= crypto.randomUUID();
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId ?? undefined,
          conversationId: conversationId.current,
          history: boundHistory(messages),
          subject,
          topic,
          difficulty,
          message: content,
        }),
      });
      const data = await res.json();
      if (res.status === 401) router.replace("/login?next=" + encodeURIComponent("/tutor" + (sessionId ? "?session=" + sessionId : "")));
      if (!res.ok) throw new Error(data.error || "El tutor no pudo responder en este momento.");

      // Persist the session ID so follow-up messages continue the conversation.
      if (data.sessionId) {
        setSessionId(data.sessionId);
        if (data.saved) window.history.replaceState(null, "", "/tutor?session=" + data.sessionId);
      }
      setStorageWarning(data.saved === false);

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: data.reply, usedFallback: data.usedFallback === true },
      ]);
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      setInput(content);
      toast.error(error instanceof Error ? error.message : "Error del tutor.");
    } finally {
      setSending(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send();
  }

  const conversationControls = (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {conversations.length > 0 && <select aria-label="Conversaciones recientes" disabled={sending}
        value={sessionId ?? ""} onChange={(event) => { if (event.target.value) router.push("/tutor?session=" + event.target.value); }}
        className="h-10 min-w-0 max-w-full flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm">
        <option value="">Nueva conversación</option>
        {sessionId && !conversations.some((c) => c.id === sessionId) && <option value={sessionId}>Conversación actual</option>}
        {conversations.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
      </select>}
      <Button variant="outline" size="sm" disabled={sending} onClick={() => {
        setMessages([]); setSessionId(null); setSetupDone(false); setInput(""); setStorageWarning(false);
        setSubject("General"); setTopic(""); setDifficulty("medium"); conversationId.current = undefined;
        router.push("/tutor?new=1");
      }}>Nueva conversación</Button>
    </div>
  );

  if (!setupDone) {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        {conversationControls}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-ai-soft px-3 py-1 text-xs font-medium text-ai">
            <GraduationCap className="h-3.5 w-3.5" /> Tutor IA
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">¿Qué quieres aprender?</h1>
          <p className="mt-2 text-muted-foreground">Elige una materia y una dificultad para iniciar una sesión de aprendizaje guiada.</p>
        </div>

        <div className="tool-workspace panel space-y-7 p-6 sm:p-8">
          <div>
            <p className="mb-3 text-sm font-medium text-zinc-700">Materia</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SUBJECTS_WITH_ICONS.map((s) => (
                <button key={s.value} type="button" aria-pressed={subject === s.value} onClick={() => setSubject(s.value)}
                  className={cn("flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-all",
                    subject === s.value ? "border-brand-500 bg-brand-50 text-brand-700" : "border-zinc-200 bg-white hover:border-zinc-300"
                  )}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-zinc-700">Tema (opcional)</p>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="p. ej. Ecuaciones cuadráticas, Fotosíntesis, Segunda Guerra Mundial" />
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-zinc-700">Dificultad</p>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTY_LEVELS.map((d) => (
                <button key={d.value} type="button" aria-pressed={difficulty === d.value} onClick={() => setDifficulty(d.value)}
                  className={cn("rounded-xl border p-3 text-left transition-all",
                    difficulty === d.value ? "border-brand-500 bg-brand-50" : "border-zinc-200 bg-white hover:border-zinc-300"
                  )}>
                  <p className="text-sm font-semibold">{d.label}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{d.description}</p>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={startSession} size="lg" className="w-full">
            <GraduationCap className="h-4 w-4" /> Comenzar a aprender
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col">
      {conversationControls}
      <p className="mb-4 text-xs text-muted-foreground">Recuerdo los mensajes recientes. Puedes cambiar de materia cuando quieras.</p>
      {storageWarning && <p role="status" className="mb-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">El chat conserva el contexto mientras sigas aquí, pero no se pudo guardar este intercambio. Evita cerrar la página hasta recuperar la conexión.</p>}
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
          {SUBJECTS_WITH_ICONS.find((s) => s.value === subject)?.icon} {subjectLabel(subject)}
        </span>
        {topic && <span className="text-xs text-zinc-400">• {topic}</span>}
        <span className="text-xs text-zinc-400">• {difficultyLabel(difficulty)}</span>
      </div>

      <div className="flex-1 space-y-4">
        {messages.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <GraduationCap className="mx-auto h-8 w-8 text-brand-500" />
              <p className="mt-3 font-semibold">¿Listo para aprender, {userName?.split(" ")[0] || "mente curiosa"}?</p>
              <p className="mt-1 text-sm text-muted-foreground">Haz una pregunta o describe lo que quieres comprender.</p>
            </CardContent>
          </Card>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn("max-w-[85%]", msg.role === "user" ? "ml-auto" : "")}>
            <div className={cn("whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
              msg.role === "user"
                ? "rounded-br-md bg-zinc-900 text-white"
                : "ai-response rounded-bl-md border border-card-border bg-white text-zinc-800"
            )}>
              {msg.usedFallback && (
                <p className="mb-2 text-xs font-medium text-amber-700" role="status">
                  Modo básico: la IA no está disponible. Esta respuesta es una orientación automática limitada.
                </p>
              )}
              {msg.content}
            </div>
          </div>
        ))}

        {sending && (
          <AIStatus />
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSubmit} className="chat-composer sticky bottom-0 mt-4 border-t border-zinc-100 bg-zinc-50/95 py-4 backdrop-blur">
        <div className="flex gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm">
          <input aria-label="Mensaje para tu tutor" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
            placeholder="Pregúntale a tu tutor..." maxLength={6000} disabled={sending}
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-zinc-400" />
          <Button type="submit" size="sm" loading={sending} disabled={!input.trim()} aria-label="Enviar">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
