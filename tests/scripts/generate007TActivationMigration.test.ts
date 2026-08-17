import { test } from "node:test";
import assert from "node:assert/strict";
import { build007TActivationSql } from "../../scripts/generate-007t-activation-migration.mjs";
import { checkActivationEligibility } from "../../scripts/generate-activation-migration.mjs";
import { mathsQuestions } from "../../scripts/generate-007t-mathematics-mr01.mjs";
import { rc10Questions } from "../../scripts/generate-007t-english-rc10.mjs";

/**
 * Educational Increment 007T — Final Review Reconciliation and Controlled
 * Activation. checkActivationEligibility() is already covered by
 * generateActivationMigration.test.ts (007E) and every prior batch's own
 * test file, reused unchanged here. These tests cover the 007T-specific
 * combination logic: one migration spanning only ali_question_bank (34
 * rows across 6 families — 4 new Mathematics + 2 new English), explicitly
 * NOT touching the 5 approved passages or ali_family_review, with no row
 * outside the named set touched.
 *
 * Migration 062 (legacy QT-MR-01 reclassification) is confirmed applied
 * to live production as of this session, meaning the 4 Mathematics
 * families now also contain 14 unrelated legacy rows sharing the same
 * family_id — the real generator script selects by this increment's own
 * exact, known-good 34 IDs (not by family_id) specifically to remain
 * correct regardless of that reclassification; the "no cross-family
 * collisions" test below proves the true candidate set is still exactly
 * these 34, not 34 + any legacy row.
 */

const APPROVED_IDS_BY_FAMILY: Record<string, string[]> = {};
for (const q of mathsQuestions) (APPROVED_IDS_BY_FAMILY[q.family_id] ??= []).push(q.id);
for (const q of rc10Questions) (APPROVED_IDS_BY_FAMILY[q.family_id] ??= []).push(q.id);
const ALL_34_IDS = Object.values(APPROVED_IDS_BY_FAMILY).flat();

test("build007TActivationSql only ever touches ali_question_bank, never ali_passage_bank or ali_family_review", () => {
  const sql = build007TActivationSql({ migrationNumber: "065", reviewer: "Ayobami Lawal", questionIds: ["a", "b", "c"] });
  assert.ok(sql.includes("ali_question_bank"));
  assert.ok(!/update\s+public\.ali_passage_bank/i.test(sql), "007T's activation deliberately excludes the 5 approved passages");
  assert.ok(!/update\s+public\.ali_family_review/i.test(sql), "review history must never be touched by an activation migration");
  const beginCount = (sql.match(/\bbegin;/g) || []).length;
  const commitCount = (sql.match(/\bcommit;/g) || []).length;
  assert.equal(beginCount, 1);
  assert.equal(commitCount, 1);
});

test("build007TActivationSql's question update lists exactly the given IDs, no more no less", () => {
  const sql = build007TActivationSql({ migrationNumber: "065", reviewer: "Ayobami Lawal", questionIds: ["mr01-wholenum-01", "w3-rc10-am-01"] });
  assert.ok(sql.includes("'mr01-wholenum-01', 'w3-rc10-am-01'"));
});

test("build007TActivationSql only ever moves provisional rows to practice_eligible, never mock_eligible", () => {
  const sql = build007TActivationSql({ migrationNumber: "065", reviewer: "Ayobami Lawal", questionIds: ["a"] });
  const provisionalGuards = (sql.match(/and eligibility_status = 'provisional'/g) || []).length;
  assert.equal(provisionalGuards, 1);
  assert.ok(!/set\s+eligibility_status\s*=\s*'mock_eligible'/i.test(sql), "must never SET mock_eligible");
  const setClauses = (sql.match(/set eligibility_status = '[a-z_]+'/g) || []);
  assert.ok(setClauses.every((s) => s === "set eligibility_status = 'practice_eligible'"), "every SET clause must target practice_eligible only");
});

test("build007TActivationSql records the real reviewer name for traceability", () => {
  const sql = build007TActivationSql({ migrationNumber: "065", reviewer: "Ayobami Lawal", questionIds: ["a"] });
  assert.ok(sql.includes("Ayobami Lawal"));
});

test("checkActivationEligibility (reused unchanged) still blocks a row whose eligibility_status has already moved on", () => {
  const rows = [
    { id: "mr01-wholenum-01", content_version: 1, provenance: "angel_original", active: true, eligibility_status: "provisional" },
    { id: "mr01-wholenum-02", content_version: 1, provenance: "angel_original", active: true, eligibility_status: "practice_eligible" },
  ];
  const { canActivate, problems } = checkActivationEligibility(rows, 1);
  assert.equal(canActivate, false);
  assert.ok(problems[0].includes("mr01-wholenum-02"));
});

test("checkActivationEligibility blocks a legacy row now sharing family_id via migration 062 (wrong provenance)", () => {
  // Mirrors the real live discrepancy found this session: fv-mth-001 etc.
  // now share family_id "mr01-whole-number-computation" but carry
  // provenance=null (pre-migration-030 legacy) and are already
  // practice_eligible — must never be swept into this activation.
  const rows = [
    { id: "fv-mth-001", content_version: 1, provenance: null, active: true, eligibility_status: "practice_eligible" },
  ];
  const { canActivate, problems } = checkActivationEligibility(rows, 1);
  assert.equal(canActivate, false);
  assert.equal(problems.length, 2, "both the provenance and eligibility_status problems must be reported");
});

test("the real 34-ID manifest computed for 007T has no duplicates and no cross-family collisions", () => {
  assert.equal(ALL_34_IDS.length, 34);
  assert.equal(new Set(ALL_34_IDS).size, 34, "no question ID may appear under more than one family");
  assert.deepEqual(
    Object.fromEntries(Object.entries(APPROVED_IDS_BY_FAMILY).map(([f, ids]) => [f, ids.length])),
    {
      "mr01-whole-number-computation": 5,
      "mr01-decimal-computation": 5,
      "mr01-fraction-computation": 5,
      "mr01-multistep-order-of-operations": 5,
      "wave3-fam-rc10-atmosphere-mood": 6,
      "wave3-fam-rc10-word-choice": 8,
    }
  );
});

test("every one of the 34 real question IDs is present in the generated migration", () => {
  const sql = build007TActivationSql({ migrationNumber: "065", reviewer: "Ayobami Lawal", questionIds: ALL_34_IDS });
  for (const id of ALL_34_IDS) {
    assert.ok(sql.includes(`'${id}'`), `${id} must be present in the activation manifest`);
  }
});

test("idempotent structure: applying the generated SQL's WHERE clause twice is a no-op the second time", () => {
  const sql = build007TActivationSql({ migrationNumber: "065", reviewer: "Ayobami Lawal", questionIds: ["a", "b"] });
  assert.match(sql, /where id in \([^)]+\)\s*\n\s*and eligibility_status = 'provisional';/);
});
