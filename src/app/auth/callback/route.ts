import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath, authRedirectOrigin } from "@/lib/auth-redirect";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = authRedirectOrigin(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const isRecovery = type === "recovery" || searchParams.get("next") === "/reset-password";
  const next = isRecovery ? "/reset-password" : safeNextPath(searchParams.get("next"));
  try {
    const supabase = await createClient();
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next, origin));
    } else if (tokenHash && (type === "email" || type === "signup" || type === "recovery")) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      if (!error) return NextResponse.redirect(new URL(next, origin));
    }
  } catch {
    // Expired links and network failures must lead to a usable recovery screen.
  }
  const failurePath = isRecovery ? "/forgot-password?error=recovery"
    : "/login?error=auth&next=" + encodeURIComponent(next);
  return NextResponse.redirect(new URL(failurePath, origin));
}
