import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { isMockEligibleCandidate } from "../../lib/ali/mockEligibility";

/**
 * Mathematics First Mock Foundation — Pool-Level Mock Eligibility
 * Promotion (Decision 160). Structural tests against migration 105's own
 * SQL text, mirroring migrations 090/094/101's own established
 * promotion-migration testing discipline exactly, scaled to a 48-row,
 * 3-batch pool for the first time.
 */

const sql = fs.readFileSync("supabase/migrations/105_mock_mathematics_pool_eligible_promotion.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const BATCH_001_IDS = [
  "mock-mr02-invdiv-01", "mock-mr02-invdiv-02", "mock-mr02-invdiv-03",
  "mock-mr02-twostep-01", "mock-mr02-twostep-02", "mock-mr02-twostep-03",
  "mock-mr03-unitconv-01", "mock-mr03-unitconv-02", "mock-mr03-unitconv-03",
  "mock-mr05-forward-01", "mock-mr05-forward-02",
  "mock-mr05-inverse-01", "mock-mr05-inverse-02",
  "mock-mr09-data-01", "mock-mr09-data-02", "mock-mr09-data-03",
  "mock-mr13-bestvalue-01", "mock-mr13-bestvalue-02",
];
const BATCH_002_IDS = [
  "mock-mr04-percentchange-01", "mock-mr04-percentchange-02",
  "mock-mr04-reversepercent-01", "mock-mr04-reversepercent-02",
  "mock-mr06-sumdiff-01", "mock-mr06-sumdiff-02",
  "mock-mr06-multiplerelation-01", "mock-mr06-multiplerelation-02",
  "mock-mr07-triangleanglesum-01", "mock-mr07-triangleanglesum-02",
  "mock-mr07-isoscelesproperty-01", "mock-mr07-isoscelesproperty-02",
  "mock-mr10-forwardschedule-01", "mock-mr10-forwardschedule-02",
  "mock-mr10-reverseschedule-01", "mock-mr10-reverseschedule-02",
  "mock-mr11-truefalsejudgement-01", "mock-mr11-truefalsejudgement-02",
  "mock-mr11-propertysearch-01", "mock-mr11-propertysearch-02",
];
const BATCH_003_IDS = [
  "mock-mr01-directcalc-01", "mock-mr01-directcalc-02",
  "mock-mr08-rotation-01", "mock-mr08-rotation-02",
  "mock-mr12-reversemean-01", "mock-mr12-reversemean-02",
  "mock-mr01mr10-costumeschedule-01a", "mock-mr01mr10-costumeschedule-01b",
  "mock-mr01mr10-costumeschedule-02a", "mock-mr01mr10-costumeschedule-02b",
];
const ALL_48_IDS = [...BATCH_001_IDS, ...BATCH_002_IDS, ...BATCH_003_IDS];

test("exact 48-row allow-list: v_target_ids contains exactly the union of Batch 001 (18) + Batch 002 (20) + Batch 003 (10), no more no less, no duplicates", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.equal(ids.length, 48);
  assert.equal(new Set(ids).size, 48, "no duplicate IDs in the allow-list");
  assert.deepEqual(ids.sort(), [...ALL_48_IDS].sort());
});

test("the grouped costumeschedule family's all 4 subparts are present together in the same allow-list -- never a partial group", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  const groupedPresent = ["mock-mr01mr10-costumeschedule-01a", "mock-mr01mr10-costumeschedule-01b", "mock-mr01mr10-costumeschedule-02a", "mock-mr01mr10-costumeschedule-02b"]
    .every((id) => ids.includes(id));
  assert.ok(groupedPresent, "all 4 grouped subparts must be promoted together");
});

test("required source status: the precondition count and the UPDATE's own WHERE clause both require eligibility_status = 'independently_validated' before touching a row, scoped by subject = 'maths'", () => {
  const preconditionBlock = executable.match(/select count\(\*\) into v_pending_count[\s\S]*?subject = 'maths';/)![0];
  assert.match(preconditionBlock, /eligibility_status = 'independently_validated'/);
  assert.match(preconditionBlock, /active = true/);
  assert.match(preconditionBlock, /subject = 'maths'/);

  const updateBlock = executable.match(/update public\.ali_question_bank[\s\S]*?eligibility_status = 'independently_validated';/)![0];
  assert.match(updateBlock, /where id = any\(v_target_ids\)/);
  assert.match(updateBlock, /and eligibility_status = 'independently_validated';/);
});

test("resulting status is exactly 'mock_eligible' -- the only value this migration ever SETs", () => {
  const setStatements = [...executable.matchAll(/set eligibility_status = '(\w+)'/g)].map((m) => m[1]);
  assert.deepEqual(setStatements, ["mock_eligible"]);
});

test("no content-field UPDATE: the only column ever SET by this migration is eligibility_status -- no answer/prompt/explanation/family_id/provenance/content_version/grouping column is touched", () => {
  const setClauses = [...executable.matchAll(/\bset\s+([a-z_]+)\s*=/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(setClauses), new Set(["eligibility_status"]));
});

test("the 4 grouping columns are never SET by this migration -- promotion moves eligibility_status only, grouping metadata is preserved exactly as migration 095 left it", () => {
  for (const column of ["question_group_id", "group_order", "subpart_label", "marking_mode"]) {
    assert.ok(!new RegExp(`set\\s+${column}\\s*=`, "i").test(executable), `unexpected SET of "${column}"`);
  }
});

test("no ali_family_review mutation: this migration never mentions that table at all in its real SQL", () => {
  assert.ok(!executable.includes("ali_family_review"));
});

test("no ali_mock_form mutation: this migration never mentions that table at all in its real SQL", () => {
  assert.ok(!executable.includes("ali_mock_form"));
});

test("touches only public.ali_question_bank -- no other table appears in any FROM/UPDATE/INSERT/DELETE clause", () => {
  assert.ok(!/\binsert into\b|\bdelete from\b/i.test(executable));
  const updateTargets = [...executable.matchAll(/update\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(updateTargets), new Set(["ali_question_bank"]));
});

test("fails safely: exactly one RAISE EXCEPTION guarding the unexpected-state branch, exactly two RAISE NOTICE guarding the two safe branches (apply, already-applied)", () => {
  assert.equal((executable.match(/raise exception/g) || []).length, 1);
  assert.equal((executable.match(/raise notice/g) || []).length, 2);
});

test("idempotent structure: the already-mock_eligible branch is a no-op (no UPDATE statement inside it)", () => {
  const alreadyAppliedBranch = executable.match(/elsif v_already_validated_count = 48 then[\s\S]*?else/)![0];
  assert.ok(!/update /i.test(alreadyAppliedBranch));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header, and explicitly states its dependency on migration 104", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /after migration 104/);
});

test("the migration's own header explicitly documents the status-semantics proof (append-only ali_family_review, immutable migration history, linear eligibility model) -- not a silent assumption", () => {
  assert.match(sql, /STATUS SEMANTICS, verified before writing this migration/);
  assert.match(sql, /APPEND-ONLY/);
});

test("English and Writing content is never referenced anywhere in this Mathematics-only migration", () => {
  assert.ok(!/mock-eng-boathouse|mock-writing-/.test(executable));
});

test("no English/Writing subject targeted: the subject scoping is exactly 'maths'", () => {
  assert.ok(!/subject = 'english'|subject = 'writing'/i.test(executable));
});

test("Practice remains untouched: no practice_eligible reference, no ali_question_bank row outside the 48-ID allow-list can be matched by this migration's own WHERE clauses", () => {
  assert.ok(!executable.includes("practice_eligible"));
});

test("after this migration's own intended effect, the real, unmodified isMockEligibleCandidate() gate correctly ACCEPTS every one of the 48 promoted rows -- the inverse proof from every prior promotion migration's own test, which proved rejection at the independently_validated stage", () => {
  for (const id of ALL_48_IDS) {
    const afterPromotion = { eligibilityStatus: "mock_eligible" as const, active: true, subject: "maths" as const, pathway: ["csse" as const] };
    assert.equal(
      isMockEligibleCandidate(afterPromotion, "maths", "csse"),
      true,
      `${id}: mock_eligible + active + subject/pathway match must be accepted by the real Mock eligibility gate`
    );
  }
});
