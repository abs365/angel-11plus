-- Angel Digital 11+ — Migration 095
-- Mock Programme Increment 004, Batch 003 — Mathematics Mock Content
-- Foundation.
--
-- 8 new, genuinely-authored Mathematics Mock CANDIDATE questions across
-- 4 families, 3 Question Types (QT-MR-01, QT-MR-08, QT-MR-10 -- one
-- family also uses QT-MR-01 within a grouped structure, see below), each
-- grounded directly in docs/intelligence/CSSE_QUESTION_INTELLIGENCE_
-- FRAMEWORK.md's own primary-source evidence entries.
--
-- ============================================================
-- COVERAGE AUDIT AND SELECTION (Part A1/A2)
-- ============================================================
-- Of the 14 Mathematics Question Types (QT-MR-01 through QT-MR-14),
-- Batches 001/002 already cover 10: QT-MR-02/03/05/09/13 (Batch 001),
-- QT-MR-04/06/07/10/11 (Batch 002). QT-MR-14 is not a content format
-- (a cross-cutting scoring condition, framework Principle 5) and is
-- correctly never targeted by any batch. That leaves exactly 3 genuine
-- content gaps: QT-MR-01, QT-MR-08, QT-MR-12.
--
-- QT-MR-01 (Direct Arithmetic Computation) — HIGH confidence, EMC-4,
-- "present as the paper's opening question(s)...all three years" per the
-- framework. Repository-level grep confirms QT-MR-01 is the single most
-- concentrated Question Type in live Practice (mr01-wholenum,
-- mr01-mean, mr01-revmean and others -- migration 091's own comment
-- records 34/194, ~18%, of Practice). Migration 091 deliberately
-- excluded it again from Batch 002 for exactly that reason. That
-- concentration is disclosed here, unchanged and not re-litigated -- but
-- it is a Practice-selection concentration, not a Mock one: Batch 001/002
-- together carry ZERO QT-MR-01 rows, despite QT-MR-01 being evidenced as
-- literally the paper's own opening question. A Mock form assembled
-- entirely from Batches 001-002 could never authentically open the way
-- a real CSSE Mathematics paper opens. This batch closes that specific
-- structural gap with exactly 2 standalone rows (mock-mr01-directcalc)
-- plus 2 further QT-MR-01 rows used only as the second subpart of a
-- genuinely evidenced compound structure (mock-mr01mr10-costumeschedule,
-- below) -- not as a vehicle for adding more standalone QT-MR-01 volume.
--
-- QT-MR-08 (Coordinate/Transformation Reasoning) — MEDIUM confidence,
-- EMC-3, present in all 3 years reviewed but with a different concrete
-- mechanic each year (plotting, rotation, completing collinear points).
-- Repository-wide search (`grep -ri rotat`) found ZERO existing rotation
-- or coordinate-transformation content anywhere in this repository, in
-- either Practice or Mock. This batch uses the rotation-about-origin
-- mechanic specifically (CSSE-011 Q18, 2022), which is expressible as a
-- pure text prompt (a fixed algebraic rule, (x,y) -> (y,-x) for 90°
-- clockwise, (x,y) -> (-x,-y) for 180°) without requiring an image or
-- interactive plotting surface this project does not currently have for
-- Mock content -- a real implementation constraint, disclosed rather
-- than silently worked around.
--
-- QT-MR-12 (Average/Mean Calculation) — HIGH confidence, EMC-4, present
-- in all 3 years, with a documented forward (compute the mean) and
-- reverse/weighted (reconstruct a missing value from a stated mean)
-- sub-format. A genuine, disclosed complication found during this
-- batch's own audit: forward mean-calculation already exists, twice
-- over -- mr01-mean-01..04 (migration 040) and mock-mr09-data-02
-- (migration 088, Batch 001) -- both filed under a DIFFERENT Question
-- Type tag (QT-MR-01/QT-MR-09) than the framework's own QT-MR-12
-- classification. A plain reverse-mean sub-format (N-1 known values,
-- find the missing one) also already exists in Practice
-- (mr01-revmean-01..04, migration 081). Authoring another instance of
-- either already-represented sub-format under a new QT-MR-12 label would
-- be exactly the "existing concentration must remain visible in the
-- selection decision" trap the directive warns against for QT-MR-01,
-- applied here to a mislabelled but equally real existing concentration.
-- This batch therefore deliberately excludes the forward-mean and
-- plain-reverse-mean sub-formats entirely and authors ONLY the
-- genuinely unrepresented running-average sub-format (CSSE-011 Q11,
-- "reverse mean from a running average" -- a NEW data point changes the
-- mean, find that new data point's value), confirmed absent from every
-- existing family in this repository by direct text search before
-- authoring (mock-mr12-reversemean, below).
--
-- ============================================================
-- GROUPED STRUCTURE (Part A3) — migration 093's columns, first real use
-- ============================================================
-- Section 6 of the CSSE_QUESTION_INTELLIGENCE_FRAMEWORK records a
-- specific, directly-evidenced compound-question fact: "CSSE-006 Q9
-- combines QT-MR-10 (elapsed time) with QT-MR-01 (arithmetic)" within
-- ONE numbered question's sub-parts. Batch 002's own mock-mr10-
-- forwardschedule already drew on CSSE-006 Q9 for its elapsed-time
-- reasoning, but as a standalone, single-response row -- it did not
-- represent the compound two-subpart structure the source question
-- actually has. This batch authors mock-mr01mr10-costumeschedule as 2
-- genuinely grouped numbered-question instances (4 rows: 2 groups x 2
-- subparts each), using migration 093's question_group_id/group_order/
-- subpart_label/marking_mode columns for the first time since that
-- migration was applied -- with real evidentiary justification for the
-- grouping (Section 6's own named compound-question fact), not as a
-- cosmetic demonstration of the new columns. marking_mode is set to
-- 'deterministic' on every row here (both subparts are ordinary
-- exact-match Mathematics responses) -- no grouped-scoring function is
-- implemented or invoked by this migration; mock_score_attempt()
-- (migrations 074/075) is unchanged and untouched.
--
-- ============================================================
-- WHAT THIS BATCH DOES NOT DO
-- ============================================================
-- Does not touch migrations 088/090/091/093/094 or any row they
-- authored/promoted. Does not retrofit question_group_id/group_order/
-- subpart_label/marking_mode into any Batch 001/002 row -- every
-- existing row's 4 new columns remain NULL, exactly as migration 093
-- left them. Does not set eligibility_status to anything other than
-- 'authentic_assessment_candidate'. Does not create or touch any
-- ali_family_review or ali_mock_form row (migration 096 handles pending-
-- review placeholders separately, exactly as migration 089 did for
-- Batch 001).
--
-- Every answer independently re-derived and hand-verified before this
-- file was written:
--   mock-mr01-directcalc-01: 6.4 x 7 = 44.8
--   mock-mr01-directcalc-02: 145 / 5 = 29; 29 x 3 = 87
--   mock-mr08-rotation-01: 90 deg clockwise about origin maps (x,y) ->
--     (y,-x); (3,5) -> (5,-3)
--   mock-mr08-rotation-02: 180 deg rotation maps (x,y) -> (-x,-y);
--     (-2,6) -> (2,-6)
--   mock-mr12-reversemean-01: 72 x 5 = 360; 74 x 6 = 444; 444-360 = 84
--   mock-mr12-reversemean-02: 58 x 4 = 232; 55 x 5 = 275; 275-232 = 43
--   mock-mr01mr10-costumeschedule-01a: 14:20 + 1h50 = 16:10; +25min =
--     16:35
--   mock-mr01mr10-costumeschedule-01b: 2.5 x 4.80 = 12.00
--   mock-mr01mr10-costumeschedule-02a: 10:15 + 1h40 = 11:55; +15min =
--     12:10; +55min = 13:05
--   mock-mr01mr10-costumeschedule-02b: 6 x 3.5 = 21 flags; 21 x 0.35 =
--     7.35
--
-- DUPLICATE/OVERLAP FINDING: no exact or near-duplicate found against
-- any existing Practice or Mock row -- rotation content is entirely new
-- to this repository; the running-average mean sub-format is a distinct
-- technique from every existing mean-calculation family (disclosed
-- above); the compound costume/bunting scenarios and their numbers are
-- new and distinct from mock-mr10-forwardschedule/reverseschedule's own
-- coach/flight scenarios (Batch 002).
--
-- NOT APPLIED. Generated for independent-reviewer and Founder inspection
-- via Supabase Dashboard > SQL Editor > New query, after migration 094
-- (applied, Decision 150) has already been applied. This migration does
-- NOT itself grant any review approval — see migration 096 for the
-- pending-review placeholder records.

begin;

-- === mock-mr01-directcalc (QT-MR-01, easy — direct computation, no ====
-- === embedded word problem or missing operand) =========================
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-mr01-directcalc-01', 'maths', 'QT-MR-01', array['csse'], 'easy', 'short-answer', 30,
 $json${"id":"mock-mr01-directcalc-01","marks":1,"skill":"arithmetic","answer":"44.8","question":"Work out: 6.4 × 7","workingSteps":["6 × 7 = 42","0.4 × 7 = 2.8","42 + 2.8 = 44.8"]}$json$,
 'Mock Programme Increment 004, Batch 003. QT-MR-01 (Direct Arithmetic Computation), competency MR-01, family mock-mr01-directcalc. Direct decimal multiplication with no embedded word problem or missing operand, directly evidenced (CSSE-006 Q1/Q13, CSSE-011 Q1/Q2/Q3, CSSE-016 Q1/Q2 — HIGH confidence, EMC-4, "present as the paper''s opening question(s)"). Batch 001/002 carry zero QT-MR-01 rows despite this; Practice already carries substantial QT-MR-01 volume (~18%, migration 091''s own figure), disclosed here rather than treated as irrelevant to this Mock-specific gap. Answer independently recomputed: 6.4 × 7 = 44.8.', 2, 'mock-mr01-directcalc-01',
 'mock-mr01-directcalc', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Misapplying decimal place value when multiplying by a whole number — e.g. treating 6.4 × 7 as 64 × 7 = 448 and misplacing the decimal point (4.48 or 448 instead of 44.8).',
 'NEAR_TRANSFER'),

('mock-mr01-directcalc-02', 'maths', 'QT-MR-01', array['csse'], 'easy', 'short-answer', 30,
 $json${"id":"mock-mr01-directcalc-02","marks":1,"skill":"arithmetic","answer":"87","question":"Work out: 3/5 of 145","workingSteps":["145 ÷ 5 = 29","29 × 3 = 87"]}$json$,
 'Mock Programme Increment 004, Batch 003. QT-MR-01, family mock-mr01-directcalc, variant 2 — a fraction-of-amount computation, a genuinely different arithmetic surface from variant 1''s decimal multiplication, not a relabelled copy. Answer independently recomputed: 145 ÷ 5 = 29, 29 × 3 = 87.', 2, 'mock-mr01-directcalc-02',
 'mock-mr01-directcalc', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Multiplying by the numerator before dividing by the denominator without adjusting correctly, or dividing 145 by 3 instead of 5 — finding the wrong unit fraction and producing an incorrect total.',
 'NEAR_TRANSFER')
on conflict (id) do nothing;

-- === mock-mr08-rotation (QT-MR-08, medium — rotation about the origin, ==
-- === the only text-answerable coordinate-transformation mechanic) =====
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-mr08-rotation-01', 'maths', 'QT-MR-08', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mock-mr08-rotation-01","marks":2,"skill":"geometry","answer":"(5, -3)","question":"The point (3, 5) is rotated 90° clockwise about the origin (0, 0). What are the coordinates of the new point? Give your answer in the form (x, y).","workingSteps":["A 90° clockwise rotation about the origin maps (x, y) to (y, -x)","(3, 5) → (5, -3)"]}$json$,
 'Mock Programme Increment 004, Batch 003. QT-MR-08 (Coordinate/Transformation Reasoning), competency MR-03, family mock-mr08-rotation. Rotation-about-origin mechanic, directly evidenced (CSSE-011 Q18, 2022 — MEDIUM confidence, EMC-3, mechanic varies year to year per the framework). Zero rotation or coordinate-transformation content of any kind existed anywhere in this repository before this batch (confirmed by repository-wide search). Answer independently recomputed via the rotation matrix for -90°: (x,y) → (y,-x), giving (5,-3).', 2, 'mock-mr08-rotation-01',
 'mock-mr08-rotation', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Confusing the clockwise 90-degree rule with the counterclockwise rule and negating the wrong coordinate — e.g. answering (-5, 3) instead of (5, -3).',
 'NEAR_TRANSFER'),

('mock-mr08-rotation-02', 'maths', 'QT-MR-08', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mock-mr08-rotation-02","marks":2,"skill":"geometry","answer":"(2, -6)","question":"The point (-2, 6) is rotated 180° about the origin (0, 0). What are the coordinates of the new point? Give your answer in the form (x, y).","workingSteps":["A 180° rotation about the origin maps (x, y) to (-x, -y)","(-2, 6) → (2, -6)"]}$json$,
 'Mock Programme Increment 004, Batch 003. QT-MR-08, family mock-mr08-rotation, variant 2 — a 180° rotation, a genuinely different transformation rule from variant 1''s 90° clockwise rotation, not a relabelled copy. Answer independently recomputed: (x,y) → (-x,-y), giving (2,-6).', 2, 'mock-mr08-rotation-02',
 'mock-mr08-rotation', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Forgetting to negate both coordinates for a 180-degree rotation — e.g. only negating the x-coordinate and answering (2, 6) instead of (2, -6).',
 'NEAR_TRANSFER')
on conflict (id) do nothing;

-- === mock-mr12-reversemean (QT-MR-12, hard — running-average sub-format
-- === only; forward-mean and plain-reverse-mean sub-formats deliberately
-- === excluded as already represented elsewhere, see header) ===========
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-mr12-reversemean-01', 'maths', 'QT-MR-12', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mock-mr12-reversemean-01","marks":2,"skill":"data-handling","answer":"84","question":"After 5 tests, a student's mean score was 72. After a sixth test, the mean rose to 74. What was the score on the sixth test?","workingSteps":["Total after 5 tests = 72 × 5 = 360","Total after 6 tests = 74 × 6 = 444","Sixth test score = 444 − 360 = 84"]}$json$,
 'Mock Programme Increment 004, Batch 003. QT-MR-12 (Average/Mean Calculation), competency MR-01, family mock-mr12-reversemean. Running-average sub-format specifically (a new data point changes an already-established mean; find that new data point), directly evidenced (CSSE-011 Q11, 2022 — "reverse mean from running average"). Deliberately distinct from the plain reverse-mean sub-format already in Practice (mr01-revmean-01..04, migration 081, "N-1 known values, find the missing one") — this family always starts from an already-known running mean and count, then recomputes after one further data point, a genuinely different calculation shape. Answer independently recomputed: 72 × 5 = 360, 74 × 6 = 444, 444 − 360 = 84.', 3, 'mock-mr12-reversemean-01',
 'mock-mr12-reversemean', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Treating the new mean (74) as the sixth test''s score directly, or subtracting the two means (74 − 72 = 2) instead of recomputing both totals and subtracting those.',
 'FAR_TRANSFER'),

('mock-mr12-reversemean-02', 'maths', 'QT-MR-12', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mock-mr12-reversemean-02","marks":2,"skill":"data-handling","answer":"43","question":"After 4 matches, a team's mean score was 58. After a fifth match, the mean fell to 55. What was the team's score in the fifth match?","workingSteps":["Total after 4 matches = 58 × 4 = 232","Total after 5 matches = 55 × 5 = 275","Fifth match score = 275 − 232 = 43"]}$json$,
 'Mock Programme Increment 004, Batch 003. QT-MR-12, family mock-mr12-reversemean, variant 2 — the mean FALLS rather than rises, a genuinely different direction from variant 1, not a relabelled copy. Answer independently recomputed: 58 × 4 = 232, 55 × 5 = 275, 275 − 232 = 43.', 3, 'mock-mr12-reversemean-02',
 'mock-mr12-reversemean', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Assuming the new score must simply be below the old mean by the amount the mean itself fell, rather than recomputing both totals from their respective means and counts.',
 'FAR_TRANSFER')
on conflict (id) do nothing;

-- === mock-mr01mr10-costumeschedule (QT-MR-10 + QT-MR-01 grouped, hard —
-- === 2 numbered-question instances, 2 subparts each, migration 093's
-- === question_group_id/group_order/subpart_label/marking_mode columns
-- === used for the first time, per the evidenced CSSE-006 Q9 compound
-- === structure, see header) ============================================
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class, question_group_id, group_order, subpart_label, marking_mode)
values
('mock-mr01mr10-costumeschedule-01a', 'maths', 'QT-MR-10', array['csse'], 'hard', 'short-answer', 60,
 $json${"id":"mock-mr01mr10-costumeschedule-01a","marks":1,"skill":"time","answer":"16:35","question":"A tailor starts making a costume at 14:20. Sewing takes 1 hour 50 minutes, and finishing touches take a further 25 minutes. What time is the costume finished? Give your answer in 24-hour time.","workingSteps":["14:20 + 1 hour 50 minutes = 16:10","16:10 + 25 minutes = 16:35"]}$json$,
 'Mock Programme Increment 004, Batch 003. Grouped numbered-question instance 1, subpart (a) — QT-MR-10 (Multi-Step Elapsed-Time/Scheduling Word Problem), competency MR-04, family mock-mr01mr10-costumeschedule. Forms one displayed numbered question together with subpart (b) below (question_group_id mock-mr01mr10-costumeschedule-01), matching the real compound structure the framework itself records at CSSE-006 Q9 ("combines QT-MR-10 (elapsed time) with QT-MR-01 (arithmetic)", Section 6). Answer independently recomputed: 14:20 + 1h50 = 16:10, +25min = 16:35.', 3, 'mock-mr01mr10-costumeschedule-01a',
 'mock-mr01mr10-costumeschedule', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Adding the two time intervals in the wrong order or failing to carry minutes into hours correctly — e.g. dropping the initial 1 hour 50 minute leg, or treating 16:10 + 25 minutes as simple digit addition.',
 'FAR_TRANSFER', 'mock-mr01mr10-costumeschedule-01', 1, '(a)', 'deterministic'),

('mock-mr01mr10-costumeschedule-01b', 'maths', 'QT-MR-01', array['csse'], 'hard', 'short-answer', 45,
 $json${"id":"mock-mr01mr10-costumeschedule-01b","marks":1,"skill":"arithmetic","answer":"12.00","question":"Each costume uses 2.5 metres of fabric costing £4.80 per metre. What is the cost of fabric for one costume?","workingSteps":["2.5 × 4.80 = 12.00"]}$json$,
 'Mock Programme Increment 004, Batch 003. Grouped numbered-question instance 1, subpart (b) — QT-MR-01 (Direct Arithmetic Computation), competency MR-01, family mock-mr01mr10-costumeschedule. Forms one displayed numbered question together with subpart (a) above (same question_group_id), completing the compound elapsed-time-plus-arithmetic structure evidenced at CSSE-006 Q9. Answer independently recomputed: 2.5 × 4.80 = 12.00.', 3, 'mock-mr01mr10-costumeschedule-01b',
 'mock-mr01mr10-costumeschedule', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Multiplying only the whole-metre part (2 × 4.80) and ignoring the 0.5 metre, or misplacing the decimal point in 2.5 × 4.80.',
 'FAR_TRANSFER', 'mock-mr01mr10-costumeschedule-01', 2, '(b)', 'deterministic'),

('mock-mr01mr10-costumeschedule-02a', 'maths', 'QT-MR-10', array['csse'], 'hard', 'short-answer', 75,
 $json${"id":"mock-mr01mr10-costumeschedule-02a","marks":1,"skill":"time","answer":"13:05","question":"A group starts making bunting at 10:15. They work for 1 hour 40 minutes, then take a 15-minute tea break, then work for a further 55 minutes. What time do they finish? Give your answer in 24-hour time.","workingSteps":["10:15 + 1 hour 40 minutes = 11:55","11:55 + 15 minutes = 12:10","12:10 + 55 minutes = 13:05"]}$json$,
 'Mock Programme Increment 004, Batch 003. Grouped numbered-question instance 2, subpart (a) — QT-MR-10, family mock-mr01mr10-costumeschedule, variant 2 — a genuinely different scenario (bunting-making, 3 stages including a break) and different numbers from instance 1''s costume scenario, not a relabelled copy. Answer independently recomputed: 10:15 + 1h40 = 11:55, +15min = 12:10, +55min = 13:05.', 3, 'mock-mr01mr10-costumeschedule-02a',
 'mock-mr01mr10-costumeschedule', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Losing track of one of the three sequential stages (work, break, work) when adding them in sequence, or treating the 15-minute break as though it were 15 hours.',
 'FAR_TRANSFER', 'mock-mr01mr10-costumeschedule-02', 1, '(a)', 'deterministic'),

('mock-mr01mr10-costumeschedule-02b', 'maths', 'QT-MR-01', array['csse'], 'hard', 'short-answer', 60,
 $json${"id":"mock-mr01mr10-costumeschedule-02b","marks":1,"skill":"arithmetic","answer":"7.35","question":"Each metre of bunting uses 6 triangular flags, and 3.5 metres of bunting are made. Each flag costs £0.35 to make. What is the total cost of the flags?","workingSteps":["Number of flags = 6 × 3.5 = 21","Total cost = 21 × 0.35 = 7.35"]}$json$,
 'Mock Programme Increment 004, Batch 003. Grouped numbered-question instance 2, subpart (b) — QT-MR-01, family mock-mr01mr10-costumeschedule, variant 2 — requires an intermediate unit-count step (metres to flags) before the direct-computation multiplication, a genuinely different arithmetic shape from instance 1''s single-step fabric-cost multiplication. Answer independently recomputed: 6 × 3.5 = 21 flags, 21 × 0.35 = 7.35.', 3, 'mock-mr01mr10-costumeschedule-02b',
 'mock-mr01mr10-costumeschedule', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Multiplying 3.5 by the flag cost directly (3.5 × 0.35) instead of first finding the number of flags (6 × 3.5 = 21) — skipping the unit-conversion step entirely.',
 'FAR_TRANSFER', 'mock-mr01mr10-costumeschedule-02', 2, '(b)', 'deterministic')
on conflict (id) do nothing;

commit;
