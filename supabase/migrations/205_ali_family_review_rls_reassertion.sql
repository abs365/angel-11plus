-- Angel Digital 11+ — Migration 205
-- RLS Reassertion for public.ali_family_review — conditional, diagnostic-
-- gated correction, prompted by the Supabase SQL Editor's own warning
-- when the Founder attempted to run migration 201.
--
-- ============================================================
-- DO NOT APPLY THIS MIGRATION UNTIL THE DIAGNOSTIC QUERY BELOW CONFIRMS
-- IT IS NEEDED. See the accompanying investigation report for the exact
-- diagnostic (a trivial, read-only pg_class/pg_policies check).
-- ============================================================
--
-- WHAT THIS MIGRATION IS: an EXACT, idempotent re-application of
-- migration 054's own two statements for this one table only --
-- `alter table ... enable row level security` plus its 2 admin-gated
-- policies (select, insert; no update/delete policy, matching migration
-- 054's own deliberate design). Nothing here is new schema, a new policy
-- shape, or a broadened grant -- it is the SAME statements migration 054
-- already specified, made safely re-runnable. `ali_passage_bank` (also
-- touched by migration 054) is deliberately OUT OF SCOPE here -- this
-- migration corrects exactly the one table the live warning named, not a
-- broader sweep.
--
-- WHY THIS MIGRATION EXISTS RATHER THAN CLICKING "RUN AND ENABLE RLS" IN
-- THE DASHBOARD DIALOG: that action is not a reviewed, documented
-- migration -- this codebase's own established discipline (every schema/
-- security change is a numbered, committed, reasoned migration file,
-- migration 054's own header: "a deliberate, disclosed architectural
-- change, not a silent side effect") would be broken by accepting an
-- opaque, UI-driven schema action instead. This migration keeps the
-- correction inside that same discipline, and its exact policy shape
-- inside our own control, not a wizard's default.
--
-- ============================================================
-- SAFETY
-- ============================================================
-- `enable row level security` is idempotent (a no-op if already enabled).
-- `drop policy if exists` before each `create policy` is idempotent
-- (matching migration 054/008's own established convention). Adds
-- exactly the same 2 policies migration 054 already specified -- SELECT
-- and INSERT, both `to authenticated`, both gated by
-- `public.is_current_user_admin()` -- no UPDATE/DELETE policy (so, with
-- RLS enabled and no matching policy, Postgres denies those to every
-- role by default, unchanged from migration 054's own intent). Does not
-- touch any row, any other table, or any other column. Does not alter
-- `is_current_user_admin()` itself.
--
-- NOT APPLIED. Apply ONLY if the diagnostic query confirms
-- ali_family_review currently has row level security disabled. If the
-- diagnostic instead confirms RLS is already enabled with these same 2
-- policies present, this migration is unnecessary — do not apply it, the
-- live warning was very likely a stale Supabase Studio linter notice, not
-- a real gap.

begin;

alter table public.ali_family_review enable row level security;

drop policy if exists ali_family_review_select_admin on public.ali_family_review;
create policy ali_family_review_select_admin
  on public.ali_family_review for select to authenticated
  using (public.is_current_user_admin());

drop policy if exists ali_family_review_insert_admin on public.ali_family_review;
create policy ali_family_review_insert_admin
  on public.ali_family_review for insert to authenticated
  with check (public.is_current_user_admin());

commit;
