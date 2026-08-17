import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Educational Increment 007X, Part 16 — migration 067 registers the 4
 * target families' new-siblings-only review requirement.
 *
 * This is the minimal executable-only form actually applied to production
 * (see the migration's own header comment and Decision 79 for the full
 * Migration 067 SQL Editor incident record) — four explicit, comment-free
 * INSERT...SELECT...WHERE NOT EXISTS statements, not the original
 * values()-table form. Semantically equivalent, and this test asserts the
 * form actually on disk / actually applied, not the original draft.
 */

const sql = fs.readFileSync("supabase/migrations/067_007x_pending_review_records.sql", "utf8");
// Executable SQL only -- strips the header comment block (`-- ...` lines)
// so counting occurrences below reflects the actual statements run, not
// prose that happens to mention the same quoted literals.
const executable = sql
  .split("\n")
  .filter((line) => !line.trimStart().startsWith("--"))
  .join("\n");

test("all 4 target families are registered as pending review", () => {
  for (const fam of ["mr05-number-property-search", "mr03-mixed-perimeter", "precision-frac", "precision-dec"]) {
    assert.ok(executable.includes(`'${fam}'`), `${fam} missing from migration 067`);
  }
});

test("reviewer is UNASSIGNED, decision is pending_independent_review, and review_type is explicitly content_review for every row", () => {
  const unassignedCount = (executable.match(/'UNASSIGNED'/g) ?? []).length;
  const decisionCount = (executable.match(/'pending_independent_review'::public\.family_review_decision/g) ?? []).length;
  const reviewTypeCount = (executable.match(/'content_review'/g) ?? []).length;
  assert.equal(unassignedCount, 4);
  assert.equal(decisionCount, 4);
  // review_type appears twice per statement: once in the INSERT's SELECT
  // list, once in the WHERE NOT EXISTS guard -- 4 statements x 2 = 8.
  assert.equal(reviewTypeCount, 8);
});

test("each row's notes clearly names it as new 007X content, distinct from any historical review row for the same family", () => {
  for (const fam of ["mr05-search-03..07", "mr03-mix-04..06", "precision-frac-04..06", "precision-dec-04..06"]) {
    assert.ok(executable.includes(`007X new content review: ${fam}`), `expected a distinct 007X-labelled notes entry for ${fam}`);
  }
});

test("no eligibility_status is touched by this migration", () => {
  assert.ok(!sql.includes("eligibility_status ="));
});

test("idempotency guard matches on family_id, decision, review_type, and notes together (precise re-run safety; can never be satisfied by an unrelated historical row for the same family)", () => {
  const guardCount = (executable.match(/where not exists \(/g) ?? []).length;
  assert.equal(guardCount, 4);
  assert.match(executable, /family_id = 'mr05-number-property-search'/);
  assert.match(executable, /notes = '007X new content review: mr05-search-03\.\.07'/);
});
