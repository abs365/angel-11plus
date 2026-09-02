-- Angel Digital 11+ — Migration 196
-- Angel Programme Completion, Increment 003 (Founder directive) — two new
-- Continuous Writing candidate prompts, closing the disclosed narrative /
-- pure-descriptive response-shape gap.
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Increment 002's reconciliation of the existing Writing prompt inventory
-- found the real, reviewable estate (migrations 098/169, plus the sole
-- provisional legacy row wrt-003) concentrated entirely in opinion/
-- argument (3 rows) and personal/reflective (3 rows), with ZERO narrative
-- shape and ZERO pure-descriptive shape anywhere in `ali_question_bank`.
-- The Founder's Increment 003 directive named exactly this as the gap to
-- close: "Author a meaningful bounded batch... vary genuinely in purpose,
-- imaginative demand, narrative structure, descriptive demand."
--
-- Both new prompts stay within QT-WC-01a (Reflective/Discursive Response
-- Prompt) — the ONE CSSE-evidenced Writing question type (Confidence
-- HIGH, EMC-3, per CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md, migration
-- 098's own evidence basis, reused unchanged here). QT-WC-01b (picture-
-- stimulus narrative) is deliberately NOT attempted — no image-asset
-- pipeline exists anywhere in this codebase (re-confirmed this session),
-- matching migration 098's own disclosed, unfilled gap exactly. Genuine
-- shape diversity is achieved WITHIN the one evidenced type, exactly as
-- migration 098 itself already demonstrated (three different underlying
-- shapes, one Question Type):
--   1. "Something You Found Difficult" — a narrative-flavoured reflective
--      prompt (before/during/after structure around a single sustained
--      difficult task), genuinely distinct from migration 098's own
--      personal-change and kindness prompts (different structural focus:
--      an ongoing task, not a single turning-point moment or a single
--      relationship/emotion).
--   2. "A Place That Means Something to You" — a descriptive-led
--      reflective prompt (sensory, place-focused description, THEN
--      personal significance), genuinely distinct from every existing
--      prompt, all of which are event- or opinion-led rather than
--      description-led.
--
-- ============================================================
-- ASSESSMENT INSTRUCTION vs. ANGEL COACHING GUIDANCE
-- ============================================================
-- Per this session's own Increment 002 finding (re-confirmed this
-- increment): "Write at least six sentences" is genuine CSSE-evidenced
-- assessment instruction (writingRubric.ts's own MINIMUM_SENTENCE_COUNT,
-- sourced from CONTINUOUS_WRITING_EVIDENCE_REVIEW_V1.md §1, found across
-- 3/3 real past-paper years) — retained, unchanged, as the first
-- checklist item on both new prompts. Every OTHER checklist item below is
-- explicitly Angel's own coaching scaffolding (use specific sensory
-- detail; organise into paragraphs; check spelling/punctuation; vary
-- vocabulary) — genuinely useful for a Practice environment, but never
-- worded as if it were an authentic CSSE exam instruction. This
-- distinction matters only for content destined for a sealed Mock
-- sitting; these two rows are Practice-track candidates
-- (`authentic_assessment_candidate`), matching every other Writing row's
-- own entry point — coaching scaffolding is appropriate here by design.
--
-- eligibility_status = 'authentic_assessment_candidate' on both rows —
-- NOT 'practice_eligible'. See migration 197 for the pending-independent-
-- review placeholder record. No existing row is read, referenced, or
-- modified. No mock_eligible or Mathematics Mock 1 row is touched.
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
('eng-pc003-writing-difficulttask', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
 $json${"id":"eng-pc003-writing-difficulttask","title":"Something You Found Difficult","prompt":"Write about a time when you had to do something you found genuinely difficult, even though you didn't want to do it. Explain what the task was, why it was hard for you, and how you felt once it was over.","type":"narrative","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Describe the specific task clearly -- what it actually was, not just 'something hard'","Explain what made it difficult FOR YOU specifically, not difficulty in general","Describe how you actually felt while doing it, not only afterwards","End with how you feel about it now, looking back","Organise your writing into clear paragraphs","Check your spelling and punctuation before you finish"]}$json$,
 'Programme Completion Increment 003 (Founder directive). QT-WC-01a (Reflective/Discursive Response Prompt), competency WC-01, family mock-writing-wc01a-difficulttask. Evidence: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md, Confidence HIGH, EMC-3 (format position and reflective/discursive demand consistent 3/3 years; topic content itself genuinely unpredictable, per the Framework''s own limitation note) -- the same evidence basis migration 098 already established; no new archetype invented, no QT-WC-01b (picture-stimulus) attempted (no image-asset pipeline exists, matching migration 098''s own disclosed gap). Prompt shape: narrative-of-a-difficult-personal-task (before/during/after structure, centred on a single sustained task), genuinely distinct from migration 098''s own personal-change and kindness prompts and from migration 169''s favourite-place/pocket-money prompts.', 3, 'eng-pc003-writing-difficulttask',
 'mock-writing-wc01a-difficulttask', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Describing only the task and its difficulty without ever explaining the personal feeling before/during/after, leaving the required reflective dimension of the prompt unaddressed.',
 'FAR_TRANSFER'),

('eng-pc003-writing-meaningfulplace', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
 $json${"id":"eng-pc003-writing-meaningfulplace","title":"A Place That Means Something to You","prompt":"Describe a place that means something to you -- somewhere you go often, or somewhere you only visited once but never forgot. Explain what the place is like, and why it matters to you.","type":"descriptive","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Use specific, sensory detail to describe the place -- what you can see, hear, or notice there, not just a general label like 'nice' or 'cosy'","Explain clearly WHY the place matters to you, not only what it looks like","Make sure both the description and the explanation of why it matters come through clearly","Use precise, varied vocabulary rather than repeating the same describing words","Check your spelling and punctuation before you finish"]}$json$,
 'Programme Completion Increment 003 (Founder directive). QT-WC-01a (Reflective/Discursive Response Prompt), competency WC-01, family mock-writing-wc01a-meaningfulplace. Evidence: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md, Confidence HIGH, EMC-3 (format position and reflective/discursive demand consistent 3/3 years; topic content itself genuinely unpredictable, per the Framework''s own limitation note) -- the same evidence basis migration 098 already established; no new archetype invented, no QT-WC-01b (picture-stimulus) attempted (no image-asset pipeline exists, matching migration 098''s own disclosed gap). Prompt shape: genuinely descriptive-led (sensory, place-focused) rather than event/opinion-led, closing the pure-descriptive gap the Increment 002 reconciliation found zero coverage for in ali_question_bank.', 3, 'eng-pc003-writing-meaningfulplace',
 'mock-writing-wc01a-meaningfulplace', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Producing a vague physical description with no personal reflection on WHY the place matters, treating this as a pure descriptive-writing task rather than the reflective/discursive demand QT-WC-01a actually evidences.',
 'FAR_TRANSFER')
on conflict (id) do nothing;

commit;
