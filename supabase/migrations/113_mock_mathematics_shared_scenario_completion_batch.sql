-- Angel Digital 11+ — Migration 113
-- Mathematics First Mock Minimum — Shared-Scenario Completion Batch
-- (Decision 168, approved by the Founder; recorded as Decision 169).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Decision 168's own three-year primary-source audit (all 62 real
-- numbered questions across the 2021/2022/2023 CSSE Mathematics papers,
-- read directly from knowledge/csse/official-papers/ and
-- knowledge/csse/mark-schemes/, not the framework document) found
-- Classification A (shared-scenario compound: subparts operate on ONE
-- shared scenario/dataset/rule) is the single largest real category —
-- 30/62 (48.4%), ahead of Classification B (related-skill, separate
-- scenario) at 26/62 (41.9%). Angel's proposed First Mock (Decision
-- 167) has zero genuine Classification A content anywhere in its
-- certified pool. This migration authors exactly the bounded, minimal
-- batch the Founder approved: 2 new numbered-question experiences, 4
-- rows, each closing a specific, already-named gap — not a general
-- content expansion, not a proportional match to 48%.
--
-- ============================================================
-- FAMILY 1: mock-mr10-fairprep (QT-MR-10, shared-scenario elapsed time,
-- forward + reverse, genuinely shared numbers across both subparts)
-- ============================================================
-- Closes the Q8/Q20 structural-fidelity finding (Decision 167's own
-- Compound-Coherence Gate turn): Angel's existing mock-mr10-
-- forwardschedule/mock-mr10-reverseschedule present forward and reverse
-- elapsed-time reasoning as two fully separate numbered questions, each
-- built from unrelated scenarios — never matching the real, evidenced
-- shape (CSSE-006-equivalent 2023 Q9, 2021 Q9, 2022 Q19: forward and
-- reverse elapsed-time reasoning from ONE shared scenario). This family
-- is a genuine shared-scenario compound, not merely a shared narrative
-- theme (the disclosed defect found in mock-mr01mr10-costumeschedule,
-- see Decision 169's own append-only correction below): both subparts
-- reuse the IDENTICAL two stated durations (1 hour 55 minutes assembly,
-- 40 minutes testing) — subpart (b) is answerable only by using the
-- same numbers subpart (a) uses, the actual mechanism that makes a
-- compound question "shared-scenario" rather than "shared-theme."
--
-- Original Angel scenario (a school science-fair robotics display) —
-- not the 2023 paper's costume-making scenario, not any existing Angel
-- family's own scenario, no CSSE wording, names, or numbers reproduced.
--
-- Difficulty selected on reasoning demand, not defaulted to hard for
-- both: subpart (a) is a single forward addition (medium — matching
-- every existing standalone QT-MR-10 forward row's own convention);
-- subpart (b) requires inverting the reasoning direction AND applying
-- an additional buffer constraint before subtracting both durations in
-- reverse order (hard — matching every existing standalone QT-MR-10
-- reverse row's own convention, and genuinely more demanding than (a)).
--
-- Every answer independently re-derived and hand-verified before this
-- file was written:
--   mock-mr10-fairprep-01: 13:15 + 1h55 = 15:10; 15:10 + 40min = 15:50.
--   mock-mr10-fairprep-02: 16:30 − 20min = 16:10 (target finish);
--     16:10 − 40min (testing) = 15:30; 15:30 − 1h55 (assembly) = 13:35.
--
-- ============================================================
-- FAMILY 2: mock-mr09-runningclub (QT-MR-09, shared-dataset, two
-- genuinely different derived queries against the same data)
-- ============================================================
-- Resolves the QT-MR-09 question raised across two review turns:
-- Decision 168's three-year audit found real chart/dataset shared-
-- scenario compounds in 2 of 3 years (2021 Q10/Q13, 2022 Q15) — a
-- materially stronger evidence base than the single-year 2023-only read
-- found. Both subparts read the SAME 5-value weekly attendance dataset;
-- neither is a repeat of the other's reasoning shape (deliberately NOT
-- "sum" then "mean," which mock-mr09-data already covers — this family
-- uses "sum-then-multiply-by-a-rate" for (a) and "compute successive
-- differences and identify the greatest" for (b), genuine table
-- INTERPRETATION rather than superficial repetition of the same
-- computation on different rows).
--
-- Original Angel scenario (a school running club's weekly attendance) —
-- not the 2022 museum-visitors or 2021 goals/oil-price scenarios, not
-- mock-mr09-data's own reading-challenge/temperature/ticket scenarios,
-- no CSSE wording, names, or numbers reproduced.
--
-- PRESENTATION DESIGN NOTE (Part 7 of the Founder's own directive):
-- ali_question_bank's `prompt` JSONB has no separate structured-table
-- field, and the real learner-facing renderer (app/learning-
-- intelligence/mock-exam/page.tsx, confirmed by direct reading this
-- session) displays `question` via a plain <p> with the Tailwind class
-- `whitespace-pre-line` — it renders literal newlines faithfully but
-- has no column-aligned <table> rendering. Rather than degrade the
-- dataset into one run-on sentence to fit a plain-text field, this
-- migration uses `\n`-separated "Week N: count" lines within the
-- `question` string — the one structured-text mechanism the current UI
-- already renders correctly (confirmed by direct source reading, not
-- assumed), producing a clearly separated, readable list rather than a
-- true grid table. A genuine, disclosed presentation-fidelity gap
-- (no aligned-column table), not a blocker: see this session's own
-- Visual Standard Pre-flight for the full assessment.
--
-- Difficulty: both subparts require reading the same 5-value dataset;
-- (a) is medium (read, sum, one multiplication); (b) is hard (compute 4
-- pairwise differences and identify the maximum — a genuine search/
-- comparison step beyond a single direct calculation, matching this
-- project's own established convention for search-type QT-MR-11 rows).
--
-- Every answer independently re-derived and hand-verified before this
-- file was written:
--   mock-mr09-runningclub-01: 14+19+16+23+21 = 93; 93 x 1.50 = 139.50.
--   mock-mr09-runningclub-02: differences 19-14=+5, 16-19=-3, 23-16=+7,
--     21-23=-2; greatest increase +7, Week 3 to Week 4 (unique, no tie).
--
-- ============================================================
-- DUPLICATE / MEMORISATION AUDIT (performed before authoring, against
-- all 194 Mathematics Practice rows, all 48 current mock_eligible rows,
-- the 4 independently_validated perimeterarea rows, and this
-- migration's own 2 new rows against each other)
-- ============================================================
-- 1. EXACT DUPLICATION: none — repository-wide text search for both
--    new scenarios' own wording, numbers, and answers (15:50, 13:35,
--    139.50, "Week 3 to Week 4") found no match anywhere in any
--    migration.
-- 2. TEXTUAL NEAR-DUPLICATION: none found by direct grep for the
--    chosen scenario keywords ("science fair", "robotics", "running
--    club") across all Mathematics and non-Mathematics content.
-- 3. NUMBER-SUBSTITUTION CHECK: neither new family is a relabelled copy
--    of any existing family — mock-mr10-fairprep genuinely differs from
--    mock-mr10-forwardschedule/mock-mr10-reverseschedule/mock-mr01mr10-
--    costumeschedule in STRUCTURE (one shared scenario reused across
--    both subparts, not two unrelated scenarios or a mixed-skill split);
--    mock-mr09-runningclub genuinely differs from mock-mr09-data in
--    STRUCTURE (one shared dataset queried twice, not three unrelated
--    single-scenario items) and in REASONING SHAPE from any existing
--    mean-calculation family (sum-then-rate and successive-difference-
--    search, neither of which mock-mr09-data or mock-mr12-reversemean
--    already tests).
-- 4. LEGITIMATE STRUCTURAL RECURRENCE: both families deliberately
--    recur the SAME real archetype already evidenced 3 times (forward/
--    reverse-in-one-scenario) and 3 times (shared-dataset multi-query)
--    respectively across the three real papers — authentic recurrence,
--    not manufactured similarity to existing Angel content.
-- 5. CROSS-CHECK BETWEEN THE TWO NEW FAMILIES: no shared scenario,
--    numbers, or answer values between mock-mr10-fairprep and
--    mock-mr09-runningclub.
--
-- ============================================================
-- GROUPING CONTRACT
-- ============================================================
-- question_group_id = family_id (matching migration 112's own
-- established convention for every single-instance family), group_order
-- 1/2, subpart_label '(a)'/'(b)', marking_mode = 'deterministic' on
-- every row (every answer is a single, exact-match value — a time, a
-- decimal currency amount, or a short "Week N to Week N" string — no
-- semicolon, no free text). Each new numbered question is ONE display
-- experience with 2 underlying response components, exactly matching
-- how mock_get_attempt_grouping()/buildDisplayUnits() (migrations 106,
-- Decision 161) already read this generically — no code change required
-- (confirmed this session, see this migration's own header discussion).
--
-- ============================================================
-- eligibility_status = 'authentic_assessment_candidate' on every row —
-- NOT 'independently_validated', NOT 'mock_eligible'. Matches every
-- prior authoring migration's own entry point exactly, per
-- RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md's own transition table.
--
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch any of the 48 existing mock_eligible rows or their
-- grouping metadata (migration 112 is untouched). Does not touch
-- mock-mr03mr07-perimeterarea (migration 111, still not applied,
-- still separate). Does not create or touch any ali_family_review row
-- (migration 114 handles the pending-review placeholder separately).
-- Does not create, modify, or activate any ali_mock_form row. Does not
-- touch English or Writing content. Does not modify mock-mr01mr10-
-- costumeschedule or mock-mr09-data in any way — both remain exactly
-- as migrations 095/088 left them; their own governance questions
-- (Decision 169's own append-only correction; Classification D) stay
-- open, unaffected by this migration.
--
-- NOT APPLIED. Generated for independent-reviewer and Founder inspection
-- via Supabase Dashboard > SQL Editor > New query, after migration 112
-- (grouping columns' established convention) has already been applied.
-- This migration does NOT itself grant any review approval — see
-- migration 114 for the pending-review placeholder records.

begin;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class, question_group_id, group_order, subpart_label, marking_mode)
values
('mock-mr10-fairprep-01', 'maths', 'QT-MR-10', array['csse'], 'medium', 'short-answer', 75,
 $json${"id":"mock-mr10-fairprep-01","marks":1,"skill":"time","answer":"15:50","question":"A group of students is setting up a robotics display for the school science fair. Assembling the display takes 1 hour 55 minutes, and testing the robots afterwards takes a further 40 minutes. If the students start assembling at 13:15, what time do they finish testing? Give your answer in 24-hour time.","workingSteps":["13:15 + 1 hour 55 minutes = 15:10","15:10 + 40 minutes = 15:50"]}$json$,
 'Mathematics First Mock Minimum, Shared-Scenario Completion Batch (Decision 168/169). Subpart (a) — QT-MR-10 (Multi-Step Elapsed-Time/Scheduling Word Problem), competency MR-04, family mock-mr10-fairprep. Forward elapsed-time reasoning. Forms one displayed numbered question together with subpart (b) below (same question_group_id), a genuine shared-scenario compound: both subparts reuse the identical stated durations (1h55, 40min), matching the real, directly-evidenced structure of 2023 Q9 / 2021 Q9 / 2022 Q19 (Decision 168''s own three-year audit) — never a paraphrase of any of those scenarios. Answer independently recomputed: 13:15 + 1h55 = 15:10, +40min = 15:50.', 2, 'mock-mr10-fairprep-01',
 'mock-mr10-fairprep', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Adding the assembly and testing durations without correctly carrying extra minutes into the next hour once the running total passes 60 minutes, or adding the two durations in the wrong order.',
 'FAR_TRANSFER', 'mock-mr10-fairprep', 1, '(a)', 'deterministic'),

('mock-mr10-fairprep-02', 'maths', 'QT-MR-10', array['csse'], 'hard', 'short-answer', 100,
 $json${"id":"mock-mr10-fairprep-02","marks":2,"skill":"time","answer":"13:35","question":"A group of students is setting up a robotics display for the school science fair. Assembling the display takes 1 hour 55 minutes, and testing the robots afterwards takes a further 40 minutes. The science fair opens to visitors at 16:30, and the students want to finish at least 20 minutes before it opens. What is the latest time they can start assembling? Give your answer in 24-hour time.","workingSteps":["Target finish time: 16:30 − 20 minutes = 16:10","Undo testing: 16:10 − 40 minutes = 15:30","Undo assembling: 15:30 − 1 hour 55 minutes = 13:35"]}$json$,
 'Mathematics First Mock Minimum, Shared-Scenario Completion Batch (Decision 168/169). Subpart (b) — QT-MR-10, family mock-mr10-fairprep. Reverse elapsed-time reasoning, restating (not merely referencing) the same two durations as subpart (a) — the mechanism that makes this a genuine shared-scenario compound rather than a shared-narrative-theme one (the disclosed defect in mock-mr01mr10-costumeschedule, see Decision 169''s own append-only correction). A genuinely harder demand than (a): the 20-minute buffer must be applied first, then both durations undone in reverse order. Answer independently recomputed: 16:30−20min=16:10, −40min=15:30, −1h55=13:35.', 3, 'mock-mr10-fairprep-02',
 'mock-mr10-fairprep', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Subtracting the durations from the fair''s opening time without first applying the 20-minute buffer, or undoing the two durations in the wrong order (assembling before testing).',
 'FAR_TRANSFER', 'mock-mr10-fairprep', 2, '(b)', 'deterministic'),

('mock-mr09-runningclub-01', 'maths', 'QT-MR-09', array['csse'], 'medium', 'short-answer', 75,
 $json${"id":"mock-mr09-runningclub-01","marks":1,"skill":"data-handling","answer":"139.50","question":"A school running club recorded how many pupils attended each week during one half-term:\nWeek 1: 14\nWeek 2: 19\nWeek 3: 16\nWeek 4: 23\nWeek 5: 21\nEach week, the club charges £1.50 per attending pupil for a hot drink afterwards. How much money was collected in total across all five weeks, in pounds?","workingSteps":["Total attendance = 14 + 19 + 16 + 23 + 21 = 93","Total collected = 93 × £1.50 = £139.50"]}$json$,
 'Mathematics First Mock Minimum, Shared-Scenario Completion Batch (Decision 168/169). Subpart (a) — QT-MR-09 (Data Reading), competency MR-01/MR-04, family mock-mr09-runningclub. Reads a shared 5-value dataset, then applies an external rate to the total — a two-step read-then-calculate demand, directly evidenced (2021 Q10/Q13, 2022 Q15, Decision 168''s own three-year audit) as a real, recurring shared-dataset compound structure, closing the QT-MR-09 gap named across two prior review turns. Presented as newline-separated lines (not a column-aligned table) because the confirmed learner-facing renderer (app/learning-intelligence/mock-exam/page.tsx) supports whitespace-pre-line text but not table markup — the one structured-text mechanism it already renders correctly. Answer independently recomputed: 14+19+16+23+21=93, 93×1.50=139.50.', 2, 'mock-mr09-runningclub-01',
 'mock-mr09-runningclub', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Multiplying £1.50 by a single week''s attendance instead of the five-week total, or omitting the final multiplication step and giving the raw attendance total (93) as the answer.',
 'FAR_TRANSFER', 'mock-mr09-runningclub', 1, '(a)', 'deterministic'),

('mock-mr09-runningclub-02', 'maths', 'QT-MR-09', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mock-mr09-runningclub-02","marks":2,"skill":"data-handling","answer":"Week 3 to Week 4","question":"A school running club recorded how many pupils attended each week during one half-term:\nWeek 1: 14\nWeek 2: 19\nWeek 3: 16\nWeek 4: 23\nWeek 5: 21\nBetween which two consecutive weeks did attendance increase by the greatest amount? Give your answer in the form \"Week X to Week Y\".","workingSteps":["Week-on-week changes: Week 1→2: +5, Week 2→3: −3, Week 3→4: +7, Week 4→5: −2","The greatest increase is +7, from Week 3 to Week 4"]}$json$,
 'Mathematics First Mock Minimum, Shared-Scenario Completion Batch (Decision 168/169). Subpart (b) — QT-MR-09, family mock-mr09-runningclub. Reads the SAME shared dataset as subpart (a) but requires a genuinely different reasoning step — computing every pairwise week-on-week difference and identifying the greatest, a search/comparison demand (not the sum-then-multiply of (a), and deliberately not a repeat of mock-mr09-data''s own mean-calculation shape). Answer verified unique: differences +5/−3/+7/−2, single unambiguous maximum. Answer independently recomputed and format chosen for unambiguous deterministic exact-match scoring.', 3, 'mock-mr09-runningclub-02',
 'mock-mr09-runningclub', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Comparing raw weekly attendance values instead of the week-on-week differences, or reporting the single highest-attendance week (Week 4, 23) rather than the week pair with the greatest increase from the week before.',
 'FAR_TRANSFER', 'mock-mr09-runningclub', 2, '(b)', 'deterministic')
on conflict (id) do nothing;

commit;
