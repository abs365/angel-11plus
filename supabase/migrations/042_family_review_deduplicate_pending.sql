-- Angel Digital 11+ — Migration 042
-- Educational Increment 006B, Production Integrity Closure, Part 2 of the
-- Family Review State Reconciliation.
--
-- Background (established via the Founder's own authenticated Supabase
-- Table Editor, which bypasses RLS and is authoritative — anon-key
-- verification cannot see these rows at all, which was mistaken earlier
-- in this closure for the table being empty; it is not):
--
-- public.ali_family_review holds 8 rows for the 4 Educational Increment
-- 005B families (mr02-compare, mr03-classify, mr04-far-percent,
-- mr04-mixed-divisibility), 2 each, all reviewer = 'UNASSIGNED', dated
-- 2026-08-12 and 2026-08-13 respectively — matching this repository's own
-- commit dates for migration 038 (2026-08-12) and migration 041
-- (2026-08-13) exactly. Strongest evidence-based explanation: migration
-- 038 succeeded when originally run on 2026-08-12 (contrary to this
-- closure's earlier, incorrect "0 rows" conclusion, which was really
-- "0 anon-visible rows"). Migration 041's own idempotency guard
-- (`where not exists (select ... pending_independent_review)`) was
-- written to prevent exactly this duplication, but if the SQL Editor
-- session that ran it was itself subject to the same RLS restriction as
-- the anon key (rather than bypassing it, as a superuser/service-role
-- session normally would), that guard's own SELECT would have seen zero
-- existing rows too, and inserted 4 more instead of skipping them. This
-- would coherently explain every observation in this closure without
-- requiring separate causes for 038 and 041.
--
-- This migration removes only the proven-redundant duplicate: for any
-- family with more than one row carrying BOTH decision =
-- 'pending_independent_review' AND reviewer = 'UNASSIGNED' (the exact
-- signature of an untouched placeholder awaiting a reviewer — never a
-- real recorded decision), keeps the single oldest such row per family
-- and removes the rest. A row is only ever a delete candidate if it is
-- an exact duplicate of this specific placeholder shape; any row where a
-- real reviewer has since recorded an actual decision (rejected,
-- approved, approved_with_amendment, requires_revalidation) or where
-- reviewer is not literally 'UNASSIGNED' is untouched, by construction —
-- there is no way for this migration to remove genuine review history.
--
-- Never touches ali_question_bank or any eligibility_status. Never marks
-- a review complete. Never fabricates a reviewer. Idempotent: after one
-- successful run, at most one row per family matches the delete
-- condition's own precondition (more than one placeholder per family),
-- so a second run deletes nothing.
--
-- Run this in: Supabase Dashboard > SQL Editor > New query, as its own
-- standalone execution. NOT applied by this commit — Founder action
-- required, and only after independently confirming (via Table Editor,
-- not anon-key REST, which cannot see this table) that the 8-row state
-- and the dates match what is described above.

begin;

with ranked as (
  select
    id,
    row_number() over (
      partition by family_id
      order by created_at asc, id asc
    ) as rn
  from public.ali_family_review
  where decision = 'pending_independent_review'
    and reviewer = 'UNASSIGNED'
)
delete from public.ali_family_review
where id in (select id from ranked where rn > 1);

commit;
