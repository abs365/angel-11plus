-- Angel Digital 11+ — Migration 033
-- Educational Increment 005, Part A: close the Practice eligibility gap.
--
-- Audits the 46 pre-Increment-003 rows against
-- RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md's Provisional -> Practice
-- Eligible bar ("disclosed, non-forced Question Type/competency mapping"
-- -- the same bar this programme already used to justify
-- eligibility_status='practice_eligible' for the Increment 003/004 items).
--
-- RELEASE_1_GAP_ANALYSIS.md §4 already did the disclosure work: of the
-- original 18 items, 6 carry the migration's OWN inline comment admitting
-- a forced fit, a judgement call, or a scoring-mechanism irregularity:
--   mth-003 (QT-MR-07, "dominant construct... a judgement call")
--   mth-004 (QT-MR-01, "a forced fit, not a natural one")
--   mth-005 (QT-MR-13, "closest fit" — the only item for this type)
--   mth-006 (QT-MR-05, compound semicolon-answer scoring fragility)
--   mth-007b (QT-MR-04, "a milder but still explicit generalisation")
--   wrt-003 (QT-WC-01a, "closest real match", only item for this type)
-- These 6 do NOT meet the "non-forced" bar and are NOT promoted here —
-- they remain eligibility_status='provisional' (their existing default,
-- unchanged) and are therefore excluded from normal Practice once
-- lib/ali/questionBank.ts's fetchQuestionBank() enforces eligibility
-- (this same increment, application code, not this migration).
--
-- The remaining 40 rows — the other 12 of the original 18, all 11
-- migration-016 rows, all 11 Founder Validation Assessment rows (which
-- passed a full "21/21 gates" interactive verification, the STRONGEST
-- evidence in the pre-Wave-1 bank), and all 6 Mathematics Reference
-- Vertical Lesson 1/2 rows (evidence-traced in Educational Increments
-- 001/002) — carry a disclosed, non-forced mapping and ARE promoted.
--
-- This does not touch any row's content, answer, explanation, or
-- provenance. It touches exactly one field, eligibility_status, on
-- exactly the 40 rows named below. No row is deleted; no historical
-- learner evidence (ali_student_question_history) is affected — that
-- table has no eligibility_status dependency.
--
-- ali_question_bank has no browser-writable RLS/grant path — apply via
-- Supabase Dashboard > SQL Editor, same as every other migration.

begin;

update public.ali_question_bank
set eligibility_status = 'practice_eligible'
where id in (
  -- Original 18, minus the 6 disclosed-weak items
  'mth-001', 'qa-010', 'mth-002', 'mth-008', 'qa-008', 'mth-009', 'mth-010',
  'eng-001-q2', 'eng-001-q3', 'eng-002-q1', 'eng-002-q3', 'eng-003-q3',
  -- Migration 016 (Educational Identity Batch 1)
  'qa-003', 'qa-006', 'qa-007', 'qa-009', 'qa-004', 'eng-001-q1', 'eng-001-q4',
  'qa-005', 'eng-003-q1', 'qa-001', 'qa-002',
  -- Founder Validation Assessment (migration 021, 21/21 gates verified)
  'fv-mth-006', 'fv-eng-001-q3', 'fv-mth-001', 'fv-mth-002', 'fv-mth-003',
  'fv-mth-004', 'fv-mth-005', 'fv-eng-001-q1', 'fv-eng-001-q2', 'fv-eng-001-q4',
  'fv-eng-001-q5',
  -- Mathematics Reference Vertical Lessons 1-2 (migrations 023/025/029)
  'learn-mth-arith-guided', 'learn-mth-arith-independent', 'learn-mth-arith-independent-retry',
  'learn-mth-pct-independent-retry', 'learn-mth-pct-independent', 'learn-mth-pct-guided'
)
and eligibility_status = 'provisional';

commit;
