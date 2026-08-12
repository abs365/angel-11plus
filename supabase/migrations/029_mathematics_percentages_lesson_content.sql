-- Angel Digital 11+ — Migration 029
-- Mathematics Learning Sequence Expansion (Educational Increment 002)
-- Guided Attempt, Independent Check and fresh-transfer items for
-- "Finding a Percentage of a Number"
-- (app/learning-intelligence/learn/mathematics/percentages/page.tsx).
--
-- Full evidence provenance, selection rationale and educational design are
-- recorded in:
--   MATHEMATICS_LESSON_002_SELECTION.md
--   MATHEMATICS_LESSON_002_EVIDENCE_MAP.md
--   MATHEMATICS_LESSON_002_LEARNING_DESIGN.md
--   MATHEMATICS_LESSON_002_MISCONCEPTION_MAP.md
-- (knowledge/angel-assessment-transformation-programme/programme-001/
--  release-1/mathematics-reference-vertical/)
-- This migration carries only the fields the existing ali_question_bank
-- schema already defines — no schema change.
--
-- pathway = ['csse'] — real, deployed production teaching content (not
-- Founder-Validation-only). All three items are QT-MR-04 (Percentage /
-- Proportional Change), competency MR-04, matching the real evidence basis
-- of qa-007 (15% of 60, cited directly as Worked Example 1) and mth-010
-- (both EMC-4/HIGH, full 3-year CSSE evidence). These are newly authored
-- numbers, not the verbatim existing bank rows, so qa-007/mth-010/mth-007b
-- remain intact and undiminished in the general Mathematics Practice pool.
--
-- All three answers were independently hand-checked before this migration
-- was written: 15% of 80 = 12; 20% of 90 = 18; 30% of 70 = 21.
--
-- Additive-only. Does not modify, retag, or delete any existing row.
-- Depends on migration 005 (ali_question_bank, content_difficulty enum)
-- and migration 007 (learning_unit_id column).
--
-- Run this in: Supabase Dashboard > SQL Editor > New query.
-- (ali_question_bank has no browser-writable RLS policy — this must be
-- applied via the Dashboard, the same as every other migration in this
-- project; it cannot be applied from application code or the anon key.)

begin;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, mastery_threshold, learning_unit_id)
values

('learn-mth-pct-guided', 'maths', 'QT-MR-04', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"learn-mth-pct-guided","question":"15% of 80 = ?","answer":"12","skill":"arithmetic","marks":1,"workingSteps":["10% of 80 = 8","5% of 80 = half of 8 = 4","15% = 10% + 5% = 8 + 4 = 12"]}$json$,
 'Percentage-of-a-quantity calculation. Assessment Brain QT-MR-04, competency MR-04. Teaching item for the Mathematics Learning Sequence Expansion''s Guided Attempt stage; matches the real evidence basis already established for qa-007 (15% of 60).', 2, 'learn-mth-percentages'),

('learn-mth-pct-independent', 'maths', 'QT-MR-04', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"learn-mth-pct-independent","question":"20% of 90 = ?","answer":"18","skill":"arithmetic","marks":1,"workingSteps":["10% of 90 = 9","20% = 10% doubled = 9 x 2 = 18"]}$json$,
 'Percentage-of-a-quantity calculation. Assessment Brain QT-MR-04, competency MR-04. Teaching item for the Mathematics Learning Sequence Expansion''s Independent Check stage; same real evidence basis as qa-007 and mth-010.', 2, 'learn-mth-percentages'),

('learn-mth-pct-independent-retry', 'maths', 'QT-MR-04', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"learn-mth-pct-independent-retry","question":"30% of 70 = ?","answer":"21","skill":"arithmetic","marks":1,"workingSteps":["10% of 70 = 7","30% = 10% x 3 = 7 x 3 = 21"]}$json$,
 'Percentage-of-a-quantity calculation. Assessment Brain QT-MR-04, competency MR-04. The Mathematics Learning Sequence Expansion''s Independent Check "fresh opportunity" item, reached only after remediation on learn-mth-pct-independent, a genuinely different problem, not a repeat of the same numbers.', 2, 'learn-mth-percentages')

on conflict (id) do nothing;

commit;
