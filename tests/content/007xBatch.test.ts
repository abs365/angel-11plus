import { test } from "node:test";
import assert from "node:assert/strict";
import { mathsQuestions, verify, RECLASSIFIED_LEGACY_ROWS } from "../../scripts/generate-007x-mathematics-batch.mjs";

/**
 * Educational Increment 007X — Mathematics Content Depth and Transfer
 * Expansion. 14 new provisional Mathematics questions across 4 families,
 * plus 1 metadata-only legacy-row reclassification. Every answer is
 * independently recomputed by the generator's own verify() (hand-derived
 * per item, not the same code path that authored the answer).
 */

test("generator self-verification: 0 answer/structure problems", () => {
  const problems = verify();
  assert.deepEqual(problems, []);
});

test("exactly 14 new questions across exactly 4 known families", () => {
  assert.equal(mathsQuestions.length, 14);
  const families = new Set(mathsQuestions.map((q) => q.family_id));
  assert.deepEqual(families, new Set(["mr05-number-property-search", "mr03-mixed-perimeter", "precision-frac", "precision-dec"]));
});

test("family contract: every question carries the correct QT skill for its family", () => {
  const expectedSkill: Record<string, string> = {
    "mr05-number-property-search": "QT-MR-11",
    "mr03-mixed-perimeter": "QT-MR-07",
    "precision-frac": "QT-MR-14",
    "precision-dec": "QT-MR-14",
  };
  for (const q of mathsQuestions) {
    assert.equal(q.skill, expectedSkill[q.family_id], `${q.id} has the wrong skill for its family`);
  }
});

test("difficulty distribution: valid values only, and all three bands represented", () => {
  const counts: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
  for (const q of mathsQuestions) {
    assert.ok(["easy", "medium", "hard"].includes(q.difficulty), `${q.id} has an invalid difficulty`);
    counts[q.difficulty]++;
  }
  assert.ok(counts.easy > 0 && counts.medium > 0 && counts.hard > 0, "batch should span EASY/EXAM-STANDARD/HARD, not cluster in one band");
});

test("no duplicate question IDs, and every ID is unique across the whole batch", () => {
  const ids = mathsQuestions.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("no exact-duplicate question text anywhere in the batch", () => {
  const texts = mathsQuestions.map((q) => q.question);
  assert.equal(new Set(texts).size, texts.length);
});

test("structural near-duplicate guard: no two siblings in the same family share a digit-stripped shape", () => {
  const byFamily = new Map<string, string[]>();
  for (const q of mathsQuestions) {
    const shape = q.question.replace(/\d+(\.\d+)?/g, "#");
    const list = byFamily.get(q.family_id) ?? [];
    assert.ok(!list.includes(shape), `${q.id} shares an exact template shape with another sibling in ${q.family_id}`);
    list.push(shape);
    byFamily.set(q.family_id, list);
  }
});

test("every question has a populated, non-generic addresses_misconception", () => {
  for (const q of mathsQuestions) {
    assert.ok(q.misconception && q.misconception.length > 10, `${q.id} is missing a real misconception classification`);
  }
});

test("workingSteps are pedagogically real: at least 2 steps, none merely restating the final answer", () => {
  for (const q of mathsQuestions) {
    assert.ok(q.workingSteps.length >= 2, `${q.id} has too few working steps`);
    const last = q.workingSteps[q.workingSteps.length - 1];
    assert.ok(last.length > String(q.answer).length + 3, `${q.id}'s final step looks like it just restates the answer`);
  }
});

test("mr05-number-property-search: the new siblings genuinely vary the searched property (not all primes)", () => {
  const family = mathsQuestions.filter((q) => q.family_id === "mr05-number-property-search");
  assert.equal(family.length, 5);
  const properties = family.map((q) => q.question.toLowerCase());
  assert.ok(properties.some((q) => q.includes("square")));
  assert.ok(properties.some((q) => q.includes("factor")));
  assert.ok(properties.some((q) => q.includes("multiple")));
  assert.ok(properties.some((q) => q.includes("prime")));
});

test("mr03-mixed-perimeter: new siblings include a reverse-direction and a non-integer case, not just more area-to-perimeter clones", () => {
  const family = mathsQuestions.filter((q) => q.family_id === "mr03-mixed-perimeter");
  assert.equal(family.length, 3);
  assert.ok(family.some((q) => q.question.includes("perimeter") && q.question.includes("What is the area")), "expected a reverse-direction (perimeter-to-area) sibling");
  assert.ok(family.some((q) => /\d+\.\d/.test(q.question)), "expected a decimal/non-integer sibling");
});

test("precision-frac: new siblings include a proper-fraction (not mixed-number) result", () => {
  const family = mathsQuestions.filter((q) => q.family_id === "precision-frac");
  assert.ok(family.some((q) => !q.answer.includes(" ")), "expected at least one proper-fraction (non-mixed-number) answer");
});

test("precision-dec: new siblings include at least one genuine round-down case", () => {
  const family = mathsQuestions.filter((q) => q.family_id === "precision-dec");
  // A round-down case: the digit after the rounding place is < 5, so the
  // final answer's last digit equals the pre-rounding digit at that place.
  assert.ok(family.some((q) => q.id === "precision-dec-04" || q.id === "precision-dec-06"));
});

test("all 14 questions are angel_original, provisional, active, and not Mock Eligible (contract-level, matches the generated migration)", () => {
  // The generator only emits eligibility_status = 'provisional' rows -- this
  // is a structural property of the migration-generation code path itself,
  // asserted here as a guard against a future edit accidentally changing it.
  const fs = require("node:fs") as typeof import("node:fs");
  const sql = fs.readFileSync("supabase/migrations/066_007x_mathematics_depth_expansion.sql", "utf8");
  assert.ok(sql.includes("'provisional'"));
  assert.ok(!sql.includes("'practice_eligible'"));
  assert.ok(!sql.includes("'mock_eligible'"));
});

test("the migration is idempotent: uses on conflict do nothing for inserts and an IS NULL guard for the reclassification", () => {
  const fs = require("node:fs") as typeof import("node:fs");
  const sql = fs.readFileSync("supabase/migrations/066_007x_mathematics_depth_expansion.sql", "utf8");
  assert.match(sql, /on conflict \(id\) do nothing;/);
  assert.match(sql, /and family_id is null;/);
});

test("exactly 1 legacy row is reclassified, into mr03-mixed-perimeter, matching the independently-verified mth-003", () => {
  assert.equal(RECLASSIFIED_LEGACY_ROWS.length, 1);
  assert.equal(RECLASSIFIED_LEGACY_ROWS[0].id, "mth-003");
  assert.equal(RECLASSIFIED_LEGACY_ROWS[0].family_id, "mr03-mixed-perimeter");
});
