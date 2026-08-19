-- Angel Digital 11+ — Migration 081
-- Stage 3, Increment 006 — Mathematics Structural Depth Expansion.
--
-- 8 new Mathematics questions across 2 new families
-- (mr01-reverse-mean, mr03-coord-combined), targeting the 2 skills
-- Decision 121's discovery pass found genuine, repository-supported
-- content-depth gaps for: QT-MR-12 and QT-MR-08. QT-MR-02 and QT-RC-07
-- are explicitly out of scope for this increment (Decision 121: QT-MR-02
-- classified C, should not receive artificial difficulty progression;
-- QT-RC-07 deferred to a separate English-focused increment).
--
-- Direct re-inspection of every existing question for both skills (not
-- counts alone, re-confirmed live before this file was written) found:
--   - QT-MR-12 (mr01-average-mean, 4 rows): every sibling is the
--     identical "sum the values, divide by the count" forward-only
--     structure. CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md's own
--     Measurement Purpose for QT-MR-12 already names an inverse form
--     ("reconstruct a missing value... from a stated mean") that has
--     never been authored.
--   - QT-MR-08 (mr03-coordinate, 3 rows): 3 genuinely distinct single
--     transformations, no repeated structure, but no sibling combines
--     two transformations in a stated order.
--
-- Each new family adds exactly ONE genuinely new reasoning structure at
-- "hard" difficulty, never "hard" merely via larger numbers -- magnitudes
-- are deliberately kept comparable to the existing medium-tier siblings;
-- see scripts/generate-inc006-structural-depth-batch.mjs's own header
-- comment for the full per-family rationale.
--
-- Every answer independently recomputed from first principles before
-- this file was generated (scripts/generate-inc006-structural-depth-
-- batch.mjs's own verify(), including a structural near-duplicate guard
-- and an order/axis-variety guard for mr03-coord-combined). All 8 rows
-- inserted as eligibility_status = 'provisional' -- NOT made
-- practice-eligible by this migration. Per this project's own standing
-- review discipline (ANGEL_EDUCATIONAL_REVIEW_OPERATING_MODEL_V1.md),
-- activation requires a separate, later, genuinely-reviewed activation
-- migration, not bypassed merely because this increment is
-- Founder-authorised.
--
-- Idempotent: every INSERT uses "on conflict (id) do nothing".
--
-- NOT APPLIED by this increment. Generated for Founder/reviewer
-- application via Supabase Dashboard > SQL Editor > New query.

begin;

-- === mr01-reverse-mean (QT-MR-12, competency MR-01) ===================
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr01-revmean-01', 'maths', 'QT-MR-12', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr01-revmean-01","marks":2,"skill":"number-properties","answer":"21","question":"A player's mean score across five games was 18. Four of the scores were 15, 20, 12, 22. What was the fifth score?","workingSteps":["The total for all five games is 18 × 5 = 90","The four known scores add up to 15 + 20 + 12 + 22 = 69","The fifth score is 90 − 69 = 21"]}$json$,
 'Stage 3, Increment 006. Assessment Brain QT-MR-12, competency MR-01. Question family: mr01-reverse-mean. Reverse/missing-value mean reasoning -- the existing mr01-average-mean family only ever gives all the values and asks for the mean; this requires recovering the total from the mean first. Answer independently recomputed, see scripts/generate-inc006-structural-depth-batch.mjs.',
 2, 'mr01-revmean-01',
 'mr01-reverse-mean', 'angel_original', 'provisional', 1, true, 'treating-the-mean-as-the-total-instead-of-multiplying-by-the-count-first',
 'FAR_TRANSFER')
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr01-revmean-02', 'maths', 'QT-MR-12', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr01-revmean-02","marks":2,"skill":"number-properties","answer":"18°C","question":"Over four days, the mean temperature was 17°C. Three of the daily temperatures were 15°C, 21°C, 14°C. What was the fourth day's temperature?","workingSteps":["The total for all four days is 17 × 4 = 68","The three known temperatures add up to 15 + 21 + 14 = 50","The fourth day's temperature is 68 − 50 = 18°C"]}$json$,
 'Stage 3, Increment 006. Assessment Brain QT-MR-12, competency MR-01. Question family: mr01-reverse-mean. Reverse/missing-value mean reasoning, second surface-varied sibling. Answer independently recomputed, see scripts/generate-inc006-structural-depth-batch.mjs.',
 2, 'mr01-revmean-02',
 'mr01-reverse-mean', 'angel_original', 'provisional', 1, true, 'treating-the-mean-as-the-total-instead-of-multiplying-by-the-count-first',
 'FAR_TRANSFER')
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr01-revmean-03', 'maths', 'QT-MR-12', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr01-revmean-03","marks":2,"skill":"number-properties","answer":"£17","question":"Over five weeks, Maya's mean savings was £14. Four of the weekly amounts were £10, £18, £9, £16. How much did she save in the remaining week?","workingSteps":["The total saved over all five weeks is £14 × 5 = £70","The four known weeks add up to £10 + £18 + £9 + £16 = £53","The remaining week is £70 − £53 = £17"]}$json$,
 'Stage 3, Increment 006. Assessment Brain QT-MR-12, competency MR-01. Question family: mr01-reverse-mean. Reverse/missing-value mean reasoning, third surface-varied sibling. Answer independently recomputed, see scripts/generate-inc006-structural-depth-batch.mjs.',
 2, 'mr01-revmean-03',
 'mr01-reverse-mean', 'angel_original', 'provisional', 1, true, 'treating-the-mean-as-the-total-instead-of-multiplying-by-the-count-first',
 'FAR_TRANSFER')
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr01-revmean-04', 'maths', 'QT-MR-12', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr01-revmean-04","marks":2,"skill":"number-properties","answer":"10km","question":"A runner's mean distance over four days was 8km. Three of the distances were 6km, 9km, 7km. What was the fourth day's distance?","workingSteps":["The total distance over all four days is 8 × 4 = 32km","The three known distances add up to 6 + 9 + 7 = 22km","The fourth day's distance is 32 − 22 = 10km"]}$json$,
 'Stage 3, Increment 006. Assessment Brain QT-MR-12, competency MR-01. Question family: mr01-reverse-mean. Reverse/missing-value mean reasoning, fourth surface-varied sibling. Answer independently recomputed, see scripts/generate-inc006-structural-depth-batch.mjs.',
 2, 'mr01-revmean-04',
 'mr01-reverse-mean', 'angel_original', 'provisional', 1, true, 'treating-the-mean-as-the-total-instead-of-multiplying-by-the-count-first',
 'FAR_TRANSFER')
on conflict (id) do nothing;

-- === mr03-coord-combined (QT-MR-08, competency MR-03) ==================
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr03-combo-01', 'maths', 'QT-MR-08', array['csse'], 'hard', 'short-answer', 100,
 $json${"id":"mr03-combo-01","marks":2,"skill":"geometry","answer":"(5, -6)","question":"Point A is at (2, 5). It is first reflected in the x-axis, then translated 3 units right and 1 unit down. What are the final coordinates?","workingSteps":["Reflect in the x-axis first: (2, 5) becomes (2, -5)","Then translate 3 right and 1 down: (2 + 3, -5 - 1) = (5, -6)"]}$json$,
 'Stage 3, Increment 006. Assessment Brain QT-MR-08, competency MR-03. Question family: mr03-coord-combined. Combined/sequential transformation reasoning -- the existing mr03-coordinate family only ever applies one transformation; this requires tracking an intermediate coordinate through two dependent operations in a stated order, where the operations genuinely do not commute. Answer independently recomputed, see scripts/generate-inc006-structural-depth-batch.mjs.',
 2, 'mr03-combo-01',
 'mr03-coord-combined', 'angel_original', 'provisional', 1, true, 'applying-the-two-transformations-in-the-wrong-order-or-only-applying-one-of-them',
 'FAR_TRANSFER')
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr03-combo-02', 'maths', 'QT-MR-08', array['csse'], 'hard', 'short-answer', 100,
 $json${"id":"mr03-combo-02","marks":2,"skill":"geometry","answer":"(2, 7)","question":"Point B is at (-4, 3). It is first reflected in the y-axis, then translated 2 units left and 4 units up. What are the final coordinates?","workingSteps":["Reflect in the y-axis first: (-4, 3) becomes (4, 3)","Then translate 2 left and 4 up: (4 - 2, 3 + 4) = (2, 7)"]}$json$,
 'Stage 3, Increment 006. Assessment Brain QT-MR-08, competency MR-03. Question family: mr03-coord-combined. Combined/sequential transformation reasoning, second surface-varied sibling (reflect-y then translate). Answer independently recomputed, see scripts/generate-inc006-structural-depth-batch.mjs.',
 2, 'mr03-combo-02',
 'mr03-coord-combined', 'angel_original', 'provisional', 1, true, 'applying-the-two-transformations-in-the-wrong-order-or-only-applying-one-of-them',
 'FAR_TRANSFER')
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr03-combo-03', 'maths', 'QT-MR-08', array['csse'], 'hard', 'short-answer', 100,
 $json${"id":"mr03-combo-03","marks":2,"skill":"geometry","answer":"(5, -1)","question":"Point C is at (1, -2). It is first translated 4 units right and 3 units up, then reflected in the x-axis. What are the final coordinates?","workingSteps":["Translate first: (1 + 4, -2 + 3) = (5, 1)","Then reflect in the x-axis: (5, 1) becomes (5, -1)"]}$json$,
 'Stage 3, Increment 006. Assessment Brain QT-MR-08, competency MR-03. Question family: mr03-coord-combined. Combined/sequential transformation reasoning, third surface-varied sibling -- reverses the order (translate then reflect) so the family tests both orderings, not just one. Answer independently recomputed, see scripts/generate-inc006-structural-depth-batch.mjs.',
 2, 'mr03-combo-03',
 'mr03-coord-combined', 'angel_original', 'provisional', 1, true, 'applying-the-two-transformations-in-the-wrong-order-or-only-applying-one-of-them',
 'FAR_TRANSFER')
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr03-combo-04', 'maths', 'QT-MR-08', array['csse'], 'hard', 'short-answer', 100,
 $json${"id":"mr03-combo-04","marks":2,"skill":"geometry","answer":"(1, 1)","question":"Point D is at (-3, -5). It is first translated 2 units right and 6 units up, then reflected in the y-axis. What are the final coordinates?","workingSteps":["Translate first: (-3 + 2, -5 + 6) = (-1, 1)","Then reflect in the y-axis: (-1, 1) becomes (1, 1)"]}$json$,
 'Stage 3, Increment 006. Assessment Brain QT-MR-08, competency MR-03. Question family: mr03-coord-combined. Combined/sequential transformation reasoning, fourth surface-varied sibling (translate then reflect-y). Answer independently recomputed, see scripts/generate-inc006-structural-depth-batch.mjs.',
 2, 'mr03-combo-04',
 'mr03-coord-combined', 'angel_original', 'provisional', 1, true, 'applying-the-two-transformations-in-the-wrong-order-or-only-applying-one-of-them',
 'FAR_TRANSFER')
on conflict (id) do nothing;

commit;

-- No RLS change: ali_question_bank's existing RLS policy (migration 069)
-- already governs this insert the same way as every prior content
-- migration; no new policy, table, or trigger is created here.
