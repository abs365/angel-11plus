-- Angel Digital 11+ — Migration 177
-- Mathematics Structural Capacity, Authoring Increment 009 — Pending
-- Review (Founder Completion and Readiness Programme, continuation
-- directive, 2026-09-01).
--
-- Registers the 2 new families from migration 176 (2 rows, 2 independent
-- numbered experiences, 2 marks) as awaiting an independent reviewer,
-- exactly the same placeholder-seeding pattern every prior Mock
-- Mathematics batch has used.
--
-- review_type = 'mock_maths_independent_review'. reviewer is explicitly
-- 'UNASSIGNED'. No row's eligibility_status changes — both rows remain
-- 'authentic_assessment_candidate' exactly as migration 176 left them.
--
-- Batch marker: MOCK-STRUCTURAL-CAPACITY-INCREMENT009 — verified this
-- session to share no substring collision with any prior marker
-- (INC001, WAVE002, BUSTIMETABLE-CORRECTION001, INCREMENT003-008).
--
-- With this migration, all five of Decision 226 Section 7's confirmed
-- Mathematics gap archetypes have a pending-review registration.
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migration 176.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr12-weightedmeancombine', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-STRUCTURAL-CAPACITY-INCREMENT009 new content review: mock-mr12-weightedmeancombine (Question ID: mock-mr12-weightedmean-01)', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr12-weightedmeancombine' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-STRUCTURAL-CAPACITY-INCREMENT009 new content review: mock-mr12-weightedmeancombine (Question ID: mock-mr12-weightedmean-01)'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr12-weightedmeanreverse', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-STRUCTURAL-CAPACITY-INCREMENT009 new content review: mock-mr12-weightedmeanreverse (Question ID: mock-mr12-weightedmean-02)', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr12-weightedmeanreverse' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-STRUCTURAL-CAPACITY-INCREMENT009 new content review: mock-mr12-weightedmeanreverse (Question ID: mock-mr12-weightedmean-02)'
);

commit;
