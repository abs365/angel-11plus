import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics Marking Integrity Gate — Remediation Phase 1
 * (Decision 172, Founder-approved). Structural tests against migration
 * 117's own SQL text, mirroring this project's established
 * assertion-and-refuse migration-testing convention.
 */

const sql = fs.readFileSync("supabase/migrations/117_mock_mathematics_marking_integrity_remediation_phase1.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const EXPECTED_20_IDS = [
  "mock-mr02-twostep-01", "mock-mr02-twostep-02", "mock-mr02-twostep-03",
  "mock-mr05-inverse-01", "mock-mr05-inverse-02",
  "mock-mr04-reversepercent-01", "mock-mr04-reversepercent-02",
  "mock-mr06-multiplerelation-01", "mock-mr06-multiplerelation-02",
  "mock-mr07-isoscelesproperty-01", "mock-mr07-isoscelesproperty-02",
  "mock-mr10-reverseschedule-01", "mock-mr10-reverseschedule-02",
  "mock-mr11-propertysearch-01", "mock-mr11-propertysearch-02",
  "mock-mr12-reversemean-01", "mock-mr12-reversemean-02",
  "mock-mr09-data-03",
  "mock-mr10-fairprep-02",
  "mock-mr09-runningclub-02",
];

function parseValuesRows(): Array<[string, string, string]> {
  const match = executable.match(/insert into tmp_marks_correction_map[\s\S]*?values([\s\S]*?);/);
  assert.ok(match, "expected the tmp_marks_correction_map VALUES list to be present");
  const rowMatches = [...match![1].matchAll(/\('([\w-]+)', '([\w-]+)', '(\w+)'\)/g)];
  return rowMatches.map((m) => [m[1], m[2], m[3]]);
}

test("exact 20-row corrected target set: independently re-derived, NOT Decision 172's own miscounted 21 (rotation contributes 2 excluded rows, not 1)", () => {
  const rows = parseValuesRows();
  assert.equal(rows.length, 20);
  const actualIds = rows.map((r) => r[0]).sort();
  assert.deepEqual(actualIds, [...EXPECTED_20_IDS].sort());
});

test("mock-mr08-rotation is excluded from the target map: neither -01 nor -02 appears in the VALUES list -- every other real-SQL mention is part of the exclusion-proof safety guard (LIKE-pattern check, its own exception message, or the final disclosure notice), never a target reference", () => {
  const rows = parseValuesRows();
  assert.ok(!rows.some((r) => r[0].startsWith("mock-mr08-rotation")));
  assert.match(executable, /if exists \(select 1 from tmp_marks_correction_map where id like 'mock-mr08-rotation%'\) then/);
  assert.match(executable, /raise exception 'Migration 117 refused: mock-mr08-rotation must never appear/);
  // No UPDATE, INSERT, or WHERE clause outside the guard/notice text ever targets a rotation id directly.
  assert.ok(!/where id = 'mock-mr08-rotation/.test(executable));
  assert.ok(!/id = any\([^)]*mock-mr08-rotation/.test(executable));
});

test("the migration's own header explicitly discloses and corrects the 21-vs-20 miscount", () => {
  const collapsed = sql.replace(/\n--\s?/g, " ");
  assert.match(collapsed, /21 of 22 rows\.\.\. MARKS CORRECTION/);
  assert.match(collapsed, /arithmetic error/);
  assert.match(collapsed, /MARKS CORRECTION population is therefore 20 rows, not 21/);
});

test("every target row's expected eligibility_status is exactly mock_eligible or independently_validated -- 18 mock_eligible, 2 independently_validated", () => {
  const rows = parseValuesRows();
  const mockEligible = rows.filter((r) => r[2] === "mock_eligible");
  const independentlyValidated = rows.filter((r) => r[2] === "independently_validated");
  assert.equal(mockEligible.length, 18);
  assert.equal(independentlyValidated.length, 2);
  assert.deepEqual(independentlyValidated.map((r) => r[0]).sort(), ["mock-mr09-runningclub-02", "mock-mr10-fairprep-02"]);
});

test("exactly 11 distinct family_id values in the target map -- Decision 172's own 12-family population minus rotation's own 1 family", () => {
  const rows = parseValuesRows();
  const families = new Set(rows.map((r) => r[1]));
  assert.equal(families.size, 11);
  assert.ok(!families.has("mock-mr08-rotation"));
});

test("marks is corrected via jsonb_set on the prompt column, never assumed to be a top-level column", () => {
  assert.match(executable, /set prompt = jsonb_set\(b\.prompt, '\{marks\}', '1'::jsonb\)/);
  assert.ok(!/set marks\s*=/i.test(executable), "marks must never be treated as a top-level column");
});

test("no other column is ever SET -- prompt (via jsonb_set, marks key only) is the only column this migration ever writes", () => {
  const setColumns = [...executable.matchAll(/\bset\s+([a-z_]+)\s*=/gi)].map((m) => m[1].toLowerCase());
  assert.deepEqual(new Set(setColumns), new Set(["prompt"]));
});

test("eligibility_status is never SET anywhere in this migration's real SQL", () => {
  assert.ok(!/set eligibility_status/i.test(executable));
});

test("byte-for-byte preservation is positively proven, not merely trusted: a pre-write snapshot of (prompt - 'marks') is captured and compared against the post-write value for all 20 rows", () => {
  assert.match(executable, /prompt_without_marks/);
  assert.match(executable, /select b\.id, b\.prompt - 'marks'/);
  assert.match(executable, /where \(b\.prompt - 'marks'\) = s\.prompt_without_marks/);
  assert.match(executable, /post-write preservation check failed/);
});

test("preconditions present and live: active, subject='maths', family_id match, eligibility_status match (drift guard), marking_mode null-or-deterministic, and the marks=2 pre-state check", () => {
  assert.match(executable, /where b\.active = true/);
  assert.match(executable, /where b\.subject = 'maths'/);
  assert.match(executable, /where b\.family_id = m\.expected_family_id/);
  assert.match(executable, /where b\.eligibility_status = m\.expected_eligibility_status/);
  assert.match(executable, /where b\.marking_mode is null or b\.marking_mode = 'deterministic'/);
  assert.match(executable, /where \(b\.prompt->>'marks'\)::numeric = 2/);
});

test("fails safely: at least 5 RAISE EXCEPTION guards and exactly 2 RAISE NOTICE guarding the two safe branches (apply, already-applied)", () => {
  const exceptionCount = (executable.match(/raise exception/g) || []).length;
  const noticeCount = (executable.match(/raise notice/g) || []).length;
  assert.ok(exceptionCount >= 5, `expected several RAISE EXCEPTION guards, found ${exceptionCount}`);
  assert.equal(noticeCount, 2);
});

test("idempotent structure: the already-applied branch (elsif v_already_marks1_count = 20) contains no UPDATE statement", () => {
  const alreadyAppliedBranch = executable.match(/elsif v_already_marks1_count = 20 then[\s\S]*?else/)![0];
  assert.ok(!/\bupdate\s+public\.ali_question_bank\b/i.test(alreadyAppliedBranch));
});

test("touches only public.ali_question_bank via UPDATE -- the only INSERT targets are local temp tables, never a real content or governance table", () => {
  const updateTargets = [...executable.matchAll(/update\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(updateTargets), new Set(["ali_question_bank"]));
  const insertTargets = [...executable.matchAll(/insert into\s+(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["tmp_marks_correction_map", "tmp_pre_snapshot"]));
  assert.ok(!/\bdelete from\b/i.test(executable));
});

test("no ali_family_review, ali_mock_form, or ali_mock_attempt mutation: none of those tables is mentioned anywhere in this migration's real SQL", () => {
  for (const table of ["ali_family_review", "ali_mock_form", "ali_mock_attempt"]) {
    assert.ok(!executable.includes(table));
  }
});

test("Practice isolation: no practice_eligible reference anywhere", () => {
  assert.ok(!executable.includes("practice_eligible"));
});

test("no scoring function is created, replaced, or altered -- no CREATE OR REPLACE FUNCTION, no partial-credit mechanism introduced", () => {
  assert.ok(!/create (or replace )?function/i.test(executable));
});

test("English and Writing content is never referenced anywhere in this Mathematics-only migration", () => {
  assert.ok(!/mock-eng-|mock-writing-/.test(executable));
  assert.ok(!/subject = 'english'|subject = 'writing'/i.test(executable));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header, and explicitly documents its dependency on migrations 105/112/116", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /105/);
  assert.match(sql, /112/);
  assert.match(sql, /116/);
});

test("First Mock capacity boundary explicitly preserved: the header states the corrected pool does not currently support an authentic First Mathematics Mock, and does not raise any other row's marks to compensate", () => {
  assert.match(sql, /does not currently support an authentic First Mathematics Mock/);
  assert.ok(!/raise.*marks/i.test(sql.replace(/RAISE (NOTICE|EXCEPTION)/gi, "")), "must not raise any other row's marks to compensate");
});
