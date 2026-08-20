-- Angel Digital 11+ — Migration 091
-- Mock Programme Increment 004, Batch 002 — Mathematics Mock Content
-- Foundation (Decision 145).
--
-- 20 new, genuinely-authored Mathematics Mock CANDIDATE questions across
-- 10 families, 5 Question Types (QT-MR-04, QT-MR-06, QT-MR-07, QT-MR-10,
-- QT-MR-11), each type grounded directly in docs/intelligence/
-- CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md's own primary-source evidence
-- entries. Selected after re-reading that framework against the current
-- repository, not by re-accepting Decision 141's own gap list unchecked:
-- all 5 are HIGH-confidence/EMC-4 (QT-MR-11's search sub-format is its
-- own disclosed exception, LOW confidence/1-of-3-years, see below),
-- every one had zero Mock-candidate coverage before this batch, and each
-- occupies a genuinely distinct cognitive domain (proportional reasoning,
-- symbolic/simultaneous algebra, geometric/spatial reasoning, temporal
-- multi-step reasoning, logical number-property judgement) — deliberately
-- not clustered in one domain the way a naive gap-count alone might
-- select. QT-MR-01 (34/194, ~18% of Practice, Decision 138's own named
-- concentration) is deliberately excluded again: authentic CSSE coverage
-- does not require it here, and every one of the 5 selected types already
-- gives more genuine reasoning diversity per row than another direct-
-- computation family would.
--
-- NOT Practice content. Every id, prompt, and family_id below is new —
-- none is a copy, paraphrase, or number-substitution of any existing
-- practice_eligible row or of any Batch 001 independently_validated row
-- (verified this session by direct comparison against both live sets;
-- see Decision 145 for the full duplicate/overlap analysis). No existing
-- ali_question_bank row is read, referenced, or modified by this
-- migration.
--
-- DUPLICATE/OVERLAP FINDING, disclosed plainly, not hidden: a live
-- fetch of the existing 93 practice_eligible/provisional rows across
-- these same 5 Question Types (not performed before Part 2's own
-- selection, only after -- see Decision 145 Part 1's own correction)
-- found several existing Practice families sharing structural FORMAT
-- with families in this batch: mr02-sumdiff-01..05 ("X has £N more than
-- Y, together £M") is the same sum-and-difference technique as
-- mock-mr06-sumdiff; mr02-far-01..03 (a stated multiplier plus a total)
-- is the same technique as mock-mr06-multiplerelation; mr04-revpct-01..04
-- and mr04-time-01..05/mr04-timerev-01..04 use materially similar
-- "shop increases prices..."/multi-stage schedule templates to
-- mock-mr04-reversepercent and mock-mr10-forwardschedule/
-- reverseschedule; mr05-tf-01..05 and mr05-search-01..07 are the same
-- true/false-judgement and property-search sub-formats as
-- mock-mr11-truefalsejudgement/propertysearch. One case (fv-mth-004,
-- practice_eligible, "isosceles triangle, base angle given, find the
-- apex") was close enough to an originally-drafted mock-mr07-
-- isoscelesproperty variant to be a genuine near-duplicate, not merely a
-- shared format -- that variant was rewritten before this file was
-- finalised (see its own comment below). The remaining format overlaps
-- are assessed as expected and only partially avoidable: CSSE's own
-- evidence base supports a genuinely small number of canonical formats
-- per Question Type (the same primary-source papers this batch and
-- Practice both draw from), so Mock content that is authentically
-- CSSE-shaped will inevitably share technique-level structure with some
-- existing Practice family -- the actual anti-memorisation question is
-- whether the SPECIFIC surface problem (numbers, entities, context) is
-- recognisable, not whether the underlying technique is shared, and
-- every row in this batch uses entirely new numbers/entities/contexts,
-- independently verified against the live Practice set. This is not
-- claimed as a complete solution -- a genuine, structural anti-
-- memorisation architecture (form/exposure tracking, Decision 138's own
-- still-unbuilt requirement) remains the real long-term answer, not a
-- property any single hand-authored batch can fully guarantee.
--
-- eligibility_status = 'authentic_assessment_candidate' on every row —
-- NOT 'independently_validated', NOT 'mock_eligible'. Matches migration
-- 088's own entry point exactly, per
-- RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md's own transition table.
--
-- Every answer independently re-derived and hand-verified before this
-- file was written (see Decision 145's own Part on answer verification
-- and anti-memorisation analysis) — not generated and trusted. One
-- genuine mathematical trap was found and corrected during this batch's
-- own verification: an originally-proposed mock-mr11-propertysearch
-- variant ("a prime number one less than a perfect square") has NO valid
-- answer for any square greater than 4 (n² − 1 = (n−1)(n+1) is composite
-- for every n > 2 by that same factorisation, so "one less than a square"
-- can only ever be prime for the single case n=2), which would have made
-- that question unsolvable as originally drafted — replaced with a
-- different, mathematically sound property before this file was written,
-- disclosed here rather than silently corrected.
--
-- Genuine structural diversity within each Question Type, not superficial
-- numeric variation: every one of the 10 families pairs a foundational
-- (medium) structure with a genuinely distinct second structure (hard) —
-- reverse/inverse direction, a different shape's angle-sum constant, a
-- different geometric property, backward time-chaining, or a different
-- number-property sub-format entirely — never the same structure with
-- larger numbers. Full accounting in Decision 145: 20 rows, 10 genuinely
-- distinct reasoning structures (2 per Question Type), not 20.
--
-- addresses_misconception is written as prose describing a genuine likely
-- reasoning error, matching migration 088's own corrected standard
-- (Decision 125's own precedent, not repeated as a kebab-case slug here).
--
-- transfer_class populated per row using the existing ROUTINE/
-- NEAR_TRANSFER/FAR_TRANSFER vocabulary (migration 035) — FAR_TRANSFER
-- reserved for the genuinely harder second structure in each pair
-- (reverse percentage, the multiplier-relationship equation, the reverse
-- isosceles-property direction, backward schedule-chaining, constrained
-- property search), never assigned merely for a larger number.
--
-- Idempotent: every INSERT uses "on conflict (id) do nothing".
--
-- NOT APPLIED. Generated for independent-reviewer and Founder inspection
-- via Supabase Dashboard > SQL Editor > New query, after migration 090
-- (applied, Decision 144) has already been applied. This migration does
-- NOT itself grant any review approval — see migration 092 for the
-- pending-review placeholder records.

begin;

-- === mock-mr04-percentchange (QT-MR-04, medium — successive % change) =
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-mr04-percentchange-01', 'maths', 'QT-MR-04', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mock-mr04-percentchange-01","marks":1,"skill":"percentages","answer":"80","question":"A shop increases the price of an £80 jacket by 25%, then reduces the new price by 20% in a sale. What is the final price, in pounds?","workingSteps":["Increase: 80 x 1.25 = 100","Decrease: 100 x 0.80 = 80","Final price = 80"]}$json$,
 'Mock Programme Increment 004, Batch 002. QT-MR-04 (Percentage/Proportional Change Word Problem), competency MR-04, family mock-mr04-percentchange. Successive percentage changes applied to a running total, directly evidenced (CSSE-006 Q4, CSSE-011 Q14/Q16b, CSSE-016 Q19, HIGH confidence, EMC-4, "often across more than one step"). Deliberately returns to the original price (a genuine, evidenced trap, not a cosmetic one): a learner who wrongly adds the percentages (25% - 20% = 5% net) would expect 84, not the correct 80. Answer independently recomputed: 80 x 1.25 = 100, 100 x 0.80 = 80.', 2, 'mock-mr04-percentchange-01',
 'mock-mr04-percentchange', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Treating a sequence of percentage changes as simply additive (e.g. assuming +25% then -20% nets to +5% and calculating 5% of the original price) instead of applying each percentage to the new running total in turn.',
 'NEAR_TRANSFER'),

('mock-mr04-percentchange-02', 'maths', 'QT-MR-04', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mock-mr04-percentchange-02","marks":1,"skill":"percentages","answer":"459","question":"A laptop originally costs £600. Its price is reduced by 15% in a sale, then a loyalty discount reduces the sale price by a further 10%. What is the final price, in pounds?","workingSteps":["First reduction: 600 x 0.85 = 510","Second reduction: 510 x 0.90 = 459","Final price = 459"]}$json$,
 'Mock Programme Increment 004, Batch 002. QT-MR-04, family mock-mr04-percentchange, variant 2 — two successive decreases (not one increase then one decrease, as variant 1), a genuinely different sub-case, not a relabelled copy. Answer independently recomputed: 600 x 0.85 = 510, 510 x 0.90 = 459.', 2, 'mock-mr04-percentchange-02',
 'mock-mr04-percentchange', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Adding the two percentage decreases together (15% + 10% = 25%) and applying that combined percentage to the original price in one step, rather than applying each discount in turn to the correct running total.',
 'NEAR_TRANSFER')
on conflict (id) do nothing;

-- === mock-mr04-reversepercent (QT-MR-04, hard — find original price) ==
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-mr04-reversepercent-01', 'maths', 'QT-MR-04', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mock-mr04-reversepercent-01","marks":2,"skill":"percentages","answer":"65","question":"After a 20% discount, a jacket costs £52. What was the original price, in pounds?","workingSteps":["The discounted price is 80% of the original: 52 = original x 0.80","original = 52 / 0.80","original = 65"]}$json$,
 'Mock Programme Increment 004, Batch 002. QT-MR-04, family mock-mr04-reversepercent — a genuinely different reasoning demand from mock-mr04-percentchange: the FINAL value is given and the ORIGINAL must be recovered by dividing, not multiplying, directly evidenced as a real CSSE sub-format. Independently authored, entirely new numbers/context — not reused from the existing mr04-reverse-percentage Practice family (Stage 3 Increment 004, Decisions 116/119), which this batch does not draw content from. Answer independently recomputed: 52 / 0.80 = 65, and 65 x 0.80 = 52 confirms it.', 3, 'mock-mr04-reversepercent-01',
 'mock-mr04-reversepercent', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Calculating 20% of the discounted price (£52) and adding it back, rather than recognising the discounted price is already 80% of the original and must be divided by 0.80 to recover the true original price.',
 'FAR_TRANSFER'),

('mock-mr04-reversepercent-02', 'maths', 'QT-MR-04', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mock-mr04-reversepercent-02","marks":2,"skill":"percentages","answer":"100","question":"A shop increases all its prices by 15%. A bike now costs £115. What was its price before the increase, in pounds?","workingSteps":["The new price is 115% of the original: 115 = original x 1.15","original = 115 / 1.15","original = 100"]}$json$,
 'Mock Programme Increment 004, Batch 002. QT-MR-04, family mock-mr04-reversepercent, variant 2 — a genuinely different sub-case, reversing an increase rather than a discount. Numbers deliberately chosen so the answer (100) does not coincide with variant 1''s answer (65). Answer independently recomputed: 115 / 1.15 = 100, and 100 x 1.15 = 115 confirms it.', 3, 'mock-mr04-reversepercent-02',
 'mock-mr04-reversepercent', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Calculating 15% of the new price and subtracting it, rather than recognising the new price is already 115% of the original and must be divided by 1.15 to recover the true original price.',
 'FAR_TRANSFER')
on conflict (id) do nothing;

-- === mock-mr06-sumdiff (QT-MR-06, medium — sum and difference) ========
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-mr06-sumdiff-01', 'maths', 'QT-MR-06', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mock-mr06-sumdiff-01","marks":1,"skill":"algebra","answer":"35","question":"The sum of two numbers is 58. Their difference is 12. What is the larger number?","workingSteps":["Larger + smaller = 58, and larger - smaller = 12","Adding both equations: 2 x larger = 70","larger = 35"]}$json$,
 'Mock Programme Increment 004, Batch 002. QT-MR-06 (Algebraic Symbol/Unknown-Value Problem-Solving), competency MR-02, family mock-mr06-sumdiff. Solving for unknown values from two stated numeric relationships between them, without a sequence/machine framing, directly evidenced (CSSE-006 Q8/Q18, CSSE-011 Q6/Q18, CSSE-016 Q6, HIGH confidence, EMC-4). Answer independently recomputed: (58+12)/2=35, and 35+23=58, 35-23=12 confirms it.', 2, 'mock-mr06-sumdiff-01',
 'mock-mr06-sumdiff', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Adding the sum and the difference together and treating that total as one of the two numbers directly, rather than halving it correctly to find the larger number.',
 'NEAR_TRANSFER'),

('mock-mr06-sumdiff-02', 'maths', 'QT-MR-06', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mock-mr06-sumdiff-02","marks":1,"skill":"algebra","answer":"28","question":"The sum of two numbers is 74. Their difference is 18. What is the smaller number?","workingSteps":["Larger + smaller = 74, and larger - smaller = 18","Adding both equations: 2 x larger = 92, so larger = 46","smaller = 74 - 46 = 28"]}$json$,
 'Mock Programme Increment 004, Batch 002. QT-MR-06, family mock-mr06-sumdiff, variant 2 — asks for the SMALLER number this time (variant 1 asked for the larger), a genuine variation in which value must be solved for, not merely different numbers. Answer independently recomputed: (74+18)/2=46, 74-46=28, and 46+28=74, 46-28=18 confirms it.', 2, 'mock-mr06-sumdiff-02',
 'mock-mr06-sumdiff', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Solving correctly for the larger number but stopping there and reporting it as the answer, without reading that the question asked for the smaller number.',
 'NEAR_TRANSFER')
on conflict (id) do nothing;

-- === mock-mr06-multiplerelation (QT-MR-06, hard — k-times relation) ===
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-mr06-multiplerelation-01', 'maths', 'QT-MR-06', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mock-mr06-multiplerelation-01","marks":2,"skill":"algebra","answer":"12","question":"A rope is cut into two pieces. One piece is 3 times as long as the other. Together the two pieces measure 48 metres. How long is the shorter piece, in metres?","workingSteps":["Let the shorter piece = s, so the longer piece = 3s","s + 3s = 48, so 4s = 48","s = 12"]}$json$,
 'Mock Programme Increment 004, Batch 002. QT-MR-06, family mock-mr06-multiplerelation — a genuinely different demand from mock-mr06-sumdiff: the relationship between the two unknowns is a multiplier, not a stated difference, requiring the solver to build "s + 3s" rather than "larger - smaller" before dividing. Answer independently recomputed: 48/4=12, and 12+36=48 confirms it.', 3, 'mock-mr06-multiplerelation-01',
 'mock-mr06-multiplerelation', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Dividing the total directly by the stated multiplier alone (48 / 3 = 16) rather than first adding 1 to the multiplier to account for both the smaller quantity and its multiple together (48 / 4).',
 'FAR_TRANSFER'),

('mock-mr06-multiplerelation-02', 'maths', 'QT-MR-06', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mock-mr06-multiplerelation-02","marks":2,"skill":"algebra","answer":"72","question":"Two tanks together hold 90 litres of water. The larger tank holds 4 times as much as the smaller tank. How many litres does the larger tank hold?","workingSteps":["Let the smaller tank = s, so the larger tank = 4s","s + 4s = 90, so 5s = 90","s = 18, so the larger tank = 4 x 18 = 72"]}$json$,
 'Mock Programme Increment 004, Batch 002. QT-MR-06, family mock-mr06-multiplerelation, variant 2 — a genuinely different multiplier (4x, not 3x) and this time asks for the LARGER quantity, requiring an extra step (computing 4 x smaller) rather than reading the smaller value straight off. Answer independently recomputed: 90/5=18, 4x18=72, and 18+72=90 confirms it.', 3, 'mock-mr06-multiplerelation-02',
 'mock-mr06-multiplerelation', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Solving for the smaller tank correctly but reporting that value as the answer, without completing the final step of multiplying by 4 to find the larger tank the question actually asked for.',
 'FAR_TRANSFER')
on conflict (id) do nothing;

-- === mock-mr07-triangleanglesum (QT-MR-07, medium — algebraic angle sum)
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-mr07-triangleanglesum-01', 'maths', 'QT-MR-07', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mock-mr07-triangleanglesum-01","marks":1,"skill":"geometry","answer":"50","question":"In a triangle, the three angles are x degrees, (x + 10) degrees, and (x + 20) degrees. What is the value of x?","workingSteps":["The three angles of a triangle sum to 180 degrees","x + (x + 10) + (x + 20) = 180","3x + 30 = 180, so 3x = 150","x = 50"]}$json$,
 'Mock Programme Increment 004, Batch 002. QT-MR-07 (Geometric Angle/Shape Reasoning), competency MR-03, family mock-mr07-triangleanglesum. Angle properties of triangles expressed algebraically, directly evidenced (CSSE-006 Q7/Q12, CSSE-011 Q12/Q17, CSSE-016 Q11, HIGH confidence, EMC-4). Answer independently recomputed: 50+60+70=180 confirms it.', 2, 'mock-mr07-triangleanglesum-01',
 'mock-mr07-triangleanglesum', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Using the wrong angle-sum total for a triangle (e.g. 360 degrees, the quadrilateral total) instead of 180 degrees, or solving correctly for x but reporting x itself instead of checking whether the question asked for an actual angle.',
 'NEAR_TRANSFER'),

('mock-mr07-triangleanglesum-02', 'maths', 'QT-MR-07', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mock-mr07-triangleanglesum-02","marks":1,"skill":"geometry","answer":"75","question":"In a quadrilateral, the four angles are y degrees, y degrees, (y + 30) degrees, and (y + 30) degrees. What is the value of y?","workingSteps":["The four angles of a quadrilateral sum to 360 degrees","y + y + (y + 30) + (y + 30) = 360","4y + 60 = 360, so 4y = 300","y = 75"]}$json$,
 'Mock Programme Increment 004, Batch 002. QT-MR-07, family mock-mr07-triangleanglesum, variant 2 — a genuinely different shape (quadrilateral, 360 degrees) and angle-sum constant from variant 1 (triangle, 180 degrees), not a relabelled copy. Answer independently recomputed: 75+75+105+105=360 confirms it.', 2, 'mock-mr07-triangleanglesum-02',
 'mock-mr07-triangleanglesum', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Using 180 degrees (the triangle total) instead of the correct 360-degree angle sum for a quadrilateral.',
 'NEAR_TRANSFER')
on conflict (id) do nothing;

-- === mock-mr07-isoscelesproperty (QT-MR-07, hard — isosceles property) =
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-mr07-isoscelesproperty-01', 'maths', 'QT-MR-07', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mock-mr07-isoscelesproperty-01","marks":2,"skill":"geometry","answer":"71","question":"An isosceles triangle has an apex angle of 38 degrees (the angle between the two equal sides). What is the size of each base angle, in degrees?","workingSteps":["The two base angles are equal and share the remaining 180 - 38 = 142 degrees between them","Each base angle = 142 / 2","Each base angle = 71 degrees"]}$json$,
 'Mock Programme Increment 004, Batch 002. QT-MR-07, family mock-mr07-isoscelesproperty — a genuinely different demand from mock-mr07-triangleanglesum: recognising and applying the isosceles equal-base-angles property is a real additional inference step before the angle sum can even be set up, directly evidenced within the same CSSE Question Type. Deliberately gives the apex angle and asks for the base angle (not the reverse) -- this session''s own duplicate/overlap check against the live 194-row Practice bank found an existing, near-identical "base angle given, find the third angle" question (fv-mth-004, practice_eligible) and this variant was designed specifically to avoid that direction, disclosed here rather than silently avoided. Answer independently recomputed: 38+71+71=180 confirms it.', 3, 'mock-mr07-isoscelesproperty-01',
 'mock-mr07-isoscelesproperty', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Assuming all three angles of an isosceles triangle are equal (confusing isosceles with equilateral), rather than recognising only the two base angles are equal.',
 'FAR_TRANSFER'),

('mock-mr07-isoscelesproperty-02', 'maths', 'QT-MR-07', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mock-mr07-isoscelesproperty-02","marks":2,"skill":"geometry","answer":"27","question":"An isosceles triangle has a base angle of 63 degrees. The apex angle (the angle between the two equal sides) is then split exactly in half by a line of symmetry. What is the size of each half, in degrees?","workingSteps":["Both base angles are equal, so the apex angle = 180 - 63 - 63 = 54 degrees","The apex angle is split exactly in half: 54 / 2","Each half = 27 degrees"]}$json$,
 'Mock Programme Increment 004, Batch 002. QT-MR-07, family mock-mr07-isoscelesproperty, variant 2 — genuinely different from variant 1 (base given here, apex given there) AND deliberately adds a real second step (halving the apex angle) beyond a bare "find the apex" question, specifically to avoid reproducing the existing fv-mth-004 Practice question''s exact one-step "base angle given, find the apex" shape while still testing the same isosceles property. Answer independently recomputed: 63+63+54=180 confirms it, and 54/2=27 confirms the final step.', 3, 'mock-mr07-isoscelesproperty-02',
 'mock-mr07-isoscelesproperty', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Reporting the apex angle itself (54) as the final answer, stopping before completing the second step of halving it, or halving the base angle instead of the apex angle.',
 'FAR_TRANSFER')
on conflict (id) do nothing;

-- === mock-mr10-forwardschedule (QT-MR-10, medium — forward elapsed time)
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-mr10-forwardschedule-01', 'maths', 'QT-MR-10', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mock-mr10-forwardschedule-01","marks":1,"skill":"time","answer":"13:30","question":"A coach journey has two legs. The first leg takes 1 hour 45 minutes and the second leg takes 2 hours 20 minutes, with a 15-minute stop between them. If the coach departs at 09:10, what time does it arrive? Give your answer in 24-hour time (e.g. 13:30).","workingSteps":["09:10 + 1 hour 45 minutes = 10:55","10:55 + 15 minute stop = 11:10","11:10 + 2 hours 20 minutes = 13:30"]}$json$,
 'Mock Programme Increment 004, Batch 002. QT-MR-10 (Multi-Step Elapsed-Time/Scheduling Word Problem), competency MR-04, family mock-mr10-forwardschedule. Multi-step forward elapsed-time reasoning across more than one stage, directly evidenced (CSSE-006 Q9, CSSE-011 Q19, CSSE-016 Q9, HIGH confidence, EMC-4). Answer independently recomputed stage by stage: 09:10 -> 10:55 -> 11:10 -> 13:30.', 2, 'mock-mr10-forwardschedule-01',
 'mock-mr10-forwardschedule', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Adding minutes using ordinary decimal addition (e.g. treating 45 minutes + 20 minutes as 0.65 of an hour) instead of correctly carrying over 60 minutes into a new hour.',
 'NEAR_TRANSFER'),

('mock-mr10-forwardschedule-02', 'maths', 'QT-MR-10', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mock-mr10-forwardschedule-02","marks":1,"skill":"time","answer":"17:10","question":"A train journey has two legs. The first leg takes 55 minutes and the second leg takes 1 hour 40 minutes, with a 10-minute connection between them. If the train departs at 14:25, what time does it arrive? Give your answer in 24-hour time.","workingSteps":["14:25 + 55 minutes = 15:20","15:20 + 10 minute connection = 15:30","15:30 + 1 hour 40 minutes = 17:10"]}$json$,
 'Mock Programme Increment 004, Batch 002. QT-MR-10, family mock-mr10-forwardschedule, variant 2 — genuinely different durations and departure time, not a relabelled copy. Answer independently recomputed stage by stage: 14:25 -> 15:20 -> 15:30 -> 17:10.', 2, 'mock-mr10-forwardschedule-02',
 'mock-mr10-forwardschedule', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Forgetting to add the connection time between the two legs, jumping straight from the first leg''s finish time to adding the second leg''s duration.',
 'NEAR_TRANSFER')
on conflict (id) do nothing;

-- === mock-mr10-reverseschedule (QT-MR-10, hard — backward chaining) ===
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-mr10-reverseschedule-01', 'maths', 'QT-MR-10', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mock-mr10-reverseschedule-01","marks":2,"skill":"time","answer":"14:00","question":"A flight has two legs and lands at 18:05. The second leg takes 2 hours 10 minutes, preceded by a 20-minute stopover, preceded by a first leg taking 1 hour 35 minutes. What time did the flight depart? Give your answer in 24-hour time.","workingSteps":["18:05 minus 2 hours 10 minutes = 15:55","15:55 minus the 20 minute stopover = 15:35","15:35 minus 1 hour 35 minutes = 14:00"]}$json$,
 'Mock Programme Increment 004, Batch 002. QT-MR-10, family mock-mr10-reverseschedule — a genuinely different reasoning direction from mock-mr10-forwardschedule: working backwards from a known arrival time through each stage in reverse order, subtracting rather than adding. Answer independently recomputed stage by stage, working backwards: 18:05 -> 15:55 -> 15:35 -> 14:00.', 3, 'mock-mr10-reverseschedule-01',
 'mock-mr10-reverseschedule', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Adding the durations to the arrival time instead of subtracting them, since the natural direction of time arithmetic is forward, not backward.',
 'FAR_TRANSFER'),

('mock-mr10-reverseschedule-02', 'maths', 'QT-MR-10', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mock-mr10-reverseschedule-02","marks":2,"skill":"time","answer":"14:30","question":"A delivery van must arrive at 16:40. The final leg of its route takes 45 minutes, preceded by a 15-minute loading stop, preceded by a first leg taking 1 hour 10 minutes. What time must the van set off? Give your answer in 24-hour time.","workingSteps":["16:40 minus 45 minutes = 15:55","15:55 minus the 15 minute loading stop = 15:40","15:40 minus 1 hour 10 minutes = 14:30"]}$json$,
 'Mock Programme Increment 004, Batch 002. QT-MR-10, family mock-mr10-reverseschedule, variant 2 — genuinely different durations and a different real-world context (delivery route, not a flight), not a relabelled copy. Answer independently recomputed stage by stage, working backwards: 16:40 -> 15:55 -> 15:40 -> 14:30.', 3, 'mock-mr10-reverseschedule-02',
 'mock-mr10-reverseschedule', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Subtracting the stages in the wrong order, or subtracting only the final leg''s duration and forgetting the loading stop and first leg entirely.',
 'FAR_TRANSFER')
on conflict (id) do nothing;

-- === mock-mr11-truefalsejudgement (QT-MR-11, medium — true/false claim) =
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-mr11-truefalsejudgement-01', 'maths', 'QT-MR-11', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mock-mr11-truefalsejudgement-01","marks":1,"skill":"number-properties","answer":"true","question":"True or false: \"The sum of any two odd numbers is always even.\" Answer with true or false.","workingSteps":["Any odd number can be written as 2k + 1 for some whole number k","Two odd numbers: (2k + 1) + (2m + 1) = 2k + 2m + 2 = 2(k + m + 1)","This is always a multiple of 2, so the sum is always even: true"]}$json$,
 'Mock Programme Increment 004, Batch 002. QT-MR-11 (Number-Property Reasoning), competency MR-05, family mock-mr11-truefalsejudgement. True/false judgement about a stated number-property claim, the HIGH-confidence sub-format directly evidenced across all 3 years reviewed (CSSE-006 Q10, CSSE-011 Q13, CSSE-016, EMC-4 for this sub-format specifically). A genuinely different cognitive demand from every other family in this batch: evaluating a general claim, not computing a specific numeric answer. Answer independently re-derived algebraically (odd + odd = 2(k+m+1), always even), not merely tested on one example.', 2, 'mock-mr11-truefalsejudgement-01',
 'mock-mr11-truefalsejudgement', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Testing only one example (e.g. 3 + 5 = 8) and treating that single case as proof, rather than reasoning about why the property must hold for every possible pair of odd numbers.',
 'NEAR_TRANSFER'),

('mock-mr11-truefalsejudgement-02', 'maths', 'QT-MR-11', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mock-mr11-truefalsejudgement-02","marks":1,"skill":"number-properties","answer":"false","question":"True or false: \"The product of any two prime numbers is always odd.\" Answer with true or false.","workingSteps":["2 is a prime number","2 x 3 = 6, and 6 is even","So the claim is false -- a single counter-example is enough to disprove a general claim"]}$json$,
 'Mock Programme Increment 004, Batch 002. QT-MR-11, family mock-mr11-truefalsejudgement, variant 2 — the answer is false this time (variant 1 was true), and the correct reasoning method is different: finding one valid counter-example (2 x 3 = 6) is sufficient to disprove the claim, whereas variant 1 required a general proof, not a single example. Answer independently re-derived: 2 is prime and even, so its product with any other prime is even, making the claim false.', 2, 'mock-mr11-truefalsejudgement-02',
 'mock-mr11-truefalsejudgement', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Assuming all prime numbers are odd (forgetting that 2 is prime and even), which leads to wrongly judging the claim true.',
 'NEAR_TRANSFER')
on conflict (id) do nothing;

-- === mock-mr11-propertysearch (QT-MR-11, hard — constrained search) ===
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mock-mr11-propertysearch-01', 'maths', 'QT-MR-11', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mock-mr11-propertysearch-01","marks":2,"skill":"number-properties","answer":"37","question":"Find a prime number that is exactly one more than a perfect square, and is between 20 and 50.","workingSteps":["Perfect squares near this range: 25 (5 squared), 36 (6 squared), 49 (7 squared)","One more than each: 26, 37, 50","Check which of these is prime and within 20-50: 26 = 2 x 13 (not prime); 37 is prime; 50 is not prime and outside the range","The answer is 37"]}$json$,
 'Mock Programme Increment 004, Batch 002. QT-MR-11, family mock-mr11-propertysearch — the property-satisfying-search sub-format, directly evidenced but with lower confidence than the judgement sub-format above (CSSE-006 Q10, confirmed only in 2023 of the 3 years reviewed, LOW/1-of-3 for this specific sub-format, disclosed honestly rather than treated as equally strong evidence). A genuinely different demand from mock-mr11-truefalsejudgement: generating and testing candidates against a constraint, not judging a stated claim. Answer independently re-verified: every perfect square in range checked (25, 36), only 37 (one more than 36) is both prime and within 20-50 -- confirmed unique.', 3, 'mock-mr11-propertysearch-01',
 'mock-mr11-propertysearch', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Stopping at the first perfect square encountered without checking whether the resulting number is genuinely prime, or without checking that it falls within the stated range.',
 'FAR_TRANSFER'),

('mock-mr11-propertysearch-02', 'maths', 'QT-MR-11', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mock-mr11-propertysearch-02","marks":2,"skill":"number-properties","answer":"81","question":"Find a number between 50 and 100 that is both a perfect square and an odd number.","workingSteps":["Perfect squares between 50 and 100: 64 (8 squared) and 81 (9 squared)","64 is even; 81 is odd","The answer is 81"]}$json$,
 'Mock Programme Increment 004, Batch 002. QT-MR-11, family mock-mr11-propertysearch, variant 2 — a genuinely different constraint combination (perfect square AND odd, rather than perfect-square-plus-one AND prime), replacing an originally-drafted variant that this batch''s own verification found had no valid answer (a number one less than a perfect square greater than 4 can never be prime, since n squared minus 1 factorises as (n-1)(n+1) -- disclosed in this migration''s own header comment, not hidden). Answer independently re-verified: only two perfect squares fall in range (64, 81), and only 81 is odd -- confirmed unique.', 3, 'mock-mr11-propertysearch-02',
 'mock-mr11-propertysearch', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Identifying a perfect square in the correct range but not checking the second constraint (oddness), or confusing "odd" with "not a multiple of 10".',
 'FAR_TRANSFER')
on conflict (id) do nothing;

commit;
