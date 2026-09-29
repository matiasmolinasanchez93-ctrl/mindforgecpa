import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  // Check if profile already exists
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ profile: existing, created: false });
  }

  // Create profile from user metadata
  const { data: profile, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      name: user.user_metadata?.name || user.email?.split("@")[0] || "",
      email: user.email || "",
      role: user.user_metadata?.role || "student",
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create profile:", error);
    return NextResponse.json({ error: "No se pudo crear el perfil." }, { status: 500 });
  }

  return NextResponse.json({ profile, created: true });
}
