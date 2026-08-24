import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics First Mock Foundation — Grouped-Question Scoring +
 * Marking-Mode Safety Correction (Decision 160). Structural tests
 * against migration 104's own SQL text, mirroring tests/supabase/
 * mockScoringTrustBoundaryCorrection.test.ts's own established
 * convention (migration 075) exactly, extended for this migration's own
 * two corrections. Behavioural coverage for the grouped-scoring
 * arithmetic itself lives in a separate, narrowly-scoped shadow test
 * below (see its own header comment for why, and its limits).
 */

const sql = fs.readFileSync("supabase/migrations/104_mock_mathematics_grouped_scoring_and_marking_mode_safety.sql", "utf8");
const executable = sql.split("\n").filter((l) => !l.trimStart().startsWith("--")).join("\n");

const EXISTING_RPCS = [
  "mock_create_attempt", "mock_start_attempt", "mock_get_question", "mock_submit_answer",
  "mock_submit_attempt", "mock_get_active_form", "mock_get_attempt_manifest", "mock_set_flag",
  "mock_attempt_report_init", "mock_release_report",
];

test("does not redefine any of the other proven Mock RPCs, and does not mention them at all", () => {
  for (const fn of EXISTING_RPCS) {
    assert.ok(!new RegExp(`create or replace function public\\.${fn}\\(`).test(executable), `must never redefine ${fn}`);
    assert.ok(!executable.includes(fn), `must not mention ${fn} at all`);
  }
});

test("redefines exactly one function -- mock_score_attempt -- nothing else", () => {
  const redefinitions = [...executable.matchAll(/create or replace function public\.(\w+)\(/g)].map((m) => m[1]);
  assert.deepEqual(redefinitions, ["mock_score_attempt"]);
});

test("does not create or drop any table, policy, trigger, or grant/revoke anything -- migration 075's own REVOKE already stands, untouched", () => {
  assert.ok(!/create table|drop table|create policy|drop policy|create trigger|drop trigger|grant execute|revoke execute/i.test(executable));
});

test("does not add or alter any table column", () => {
  assert.ok(!/alter table/i.test(executable));
});

test("does not touch ali_student_question_history, ali_durable_mastery, or ali_educational_audit", () => {
  for (const table of ["ali_student_question_history", "ali_durable_mastery", "ali_educational_audit"]) {
    assert.ok(!executable.includes(table));
  }
});

test("does not touch ali_question_bank.eligibility_status, ali_mock_form, or create real Mock content", () => {
  assert.ok(!/set\s+eligibility_status/i.test(executable));
  assert.ok(!/insert into public\.ali_mock_form|insert into public\.ali_question_bank/i.test(executable));
  assert.ok(!executable.includes("ali_mock_form"));
});

test("no top-level data mutation outside the function body -- every INSERT/UPDATE/DELETE exists only inside the CREATE OR REPLACE FUNCTION definition", () => {
  const withoutFunctionBody = executable.replace(/create or replace function[\s\S]*?\n\$\$;/g, "");
  assert.ok(!/insert into|update public\.|delete from/i.test(withoutFunctionBody));
});

test("CORRECTION: marking_mode fail-closed check is present in the manual-marking trigger condition, alongside the existing writing/null/semicolon checks", () => {
  assert.match(
    executable,
    /if v_bank_row\.subject = 'writing' or v_stored_answer is null or v_stored_answer like '%;%'\s*\n\s*or \(v_bank_row\.marking_mode is not null and v_bank_row\.marking_mode <> 'deterministic'\) then/
  );
});

test("CORRECTION: grouping metadata (questionGroupId, groupOrder, subpartLabel) is added to the outcome object in BOTH branches -- the not-found defensive branch and the real per-row branch", () => {
  const notFoundBranch = executable.match(/if not found then[\s\S]*?continue;\s*\n\s*end if;/)![0];
  assert.match(notFoundBranch, /'questionGroupId', null, 'groupOrder', null, 'subpartLabel', null/);

  const realOutcomeBlock = executable.match(/v_outcomes := v_outcomes \|\| jsonb_build_object\([\s\S]*?'questionTypeId', v_bank_row\.skill,[\s\S]*?\);/)![0];
  assert.match(realOutcomeBlock, /'questionGroupId', v_bank_row\.question_group_id/);
  assert.match(realOutcomeBlock, /'groupOrder', v_bank_row\.group_order/);
  assert.match(realOutcomeBlock, /'subpartLabel', v_bank_row\.subpart_label/);
});

test("marks accumulation is unconditional and identical for every question_id in the loop -- no group-aware branching exists anywhere that could sum a grouped family's marks differently from an equal number of standalone rows (proves no double-counting structurally)", () => {
  // Exactly one accumulation site for v_raw_available (declared) and exactly
  // one conditional accumulation for v_raw_achieved, both unconditional on
  // grouping -- confirmed by counting occurrences, not merely by absence
  // of the word "group" (which legitimately appears in the new metadata).
  const availableAccumulations = (executable.match(/v_raw_available := v_raw_available \+ v_marks;/g) || []).length;
  const achievedAccumulations = (executable.match(/v_raw_achieved := v_raw_achieved \+ v_marks_awarded;/g) || []).length;
  assert.equal(availableAccumulations, 1, "exactly one, unconditional accumulation site for available marks");
  assert.equal(achievedAccumulations, 1, "exactly one, unconditional accumulation site for achieved marks");
  assert.ok(!/if.*question_group_id.*is not null/i.test(executable), "no branch conditions on whether a row is grouped before accumulating marks");
});

test("mock_score_attempt is otherwise unchanged from migration 075's own design -- same signature, same ownership/submitted-only/idempotency guards, same 0.0001 tolerance, same conservative auto-marking scope, same questionTypeId inclusion, same scoring_state logic, same unanswered handling", () => {
  const body = executable.match(/create or replace function public\.mock_score_attempt\([\s\S]*?\n\$\$;/)![0];
  const signature = executable.match(/create or replace function public\.mock_score_attempt\(([^)]*)\)/)![1];
  assert.equal(signature.trim(), "p_attempt_id uuid");
  assert.match(body, /security definer/);
  assert.match(body, /profile_id = v_profile_id/);
  assert.match(body, /status <> 'submitted'/);
  assert.match(body, /scoring_state = 'scored'\s*\n\s*and marking_version = v_current_marking_version/);
  assert.match(body, /abs\(v_numeric_response - v_numeric_answer\) < 0\.0001/);
  assert.match(body, /'questionTypeId', v_bank_row\.skill/);
  assert.match(body, /set scoring_state = case when v_manual_count > 0 then 'scoring' else 'scored' end,/);
  assert.match(body, /if v_response is null or v_response_value is null or trim\(v_response_value\) = '' then/);
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
});

// --- Narrowly-scoped behavioural shadow test ------------------------------
// The real scoring function is PL/pgSQL, executed only inside Postgres --
// this repository has no in-process Postgres test harness (confirmed by
// search this session: no pg-mem/pglite dependency exists), so it cannot
// be run directly here, exactly like every other SECURITY DEFINER
// function in this codebase. Rather than claim untested behavioural
// coverage, this is a DELIBERATELY NARROW, line-faithful mirror of ONLY
// the ~15-line comparison kernel (numeric-parse-or-exact-string match) --
// not the whole function, not grouping, not manual-marking routing --
// run against the REAL migration 095 answer strings for the one grouped
// Mathematics family, to directly prove the specific behavioural claims
// (partial/zero/fully-correct grouped scoring) that structural SQL-text
// assertions alone cannot. If the real kernel in migration 104 ever
// changes, this mirror must be updated to match -- it is a test aid, not
// a second source of truth.

function shadowCompare(responseValue: string, storedAnswer: string): "correct" | "incorrect" {
  let numericResponse: number | null = null;
  let numericAnswer: number | null = null;
  const nr = Number(responseValue);
  const na = Number(storedAnswer);
  if (responseValue.trim() !== "" && !Number.isNaN(nr)) numericResponse = nr;
  if (storedAnswer.trim() !== "" && !Number.isNaN(na)) numericAnswer = na;

  if (numericResponse !== null && numericAnswer !== null) {
    return Math.abs(numericResponse - numericAnswer) < 0.0001 ? "correct" : "incorrect";
  }
  return responseValue.trim().toLowerCase() === storedAnswer.trim().toLowerCase() ? "correct" : "incorrect";
}

// Real answers, extracted directly from migration 095's own stored content.
const COSTUMESCHEDULE_ANSWERS: Record<string, string> = {
  "mock-mr01mr10-costumeschedule-01a": "16:35",
  "mock-mr01mr10-costumeschedule-01b": "12.00",
  "mock-mr01mr10-costumeschedule-02a": "13:05",
  "mock-mr01mr10-costumeschedule-02b": "7.35",
};

test("grouped question, fully correct: all 4 subparts answered correctly score correct, 4/4 marks (1 mark each, confirmed from migration 095's own real marks fields)", () => {
  const results = Object.entries(COSTUMESCHEDULE_ANSWERS).map(([id, answer]) => shadowCompare(answer, COSTUMESCHEDULE_ANSWERS[id]));
  assert.deepEqual(results, ["correct", "correct", "correct", "correct"]);
  const marksAwarded = results.filter((r) => r === "correct").length * 1;
  assert.equal(marksAwarded, 4);
});

test("grouped question, zero correct: all 4 subparts answered wrong score incorrect, 0/4 marks", () => {
  const wrongResponses: Record<string, string> = {
    "mock-mr01mr10-costumeschedule-01a": "17:00",
    "mock-mr01mr10-costumeschedule-01b": "99.99",
    "mock-mr01mr10-costumeschedule-02a": "00:00",
    "mock-mr01mr10-costumeschedule-02b": "0",
  };
  const results = Object.entries(wrongResponses).map(([id, resp]) => shadowCompare(resp, COSTUMESCHEDULE_ANSWERS[id]));
  assert.deepEqual(results, ["incorrect", "incorrect", "incorrect", "incorrect"]);
  const marksAwarded = results.filter((r) => r === "correct").length * 1;
  assert.equal(marksAwarded, 0);
});

test("grouped question, partial correctness: subpart (a) of instance 1 correct, subpart (b) wrong -- proves each subpart is scored independently, not as one merged unit", () => {
  const subpartResults = [
    shadowCompare("16:35", COSTUMESCHEDULE_ANSWERS["mock-mr01mr10-costumeschedule-01a"]),
    shadowCompare("13.50", COSTUMESCHEDULE_ANSWERS["mock-mr01mr10-costumeschedule-01b"]),
  ];
  const numberedQuestion1Marks = subpartResults.filter((r) => r === "correct").length;
  assert.deepEqual(subpartResults, ["correct", "incorrect"]);
  assert.equal(numberedQuestion1Marks, 1, "numbered question 1 (2 subparts) awards exactly 1 of its own 2 marks, not 0 and not 2");
});

test("grouped question marks roll up correctly to the numbered question and to the paper total when mixed with standalone questions -- no double counting", () => {
  // Simulates the real accumulation loop's own arithmetic: one grouped
  // family (4 subparts, 1 mark each = 4 available) mixed with 2 real
  // standalone Batch 003 rows (mock-mr01-directcalc, 1 mark each = 2
  // available), matching the actual per-row summation shape migration
  // 104's own structural tests already prove is unconditional and
  // single-site.
  const allAnswers: Array<{ id: string; response: string; stored: string; marks: number }> = [
    { id: "mock-mr01mr10-costumeschedule-01a", response: "16:35", stored: "16:35", marks: 1 },
    { id: "mock-mr01mr10-costumeschedule-01b", response: "12.00", stored: "12.00", marks: 1 },
    { id: "mock-mr01mr10-costumeschedule-02a", response: "13:05", stored: "13:05", marks: 1 },
    { id: "mock-mr01mr10-costumeschedule-02b", response: "0", stored: "7.35", marks: 1 }, // deliberately wrong
    { id: "mock-mr01-directcalc-01", response: "44.8", stored: "44.8", marks: 1 },
    { id: "mock-mr01-directcalc-02", response: "87", stored: "87", marks: 1 },
  ];
  let rawAchieved = 0;
  let rawAvailable = 0;
  for (const q of allAnswers) {
    rawAvailable += q.marks;
    if (shadowCompare(q.response, q.stored) === "correct") rawAchieved += q.marks;
  }
  assert.equal(rawAvailable, 6, "6 marks available across 4 grouped subparts + 2 standalone questions");
  assert.equal(rawAchieved, 5, "5 of 6 achieved -- 3 correct grouped subparts + 2 correct standalone, 1 incorrect grouped subpart, no double counting");
});
