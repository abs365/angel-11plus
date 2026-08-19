-- Angel Digital 11+ — Migration 078
-- Stage 3, Increment 003 — Mathematics Content Depth and Variation
-- Foundation.
--
-- 11 new Mathematics questions across 3 new families
-- (mr04-reverse-percentage, mr04-time-reverse, mr04-bv-convert), targeting
-- the exact MR-04 concentration Decision 115 identified: QT-MR-04,
-- QT-MR-10, and QT-MR-13 were confirmed (live query, before this file was
-- generated) to be single-valued at "medium" difficulty across every
-- practice-eligible row -- meaning Increment 002's own difficulty-
-- escalation weighting could never activate for any of the three, not
-- because of a code limitation, but for lack of a harder alternative.
--
-- Direct inspection of every existing question for these three skills
-- (not counts alone) found QT-MR-10's one named family
-- (mr04-elapsed-time, 5 siblings) structurally identical across every
-- sibling -- "start + stage + break + stage = finish", numbers/context
-- substituted only, with no reverse-direction structure. QT-MR-04 and
-- QT-MR-13 each already had two genuine structures but no reverse/
-- missing-value or unit-conversion structure respectively. Each new
-- family below adds exactly ONE genuinely new reasoning structure at
-- "hard" difficulty, never "hard" merely via larger numbers -- see
-- scripts/generate-mr04-depth-batch.mjs's own header comment for the
-- full per-family rationale and the disclosed genuine-structure-vs-
-- surface-variation distinction.
--
-- Every answer independently recomputed from first principles before
-- this file was generated (scripts/generate-mr04-depth-batch.mjs's own
-- verify(), including a structural near-duplicate guard and an
-- anti-memorisation check that mr04-bv-convert's answers are not all the
-- same letter). All 11 rows inserted as eligibility_status =
-- 'provisional' -- NOT made practice-eligible by this migration. Per this
-- project's own standing review discipline
-- (ANGEL_EDUCATIONAL_REVIEW_OPERATING_MODEL_V1.md), activation requires a
-- separate, later, genuinely-reviewed activation migration, not bypassed
-- merely because this increment is Founder-authorised.
--
-- Idempotent: every INSERT uses "on conflict (id) do nothing".
--
-- NOT APPLIED by this increment. Generated for Founder/reviewer
-- application via Supabase Dashboard > SQL Editor > New query.

begin;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values

-- === mr04-reverse-percentage (QT-MR-04, competency MR-04) ===========
('mr04-revpct-01', 'maths', 'QT-MR-04', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr04-revpct-01","marks":2,"skill":"arithmetic","answer":"£80","question":"A shop increases every price by 20%. After the increase, a jacket costs £96. What was the price before the increase?","workingSteps":["The new price, £96, represents 120% of the original price (100% + 20% increase)","£96 ÷ 1.20 = £80"]}$json$,
 'Stage 3, Increment 003. Assessment Brain QT-MR-04, competency MR-04. Question family: mr04-reverse-percentage. Reverse/missing-value percentage reasoning -- the existing QT-MR-04 content only ever gives the original value and asks for the result; this inverts the direction. Answer independently recomputed, see scripts/generate-mr04-depth-batch.mjs.',
 2, 'mr04-revpct-01',
 'mr04-reverse-percentage', 'angel_original', 'provisional', 1, true, 'applying-the-percentage-to-the-new-value-instead-of-dividing-to-undo-it',
 'FAR_TRANSFER')
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr04-revpct-02', 'maths', 'QT-MR-04', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr04-revpct-02","marks":2,"skill":"arithmetic","answer":"£800","question":"A company decreases every salary by 15%. After the decrease, an employee earns £680 per month. What was the salary before the decrease?","workingSteps":["The new salary, £680, represents 85% of the original salary (100% − 15% decrease)","£680 ÷ 0.85 = £800"]}$json$,
 'Stage 3, Increment 003. Assessment Brain QT-MR-04, competency MR-04. Question family: mr04-reverse-percentage. Reverse/missing-value percentage reasoning, decrease direction. Answer independently recomputed, see scripts/generate-mr04-depth-batch.mjs.',
 2, 'mr04-revpct-02',
 'mr04-reverse-percentage', 'angel_original', 'provisional', 1, true, 'applying-the-percentage-to-the-new-value-instead-of-dividing-to-undo-it',
 'FAR_TRANSFER')
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr04-revpct-03', 'maths', 'QT-MR-04', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr04-revpct-03","marks":2,"skill":"arithmetic","answer":"£500","question":"A shop increases every price by 8%. After the increase, a laptop costs £540. What was the price before the increase?","workingSteps":["The new price, £540, represents 108% of the original price (100% + 8% increase)","£540 ÷ 1.08 = £500"]}$json$,
 'Stage 3, Increment 003. Assessment Brain QT-MR-04, competency MR-04. Question family: mr04-reverse-percentage. Reverse/missing-value percentage reasoning, increase direction, second surface-varied sibling. Answer independently recomputed, see scripts/generate-mr04-depth-batch.mjs.',
 2, 'mr04-revpct-03',
 'mr04-reverse-percentage', 'angel_original', 'provisional', 1, true, 'applying-the-percentage-to-the-new-value-instead-of-dividing-to-undo-it',
 'FAR_TRANSFER')
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr04-revpct-04', 'maths', 'QT-MR-04', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr04-revpct-04","marks":2,"skill":"arithmetic","answer":"£900","question":"A charity's donations decreased by 20% this year compared to last year. This year they received £720. How much did they receive last year?","workingSteps":["This year's total, £720, represents 80% of last year's total (100% − 20% decrease)","£720 ÷ 0.80 = £900"]}$json$,
 'Stage 3, Increment 003. Assessment Brain QT-MR-04, competency MR-04. Question family: mr04-reverse-percentage. Reverse/missing-value percentage reasoning, decrease direction, second surface-varied sibling. Answer independently recomputed, see scripts/generate-mr04-depth-batch.mjs.',
 2, 'mr04-revpct-04',
 'mr04-reverse-percentage', 'angel_original', 'provisional', 1, true, 'applying-the-percentage-to-the-new-value-instead-of-dividing-to-undo-it',
 'FAR_TRANSFER')
on conflict (id) do nothing;

-- === mr04-time-reverse (QT-MR-10, competency MR-04) =================
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr04-timerev-01', 'maths', 'QT-MR-10', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr04-timerev-01","marks":2,"skill":"arithmetic","answer":"11:45","question":"A workshop finishes at 13:15. It consisted of a 40 minute session, a 15 minute break, and a 35 minute session, in that order. What time did the workshop start?","workingSteps":["Total time from start to finish: 40 + 15 + 35 = 90 minutes = 1 hour 30 minutes","Subtract this from the finish time: 13:15 − 1:30 = 11:45"]}$json$,
 'Stage 3, Increment 003. Assessment Brain QT-MR-10, competency MR-04. Question family: mr04-time-reverse. Reverse elapsed-time reasoning -- the existing mr04-elapsed-time family (confirmed structurally identical across all 5 siblings by direct inspection) only ever gives the start time and asks for the finish; this subtracts backward through the same multi-stage structure instead. Answer independently recomputed, see scripts/generate-mr04-depth-batch.mjs.',
 2, 'mr04-timerev-01',
 'mr04-time-reverse', 'angel_original', 'provisional', 1, true, 'subtracting-the-total-elapsed-time-incorrectly-or-adding-instead-of-subtracting',
 'FAR_TRANSFER')
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr04-timerev-02', 'maths', 'QT-MR-10', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr04-timerev-02","marks":2,"skill":"arithmetic","answer":"19:10","question":"A cinema screening finishes at 21:10. It consisted of 20 minutes of adverts, a 10 minute break, and a 90 minute film, in that order. What time did the screening start?","workingSteps":["Total time from start to finish: 20 + 10 + 90 = 120 minutes = 2 hours","Subtract this from the finish time: 21:10 − 2:00 = 19:10"]}$json$,
 'Stage 3, Increment 003. Assessment Brain QT-MR-10, competency MR-04. Question family: mr04-time-reverse. Reverse elapsed-time reasoning, second surface-varied sibling. Answer independently recomputed, see scripts/generate-mr04-depth-batch.mjs.',
 2, 'mr04-timerev-02',
 'mr04-time-reverse', 'angel_original', 'provisional', 1, true, 'subtracting-the-total-elapsed-time-incorrectly-or-adding-instead-of-subtracting',
 'FAR_TRANSFER')
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr04-timerev-03', 'maths', 'QT-MR-10', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr04-timerev-03","marks":2,"skill":"arithmetic","answer":"14:00","question":"An exam session finishes at 15:50. It consisted of a 5 minute instructions period, a 90 minute paper, and a 15 minute review period, in that order. What time did the session start?","workingSteps":["Total time from start to finish: 5 + 90 + 15 = 110 minutes = 1 hour 50 minutes","Subtract this from the finish time: 15:50 − 1:50 = 14:00"]}$json$,
 'Stage 3, Increment 003. Assessment Brain QT-MR-10, competency MR-04. Question family: mr04-time-reverse. Reverse elapsed-time reasoning, third surface-varied sibling. Answer independently recomputed, see scripts/generate-mr04-depth-batch.mjs.',
 2, 'mr04-timerev-03',
 'mr04-time-reverse', 'angel_original', 'provisional', 1, true, 'subtracting-the-total-elapsed-time-incorrectly-or-adding-instead-of-subtracting',
 'FAR_TRANSFER')
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr04-timerev-04', 'maths', 'QT-MR-10', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr04-timerev-04","marks":2,"skill":"arithmetic","answer":"06:20","question":"A train arrives at 09:05. Its journey consisted of a 1 hour 45 minute first leg, a 10 minute stop, and a 50 minute second leg, in that order. What time did the train depart?","workingSteps":["Total time from start to finish: 105 + 10 + 50 = 165 minutes = 2 hours 45 minutes","Subtract this from the arrival time: 09:05 − 2:45 = 06:20"]}$json$,
 'Stage 3, Increment 003. Assessment Brain QT-MR-10, competency MR-04. Question family: mr04-time-reverse. Reverse elapsed-time reasoning, fourth surface-varied sibling (longer, mixed-unit durations). Answer independently recomputed, see scripts/generate-mr04-depth-batch.mjs.',
 2, 'mr04-timerev-04',
 'mr04-time-reverse', 'angel_original', 'provisional', 1, true, 'subtracting-the-total-elapsed-time-incorrectly-or-adding-instead-of-subtracting',
 'FAR_TRANSFER')
on conflict (id) do nothing;

-- === mr04-bv-convert (QT-MR-13, competency MR-04) ====================
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr04-bvconv-01', 'maths', 'QT-MR-13', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr04-bvconv-01","marks":2,"skill":"arithmetic","answer":"A","question":"Rice: Option A is 500g for £1.00. Option B is 1.5kg for £3.30. Which option is better value, A or B?","workingSteps":["Convert both to the same unit (price per kg)","Option A: £1.00 ÷ 0.5kg = £2.00 per kg","Option B: £3.30 ÷ 1.5kg = £2.20 per kg","The lower price per kg is better value: Option A"]}$json$,
 'Stage 3, Increment 003. Assessment Brain QT-MR-13, competency MR-04. Question family: mr04-bv-convert. Best-value reasoning requiring a unit-conversion step first -- the existing mr04-best-value family always states both options in the same unit. Answers deliberately mixed across this family''s 3 siblings (A, B, A), never all one letter. Answer independently recomputed, see scripts/generate-mr04-depth-batch.mjs.',
 2, 'mr04-bvconv-01',
 'mr04-bv-convert', 'angel_original', 'provisional', 1, true, 'comparing-prices-without-converting-to-the-same-unit-first',
 'FAR_TRANSFER')
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr04-bvconv-02', 'maths', 'QT-MR-13', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr04-bvconv-02","marks":2,"skill":"arithmetic","answer":"B","question":"Cheese: Option A is 250g for £2.00. Option B is 1kg for £7.60. Which option is better value, A or B?","workingSteps":["Convert both to the same unit (price per kg)","Option A: £2.00 ÷ 0.25kg = £8.00 per kg","Option B: £7.60 ÷ 1kg = £7.60 per kg","The lower price per kg is better value: Option B"]}$json$,
 'Stage 3, Increment 003. Assessment Brain QT-MR-13, competency MR-04. Question family: mr04-bv-convert. Best-value reasoning requiring a unit-conversion step first, second surface-varied sibling. Answer independently recomputed, see scripts/generate-mr04-depth-batch.mjs.',
 2, 'mr04-bvconv-02',
 'mr04-bv-convert', 'angel_original', 'provisional', 1, true, 'comparing-prices-without-converting-to-the-same-unit-first',
 'FAR_TRANSFER')
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr04-bvconv-03', 'maths', 'QT-MR-13', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mr04-bvconv-03","marks":2,"skill":"arithmetic","answer":"A","question":"Pasta: Option A is 500g for £0.75. Option B is 1.2kg for £2.16. Which option is better value, A or B?","workingSteps":["Convert both to the same unit (price per kg)","Option A: £0.75 ÷ 0.5kg = £1.50 per kg","Option B: £2.16 ÷ 1.2kg = £1.80 per kg","The lower price per kg is better value: Option A"]}$json$,
 'Stage 3, Increment 003. Assessment Brain QT-MR-13, competency MR-04. Question family: mr04-bv-convert. Best-value reasoning requiring a unit-conversion step first, third surface-varied sibling. Answer independently recomputed, see scripts/generate-mr04-depth-batch.mjs.',
 2, 'mr04-bvconv-03',
 'mr04-bv-convert', 'angel_original', 'provisional', 1, true, 'comparing-prices-without-converting-to-the-same-unit-first',
 'FAR_TRANSFER')
on conflict (id) do nothing;

commit;

-- No RLS change: ali_question_bank's existing RLS policy (migration 069)
-- already governs this insert the same way as every prior content
-- migration; no new policy, table, or trigger is created here.
