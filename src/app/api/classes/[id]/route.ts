import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClassMembers, getClassStudentSkills } from "@/services/studentService";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const { data: cls } = await supabase
    .from("classes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!cls) {
    return NextResponse.json({ error: "No se encontró la clase." }, { status: 404 });
  }

  const members = await getClassMembers(supabase, id);
  const skills = await getClassStudentSkills(supabase, id);

  return NextResponse.json({ class: cls, members, skills });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const { data: cls } = await supabase
    .from("classes")
    .select("teacher_id")
    .eq("id", id)
    .maybeSingle();

  if (!cls || cls.teacher_id !== user.id) {
    return NextResponse.json({ error: "No tienes permiso para realizar esta acción." }, { status: 403 });
  }

  await supabase.from("classes").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
