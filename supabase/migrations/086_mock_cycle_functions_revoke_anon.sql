-- Angel Digital 11+ — Migration 086
-- Mock Governance Architecture Increment 001, Security Correction
-- (Decision 136).
--
-- FORWARD-ONLY. Migration 085 (already applied to production per the
-- Founder) is NOT rewritten here. This migration corrects the
-- already-installed state, matching this project's own standing
-- "corrections are forward-only" convention (Decision 99/migration 075's
-- own precedent for the identical situation).
--
-- ROOT CAUSE, reconciled against the exact proven project precedent
-- (migrations 071 and 073, Decisions 89/91 and 94/96 — the same defect
-- class, now confirmed a third time): `revoke all on function ... from
-- public` only removes the PUBLIC pseudo-role's grant. It does not touch
-- an explicit per-role grant this Supabase project makes via its own
-- `ALTER DEFAULT PRIVILEGES ... GRANT EXECUTE ... TO anon, authenticated`
-- configuration, which fires automatically on every newly created
-- function in the public schema — exactly migration 071's own header
-- comment already documented this project's own root cause to be, the
-- first time this was found. Migration 085's 4 new functions
-- (mock_cycle_is_open, mock_start_new_cycle, mock_authorise_extra_cycle,
-- mock_create_cycle_attempt) each used only `revoke all ... from public`
-- + `grant execute ... to authenticated` — sufficient to grant
-- authenticated correctly, insufficient to remove the separate,
-- project-default anon grant. Confirmed live in production by the
-- Founder's own authenticated `information_schema.routine_privileges`
-- query: all 4 functions show EXECUTE for anon, authenticated, postgres,
-- and service_role.
--
-- CORRECTION: explicit `revoke execute ... from anon` on all 4 functions,
-- using their exact deployed signatures from migration 085 — the same
-- fix pattern migrations 071 and 073 already established and proved.
--
-- mock_cycle_is_open's own intended privilege model, per Decision 135:
-- "granted to no role at all... called only from within this migration's
-- own other SECURITY DEFINER functions, which run with their owning
-- role's own implicit privilege over its own objects." Migration 085's
-- own text never granted it to authenticated (only `revoke all ... from
-- public`), so the Founder's catalogue evidence showing authenticated
-- WITH execute on this function is the same project-default-privilege
-- leak, not a deliberate widening anyone intended. This migration
-- therefore revokes execute from BOTH anon AND authenticated on
-- mock_cycle_is_open — the only one of the 4 functions corrected this
-- way — restoring Decision 135's own stated design rather than merely
-- matching the other three functions' pattern for consistency's own sake.
-- The three functions that call it internally (mock_start_new_cycle,
-- mock_authorise_extra_cycle, mock_create_cycle_attempt, all owned by the
-- same applying role) are unaffected by this — owner-implicit privilege
-- over one's own objects does not depend on any GRANT, exactly as
-- migration 075's mock_attempt_report_init() already proved when it calls
-- the execute-revoked mock_score_attempt() internally.
--
-- Does NOT: redefine any function body (no `create or replace function`
-- anywhere in this file); touch any table, column, or RLS policy; touch
-- Mock cycle/cadence semantics (unchanged from migration 085); touch
-- scoring, reporting, or form logic; touch mock_create_attempt or any of
-- the 8 proven 070/072/074/075 functions (not mentioned below at all);
-- create or activate any Mock content or form; change mock_eligible or
-- learner-facing Mock availability in any way.
--
-- postgres/service_role are left untouched throughout — the
-- applying/bypass roles, appropriately unrestricted, matching migration
-- 070's own relforcerowsecurity=false reasoning and migrations 071/073's
-- own precedent of never touching them.
--
-- Idempotent: REVOKE is a no-op when the grant is already absent.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migration 085 has
-- already been applied (confirmed by the Founder; this is the correction
-- that same application requires).

begin;

-- The 3 intended authenticated-only APIs (migration 085): anon execute
-- removed explicitly; authenticated retains execute (already correctly
-- granted by migration 085's own `grant execute ... to authenticated`,
-- unchanged and untouched here).
revoke execute on function public.mock_start_new_cycle() from anon;
revoke execute on function public.mock_authorise_extra_cycle() from anon;
revoke execute on function public.mock_create_cycle_attempt(text, uuid) from anon;

-- The internal helper (migration 085, Decision 135): "granted to no role
-- at all" was the stated design. Corrects both the anon leak and the
-- authenticated leak in one statement each, restoring that design exactly
-- rather than widening it to match the other three functions.
revoke execute on function public.mock_cycle_is_open(uuid) from anon;
revoke execute on function public.mock_cycle_is_open(uuid) from authenticated;

commit;
