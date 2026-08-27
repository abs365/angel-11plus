-- Angel Digital 11+ — Migration 153
-- English Educational Content Foundation, Increment 001 (Decision 228)
-- — Continuous Writing Prompt Depth.
--
-- Adds 3 new, genuinely-authored Continuous Writing candidate prompts to
-- public.ali_question_bank (subject = 'writing'), following the exact
-- schema/eligibility pattern migration 098 already established.
--
-- WHY THIS MIGRATION EXISTS: Decision 227's own audit found only 3
-- existing Writing instances, all QT-WC-01a, a genuinely thin prompt
-- pool relative to sustained multi-month use. This migration expands
-- that pool to 6 total QT-WC-01a instances — still bounded, per this
-- task's own explicit "prefer quality... over hitting an arbitrary
-- count" instruction, not an attempt to reach Decision 227's own
-- HEALTHY target in one increment.
--
-- QUESTION TYPE: QT-WC-01a (Reflective/Discursive Response Prompt) only,
-- the SAME evidenced type migration 098 used — no new Question Type is
-- invented.
--
-- PICTURE-STIMULUS BOUNDARY, EXPLICITLY HELD: QT-WC-01b (Picture-
-- Stimulus Narrative Prompt, always Question 2, "Write a story based on
-- the picture below") is NOT authored here, and no text-based substitute
-- is silently offered in its place. `types/index.ts`'s own WritingPrompt
-- interface still has no image field, and no image-asset pipeline exists
-- anywhere in this codebase (re-confirmed this session, unchanged since
-- migration 098's own identical finding). This is a genuine, disclosed,
-- deferred gap for a separately-scoped future capability increment
-- (infrastructure work, not content authoring) — not worked around here.
--
-- GENUINE STRUCTURAL DIVERSITY, NOT SUPERFICIAL TOPIC SUBSTITUTION: the
-- three prompts below use three further distinct underlying prompt
-- SHAPES, each documented per-row in its own `explanation` field, and
-- each genuinely distinct from BOTH the 3 existing prompts (migration
-- 098) and from each other: (1) a place-arrival narrative (unfamiliar-
-- to-familiar structure, distinct from the existing mindchange prompt's
-- opinion-shift structure); (2) an error-and-growth narrative (mistake/
-- consequence/changed-approach, centred on a single action rather than a
-- belief or a relationship); (3) a direct opinion-question format
-- (mirroring the existing cookopinion prompt's own evidenced shape, with
-- a genuinely unrelated topic — screen time, not cooking).
--
-- AI-SCORING BOUNDARY, UNTOUCHED: `app/api/writing-feedback/route.ts`,
-- `WRITING_CORRECTNESS_THRESHOLD`, and the `supportTier: "supported"`
-- mastery-quarantine gate (Decisions 47/60/61/106, re-confirmed standing
-- by Decision 227) are not read, imported, referenced, or modified
-- anywhere in this migration. No new prompt here is wired to, exempted
-- from, or given special treatment by that boundary — it inherits the
-- existing, unedited discipline automatically, the same way every other
-- 'writing' subject row already does. No fabricated numerical writing
-- score is introduced anywhere.
--
-- No hidden model answer: `checklist` entries describe structural/
-- technique expectations only, matching migration 098's own established
-- convention — never a pre-written sample response a learner could copy.
--
-- eligibility_status = 'authentic_assessment_candidate' on every row —
-- NOT 'independently_validated', NOT 'mock_eligible'. See migration 154
-- for the pending-review placeholder records. No review approval of any
-- kind is granted by this migration.
--
-- Practice isolation: no existing ali_question_bank row (including any
-- of the 3 existing 'writing' subject rows from migration 098, or wrt-
-- 003 from migration 013) is read, referenced, or modified by this
-- migration. Every id below is new.
--
-- Idempotent: the INSERT uses "on conflict (id) do nothing".
--
-- NOT APPLIED. Generated for independent-reviewer and Founder inspection
-- via Supabase Dashboard > SQL Editor > New query, after migration 098
-- has already been applied (no ordering dependency between this
-- migration and 152 beyond both following migration 098).

begin;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-writing-newplace-01', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
 $json${"id":"mock-writing-newplace-01","title":"Somewhere New","prompt":"Write about a time you visited somewhere completely new to you -- it could be a place you moved to, a place you visited on holiday, or even a new school or club. Describe what you noticed first, how the place felt different from what you were used to, and how your feelings about it changed the more time you spent there.","type":"descriptive","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Describe a specific, real place, not a vague or invented one","Include at least one concrete sensory detail (something you saw, heard, or noticed specifically)","Show HOW your feelings changed over time, not only that they did","Organise your writing so the order makes sense -- first impressions before later feelings","Check paragraphing, spelling and punctuation carefully"]}$json$,
 'Angel English Content Foundation, Increment 001 (Decision 228). QT-WC-01a (Reflective/Discursive Response Prompt), competency WC-01, family mock-writing-wc01a-newplace. Prompt shape: place-arrival narrative (unfamiliar-to-familiar structure), genuinely distinct from the existing mindchange (opinion-shift), kindness (relationship-emotion), and cookopinion (direct-opinion) prompts, and from this increment''s own other two prompts below.', 3, 'mock-writing-newplace-01',
 'mock-writing-wc01a-newplace', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Describing the place in general, guidebook-style terms (''it was big and busy'') rather than specific, personally-noticed details, and stating that feelings changed without showing the actual moments that caused the change.',
 'FAR_TRANSFER'),

('mock-writing-mistakelearned-01', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
 $json${"id":"mock-writing-mistakelearned-01","title":"A Mistake You Learned From","prompt":"Write about a time you made a mistake and what you learned from it. Explain what happened, how you felt at the time, and what you would do differently if you faced the same situation again.","type":"descriptive","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Describe a specific, genuine mistake -- not a vague 'I made mistakes sometimes'","Explain honestly how you felt at the time, including any embarrassment or frustration, not only a tidy positive ending","Explain clearly what you would do differently now, connecting it to what actually went wrong","Avoid choosing a mistake so serious or personal that it would be uncomfortable to write about in an exam setting","Check paragraphing, spelling and punctuation carefully"]}$json$,
 'Angel English Content Foundation, Increment 001 (Decision 228). QT-WC-01a (Reflective/Discursive Response Prompt), competency WC-01, family mock-writing-wc01a-mistakelearned. Prompt shape: error-and-growth narrative (mistake/consequence/changed-approach structure), distinct from the mindchange prompt''s before/turning-point/after shape since this centres on a single ACTION and its consequence, not a shift in opinion or belief.', 3, 'mock-writing-mistakelearned-01',
 'mock-writing-wc01a-mistakelearned', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Writing only about the mistake itself without ever reaching the ''what I learned'' or ''what I would do differently'' element the prompt explicitly requires, leaving the reflective half of the task unaddressed.',
 'FAR_TRANSFER'),

('mock-writing-screentime-01', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
 $json${"id":"mock-writing-screentime-01","title":"Should Children Have Limits on Screen Time?","prompt":"Do you think there should be limits on how much time children spend using phones, tablets, or screens? Write about your own opinion, using your own experience or things you have noticed to support what you think.","type":"descriptive","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","State your own opinion clearly, near the start","Support your opinion with your own experience or something you have genuinely noticed, not a generic list of reasons","Consider, briefly, why someone might disagree with you","Keep a consistent personal voice throughout, since this is your own opinion, not a formal debate speech","Organise your writing into clear paragraphs","Check spelling and punctuation carefully"]}$json$,
 'Angel English Content Foundation, Increment 001 (Decision 228). QT-WC-01a (Reflective/Discursive Response Prompt), competency WC-01, family mock-writing-wc01a-screentime. Prompt shape: direct opinion-question format, the same evidenced shape as the existing cookopinion prompt (mirroring CSSE-009''s own real 2022 format), with a genuinely different, age-relevant topic -- not a re-skin, since the underlying reasoning content (screen time versus cooking) is unrelated.', 3, 'mock-writing-screentime-01',
 'mock-writing-wc01a-screentime', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Treating the prompt as a formal persuasive-speech task (rhetorical devices, addressing an audience directly) rather than the reflective, first-person opinion piece the evidence shows this format actually requires.',
 'FAR_TRANSFER')
on conflict (id) do nothing;

commit;
