"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Send, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Subject, Difficulty } from "@/types";
import { SUBJECTS_WITH_ICONS, DIFFICULTY_LEVELS } from "@/lib/constants";

interface TutorViewProps {
  userName: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function TutorView({ userName }: TutorViewProps) {
  const [subject, setSubject] = useState<Subject>("General");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [setupDone, setSetupDone] = useState(false);
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
          subject,
          topic,
          difficulty,
          message: content,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "The tutor could not reply right now.");

      // Persist the session ID so follow-up messages continue the conversation.
      if (data.sessionId) setSessionId(data.sessionId);

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      toast.error(error instanceof Error ? error.message : "Tutor error.");
    } finally {
      setSending(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send();
  }

  if (!setupDone) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <GraduationCap className="h-3.5 w-3.5" /> AI Tutor
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">What do you want to learn?</h1>
          <p className="mt-2 text-muted-foreground">Choose a subject and difficulty to start a guided learning session.</p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-3 text-sm font-medium text-zinc-700">Subject</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SUBJECTS_WITH_ICONS.map((s) => (
                <button key={s.value} type="button" onClick={() => setSubject(s.value)}
                  className={cn("flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-all",
                    subject === s.value ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-white hover:border-zinc-300"
                  )}>
                  <span>{s.icon}</span> {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-zinc-700">Topic (optional)</p>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Quadratic equations, Photosynthesis, World War II" />
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-zinc-700">Difficulty</p>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTY_LEVELS.map((d) => (
                <button key={d.value} type="button" onClick={() => setDifficulty(d.value)}
                  className={cn("rounded-xl border p-3 text-left transition-all",
                    difficulty === d.value ? "border-emerald-500 bg-emerald-50" : "border-zinc-200 bg-white hover:border-zinc-300"
                  )}>
                  <p className="text-sm font-semibold">{d.label}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{d.description}</p>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={startSession} size="lg" className="w-full">
            <GraduationCap className="h-4 w-4" /> Start Learning
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          {SUBJECTS_WITH_ICONS.find((s) => s.value === subject)?.icon} {subject}
        </span>
        {topic && <span className="text-xs text-zinc-400">• {topic}</span>}
        <span className="text-xs text-zinc-400">• {difficulty}</span>
      </div>

      <div className="flex-1 space-y-4">
        {messages.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <GraduationCap className="mx-auto h-8 w-8 text-emerald-500" />
              <p className="mt-3 font-semibold">Ready to learn!</p>
              <p className="mt-1 text-sm text-muted-foreground">Ask a question or describe what you want to understand.</p>
            </CardContent>
          </Card>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn("max-w-[85%]", msg.role === "user" ? "ml-auto" : "")}>
            <div className={cn("whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
              msg.role === "user"
                ? "rounded-br-md bg-zinc-900 text-white"
                : "rounded-bl-md border border-emerald-200 bg-emerald-50 text-zinc-800"
            )}>
              {msg.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex w-fit items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSubmit} className="sticky bottom-0 mt-4 border-t border-zinc-100 bg-zinc-50/95 py-4 backdrop-blur">
        <div className="flex gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
            placeholder="Ask your tutor..." disabled={sending}
            className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-zinc-400" />
          <Button type="submit" size="sm" loading={sending} disabled={!input.trim()} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
