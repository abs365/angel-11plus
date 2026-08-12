-- Angel Digital 11+ — Migration 032
-- Fix: mr03-angle-sum family (migration 031) stored answers with a
-- trailing degree symbol ("95°" instead of "95"). Discovered during
-- Educational Increment 004 production closure verification: a learner
-- typing the mathematically correct bare number "95" was marked "Not
-- quite", because lib/learningEngine/practiceContent.ts's
-- normalizeNumeric() strips "£$," and whitespace but not "°", so
-- Number("95°") is NaN and the comparison falls through to a failing
-- string match ("95" !== "95°"). No other family in the bank stores a
-- unit suffix inside `answer` (compare precision-dec's bare "3.17",
-- mr02-seq's bare "17") — this migration brings mr03-angle-sum into the
-- same, already-correct convention rather than modifying the shared
-- normalizeNumeric() function, which is reused verbatim in multiple files
-- and should not gain a special case for one family's authoring mistake.
--
-- Surgical, single-field jsonb_set update — matches migrations 027/028's
-- established pattern. Only the `prompt.answer` field changes; question
-- text and workingSteps (which correctly keep the ° symbol for the
-- human-readable degree unit) are untouched. No other column touched.
--
-- ali_question_bank has no browser-writable RLS/grant path — apply via
-- Supabase Dashboard > SQL Editor, same as every other migration.

begin;

update public.ali_question_bank
set prompt = jsonb_set(prompt, '{answer}', to_jsonb(replace(prompt->>'answer', '°', '')))
where id in ('mr03-ang-01', 'mr03-ang-02', 'mr03-ang-03', 'mr03-ang-04', 'mr03-ang-05', 'mr03-ang-06', 'mr03-ang-07')
  and prompt->>'answer' like '%°';

commit;
