-- Angel Digital 11+ — Migration 120
-- Mathematics First Mock Structural Capacity, Authoring Increment 001 —
-- Interdependent Algebraic System, Pending Review (Decision 177/178).
--
-- Registers the 1 new family from migration 119 (3 rows, 1 grouped
-- numbered-question experience) as awaiting an independent reviewer,
-- exactly the same placeholder-seeding pattern migrations 089/092/096/
-- 110/114 already established for every prior Mock Mathematics batch.
--
-- review_type = 'mock_maths_independent_review' (migration 087, applied,
-- Decision 140) — the same, already-proven review type every prior Mock
-- Mathematics batch has used. No new review_target_type or review_type
-- value is introduced.
--
-- reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status
-- changes — the family remains 'authentic_assessment_candidate' exactly
-- as migration 119 left it. This migration inserts ONLY one placeholder
-- row recording that review is awaited; it does not itself constitute,
-- preselect, or imply any review decision, and no reviewer identity is
-- fabricated (Decision 48/51 precedent).
--
-- The idempotency guard checks family_id + decision + review_type +
-- notes together, matching migrations 082/089/092/096/110/114's own
-- exact convention.
--
-- Full review evidence for this target lives in migration 119's own
-- header and this session's own Decision 178 entry.
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migration 119.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr06-linkedvalues', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-STRUCTURAL-CAPACITY-INC001 new content review: mock-mr06-linkedvalues (Question IDs: mock-mr06-linkedvalues-01, mock-mr06-linkedvalues-02, mock-mr06-linkedvalues-03)', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr06-linkedvalues' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-STRUCTURAL-CAPACITY-INC001 new content review: mock-mr06-linkedvalues (Question IDs: mock-mr06-linkedvalues-01, mock-mr06-linkedvalues-02, mock-mr06-linkedvalues-03)'
);

commit;
