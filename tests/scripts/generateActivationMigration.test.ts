import { test } from "node:test";
import assert from "node:assert/strict";
import { checkActivationEligibility, buildActivationMigrationSql, parseArgs } from "../../scripts/generate-activation-migration.mjs";

/**
 * Educational Increment 007E, Part 11. No approved review exists yet
 * (Part 15 stop condition), so this activation tooling cannot be
 * exercised against real production data this increment — these tests
 * prove the pure decision logic and SQL generation are correct against
 * representative real/synthetic row shapes, ready the moment a genuine
 * review approval exists.
 */

test("parseArgs turns --flag value pairs into an object", () => {
  const args = parseArgs(["--target-type", "passage", "--target-id", "wave2-eng-surprise"]);
  assert.deepEqual(args, { "target-type": "passage", "target-id": "wave2-eng-surprise" });
});

test("activation is blocked when no rows are found for the target", () => {
  const { canActivate, problems } = checkActivationEligibility([], 1);
  assert.equal(canActivate, false);
  assert.ok(problems.some((p) => p.includes("No live rows")));
});

test("activation is blocked when content_version has drifted since review", () => {
  const rows = [{ id: "w1", content_version: 2, provenance: "angel_original", active: true, eligibility_status: "provisional" }];
  const { canActivate, problems } = checkActivationEligibility(rows, 1);
  assert.equal(canActivate, false);
  assert.ok(problems.some((p) => p.includes("content_version")));
});

test("activation is blocked when provenance is not angel_original", () => {
  const rows = [{ id: "w1", content_version: 1, provenance: "third_party", active: true, eligibility_status: "provisional" }];
  const { canActivate, problems } = checkActivationEligibility(rows, 1);
  assert.equal(canActivate, false);
  assert.ok(problems.some((p) => p.includes("provenance")));
});

test("activation is blocked when a row is inactive", () => {
  const rows = [{ id: "w1", content_version: 1, provenance: "angel_original", active: false, eligibility_status: "provisional" }];
  const { canActivate, problems } = checkActivationEligibility(rows, 1);
  assert.equal(canActivate, false);
  assert.ok(problems.some((p) => p.includes("active=false")));
});

test("activation is blocked when a row is not provisional (already acted on)", () => {
  const rows = [{ id: "w1", content_version: 1, provenance: "angel_original", active: true, eligibility_status: "practice_eligible" }];
  const { canActivate, problems } = checkActivationEligibility(rows, 1);
  assert.equal(canActivate, false);
  assert.ok(problems.some((p) => p.includes("already acted on")));
});

test("activation proceeds when every row passes every check", () => {
  const rows = [
    { id: "w1", content_version: 1, provenance: "angel_original", active: true, eligibility_status: "provisional" },
    { id: "w2", content_version: 1, provenance: "angel_original", active: true, eligibility_status: "provisional" },
  ];
  const { canActivate, problems } = checkActivationEligibility(rows, 1);
  assert.equal(canActivate, true);
  assert.deepEqual(problems, []);
});

test("activation checks every row independently — one bad row blocks the whole batch, not silently skipped", () => {
  const rows = [
    { id: "w1", content_version: 1, provenance: "angel_original", active: true, eligibility_status: "provisional" },
    { id: "w2", content_version: 1, provenance: "angel_original", active: false, eligibility_status: "provisional" },
  ];
  const { canActivate, problems } = checkActivationEligibility(rows, 1);
  assert.equal(canActivate, false);
  assert.equal(problems.length, 1);
  assert.ok(problems[0].startsWith("w2:"));
});

test("buildActivationMigrationSql generates a scoped update, never a blanket promotion", () => {
  const sql = buildActivationMigrationSql({
    migrationNumber: "055", targetType: "question_family", targetId: "wave1-fam-two-character",
    reviewer: "Jane Smith", reviewDate: "2026-08-20", rowIds: ["w1", "w2", "w3"], isPassage: false,
  });
  assert.ok(sql.includes("ali_question_bank"));
  assert.ok(sql.includes("'w1', 'w2', 'w3'"));
  assert.ok(sql.includes("eligibility_status = 'practice_eligible'"));
  assert.ok(sql.includes("where id in"));
  assert.ok(sql.includes("and eligibility_status = 'provisional'"), "must only ever move provisional rows, never overwrite an already-different state");
  assert.ok(sql.includes("begin;") && sql.includes("commit;"));
});

test("buildActivationMigrationSql targets ali_passage_bank when isPassage is true", () => {
  const sql = buildActivationMigrationSql({
    migrationNumber: "056", targetType: "passage", targetId: "wave2-eng-surprise",
    reviewer: "Jane Smith", reviewDate: "2026-08-20", rowIds: ["wave2-eng-surprise"], isPassage: true,
  });
  assert.ok(sql.includes("ali_passage_bank"));
  assert.ok(!sql.includes("ali_question_bank"));
});

test("buildActivationMigrationSql records the reviewer and review date for traceability", () => {
  const sql = buildActivationMigrationSql({
    migrationNumber: "055", targetType: "question_family", targetId: "wave1-fam-two-character",
    reviewer: "Jane Smith", reviewDate: "2026-08-20", rowIds: ["w1"], isPassage: false,
  });
  assert.ok(sql.includes("Jane Smith"));
  assert.ok(sql.includes("2026-08-20"));
});
