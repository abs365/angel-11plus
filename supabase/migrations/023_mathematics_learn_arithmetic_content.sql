-- Angel Digital 11+ — Migration 023
-- Angel Assessment Transformation Execution Programme, Release 1
-- Mathematics Learn -> Practise Reference Vertical — the Guided Attempt and
-- Independent Check items for the "Adding and Subtracting Big Numbers"
-- lesson (app/learning-intelligence/learn/mathematics/arithmetic/page.tsx).
--
-- Full evidence provenance, originality declaration, and educational design
-- rationale are recorded in MATHEMATICS_LEARNING_DESIGN.md and
-- MATHEMATICS_EVIDENCE_TRACEABILITY_REGISTER.md — this migration carries
-- only the fields the existing ali_question_bank schema already defines.
--
-- pathway = ['csse'] — this is real, deployed production teaching content
-- (not Founder-Validation-only), reusing the existing evidence pipeline
-- unmodified. Both items are QT-MR-01 (Direct Arithmetic Computation),
-- competency MR-01, matching the same real evidence basis as fv-mth-001
-- (CSSE-006/011/016 Q1-Q3) and the existing production items qa-001/qa-002.
--
-- Both numeric answers were independently hand-checked before this
-- migration was written: 652 + 279 = 931; 903 - 468 = 435.
--
-- Additive-only. Does not modify, retag, or delete any existing row.
-- Depends on migration 005 (ali_question_bank, content_difficulty enum).
--
-- Run this in: Supabase Dashboard > SQL Editor > New query.
-- (ali_question_bank has no browser-writable RLS policy as of migration
-- 020 — this must be applied via the Dashboard, the same as every other
-- migration in this project; it cannot be applied from application code
-- or the anon key.)

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, mastery_threshold, learning_unit_id)
values

('learn-mth-arith-guided', 'maths', 'QT-MR-01', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"learn-mth-arith-guided","question":"652 + 279 = ?","answer":"931","skill":"arithmetic","marks":1,"workingSteps":["Ones: 2 + 9 = 11, write 1, carry 1","Tens: 5 + 7 + 1 = 13, write 3, carry 1","Hundreds: 6 + 2 + 1 = 9","652 + 279 = 931"]}$json$,
 'Column addition with two carries — Assessment Brain QT-MR-01, competency MR-01. Teaching item for the Mathematics Reference Vertical''s Guided Attempt stage; matches the real evidence basis already established for fv-mth-001 (CSSE-006/011/016 Q1-Q3).', 2, 'learn-mth-arithmetic'),

('learn-mth-arith-independent', 'maths', 'QT-MR-01', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"learn-mth-arith-independent","question":"903 - 468 = ?","answer":"435","skill":"arithmetic","marks":1,"workingSteps":["Ones: 3 - 8 needs borrowing; tens is 0, so borrow travels to the hundreds column","After borrowing: hundreds 8, tens 9, ones 13","Ones: 13 - 8 = 5","Tens: 9 - 6 = 3","Hundreds: 8 - 4 = 4","903 - 468 = 435"]}$json$,
 'Column subtraction with borrowing across a zero — Assessment Brain QT-MR-01, competency MR-01. Teaching item for the Mathematics Reference Vertical''s Independent Check stage; same real evidence basis as fv-mth-001 and the existing production item qa-002 (1000-473).', 2, 'learn-mth-arithmetic')

on conflict (id) do nothing;
