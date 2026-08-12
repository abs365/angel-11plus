-- Angel Digital 11+ — Migration 027
-- Angel Copy Quality Eradication and Prevention Gate — database-fed content
-- correction.
--
-- ali_question_bank.explanation is rendered directly to learners during
-- Practice sessions (app/learning-intelligence/practice/[area]/page.tsx's
-- activityExplanations map, line ~376) and is also the source data for the
-- Mathematics Reference Vertical's three teaching items
-- (learn-mth-arith-guided/independent/independent-retry, migration 023).
-- Every row in this table whose explanation used an em dash as sentence
-- punctuation is corrected below. Content-neutral: each rewrite preserves
-- the exact same information (internal Assessment Brain / competency
-- tagging, evidence citations, authoring rationale) and changes only the
-- punctuation, per the Founder's explicit "do not mechanically replace
-- every dash with a comma — read and rewrite each affected sentence
-- properly" instruction. No `prompt`, `answer`, `hint`, `mastery_threshold`
-- or any other column is touched. Idempotent: every statement sets an
-- exact target string, safe to re-run.
--
-- This project's anon key has SELECT-only grants on this table (verified
-- directly: a round-trip PATCH test silently no-oped, confirming no write
-- access), so this migration could not be applied automatically and
-- requires the same manual application as migration 026.
-- Run this in: Supabase Dashboard > SQL Editor > New query
-- Wrapped in a transaction: if any statement below fails, everything
-- rolls back rather than leaving a partially-applied migration.

begin;

update public.ali_question_bank set explanation =
  'Word-meaning-in-context question. Assessment Brain QT-RC-03, competency RC-03.'
  where id = 'eng-001-q2';

update public.ali_question_bank set explanation =
  'Effect-of-language interpretation. Assessment Brain QT-RC-10, competency RC-02.'
  where id = 'eng-001-q3';

update public.ali_question_bank set explanation =
  'Requires citing evidence and explaining significance. Assessment Brain QT-RC-05, competency RC-02.'
  where id = 'eng-002-q1';

update public.ali_question_bank set explanation =
  'A quotation is given and explained. Assessment Brain QT-RC-05, competency RC-02.'
  where id = 'eng-002-q3';

update public.ali_question_bank set explanation =
  'Elapsed-time word problem. Assessment Brain QT-MR-10, competency MR-04.'
  where id = 'mth-001';

update public.ali_question_bank set explanation =
  'Number-property reasoning. Assessment Brain QT-MR-11, competency MR-05.'
  where id = 'qa-010';

update public.ali_question_bank set explanation =
  'Explicit "find three examples" instruction. Assessment Brain QT-RC-08, competency RC-01.'
  where id = 'eng-003-q3';

update public.ali_question_bank set explanation =
  'Direct arithmetic computation. Assessment Brain QT-MR-01, competency MR-01.'
  where id in ('mth-002', 'mth-008', 'qa-008');

update public.ali_question_bank set explanation =
  'Direct arithmetic computation (fractions fold into Assessment Brain''s Arithmetic Calculation domain, no dedicated fractions Question Type). QT-MR-01, competency MR-01.'
  where id = 'mth-004';

update public.ali_question_bank set explanation =
  'Sequence/function-rule application. Assessment Brain QT-MR-05, competency MR-02. Compound answer ("45; 26th term (101)"), practice UI must reuse the app''s existing semicolon-split checker (app/maths/page.tsx), not a new one.'
  where id = 'mth-006';

update public.ali_question_bank set explanation =
  'Multi-topic question (algebraic setup + geometric area); dominant tested construct is the perimeter/area relationship, so tagged QT-MR-07, competency MR-03, per this project''s existing "one primary competency by dominant skill" convention (ALI Decision 34), a judgement call, disclosed in the Acceptance Pack.'
  where id = 'mth-003';

update public.ali_question_bank set explanation =
  'Geometric reasoning via formula application. Assessment Brain QT-MR-07, competency MR-03.'
  where id = 'mth-009';

update public.ali_question_bank set explanation =
  'Direct percentage calculation. Assessment Brain QT-MR-04, competency MR-04.'
  where id = 'mth-010';

update public.ali_question_bank set explanation =
  'Ratio is a form of proportional-change reasoning. Assessment Brain QT-MR-04, competency MR-04.'
  where id = 'mth-007b';

update public.ali_question_bank set explanation =
  'Per-unit-value scaled by quantity. Closest fit is Assessment Brain QT-MR-13 (Best-Value/Combinatorial Word Problem), competency MR-04.'
  where id = 'mth-005';

update public.ali_question_bank set explanation =
  'Discursive/persuasive argument prompt. Closest real match to Assessment Brain QT-WC-01a (Reflective/Discursive Prompt), competency WC-01.'
  where id = 'wrt-003';

update public.ali_question_bank set explanation =
  'Open interpretive question requiring evidence (''use evidence from the text'') to support a judgement about atmosphere. Same shape as eng-002-q1 (already tagged QT-RC-05, competency RC-02): asks what something reveals, supported by cited evidence, not a single quoted phrase''s effect.'
  where id = 'eng-001-q1';

update public.ali_question_bank set explanation =
  'Asks ''why did the writer choose X, what effect does this create'' about a specific stylistic choice (entry brevity). Same shape as eng-001-q3 (already tagged QT-RC-10, competency RC-02): an explicit effect-of-technique question, not a general evidence-based inference.'
  where id = 'eng-001-q4';

update public.ali_question_bank set explanation =
  'Gives a direct quotation (''no longer recognises the young man...'') and asks for its meaning plus what has changed. Quotation-and-Explanation, matching eng-002-q1''s tagged pattern (QT-RC-05, competency RC-02). Not QT-RC-03 (Word/Phrase Meaning): the quoted unit is a full clause with follow-on interpretation, not a single word/phrase gloss.'
  where id = 'eng-003-q1';

update public.ali_question_bank set explanation =
  'Direct arithmetic computation (847 + 356). Same shape as mth-002/mth-008/qa-008, already tagged QT-MR-01, competency MR-01.'
  where id = 'qa-001';

update public.ali_question_bank set explanation =
  'Direct arithmetic computation (1000 - 473). QT-MR-01, competency MR-01.'
  where id = 'qa-002';

update public.ali_question_bank set explanation =
  'Direct arithmetic computation (24 x 35). QT-MR-01, competency MR-01.'
  where id = 'qa-003';

update public.ali_question_bank set explanation =
  'Direct arithmetic computation (756 / 9). QT-MR-01, competency MR-01.'
  where id = 'qa-004';

update public.ali_question_bank set explanation =
  'Direct arithmetic computation (12.5 x 8). QT-MR-01, competency MR-01.'
  where id = 'qa-005';

update public.ali_question_bank set explanation =
  'Fraction-of-quantity calculation (3/4 of 240). Reuses mth-004''s own disclosed precedent exactly: fractions fold into Assessment Brain''s Arithmetic Calculation domain since no dedicated fractions Question Type exists. QT-MR-01, competency MR-01.'
  where id = 'qa-006';

update public.ali_question_bank set explanation =
  'Percentage-of-a-number calculation (15% of 60). Unlike fractions, Assessment Brain has a dedicated Question Type for this (QT-MR-04, Percentage/Proportional Change). Matches mth-010''s precedent exactly, not QT-MR-01.'
  where id = 'qa-007';

update public.ali_question_bank set explanation =
  'Direct arithmetic computation (2^3 x 5). Same shape as mth-002''s power calculation, QT-MR-01, competency MR-01.'
  where id = 'qa-009';

update public.ali_question_bank set explanation =
  'Literal single-fact retrieval, explicitly stated in paragraph 2. Assessment Brain QT-RC-01, competency RC-01. Evidence: CSSE-008 (2022 Entry) Q2-Q4/Q12.'
  where id = 'fv-eng-001-q1';

update public.ali_question_bank set explanation =
  'Tick-box judgement plus two independently-textually-grounded reasons. Assessment Brain QT-RC-02, competency RC-02. Evidence: CSSE-008 Q1 (2022 Entry), CSSE-003 Q2 (2023 Entry).'
  where id = 'fv-eng-001-q2';

update public.ali_question_bank set explanation =
  'Quotation-and-explanation, labelled dual demand. Assessment Brain QT-RC-05, competency RC-02. Evidence: CSSE-003 Q6b/Q12 (2023 Entry), CSSE-008 Q7 (2022 Entry).'
  where id = 'fv-eng-001-q3';

update public.ali_question_bank set explanation =
  'Effect-of-language interpretation of a personifying phrase. Assessment Brain QT-RC-10, competency RC-02. Evidence: CSSE-013 Q4/Q9 (2021 Entry), CSSE-008 Q8/Q9/Q11/Q14/Q16 (2022 Entry).'
  where id = 'fv-eng-001-q4';

update public.ali_question_bank set explanation =
  'Multi-entity comparative extraction, parallel information about two named characters. Assessment Brain QT-RC-07, competency RC-01. Evidence: CSSE-003 Q8 (2023 Entry), CSSE-008 Q15 (2022 Entry).'
  where id = 'fv-eng-001-q5';

update public.ali_question_bank set explanation =
  'Direct arithmetic computation. Assessment Brain QT-MR-01, competency MR-01. Evidence: CSSE-006/011/016 Q1-Q3 (2021-2023 Entry, opening arithmetic questions).'
  where id = 'fv-mth-001';

update public.ali_question_bank set explanation =
  'Unit conversion calculation. Assessment Brain QT-MR-03, competency MR-01. Evidence: CSSE-011 Q4a (2022 Entry), directly reused pattern ("how many millimetres in 3.12m").'
  where id = 'fv-mth-002';

update public.ali_question_bank set explanation =
  'Algebraic symbol/unknown-value problem-solving, small system requiring substitution across two relationships. Assessment Brain QT-MR-06, competency MR-02. Evidence: CSSE-011 Q6 (2022 Entry, "B=2A and 2C=A. If A+B+C=7, find A and C"), same structure, independently reworked with different letters/values.'
  where id = 'fv-mth-003';

update public.ali_question_bank set explanation =
  'Geometric angle reasoning using the isosceles property and angle-sum-in-a-triangle. Assessment Brain QT-MR-07, competency MR-03. Evidence: CSSE-011 Q12 (2022 Entry, isosceles triangle, find an angle).'
  where id = 'fv-mth-004';

update public.ali_question_bank set explanation =
  'Data reading and extraction from a table, followed by a total calculation. Assessment Brain QT-MR-09, competency MR-01. Evidence: CSSE-011 Q15 (2022 Entry, museum visitor totals), CSSE-016 Q10 (2021 Entry, goals scored bar chart).'
  where id = 'fv-mth-005';

update public.ali_question_bank set explanation =
  'Average (mean) calculation, forward reconstruction of a total then a further forward mean. Assessment Brain QT-MR-12, competency MR-01. Evidence: CSSE-011 Q11 (2022 Entry, "after 7 attempts her average is 13... 8th attempt scores 21, new average?"), same forward-then-forward structure, independently reworked. Practice UI reuses the app''s existing semicolon-split checker for the compound answer, matching the existing mth-006 precedent in migration 013.'
  where id = 'fv-mth-006';

update public.ali_question_bank set explanation =
  'Column addition with two carries. Assessment Brain QT-MR-01, competency MR-01. Teaching item for the Mathematics Reference Vertical''s Guided Attempt stage; matches the real evidence basis already established for fv-mth-001 (CSSE-006/011/016 Q1-Q3).'
  where id = 'learn-mth-arith-guided';

update public.ali_question_bank set explanation =
  'Column subtraction with borrowing across a zero. Assessment Brain QT-MR-01, competency MR-01. Teaching item for the Mathematics Reference Vertical''s Independent Check stage; same real evidence basis as fv-mth-001 and the existing production item qa-002 (1000-473).'
  where id = 'learn-mth-arith-independent';

update public.ali_question_bank set explanation =
  'Column subtraction with borrowing across a zero. Assessment Brain QT-MR-01, competency MR-01. The Mathematics Reference Vertical''s Independent Check "fresh opportunity" item, reached only after remediation on learn-mth-arith-independent, a genuinely different problem, not a repeat of the same numbers.'
  where id = 'learn-mth-arith-independent-retry';

commit;
