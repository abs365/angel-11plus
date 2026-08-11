-- Angel Digital 11+ — Migration 025
-- Mathematics Reference Vertical — Founder Visual Review Remediation §3.
--
-- One additional Independent Check item for the "Adding and Subtracting Big
-- Numbers" lesson (app/learning-intelligence/learn/mathematics/arithmetic/
-- page.tsx): the "fresh independent opportunity" a learner reaches after
-- getting the original Independent Check item (903 - 468) wrong twice and
-- being shown its full worked resolution. The Founder's explicit
-- instruction: "The fresh independent opportunity must not simply repeat an
-- answer the learner has just been shown" — this is a genuinely different
-- problem testing the same skill (QT-MR-01, borrowing across a single zero
-- column), not a second exposure to the same numbers.
--
-- 604 - 278 = 326, independently hand-checked before this migration was
-- written: 604 - 278 = 604 - 200 - 78 = 404 - 78 = 326. Borrowing structure
-- matches the original item (ones needs to borrow; tens is a zero; the
-- borrow travels to the hundreds column): hundreds 6->5, tens 0->9, ones
-- 4->14; ones 14-8=6, tens 9-7=2, hundreds 5-2=3 -> 326.
--
-- Not "scaling Mathematics content" — this is the single supporting item
-- required for the Independent Check's own bounded remediation loop to be
-- honest (Founder Visual Review Remediation §2-3), the same evidence basis
-- and pathway as migration 023's items, added under the same narrow
-- refinement authority.
--
-- Additive-only. Does not modify, retag, or delete any existing row.
-- Depends on migration 005 (ali_question_bank, content_difficulty enum).
--
-- Run this in: Supabase Dashboard > SQL Editor > New query.
-- (ali_question_bank has no browser-writable RLS policy — this must be
-- applied via the Dashboard, the same as every other migration in this
-- project; it cannot be applied from application code or the anon key.)

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, mastery_threshold, learning_unit_id)
values

('learn-mth-arith-independent-retry', 'maths', 'QT-MR-01', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"learn-mth-arith-independent-retry","question":"604 - 278 = ?","answer":"326","skill":"arithmetic","marks":1,"workingSteps":["Ones: 4 - 8 needs borrowing; tens is 0, so borrow travels to the hundreds column","After borrowing: hundreds 5, tens 9, ones 14","Ones: 14 - 8 = 6","Tens: 9 - 7 = 2","Hundreds: 5 - 2 = 3","604 - 278 = 326"]}$json$,
 'Column subtraction with borrowing across a zero — Assessment Brain QT-MR-01, competency MR-01. The Mathematics Reference Vertical''s Independent Check "fresh opportunity" item, reached only after remediation on learn-mth-arith-independent — a genuinely different problem, not a repeat of the same numbers.', 2, 'learn-mth-arithmetic')

on conflict (id) do nothing;
