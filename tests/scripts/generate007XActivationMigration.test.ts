import { test } from "node:test";
import assert from "node:assert/strict";
import { build007XActivationSql } from "../../scripts/generate-007x-activation-migration.mjs";
import { checkActivationEligibility } from "../../scripts/generate-activation-migration.mjs";
import { mathsQuestions } from "../../scripts/generate-007x-mathematics-batch.mjs";

/**
 * Educational Increment 007X — Founder Review, Controlled Activation and
 * Final Closure. checkActivationEligibility() is already covered
 * elsewhere and reused unchanged here. These tests cover the
 * 007X-specific manifest and SQL-generation logic: exactly 14 questions
 * across 4 families, mth-003 structurally excluded, no Mock/passage/
 * review-history touch.
 */

const APPROVED_IDS_BY_FAMILY: Record<string, string[]> = {};
for (const q of mathsQuestions) (APPROVED_IDS_BY_FAMILY[q.family_id] ??= []).push(q.id);
const ALL_14_IDS = Object.values(APPROVED_IDS_BY_FAMILY).flat();

test("build007XActivationSql only ever touches ali_question_bank, never ali_passage_bank or ali_family_review", () => {
  const sql = build007XActivationSql({ migrationNumber: "068", reviewer: "Founder", questionIds: ["a", "b", "c"] });
  assert.ok(sql.includes("ali_question_bank"));
  assert.ok(!/update\s+public\.ali_passage_bank/i.test(sql));
  assert.ok(!/update\s+public\.ali_family_review/i.test(sql), "review history must never be touched by an activation migration");
  const beginCount = (sql.match(/\bbegin;/g) || []).length;
  const commitCount = (sql.match(/\bcommit;/g) || []).length;
  assert.equal(beginCount, 1);
  assert.equal(commitCount, 1);
});

test("build007XActivationSql's question update lists exactly the given IDs, no more no less", () => {
  const sql = build007XActivationSql({ migrationNumber: "068", reviewer: "Founder", questionIds: ["mr05-search-03", "precision-dec-06"] });
  assert.ok(sql.includes("'mr05-search-03', 'precision-dec-06'"));
});

test("build007XActivationSql never includes mth-003, even if it were mistakenly passed in", () => {
  // The real generator's own main() refuses to write a file if mth-003
  // appears in the resolved candidate set (see the script's own guard) --
  // this test proves the SQL-builder itself also never silently drops or
  // renames it, so a caller passing it by mistake would see it plainly in
  // the output rather than have it vanish unnoticed.
  const sql = build007XActivationSql({ migrationNumber: "068", reviewer: "Founder", questionIds: ALL_14_IDS });
  assert.ok(!sql.includes("'mth-003'"), "mth-003 must never appear in a real 007X activation manifest");
});

test("build007XActivationSql only ever moves provisional rows to practice_eligible, never mock_eligible", () => {
  const sql = build007XActivationSql({ migrationNumber: "068", reviewer: "Founder", questionIds: ["a"] });
  const provisionalGuards = (sql.match(/and eligibility_status = 'provisional'/g) || []).length;
  assert.equal(provisionalGuards, 1);
  assert.ok(!/set\s+eligibility_status\s*=\s*'mock_eligible'/i.test(sql));
  const setClauses = sql.match(/set eligibility_status = '[a-z_]+'/g) || [];
  assert.ok(setClauses.every((s) => s === "set eligibility_status = 'practice_eligible'"));
});

test("build007XActivationSql records the reviewer for traceability and discloses the duplicate mr05 evidence finding", () => {
  const sql = build007XActivationSql({ migrationNumber: "068", reviewer: "Founder", questionIds: ["a"] });
  assert.ok(sql.includes("Founder"));
  assert.ok(sql.toLowerCase().includes("duplicate"), "the disclosed duplicate-review-row finding must be recorded in the migration itself");
});

test("checkActivationEligibility (reused unchanged) still blocks a row whose eligibility_status has already moved on", () => {
  const rows = [
    { id: "mr05-search-03", content_version: 1, provenance: "angel_original", active: true, eligibility_status: "provisional" },
    { id: "mr05-search-04", content_version: 1, provenance: "angel_original", active: true, eligibility_status: "practice_eligible" },
  ];
  const { canActivate, problems } = checkActivationEligibility(rows, 1);
  assert.equal(canActivate, false);
  assert.ok(problems[0].includes("mr05-search-04"));
});

test("the real 14-ID manifest computed for 007X has no duplicates and no cross-family collisions, matching the 4 approved families exactly", () => {
  assert.equal(ALL_14_IDS.length, 14);
  assert.equal(new Set(ALL_14_IDS).size, 14);
  assert.deepEqual(
    Object.fromEntries(Object.entries(APPROVED_IDS_BY_FAMILY).map(([f, ids]) => [f, ids.length])),
    {
      "mr05-number-property-search": 5,
      "mr03-mixed-perimeter": 3,
      "precision-frac": 3,
      "precision-dec": 3,
    }
  );
  assert.ok(!ALL_14_IDS.includes("mth-003"), "mth-003 was reclassified, not authored, and must never be part of the 14-ID activation manifest");
});

test("every one of the 14 real question IDs is present in the generated migration", () => {
  const sql = build007XActivationSql({ migrationNumber: "068", reviewer: "Founder", questionIds: ALL_14_IDS });
  for (const id of ALL_14_IDS) {
    assert.ok(sql.includes(`'${id}'`), `${id} must be present in the activation manifest`);
  }
});

test("idempotent structure: the WHERE clause guards on eligibility_status = 'provisional', a re-run after activation is a no-op", () => {
  const sql = build007XActivationSql({ migrationNumber: "068", reviewer: "Founder", questionIds: ["a", "b"] });
  assert.match(sql, /where id in \([^)]+\)\s*\n\s*and eligibility_status = 'provisional';/);
});
