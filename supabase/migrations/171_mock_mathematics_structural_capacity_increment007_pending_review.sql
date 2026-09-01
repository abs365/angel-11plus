-- Angel Digital 11+ — Migration 171
-- Mathematics Structural Capacity, Authoring Increment 007 — Pending
-- Review (Founder Completion and Readiness Programme, 2026-09-01).
--
-- Registers the 1 new family from migration 170 (3 rows, 1 grouped
-- numbered-question experience: mock-mr11-impossibletotal) as awaiting
-- an independent reviewer, exactly the same placeholder-seeding pattern
-- migrations 089/092/096/110/114/120/126/128/132/135/138/141 already
-- established for every prior Mock Mathematics batch.
--
-- review_type = 'mock_maths_independent_review' (migration 087, applied,
-- Decision 140) — the same, already-proven review type every prior Mock
-- Mathematics batch has used. No new review_target_type or review_type
-- value is introduced.
--
-- reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status
-- changes — the family remains 'authentic_assessment_candidate' exactly
-- as migration 170 left it. This migration inserts ONLY one placeholder
-- row recording that review is awaited; it does not itself constitute,
-- preselect, or imply any review decision, and no reviewer identity is
-- fabricated (Decision 48/51 precedent).
--
-- Batch marker: MOCK-STRUCTURAL-CAPACITY-INCREMENT007 (a new marker,
-- verified this session to share no substring collision with any of the
-- seven prior markers: MOCK-STRUCTURAL-CAPACITY-INC001, MOCK-STRUCTURAL-
-- CAPACITY-WAVE002, MOCK-BUSTIMETABLE-CORRECTION001, MOCK-STRUCTURAL-
-- CAPACITY-INCREMENT003/004/005/006).
--
-- The reviewer should also confirm migration 170's own disclosed open
-- question (subpart -03's compound two-part answer format) before this
-- family is promoted past `authentic_assessment_candidate`.
--
-- The idempotency guard checks family_id + decision + review_type +
-- notes together, matching every prior migration's own exact convention.
--
-- Full review evidence for the target named below lives in migration
-- 170's own header.
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migration 170.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr11-impossibletotal', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-STRUCTURAL-CAPACITY-INCREMENT007 new content review: mock-mr11-impossibletotal (Question IDs: mock-mr11-impossibletotal-01, mock-mr11-impossibletotal-02, mock-mr11-impossibletotal-03)', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr11-impossibletotal' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-STRUCTURAL-CAPACITY-INCREMENT007 new content review: mock-mr11-impossibletotal (Question IDs: mock-mr11-impossibletotal-01, mock-mr11-impossibletotal-02, mock-mr11-impossibletotal-03)'
);

commit;
