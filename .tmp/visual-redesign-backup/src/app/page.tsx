import Link from "next/link";
import { ArrowRight, Brain, Shield, Users, Zap, BookOpen, Search, Lightbulb, Trophy } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { APP_TAGLINE } from "@/lib/constants";

const PROBLEMS = [
  "Students ask AI to do their homework instead of learning from it",
  "AI gives answers without building understanding",
  "Students can't tell when AI is wrong or making things up",
  "No way to measure if students actually learned anything",
];

const FEATURES = [
  {
    icon: Brain,
    title: "AI Tutor",
    description: "Socratic learning — the AI guides your thinking instead of giving answers. You learn, not copy.",
  },
  {
    icon: Shield,
    title: "Fact Checker",
    description: "Paste any AI-generated text and learn to spot hallucinations, errors, and things that need verification.",
  },
  {
    icon: Lightbulb,
    title: "Prompt Builder",
    description: "Learn to write prompts that actually work. Understand why good prompts produce better results.",
  },
  {
    icon: Trophy,
    title: "Challenge Mode",
    description: "AI Detective, Solve It, Explain It — real challenges that test if you actually understand.",
  },
];

const SKILLS_LIST = ["AI Literacy", "Critical Thinking", "Problem Solving", "Research", "Verification", "AI Independence"];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 sm:block">
              Sign in
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px]" style={{ background: "radial-gradient(60% 60% at 50% 0%, rgba(16,185,129,0.08), transparent)" }} aria-hidden />
        <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                AI Learning Platform
              </span>
            </div>
            <h1 className="animate-fade-in-up mt-6 text-4xl font-semibold tracking-tight sm:text-6xl" style={{ animationDelay: "80ms" }}>
              Don't outsource your brain.{" "}
              <span className="text-primary">Upgrade it.</span>
            </h1>
            <p className="animate-fade-in-up mx-auto mt-6 max-w-2xl text-lg text-muted-foreground" style={{ animationDelay: "160ms" }}>
              {APP_TAGLINE}
            </p>
            <p className="animate-fade-in-up mx-auto mt-2 max-w-2xl text-base text-zinc-500" style={{ animationDelay: "200ms" }}>
              An interactive AI learning platform that helps students understand, practice, verify, and think independently.
            </p>
            <div className="animate-fade-in-up mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center" style={{ animationDelay: "240ms" }}>
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Learning
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signup?role=teacher" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  For Schools
                </Button>
              </Link>
            </div>
            <p className="animate-fade-in-up mt-6 text-xs text-zinc-400" style={{ animationDelay: "320ms" }}>
              No credit card required. Free to get started.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="border-t border-zinc-100 bg-zinc-50/60 py-20 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">The Problem</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              AI is everywhere in education, but nobody's teaching students how to use it properly.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {PROBLEMS.map((problem, i) => (
              <div key={i} className={cn("flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-5", "animate-fade-in-up")} style={{ animationDelay: `${i * 80}ms` }}>
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">✕</span>
                <p className="text-sm text-zinc-700">{problem}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We don't replace AI — we teach you to use it wisely and verify what it says.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, index) => (
              <div key={feature.title} className={cn("rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md", "animate-fade-in-up")} style={{ animationDelay: `${index * 80}ms` }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="border-t border-zinc-100 bg-zinc-50/60 py-20 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Skills You'll Build</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Measurable progress on the skills that matter most.
            </p>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {SKILLS_LIST.map((skill) => (
              <span key={skill} className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-700 shadow-sm">
                {skill}
              </span>
            ))}
          </div>
          <div className="mt-12 mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                { label: "AI Literacy", value: "74%" },
                { label: "Critical Thinking", value: "82%" },
                { label: "Problem Solving", value: "91%" },
                { label: "Research", value: "68%" },
                { label: "Verification", value: "77%" },
                { label: "AI Independence", value: "71%" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{item.value}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For Teachers */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="rounded-3xl bg-zinc-950 px-6 py-16 text-center sm:px-16 sm:py-20">
            <Users className="mx-auto h-10 w-10 text-emerald-400" />
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Built for Teachers Too
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-300">
              Create classes, invite students with a code, assign challenges, and see aggregated progress. Know exactly where your students need help.
            </p>
            <div className="mt-8">
              <Link href="/signup?role=teacher">
                <Button size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100">
                  Get Started for Schools
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Start thinking independently with AI
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The goal isn't to avoid AI — it's to use it without letting it do the thinking for you.
            </p>
            <div className="mt-8">
              <Link href="/signup">
                <Button size="lg">
                  Start Learning
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <Logo />
          <div className="flex gap-4 text-xs text-zinc-400">
            <Link href="/privacy" className="hover:text-zinc-600">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-600">Terms</Link>
          </div>
          <p className="text-xs text-zinc-400">
            © 2026 MindForge. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
