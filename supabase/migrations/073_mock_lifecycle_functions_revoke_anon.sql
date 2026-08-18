-- Angel Digital 11+ — Migration 073
-- Programme Increment 008E — Security Correction: revoke anon EXECUTE
-- from the three new migration-072 functions.
--
-- ROOT CAUSE (Decision 94, confirmed at catalogue level by Founder-
-- supplied information_schema.routine_privileges evidence): migration
-- 072's own grant statements ("revoke all ... from public; grant execute
-- ... to authenticated;") reproduced exactly the pattern migration 070
-- originally used and Decision 89 found insufficient — a Supabase
-- project-level default-privilege grant to anon (made outside any
-- migration this repository controls) survives a bare "revoke ... from
-- public", because REVOKE FROM PUBLIC only removes the PUBLIC pseudo-
-- grant, never an explicit per-role grant. Migration 071 already fixed
-- this exact defect for the original 5 functions with an explicit
-- "revoke execute ... from anon" statement per function; migration 072
-- omitted the equivalent statement for its own 3 new functions. This
-- migration applies the identical, already-proven fix, and nothing else.
--
-- Founder-supplied catalogue evidence, verbatim, confirming the defect
-- before this fix:
--
--   routine_name              | grantee       | privilege_type
--   mock_get_active_form      | anon          | EXECUTE
--   mock_get_active_form      | authenticated | EXECUTE
--   mock_get_active_form      | postgres      | EXECUTE
--   mock_get_active_form      | service_role  | EXECUTE
--   mock_get_attempt_manifest | anon          | EXECUTE
--   mock_get_attempt_manifest | authenticated | EXECUTE
--   mock_get_attempt_manifest | postgres      | EXECUTE
--   mock_get_attempt_manifest | service_role  | EXECUTE
--   mock_set_flag             | anon          | EXECUTE
--   mock_set_flag             | authenticated | EXECUTE
--   mock_set_flag             | postgres      | EXECUTE
--   mock_set_flag             | service_role  | EXECUTE
--
-- Practical impact of the defect, precisely bounded (Decision 94):
-- mock_get_attempt_manifest and mock_set_flag both fail safely for an
-- anon caller today (their own profile_id = v_profile_id check finds no
-- match when auth.uid() is null). mock_get_active_form has no identity
-- check by design (a form's own id was reasoned to be non-sealed
-- information) and returns a clean, non-error, currently-empty response
-- to anon since no active Mock form exists. mock_create_attempt (the
-- actual gate on ever creating a real attempt, migration 070, correctly
-- authenticated-only and unaffected by this defect) means no attempt/
-- answer/flag/report content was ever reachable through this gap.
--
-- FIX: explicitly revoke execute from anon on all 3 functions, so the
-- Postgres permission layer itself rejects an anon caller before the
-- function body ever runs — the exact same enforcement point migration
-- 071 already established for the original 5 functions. authenticated
-- retains execute unchanged (each function's own internal ownership/
-- state checks remain the correct enforcement point for a genuine
-- learner, per this codebase's own established design). postgres/
-- service_role are left untouched.
--
-- SCOPE: permission correction only. Does NOT redefine any function
-- body. Does NOT touch any of the 5 proven 008D RPCs (mock_create_
-- attempt, mock_start_attempt, mock_get_question, mock_submit_answer,
-- mock_submit_attempt) or their grants. Does NOT touch ali_question_bank
-- RLS, ali_mock_form policies, ali_mock_attempt policies, ali_mock_
-- attempt_answer policies, ali_mock_attempt_flag policies, ali_mock_
-- attempt_report policies, the report-init trigger, eligibility_status,
-- Practice content, or mastery/evidence behaviour.
--
-- Idempotent: REVOKE is a no-op when the grant is already absent.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migration 072 has
-- already been applied (confirmed by the Founder).

begin;

revoke execute on function public.mock_get_active_form(text) from anon;
revoke execute on function public.mock_get_attempt_manifest(uuid) from anon;
revoke execute on function public.mock_set_flag(uuid, text, boolean) from anon;

commit;
