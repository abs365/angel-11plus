-- Angel Digital 11+ — Migration 229
-- Question Bank Telemetry Write-Path Restoration (Question Factory Wave 1
-- Phase 10, CORRECTED Wave 2 Section 1).
-- Additive-only, no historical migration edited in place.
--
-- ============================================================
-- CORRECTION HISTORY (unapplied migration corrected in place, per this
-- repository's own established convention — see migration 163's own
-- precedent, and this arc's own migration 227 canonical-mark-authority
-- correction)
-- ============================================================
-- Wave 1's original version of this migration granted raw, column-scoped
-- `UPDATE (usage_count, avg_success_rate)` to the `authenticated` role,
-- gated only by an RLS policy checking `eligibility_status`. The Wave 2
-- Migration Safety Gate correctly rejected this design: an RLS policy
-- gates WHICH ROWS a client may touch, never WHAT VALUE it writes. Any
-- authenticated client could have called the PostgREST REST API directly
-- (bypassing `recordOutcome()`'s own increment logic entirely) and set
-- `usage_count`/`avg_success_rate` to any arbitrary value on any
-- non-mock_eligible question row — corrupting shared telemetry for every
-- other learner, with no server-side validation that the write was a
-- genuine "+1 outcome," genuine "0-100 percentage," or came from a caller
-- who had ever actually attempted that question. This is exactly the
-- "arbitrary outcome write" the Wave 2 brief named as the risk to close,
-- not merely permit narrowly.
--
-- CORRECTED DESIGN: no raw table grant at all. A single, narrow,
-- SECURITY DEFINER RPC (`record_question_bank_telemetry`) is the only
-- path -- the exact same pattern this schema already uses for every other
-- learner-callable write (`mock_submit_answer`, migration 070): resolve
-- the caller's own `profiles.id` from `auth.uid()`, verify eligibility
-- server-side, and perform an atomic, server-computed update. The caller
-- supplies only `(question_id, is_correct)` -- a boolean, never a raw
-- number -- so no client input can ever set `usage_count` or
-- `avg_success_rate` to an arbitrary value. `ali_question_bank` itself
-- gets NO new grant and NO new UPDATE policy; it remains exactly as
-- locked down as migration 084 left it for every other column.
--
-- ============================================================
-- WHY THIS EXISTS (root cause, unchanged from the original analysis)
-- ============================================================
-- `lib/ali/history.ts`'s `recordOutcome()` is a real, correct, already-live
-- write path -- 23 real call sites, including the live Practice session
-- runner -- that has been silently failing since migration 084 enabled
-- RLS on `ali_question_bank` with a SELECT-only policy, never anticipating
-- this table's own legitimate telemetry write. An RLS-blocked UPDATE
-- matches zero rows without raising an error, so the code's own correct
-- "best-effort, never block the caller" design had nothing to catch. This
-- is why `usage_count = 0` and `avg_success_rate = null` on all 351 live
-- practice-eligible rows despite real, sustained production traffic.
--
-- ============================================================
-- LEGITIMACY CHECK -- "minimum legitimate authenticated/server-authorised
-- operation," per the Wave 2 brief's exact wording
-- ============================================================
-- The function requires a real, pre-existing `ali_student_question_history`
-- row for `(caller's own profile_id, p_question_id)` before it will touch
-- `ali_question_bank` at all. In the real application flow this row is
-- always created by `recordPresentation()` before `recordOutcome()` is
-- ever called (lib/ali/history.ts's own existing, unmodified call order) --
-- so a caller can only affect telemetry for a question genuinely presented
-- to them, never an arbitrary question id they merely guess. This is the
-- closest available proxy to "did this caller actually encounter this
-- question" without introducing a new event-log table this migration does
-- not need.
--
-- Atomicity: the update is a single SQL `UPDATE ... SET a = a + 1,
-- b = (...)` statement, where every reference to the pre-update column
-- values within one `SET` list resolves to the SAME snapshot (a real
-- PostgreSQL guarantee, not an application-level assumption) -- this is
-- also a genuine improvement over the current client-side fetch-then-write
-- pattern in `recordOutcome()`, which has an unaddressed (low-volume today,
-- real in principle) read-modify-write race window between two separate
-- round trips.
--
-- ============================================================
-- PRODUCTION SAFETY
-- ============================================================
-- - Purely additive: one new function, one new grant on that function.
--   Zero change to `ali_question_bank`'s own grants, RLS, or policies --
--   migration 084's boundary for every other column is untouched.
-- - `security definer` + `set search_path = public, pg_temp` (this
--   schema's own established safe-search-path convention).
-- - Fails closed: raises an exception (never a silent no-op) when the
--   caller has no matching profile or no matching history row, so a
--   misuse attempt is loud, not swallowed -- `lib/ali/history.ts`'s own
--   caller already treats any RPC error as best-effort/non-blocking, so
--   this does not change the learner-facing failure behaviour at all.
-- - No change to any Mock table, Mock function, or the family-model
--   migration (228).
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 070-228
-- (per this arc's own standing record) have already been applied.

begin;

create or replace function public.record_question_bank_telemetry(p_question_id text, p_is_correct boolean)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile_id uuid;
begin
  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();
  if v_profile_id is null then
    raise exception 'No profile found for the calling user';
  end if;

  -- Legitimacy check: the caller must have a real, existing history row
  -- for this exact question -- i.e. this question was genuinely presented
  -- to them by recordPresentation() at some point. Never bypassable by
  -- supplying an arbitrary question id.
  if not exists (
    select 1 from public.ali_student_question_history
    where profile_id = v_profile_id and question_id = p_question_id
  ) then
    raise exception 'No history row exists for caller and question % -- cannot record telemetry for a question never presented to this learner', p_question_id;
  end if;

  -- Server-computed, atomic update. The caller supplies only a boolean --
  -- no numeric input of any kind can reach usage_count/avg_success_rate.
  -- The eligibility_status check mirrors the table's own existing SELECT
  -- policy predicate, so telemetry can never be recorded against sealed/
  -- Mock-reserved content, preserving the Practice/Mock firewall's own
  -- boundary for this new write path too.
  update public.ali_question_bank
  set
    usage_count = usage_count + 1,
    avg_success_rate = round(
      ((coalesce(avg_success_rate, 0) * usage_count) + (case when p_is_correct then 100 else 0 end))
      / (usage_count + 1)::numeric,
      2
    )
  where id = p_question_id
    and (eligibility_status is distinct from 'mock_eligible' or public.is_current_user_admin());

  if not found then
    raise exception 'No practice_eligible question % found to record telemetry against (it may not exist, be inactive, or be sealed Mock content)', p_question_id;
  end if;
end;
$$;

grant execute on function public.record_question_bank_telemetry(text, boolean) to authenticated;

do $$
begin
  raise notice 'Migration 229 (corrected): record_question_bank_telemetry() created. No raw grant or RLS policy change was made to ali_question_bank itself.';
end $$;

commit;
