import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics Marking Integrity Gate — Remediation Phase 2 (rotation
 * closure, Decision 174, Founder-approved). Structural tests against
 * migration 118's own SQL text, mirroring migration 117's own
 * established assertion-and-refuse convention exactly.
 */

const sql = fs.readFileSync("supabase/migrations/118_mock_mathematics_marking_integrity_remediation_phase2_rotation.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const EXPECTED_2_IDS = ["mock-mr08-rotation-01", "mock-mr08-rotation-02"];

function parseValuesRows(): Array<[string, string, string]> {
  const match = executable.match(/insert into tmp_rotation_marks_correction_map[\s\S]*?values([\s\S]*?);/);
  assert.ok(match, "expected the tmp_rotation_marks_correction_map VALUES list to be present");
  const rowMatches = [...match![1].matchAll(/\('([\w-]+)', (\d+), '(\([ab]\))'\)/g)];
  return rowMatches.map((m) => [m[1], m[2], m[3]]);
}

test("exact 2-row target map: mock-mr08-rotation-01 and -02 only, no more no less", () => {
  const rows = parseValuesRows();
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map((r) => r[0]).sort(), [...EXPECTED_2_IDS].sort());
});

test("both target rows belong to mock-mr08-rotation, group_order 1/2, subpart_label (a)/(b)", () => {
  const rows = parseValuesRows();
  const row01 = rows.find((r) => r[0] === "mock-mr08-rotation-01")!;
  const row02 = rows.find((r) => r[0] === "mock-mr08-rotation-02")!;
  assert.deepEqual(row01, ["mock-mr08-rotation-01", "1", "(a)"]);
  assert.deepEqual(row02, ["mock-mr08-rotation-02", "2", "(b)"]);
  assert.match(executable, /where b\.family_id = 'mock-mr08-rotation'/);
  assert.match(executable, /where b\.question_group_id = 'mock-mr08-rotation'/);
});

test("marks is corrected via jsonb_set on the prompt column, never assumed to be a top-level column", () => {
  assert.match(executable, /set prompt = jsonb_set\(b\.prompt, '\{marks\}', '1'::jsonb\)/);
  assert.ok(!/set marks\s*=/i.test(executable), "marks must never be treated as a top-level column");
});

test("no other column is ever SET -- prompt is the only column this migration ever writes", () => {
  const setColumns = [...executable.matchAll(/\bset\s+([a-z_]+)\s*=/gi)].map((m) => m[1].toLowerCase());
  assert.deepEqual(new Set(setColumns), new Set(["prompt"]));
});

test("eligibility_status, active, question_group_id, group_order, subpart_label, and marking_mode are never SET anywhere in this migration's real SQL", () => {
  for (const column of ["eligibility_status", "active", "question_group_id", "group_order", "subpart_label", "marking_mode", "family_id", "skill", "content_difficulty"]) {
    assert.ok(!new RegExp(`\\bset\\s+${column}\\s*=`, "i").test(executable), `unexpected SET of "${column}"`);
  }
});

test("byte-for-byte preservation is positively proven: a pre-write snapshot of (prompt - 'marks') is captured and compared against the post-write value for both rows", () => {
  assert.match(executable, /prompt_without_marks/);
  assert.match(executable, /select b\.id, b\.prompt - 'marks'/);
  assert.match(executable, /where \(b\.prompt - 'marks'\) = s\.prompt_without_marks/);
  assert.match(executable, /post-write preservation check failed/);
});

test("post-write structural verification re-checks eligibility_status, active, question_group_id, and marking_mode remain exactly as the preconditions found them", () => {
  assert.match(executable, /post-write structural verification failed/);
  const postWriteBlock = executable.match(/if \(select count\(\*\) from public\.ali_question_bank[\s\S]*?post-write structural verification failed/)![0];
  assert.match(postWriteBlock, /eligibility_status = 'mock_eligible'/);
  assert.match(postWriteBlock, /active = true/);
  assert.match(postWriteBlock, /question_group_id = 'mock-mr08-rotation'/);
  assert.match(postWriteBlock, /marking_mode = 'deterministic'/);
});

test("preconditions present and live: active, subject='maths', family_id, eligibility_status, marking_mode, grouping metadata (drift guard), and the marks=2 pre-state check", () => {
  assert.match(executable, /where b\.active = true/);
  assert.match(executable, /where b\.subject = 'maths'/);
  assert.match(executable, /where b\.family_id = 'mock-mr08-rotation'/);
  assert.match(executable, /where b\.eligibility_status = 'mock_eligible'/);
  assert.match(executable, /where b\.marking_mode = 'deterministic'/);
  assert.match(executable, /b\.group_order = m\.expected_group_order/);
  assert.match(executable, /b\.subpart_label = m\.expected_subpart_label/);
  assert.match(executable, /where \(b\.prompt->>'marks'\)::numeric = 2/);
});

test("fails safely: at least 6 RAISE EXCEPTION guards and exactly 2 RAISE NOTICE guarding the two safe branches (apply, already-applied)", () => {
  const exceptionCount = (executable.match(/raise exception/g) || []).length;
  const noticeCount = (executable.match(/raise notice/g) || []).length;
  assert.ok(exceptionCount >= 6, `expected several RAISE EXCEPTION guards, found ${exceptionCount}`);
  assert.equal(noticeCount, 2);
});

test("idempotent structure: the already-applied branch (elsif v_already_marks1_count = 2) contains no UPDATE statement", () => {
  const alreadyAppliedBranch = executable.match(/elsif v_already_marks1_count = 2 then[\s\S]*?else/)![0];
  assert.ok(!/\bupdate\s+public\.ali_question_bank\b/i.test(alreadyAppliedBranch));
});

test("touches only public.ali_question_bank via UPDATE -- the only INSERT targets are local temp tables, never a real content or governance table", () => {
  const updateTargets = [...executable.matchAll(/update\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(updateTargets), new Set(["ali_question_bank"]));
  const insertTargets = [...executable.matchAll(/insert into\s+(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["tmp_rotation_marks_correction_map", "tmp_rotation_pre_snapshot"]));
  assert.ok(!/\bdelete from\b/i.test(executable));
});

test("no ali_family_review, ali_mock_form, or ali_mock_attempt mutation: none of those tables is mentioned anywhere in this migration's real SQL", () => {
  for (const table of ["ali_family_review", "ali_mock_form", "ali_mock_attempt"]) {
    assert.ok(!executable.includes(table));
  }
});

test("no scoring function is created, replaced, or altered -- no CREATE OR REPLACE FUNCTION, no partial-credit or coordinate-splitting mechanism introduced", () => {
  assert.ok(!/create (or replace )?function/i.test(executable));
});

test("Practice isolation: no practice_eligible reference anywhere", () => {
  assert.ok(!executable.includes("practice_eligible"));
});

test("no other ali_question_bank row is ever reachable: the target map is exactly 2 rows, and every WHERE clause joins through it", () => {
  const rows = parseValuesRows();
  assert.equal(rows.length, 2);
  assert.ok(!/'mock-mr02-|'mock-mr05-|'mock-mr09-|'mock-mr10-fairprep|'mock-mr09-runningclub/.test(executable));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header, and explicitly documents its dependency on migration 117", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /migration 117/);
});

test("the header states the projected closure baseline (48 rows / 24 experiences / 48 marks) and explicitly does not compensate elsewhere -- exactly one jsonb_set call, scoped to exactly these two rows", () => {
  const collapsed = sql.replace(/\n--\s?/g, " ");
  assert.match(collapsed, /48 rows, 24 numbered experiences.*48 total marks/);
  assert.equal((executable.match(/jsonb_set/g) || []).length, 1);
});

test("governance: header explicitly states this is a marks-metadata correction only, not an educational-content or answer-contract change, and no new review row is created", () => {
  assert.match(sql, /marks-metadata correction only, not an educational-content/);
  assert.match(sql, /no new review row is created/);
});
