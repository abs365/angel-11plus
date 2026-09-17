-- Angel Digital 11+ — Migration 258
-- Educational Depth Phase 1, Wave 2 — Writing Picture-Led Narrative
-- REPLACEMENT, Pending Independent Review Registration.
--
-- ============================================================
-- WHY THIS EXISTS
-- ============================================================
-- Registers migration 257's new replacement Practice-track picture-
-- narrative Writing prompt ("The Treehouse Lantern",
-- eng-practice-writing-picturenarrative-treehouselantern-01) as awaiting
-- an independent reviewer, exactly reusing migration 256's own pattern
-- (itself following migrations 099/154/162/168/172/226's established
-- placeholder-seeding convention) -- applied here to the replacement
-- content authored after the Founder's own independent review REJECTED
-- migration 255's riverboat candidate.
--
-- ONE row, keyed by the prompt's own ali_question_bank.family_id column
-- value ('eng-practice-writing-wc01b-treehouselantern'), never by the
-- row's own id -- matching migrations 226/256's own exact convention.
-- This is a genuinely new family_id, distinct from migration 256's own
-- 'eng-practice-writing-wc01b-riverboat' row: the rejected family's
-- review record is left completely untouched by this migration.
--
-- review_target_type = 'writing_prompt', review_type =
-- 'mock_writing_prompt_independent_review' -- the SAME real, currently
-- valid values migrations 226 and 256 already used (confirmed live in
-- the ali_family_review_target_type_check / ali_family_review_review_
-- type_check constraints, migrations 087/157), and the same review_type
-- migrations 200/203 already relied on to promote Practice-track Writing
-- rows directly from 'authentic_assessment_candidate' to
-- 'practice_eligible' -- not a new review category invented for this
-- row. reviewer is explicitly 'UNASSIGNED'.
--
-- No row's eligibility_status changes anywhere in this migration -- the
-- prompt remains 'authentic_assessment_candidate' exactly as migration
-- 257 left it. This migration inserts ONLY a placeholder row recording
-- that review is awaited; it does not itself constitute, preselect, or
-- imply any review decision, and no reviewer identity or decision is
-- fabricated.
--
-- ============================================================
-- THE ADMIN REVIEW SURFACE ALREADY RENDERS THIS ROW'S PICTURE CORRECTLY
-- ============================================================
-- Migration 256's own companion commit already extended `/admin-beta/
-- review`'s writing-task renderer (`lib/adminReview.ts`'s
-- `promptWritingTask()`, rendered by `app/admin-beta/review/page.tsx`'s
-- `QuestionOrWritingTaskBody`) to read and render `prompt.stimulus` when
-- present. This replacement row uses the identical `stimulus` shape
-- (`{"type":"image","imageAssetUrl":...,"altText":...}`), so no further
-- code change is required for the Founder to see this row's picture on
-- the same review surface -- proven by
-- tests/lib/adminReview.writingReviewContentContract.test.ts's existing
-- generic image-stimulus contract test, not re-derived here.
--
-- ============================================================
-- RESPONSE-SHAPE METADATA -- A GENUINE SMALL DEFECT, ALSO CORRECTED IN
-- THIS SAME COMMIT
-- ============================================================
-- The review screen's "Response shape" label (`lib/adminReview.ts`'s
-- `writingResponseShapeLabel()`) previously mapped only `"descriptive"`
-- and `"narrative"` (the two response types every pre-existing QT-WC-01a
-- row actually stores) to an honest, item-specific label; any other
-- value fell through to its own visibly-honest fallback,
-- `"Not yet catalogued (${responseType})"` -- exactly what migration 255
-- and 256's own riverboat row displayed, since its stored `type` is
-- `"picture-narrative"`, a real, deliberately new response shape that
-- had simply never been added to the label map. This is a small, genuine
-- defect directly caused by this Wave's own new response shape (not a
-- structural registration gap: `promptWritingTask()` already reads
-- `responseType` correctly for every row, including this one) -- the
-- companion code change in this same commit adds
-- `"picture-narrative": "Picture-Stimulus Narrative"` to
-- `WRITING_RESPONSE_SHAPE_LABEL`, so both this row and migration 255's
-- own rejected riverboat row now display an honest, catalogued label
-- instead of the "Not yet catalogued" placeholder. No other response
-- type's label is touched, and the taxonomy code (QT-WC-01b) is
-- unaffected -- only the human-readable label changes.
--
-- ============================================================
-- SAFETY
-- ============================================================
-- The idempotency guard checks family_id + decision + review_type +
-- notes together, matching migrations 226/256's own exact convention.
--
-- FAIL-CLOSED / NARROWLY SCOPED: touches public.ali_family_review only,
-- inserts exactly 1 row, never touches ali_question_bank, cannot change
-- eligibility_status, cannot activate Practice or Mock (no such column
-- or table is referenced anywhere below), cannot manufacture an Approved
-- review (the only decision value inserted is
-- 'pending_independent_review', never any other value in the
-- family_review_decision enum), and never reads, updates, or deletes
-- migration 256's own 'eng-practice-writing-wc01b-riverboat' review
-- record -- the rejection stands exactly as the Founder recorded it.
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor
-- (migration 257 must already be applied). This migration is the
-- registration step only -- it does not, by itself, make this row
-- learner-reachable. A separate practice_eligible promotion migration
-- (matching migrations 200/203/224's own established pattern) can only
-- be prepared once a genuine Founder decision for this family_id exists
-- in ali_family_review, recorded through the live /admin-beta/review
-- interface -- never inferred, never fabricated, and never combined into
-- this migration.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'eng-practice-writing-wc01b-treehouselantern', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'EDUCATIONAL-DEPTH-PHASE1-WAVE2 REPLACEMENT content review, after the Founder''s own independent review rejected migration 255''s riverboat candidate (real Year 5 learner evidence: "there is nothing to write with the picture"). This is the replacement Practice-track picture-led narrative Writing prompt ("The Treehouse Lantern", eng-practice-writing-picturenarrative-treehouselantern-01, QT-WC-01b), designed against the explicit narrative-generativity principle the rejection established -- see migration 257''s own header for the full evidence basis, the new scene''s deliberate narrative footholds, and its distinction from every other picture-narrative stimulus already in this repo (the rejected riverboat, Mock''s Q2 shed, and the teaching worked example). Review its picture stimulus directly on this surface, not merely its checklist -- the same rendering path already proven for migration 256''s row.', 'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-practice-writing-wc01b-treehouselantern' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
    and notes = 'EDUCATIONAL-DEPTH-PHASE1-WAVE2 REPLACEMENT content review, after the Founder''s own independent review rejected migration 255''s riverboat candidate (real Year 5 learner evidence: "there is nothing to write with the picture"). This is the replacement Practice-track picture-led narrative Writing prompt ("The Treehouse Lantern", eng-practice-writing-picturenarrative-treehouselantern-01, QT-WC-01b), designed against the explicit narrative-generativity principle the rejection established -- see migration 257''s own header for the full evidence basis, the new scene''s deliberate narrative footholds, and its distinction from every other picture-narrative stimulus already in this repo (the rejected riverboat, Mock''s Q2 shed, and the teaching worked example). Review its picture stimulus directly on this surface, not merely its checklist -- the same rendering path already proven for migration 256''s row.'
);

commit;

-- Read-only verification (run after applying):
--
-- select review_target_type, family_id, reviewer, decision, review_type
-- from public.ali_family_review
-- where family_id in ('eng-practice-writing-wc01b-riverboat', 'eng-practice-writing-wc01b-treehouselantern')
-- order by family_id, created_at;
--
-- Expected: the riverboat family_id shows its own real, already-recorded
-- rejection (unchanged by this migration); the treehouselantern family_id
-- shows exactly 1 new row, decision = 'pending_independent_review',
-- reviewer = 'UNASSIGNED', review_type = 'mock_writing_prompt_independent_review'.
