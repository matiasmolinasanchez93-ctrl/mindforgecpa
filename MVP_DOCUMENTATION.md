# MindForge — MVP Documentation

## 1. What Was Built

**MindForge** is an AI-powered educational platform that teaches students to use AI effectively while developing critical thinking, verification skills, and independence. Built on top of the existing BuildAI project (Next.js 16 + Supabase + OpenAI).

### Tagline
> Don't outsource your brain. Upgrade it.

---

## 2. Architecture

- **Framework:** Next.js 16.3.1 (App Router, Turbopack)
- **Language:** TypeScript 5, React 19
- **Styling:** Tailwind CSS 4 (emerald/green primary #10b981)
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **AI:** OpenAI SDK (gpt-4o-mini) — swappable via `/lib/ai/`
- **Auth:** Supabase Auth (email/password, role-based)

### Key Directories
```
src/
├── app/                    # Pages (App Router)
│   ├── page.tsx           # Landing page
│   ├── login/             # Login
│   ├── signup/            # Signup with role selection
│   ├── dashboard/         # Student dashboard
│   ├── tutor/             # AI Tutor
│   ├── challenges/        # Challenge Mode
│   ├── prompt-builder/    # Prompt Builder
│   ├── fact-checker/      # Fact Checker
│   ├── classes/           # Join a class (student)
│   ├── teacher/           # Teacher dashboard
│   ├── teacher/classes/   # Teacher class detail
│   ├── privacy/           # Privacy policy
│   ├── terms/             # Terms of service
│   └── api/               # API routes
├── components/             # React components
├── services/               # Business logic
│   ├── ai/                # AI services (tutor, factChecker, promptBuilder, challengeGenerator)
│   └── studentService.ts  # Student/teacher CRUD, gamification
├── types/                  # TypeScript types
├── lib/                    # Utilities, Supabase client, constants
└── middleware.ts           # Auth route protection
```

---

## 3. New Database Tables

Created in `supabase/migrations/001_education_platform.sql`:

| Table | Purpose |
|-------|---------|
| `profiles` (extended) | Added role, xp, level, streak, onboarding_completed, grade, school_name |
| `schools` | Future school integration |
| `classes` | Teacher-created classes with join codes |
| `class_members` | Student-class membership |
| `student_skills` | Per-student skill scores (AI Literacy, Critical Thinking, etc.) |
| `ai_sessions` | AI Tutor conversation sessions |
| `ai_session_messages` | Messages within tutor sessions |
| `activity_attempts` | Challenge completions with scores and XP |
| `achievements` | Achievement definitions (seeded with 10) |
| `student_achievements` | Earned achievements |
| `assignments` | Teacher-created assignments |

### Running the Migration
Execute the SQL in `supabase/migrations/001_education_platform.sql` in your Supabase SQL Editor.

---

## 4. New API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/tutor` | POST | Send message to AI Tutor |
| `/api/fact-check` | POST | Analyze AI-generated text |
| `/api/prompt-builder` | POST | Build optimized prompt |
| `/api/challenge` | GET | Generate a challenge |
| `/api/challenge` | POST | Submit challenge attempt |
| `/api/classes` | GET/POST | List/create/join classes |
| `/api/classes/[id]` | GET/DELETE | Class detail/delete |
| `/api/skills` | GET | Student skills and achievements |
| `/api/init-profile` | POST | Create profile for existing users |

---

## 5. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 6. How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Fill in Supabase and OpenAI keys

# 3. Run the database migration
# Go to Supabase SQL Editor and run supabase/migrations/001_education_platform.sql

# 4. Start the dev server
npm run dev

# 5. Open http://localhost:3000
```

---

## 7. Features Built

### Student
- ✅ Student Dashboard (XP, level, streak, 6 skill cards, quick actions, achievements)
- ✅ AI Tutor (Socratic method, subject/topic/difficulty selection, chat interface)
- ✅ Challenge Mode (5 types: AI Detective, Prompt Battle, Solve It, Explain It, Fact Check)
- ✅ Prompt Builder (4-field input with explanation of why the prompt works)
- ✅ Fact Checker (claim-by-claim analysis with status badges)
- ✅ Class Join (6-character code)
- ✅ Gamification (XP, levels, streaks, 10 achievements)

### Teacher
- ✅ Teacher Dashboard (class creation, join code management)
- ✅ Class Detail (student list, skill averages, weakness detection)
- ✅ Class Join System (code-based)

### Platform
- ✅ Landing page (Problem, Features, Skills, Teachers sections)
- ✅ Auth with role selection (Student/Teacher)
- ✅ Privacy and Terms pages (marked for legal review)
- ✅ Row Level Security on all tables
- ✅ Init-profile API for existing users

---

## 8. How It Works (Demo Flow)

### Student Flow
1. Sign up → Choose "Student" role
2. Dashboard → See 0 XP, Level 1, empty skills
3. AI Tutor → Select subject → Ask a question → Get guided help
4. Challenges → Pick a type → Solve → Earn XP
5. Skills update automatically based on performance

### Teacher Flow
1. Sign up → Choose "Teacher" role
2. Dashboard → Create a class → Get join code
3. Share code with students
4. View class detail → See student skills and weaknesses

---

## 9. Current Limitations

- AI features routed through the Edge Function require the `OPENAI_API_KEY` Supabase secret. It must never be added to the browser environment.
- Challenge scoring is basic (client-side heuristic) — could be AI-evaluated
- No email confirmation bypass (requires Supabase email settings)
- No demo mode yet (can be added)
- Legacy BuildAI pages still exist (business, coach, onboarding) — not removed per requirements

---

## 10. Next Steps

1. **Demo Mode** — Pre-seeded accounts for school presentations
2. **Assignment System** — Teachers assign challenges, students complete them
3. **Teacher Analytics** — Deeper class-wide skill analysis
4. **AI Challenge Evaluation** — Use OpenAI to score written answers
5. **Mobile optimization** — Further responsive improvements
6. **School Integration** — Multi-tenant architecture
7. **Email notifications** — Achievement announcements, assignment reminders
