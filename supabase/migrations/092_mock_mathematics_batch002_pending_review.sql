-- Angel Digital 11+ — Migration 092
-- Mock Programme Increment 004, Batch 002 — Mathematics Mock Content
-- Foundation (Decision 145).
--
-- Registers the 10 new families from migration 091 (20 questions) as
-- awaiting an independent reviewer, exactly the same placeholder-seeding
-- pattern migration 089 already established for Batch 001.
--
-- review_type = 'mock_maths_independent_review' (migration 087, applied,
-- Decision 140) — same value Batch 001 used, since this is the same
-- governance question (Authentic-Assessment-Candidate to Independently-
-- Validated) for a different batch of Mathematics content.
--
-- reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status
-- changes — all 20 questions remain 'authentic_assessment_candidate'
-- exactly as migration 091 left them. This migration inserts ONLY
-- placeholder rows recording that review is awaited; it does not itself
-- constitute, preselect, or imply any review decision, and no reviewer
-- identity is fabricated. Per this project's own standing rule (Decision
-- 48/51 precedent, reaffirmed throughout this Mock programme), Claude
-- must never impersonate an independent reviewer or self-approve content
-- — this migration performs neither.
--
-- The idempotency guard checks family_id + decision + review_type +
-- notes together, matching migration 089's own exact convention.
--
-- Full review evidence for every target named below lives in
-- ALI_DECISION_LOG.md Decision 145.
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migration 091.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr04-percentchange', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH002 new content review: mock-mr04-percentchange-01..02', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr04-percentchange' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH002 new content review: mock-mr04-percentchange-01..02'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr04-reversepercent', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH002 new content review: mock-mr04-reversepercent-01..02', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr04-reversepercent' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH002 new content review: mock-mr04-reversepercent-01..02'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr06-sumdiff', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH002 new content review: mock-mr06-sumdiff-01..02', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr06-sumdiff' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH002 new content review: mock-mr06-sumdiff-01..02'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr06-multiplerelation', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH002 new content review: mock-mr06-multiplerelation-01..02', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr06-multiplerelation' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH002 new content review: mock-mr06-multiplerelation-01..02'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr07-triangleanglesum', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH002 new content review: mock-mr07-triangleanglesum-01..02', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr07-triangleanglesum' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH002 new content review: mock-mr07-triangleanglesum-01..02'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr07-isoscelesproperty', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH002 new content review: mock-mr07-isoscelesproperty-01..02', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr07-isoscelesproperty' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH002 new content review: mock-mr07-isoscelesproperty-01..02'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr10-forwardschedule', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH002 new content review: mock-mr10-forwardschedule-01..02', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr10-forwardschedule' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH002 new content review: mock-mr10-forwardschedule-01..02'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr10-reverseschedule', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH002 new content review: mock-mr10-reverseschedule-01..02', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr10-reverseschedule' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH002 new content review: mock-mr10-reverseschedule-01..02'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr11-truefalsejudgement', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH002 new content review: mock-mr11-truefalsejudgement-01..02', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr11-truefalsejudgement' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH002 new content review: mock-mr11-truefalsejudgement-01..02'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr11-propertysearch', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH002 new content review: mock-mr11-propertysearch-01..02', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr11-propertysearch' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH002 new content review: mock-mr11-propertysearch-01..02'
);

commit;
