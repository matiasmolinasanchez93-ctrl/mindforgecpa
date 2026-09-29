import { safeNextPath, authRedirectOrigin } from "@/lib/auth-redirect";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // being issued with different cookies between client and server.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  function redirectWithCookies(url: URL) {
    const target = new URL(url.pathname + url.search, authRedirectOrigin(request.url));
    const response = NextResponse.redirect(target);
    supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
    return response;
  }

  const { pathname } = request.nextUrl;
  const isProtected = [
    "/dashboard", "/onboarding", "/coach", "/tutor",
    "/challenges", "/prompt-builder", "/fact-checker",
    "/teacher", "/classes",
  ].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isBusinessPage = pathname.startsWith("/business/");
  const isAuthPage = ["/login", "/signup"].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected || isBusinessPage) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      url.searchParams.set("next", pathname + request.nextUrl.search);
      return redirectWithCookies(url);
    }
  }

  if (isAuthPage && user) {
    return redirectWithCookies(new URL(safeNextPath(request.nextUrl.searchParams.get("next")), request.url));
  }

  return supabaseResponse;
}
