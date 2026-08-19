import { test } from "node:test";
import assert from "node:assert/strict";
import { mathsQuestions, verify, FAMILY_IDS } from "../../scripts/generate-inc006-structural-depth-batch.mjs";

/**
 * Stage 3, Increment 006 (Mathematics Structural Depth Expansion).
 * Proves the generator script's own claims independently, matching the
 * established convention (generateMr04DepthBatch.test.ts).
 */

test("verify() reports zero problems -- every answer independently recomputed and matches, no structural near-duplicates, no dash punctuation, both transformation orders represented", () => {
  assert.deepEqual(verify(), []);
});

test("all 8 new questions satisfy required schema/content contracts", () => {
  assert.equal(mathsQuestions.length, 8);
  for (const q of mathsQuestions) {
    assert.ok(q.id && typeof q.id === "string");
    assert.ok(FAMILY_IDS.has(q.family_id), `${q.id} must belong to one of the two declared new families`);
    assert.ok(["QT-MR-12", "QT-MR-08"].includes(q.skill), `${q.id} must be one of the two targeted skills`);
    assert.equal(q.difficulty, "hard", `${q.id} must be the missing "hard" tier -- that is this increment's entire purpose`);
    assert.ok(q.question && q.question.length > 0);
    assert.ok(q.answer && q.answer.length > 0);
    assert.ok(Array.isArray(q.workingSteps) && q.workingSteps.length > 0);
    assert.ok(q.misconception && q.misconception.length > 0);
    assert.equal(typeof q.marks, "number");
    assert.equal(typeof q.estSeconds, "number");
  }
});

test("exactly 4 questions per family, matching the approved content plan", () => {
  const byFamily: Record<string, number> = {};
  for (const q of mathsQuestions) byFamily[q.family_id] = (byFamily[q.family_id] ?? 0) + 1;
  assert.equal(byFamily["mr01-reverse-mean"], 4);
  assert.equal(byFamily["mr03-coord-combined"], 4);
});

test("family IDs are valid and intentional: every question's family_id matches its own skill, no cross-contamination", () => {
  for (const q of mathsQuestions) {
    if (q.family_id === "mr01-reverse-mean") assert.equal(q.skill, "QT-MR-12");
    if (q.family_id === "mr03-coord-combined") assert.equal(q.skill, "QT-MR-08");
  }
});

test("no accidental duplicate prompts: every question's full text is unique across the whole batch", () => {
  const texts = mathsQuestions.map((q) => q.question);
  assert.equal(new Set(texts).size, texts.length);
});

test("marking is deterministic: re-running verify() twice produces byte-identical results (no hidden randomness in recomputation)", () => {
  assert.deepEqual(verify(), verify());
});

test("mr01-reverse-mean: no two siblings share the same missing-value answer number, position alone cannot predict it", () => {
  const answers = mathsQuestions.filter((q) => q.family_id === "mr01-reverse-mean").map((q) => q.answer);
  assert.equal(new Set(answers).size, answers.length);
});

test("mr03-coord-combined: both transformation orders (reflect-first and translate-first) and both axes (x and y) are represented", () => {
  const combo = mathsQuestions.filter((q) => q.family_id === "mr03-coord-combined");
  const reflectFirst = combo.filter((q) => /first reflected/.test(q.question));
  const translateFirst = combo.filter((q) => /first translated/.test(q.question));
  assert.equal(reflectFirst.length, 2);
  assert.equal(translateFirst.length, 2);
  assert.ok(combo.some((q) => /x-axis/.test(q.question)));
  assert.ok(combo.some((q) => /y-axis/.test(q.question)));
});
