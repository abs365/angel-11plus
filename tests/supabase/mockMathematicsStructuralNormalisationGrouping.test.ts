import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics Mock Structural Normalisation — Grouping-Metadata
 * Application (Decision 166, approving Decision 165 Part 8's own
 * row-level map exactly). Structural tests against migration 112's own
 * SQL text, mirroring tests/supabase/mockMathematicsPoolEligiblePromotion
 * .test.ts's own established assertion-and-refuse testing discipline,
 * applied here to a metadata-only (not eligibility_status) mutation.
 */

const sql = fs.readFileSync("supabase/migrations/112_mock_mathematics_structural_normalisation_grouping.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const APPROVED_MAP: Array<{ id: string; familyId: string; groupOrder: number; subpartLabel: string }> = [
  { id: "mock-mr02-invdiv-01", familyId: "mock-mr02-invdiv", groupOrder: 1, subpartLabel: "(a)" },
  { id: "mock-mr02-invdiv-02", familyId: "mock-mr02-invdiv", groupOrder: 2, subpartLabel: "(b)" },
  { id: "mock-mr02-invdiv-03", familyId: "mock-mr02-invdiv", groupOrder: 3, subpartLabel: "(c)" },
  { id: "mock-mr02-twostep-01", familyId: "mock-mr02-twostep", groupOrder: 1, subpartLabel: "(a)" },
  { id: "mock-mr02-twostep-02", familyId: "mock-mr02-twostep", groupOrder: 2, subpartLabel: "(b)" },
  { id: "mock-mr02-twostep-03", familyId: "mock-mr02-twostep", groupOrder: 3, subpartLabel: "(c)" },
  { id: "mock-mr03-unitconv-01", familyId: "mock-mr03-unitconv", groupOrder: 1, subpartLabel: "(a)" },
  { id: "mock-mr03-unitconv-02", familyId: "mock-mr03-unitconv", groupOrder: 2, subpartLabel: "(b)" },
  { id: "mock-mr03-unitconv-03", familyId: "mock-mr03-unitconv", groupOrder: 3, subpartLabel: "(c)" },
  { id: "mock-mr05-forward-01", familyId: "mock-mr05-forward", groupOrder: 1, subpartLabel: "(a)" },
  { id: "mock-mr05-forward-02", familyId: "mock-mr05-forward", groupOrder: 2, subpartLabel: "(b)" },
  { id: "mock-mr05-inverse-01", familyId: "mock-mr05-inverse", groupOrder: 1, subpartLabel: "(a)" },
  { id: "mock-mr05-inverse-02", familyId: "mock-mr05-inverse", groupOrder: 2, subpartLabel: "(b)" },
  { id: "mock-mr13-bestvalue-01", familyId: "mock-mr13-bestvalue", groupOrder: 1, subpartLabel: "(a)" },
  { id: "mock-mr13-bestvalue-02", familyId: "mock-mr13-bestvalue", groupOrder: 2, subpartLabel: "(b)" },
  { id: "mock-mr04-percentchange-01", familyId: "mock-mr04-percentchange", groupOrder: 1, subpartLabel: "(a)" },
  { id: "mock-mr04-percentchange-02", familyId: "mock-mr04-percentchange", groupOrder: 2, subpartLabel: "(b)" },
  { id: "mock-mr04-reversepercent-01", familyId: "mock-mr04-reversepercent", groupOrder: 1, subpartLabel: "(a)" },
  { id: "mock-mr04-reversepercent-02", familyId: "mock-mr04-reversepercent", groupOrder: 2, subpartLabel: "(b)" },
  { id: "mock-mr06-sumdiff-01", familyId: "mock-mr06-sumdiff", groupOrder: 1, subpartLabel: "(a)" },
  { id: "mock-mr06-sumdiff-02", familyId: "mock-mr06-sumdiff", groupOrder: 2, subpartLabel: "(b)" },
  { id: "mock-mr06-multiplerelation-01", familyId: "mock-mr06-multiplerelation", groupOrder: 1, subpartLabel: "(a)" },
  { id: "mock-mr06-multiplerelation-02", familyId: "mock-mr06-multiplerelation", groupOrder: 2, subpartLabel: "(b)" },
  { id: "mock-mr07-triangleanglesum-01", familyId: "mock-mr07-triangleanglesum", groupOrder: 1, subpartLabel: "(a)" },
  { id: "mock-mr07-triangleanglesum-02", familyId: "mock-mr07-triangleanglesum", groupOrder: 2, subpartLabel: "(b)" },
  { id: "mock-mr07-isoscelesproperty-01", familyId: "mock-mr07-isoscelesproperty", groupOrder: 1, subpartLabel: "(a)" },
  { id: "mock-mr07-isoscelesproperty-02", familyId: "mock-mr07-isoscelesproperty", groupOrder: 2, subpartLabel: "(b)" },
  { id: "mock-mr10-forwardschedule-01", familyId: "mock-mr10-forwardschedule", groupOrder: 1, subpartLabel: "(a)" },
  { id: "mock-mr10-forwardschedule-02", familyId: "mock-mr10-forwardschedule", groupOrder: 2, subpartLabel: "(b)" },
  { id: "mock-mr10-reverseschedule-01", familyId: "mock-mr10-reverseschedule", groupOrder: 1, subpartLabel: "(a)" },
  { id: "mock-mr10-reverseschedule-02", familyId: "mock-mr10-reverseschedule", groupOrder: 2, subpartLabel: "(b)" },
  { id: "mock-mr11-truefalsejudgement-01", familyId: "mock-mr11-truefalsejudgement", groupOrder: 1, subpartLabel: "(a)" },
  { id: "mock-mr11-truefalsejudgement-02", familyId: "mock-mr11-truefalsejudgement", groupOrder: 2, subpartLabel: "(b)" },
  { id: "mock-mr11-propertysearch-01", familyId: "mock-mr11-propertysearch", groupOrder: 1, subpartLabel: "(a)" },
  { id: "mock-mr11-propertysearch-02", familyId: "mock-mr11-propertysearch", groupOrder: 2, subpartLabel: "(b)" },
  { id: "mock-mr01-directcalc-01", familyId: "mock-mr01-directcalc", groupOrder: 1, subpartLabel: "(a)" },
  { id: "mock-mr01-directcalc-02", familyId: "mock-mr01-directcalc", groupOrder: 2, subpartLabel: "(b)" },
  { id: "mock-mr08-rotation-01", familyId: "mock-mr08-rotation", groupOrder: 1, subpartLabel: "(a)" },
  { id: "mock-mr08-rotation-02", familyId: "mock-mr08-rotation", groupOrder: 2, subpartLabel: "(b)" },
  { id: "mock-mr12-reversemean-01", familyId: "mock-mr12-reversemean", groupOrder: 1, subpartLabel: "(a)" },
  { id: "mock-mr12-reversemean-02", familyId: "mock-mr12-reversemean", groupOrder: 2, subpartLabel: "(b)" },
];

const EXCLUDED_IDS = [
  "mock-mr09-data-01", "mock-mr09-data-02", "mock-mr09-data-03",
  "mock-mr01mr10-costumeschedule-01a", "mock-mr01mr10-costumeschedule-01b",
  "mock-mr01mr10-costumeschedule-02a", "mock-mr01mr10-costumeschedule-02b",
  "mock-mr03mr07-perimeterarea-01a", "mock-mr03mr07-perimeterarea-01b",
  "mock-mr03mr07-perimeterarea-02a", "mock-mr03mr07-perimeterarea-02b",
];

function parseValuesRows(): Array<[string, string, string, string]> {
  const match = executable.match(/insert into tmp_normalisation_map[\s\S]*?values([\s\S]*?);/);
  assert.ok(match, "expected the tmp_normalisation_map VALUES list to be present");
  const rowMatches = [...match![1].matchAll(/\('([\w-]+)', '([\w-]+)', (\d+), '(\([a-c]\))'\)/g)];
  return rowMatches.map((m) => [m[1], m[2], m[3], m[4]]);
}

test("exact 41-row approved map: the VALUES list contains exactly 41 rows, matching the approved (id, family_id, group_order, subpart_label) tuples exactly, no more no less", () => {
  const rows = parseValuesRows();
  assert.equal(rows.length, 41);
  const actual = rows
    .map(([id, familyId, groupOrder, subpartLabel]) => `${id}|${familyId}|${groupOrder}|${subpartLabel}`)
    .sort();
  const expected = APPROVED_MAP.map((r) => `${r.id}|${r.familyId}|${r.groupOrder}|${r.subpartLabel}`).sort();
  assert.deepEqual(actual, expected);
});

test("exactly 19 distinct family_id values in the approved map, matching 19 Classification-A families", () => {
  const rows = parseValuesRows();
  const families = new Set(rows.map((r) => r[1]));
  assert.equal(families.size, 19);
});

test("group_order sequencing is 1-based and contiguous within every family, matching each family's own -01/-02[/-03] row count", () => {
  const rows = parseValuesRows();
  const byFamily = new Map<string, number[]>();
  for (const [, familyId, groupOrder] of rows) {
    const list = byFamily.get(familyId) ?? [];
    list.push(Number(groupOrder));
    byFamily.set(familyId, list);
  }
  for (const [familyId, orders] of byFamily) {
    const sorted = [...orders].sort((a, b) => a - b);
    assert.deepEqual(sorted, Array.from({ length: sorted.length }, (_, i) => i + 1), `${familyId}: group_order must be exactly 1..N`);
  }
});

test("subpart_label sequencing is (a)/(b)[/(c)] matching group_order 1/2/3 exactly", () => {
  const rows = parseValuesRows();
  const expectedLabel: Record<string, string> = { "1": "(a)", "2": "(b)", "3": "(c)" };
  for (const [id, , groupOrder, subpartLabel] of rows) {
    assert.equal(subpartLabel, expectedLabel[groupOrder], `${id}: subpart_label must match group_order`);
  }
});

test("none of the 3 excluded groups (mr09-data, costumeschedule, perimeterarea) is referenced anywhere in this migration's real SQL", () => {
  for (const id of EXCLUDED_IDS) {
    assert.ok(!executable.includes(id), `unexpected reference to excluded id "${id}"`);
  }
});

test("the two Classification-B candidate pairs remain two separate families in the approved map -- never combined into one cross-family question_group_id", () => {
  const rows = parseValuesRows();
  const familyOf = (id: string) => rows.find((r) => r[0] === id)?.[1];
  assert.equal(familyOf("mock-mr04-percentchange-01"), "mock-mr04-percentchange");
  assert.equal(familyOf("mock-mr04-reversepercent-01"), "mock-mr04-reversepercent");
  assert.equal(familyOf("mock-mr10-forwardschedule-01"), "mock-mr10-forwardschedule");
  assert.equal(familyOf("mock-mr10-reverseschedule-01"), "mock-mr10-reverseschedule");
});

test("question_group_id is written from the row's own family_id column, never a restated literal -- 'set question_group_id = b.family_id' appears exactly once", () => {
  const matches = executable.match(/set question_group_id\s*=\s*b\.family_id/g) || [];
  assert.equal(matches.length, 1);
  assert.ok(!/set question_group_id\s*=\s*'/.test(executable), "question_group_id must never be set from a literal string");
});

test("marking_mode is set to exactly 'deterministic' -- the only literal this migration ever assigns to that column", () => {
  const setStatements = [...executable.matchAll(/set[\s\S]*?marking_mode\s*=\s*'(\w+)'/g)].map((m) => m[1]);
  assert.ok(setStatements.length >= 1);
  assert.ok(setStatements.every((v) => v === "deterministic"));
});

test("exactly 4 columns are ever SET on ali_question_bank: question_group_id, group_order, subpart_label, marking_mode -- no other column, and eligibility_status is never SET anywhere", () => {
  const updateBlock = executable.match(/update public\.ali_question_bank b\s*set([\s\S]*?)from tmp_normalisation_map/)![1];
  const setColumns = [...updateBlock.matchAll(/([a-z_]+)\s*=/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(setColumns), new Set(["question_group_id", "group_order", "subpart_label", "marking_mode"]));
  assert.ok(!executable.includes("set eligibility_status"), "this migration must never write eligibility_status");
});

test("no content field is ever SET: prompt/answer/marks/explanation/family_id/provenance/content_version/active/skill/subject are read-only in this migration", () => {
  for (const column of ["prompt", "answer", "marks", "explanation", "family_id", "provenance", "content_version", "active", "skill", "subject"]) {
    assert.ok(!new RegExp(`\\bset\\s+${column}\\s*=`, "i").test(executable), `unexpected SET of "${column}"`);
  }
});

test("preconditions present and live: active, subject='maths', eligibility_status='mock_eligible', family_id match, marking_mode null-or-deterministic, marks total, and the NULL pre-state check", () => {
  assert.match(executable, /where b\.active = true/);
  assert.match(executable, /where b\.subject = 'maths'/);
  assert.match(executable, /where b\.eligibility_status = 'mock_eligible'/);
  assert.match(executable, /where b\.family_id = m\.expected_family_id/);
  assert.match(executable, /where b\.marking_mode is null or b\.marking_mode = 'deterministic'/);
  assert.match(executable, /sum\(\(b\.prompt->>'marks'\)::numeric\)/);
  assert.match(executable, /where b\.question_group_id is null and b\.group_order is null and b\.subpart_label is null/);
});

test("marks-total precondition is checked against exactly 60, matching Decision 165 Part 6's own independent summation", () => {
  assert.match(executable, /v_marks_total is distinct from 60/);
});

test("fails safely: at least 3 RAISE EXCEPTION guards (missing rows, precondition failure, family drift, marking-mode drift, marks drift, mixed state, post-write verification) and exactly 2 RAISE NOTICE guarding the two safe branches (apply, already-applied)", () => {
  const exceptionCount = (executable.match(/raise exception/g) || []).length;
  const noticeCount = (executable.match(/raise notice/g) || []).length;
  assert.ok(exceptionCount >= 3, `expected several RAISE EXCEPTION guards, found ${exceptionCount}`);
  assert.equal(noticeCount, 2);
});

test("idempotent structure: the already-applied branch (elsif v_applied_state_count = 41) contains no UPDATE statement", () => {
  const alreadyAppliedBranch = executable.match(/elsif v_applied_state_count = 41 then[\s\S]*?else/)![0];
  assert.ok(!/\bupdate\s+public\.ali_question_bank\b/i.test(alreadyAppliedBranch));
});

test("post-write verification re-checks the exact 41-row post-state, family_id unchanged, eligibility_status still mock_eligible, and marks total still 60, before the notice is raised", () => {
  const applyBranch = executable.match(/if v_null_state_count = 41 then([\s\S]*?)elsif v_applied_state_count = 41/)![1];
  assert.match(applyBranch, /post-write verification failed/i);
  assert.match(applyBranch, /b\.family_id = m\.expected_family_id/);
  assert.match(applyBranch, /b\.eligibility_status = 'mock_eligible'/);
  assert.match(applyBranch, /post-write marks total/i);
});

test("touches only public.ali_question_bank via UPDATE -- the only INSERT target is the local temp table, not any real content table", () => {
  const updateTargets = [...executable.matchAll(/update\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(updateTargets), new Set(["ali_question_bank"]));
  const insertTargets = [...executable.matchAll(/insert into\s+(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["tmp_normalisation_map"]));
  assert.ok(!/\bdelete from\b/i.test(executable));
});

test("no RLS, GRANT/REVOKE, policy, or function change -- purely a data migration against existing columns", () => {
  for (const keyword of ["create policy", "alter policy", "grant ", "revoke ", "create or replace function", "create function", "create table public", "alter table"]) {
    assert.ok(!executable.toLowerCase().includes(keyword), `unexpected "${keyword}" -- this migration must not touch RLS/grants/functions/schema`);
  }
});

test("no ali_family_review, ali_mock_form, or ali_mock_attempt mutation: none of those tables is mentioned anywhere in this migration's real SQL", () => {
  for (const table of ["ali_family_review", "ali_mock_form", "ali_mock_attempt"]) {
    assert.ok(!executable.includes(table));
  }
});

test("English and Writing content is never referenced anywhere in this Mathematics-only migration", () => {
  assert.ok(!/mock-eng-|mock-writing-/.test(executable));
  assert.ok(!/subject = 'english'|subject = 'writing'/i.test(executable));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header, and explicitly documents its dependency on migrations 093/104/106/107/105", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /093/);
  assert.match(sql, /104\/106\/107/);
  assert.match(sql, /105/);
});
