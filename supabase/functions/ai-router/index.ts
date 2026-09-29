import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TYPES = ["CHAT", "SUMMARY", "TASK", "MEETING", "REMINDER", "QUESTION", "SEARCH", "DOCUMENT", "NONE"] as const;
type ActionType = (typeof TYPES)[number];

type Action = {
  type: ActionType;
  confidence: number;
  title: string | null;
  description: string | null;
  assignee: string | null;
  due_date: string | null;
  response: string | null;
};

class HttpError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function classifyLocally(message: string): ActionType {
  const value = message.trim().toLocaleLowerCase();
  if (/^(jaja|jeje|lol|ok|okay|gracias|thanks|hola|hello|👍|👏|\p{Extended_Pictographic})[!?.\s]*$/u.test(value)) return "NONE";
  if (/\b(recu[eé]rdame|recordatorio|remind me)\b/.test(value)) return "REMINDER";
  if (/\b(resume|resumen|summari[sz]e)\b/.test(value)) return "SUMMARY";
  if (/\b(reuni[oó]n|meeting|agenda)\b/.test(value)) return "MEETING";
  if (/\b(busca|buscar|search|investiga)\b/.test(value)) return "SEARCH";
  if (/\b(documento|contrato|pdf|archivo)\b/.test(value)) return "DOCUMENT";
  if (/\b(tiene que|debe |pendiente|tarea|task|enviar|entregar)\b/.test(value)) return "TASK";
  if (/\?|^qu[eé]\b|^c[oó]mo\b|^por qu[eé]\b|^what\b|^how\b/.test(value)) return "QUESTION";
  return "CHAT";
}

function validateAction(value: unknown, fallbackType: ActionType): Action {
  if (!value || typeof value !== "object") throw new HttpError(502, "INVALID_OPENAI_RESPONSE", "The AI provider returned an invalid response.");
  const data = value as Record<string, unknown>;
  const type = typeof data.type === "string" && TYPES.includes(data.type as ActionType) ? data.type as ActionType : fallbackType;
  const text = (key: string) => typeof data[key] === "string" && data[key].trim() ? data[key].trim() : null;
  const confidence = typeof data.confidence === "number" && data.confidence >= 0 && data.confidence <= 1 ? data.confidence : 0.7;
  const dueDate = text("due_date");
  if (dueDate && Number.isNaN(Date.parse(dueDate))) throw new HttpError(502, "INVALID_OPENAI_RESPONSE", "The AI provider returned an invalid due date.");
  return { type, confidence, title: text("title"), description: text("description"), assignee: text("assignee"), due_date: dueDate, response: text("response") };
}

async function callChatGpt(prompt: string): Promise<unknown> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new HttpError(500, "MISSING_OPENAI_API_KEY", "AI service is not configured. Ask an administrator to configure OPENAI_API_KEY.");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.25,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Return valid JSON only. Never include markdown fences." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!response.ok) throw new HttpError(502, "OPENAI_API_ERROR", "The AI provider could not complete the request. Please try again.");
    const payload = await response.json();
    const text = payload.choices?.[0]?.message?.content;
    if (!text) throw new HttpError(502, "INVALID_OPENAI_RESPONSE", "The AI provider returned an empty response.");
    try { return JSON.parse(text); } catch { throw new HttpError(502, "INVALID_OPENAI_RESPONSE", "The AI provider did not return valid JSON."); }
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") throw new HttpError(504, "OPENAI_TIMEOUT", "The AI request timed out. Please try again.");
    throw new HttpError(502, "OPENAI_API_ERROR", "The AI provider could not complete the request. Please try again.");
  } finally { clearTimeout(timer); }
}

function actionPrompt(message: string, type: ActionType, context: unknown) {
  const feature = (context as { feature?: string }).feature;
  const tutorRule = feature === "tutor" ? "You are an educational tutor. Use a concise Socratic reply: teach, then ask one useful question; do not simply give homework answers. " : "";
  const coachRule = feature === "coach" ? "You are a practical business coach. Base advice on the supplied business data and give one concrete next step. " : "";
  return `Return only a JSON object. ${tutorRule}${coachRule}Interpret the user message using the context. Do not use generic prefacing or recommendations. If there is no concrete useful action, type must be NONE.\nSchema: {"type":"CHAT|SUMMARY|TASK|MEETING|REMINDER|QUESTION|SEARCH|DOCUMENT|NONE","confidence":0.0,"title":string|null,"description":string|null,"assignee":string|null,"due_date":"ISO-8601 date/time or null","response":string|null}.\nFor CHAT and QUESTION, response is a concise, directly useful reply. For TASK, REMINDER, MEETING, SUMMARY, SEARCH, and DOCUMENT, fill action fields and only include response if it adds needed content.\nDetected type: ${type}\nMessage: ${message}\nContext: ${JSON.stringify(context)}`;
}

async function assertOwnedSession(admin: ReturnType<typeof createClient>, sessionId: string, userId: string) {
  const { data, error } = await admin.from("ai_sessions").select("id, subject, topic, difficulty").eq("id", sessionId).eq("student_id", userId).maybeSingle();
  if (error) throw new HttpError(500, "SUPABASE_ERROR", "Could not read the learning session.");
  if (!data) throw new HttpError(404, "NOT_FOUND", "Learning session not found.");
  return data;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (request.method !== "POST") throw new HttpError(405, "METHOD_NOT_ALLOWED", "Use POST for this endpoint.");
    const authorization = request.headers.get("Authorization");
    if (!authorization) throw new HttpError(401, "UNAUTHORIZED", "Sign in is required.");
    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceKey) throw new HttpError(500, "SUPABASE_CONFIG_ERROR", "The AI service is not configured correctly.");
    const auth = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: authError } = await auth.auth.getUser();
    if (authError || !user) throw new HttpError(401, "UNAUTHORIZED", "Your session is invalid or expired.");
    let body: Record<string, unknown>;
    try { body = await request.json(); } catch { throw new HttpError(400, "INVALID_REQUEST", "Request body must be valid JSON."); }
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message || message.length > 6000) throw new HttpError(422, "INVALID_REQUEST", "message is required and must be 6,000 characters or fewer.");
    const admin = createClient(url, serviceKey);
    const requestedSessionId = typeof body.sessionId === "string" ? body.sessionId : null;
    const businessId = typeof body.businessId === "string" ? body.businessId : null;
    let session: { id: string; subject: string; topic: string; difficulty: string } | null = null;
    if (requestedSessionId) session = await assertOwnedSession(admin, requestedSessionId, user.id);
    let business: { id: string; name: string; offer: string; target_customer: string; next_action: string } | null = null;
    if (businessId) {
      const { data, error } = await admin.from("businesses").select("id, name, offer, target_customer, next_action").eq("id", businessId).eq("user_id", user.id).maybeSingle();
      if (error) throw new HttpError(500, "SUPABASE_ERROR", "Could not read the business context.");
      if (!data) throw new HttpError(404, "NOT_FOUND", "Business not found.");
      business = data;
    }
    const type = classifyLocally(message);
    const context = { feature: typeof body.feature === "string" ? body.feature : "router", recent_messages: Array.isArray(body.context) ? body.context.slice(-8) : [], session: session ? { subject: session.subject, topic: session.topic, difficulty: session.difficulty } : null, business };
    const action = type === "NONE"
      ? { type: "NONE" as const, confidence: 0.99, title: null, description: null, assignee: null, due_date: null, response: null }
      : validateAction(await callChatGpt(actionPrompt(message, type, context)), type);
    const { data: stored, error: storeError } = await admin.from("ai_actions").insert({ user_id: user.id, session_id: session?.id ?? null, business_id: business?.id ?? null, type: action.type, confidence: action.confidence, title: action.title, description: action.description, assignee: action.assignee, due_date: action.due_date, response: action.response, metadata: { detected_type: type, feature: context.feature } }).select("id").single();
    if (storeError) throw new HttpError(500, "SUPABASE_ERROR", "The AI result could not be saved.");
    return json({ action: { ...action, id: stored.id } });
  } catch (error) {
    if (error instanceof HttpError) return json({ error: { code: error.code, message: error.message } }, error.status);
    console.error("ai-router unexpected error", error instanceof Error ? error.name : "unknown");
    return json({ error: { code: "INTERNAL_ERROR", message: "The AI service encountered an unexpected error." } }, 500);
  }
});
