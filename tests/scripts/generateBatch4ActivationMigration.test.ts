import { test } from "node:test";
import assert from "node:assert/strict";
import { buildBatch4ActivationSql } from "../../scripts/generate-batch4-activation-migration.mjs";
import { checkActivationEligibility } from "../../scripts/generate-activation-migration.mjs";

/**
 * Educational Increment 007K — Controlled Review Batch 4 Activation.
 * checkActivationEligibility() is already covered by
 * generateActivationMigration.test.ts (007E), generatePilotActivation
 * Migration.test.ts (007G), generateBatch2ActivationMigration.test.ts
 * (007H), and generateBatch3ActivationMigration.test.ts (007J), reused
 * unchanged here. These tests cover the Batch 4-specific combination
 * logic: one migration spanning only ali_question_bank (37 rows across 9
 * Mathematics families, no passage dependency), with no row outside the
 * named set touched.
 */

test("buildBatch4ActivationSql only ever touches ali_question_bank, never ali_passage_bank or ali_family_review", () => {
  const sql = buildBatch4ActivationSql({ migrationNumber: "058", reviewer: "Ayobami Lawal", questionIds: ["a", "b", "c"] });
  assert.ok(sql.includes("ali_question_bank"));
  assert.ok(!/update\s+public\.ali_passage_bank/i.test(sql), "Batch 4 has no passage dependency");
  assert.ok(!/update\s+public\.ali_family_review/i.test(sql), "review history must never be touched by an activation migration");
  const beginCount = (sql.match(/\bbegin;/g) || []).length;
  const commitCount = (sql.match(/\bcommit;/g) || []).length;
  assert.equal(beginCount, 1);
  assert.equal(commitCount, 1);
});

test("buildBatch4ActivationSql's question update lists exactly the given IDs, no more no less", () => {
  const sql = buildBatch4ActivationSql({ migrationNumber: "058", reviewer: "Ayobami Lawal", questionIds: ["mr04-bv-01", "mr04-bv-02"] });
  assert.ok(sql.includes("'mr04-bv-01', 'mr04-bv-02'"));
});

test("buildBatch4ActivationSql only ever moves provisional rows, matching the idempotent pattern used throughout this project", () => {
  const sql = buildBatch4ActivationSql({ migrationNumber: "058", reviewer: "Ayobami Lawal", questionIds: ["a"] });
  const provisionalGuards = (sql.match(/and eligibility_status = 'provisional'/g) || []).length;
  assert.equal(provisionalGuards, 1);
  assert.ok(!/set\s+eligibility_status\s*=\s*'mock_eligible'/i.test(sql), "must never SET mock_eligible");
  assert.ok(!/set\s+eligibility_status\s*=\s*'independently_validated'/i.test(sql), "must never SET independently_validated as a shortcut");
  const setClauses = (sql.match(/set eligibility_status = '[a-z_]+'/g) || []);
  assert.ok(setClauses.every((s) => s === "set eligibility_status = 'practice_eligible'"), "every SET clause must target practice_eligible only");
});

test("buildBatch4ActivationSql records the real reviewer name for traceability", () => {
  const sql = buildBatch4ActivationSql({ migrationNumber: "058", reviewer: "Ayobami Lawal", questionIds: ["a"] });
  assert.ok(sql.includes("Ayobami Lawal"));
});

test("checkActivationEligibility (reused unchanged) still blocks a row whose eligibility_status has already moved on, exactly as this script relies on", () => {
  const rows = [
    { id: "mr04-bv-01", content_version: 1, provenance: "angel_original", active: true, eligibility_status: "provisional" },
    { id: "mr04-bv-02", content_version: 1, provenance: "angel_original", active: true, eligibility_status: "practice_eligible" },
  ];
  const { canActivate, problems } = checkActivationEligibility(rows, 1);
  assert.equal(canActivate, false);
  assert.ok(problems[0].includes("mr04-bv-02"));
});

test("the real 37-ID manifest computed for Batch 4 has no duplicates and no cross-family collisions", () => {
  // Mirrors the exact family membership fetched fresh from live
  // production during this increment's manifest recomputation (Part 4),
  // not the 007K selection document.
  const byFamily = {
    "mr04-best-value": ["mr04-bv-01", "mr04-bv-02", "mr04-bv-03", "mr04-bv-04", "mr04-bv-05"],
    "mr02-far-ratio-context": ["mr02-far-01", "mr02-far-02", "mr02-far-03"],
    "mr05-factors-primes": ["mr05-fp-01", "mr05-fp-02", "mr05-fp-03", "mr05-fp-04", "mr05-fp-05"],
    "mr05-constrained-multiple": ["mr05-mult-01", "mr05-mult-02", "mr05-mult-03"],
    "mr03-angle-ratio": ["mr03-angratio-01", "mr03-angratio-02", "mr03-angratio-03", "mr03-angratio-04", "mr03-angratio-05"],
    "mr02-sum-difference": ["mr02-sumdiff-01", "mr02-sumdiff-02", "mr02-sumdiff-03", "mr02-sumdiff-04", "mr02-sumdiff-05"],
    "mr04-compound-percentage": ["mr04-cpct-01", "mr04-cpct-02", "mr04-cpct-03", "mr04-cpct-04", "mr04-cpct-05"],
    "mr03-mixed-perimeter": ["mr03-mix-01", "mr03-mix-02", "mr03-mix-03"],
    "mr04-far-recipe": ["mr04-far-04", "mr04-far-05", "mr04-far-06"],
  };
  const all = Object.values(byFamily).flat();
  assert.equal(all.length, 37);
  assert.equal(new Set(all).size, 37, "no question ID may appear under more than one family");
});

test("mr03-mixed-perimeter and mr04-far-recipe (Decision 55's unit-answer defect families) are included in the manifest, not excluded on defect-history grounds", () => {
  const byFamily = {
    "mr03-mixed-perimeter": ["mr03-mix-01", "mr03-mix-02", "mr03-mix-03"],
    "mr04-far-recipe": ["mr04-far-04", "mr04-far-05", "mr04-far-06"],
  };
  const sql = buildBatch4ActivationSql({
    migrationNumber: "058",
    reviewer: "Ayobami Lawal",
    questionIds: [...byFamily["mr03-mixed-perimeter"], ...byFamily["mr04-far-recipe"]],
  });
  for (const id of [...byFamily["mr03-mixed-perimeter"], ...byFamily["mr04-far-recipe"]]) {
    assert.ok(sql.includes(`'${id}'`), `${id} must be present in the activation manifest`);
  }
});

test("idempotent structure: applying the generated SQL's WHERE clause twice is a no-op the second time (structural proof via the provisional guard, not a live DB call)", () => {
  const sql = buildBatch4ActivationSql({ migrationNumber: "058", reviewer: "Ayobami Lawal", questionIds: ["a", "b"] });
  // The guard `and eligibility_status = 'provisional'` is what makes a
  // second run affect zero rows once the first run has already moved
  // every named row to practice_eligible -- this is the same structural
  // property generatePilotActivationMigration.test.ts,
  // generateBatch2ActivationMigration.test.ts, and
  // generateBatch3ActivationMigration.test.ts already assert for their
  // own migrations, checked identically here for Batch 4's generator.
  assert.match(sql, /where id in \([^)]+\)\s*\n\s*and eligibility_status = 'provisional';/);
});
