-- Angel Digital 11+ — Migration 114
-- Mathematics First Mock Minimum — Shared-Scenario Completion Batch,
-- Pending Review (Decision 168/169).
--
-- Registers the 2 new families from migration 113 (4 rows, 2 grouped
-- numbered-question experiences) as awaiting an independent reviewer,
-- exactly the same placeholder-seeding pattern migrations 089/092/096/
-- 110 already established for every prior Mock Mathematics batch.
--
-- review_type = 'mock_maths_independent_review' (migration 087, applied,
-- Decision 140) — the same, already-proven review type every prior Mock
-- Mathematics batch has used. No new review_target_type or review_type
-- value is introduced.
--
-- reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status
-- changes — both families remain 'authentic_assessment_candidate'
-- exactly as migration 113 left them. This migration inserts ONLY two
-- placeholder rows recording that review is awaited; it does not itself
-- constitute, preselect, or imply any review decision, and no reviewer
-- identity is fabricated (Decision 48/51 precedent).
--
-- The idempotency guard checks family_id + decision + review_type +
-- notes together, matching migrations 082/089/092/096/110's own exact
-- convention.
--
-- Full review evidence for both targets named below lives in migration
-- 113's own header and this session's own Decision 169 entry.
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migration 113.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr10-fairprep', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-SHARED-SCENARIO-COMPLETION-BATCH new content review: mock-mr10-fairprep (Question IDs: mock-mr10-fairprep-01, mock-mr10-fairprep-02)', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr10-fairprep' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-SHARED-SCENARIO-COMPLETION-BATCH new content review: mock-mr10-fairprep (Question IDs: mock-mr10-fairprep-01, mock-mr10-fairprep-02)'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr09-runningclub', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-SHARED-SCENARIO-COMPLETION-BATCH new content review: mock-mr09-runningclub (Question IDs: mock-mr09-runningclub-01, mock-mr09-runningclub-02)', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr09-runningclub' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-SHARED-SCENARIO-COMPLETION-BATCH new content review: mock-mr09-runningclub (Question IDs: mock-mr09-runningclub-01, mock-mr09-runningclub-02)'
);

commit;
