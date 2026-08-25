-- Angel Digital 11+ — Migration 125
-- Mathematics First Mock Structural Capacity, Authoring Wave 002 —
-- Shared Timetable + Shared Price-List/Menu (Decision 184/185).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Decision 184's own production baseline (mock_eligible 55/55,
-- independently_validated 4/4) still reaches only ~44 marks at 20
-- questions and ~46 at 21, well short of an authentic ~58-60. Decision
-- 183's own reassessment found shared-timetable and shared price-list/
-- menu are the two highest-value remaining archetypes with no new
-- visual-capability blocker. This migration authors exactly two new
-- Classification-A families, one per archetype, and no other content.
--
-- ============================================================
-- PRIMARY-SOURCE EVIDENCE LOCK (re-read directly this session via
-- pdftotext against the real PDFs, not Decision prose)
-- ============================================================
-- FAMILY A (shared timetable): 2022 Q19 -- a real 4x2 table (stops
-- Borchester/Ister/Eccleford/Dryden x Morning/Afternoon), 4 subparts,
-- 4 marks (mark scheme's own page total confirms): (a) total journey
-- time from one column; (b) a cross-column comparison of one stage's
-- duration; (c) a waiting-time gap between a morning arrival and an
-- afternoon departure at the same stop; (d) a percentage reduction
-- applied to a derived (not directly read) leg duration. This is
-- structurally RICHER than mock-mr10-fairprep's own 2023 Q9/2021 Q9/
-- 2022 Q19 citation (migration 113) -- direct re-reading this session
-- found 2022 Q19 is itself this 4-subpart table-timetable shape, not a
-- simple 2-part forward/reverse pair; fairprep's own citation grouped
-- it with the simpler shape without drawing out this distinction. That
-- earlier grouping is not corrected here (fairprep's own content and
-- certification are unaffected) but is disclosed precisely: the
-- richer, table-based, 4-subpart timetable archetype has exactly ONE
-- confirmed real instance (2022 Q19), not three -- evidence sufficiency
-- verdict: SUFFICIENT (one genuine, richly-detailed real instance,
-- honestly disclosed as single-year), not "3/3-year" as a looser
-- reading of the earlier citation might imply.
--
-- FAMILY B (shared price-list/menu): 2021 Q6 -- a real price list (4
-- fruits, pack-based and per-item pricing), 3 subparts, marks scheme
-- confirms 1 mark each: (a) combined cost across 3 different items
-- requiring pack-to-quantity conversion for some items; (b) a
-- cheapest-per-quantity comparison across all listed items; (c) reverse
-- reasoning from an exact total to a unique quantity of one
-- individually-priced item, given a purchase constraint (at least one
-- of each of two items). 2023 Q16's own "restaurant menu" was also
-- checked and is explicitly NOT used as evidence here -- it is a
-- combinatorics/counting question (no prices at all), a different
-- archetype entirely, honestly distinguished rather than conflated.
-- Evidence sufficiency verdict: SUFFICIENT (one genuine, richly
-- structured real instance).
--
-- ============================================================
-- FAMILY A AUTHORED: mock-mr10-bustimetable (QT-MR-10, reused --
-- Angel's own existing elapsed-time/scheduling Question Type, not a
-- new one; 4 rows, 1 numbered experience, 4 marks, text + structured
-- table stimulus + sharedStem)
-- ============================================================
-- Original bus-route scenario (Hillview/Milltown/Riverside/Oakford) --
-- not the real 2022 Q19's own place names, train service, or numbers.
-- Table stimulus delivered via prompt.stimulus (Decision 170's
-- established table contract), identical on all 4 rows so
-- selectDisplayUnitStimulus() renders it once per display unit exactly
-- as it already does for mock-mr09-runningclub.
--
-- sharedStem used (Decision 180's contract): the family's 4 subparts
-- would otherwise repeat an identical intro sentence 4 times -- exactly
-- the repetition risk Decision 180 fixed for mock-mr06-linkedvalues.
-- Verified this session, before writing this file, that the declared
-- stem is an exact, literal prefix of every one of the 4 rows' own
-- `question` text and that every resulting tail is non-empty (the
-- same rule resolveGroupSharedStem() enforces at render time).
--
-- Every answer independently re-derived and verified via TWO methods
-- (manual clock arithmetic, and a script re-deriving every value from
-- minutes-since-midnight) before this file was written:
--   (a) morning Hillview to Oakford: 09:35 - 08:00 = 95 minutes.
--   (b) Milltown-Riverside stage: morning 25 min, afternoon 32 min,
--       difference = 7 minutes.
--   (c) morning arrival at Milltown 08:40, afternoon departure from
--       Milltown 14:50, gap = 370 minutes.
--   (d) afternoon Hillview-Milltown currently 35 minutes; 20% of 35 =
--       7; 35 - 7 = 28 minutes.
-- Every answer stored as a bare number of minutes -- not a free-text
-- "N hours M minutes" string -- specifically to keep every answer
-- deterministically, unambiguously exact-match scorable under the
-- current marking architecture (Part 12 of this session's own
-- directive: an answer that cannot be safely scored deterministically
-- must be redesigned, not authored anyway).
--
-- Difficulty assigned on genuine reasoning demand, not defaulted:
-- (a)/(b) medium (single-column read-and-subtract; two-stage read plus
-- one comparison); (c)/(d) hard -- (c) requires reasoning across two
-- different columns AND two different rows simultaneously (a demand
-- neither (a) nor (b) requires); (d) requires first deriving an
-- un-stated current value from the table, then applying a percentage
-- reduction to it -- the deepest, most composed demand of the four,
-- matching the real 2022 Q19(d)'s own structural role as the paper's
-- own hardest subpart in that family.
--
-- ============================================================
-- FAMILY B AUTHORED: mock-mr13-craftstall (QT-MR-13, reused -- Angel's
-- own existing Best-Value Question Type, mock-mr13-bestvalue's own
-- tag; 3 rows, 1 numbered experience, 3 marks, text + structured table
-- stimulus + sharedStem)
-- ============================================================
-- Original craft-fair-stall scenario (keyrings/bracelets/stickers) --
-- not the real 2021 Q6's own fruits, packs, or numbers. Table stimulus
-- identical on all 3 rows. sharedStem used for the same reason as
-- Family A (3-way repeated intro), verified an exact prefix with a
-- non-empty tail on every row before writing.
--
-- QT-MR-13 (Best-Value) chosen deliberately over inventing a new QT:
-- the organising reasoning demand across all three subparts is
-- unit-value/price-list reasoning (mock-mr13-bestvalue's own existing
-- definition), even though (a) and (c) are not literally "which is
-- cheaper" questions in isolation -- both still require the same
-- underlying pack-price/unit-price competency the existing QT-MR-13
-- family already represents, now at genuine Classification-A, 3-subpart
-- depth for the first time (mock-mr13-bestvalue itself is a 2-row,
-- Classification-B family: two independent, unrelated best-value
-- comparisons, never sharing a dataset).
--
-- Every answer independently re-derived and verified via TWO methods
-- (manual arithmetic, and a script re-deriving every value and
-- exhaustively searching subpart (c)'s own solution space) before this
-- file was written:
--   (a) 15 keyrings (3 packs x £2.00 = £6.00) + 6 bracelets (6 x £1.20
--       = £7.20) + 24 stickers (3 packs x £1.60 = £4.80) = £18.00.
--   (b) cost of 40 of each: keyrings £16.00, bracelets £48.00,
--       stickers £8.00 -- stickers cheapest.
--   (c) £8.40 spent on bracelets (£1.20 each) and whole packs of
--       stickers (£1.60/pack), at least one of each: exhaustively
--       checked every whole-pack sticker quantity from 1 to 5 (the
--       only range where the remaining amount could be non-negative);
--       exactly ONE combination gives a whole number of bracelets --
--       3 packs of stickers (£4.80) + 3 bracelets (£3.60) = £8.40.
--       Uniqueness independently confirmed by script, not assumed.
--
-- Difficulty: (a)/(b) medium (multi-item combined calculation; a
-- three-way unit-value comparison); (c) hard -- a reverse/search
-- reasoning demand with a uniqueness constraint, genuinely different
-- from (a)/(b), matching the real 2021 Q6(c)'s own structural role as
-- that family's own hardest subpart.
--
-- ============================================================
-- DUPLICATE/OVERLAP AUDIT PERFORMED BEFORE AUTHORING -- checked against
-- all 194 Mathematics Practice rows, the full 55-row mock_eligible
-- pool, the 4-row independently_validated reserve, and this migration's
-- own 7 rows against each other
-- ============================================================
-- Repository-wide search for "Hillview"/"Milltown"/"Riverside"/
-- "Oakford"/"keyring"/"bracelet"/"craft fair"/"craft stall": zero prior
-- use anywhere. "sticker" appears once, in an unrelated existing
-- Practice row (mr02-far-02, migration 039: a ratio/algebra
-- stickers-shared-between-two-people problem) -- checked and cleared:
-- no shared scenario, numbers, price list, or reasoning structure, a
-- coincidental noun match only. mock-mr10-bustimetable checked against
-- mock-mr10-fairprep/forwardschedule/reverseschedule: no shared numbers
-- or scenario; structurally distinct (Family A is the only one of the
-- four using a real table stimulus, multi-stop comparison, or
-- percentage-derived reasoning). mock-mr13-craftstall checked against
-- mock-mr13-bestvalue: no shared scenario or numbers; structurally
-- distinct (2-row independent-comparison B-type vs. 3-row shared-list
-- A-type). Also checked against mock-mr06-multiplerelation/sumdiff for
-- the reverse-reasoning-from-a-total pattern: those solve a stated
-- 2-unknown algebraic system directly; mock-mr13-craftstall-03 requires
-- an exhaustive whole-pack search under a real-world purchasing
-- constraint -- a different method, not a relabelling.
--
-- ============================================================
-- MARKS CONTRACT (Decision 175, binding)
-- ============================================================
-- 1 mark per subpart, 7 rows, 7 marks total (4 + 3). No row's marks
-- value exceeds 1. No partial-credit mechanism invoked or implied.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch any existing row, family, or migration (088-124).
-- Does not alter any of the 55 existing mock_eligible rows or the 4
-- independently_validated reserve rows (mock-mr03mr07-perimeterarea).
-- Does not set eligibility_status to anything other than
-- 'authentic_assessment_candidate'. Does not create or touch any
-- ali_family_review row (migration 126 handles the pending-review
-- placeholder separately). Does not create, modify, or activate any
-- ali_mock_form row. Does not touch English or Writing content. Does
-- not author a third family. Does not reproduce any CSSE past-paper
-- question wording, image, or exact numeric scenario.
--
-- KNOWN LIMITATIONS, disclosed honestly: these two families (2
-- numbered-question experiences, 7 marks) are one bounded authoring
-- wave, not a claim the ~14-16-mark structural deficit is closed --
-- Part 23 of this session's own directive requires the composition
-- ceiling to be recomputed, not assumed to rise by the raw mark total;
-- see this Decision's own capacity analysis for the actual result.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migration 124 (NOT
-- yet confirmed applied at time of writing -- see Decision 185's own
-- reconciliation) has already been applied. This migration does NOT
-- itself grant any review approval -- see migration 126 for the
-- pending-review placeholder record.

begin;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class, question_group_id, group_order, subpart_label, marking_mode)
values
('mock-mr10-bustimetable-01', 'maths', 'QT-MR-10', array['csse'], 'medium', 'short-answer', 75,
 $json${"id":"mock-mr10-bustimetable-01","marks":1,"skill":"time","answer":"95","question":"A bus company runs a route from Hillview to Oakford, stopping at Milltown and Riverside. The timetable below shows the morning and afternoon journey times. How many minutes does the morning bus take to travel from Hillview to Oakford?","workingSteps":["Morning departs Hillview at 08:00, arrives Oakford at 09:35","09:35 minus 08:00 = 1 hour 35 minutes = 95 minutes"],"stimulus":{"type":"table","caption":"Hillview to Oakford bus timetable","headers":["Stop","Morning","Afternoon"],"rows":[["Hillview","08:00","14:15"],["Milltown","08:40","14:50"],["Riverside","09:05","15:22"],["Oakford","09:35","15:50"]]},"sharedStem":"A bus company runs a route from Hillview to Oakford, stopping at Milltown and Riverside. The timetable below shows the morning and afternoon journey times."}$json$,
 'Mathematics First Mock Structural Capacity, Authoring Wave 002 (Decision 184/185). Subpart (a) — QT-MR-10, family mock-mr10-bustimetable. Genuine shared-timetable compound, evidenced by 2022 Q19 (real table stimulus, 4 subparts, 4 marks, independently re-verified this session against the real paper and mark scheme) — materially richer than mock-mr10-fairprep''s own simpler forward/reverse pair, never a paraphrase of the source question''s own place names or numbers. Answer independently recomputed via two methods (clock arithmetic and a minutes-since-midnight script): 09:35 - 08:00 = 95 minutes.', 2, 'mock-mr10-bustimetable-01',
 'mock-mr10-bustimetable', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Reading only part of the journey (e.g. Hillview to Riverside) instead of the full Hillview to Oakford journey, or giving the answer in hours and minutes instead of total minutes.',
 'FAR_TRANSFER', 'mock-mr10-bustimetable', 1, '(a)', 'deterministic'),

('mock-mr10-bustimetable-02', 'maths', 'QT-MR-10', array['csse'], 'medium', 'short-answer', 90,
 $json${"id":"mock-mr10-bustimetable-02","marks":1,"skill":"time","answer":"7","question":"A bus company runs a route from Hillview to Oakford, stopping at Milltown and Riverside. The timetable below shows the morning and afternoon journey times. How many minutes longer does the afternoon bus take from Milltown to Riverside than the morning bus takes for the same stage?","workingSteps":["Morning Milltown to Riverside: 09:05 minus 08:40 = 25 minutes","Afternoon Milltown to Riverside: 15:22 minus 14:50 = 32 minutes","Difference = 32 minus 25 = 7 minutes"],"stimulus":{"type":"table","caption":"Hillview to Oakford bus timetable","headers":["Stop","Morning","Afternoon"],"rows":[["Hillview","08:00","14:15"],["Milltown","08:40","14:50"],["Riverside","09:05","15:22"],["Oakford","09:35","15:50"]]},"sharedStem":"A bus company runs a route from Hillview to Oakford, stopping at Milltown and Riverside. The timetable below shows the morning and afternoon journey times."}$json$,
 'Mathematics First Mock Structural Capacity, Authoring Wave 002 (Decision 184/185). Subpart (b) — QT-MR-10, family mock-mr10-bustimetable. Forms one displayed numbered question together with the other subparts (same question_group_id), reusing the SAME shared timetable stated once — a cross-column comparison of one stage''s duration, a genuinely different reasoning demand from (a)''s single-column read. Answer independently recomputed via two methods: morning 25 min, afternoon 32 min, difference 7 minutes.', 2, 'mock-mr10-bustimetable-02',
 'mock-mr10-bustimetable', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Comparing the wrong stage (e.g. Hillview to Milltown) instead of Milltown to Riverside, or subtracting the two stage durations the wrong way round.',
 'FAR_TRANSFER', 'mock-mr10-bustimetable', 2, '(b)', 'deterministic'),

('mock-mr10-bustimetable-03', 'maths', 'QT-MR-10', array['csse'], 'hard', 'short-answer', 100,
 $json${"id":"mock-mr10-bustimetable-03","marks":1,"skill":"time","answer":"370","question":"A bus company runs a route from Hillview to Oakford, stopping at Milltown and Riverside. The timetable below shows the morning and afternoon journey times. Someone takes the morning bus to Milltown, then waits, then takes the afternoon bus onward from Milltown. How many minutes could they spend at Milltown?","workingSteps":["Morning bus arrives at Milltown at 08:40","Afternoon bus departs Milltown at 14:50","14:50 minus 08:40 = 6 hours 10 minutes = 370 minutes"],"stimulus":{"type":"table","caption":"Hillview to Oakford bus timetable","headers":["Stop","Morning","Afternoon"],"rows":[["Hillview","08:00","14:15"],["Milltown","08:40","14:50"],["Riverside","09:05","15:22"],["Oakford","09:35","15:50"]]},"sharedStem":"A bus company runs a route from Hillview to Oakford, stopping at Milltown and Riverside. The timetable below shows the morning and afternoon journey times."}$json$,
 'Mathematics First Mock Structural Capacity, Authoring Wave 002 (Decision 184/185). Subpart (c) — QT-MR-10, family mock-mr10-bustimetable. Deepest reasoning demand so far: requires reasoning across two different columns AND two different rows of the same shared timetable simultaneously (morning arrival, afternoon departure, same stop) — a demand neither (a) nor (b) requires. Answer independently recomputed via two methods: 14:50 - 08:40 = 370 minutes.', 3, 'mock-mr10-bustimetable-03',
 'mock-mr10-bustimetable', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Comparing the wrong two times (e.g. two morning times, or two afternoon times) instead of the morning arrival and the afternoon departure at Milltown.',
 'FAR_TRANSFER', 'mock-mr10-bustimetable', 3, '(c)', 'deterministic'),

('mock-mr10-bustimetable-04', 'maths', 'QT-MR-10', array['csse'], 'hard', 'short-answer', 110,
 $json${"id":"mock-mr10-bustimetable-04","marks":1,"skill":"time","answer":"28","question":"A bus company runs a route from Hillview to Oakford, stopping at Milltown and Riverside. The timetable below shows the morning and afternoon journey times. The bus company plans to speed up the afternoon Hillview-to-Milltown leg by 20%. How many minutes should the new afternoon Hillview-to-Milltown leg take?","workingSteps":["Current afternoon Hillview to Milltown: 14:50 minus 14:15 = 35 minutes","20% of 35 minutes = 7 minutes","35 minus 7 = 28 minutes"],"stimulus":{"type":"table","caption":"Hillview to Oakford bus timetable","headers":["Stop","Morning","Afternoon"],"rows":[["Hillview","08:00","14:15"],["Milltown","08:40","14:50"],["Riverside","09:05","15:22"],["Oakford","09:35","15:50"]]},"sharedStem":"A bus company runs a route from Hillview to Oakford, stopping at Milltown and Riverside. The timetable below shows the morning and afternoon journey times."}$json$,
 'Mathematics First Mock Structural Capacity, Authoring Wave 002 (Decision 184/185). Subpart (d) — QT-MR-10, family mock-mr10-bustimetable. The richest demand of the four: requires first deriving an un-stated current leg duration from the shared timetable, then applying a percentage reduction to it — matching the real 2022 Q19(d)''s own structural role as that family''s own hardest subpart. Answer independently recomputed via two methods: current 35 minutes, 20% reduction, 35 - 7 = 28 minutes.', 3, 'mock-mr10-bustimetable-04',
 'mock-mr10-bustimetable', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Adding 20% instead of subtracting it, or applying the 20% reduction to the wrong leg''s current duration.',
 'FAR_TRANSFER', 'mock-mr10-bustimetable', 4, '(d)', 'deterministic')
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class, question_group_id, group_order, subpart_label, marking_mode)
values
('mock-mr13-craftstall-01', 'maths', 'QT-MR-13', array['csse'], 'medium', 'short-answer', 90,
 $json${"id":"mock-mr13-craftstall-01","marks":1,"skill":"ratio-and-proportion","answer":"18.00","question":"A craft fair stall sells keyrings, bracelets and stickers. Keyrings are sold in packs of 5 for £2.00 each pack. Bracelets are sold individually for £1.20 each. Stickers are sold in packs of 8 for £1.60 each pack. What is the total cost of 15 keyrings, 6 bracelets and 24 stickers? Give your answer in pounds, using 2 decimal places.","workingSteps":["15 keyrings = 3 packs x £2.00 = £6.00","6 bracelets = 6 x £1.20 = £7.20","24 stickers = 3 packs x £1.60 = £4.80","Total = £6.00 + £7.20 + £4.80 = £18.00"],"stimulus":{"type":"table","caption":"Craft fair stall price list","headers":["Item","Pack size","Price"],"rows":[["Keyrings","Pack of 5","£2.00"],["Bracelets","Sold individually","£1.20"],["Stickers","Pack of 8","£1.60"]]},"sharedStem":"A craft fair stall sells keyrings, bracelets and stickers. Keyrings are sold in packs of 5 for £2.00 each pack. Bracelets are sold individually for £1.20 each. Stickers are sold in packs of 8 for £1.60 each pack."}$json$,
 'Mathematics First Mock Structural Capacity, Authoring Wave 002 (Decision 184/185). Subpart (a) — QT-MR-13 (Best-Value/unit-price reasoning), family mock-mr13-craftstall. Genuine shared price-list compound, evidenced by 2021 Q6 (real supermarket price list, 3 subparts, independently re-verified this session against the real paper and mark scheme), reusing the existing QT-MR-13 tag rather than inventing one — never a paraphrase of the source question''s own fruits or numbers. Answer independently recomputed via two methods (manual arithmetic and a script): £6.00 + £7.20 + £4.80 = £18.00.', 2, 'mock-mr13-craftstall-01',
 'mock-mr13-craftstall', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Treating every item as sold individually (ignoring the pack sizes for keyrings and stickers), or mixing up which item is packed and which is sold individually.',
 'FAR_TRANSFER', 'mock-mr13-craftstall', 1, '(a)', 'deterministic'),

('mock-mr13-craftstall-02', 'maths', 'QT-MR-13', array['csse'], 'medium', 'short-answer', 100,
 $json${"id":"mock-mr13-craftstall-02","marks":1,"skill":"ratio-and-proportion","answer":"Stickers","question":"A craft fair stall sells keyrings, bracelets and stickers. Keyrings are sold in packs of 5 for £2.00 each pack. Bracelets are sold individually for £1.20 each. Stickers are sold in packs of 8 for £1.60 each pack. If someone wanted to buy 40 of the same item, which item would work out cheapest?","workingSteps":["40 keyrings = 8 packs x £2.00 = £16.00 (£0.40 each)","40 bracelets = 40 x £1.20 = £48.00 (£1.20 each)","40 stickers = 5 packs x £1.60 = £8.00 (£0.20 each)","Stickers are cheapest"],"stimulus":{"type":"table","caption":"Craft fair stall price list","headers":["Item","Pack size","Price"],"rows":[["Keyrings","Pack of 5","£2.00"],["Bracelets","Sold individually","£1.20"],["Stickers","Pack of 8","£1.60"]]},"sharedStem":"A craft fair stall sells keyrings, bracelets and stickers. Keyrings are sold in packs of 5 for £2.00 each pack. Bracelets are sold individually for £1.20 each. Stickers are sold in packs of 8 for £1.60 each pack."}$json$,
 'Mathematics First Mock Structural Capacity, Authoring Wave 002 (Decision 184/185). Subpart (b) — QT-MR-13, family mock-mr13-craftstall. Forms one displayed numbered question together with the other subparts (same question_group_id), reusing the SAME shared price list — a three-way unit-value comparison, the archetype''s own defining Best-Value demand. Answer independently recomputed via two methods: unit costs £0.40/£1.20/£0.20, stickers cheapest.', 2, 'mock-mr13-craftstall-02',
 'mock-mr13-craftstall', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Comparing the pack prices directly instead of computing the cost for 40 of each item, or comparing cost-per-pack instead of cost-per-unit.',
 'FAR_TRANSFER', 'mock-mr13-craftstall', 2, '(b)', 'deterministic'),

('mock-mr13-craftstall-03', 'maths', 'QT-MR-13', array['csse'], 'hard', 'short-answer', 120,
 $json${"id":"mock-mr13-craftstall-03","marks":1,"skill":"ratio-and-proportion","answer":"3","question":"A craft fair stall sells keyrings, bracelets and stickers. Keyrings are sold in packs of 5 for £2.00 each pack. Bracelets are sold individually for £1.20 each. Stickers are sold in packs of 8 for £1.60 each pack. A customer spent exactly £8.40 buying only bracelets and stickers, with at least one of each. How many bracelets did they buy?","workingSteps":["Let b = number of bracelets and p = number of whole packs of stickers","1.20b + 1.60p = 8.40","Testing whole-pack values of p from 1 upward, only p = 3 gives a whole number for b","1.20b + 1.60(3) = 8.40, so 1.20b = 3.60, b = 3","Check: 3 bracelets (£3.60) + 3 packs of stickers (£4.80) = £8.40"],"stimulus":{"type":"table","caption":"Craft fair stall price list","headers":["Item","Pack size","Price"],"rows":[["Keyrings","Pack of 5","£2.00"],["Bracelets","Sold individually","£1.20"],["Stickers","Pack of 8","£1.60"]]},"sharedStem":"A craft fair stall sells keyrings, bracelets and stickers. Keyrings are sold in packs of 5 for £2.00 each pack. Bracelets are sold individually for £1.20 each. Stickers are sold in packs of 8 for £1.60 each pack."}$json$,
 'Mathematics First Mock Structural Capacity, Authoring Wave 002 (Decision 184/185). Subpart (c) — QT-MR-13, family mock-mr13-craftstall. Deepest reasoning demand: reverse reasoning from an exact total to a unique quantity, under a real purchasing constraint (whole packs only, at least one of each) — matching the real 2021 Q6(c)''s own structural role as that family''s own hardest subpart. Uniqueness independently verified by exhaustive search (script), not assumed: exactly one whole-pack combination (3 packs of stickers, 3 bracelets) matches £8.40.', 3, 'mock-mr13-craftstall-03',
 'mock-mr13-craftstall', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Assuming the customer bought a whole number of individual stickers rather than whole packs, or not checking that the found combination is the unique whole-pack solution matching the total.',
 'FAR_TRANSFER', 'mock-mr13-craftstall', 3, '(c)', 'deterministic')
on conflict (id) do nothing;

commit;
