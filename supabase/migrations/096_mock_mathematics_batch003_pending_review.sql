-- Angel Digital 11+ — Migration 096
-- Mock Programme Increment 004, Batch 003 — Mathematics Mock Content
-- Foundation.
--
-- Registers the 4 new families from migration 095 (8 questions across 4
-- families, 2 of which are grouped numbered-question instances) as
-- awaiting an independent reviewer, exactly the same placeholder-seeding
-- pattern migrations 089/092 already established for Batch 001/002.
--
-- review_type = 'mock_maths_independent_review' (migration 087, applied,
-- Decision 140) — NOT 'content_review'. Same distinct governance
-- question as every prior Mock Mathematics batch, per Decision 139's
-- own design.
--
-- reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status
-- changes — all 8 questions remain 'authentic_assessment_candidate'
-- exactly as migration 095 left them. This migration inserts ONLY
-- placeholder rows recording that review is awaited; it does not itself
-- constitute, preselect, or imply any review decision, and no reviewer
-- identity is fabricated, matching this project's own standing rule
-- (Decision 48/51 precedent).
--
-- The idempotency guard checks family_id + decision + review_type +
-- notes together, matching migrations 082/089/092's own exact
-- convention.
--
-- Full review evidence for every target named below lives in migration
-- 095's own header and will be recorded in ALI_DECISION_LOG.md at
-- closure.
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migration 095.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr01-directcalc', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH003 new content review: mock-mr01-directcalc-01..02', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr01-directcalc' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH003 new content review: mock-mr01-directcalc-01..02'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr08-rotation', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH003 new content review: mock-mr08-rotation-01..02', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr08-rotation' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH003 new content review: mock-mr08-rotation-01..02'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr12-reversemean', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH003 new content review: mock-mr12-reversemean-01..02', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr12-reversemean' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH003 new content review: mock-mr12-reversemean-01..02'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr01mr10-costumeschedule', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH003 new content review: mock-mr01mr10-costumeschedule-01a,01b,02a,02b (2 grouped numbered-question instances, 2 subparts each)', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr01mr10-costumeschedule' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH003 new content review: mock-mr01mr10-costumeschedule-01a,01b,02a,02b (2 grouped numbered-question instances, 2 subparts each)'
);

commit;
