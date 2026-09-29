-- ============================================================
-- MindForge — complete database schema
--
-- This one file IS the whole data model. It is idempotent: run it on a brand
-- new project, or re-run it after a partial failure, without errors.
--
-- Run it in the Supabase SQL editor (Dashboard → SQL Editor → New query),
-- or with `supabase db push`.
--
-- Supersedes supabase/migrations/001_education_platform.sql and
-- supabase/migrations/002_ai_actions.sql.
-- ============================================================

create extension if not exists "pgcrypto";

-- ─── Profiles ────────────────────────────────────────────────
-- Mirrors auth.users and holds everything the app reads for a user.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null default '',
  role text not null default 'student' check (role in ('student', 'teacher')),
  onboarding_completed boolean not null default false,
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  streak integer not null default 0 check (streak >= 0),
  last_active_date date,
  grade text not null default '',
  school_name text not null default '',
  created_at timestamptz not null default now()
);

-- Upgrade an older profiles table in place.
alter table public.profiles add column if not exists role text not null default 'student';
alter table public.profiles add column if not exists onboarding_completed boolean not null default false;
alter table public.profiles add column if not exists xp integer not null default 0;
alter table public.profiles add column if not exists level integer not null default 1;
alter table public.profiles add column if not exists streak integer not null default 0;
alter table public.profiles add column if not exists last_active_date date;
alter table public.profiles add column if not exists grade text not null default '';
alter table public.profiles add column if not exists school_name text not null default '';

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Teachers must be able to read the roster of their own classes.
drop policy if exists "Teachers can view profiles of their class students" on public.profiles;
create policy "Teachers can view profiles of their class students"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.class_members cm
      join public.classes c on c.id = cm.class_id
      where cm.student_id = profiles.id
        and c.teacher_id = auth.uid()
    )
  );

-- ─── Businesses ──────────────────────────────────────────────

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  goal_monthly_revenue numeric not null default 0 check (goal_monthly_revenue >= 0),
  current_monthly_revenue numeric not null default 0 check (current_monthly_revenue >= 0),
  starting_budget numeric not null default 0 check (starting_budget >= 0),
  starting_budget_currency text not null default 'USD',
  remaining_budget numeric not null default 0 check (remaining_budget >= 0),
  customers integer not null default 0 check (customers >= 0),
  hours_per_day numeric not null default 2 check (hours_per_day > 0 and hours_per_day <= 24),
  skills text[] not null default '{}',
  preferences text[] not null default '{}',
  experience text not null default 'Beginner',
  country text not null default '',
  city text not null default '',
  idea text not null default '',
  problem_solved text not null default '',
  target_customer text not null default '',
  offer text not null default '',
  pricing jsonb not null default '{}'::jsonb,
  startup_costs jsonb not null default '[]'::jsonb,
  revenue_model text not null default '',
  reasoning text not null default '',
  realistic_timeline text not null default '',
  marketing_strategy jsonb not null default '{}'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  next_action text not null default '',
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists businesses_user_id_idx on public.businesses (user_id);
create index if not exists businesses_created_at_idx on public.businesses (created_at desc);

alter table public.businesses enable row level security;

drop policy if exists "Users can view their own businesses" on public.businesses;
create policy "Users can view their own businesses"
  on public.businesses for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own businesses" on public.businesses;
create policy "Users can insert their own businesses"
  on public.businesses for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own businesses" on public.businesses;
create policy "Users can update their own businesses"
  on public.businesses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own businesses" on public.businesses;
create policy "Users can delete their own businesses"
  on public.businesses for delete
  using (auth.uid() = user_id);

-- ─── Tasks (the 30-day roadmap) ──────────────────────────────

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  day integer not null check (day between 1 and 30),
  title text not null,
  description text not null default '',
  reason text not null default '',
  status text not null default 'pending' check (status in ('pending', 'done')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists tasks_business_id_idx on public.tasks (business_id);
create index if not exists tasks_status_idx on public.tasks (status);

alter table public.tasks enable row level security;

drop policy if exists "Users can view tasks of their businesses" on public.tasks;
create policy "Users can view tasks of their businesses"
  on public.tasks for select
  using (
    exists (
      select 1 from public.businesses b
      where b.id = tasks.business_id and b.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert tasks in their businesses" on public.tasks;
create policy "Users can insert tasks in their businesses"
  on public.tasks for insert
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = tasks.business_id and b.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update tasks in their businesses" on public.tasks;
create policy "Users can update tasks in their businesses"
  on public.tasks for update
  using (
    exists (
      select 1 from public.businesses b
      where b.id = tasks.business_id and b.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = tasks.business_id and b.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete tasks in their businesses" on public.tasks;
create policy "Users can delete tasks in their businesses"
  on public.tasks for delete
  using (
    exists (
      select 1 from public.businesses b
      where b.id = tasks.business_id and b.user_id = auth.uid()
    )
  );
-- ─── Progress (monthly revenue/customer tracking) ────────────

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  month text not null,
  revenue numeric not null default 0 check (revenue >= 0),
  customers integer not null default 0 check (customers >= 0),
  recorded_at timestamptz not null default now(),
  unique (business_id, month)
);

create index if not exists progress_business_id_idx on public.progress (business_id);

alter table public.progress enable row level security;

drop policy if exists "Users can view progress of their businesses" on public.progress;
create policy "Users can view progress of their businesses"
  on public.progress for select
  using (
    exists (
      select 1 from public.businesses b
      where b.id = progress.business_id and b.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert progress in their businesses" on public.progress;
create policy "Users can insert progress in their businesses"
  on public.progress for insert
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = progress.business_id and b.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update progress in their businesses" on public.progress;
create policy "Users can update progress in their businesses"
  on public.progress for update
  using (
    exists (
      select 1 from public.businesses b
      where b.id = progress.business_id and b.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = progress.business_id and b.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete progress in their businesses" on public.progress;
create policy "Users can delete progress in their businesses"
  on public.progress for delete
  using (
    exists (
      select 1 from public.businesses b
      where b.id = progress.business_id and b.user_id = auth.uid()
    )
  );

-- ─── Coach messages ──────────────────────────────────────────

create table if not exists public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  business_id uuid references public.businesses (id) on delete set null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists coach_messages_user_id_idx on public.coach_messages (user_id);
create index if not exists coach_messages_business_id_idx on public.coach_messages (business_id);
create index if not exists coach_messages_created_at_idx on public.coach_messages (created_at asc);

alter table public.coach_messages enable row level security;

drop policy if exists "Users can view their coach messages" on public.coach_messages;
create policy "Users can view their coach messages"
  on public.coach_messages for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their coach messages" on public.coach_messages;
create policy "Users can insert their coach messages"
  on public.coach_messages for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their coach messages" on public.coach_messages;
create policy "Users can update their coach messages"
  on public.coach_messages for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their coach messages" on public.coach_messages;
create policy "Users can delete their coach messages"
  on public.coach_messages for delete
  using (auth.uid() = user_id);

-- ─── Schools ─────────────────────────────────────────────────

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.schools enable row level security;

drop policy if exists "Anyone can view schools" on public.schools;
create policy "Anyone can view schools"
  on public.schools for select
  using (true);

-- ─── Classes ─────────────────────────────────────────────────

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  subject text not null default 'General',
  join_code text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists classes_teacher_id_idx on public.classes (teacher_id);
create index if not exists classes_join_code_idx on public.classes (join_code);

alter table public.classes enable row level security;

drop policy if exists "Teachers can manage their own classes" on public.classes;
create policy "Teachers can manage their own classes"
  on public.classes for all
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

drop policy if exists "Students can view classes they belong to" on public.classes;
create policy "Students can view classes they belong to"
  on public.classes for select
  using (
    exists (
      select 1 from public.class_members cm
      where cm.class_id = classes.id and cm.student_id = auth.uid()
    )
  );

-- ─── Class members ───────────────────────────────────────────

create table if not exists public.class_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  student_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (class_id, student_id)
);

create index if not exists class_members_class_id_idx on public.class_members (class_id);
create index if not exists class_members_student_id_idx on public.class_members (student_id);

alter table public.class_members enable row level security;

drop policy if exists "Students can view their own class memberships" on public.class_members;
create policy "Students can view their own class memberships"
  on public.class_members for select
  using (auth.uid() = student_id);

drop policy if exists "Students can join classes" on public.class_members;
create policy "Students can join classes"
  on public.class_members for insert
  with check (auth.uid() = student_id);

drop policy if exists "Teachers can view members of their classes" on public.class_members;
create policy "Teachers can view members of their classes"
  on public.class_members for select
  using (
    exists (
      select 1 from public.classes c
      where c.id = class_members.class_id and c.teacher_id = auth.uid()
    )
  );

drop policy if exists "Teachers can remove members from their classes" on public.class_members;
create policy "Teachers can remove members from their classes"
  on public.class_members for delete
  using (
    exists (
      select 1 from public.classes c
      where c.id = class_members.class_id and c.teacher_id = auth.uid()
    )
  );
-- ─── Student skills ──────────────────────────────────────────

create table if not exists public.student_skills (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  skill_name text not null,
  score numeric not null default 50 check (score >= 0 and score <= 100),
  total_attempts integer not null default 0,
  independent_correct integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (student_id, skill_name)
);

create index if not exists student_skills_student_id_idx on public.student_skills (student_id);

alter table public.student_skills enable row level security;

drop policy if exists "Students can view their own skills" on public.student_skills;
create policy "Students can view their own skills"
  on public.student_skills for select
  using (auth.uid() = student_id);

drop policy if exists "Students can insert their own skills" on public.student_skills;
create policy "Students can insert their own skills"
  on public.student_skills for insert
  with check (auth.uid() = student_id);

drop policy if exists "Students can update their own skills" on public.student_skills;
create policy "Students can update their own skills"
  on public.student_skills for update
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

drop policy if exists "Teachers can view skills of their class students" on public.student_skills;
create policy "Teachers can view skills of their class students"
  on public.student_skills for select
  using (
    exists (
      select 1 from public.class_members cm
      join public.classes c on c.id = cm.class_id
      where cm.student_id = student_skills.student_id
        and c.teacher_id = auth.uid()
    )
  );

-- ─── AI tutor sessions ───────────────────────────────────────

create table if not exists public.ai_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '',
  subject text not null default 'General',
  topic text not null default '',
  difficulty text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_sessions add column if not exists title text not null default '';

create index if not exists ai_sessions_student_id_idx on public.ai_sessions (student_id);
create index if not exists ai_sessions_student_updated_idx
  on public.ai_sessions (student_id, updated_at desc);

alter table public.ai_sessions enable row level security;

drop policy if exists "Students can view their own sessions" on public.ai_sessions;
create policy "Students can view their own sessions"
  on public.ai_sessions for select
  using (auth.uid() = student_id);

drop policy if exists "Students can create their own sessions" on public.ai_sessions;
create policy "Students can create their own sessions"
  on public.ai_sessions for insert
  with check (auth.uid() = student_id);

drop policy if exists "Students can update their own sessions" on public.ai_sessions;
create policy "Students can update their own sessions"
  on public.ai_sessions for update
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

drop policy if exists "Students can delete their own sessions" on public.ai_sessions;
create policy "Students can delete their own sessions"
  on public.ai_sessions for delete
  using (auth.uid() = student_id);

-- ─── AI session messages ─────────────────────────────────────

create table if not exists public.ai_session_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_sessions (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  hints_used integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists ai_session_messages_session_id_idx on public.ai_session_messages (session_id);
create index if not exists ai_session_messages_session_created_idx
  on public.ai_session_messages (session_id, created_at asc, id asc);

alter table public.ai_session_messages enable row level security;

drop policy if exists "Students can view messages of their sessions" on public.ai_session_messages;
create policy "Students can view messages of their sessions"
  on public.ai_session_messages for select
  using (
    exists (
      select 1 from public.ai_sessions s
      where s.id = ai_session_messages.session_id and s.student_id = auth.uid()
    )
  );

drop policy if exists "Students can insert messages in their sessions" on public.ai_session_messages;
create policy "Students can insert messages in their sessions"
  on public.ai_session_messages for insert
  with check (
    exists (
      select 1 from public.ai_sessions s
      where s.id = ai_session_messages.session_id and s.student_id = auth.uid()
    )
  );

drop policy if exists "Students can delete messages of their sessions" on public.ai_session_messages;
create policy "Students can delete messages of their sessions"
  on public.ai_session_messages for delete
  using (
    exists (
      select 1 from public.ai_sessions s
      where s.id = ai_session_messages.session_id and s.student_id = auth.uid()
    )
  );

-- ─── Keep ai_sessions.updated_at honest ──────────────────────
-- The conversation list sorts by recency, so updated_at must advance whenever
-- a message is written, whichever code path performs the insert.

create or replace function public.touch_ai_session()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.ai_sessions
  set updated_at = now()
  where id = new.session_id;
  return new;
end;
$$;

drop trigger if exists on_ai_session_message_created on public.ai_session_messages;
create trigger on_ai_session_message_created
  after insert on public.ai_session_messages
  for each row execute procedure public.touch_ai_session();

-- ─── Activity attempts ───────────────────────────────────────

create table if not exists public.activity_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  activity_type text not null,
  activity_title text not null default '',
  subject text not null default 'General',
  score numeric not null default 0 check (score >= 0 and score <= 100),
  xp_earned integer not null default 0,
  hints_used integer not null default 0,
  was_independent boolean not null default false,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_attempts_student_id_idx on public.activity_attempts (student_id);
create index if not exists activity_attempts_type_idx on public.activity_attempts (activity_type);

alter table public.activity_attempts enable row level security;

drop policy if exists "Students can view their own attempts" on public.activity_attempts;
create policy "Students can view their own attempts"
  on public.activity_attempts for select
  using (auth.uid() = student_id);

drop policy if exists "Students can insert their own attempts" on public.activity_attempts;
create policy "Students can insert their own attempts"
  on public.activity_attempts for insert
  with check (auth.uid() = student_id);

drop policy if exists "Teachers can view attempts of their class students" on public.activity_attempts;
create policy "Teachers can view attempts of their class students"
  on public.activity_attempts for select
  using (
    exists (
      select 1 from public.class_members cm
      join public.classes c on c.id = cm.class_id
      where cm.student_id = activity_attempts.student_id
        and c.teacher_id = auth.uid()
    )
  );

-- ─── Achievements ────────────────────────────────────────────

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text not null,
  icon text not null default '🏆',
  xp_reward integer not null default 50,
  created_at timestamptz not null default now()
);

alter table public.achievements enable row level security;

drop policy if exists "Anyone can view achievements" on public.achievements;
create policy "Anyone can view achievements"
  on public.achievements for select
  using (true);

-- ─── Student achievements ────────────────────────────────────

create table if not exists public.student_achievements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (student_id, achievement_id)
);

alter table public.student_achievements enable row level security;

drop policy if exists "Students can view their own achievements" on public.student_achievements;
create policy "Students can view their own achievements"
  on public.student_achievements for select
  using (auth.uid() = student_id);

drop policy if exists "Students can earn achievements" on public.student_achievements;
create policy "Students can earn achievements"
  on public.student_achievements for insert
  with check (auth.uid() = student_id);

drop policy if exists "Teachers can view achievements of their class students" on public.student_achievements;
create policy "Teachers can view achievements of their class students"
  on public.student_achievements for select
  using (
    exists (
      select 1 from public.class_members cm
      join public.classes c on c.id = cm.class_id
      where cm.student_id = student_achievements.student_id
        and c.teacher_id = auth.uid()
    )
  );

-- ─── Assignments ─────────────────────────────────────────────

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  teacher_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null default '',
  activity_type text not null,
  subject text not null default 'General',
  difficulty text not null default 'medium',
  due_date timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists assignments_class_id_idx on public.assignments (class_id);

alter table public.assignments enable row level security;

drop policy if exists "Teachers can manage their own assignments" on public.assignments;
create policy "Teachers can manage their own assignments"
  on public.assignments for all
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

drop policy if exists "Students can view assignments for their classes" on public.assignments;
create policy "Students can view assignments for their classes"
  on public.assignments for select
  using (
    exists (
      select 1 from public.class_members cm
      where cm.class_id = assignments.class_id
        and cm.student_id = auth.uid()
    )
  );
-- ─── Seed: default achievements ──────────────────────────────

insert into public.achievements (key, name, description, icon, xp_reward) values
  ('first_prompt', 'First Prompt', 'Build your first optimized prompt', '✍️', 50),
  ('ai_detective', 'AI Detective', 'Find an error in AI-generated content', '🔍', 75),
  ('critical_thinker', 'Critical Thinker', 'Complete 5 critical thinking challenges', '🧠', 100),
  ('fact_checker', 'Fact Checker', 'Verify 10 AI-generated claims', '✅', 75),
  ('independent_solver', 'Independent Solver', 'Solve 3 problems without using hints', '💪', 150),
  ('streak_7', '7 Day Streak', 'Use the platform 7 days in a row', '🔥', 200),
  ('first_tutor_session', 'First Tutor Session', 'Complete your first AI tutor session', '🎓', 50),
  ('prompt_master', 'Prompt Master', 'Build 10 optimized prompts', '🎯', 100),
  ('skeptic', 'Healthy Skeptic', 'Run 5 fact checks on AI content', '🤔', 75),
  ('level_5', 'Rising Star', 'Reach level 5', '⭐', 250)
on conflict (key) do nothing;

-- ─── Trigger: create a profile on signup ─────────────────────
-- Runs as SECURITY DEFINER, so it is not blocked by the profiles RLS policies.
-- It reads `name` and `role` from the signup metadata the app sends.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, ''),
    case
      when new.raw_user_meta_data ->> 'role' = 'teacher' then 'teacher'
      else 'student'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Notes ───────────────────────────────────────────────────
-- 1. `ai_actions` from migration 002 is intentionally NOT created: it backed a
--    Supabase Edge Function (`ai-router`) that has been removed in favour of
--    the in-app provider layer under src/services/ai.
-- 2. Signup works only when this trigger exists. Without it, accounts are
--    created in auth.users but have no matching row in public.profiles, and
--    every page that reads a profile will behave as if the user is new.
-- 3. To let a teacher see their students, both the "Teachers can view profiles
--    of their class students" policy on profiles and the equivalent policies on
--    student_skills / activity_attempts / student_achievements must exist.
