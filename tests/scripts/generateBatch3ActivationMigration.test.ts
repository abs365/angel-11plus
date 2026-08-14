import { test } from "node:test";
import assert from "node:assert/strict";
import { buildBatch3ActivationSql } from "../../scripts/generate-batch3-activation-migration.mjs";
import { checkActivationEligibility } from "../../scripts/generate-activation-migration.mjs";

/**
 * Educational Increment 007J — Controlled Review Batch 3 Activation.
 * checkActivationEligibility() is already covered by
 * generateActivationMigration.test.ts (007E), generatePilotActivation
 * Migration.test.ts (007G), and generateBatch2ActivationMigration.test.ts
 * (007H), reused unchanged here. These tests cover the Batch 3-specific
 * combination logic: one migration spanning only ali_question_bank (30
 * rows across 7 Mathematics families, no passage dependency), with no
 * row outside the named set touched.
 */

test("buildBatch3ActivationSql only ever touches ali_question_bank, never ali_passage_bank or ali_family_review", () => {
  const sql = buildBatch3ActivationSql({ migrationNumber: "057", reviewer: "Ayobami Lawal", questionIds: ["a", "b", "c"] });
  assert.ok(sql.includes("ali_question_bank"));
  assert.ok(!/update\s+public\.ali_passage_bank/i.test(sql), "Batch 3 has no passage dependency");
  assert.ok(!/update\s+public\.ali_family_review/i.test(sql), "review history must never be touched by an activation migration");
  const beginCount = (sql.match(/\bbegin;/g) || []).length;
  const commitCount = (sql.match(/\bcommit;/g) || []).length;
  assert.equal(beginCount, 1);
  assert.equal(commitCount, 1);
});

test("buildBatch3ActivationSql's question update lists exactly the given IDs, no more no less", () => {
  const sql = buildBatch3ActivationSql({ migrationNumber: "057", reviewer: "Ayobami Lawal", questionIds: ["mr01-mop-01", "mr01-mop-02"] });
  assert.ok(sql.includes("'mr01-mop-01', 'mr01-mop-02'"));
});

test("buildBatch3ActivationSql only ever moves provisional rows, matching the idempotent pattern used throughout this project", () => {
  const sql = buildBatch3ActivationSql({ migrationNumber: "057", reviewer: "Ayobami Lawal", questionIds: ["a"] });
  const provisionalGuards = (sql.match(/and eligibility_status = 'provisional'/g) || []).length;
  assert.equal(provisionalGuards, 1);
  assert.ok(!/set\s+eligibility_status\s*=\s*'mock_eligible'/i.test(sql), "must never SET mock_eligible");
  assert.ok(!/set\s+eligibility_status\s*=\s*'independently_validated'/i.test(sql), "must never SET independently_validated as a shortcut");
  const setClauses = (sql.match(/set eligibility_status = '[a-z_]+'/g) || []);
  assert.ok(setClauses.every((s) => s === "set eligibility_status = 'practice_eligible'"), "every SET clause must target practice_eligible only");
});

test("buildBatch3ActivationSql records the real reviewer name for traceability", () => {
  const sql = buildBatch3ActivationSql({ migrationNumber: "057", reviewer: "Ayobami Lawal", questionIds: ["a"] });
  assert.ok(sql.includes("Ayobami Lawal"));
});

test("checkActivationEligibility (reused unchanged) still blocks a row whose eligibility_status has already moved on, exactly as this script relies on", () => {
  const rows = [
    { id: "mr01-mop-01", content_version: 1, provenance: "angel_original", active: true, eligibility_status: "provisional" },
    { id: "mr01-mop-02", content_version: 1, provenance: "angel_original", active: true, eligibility_status: "practice_eligible" },
  ];
  const { canActivate, problems } = checkActivationEligibility(rows, 1);
  assert.equal(canActivate, false);
  assert.ok(problems[0].includes("mr01-mop-02"));
});

test("the real 30-ID manifest computed for Batch 3 has no duplicates and no cross-family collisions", () => {
  // Mirrors the exact family membership fetched live from production
  // during this increment's manifest computation.
  const byFamily = {
    "mr01-missing-operand": ["mr01-mop-01", "mr01-mop-02", "mr01-mop-03", "mr01-mop-04"],
    "mr03-coordinate": ["mr03-coord-01", "mr03-coord-02", "mr03-coord-03"],
    "mr01-measurement-conversion": ["mr01-conv-01", "mr01-conv-02", "mr01-conv-03", "mr01-conv-04"],
    "mr01-data-table": ["mr01-data-01", "mr01-data-02", "mr01-data-03", "mr01-data-04", "mr01-data-05"],
    "mr04-elapsed-time": ["mr04-time-01", "mr04-time-02", "mr04-time-03", "mr04-time-04", "mr04-time-05"],
    "mr01-average-mean": ["mr01-mean-01", "mr01-mean-02", "mr01-mean-03", "mr01-mean-04"],
    "mr02-nth-term": ["mr02-nth-01", "mr02-nth-02", "mr02-nth-03", "mr02-nth-04", "mr02-nth-05"],
  };
  const all = Object.values(byFamily).flat();
  assert.equal(all.length, 30);
  assert.equal(new Set(all).size, 30, "no question ID may appear under more than one family");
});

test("idempotent structure: applying the generated SQL's WHERE clause twice is a no-op the second time (structural proof via the provisional guard, not a live DB call)", () => {
  const sql = buildBatch3ActivationSql({ migrationNumber: "057", reviewer: "Ayobami Lawal", questionIds: ["a", "b"] });
  // The guard `and eligibility_status = 'provisional'` is what makes a
  // second run affect zero rows once the first run has already moved
  // every named row to practice_eligible -- this is the same structural
  // property generatePilotActivationMigration.test.ts and
  // generateBatch2ActivationMigration.test.ts already assert for their
  // own migrations, checked identically here for Batch 3's generator.
  assert.match(sql, /where id in \([^)]+\)\s*\n\s*and eligibility_status = 'provisional';/);
});
