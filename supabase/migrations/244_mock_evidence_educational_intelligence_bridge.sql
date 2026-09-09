-- Angel Digital 11+ — Migration 244
-- Mock → Educational Intelligence Evidence Bridge (bounded wiring only).
--
-- ============================================================
-- WHY THIS EXISTS
-- ============================================================
-- Production verification (ANGEL_ADAPTIVE_LEARNING_LOOP_PRODUCTION_
-- VERIFICATION_REPORT.md) found the adaptive learning loop genuinely
-- operational for Practice/Teaching evidence, but Mock/Assessment
-- evidence never reaches it: ASSESS -> ANALYSE -> STOP. This migration
-- adds the ONE piece of new schema surface a safe, idempotent bridge
-- needs -- a completion marker on the report row itself -- plus the one
-- new SECURITY DEFINER function that atomically claims it. All actual
-- classification and evidence-writing happens in TypeScript, reusing
-- lib/mockAttempt/evidenceAdapter.ts's classifyMockEvidence() (untouched)
-- and lib/ali/history.ts's recordPresentation()/recordOutcome() (already
-- the shared evidence-persistence path every Practice/lesson caller
-- uses, untouched). This migration adds zero new engine, zero new
-- mastery model, zero new recommendation logic.
--
-- Root-cause correction to a stale comment: lib/mockAttempt/
-- evidenceAdapter.ts's own header claims "ali_student_question_history
-- has NO evidence-provenance column" and that writing through it would
-- "silently contaminate" Practice evidence. Both claims are false against
-- the live schema: migration 006 already documents `source` as "an open
-- string, not a closed enum -- new ALI consumers can write here later
-- without a migration to register a new value" (its own default value is
-- even 'adaptive_mock'), and 5 distinct source values already coexist in
-- production (learning_independent, learning_guided, practice_experience,
-- family_choice_pilot, founder_validation_assessment). No provenance
-- schema change is needed at all -- "mock" is simply one more legitimate
-- value of an already-open column, exactly as migration 006 intended.
--
-- ============================================================
-- WHY A NEW COLUMN, NOT A NEW TABLE
-- ============================================================
-- lib/ali/history.ts's recordOutcome()/applyAttemptOutcome() are not
-- naturally idempotent against a REPLAYED call for the same question:
-- times_seen/times_correct increment unconditionally on every call
-- (lib/ali/mastery.ts:51-52), unlike distinct_correct_sessions (which is
-- already correctly guarded by session id). Every existing caller has
-- only ever invoked recordOutcome() exactly once per genuine learner
-- action, so this has never mattered before. This integration is
-- explicitly required to survive retried analysis, retried report
-- generation, page refreshes, and repeated background invocation (the
-- Founder's own §4) -- so an idempotency gate is required OUTSIDE
-- recordOutcome() itself, not a change to that shared primitive (which
-- would affect every existing caller system-wide, outside this bounded
-- increment's scope).
--
-- `ali_mock_attempt_report.attempt_id` is already the primary key -- one
-- row per attempt, exactly the granularity the Founder's own idempotency
-- key (learner + mock attempt) needs. Adding one nullable timestamp
-- column here is smaller and more coherent than a separate ledger table,
-- and keeps the marker colocated with the exact row it describes.
--
-- ============================================================
-- DISCLOSED, ACCEPTED LIMITATION
-- ============================================================
-- The claim is set atomically at the START (before any evidence is
-- written), not as a two-phase claim/complete pair: `mock_claim_
-- evidence_ingestion()` sets ei_evidence_ingested_at = now() in the same
-- statement that verifies it was previously null, and only THEN does the
-- TypeScript caller proceed to classify and write evidence. This
-- correctly and safely handles every retry scenario the Founder's §4
-- names (a completed/failed run retried later, a page refresh, two
-- near-simultaneous invocations -- only one caller ever observes a
-- successful claim). It does NOT protect against the narrower case of
-- the calling process crashing between a successful claim and the last
-- recordOutcome() call completing, which would leave the attempt marked
-- ingested with partially-written evidence. This is judged acceptable
-- for a first, bounded increment: the trigger point (a learner viewing
-- their own already-fully-computed, static, released report) has no
-- external I/O dependency that could hang mid-way under normal
-- operation, and recordOutcome()/recordPresentation() are the same
-- primitives already proven reliable across months of Practice/lesson
-- production traffic. A genuine two-phase commit would require either a
-- service-role transaction (no SUPABASE_SERVICE_ROLE_KEY exists in this
-- deployment, confirmed by evidenceAdapter.ts's own prior comment) or
-- reimplementing recordOutcome()'s logic inside a single SQL function
-- (duplicating classification/persistence logic, explicitly forbidden by
-- this increment's own brief). Recovery from the rare crash case is a
-- manual admin action (null the column back out) — not automated here.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor, after migrations 070-243 (per this
-- arc's own standing record) have already been applied.

begin;

-- ============================================================
-- 1. Idempotency marker
-- ============================================================
alter table public.ali_mock_attempt_report
  add column if not exists ei_evidence_ingested_at timestamptz;

comment on column public.ali_mock_attempt_report.ei_evidence_ingested_at is
  'Set once this attempt''s classified Mock evidence has been forwarded into ali_student_question_history/ali_durable_mastery via lib/mockAttempt/evidenceIntegration.ts. Null until then. Set atomically by mock_claim_evidence_ingestion() as a claim-then-work guard against retried/duplicate ingestion — see migration 244''s own header for the disclosed limitation this does not cover.';

-- ============================================================
-- 2. mock_claim_evidence_ingestion() — the one new write path
-- ============================================================
-- Admin-or-owner gated, matching mock_apply_manual_mark()'s own
-- established convention (migration 227: `profile_id = v_profile_id or
-- public.is_current_user_admin()`). Fails closed (raises) if the report
-- is not released or not fully scored — evidence must never be derived
-- from a sealed or partially-scored report. Returns true exactly once
-- per attempt (the caller that successfully claims it); every subsequent
-- call for the same attempt returns false, never re-claiming or
-- re-raising. A caller receiving false must treat this as "already
-- ingested, no-op" — not an error.
create or replace function public.mock_claim_evidence_ingestion(p_attempt_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile_id uuid;
  v_attempt public.ali_mock_attempt;
  v_report public.ali_mock_attempt_report;
  v_claimed boolean;
begin
  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();
  if v_profile_id is null then
    raise exception 'No profile found for the current caller';
  end if;

  select * into v_attempt from public.ali_mock_attempt where id = p_attempt_id;
  if not found then
    raise exception 'Attempt % not found', p_attempt_id;
  end if;
  if not (v_attempt.profile_id = v_profile_id or public.is_current_user_admin()) then
    raise exception 'Attempt % does not belong to the current caller', p_attempt_id;
  end if;

  select * into v_report from public.ali_mock_attempt_report where attempt_id = p_attempt_id;
  if not found then
    raise exception 'No report row exists for attempt %', p_attempt_id;
  end if;
  if v_report.report_release_state <> 'released' then
    raise exception 'Attempt % report is not released (report_release_state=%) -- refusing to derive evidence from a sealed report', p_attempt_id, v_report.report_release_state;
  end if;
  if v_report.scoring_state <> 'scored' then
    raise exception 'Attempt % report is not fully scored (scoring_state=%) -- refusing to derive evidence from an incomplete score', p_attempt_id, v_report.scoring_state;
  end if;

  update public.ali_mock_attempt_report
  set ei_evidence_ingested_at = now()
  where attempt_id = p_attempt_id
    and ei_evidence_ingested_at is null
  returning true into v_claimed;

  return coalesce(v_claimed, false);
end;
$$;

revoke all on function public.mock_claim_evidence_ingestion(uuid) from public;
grant execute on function public.mock_claim_evidence_ingestion(uuid) to authenticated;
revoke execute on function public.mock_claim_evidence_ingestion(uuid) from anon;

commit;

-- ============================================================
-- MIGRATION SAFETY REVIEW
-- ============================================================
-- - One additive, nullable column on an existing table (no default, no
--   backfill, no existing row's meaning changes: every pre-existing
--   released report simply has ei_evidence_ingested_at = null until a
--   learner next views it).
-- - One new function, admin-or-owner gated exactly like the established
--   mock_apply_manual_mark() pattern, security definer, safe search_path.
-- - No existing function, trigger, table, or RLS policy is altered.
-- - Cannot affect Mock scoring, marking, released report content,
--   question content, timing, or assessment conditions in any way — it
--   only ever reads report state to validate the claim and writes to one
--   new, previously-nonexistent column.
-- - Idempotent to re-run: `add column if not exists` and `create or
--   replace function` are both naturally idempotent.
--
-- ============================================================
-- RLS REVIEW
-- ============================================================
-- No RLS policy is created, dropped, or altered. ali_mock_attempt_report
-- already has no insert/update/delete policy for authenticated/anon
-- (migration 072's own comment: "every row is created by the trigger...
-- and would be mutated only by a future scoring/analysis pipeline's own
-- SECURITY DEFINER function(s)") — this migration is exactly that
-- anticipated future function, not a relaxation of the sealed-until-
-- released read policy.
--
-- ============================================================
-- SECURITY REVIEW
-- ============================================================
-- mock_claim_evidence_ingestion() never returns report content — only a
-- boolean. It re-derives the caller's own profile from auth.uid() (never
-- trusts a caller-supplied profile id), and re-validates ownership,
-- release state, and scoring state itself rather than trusting anything
-- the caller claims. No new trust boundary is crossed: the same
-- ownership-or-admin check every comparable Mock write function
-- (mock_apply_manual_mark, mock_release_report) already uses.
--
-- ============================================================
-- BACKWARD COMPATIBILITY
-- ============================================================
-- Every existing Mock function's signature and behaviour is completely
-- unchanged. mock_get_attempt_report's caller (lib/mockAttempt/client.ts
-- getMockAttemptReport()) already does `select *`, so it will begin
-- returning one additional column; TypeScript callers that map named
-- fields explicitly (as that function does) are unaffected until the
-- MockAttemptReport type is deliberately extended to read it.
--
-- ============================================================
-- ROLLBACK
-- ============================================================
-- `drop function if exists public.mock_claim_evidence_ingestion(uuid);`
-- `alter table public.ali_mock_attempt_report drop column if exists ei_evidence_ingested_at;`
-- Safe at any time — no other object depends on either.
