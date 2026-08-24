-- Angel Digital 11+ — Migration 099
-- Mock Programme Increment 006, English Mock Content Foundation, Batch 001
-- (Track B) — Pending Independent Review Registration.
--
-- Registers the new content from migrations 097 (1 passage + its complete
-- 12-numbered-question comprehension set) and 098 (3 Continuous Writing
-- prompts) as awaiting an independent reviewer -- the same proactive
-- placeholder-seeding pattern migrations 067/079/082/089/092/096 already
-- established, included in this same increment rather than risking the
-- batch being invisible to /admin-beta/review.
--
-- FOUR rows total -- NOT thirteen (one per question) and NOT one per
-- Comprehension question family. Per migration 087's own design (and its
-- own explicit comment: "English Mock passage review uses the EXISTING
-- `passage` target type unchanged... already carries its complete
-- attached question set by construction"), the Comprehension passage and
-- its full 12-numbered-question set are reviewed together as ONE unit,
-- keyed by the passage's own id -- never approved by reviewing individual
-- questions in isolation. Continuous Writing prompts are each their own
-- distinct reviewable unit (migration 087's own `writing_prompt` target
-- type), so the 3 Writing prompts each get their own row.
--
-- review_type = 'mock_english_passage_independent_review' (passage row) /
-- 'mock_writing_prompt_independent_review' (3 Writing rows) -- migration
-- 087, applied (confirmed live: Decision 145/149's own real Mathematics
-- reviews already used this same constraint successfully). NOT
-- 'content_review'. This is deliberate, mirroring Decision 139's own
-- design: these rows record that MOCK-SPECIFIC independent validation is
-- awaited, a distinct governance question from an ordinary content_review
-- row.
--
-- reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status
-- changes -- the passage and all 16 new question rows (13 Comprehension +
-- 3 Writing) remain 'authentic_assessment_candidate' exactly as
-- migrations 097/098 left them. This migration inserts ONLY placeholder
-- rows recording that review is awaited; it does not itself constitute,
-- preselect, or imply any review decision, and no reviewer identity is
-- fabricated. Per this project's own standing rule (Decision 48/51
-- precedent, reaffirmed throughout the Mock programme), Claude must never
-- impersonate an independent reviewer or self-approve content -- this
-- migration performs neither.
--
-- The idempotency guard checks family_id + decision + review_type + notes
-- together, matching migration 089's own exact convention, so it can
-- never be satisfied by an unrelated historical row for the same id.
--
-- Full review evidence for every target named below lives in
-- ALI_DECISION_LOG.md's own next Decision entry (Track B section).
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migrations 097/098.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'passage', 'mock-eng-boathouse', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC006-ENGLISH-BATCH001 new content review: passage "The Boat in the Boathouse" + its complete 12-numbered-question comprehension set (mock-eng-boathouse-q01..q11, q12a/q12b)', 'mock_english_passage_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-eng-boathouse' and decision = 'pending_independent_review'
    and review_type = 'mock_english_passage_independent_review'
    and notes = 'MOCK-INC006-ENGLISH-BATCH001 new content review: passage "The Boat in the Boathouse" + its complete 12-numbered-question comprehension set (mock-eng-boathouse-q01..q11, q12a/q12b)'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'mock-writing-mindchange-01', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC006-ENGLISH-BATCH001 new content review: Continuous Writing prompt "A Time You Changed Your Mind" (QT-WC-01a)', 'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-writing-mindchange-01' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
    and notes = 'MOCK-INC006-ENGLISH-BATCH001 new content review: Continuous Writing prompt "A Time You Changed Your Mind" (QT-WC-01a)'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'mock-writing-kindness-01', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC006-ENGLISH-BATCH001 new content review: Continuous Writing prompt "An Act of Kindness" (QT-WC-01a)', 'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-writing-kindness-01' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
    and notes = 'MOCK-INC006-ENGLISH-BATCH001 new content review: Continuous Writing prompt "An Act of Kindness" (QT-WC-01a)'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'mock-writing-cookopinion-01', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'MOCK-INC006-ENGLISH-BATCH001 new content review: Continuous Writing prompt "Should Everybody Learn to Cook?" (QT-WC-01a)', 'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-writing-cookopinion-01' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
    and notes = 'MOCK-INC006-ENGLISH-BATCH001 new content review: Continuous Writing prompt "Should Everybody Learn to Cook?" (QT-WC-01a)'
);

commit;
