-- Angel Digital 11+ — Migration 071
-- Programme Increment 008D, Post-Migration Security Hardening
-- Reconciliation — revised in place (never applied) after the Founder's
-- own authenticated catalogue evidence proved TWO findings, not one.
--
-- FINDING A (as originally disclosed): a bare, unauthenticated anon-key
-- call to each of the 5 SECURITY DEFINER functions reached real
-- application logic rather than a Postgres permission-denied error.
-- Confirmed directly by the Founder's own catalogue query:
-- information_schema.routine_privileges shows EXECUTE granted to anon,
-- authenticated, postgres, AND service_role on all 5 functions — a
-- Supabase project-level default-privilege grant migration 070's own
-- `revoke all ... from public` never reached (REVOKE FROM PUBLIC only
-- removes the PUBLIC pseudo-grant, never an explicit per-role grant made
-- via ALTER DEFAULT PRIVILEGES).
--
-- PRACTICAL IMPACT of Finding A, unchanged from the original disclosure:
-- auth.uid() is NULL for a bare anon-key request, so every function's
-- own identity-derivation step matches no profile and fails before
-- reaching any content or mutation. No anon caller can read a redacted
-- question, submit an answer, or mutate any attempt through this path.
-- A least-privilege gap, not a content-exposure or state-mutation defect.
--
-- FINDING B (new, correctly identified by the Founder's own review —
-- this session's original migration 070 design was wrong on this
-- specific point, disclosed plainly rather than minimised): the Founder's
-- catalogue evidence confirms `ali_mock_form_select_all` grants
-- `anon, authenticated` unconditional SELECT (`qual = true`) on
-- `ali_mock_form`. That table's `question_manifest` column is an ordered
-- array of real question_ids plus section mapping — the sealed form
-- structure itself. Migration 070's own reasoning ("forms carry no
-- question CONTENT themselves, only IDs, so the manifest alone does not
-- leak sealed content") was too narrow: knowing WHICH question IDs are
-- assigned to a sealed form, in what order, and how the form is
-- sectioned, is itself sealed assessment structure — exactly the kind of
-- thing an anti-memorisation/exposure-protection design must not let any
-- client enumerate ahead of a governed attempt. This was a real design
-- error in 008D's own first pass, not a new regression — corrected here
-- before it was ever applied to production.
--
-- FIX A: explicitly revoke execute from anon on all 5 functions, so the
-- Postgres permission layer itself rejects an anon caller before the
-- function body ever runs. authenticated retains execute — each
-- function's own internal ownership/state checks are the correct
-- enforcement point for a genuine learner, per this migration's own
-- design (008D). postgres/service_role are left untouched — the
-- applying/bypass roles, appropriately unrestricted per migration 070's
-- own relforcerowsecurity=false reasoning.
--
-- FIX B: drops `ali_mock_form_select_all` entirely. No replacement
-- SELECT policy is added for anon or authenticated -- ali_mock_form
-- becomes ADMIN/SERVER ONLY, via the pre-existing, unchanged
-- `ali_mock_form_admin_write` policy (`for all to authenticated using
-- (is_current_user_admin())`), mirroring `ali_passage_bank`'s own
-- established precedent (migration 054) exactly: "no matching policy for
-- a role/command = Postgres denies it by default." A learner never needs
-- direct ali_mock_form access — every piece of form-derived information
-- a learner legitimately needs (attempt_type, question-by-question
-- content) already flows through the 5 attempt functions, which return
-- attempt_type directly and deliver questions one at a time via
-- mock_get_question's own redacted projection. If a future increment
-- needs a learner-facing form title/duration display, the correct
-- pattern is extending an attempt function's own return value, never a
-- direct table grant -- named here for 008E/008F, not built.
--
-- Does NOT: change any table's columns; touch ali_mock_attempt or
-- ali_mock_attempt_answer's own ownership policies (unchanged, intact);
-- change any eligibility_status; touch ali_question_bank or
-- ali_passage_bank; remove ali_mock_form_admin_write (admin access to
-- forms, for content management, is preserved unchanged).
--
-- Idempotent: REVOKE and DROP POLICY IF EXISTS are both no-ops when
-- already absent.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

revoke execute on function public.mock_create_attempt(text, text) from anon;
revoke execute on function public.mock_start_attempt(uuid, integer) from anon;
revoke execute on function public.mock_get_question(uuid, text) from anon;
revoke execute on function public.mock_submit_answer(uuid, text, jsonb) from anon;
revoke execute on function public.mock_submit_attempt(uuid) from anon;

drop policy if exists ali_mock_form_select_all on public.ali_mock_form;
-- ali_mock_form_admin_write (migration 070, unchanged) remains the only
-- policy on this table: authenticated admins only, via
-- is_current_user_admin(). No SELECT policy exists for anon or ordinary
-- authenticated roles -- RLS enabled with no matching policy denies
-- those roles by default.

commit;
