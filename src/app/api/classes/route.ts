import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createClass,
  getTeacherClasses,
  getStudentClasses,
  joinClassByCode,
} from "@/services/studentService";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "teacher") {
    const classes = await getTeacherClasses(supabase, user.id);
    return NextResponse.json({ classes, role: "teacher" });
  }

  const classes = await getStudentClasses(supabase, user.id);
  return NextResponse.json({ classes, role: "student" });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  let body: { action?: string; name?: string; subject?: string; join_code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "La solicitud no es válida." }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (body.action === "create") {
    if (profile?.role !== "teacher") {
      return NextResponse.json({ error: "Solo los docentes pueden crear clases." }, { status: 403 });
    }
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Debes indicar el nombre de la clase." }, { status: 422 });
    }
    const cls = await createClass(supabase, user.id, body.name.trim(), body.subject || "General");
    if (!cls) {
      return NextResponse.json({ error: "No se pudo crear la clase." }, { status: 500 });
    }
    return NextResponse.json({ class: cls });
  }

  if (body.action === "join") {
    if (!body.join_code?.trim()) {
      return NextResponse.json({ error: "Debes indicar el código de acceso." }, { status: 422 });
    }
    const result = await joinClassByCode(supabase, user.id, body.join_code);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, className: result.className });
  }

  return NextResponse.json({ error: "Elige crear una clase o unirte a una." }, { status: 422 });
}
