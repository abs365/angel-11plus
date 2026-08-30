-- Angel Digital 11+ — Migration 168
-- English Content Foundation, Increment 003 (Decision 244/251) — Pending
-- Independent Review Registration.
--
-- Registers the new content from migrations 166 (3 Comprehension passages
-- + their complete 10/8/10-row question sets) and 167 (1 Continuous
-- Writing prompt) as awaiting an independent reviewer -- the same
-- proactive placeholder-seeding pattern migrations 099/154/162 already
-- established, authored specifically to close the Decision 250 finding
-- that Increment 003 content, though live, was unreachable through
-- /admin-beta/review because no ali_family_review row existed for it and
-- no hardcoded batch section named it.
--
-- FOUR rows total -- NOT 28 (one per comprehension question row) and NOT
-- one per Comprehension question family. Per migration 162's own
-- (corrected) design, each Comprehension passage and its complete
-- attached question set is reviewed together as ONE unit, keyed by the
-- passage's own `id` -- never approved by reviewing individual questions
-- in isolation. The Writing prompt is its own distinct reviewable unit,
-- registered by its own `ali_question_bank.family_id` column value, per
-- Decision 251's explicit instruction, matching migration 154's own
-- (corrected) convention -- never the prompt's own row id.
--
-- review_type = 'mock_english_passage_independent_review' (the 3 passage
-- rows) / 'mock_writing_prompt_independent_review' (the 1 Writing row) --
-- the SAME two review_type values migrations 099/154/162 already used,
-- not new ones. reviewer is explicitly 'UNASSIGNED'. No row's
-- eligibility_status changes -- the 3 passages and all 29 new question
-- rows (28 Comprehension + 1 Writing) remain 'authentic_assessment_
-- candidate' exactly as migrations 166/167 left them. This migration
-- inserts ONLY placeholder rows recording that review is awaited; it does
-- not itself constitute, preselect, or imply any review decision, and no
-- reviewer identity is fabricated. Per this project's own standing rule
-- (Decision 48/51 precedent, reaffirmed throughout every prior increment),
-- Claude must never impersonate an independent reviewer or self-approve
-- content -- this migration performs neither.
--
-- DOES NOT record Decision 246 (the Founder's own informal pre-
-- application educational history for Pepper's Breakfast/Compass Rose
-- Challenge/Salmon/An Invented Place) as any kind of review row --
-- Decision 251, Part C is explicit that this is Founder pre-application
-- history, not a formal independent review, and must never be
-- manufactured into looking like one occurred through this UI. The
-- formal independent review beginning once this migration is applied is
-- a distinct lifecycle event: the reviewer assesses the CURRENT live
-- content and records a fresh decision, which may legitimately differ
-- from Decision 246's own earlier record in either direction.
--
-- The idempotency guard checks family_id + decision + review_type + notes
-- together, matching migration 162's own exact convention.
--
-- Full review evidence for every target named below lives in
-- ALI_DECISION_LOG.md's own Decision 244/246 entries.
--
-- FAIL-CLOSED / NARROWLY SCOPED: touches public.ali_family_review only,
-- inserts exactly 4 rows, never touches ali_question_bank or
-- ali_passage_bank, cannot change eligibility_status, cannot activate
-- Practice or Mock (no such column or table is referenced anywhere
-- below), and cannot manufacture an Approved review (every decision
-- value inserted is 'pending_independent_review', never any other value
-- in the family_review_decision enum).
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migrations 166/167.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'passage', 'eng-inc003-peppersbreakfast', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'ENGLISH-CONTENT-FOUNDATION-INC003 new content review: passage "Pepper''s Breakfast" + its complete 7-numbered-question comprehension set (eng-inc003-peppersbreakfast-q01..q03, q04b/q04c/q04d/q04e, q05..q07)', 'mock_english_passage_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-inc003-peppersbreakfast' and decision = 'pending_independent_review'
    and review_type = 'mock_english_passage_independent_review'
    and notes = 'ENGLISH-CONTENT-FOUNDATION-INC003 new content review: passage "Pepper''s Breakfast" + its complete 7-numbered-question comprehension set (eng-inc003-peppersbreakfast-q01..q03, q04b/q04c/q04d/q04e, q05..q07)'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'passage', 'eng-inc003-compassrosechallenge', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'ENGLISH-CONTENT-FOUNDATION-INC003 new content review: passage "The Compass Rose Challenge" + its complete 7-numbered-question comprehension set (eng-inc003-compassrosechallenge-q01, q02a/q02b, q03..q07). Explicitly assessment-reserve / mock-track (Decision 244 Section 5) -- must not become Practice-eligible.', 'mock_english_passage_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-inc003-compassrosechallenge' and decision = 'pending_independent_review'
    and review_type = 'mock_english_passage_independent_review'
    and notes = 'ENGLISH-CONTENT-FOUNDATION-INC003 new content review: passage "The Compass Rose Challenge" + its complete 7-numbered-question comprehension set (eng-inc003-compassrosechallenge-q01, q02a/q02b, q03..q07). Explicitly assessment-reserve / mock-track (Decision 244 Section 5) -- must not become Practice-eligible.'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'passage', 'eng-inc003-salmonnavigation', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'ENGLISH-CONTENT-FOUNDATION-INC003 new content review: passage "How Salmon Find Their Way Home" + its complete 7-numbered-question comprehension set (eng-inc003-salmonnavigation-q01..q03, q04b/q04c/q04d/q04e, q05..q07). Non-fiction: see migration 166''s own FACTUAL VERIFICATION CONTROL header section for the real-world claims'' evidence basis, and Section 9 for the Decision 246 scientific-wording amendment, before reviewing.', 'mock_english_passage_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-inc003-salmonnavigation' and decision = 'pending_independent_review'
    and review_type = 'mock_english_passage_independent_review'
    and notes = 'ENGLISH-CONTENT-FOUNDATION-INC003 new content review: passage "How Salmon Find Their Way Home" + its complete 7-numbered-question comprehension set (eng-inc003-salmonnavigation-q01..q03, q04b/q04c/q04d/q04e, q05..q07). Non-fiction: see migration 166''s own FACTUAL VERIFICATION CONTROL header section for the real-world claims'' evidence basis, and Section 9 for the Decision 246 scientific-wording amendment, before reviewing.'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'eng-inc003-writing-wc01a-imaginedplace', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'ENGLISH-CONTENT-FOUNDATION-INC003 new content review: Continuous Writing prompt "An Invented Place" (eng-inc003-writing-imaginedplace-01, QT-WC-01a, imagination-based response shape -- see migration 167''s own header for why this is representable within the existing QT-WC-01a architecture without introducing a new task type)', 'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-inc003-writing-wc01a-imaginedplace' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
    and notes = 'ENGLISH-CONTENT-FOUNDATION-INC003 new content review: Continuous Writing prompt "An Invented Place" (eng-inc003-writing-imaginedplace-01, QT-WC-01a, imagination-based response shape -- see migration 167''s own header for why this is representable within the existing QT-WC-01a architecture without introducing a new task type)'
);

commit;
