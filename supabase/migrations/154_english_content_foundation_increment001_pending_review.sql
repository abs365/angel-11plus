-- Angel Digital 11+ — Migration 154
-- English Educational Content Foundation, Increment 001 (Decision 228)
-- — Pending Independent Review Registration.
--
-- Registers the new content from migrations 152 (2 passages + their
-- complete 7- and 8-question comprehension sets) and 153 (3 Continuous
-- Writing prompts) as awaiting an independent reviewer — the same
-- proactive placeholder-seeding pattern migration 099 already
-- established for the existing certified passage and Writing prompts,
-- included in this same increment rather than risking the batch being
-- invisible to /admin-beta/review.
--
-- FIVE rows total — NOT 15 (one per comprehension question) and NOT 18
-- (one per every new row). Per migration 087's own design (unchanged,
-- re-applied identically to migration 099's own precedent): each
-- Comprehension passage and its complete attached question set is
-- reviewed together as ONE unit, keyed by the passage's own id — never
-- approved by reviewing individual questions in isolation. Each
-- Continuous Writing prompt is its own distinct reviewable unit, so the
-- 3 new Writing prompts each get their own row.
--
-- review_type = 'mock_english_passage_independent_review' (the 2
-- passage rows) / 'mock_writing_prompt_independent_review' (the 3
-- Writing rows) — the SAME two review_type values migration 099 already
-- used, not new ones. reviewer is explicitly 'UNASSIGNED'. No row's
-- eligibility_status changes — the 2 passages and all 18 new question
-- rows (15 Comprehension + 3 Writing) remain 'authentic_assessment_
-- candidate' exactly as migrations 152/153 left them. This migration
-- inserts ONLY placeholder rows recording that review is awaited; it
-- does not itself constitute, preselect, or imply any review decision,
-- and no reviewer identity is fabricated. Per this project's own
-- standing rule (Decision 48/51 precedent, reaffirmed throughout the
-- Mock programme), Claude must never impersonate an independent
-- reviewer or self-approve content — this migration performs neither.
--
-- The idempotency guard checks family_id + decision + review_type +
-- notes together, matching migration 099's own exact convention.
--
-- Full review evidence for every target named below lives in
-- ALI_DECISION_LOG.md's own Decision 228 entry and in
-- ANGEL_ENGLISH_CONTENT_FOUNDATION_INCREMENT_001_REVIEW.md (repo root).
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migrations 152/153.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'passage', 'eng-inc001-understudy-narrative', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'ENGLISH-CONTENT-FOUNDATION-INC001 new content review: passage "The Understudy" + its complete 7-numbered-question comprehension set (eng-inc001-understudy-q01..q07)', 'mock_english_passage_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-inc001-understudy-narrative' and decision = 'pending_independent_review'
    and review_type = 'mock_english_passage_independent_review'
    and notes = 'ENGLISH-CONTENT-FOUNDATION-INC001 new content review: passage "The Understudy" + its complete 7-numbered-question comprehension set (eng-inc001-understudy-q01..q07)'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'passage', 'eng-inc001-bee-navigation-informational', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'ENGLISH-CONTENT-FOUNDATION-INC001 new content review: passage "How Bees Find Their Way Home" + its complete 8-numbered-question comprehension set (eng-inc001-bee-q01..q08)', 'mock_english_passage_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-inc001-bee-navigation-informational' and decision = 'pending_independent_review'
    and review_type = 'mock_english_passage_independent_review'
    and notes = 'ENGLISH-CONTENT-FOUNDATION-INC001 new content review: passage "How Bees Find Their Way Home" + its complete 8-numbered-question comprehension set (eng-inc001-bee-q01..q08)'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'mock-writing-wc01a-newplace', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'ENGLISH-CONTENT-FOUNDATION-INC001 new content review: Continuous Writing prompt "Somewhere New" (QT-WC-01a)', 'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-writing-wc01a-newplace' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
    and notes = 'ENGLISH-CONTENT-FOUNDATION-INC001 new content review: Continuous Writing prompt "Somewhere New" (QT-WC-01a)'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'mock-writing-wc01a-mistakelearned', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'ENGLISH-CONTENT-FOUNDATION-INC001 new content review: Continuous Writing prompt "A Mistake You Learned From" (QT-WC-01a)', 'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-writing-wc01a-mistakelearned' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
    and notes = 'ENGLISH-CONTENT-FOUNDATION-INC001 new content review: Continuous Writing prompt "A Mistake You Learned From" (QT-WC-01a)'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'mock-writing-wc01a-screentime', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'ENGLISH-CONTENT-FOUNDATION-INC001 new content review: Continuous Writing prompt "Should Children Have Limits on Screen Time?" (QT-WC-01a)', 'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-writing-wc01a-screentime' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
    and notes = 'ENGLISH-CONTENT-FOUNDATION-INC001 new content review: Continuous Writing prompt "Should Children Have Limits on Screen Time?" (QT-WC-01a)'
);

commit;
