import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-zinc-100">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center px-4">
          <Logo />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Política de privacidad</h1>
        <p className="mt-2 text-xs text-gold-600 bg-gold-50 rounded-lg px-3 py-2 inline-block">⚠ Borrador: requiere revisión legal antes de su uso en producción.</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-600">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Información que recopilamos</h2>
            <p className="mt-2">MindForge recopila únicamente la información necesaria para prestar el servicio:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Información de la cuenta:</strong>  Nombre, correo y contraseña (almacenada de forma segura mediante Supabase Auth).</li>
              <li><strong>Rol:</strong>  Estudiante o docente, elegido al registrarse.</li>
              <li><strong>Datos de aprendizaje:</strong>  Puntuaciones de habilidades, XP, logros, intentos de retos y conversaciones con el tutor IA.</li>
              <li><strong>Participación en clases:</strong>  Clases que creas o a las que te unes.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Cómo utilizamos tus datos</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Para ofrecer el tutor IA, los retos y las funciones de aprendizaje.</li>
              <li>Para registrar tu progreso y el desarrollo de tus habilidades.</li>
              <li>Para que los docentes consulten el progreso general y los promedios de habilidades de sus clases.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Privacidad de los estudiantes</h2>
            <p className="mt-2">Protegemos la privacidad de los estudiantes:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Los docentes ven el progreso, las habilidades y los resultados de actividades de sus clases; no las conversaciones privadas.</li>
              <li>Recopilamos la mínima información personal necesaria.</li>
              <li>No vendemos ni compartimos datos personales con terceros.</li>
              <li>No utilizamos los datos con fines publicitarios.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Seguridad de los datos</h2>
            <p className="mt-2">Los datos se almacenan en Supabase con seguridad a nivel de fila (RLS), para que cada usuario acceda solo a sus datos y a los datos de clases que tiene autorizados.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Contacto</h2>
            <p className="mt-2">Para consultas de privacidad, escribe a privacy@mindforge.app.</p>
          </section>
        </div>
        <div className="mt-12 border-t border-zinc-100 pt-6">
          <Link href="/" className="text-sm text-brand-600 hover:text-brand-700">← Volver a MindForge</Link>
        </div>
      </main>
    </div>
  );
}
