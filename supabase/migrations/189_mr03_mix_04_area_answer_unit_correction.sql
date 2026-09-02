-- Angel Digital 11+ — Migration 189
-- Gate 3 Closure Wave, Defect B — mr03-mix-04 area-answer unit omission.
--
-- ============================================================
-- ROOT CAUSE (Gate 3 live production regression, Profile B)
-- ============================================================
-- 'mr03-mix-04' (family mr03-mixed-perimeter, added migration 066) is the
-- one "reverse direction" variant in this family: every sibling
-- (mr03-mix-01/02/03/05/06) gives an area and asks for the PERIMETER, so
-- each sibling's own `answer` is correctly unit-suffixed with a plain
-- length unit ("28m", "34m", "36m", "29m", "36m"). mr03-mix-04 instead
-- gives a perimeter and asks for the AREA ("A rectangular playground has a
-- perimeter of 54m. One side is 15m. What is the area?"), but its stored
-- `answer` is the bare number "180" -- no unit -- even though its own
-- workingSteps already compute "Area = 15 × 12 = 180 m²". This is a
-- single-row content-data omission at authoring time, not a repeated
-- pattern: it is the only area-answer row in this family, confirmed by
-- direct reading of all six mr03-mixed-perimeter rows (migrations 039 and
-- 066); the five perimeter-answer siblings are unaffected and correctly
-- unit-suffixed already.
--
-- Confirmed live in production: checkMathsAnswer() (lib/learningEngine/
-- practiceContent.ts) correctly accepts EITHER a bare number OR a
-- correctly-unit-suffixed number whenever the STORED answer itself carries
-- a unit -- this is Educational Increment 007K/007L's existing, working
-- design (see mth-009's own "942 cm³" stored answer, and this same
-- migration's use of the same "m²" convention). Because mr03-mix-04's
-- stored answer carried no unit at all, that unit-aware acceptance path
-- was never reached for it: a learner correctly typing "180 m2" (the
-- question's own implied unit, matching the working steps) was rejected,
-- while a bare "180" would have passed. This is a data omission, not a
-- code defect -- checkMathsAnswer() is unchanged by this migration.
--
-- ============================================================
-- FIX
-- ============================================================
-- `answer` corrected from "180" to "180 m²", matching this exact family's
-- and the wider bank's existing square-unit convention (mth-009's
-- "942 cm³"; the real Unicode superscript character, not the ASCII digit,
-- is the canonical stored form -- parseNumberWithUnit() already accepts
-- both "180m²" and a learner-typed "180m2"/"180 m2" as the same value,
-- unchanged by this migration). `question`, `workingSteps`, `marks`,
-- `skill`, family_id, addresses_misconception, and every other column are
-- completely unchanged.
--
-- Fail-closed and idempotent: the WHERE clause requires the CURRENT
-- `prompt->>'answer'` and `prompt->>'question'` to exactly equal their
-- documented pre-fix values.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

update public.ali_question_bank
set
  prompt = jsonb_set(
    prompt,
    '{answer}',
    to_jsonb('180 m²'::text)
  )
where id = 'mr03-mix-04'
  and prompt->>'answer' = '180'
  and prompt->>'question' = 'A rectangular playground has a perimeter of 54m. One side is 15m. What is the area?';

commit;
