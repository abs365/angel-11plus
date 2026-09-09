-- Angel Digital 11+ — Migration 247
-- CSSE Two-Paper Mock, Final Completion Pass Before Migration 245 —
-- the one additive claim primitive the Writing → Educational
-- Intelligence evidence adapter (§10 of the governing brief) needs.
--
-- ============================================================
-- WHY THIS EXISTS, AND WHY IT IS NOT MIGRATION 244's OWN CLAIM COLUMN
-- ============================================================
-- Migration 244's ei_evidence_ingested_at (on ali_mock_attempt_report)
-- is a PER-ATTEMPT claim, scoped to the binary correct/incorrect bridge
-- (lib/mockAttempt/evidenceIntegration.ts). The governing brief for this
-- pass explicitly forbids forcing Writing's qualitative, per-question
-- 5-dimension evidence through that same binary bridge/claim — a real
-- English full_mock attempt can carry BOTH Reading Comprehension
-- (binary) evidence and Continuous Writing (qualitative) evidence
-- together, and each must be ingested into Educational Intelligence
-- exactly once, INDEPENDENTLY of the other. Reusing migration 244's own
-- attempt-level claim for Writing too would mean whichever bridge runs
-- second for the same attempt is silently skipped — a real, avoidable
-- evidence-loss bug this migration exists to prevent.
--
-- ali_writing_assessment (migration 245) already has exactly the right
-- granularity: one row per (attempt_id, question_id). This migration
-- adds one nullable column to that same table, and one small,
-- SECURITY DEFINER claim function mirroring mock_claim_evidence_
-- ingestion()'s own exact atomic "claim then work" pattern (migration
-- 244) at question granularity instead of attempt granularity.
--
-- No mastery/recommendation logic here — this is purely the
-- idempotency guard. The actual evidence write (lib/mockAttempt/
-- writingEvidenceIntegration.ts, TypeScript, not SQL) reuses the SAME
-- shared recordPresentation()/recordOutcome() (lib/ali/history.ts)
-- every other evidence source already uses, always with
-- supportTier="supported" (Decision 60's own existing mastery-
-- quarantine mechanism, untouched, unmodified, reused exactly as
-- established) — never a new mastery model.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor, after migrations 245 and 246.

begin;

alter table public.ali_writing_assessment
  add column if not exists ei_evidence_ingested_at timestamptz;

comment on column public.ali_writing_assessment.ei_evidence_ingested_at is
  'Migration 247. Set once this Writing assessment''s evidence has been forwarded into ali_student_question_history via lib/mockAttempt/writingEvidenceIntegration.ts. Null until then. Set atomically by mock_claim_writing_evidence_ingestion() as a claim-then-work guard against retried/duplicate ingestion, at (attempt_id, question_id) granularity -- deliberately independent of migration 244''s own attempt-level ei_evidence_ingested_at (ali_mock_attempt_report), which governs only the separate binary correct/incorrect bridge.';

-- Owner-or-admin gated, matching mock_persist_writing_assessment()'s own
-- established pattern (migration 245) -- every real learner must be able
-- to trigger this for their own attempt automatically, not an admin-only
-- action.
create or replace function public.mock_claim_writing_evidence_ingestion(p_attempt_id uuid, p_question_id text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile_id uuid;
  v_row_count  int;
begin
  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();
  if v_profile_id is null then
    raise exception 'No profile found for the current caller';
  end if;

  if not exists (
    select 1 from public.ali_writing_assessment wa
    join public.ali_mock_attempt a on a.id = wa.attempt_id
    where wa.attempt_id = p_attempt_id
      and wa.question_id = p_question_id
      and (a.profile_id = v_profile_id or public.is_current_user_admin())
  ) then
    raise exception 'No writing assessment found for attempt %, question % owned by the current caller', p_attempt_id, p_question_id;
  end if;

  update public.ali_writing_assessment
  set ei_evidence_ingested_at = now()
  where attempt_id = p_attempt_id
    and question_id = p_question_id
    and ei_evidence_ingested_at is null;

  get diagnostics v_row_count = row_count;
  return v_row_count > 0;
end;
$$;

revoke all on function public.mock_claim_writing_evidence_ingestion(uuid, text) from public;
grant execute on function public.mock_claim_writing_evidence_ingestion(uuid, text) to authenticated;
revoke execute on function public.mock_claim_writing_evidence_ingestion(uuid, text) from anon;

commit;

-- ============================================================
-- MIGRATION SAFETY REVIEW
-- ============================================================
-- - One additive, nullable column on an existing (not-yet-applied)
--   table -- no existing row affected (the table has no live rows yet
--   either way).
-- - One new SECURITY DEFINER function, owner-or-admin gated, matching
--   an already-established precedent exactly. No RLS policy created or
--   altered (the function's own ownership check does the gating, same
--   as mock_persist_writing_assessment()).
-- - Cannot affect scoring, marks, timing, Mathematics, or any existing
--   evidence bridge -- migration 244's own ei_evidence_ingested_at
--   (ali_mock_attempt_report) is a different column on a different
--   table, untouched.
--
-- ============================================================
-- RLS REVIEW
-- ============================================================
-- No RLS policy change. ali_writing_assessment's existing select policy
-- (migration 245) already covers the new column automatically (a column
-- addition, not a new access path); the new function is the only write
-- path for this column, matching every other write path on this table.
--
-- ============================================================
-- BACKWARD COMPATIBILITY
-- ============================================================
-- Fully additive. No existing caller of mock_persist_writing_assessment()
-- or mock_review_writing_assessment() needs any change.
--
-- ============================================================
-- ROLLBACK
-- ============================================================
-- `drop function if exists public.mock_claim_writing_evidence_ingestion(uuid, text);`
-- `alter table public.ali_writing_assessment drop column if exists ei_evidence_ingested_at;`
-- Safe at any time -- no other object depends on either.
