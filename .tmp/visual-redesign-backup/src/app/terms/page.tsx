import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-zinc-100">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center px-4">
          <Logo />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 inline-block">⚠ Draft — requires legal review before production use.</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-600">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Service Description</h2>
            <p className="mt-2">MindForge is an AI-powered educational platform that helps students develop AI literacy, critical thinking, and independent learning skills.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">User Responsibilities</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Students are responsible for their own learning and the accuracy of their submissions.</li>
              <li>Teachers are responsible for managing their classes and respecting student privacy.</li>
              <li>Users must not attempt to exploit or circumvent the platform's features.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">AI Limitations</h2>
            <p className="mt-2">The AI tutor and other AI features may produce inaccurate or incomplete information. Users are encouraged to verify information independently. AI-generated content should be used as a learning tool, not as the sole source of truth.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Account Terms</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>One account per user. Do not create multiple accounts.</li>
              <li>Keep your password secure and do not share accounts.</li>
              <li>We reserve the right to suspend accounts that violate these terms.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Contact</h2>
            <p className="mt-2">For questions about these terms, contact us at terms@mindforge.app.</p>
          </section>
        </div>
        <div className="mt-12 border-t border-zinc-100 pt-6">
          <Link href="/" className="text-sm text-emerald-600 hover:text-emerald-700">← Back to MindForge</Link>
        </div>
      </main>
    </div>
  );
}
