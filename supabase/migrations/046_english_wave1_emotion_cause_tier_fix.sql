-- Angel Digital 11+ — Migration 046
-- Educational Increment 007B — Wave 1 Production Activation, Part 2:
-- corrects a real content defect found by programmatic verification of
-- all 42 live production questions against their answer-validation
-- contracts (not a spot check).
--
-- The 6 `wave1-fam-emotion-cause` questions (w1-kitemaker-07,
-- w1-lastbus-07, w1-newgirl-07, w1-atticdoor-07, w1-raceday-07,
-- w1-letter-07) were authored with `validationTier:
-- "TIER3_QUOTATION_PLUS_EXPLANATION"` but carry `acceptedAnswers` (a
-- named emotion), not `quotationRequired` — they don't actually fit Tier
-- 3's definition (quotation + unscored explanation). A genuine 5th tier,
-- TIER5_NAMED_COMPONENT_PLUS_EXPLANATION (lib/learningEngine/
-- englishAnswerValidation.ts), was added to correctly represent "name a
-- component from an accepted set, plus an honestly-unscored causal
-- explanation" — the shape these 6 questions actually have.
--
-- Surgical: uses jsonb_set to update only the `validationTier` key inside
-- each row's `prompt` JSONB. No other field (question, modelAnswer,
-- passageText, acceptedAnswers, marks, etc.) is touched. Does not change
-- eligibility_status, provenance, active, family_id, or any other column.
--
-- Naturally idempotent — re-running this UPDATE sets the same value
-- again, harmlessly.
--
-- Run this in: Supabase Dashboard > SQL Editor > New query.

begin;

update public.ali_question_bank
set prompt = jsonb_set(prompt, '{validationTier}', '"TIER5_NAMED_COMPONENT_PLUS_EXPLANATION"')
where id in (
  'w1-kitemaker-07', 'w1-lastbus-07', 'w1-newgirl-07',
  'w1-atticdoor-07', 'w1-raceday-07', 'w1-letter-07'
)
and prompt->>'validationTier' = 'TIER3_QUOTATION_PLUS_EXPLANATION';

commit;
