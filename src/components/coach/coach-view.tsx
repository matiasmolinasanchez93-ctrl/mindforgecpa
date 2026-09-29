"use client";

import { boundHistory } from "@/lib/tutor-memory";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Business, CoachMessage } from "@/types";
import { Button } from "@/components/ui/button";

interface CoachViewProps {
  business: Business;
  initialMessages: Pick<CoachMessage, "id" | "role" | "content" | "created_at">[];
}

const STARTERS = [
  "Nadie responde a mis mensajes. ¿Qué debería cambiar?",
  "¿En qué debería enfocarme hoy para conseguir mi primer cliente?",
  "¿Debería cambiar mi precio?",
];

export function CoachView({ business, initialMessages }: CoachViewProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, sending]);

  const send = useCallback(async (text = message) => {
    const content = text.trim();
    if (!content || sending) return;
    const optimistic: CoachMessage = { id: `local-${Date.now()}`, user_id: business.user_id, role: "user", content, created_at: new Date().toISOString() };
    setMessages((current) => [...current, optimistic]);
    setMessage("");
    setSending(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, businessId: business.id, history: boundHistory(messages) }),
      });
      const data = await res.json();
      if (!res.ok || !data.reply) throw new Error(data.error || "El coach no pudo responder en este momento.");
      setMessages((current) => [...current, { id: `reply-${Date.now()}`, user_id: business.user_id, role: "assistant", content: data.reply, created_at: new Date().toISOString() }]);
    } catch (error) {
      setMessages((current) => current.filter((item) => item.id !== optimistic.id));
      toast.error(error instanceof Error ? error.message : "El coach no pudo responder en este momento.");
    } finally {
      setSending(false);
    }
  }, [message, messages, sending, business.id, business.user_id]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send();
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-ai-50 px-3 py-1 text-xs font-medium text-ai-700"><Sparkles className="h-3.5 w-3.5" /> Coach IA</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Tu coach para {business.name}</h1>
        <p className="mt-2 text-muted-foreground">Pide consejo práctico basado en tu oferta, hoja de ruta, presupuesto y progreso.</p>
      </div>
      <div className="flex-1 space-y-4">
        {messages.length === 0 && <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-6 sm:p-8"><h2 className="font-semibold">¿En qué estás trabajando?</h2><p className="mt-1 text-sm text-muted-foreground">Tu coach ya tiene el contexto de tu negocio. Empieza con una situación real.</p><div className="mt-5 flex flex-wrap gap-2">{STARTERS.map((starter) => <button key={starter} type="button" onClick={() => void send(starter)} className="rounded-xl border border-zinc-200 px-3 py-2 text-left text-sm text-zinc-600 transition-colors hover:border-ai-200 hover:bg-ai-50 hover:text-ai-800">{starter}</button>)}</div></div>}
        {messages.map((item) => <div key={item.id} className={item.role === "user" ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-relaxed text-white" : "max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-bl-md ai-response border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-700"}>{item.content}</div>)}
        {sending && <div className="flex w-fit items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" /> Pensando en tu próximo movimiento…</div>}
        <div ref={endRef} />
      </div>
      <form onSubmit={onSubmit} className="chat-composer sticky bottom-0 mt-6 border-t border-zinc-100 bg-zinc-50/95 py-4 backdrop-blur"><div className="flex gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm"><textarea aria-label="Mensaje para tu coach" value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} maxLength={2000} rows={1} placeholder="Pregúntale a tu coach de negocios…" className="max-h-32 min-h-10 min-w-0 flex-1 resize-y bg-transparent px-2 py-2 text-sm outline-none placeholder:text-zinc-400" disabled={sending} /><Button type="submit" size="sm" loading={sending} disabled={!message.trim()} aria-label="Enviar mensaje"><Send className="h-4 w-4" /></Button></div></form>
    </div>
  );
}
