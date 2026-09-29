-- ============================================================
-- Migration 003: conversation titles + full conversation lifecycle
--
-- The tutor needs conversations that can be listed, resumed, renamed and
-- deleted — not just an anonymous stream of messages. This adds a title and
-- the missing RLS policies. It is idempotent: safe to run repeatedly, and safe
-- to run on a project where schema.sql has already been applied.
--
-- Run in the Supabase SQL editor, or apply via `supabase db push`.
-- ============================================================

-- ─── Title, so a conversation can be recognised in a list ────

alter table public.ai_sessions
  add column if not exists title text not null default '';

-- Long titles are useless in a sidebar and cheap to avoid.
alter table public.ai_sessions
  drop constraint if exists ai_sessions_title_length;
alter table public.ai_sessions
  add constraint ai_sessions_title_length check (char_length(title) <= 120);

-- Listing a student's most recent conversations is the dashboard's hot path.
create index if not exists ai_sessions_student_updated_idx
  on public.ai_sessions (student_id, updated_at desc);

-- Backfill: an existing conversation is best titled by its first question.
update public.ai_sessions s
set title = coalesce(
  (
    select left(btrim(m.content), 100)
    from public.ai_session_messages m
    where m.session_id = s.id and m.role = 'user'
    order by m.created_at asc
    limit 1
  ),
  ''
)
where s.title = '';

-- ─── Missing lifecycle policies ──────────────────────────────

-- Students could create and update sessions but never remove them, so
-- "delete this conversation" was impossible at the database level.
drop policy if exists "Students can delete their own sessions" on public.ai_sessions;
create policy "Students can delete their own sessions"
  on public.ai_sessions for delete
  using (auth.uid() = student_id);

-- Deleting a conversation must take its messages with it. The foreign key
-- already cascades, but the messages table needs a delete policy for the
-- cascade to be permitted under RLS.
drop policy if exists "Students can delete messages of their sessions"
  on public.ai_session_messages;
create policy "Students can delete messages of their sessions"
  on public.ai_session_messages for delete
  using (
    exists (
      select 1 from public.ai_sessions s
      where s.id = ai_session_messages.session_id and s.student_id = auth.uid()
    )
  );

-- ─── message ordering ────────────────────────────────────────

-- Messages are read oldest-first within a conversation; without the tiebreaker
-- two messages saved in the same millisecond can swap order on reload.
create index if not exists ai_session_messages_session_created_idx
  on public.ai_session_messages (session_id, created_at asc, id asc);

-- ─── Keep updated_at honest ──────────────────────────────────

-- The session list sorts by recency, so updated_at must move whenever a
-- message is written. A trigger keeps that true no matter which code path
-- inserts the message.
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

-- New sessions should sort by their own creation time, not the epoch.
update public.ai_sessions set updated_at = created_at where updated_at is null;
