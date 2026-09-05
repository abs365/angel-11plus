-- Angel Digital 11+ — Migration 229
-- Question Bank Telemetry Write-Path Restoration (Question Factory Wave 1,
-- Phase 10). Additive-only, no historical migration edited in place.
--
-- ============================================================
-- ROOT CAUSE (proven this session, see ANGEL_CONTENT_READINESS_GAP_
-- REGISTER.md's own "Addendum -- Phase 10" for the full evidence chain)
-- ============================================================
-- `lib/ali/history.ts`'s `recordOutcome()` is a real, correct, already-live
-- write path -- 23 real call sites, including the live Practice session
-- runner (`app/learning-intelligence/practice/[area]/page.tsx`) -- that
-- updates `ali_question_bank.usage_count`/`avg_success_rate` on every
-- answered question. It has been silently failing since migration 084:
-- that migration correctly closed an unauthorised-write security gap
-- (Decision 130, Gate 001 P1 #2 -- any authenticated user could otherwise
-- mutate question content directly) by enabling RLS with a SELECT-only
-- policy, but never anticipated that this table's own legitimate telemetry
-- write needed a narrow, separate allowance. An RLS-blocked UPDATE simply
-- matches zero rows -- Postgres/PostgREST raises no error for this -- so
-- `recordOutcome()`'s own correct "best-effort, never block the caller"
-- design had nothing to catch. This is why `usage_count = 0` and
-- `avg_success_rate = null` on all 351 live practice-eligible rows despite
-- real, sustained production Practice/Mock traffic.
--
-- ============================================================
-- THE FIX -- narrow, column-scoped, privacy-safe
-- ============================================================
-- Grants UPDATE on exactly two columns (`usage_count`, `avg_success_rate`)
-- -- both aggregate, non-learner-identifying, question-level rolling
-- averages, never a privacy-sensitive field. Every other column
-- (`prompt`, `answer`, `eligibility_status`, etc.) remains fully protected
-- by migration 084's own boundary -- this migration does NOT reopen the
-- arbitrary-content-mutation risk that migration 084 correctly closed.
--
-- The new UPDATE policy's USING/WITH CHECK predicate deliberately mirrors
-- the existing SELECT policy's own eligibility-status gate exactly, so a
-- learner can only bump telemetry on rows they could already see -- never
-- on sealed/Mock-reserved content. This preserves the Practice/Mock
-- firewall's own boundary for this new write path too, using the SAME
-- `is_current_user_admin()` escape hatch every other admin-gated policy in
-- this schema already relies on -- no new authorisation mechanism invented.
--
-- ============================================================
-- PRODUCTION SAFETY
-- ============================================================
-- - Purely additive: one GRANT, one new policy. No existing policy is
--   dropped or narrowed; the SELECT policy migration 084/100 already
--   established is completely untouched.
-- - No application code change is required or made by this migration --
--   `recordOutcome()`'s own write call is already correct and already
--   live; it simply starts succeeding once this policy exists.
-- - Verification is a single, already-proven-safe read-only anon-key
--   query (the same one that discovered the defect): a rising
--   `usage_count` on any previously-zero row after the next real Practice
--   answer is direct, immediate confirmation.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 070-228
-- (per this arc's own standing record) have already been applied.

begin;

grant update (usage_count, avg_success_rate) on public.ali_question_bank to authenticated;

drop policy if exists ali_question_bank_telemetry_update on public.ali_question_bank;
create policy ali_question_bank_telemetry_update
  on public.ali_question_bank
  for update
  to authenticated
  using (eligibility_status is distinct from 'mock_eligible' or public.is_current_user_admin())
  with check (eligibility_status is distinct from 'mock_eligible' or public.is_current_user_admin());

do $$
begin
  raise notice 'Migration 229: telemetry UPDATE grant + policy created. usage_count/avg_success_rate writes from recordOutcome() should now succeed on the next real Practice/Mock answer submission.';
end $$;

commit;
