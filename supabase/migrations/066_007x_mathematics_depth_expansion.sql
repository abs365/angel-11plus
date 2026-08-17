-- Angel Digital 11+ — Migration 066
-- Educational Increment 007X — Mathematics Content Depth and Transfer Expansion.
--
-- 14 new Mathematics questions across 4 families (mr05-number-property-search,
-- mr03-mixed-perimeter, precision-frac, precision-dec), each selected because
-- Phase B (ANGEL_PHASE_B_MATHEMATICS_TEACHING_COMPLETION_V1.md) named a concrete,
-- specific gap in that family. All rows inserted as eligibility_status =
-- 'provisional'. Plus one metadata-only reclassification (mth-003 into
-- mr03-mixed-perimeter, matching migration 062's own precedent) that changes no
-- other column and does not alter eligibility_status.
--
-- Every answer independently recomputed from first principles before this file
-- was generated (scripts/generate-007x-mathematics-batch.mjs's own verify()).
--
-- Idempotent: every INSERT uses "on conflict (id) do nothing"; the UPDATE only
-- matches a row that still has family_id IS NULL.
--
-- NOT APPLIED by this increment. Generated for Founder review and manual
-- application via Supabase Dashboard > SQL Editor > New query, gated on
-- Founder/Product approval of this increment's report.

begin;

-- === New provisional Mathematics questions (14 rows) ===============

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr05-search-03', 'maths', 'QT-MR-11', array['csse'], 'easy', 'short-answer', 45,
 $json${"id":"mr05-search-03","marks":1,"skill":"arithmetic","answer":"64","question":"What is the smallest square number greater than 50?","workingSteps":["7² = 49, which is not greater than 50","8² = 64, which is greater than 50"]}$json$,
 'Educational Increment 007X, Part 8. Assessment Brain QT-MR-11, competency MR-05. Question family: mr05-number-property-search. Added per Phase B''s own explicit recommendation (ANGEL_PHASE_B_MATHEMATICS_TEACHING_COMPLETION_V1.md) to vary the searched property beyond the 2 existing near-identical prime-search siblings before this TRANSFER-UNSAFE family is reconsidered for teaching content. Answer independently recomputed, see verification record.',
 2, 'mr05-search-03',
 'mr05-number-property-search', 'angel_original', 'provisional', 1, true, 'checking-bases-without-recognising-nearest-square-below-the-bound',
 'ROUTINE'),
('mr05-search-04', 'maths', 'QT-MR-11', array['csse'], 'medium', 'short-answer', 75,
 $json${"id":"mr05-search-04","marks":2,"skill":"arithmetic","answer":"42","question":"What is the largest factor of 84 that is less than 84 itself?","workingSteps":["The largest proper factor of a number is the number divided by its smallest prime factor","84's smallest prime factor is 2","84 ÷ 2 = 42"]}$json$,
 'Educational Increment 007X, Part 8. Assessment Brain QT-MR-11, competency MR-05. Question family: mr05-number-property-search. Added per Phase B''s own explicit recommendation (ANGEL_PHASE_B_MATHEMATICS_TEACHING_COMPLETION_V1.md) to vary the searched property beyond the 2 existing near-identical prime-search siblings before this TRANSFER-UNSAFE family is reconsidered for teaching content. Answer independently recomputed, see verification record.',
 2, 'mr05-search-04',
 'mr05-number-property-search', 'angel_original', 'provisional', 1, true, 'confusing-largest-proper-factor-with-largest-prime-factor',
 'ROUTINE'),
('mr05-search-05', 'maths', 'QT-MR-11', array['csse'], 'easy', 'short-answer', 45,
 $json${"id":"mr05-search-05","marks":1,"skill":"arithmetic","answer":"102","question":"What is the smallest multiple of 6 that is greater than 100?","workingSteps":["100 ÷ 6 = 16 remainder 4, so 6 × 16 = 96 is not greater than 100","6 × 17 = 102"]}$json$,
 'Educational Increment 007X, Part 8. Assessment Brain QT-MR-11, competency MR-05. Question family: mr05-number-property-search. Added per Phase B''s own explicit recommendation (ANGEL_PHASE_B_MATHEMATICS_TEACHING_COMPLETION_V1.md) to vary the searched property beyond the 2 existing near-identical prime-search siblings before this TRANSFER-UNSAFE family is reconsidered for teaching content. Answer independently recomputed, see verification record.',
 2, 'mr05-search-05',
 'mr05-number-property-search', 'angel_original', 'provisional', 1, true, 'rounding-the-division-down-and-stopping-at-a-multiple-still-below-the-bound',
 'ROUTINE'),
('mr05-search-06', 'maths', 'QT-MR-11', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr05-search-06","marks":2,"skill":"arithmetic","answer":"80","question":"What is the smallest number greater than 60 that is a multiple of both 4 and 5?","workingSteps":["A number that is a multiple of both 4 and 5 must be a multiple of their LCM, 20","Multiples of 20: 20, 40, 60, 80 ...","60 is not greater than 60, so the answer is 80"]}$json$,
 'Educational Increment 007X, Part 8. Assessment Brain QT-MR-11, competency MR-05. Question family: mr05-number-property-search. Added per Phase B''s own explicit recommendation (ANGEL_PHASE_B_MATHEMATICS_TEACHING_COMPLETION_V1.md) to vary the searched property beyond the 2 existing near-identical prime-search siblings before this TRANSFER-UNSAFE family is reconsidered for teaching content. Answer independently recomputed, see verification record.',
 2, 'mr05-search-06',
 'mr05-number-property-search', 'angel_original', 'provisional', 1, true, 'testing-only-one-of-the-two-constraints-instead-of-their-lcm',
 'NEAR_TRANSFER'),
('mr05-search-07', 'maths', 'QT-MR-11', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr05-search-07","marks":2,"skill":"arithmetic","answer":"37","question":"What is the smallest prime number greater than the square of 6?","workingSteps":["6² = 36","37 is not divisible by 2, 3, or 5, so 37 is prime","37 is the smallest prime greater than 36"]}$json$,
 'Educational Increment 007X, Part 8. Assessment Brain QT-MR-11, competency MR-05. Question family: mr05-number-property-search. Added per Phase B''s own explicit recommendation (ANGEL_PHASE_B_MATHEMATICS_TEACHING_COMPLETION_V1.md) to vary the searched property beyond the 2 existing near-identical prime-search siblings before this TRANSFER-UNSAFE family is reconsidered for teaching content. Answer independently recomputed, see verification record.',
 2, 'mr05-search-07',
 'mr05-number-property-search', 'angel_original', 'provisional', 1, true, 'searching-for-a-prime-greater-than-6-itself-instead-of-greater-than-its-square',
 'NEAR_TRANSFER'),
('mr03-mix-04', 'maths', 'QT-MR-07', array['csse'], 'medium', 'short-answer', 75,
 $json${"id":"mr03-mix-04","marks":2,"skill":"arithmetic","answer":"180","question":"A rectangular playground has a perimeter of 54m. One side is 15m. What is the area?","workingSteps":["Half the perimeter: 54 ÷ 2 = 27m","The other side: 27 − 15 = 12m","Area = 15 × 12 = 180 m²"]}$json$,
 'Educational Increment 007X, Part 4/11. Assessment Brain QT-MR-07, competency MR-03. Question family: mr03-mixed-perimeter. Added per Phase B''s #1-ranked LIMITED-family finding (identical word-problem template x3) — genuine structural variants (reverse direction, decimal arithmetic, square special case). Answer independently recomputed, see verification record.',
 2, 'mr03-mix-04',
 'mr03-mixed-perimeter', 'angel_original', 'provisional', 1, true, 'halving-the-perimeter-incorrectly-or-treating-it-directly-as-one-side',
 'MIXED_TRANSFER'),
('mr03-mix-05', 'maths', 'QT-MR-07', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr03-mix-05","marks":2,"skill":"arithmetic","answer":"29m","question":"A rectangular pond has an area of 52.5 m² and one side is 7.5m. What is the perimeter?","workingSteps":["The other side: 52.5 ÷ 7.5 = 7m","Perimeter = 2 × (7.5 + 7) = 29m"]}$json$,
 'Educational Increment 007X, Part 4/11. Assessment Brain QT-MR-07, competency MR-03. Question family: mr03-mixed-perimeter. Added per Phase B''s #1-ranked LIMITED-family finding (identical word-problem template x3) — genuine structural variants (reverse direction, decimal arithmetic, square special case). Answer independently recomputed, see verification record.',
 2, 'mr03-mix-05',
 'mr03-mixed-perimeter', 'angel_original', 'provisional', 1, true, 'decimal-division-error-or-dropping-the-decimal-point-when-finding-the-other-side',
 'MIXED_TRANSFER'),
('mr03-mix-06', 'maths', 'QT-MR-07', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr03-mix-06","marks":2,"skill":"arithmetic","answer":"36m","question":"A square garden has an area of 81 m². What is its perimeter?","workingSteps":["A square's side length is the square root of its area: √81 = 9m","Perimeter = 4 × 9 = 36m"]}$json$,
 'Educational Increment 007X, Part 4/11. Assessment Brain QT-MR-07, competency MR-03. Question family: mr03-mixed-perimeter. Added per Phase B''s #1-ranked LIMITED-family finding (identical word-problem template x3) — genuine structural variants (reverse direction, decimal arithmetic, square special case). Answer independently recomputed, see verification record.',
 2, 'mr03-mix-06',
 'mr03-mixed-perimeter', 'angel_original', 'provisional', 1, true, 'attempting-to-use-the-rectangle-perimeter-formula-2x(l+w)-without-first-finding-the-side-via-a-square-root',
 'MIXED_TRANSFER'),
('precision-frac-04', 'maths', 'QT-MR-14', array['csse'], 'easy', 'short-answer', 60,
 $json${"id":"precision-frac-04","marks":1,"skill":"arithmetic","answer":"5/8","question":"A 5m rope is cut into 8 equal pieces. What is the length of each piece? Give your answer as an exact fraction of a metre, in its simplest form.","workingSteps":["5 ÷ 8 does not divide evenly","As an exact fraction: 5/8 m","5 and 8 share no common factor, so 5/8 is already in simplest form"]}$json$,
 'Educational Increment 007X, Part 4/11. Assessment Brain QT-MR-14, competency MR-06 (precision/exactness). Question family: precision-frac. Added per Phase B''s explicit fix (needs a non-improper-fraction / already-simplified case). Answer independently recomputed, see verification record.',
 2, 'precision-frac-04',
 'precision-frac', 'angel_original', 'provisional', 1, true, 'believing-a-cut-length-answer-below-1-must-be-wrong-and-converting-it-to-a-decimal-or-over-simplifying',
 null),
('precision-frac-05', 'maths', 'QT-MR-14', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"precision-frac-05","marks":2,"skill":"arithmetic","answer":"1 1/2","question":"A 12m cable is cut into 8 equal pieces. What is the length of each piece? Give your answer as an exact fraction of a metre, in its simplest form.","workingSteps":["12 ÷ 8 as a fraction: 12/8 m","12/8 simplifies to 3/2 (divide both by 4)","3/2 = 1 1/2 m"]}$json$,
 'Educational Increment 007X, Part 4/11. Assessment Brain QT-MR-14, competency MR-06 (precision/exactness). Question family: precision-frac. Added per Phase B''s explicit fix (needs a non-improper-fraction / already-simplified case). Answer independently recomputed, see verification record.',
 2, 'precision-frac-05',
 'precision-frac', 'angel_original', 'provisional', 1, true, 'converting-12/8-directly-to-a-mixed-number-without-simplifying-first-e.g.-writing-1-4/8',
 null),
('precision-frac-06', 'maths', 'QT-MR-14', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"precision-frac-06","marks":1,"skill":"arithmetic","answer":"11 1/4","question":"A 45m fence is cut into 4 equal sections. What is the length of each section? Give your answer as an exact fraction of a metre, in its simplest form.","workingSteps":["45 ÷ 4 does not divide evenly","As an exact fraction: 45/4 m","45/4 = 11 remainder 1, so 11 1/4 m"]}$json$,
 'Educational Increment 007X, Part 4/11. Assessment Brain QT-MR-14, competency MR-06 (precision/exactness). Question family: precision-frac. Added per Phase B''s explicit fix (needs a non-improper-fraction / already-simplified case). Answer independently recomputed, see verification record.',
 2, 'precision-frac-06',
 'precision-frac', 'angel_original', 'provisional', 1, true, 'losing-track-of-the-remainder-in-long-division-with-larger-numbers',
 null),
('precision-dec-04', 'maths', 'QT-MR-14', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"precision-dec-04","marks":1,"skill":"arithmetic","answer":"3.14","question":"22 ÷ 7 = ? Give your answer to 2 decimal places.","workingSteps":["22 ÷ 7 = 3.142857... (repeating)","The third decimal digit is 2, so the second decimal place stays as it is","3.142... rounds to 3.14"]}$json$,
 'Educational Increment 007X, Part 4/11. Assessment Brain QT-MR-14, competency MR-06 (precision/exactness). Question family: precision-dec. Added per Phase B''s explicit fix (needs a round-down example). Answer independently recomputed, see verification record.',
 2, 'precision-dec-04',
 'precision-dec', 'angel_original', 'provisional', 1, true, 'assuming-every-rounding-question-rounds-up-having-only-practised-round-up-examples',
 null),
('precision-dec-05', 'maths', 'QT-MR-14', array['csse'], 'hard', 'short-answer', 75,
 $json${"id":"precision-dec-05","marks":2,"skill":"arithmetic","answer":"5.667","question":"A 17km relay race is split evenly between 3 runners. How far does each runner run, in km, to 3 decimal places?","workingSteps":["17 ÷ 3 = 5.6666... (repeating)","The fourth decimal digit is 6, so round the third decimal place up","5.666... rounds to 5.667"]}$json$,
 'Educational Increment 007X, Part 4/11. Assessment Brain QT-MR-14, competency MR-06 (precision/exactness). Question family: precision-dec. Added per Phase B''s explicit fix (needs a round-down example). Answer independently recomputed, see verification record.',
 2, 'precision-dec-05',
 'precision-dec', 'angel_original', 'provisional', 1, true, 'applying-a-2-decimal-place-rounding-habit-when-the-question-asks-for-3',
 null),
('precision-dec-06', 'maths', 'QT-MR-14', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"precision-dec-06","marks":1,"skill":"arithmetic","answer":"2.14","question":"A bill of £15 is shared equally between 7 people. How much does each person pay, to the nearest penny (2 decimal places)?","workingSteps":["15 ÷ 7 = 2.142857... (repeating)","The third decimal digit is 2, so the second decimal place stays as it is","2.142... rounds to 2.14"]}$json$,
 'Educational Increment 007X, Part 4/11. Assessment Brain QT-MR-14, competency MR-06 (precision/exactness). Question family: precision-dec. Added per Phase B''s explicit fix (needs a round-down example). Answer independently recomputed, see verification record.',
 2, 'precision-dec-06',
 'precision-dec', 'angel_original', 'provisional', 1, true, 'assuming-every-rounding-question-rounds-up-having-only-practised-round-up-examples',
 null)
on conflict (id) do nothing;

-- === Legacy-row reclassification (metadata only, matches migration 062) =====

update public.ali_question_bank
set family_id = 'mr03-mixed-perimeter'
where id = 'mth-003'
  and family_id is null;

commit;
