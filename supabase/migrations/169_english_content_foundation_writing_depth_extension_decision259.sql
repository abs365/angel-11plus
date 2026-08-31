-- Angel Digital 11+ — Migration 169
-- English Content Foundation, Writing Depth Extension (Decision 259) —
-- Candidate Content Only.
--
-- ================================================================
-- WHY THIS MIGRATION EXISTS
-- ================================================================
-- Decision 258 established that Continuous Writing Practice has never
-- had any content authorised onto the `practice_eligible` track, and
-- that this is a genuine Founder authorisation gap, not a defect.
-- Decision 259 asked, separately from that authorisation question,
-- whether the existing 7-prompt QT-WC-01a pool has enough genuine
-- response-demand breadth to be worth authorising once the Founder does
-- decide to activate Practice. Auditing all 7 existing rows (migrations
-- 098, 153, 167) against docs/intelligence/CSSE_QUESTION_INTELLIGENCE_
-- FRAMEWORK.md §5/§7 (read directly this session) found:
--
--   - Real evidence (CSSE-004, CSSE-009, CSSE-014, the only three QT-
--     WC-01a Question-1 assets this project has ever observed) shows
--     exactly two demand shapes: a "favourite place/building" reflective-
--     descriptive prompt (CSSE-004, CSSE-014) and a "Do you think X?"
--     direct-opinion prompt (CSSE-009).
--   - Of the 7 existing prompts, `mock-writing-cookopinion-01` and
--     `mock-writing-screentime-01` are structurally identical to each
--     other — same opening template sentence ("Do you think X? Write
--     about your own opinion, using your own experience or things you
--     have noticed to support what you think."), same 7-item checklist
--     verbatim, different noun only. This is exactly the "structurally
--     the same task with different nouns" pattern Decision 259 §E warns
--     against, already present in the pool.
--   - No existing prompt uses the CSSE-004/014-evidenced "favourite
--     place" descriptive-justificatory shape (describe a real, already-
--     established favourite thing and explain why it matters) — the
--     closest existing prompt, `mock-writing-newplace-01` ("Somewhere
--     New"), is a change-over-time narrative about an unfamiliar place,
--     a different rhetorical demand.
--   - No existing opinion prompt requires the candidate to engage with
--     a stated second position before giving their own — every existing
--     opinion prompt's checklist treats considering disagreement as one
--     optional, easily-skippable item ("Consider, briefly, why someone
--     might disagree with you"), not a structural requirement.
--
-- Both gaps sit entirely within QT-WC-01a's own evidenced Measurement
-- Purpose (experience, opinion, or imagination — docs/intelligence/
-- CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md §5) and within its own
-- Confidence HIGH / EMC-3 evidence base. No new skill value, no new
-- Question Type, no QT-WC-01c is introduced. QT-WC-01b (picture-
-- stimulus) remains untouched and unblocked by this migration — no
-- image pipeline, storage, rights, or accessibility work of any kind.
--
-- ================================================================
-- THE TWO NEW PROMPTS
-- ================================================================
-- "Your Favourite Place to Be" — a descriptive-justificatory prompt
-- directly grounded in the CSSE-004 ("favourite place ... to relax")
-- and CSSE-014 ("favourite building") evidenced asset shape, genuinely
-- distinct in rhetorical demand from every existing experience-based
-- prompt (no narrated event, no before/after change, no lesson-learned
-- arc — sustained description-and-justification of an existing,
-- familiar preference instead).
--
-- "Pocket Money or Helping Anyway?" — an opinion prompt that states two
-- named positions in the question itself and requires the candidate to
-- refer to both before giving their own view, a genuinely different
-- structural demand from the existing "Do you think X?" template (which
-- states no second position and only optionally invites considering
-- one). Same QT-WC-01a opinion basis as the evidenced CSSE-009 asset;
-- distinct topic (age-relevant, no overlap with cooking/screen-time) and
-- distinct required structure.
--
-- Every checklist item below is classified core/coaching in
-- lib/writing/supportLevelPolicy.ts's WRITING_CHECKLIST_ITEM_SUPPORT_
-- LEVELS table (Decision 256/257/258 architecture) — length and
-- proofreading items `core`, every writing-technique item `coaching` —
-- using the exact same generic classifier every other QT-WC-01a prompt
-- uses; no prompt-specific rendering logic is added anywhere.
--
-- eligibility_status = 'authentic_assessment_candidate' -- NOT
-- 'practice_eligible', NOT 'independently_validated', NOT
-- 'mock_eligible'. No existing ali_question_bank row is read,
-- referenced, or modified. No ali_family_review row is written.
--
-- Idempotent: the INSERT uses "on conflict (id) do nothing".
--
-- NOT APPLIED. Generated for independent-reviewer and Founder inspection
-- via Supabase Dashboard > SQL Editor > New query.

begin;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('eng-inc003-writing-favouriteplace-01', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
 $json${"id":"eng-inc003-writing-favouriteplace-01","title":"Your Favourite Place to Be","prompt":"Write about a place where you feel most relaxed or comfortable -- it could be somewhere in your home, somewhere outdoors, or anywhere else that matters to you. Describe what the place is like, and explain why it makes you feel this way.","type":"descriptive","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Describe a specific, real place you actually spend time in, not a vague or general type of place","Include at least one concrete sensory detail -- something you see, hear, or notice there","Explain clearly WHY this place makes you feel relaxed or comfortable, not only what it looks like","Organise your writing into clear paragraphs","Check paragraphing, spelling and punctuation carefully"]}$json$,
 'Angel English Content Foundation, Writing Depth Extension (Decision 259). QT-WC-01a (Reflective/Discursive Response Prompt), competency WC-01, family eng-inc003-writing-wc01a-favouriteplace. Evidence: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md Confidence HIGH, EMC-3, directly grounded in the CSSE-004 ("favourite place ... to relax") and CSSE-014 ("favourite building") evidenced asset shape. Prompt shape: descriptive-justificatory reflection on an existing, familiar preference -- genuinely distinct from every existing experience-based prompt''s narrated-event/before-after structure, including mock-writing-newplace-01''s change-over-time-in-an-unfamiliar-place shape.', 3, 'eng-inc003-writing-favouriteplace-01',
 'eng-inc003-writing-wc01a-favouriteplace', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Describing the place only in generic sensory terms without ever explaining WHY it produces the relaxed/comfortable feeling, leaving the prompt''s required justification unanswered -- or choosing a vague category of place ("my bedroom", with no distinguishing detail) rather than a specific, particular one.',
 'NEAR_TRANSFER'),

('eng-inc003-writing-pocketmoney-01', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
 $json${"id":"eng-inc003-writing-pocketmoney-01","title":"Pocket Money or Helping Anyway?","prompt":"Some people think children should be given pocket money for helping at home. Other people think children should help at home anyway, without being paid for it. What do you think, and why?","type":"descriptive","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Refer to both views given in the question, not only the one you agree with","State clearly which view you agree with, or explain a genuine middle position, and why","Support your view with your own experience or something you have genuinely noticed, not a generic list of reasons","Keep a consistent personal voice throughout, since this is your own opinion, not a formal debate speech","Organise your writing into clear paragraphs","Check spelling and punctuation carefully"]}$json$,
 'Angel English Content Foundation, Writing Depth Extension (Decision 259). QT-WC-01a, competency WC-01, family eng-inc003-writing-wc01a-pocketmoney. Evidence: Confidence HIGH, EMC-3, same evidenced opinion basis as CSSE-009 ("Do you think that food can change a person''s mood?"). Prompt shape: two-position dilemma engagement -- genuinely distinct structural demand from mock-writing-cookopinion-01 and mock-writing-screentime-01, which are structurally identical to each other (same "Do you think X?" template, same 7-item checklist verbatim, noun-swapped topic only); this prompt states both positions in the question itself and requires the candidate to refer to both, not merely optionally "consider" disagreement as an easily-skippable checklist item.', 3, 'eng-inc003-writing-pocketmoney-01',
 'eng-inc003-writing-wc01a-pocketmoney', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Answering as if only one view was offered -- stating an opinion without ever referring to the second, named position -- which fails the prompt''s explicit two-position framing even if the opinion itself is well argued.',
 'MIXED_TRANSFER')
on conflict (id) do nothing;

commit;
