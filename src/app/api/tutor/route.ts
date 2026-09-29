import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "@/services/ai/provider";
import { buildTutorReply } from "@/services/ai/local/tutor";
import { boundHistory, unsavedHistory } from "@/lib/tutor-memory";
import type { ChatTurn } from "@/services/ai/contracts";
export const runtime = "nodejs";
export const maxDuration = 60;

const TUTOR_SYSTEM_PROMPT = "Eres el tutor educativo de MindForge. Responde en español claro y natural, adaptado al nivel del estudiante.\nPor defecto escribe entre 40 y 90 palabras, en uno o dos párrafos breves. Para saludos o preguntas sencillas, usa menos palabras. Amplía solo cuando el estudiante pida expresamente más detalle o un procedimiento que lo necesite.\nResponde directamente a la pregunta. Incluye como máximo un ejemplo corto si ayuda. Evita introducciones, resúmenes repetidos, listas largas y secciones adicionales. No añadas una pregunta de comprobación al final salvo que el estudiante pida practicar.\nUsa texto plano: sin Markdown, asteriscos, encabezados con #, separadores, tablas ni delimitadores LaTeX. Escribe las fórmulas de forma legible, por ejemplo H₂O, CO₂ y x².\nTen en cuenta el historial y corrige errores con amabilidad. No inventes datos. Si falta información imprescindible, haz una sola pregunta breve. Para tareas, explica el razonamiento de forma concisa.\nLa materia y el tema elegidos solo son preferencias iniciales. Sigue la pregunta más reciente, aunque cambie de biología a economía u otra materia. No fuerces relaciones con el tema anterior. Usa el historial para recordar datos, ejemplos y referencias como «eso» o «el anterior». Si cambia explícitamente de tema, responde al nuevo tema conservando los datos relevantes de la conversación.";

const inputSchema = z.object({
  sessionId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
  subject: z.enum(["Mathematics", "Physics", "Chemistry", "Biology", "History", "Economics", "English", "General"]).default("General"),
  topic: z.string().trim().max(300).default(""),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  message: z.string().trim().min(1).max(6000),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]), content: z.string().max(6000),
  })).max(20).default([]),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revisa el mensaje (máximo 6000 caracteres) y los datos de la conversación." }, { status: 422 });
  const { message, subject, topic, difficulty } = parsed.data;
  let sessionId = parsed.data.sessionId;
  let canSave = true;
  let created = false;
  let storedHistory: ChatTurn[] = [];
  try {
    if (sessionId) {
      const session = await supabase.from("ai_sessions").select("id").eq("id", sessionId).eq("student_id", user.id).maybeSingle();
      if (session.error) {
        canSave = false;
        console.warn("[tutor] session unavailable:", session.error.message);
      } else if (!session.data) {
        return NextResponse.json({ error: "Esta conversación ya no está disponible. Inicia una nueva." }, { status: 404 });
      }
      if (canSave) {
        const result = await supabase.from("ai_session_messages").select("role, content")
          .eq("session_id", sessionId).order("created_at", { ascending: false })
          .order("id", { ascending: false }).limit(20);
        if (result.error) {
          canSave = false;
          console.warn("[tutor] history unavailable:", result.error.message);
        } else storedHistory = (result.data ?? []).reverse() as ChatTurn[];
      }
    } else {
      const result = await supabase.from("ai_sessions")
        .insert({ student_id: user.id, subject, topic, difficulty, title: message.slice(0, 100) })
        .select("id").single();
      if (result.error) {
        canSave = false;
        console.warn("[tutor] session creation failed:", result.error.message);
      } else { sessionId = result.data.id; created = true; }
    }
    // The visible transcript also preserves turns whose database save failed.
    const history = boundHistory(parsed.data.history.length ? parsed.data.history : storedHistory);
    const result = await generateText({
      system: TUTOR_SYSTEM_PROMPT + "\nPreferencias iniciales (no restringen la conversación): " + JSON.stringify({ subject, topic, difficulty }),
      user: message, history, temperature: 0.7, maxTokens: 1200,
      conversationId: sessionId ?? parsed.data.conversationId ?? crypto.randomUUID(),
      context: { studentId: user.id, feature: "tutor", subject, topic, difficulty },
    }, () => buildTutorReply({ history: [...history, { role: "user", content: message }], subject, topic, difficulty }));
    let saved = false;
    if (sessionId && canSave) {
      const turns: ChatTurn[] = [
        ...(created ? history : unsavedHistory(history, boundHistory(storedHistory))),
        { role: "user", content: message },
        { role: "assistant", content: result.text },
      ];
      const now = Date.now();
      const insert = await supabase.from("ai_session_messages").insert(turns.map((turn, index) => ({
        session_id: sessionId, role: turn.role, content: turn.content,
        created_at: new Date(now - turns.length + index).toISOString(),
        hints_used: 0,
      })));
      saved = !insert.error;
      if (insert.error) console.warn("[tutor] exchange not saved:", insert.error.message);
    }
    return NextResponse.json({ reply: result.text, sessionId, usedFallback: result.usedFallback, saved });
  } catch (error) {
    console.error("[tutor] failed:", error);
    return NextResponse.json({ error: "El tutor encontró un problema. Inténtalo de nuevo." }, { status: 500 });
  }
}
