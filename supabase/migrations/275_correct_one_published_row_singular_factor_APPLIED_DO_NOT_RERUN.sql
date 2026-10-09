-- Angel Digital 11+ — Migration 275 — APPLIED to production by the Founder (2026-10-09, "Success. No rows returned"). DO NOT RERUN.
-- Read-only production verification PASSED (2026-10-09): target prompt md5 now 72d047d65be4e98e2109dbd019449ee2 (the expected AFTER), answer, family, difficulty, eligibility,
-- explanation and every other field unchanged; 0 rows still read "has 1 factors". Founder-applied governed pattern (same as migration 272's guarded one-row repair).
-- Purpose: correct the grammar of ONE published Practice row ("has 1 factors" -> "has 1 factor"). Wording only: the answer, the stimulus, the
-- difficulty, the eligibility and every other field are untouched. The generator that produced the defect was fixed at source
-- (lib/ali/questionFactory/mr05FactorsPrimesBlueprints.ts) so it cannot regenerate it.
--
-- BEFORE (read-only, 2026-10-09): prompt md5 5970782d8e14b28aa3bb4549ebeb19b6 (438 chars), question
--   "A student says 61 has 1 factors. This is incorrect. How many factors does 61 actually have?", answer "2", practice_eligible, active.
-- EXPECTED AFTER: prompt md5 72d047d65be4e98e2109dbd019449ee2, question
--   "A student says 61 has 1 factor. This is incorrect. How many factors does 61 actually have?", everything else identical.
-- ROLLBACK: the reverse jsonb_set with the BEFORE text (guarded the same way).

do $do$
declare
  v_rows integer;
begin
  update public.ali_question_bank
     set prompt = jsonb_set(prompt, '{question}', to_jsonb('A student says 61 has 1 factor. This is incorrect. How many factors does 61 actually have?'::text))
   where id = 'qf-factory-candidate-mr05-factors-primes-64dd5731e2c1cf8c'
     and prompt->>'question' = 'A student says 61 has 1 factors. This is incorrect. How many factors does 61 actually have?'
     and prompt->>'answer' = '2'
     and eligibility_status = 'practice_eligible';
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'Migration 275 expected to correct exactly 1 row, corrected % (already applied, or the row changed): nothing else was touched', v_rows;
  end if;
end $do$;
