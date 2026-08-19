import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Stage 3, Increment 004, Post-Increment Review-Readiness Correction —
 * migration 079 registers the 3 new MR-04 families' 11 new questions
 * (Decision 116/117) as awaiting an independent reviewer, mirroring
 * migration 067's proven minimal executable form (comment-free between
 * begin/commit) exactly.
 */

const sql = fs.readFileSync("supabase/migrations/079_mr04_depth_pending_review_records.sql", "utf8");
const executable = sql
  .split("\n")
  .filter((line) => !line.trimStart().startsWith("--"))
  .join("\n");

test("all 3 target families are registered as pending review", () => {
  for (const fam of ["mr04-reverse-percentage", "mr04-time-reverse", "mr04-bv-convert"]) {
    assert.ok(executable.includes(`'${fam}'`), `${fam} missing from migration 079`);
  }
});

test("reviewer is UNASSIGNED, decision is pending_independent_review, and review_type is explicitly content_review for every row", () => {
  const unassignedCount = (executable.match(/'UNASSIGNED'/g) ?? []).length;
  const decisionCount = (executable.match(/'pending_independent_review'::public\.family_review_decision/g) ?? []).length;
  const reviewTypeCount = (executable.match(/'content_review'/g) ?? []).length;
  assert.equal(unassignedCount, 3);
  assert.equal(decisionCount, 3);
  // review_type appears twice per statement: once in the INSERT's SELECT
  // list, once in the WHERE NOT EXISTS guard -- 3 statements x 2 = 6.
  assert.equal(reviewTypeCount, 6);
});

test("each row's notes clearly names it as new STAGE3-INC004-MR04-DEPTH content, distinct from any historical review row for the same family", () => {
  for (const fam of ["mr04-revpct-01..04", "mr04-timerev-01..04", "mr04-bvconv-01..03"]) {
    assert.ok(executable.includes(`STAGE3-INC004-MR04-DEPTH new content review: ${fam}`), `expected a distinct STAGE3-INC004-MR04-DEPTH-labelled notes entry for ${fam}`);
  }
});

test("no eligibility_status is touched by this migration", () => {
  assert.ok(!sql.includes("eligibility_status ="));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.match(executable, /^\s*begin;/m);
  assert.match(executable, /^\s*commit;/m);
});

test("idempotency guard matches on family_id, decision, review_type, and notes together (precise re-run safety; can never be satisfied by an unrelated historical row for the same family)", () => {
  const guardCount = (executable.match(/where not exists \(/g) ?? []).length;
  assert.equal(guardCount, 3);
  assert.match(executable, /family_id = 'mr04-reverse-percentage'/);
  assert.match(executable, /notes = 'STAGE3-INC004-MR04-DEPTH new content review: mr04-revpct-01\.\.04'/);
});

test("mentions NOT APPLIED in its own header comment (raw file, not the comment-stripped executable)", () => {
  assert.ok(sql.toUpperCase().includes("NOT APPLIED"));
});
