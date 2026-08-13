-- Angel Digital 11+ — Migration 043
-- Educational Increment 007A — CSSE English Evidence and Scale Foundation,
-- Part 4/9/10: minimum production-grade passage entity.
--
-- Justification (not schema for convenience — see the Increment 007A
-- report's Part 9-10 for the full evidence trail): direct reading of
-- CSSE-002/003/005/008/009/010/013/014/015 (Level A, csse.org.uk,
-- Founder-Accepted) confirms every CSSE English paper is built around ONE
-- substantial licensed literary extract per sitting, with all 11-16
-- comprehension questions attaching to it. `EnglishComprehensionPrompt`
-- (types/ali/questionBank.ts) currently duplicates the full passage text
-- inside every question's own `prompt` JSONB — real, working, but a real
-- integrity risk once more than a handful of questions share a passage (an
-- edit must be applied N times), and there is nowhere for passage-level
-- metadata (genre, copyright, review state) to live except awkwardly
-- repeated per question.
--
-- Deliberately reuses `learning_unit_id` (migration-free convention
-- already live in ali_question_bank, already consumed by
-- lib/ali/learningUnit.ts's groupQuestionsByLearningUnit()) as this
-- table's primary key, rather than inventing a second identifier for the
-- same educational object — "do not introduce two competing identifiers
-- for the same object" (007A directive Part 4). No foreign key is added
-- from ali_question_bank.learning_unit_id to this table's id: that column
-- is shared across every subject (VR/Mathematics set it equal to their own
-- question id — types/ali/questionBank.ts's own docstring), so a table-
-- wide FK would incorrectly require every Mathematics/VR row to have a
-- passage_bank row. The relationship is a convention, exactly like
-- family_id, not a hard constraint — enforced at the application layer,
-- consistent with how ali_question_bank's own family_id has never had a
-- hard FK either.
--
-- Provenance and eligibility reuse the EXACT SAME check-constraint
-- vocabulary as ali_question_bank (migration 030) — 'angel_original',
-- 'generated_original', 'licensed', 'public_domain', 'authorised_import',
-- 'evidence_only' already cover the directive's requested EVIDENCE_ONLY /
-- ANGEL_ORIGINAL / LEGALLY_REPRODUCIBLE distinction (licensed/
-- public_domain/authorised_import are all legally-reproducible
-- categories) — no new enum vocabulary is invented. This is REUSE, not
-- extension: see the Increment 007A report's reuse/extend matrix.
--
-- Purely additive schema. No data is inserted by this migration — zero
-- passages are authored here, per the explicit "do not author the wave
-- yet" instruction. The 13 existing English rows and their duplicated
-- passage text are untouched; nothing currently live depends on this
-- table existing.
--
-- Run this in: Supabase Dashboard > SQL Editor > New query.

begin;

create table if not exists public.ali_passage_bank (
  id                  text primary key,  -- convention: equals the shared learning_unit_id of its questions
  title               text not null,
  original_text       text not null,
  text_type           text,              -- e.g. 'narrative-extract' — free text; CSSE's own format vocabulary not yet exhaustively catalogued (see 007A report Part 2, "variable patterns")
  genre               text,
  word_count          integer,
  reading_complexity  text,
  provenance          text,
  copyright_status    text,              -- free text (e.g. licence holder, "public domain", "angel original, unpublished") — distinct from provenance's coarse category
  pathway             text[] not null default '{}',
  content_difficulty  text,              -- reuses ali_question_bank's easy/medium/hard/challenge vocabulary by convention, not constrained here to avoid duplicating that check
  content_version     integer not null default 1 check (content_version >= 1),
  eligibility_status   text not null default 'provisional',
  active              boolean not null default true,
  passage_family_id   text,              -- groups structurally similar but textually distinct passages (e.g. "first-person narrative, mystery genre") — NOT the same as this table's own id, which groups only one passage's own questions
  review_state        text,              -- mirrors ali_family_review's decision vocabulary by convention; extending that table to accept a passage key is a separate, later step, not part of this migration
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'ali_passage_bank_provenance_check'
  ) then
    alter table public.ali_passage_bank
      add constraint ali_passage_bank_provenance_check
      check (provenance is null or provenance in (
        'angel_original', 'generated_original', 'licensed',
        'public_domain', 'authorised_import', 'evidence_only'
      ));
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'ali_passage_bank_eligibility_status_check'
  ) then
    alter table public.ali_passage_bank
      add constraint ali_passage_bank_eligibility_status_check
      check (eligibility_status in (
        'provisional', 'practice_eligible', 'authentic_assessment_candidate',
        'independently_validated', 'mock_eligible'
      ));
  end if;
end$$;

create index if not exists ali_passage_bank_family_idx
  on public.ali_passage_bank (passage_family_id) where passage_family_id is not null;

create index if not exists ali_passage_bank_eligibility_idx
  on public.ali_passage_bank (eligibility_status);

comment on table public.ali_passage_bank is
  'Educational Increment 007A. Canonical passage entity for Reading Comprehension, keyed by the pre-existing learning_unit_id convention (no second identifier). Passage-level provenance/eligibility gate every question that shares this passage''s id as their learning_unit_id — a passage marked evidence_only or provisional must never allow its questions into Practice even if an individual question row is mistagged, though this enforcement is application-layer (matching family_id), not a DB trigger, and is not yet wired since zero passages exist. Zero rows as of this migration.';

-- Evidence_only fail-closed, as an internal-governance table like
-- ali_family_review, not a learner-facing content table like
-- ali_question_bank (which stays open to the anon key for genuinely
-- eligible content). RLS decision deliberately deferred to the Founder
-- via Supabase Dashboard configuration, matching how ali_family_review's
-- own RLS state has already caused one real incident this closure when
-- assumed rather than verified — not set here to avoid repeating that
-- mistake in the opposite direction (silently assuming open access is
-- safe for governance data).

commit;
