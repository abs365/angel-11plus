-- Angel Digital 11+ — Migration 054
-- Educational Increment 007E, Part 7/9 — grants the existing admin
-- mechanism (is_current_user_admin(), migration 008) real, RLS-enforced
-- access to ali_family_review and ali_passage_bank, so a genuine human
-- reviewer can use the new /admin-beta/review interface end to end
-- (read a target's real content, submit a real review decision) without
-- the Founder needing to run SQL by hand for every single review.
--
-- This is a deliberate, disclosed architectural change, not a silent
-- side effect. Until now, ali_family_review (migration 034) and
-- ali_passage_bank (migration 043) had NO browser-writable RLS/grant
-- path at all, by design — migration 034's own header states "no
-- application code writes to this table as part of authoring or
-- generation" to prevent self-certification. That concern is about
-- AUTHORING/GENERATION code writing fake approvals, not about a real,
-- individually-authenticated human reviewer (gated by the same
-- is_current_user_admin() check the existing Beta Admin dashboard
-- already relies on) submitting their own genuine decision through a
-- proper form. This migration only ever allows INSERT (a new decision
-- row), never UPDATE or DELETE, and does not touch ali_question_bank's
-- eligibility_status column at all — an approved review still cannot
-- itself promote anything to practice_eligible (Operating Model §5,
-- Founder's Part 10 instruction: review approval and eligibility
-- promotion remain two separate, explicitly-authorised steps).
--
-- ali_passage_bank is granted SELECT only — a reviewer must read full
-- passage text to review it; nothing about passage authoring changes.
--
-- Idempotent (DROP POLICY IF EXISTS then CREATE, the established pattern
-- from migration 008 — Postgres has no CREATE POLICY IF NOT EXISTS).
--
-- Run this in: Supabase Dashboard > SQL Editor > New query, after
-- migration 047 (review_target_type column) and 053 (Mathematics
-- review-target repair).

begin;

alter table public.ali_family_review enable row level security;
alter table public.ali_passage_bank  enable row level security;

drop policy if exists ali_family_review_select_admin on public.ali_family_review;
create policy ali_family_review_select_admin
  on public.ali_family_review for select to authenticated
  using (public.is_current_user_admin());

drop policy if exists ali_family_review_insert_admin on public.ali_family_review;
create policy ali_family_review_insert_admin
  on public.ali_family_review for insert to authenticated
  with check (public.is_current_user_admin());

drop policy if exists ali_passage_bank_select_admin on public.ali_passage_bank;
create policy ali_passage_bank_select_admin
  on public.ali_passage_bank for select to authenticated
  using (public.is_current_user_admin());

-- No UPDATE/DELETE policy on either table, and no INSERT/UPDATE/DELETE
-- policy at all on ali_passage_bank — with RLS enabled and no matching
-- policy, Postgres denies those operations to every role by default.
-- Passage authoring and any correction remain Founder-applied migrations,
-- exactly as before.

commit;
