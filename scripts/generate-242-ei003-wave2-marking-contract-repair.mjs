import fs from "node:fs";

const repairData = JSON.parse(
  fs.readFileSync(new URL("./output/ei003-wave2-modelanswer-marks-repair-source.json", import.meta.url), "utf8")
);

function sqlString(s) {
  return `'${s.replace(/'/g, "''")}'`;
}

const MARKS = 1;

const idListSql = repairData.map((r) => sqlString(`qf-${r.id}`)).join(", ");

const preconditionChecks = repairData
  .map(
    (r) => `  if exists (
    select 1 from public.ali_question_bank
    where id = ${sqlString(`qf-${r.id}`)}
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-${r.id} already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;`
  )
  .join("\n");

const updateStatements = repairData
  .map(
    (r) => `update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', ${sqlString(r.modelAnswer)}, 'marks', ${MARKS})
where id = ${sqlString(`qf-${r.id}`)};`
  )
  .join("\n\n");

const postconditionChecks = repairData
  .map(
    (r) => `  if not exists (
    select 1 from public.ali_question_bank
    where id = ${sqlString(`qf-${r.id}`)}
      and prompt->>'modelAnswer' = ${sqlString(r.modelAnswer)}
      and (prompt->>'marks')::int = ${MARKS}
  ) then
    raise exception 'Migration 242 postcondition failed: qf-${r.id} does not have the expected modelAnswer/marks after update.';
  end if;`
  )
  .join("\n");

const sql = `-- Angel Digital 11+ — Migration 242
-- Educational Increment 003, Wave 2 — marking-contract data repair (NOT
-- applied), bounded to the 40 already-published Wave 2 English questions.
--
-- ROOT CAUSE, found via real learner-facing verification (not admin-side
-- inspection): every one of the 40 candidates submitted via
-- submit_question_candidate() during this wave's candidate-store
-- submission step had a \`question_content\` shaped with
-- \`acceptedAnswers\` (an array, matching the TIER1/TIER2 English
-- validation contract's expected field), but never included the
-- \`marks\` or \`validationTier\` fields that contract also requires, and
-- never included the separate \`modelAnswer\` field the LEGACY_HEURISTIC
-- fallback path (lib/learningEngine/englishAnswerValidation.ts's
-- scoreEnglishComprehensionAnswer, used whenever prompt.validationTier is
-- absent) reads instead. The result, confirmed by a real Practice
-- session testing candidate ei003-w2-wc-meaning-01 with its own,
-- verbatim, already-approved accepted answer ("experienced, aged or
-- toughened by years outdoors"): scoreEnglishAnswer() receives
-- modelAnswer = undefined, so it returns
-- Math.max(1, Math.round(maxMarks / 2)) with maxMarks itself undefined
-- (prompt.marks was never set either) -- producing NaN, which can never
-- equal q.marks (also undefined) in the real Practice page's own
-- \`isCorrect = result.earnedMarks === q.marks\` check
-- (app/learning-intelligence/practice/[area]/page.tsx). The learner was
-- shown "Not quite" despite typing the exact stored answer. This affects
-- ALL 40 published Wave 2 questions identically -- confirmed live: 0/40
-- currently have a \`modelAnswer\`, \`marks\`, or \`validationTier\` key in
-- their stored prompt.
--
-- FIX, deliberately the smallest one available: add exactly two fields,
-- \`modelAnswer\` and \`marks\`, to each of the 40 published rows' existing
-- \`prompt\` jsonb via a non-destructive \`||\` merge (same convention
-- publish_question_candidate() itself already uses to add
-- passageText/passageTitle at publish time -- never rebuilding or
-- dropping existing keys). This routes every one of the 40 through the
-- SAME LEGACY_HEURISTIC keyword-overlap scorer that a majority of this
-- codebase's existing English content already depends on successfully
-- (confirmed by inspecting a real, live, comparable row --
-- w3-rc06-lettertograndad-01 -- which also has no validationTier and is
-- marked via modelAnswer + marks=1 through this exact path). No
-- \`validationTier\` is added: TIER1/TIER2's own doc comment restricts
-- their intended use to "retrieval and vocabulary-in-context answers",
-- and several of these 40 candidates (comparative similarity-difference,
-- emotion-arc, conflicting-evidence, atmosphere-accumulated) are longer,
-- genuinely inferential explanations for which the LEGACY_HEURISTIC's
-- tolerant, length-and-keyword-ratio scoring (>= 18% keyword overlap,
-- for a sufficiently long answer) is a materially better real-world fit
-- than TIER1/2's strict exact/token-subsequence match against a short
-- accepted-answer set -- selecting a tier per candidate would be a
-- second, separate design decision this bounded repair does not make.
--
-- \`modelAnswer\` is set to each candidate's own \`acceptedAnswers[0]\` --
-- the exact same value already used as \`p_claimed_answer\` at submission
-- time (never fabricated, never a new answer). \`marks\` is set to 1 for
-- all 40, matching this wave's own single-response question design (no
-- multi-part/multi-mark candidate exists among the 40) and the
-- comparable existing production row cited above.
--
-- Traced and confirmed: \`Math.round(1 / 2)\` in JavaScript rounds to 1,
-- so scoreEnglishAnswer's own \`Math.max(1, Math.round(maxMarks / 2))\`
-- fallback (taken whenever keyword ratio > 0 but the length gate isn't
-- met -- the realistic case for short single-word/short-phrase answers
-- such as this family's emotion-from-action "nervous"-style responses)
-- already evaluates to exactly 1 for a 1-mark question, so short correct
-- answers are not disadvantaged by the length gate once \`marks = 1\` is
-- set; a genuinely irrelevant answer (0 keyword overlap) still correctly
-- scores 0. Manually traced against ei003-w2-wc-meaning-01's own real
-- modelAnswer/userAnswer pair before writing this migration.
--
-- Scope, explicitly bounded: this migration touches ONLY the \`prompt\`
-- column, ONLY for the 40 named \`qf-ei003-w2-...\` ids, ONLY adding
-- \`modelAnswer\` and \`marks\`. It does not touch \`ali_question_candidate\`,
-- \`ali_passage_bank\`, any RPC, any RLS policy, or any other
-- \`ali_question_bank\` row (existing or future).
--
-- Fail-closed preconditions: for each of the 40 ids, if \`prompt\` already
-- contains a \`modelAnswer\` or \`marks\` key, this migration raises an
-- exception and rolls back entirely rather than silently overwriting a
-- value it did not originate (relevant only if a partial repair was
-- already attempted by some other means -- confirmed live, immediately
-- before writing this migration, that 0/40 currently have either key).
--
-- Postconditions: re-asserts, per id, that \`prompt->>'modelAnswer'\`
-- exactly equals the intended value and \`(prompt->>'marks')::int = 1\`.
--
-- NOT APPLIED. A direct, non-RPC UPDATE against \`ali_question_bank\` WAS
-- confirmed technically possible for the authenticated admin session
-- during this task's investigation (unlike \`ali_passage_bank\`, which
-- structurally blocks all writes via RLS) -- a single genuinely
-- no-op UPDATE (re-setting an existing column to its own current value)
-- was used ONLY to confirm this, immediately verified to have changed
-- nothing. This migration is deliberately NOT applied directly despite
-- that technical possibility, to preserve the same Founder-reviewed,
-- governed-migration discipline this whole arc has followed for every
-- other production data change. Generated for Founder review and manual
-- application via Supabase Dashboard > SQL Editor > New query.

begin;

do $$
begin
${preconditionChecks}
end$$;

${updateStatements}

do $$
begin
  if (
    select count(*) from public.ali_question_bank
    where id in (${idListSql})
      and prompt ? 'modelAnswer'
      and prompt ? 'marks'
  ) <> 40 then
    raise exception 'Migration 242 postcondition failed: expected all 40 Wave 2 published questions to have modelAnswer and marks set, found a different count.';
  end if;

${postconditionChecks}
end$$;

commit;
`;

fs.writeFileSync(new URL("../supabase/migrations/242_ei003_wave2_marking_contract_repair.sql", import.meta.url), sql);
console.log("Wrote supabase/migrations/242_ei003_wave2_marking_contract_repair.sql");
console.log("Repaired candidate count:", repairData.length);
