# MindForge

> Don't outsource your brain. Upgrade it.

An interactive AI learning platform that helps students understand, practice, verify, and think independently.

## Quick Start

```bash
npm install
cp .env.example .env.local
# Fill in the public Supabase values (OpenAI is configured as a Supabase secret)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Setup

1. Run `supabase/migrations/001_education_platform.sql` in your Supabase SQL Editor
2. Set environment variables in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Configure Edge Function secrets (never add these to `.env.local`):
   - `supabase secrets set OPENAI_API_KEY=...`
   - `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...`
3. Deploy the function: `supabase functions deploy ai-router`

## Features

- **AI Tutor** — Socratic method learning with subject/topic/difficulty selection
- **Challenge Mode** — AI Detective, Prompt Battle, Solve It, Explain It, Fact Check
- **Prompt Builder** — Learn to write effective AI prompts
- **Fact Checker** — Verify AI-generated content claim by claim
- **Teacher Dashboard** — Create classes, manage join codes, view student progress
- **Gamification** — XP, levels, streaks, achievements
- **6 Measurable Skills** — AI Literacy, Critical Thinking, Problem Solving, Research, Verification, AI Independence

## Tech Stack

- Next.js 16, React 19, TypeScript 5
- Tailwind CSS 4, Supabase, OpenAI via Supabase Edge Functions
- See `MVP_DOCUMENTATION.md` for full details
