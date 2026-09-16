-- Angel Digital 11+ — Migration 253
-- CSSE Two-Paper Mock P1 Repair, recovery-path defect — the smallest fix
-- for the second production-confirmed defect blocking the English
-- acceptance attempt's Writing assessment recovery.
--
-- ============================================================
-- ROOT CAUSE (proven by production runtime log inspection this session,
-- not inferred -- POST /api/mock-writing-assessment returned 404 for a
-- genuinely eligible, correctly-authenticated, correctly-owned request)
-- ============================================================
-- app/api/mock-writing-assessment/route.ts identifies which of the
-- caller's own Writing questions are still pending assessment by reading
-- public.ali_mock_attempt_report directly through the caller's own
-- forwarded, RLS-scoped session:
--   select question_outcomes from ali_mock_attempt_report
--   where attempt_id = :attemptId
-- But ali_mock_attempt_report's own SELECT policy
-- (ali_mock_attempt_report_select_released, migration 072) is scoped to
-- "owner AND released" -- report_release_state must already be
-- 'released' before the owner can see this row at all. This route exists
-- specifically to help an attempt REACH a releasable state (scoring_
-- state='scored' requires Writing assessment to have already run, per
-- migration 251's own completion contract) -- so for every unreleased
-- attempt, exactly the case this route is meant to serve, the read
-- returns zero rows, and the route correctly (per its own code) but
-- wrongly (per its own purpose) returns 404 "report_not_available"
-- before ever reaching mock_persist_writing_assessment() or OpenAI.
-- This is the same class of gap disclosed in migration 251's own header
-- as GAP 3 (the release/assessment ordering deadlock) -- GAP 3 fixed
-- WHEN the client asks; this migration fixes WHAT the client is allowed
-- to read when it asks.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES
-- ============================================================
-- Adds ONE new, narrow, read-only SECURITY DEFINER function,
-- mock_get_pending_writing_question_ids(p_attempt_id), mirroring this
-- codebase's own established convention for every other owner-scoped
-- privileged read (mock_get_question(), mock_start_attempt(), etc.):
-- verifies the caller owns the attempt via profile_id = auth.uid()'s own
-- resolved profile (never RLS), then returns exactly the question ids
-- from question_outcomes whose status is 'requires_manual_marking' AND
-- whose ali_question_bank.subject is 'writing' -- nothing else from the
-- report row (not scoring_state, not other outcomes, not overall) is
-- ever exposed pre-release by this function.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch ali_mock_attempt_report's own RLS policy in any way --
-- a direct table read remains exactly as gated as it is today; this is a
-- new, additive, narrowly-scoped function, not a relaxation. Does not
-- touch mock_persist_writing_assessment(), mock_check_and_complete_
-- scoring(), mock_release_report(), mock_apply_manual_mark(), or any
-- Reading/Mathematics scoring function. Does not expose any Reading
-- (non-writing) pending item, any already-resolved outcome, or any
-- scoring/analysis/release state. Does not create a second recovery
-- architecture -- the route's own existing write path (mock_persist_
-- writing_assessment(), migration 245) is completely unchanged; this
-- migration only fixes what the route may read beforehand to know which
-- questions to assess.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 250, 251
-- and 252 (this same repair arc) have already been applied.

begin;

create or replace function public.mock_get_pending_writing_question_ids(p_attempt_id uuid)
returns text[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_attempt public.ali_mock_attempt;
  v_report public.ali_mock_attempt_report;
  v_outcome jsonb;
  v_question_id text;
  v_ids text[] := array[]::text[];
begin
  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();
  if v_profile_id is null then
    raise exception 'No profile found for the current caller';
  end if;

  select * into v_attempt from public.ali_mock_attempt
    where id = p_attempt_id and profile_id = v_profile_id;
  if not found then
    raise exception 'Attempt % not found for caller', p_attempt_id;
  end if;

  select * into v_report from public.ali_mock_attempt_report where attempt_id = p_attempt_id;
  if not found then
    return v_ids;
  end if;

  for v_outcome in select * from jsonb_array_elements(coalesce(v_report.question_outcomes, '[]'::jsonb))
  loop
    if (v_outcome ->> 'status') = 'requires_manual_marking' then
      v_question_id := v_outcome ->> 'questionId';
      if exists (
        select 1 from public.ali_question_bank b
        where b.id = v_question_id and b.subject = 'writing'
      ) then
        v_ids := v_ids || v_question_id;
      end if;
    end if;
  end loop;

  return v_ids;
end;
$$;

revoke all on function public.mock_get_pending_writing_question_ids(uuid) from public;
grant execute on function public.mock_get_pending_writing_question_ids(uuid) to authenticated;
revoke execute on function public.mock_get_pending_writing_question_ids(uuid) from anon;

commit;

-- Read-only verification (run before and after applying):
--
-- select pg_get_functiondef('public.mock_get_pending_writing_question_ids(uuid)'::regprocedure);
--
-- Expected AFTER applying: the function exists, is SECURITY DEFINER, and
-- its body contains both "profile_id = auth.uid()" ownership resolution
-- (via v_profile_id) and the "status') = 'requires_manual_marking'" /
-- "subject = 'writing'" filter.
