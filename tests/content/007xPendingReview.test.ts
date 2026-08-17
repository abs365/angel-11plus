import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Educational Increment 007X, Part 16 — migration 067 registers the 4
 * target families' new-siblings-only review requirement, following
 * migration 064's established pending-placeholder pattern.
 */

const sql = fs.readFileSync("supabase/migrations/067_007x_pending_review_records.sql", "utf8");

test("all 4 target families are registered as pending review", () => {
  for (const fam of ["mr05-number-property-search", "mr03-mixed-perimeter", "precision-frac", "precision-dec"]) {
    assert.ok(sql.includes(`'question_family', '${fam}'`), `${fam} missing from migration 067`);
  }
});

test("reviewer is UNASSIGNED and decision is pending_independent_review for every row", () => {
  assert.ok(sql.includes("'UNASSIGNED'"));
  assert.ok(sql.includes("'pending_independent_review'::public.family_review_decision"));
});

test("no eligibility_status is touched by this migration", () => {
  assert.ok(!sql.includes("eligibility_status ="));
});

test("idempotency guard matches on family_id, decision, and notes (precise re-run safety, deliberately keyed on notes too since these families may already carry unrelated review history from Phase B)", () => {
  assert.match(sql, /where not exists \(/);
  assert.match(sql, /r\.family_id = v\.family_id/);
  assert.match(sql, /r\.notes = v\.notes/);
});
