-- Angel Digital 11+ — Migration 063
-- Educational Increment 007T, Parts 4 and 7 — first controlled content
-- expansion batch: 20 QT-MR-01 Mathematics questions across the 4
-- families frozen in Part 3, 5 original English passages, and 14
-- QT-RC-10 questions across the 2 families frozen in Part 5.
--
-- Every row below is inserted with eligibility_status = 'provisional'.
-- Nothing in this migration changes any existing row, and nothing sets
-- eligibility_status to 'practice_eligible' or 'mock_eligible' for any
-- row, new or old. This is a pure INSERT migration.
--
-- Every answer was independently recomputed from first principles before
-- this file was generated (scripts equivalent recorded in
-- ANGEL_007T_CONTROLLED_CONTENT_EXPANSION_FOUNDATION_V1.md Part 4/15).
-- Every quoted phrase in every QT-RC-10 question was verified verbatim
-- against its passage's own text (same document, Part 7/15).
--
-- Idempotent: every INSERT uses "on conflict (id) do nothing", so
-- re-running this file after it has already taken effect is a no-op.
--
-- NOT APPLIED by this increment. Generated for Founder review and manual
-- application via Supabase Dashboard > SQL Editor > New query, gated on
-- Founder/Product approval of this increment's report.

begin;

-- === Part 4: Mathematics QT-MR-01 batch (20 rows) ===============

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr01-wholenum-01', 'maths', 'QT-MR-01', array['csse'], 'easy', 'short-answer', 45,
 $json${"id":"mr01-wholenum-01","marks":1,"skill":"arithmetic","answer":"282","question":"6 × 47 = ?","workingSteps":["6 × 40 = 240","6 × 7 = 42","240 + 42 = 282"]}$json$,
 'Educational Increment 007T, Part 4. Assessment Brain QT-MR-01, competency MR-01. Question family: mr01-whole-number-computation. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-01 (CSSE-006/011/016, opening arithmetic questions, all 3 years, EMC-4). Answer independently recomputed, see verification record.',
 2, 'mr01-wholenum-01',
 'mr01-whole-number-computation', 'angel_original', 'provisional', 1, true, 'multiplication-table-recall-gap',
 'ROUTINE'),
('mr01-wholenum-02', 'maths', 'QT-MR-01', array['csse'], 'medium', 'short-answer', 75,
 $json${"id":"mr01-wholenum-02","marks":2,"skill":"arithmetic","answer":"3484","question":"134 × 26 = ?","workingSteps":["134 × 20 = 2680","134 × 6 = 804","2680 + 804 = 3484"]}$json$,
 'Educational Increment 007T, Part 4. Assessment Brain QT-MR-01, competency MR-01. Question family: mr01-whole-number-computation. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-01 (CSSE-006/011/016, opening arithmetic questions, all 3 years, EMC-4). Answer independently recomputed, see verification record.',
 2, 'mr01-wholenum-02',
 'mr01-whole-number-computation', 'angel_original', 'provisional', 1, true, 'partial-product-omitted-in-long-multiplication',
 'ROUTINE'),
('mr01-wholenum-03', 'maths', 'QT-MR-01', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr01-wholenum-03","marks":1,"skill":"arithmetic","answer":"6","question":"What is the remainder when 391 is divided by 7?","workingSteps":["7 × 55 = 385","391 − 385 = 6","so 391 ÷ 7 = 55 remainder 6"]}$json$,
 'Educational Increment 007T, Part 4. Assessment Brain QT-MR-01, competency MR-01. Question family: mr01-whole-number-computation. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-01 (CSSE-006/011/016, opening arithmetic questions, all 3 years, EMC-4). Answer independently recomputed, see verification record.',
 2, 'mr01-wholenum-03',
 'mr01-whole-number-computation', 'angel_original', 'provisional', 1, true, 'remainder-omitted-or-quotient-given-instead',
 'ROUTINE'),
('mr01-wholenum-04', 'maths', 'QT-MR-01', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr01-wholenum-04","marks":2,"skill":"arithmetic","answer":"81","question":"2916 ÷ 36 = ?","workingSteps":["36 × 80 = 2880","2916 − 2880 = 36","36 ÷ 36 = 1, so 80 + 1 = 81"]}$json$,
 'Educational Increment 007T, Part 4. Assessment Brain QT-MR-01, competency MR-01. Question family: mr01-whole-number-computation. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-01 (CSSE-006/011/016, opening arithmetic questions, all 3 years, EMC-4). Answer independently recomputed, see verification record.',
 2, 'mr01-wholenum-04',
 'mr01-whole-number-computation', 'angel_original', 'provisional', 1, true, 'long-division-estimate-error-with-2-digit-divisor',
 'ROUTINE'),
('mr01-wholenum-05', 'maths', 'QT-MR-01', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr01-wholenum-05","marks":2,"skill":"arithmetic","answer":"5744","question":"10000 − 4256 = ?","workingSteps":["Borrow chain across four zeros: 10000 = 9999 + 1","9999 − 4256 = 5743","5743 + 1 = 5744"]}$json$,
 'Educational Increment 007T, Part 4. Assessment Brain QT-MR-01, competency MR-01. Question family: mr01-whole-number-computation. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-01 (CSSE-006/011/016, opening arithmetic questions, all 3 years, EMC-4). Answer independently recomputed, see verification record.',
 2, 'mr01-wholenum-05',
 'mr01-whole-number-computation', 'angel_original', 'provisional', 1, true, 'borrow-across-multiple-zeros-error',
 'ROUTINE'),
('mr01-decimal-01', 'maths', 'QT-MR-01', array['csse'], 'easy', 'short-answer', 45,
 $json${"id":"mr01-decimal-01","marks":1,"skill":"arithmetic","answer":"5.63","question":"3.45 + 2.18 = ?","workingSteps":["Align decimal points","3.45 + 2.18 = 5.63"]}$json$,
 'Educational Increment 007T, Part 4. Assessment Brain QT-MR-01, competency MR-01. Question family: mr01-decimal-computation. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-01 (CSSE-006/011/016, opening arithmetic questions, all 3 years, EMC-4). Answer independently recomputed, see verification record.',
 2, 'mr01-decimal-01',
 'mr01-decimal-computation', 'angel_original', 'provisional', 1, true, 'decimal-point-misalignment-on-addition',
 'ROUTINE'),
('mr01-decimal-02', 'maths', 'QT-MR-01', array['csse'], 'easy', 'short-answer', 45,
 $json${"id":"mr01-decimal-02","marks":1,"skill":"arithmetic","answer":"5.2","question":"7.6 − 2.4 = ?","workingSteps":["Align decimal points","7.6 − 2.4 = 5.2"]}$json$,
 'Educational Increment 007T, Part 4. Assessment Brain QT-MR-01, competency MR-01. Question family: mr01-decimal-computation. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-01 (CSSE-006/011/016, opening arithmetic questions, all 3 years, EMC-4). Answer independently recomputed, see verification record.',
 2, 'mr01-decimal-02',
 'mr01-decimal-computation', 'angel_original', 'provisional', 1, true, 'decimal-point-misalignment-on-subtraction',
 'ROUTINE'),
('mr01-decimal-03', 'maths', 'QT-MR-01', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr01-decimal-03","marks":1,"skill":"arithmetic","answer":"7.98","question":"4.7 + 3.28 = ?","workingSteps":["Rewrite 4.7 as 4.70 to match decimal places","4.70 + 3.28 = 7.98"]}$json$,
 'Educational Increment 007T, Part 4. Assessment Brain QT-MR-01, competency MR-01. Question family: mr01-decimal-computation. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-01 (CSSE-006/011/016, opening arithmetic questions, all 3 years, EMC-4). Answer independently recomputed, see verification record.',
 2, 'mr01-decimal-03',
 'mr01-decimal-computation', 'angel_original', 'provisional', 1, true, 'differing-decimal-place-count-not-padded-with-zero',
 'ROUTINE'),
('mr01-decimal-04', 'maths', 'QT-MR-01', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr01-decimal-04","marks":1,"skill":"arithmetic","answer":"3.9","question":"15.6 ÷ 4 = ?","workingSteps":["15.6 ÷ 4: 15 ÷ 4 = 3 remainder 3","3.6 ÷ 4 = 0.9","3 + 0.9 = 3.9"]}$json$,
 'Educational Increment 007T, Part 4. Assessment Brain QT-MR-01, competency MR-01. Question family: mr01-decimal-computation. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-01 (CSSE-006/011/016, opening arithmetic questions, all 3 years, EMC-4). Answer independently recomputed, see verification record.',
 2, 'mr01-decimal-04',
 'mr01-decimal-computation', 'angel_original', 'provisional', 1, true, 'decimal-point-dropped-when-dividing-by-whole-number',
 'ROUTINE'),
('mr01-decimal-05', 'maths', 'QT-MR-01', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr01-decimal-05","marks":2,"skill":"arithmetic","answer":"24","question":"6 ÷ 0.25 = ?","workingSteps":["Dividing by 0.25 is the same as multiplying by 4","6 × 4 = 24"]}$json$,
 'Educational Increment 007T, Part 4. Assessment Brain QT-MR-01, competency MR-01. Question family: mr01-decimal-computation. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-01 (CSSE-006/011/016, opening arithmetic questions, all 3 years, EMC-4). Answer independently recomputed, see verification record.',
 2, 'mr01-decimal-05',
 'mr01-decimal-computation', 'angel_original', 'provisional', 1, true, 'assumes-dividing-always-produces-a-smaller-result',
 'ROUTINE'),
('mr01-fraction-01', 'maths', 'QT-MR-01', array['csse'], 'easy', 'short-answer', 45,
 $json${"id":"mr01-fraction-01","marks":1,"skill":"arithmetic","answer":"2/3","question":"2/9 + 4/9 = ? Give your answer in its simplest form.","workingSteps":["Like denominators: 2/9 + 4/9 = 6/9","Simplify: 6/9 = 2/3"]}$json$,
 'Educational Increment 007T, Part 4. Assessment Brain QT-MR-01, competency MR-01. Question family: mr01-fraction-computation. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-01 (CSSE-006/011/016, opening arithmetic questions, all 3 years, EMC-4). Answer independently recomputed, see verification record.',
 2, 'mr01-fraction-01',
 'mr01-fraction-computation', 'angel_original', 'provisional', 1, true, 'final-fraction-not-simplified',
 'ROUTINE'),
('mr01-fraction-02', 'maths', 'QT-MR-01', array['csse'], 'easy', 'short-answer', 45,
 $json${"id":"mr01-fraction-02","marks":1,"skill":"arithmetic","answer":"2/15","question":"1/3 × 2/5 = ?","workingSteps":["Multiply numerators: 1 × 2 = 2","Multiply denominators: 3 × 5 = 15","2/15"]}$json$,
 'Educational Increment 007T, Part 4. Assessment Brain QT-MR-01, competency MR-01. Question family: mr01-fraction-computation. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-01 (CSSE-006/011/016, opening arithmetic questions, all 3 years, EMC-4). Answer independently recomputed, see verification record.',
 2, 'mr01-fraction-02',
 'mr01-fraction-computation', 'angel_original', 'provisional', 1, true, 'cross-multiplication-used-instead-of-straight-multiplication',
 'ROUTINE'),
('mr01-fraction-03', 'maths', 'QT-MR-01', array['csse'], 'medium', 'short-answer', 75,
 $json${"id":"mr01-fraction-03","marks":2,"skill":"arithmetic","answer":"5/12","question":"1/4 + 1/6 = ? Give your answer in its simplest form.","workingSteps":["LCM of 4 and 6 is 12","1/4 = 3/12, 1/6 = 2/12","3/12 + 2/12 = 5/12"]}$json$,
 'Educational Increment 007T, Part 4. Assessment Brain QT-MR-01, competency MR-01. Question family: mr01-fraction-computation. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-01 (CSSE-006/011/016, opening arithmetic questions, all 3 years, EMC-4). Answer independently recomputed, see verification record.',
 2, 'mr01-fraction-03',
 'mr01-fraction-computation', 'angel_original', 'provisional', 1, true, 'denominators-added-directly-without-common-denominator',
 'ROUTINE'),
('mr01-fraction-04', 'maths', 'QT-MR-01', array['csse'], 'medium', 'short-answer', 75,
 $json${"id":"mr01-fraction-04","marks":2,"skill":"arithmetic","answer":"9/10","question":"3/5 ÷ 2/3 = ? Give your answer in its simplest form.","workingSteps":["Dividing by a fraction: multiply by its reciprocal","3/5 ÷ 2/3 = 3/5 × 3/2","= 9/10"]}$json$,
 'Educational Increment 007T, Part 4. Assessment Brain QT-MR-01, competency MR-01. Question family: mr01-fraction-computation. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-01 (CSSE-006/011/016, opening arithmetic questions, all 3 years, EMC-4). Answer independently recomputed, see verification record.',
 2, 'mr01-fraction-04',
 'mr01-fraction-computation', 'angel_original', 'provisional', 1, true, 'reciprocal-not-taken-before-multiplying',
 'ROUTINE'),
('mr01-fraction-05', 'maths', 'QT-MR-01', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr01-fraction-05","marks":2,"skill":"arithmetic","answer":"5/12","question":"2 1/4 − 1 5/6 = ? Give your answer in its simplest form.","workingSteps":["Convert to improper fractions: 2 1/4 = 9/4, 1 5/6 = 11/6","LCM of 4 and 6 is 12: 9/4 = 27/12, 11/6 = 22/12","27/12 − 22/12 = 5/12"]}$json$,
 'Educational Increment 007T, Part 4. Assessment Brain QT-MR-01, competency MR-01. Question family: mr01-fraction-computation. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-01 (CSSE-006/011/016, opening arithmetic questions, all 3 years, EMC-4). Answer independently recomputed, see verification record.',
 2, 'mr01-fraction-05',
 'mr01-fraction-computation', 'angel_original', 'provisional', 1, true, 'mixed-number-not-converted-before-subtracting-with-unlike-denominators',
 'ROUTINE'),
('mr01-multistep-01', 'maths', 'QT-MR-01', array['csse'], 'easy', 'short-answer', 45,
 $json${"id":"mr01-multistep-01","marks":1,"skill":"arithmetic","answer":"36","question":"(8 + 4) × 3 = ?","workingSteps":["Brackets first: 8 + 4 = 12","12 × 3 = 36"]}$json$,
 'Educational Increment 007T, Part 4. Assessment Brain QT-MR-01, competency MR-01. Question family: mr01-multistep-order-of-operations. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-01 (CSSE-006/011/016, opening arithmetic questions, all 3 years, EMC-4). Answer independently recomputed, see verification record.',
 2, 'mr01-multistep-01',
 'mr01-multistep-order-of-operations', 'angel_original', 'provisional', 1, true, 'brackets-ignored-operations-done-left-to-right',
 'MIXED_TRANSFER'),
('mr01-multistep-02', 'maths', 'QT-MR-01', array['csse'], 'easy', 'short-answer', 45,
 $json${"id":"mr01-multistep-02","marks":1,"skill":"arithmetic","answer":"8","question":"20 − (3 × 4) = ?","workingSteps":["Brackets first: 3 × 4 = 12","20 − 12 = 8"]}$json$,
 'Educational Increment 007T, Part 4. Assessment Brain QT-MR-01, competency MR-01. Question family: mr01-multistep-order-of-operations. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-01 (CSSE-006/011/016, opening arithmetic questions, all 3 years, EMC-4). Answer independently recomputed, see verification record.',
 2, 'mr01-multistep-02',
 'mr01-multistep-order-of-operations', 'angel_original', 'provisional', 1, true, 'brackets-ignored-operations-done-left-to-right',
 'MIXED_TRANSFER'),
('mr01-multistep-03', 'maths', 'QT-MR-01', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mr01-multistep-03","marks":1,"skill":"arithmetic","answer":"26","question":"6 + 4 × 5 = ?","workingSteps":["Multiplication before addition: 4 × 5 = 20","6 + 20 = 26"]}$json$,
 'Educational Increment 007T, Part 4. Assessment Brain QT-MR-01, competency MR-01. Question family: mr01-multistep-order-of-operations. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-01 (CSSE-006/011/016, opening arithmetic questions, all 3 years, EMC-4). Answer independently recomputed, see verification record.',
 2, 'mr01-multistep-03',
 'mr01-multistep-order-of-operations', 'angel_original', 'provisional', 1, true, 'left-to-right-evaluation-ignoring-precedence',
 'MIXED_TRANSFER'),
('mr01-multistep-04', 'maths', 'QT-MR-01', array['csse'], 'medium', 'short-answer', 75,
 $json${"id":"mr01-multistep-04","marks":2,"skill":"arithmetic","answer":"17","question":"18 − 2 × 3 + 5 = ?","workingSteps":["Multiplication first: 2 × 3 = 6","18 − 6 + 5","12 + 5 = 17"]}$json$,
 'Educational Increment 007T, Part 4. Assessment Brain QT-MR-01, competency MR-01. Question family: mr01-multistep-order-of-operations. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-01 (CSSE-006/011/016, opening arithmetic questions, all 3 years, EMC-4). Answer independently recomputed, see verification record.',
 2, 'mr01-multistep-04',
 'mr01-multistep-order-of-operations', 'angel_original', 'provisional', 1, true, 'left-to-right-evaluation-ignoring-precedence',
 'MIXED_TRANSFER'),
('mr01-multistep-05', 'maths', 'QT-MR-01', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr01-multistep-05","marks":2,"skill":"arithmetic","answer":"22","question":"(5.5 + 2.5) × 4 − 10 = ?","workingSteps":["Brackets first: 5.5 + 2.5 = 8","8 × 4 = 32","32 − 10 = 22"]}$json$,
 'Educational Increment 007T, Part 4. Assessment Brain QT-MR-01, competency MR-01. Question family: mr01-multistep-order-of-operations. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-01 (CSSE-006/011/016, opening arithmetic questions, all 3 years, EMC-4). Answer independently recomputed, see verification record.',
 2, 'mr01-multistep-05',
 'mr01-multistep-order-of-operations', 'angel_original', 'provisional', 1, true, 'brackets-and-precedence-both-required-decimal-adds-load',
 'MIXED_TRANSFER')
on conflict (id) do nothing;

-- === Part 6: English passage bank (5 rows) ===============

insert into public.ali_passage_bank
  (id, title, original_text, text_type, genre, word_count, reading_complexity,
   provenance, copyright_status, pathway, content_difficulty, content_version,
   eligibility_status, active, passage_family_id, review_state)
values
('wave3-eng-emptyclassroom', 'The Empty Classroom',
 $passage$Maya was always the first to arrive. She liked the ten minutes before anyone else came, when the classroom belonged only to her. This morning, though, something felt different. The chairs sat exactly as they had been left the day before, stacked with unusual care. The whiteboard, normally smudged with yesterday's lesson, had been wiped completely clean. Even the window, which never quite closed properly, was shut tight, and the room held a stillness that made her steps sound too loud.

She set her bag down slowly, as though placing it too quickly might disturb something she couldn't name. On the teacher's desk, a single envelope lay face-down, her name written across it in handwriting she almost recognised. Maya stood very still for a moment, listening to nothing at all, before she reached out and turned it over.$passage$,
 'narrative-extract', 'contemporary-realistic-fiction', 138, 'moderate',
 'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], 'medium', 1, 'provisional', true,
 'wave3-family-effect-of-language', null),
('wave3-eng-bakersapprentice', 'The Baker''s Apprentice',
 $passage$Old Mr Fenwick had run the bakery on Corn Street for forty years, and everyone in the village said his bread was the best for miles. When Priya arrived for her first morning as his apprentice, she expected him to hand her an apron and a list of instructions. Instead, he simply pointed to a mountain of flour sacks stacked against the wall and said nothing at all.

Priya waited, unsure whether this was a test or simply how he worked. After a long moment, Mr Fenwick picked up a single sack, hoisted it onto his shoulder without any visible effort, and carried it through to the ovens as though it weighed nothing more than a folded newspaper. Priya hurried to lift a sack of her own. It did not move nearly so easily. By the time she had dragged it halfway across the floor, Mr Fenwick was already three sacks ahead of her, whistling quietly to himself.$passage$,
 'narrative-extract', 'contemporary-realistic-fiction', 158, 'moderate',
 'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], 'medium', 1, 'provisional', true,
 'wave3-family-effect-of-language', null),
('wave3-eng-lettertograndad', 'Letter to Grandad',
 $passage$Dear Grandad,

I know you always say a letter should start with the weather, so I'll tell you it has rained every single day this week, which feels like exactly the sort of thing you'd find funny rather than annoying.

School has been strange without you picking me up on Thursdays. Mr Ahmed asked where my "chauffeur" had gone, and I didn't really know what to say, so I just told him you were resting. I went past the allotment yesterday and your runner beans have grown right over the top of the fence, tangled and a bit wild, like they don't know you're not coming to tie them back. I didn't touch them. I thought you'd want to do that yourself when you're better.

Mum says I shouldn't worry so much, but I've started checking my phone every time it buzzes, just in case it's news. Write back soon, even if it's short.

Love,
Tom$passage$,
 'narrative-extract', 'epistolary-fiction', 156, 'moderate',
 'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], 'medium', 1, 'provisional', true,
 'wave3-family-effect-of-language', null),
('wave3-eng-stormharbour', 'The Storm at the Harbour',
 $passage$By four o'clock, the fishing boats that were still out had become small dark shapes against a sky the colour of old bruises. Sam stood on the harbour wall with his father, who hadn't said very much in the last twenty minutes. Every few seconds, his father checked his watch, then looked back out at the water, then checked his watch again, as though the numbers might change if he looked hard enough.

The wind had picked up enough to make the loose rigging on the moored boats clang against their masts in a rhythm that didn't quite match anything. Down on the quay, Mrs Okafor was pulling the shutters closed on the harbour café two hours before she normally would. Nobody had said the word "storm" out loud yet, but everybody on the harbour wall seemed to be moving a little faster than usual, and nobody was smiling.$passage$,
 'narrative-extract', 'contemporary-realistic-fiction', 149, 'moderate-high',
 'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], 'medium', 1, 'provisional', true,
 'wave3-family-effect-of-language', null),
('wave3-eng-newtrainers', 'The New Trainers',
 $passage$Jayden had saved for eleven weeks to buy the trainers, counting out coins from his paper-round money every Sunday evening. When he finally wore them to school, he spent the whole morning walking very deliberately past groups of people, taking the longest possible route between lessons.

Nobody said anything about them at break time. At lunch, Connor glanced down at Jayden's feet for exactly one second, then carried on eating his sandwich without a word. Jayden told himself it didn't matter what Connor thought. By the end of the day, though, the trainers were tucked at the very back of his locker, and Jayden walked home in his old, scuffed pair instead, taking the shortest route he knew.$passage$,
 'narrative-extract', 'contemporary-realistic-fiction', 118, 'moderate',
 'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], 'medium', 1, 'provisional', true,
 'wave3-family-effect-of-language', null)
on conflict (id) do nothing;

-- === Part 7: English QT-RC-10 batch (14 rows) ===============

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('w3-rc10-am-01', 'english', 'QT-RC-10', array['csse'], 'medium', 'short-answer', 90,
 $json${"id":"w3-rc10-am-01","marks":1,"skill":"effect-of-language","question":"The writer describes the room as holding \"a stillness that made her steps sound too loud.\" What does this description suggest about how Maya is feeling?","modelAnswer":"It suggests Maya feels a heightened, uneasy awareness of the silence, as though she senses something unusual is about to happen.","passageText":"Maya was always the first to arrive. She liked the ten minutes before anyone else came, when the classroom belonged only to her. This morning, though, something felt different. The chairs sat exactly as they had been left the day before, stacked with unusual care. The whiteboard, normally smudged with yesterday's lesson, had been wiped completely clean. Even the window, which never quite closed properly, was shut tight, and the room held a stillness that made her steps sound too loud.\n\nShe set her bag down slowly, as though placing it too quickly might disturb something she couldn't name. On the teacher's desk, a single envelope lay face-down, her name written across it in handwriting she almost recognised. Maya stood very still for a moment, listening to nothing at all, before she reached out and turned it over.","passageTitle":"The Empty Classroom","validationTier":"TIER2_ACCEPTED_SET","acceptedAnswers":["she feels uneasy or on edge","she is very aware of the silence, sensing something is different","the unusual quiet makes her nervous or alert"]}$json$,
 'Educational Increment 007T, Part 7. Assessment Brain QT-RC-10, primary competency RC-02. Question family: wave3-fam-rc10-atmosphere-mood. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-RC-10 (CSSE-013 2021, CSSE-008 2022, EMC-3). Answer validation: TIER2_ACCEPTED_SET.',
 2, 'wave3-eng-emptyclassroom',
 'wave3-fam-rc10-atmosphere-mood', 'angel_original', 'provisional', 1, true, 'reads-the-sentence-as-literally-about-volume-not-Mayas-inner-state',
 'MIXED_TRANSFER'),
('w3-rc10-am-02', 'english', 'QT-RC-10', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"w3-rc10-am-02","marks":1,"skill":"effect-of-language","question":"Why might the writer choose to end the passage with Maya \"listening to nothing at all\" just before she turns the envelope over?","modelAnswer":"It builds suspense by holding the reader in the moment of anticipation, emphasising Maya's hesitation and the tension of not yet knowing what the envelope contains.","passageText":"Maya was always the first to arrive. She liked the ten minutes before anyone else came, when the classroom belonged only to her. This morning, though, something felt different. The chairs sat exactly as they had been left the day before, stacked with unusual care. The whiteboard, normally smudged with yesterday's lesson, had been wiped completely clean. Even the window, which never quite closed properly, was shut tight, and the room held a stillness that made her steps sound too loud.\n\nShe set her bag down slowly, as though placing it too quickly might disturb something she couldn't name. On the teacher's desk, a single envelope lay face-down, her name written across it in handwriting she almost recognised. Maya stood very still for a moment, listening to nothing at all, before she reached out and turned it over.","passageTitle":"The Empty Classroom","validationTier":"TIER2_ACCEPTED_SET","acceptedAnswers":["it creates suspense/tension before the reveal","it shows her hesitating, delaying the moment of finding out","it emphasises the anticipation building throughout the passage"]}$json$,
 'Educational Increment 007T, Part 7. Assessment Brain QT-RC-10, primary competency RC-02. Question family: wave3-fam-rc10-atmosphere-mood. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-RC-10 (CSSE-013 2021, CSSE-008 2022, EMC-3). Answer validation: TIER2_ACCEPTED_SET.',
 2, 'wave3-eng-emptyclassroom',
 'wave3-fam-rc10-atmosphere-mood', 'angel_original', 'provisional', 1, true, 'treats-the-detail-as-incidental-rather-than-a-deliberate-tension-building-technique',
 'FAR_TRANSFER'),
('w3-rc10-am-03', 'english', 'QT-RC-10', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"w3-rc10-am-03","marks":1,"skill":"effect-of-language","question":"Tom describes the runner beans as growing \"tangled and a bit wild, like they don't know you're not coming to tie them back.\" What does this description suggest about how Tom is feeling?","modelAnswer":"It suggests Tom feels the absence of his grandad deeply and is projecting that sense of things being 'out of place' onto the garden, showing how much he misses him.","passageText":"Dear Grandad,\n\nI know you always say a letter should start with the weather, so I'll tell you it has rained every single day this week, which feels like exactly the sort of thing you'd find funny rather than annoying.\n\nSchool has been strange without you picking me up on Thursdays. Mr Ahmed asked where my \"chauffeur\" had gone, and I didn't really know what to say, so I just told him you were resting. I went past the allotment yesterday and your runner beans have grown right over the top of the fence, tangled and a bit wild, like they don't know you're not coming to tie them back. I didn't touch them. I thought you'd want to do that yourself when you're better.\n\nMum says I shouldn't worry so much, but I've started checking my phone every time it buzzes, just in case it's news. Write back soon, even if it's short.\n\nLove,\nTom","passageTitle":"Letter to Grandad","validationTier":"TIER2_ACCEPTED_SET","acceptedAnswers":["he misses his grandad and notices the absence everywhere","he feels things are unsettled without his grandad there","the disorder in the garden reflects his own sense that something is wrong"]}$json$,
 'Educational Increment 007T, Part 7. Assessment Brain QT-RC-10, primary competency RC-02. Question family: wave3-fam-rc10-atmosphere-mood. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-RC-10 (CSSE-013 2021, CSSE-008 2022, EMC-3). Answer validation: TIER2_ACCEPTED_SET.',
 2, 'wave3-eng-lettertograndad',
 'wave3-fam-rc10-atmosphere-mood', 'angel_original', 'provisional', 1, true, 'reads-the-description-as-simply-about-untidy-plants-not-Toms-feelings',
 'FAR_TRANSFER'),
('w3-rc10-am-04', 'english', 'QT-RC-10', array['csse'], 'medium', 'short-answer', 90,
 $json${"id":"w3-rc10-am-04","marks":1,"skill":"effect-of-language","question":"Tom writes, \"I didn't touch them. I thought you'd want to do that yourself when you're better.\" What does this suggest about Tom's feelings towards his grandad's return?","modelAnswer":"It suggests Tom is hopeful and wants to believe his grandad will recover, deliberately leaving the task for him as a way of holding on to that hope.","passageText":"Dear Grandad,\n\nI know you always say a letter should start with the weather, so I'll tell you it has rained every single day this week, which feels like exactly the sort of thing you'd find funny rather than annoying.\n\nSchool has been strange without you picking me up on Thursdays. Mr Ahmed asked where my \"chauffeur\" had gone, and I didn't really know what to say, so I just told him you were resting. I went past the allotment yesterday and your runner beans have grown right over the top of the fence, tangled and a bit wild, like they don't know you're not coming to tie them back. I didn't touch them. I thought you'd want to do that yourself when you're better.\n\nMum says I shouldn't worry so much, but I've started checking my phone every time it buzzes, just in case it's news. Write back soon, even if it's short.\n\nLove,\nTom","passageTitle":"Letter to Grandad","validationTier":"TIER2_ACCEPTED_SET","acceptedAnswers":["he is hopeful his grandad will get better","he wants to preserve something for his grandad to do himself, showing optimism","he is trying to stay positive about his grandad's recovery"]}$json$,
 'Educational Increment 007T, Part 7. Assessment Brain QT-RC-10, primary competency RC-02. Question family: wave3-fam-rc10-atmosphere-mood. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-RC-10 (CSSE-013 2021, CSSE-008 2022, EMC-3). Answer validation: TIER2_ACCEPTED_SET.',
 2, 'wave3-eng-lettertograndad',
 'wave3-fam-rc10-atmosphere-mood', 'angel_original', 'provisional', 1, true, 'reads-it-only-as-a-practical-decision-about-gardening-missing-the-hope-behind-it',
 'MIXED_TRANSFER'),
('w3-rc10-am-05', 'english', 'QT-RC-10', array['csse'], 'easy', 'short-answer', 90,
 $json${"id":"w3-rc10-am-05","marks":1,"skill":"effect-of-language","question":"The sky is described as \"the colour of old bruises.\" What does this description suggest about the coming weather?","modelAnswer":"It suggests the weather is threatening or ominous, hinting that a storm is approaching.","passageText":"By four o'clock, the fishing boats that were still out had become small dark shapes against a sky the colour of old bruises. Sam stood on the harbour wall with his father, who hadn't said very much in the last twenty minutes. Every few seconds, his father checked his watch, then looked back out at the water, then checked his watch again, as though the numbers might change if he looked hard enough.\n\nThe wind had picked up enough to make the loose rigging on the moored boats clang against their masts in a rhythm that didn't quite match anything. Down on the quay, Mrs Okafor was pulling the shutters closed on the harbour café two hours before she normally would. Nobody had said the word \"storm\" out loud yet, but everybody on the harbour wall seemed to be moving a little faster than usual, and nobody was smiling.","passageTitle":"The Storm at the Harbour","validationTier":"TIER2_ACCEPTED_SET","acceptedAnswers":["bad weather or a storm is coming","the sky looks threatening or dangerous","something unpleasant is about to happen with the weather"]}$json$,
 'Educational Increment 007T, Part 7. Assessment Brain QT-RC-10, primary competency RC-02. Question family: wave3-fam-rc10-atmosphere-mood. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-RC-10 (CSSE-013 2021, CSSE-008 2022, EMC-3). Answer validation: TIER2_ACCEPTED_SET.',
 2, 'wave3-eng-stormharbour',
 'wave3-fam-rc10-atmosphere-mood', 'angel_original', 'provisional', 1, true, 'describes-the-colour-literally-without-linking-it-to-the-implied-threat',
 'MIXED_TRANSFER'),
('w3-rc10-am-06', 'english', 'QT-RC-10', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"w3-rc10-am-06","marks":1,"skill":"effect-of-language","question":"\"Nobody had said the word 'storm' out loud yet, but everybody on the harbour wall seemed to be moving a little faster than usual, and nobody was smiling.\" What does this suggest about the atmosphere on the harbour wall?","modelAnswer":"It suggests an unspoken tension or fear, since everyone senses danger is close even though nobody wants to say so directly, creating a quietly anxious atmosphere.","passageText":"By four o'clock, the fishing boats that were still out had become small dark shapes against a sky the colour of old bruises. Sam stood on the harbour wall with his father, who hadn't said very much in the last twenty minutes. Every few seconds, his father checked his watch, then looked back out at the water, then checked his watch again, as though the numbers might change if he looked hard enough.\n\nThe wind had picked up enough to make the loose rigging on the moored boats clang against their masts in a rhythm that didn't quite match anything. Down on the quay, Mrs Okafor was pulling the shutters closed on the harbour café two hours before she normally would. Nobody had said the word \"storm\" out loud yet, but everybody on the harbour wall seemed to be moving a little faster than usual, and nobody was smiling.","passageTitle":"The Storm at the Harbour","validationTier":"TIER2_ACCEPTED_SET","acceptedAnswers":["there is a hidden or unspoken worry among everyone present","people are anxious but trying not to show it openly","the tension is felt but not directly discussed"]}$json$,
 'Educational Increment 007T, Part 7. Assessment Brain QT-RC-10, primary competency RC-02. Question family: wave3-fam-rc10-atmosphere-mood. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-RC-10 (CSSE-013 2021, CSSE-008 2022, EMC-3). Answer validation: TIER2_ACCEPTED_SET.',
 2, 'wave3-eng-stormharbour',
 'wave3-fam-rc10-atmosphere-mood', 'angel_original', 'provisional', 1, true, 'focuses-only-on-the-physical-action-of-moving-faster-missing-the-implied-unspoken-fear',
 'FAR_TRANSFER'),
('w3-rc10-wc-01', 'english', 'QT-RC-10', array['csse'], 'easy', 'short-answer', 90,
 $json${"id":"w3-rc10-wc-01","marks":1,"skill":"effect-of-language","question":"The chairs were \"stacked with unusual care.\" What does the phrase \"unusual care\" suggest?","modelAnswer":"It suggests someone deliberately and carefully rearranged the room, which is out of the ordinary and adds to the sense that something unusual has happened.","passageText":"Maya was always the first to arrive. She liked the ten minutes before anyone else came, when the classroom belonged only to her. This morning, though, something felt different. The chairs sat exactly as they had been left the day before, stacked with unusual care. The whiteboard, normally smudged with yesterday's lesson, had been wiped completely clean. Even the window, which never quite closed properly, was shut tight, and the room held a stillness that made her steps sound too loud.\n\nShe set her bag down slowly, as though placing it too quickly might disturb something she couldn't name. On the teacher's desk, a single envelope lay face-down, her name written across it in handwriting she almost recognised. Maya stood very still for a moment, listening to nothing at all, before she reached out and turned it over.","passageTitle":"The Empty Classroom","validationTier":"TIER2_ACCEPTED_SET","acceptedAnswers":["someone arranged the room deliberately/carefully, which is unusual","it hints that something out of the ordinary has occurred","it shows the tidiness is not accidental"]}$json$,
 'Educational Increment 007T, Part 7. Assessment Brain QT-RC-10, primary competency RC-02. Question family: wave3-fam-rc10-word-choice. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-RC-10 (CSSE-013 2021, CSSE-008 2022, EMC-3). Answer validation: TIER2_ACCEPTED_SET.',
 2, 'wave3-eng-emptyclassroom',
 'wave3-fam-rc10-word-choice', 'angel_original', 'provisional', 1, true, 'treats-unusual-care-as-simply-meaning-tidy-without-noting-the-implied-deliberateness',
 'MIXED_TRANSFER'),
('w3-rc10-wc-02', 'english', 'QT-RC-10', array['csse'], 'medium', 'short-answer', 90,
 $json${"id":"w3-rc10-wc-02","marks":1,"skill":"effect-of-language","question":"The envelope was addressed \"in handwriting she almost recognised.\" What does the phrase \"almost recognised\" suggest?","modelAnswer":"It suggests a sense of partial, uncertain familiarity, deepening the mystery around who sent the envelope.","passageText":"Maya was always the first to arrive. She liked the ten minutes before anyone else came, when the classroom belonged only to her. This morning, though, something felt different. The chairs sat exactly as they had been left the day before, stacked with unusual care. The whiteboard, normally smudged with yesterday's lesson, had been wiped completely clean. Even the window, which never quite closed properly, was shut tight, and the room held a stillness that made her steps sound too loud.\n\nShe set her bag down slowly, as though placing it too quickly might disturb something she couldn't name. On the teacher's desk, a single envelope lay face-down, her name written across it in handwriting she almost recognised. Maya stood very still for a moment, listening to nothing at all, before she reached out and turned it over.","passageTitle":"The Empty Classroom","validationTier":"TIER2_ACCEPTED_SET","acceptedAnswers":["she is not fully sure whose handwriting it is, only partly familiar","it creates uncertainty/mystery about the sender","she has some recognition but cannot place it exactly"]}$json$,
 'Educational Increment 007T, Part 7. Assessment Brain QT-RC-10, primary competency RC-02. Question family: wave3-fam-rc10-word-choice. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-RC-10 (CSSE-013 2021, CSSE-008 2022, EMC-3). Answer validation: TIER2_ACCEPTED_SET.',
 2, 'wave3-eng-emptyclassroom',
 'wave3-fam-rc10-word-choice', 'angel_original', 'provisional', 1, true, 'assumes-almost-recognised-means-she-fully-knows-whose-writing-it-is',
 'MIXED_TRANSFER'),
('w3-rc10-wc-03', 'english', 'QT-RC-10', array['csse'], 'easy', 'short-answer', 90,
 $json${"id":"w3-rc10-wc-03","marks":1,"skill":"effect-of-language","question":"Mr Fenwick carried the sack \"as though it weighed nothing more than a folded newspaper.\" What does this comparison suggest about Mr Fenwick?","modelAnswer":"It suggests Mr Fenwick is very strong and experienced, making a physically demanding task look effortless.","passageText":"Old Mr Fenwick had run the bakery on Corn Street for forty years, and everyone in the village said his bread was the best for miles. When Priya arrived for her first morning as his apprentice, she expected him to hand her an apron and a list of instructions. Instead, he simply pointed to a mountain of flour sacks stacked against the wall and said nothing at all.\n\nPriya waited, unsure whether this was a test or simply how he worked. After a long moment, Mr Fenwick picked up a single sack, hoisted it onto his shoulder without any visible effort, and carried it through to the ovens as though it weighed nothing more than a folded newspaper. Priya hurried to lift a sack of her own. It did not move nearly so easily. By the time she had dragged it halfway across the floor, Mr Fenwick was already three sacks ahead of her, whistling quietly to himself.","passageTitle":"The Baker's Apprentice","validationTier":"TIER2_ACCEPTED_SET","acceptedAnswers":["he is strong and used to the work","the task is easy for him because of years of experience","he makes something difficult look effortless"]}$json$,
 'Educational Increment 007T, Part 7. Assessment Brain QT-RC-10, primary competency RC-02. Question family: wave3-fam-rc10-word-choice. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-RC-10 (CSSE-013 2021, CSSE-008 2022, EMC-3). Answer validation: TIER2_ACCEPTED_SET.',
 2, 'wave3-eng-bakersapprentice',
 'wave3-fam-rc10-word-choice', 'angel_original', 'provisional', 1, true, 'reads-the-comparison-literally-as-being-about-the-sacks-actual-weight',
 'MIXED_TRANSFER'),
('w3-rc10-wc-04', 'english', 'QT-RC-10', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"w3-rc10-wc-04","marks":1,"skill":"effect-of-language","question":"What does the detail that Mr Fenwick was \"whistling quietly to himself\" while working suggest about how he feels about the task?","modelAnswer":"It suggests the work is so familiar and easy to him that he can do it almost without thinking, contrasting with Priya's visible struggle with the same task.","passageText":"Old Mr Fenwick had run the bakery on Corn Street for forty years, and everyone in the village said his bread was the best for miles. When Priya arrived for her first morning as his apprentice, she expected him to hand her an apron and a list of instructions. Instead, he simply pointed to a mountain of flour sacks stacked against the wall and said nothing at all.\n\nPriya waited, unsure whether this was a test or simply how he worked. After a long moment, Mr Fenwick picked up a single sack, hoisted it onto his shoulder without any visible effort, and carried it through to the ovens as though it weighed nothing more than a folded newspaper. Priya hurried to lift a sack of her own. It did not move nearly so easily. By the time she had dragged it halfway across the floor, Mr Fenwick was already three sacks ahead of her, whistling quietly to himself.","passageTitle":"The Baker's Apprentice","validationTier":"TIER2_ACCEPTED_SET","acceptedAnswers":["the task is second nature to him, requiring little effort or concentration","he is relaxed and unbothered by work that Priya finds difficult","it shows his ease and experience compared to Priya's struggle"]}$json$,
 'Educational Increment 007T, Part 7. Assessment Brain QT-RC-10, primary competency RC-02. Question family: wave3-fam-rc10-word-choice. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-RC-10 (CSSE-013 2021, CSSE-008 2022, EMC-3). Answer validation: TIER2_ACCEPTED_SET.',
 2, 'wave3-eng-bakersapprentice',
 'wave3-fam-rc10-word-choice', 'angel_original', 'provisional', 1, true, 'treats-whistling-as-only-showing-happiness-missing-the-contrast-with-Priyas-effort',
 'FAR_TRANSFER'),
('w3-rc10-wc-05', 'english', 'QT-RC-10', array['csse'], 'medium', 'short-answer', 90,
 $json${"id":"w3-rc10-wc-05","marks":1,"skill":"effect-of-language","question":"Why might Tom choose to mention that he has \"started checking my phone every time it buzzes, just in case it's news\"?","modelAnswer":"It suggests Tom is quietly anxious about his grandad's health, even though he does not say so directly.","passageText":"Dear Grandad,\n\nI know you always say a letter should start with the weather, so I'll tell you it has rained every single day this week, which feels like exactly the sort of thing you'd find funny rather than annoying.\n\nSchool has been strange without you picking me up on Thursdays. Mr Ahmed asked where my \"chauffeur\" had gone, and I didn't really know what to say, so I just told him you were resting. I went past the allotment yesterday and your runner beans have grown right over the top of the fence, tangled and a bit wild, like they don't know you're not coming to tie them back. I didn't touch them. I thought you'd want to do that yourself when you're better.\n\nMum says I shouldn't worry so much, but I've started checking my phone every time it buzzes, just in case it's news. Write back soon, even if it's short.\n\nLove,\nTom","passageTitle":"Letter to Grandad","validationTier":"TIER2_ACCEPTED_SET","acceptedAnswers":["he is worried about his grandad without saying so outright","it reveals underlying anxiety about receiving bad news","it shows his concern despite trying to sound calm in the letter"]}$json$,
 'Educational Increment 007T, Part 7. Assessment Brain QT-RC-10, primary competency RC-02. Question family: wave3-fam-rc10-word-choice. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-RC-10 (CSSE-013 2021, CSSE-008 2022, EMC-3). Answer validation: TIER2_ACCEPTED_SET.',
 2, 'wave3-eng-lettertograndad',
 'wave3-fam-rc10-word-choice', 'angel_original', 'provisional', 1, true, 'reads-it-as-simply-describing-a-habit-with-a-phone-missing-the-implied-worry',
 'MIXED_TRANSFER'),
('w3-rc10-wc-06', 'english', 'QT-RC-10', array['csse'], 'medium', 'short-answer', 90,
 $json${"id":"w3-rc10-wc-06","marks":1,"skill":"effect-of-language","question":"Sam's father checked his watch \"as though the numbers might change if he looked hard enough.\" What does this suggest about how Sam's father is feeling?","modelAnswer":"It suggests he feels anxious and powerless, repeating a pointless action because he cannot control the situation he is worried about.","passageText":"By four o'clock, the fishing boats that were still out had become small dark shapes against a sky the colour of old bruises. Sam stood on the harbour wall with his father, who hadn't said very much in the last twenty minutes. Every few seconds, his father checked his watch, then looked back out at the water, then checked his watch again, as though the numbers might change if he looked hard enough.\n\nThe wind had picked up enough to make the loose rigging on the moored boats clang against their masts in a rhythm that didn't quite match anything. Down on the quay, Mrs Okafor was pulling the shutters closed on the harbour café two hours before she normally would. Nobody had said the word \"storm\" out loud yet, but everybody on the harbour wall seemed to be moving a little faster than usual, and nobody was smiling.","passageTitle":"The Storm at the Harbour","validationTier":"TIER2_ACCEPTED_SET","acceptedAnswers":["he feels anxious and helpless about the situation","he is worried but can do nothing except wait","the repeated checking shows his nervous, powerless feeling"]}$json$,
 'Educational Increment 007T, Part 7. Assessment Brain QT-RC-10, primary competency RC-02. Question family: wave3-fam-rc10-word-choice. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-RC-10 (CSSE-013 2021, CSSE-008 2022, EMC-3). Answer validation: TIER2_ACCEPTED_SET.',
 2, 'wave3-eng-stormharbour',
 'wave3-fam-rc10-word-choice', 'angel_original', 'provisional', 1, true, 'reads-it-as-simply-about-checking-the-time-missing-the-implied-anxiety',
 'MIXED_TRANSFER'),
('w3-rc10-wc-07', 'english', 'QT-RC-10', array['csse'], 'easy', 'short-answer', 90,
 $json${"id":"w3-rc10-wc-07","marks":1,"skill":"effect-of-language","question":"Jayden \"spent the whole morning walking very deliberately past groups of people, taking the longest possible route between lessons.\" What does this suggest about how Jayden felt about his new trainers?","modelAnswer":"It suggests Jayden felt proud of his new trainers and wanted other people to notice them.","passageText":"Jayden had saved for eleven weeks to buy the trainers, counting out coins from his paper-round money every Sunday evening. When he finally wore them to school, he spent the whole morning walking very deliberately past groups of people, taking the longest possible route between lessons.\n\nNobody said anything about them at break time. At lunch, Connor glanced down at Jayden's feet for exactly one second, then carried on eating his sandwich without a word. Jayden told himself it didn't matter what Connor thought. By the end of the day, though, the trainers were tucked at the very back of his locker, and Jayden walked home in his old, scuffed pair instead, taking the shortest route he knew.","passageTitle":"The New Trainers","validationTier":"TIER2_ACCEPTED_SET","acceptedAnswers":["he was proud and wanted to show them off","he wanted people to notice his new trainers","he felt excited and eager for attention"]}$json$,
 'Educational Increment 007T, Part 7. Assessment Brain QT-RC-10, primary competency RC-02. Question family: wave3-fam-rc10-word-choice. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-RC-10 (CSSE-013 2021, CSSE-008 2022, EMC-3). Answer validation: TIER2_ACCEPTED_SET.',
 2, 'wave3-eng-newtrainers',
 'wave3-fam-rc10-word-choice', 'angel_original', 'provisional', 1, true, 'focuses-only-on-the-literal-route-taken-missing-the-implied-desire-to-be-seen',
 'MIXED_TRANSFER'),
('w3-rc10-wc-08', 'english', 'QT-RC-10', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"w3-rc10-wc-08","marks":1,"skill":"effect-of-language","question":"By the end of the day, the trainers were \"tucked at the very back of his locker,\" and Jayden walked home in his old pair, \"taking the shortest route he knew.\" What does this change suggest about how Jayden is feeling, compared to the start of the passage?","modelAnswer":"It suggests Jayden has gone from feeling proud and eager to be seen to feeling disappointed or embarrassed, no longer wanting attention after Connor's reaction.","passageText":"Jayden had saved for eleven weeks to buy the trainers, counting out coins from his paper-round money every Sunday evening. When he finally wore them to school, he spent the whole morning walking very deliberately past groups of people, taking the longest possible route between lessons.\n\nNobody said anything about them at break time. At lunch, Connor glanced down at Jayden's feet for exactly one second, then carried on eating his sandwich without a word. Jayden told himself it didn't matter what Connor thought. By the end of the day, though, the trainers were tucked at the very back of his locker, and Jayden walked home in his old, scuffed pair instead, taking the shortest route he knew.","passageTitle":"The New Trainers","validationTier":"TIER2_ACCEPTED_SET","acceptedAnswers":["he now feels embarrassed or disappointed, unlike his earlier pride","his confidence has faded after Connor's lack of reaction","he wants to avoid attention now, the opposite of the passage's start"]}$json$,
 'Educational Increment 007T, Part 7. Assessment Brain QT-RC-10, primary competency RC-02. Question family: wave3-fam-rc10-word-choice. Real evidence basis: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-RC-10 (CSSE-013 2021, CSSE-008 2022, EMC-3). Answer validation: TIER2_ACCEPTED_SET.',
 2, 'wave3-eng-newtrainers',
 'wave3-fam-rc10-word-choice', 'angel_original', 'provisional', 1, true, 'notices-the-actions-changed-but-does-not-connect-it-to-the-shift-in-Jaydens-feelings',
 'FAR_TRANSFER')
on conflict (id) do nothing;

commit;
