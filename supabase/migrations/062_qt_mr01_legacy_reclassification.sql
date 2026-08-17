-- Angel Digital 11+ — Migration 062
-- Educational Increment 007T, Part 2 — QT-MR-01 legacy pool reclassification.
--
-- Metadata-only: sets family_id on 14 already-existing, already-
-- Practice-Eligible-or-provisional QT-MR-01 rows to the 4 family
-- contracts frozen in Part 3 of ANGEL_007T_CONTROLLED_CONTENT_EXPANSION_FOUNDATION_V1.md.
-- Does not touch content_difficulty, prompt, eligibility_status, or any
-- other column. Does not touch qa-008 (sqrt(225)), which is deliberately
-- left unclassified -- it does not structurally match any of the 4
-- families (see Part 2's disposition table).
--
-- Idempotent: the WHERE clause only matches rows that still have
-- family_id IS NULL, so re-running this file after it has already taken
-- effect is a no-op.
--
-- NOT APPLIED by this increment. Generated for Founder review and manual
-- application via Supabase Dashboard > SQL Editor > New query.

begin;

update public.ali_question_bank
set family_id = 'mr01-whole-number-computation'
where id in ('fv-mth-001', 'qa-001', 'qa-002', 'qa-003', 'qa-004', 'learn-mth-arith-guided', 'learn-mth-arith-independent', 'learn-mth-arith-independent-retry')
  and family_id is null;

update public.ali_question_bank
set family_id = 'mr01-decimal-computation'
where id in ('mth-008', 'qa-005')
  and family_id is null;

update public.ali_question_bank
set family_id = 'mr01-fraction-computation'
where id in ('qa-006', 'mth-004')
  and family_id is null;

update public.ali_question_bank
set family_id = 'mr01-multistep-order-of-operations'
where id in ('mth-002', 'qa-009')
  and family_id is null;

commit;
