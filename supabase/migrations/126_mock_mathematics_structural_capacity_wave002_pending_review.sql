-- Angel Digital 11+ — Migration 126
-- Mathematics First Mock Structural Capacity, Authoring Wave 002 —
-- Pending Review (Decision 184/185).
--
-- Registers the 2 new families from migration 125 (7 rows, 2 grouped
-- numbered-question experiences: mock-mr10-bustimetable 4 rows,
-- mock-mr13-craftstall 3 rows) as awaiting an independent reviewer,
-- exactly the same placeholder-seeding pattern migrations 089/092/096/
-- 110/114/120 already established for every prior Mock Mathematics
-- batch.
--
-- review_type = 'mock_maths_independent_review' (migration 087,
-- applied, Decision 140) — the same, already-proven review type every
-- prior Mock Mathematics batch has used. No new review_target_type or
-- review_type value is introduced.
--
-- reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status
-- changes — both families remain 'authentic_assessment_candidate'
-- exactly as migration 125 left them. This migration inserts ONLY two
-- placeholder rows recording that review is awaited; it does not itself
-- constitute, preselect, or imply any review decision, and no reviewer
-- identity is fabricated (Decision 48/51 precedent).
--
-- Batch marker: MOCK-STRUCTURAL-CAPACITY-WAVE002 (a new, deliberately
-- chosen marker distinct from MOCK-STRUCTURAL-CAPACITY-INC001, since
-- this is a materially different authoring wave, not a continuation of
-- Increment 001's own review scope).
--
-- The idempotency guard checks family_id + decision + review_type +
-- notes together, matching migrations 082/089/092/096/110/114/120's own
-- exact convention.
--
-- Full review evidence for both targets named below lives in migration
-- 125's own header and this session's own Decision 185 entry.
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migration 125.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr10-bustimetable', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-STRUCTURAL-CAPACITY-WAVE002 new content review: mock-mr10-bustimetable (Question IDs: mock-mr10-bustimetable-01, mock-mr10-bustimetable-02, mock-mr10-bustimetable-03, mock-mr10-bustimetable-04)', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr10-bustimetable' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-STRUCTURAL-CAPACITY-WAVE002 new content review: mock-mr10-bustimetable (Question IDs: mock-mr10-bustimetable-01, mock-mr10-bustimetable-02, mock-mr10-bustimetable-03, mock-mr10-bustimetable-04)'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr13-craftstall', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-STRUCTURAL-CAPACITY-WAVE002 new content review: mock-mr13-craftstall (Question IDs: mock-mr13-craftstall-01, mock-mr13-craftstall-02, mock-mr13-craftstall-03)', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr13-craftstall' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-STRUCTURAL-CAPACITY-WAVE002 new content review: mock-mr13-craftstall (Question IDs: mock-mr13-craftstall-01, mock-mr13-craftstall-02, mock-mr13-craftstall-03)'
);

commit;
