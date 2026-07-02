-- Angel Digital 11+ — Migration 005
-- Angel Learning Intelligence (ALI) — Slice 1
-- Additive-only. Depends on migration 004 (subject_type enum values).
-- Creates the ALI content layer: ali_question_bank + the configurable
-- mastery-threshold defaults table (ALI_DECISION_LOG.md Decision 10).
-- Does not touch profiles / user_stats / lesson_progress.
-- Run this in: Supabase Dashboard > SQL Editor > New query

-- ============================================================
-- content_difficulty
-- Proficiency-facing difficulty label. NOT the same concept as the app's
-- existing year-group `Difficulty` type (types/index.ts) used by lessons/
-- vocab/writing/maths — deliberately a separate name to avoid collision.
-- See QUESTION_AUTHORING_STANDARD.md §1 / §4.
-- ============================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'content_difficulty') then
    create type public.content_difficulty as enum ('easy', 'medium', 'hard', 'challenge');
  end if;
end$$;

-- ============================================================
-- ali_mastery_defaults
-- Configurable mastery-threshold defaults by difficulty (Decision 10).
-- Read at question-import time, not hard-coded in application logic.
-- Changing a row here affects future imports/re-syncs only, not
-- already-imported questions.
-- ============================================================
create table if not exists public.ali_mastery_defaults (
  content_difficulty public.content_difficulty primary key,
  default_threshold  smallint not null check (default_threshold >= 1)
);

insert into public.ali_mastery_defaults (content_difficulty, default_threshold) values
  ('easy', 2),
  ('medium', 2),
  ('hard', 3),
  ('challenge', 3)
on conflict (content_difficulty) do nothing;

-- ============================================================
-- ali_question_bank
-- The shared question bank. `skill` is a fine-grained competency code
-- (e.g. 'vr.analogies', 'vr.letter-codes' — QUESTION_AUTHORING_STANDARD.md
-- §3), NOT the app's existing coarse SkillType value (which is uniformly
-- 'verbal-reasoning' for every VR question — see Decision 13). `prompt` is
-- jsonb because question shape genuinely varies by subject.
-- ============================================================
create table if not exists public.ali_question_bank (
  id                      text primary key,
  subject                 public.subject_type not null,
  skill                   text not null,
  pathway                 text[] not null,
  content_difficulty      public.content_difficulty not null,
  question_type           text not null default 'multiple-choice',
  estimated_time_seconds  integer not null default 45 check (estimated_time_seconds > 0),
  prompt                  jsonb not null,
  explanation             text not null,
  hint                    text,

  confidence_weight       numeric(3,2) not null default 1.00,
  learning_objective      text,
  revision_priority       smallint not null default 3 check (revision_priority between 1 and 5),
  mastery_threshold       smallint not null check (mastery_threshold >= 1),

  usage_count             integer not null default 0 check (usage_count >= 0),
  avg_success_rate        numeric(5,2),
  created_at              timestamptz not null default now()
);

create index if not exists ali_question_bank_lookup_idx
  on public.ali_question_bank (subject, skill, content_difficulty);

-- ============================================================
-- ROW LEVEL SECURITY
-- Disabled, matching the account-wide convention set in migration 001
-- (no auth yet). ali_question_bank is content, not user data, so RLS
-- matters less here than on the per-student tables in migration 006 —
-- disabled for consistency with the rest of the schema, not by oversight.
-- ============================================================
alter table public.ali_mastery_defaults disable row level security;
alter table public.ali_question_bank    disable row level security;
