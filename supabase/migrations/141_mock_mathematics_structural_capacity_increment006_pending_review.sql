-- Angel Digital 11+ — Migration 141
-- Mathematics Structural Capacity, Authoring Increment 006 — Pending
-- Review (Decision 205/206).
--
-- Registers the 1 new family from migration 140 (4 rows, 1 grouped
-- numbered-question experience: mock-mr11-roundingbounds) as awaiting an
-- independent reviewer, exactly the same placeholder-seeding pattern
-- migrations 089/092/096/110/114/120/126/128/132/135/138 already
-- established for every prior Mock Mathematics batch.
--
-- review_type = 'mock_maths_independent_review' (migration 087, applied,
-- Decision 140) — the same, already-proven review type every prior Mock
-- Mathematics batch has used. No new review_target_type or review_type
-- value is introduced.
--
-- reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status
-- changes — the family remains 'authentic_assessment_candidate' exactly
-- as migration 140 left it. This migration inserts ONLY one placeholder
-- row recording that review is awaited; it does not itself constitute,
-- preselect, or imply any review decision, and no reviewer identity is
-- fabricated (Decision 48/51 precedent).
--
-- Batch marker: MOCK-STRUCTURAL-CAPACITY-INCREMENT006 (a new, deliberately
-- chosen marker distinct from MOCK-STRUCTURAL-CAPACITY-INC001,
-- MOCK-STRUCTURAL-CAPACITY-WAVE002, MOCK-BUSTIMETABLE-CORRECTION001,
-- MOCK-STRUCTURAL-CAPACITY-INCREMENT003, MOCK-STRUCTURAL-CAPACITY-
-- INCREMENT004, and MOCK-STRUCTURAL-CAPACITY-INCREMENT005 — this is a
-- materially different authoring increment, not a continuation of any
-- prior scope. Chosen to share no substring collision risk with any
-- existing marker's own `.includes()` pending-target lookup in
-- app/admin-beta/review/page.tsx — verified this session:
-- "MOCK-STRUCTURAL-CAPACITY-INCREMENT006" does not contain, and is not
-- contained by, any of the six prior markers above.
--
-- The idempotency guard checks family_id + decision + review_type +
-- notes together, matching migrations 082/089/092/096/110/114/120/126/
-- 132/135/138's own exact convention.
--
-- Full review evidence for the target named below lives in migration
-- 140's own header and this repository's Decision 205/206 entries.
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migration 140.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr11-roundingbounds', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-STRUCTURAL-CAPACITY-INCREMENT006 new content review: mock-mr11-roundingbounds (Question IDs: mock-mr11-roundingbounds-01, mock-mr11-roundingbounds-02, mock-mr11-roundingbounds-03, mock-mr11-roundingbounds-04)', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr11-roundingbounds' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-STRUCTURAL-CAPACITY-INCREMENT006 new content review: mock-mr11-roundingbounds (Question IDs: mock-mr11-roundingbounds-01, mock-mr11-roundingbounds-02, mock-mr11-roundingbounds-03, mock-mr11-roundingbounds-04)'
);

commit;
