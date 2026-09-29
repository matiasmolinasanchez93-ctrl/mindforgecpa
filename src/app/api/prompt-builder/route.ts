import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildOptimizedPrompt, PromptBuilderError } from "@/services/ai/promptBuilder";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  let body: { goal?: string; context?: string; constraints?: string; outputFormat?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "La solicitud no es válida." }, { status: 400 });
  }

  if (!body.goal?.trim()) {
    return NextResponse.json({ error: "Debes indicar un objetivo." }, { status: 422 });
  }

  try {
    const result = await buildOptimizedPrompt({
      goal: body.goal,
      context: body.context || "",
      constraints: body.constraints || "",
      outputFormat: body.outputFormat || "",
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PromptBuilderError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "No se pudo crear el prompt." }, { status: 500 });
  }
}
