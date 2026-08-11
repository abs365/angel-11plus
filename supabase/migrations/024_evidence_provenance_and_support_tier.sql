-- Angel Digital 11+ — Migration 024
-- Mathematics Reference Vertical Remediation Gate — Evidence Provenance +
-- Guided-Learning Support Tier. Additive-only. Depends on migration 006
-- (ali_student_question_history). Does not touch profiles / user_stats /
-- lesson_progress / ali_question_bank / ali_durable_mastery.
-- Run this in: Supabase Dashboard > SQL Editor > New query

-- ============================================================
-- ali_student_question_history.first_source
-- Root cause (EVIDENCE_PROVENANCE_ROOT_CAUSE_REPORT.md): `source` (migration
-- 006, Decision 8) was always designed to mean "the most recent presentation
-- context" — it is read nowhere downstream for scoring and correctly drives
-- last_presented_at/last_presented_at_sequence cooldown display. It was never
-- designed to answer "what context first introduced this question to this
-- learner," and a later, unrelated presentation legitimately overwriting it
-- is not a defect in that field. `first_source` is a new, separate,
-- write-once fact: set only when the row does not already have one, by
-- recordPresentation(). It is never overwritten afterwards, so a later
-- Practice presentation cannot rewrite an earlier Learn or Founder Validation
-- event's history. Nullable — existing rows have no first_source and are
-- correctly left null (their true first context cannot be reconstructed; see
-- EVIDENCE_PROVENANCE_REMEDIATION_REPORT.md "historical records" section —
-- this migration does not fabricate one).
-- ============================================================
alter table public.ali_student_question_history
  add column if not exists first_source text;

-- ============================================================
-- ali_student_question_history.last_attempt_support_tier
-- Guided Learning Remediation (GUIDED_LEARNING_REMEDIATION_REPORT.md):
-- recordOutcome() gains an optional supportTier fact ("independent" |
-- "supported"), following the exact Evidence Capture Layer precedent
-- (migration 015): a directly-known fact about how THIS specific attempt was
-- produced, not an interpreted mistake-category (that remains explicitly
-- not-yet-approved per EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md §11, untouched
-- by this migration). Every existing caller omits it and behaves exactly as
-- before. lib/ali/mastery.ts's applyAttemptOutcome() uses this fact so that
-- a correct answer produced only after guided remediation does not, by
-- itself, advance distinct-session mastery evidence the same way a genuine
-- first-attempt independent answer does.
-- ============================================================
alter table public.ali_student_question_history
  add column if not exists last_attempt_support_tier text
    check (last_attempt_support_tier is null or last_attempt_support_tier in ('independent', 'supported'));

-- No RLS change: table already has RLS explicitly disabled (migration 006)
-- under the account-wide-state convention; adding nullable columns does not
-- alter that.
