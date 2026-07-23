-- Angel Digital 11+ — Migration 015
-- Phase 2A (Learning History persistence) + Phase 2B (Evidence Capture
-- Layer, facts only) of the Educational Intelligence Foundation mission,
-- per Founder's explicit scope decision: Phase 2A fully approved, Phase 2B
-- capped to directly observable per-attempt facts (no mistake-category
-- interpretation), Phase 2C (Learning Graph prerequisite edges) NOT
-- approved and not touched by this migration.
-- Additive-only. Depends on migrations 006 (ali_student_question_history)
-- and 010 (ali_educational_audit). Does not touch profiles / user_stats /
-- lesson_progress / ali_question_bank / ali_durable_mastery.
-- Run this in: Supabase Dashboard > SQL Editor > New query

-- ============================================================
-- ali_educational_audit.conclusion_value
-- EducationalAuditRecord (types/ali/audit.ts) has never had a field for
-- WHAT was concluded beyond confidence_tier_at_time — sufficient for
-- mastery/durable-mastery/wellbeing-veto, where the conclusion_type itself
-- carries the meaning, but not for 'readiness-dimension' (defined in the
-- conclusion_type enum since migration 010, never yet written by any code
-- path), which needs to record which ReadinessBand ("Well Evidenced" /
-- "Partially Evidenced" / "Not Yet Evidenced") was reached. Nullable,
-- optional for every existing conclusion_type — no backfill, matching
-- migration 009's addresses_misconception precedent for a field that is
-- only sometimes meaningful.
-- ============================================================
alter table public.ali_educational_audit
  add column if not exists conclusion_value text;

-- ============================================================
-- ali_student_question_history — Evidence Capture Layer (Phase 2B)
-- Directly observable per-attempt facts, following the exact precedent
-- already set by last_attempt_correct/second_last_attempt_correct
-- (migration 006): only the most recent attempt's facts are kept, not a
-- full per-attempt log table, since no caller of recordOutcome() has ever
-- needed history deeper than "the last one" for any existing mastery/
-- weak-skill computation this schema drives. Every column is nullable and
-- permanently optional — a caller that does not collect a given fact
-- (e.g. confidence rating, shown working) simply omits it, which is
-- recorded as null, never a fabricated default. These are facts, not
-- interpretations: no error-type/category/enum is introduced here — that
-- remains explicitly not-yet-approved (EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md
-- §11, reasoning_type/common_mistake still PROPOSED, not yet buildable).
-- ============================================================
alter table public.ali_student_question_history
  add column if not exists last_attempt_time_seconds integer check (last_attempt_time_seconds is null or last_attempt_time_seconds >= 0),
  add column if not exists last_attempt_skipped boolean,
  add column if not exists last_attempt_answer_changed boolean,
  add column if not exists last_attempt_first_answer text,
  add column if not exists last_attempt_final_answer text,
  add column if not exists last_attempt_confidence_rating smallint check (last_attempt_confidence_rating is null or last_attempt_confidence_rating between 1 and 5),
  add column if not exists last_attempt_working_shown boolean;

-- No RLS change: both tables already have RLS explicitly disabled
-- (migrations 006, 010) under the account-wide-state convention reaffirmed
-- as recently as migration 014; adding nullable columns does not alter
-- that posture.
