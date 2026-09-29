import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateTaskSchema } from "@/lib/schemas";
import { toggleTask } from "@/services/businessService";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "La solicitud no es válida." }, { status: 400 });
  }

  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "La actualización de la tarea no es válida." }, { status: 422 });
  }

  const taskId = request.nextUrl.searchParams.get("taskId");
  const businessId = request.nextUrl.searchParams.get("businessId");
  if (!taskId || !businessId) {
    return NextResponse.json({ error: "Falta identificar la tarea o el negocio." }, { status: 400 });
  }

  // Ownership check: the business must belong to the authenticated user.
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!business) {
    return NextResponse.json({ error: "No se encontró el negocio." }, { status: 404 });
  }

  const updated = await toggleTask(
    supabase,
    taskId,
    businessId,
    user.id,
    parsed.data.completed
  );

  if (!updated) {
    return NextResponse.json({ error: "No se pudo actualizar la tarea." }, { status: 500 });
  }

  return NextResponse.json({ task: updated });
}
