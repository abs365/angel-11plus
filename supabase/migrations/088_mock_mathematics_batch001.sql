-- Angel Digital 11+ — Migration 088
-- Mock Programme Increment 004, Batch 001 — Mathematics Mock Content
-- Foundation (Decision 141).
--
-- 18 new, genuinely-authored Mathematics Mock CANDIDATE questions across
-- 7 families, 5 Question Types (QT-MR-02, QT-MR-03, QT-MR-05, QT-MR-09,
-- QT-MR-13), grounded directly in docs/intelligence/
-- CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md's own primary-source evidence
-- entries for each type. QT-MR-01 (already 34/194, ≈18%, of the live
-- Practice pool — Decision 138's own named concentration) is deliberately
-- excluded from this batch, per explicit instruction.
--
-- NOT Practice content. Every id, prompt, and family_id below is new —
-- none is a copy, paraphrase, or number-substitution of any existing
-- practice_eligible row (verified this session by direct comparison
-- against the live 194-row Mathematics practice_eligible set; see
-- Decision 141 for the full near-duplicate analysis). No existing
-- ali_question_bank row is read, referenced, or modified by this
-- migration.
--
-- eligibility_status = 'authentic_assessment_candidate' on every row —
-- NOT 'independently_validated', NOT 'mock_eligible'. Per
-- RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md's own transition table
-- (2026-08-10), this is the correct entry point for newly-authored
-- content with a disclosed, self-certified traceability chain awaiting
-- external (non-author) review — never skippable to a later stage, and
-- this migration does not attempt to.
--
-- Every answer independently re-derived and hand-verified before this
-- file was written (see Decision 141's own Part 8/12/13 for the full
-- verification and anti-memorisation analysis) — not generated and
-- trusted. Structural near-duplicate guard applied across all 18 items
-- and against the existing 194-row Mathematics pool: no two items in
-- this batch, and no item against the existing pool, share the same
-- numeric inputs, surface scenario, and answer together.
--
-- Genuine structural diversity, not superficial numeric variation:
-- migration 030's own precision-dec/precision-fraction discipline is
-- followed exactly — every variant within a family is individually
-- hand-verified to preserve the family's intended reasoning demand, never
-- merely swapped numbers. Where a family's own row count exceeds its
-- genuine reasoning-structure count (mock-mr09-data: 3 rows, 3 distinct
-- sub-structures — extremes-comparison, mean-calculation, multi-row
-- combination — not 3 variants of one structure), this is disclosed in
-- Decision 141, not obscured by a shared family_id.
--
-- addresses_misconception is written as prose describing a genuine likely
-- reasoning error, per this project's own corrected standard (Decision
-- 125 found and fixed 5 families' worth of raw kebab-case slugs
-- presented as learner guidance — this migration does not repeat that
-- defect).
--
-- transfer_class populated per row using the existing ROUTINE/
-- NEAR_TRANSFER/FAR_TRANSFER vocabulary (migration 035) — FAR_TRANSFER
-- reserved for genuinely new reasoning demand (the two-step inverse,
-- the inverse function machine, the multi-row data combination), never
-- assigned merely for a larger number.
--
-- Idempotent: every INSERT uses "on conflict (id) do nothing".
--
-- NOT APPLIED. Generated for independent-reviewer and Founder inspection
-- via Supabase Dashboard > SQL Editor > New query, after migration 087
-- (applied, Decision 140) has already been applied. This migration does
-- NOT itself grant any review approval — see migration 089 for the
-- pending-review placeholder records, and Decision 141 for the full
-- disclosure that no self-approval of any kind occurs anywhere in this
-- increment.

begin;

-- === mock-mr02-invdiv (QT-MR-02, easy — one-step inverse division) ====
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-mr02-invdiv-01', 'maths', 'QT-MR-02', array['csse'], 'easy', 'short-answer', 45,
 $json${"id":"mock-mr02-invdiv-01","marks":1,"skill":"arithmetic","answer":"8","question":"72 ÷ ___ = 9. What number belongs in the blank?","workingSteps":["The missing box is the divisor: divide the dividend by the given quotient","___ = 72 ÷ 9","___ = 8"]}$json$,
 'Mock Programme Increment 004, Batch 001. QT-MR-02 (Missing-Operand Arithmetic), competency MR-01, family mock-mr02-invdiv. One-step inverse-division reasoning: find the missing divisor in a division statement, directly evidenced (CSSE-006 Q2(b)(c)(d), CSSE-016 Q2(c)(d)/Q3(a)(b)). Answer independently recomputed: 72 ÷ 9 = 8, and 72 ÷ 8 = 9 confirms it.', 2, 'mock-mr02-invdiv-01',
 'mock-mr02-invdiv', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Defaulting to multiplying the two given numbers (72 × 9) rather than recognising that the missing box in a "dividend ÷ ___ = quotient" statement is found by dividing the dividend by the quotient.',
 'NEAR_TRANSFER'),

('mock-mr02-invdiv-02', 'maths', 'QT-MR-02', array['csse'], 'easy', 'short-answer', 45,
 $json${"id":"mock-mr02-invdiv-02","marks":1,"skill":"arithmetic","answer":"12","question":"84 ÷ ___ = 7. What number belongs in the blank?","workingSteps":["The missing box is the divisor: divide the dividend by the given quotient","___ = 84 ÷ 7","___ = 12"]}$json$,
 'Mock Programme Increment 004, Batch 001. QT-MR-02, family mock-mr02-invdiv, variant 2 — a genuinely different dividend/quotient pair (84/7), not a relabelled copy of variant 1. Answer independently recomputed: 84 ÷ 7 = 12, and 84 ÷ 12 = 7 confirms it.', 2, 'mock-mr02-invdiv-02',
 'mock-mr02-invdiv', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Defaulting to multiplying the two given numbers (84 × 7) rather than dividing the dividend by the quotient to find the missing divisor.',
 'NEAR_TRANSFER'),

('mock-mr02-invdiv-03', 'maths', 'QT-MR-02', array['csse'], 'easy', 'short-answer', 45,
 $json${"id":"mock-mr02-invdiv-03","marks":1,"skill":"arithmetic","answer":"9","question":"108 ÷ ___ = 12. What number belongs in the blank?","workingSteps":["The missing box is the divisor: divide the dividend by the given quotient","___ = 108 ÷ 12","___ = 9"]}$json$,
 'Mock Programme Increment 004, Batch 001. QT-MR-02, family mock-mr02-invdiv, variant 3 — a third genuinely different dividend/quotient pair (108/12). Answer independently recomputed: 108 ÷ 12 = 9, and 108 ÷ 9 = 12 confirms it.', 2, 'mock-mr02-invdiv-03',
 'mock-mr02-invdiv', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Defaulting to multiplying the two given numbers (108 × 12) rather than dividing the dividend by the quotient to find the missing divisor.',
 'NEAR_TRANSFER')
on conflict (id) do nothing;

-- === mock-mr02-twostep (QT-MR-02, hard — two-step inverse) ============
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-mr02-twostep-01', 'maths', 'QT-MR-02', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mock-mr02-twostep-01","marks":2,"skill":"arithmetic","answer":"7","question":"___ × 7 − 18 = 31. What number belongs in the blank?","workingSteps":["Undo the subtraction first: ___ × 7 = 31 + 18 = 49","Undo the multiplication: ___ = 49 ÷ 7","___ = 7"]}$json$,
 'Mock Programme Increment 004, Batch 001. QT-MR-02, family mock-mr02-twostep — a genuinely different reasoning demand from mock-mr02-invdiv: two inverse operations must be undone in the correct order (subtraction first, then multiplication), not one. Answer independently recomputed: 7 × 7 − 18 = 49 − 18 = 31 confirms it. Numbers deliberately chosen (7×7−18) so the answer (7) does not coincide with any mock-mr02-invdiv answer (8, 12, 9) — a real structural near-duplicate caught and corrected during Batch 001 verification, before authoring finished.', 3, 'mock-mr02-twostep-01',
 'mock-mr02-twostep', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Undoing the two inverse operations in the wrong order — e.g. dividing by 6 before adding back 15, rather than first undoing the subtraction (add 15) and only then undoing the multiplication (divide by 6). Reversing the order in a multi-step inverse produces a different, incorrect value from the same numbers.',
 'FAR_TRANSFER'),

('mock-mr02-twostep-02', 'maths', 'QT-MR-02', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mock-mr02-twostep-02","marks":2,"skill":"arithmetic","answer":"10","question":"___ × 5 + 12 = 62. What number belongs in the blank?","workingSteps":["Undo the addition first: ___ × 5 = 62 − 12 = 50","Undo the multiplication: ___ = 50 ÷ 5","___ = 10"]}$json$,
 'Mock Programme Increment 004, Batch 001. QT-MR-02, family mock-mr02-twostep, variant 2 — addition instead of subtraction as the outer operation, a genuinely different arithmetic structure from variant 1, not a relabelled copy. Answer independently recomputed: 10 × 5 + 12 = 50 + 12 = 62 confirms it.', 3, 'mock-mr02-twostep-02',
 'mock-mr02-twostep', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Undoing the two inverse operations in the wrong order — e.g. dividing by 5 before subtracting 12, rather than first undoing the addition (subtract 12) and only then undoing the multiplication (divide by 5).',
 'FAR_TRANSFER'),

('mock-mr02-twostep-03', 'maths', 'QT-MR-02', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mock-mr02-twostep-03","marks":2,"skill":"arithmetic","answer":"6","question":"___ × 9 − 24 = 30. What number belongs in the blank?","workingSteps":["Undo the subtraction first: ___ × 9 = 30 + 24 = 54","Undo the multiplication: ___ = 54 ÷ 9","___ = 6"]}$json$,
 'Mock Programme Increment 004, Batch 001. QT-MR-02, family mock-mr02-twostep, variant 3 — a third genuinely different set of numbers. Answer independently recomputed: 6 × 9 − 24 = 54 − 24 = 30 confirms it.', 3, 'mock-mr02-twostep-03',
 'mock-mr02-twostep', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Undoing the two inverse operations in the wrong order — e.g. dividing by 9 before adding back 24, rather than first undoing the subtraction and only then undoing the multiplication.',
 'FAR_TRANSFER')
on conflict (id) do nothing;

-- === mock-mr03-unitconv (QT-MR-03, medium — unit conversion + calc) ===
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-mr03-unitconv-01', 'maths', 'QT-MR-03', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mock-mr03-unitconv-01","marks":1,"skill":"measurement","answer":"4.5","question":"A recipe needs 750ml of milk per cake. How many litres of milk are needed for 6 cakes?","workingSteps":["Total milk needed = 750ml × 6 = 4500ml","Convert to litres: 4500ml ÷ 1000 = 4.5 litres"]}$json$,
 'Mock Programme Increment 004, Batch 001. QT-MR-03 (Unit Conversion / Measurement Calculation), competency MR-01/MR-04, family mock-mr03-unitconv. Requires multiplying then converting units, directly evidenced (CSSE-006 Q3, CSSE-011 Q4a, CSSE-016 Q5a — HIGH confidence, EMC-4). Answer independently recomputed: 750 × 6 = 4500ml = 4.5L.', 2, 'mock-mr03-unitconv-01',
 'mock-mr03-unitconv', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Converting the unit at the wrong point in the calculation — e.g. dividing 750ml by 1000 before multiplying by 6, then forgetting the multiplication step entirely, or multiplying by 1000 instead of dividing when converting ml to litres.',
 'NEAR_TRANSFER'),

('mock-mr03-unitconv-02', 'maths', 'QT-MR-03', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mock-mr03-unitconv-02","marks":1,"skill":"measurement","answer":"5.1","question":"A fence is built from 6 identical wooden planks, each 85cm long, placed end to end. What is the total length of the fence, in metres?","workingSteps":["Total length = 85cm × 6 = 510cm","Convert to metres: 510cm ÷ 100 = 5.1 metres"]}$json$,
 'Mock Programme Increment 004, Batch 001. QT-MR-03, family mock-mr03-unitconv, variant 2 — a genuinely different unit pair (cm/m) and surface context (fencing, not liquid volume), not a relabelled copy of variant 1. Answer independently recomputed: 85 × 6 = 510cm = 5.1m.', 2, 'mock-mr03-unitconv-02',
 'mock-mr03-unitconv', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Converting centimetres to metres by dividing by 10 instead of 100, or performing the unit conversion before multiplying by the number of planks and losing track of the running total.',
 'NEAR_TRANSFER'),

('mock-mr03-unitconv-03', 'maths', 'QT-MR-03', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mock-mr03-unitconv-03","marks":1,"skill":"measurement","answer":"3","question":"A box contains 8 identical bags of flour, each weighing 375g. What is the total weight of the box's contents, in kilograms?","workingSteps":["Total weight = 375g × 8 = 3000g","Convert to kilograms: 3000g ÷ 1000 = 3 kilograms"]}$json$,
 'Mock Programme Increment 004, Batch 001. QT-MR-03, family mock-mr03-unitconv, variant 3 — a third genuinely different unit pair (g/kg) and surface context. Answer independently recomputed: 375 × 8 = 3000g = 3kg.', 2, 'mock-mr03-unitconv-03',
 'mock-mr03-unitconv', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Converting grams to kilograms by dividing by 100 instead of 1000, or multiplying the weight by the bag count after converting a single bag''s weight to kilograms first and rounding prematurely.',
 'NEAR_TRANSFER')
on conflict (id) do nothing;

-- === mock-mr09-data (QT-MR-09, 3 distinct sub-structures, not 3 variants
-- of one structure — disclosed as such, see Decision 141) =============
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-mr09-data-01', 'maths', 'QT-MR-09', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mock-mr09-data-01","marks":1,"skill":"data-handling","answer":"13","question":"Four classes took part in a reading challenge. Class A read 24 books, Class B read 31 books, Class C read 18 books, and Class D read 27 books. What is the difference between the number of books read by the class that read the most and the class that read the fewest?","workingSteps":["The class with the most books is Class B, with 31","The class with the fewest books is Class C, with 18","Difference = 31 − 18 = 13"]}$json$,
 'Mock Programme Increment 004, Batch 001. QT-MR-09 (Data Reading), competency MR-01/MR-04, family mock-mr09-data, sub-structure 1 of 3 (extremes-comparison) — requires identifying both the maximum and minimum from a small table before subtracting, directly evidenced (CSSE-006 Q11a, CSSE-011 Q15, CSSE-016 Q10). Answer independently recomputed: max 31 (Class B), min 18 (Class C), 31 − 18 = 13.', 2, 'mock-mr09-data-01',
 'mock-mr09-data', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Subtracting two arbitrary values from the table (e.g. Class A and Class D) rather than first correctly identifying the true maximum and minimum across all four values, or subtracting in the wrong order.',
 'NEAR_TRANSFER'),

('mock-mr09-data-02', 'maths', 'QT-MR-09', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mock-mr09-data-02","marks":1,"skill":"data-handling","answer":"14","question":"The midday temperature was recorded for five days: Monday 14°C, Tuesday 19°C, Wednesday 11°C, Thursday 17°C, Friday 9°C. What was the mean temperature across the five days, in °C?","workingSteps":["Total = 14 + 19 + 11 + 17 + 9 = 70","Mean = 70 ÷ 5 = 14"]}$json$,
 'Mock Programme Increment 004, Batch 001. QT-MR-09, family mock-mr09-data, sub-structure 2 of 3 (mean-calculation) — a genuinely different demand from sub-structure 1: combining every value via a mean rather than comparing two extremes. Answer independently recomputed: 14+19+11+17+9=70, 70÷5=14, an exact integer with no rounding ambiguity.', 2, 'mock-mr09-data-02',
 'mock-mr09-data', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Dividing the sum by the wrong count (e.g. by 4 instead of 5), or omitting one value from the table when totalling before dividing.',
 'NEAR_TRANSFER'),

('mock-mr09-data-03', 'maths', 'QT-MR-09', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mock-mr09-data-03","marks":2,"skill":"data-handling","answer":"628","question":"A school fair sold three types of ticket: Adult tickets at £8 each (45 sold), Child tickets at £5 each (32 sold), and Senior tickets at £6 each (18 sold). How much money in total was raised from ticket sales, in pounds?","workingSteps":["Adult tickets: 8 × 45 = £360","Child tickets: 5 × 32 = £160","Senior tickets: 6 × 18 = £108","Total = 360 + 160 + 108 = £628"]}$json$,
 'Mock Programme Increment 004, Batch 001. QT-MR-09, family mock-mr09-data, sub-structure 3 of 3 (multi-row combination) — a genuinely harder demand than sub-structures 1/2: each row must be independently calculated (price × quantity) before the three totals are combined, rather than a single lookup or a single mean. Answer independently recomputed: 8×45=360, 5×32=160, 6×18=108, 360+160+108=628.', 3, 'mock-mr09-data-03',
 'mock-mr09-data', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Adding the three unit prices together and multiplying by a single combined quantity, rather than calculating each ticket type''s own revenue (price × its own quantity) before summing the three separate totals.',
 'FAR_TRANSFER')
on conflict (id) do nothing;

-- === mock-mr05-forward (QT-MR-05, medium — function machine, forward) ==
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-mr05-forward-01', 'maths', 'QT-MR-05', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mock-mr05-forward-01","marks":1,"skill":"algebra","answer":"25","question":"A function machine multiplies a number by 3, then adds 4. What is the output when the input is 7?","workingSteps":["7 × 3 = 21","21 + 4 = 25"]}$json$,
 'Mock Programme Increment 004, Batch 001. QT-MR-05 (Sequence / Function-Rule Application), competency MR-02, family mock-mr05-forward — forward rule application, directly evidenced (CSSE-006 Q5/Q11/Q15, CSSE-011 Q7/Q8, CSSE-016 Q21, HIGH confidence, EMC-4). Answer independently recomputed: 7×3=21, 21+4=25.', 2, 'mock-mr05-forward-01',
 'mock-mr05-forward', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Applying the two steps in the wrong order (e.g. adding 4 before multiplying by 3), which produces a different, incorrect output for the same input.',
 'ROUTINE'),

('mock-mr05-forward-02', 'maths', 'QT-MR-05', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mock-mr05-forward-02","marks":1,"skill":"algebra","answer":"39","question":"A function machine multiplies a number by 5, then subtracts 6. What is the output when the input is 9?","workingSteps":["9 × 5 = 45","45 − 6 = 39"]}$json$,
 'Mock Programme Increment 004, Batch 001. QT-MR-05, family mock-mr05-forward, variant 2 — a genuinely different rule (×5, −6) and input, not a relabelled copy. Answer independently recomputed: 9×5=45, 45−6=39.', 2, 'mock-mr05-forward-02',
 'mock-mr05-forward', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Applying the two steps in the wrong order (e.g. subtracting 6 before multiplying by 5), which produces a different, incorrect output.',
 'ROUTINE')
on conflict (id) do nothing;

-- === mock-mr05-inverse (QT-MR-05, hard — function machine, inverse) ====
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-mr05-inverse-01', 'maths', 'QT-MR-05', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mock-mr05-inverse-01","marks":2,"skill":"algebra","answer":"9","question":"A function machine multiplies a number by 3, then adds 4. The output is 31. What was the input?","workingSteps":["Undo the addition first: 31 − 4 = 27","Undo the multiplication: 27 ÷ 3 = 9"]}$json$,
 'Mock Programme Increment 004, Batch 001. QT-MR-05, family mock-mr05-inverse — a genuinely different reasoning demand from mock-mr05-forward: the rule must be inverted (steps AND their order both reversed), directly evidenced as a real CSSE sub-format across all three years reviewed, but absent from the current 194-row Practice pool at any difficulty (Decision 138’s own capacity finding). Answer independently recomputed: input 9 → 9×3+4=31, matching the given output.', 3, 'mock-mr05-inverse-01',
 'mock-mr05-inverse', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Applying the forward rule instead of inverting it — e.g. multiplying the output by 3 and adding 4 — or inverting the two operations without also reversing their order, which is the single most common inversion error.',
 'FAR_TRANSFER'),

('mock-mr05-inverse-02', 'maths', 'QT-MR-05', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mock-mr05-inverse-02","marks":2,"skill":"algebra","answer":"12","question":"A function machine multiplies a number by 4, then subtracts 7. The output is 41. What was the input?","workingSteps":["Undo the subtraction first: 41 + 7 = 48","Undo the multiplication: 48 ÷ 4 = 12"]}$json$,
 'Mock Programme Increment 004, Batch 001. QT-MR-05, family mock-mr05-inverse, variant 2 — a genuinely different rule and output from variant 1 (deliberately a different answer, 12 not 9, to avoid any accidental answer-clustering across the family). Answer independently recomputed: input 12 → 12×4−7=41, matching the given output.', 3, 'mock-mr05-inverse-02',
 'mock-mr05-inverse', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Applying the forward rule instead of inverting it, or inverting the two operations without also reversing their order.',
 'FAR_TRANSFER')
on conflict (id) do nothing;

-- === mock-mr13-bestvalue (QT-MR-13, medium — best-value comparison) ====
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-mr13-bestvalue-01', 'maths', 'QT-MR-13', array['csse'], 'medium', 'short-answer', 75,
 $json${"id":"mock-mr13-bestvalue-01","marks":1,"skill":"ratio-and-proportion","answer":"2.10","question":"Juice is sold in two sizes: a 750ml bottle for £1.80, or a 2 litre bottle for £4.20. What is the lower price per litre, in pounds, rounded to 2 decimal places?","workingSteps":["750ml bottle: £1.80 ÷ 0.75 = £2.40 per litre","2 litre bottle: £4.20 ÷ 2 = £2.10 per litre","£2.10 is lower than £2.40"]}$json$,
 'Mock Programme Increment 004, Batch 001. QT-MR-13 (Best-Value / Combinatorial Word Problem), competency MR-04, family mock-mr13-bestvalue — best-value unit-price comparison, directly evidenced (CSSE-006 Q16, CSSE-016 Q6, MEDIUM confidence, EMC-3). The scored answer is the single lower per-unit price (unambiguous, exact-match marking), not a free-text "which size" judgement. Answer independently recomputed: 1.80÷0.75=2.40, 4.20÷2=2.10.', 2, 'mock-mr13-bestvalue-01',
 'mock-mr13-bestvalue', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Comparing the two total prices directly (e.g. £1.80 vs £4.20, concluding the smaller total price is the better value) instead of first converting each to a common per-unit rate.',
 'NEAR_TRANSFER'),

('mock-mr13-bestvalue-02', 'maths', 'QT-MR-13', array['csse'], 'medium', 'short-answer', 75,
 $json${"id":"mock-mr13-bestvalue-02","marks":1,"skill":"ratio-and-proportion","answer":"1.50","question":"Rice is sold in two bags: a 2kg bag for £3.20, or a 5kg bag for £7.50. What is the lower price per kilogram, in pounds, rounded to 2 decimal places?","workingSteps":["2kg bag: £3.20 ÷ 2 = £1.60 per kilogram","5kg bag: £7.50 ÷ 5 = £1.50 per kilogram","£1.50 is lower than £1.60"]}$json$,
 'Mock Programme Increment 004, Batch 001. QT-MR-13, family mock-mr13-bestvalue, variant 2 — a genuinely different product/unit context (rice/kg, not juice/litre) and different numbers, not a relabelled copy of variant 1. Answer independently recomputed: 3.20÷2=1.60, 7.50÷5=1.50.', 2, 'mock-mr13-bestvalue-02',
 'mock-mr13-bestvalue', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Comparing the two total prices directly instead of first converting each to a common per-unit rate, or dividing the smaller quantity by the larger price (inverting the rate calculation).',
 'NEAR_TRANSFER')
on conflict (id) do nothing;

commit;
