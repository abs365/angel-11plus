-- Angel Digital 11+ — Migration 006
-- Angel Learning Intelligence (ALI) — Slice 1
-- Additive-only. Depends on migration 005 (ali_question_bank).
-- Per-student adaptive state: the question-count cooldown sequence counter
-- (Decision 4) and the per-(student, question) history table mastery
-- tracking reads from (Decision 7). Does not touch profiles / user_stats /
-- lesson_progress.
-- Run this in: Supabase Dashboard > SQL Editor > New query

-- ============================================================
-- ali_student_adaptive_state
-- One row per profile. questions_presented_count is a monotonic counter,
-- incremented once per mock (by that mock's total question count, not
-- per-question) — see ADAPTIVE_ASSESSMENT_ENGINE_IMPLEMENTATION_PLAN.md §2.
-- Same one-row-per-profile upsert shape as the existing user_stats table
-- (migration 001), not a new convention.
-- ============================================================
create table if not exists public.ali_student_adaptive_state (
  profile_id                 uuid primary key references public.profiles(id) on delete cascade,
  questions_presented_count  integer not null default 0 check (questions_presented_count >= 0),
  updated_at                 timestamptz not null default now()
);

-- ============================================================
-- ali_student_question_history
-- One row per (profile, question) ever encountered. `source` is an open
-- string, not a closed enum — new ALI consumers (lessons, quizzes, daily
-- missions) can write here later without a migration to register a new
-- value (Decision 8 / ALI architecture direction).
--
-- last_presented_at is kept for display/debugging only — cooldown math
-- uses last_presented_at_sequence exclusively (question-count cooldown,
-- Decision 4), not calendar time.
--
-- Mastery evidence is session-based, not consecutive-attempt-based
-- (Decision 7): distinct_correct_sessions + last_correct_session_id let
-- lib/ali/mastery.ts detect genuinely distinct correct sessions rather
-- than just counting raw correct answers.
-- ============================================================
create table if not exists public.ali_student_question_history (
  id                           uuid primary key default gen_random_uuid(),
  profile_id                   uuid not null references public.profiles(id) on delete cascade,
  question_id                  text not null references public.ali_question_bank(id) on delete cascade,
  source                       text not null default 'adaptive_mock',
  times_seen                   integer not null default 0 check (times_seen >= 0),
  times_correct                integer not null default 0 check (times_correct >= 0),
  distinct_correct_sessions    integer not null default 0 check (distinct_correct_sessions >= 0),
  last_correct_session_id      text,
  last_presented_at            timestamptz not null default now(),
  last_presented_at_sequence   integer not null,
  -- last 2 outcomes, regardless of session — feeds the 'weak' mastery_state
  -- signal (lib/ali/mastery.ts) without needing a full per-attempt log table
  last_attempt_correct         boolean,
  second_last_attempt_correct  boolean,
  mastery_state                text not null default 'new',
  updated_at                   timestamptz not null default now(),
  constraint ali_student_question_history_unique unique (profile_id, question_id)
);

create index if not exists ali_student_question_history_profile_sequence_idx
  on public.ali_student_question_history (profile_id, last_presented_at_sequence desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- Disabled, matching the account-wide convention (migration 001) — no
-- auth-based policy layer exists yet for any table in this schema.
-- ============================================================
alter table public.ali_student_adaptive_state    disable row level security;
alter table public.ali_student_question_history  disable row level security;

-- ============================================================
-- updated_at triggers, reusing the existing set_updated_at() function
-- defined in migration 001 rather than redefining it.
-- ============================================================
drop trigger if exists ali_student_adaptive_state_updated_at on public.ali_student_adaptive_state;
create trigger ali_student_adaptive_state_updated_at
  before update on public.ali_student_adaptive_state
  for each row execute function public.set_updated_at();

drop trigger if exists ali_student_question_history_updated_at on public.ali_student_question_history;
create trigger ali_student_question_history_updated_at
  before update on public.ali_student_question_history
  for each row execute function public.set_updated_at();
