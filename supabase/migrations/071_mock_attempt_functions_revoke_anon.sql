-- Angel Digital 11+ — Migration 071
-- Programme Increment 008D, Post-Migration Production Verification —
-- hardening fix for a genuine, live-discovered finding.
--
-- FINDING: after migration 070 was applied, a bare, unauthenticated anon-
-- key call (no signInAnonymously(), no real learner session) to each of
-- the 5 SECURITY DEFINER functions reached real application logic
-- (e.g. "No profile found for the calling user") rather than a Postgres
-- permission-denied error. Migration 070's own intent, stated in its own
-- comments and tested structurally, was "authenticated only, never
-- anon" — this live behaviour suggests the `anon` role currently holds
-- an execute grant migration 070's `revoke all ... from public` did not
-- remove (a well-known Supabase/Postgres gotcha: ALTER DEFAULT PRIVILEGES
-- can grant EXECUTE to `anon`/`authenticated` explicitly, by role, not
-- via the PUBLIC pseudo-role, in which case `revoke all from public`
-- alone never touches it).
--
-- PRACTICAL IMPACT, disclosed precisely: this is NOT a bypass of the
-- core security property. auth.uid() is NULL for a bare anon-key
-- request, so every function's own identity-derivation step
-- (`select id into v_profile_id from public.profiles where
-- auth_user_id = auth.uid()`) matches no row for an anon caller, and
-- every function then fails at its own "no profile"/"attempt not found"
-- check before reaching any content or state mutation. No anon caller
-- can read a redacted question payload, submit an answer, or mutate any
-- attempt — confirmed directly, live, before this migration was written.
-- This is a defense-in-depth / least-privilege gap, not a content-
-- exposure or state-mutation defect.
--
-- FIX: explicitly revoke execute from anon on all 5 functions (in
-- addition to the existing `revoke all from public`), so the Postgres
-- permission layer itself rejects an anon caller before the function
-- body ever runs, matching migration 070's own original, stated intent
-- exactly.
--
-- Does NOT: change any table, RLS policy, or function body; change any
-- eligibility_status; touch ali_question_bank or ali_passage_bank.
--
-- Idempotent: REVOKE is itself idempotent (revoking a grant that does
-- not exist is a no-op, never an error).
--
-- NOT APPLIED by this increment. Generated for Founder review and manual
-- application via Supabase Dashboard > SQL Editor > New query, pending
-- confirmation via the Part D catalog query (008D Post-Migration
-- Production Verification Report) that anon does in fact hold an
-- execute grant on these functions today.

begin;

revoke execute on function public.mock_create_attempt(text, text) from anon;
revoke execute on function public.mock_start_attempt(uuid, integer) from anon;
revoke execute on function public.mock_get_question(uuid, text) from anon;
revoke execute on function public.mock_submit_answer(uuid, text, jsonb) from anon;
revoke execute on function public.mock_submit_attempt(uuid) from anon;

commit;
