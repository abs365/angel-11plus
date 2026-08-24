-- Angel Digital 11+ — Migration 110
-- Mathematics First Mock Minimum — Compound Content Foundation, Batch 001
-- (Decision 163).
--
-- Registers the 1 new family from migration 109 (4 rows, 2 grouped
-- numbered-question instances) as awaiting an independent reviewer,
-- exactly the same placeholder-seeding pattern migrations 089/092/096
-- already established for Mock Mathematics Batches 001/002/003.
--
-- review_type = 'mock_maths_independent_review' (migration 087, applied,
-- Decision 140) — the same, already-proven review type every prior Mock
-- Mathematics batch has used. No new review_target_type or review_type
-- value is introduced by this migration.
--
-- reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status
-- changes — all 4 questions remain 'authentic_assessment_candidate'
-- exactly as migration 109 left them. This migration inserts ONLY a
-- placeholder row recording that review is awaited; it does not itself
-- constitute, preselect, or imply any review decision, and no reviewer
-- identity is fabricated, matching this project's own standing rule
-- (Decision 48/51 precedent).
--
-- The idempotency guard checks family_id + decision + review_type +
-- notes together, matching migrations 082/089/092/096's own exact
-- convention.
--
-- Full review evidence for the target named below lives in migration
-- 109's own header and will be recorded in ALI_DECISION_LOG.md at
-- closure.
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migration 109.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr03mr07-perimeterarea', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-FIRSTMOCK-COMPOUND-BATCH001 new content review: mock-mr03mr07-perimeterarea (Question IDs: mock-mr03mr07-perimeterarea-01a, mock-mr03mr07-perimeterarea-01b, mock-mr03mr07-perimeterarea-02a, mock-mr03mr07-perimeterarea-02b)', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr03mr07-perimeterarea' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-FIRSTMOCK-COMPOUND-BATCH001 new content review: mock-mr03mr07-perimeterarea (Question IDs: mock-mr03mr07-perimeterarea-01a, mock-mr03mr07-perimeterarea-01b, mock-mr03mr07-perimeterarea-02a, mock-mr03mr07-perimeterarea-02b)'
);

commit;
