import { SchoolLogo } from "@/components/ui/school-logo";
import { Logo } from "@/components/ui/logo";
import { LearningArt } from "@/components/ui/learning-art";
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="auth-layout">
    <aside className="auth-story"><div className="flex flex-wrap items-center gap-6"><Logo /><SchoolLogo className="w-full max-w-[320px]" /></div><div><p className="eyebrow text-primary mb-4">Una mente propia</p><h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight lg:text-5xl">Tu curiosidad.<br />Un mundo de posibilidades.</h2><p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">Aprende con IA. Practica de forma independiente. Gana la confianza para pensar por ti mismo.</p><LearningArt /></div><p className="auth-footnote text-xs text-muted-foreground">MindForge · Un poco mejor, cada día.</p></aside>
    <div className="auth-form">{children}</div>
  </main>;
}
