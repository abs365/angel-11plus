import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics Shared-Scenario Presentation Correction — Explicit
 * Shared-Stem Content Contract for mock-mr06-linkedvalues (Decision
 * 180). Structural tests against migration 121's own SQL text,
 * mirroring migration 117/118's own established assertion-and-refuse
 * convention exactly.
 */

const sql = fs.readFileSync("supabase/migrations/121_mock_mathematics_linkedvalues_shared_stem_contract.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const STEM = "A collector has three bags of marbles: red, blue and green. The blue bag has 6 more marbles than the red bag. The green bag has 3 times as many marbles as the blue bag. Altogether, the three bags contain 64 marbles.";

test("targets exactly the 3 mock-mr06-linkedvalues rows, no more no less", () => {
  const match = executable.match(/insert into tmp_linkedvalues_target[\s\S]*?values([\s\S]*?);/);
  assert.ok(match, "expected the tmp_linkedvalues_target VALUES list to be present");
  const ids = [...match![1].matchAll(/\('([\w-]+)'\)/g)].map((m) => m[1]);
  assert.deepEqual(ids.sort(), [
    "mock-mr06-linkedvalues-01", "mock-mr06-linkedvalues-02", "mock-mr06-linkedvalues-03",
  ].sort());
});

test("the exact stem string matches the real, verified common prefix of all 3 rows' stored question text (this test re-derives it independently, not copied from the SQL)", () => {
  assert.ok(executable.includes(`v_stem text := '${STEM}';`), "expected v_stem to be set to exactly the independently-verified stem string");
  const originalQuestions = fs.readFileSync("supabase/migrations/119_mock_mathematics_structural_capacity_increment001_algebraic_system.sql", "utf8");
  const blocks = [...originalQuestions.matchAll(/\$json\$(\{[\s\S]*?\})\$json\$/g)].map((m) => JSON.parse(m[1]));
  for (const block of blocks) {
    assert.ok(block.question.startsWith(STEM), `${block.id}'s real stored question text must start with the exact stem`);
    assert.ok(block.question.slice(STEM.length).trimStart().length > 0, `${block.id} must have a non-empty tail after the stem`);
  }
});

test("sharedStem is written via jsonb_set on the prompt column, never assumed to be a top-level column", () => {
  assert.match(executable, /set prompt = jsonb_set\(b\.prompt, '\{sharedStem\}', to_jsonb\(v_stem\)\)/);
  assert.ok(!/set sharedstem\s*=/i.test(executable), "sharedStem must never be treated as a top-level column");
});

test("no other column is ever SET -- prompt is the only column this migration ever writes", () => {
  const setColumns = [...executable.matchAll(/\bset\s+([a-z_]+)\s*=/gi)].map((m) => m[1].toLowerCase());
  assert.deepEqual(new Set(setColumns), new Set(["prompt"]));
});

test("eligibility_status, active, family_id, question_group_id, group_order, subpart_label, marking_mode, question, answer, marks are never SET anywhere", () => {
  for (const column of ["eligibility_status", "active", "family_id", "question_group_id", "group_order", "subpart_label", "marking_mode", "question", "answer", "marks"]) {
    assert.ok(!new RegExp(`\\bset\\s+${column}\\s*=`, "i").test(executable), `unexpected SET of "${column}"`);
  }
});

test("live content-integrity precondition: every target row's stored question text must LIKE-match the stem as a prefix before any write", () => {
  assert.match(executable, /where \(b\.prompt->>'question'\) like \(replace\(replace\(v_stem, '%', '\\%'\), '_', '\\_'\) \|\| '%'\)/);
  assert.match(executable, /Content may have drifted since migration 119/);
});

test("byte-for-byte preservation is positively proven: a pre-write snapshot of (prompt - 'sharedStem') is captured and compared against the post-write value for all 3 rows", () => {
  assert.match(executable, /prompt_without_shared_stem/);
  assert.match(executable, /select b\.id, b\.prompt - 'sharedStem'/);
  assert.match(executable, /where \(b\.prompt - 'sharedStem'\) = s\.prompt_without_shared_stem/);
  assert.match(executable, /post-write preservation check failed/);
});

test("post-write structural verification re-checks eligibility_status, active, and family_id remain exactly as the preconditions found them", () => {
  const postWriteBlock = executable.match(/where b\.eligibility_status = 'authentic_assessment_candidate' and b\.active = true[\s\S]*?post-write structural verification failed/)![0];
  assert.match(postWriteBlock, /family_id = 'mock-mr06-linkedvalues'/);
});

test("preconditions present and live: active, subject='maths', family_id, eligibility_status=authentic_assessment_candidate (never mock_eligible/independently_validated)", () => {
  assert.match(executable, /where b\.active = true/);
  assert.match(executable, /where b\.subject = 'maths'/);
  assert.match(executable, /where b\.family_id = 'mock-mr06-linkedvalues'/);
  assert.match(executable, /where b\.eligibility_status = 'authentic_assessment_candidate'/);
  assert.ok(!executable.includes("'mock_eligible'"));
  assert.ok(!executable.includes("'independently_validated'"));
});

test("fails safely: at least 7 RAISE EXCEPTION guards and exactly 2 RAISE NOTICE guarding the two safe branches (apply, already-applied)", () => {
  const exceptionCount = (executable.match(/raise exception/g) || []).length;
  const noticeCount = (executable.match(/raise notice/g) || []).length;
  assert.ok(exceptionCount >= 7, `expected several RAISE EXCEPTION guards, found ${exceptionCount}`);
  assert.equal(noticeCount, 2);
});

test("idempotent structure: the already-applied branch (v_already_set_count = 3) contains no UPDATE statement", () => {
  const alreadyAppliedBranch = executable.match(/if v_already_set_count = 3 then[\s\S]*?elsif/)![0];
  assert.ok(!/\bupdate\s+public\.ali_question_bank\b/i.test(alreadyAppliedBranch));
});

test("a third, unexpected partial state (neither 0 nor 3 already set) is explicitly refused, not silently patched", () => {
  assert.match(executable, /unexpected partial state/);
});

test("touches only public.ali_question_bank via UPDATE -- INSERT targets only local temp tables, never a real content or governance table", () => {
  const updateTargets = [...executable.matchAll(/update\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(updateTargets), new Set(["ali_question_bank"]));
  const insertTargets = [...executable.matchAll(/insert into\s+(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["tmp_linkedvalues_target", "tmp_linkedvalues_pre_snapshot"]));
  assert.ok(!/\bdelete from\b/i.test(executable));
});

test("no ali_family_review, ali_mock_form, or ali_mock_attempt mutation anywhere", () => {
  for (const table of ["ali_family_review", "ali_mock_form", "ali_mock_attempt"]) {
    assert.ok(!executable.includes(table));
  }
});

test("no scoring function is created, replaced, or altered", () => {
  assert.ok(!/create (or replace )?function/i.test(executable));
});

test("Practice isolation: no practice_eligible reference anywhere", () => {
  assert.ok(!executable.includes("practice_eligible"));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header, documents dependency on migrations 119/120", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /migrations 119\/120/);
});
