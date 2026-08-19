import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMr04DepthActivationSql } from "../../scripts/generate-mr04-depth-activation-migration.mjs";
import { checkActivationEligibility } from "../../scripts/generate-activation-migration.mjs";
import { mathsQuestions } from "../../scripts/generate-mr04-depth-batch.mjs";

/**
 * Stage 3, Increment 005 — Independently Approved MR-04 Content
 * Activation. checkActivationEligibility() is already covered elsewhere
 * and reused unchanged here. These tests cover the MR-04-depth-specific
 * manifest and SQL-generation logic: exactly 11 questions across 3
 * families, no Mock/passage/review-history touch.
 */

const APPROVED_IDS_BY_FAMILY: Record<string, string[]> = {};
for (const q of mathsQuestions) (APPROVED_IDS_BY_FAMILY[q.family_id] ??= []).push(q.id);
const ALL_11_IDS = Object.values(APPROVED_IDS_BY_FAMILY).flat();

test("buildMr04DepthActivationSql only ever touches ali_question_bank, never ali_passage_bank or ali_family_review", () => {
  const sql = buildMr04DepthActivationSql({ migrationNumber: "080", reviewer: "Founder", questionIds: ["a", "b", "c"] });
  assert.ok(sql.includes("ali_question_bank"));
  assert.ok(!/update\s+public\.ali_passage_bank/i.test(sql));
  assert.ok(!/update\s+public\.ali_family_review/i.test(sql), "review history must never be touched by an activation migration");
  const beginCount = (sql.match(/\bbegin;/g) || []).length;
  const commitCount = (sql.match(/\bcommit;/g) || []).length;
  assert.equal(beginCount, 1);
  assert.equal(commitCount, 1);
});

test("buildMr04DepthActivationSql's question update lists exactly the given IDs, no more no less", () => {
  const sql = buildMr04DepthActivationSql({ migrationNumber: "080", reviewer: "Founder", questionIds: ["mr04-revpct-01", "mr04-bvconv-03"] });
  assert.ok(sql.includes("'mr04-revpct-01', 'mr04-bvconv-03'"));
});

test("buildMr04DepthActivationSql only ever moves provisional rows to practice_eligible, never mock_eligible", () => {
  const sql = buildMr04DepthActivationSql({ migrationNumber: "080", reviewer: "Founder", questionIds: ["a"] });
  const provisionalGuards = (sql.match(/and eligibility_status = 'provisional'/g) || []).length;
  assert.equal(provisionalGuards, 1);
  assert.ok(!/set\s+eligibility_status\s*=\s*'mock_eligible'/i.test(sql));
  const setClauses = sql.match(/set eligibility_status = '[a-z_]+'/g) || [];
  assert.ok(setClauses.every((s) => s === "set eligibility_status = 'practice_eligible'"));
});

test("buildMr04DepthActivationSql records the reviewer for traceability and preserves Decision 117's honest anti-memorisation finding", () => {
  const sql = buildMr04DepthActivationSql({ migrationNumber: "080", reviewer: "Founder", questionIds: ["a"] });
  assert.ok(sql.includes("Founder"));
  assert.ok(sql.toLowerCase().includes("six"), "Decision 117's 'approximately six genuinely distinct scenario shapes' finding must be preserved, not erased, by activation");
  assert.ok(sql.toUpperCase().includes("NOT APPLIED"));
});

test("checkActivationEligibility (reused unchanged) still blocks a row whose eligibility_status has already moved on", () => {
  const rows = [
    { id: "mr04-revpct-01", content_version: 1, provenance: "angel_original", active: true, eligibility_status: "provisional" },
    { id: "mr04-revpct-02", content_version: 1, provenance: "angel_original", active: true, eligibility_status: "practice_eligible" },
  ];
  const { canActivate, problems } = checkActivationEligibility(rows, 1);
  assert.equal(canActivate, false);
  assert.ok(problems[0].includes("mr04-revpct-02"));
});

test("the real 11-ID manifest computed for the MR-04 depth batch has no duplicates and no cross-family collisions, matching the 3 approved families exactly", () => {
  assert.equal(ALL_11_IDS.length, 11);
  assert.equal(new Set(ALL_11_IDS).size, 11);
  assert.deepEqual(
    Object.fromEntries(Object.entries(APPROVED_IDS_BY_FAMILY).map(([f, ids]) => [f, ids.length])),
    {
      "mr04-reverse-percentage": 4,
      "mr04-time-reverse": 4,
      "mr04-bv-convert": 3,
    }
  );
});

test("every one of the 11 real question IDs is present in the generated migration", () => {
  const sql = buildMr04DepthActivationSql({ migrationNumber: "080", reviewer: "Founder", questionIds: ALL_11_IDS });
  for (const id of ALL_11_IDS) {
    assert.ok(sql.includes(`'${id}'`), `${id} must be present in the activation manifest`);
  }
});

test("idempotent structure: the WHERE clause guards on eligibility_status = 'provisional', a re-run after activation is a no-op", () => {
  const sql = buildMr04DepthActivationSql({ migrationNumber: "080", reviewer: "Founder", questionIds: ["a", "b"] });
  assert.match(sql, /where id in \([^)]+\)\s*\n\s*and eligibility_status = 'provisional';/);
});
