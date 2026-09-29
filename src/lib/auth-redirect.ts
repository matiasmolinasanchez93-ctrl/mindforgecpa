export function safeNextPath(value: string | null | undefined): string {
  if (typeof value !== "string" || !value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return "/dashboard";
  try {
    const url = new URL(value, "https://app.local");
    const decoded = decodeURIComponent(url.pathname);
    if (url.origin !== "https://app.local" || decoded.startsWith("//") || decoded.includes("\\") ||
      /^\/(?:login|signup|auth|api|_next)(?:\/|$)/.test(decoded)) return "/dashboard";
    return url.pathname + url.search + url.hash;
  } catch { return "/dashboard"; }
}
