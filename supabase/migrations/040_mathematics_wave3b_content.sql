-- Angel Digital 11+ — Migration 040
-- Educational Increment 006B: Mathematics Sustained Supply Completion, Wave 3B.
--
-- 48 new Mathematics items across 10 NEW families, deterministically
-- generated (scripts/generate-mathematics-wave3b.mjs), validated for
-- duplicate id/question/answer, cross-checked against this migration
-- file byte-for-byte (scripts/verify-wave3b-migration.mjs). The
-- generator's own validator genuinely rejects unsuitable combinations —
-- two deliberate test candidates were rejected during generation and are
-- logged to scratchpad/wave3b_rejected.json: a compound-percentage
-- combination (+25%/-20%) that is a mathematical identity always
-- returning to the original price (would reward "it cancels out"
-- non-reasoning as if correct), and a best-value pair with identical
-- unit prices (no unambiguous answer). Five further real defects were
-- caught by manually reading the generator's output before writing this
-- migration, not by the automated validator: a table-title separator
-- that itself used an em-dash; an ambiguous "Money saved... were"
-- construction; unparenthesised negative-number multiplication in a
-- working step; a "Two small angles" label wrongly used for a
-- three-angle ratio question; and inconsistent currency formatting
-- (£1.2 instead of £1.20). All five are fixed in the generator itself,
-- not patched in this SQL.
--
-- These 10 families target genuinely under-supplied Question Types
-- identified by querying live production skill/family distribution
-- directly (QT-MR-03, 09, 10, 12 had zero prior families; QT-MR-05, 06,
-- 07, 11, 04, 13 had at most one to three, and each new family below is
-- a structurally distinct addition, not a sibling of an existing one):
--
--   mr01-measurement-conversion (QT-MR-03, MR-01, ROUTINE, 4 items)
--     Unit conversion (m/cm, kg/g, l/ml) then addition. Addresses the
--     "measurement" priority area. First family under this QT.
--
--   mr01-data-table (QT-MR-09, MR-01 primary/MR-04 supporting,
--     NEAR_TRANSFER, 5 items) Reading a small data table then computing
--     a total, difference, or range. Addresses "data interpretation".
--     First family under this QT.
--
--   mr04-elapsed-time (QT-MR-10, MR-04 primary/MR-01 supporting,
--     MIXED_TRANSFER, 5 items) Multi-stage clock-time addition with
--     minute carrying. Addresses "time". First family under this QT.
--
--   mr01-average-mean (QT-MR-12, MR-01, ROUTINE, 4 items) Mean
--     calculation across contexts including money. First family under
--     this QT.
--
--   mr02-nth-term (QT-MR-05, MR-02, FAR_TRANSFER, 5 items) Learner must
--     INFER the common-difference rule from three given terms and
--     generalise to a distant term — distinct from the existing
--     mr02-sequence-rule family, which states the rule explicitly and
--     asks for forward/inverse application. Addresses "sequences and
--     patterns" with genuine pattern-inference reasoning.
--
--   mr02-sum-difference (QT-MR-06, MR-02, NEAR_TRANSFER, 5 items) A
--     sum-and-difference simultaneous-equation structure (a - b =
--     difference, a + b = total), distinct from the existing
--     mr02-compare (substitution + comparison) and mr02-substitution
--     (two-coefficient) families.
--
--   mr03-angle-ratio (QT-MR-07, MR-03 primary/MR-02 supporting,
--     MIXED_TRANSFER, 5 items) Angles on a straight line or around a
--     point expressed as a ratio, requiring ratio-splitting before the
--     angle fact is usable — distinct from the existing mr03-angle-sum
--     (angles given directly, find the missing one) and mr03-classify
--     (shape classification) families.
--
--   mr05-factors-primes (QT-MR-11, MR-05, ROUTINE, 5 items) Factor
--     counting and primality reasoning — a genuinely different number
--     property from the existing mr05-number-property (parity/multiple
--     judgement) and mr05-constrained-multiple (bounded LCM search)
--     families. Addresses "number properties".
--
--   mr04-compound-percentage (QT-MR-04, MR-04 primary/MR-01 supporting,
--     MIXED_TRANSFER, 5 items) Successive percentage change (increase
--     then decrease applied to the already-changed amount) — distinct
--     from the existing mr04-far-percent (single proportional change)
--     family. Addresses "percentages" and "decimals" (decimal final
--     prices).
--
--   mr04-best-value (QT-MR-13, MR-04, FAR_TRANSFER, 5 items) Unit-price
--     comparison between two purchase options — distinct from the
--     existing mr04-mixed-divisibility (range/divisibility puzzle)
--     family, which shares the same QT. Addresses "money" and "ratio
--     and proportion".
--
-- Transfer distribution this wave: ROUTINE 13 (conversion 4, mean 4,
-- factors/primes 5), NEAR_TRANSFER 10 (data-table 5, sum-difference 5),
-- FAR_TRANSFER 10 (nth-term 5, best-value 5), MIXED_TRANSFER 15
-- (elapsed-time 5, angle-ratio 5, compound-percentage 5) — deliberately
-- not ROUTINE-dominated, per the standing instruction.
--
-- eligibility_status = 'provisional' throughout — same discipline as
-- every prior wave. provenance = 'angel_original' throughout. No row's
-- eligibility_status permits Practice or Mock exposure until a genuine
-- family review clears it.
--
-- ali_question_bank has no browser-writable RLS/grant path — apply via
-- Supabase Dashboard > SQL Editor.

begin;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class, supporting_competencies)
values

('mr01-conv-01', 'maths', 'QT-MR-03', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr01-conv-01","marks":1,"skill":"measurement","answer":"4.25m","question":"A ribbon is 3.4m. A second ribbon is 85cm. What is the total length in m?","workingSteps":["Convert both amounts to the same unit (m)","3.4m + 85cm = 4.25m"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-03, primary competency MR-01. Structure: UNIT CONVERSION THEN ARITHMETIC. Transfer class: ROUTINE. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-03 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr01-measurement-conversion',
 'mr01-measurement-conversion', 'angel_original', 'provisional', 1, true, 'Adding the two numbers directly without converting to the same unit first (e.g. 3.4 + 85).',
 'ROUTINE', null),

('mr01-conv-02', 'maths', 'QT-MR-03', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr01-conv-02","marks":1,"skill":"measurement","answer":"2.55m","question":"A piece of rope is 2.15m. A second piece is 40cm. What is the total length in m?","workingSteps":["Convert both amounts to the same unit (m)","2.15m + 40cm = 2.55m"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-03, primary competency MR-01. Structure: UNIT CONVERSION THEN ARITHMETIC. Transfer class: ROUTINE. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-03 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr01-measurement-conversion',
 'mr01-measurement-conversion', 'angel_original', 'provisional', 1, true, 'Adding the two numbers directly without converting to the same unit first (e.g. 2.15 + 40).',
 'ROUTINE', null),

('mr01-conv-03', 'maths', 'QT-MR-03', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr01-conv-03","marks":1,"skill":"measurement","answer":"1.55kg","question":"A bag of flour is 1.2kg. A second bag is 350g. What is the total mass in kg?","workingSteps":["Convert both amounts to the same unit (kg)","1.2kg + 350g = 1.55kg"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-03, primary competency MR-01. Structure: UNIT CONVERSION THEN ARITHMETIC. Transfer class: ROUTINE. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-03 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr01-measurement-conversion',
 'mr01-measurement-conversion', 'angel_original', 'provisional', 1, true, 'Adding the two numbers directly without converting to the same unit first (e.g. 1.2 + 350).',
 'ROUTINE', null),

('mr01-conv-04', 'maths', 'QT-MR-03', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr01-conv-04","marks":1,"skill":"measurement","answer":"2.15l","question":"A bottle of juice is 1.75l. A second bottle is 400ml. What is the total volume in l?","workingSteps":["Convert both amounts to the same unit (l)","1.75l + 400ml = 2.15l"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-03, primary competency MR-01. Structure: UNIT CONVERSION THEN ARITHMETIC. Transfer class: ROUTINE. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-03 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr01-measurement-conversion',
 'mr01-measurement-conversion', 'angel_original', 'provisional', 1, true, 'Adding the two numbers directly without converting to the same unit first (e.g. 1.75 + 400).',
 'ROUTINE', null),

('mr01-data-01', 'maths', 'QT-MR-09', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr01-data-01","marks":1,"skill":"data-interpretation","answer":"39","question":"Umbrellas sold by day. Mon: 12, Tue: 18, Wed: 9, Thu: 15, Fri: 21. What is the total number sold from Monday to Wednesday?","workingSteps":["Read the correct values from the table","Compute the answer: 39"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-09, primary competency MR-01, supporting MR-04. Structure: TABLE READING THEN ARITHMETIC. Transfer class: NEAR_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-09 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr01-data-table',
 'mr01-data-table', 'angel_original', 'provisional', 1, true, 'Adding all five values in the table instead of only the days actually asked for.',
 'NEAR_TRANSFER', array['MR-04']),

('mr01-data-02', 'maths', 'QT-MR-09', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr01-data-02","marks":1,"skill":"data-interpretation","answer":"12","question":"Umbrellas sold by day. Mon: 12, Tue: 18, Wed: 9, Thu: 15, Fri: 21. How many more were sold on Friday than on Wednesday?","workingSteps":["Read the correct values from the table","Compute the answer: 12"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-09, primary competency MR-01, supporting MR-04. Structure: TABLE READING THEN ARITHMETIC. Transfer class: NEAR_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-09 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr01-data-table',
 'mr01-data-table', 'angel_original', 'provisional', 1, true, 'Subtracting in the wrong order, or comparing the wrong two days.',
 'NEAR_TRANSFER', array['MR-04']),

('mr01-data-03', 'maths', 'QT-MR-09', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr01-data-03","marks":1,"skill":"data-interpretation","answer":"16","question":"Books read this month. Amy: 7, Ben: 4, Cara: 9, Dan: 6. What is the total read by Amy and Cara?","workingSteps":["Read the correct values from the table","Compute the answer: 16"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-09, primary competency MR-01, supporting MR-04. Structure: TABLE READING THEN ARITHMETIC. Transfer class: NEAR_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-09 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr01-data-table',
 'mr01-data-table', 'angel_original', 'provisional', 1, true, 'Including a child not named in the question.',
 'NEAR_TRANSFER', array['MR-04']),

('mr01-data-04', 'maths', 'QT-MR-09', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr01-data-04","marks":1,"skill":"data-interpretation","answer":"5","question":"Books read this month. Amy: 7, Ben: 4, Cara: 9, Dan: 6. How many fewer did Ben read than Cara?","workingSteps":["Read the correct values from the table","Compute the answer: 5"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-09, primary competency MR-01, supporting MR-04. Structure: TABLE READING THEN ARITHMETIC. Transfer class: NEAR_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-09 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr01-data-table',
 'mr01-data-table', 'angel_original', 'provisional', 1, true, 'Subtracting in the wrong order and giving a negative or reversed result.',
 'NEAR_TRANSFER', array['MR-04']),

('mr01-data-05', 'maths', 'QT-MR-09', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr01-data-05","marks":1,"skill":"data-interpretation","answer":"7","question":"Daily temperature in degrees Celsius. Mon: 14, Tue: 17, Wed: 12, Thu: 19, Fri: 15. What is the range (the difference between the highest and lowest values)?","workingSteps":["Read the correct values from the table","Compute the answer: 7"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-09, primary competency MR-01, supporting MR-04. Structure: TABLE READING THEN ARITHMETIC. Transfer class: NEAR_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-09 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr01-data-table',
 'mr01-data-table', 'angel_original', 'provisional', 1, true, 'Finding the highest or lowest value alone instead of the difference between them.',
 'NEAR_TRANSFER', array['MR-04']),

('mr04-time-01', 'maths', 'QT-MR-10', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr04-time-01","marks":1,"skill":"time","answer":"15:45","question":"A football match starts at 14:00. The first half lasts 45 minutes, followed by a 15 minute half-time break, followed by a second half of 45 minutes. What time does the match finish?","workingSteps":["Add each stage in turn, carrying minutes into hours where needed","14:00 + 45 + 15 + 45 minutes = 15:45"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-10, primary competency MR-04, supporting MR-01. Structure: MULTI-STEP TIME ADDITION. Transfer class: MIXED_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-10 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr04-elapsed-time',
 'mr04-elapsed-time', 'angel_original', 'provisional', 1, true, 'Adding the minutes and hours separately without carrying over when the minutes pass 60.',
 'MIXED_TRANSFER', array['MR-01']),

('mr04-time-02', 'maths', 'QT-MR-10', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr04-time-02","marks":1,"skill":"time","answer":"12:20","question":"A workshop starts at 10:30. The first session lasts 50 minutes, followed by a 20 minute break, followed by a second session of 40 minutes. What time does the workshop finish?","workingSteps":["Add each stage in turn, carrying minutes into hours where needed","10:30 + 50 + 20 + 40 minutes = 12:20"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-10, primary competency MR-04, supporting MR-01. Structure: MULTI-STEP TIME ADDITION. Transfer class: MIXED_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-10 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr04-elapsed-time',
 'mr04-elapsed-time', 'angel_original', 'provisional', 1, true, 'Adding the minutes and hours separately without carrying over when the minutes pass 60.',
 'MIXED_TRANSFER', array['MR-01']),

('mr04-time-03', 'maths', 'QT-MR-10', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr04-time-03","marks":1,"skill":"time","answer":"10:45","question":"A train journey starts at 07:55. The first leg takes 1 hour 35 minutes, followed by a 20 minute stop, followed by a second leg of 55 minutes. What time does the train arrive?","workingSteps":["Add each stage in turn, carrying minutes into hours where needed","07:55 + 95 + 20 + 55 minutes = 10:45"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-10, primary competency MR-04, supporting MR-01. Structure: MULTI-STEP TIME ADDITION. Transfer class: MIXED_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-10 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr04-elapsed-time',
 'mr04-elapsed-time', 'angel_original', 'provisional', 1, true, 'Adding the minutes and hours separately without carrying over when the minutes pass 60.',
 'MIXED_TRANSFER', array['MR-01']),

('mr04-time-04', 'maths', 'QT-MR-10', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr04-time-04","marks":1,"skill":"time","answer":"11:55","question":"An exam starts at 09:15. The first paper lasts 1 hour 20 minutes, followed by a 10 minute break, followed by a second paper of 1 hour 10 minutes. What time does the exam finish?","workingSteps":["Add each stage in turn, carrying minutes into hours where needed","09:15 + 80 + 10 + 70 minutes = 11:55"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-10, primary competency MR-04, supporting MR-01. Structure: MULTI-STEP TIME ADDITION. Transfer class: MIXED_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-10 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr04-elapsed-time',
 'mr04-elapsed-time', 'angel_original', 'provisional', 1, true, 'Adding the minutes and hours separately without carrying over when the minutes pass 60.',
 'MIXED_TRANSFER', array['MR-01']),

('mr04-time-05', 'maths', 'QT-MR-10', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr04-time-05","marks":1,"skill":"time","answer":"17:30","question":"A baking recipe starts at 15:40. Preparation takes 25 minutes, followed by 55 minutes of baking, followed by 30 minutes of cooling. What time is the recipe finished?","workingSteps":["Add each stage in turn, carrying minutes into hours where needed","15:40 + 25 + 55 + 30 minutes = 17:30"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-10, primary competency MR-04, supporting MR-01. Structure: MULTI-STEP TIME ADDITION. Transfer class: MIXED_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-10 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr04-elapsed-time',
 'mr04-elapsed-time', 'angel_original', 'provisional', 1, true, 'Adding the minutes and hours separately without carrying over when the minutes pass 60.',
 'MIXED_TRANSFER', array['MR-01']),

('mr01-mean-01', 'maths', 'QT-MR-12', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr01-mean-01","marks":1,"skill":"number-properties","answer":"20","question":"Amy's scores in four games were 14, 18, 22, 26. What was the mean?","workingSteps":["Add all the values: 80","Divide by how many values there are (4): 20"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-12, primary competency MR-01. Structure: MEAN CALCULATION. Transfer class: ROUTINE. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-12 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr01-average-mean',
 'mr01-average-mean', 'angel_original', 'provisional', 1, true, 'Dividing by the wrong count (e.g. one more or fewer than the number of values actually given).',
 'ROUTINE', null),

('mr01-mean-02', 'maths', 'QT-MR-12', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr01-mean-02","marks":1,"skill":"number-properties","answer":"19","question":"Five days of temperature readings were 18, 21, 15, 22, 19. What was the mean?","workingSteps":["Add all the values: 95","Divide by how many values there are (5): 19"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-12, primary competency MR-01. Structure: MEAN CALCULATION. Transfer class: ROUTINE. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-12 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr01-average-mean',
 'mr01-average-mean', 'angel_original', 'provisional', 1, true, 'Dividing by the wrong count (e.g. one more or fewer than the number of values actually given).',
 'ROUTINE', null),

('mr01-mean-03', 'maths', 'QT-MR-12', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr01-mean-03","marks":1,"skill":"number-properties","answer":"£14","question":"Weekly savings amounts over four weeks were £12, £15, £9, £20. What was the mean?","workingSteps":["Add all the values: 56","Divide by how many values there are (4): 14"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-12, primary competency MR-01. Structure: MEAN CALCULATION. Transfer class: ROUTINE. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-12 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr01-average-mean',
 'mr01-average-mean', 'angel_original', 'provisional', 1, true, 'Dividing by the wrong count (e.g. one more or fewer than the number of values actually given).',
 'ROUTINE', null),

('mr01-mean-04', 'maths', 'QT-MR-12', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr01-mean-04","marks":1,"skill":"number-properties","answer":"7","question":"Distances run (km) over five days were 5, 7, 6, 8, 9. What was the mean?","workingSteps":["Add all the values: 35","Divide by how many values there are (5): 7"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-12, primary competency MR-01. Structure: MEAN CALCULATION. Transfer class: ROUTINE. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-12 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr01-average-mean',
 'mr01-average-mean', 'angel_original', 'provisional', 1, true, 'Dividing by the wrong count (e.g. one more or fewer than the number of values actually given).',
 'ROUTINE', null),

('mr02-nth-01', 'maths', 'QT-MR-05', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr02-nth-01","marks":1,"skill":"algebra","answer":"49","question":"A sequence begins 4, 9, 14, ... and continues with the same pattern. What is the 10th term?","workingSteps":["Find the common difference between terms: 5","The nth term is the first term plus (n − 1) lots of the difference","4 + (10 − 1) × 5 = 49"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-05, primary competency MR-02. Structure: PATTERN INFERENCE THEN GENERALISATION. Transfer class: FAR_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-05 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr02-nth-term',
 'mr02-nth-term', 'angel_original', 'provisional', 1, true, 'Multiplying the term position directly by the difference without adjusting for the starting term (e.g. giving 50 instead of 49).',
 'FAR_TRANSFER', null),

('mr02-nth-02', 'maths', 'QT-MR-05', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr02-nth-02","marks":1,"skill":"algebra","answer":"40","question":"A sequence begins 7, 10, 13, ... and continues with the same pattern. What is the 12th term?","workingSteps":["Find the common difference between terms: 3","The nth term is the first term plus (n − 1) lots of the difference","7 + (12 − 1) × 3 = 40"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-05, primary competency MR-02. Structure: PATTERN INFERENCE THEN GENERALISATION. Transfer class: FAR_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-05 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr02-nth-term',
 'mr02-nth-term', 'angel_original', 'provisional', 1, true, 'Multiplying the term position directly by the difference without adjusting for the starting term (e.g. giving 36 instead of 40).',
 'FAR_TRANSFER', null),

('mr02-nth-03', 'maths', 'QT-MR-05', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr02-nth-03","marks":1,"skill":"algebra","answer":"44","question":"A sequence begins 2, 8, 14, ... and continues with the same pattern. What is the 8th term?","workingSteps":["Find the common difference between terms: 6","The nth term is the first term plus (n − 1) lots of the difference","2 + (8 − 1) × 6 = 44"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-05, primary competency MR-02. Structure: PATTERN INFERENCE THEN GENERALISATION. Transfer class: FAR_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-05 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr02-nth-term',
 'mr02-nth-term', 'angel_original', 'provisional', 1, true, 'Multiplying the term position directly by the difference without adjusting for the starting term (e.g. giving 48 instead of 44).',
 'FAR_TRANSFER', null),

('mr02-nth-04', 'maths', 'QT-MR-05', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr02-nth-04","marks":1,"skill":"algebra","answer":"44","question":"A sequence begins 100, 93, 86, ... and continues with the same pattern. What is the 9th term?","workingSteps":["Find the common difference between terms: -7","The nth term is the first term plus (n − 1) lots of the difference","100 + (9 − 1) × (-7) = 44"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-05, primary competency MR-02. Structure: PATTERN INFERENCE THEN GENERALISATION. Transfer class: FAR_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-05 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr02-nth-term',
 'mr02-nth-term', 'angel_original', 'provisional', 1, true, 'Multiplying the term position directly by the difference without adjusting for the starting term (e.g. giving -63 instead of 44).',
 'FAR_TRANSFER', null),

('mr02-nth-05', 'maths', 'QT-MR-05', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr02-nth-05","marks":1,"skill":"algebra","answer":"71","question":"A sequence begins 15, 19, 23, ... and continues with the same pattern. What is the 15th term?","workingSteps":["Find the common difference between terms: 4","The nth term is the first term plus (n − 1) lots of the difference","15 + (15 − 1) × 4 = 71"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-05, primary competency MR-02. Structure: PATTERN INFERENCE THEN GENERALISATION. Transfer class: FAR_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-05 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr02-nth-term',
 'mr02-nth-term', 'angel_original', 'provisional', 1, true, 'Multiplying the term position directly by the difference without adjusting for the starting term (e.g. giving 60 instead of 71).',
 'FAR_TRANSFER', null),

('mr02-sumdiff-01', 'maths', 'QT-MR-06', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr02-sumdiff-01","marks":1,"skill":"algebra","answer":"£14","question":"Priya has £8 more than Sam in savings. Together they have £36. How much does Sam have?","workingSteps":["If the smaller amount is x, the larger amount is x + 8","x + (x + 8) = 36","2x = 28, so x = 14"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-06, primary competency MR-02. Structure: SUM-AND-DIFFERENCE SIMULTANEOUS REASONING. Transfer class: NEAR_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-06 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr02-sum-difference',
 'mr02-sum-difference', 'angel_original', 'provisional', 1, true, 'Splitting the total evenly (£18) without accounting for the stated difference.',
 'NEAR_TRANSFER', null),

('mr02-sumdiff-02', 'maths', 'QT-MR-06', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr02-sumdiff-02","marks":1,"skill":"algebra","answer":"£9","question":"Leo has £6 more than Mia in pocket money. Together they have £24. How much does Mia have?","workingSteps":["If the smaller amount is x, the larger amount is x + 6","x + (x + 6) = 24","2x = 18, so x = 9"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-06, primary competency MR-02. Structure: SUM-AND-DIFFERENCE SIMULTANEOUS REASONING. Transfer class: NEAR_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-06 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr02-sum-difference',
 'mr02-sum-difference', 'angel_original', 'provisional', 1, true, 'Splitting the total evenly (£12) without accounting for the stated difference.',
 'NEAR_TRANSFER', null),

('mr02-sumdiff-03', 'maths', 'QT-MR-06', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr02-sumdiff-03","marks":1,"skill":"algebra","answer":"£19","question":"Noah has £12 more than Ava in prize money. Together they have £50. How much does Ava have?","workingSteps":["If the smaller amount is x, the larger amount is x + 12","x + (x + 12) = 50","2x = 38, so x = 19"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-06, primary competency MR-02. Structure: SUM-AND-DIFFERENCE SIMULTANEOUS REASONING. Transfer class: NEAR_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-06 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr02-sum-difference',
 'mr02-sum-difference', 'angel_original', 'provisional', 1, true, 'Splitting the total evenly (£25) without accounting for the stated difference.',
 'NEAR_TRANSFER', null),

('mr02-sumdiff-04', 'maths', 'QT-MR-06', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr02-sumdiff-04","marks":1,"skill":"algebra","answer":"£15","question":"Zara has £10 more than Tom in birthday money. Together they have £40. How much does Tom have?","workingSteps":["If the smaller amount is x, the larger amount is x + 10","x + (x + 10) = 40","2x = 30, so x = 15"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-06, primary competency MR-02. Structure: SUM-AND-DIFFERENCE SIMULTANEOUS REASONING. Transfer class: NEAR_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-06 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr02-sum-difference',
 'mr02-sum-difference', 'angel_original', 'provisional', 1, true, 'Splitting the total evenly (£20) without accounting for the stated difference.',
 'NEAR_TRANSFER', null),

('mr02-sumdiff-05', 'maths', 'QT-MR-06', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr02-sumdiff-05","marks":1,"skill":"algebra","answer":"£10","question":"Ellis has £5 more than Nia in collected coins. Together they have £25. How much does Nia have?","workingSteps":["If the smaller amount is x, the larger amount is x + 5","x + (x + 5) = 25","2x = 20, so x = 10"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-06, primary competency MR-02. Structure: SUM-AND-DIFFERENCE SIMULTANEOUS REASONING. Transfer class: NEAR_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-06 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr02-sum-difference',
 'mr02-sum-difference', 'angel_original', 'provisional', 1, true, 'Splitting the total evenly (£12.5) without accounting for the stated difference.',
 'NEAR_TRANSFER', null),

('mr03-angratio-01', 'maths', 'QT-MR-07', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr03-angratio-01","marks":1,"skill":"geometry","answer":"108°","question":"Two angles on a straight line are in the ratio 2:3. What is the size of the largest angle?","workingSteps":["Angles on a straight line add up to 180°","Split 180° in the ratio 2:3: each share is 36°","The largest angle is 3 × 36 = 108°"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-07, primary competency MR-03, supporting MR-02. Structure: RATIO-BASED ANGLE REASONING. Transfer class: MIXED_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-07 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr03-angle-ratio',
 'mr03-angle-ratio', 'angel_original', 'provisional', 1, true, 'Treating the ratio numbers themselves as the answer in degrees, instead of scaling them to fit 180°.',
 'MIXED_TRANSFER', array['MR-02']),

('mr03-angratio-02', 'maths', 'QT-MR-07', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr03-angratio-02","marks":1,"skill":"geometry","answer":"100°","question":"Two angles on a straight line are in the ratio 5:4. What is the size of the largest angle?","workingSteps":["Angles on a straight line add up to 180°","Split 180° in the ratio 5:4: each share is 20°","The largest angle is 5 × 20 = 100°"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-07, primary competency MR-03, supporting MR-02. Structure: RATIO-BASED ANGLE REASONING. Transfer class: MIXED_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-07 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr03-angle-ratio',
 'mr03-angle-ratio', 'angel_original', 'provisional', 1, true, 'Treating the ratio numbers themselves as the answer in degrees, instead of scaling them to fit 180°.',
 'MIXED_TRANSFER', array['MR-02']),

('mr03-angratio-03', 'maths', 'QT-MR-07', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr03-angratio-03","marks":1,"skill":"geometry","answer":"180°","question":"Three angles around a point are in the ratio 1:2:3. What is the size of the largest angle?","workingSteps":["Angles around a point add up to 360°","Split 360° in the ratio 1:2:3: each share is 60°","The largest angle is 3 × 60 = 180°"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-07, primary competency MR-03, supporting MR-02. Structure: RATIO-BASED ANGLE REASONING. Transfer class: MIXED_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-07 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr03-angle-ratio',
 'mr03-angle-ratio', 'angel_original', 'provisional', 1, true, 'Treating the ratio numbers themselves as the answer in degrees, instead of scaling them to fit 360°.',
 'MIXED_TRANSFER', array['MR-02']),

('mr03-angratio-04', 'maths', 'QT-MR-07', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr03-angratio-04","marks":1,"skill":"geometry","answer":"160°","question":"Three angles around a point are in the ratio 2:3:4. What is the size of the largest angle?","workingSteps":["Angles around a point add up to 360°","Split 360° in the ratio 2:3:4: each share is 40°","The largest angle is 4 × 40 = 160°"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-07, primary competency MR-03, supporting MR-02. Structure: RATIO-BASED ANGLE REASONING. Transfer class: MIXED_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-07 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr03-angle-ratio',
 'mr03-angle-ratio', 'angel_original', 'provisional', 1, true, 'Treating the ratio numbers themselves as the answer in degrees, instead of scaling them to fit 360°.',
 'MIXED_TRANSFER', array['MR-02']),

('mr03-angratio-05', 'maths', 'QT-MR-07', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr03-angratio-05","marks":1,"skill":"geometry","answer":"105°","question":"Two angles on a straight line are in the ratio 7:5. What is the size of the largest angle?","workingSteps":["Angles on a straight line add up to 180°","Split 180° in the ratio 7:5: each share is 15°","The largest angle is 7 × 15 = 105°"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-07, primary competency MR-03, supporting MR-02. Structure: RATIO-BASED ANGLE REASONING. Transfer class: MIXED_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-07 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr03-angle-ratio',
 'mr03-angle-ratio', 'angel_original', 'provisional', 1, true, 'Treating the ratio numbers themselves as the answer in degrees, instead of scaling them to fit 180°.',
 'MIXED_TRANSFER', array['MR-02']),

('mr05-fp-01', 'maths', 'QT-MR-11', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr05-fp-01","marks":1,"skill":"number-properties","answer":"8","question":"How many factors does 24 have?","workingSteps":["List every number that divides exactly into 24: 1, 2, 3, 4, 6, 8, 12, 24","Count them: 8"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-11, primary competency MR-05. Structure: FACTOR/PRIME PROPERTY REASONING. Transfer class: ROUTINE. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-11 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr05-factors-primes',
 'mr05-factors-primes', 'angel_original', 'provisional', 1, true, 'Listing only the obvious factor pairs and missing one, or including a number that does not divide exactly.',
 'ROUTINE', null),

('mr05-fp-02', 'maths', 'QT-MR-11', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr05-fp-02","marks":1,"skill":"number-properties","answer":"9","question":"How many factors does 36 have?","workingSteps":["List every number that divides exactly into 36: 1, 2, 3, 4, 6, 9, 12, 18, 36","Count them: 9"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-11, primary competency MR-05. Structure: FACTOR/PRIME PROPERTY REASONING. Transfer class: ROUTINE. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-11 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr05-factors-primes',
 'mr05-factors-primes', 'angel_original', 'provisional', 1, true, 'Listing only the obvious factor pairs and missing one, or including a number that does not divide exactly.',
 'ROUTINE', null),

('mr05-fp-03', 'maths', 'QT-MR-11', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr05-fp-03","marks":1,"skill":"number-properties","answer":"True","question":"Is 29 a prime number? Answer True or False.","workingSteps":["Check every number from 2 up to the square root of 29","None divide exactly into 29, so it is prime"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-11, primary competency MR-05. Structure: FACTOR/PRIME PROPERTY REASONING. Transfer class: ROUTINE. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-11 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr05-factors-primes',
 'mr05-factors-primes', 'angel_original', 'provisional', 1, true, 'Assuming odd numbers are always prime, or forgetting that 1 is not a prime number.',
 'ROUTINE', null),

('mr05-fp-04', 'maths', 'QT-MR-11', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr05-fp-04","marks":1,"skill":"number-properties","answer":"False","question":"Is 51 a prime number? Answer True or False.","workingSteps":["51 can be divided exactly by 3","A number with a factor other than 1 and itself is not prime"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-11, primary competency MR-05. Structure: FACTOR/PRIME PROPERTY REASONING. Transfer class: ROUTINE. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-11 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr05-factors-primes',
 'mr05-factors-primes', 'angel_original', 'provisional', 1, true, 'Assuming odd numbers are always prime, or forgetting that 1 is not a prime number.',
 'ROUTINE', null),

('mr05-fp-05', 'maths', 'QT-MR-11', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr05-fp-05","marks":1,"skill":"number-properties","answer":"6","question":"How many factors does 18 have?","workingSteps":["List every number that divides exactly into 18: 1, 2, 3, 6, 9, 18","Count them: 6"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-11, primary competency MR-05. Structure: FACTOR/PRIME PROPERTY REASONING. Transfer class: ROUTINE. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-11 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr05-factors-primes',
 'mr05-factors-primes', 'angel_original', 'provisional', 1, true, 'Listing only the obvious factor pairs and missing one, or including a number that does not divide exactly.',
 'ROUTINE', null),

('mr04-cpct-01', 'maths', 'QT-MR-04', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr04-cpct-01","marks":1,"skill":"arithmetic","answer":"£85","question":"A jacket costs £80. The price is increased by 25%, then later decreased by 15%. What is the final price?","workingSteps":["Increase: £80 × 1.25 = £100","Decrease: £100 × 0.85 = £85"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-04, primary competency MR-04, supporting MR-01. Structure: SUCCESSIVE PERCENTAGE CHANGE. Transfer class: MIXED_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-04 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr04-compound-percentage',
 'mr04-compound-percentage', 'angel_original', 'provisional', 1, true, 'Applying both percentages to the original price separately instead of applying the second change to the already-changed price.',
 'MIXED_TRANSFER', array['MR-01']),

('mr04-cpct-02', 'maths', 'QT-MR-04', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr04-cpct-02","marks":1,"skill":"arithmetic","answer":"£198","question":"A bicycle costs £200. The price is increased by 10%, then later decreased by 10%. What is the final price?","workingSteps":["Increase: £200 × 1.1 = £220","Decrease: £220 × 0.9 = £198"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-04, primary competency MR-04, supporting MR-01. Structure: SUCCESSIVE PERCENTAGE CHANGE. Transfer class: MIXED_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-04 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr04-compound-percentage',
 'mr04-compound-percentage', 'angel_original', 'provisional', 1, true, 'Applying both percentages to the original price separately instead of applying the second change to the already-changed price.',
 'MIXED_TRANSFER', array['MR-01']),

('mr04-cpct-03', 'maths', 'QT-MR-04', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr04-cpct-03","marks":1,"skill":"arithmetic","answer":"£153","question":"A games console costs £150. The price is increased by 20%, then later decreased by 15%. What is the final price?","workingSteps":["Increase: £150 × 1.2 = £180","Decrease: £180 × 0.85 = £153"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-04, primary competency MR-04, supporting MR-01. Structure: SUCCESSIVE PERCENTAGE CHANGE. Transfer class: MIXED_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-04 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr04-compound-percentage',
 'mr04-compound-percentage', 'angel_original', 'provisional', 1, true, 'Applying both percentages to the original price separately instead of applying the second change to the already-changed price.',
 'MIXED_TRANSFER', array['MR-01']),

('mr04-cpct-04', 'maths', 'QT-MR-04', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr04-cpct-04","marks":1,"skill":"arithmetic","answer":"£54","question":"A watch costs £60. The price is increased by 50%, then later decreased by 40%. What is the final price?","workingSteps":["Increase: £60 × 1.5 = £90","Decrease: £90 × 0.6 = £54"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-04, primary competency MR-04, supporting MR-01. Structure: SUCCESSIVE PERCENTAGE CHANGE. Transfer class: MIXED_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-04 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr04-compound-percentage',
 'mr04-compound-percentage', 'angel_original', 'provisional', 1, true, 'Applying both percentages to the original price separately instead of applying the second change to the already-changed price.',
 'MIXED_TRANSFER', array['MR-01']),

('mr04-cpct-05', 'maths', 'QT-MR-04', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr04-cpct-05","marks":1,"skill":"arithmetic","answer":"£202.50","question":"A tablet costs £250. The price is increased by 8%, then later decreased by 25%. What is the final price?","workingSteps":["Increase: £250 × 1.08 = £270","Decrease: £270 × 0.75 = £202.50"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-04, primary competency MR-04, supporting MR-01. Structure: SUCCESSIVE PERCENTAGE CHANGE. Transfer class: MIXED_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-04 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.', 2, 'wave3b-mr04-compound-percentage',
 'mr04-compound-percentage', 'angel_original', 'provisional', 1, true, 'Applying both percentages to the original price separately instead of applying the second change to the already-changed price.',
 'MIXED_TRANSFER', array['MR-01']),

('mr04-bv-01', 'maths', 'QT-MR-13', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr04-bv-01","marks":1,"skill":"arithmetic","answer":"A","question":"Apples: Option A is 3 for £1.20. Option B is 5 for £2.25. Which option is better value, A or B?","workingSteps":["Option A: £1.20 ÷ 3 = £0.40 each","Option B: £2.25 ÷ 5 = £0.45 each","The lower price-per-item is better value: Option A"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-13, primary competency MR-04. Structure: UNIT-PRICE COMPARISON. Transfer class: FAR_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-13 (Obs. 11): CSSE-006, CSSE-016.', 2, 'wave3b-mr04-best-value',
 'mr04-best-value', 'angel_original', 'provisional', 1, true, 'Comparing the total prices directly instead of working out the price per item first.',
 'FAR_TRANSFER', null),

('mr04-bv-02', 'maths', 'QT-MR-13', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr04-bv-02","marks":1,"skill":"arithmetic","answer":"B","question":"Notebooks: Option A is 4 for £3.60. Option B is 6 for £4.80. Which option is better value, A or B?","workingSteps":["Option A: £3.60 ÷ 4 = £0.90 each","Option B: £4.80 ÷ 6 = £0.80 each","The lower price-per-item is better value: Option B"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-13, primary competency MR-04. Structure: UNIT-PRICE COMPARISON. Transfer class: FAR_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-13 (Obs. 11): CSSE-006, CSSE-016.', 2, 'wave3b-mr04-best-value',
 'mr04-best-value', 'angel_original', 'provisional', 1, true, 'Comparing the total prices directly instead of working out the price per item first.',
 'FAR_TRANSFER', null),

('mr04-bv-03', 'maths', 'QT-MR-13', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr04-bv-03","marks":1,"skill":"arithmetic","answer":"B","question":"Juice cartons: Option A is 2 for £1.50. Option B is 3 for £2.10. Which option is better value, A or B?","workingSteps":["Option A: £1.50 ÷ 2 = £0.75 each","Option B: £2.10 ÷ 3 = £0.70 each","The lower price-per-item is better value: Option B"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-13, primary competency MR-04. Structure: UNIT-PRICE COMPARISON. Transfer class: FAR_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-13 (Obs. 11): CSSE-006, CSSE-016.', 2, 'wave3b-mr04-best-value',
 'mr04-best-value', 'angel_original', 'provisional', 1, true, 'Comparing the total prices directly instead of working out the price per item first.',
 'FAR_TRANSFER', null),

('mr04-bv-04', 'maths', 'QT-MR-13', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr04-bv-04","marks":1,"skill":"arithmetic","answer":"A","question":"Pencils: Option A is 10 for £2. Option B is 6 for £1.50. Which option is better value, A or B?","workingSteps":["Option A: £2 ÷ 10 = £0.20 each","Option B: £1.50 ÷ 6 = £0.25 each","The lower price-per-item is better value: Option A"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-13, primary competency MR-04. Structure: UNIT-PRICE COMPARISON. Transfer class: FAR_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-13 (Obs. 11): CSSE-006, CSSE-016.', 2, 'wave3b-mr04-best-value',
 'mr04-best-value', 'angel_original', 'provisional', 1, true, 'Comparing the total prices directly instead of working out the price per item first.',
 'FAR_TRANSFER', null),

('mr04-bv-05', 'maths', 'QT-MR-13', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr04-bv-05","marks":1,"skill":"arithmetic","answer":"A","question":"Bottled water: Option A is 6 for £3. Option B is 8 for £4.40. Which option is better value, A or B?","workingSteps":["Option A: £3 ÷ 6 = £0.50 each","Option B: £4.40 ÷ 8 = £0.55 each","The lower price-per-item is better value: Option A"]}$json$,
 'Educational Increment 006B, Wave 3B. Assessment Brain QT-MR-13, primary competency MR-04. Structure: UNIT-PRICE COMPARISON. Transfer class: FAR_TRANSFER. Deterministically generated by scripts/generate-mathematics-wave3b.mjs and validated for duplicate id/question/answer before authoring. Real evidence basis: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-13 (Obs. 11): CSSE-006, CSSE-016.', 2, 'wave3b-mr04-best-value',
 'mr04-best-value', 'angel_original', 'provisional', 1, true, 'Comparing the total prices directly instead of working out the price per item first.',
 'FAR_TRANSFER', null)

on conflict (id) do nothing;

commit;
