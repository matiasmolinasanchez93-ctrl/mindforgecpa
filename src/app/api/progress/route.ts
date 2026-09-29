import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateProgressSchema } from "@/lib/schemas";
import { updateRevenueCustomers } from "@/services/businessService";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const businessId = request.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "Falta identificar el negocio." }, { status: 400 });
  }

  // Ownership check happens inside the service via user_id scoping.
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!business) {
    return NextResponse.json({ error: "No se encontró el negocio." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "La solicitud no es válida." }, { status: 400 });
  }

  const parsed = updateProgressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "La actualización del progreso no es válida." },
      { status: 422 }
    );
  }

  const updated = await updateRevenueCustomers(
    supabase,
    businessId,
    user.id,
    parsed.data
  );

  if (!updated) {
    return NextResponse.json(
      { error: "No se pudo actualizar tu progreso. Inténtalo de nuevo." },
      { status: 500 }
    );
  }

  return NextResponse.json({ business: updated });
}
