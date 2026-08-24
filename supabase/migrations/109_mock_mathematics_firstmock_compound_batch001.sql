-- Angel Digital 11+ — Migration 109
-- Mathematics First Mock Minimum — Compound Content Foundation, Batch 001
-- (Decision 163).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Decision 162's own Part 7 read-only analysis found the First Mock
-- composition gap is a content-structure problem, not a marks-modelling
-- or blueprint error: the pool's own average mark density (~1.48
-- marks/numbered-question-experience) sits well below the authentic
-- CSSE Mathematics paper's own (~2.9 marks/question), because only 1 of
-- 46 available experiences (mock-mr01mr10-costumeschedule) is a genuine
-- compound (multi-Question-Type) structure. This migration begins
-- closing that gap with the smallest evidence-backed batch: 1 new
-- compound family, matching the SAME size/shape/marking-mode Angel
-- already proved once (migration 095).
--
-- ============================================================
-- PRIMARY-SOURCE AUDIT PERFORMED BEFORE AUTHORING (Part 2/3 of this
-- Decision's own directive)
-- ============================================================
-- Read directly, this session: docs/intelligence/CSSE_ASSESSMENT_
-- INTELLIGENCE_FRAMEWORK.md (Observation 3, corrected under CAP-1.1:
-- "20 numbered questions in 2023, 21 in 2021 and 2022, MOST WITH
-- LETTERED SUB-PARTS" — verified during AEP-004's own full
-- question-by-question review of all three years); and the three real,
-- primary-source Mathematics mark schemes preserved in this repository
-- (knowledge/csse/mark-schemes/Maths-*-Entry-Mark-Scheme.pdf,
-- Evidence Level A, Founder-accepted, internal-analysis use per
-- knowledge/KNOWLEDGE_GOVERNANCE.md §6 — structural facts only recorded
-- below, no protected question wording reproduced anywhere in this file
-- or its own review disclosure text).
--
-- STRUCTURAL FINDING, independently confirmed, not merely re-stated from
-- Observation 3's own prose: of the 2023 paper's 20 numbered questions,
-- 18 have 2 or more independently-marked response components (lettered
-- subparts, or multiple required values under one number); of the 2022
-- paper's 21, 20 do; of the 2021 paper's 21, all 21 do. This is the
-- OVERWHELMING NORM across all three evidenced years, not a small number
-- of named exceptions — the prior framing ("a couple of named compound
-- examples") undersold how systemic this structure is. Angel's own pool
-- represents it in exactly 1 of 46 units (~2%).
--
-- SELECTED STRUCTURE: CSSE-006 Q14 (2023), already named in Section 6 of
-- CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md ("combines QT-MR-03
-- (rounding/measurement) with QT-MR-07 (geometric perimeter/area)"), and
-- independently confirmed this session from the real 2023 mark scheme:
-- exactly 2 lettered subparts (14a, 14b), 1 mark each — the SAME size
-- and shape as mock-mr01mr10-costumeschedule (migration 095), requiring
-- no new marking-mode complexity. A second, richer 3-Question-Type
-- structure was also found this session (CSSE-006 Q11, cross-referenced
-- from three separate existing catalogue entries — QT-MR-09/Q11a,
-- QT-MR-08/Q11b, QT-MR-05/bare "Q11" — never previously flagged together
-- as one compound relationship) but is DELIBERATELY NOT authored this
-- migration: a 3-skill structure carries real quality/plotting-mechanic
-- risk (see Known Limitations below) better addressed with more time in
-- a future, separate batch, not rushed into this bounded First Mock
-- Minimum increment. Named here for the Founder as Rolling/Long-term
-- capacity direction, not solved now.
--
-- ============================================================
-- CONTENT AUTHORED: mock-mr03mr07-perimeterarea (QT-MR-03 + QT-MR-07,
-- hard — 2 numbered-question instances, 2 subparts each, using migration
-- 093's grouping columns exactly as migration 095 already proved safe)
-- ============================================================
-- Original Angel scenarios representing the SAME structural relationship
-- as CSSE-006 Q14 (a measurement/unit-conversion step producing a length
-- result, then a geometric-shape calculation producing an area result,
-- sharing one figure's dimensions) — not a paraphrase of the source
-- question's own wording, context, or numbers.
--
-- Every answer independently re-derived and hand-verified before this
-- file was written:
--   mock-mr03mr07-perimeterarea-01a: 250cm = 2.5m; perimeter =
--     2 x (3.6 + 2.5) = 2 x 6.1 = 12.2
--   mock-mr03mr07-perimeterarea-01b: 3.6 x 2.5 = 9
--   mock-mr03mr07-perimeterarea-02a: 450mm = 45cm; perimeter =
--     2 x (90 + 45) = 2 x 135 = 270
--   mock-mr03mr07-perimeterarea-02b: 90 x 45 = 4050
--
-- ============================================================
-- DUPLICATE/OVERLAP AUDIT PERFORMED BEFORE AUTHORING (Part 8 of this
-- Decision's own directive) — checked against all 194 Mathematics
-- Practice rows, all 48 current mock_eligible rows, and this migration's
-- own 4 rows against each other
-- ============================================================
-- 1. EXACT DUPLICATION: none — repository-wide text search for this
--    migration's own scenario wording, numbers, and answers found no
--    match anywhere.
-- 2. TEXTUAL NEAR-DUPLICATION: none.
-- 3. SUPERFICIAL NUMBER SUBSTITUTION: none between the two instances
--    within this family (see below) or against any existing row.
-- 4. EFFECTIVELY IDENTICAL REASONING — the one genuine near-neighbour
--    found and disclosed honestly, not hidden: `mr03-mixed-perimeter`
--    (migrations 039/066, live PRACTICE content, QT-MR-07, "given area
--    or perimeter and one side, find the other measure") is a real,
--    closely-related existing family. It is NOT a duplicate of this
--    batch: mr03-mixed-perimeter never requires a unit conversion (its
--    two given values are always already in the same unit) and is
--    always a single standalone question with one answer; this batch's
--    own defining, un-skippable step is a genuine mixed-unit conversion
--    (cm/m, mm/cm) BEFORE any perimeter/area calculation, presented as
--    one grouped, two-subpart numbered question producing both a
--    perimeter AND an area from the same figure — a different reasoning
--    shape, not a relabelling of mr03-mixed-perimeter's own reverse-
--    engineering structure. Also checked against `mock-mr03-unitconv`
--    (migration 088, ml/L and cm/m conversions with no geometric
--    follow-on) and `mock-mr07-triangleanglesum` (migration 091, angle
--    algebra, no perimeter/area at all) — both structurally distinct.
-- 5. LEGITIMATE STRUCTURAL RECURRENCE: instance 2 (window pane, mm/cm)
--    deliberately reuses the SAME two-step reasoning shape as instance 1
--    (garden bed, cm/m) with a genuinely different unit pair and
--    real-world context, matching Decision 148's own established Tier
--    4/5 diversity standard (authentic CSSE recurrence: the SAME real
--    exam question type appears with different concrete numbers/units
--    every year) — not a Tier 3 "renumbered clone."
--
-- ============================================================
-- MARKS CONTRACT (Part 7 of this Decision's own directive)
-- ============================================================
-- 1 mark per subpart, matching AEP-002 Observation 3 ("1 mark for each
-- correct answer," HIGH confidence, EMC-4, identical wording 3/3 years)
-- and independently confirmed against the real 2023 mark scheme's own
-- Q14 (14a and 14b, 1 mark each) — the exact same convention migration
-- 095 already used for mock-mr01mr10-costumeschedule. No mark value in
-- this migration was chosen to hit a target total; each reflects the
-- genuine, single, exact-match-verifiable correct answer its own
-- subpart requires.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch migrations 088/090/091/094/095/101 or any row they
-- authored/promoted/certified. Does not alter any of the 48 existing
-- mock_eligible rows or any grouping metadata on them. Does not set
-- eligibility_status to anything other than 'authentic_assessment_
-- candidate'. Does not create or touch any ali_family_review row
-- (migration 110 handles the pending-review placeholder separately,
-- exactly as migration 096 did for Batch 003). Does not create, modify,
-- or activate any ali_mock_form row. Does not touch English or Writing
-- content in any way. Does not reproduce any CSSE past-paper question
-- wording, image, or exact numeric scenario — every scenario, number,
-- and context here is Angel-original, independently verified.
--
-- KNOWN LIMITATIONS, disclosed honestly: this single family (2 numbered-
-- question experiences, 4 marks) is a down payment toward First Mock
-- Minimum, not a claim that the marks-density gap is closed — Decision
-- 162's own Part 7 finding (roughly 41 of 46 units needed to reach 60
-- marks using the pool's PRE-existing density) is not resolved by 4
-- additional marks alone. The richer, 3-Question-Type CSSE-006 Q11
-- structure found this session remains unauthored, named as a real,
-- evidence-backed Rolling/Long-term capacity target, not built here.
--
-- NOT APPLIED. Generated for independent-reviewer and Founder inspection
-- via Supabase Dashboard > SQL Editor > New query, after migration 105
-- (applied, Decision 160) has already been applied. This migration does
-- NOT itself grant any review approval — see migration 110 for the
-- pending-review placeholder record.

begin;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class, question_group_id, group_order, subpart_label, marking_mode)
values
('mock-mr03mr07-perimeterarea-01a', 'maths', 'QT-MR-03', array['csse'], 'hard', 'short-answer', 60,
 $json${"id":"mock-mr03mr07-perimeterarea-01a","marks":1,"skill":"measurement","answer":"12.2","question":"A rectangular garden bed is 3.6 metres long and 250 centimetres wide. Convert the width to metres, then find the perimeter of the garden bed in metres.","workingSteps":["250cm = 2.5 metres","Perimeter = 2 × (3.6 + 2.5) = 2 × 6.1 = 12.2 metres"]}$json$,
 'Mathematics First Mock Minimum, Compound Content Batch 001 (Decision 163). Grouped numbered-question instance 1, subpart (a) — QT-MR-03 (Unit Conversion / Measurement Calculation), competency MR-01, family mock-mr03mr07-perimeterarea. Forms one displayed numbered question together with subpart (b) below (question_group_id mock-mr03mr07-perimeterarea-01), representing the same structural relationship the CSSE_QUESTION_INTELLIGENCE_FRAMEWORK''s own Section 6 records at CSSE-006 Q14 ("combines QT-MR-03 (rounding/measurement) with QT-MR-07 (geometric perimeter/area)"), independently confirmed against the real 2023 mark scheme''s own 2-subpart, 1-mark-each structure. Original Angel scenario, not a paraphrase of the source question. Answer independently recomputed: 250cm = 2.5m, perimeter = 2×(3.6+2.5) = 12.2m.', 3, 'mock-mr03mr07-perimeterarea-01a',
 'mock-mr03mr07-perimeterarea', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Adding the unconverted width (250) directly instead of converting to metres first, or converting in the wrong direction (multiplying by 100 instead of dividing).',
 'FAR_TRANSFER', 'mock-mr03mr07-perimeterarea-01', 1, '(a)', 'deterministic'),

('mock-mr03mr07-perimeterarea-01b', 'maths', 'QT-MR-07', array['csse'], 'hard', 'short-answer', 45,
 $json${"id":"mock-mr03mr07-perimeterarea-01b","marks":1,"skill":"geometry","answer":"9","question":"A rectangular garden bed measures 3.6 metres by 2.5 metres. What is its area in square metres?","workingSteps":["Area = 3.6 × 2.5 = 9 square metres"]}$json$,
 'Mathematics First Mock Minimum, Compound Content Batch 001 (Decision 163). Grouped numbered-question instance 1, subpart (b) — QT-MR-07 (Geometric Angle/Shape Reasoning, applied here to area), competency MR-03, family mock-mr03mr07-perimeterarea. Forms one displayed numbered question together with subpart (a) above (same question_group_id), reusing the already-converted 2.5m width, completing the compound conversion-plus-geometry structure evidenced at CSSE-006 Q14. Answer independently recomputed: 3.6 × 2.5 = 9.', 3, 'mock-mr03mr07-perimeterarea-01b',
 'mock-mr03mr07-perimeterarea', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Computing perimeter again instead of area, or multiplying the unconverted width (250) by the length.',
 'FAR_TRANSFER', 'mock-mr03mr07-perimeterarea-01', 2, '(b)', 'deterministic'),

('mock-mr03mr07-perimeterarea-02a', 'maths', 'QT-MR-03', array['csse'], 'hard', 'short-answer', 60,
 $json${"id":"mock-mr03mr07-perimeterarea-02a","marks":1,"skill":"measurement","answer":"270","question":"A rectangular window pane is 90 centimetres long and 450 millimetres wide. Convert the width to centimetres, then find the perimeter of the window pane in centimetres.","workingSteps":["450mm = 45 centimetres","Perimeter = 2 × (90 + 45) = 2 × 135 = 270 centimetres"]}$json$,
 'Mathematics First Mock Minimum, Compound Content Batch 001 (Decision 163). Grouped numbered-question instance 2, subpart (a) — QT-MR-03, family mock-mr03mr07-perimeterarea, variant 2 — a genuinely different unit pair (mm/cm rather than instance 1''s cm/m) and real-world context (window pane, not a garden bed), not a relabelled copy. Answer independently recomputed: 450mm = 45cm, perimeter = 2×(90+45) = 270cm.', 3, 'mock-mr03mr07-perimeterarea-02a',
 'mock-mr03mr07-perimeterarea', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Adding the unconverted width (450) directly instead of converting to centimetres first, or converting in the wrong direction (dividing by 10 instead of multiplying, or using the wrong power of ten).',
 'FAR_TRANSFER', 'mock-mr03mr07-perimeterarea-02', 1, '(a)', 'deterministic'),

('mock-mr03mr07-perimeterarea-02b', 'maths', 'QT-MR-07', array['csse'], 'hard', 'short-answer', 45,
 $json${"id":"mock-mr03mr07-perimeterarea-02b","marks":1,"skill":"geometry","answer":"4050","question":"A rectangular window pane measures 90 centimetres by 45 centimetres. What is its area in square centimetres?","workingSteps":["Area = 90 × 45 = 4050 square centimetres"]}$json$,
 'Mathematics First Mock Minimum, Compound Content Batch 001 (Decision 163). Grouped numbered-question instance 2, subpart (b) — QT-MR-07, family mock-mr03mr07-perimeterarea, variant 2 — reuses the already-converted 45cm width, completing the compound structure for the window-pane scenario. Answer independently recomputed: 90 × 45 = 4050.', 3, 'mock-mr03mr07-perimeterarea-02b',
 'mock-mr03mr07-perimeterarea', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Computing perimeter again instead of area, or multiplying the unconverted width (450) by the length.',
 'FAR_TRANSFER', 'mock-mr03mr07-perimeterarea-02', 2, '(b)', 'deterministic')
on conflict (id) do nothing;

commit;
