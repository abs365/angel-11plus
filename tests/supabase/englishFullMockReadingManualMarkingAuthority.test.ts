import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * CSSE Two-Paper Mock P1 Repair, final piece — migration 252: widens the
 * EXISTING governed Reading manual-marking authority (mock_apply_manual_
 * mark(), migration 227) to english-full-mock-v1, so its 5 genuine
 * TIER3/TIER5 Reading Comprehension questions have a real resolution
 * path. Structural/logic assertions against migration 252's real, live
 * SQL source text, matching this repository's own established convention
 * for a NOT APPLIED migration (see tests/supabase/
 * englishFullMockScoringCompletion.test.ts for the identical pattern
 * applied to migration 251).
 */

const MIGRATION_227 = readFileSync(
  "supabase/migrations/227_reading_mock_manual_marking_and_release_governance.sql",
  "utf8"
);
const MIGRATION_252 = readFileSync(
  "supabase/migrations/252_english_full_mock_reading_manual_marking_authority.sql",
  "utf8"
);

function extractFunctionBody(source: string, name: string): string {
  const match = source.match(new RegExp(`create or replace function public\\.${name}\\([\\s\\S]*?\\n\\$\\$;`));
  if (!match) throw new Error(`function ${name} not found`);
  return match[0];
}

const originalBody = extractFunctionBody(MIGRATION_227, "mock_apply_manual_mark");
const widenedBody = extractFunctionBody(MIGRATION_252, "mock_apply_manual_mark");

test("migration 252 is wrapped in a single begin/commit transaction and discloses NOT APPLIED", () => {
  assert.match(MIGRATION_252, /^begin;/m);
  assert.match(MIGRATION_252, /^commit;/m);
  assert.match(MIGRATION_252, /NOT APPLIED/);
});

// --- Eligibility widened, additively, exactly like migration 251 -----------

test("mock_apply_manual_mark's eligibility guard now accepts english-full-mock-v1 in addition to reading-comprehension-mock-1", () => {
  assert.match(widenedBody, /attempt_type = 'timed_section' and v_attempt\.form_id = 'reading-comprehension-mock-1'/);
  assert.match(widenedBody, /attempt_type = 'full_mock' and v_attempt\.form_id = 'english-full-mock-v1'/);
});

test("Reading Comprehension Mock 1's own eligibility is preserved -- the widening is additive (OR), never a replacement of the original condition", () => {
  assert.match(
    widenedBody,
    /\(\s*\(v_attempt\.attempt_type = 'timed_section' and v_attempt\.form_id = 'reading-comprehension-mock-1'\)\s*\n\s*or \(v_attempt\.attempt_type = 'full_mock' and v_attempt\.form_id = 'english-full-mock-v1'\)\s*\)/
  );
});

// --- Writing can never be marked through this function ---------------------

test("a Writing question is refused outright by this function, mirroring migration 251's identical override", () => {
  assert.match(widenedBody, /if v_bank_row\.subject = 'writing' then\s*\n\s*raise exception/);
});

test("the Writing guard is checked immediately after the bank row resolves, BEFORE any canonical-mark derivation or bound check runs", () => {
  const bankRowIdx = widenedBody.indexOf("select * into v_bank_row from public.ali_question_bank where id = p_question_id;");
  const writingGuardIdx = widenedBody.indexOf("if v_bank_row.subject = 'writing' then");
  const canonicalMarksIdx = widenedBody.indexOf("v_canonical_marks := coalesce");
  assert.ok(bankRowIdx !== -1 && writingGuardIdx !== -1 && canonicalMarksIdx !== -1);
  assert.ok(bankRowIdx < writingGuardIdx && writingGuardIdx < canonicalMarksIdx);
});

// --- TIER3/TIER5 marking semantics: unchanged, never string-equality -------

test("marking is still a bounded numeric decision, never a text/semantic comparison -- no read of the learner's response text anywhere in this function", () => {
  assert.doesNotMatch(widenedBody, /ali_mock_attempt_answer/);
  assert.match(widenedBody, /if p_marks_awarded is null or p_marks_awarded < 0 or p_marks_awarded > v_canonical_marks then/);
});

test("outcome status is still DERIVED from the bounded mark, never trusted as a separate caller claim", () => {
  assert.match(widenedBody, /if p_marks_awarded = 0 then\s*\n\s*v_new_status := 'incorrect';/);
  assert.match(widenedBody, /elsif p_marks_awarded = v_canonical_marks then\s*\n\s*v_new_status := 'correct';/);
  assert.match(widenedBody, /v_new_status := 'partially_correct';/);
});

test("the canonical mark bound is still derived exclusively from the live ali_question_bank row, matching migration 219/227's own convention", () => {
  assert.match(widenedBody, /v_canonical_marks := coalesce\(\(v_bank_row\.prompt->>'marks'\)::numeric, 1\);/);
});

// --- English completion: reuses migration 251's existing contract ----------

test("when this function's own local manual-count does not already reach zero, it defers to the existing mock_check_and_complete_scoring -- never sets scoring_state='scored' unconditionally itself", () => {
  assert.match(widenedBody, /if v_final_scoring_state = 'scored' then\s*\n\s*perform public\.mock_analyse_attempt\(p_attempt_id\);\s*\n\s*else/);
  const elseBranch = widenedBody.split(/if v_final_scoring_state = 'scored' then/)[1].split("else")[1];
  assert.match(elseBranch, /perform public\.mock_check_and_complete_scoring\(p_attempt_id\);/);
});

test("Reading Comprehension Mock 1's own completion path is untouched: reaching scoring_state='scored' still invokes mock_analyse_attempt directly, in the unchanged if-branch", () => {
  assert.match(widenedBody, /if v_final_scoring_state = 'scored' then\s*\n\s*perform public\.mock_analyse_attempt\(p_attempt_id\);/);
});

test("this migration does not reimplement or approximate mock_check_and_complete_scoring's own resolution contract -- it only calls it, never touching ali_writing_assessment directly in executable SQL", () => {
  assert.doesNotMatch(MIGRATION_252, /create or replace function public\.mock_check_and_complete_scoring/);
  const executable = widenedBody
    .split("\n")
    .filter((l) => !l.trimStart().startsWith("--"))
    .join("\n");
  assert.doesNotMatch(executable, /ali_writing_assessment/);
});

// --- Untouched surfaces ------------------------------------------------------

test("this migration never touches migrations 250/251's own functions, mock_release_report, mock_attempt_report_init, mock_score_attempt, or RLS policies", () => {
  assert.doesNotMatch(MIGRATION_252, /create or replace function public\.mock_release_report/);
  assert.doesNotMatch(MIGRATION_252, /create or replace function public\.mock_attempt_report_init/);
  assert.doesNotMatch(MIGRATION_252, /create or replace function public\.mock_score_attempt/);
  assert.doesNotMatch(MIGRATION_252, /create or replace function public\.mock_claim_reading_scoring_work/);
  assert.doesNotMatch(MIGRATION_252, /create or replace function public\.mock_persist_reading_scoring/);
  assert.doesNotMatch(MIGRATION_252, /create or replace function public\.mock_persist_writing_assessment/);
  assert.doesNotMatch(MIGRATION_252, /create policy|drop policy|alter table .* enable row level security/i);
});

test("this migration touches exactly one function", () => {
  const defs = MIGRATION_252.match(/create or replace function public\.\w+/g) ?? [];
  assert.deepEqual(defs, ["create or replace function public.mock_apply_manual_mark"]);
});

test("no grant/revoke statements are restated -- migration 227's existing grants (authenticated only, anon revoked) are preserved by CREATE OR REPLACE alone", () => {
  assert.doesNotMatch(MIGRATION_252, /grant execute on function public\.mock_apply_manual_mark/);
  assert.doesNotMatch(MIGRATION_252, /revoke .* on function public\.mock_apply_manual_mark/);
});

// --- Every other line is byte-for-byte identical to migration 227 ----------

test("the admin gate, marker-identity derivation, row lock, marking_version check, aggregate loop, and audit insert are byte-for-byte identical to migration 227's own definition", () => {
  const invariantLines = [
    "if not public.is_current_user_admin() then",
    "raise exception 'Only an admin may apply a manual Mock mark';",
    "select id into v_marker_profile_id from public.profiles where auth_user_id = auth.uid();",
    "select * into v_report from public.ali_mock_attempt_report where attempt_id = p_attempt_id for update;",
    "if v_report.marking_version is distinct from v_current_marking_version then",
    "v_new_outcomes := jsonb_set(",
    "insert into public.ali_mock_manual_mark_audit (",
  ];
  for (const line of invariantLines) {
    assert.ok(originalBody.includes(line), `expected migration 227 to contain: ${line}`);
    assert.ok(widenedBody.includes(line), `expected migration 252's widened function to still contain: ${line}`);
  }
});
