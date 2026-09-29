# BuildAI → AI Learning Platform Audit

## 1. Current Architecture
- **Framework:** Next.js 16.3.1 (App Router)
- **Language:** TypeScript 5, React 19
- **Styling:** Tailwind CSS 4 (via @tailwindcss/postcss)
- **Database:** Supabase (PostgreSQL) with @supabase/ssr + @supabase/supabase-js
- **AI:** OpenAI SDK (gpt-4o-mini)
- **Validation:** Zod 4
- **UI:** Custom component library (Button, Card, Input, Badge, ProgressBar, Skeleton)
- **Animations:** Tailwind + custom CSS (fadeInUp, fadeIn)
- **Sonner:** Toast notifications

## 2. Current Product
**BuildAI** — AI business coach that creates personalized 30-day business plans based on user goals, skills, budget, and experience.

## 3. Existing Tables
| Table | Purpose | RLS |
|-------|---------|-----|
| profiles | User profile (id, name, email, created_at) | ✅ |
| businesses | Business plans with full details | ✅ |
| tasks | 30-day roadmap tasks per business | ✅ |
| progress | Monthly revenue/customer tracking | ✅ |
| coach_messages | AI coach conversation history | ✅ |

## 4. Auth System
- Supabase Auth with email/password
- Auto-profile creation via DB trigger
- Middleware-based session refresh
- Protected routes: /dashboard, /onboarding, /coach, /business/*
- Auth pages redirect logged-in users to /dashboard

## 5. Reusable Components
- ✅ Auth form (login/signup) — needs role selection
- ✅ AppShell (sidebar nav) — needs new nav items
- ✅ UI primitives (Button, Card, Input, Badge, ProgressBar, Skeleton)
- ✅ Supabase client/server setup
- ✅ Middleware (session management, route protection)
- ✅ OpenAI client setup (createCompletion, error handling)
- ✅ cn() utility, formatters

## 6. Reusable Services
- ✅ OpenAI client wrapper — repurpose for AI tutor
- ✅ API route patterns (auth check → validate → process → respond)
- ✅ Supabase RLS patterns

## 7. What Needs Modification
- profiles table: add role, onboarding_completed, skills, xp, level, streak
- AppShell: new nav items (Tutor, Challenges, Prompt Builder, Fact Checker)
- Landing page: completely new content
- Dashboard: student/teacher views
- Middleware: new protected routes
- Layout metadata: rebrand to AI learning platform

## 8. What Needs Creation
- **New tables:** classes, class_members, student_skills, ai_sessions, prompts, assignments, activity_attempts, achievements, student_achievements
- **New pages:** AI Tutor, Prompt Builder, Fact Checker, Challenges, Teacher Dashboard, Class Join, Privacy, Terms
- **New AI services:** tutor (Socratic), factChecker, promptBuilder, challengeGenerator
- **New API routes:** tutor, fact-check, prompt-generate, challenge-generate, skills, achievements, classes
- **Demo mode:** pre-seeded demo accounts
- **Gamification:** XP, levels, streaks, achievements system

## 9. Security Considerations
- ✅ RLS on all existing tables
- ⚠️ OPENAI_API_KEY is server-side only (good)
- ⚠️ Need RLS for all new tables
- ⚠️ Teacher access must be scoped to their classes only
- ⚠️ Student chat data should not be exposed to teachers by default

## 10. Implementation Plan
1. DB migration (extend profiles + new tables)
2. New types and constants
3. AI architecture (/lib/ai/)
4. New API routes
5. Student dashboard + skills
6. AI Tutor (Socratic method)
7. Prompt Builder
8. Fact Checker
9. Challenge Mode
10. Gamification (XP, levels, streaks, achievements)
11. Teacher Dashboard
12. Class join system
13. First-time student experience
14. Landing page
15. Demo mode
16. Privacy/Terms pages
17. Testing & fixes
18. Documentation
