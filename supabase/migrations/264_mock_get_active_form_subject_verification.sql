-- 264_mock_get_active_form_subject_verification.sql
--
-- ************************************************************************
-- DO NOT APPLY. SUPERSEDED BY MIGRATION 265 (applied 2026-09-24).
-- This file was never applied to production. Running it now would DROP and
-- recreate mock_get_active_form() WITHOUT 265's full_mock fail-closed
-- guard. Its root-cause analysis below is also superseded: see
-- ANGEL_MOCK_SUBJECT_ROUTING_P0_CLOSURE_REPORT.md.
-- ************************************************************************
--
-- INCREMENT 3 CLOSURE BLOCKER — Mathematics Mock 1 starts the wrong
-- assessment (real Founder production evidence: clicking "Mathematics
-- Mock 1" reached a genuine "Mathematics Mock 1" pre-start screen, then
-- began an English assessment -- "Crossing the Atlantic: Sail and Steam",
-- Question 1 of 17).
--
-- ROOT-CAUSE INVESTIGATION, EXHAUSTIVE STATIC READ (this session, no live
-- database access available -- no service-role credential, no DB owner
-- connection):
--   - The client card (app/mocks/page.tsx) correctly links to
--     /learning-intelligence/mock-exam?subject=mathematics -- confirmed
--     both in the committed source and in the LIVE deployed JS bundle.
--   - getActiveMockForm()'s client wrapper (lib/mockAttempt/client.ts)
--     correctly threads p_subject through to the RPC call -- confirmed
--     both in source and in the live deployed bundle.
--   - mock_get_active_form()'s own SQL (migration 245's version, the
--     currently-live one -- no later migration redefines it) filters
--     `f.subject = p_subject` -- textually correct.
--   - first-mock-mathematics-v1's own subject column was set to
--     'mathematics' at INSERT time (migration 147) and independently
--     RE-VERIFIED, in the same transaction, by migration 249's own
--     postcondition check (its manifest length and active state were
--     confirmed unchanged immediately after english-full-mock-v1's own
--     activation).
--   - mock_create_cycle_attempt(), mock_get_resumable_attempt() and
--     mock_start_attempt() all correctly key every read/write off the
--     exact form_id/attempt_id passed to them -- none of them re-derive
--     "which form" independently.
--
-- Every individual piece, read in isolation against the committed
-- migration history, is provably correct. I cannot rule out a live-data
-- discrepancy from this environment (no read access to confirm
-- first-mock-mathematics-v1's CURRENT live subject value beyond what the
-- migration history establishes) or a client-side navigation-caching
-- interaction specific to this project's own Next.js version (this
-- environment's own AGENTS.md explicitly warns this version has breaking
-- changes from standard Next.js behaviour) -- neither is provable without
-- either a service-role database read or an authenticated live browser
-- session, both outside this session's standing access.
--
-- SMALLEST CORRECTION THAT RESTORES THE INVARIANT, regardless of the
-- exact live cause: mock_get_active_form() currently returns
-- (form_id, attempt_type, display_name) only -- the calling client has no
-- way to independently verify the form it actually got back is the
-- subject it actually asked for; it can only trust p_subject was honoured
-- silently. This migration is purely additive: it exposes the resolved
-- row's own `subject` column in the return set (already read internally
-- by the WHERE clause; now also selected and returned), changing no
-- filtering logic, no row selection, no other behaviour. The corresponding
-- client change (same commit) then REFUSES to create or resume any
-- attempt when the returned subject does not match the one requested,
-- turning a silent wrong-assessment start into a clear, safe, named
-- refusal -- "selected Mock -> correct assessment -> correct form ->
-- correct questions" becomes a structurally enforced invariant, not an
-- assumption, independent of whatever the underlying cause turns out to
-- be once the Founder can confirm live state.
--
-- Does not touch Mathematics Mock 1, Reading Comprehension Mock 1,
-- english-full-mock-v1, any attempt, any scoring/timing function, any
-- RLS policy, or migration 263's learner-PIN protection. Widens exactly
-- one function's own return shape.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, matching this repository's
-- standing Founder-applied-migration convention.

begin;

drop function if exists public.mock_get_active_form(text, text);

create function public.mock_get_active_form(p_attempt_type text, p_subject text default null)
returns table (form_id text, attempt_type text, subject text, display_name text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select f.id, f.attempt_type, f.subject, f.composition_provenance ->> 'displayName'
    from public.ali_mock_form f
    where f.active = true
      and f.attempt_type = p_attempt_type
      and (p_subject is null or f.subject = p_subject)
    order by f.created_at desc
    limit 1;
end;
$$;

revoke all on function public.mock_get_active_form(text, text) from public;
grant execute on function public.mock_get_active_form(text, text) to authenticated;
revoke execute on function public.mock_get_active_form(text, text) from anon;

commit;

-- ============================================================
-- POST-APPLICATION VERIFICATION (please run and share the result before
-- the Founder retest below -- this is the direct, authoritative answer to
-- "was the live data ever actually wrong")
-- ============================================================
-- select * from public.mock_get_active_form('full_mock', 'mathematics');
-- expect exactly one row: form_id = 'first-mock-mathematics-v1',
-- subject = 'mathematics'.
--
-- select * from public.mock_get_active_form('full_mock', 'english');
-- expect exactly one row: form_id = 'english-full-mock-v1',
-- subject = 'english'.
--
-- If either query returns the WRONG row (or the Mathematics query returns
-- the English form), that is direct, conclusive proof of the live-data
-- root cause this session could not access -- please report the exact
-- result back before further investigation, since it would point
-- directly at first-mock-mathematics-v1's own live subject column having
-- drifted from 'mathematics' at some point after migration 147/249.

-- ============================================================
-- MIGRATION SAFETY REVIEW
-- ============================================================
-- - Purely additive: one function's RETURNS TABLE widened by one column
--   (subject), which the function's own WHERE clause already reads
--   internally -- no new table access, no new computation, no filtering
--   change.
-- - Every existing caller (app/mocks/page.tsx's three calls, app/
--   learning-intelligence/mock-exam/sitting/page.tsx's two calls) is
--   source-compatible: PostgREST callers reading a subset of returned
--   columns are unaffected by extra columns being present.
-- - Grants unchanged (authenticated only, anon still revoked).
--
-- ============================================================
-- RLS REVIEW
-- ============================================================
-- No RLS policy created, altered, or referenced. ali_mock_form's own
-- policies (migration 071) are unchanged.
--
-- ============================================================
-- SECURITY REVIEW
-- ============================================================
-- No new trust boundary. subject was already read server-side by this
-- same function for its own WHERE clause; this migration only exposes
-- that already-computed value in the response.
--
-- ============================================================
-- BACKWARD COMPATIBILITY
-- ============================================================
-- Strictly additive. No existing caller's request shape changes (same
-- two parameters, same defaults). No existing caller breaks from
-- receiving one additional response column.
--
-- ============================================================
-- ROLLBACK
-- ============================================================
-- Re-apply migration 245's own mock_get_active_form(text, text) body
-- verbatim (reproduced in full in that migration's own §5) to drop the
-- `subject` column from the return shape. Safe at any time -- no other
-- object depends on the widened shape; the client-side verification this
-- migration enables would need to be reverted alongside it (same commit).
