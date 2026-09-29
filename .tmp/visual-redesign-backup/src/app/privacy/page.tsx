import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-zinc-100">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center px-4">
          <Logo />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 inline-block">⚠ Draft — requires legal review before production use.</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-600">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Information We Collect</h2>
            <p className="mt-2">MindForge collects only the information necessary to provide the service:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Account information:</strong> Name, email, and password (stored securely via Supabase Auth).</li>
              <li><strong>Role:</strong> Student or Teacher, set during signup.</li>
              <li><strong>Learning data:</strong> Skills scores, XP, achievements, challenge attempts, and AI tutor conversations.</li>
              <li><strong>Class membership:</strong> Classes you create or join.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">How We Use Your Data</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>To power the AI tutor, challenges, and learning features.</li>
              <li>To track your progress and skill development.</li>
              <li>For teachers: to view aggregated class progress and skill averages.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Student Privacy</h2>
            <p className="mt-2">We take student privacy seriously:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Teachers see aggregated progress, skills, and activity results — not private conversations.</li>
              <li>We collect minimal personal information.</li>
              <li>We do not sell or share personal data with third parties.</li>
              <li>We do not use data for advertising purposes.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Data Security</h2>
            <p className="mt-2">Data is stored securely in Supabase with Row Level Security (RLS), ensuring users can only access their own data and authorized class data.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Contact</h2>
            <p className="mt-2">For privacy-related questions, contact us at privacy@mindforge.app.</p>
          </section>
        </div>
        <div className="mt-12 border-t border-zinc-100 pt-6">
          <Link href="/" className="text-sm text-emerald-600 hover:text-emerald-700">← Back to MindForge</Link>
        </div>
      </main>
    </div>
  );
}
