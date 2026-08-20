-- Angel Digital 11+ — Migration 089
-- Mock Programme Increment 004, Batch 001 — Mathematics Mock Content
-- Foundation (Decision 141).
--
-- Registers the 7 new families from migration 088 (18 questions) as
-- awaiting an independent reviewer, exactly the same placeholder-seeding
-- pattern migrations 067/079/082 already established — included
-- proactively in this same increment, per that established convention,
-- rather than risking the batch being invisible to /admin-beta/review the
-- way an earlier increment's own batch was before Decision 118's
-- root-cause correction.
--
-- review_type = 'mock_maths_independent_review' (migration 087, applied,
-- Decision 140) — NOT 'content_review'. This is deliberate: these rows
-- record that MOCK-SPECIFIC independent validation is awaited (the
-- Assessment Eligibility Model's own Authentic-Assessment-Candidate to
-- Independently-Validated transition), a distinct governance question
-- from an ordinary content_review row, per Decision 139's own design.
--
-- reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status
-- changes — all 18 questions remain 'authentic_assessment_candidate'
-- exactly as migration 088 left them. This migration inserts ONLY
-- placeholder rows recording that review is awaited; it does not itself
-- constitute, preselect, or imply any review decision, and no reviewer
-- identity is fabricated. Per this project's own standing rule (Decision
-- 48/51 precedent, reaffirmed throughout this Mock programme), Claude
-- must never impersonate an independent reviewer or self-approve content
-- — this migration performs neither.
--
-- The idempotency guard checks family_id + decision + review_type +
-- notes together, matching migration 082's own exact convention, so it
-- can never be satisfied by an unrelated historical row for the same
-- family.
--
-- Full review evidence for every target named below lives in
-- ALI_DECISION_LOG.md Decision 141.
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migration 088.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr02-invdiv', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH001 new content review: mock-mr02-invdiv-01..03', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr02-invdiv' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH001 new content review: mock-mr02-invdiv-01..03'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr02-twostep', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH001 new content review: mock-mr02-twostep-01..03', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr02-twostep' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH001 new content review: mock-mr02-twostep-01..03'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr03-unitconv', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH001 new content review: mock-mr03-unitconv-01..03', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr03-unitconv' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH001 new content review: mock-mr03-unitconv-01..03'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr09-data', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH001 new content review: mock-mr09-data-01..03 (3 distinct sub-structures, disclosed in Decision 141 -- not 3 variants of one structure)', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr09-data' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH001 new content review: mock-mr09-data-01..03 (3 distinct sub-structures, disclosed in Decision 141 -- not 3 variants of one structure)'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr05-forward', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH001 new content review: mock-mr05-forward-01..02', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr05-forward' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH001 new content review: mock-mr05-forward-01..02'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr05-inverse', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH001 new content review: mock-mr05-inverse-01..02', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr05-inverse' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH001 new content review: mock-mr05-inverse-01..02'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'question_family', 'mock-mr13-bestvalue', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC004-BATCH001 new content review: mock-mr13-bestvalue-01..02', 'mock_maths_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-mr13-bestvalue' and decision = 'pending_independent_review'
    and review_type = 'mock_maths_independent_review'
    and notes = 'MOCK-INC004-BATCH001 new content review: mock-mr13-bestvalue-01..02'
);

commit;
