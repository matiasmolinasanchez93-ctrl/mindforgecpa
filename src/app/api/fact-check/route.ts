  import { saveToolActivity } from "@/services/learningActivity";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeClaims, FactCheckError } from "@/services/ai/factChecker";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "La solicitud no es válida." }, { status: 400 });
  }

  if (!body.text?.trim()) {
    return NextResponse.json({ error: "Debes introducir un texto." }, { status: 422 });
  }

  if (body.text.length > 5000) {
    return NextResponse.json({ error: "El texto es demasiado largo (máximo 5000 caracteres)." }, { status: 422 });
  }

  try {
    const result = await analyzeClaims(body.text);
    const saved = await saveToolActivity(supabase, user.id, "fact_checker", "Verificación: " + body.text.slice(0, 100), result.overallAssessment);
    return NextResponse.json({ ...result, saved });
  } catch (error) {
    if (error instanceof FactCheckError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "No se pudo completar la verificación." }, { status: 500 });
  }
}
