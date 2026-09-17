-- Angel Digital 11+ — Migration 255
-- Educational Depth Phase 1, Wave 2 — Writing Picture-Led Narrative
-- Practice Content (the first Practice-track QT-WC-01b row).
--
-- ============================================================
-- WHY THIS EXISTS
-- ============================================================
-- ANGEL_PROJECT_STATE.md's own "Known material educational risks" (Wave
-- 1's live-production baseline) named this exact gap: "Picture-led
-- narrative has zero Practice content and zero teaching content -- it
-- exists only as a Mock task." Confirmed again this session by direct
-- live query: all 7 practice_eligible 'writing' rows are QT-WC-01a
-- (reflective/discursive); zero rows anywhere in the bank carry
-- skill = 'QT-WC-01b' (confirmed by direct REST query against
-- ali_question_bank, both eligibility-filtered and unfiltered).
--
-- The two blockers migration 153 and migration 198 each explicitly
-- disclosed when they deliberately held this content back ("no image
-- field on WritingPrompt", "no image-asset pipeline exists anywhere in
-- this codebase") are now both resolved by this Wave's own code change,
-- committed alongside this migration: `types/index.ts`'s WritingPrompt
-- gained an optional `stimulus` field, `lib/learningEngine/
-- writingPracticeContent.ts`'s isValidWritingPrompt validates it, and
-- `app/learning-intelligence/practice/[area]/page.tsx`'s WritingActivity
-- renders it. This migration is the first real content to exercise that
-- new path.
--
-- ============================================================
-- AN ORIGINAL, SECOND IMAGE ASSET -- DELIBERATELY DISTINCT FROM MOCK''S
-- ============================================================
-- public/practice-assets/writing-picture-narrative/riverboat-v1.svg is a
-- new, hand-authored SVG (flat/stylised vector art, no photographic or
-- copyrighted source material), genuinely distinct from Mock''s own Q2
-- picture (migration 246''s old-shed-v1.svg): a misty riverbank at dawn
-- with a rowing boat and a bicycle, not a shed in a garden at dusk.
-- This is a deliberate assessment-integrity choice, not an oversight --
-- Mock content is sealed (angel-assessment-governance: "Mock content
-- must never leak into, or be previewed by, Practice"). Reusing the
-- exact Mock picture in Practice would let a learner rehearse a story for
-- the specific image they could later meet in a real, timed Mock sitting,
-- undermining the "unfamiliar picture" demand this question type
-- actually tests. A new stimulus was required, not merely permitted.
--
-- ============================================================
-- CONTENT GOVERNANCE STAGE -- authentic_assessment_candidate, matching
-- this repository''s own established first-content convention
-- ============================================================
-- Every prior first-of-a-kind Writing content migration (098, 153, 169,
-- 196, 198) entered at eligibility_status = 'authentic_assessment_
-- candidate', never straight to 'practice_eligible' -- promotion is a
-- separate, later, explicitly disclosed decision (see migrations 200/
-- 203/204''s own promotion-only pattern). This migration follows that
-- exact convention: it is new content of a genuinely new response shape
-- (the first image-stimulus row Practice has ever carried), so it
-- receives the same review-before-reachable treatment as every other
-- first-of-a-kind row, not an exception.
--
-- No learner can reach this row through this migration alone: candidate-
-- stage content is excluded by fetchEligibleWritingPrompts'' own
-- eligibility_status = 'practice_eligible' filter (lib/learningEngine/
-- writingPracticeContent.ts, unchanged by this migration).
--
-- ============================================================
-- GENUINE STRUCTURAL DIVERSITY
-- ============================================================
-- Distinct from every existing QT-WC-01a row in this bank on multiple
-- axes at once, not merely in topic: response shape (image-stimulus
-- narrative vs. text-only reflective/discursive), reasoning demand
-- (observe visual evidence -> generate plausible story possibilities ->
-- commit to one direction, vs. recall/organise a real or imagined
-- personal experience), and the checklist''s own substantive
-- requirement to stay grounded in specific visual evidence rather than
-- personal recollection.
--
-- No hidden model answer: `checklist` entries describe structural/
-- technique expectations only, matching every prior Writing migration''s
-- own established convention -- never a pre-written sample response a
-- learner could copy.
--
-- AI-SCORING BOUNDARY, UNTOUCHED: `app/api/writing-feedback/route.ts`,
-- `WRITING_CORRECTNESS_THRESHOLD`, and the `supportTier: "supported"`
-- mastery-quarantine gate are not read, imported, referenced, or
-- modified anywhere in this migration. This row inherits the existing,
-- unedited discipline automatically, the same way every other 'writing'
-- subject row already does.
--
-- Practice isolation: no existing ali_question_bank row (Mock''s
-- eng-q2-picturenarrative-oldshed included) is read, referenced, or
-- modified by this migration. The id below is new.
--
-- Idempotent: the INSERT uses "on conflict (id) do nothing".
--
-- ============================================================
-- CHECKLIST SUPPORT-LEVEL CLASSIFICATION
-- ============================================================
-- lib/writing/supportLevelPolicy.ts's WRITING_CHECKLIST_ITEM_SUPPORT_
-- LEVELS is updated in the same commit as this migration to classify
-- every one of this row's 7 checklist items (core/coaching), matching
-- that file's own standing rule that new content is classified on
-- authoring, never left to the unaudited-content default.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 001-254
-- (per this arc's own standing record) have already been applied.

begin;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('eng-practice-writing-picturenarrative-riverboat-01', 'writing', 'QT-WC-01b', array['csse'], 'hard', 'open-response', 1500,
 $json${"id":"eng-practice-writing-picturenarrative-riverboat-01","title":"The Riverboat at Dawn","prompt":"Write a story based on the picture below.","type":"picture-narrative","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Base your story on specific details you can actually see in the picture, not an idea unrelated to it","Decide on ONE clear narrative direction, and introduce who is in your story, or who might arrive, early on","Include a clear turning point or moment of change, not just a description of the scene","Use precise, well-chosen vocabulary and varied sentences","Organise your writing into clear paragraphs","Check spelling and punctuation carefully"],"stimulus":{"type":"image","imageAssetUrl":"/practice-assets/writing-picture-narrative/riverboat-v1.svg","altText":"A small wooden rowing boat rests on a misty riverbank at dawn. Its oars lie across the bench seats, and a rope trails loosely into the still water. A bicycle leans against a nearby willow tree, and pale morning light glows through drifting mist over the river."}}$json$,
 'Angel Educational Depth Phase 1, Wave 2. QT-WC-01b (Picture-Stimulus Narrative Prompt), competency WC-01, family eng-practice-writing-wc01b-riverboat. Evidence: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md, HIGH/EMC-4, format position (always Question 2) and "write a story based on the picture below" phrasing, the SAME evidence basis migration 246 already established for Mock''s Q2 row -- reused here for the equivalent Practice-track task type, not re-derived. Prompt shape: picture-narrative, genuinely distinct from every QT-WC-01a row in this bank (image-stimulus, not personal-experience recall) and from Mock''s own Q2 row (a different original image, so Practice never previews the exact scene a learner could later meet in a sealed Mock sitting).', 3, 'eng-practice-writing-picturenarrative-riverboat-01',
 'eng-practice-writing-wc01b-riverboat', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Describing the picture itself (a static scene description) rather than writing a story that uses it as a starting point -- the marker cannot credit narrative writing that never actually narrates a sequence of events.',
 'FAR_TRANSFER')
on conflict (id) do nothing;

commit;

-- ============================================================
-- MIGRATION SAFETY REVIEW
-- ============================================================
-- - One guarded, idempotent content INSERT (on conflict do nothing),
--   inserts exactly one new row, no existing row touched.
-- - No schema, function, or RLS change.
-- - Cannot affect Mathematics, Reading Comprehension, any existing
--   Writing row, or Mock's own eng-q2-picturenarrative-oldshed row.
--
-- ============================================================
-- RLS REVIEW
-- ============================================================
-- No RLS policy created, altered, or referenced. ali_question_bank's
-- existing policies (migration 084 and earlier) already cover this row;
-- eligibility_status = 'authentic_assessment_candidate' means it is not
-- selectable through the anon-key practice_eligible filter any Practice
-- surface actually uses.
--
-- ============================================================
-- BACKWARD COMPATIBILITY
-- ============================================================
-- Purely additive: one new row, new id, new family_id. Every existing
-- reader of ali_question_bank is unaffected.
--
-- ============================================================
-- ROLLBACK
-- ============================================================
-- `delete from public.ali_question_bank where id = 'eng-practice-writing-picturenarrative-riverboat-01';`
-- Safe at any time -- no other object depends on this row while it
-- remains a candidate.
