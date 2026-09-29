"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GraduationCap, Puzzle, FileText, Search, Users, Menu, X, ArrowUpRight, BriefcaseBusiness } from "lucide-react";
import { SchoolLogo } from "@/components/ui/school-logo";
import { Logo } from "@/components/ui/logo";
import { LogoutButton } from "@/components/auth/logout-button";

interface AppShellProps { children: React.ReactNode; role?: "student" | "teacher"; businessId?: string; }
const STUDENT_NAV = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/tutor", label: "Tutor IA", icon: GraduationCap },
  { href: "/challenges", label: "Desafíos", icon: Puzzle },
  { href: "/prompt-builder", label: "Constructor de Prompts", icon: FileText },
  { href: "/fact-checker", label: "Verificador de Datos", icon: Search },
  { href: "/classes", label: "Mis Clases", icon: Users },
];
const TEACHER_NAV = [
  { href: "/teacher", label: "Resumen", icon: LayoutDashboard },
  { href: "/teacher/classes", label: "Mis Clases", icon: Users },
];
export function AppShell({ children, role = "student", businessId }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = role === "teacher" ? TEACHER_NAV : STUDENT_NAV;
  const active = (href: string) => pathname === href || (href !== "/teacher" && pathname.startsWith(href + "/"));
  const current = [...navItems].reverse().find(item => active(item.href))?.label ?? (pathname === "/coach" ? "Coach IA" : "Tu negocio");
  const navigation = <>{navItems.map(item => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} aria-current={active(item.href) ? "page" : undefined} className="nav-item"><item.icon className="h-[18px] w-[18px]" />{item.label}</Link>)}
    {businessId && <Link href={`/business/${businessId}`} className="nav-item" aria-current={pathname.startsWith("/business") ? "page" : undefined}><BriefcaseBusiness size={18} />Tu negocio</Link>}
  </>;
  return <div className="min-h-screen bg-background">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:p-3">Saltar al contenido</a>
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-card-border bg-white px-4 lg:hidden">
      <Logo /><button type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen} aria-controls="mobile-menu" aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"} className="rounded-lg p-2 text-primary">{mobileOpen ? <X size={22} /> : <Menu size={22} />}</button>
    </header>
    {mobileOpen && <nav id="mobile-menu" aria-label="Navegación móvil" className="sticky top-16 z-40 border-b border-card-border bg-white p-4 lg:hidden" onKeyDown={e => { if (e.key === "Escape") setMobileOpen(false); }}>{navigation}<div className="mt-3 border-t border-card-border pt-3"><LogoutButton /></div></nav>}
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-card-border bg-white lg:flex">
      <div className="px-7 pb-10 pt-9"><Logo /></div>
      <div className="px-7 pb-3"><p className="eyebrow">{role === "teacher" ? "Espacio de enseñanza" : "Tu espacio de aprendizaje"}</p></div>
      <nav aria-label="Navegación principal" className="space-y-1 px-4">{navigation}</nav>
      <div className="mt-auto p-5"><SchoolLogo className="mb-4 !p-1" />
        <div className="rounded-xl bg-background p-4"><span className="ai-label">Hecho para mentes curiosas</span><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Un poco de progreso.<br />Una nueva posibilidad.</p><Link href={role === "teacher" ? "/teacher/classes" : "/tutor"} className="text-link mt-4">{role === "teacher" ? "Tu aula" : "Explora con IA"}<ArrowUpRight size={14} /></Link></div>
        <div className="mt-5 border-t border-card-border pt-4"><p className="eyebrow mb-3">{role === "teacher" ? "Cuenta de docente" : "Cuenta de estudiante"}</p><LogoutButton /></div>
      </div>
    </aside>
    <main id="main-content" tabIndex={-1} className="min-w-0 lg:pl-60">
      <div className="hidden h-[72px] items-center justify-between border-b border-card-border bg-white/70 px-10 lg:flex"><p className="text-xs text-muted-foreground">Espacio de trabajo <span className="mx-3 text-zinc-300">/</span><span className="font-medium text-foreground">{current}</span></p><span className="eyebrow">Un poco mejor, cada día</span></div>
      <div className="workspace-content mx-auto w-full max-w-7xl px-4 pb-28 pt-7 sm:px-7 lg:px-12 lg:py-10">{children}</div>
    </main>
    <nav aria-label="Navegación rápida" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-card-border bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      {navItems.slice(0, 5).map(item => <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} className={`flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 text-center text-[10px] font-medium ${active(item.href) ? "bg-primary/5 text-primary" : "text-muted-foreground"}`}><item.icon size={19} />{item.label}</Link>)}
    </nav>
  </div>;
}
