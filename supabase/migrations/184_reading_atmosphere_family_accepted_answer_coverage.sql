-- Angel Digital 11+ — Migration 184
-- Reading Comprehension Assessment Integrity Correction, Part 2:
-- accepted-answer coverage gap for 'w3-rc10-am-06'.
--
-- ============================================================
-- ROOT CAUSE
-- ============================================================
-- Distinct from migration 183's slash-alternate defect: this row's
-- acceptedAnswers array has no malformed "/" syntax at all. Its three
-- entries are simply too narrow to cover the space of valid learner
-- paraphrase for a fully open "what does this suggest about the
-- atmosphere" interpretation question -- confirmed by direct
-- reproduction during the Founder's Gate 4/5 walkthrough (live production
-- id 'w3-rc10-am-06', "The Storm at the Harbour"): the submitted answer
-- correctly identified unspoken tension/fear ("people are trying to hide"
-- their worry, "avoiding voicing their fear directly", "worried and on
-- edge") -- substantively the same idea as the row's own model answer --
-- but matched none of the three curated phrases as a contiguous token
-- sequence, and checkAcceptedAnswerSet (lib/learningEngine/
-- englishAnswerValidation.ts) correctly, faithfully applied its own
-- documented curated-list design and returned no match.
--
-- This is a content-curation gap, not a matcher defect and not a tier
-- misassignment -- TIER2_ACCEPTED_SET is left unchanged here (see the
-- Gate 4/5 Founder Handoff for the separate, disclosed-but-not-resolved
-- question of whether the whole QT-RC-10 family should instead move to
-- TIER5_NAMED_COMPONENT_PLUS_EXPLANATION, which is a Founder architecture
-- decision, not something this migration decides unilaterally).
--
-- ============================================================
-- FIX
-- ============================================================
-- Adds exactly one new accepted-answer entry, "avoiding voicing their
-- fear directly" -- a literal substring of the live walkthrough answer,
-- and a defensible, non-fabricated paraphrase of the existing model
-- answer's own "nobody wants to say so directly" idea. Additive only:
-- the three existing entries are untouched, so no previously-accepted
-- answer can regress.
--
-- Fail-closed and idempotent: the WHERE clause requires the CURRENT
-- acceptedAnswers array to exactly equal the documented pre-fix array.
--
-- Live, active content (already practice_eligible per this session's own
-- walkthrough evidence) -- this is a live production correctness fix.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["there is a hidden or unspoken worry among everyone present","people are anxious but trying not to show it openly","the tension is felt but not directly discussed","avoiding voicing their fear directly"]'::jsonb)
where id = 'w3-rc10-am-06'
  and prompt->'acceptedAnswers' = '["there is a hidden or unspoken worry among everyone present","people are anxious but trying not to show it openly","the tension is felt but not directly discussed"]'::jsonb;

commit;
