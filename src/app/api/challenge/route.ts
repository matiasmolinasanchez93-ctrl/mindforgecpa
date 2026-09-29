import { z } from "zod";
import { evaluateChallenge } from "@/services/ai/challengeEvaluator";
import { signChallenge, readChallenge } from "@/services/challengeTicket";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateChallenge, ChallengeError } from "@/services/ai/challengeGenerator";
import { recordActivityAttempt } from "@/services/studentService";
import type { Subject, Difficulty, ActivityType } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") || "solve_it") as ActivityType;
  const subject = (searchParams.get("subject") || "General") as Subject;
  const difficulty = (searchParams.get("difficulty") || "medium") as Difficulty;

  const validTypes: ActivityType[] = ["ai_detective", "prompt_battle", "solve_it", "explain_it", "fact_check"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "El tipo de reto no es válido." }, { status: 422 });
  }

  try {
    const challenge = await generateChallenge(type, subject, difficulty);
    const ticket = signChallenge({ userId: user.id, type, subject, challenge });
    const { correctAnswer, explanation, ...question } = challenge;
    void correctAnswer; void explanation;
    return NextResponse.json({ ...question, ticket });
  } catch (error) {
    if (error instanceof ChallengeError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "No se pudo generar el reto." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  const parsed = z.object({
    ticket: z.string().min(1).max(60000),
    answer: z.string().trim().min(1).max(5000),
    hints_used: z.number().int().min(0).max(3).default(0),
  }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Escribe una respuesta válida de hasta 5000 caracteres." }, { status: 422 });
  const data = readChallenge(parsed.data.ticket, user.id);
  if (!data) return NextResponse.json({ error: "Este reto ha caducado. Genera uno nuevo para continuar." }, { status: 422 });
  try {
    const evaluation = await evaluateChallenge(data.challenge, parsed.data.answer);
    let attempt = null;
    try {
      attempt = await recordActivityAttempt(supabase, {
        student_id: user.id, activity_type: data.type, activity_title: data.challenge.title,
        subject: data.subject, score: evaluation.score, hints_used: parsed.data.hints_used,
        was_independent: parsed.data.hints_used === 0,
        details: { answer: parsed.data.answer, feedback: evaluation.feedback },
      });
    } catch (error) { console.warn("[challenge] could not save attempt", error); }
    return NextResponse.json({
      ...evaluation, attempt, saved: !!attempt,
      correctAnswer: data.challenge.correctAnswer, explanation: data.challenge.explanation,
    });
  } catch (error) {
    console.warn("[challenge] evaluation failed", error);
    return NextResponse.json({ error: "La IA no pudo evaluar tu respuesta. Inténtalo de nuevo." }, { status: 503 });
  }
}
