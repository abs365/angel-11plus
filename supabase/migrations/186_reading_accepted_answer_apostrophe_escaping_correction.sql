-- Angel Digital 11+ — Migration 186
-- Reading Comprehension Assessment Integrity Correction, Part 4:
-- corrects the 2 Migration 183 rows the Founder's own exact post-state
-- verification found were silently skipped ('w1-letter-09',
-- 'w1-raceday-09'). Affects ONLY these two rows. No other row from
-- migration 183 is touched, re-verified, or re-derived here.
--
-- ============================================================
-- ROOT CAUSE (Founder-directed investigation, confirmed from source, not
-- assumed)
-- ============================================================
-- Both rows originate in migration 178, authored inside a $json$...$json$
-- DOLLAR-QUOTED block. Dollar-quoting has no special meaning for a single
-- quote character -- unlike a standard '...' string literal, where ''
-- (two characters) is the escape sequence for ONE literal apostrophe,
-- inside $json$...$json$ two adjacent apostrophe characters are stored
-- exactly as written: TWO literal apostrophes. Migration 178's own source
-- contains "doesn''t" and "didn''t" (each with two apostrophe characters)
-- for exactly these two rows -- a genuine authoring artifact, most likely
-- from a content-generation step that applied standard-literal escaping
-- inside a context where it was unnecessary and wrong. Confirmed by
-- direct comparison: 'w1-raceday-02' (migration 044, a different row,
-- also inside a $json$ block) correctly stores a single apostrophe
-- ("she doesn't worry"), proving this is an isolated, two-row authoring
-- defect, not a systemic dollar-quoting issue affecting every row.
--
-- Migration 183's WHERE clause used standard '...' single-quote escaping
-- throughout (correct for that quoting style), so its own "doesn''t" /
-- "didn''t" parsed to ONE apostrophe each -- a byte-for-byte mismatch
-- against the genuinely two-apostrophe live stored value. The UPDATE for
-- these two rows therefore never matched and never ran, exactly as the
-- fail-closed design requires: no data was corrupted, and no incorrect
-- overwrite occurred. This migration corrects the WHERE clause to match
-- the true live pre-state; the intended corrected content (the SET
-- clause) is otherwise unchanged from migration 183's own original
-- intent for these two rows.
--
-- Established directly against the live database, not assumed: the
-- tokeniser inside checkAcceptedAnswerSet() (lib/learningEngine/
-- englishAnswerValidation.ts) splits on any run of non-alphanumeric
-- characters, so "doesn''t" (two apostrophes) and "doesn't" (one
-- apostrophe) already tokenise identically today (both -> ["doesn","t"]).
-- This defect was never live-grading-affecting for real learners -- it
-- is a data-hygiene/exact-match artifact only, caught by the Founder's
-- own stricter exact post-state verification, not a second false
-- negative in production.
--
-- ============================================================
-- EDUCATIONAL VALIDITY (re-confirmed per Founder instruction, not
-- re-derived from scratch -- both rows were already individually
-- verified as CLASS A mechanical splits during the original Migration
-- 183 review; that classification is unchanged)
-- ============================================================
-- 'w1-raceday-09' ("What does comparing her running to doing a crossword
-- suggest about her attitude?", model answer: "...treats running as a
-- casual, almost relaxing activity..."): "casual/relaxing" splits into
-- "treats running as casual, not stressful" and "treats running as
-- relaxing, not stressful" -- both directly named by the model answer's
-- own wording, no new idea introduced.
-- 'w1-letter-09' ("Why might the launderette woman have 'appreciated more
-- than she probably realised'...", model answer: "...mattered a great
-- deal to Dara on an already difficult first day..."): "upset/embarrassed"
-- splits into "Dara was already upset..." and "Dara was already
-- embarrassed...", both textually supported by the passage's own account
-- of Dara's difficult first day, no new idea introduced.
--
-- ============================================================
-- FIX
-- ============================================================
-- Fixes the two-apostrophe artifact itself as part of the same
-- correction (normalising to a single, correct apostrophe) rather than
-- perpetuating a typo into newly-added entries -- this only touches
-- `prompt.acceptedAnswers` on these two rows, same as migration 183's own
-- scope; no other field, and no other row, is touched.
--
-- Fail-closed and idempotent: the WHERE clause requires the CURRENT
-- acceptedAnswers array to exactly equal the true, confirmed live
-- pre-state (with the two-apostrophe artifact). A row that has already
-- been corrected, or that doesn't match for any other reason, is left
-- untouched rather than silently overwritten.
--
-- NOT re-running migration 183 wholesale. NOT touching any of the other
-- 24 already-correct rows. NOT touching migrations 184 or 185. NOT
-- touching eligibility_status, question, modelAnswer, passageText,
-- marks, or validationTier on either row.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

-- w1-raceday-09: WHERE clause matches the TRUE live pre-state, with the
-- genuine two-apostrophe artifact ("doesn''''t" below = 4 quote
-- characters = 2 literal apostrophes once parsed by a standard '...'
-- literal). Generated programmatically (not hand-typed) to guarantee
-- correct escaping.
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["treats running as casual, not stressful","treats running as relaxing, not stressful","unbothered, low-effort attitude","doesn''t take it seriously the way Ade does","calm, almost effortless approach"]'::jsonb)
where id = 'w1-raceday-09'
  and prompt->'acceptedAnswers' = '["treats running as casual/relaxing, not stressful","unbothered, low-effort attitude","doesn''''t take it seriously the way Ade does","calm, almost effortless approach"]'::jsonb;

-- w1-letter-09: same discipline, "didn''''t" (4 quote characters = 2
-- literal apostrophes) matches the true live pre-state.
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["a small kindness meant a lot to Dara on a difficult day, more than the woman would have known","the woman probably didn''t realise how much her small act of kindness helped Dara feel less embarrassed","simple kindness to a stranger can matter more to the receiver than the giver realises","Dara was already upset, so the kindness meant more than usual","Dara was already embarrassed, so the kindness meant more than usual"]'::jsonb)
where id = 'w1-letter-09'
  and prompt->'acceptedAnswers' = '["a small kindness meant a lot to Dara on a difficult day, more than the woman would have known","the woman probably didn''''t realise how much her small act of kindness helped Dara feel less embarrassed","simple kindness to a stranger can matter more to the receiver than the giver realises","Dara was already upset/embarrassed, so the kindness meant more than usual"]'::jsonb;

commit;
