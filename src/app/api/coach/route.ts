import { z } from "zod";
import { boundHistory } from "@/lib/tutor-memory";
import type { ChatTurn } from "@/services/ai/contracts";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "@/services/ai/provider";
import { buildCoachReply } from "@/services/ai/local/coaching";
import { buildCoachSystemPrompt, buildCoachUserPrompt } from "@/services/ai/prompts";
import type { CoachContext } from "@/services/ai/local/contracts";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_MESSAGE_LENGTH = 2000;

interface CoachRequestBody {
  message?: unknown;
  businessId?: unknown;
  history?: unknown;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Inicia sesión para hablar con tu asesor." },
      { status: 401 }
    );
  }

  let body: CoachRequestBody;
  try {
    body = (await request.json()) as CoachRequestBody;
  } catch {
    return NextResponse.json({ error: "La solicitud no es válida." }, { status: 400 });
  }

  if (typeof body.message !== "string" || typeof body.businessId !== "string") {
    return NextResponse.json(
      { error: "Debes indicar el mensaje y el negocio." },
      { status: 400 }
    );
  }

  const message = body.message.trim();
  if (!message) {
    return NextResponse.json({ error: "El mensaje no puede estar vacío." }, { status: 422 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Keep your message under ${MAX_MESSAGE_LENGTH} characters.` },
      { status: 422 }
    );
  }

  // ── Load context server-side (never trust client-sent context) ──────────
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", body.businessId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (businessError) {
    console.error("[coach] could not load business:", businessError.message);
    return NextResponse.json(
      { error: "No se pudo cargar tu negocio. Inténtalo de nuevo." },
      { status: 503 }
    );
  }

  if (!business) {
    return NextResponse.json({ error: "No se encontró el negocio." }, { status: 404 });
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("business_id", business.id)
    .order("day", { ascending: true });

  const { data: recentMonths } = await supabase
    .from("progress")
    .select("month, revenue, customers")
    .eq("business_id", business.id)
    .order("month", { ascending: false })
    .limit(12);

  const taskRows = tasks ?? [];
  const completedTasks = taskRows.filter((task) => task.status === "done").length;
  const roadmap = taskRows.map((task) => ({
    day: Number(task.day),
    task: task.title as string,
    reason: (task.reason ?? "") as string,
  }));

  const currency =
    business.pricing?.currency ?? business.starting_budget_currency ?? "USD";
  const pricing = {
    setup: typeof business.pricing?.setup === "number" ? business.pricing.setup : undefined,
    monthly:
      typeof business.pricing?.monthly === "number" ? business.pricing.monthly : undefined,
    currency,
  };

  // Structured context for the local engine.
  const localContext: CoachContext = {
    businessName: business.name,
    businessIdea: business.idea ?? "",
    targetCustomer: business.target_customer ?? "",
    offer: business.offer ?? "",
    pricing,
    revenueModel: business.revenue_model ?? "",
    country: business.country ?? "",
    city: business.city ?? "",
    experience: business.experience ?? "Beginner",
    skills: Array.isArray(business.skills) ? business.skills : [],
    preferences: Array.isArray(business.preferences) ? business.preferences : [],
    hoursPerDay: Number(business.hours_per_day ?? 0),
    currency,
    goalMonthlyRevenue: Number(business.goal_monthly_revenue ?? 0),
    currentMonthlyRevenue: Number(business.current_monthly_revenue ?? 0),
    startingBudget: Number(business.starting_budget ?? 0),
    remainingBudget: Number(business.remaining_budget ?? 0),
    customers: Number(business.customers ?? 0),
    completedTasks,
    totalTasks: taskRows.length,
    recentMonths: (recentMonths ?? []).map((month) => ({
      month: month.month as string,
      revenue: Number(month.revenue ?? 0),
      customers: Number(month.customers ?? 0),
    })),
    first30Days: roadmap,
  };

  // Text context for the remote-provider prompt.
  const promptContext = {
    ...localContext,
    pricing: [
      pricing.monthly ? `monthly ${pricing.monthly} ${currency}` : "",
      pricing.setup ? `setup ${pricing.setup} ${currency}` : "",
    ]
      .filter(Boolean)
      .join(", ") || "not set",
  };

  const historyInput = z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(6000) })).max(20).safeParse(body.history ?? []);
  if (!historyInput.success) return NextResponse.json({ error: "El historial no es válido." }, { status: 422 });
  const stored = await supabase.from("coach_messages").select("role, content").eq("user_id", user.id)
    .eq("business_id", business.id).order("created_at", { ascending: false }).order("id", { ascending: false }).limit(20);
  const history = boundHistory(historyInput.data.length ? historyInput.data : (stored.data ?? []).reverse() as ChatTurn[]);

  const result = await generateText(
    {
      system: buildCoachSystemPrompt(promptContext),
      user: buildCoachUserPrompt(message),
      history,
      temperature: 0.7,
      maxTokens: 1200,
      conversationId: business.id,
      context: {
        studentId: user.id,
        feature: "coach",
        businessId: business.id,
        ...promptContext,
      },
    },
    () => buildCoachReply({ message, context: localContext })
  );

  // Persist the exchange; losing the transcript must not lose the advice.
  const userInsert = await supabase.from("coach_messages").insert({
    user_id: user.id,
    business_id: business.id,
    role: "user",
    content: message,
  });
  if (userInsert.error) {
    console.warn("[coach] could not save user message:", userInsert.error.message);
  }

  const replyInsert = await supabase.from("coach_messages").insert({
    user_id: user.id,
    business_id: business.id,
    role: "assistant",
    content: result.text,
  });
  if (replyInsert.error) {
    console.warn("[coach] could not save reply:", replyInsert.error.message);
  }

  return NextResponse.json({ reply: result.text });
}
