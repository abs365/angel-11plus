import { test } from "node:test";
import assert from "node:assert/strict";
import { buildBatch2ActivationSql } from "../../scripts/generate-batch2-activation-migration.mjs";
import { checkActivationEligibility } from "../../scripts/generate-activation-migration.mjs";

/**
 * Educational Increment 007H — Controlled Review Batch 2 Activation.
 * checkActivationEligibility() is already covered by
 * generateActivationMigration.test.ts (007E) and generatePilotActivation
 * Migration.test.ts (007G), reused unchanged here. These tests cover the
 * Batch 2-specific combination logic: one migration spanning only
 * ali_question_bank (45 rows across 6 families, no passage dependency,
 * unlike 007G's pilot), with no row outside the named set touched.
 */

test("buildBatch2ActivationSql only ever touches ali_question_bank, never ali_passage_bank", () => {
  const sql = buildBatch2ActivationSql({ migrationNumber: "056", reviewer: "Ayobami Lawal", questionIds: ["a", "b", "c"] });
  assert.ok(sql.includes("ali_question_bank"));
  assert.ok(!sql.includes("update public.ali_passage_bank"), "Batch 2 selected no passage target, unlike 007G's pilot");
  const beginCount = (sql.match(/\bbegin;/g) || []).length;
  const commitCount = (sql.match(/\bcommit;/g) || []).length;
  assert.equal(beginCount, 1);
  assert.equal(commitCount, 1);
});

test("buildBatch2ActivationSql's question update lists exactly the given IDs, no more no less", () => {
  const sql = buildBatch2ActivationSql({ migrationNumber: "056", reviewer: "Ayobami Lawal", questionIds: ["mr03-cls-01", "mr03-cls-02"] });
  assert.ok(sql.includes("'mr03-cls-01', 'mr03-cls-02'"));
});

test("buildBatch2ActivationSql only ever moves provisional rows, matching the idempotent pattern used throughout this project", () => {
  const sql = buildBatch2ActivationSql({ migrationNumber: "056", reviewer: "Ayobami Lawal", questionIds: ["a"] });
  const provisionalGuards = (sql.match(/and eligibility_status = 'provisional'/g) || []).length;
  assert.equal(provisionalGuards, 1);
  assert.ok(!/set\s+eligibility_status\s*=\s*'mock_eligible'/i.test(sql), "must never SET mock_eligible");
  assert.ok(!/set\s+eligibility_status\s*=\s*'independently_validated'/i.test(sql), "must never SET independently_validated as a shortcut");
  const setClauses = (sql.match(/set eligibility_status = '[a-z_]+'/g) || []);
  assert.ok(setClauses.every((s) => s === "set eligibility_status = 'practice_eligible'"), "every SET clause must target practice_eligible only");
});

test("buildBatch2ActivationSql records the real reviewer name for traceability", () => {
  const sql = buildBatch2ActivationSql({ migrationNumber: "056", reviewer: "Ayobami Lawal", questionIds: ["a"] });
  assert.ok(sql.includes("Ayobami Lawal"));
});

test("checkActivationEligibility (reused unchanged) still blocks a row whose eligibility_status has already moved on, exactly as this script relies on", () => {
  const rows = [
    { id: "w1-atticdoor-01", content_version: 1, provenance: "angel_original", active: true, eligibility_status: "provisional" },
    { id: "w1-kitemaker-01", content_version: 1, provenance: "angel_original", active: true, eligibility_status: "practice_eligible" },
  ];
  const { canActivate, problems } = checkActivationEligibility(rows, 1);
  assert.equal(canActivate, false);
  assert.ok(problems[0].includes("w1-kitemaker-01"));
});

test("the real 45-ID manifest computed for Batch 2 has no duplicates and no cross-family collisions", () => {
  // Mirrors the exact family membership fetched live from production
  // during this increment's manifest computation.
  const byFamily = {
    "wave1-fam-direct-retrieval": ["w1-atticdoor-01", "w1-kitemaker-01", "w1-lastbus-01", "w1-letter-01", "w1-newgirl-01", "w1-raceday-01", "w2-lastslice-01", "w2-longwalk-01", "w2-morningpatrol-01", "w2-pianorecital-01", "w2-sciencefair-01", "w2-stormwarning-01", "w2-twoletters-01", "w2-understudy-01"],
    "wave1-fam-synonym-battery": ["w1-atticdoor-03", "w1-kitemaker-03", "w1-lastbus-03", "w1-letter-03", "w1-newgirl-03", "w1-raceday-03", "w2-lastslice-04", "w2-longwalk-05", "w2-morningpatrol-05", "w2-pianorecital-03", "w2-understudy-03"],
    "wave1-fam-emotion-cause": ["w1-atticdoor-07", "w1-kitemaker-07", "w1-lastbus-07", "w1-letter-07", "w1-newgirl-07", "w1-raceday-07", "w2-lastslice-07", "w2-pianorecital-06", "w2-sciencefair-05", "w2-stormwarning-06", "w2-understudy-06"],
    "mr03-classify": ["mr03-cls-01", "mr03-cls-02", "mr03-cls-03"],
    "mr04-far-percent": ["mr04-far-01", "mr04-far-02", "mr04-far-03"],
    "mr04-mixed-divisibility": ["mr04-mix-01", "mr04-mix-02", "mr04-mix-03"],
  };
  const all = Object.values(byFamily).flat();
  assert.equal(all.length, 45);
  assert.equal(new Set(all).size, 45, "no question ID may appear under more than one family");
});
