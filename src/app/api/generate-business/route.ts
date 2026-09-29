import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/schemas";
import { generateBusiness } from "@/services/ai/businessGenerator";
import { createBusiness } from "@/services/businessService";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Inicia sesión para crear tu negocio." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "La solicitud no es válida." }, { status: 400 });
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Check your answers and try again.";
    return NextResponse.json({ error: firstIssue }, { status: 422 });
  }

  try {
    const result = await generateBusiness(parsed.data);
    const saved = await createBusiness(supabase, {
      userId: user.id,
      ...parsed.data,
      result,
    });

    if (!saved) {
      return NextResponse.json(
        { error: "No se pudo guardar tu plan de negocio. Inténtalo de nuevo." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      businessId: saved.business.id,
    });
  } catch (error) {
    console.error("Business generation failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
    return NextResponse.json(
      { error: message },
      { status: message.includes("right now") ? 503 : 500 }
    );
  }
}
