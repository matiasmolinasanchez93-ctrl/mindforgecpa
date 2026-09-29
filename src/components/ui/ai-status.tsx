export function AIStatus({ children = "Preparando tu siguiente paso…" }: { children?: React.ReactNode }) {
  return <div role="status" aria-live="polite" className="panel flex items-center gap-3 p-5 text-sm text-muted-foreground"><span className="ai-label thinking">IA</span>{children}</div>;
}
