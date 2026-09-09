-- Angel Digital 11+ — Migration 246
-- CSSE Two-Paper Mock, Final Completion Pass Before Migration 245 —
-- Q2 (picture-narrative) content completion, and a disclosed correction
-- to Q1's own Mock rendering contract found while proving Q2 works.
--
-- ============================================================
-- WHY THIS EXISTS
-- ============================================================
-- Migration 245 (committed, NOT applied) specified Q2's task design in
-- full (lib/ali/questionFactory/englishQ2PictureNarrativeFamily.ts) but
-- deliberately did not author its ali_question_bank row or add it to
-- english-full-mock-v1's manifest, because no real image asset existed
-- (migration 098's own header names this exact gap: "QT-WC-01b ...
-- NOT authored by this migration"). This pass created one, original,
-- hand-authored, copyright-safe SVG asset
-- (public/mock-assets/q2-picture-narrative/old-shed-v1.svg, confirmed
-- well-formed and confirmed to render correctly), so Q2 can now be
-- completed. This migration is pure content: no schema, function, or
-- RLS change (ali_writing_assessment's task_type already allows 'Q2',
-- mock_persist_writing_assessment() already accepts it unchanged).
--
-- ============================================================
-- A GENUINE, DISCLOSED DEFECT FOUND (AND FIXED) WHILE PROVING Q2 END-TO-END
-- ============================================================
-- mock_get_question() (migration 070, redefined 106/115/122/218 — last
-- redefined by 218, UNTOUCHED by 245) returns the learner-facing
-- question text and marks from v_row.prompt->'question' and
-- v_row.prompt->'marks' — confirmed by direct re-read of its live SQL
-- body. Every real Mock Mathematics row (migration 088 onward) sets
-- both of these keys. Every Writing row (migrations 098/153/198/225,
-- including mock-writing-mindchange-01, the one row migration 245
-- promoted to mock_eligible) was authored ONLY for Practice's own
-- separate, dedicated consumption contract
-- (app/learning-intelligence/practice/[area]/page.tsx reads
-- prompt.prompt directly — confirmed by direct grep this session) —
-- none of them has ever set prompt.question or prompt.marks, because
-- before migration 245 no Writing row had ever entered the Mock
-- mock_get_question() pipeline at all.
--
-- Left uncorrected, once english-full-mock-v1 is ever activated, a
-- learner reaching mock-writing-mindchange-01 (Q1) during a real,
-- in-progress attempt would receive question: null / marks: null from
-- mock_get_question() — the exam page would render an empty/"null"
-- prompt with no visible instruction to write to. (mock_score_attempt()
-- is unaffected — it already defensively coalesces a missing
-- prompt->'marks' to 1, migration 074 line ~174 — this defect is
-- specifically in the LIVE, in-progress question DISPLAY, not scoring.)
-- This was never caught earlier because migration 245 has never been
-- applied or exercised against a real attempt.
--
-- FIX (Section 1 below): an additive, non-destructive jsonb merge adds
-- question/marks keys to mock-writing-mindchange-01's existing prompt,
-- deriving `question` from its own existing `prompt` text (the same
-- instruction, just now reachable by mock_get_question()'s own
-- allow-list) and `marks` = 1 (Angel's own internal per-item scale —
-- never pooled into any CSSE-comparable total; migration 245's own
-- policy on this is unchanged and unaffected). Every existing key
-- (title/prompt/type/checklist/etc.) is preserved byte-for-byte —
-- Practice's own consumption of this exact row is completely
-- unaffected, confirmed by construction (a `||` merge only ever adds
-- the two new keys, never removes or renames an existing one). The new
-- Q2 row (Section 2) is authored with question/marks present from the
-- start, so it does not require this same correction.
--
-- ============================================================
-- Q2 ELIGIBILITY: WHY mock_eligible IN THIS SAME MIGRATION
-- ============================================================
-- This project's own established content-governance discipline (e.g.
-- migration 225) is that brand-new content enters at
-- authentic_assessment_candidate and is promoted only after a separate
-- review step. Q2 departs from that by design, disclosed here rather
-- than silently done: the governing brief for this pass explicitly
-- required proving Q2 works end-to-end (submission, persistence,
-- five-dimension assessment) once its asset exists, which is only
-- possible if the row is actually reachable through the Mock pipeline.
-- The production safety gate is unaffected either way: english-full-
-- mock-v1 remains active=false (migration 245, untouched by this
-- migration), so no learner can reach this content regardless of the
-- row's own eligibility_status. Founder review of the Q2 prompt/
-- checklist/visual asset itself remains outstanding and should occur
-- before english-full-mock-v1 is ever activated — named here, not
-- silently assumed complete.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor, after migration 245 (per that
-- migration's own standing "apply 245 first" ordering — this migration
-- assumes english-full-mock-v1 and mock-writing-mindchange-01's
-- promotion already exist).

begin;

-- ============================================================
-- 1. Disclosed correction: mock-writing-mindchange-01 gains the
--    question/marks keys mock_get_question() actually reads, additive
--    only, every existing key preserved.
-- ============================================================
update public.ali_question_bank
set prompt = prompt || jsonb_build_object('question', prompt->'prompt', 'marks', 1)
where id = 'mock-writing-mindchange-01'
  and prompt->'question' is null;

-- ============================================================
-- 2. The real Q2 (picture-narrative) content row.
-- ============================================================
-- id matches lib/ali/questionFactory/englishQ2PictureNarrativeFamily.ts's
-- own Q2_PICTURE_NARRATIVE_TASKS[0].id exactly — the TypeScript design
-- scaffold and the production row are the same identifier, never two
-- diverging ids for one task. skill = QT-WC-01b (Picture-Stimulus
-- Narrative Prompt), the exact code migration 098's own header named as
-- future, disclosed, not-yet-authored work — this is that work.
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class, marking_mode)
values
('eng-q2-picturenarrative-oldshed', 'writing', 'QT-WC-01b', array['csse'], 'hard', 'open-response', 1500,
 $json${"id":"eng-q2-picturenarrative-oldshed","title":"The Old Shed","question":"Write a story based on the picture below.","prompt":"Write a story based on the picture below.","type":"narrative","difficulty":"year6-exam","timeMinutes":25,"marks":1,"checklist":["Write at least six sentences","Base your story genuinely on what the picture shows, not an unrelated idea","Include a clear turning point or moment of change, not just a description of the scene","Use precise, well-chosen vocabulary","Organise your writing into clear paragraphs","Check spelling and punctuation carefully"],"planningScaffold":["Who is in the picture, or who might arrive next?","What has just happened, just before this exact moment?","What might happen next -- and does your story need a clear turning point?","How does your story end -- does it need to resolve everything the picture suggests, or can it end on a single striking moment?"],"stimulus":{"type":"image","imageAssetUrl":"/mock-assets/q2-picture-narrative/old-shed-v1.svg","altText":"An old, weathered wooden shed stands at the edge of an overgrown garden in the late afternoon. Its door is slightly open, long grass and a climbing plant have grown up around its base, and a large tree stands beside it under a warm, softening sky."}}$json$,
 'CSSE Two-Paper Mock, pre-activation completion pass (migration 246). QT-WC-01b (Picture-Stimulus Narrative Prompt), competency WC-01, family eng-q2-picturenarrative-oldshed. Evidence: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md, HIGH/EMC-4, format position (always Question 2) and "write a story based on the picture below" phrasing consistent 3/3 real years read. This is the QT-WC-01b gap migration 098 explicitly disclosed and deferred pending an image-asset mechanism, which this pass built (an original, hand-authored SVG, not AI-generated, not sourced from any CSSE paper). Prompt shape: picture-narrative, genuinely distinct from every QT-WC-01a (reflective/discursive) row in this bank — requires an original story grounded in the shown scene, not a personal-experience account.', 3, 'eng-q2-picturenarrative-oldshed',
 'eng-q2-picturenarrative-oldshed', 'angel_original', 'mock_eligible', 1, true,
 'Describing the picture itself (a static scene description) rather than writing a story that uses it as a starting point -- the marker cannot credit narrative writing that never actually narrates a sequence of events.',
 'FAR_TRANSFER', 'criterion_rubric')
on conflict (id) do nothing;

-- ============================================================
-- 3. Append Q2 to english-full-mock-v1's existing manifest.
-- ============================================================
-- Idempotent: only appends if no manifest entry for this question_id
-- already exists. Every existing manifest entry (Reading Comprehension's
-- 28 rows + the Q1 Writing row) is preserved unchanged, in order —
-- this is a pure append, never a rebuild.
update public.ali_mock_form
set question_manifest = question_manifest || jsonb_build_array(
  jsonb_build_object('question_id', 'eng-q2-picturenarrative-oldshed', 'section', 'continuous_writing_q2')
)
where id = 'english-full-mock-v1'
  and not exists (
    select 1 from jsonb_array_elements(question_manifest) as elem
    where elem->>'question_id' = 'eng-q2-picturenarrative-oldshed'
  );

commit;

-- ============================================================
-- MIGRATION SAFETY REVIEW
-- ============================================================
-- - One additive jsonb-merge UPDATE, guarded (only runs if the question
--   key is genuinely absent), touching exactly one pre-identified row,
--   removes nothing.
-- - One guarded, idempotent content INSERT (on conflict do nothing),
--   inserts exactly one new row, no existing row touched.
-- - One guarded, idempotent manifest-append UPDATE, touching exactly
--   one pre-identified form row, appends exactly one array element.
-- - No schema change, no new function, no RLS change, no grant change.
-- - Cannot affect Mathematics, Reading Comprehension's own 28 items, or
--   any other existing form/attempt/row.
-- - english-full-mock-v1 remains active=false — unaffected by this
--   migration, still requires a separate, later, explicit UPDATE to
--   become discoverable at all.
--
-- ============================================================
-- RLS REVIEW
-- ============================================================
-- No RLS policy created, altered, or referenced. ali_question_bank and
-- ali_mock_form's existing policies (migration 084 and earlier) already
-- cover every row this migration touches or inserts, unchanged.
--
-- ============================================================
-- BACKWARD COMPATIBILITY
-- ============================================================
-- mock-writing-mindchange-01's correction is strictly additive (two new
-- jsonb keys); every field Practice or any other current reader consumes
-- is untouched, confirmed by construction of the `||` merge. The new Q2
-- row and manifest entry are invisible to every existing caller until
-- english-full-mock-v1 is both migrated (245) and activated (a separate,
-- later, one-line UPDATE, per that migration's own established gate).
--
-- ============================================================
-- ROLLBACK
-- ============================================================
-- `update public.ali_mock_form set question_manifest = question_manifest - (select ordinality - 1 from jsonb_array_elements(question_manifest) with ordinality where value->>'question_id' = 'eng-q2-picturenarrative-oldshed') where id = 'english-full-mock-v1';`
--   (or, more simply: re-derive question_manifest from migration 245's
--   own original expression and re-run it.)
-- `delete from public.ali_question_bank where id = 'eng-q2-picturenarrative-oldshed';`
-- `update public.ali_question_bank set prompt = prompt - 'question' - 'marks' where id = 'mock-writing-mindchange-01';`
-- Safe at any time — no other object depends on any of these.
