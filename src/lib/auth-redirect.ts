export function safeNextPath(value: string | null | undefined): string {
  if (typeof value !== "string" || !value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return "/dashboard";
  try {
    const url = new URL(value, "https://app.local");
    const decoded = decodeURIComponent(url.pathname);
    if (url.origin !== "https://app.local" || decoded.startsWith("//") || decoded.includes("\\") ||
      /^\/(?:login|signup|auth|api|_next|null|undefined)(?:\/|$)/.test(decoded)) return "/dashboard";
    return url.pathname + url.search + url.hash;
  } catch { return "/dashboard"; }
}

export function authRedirectOrigin(requestUrl: string): string {
  const requestOrigin = new URL(requestUrl).origin;
  if (process.env.NODE_ENV !== "production") return requestOrigin;
  const candidates = [
    process.env.APP_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL : undefined,
    requestOrigin,
    "https://mindforgecpa.vercel.app",
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      const host = url.hostname.toLowerCase();
      if (url.protocol === "https:" && !url.username && !url.password &&
          host !== "localhost" && !host.endsWith(".localhost") &&
          host !== "0.0.0.0" && host !== "[::1]" && !host.startsWith("127.")) {
        return url.origin;
      }
    } catch { /* Ignore invalid deployment configuration. */ }
  }
  return "https://mindforgecpa.vercel.app";
}
