-- Angel Digital 11+ — Migration 138
-- Mathematics Structural Capacity, Authoring Increment 005 — Pending
-- Review (Decision 198/199).
--
-- Registers the 1 new family from migration 137 (4 rows, 1 grouped
-- numbered-question experience: mock-mr06-numberpuzzle) as awaiting an
-- independent reviewer, exactly the same placeholder-seeding pattern
-- migrations 089/092/096/110/114/120/126/128/132/135 already established
-- for every prior Mock Mathematics batch.
--
-- review_type = 'mock_maths_independent_review' (migration 087, applied,
-- Decision 140) — the same, already-proven review type every prior Mock
-- Mathematics batch has used. No new review_target_type or review_type
-- value is introduced.
--
-- reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status
-- changes — the family remains 'authentic_assessment_candidate' exactly
-- as migration 137 left it. This migration inserts ONLY one placeholder
-- row recording that review is awaited; it does not itself constitute,
-- preselect, or imply any review decision, and no reviewer identity is
-- fabricated (Decision 48/51 precedent).
--
-- Batch marker: MOCK-STRUCTURAL-CAPACITY-INCREMENT005 (a new,
-- deliberately chosen marker distinct from
-- MOCK-STRUCTURAL-CAPACITY-INC001, MOCK-STRUCTURAL-CAPACITY-WAVE002,
-- MOCK-BUSTIMETABLE-CORRECTION001, MOCK-STRUCTURAL-CAPACITY-INCREMENT003,
-- and MOCK-STRUCTURAL-CAPACITY-INCREMENT004 -- this is a materially
-- different authoring increment, not a continuation of any prior scope.
-- Chosen to share no substring collision risk with any existing marker's
-- own `.includes()` pending-target lookup in
-- app/admin-beta/review/page.tsx -- verified this session:
-- "MOCK-STRUCTURAL-CAPACITY-INCREMENT005" does not contain
-- "MOCK-STRUCTURAL-CAPACITY-INC001", "MOCK-STRUCTURAL-CAPACITY-WAVE002",
-- "MOCK-BUSTIMETABLE-CORRECTION001", "MOCK-STRUCTURAL-CAPACITY-
-- INCREMENT003", or "MOCK-STRUCTURAL-CAPACITY-INCREMENT004" as a
-- substring, and none of those markers is a substring of this one.
--
-- The idempotency guard checks family_id + decision + review_type +
-- notes together, matching migrations 082/089/092/096/110/114/120/126/
-- 132/135's own exact convention.
--
-- Full review evidence for the target named below lives in migration
-- 137's own header and this session's own Decision 199 entry.
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migration 137.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr06-numberpuzzle', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-STRUCTURAL-CAPACITY-INCREMENT005 new content review: mock-mr06-numberpuzzle (Question IDs: mock-mr06-numberpuzzle-01, mock-mr06-numberpuzzle-02, mock-mr06-numberpuzzle-03, mock-mr06-numberpuzzle-04)', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr06-numberpuzzle' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-STRUCTURAL-CAPACITY-INCREMENT005 new content review: mock-mr06-numberpuzzle (Question IDs: mock-mr06-numberpuzzle-01, mock-mr06-numberpuzzle-02, mock-mr06-numberpuzzle-03, mock-mr06-numberpuzzle-04)'
);

commit;
