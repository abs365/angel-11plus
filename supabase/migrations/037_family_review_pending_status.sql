-- Angel Digital 11+ — Migration 037
-- Educational Increment 006, Part 3: proves the family_review workflow
-- (migration 034) is operational, honestly.
--
-- migration 034's family_review_decision enum only has terminal
-- decisions (approved / approved_with_amendment / rejected /
-- requires_revalidation) — there is no way to represent "queued, not yet
-- reviewed" without this addition. The directive is explicit: no
-- appropriately authorised independent reviewer exists in the current
-- programme workflow, and this migration must not impersonate one. It
-- adds the missing status and records all 4 Educational Increment 005B
-- families (mr02-compare, mr03-classify, mr04-far-percent,
-- mr04-mixed-divisibility) against it, with reviewer explicitly marked
-- unassigned. This does NOT change any row's eligibility_status — all 12
-- Wave 2 items remain 'provisional', exactly as before this migration.
--
-- ali_family_review has no browser-writable RLS/grant path either — apply
-- via Supabase Dashboard > SQL Editor.

begin;

alter type public.family_review_decision add value if not exists 'pending_independent_review';

commit;
