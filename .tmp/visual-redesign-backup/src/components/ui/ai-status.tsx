export function AIStatus({ children = "Thinking through your next step?" }: { children?: React.ReactNode }) {
  return <div role="status" aria-live="polite" className="panel flex items-center gap-3 p-5 text-sm text-muted-foreground"><span className="ai-label thinking">AI</span>{children}</div>;
}
