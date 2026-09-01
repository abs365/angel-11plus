-- Angel Digital 11+ — Migration 175
-- Mathematics Structural Capacity, Authoring Increment 008 — Pending
-- Review (Founder Completion and Readiness Programme, continuation
-- directive, 2026-09-01).
--
-- Registers the 3 new families from migration 174 (8 rows total: 3
-- numbered-question experiences, 8 marks) as awaiting an independent
-- reviewer, exactly the same placeholder-seeding pattern every prior
-- Mock Mathematics batch has used (migrations 089/092/096/110/114/120/
-- 126/132/135/138/141/171).
--
-- review_type = 'mock_maths_independent_review' — the same value every
-- prior Mathematics batch has used. reviewer is explicitly 'UNASSIGNED'.
-- No row's eligibility_status changes — all 8 rows remain
-- 'authentic_assessment_candidate' exactly as migration 174 left them.
-- This migration inserts ONLY three placeholder rows recording that
-- review is awaited; it does not itself constitute, preselect, or imply
-- any review decision, and no reviewer identity is fabricated (Decision
-- 48/51 precedent).
--
-- Batch marker: MOCK-STRUCTURAL-CAPACITY-INCREMENT008 — verified this
-- session to share no substring collision with any of the eight prior
-- markers (INC001, WAVE002, BUSTIMETABLE-CORRECTION001, INCREMENT003
-- through INCREMENT007).
--
-- The idempotency guard checks family_id + decision + review_type +
-- notes together, matching every prior migration's own exact convention.
--
-- Full review evidence for every target named below lives in migration
-- 174's own header.
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migration 174.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr05-numberpyramid', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-STRUCTURAL-CAPACITY-INCREMENT008 new content review: mock-mr05-numberpyramid (Question IDs: mock-mr05-numberpyramid-01, mock-mr05-numberpyramid-02, mock-mr05-numberpyramid-03)', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr05-numberpyramid' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-STRUCTURAL-CAPACITY-INCREMENT008 new content review: mock-mr05-numberpyramid (Question IDs: mock-mr05-numberpyramid-01, mock-mr05-numberpyramid-02, mock-mr05-numberpyramid-03)'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr13-toppingcombos', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-STRUCTURAL-CAPACITY-INCREMENT008 new content review: mock-mr13-toppingcombos (Question IDs: mock-mr13-toppingcombos-01, mock-mr13-toppingcombos-02)', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr13-toppingcombos' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-STRUCTURAL-CAPACITY-INCREMENT008 new content review: mock-mr13-toppingcombos (Question IDs: mock-mr13-toppingcombos-01, mock-mr13-toppingcombos-02)'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr06-agenarrative', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-STRUCTURAL-CAPACITY-INCREMENT008 new content review: mock-mr06-agenarrative (Question IDs: mock-mr06-agenarrative-01, mock-mr06-agenarrative-02, mock-mr06-agenarrative-03)', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr06-agenarrative' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-STRUCTURAL-CAPACITY-INCREMENT008 new content review: mock-mr06-agenarrative (Question IDs: mock-mr06-agenarrative-01, mock-mr06-agenarrative-02, mock-mr06-agenarrative-03)'
);

commit;
