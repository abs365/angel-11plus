-- Angel Digital 11+ — Migration 257
-- Educational Depth Phase 1, Wave 2 — Writing Picture-Led Narrative,
-- REPLACEMENT Practice Content (the first candidate, migration 255's
-- "The Riverboat at Dawn", was independently reviewed by the Founder via
-- the live /admin-beta/review interface after migration 256 was applied,
-- and REJECTED).
--
-- ============================================================
-- WHY THIS EXISTS -- THE FOUNDER'S REJECTION AND ITS EDUCATIONAL LESSON
-- ============================================================
-- The Founder's rejection was informed by direct target-learner evidence:
-- a real Year 5 child currently preparing for the 11+ with a private
-- tutor was shown migration 255's riverboat picture, unprompted, and
-- said: "there is nothing to write with the picture."
--
-- The root educational weakness this exposed is NOT that the riverboat
-- image needed to look prettier. It is that a picture-led narrative
-- stimulus must not merely be describable -- it must be NARRATIVELY
-- GENERATIVE. The riverboat scene supplied atmosphere and static objects
-- (a boat, oars, a rope, a bicycle) but too little meaningful action,
-- relationship, tension, mystery, discovery, problem, or change for a
-- Year 5 learner to generate a narrative from. See this Wave's own
-- educational-quality documentation for the principle recorded from this
-- finding: a strong stimulus must give a learner credible narrative
-- footholds, while remaining open enough that different learners can
-- write materially different, legitimate stories.
--
-- ============================================================
-- MIGRATION 255's ROW IS NOT TOUCHED, MODIFIED, OR DELETED BY THIS ONE
-- ============================================================
-- eng-practice-writing-picturenarrative-riverboat-01 remains exactly as
-- migration 255 left it (eligibility_status = 'authentic_assessment_
-- candidate'), and its rejection decision remains exactly as the Founder
-- recorded it, directly, in ali_family_review -- this migration neither
-- reads nor writes that row or that review record. The rejection is
-- preserved as governance evidence, not erased. A rejected review
-- decision structurally cannot satisfy any future promotion migration's
-- own precondition (every real promotion migration in this repo --
-- migrations 200/203/224 -- requires decision = 'approved' or
-- 'approved_with_amendment' + a separate amendment_verification record;
-- 'rejected' satisfies neither), so no additional lock is required to
-- keep it out of Practice: the existing governance pattern already
-- fail-closes on it.
--
-- ============================================================
-- THE REPLACEMENT -- "THE TREEHOUSE LANTERN", A NEW, DISTINCT SCENE
-- ============================================================
-- public/practice-assets/writing-picture-narrative/treehouselantern-v1.svg
-- is a new, hand-authored, original SVG (flat/stylised vector art, no
-- photographic or copyrighted source material), deliberately distinct
-- from every other picture-narrative stimulus already in this repo:
--   - migration 255's riverboat (misty riverbank, dawn, a boat, no
--     dwelling, no bag, no footprints, no bird) -- REJECTED, not reused.
--   - migration 246's old-shed-v1.svg (Mock-reserved: an overgrown
--     garden at late-afternoon, an ajar shed door, no treehouse, no bag,
--     no footprints, no bird).
--   - the worked-example scene in lib/learningEngine/
--     writingTeachingContent.ts's "writing-picture-narrative" family (a
--     fallen bicycle and a lit school window at night) -- a different
--     scene again, so the teaching model never previews this row's own
--     picture.
-- Bright midday light (distinct from both the riverboat's dawn and the
-- shed's late-afternoon), a treehouse in a large oak tree, with several
-- deliberate, coherent narrative footholds present at once: a rope
-- ladder pulled up so it dangles clear of the ground (an interrupted
-- state -- someone has just gone up, or is choosing to stay up); the
-- treehouse's round window glowing with lantern light despite the bright
-- daylight outside (a genuine anomaly inviting a "why" question); a
-- canvas bag lying open at the tree's foot with a compass, a torch, and
-- a folded (blank) piece of paper spilled beside it (evidence something
-- has just happened, and a discovery); two visibly different sets of
-- footprints crossing the grass in different directions (implying more
-- than one person, and a relationship or sequence of events); and a
-- magpie perched nearby, watching the window (a quiet, watching
-- presence, not a dictated event). No text, speech bubble, title, or
-- written clue anywhere in the image prescribes what happened or who is
-- involved -- every one of those footholds is genuinely open to more
-- than one legitimate interpretation (see this Wave's own educational-
-- quality documentation for the worked set of materially different
-- stories this scene supports).
--
-- ============================================================
-- CONTENT GOVERNANCE STAGE -- authentic_assessment_candidate, matching
-- migration 255's own convention and every prior first-of-a-kind Writing
-- content migration (098, 153, 169, 196, 198, 255)
-- ============================================================
-- No learner can reach this row through this migration alone: candidate-
-- stage content is excluded by fetchEligibleWritingPrompts'' own
-- eligibility_status = 'practice_eligible' filter (lib/learningEngine/
-- writingPracticeContent.ts, unchanged by this migration). A separate
-- practice_eligible promotion migration can only be authored once a real
-- Founder approved/approved_with_amendment decision for this row's own
-- family_id exists in ali_family_review -- never inferred, never
-- fabricated, and never combined into this migration (see migration 258,
-- which registers this row for that independent review).
--
-- ============================================================
-- CHECKLIST SUPPORT-LEVEL CLASSIFICATION
-- ============================================================
-- lib/writing/supportLevelPolicy.ts's WRITING_CHECKLIST_ITEM_SUPPORT_
-- LEVELS is updated in the same commit as this migration to classify
-- every one of this row's 7 checklist items (core/coaching), matching
-- migration 255's own established rule that new content is classified on
-- authoring, never left to the unaudited-content default.
--
-- No hidden model answer: `checklist` entries describe structural/
-- technique expectations only, never a pre-written sample response a
-- learner could copy. AI-SCORING BOUNDARY, UNTOUCHED: `app/api/writing-
-- feedback/route.ts`, `WRITING_CORRECTNESS_THRESHOLD`, and the
-- `supportTier: "supported"` mastery-quarantine gate are not read,
-- imported, referenced, or modified anywhere in this migration.
--
-- Practice isolation: no existing ali_question_bank row (Mock's
-- eng-q2-picturenarrative-oldshed and migration 255's rejected riverboat
-- row included) is read, referenced, or modified by this migration. The
-- id below is new.
--
-- Idempotent: the INSERT uses "on conflict (id) do nothing".
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 001-256
-- (per this arc's own standing record) have already been applied.

begin;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('eng-practice-writing-picturenarrative-treehouselantern-01', 'writing', 'QT-WC-01b', array['csse'], 'hard', 'open-response', 1500,
 $json${"id":"eng-practice-writing-picturenarrative-treehouselantern-01","title":"The Treehouse Lantern","prompt":"Write a story based on the picture below.","type":"picture-narrative","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Ground your story in real details you can see in the picture -- for example the ladder, the open bag, the footprints, or the lit window -- rather than an idea that has nothing to do with them","Choose ONE clear direction for your story early on, and make it clear whose story this is","Build in a real turning point or discovery, not just a description of what the picture shows","Choose vocabulary carefully and vary your sentence lengths and openings","Organise your writing into clear paragraphs","Check your spelling and punctuation before you finish"],"stimulus":{"type":"image","imageAssetUrl":"/practice-assets/writing-picture-narrative/treehouselantern-v1.svg","altText":"A large oak tree stands in a sunny garden, with a small wooden treehouse built among its branches. A rope ladder hangs from the treehouse, pulled up so its lower rungs dangle above the ground. The treehouse's round window glows with warm lantern light even though it is the middle of a bright day. At the foot of the tree, a canvas bag lies on its side with its flap open, and a compass, a torch, and a folded piece of paper have spilled out beside it. Two different sets of footprints cross the grass: one leading from a garden gate to the tree, and another leading away from the tree towards a hedge. A magpie is perched on a low branch near the treehouse, looking towards the window."}}$json$,
 'Angel Educational Depth Phase 1, Wave 2, REPLACEMENT after Founder rejection of migration 255''s riverboat candidate. QT-WC-01b (Picture-Stimulus Narrative Prompt), competency WC-01, family eng-practice-writing-wc01b-treehouselantern. Evidence: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md, HIGH/EMC-4, format position (always Question 2) and "write a story based on the picture below" phrasing -- the same evidence basis migrations 246 and 255 already established, reused here for the equivalent Practice-track task type. Direct target-learner evidence drove this replacement: a real Year 5 child found migration 255''s riverboat picture gave her "nothing to write with," which the Founder''s independent review confirmed as a genuine narrative-generativity gap, not a rendering or aesthetic defect. This scene was designed against a new, explicit principle: a picture-led stimulus must be narratively generative, not merely describable -- it supplies several deliberate, coherent footholds (a raised ladder, a daylight lantern glow, a dropped and spilled bag, two distinct sets of footprints, a watching bird) while remaining genuinely open to more than one legitimate story, and contains no text, title, or written clue that would dictate a single plot.', 3, 'eng-practice-writing-picturenarrative-treehouselantern-01',
 'eng-practice-writing-wc01b-treehouselantern', 'angel_original', 'authentic_assessment_candidate', 1, true,
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
--   Writing row (migration 255's rejected riverboat row included), or
--   Mock's own eng-q2-picturenarrative-oldshed row.
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
-- `delete from public.ali_question_bank where id = 'eng-practice-writing-picturenarrative-treehouselantern-01';`
-- Safe at any time -- no other object depends on this row while it
-- remains a candidate.
