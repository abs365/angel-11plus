import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Stage 3, Increment 006 — migration 082 registers the 2 new families'
 * 8 new questions (this increment's own decision entry) as awaiting an
 * independent reviewer, mirroring migration 079's proven minimal
 * executable form (comment-free between begin/commit) exactly.
 */

const sql = fs.readFileSync("supabase/migrations/082_inc006_pending_review_records.sql", "utf8");
const executable = sql
  .split("\n")
  .filter((line) => !line.trimStart().startsWith("--"))
  .join("\n");

test("both target families are registered as pending review", () => {
  for (const fam of ["mr01-reverse-mean", "mr03-coord-combined"]) {
    assert.ok(executable.includes(`'${fam}'`), `${fam} missing from migration 082`);
  }
});

test("reviewer is UNASSIGNED, decision is pending_independent_review, and review_type is explicitly content_review for every row", () => {
  const unassignedCount = (executable.match(/'UNASSIGNED'/g) ?? []).length;
  const decisionCount = (executable.match(/'pending_independent_review'::public\.family_review_decision/g) ?? []).length;
  const reviewTypeCount = (executable.match(/'content_review'/g) ?? []).length;
  assert.equal(unassignedCount, 2);
  assert.equal(decisionCount, 2);
  // review_type appears twice per statement: once in the INSERT's SELECT
  // list, once in the WHERE NOT EXISTS guard -- 2 statements x 2 = 4.
  assert.equal(reviewTypeCount, 4);
});

test("each row's notes clearly names it as new STAGE3-INC006-DEPTH content, distinct from any historical review row for the same family", () => {
  for (const fam of ["mr01-revmean-01..04", "mr03-combo-01..04"]) {
    assert.ok(executable.includes(`STAGE3-INC006-DEPTH new content review: ${fam}`), `expected a distinct STAGE3-INC006-DEPTH-labelled notes entry for ${fam}`);
  }
});

test("no eligibility_status is touched by this migration", () => {
  assert.ok(!sql.includes("eligibility_status ="));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.match(executable, /^\s*begin;/m);
  assert.match(executable, /^\s*commit;/m);
});

test("idempotency guard matches on family_id, decision, review_type, and notes together", () => {
  const guardCount = (executable.match(/where not exists \(/g) ?? []).length;
  assert.equal(guardCount, 2);
  assert.match(executable, /family_id = 'mr01-reverse-mean'/);
  assert.match(executable, /notes = 'STAGE3-INC006-DEPTH new content review: mr01-revmean-01\.\.04'/);
});

test("mentions NOT APPLIED in its own header comment (raw file, not the comment-stripped executable)", () => {
  assert.ok(sql.toUpperCase().includes("NOT APPLIED"));
});
