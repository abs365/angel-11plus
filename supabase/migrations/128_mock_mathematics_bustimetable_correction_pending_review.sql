-- Angel Digital 11+ — Migration 128
-- Mathematics Structural Capacity, Wave 002 — Bus Timetable Correction
-- Re-Review Registration (Decision 185/186).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS, AND WHY IT CANNOT REUSE THE ORIGINAL
-- MOCK-STRUCTURAL-CAPACITY-WAVE002 MARKER
-- ============================================================
-- Migration 127 corrects mock-mr10-bustimetable-04's ambiguous wording.
-- The family's own PRIOR approval (recorded under the original
-- MOCK-STRUCTURAL-CAPACITY-WAVE002 marker) covered the UNCORRECTED
-- wording and must remain untouched, historical evidence -- it is not
-- deleted, rewritten, or reinterpreted as approval of the corrected
-- content (explicit Founder instruction).
--
-- Traced directly against this repository's own real review-status
-- logic (lib/adminReview.ts's deriveBatchReviewStatus()) before
-- deciding how to register the re-review, not assumed: that function
-- explicitly SKIPS any row with decision = 'pending_independent_review'
-- (`if (row.decision === 'pending_independent_review') continue;`) and
-- otherwise keeps overwriting its result with the LAST matching
-- approved row it finds for a given marker. If this migration inserted
-- a new pending row under the SAME WAVE002 marker, the review surface
-- would STILL report mock-mr10-bustimetable as "reviewed (approved)"
-- -- the old approved row would still match that marker and would not
-- be skipped, while the new pending row would be silently skipped by
-- the very same status computation. Reusing the old marker would
-- therefore misrepresent the corrected content as already reviewed,
-- the exact outcome the Founder's own instruction explicitly forbids.
--
-- This migration therefore registers the re-review under a NEW,
-- distinct marker, MOCK-BUSTIMETABLE-CORRECTION001, wired (in the same
-- commit as this migration) to its own dedicated review-surface
-- section, config array, and status derivation -- entirely independent
-- of the original WAVE002 marker's own status, exactly the mechanism
-- required for the family to visibly, correctly show as "not yet
-- reviewed" for the corrected content while the original approval
-- remains visible, untouched, under its own original section. The new
-- marker is DELIBERATELY chosen to NOT contain the substring
-- "MOCK-STRUCTURAL-CAPACITY-WAVE002" -- the original section's own
-- pending-target lookup uses a plain `.includes()` substring check
-- (app/admin-beta/review/page.tsx), so a marker that merely appended a
-- suffix to the old one (e.g. "...-WAVE002-CORRECTION001") would still
-- satisfy that old check and could cause the ORIGINAL section's own
-- button to pick up this new pending row non-deterministically,
-- submitting a fresh decision mis-tagged under the wrong marker. Caught
-- and avoided during drafting, before either file was wired together.
--
-- ============================================================
-- SCOPE
-- ============================================================
-- The WHOLE mock-mr10-bustimetable family (all 4 rows) is registered
-- for re-review, not merely subpart (d) -- matching this project's own
-- established convention that the review unit is always the family,
-- never an individual subpart, so the Founder inspects the complete,
-- corrected grouped experience together.
--
-- reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status
-- changes -- mock-mr10-bustimetable remains authentic_assessment_
-- candidate exactly as migration 125/127 left it. This migration
-- inserts ONLY one placeholder row; it does not itself constitute,
-- preselect, or imply any review decision, and no reviewer identity is
-- fabricated (Decision 48/51 precedent).
--
-- mock-mr13-craftstall requires no corrective re-review from this
-- finding (Founder's own separate PASS/APPROVED verdict for that
-- family stands, untouched by this migration) and is never referenced
-- anywhere in this file's own executable SQL.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does NOT delete, update, or rewrite the original WAVE002 approval row
-- for mock-mr10-bustimetable, or any ali_family_review row for
-- mock-mr13-craftstall. Does NOT touch ali_question_bank in any way
-- (migration 127 handles the content correction separately). Does NOT
-- touch ali_mock_form, any RPC, RLS policy, or grant. Does NOT approve,
-- certify, or promote mock-mr10-bustimetable.
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL
-- Editor, after (or together with) migration 127.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr10-bustimetable', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-BUSTIMETABLE-CORRECTION001 re-review after content correction: mock-mr10-bustimetable (Question IDs: mock-mr10-bustimetable-01, mock-mr10-bustimetable-02, mock-mr10-bustimetable-03, mock-mr10-bustimetable-04). Subpart (d)''s wording was corrected by migration 127 (an ambiguous "speed up...by 20%" phrasing, permitting a reading inconsistent with the stored answer, replaced with an unambiguous "reduce...journey time by 20%" phrasing). The family''s prior approval (recorded under the original MOCK-STRUCTURAL-CAPACITY-WAVE002 marker) covered the UNCORRECTED wording and remains separate, untouched, historical evidence -- it is not carried forward as approval of this corrected content.', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr10-bustimetable' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-BUSTIMETABLE-CORRECTION001 re-review after content correction: mock-mr10-bustimetable (Question IDs: mock-mr10-bustimetable-01, mock-mr10-bustimetable-02, mock-mr10-bustimetable-03, mock-mr10-bustimetable-04). Subpart (d)''s wording was corrected by migration 127 (an ambiguous "speed up...by 20%" phrasing, permitting a reading inconsistent with the stored answer, replaced with an unambiguous "reduce...journey time by 20%" phrasing). The family''s prior approval (recorded under the original MOCK-STRUCTURAL-CAPACITY-WAVE002 marker) covered the UNCORRECTED wording and remains separate, untouched, historical evidence -- it is not carried forward as approval of this corrected content.'
);

commit;
