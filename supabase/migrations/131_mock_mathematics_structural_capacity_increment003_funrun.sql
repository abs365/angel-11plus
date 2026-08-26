-- Angel Digital 11+ — Migration 131
-- Mathematics Structural Capacity, Authoring Increment 003 — Shared
-- Multi-Row Data Reasoning Family (Decision 191/192).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Decision 191's own recomputed evidence found the single highest-value
-- next bounded investment was NOT reserve promotion or diagram capacity,
-- but authoring one new capability-ready Classification-A family using
-- the already-supported `MockTableStimulus` contract (no new rendering
-- capability required). This migration authors exactly one such family
-- and no other content.
--
-- ============================================================
-- PRIMARY-SOURCE EVIDENCE LOCK (re-read directly this session via
-- pdftotext against the real PDFs, not Decision prose)
-- ============================================================
-- 2021 Q10: a real bar chart ("Stefan kept a record of the total goals
-- scored in each game... over four weekends") -- a genuine frequency
-- distribution (games on the y-axis, goals-per-game 0-6 on the x-axis).
-- Three subparts, three marks: (a) total number of games (sum of the
-- frequency column); (b) total number of goals scored (sum of
-- value x frequency); (c) mean number of goals per game, to one decimal
-- place (derived total divided by derived count, then rounded). This is
-- a genuine shared-dataset compound, structurally distinct from a plain
-- list-of-values mean (mock-mr09-data-02) because the dataset is a
-- frequency table (category, count), not a flat list, and from
-- mock-mr09-runningclub because the reasoning chain here is
-- sum -> weighted-sum -> derived-mean, not sum-then-rate or
-- successive-difference-search.
--
-- 2022 Q15: a real bar chart of museum visitors by day of the week, 3
-- subparts, checked as a second, corroborating instance of the same
-- broad archetype (categorical count data queried multiple ways) and
-- specifically evidencing that a real paper extends this archetype past
-- a bare sum/mean pair into a further derived-value application (there:
-- a differential ticket-price calculation). Confirms the archetype
-- supports a defensible 4th subpart beyond the 3-subpart 2021 Q10 shape,
-- disclosed honestly below as a modelled, not identically-sourced,
-- extension.
--
-- Evidence sufficiency verdict: SUFFICIENT for a genuine 4-subpart
-- Classification-A family (one primary real instance for the core
-- 3-subpart shape, a second real instance confirming the archetype
-- extends past 3 subparts in real practice).
--
-- ============================================================
-- FAMILY AUTHORED: mock-mr09-funrun (QT-MR-09, reused -- Angel's own
-- existing Data-Handling Question Type, not a new one; 4 rows, 1
-- numbered experience, 4 marks, text + structured table stimulus +
-- sharedStem)
-- ============================================================
-- Original scenario (Riverside Primary School sponsored fun run, laps
-- completed per runner) -- not the real 2021 Q10's own football/goals
-- scenario or 2022 Q15's own museum-visitors scenario, no CSSE wording,
-- names, or numbers reproduced. The dataset is delivered as a
-- structured `prompt.stimulus` table object (Decision 170's established
-- contract): headers ["Laps completed", "Number of runners"], 6 rows
-- (0-5 laps), identical on all 4 rows so selectDisplayUnitStimulus()
-- renders it once per display unit, exactly as already proven for
-- mock-mr09-runningclub/mock-mr10-bustimetable/mock-mr13-craftstall.
--
-- sharedStem used (Decision 180's contract): the family's 4 subparts
-- would otherwise repeat an identical intro sentence 4 times. Verified
-- this session, before writing this file, that the declared stem is an
-- exact, literal prefix of every one of the 4 rows' own `question` text
-- and that every resulting tail is non-empty (the same rule
-- resolveGroupSharedStem() enforces at render time).
--
-- ============================================================
-- STRUCTURAL DISTINCTION FROM EXISTING NEIGHBOURS (audited before
-- authoring, per this session's own directive)
-- ============================================================
-- mock-mr09-data: 3 UNRELATED single-scenario rows (extremes-comparison,
-- plain-list mean, price x quantity-then-sum), disclosed in Decision 141
-- as not sharing a dataset -- Classification B/C, not A. This family
-- shares ONE dataset across all 4 subparts -- genuine Classification A.
-- mock-mr09-runningclub: shares ONE 5-value flat list across 2 subparts
-- (sum-then-rate; successive-difference-search). This family uses a
-- frequency TABLE (category, count) rather than a flat list, across 4
-- subparts, with a reasoning chain (frequency-sum, weighted-sum,
-- derived-mean, threshold-conditional-count) that repeats none of
-- runningclub's two operations.
-- mock-mr10-fairprep / mock-mr10-bustimetable: shared-timetable/
-- elapsed-time reasoning (QT-MR-10), not data-handling.
-- mock-mr13-craftstall: shared price-list/unit-value reasoning
-- (QT-MR-13), not data-handling.
-- No shared scenario, numbers, or answer values with any of the above.
--
-- Repository-wide search for "fun run"/"Riverside Primary"/"laps
-- completed": zero prior use anywhere.
--
-- ============================================================
-- REASONING-DIVERSITY PROOF (four genuinely different demands, not four
-- repetitions of one operation)
-- ============================================================
-- (a) direct frequency-column extraction and summation (medium).
-- (b) weighted summation -- each category value multiplied by its own
--     frequency before the six results are summed (medium): a
--     materially different operation from (a), not a repeat with
--     different numbers.
-- (c) derived mean -- combines the RESULTS of the same underlying data
--     as (a)/(b) via division, then rounds to 1 decimal place (hard):
--     cannot be solved by repeating (a) or (b)'s own arithmetic; it is
--     a plain re-application from the SAME table (independently
--     recomputed here, not carried over from (a)/(b)'s stored answers,
--     since each row must remain a complete, self-contained question).
-- (d) threshold-conditional count -- requires first deriving the mean
--     (an un-stated value not given anywhere in this row's own text),
--     then partitioning the SAME frequency table by a >mean condition,
--     then summing only the qualifying frequencies (hard): a genuinely
--     new operation (conditional aggregation), not a repeat of (a)'s
--     unconditional sum, matching the real 2022 Q15(c)'s own structural
--     role of extending the core archetype with one further derived-
--     value application.
--
-- ============================================================
-- ANSWERS INDEPENDENTLY VERIFIED VIA TWO METHODS before this file was
-- written (manual arithmetic and a re-derivation in a different grouping
-- order)
-- ============================================================
--   (a) frequencies 3,5,8,6,5,3. Method 1: 3+5+8+6+5+3 = 30. Method 2
--       (paired from the ends): (3+3)+(5+5)+(8+6) = 6+10+14 = 30.
--   (b) weighted values 0x3=0, 1x5=5, 2x8=16, 3x6=18, 4x5=20, 5x3=15.
--       Method 1 (forward sum): 0+5+16+18+20+15 = 74. Method 2 (reverse
--       sum): 15+20+18+16+5+0 = 74.
--   (c) mean = 74 / 30. Method 1 (long division): 74/30 = 2 remainder
--       14, 14/30 = 0.4666..., so 2.4666... which rounds to 2.5 to 1
--       decimal place. Method 2 (fraction simplification): 74/30 = 37/15
--       = 2 + 7/15 = 2 + 0.4666... = 2.4666..., same rounded result 2.5.
--   (d) threshold 2.5: categories with laps > 2.5 are 3, 4, 5 laps.
--       Method 1 (direct sum): frequency(3)+frequency(4)+frequency(5) =
--       6+5+3 = 14. Method 2 (complement check): total runners (30)
--       minus runners with laps <= 2 (frequency(0)+frequency(1)+
--       frequency(2) = 3+5+8 = 16) = 30-16 = 14. Both methods agree.
--
-- Every answer stored as a bare number (or, for (c), a decimal to 1dp)
-- -- never a free-text phrase -- to keep every answer deterministically,
-- unambiguously exact-match scorable under the current marking
-- architecture, matching the established convention from migrations
-- 119/121/125.
--
-- ============================================================
-- DIFFICULTY, MARKING, MARKS CONTRACT
-- ============================================================
-- (a)/(b) medium (single derived operation over the shared table);
-- (c)/(d) hard -- (c) requires combining two independently-derived
-- totals via division and correct rounding; (d) requires deriving the
-- unstated mean AND applying it as a filter condition across the table,
-- the deepest, most composed demand of the four. 1 mark per subpart, 4
-- rows, 4 marks total. No row's marks value exceeds 1. No
-- partial-credit mechanism invoked or implied. marking_mode is
-- 'deterministic' throughout -- every answer is a single exact-match
-- numeric (or, for (b)'s intermediate wording, none is free text)
-- value, so no evidence exists that deterministic marking is unsuitable
-- here.
--
-- ============================================================
-- DIAGRAM/GEOMETRY BOUNDARY PRESERVED
-- ============================================================
-- The real 2021 Q10 / 2022 Q15 primary-source instances are bar charts;
-- this family deliberately represents the identical underlying dataset
-- as a `type: "table"` stimulus (category, count), exactly as
-- mock-mr10-bustimetable already represents a real timetable and
-- mock-mr13-craftstall already represents a real price list via the
-- same structured-table contract -- it does NOT attempt to render a bar
-- chart, plotted graph, or any diagram/geometry construct. The absence
-- of chart/diagram-rendering capability remains a disclosed, unresolved
-- structural gap (Decision 189/191), not something this migration
-- claims to have closed or worked around by imitation.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch any existing row, family, or migration (088-130). Does
-- not alter any of the 55 existing mock_eligible rows or any of the 11
-- independently_validated reserve rows. Does not set eligibility_status
-- to anything other than 'authentic_assessment_candidate'. Does not
-- create or touch any ali_family_review row (migration 132 handles the
-- pending-review placeholder separately). Does not create, modify, or
-- activate any ali_mock_form row. Does not touch English or Writing
-- content. Does not author a second family. Does not build or imply any
-- diagram/geometry rendering capability. Does not reproduce any CSSE
-- past-paper question wording, image, or exact numeric scenario.
--
-- FAIL-CLOSED / DUPLICATE-ID PROTECTION: the insert uses
-- `on conflict (id) do nothing`, matching every prior content migration
-- in this repository exactly -- if any of these 4 IDs already exist
-- (drift, re-run, or a naming collision with unrelated content), no row
-- is silently overwritten; the migration becomes a safe no-op for that
-- row rather than corrupting existing state.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class, question_group_id, group_order, subpart_label, marking_mode)
values
('mock-mr09-funrun-01', 'maths', 'QT-MR-09', array['csse'], 'medium', 'short-answer', 80,
 $json${"id":"mock-mr09-funrun-01","marks":1,"skill":"data-handling","answer":"30","question":"Riverside Primary School held a sponsored fun run. The table below shows how many laps each runner completed. How many runners took part in the fun run in total?","workingSteps":["Total runners = 3 + 5 + 8 + 6 + 5 + 3 = 30"],"stimulus":{"type":"table","caption":"Riverside Primary School fun run results","headers":["Laps completed","Number of runners"],"rows":[["0","3"],["1","5"],["2","8"],["3","6"],["4","5"],["5","3"]]},"sharedStem":"Riverside Primary School held a sponsored fun run. The table below shows how many laps each runner completed."}$json$,
 'Mathematics Structural Capacity, Authoring Increment 003 (Decision 191/192). Subpart (a) — QT-MR-09 (Data Reading), family mock-mr09-funrun. Genuine shared frequency-table compound, evidenced by 2021 Q10 (real bar chart, frequency distribution, 3 subparts) and 2022 Q15 (real bar chart, categorical count data, corroborating instance), both independently re-verified this session against the real papers. Direct frequency-column extraction and summation. Answer independently recomputed via two methods (forward sum, paired-ends sum): 3+5+8+6+5+3=30.', 2, 'mock-mr09-funrun-01',
 'mock-mr09-funrun', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Miscounting or omitting one of the six frequency values when summing (for example forgetting the "0 laps" category or double-counting one row).',
 'FAR_TRANSFER', 'mock-mr09-funrun', 1, '(a)', 'deterministic'),

('mock-mr09-funrun-02', 'maths', 'QT-MR-09', array['csse'], 'medium', 'short-answer', 95,
 $json${"id":"mock-mr09-funrun-02","marks":1,"skill":"data-handling","answer":"74","question":"Riverside Primary School held a sponsored fun run. The table below shows how many laps each runner completed. What was the total number of laps completed by all runners combined?","workingSteps":["Total laps = (0×3) + (1×5) + (2×8) + (3×6) + (4×5) + (5×3)","= 0 + 5 + 16 + 18 + 20 + 15 = 74"],"stimulus":{"type":"table","caption":"Riverside Primary School fun run results","headers":["Laps completed","Number of runners"],"rows":[["0","3"],["1","5"],["2","8"],["3","6"],["4","5"],["5","3"]]},"sharedStem":"Riverside Primary School held a sponsored fun run. The table below shows how many laps each runner completed."}$json$,
 'Mathematics Structural Capacity, Authoring Increment 003 (Decision 191/192). Subpart (b) — QT-MR-09, family mock-mr09-funrun. Reuses the SAME shared frequency table as subpart (a), delivered via the identical `stimulus` object, but requires a genuinely different reasoning step — weighted summation (each laps-value multiplied by its own frequency before the six results are summed), not a repeat of (a)''s unconditional frequency sum. Answer independently recomputed via two methods (forward sum, reverse sum): 0+5+16+18+20+15=74.', 2, 'mock-mr09-funrun-02',
 'mock-mr09-funrun', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Adding the raw frequency values instead of multiplying each laps value by its own frequency before summing (treating this as a repeat of subpart (a)).',
 'FAR_TRANSFER', 'mock-mr09-funrun', 2, '(b)', 'deterministic'),

('mock-mr09-funrun-03', 'maths', 'QT-MR-09', array['csse'], 'hard', 'short-answer', 115,
 $json${"id":"mock-mr09-funrun-03","marks":1,"skill":"data-handling","answer":"2.5","question":"Riverside Primary School held a sponsored fun run. The table below shows how many laps each runner completed. What was the mean (average) number of laps completed per runner? Give your answer to 1 decimal place.","workingSteps":["Total runners = 3+5+8+6+5+3 = 30","Total laps = 0+5+16+18+20+15 = 74","Mean = 74 ÷ 30 = 2.4666...","Rounded to 1 decimal place = 2.5"],"stimulus":{"type":"table","caption":"Riverside Primary School fun run results","headers":["Laps completed","Number of runners"],"rows":[["0","3"],["1","5"],["2","8"],["3","6"],["4","5"],["5","3"]]},"sharedStem":"Riverside Primary School held a sponsored fun run. The table below shows how many laps each runner completed."}$json$,
 'Mathematics Structural Capacity, Authoring Increment 003 (Decision 191/192). Subpart (c) — QT-MR-09, family mock-mr09-funrun. Reuses the SAME shared frequency table, requiring a derived mean that combines two independently-derived totals (total runners, total laps) via division and correct rounding — a materially harder demand than (a)/(b), matching the real 2021 Q10(c)''s own structural role as that family''s own hardest subpart. Answer independently recomputed via two methods (long division, fraction simplification): 74/30=2.4666... rounds to 2.5.', 2, 'mock-mr09-funrun-03',
 'mock-mr09-funrun', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Dividing the total laps by the number of distinct lap categories (6) instead of the total number of runners (30), or rounding 2.4666... down to 2.4 instead of up to 2.5.',
 'FAR_TRANSFER', 'mock-mr09-funrun', 3, '(c)', 'deterministic'),

('mock-mr09-funrun-04', 'maths', 'QT-MR-09', array['csse'], 'hard', 'short-answer', 130,
 $json${"id":"mock-mr09-funrun-04","marks":1,"skill":"data-handling","answer":"14","question":"Riverside Primary School held a sponsored fun run. The table below shows how many laps each runner completed. A certificate is awarded to any runner who completed more laps than the mean (average) number of laps per runner. How many runners received a certificate?","workingSteps":["Mean number of laps = 74 ÷ 30 = 2.4666... = 2.5 to 1 decimal place","Runners who completed MORE than 2.5 laps completed 3, 4 or 5 laps","3 laps: 6 runners, 4 laps: 5 runners, 5 laps: 3 runners","6 + 5 + 3 = 14 runners"],"stimulus":{"type":"table","caption":"Riverside Primary School fun run results","headers":["Laps completed","Number of runners"],"rows":[["0","3"],["1","5"],["2","8"],["3","6"],["4","5"],["5","3"]]},"sharedStem":"Riverside Primary School held a sponsored fun run. The table below shows how many laps each runner completed."}$json$,
 'Mathematics Structural Capacity, Authoring Increment 003 (Decision 191/192). Subpart (d) — QT-MR-09, family mock-mr09-funrun. Deepest reasoning demand of the four: requires first deriving the unstated mean from the same shared table (not restated anywhere in this row''s own text), then applying it as a threshold to partition and sum a subset of the same frequency data — a genuinely new operation (conditional aggregation), modelled on 2022 Q15(c)''s own structural role of extending the core archetype with a further derived-value application, disclosed as a bounded extension beyond 2021 Q10''s own exact 3-subpart shape. Answer independently recomputed via two methods (direct sum of qualifying frequencies, complement check against the total): 14.', 3, 'mock-mr09-funrun-04',
 'mock-mr09-funrun', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Counting only runners who completed exactly 3 laps, or incorrectly including runners who completed exactly 2 laps (at or below the mean) rather than strictly more than the mean.',
 'FAR_TRANSFER', 'mock-mr09-funrun', 4, '(d)', 'deterministic')
on conflict (id) do nothing;

commit;
