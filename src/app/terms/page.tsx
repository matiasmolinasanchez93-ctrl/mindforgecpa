import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = { title: "Términos del servicio" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-zinc-100">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center px-4">
          <Logo />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Términos del servicio</h1>
        <p className="mt-2 text-xs text-gold-600 bg-gold-50 rounded-lg px-3 py-2 inline-block">⚠ Borrador: requiere revisión legal antes de su uso en producción.</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-600">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Descripción del servicio</h2>
            <p className="mt-2">MindForge es una plataforma educativa con IA que ayuda a desarrollar conocimientos de inteligencia artificial, pensamiento crítico y aprendizaje autónomo.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Responsabilidades del usuario</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Los estudiantes son responsables de su aprendizaje y de la exactitud de sus entregas.</li>
              <li>Los docentes son responsables de gestionar sus clases y respetar la privacidad de los estudiantes.</li>
              <li>Los usuarios no deben intentar explotar vulnerabilidades ni eludir las funciones de la plataforma.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Limitaciones de la IA</h2>
            <p className="mt-2">El tutor y las demás funciones de IA pueden generar información incorrecta o incompleta. Verifica la información por tu cuenta. Utiliza el contenido de la IA como herramienta de aprendizaje, no como única fuente de información.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Condiciones de la cuenta</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Una cuenta por usuario. No crees cuentas múltiples.</li>
              <li>Protege tu contraseña y no compartas tu cuenta.</li>
              <li>Nos reservamos el derecho de suspender las cuentas que incumplan estos términos.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Contacto</h2>
            <p className="mt-2">Para consultas sobre estos términos, escribe a terms@mindforge.app.</p>
          </section>
        </div>
        <div className="mt-12 border-t border-zinc-100 pt-6">
          <Link href="/" className="text-sm text-brand-600 hover:text-brand-700">← Volver a MindForge</Link>
        </div>
      </main>
    </div>
  );
}
