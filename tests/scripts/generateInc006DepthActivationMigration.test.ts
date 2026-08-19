import { test } from "node:test";
import assert from "node:assert/strict";
import { buildInc006DepthActivationSql } from "../../scripts/generate-inc006-depth-activation-migration.mjs";
import { checkActivationEligibility } from "../../scripts/generate-activation-migration.mjs";
import { mathsQuestions } from "../../scripts/generate-inc006-structural-depth-batch.mjs";

/**
 * Stage 3, Increment 007 — Controlled Activation of Approved Mathematics
 * Structural Depth Content. checkActivationEligibility() is already
 * covered elsewhere and reused unchanged here. These tests cover the
 * Increment-006-depth-specific manifest and SQL-generation logic:
 * exactly 8 questions across 2 families, no Mock/passage/review-history
 * touch, mirroring tests/scripts/generateMr04DepthActivationMigration.test.ts.
 */

const APPROVED_IDS_BY_FAMILY: Record<string, string[]> = {};
for (const q of mathsQuestions) (APPROVED_IDS_BY_FAMILY[q.family_id] ??= []).push(q.id);
const ALL_8_IDS = Object.values(APPROVED_IDS_BY_FAMILY).flat();

test("buildInc006DepthActivationSql only ever touches ali_question_bank, never ali_passage_bank or ali_family_review", () => {
  const sql = buildInc006DepthActivationSql({ migrationNumber: "083", reviewer: "Founder", questionIds: ["a", "b", "c"] });
  assert.ok(sql.includes("ali_question_bank"));
  assert.ok(!/update\s+public\.ali_passage_bank/i.test(sql));
  assert.ok(!/update\s+public\.ali_family_review/i.test(sql), "review history must never be touched by an activation migration");
  const beginCount = (sql.match(/\bbegin;/g) || []).length;
  const commitCount = (sql.match(/\bcommit;/g) || []).length;
  assert.equal(beginCount, 1);
  assert.equal(commitCount, 1);
});

test("buildInc006DepthActivationSql's question update lists exactly the given IDs, no more no less", () => {
  const sql = buildInc006DepthActivationSql({ migrationNumber: "083", reviewer: "Founder", questionIds: ["mr01-revmean-01", "mr03-combo-04"] });
  assert.ok(sql.includes("'mr01-revmean-01', 'mr03-combo-04'"));
});

test("buildInc006DepthActivationSql only ever moves provisional rows to practice_eligible, never mock_eligible", () => {
  const sql = buildInc006DepthActivationSql({ migrationNumber: "083", reviewer: "Founder", questionIds: ["a"] });
  const provisionalGuards = (sql.match(/and eligibility_status = 'provisional'/g) || []).length;
  assert.equal(provisionalGuards, 1);
  assert.ok(!/set\s+eligibility_status\s*=\s*'mock_eligible'/i.test(sql));
  const setClauses = sql.match(/set eligibility_status = '[a-z_]+'/g) || [];
  assert.ok(setClauses.every((s) => s === "set eligibility_status = 'practice_eligible'"));
});

test("buildInc006DepthActivationSql records the reviewer for traceability and preserves the honest capacity findings for both families", () => {
  const sql = buildInc006DepthActivationSql({ migrationNumber: "083", reviewer: "Founder", questionIds: ["a"] });
  assert.ok(sql.includes("Founder"));
  assert.ok(sql.toLowerCase().includes("shared reverse-mean reasoning structure"), "mr01-reverse-mean's one-shared-structure finding must be preserved, not erased, by activation");
  assert.ok(sql.toLowerCase().includes("genuinely distinct combined-transformation"), "mr03-coord-combined's genuinely-distinct-experiences finding must be preserved");
  assert.ok(sql.toUpperCase().includes("NOT APPLIED"));
});

test("checkActivationEligibility (reused unchanged) still blocks a row whose eligibility_status has already moved on", () => {
  const rows = [
    { id: "mr01-revmean-01", content_version: 1, provenance: "angel_original", active: true, eligibility_status: "provisional" },
    { id: "mr01-revmean-02", content_version: 1, provenance: "angel_original", active: true, eligibility_status: "practice_eligible" },
  ];
  const { canActivate, problems } = checkActivationEligibility(rows, 1);
  assert.equal(canActivate, false);
  assert.ok(problems[0].includes("mr01-revmean-02"));
});

test("the real 8-ID manifest computed for the Increment 006 depth batch has no duplicates and no cross-family collisions, matching the 2 approved families exactly", () => {
  assert.equal(ALL_8_IDS.length, 8);
  assert.equal(new Set(ALL_8_IDS).size, 8);
  assert.deepEqual(
    Object.fromEntries(Object.entries(APPROVED_IDS_BY_FAMILY).map(([f, ids]) => [f, ids.length])),
    {
      "mr01-reverse-mean": 4,
      "mr03-coord-combined": 4,
    }
  );
});

test("every one of the 8 real question IDs is present in the generated migration", () => {
  const sql = buildInc006DepthActivationSql({ migrationNumber: "083", reviewer: "Founder", questionIds: ALL_8_IDS });
  for (const id of ALL_8_IDS) {
    assert.ok(sql.includes(`'${id}'`), `${id} must be present in the activation manifest`);
  }
});

test("idempotent structure: the WHERE clause guards on eligibility_status = 'provisional', a re-run after activation is a no-op", () => {
  const sql = buildInc006DepthActivationSql({ migrationNumber: "083", reviewer: "Founder", questionIds: ["a", "b"] });
  assert.match(sql, /where id in \([^)]+\)\s*\n\s*and eligibility_status = 'provisional';/);
});
