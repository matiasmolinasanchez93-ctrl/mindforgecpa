import { Logo } from "@/components/ui/logo";
import { LearningArt } from "@/components/ui/learning-art";
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="auth-layout">
    <aside className="auth-story"><Logo /><div><p className="eyebrow text-primary mb-4">A mind of your own</p><h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight lg:text-5xl">Your curiosity.<br />A world of possibility.</h2><p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">Learn with AI. Practice independently. Build the confidence to think for yourself.</p><LearningArt /></div><p className="auth-footnote text-xs text-muted-foreground">MindForge ? A little better, every day.</p></aside>
    <div className="auth-form">{children}</div>
  </main>;
}
