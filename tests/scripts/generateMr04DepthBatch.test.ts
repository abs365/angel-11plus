import { test } from "node:test";
import assert from "node:assert/strict";
import { mathsQuestions, verify, FAMILY_IDS } from "../../scripts/generate-mr04-depth-batch.mjs";

/**
 * Stage 3, Increment 003 (Mathematics Content Depth and Variation
 * Foundation). Proves the generator script's own claims independently,
 * matching the established convention (tests do not merely trust a
 * generator script's own console output).
 */

test("verify() reports zero problems -- every answer independently recomputed and matches, no structural near-duplicates, no dash punctuation", () => {
  assert.deepEqual(verify(), []);
});

test("all 11 new questions satisfy required schema/content contracts", () => {
  assert.equal(mathsQuestions.length, 11);
  for (const q of mathsQuestions) {
    assert.ok(q.id && typeof q.id === "string");
    assert.ok(FAMILY_IDS.has(q.family_id), `${q.id} must belong to one of the three declared new families`);
    assert.ok(["QT-MR-04", "QT-MR-10", "QT-MR-13"].includes(q.skill), `${q.id} must be one of the three targeted skills`);
    assert.equal(q.difficulty, "hard", `${q.id} must be the missing "hard" tier -- that is this increment's entire purpose`);
    assert.ok(q.question && q.question.length > 0);
    assert.ok(q.answer && q.answer.length > 0);
    assert.ok(Array.isArray(q.workingSteps) && q.workingSteps.length > 0, `${q.id} must show its working, matching this bank's existing Mathematics feedback convention`);
    assert.ok(q.misconception && q.misconception.length > 0, `${q.id} must carry real misconception text, matching this bank's existing review convention`);
    assert.equal(typeof q.marks, "number");
    assert.equal(typeof q.estSeconds, "number");
  }
});

test("DIFFICULTY LABELS MATCH THE APPROVED CONTENT PLAN: exactly 4/4/3 questions across the three families, all 'hard'", () => {
  const byFamily: Record<string, number> = {};
  for (const q of mathsQuestions) byFamily[q.family_id] = (byFamily[q.family_id] ?? 0) + 1;
  assert.equal(byFamily["mr04-reverse-percentage"], 4);
  assert.equal(byFamily["mr04-time-reverse"], 4);
  assert.equal(byFamily["mr04-bv-convert"], 3);
});

test("FAMILY IDs ARE VALID AND INTENTIONAL: every question's family_id matches its own skill's real gap, no cross-contamination", () => {
  for (const q of mathsQuestions) {
    if (q.family_id === "mr04-reverse-percentage") assert.equal(q.skill, "QT-MR-04");
    if (q.family_id === "mr04-time-reverse") assert.equal(q.skill, "QT-MR-10");
    if (q.family_id === "mr04-bv-convert") assert.equal(q.skill, "QT-MR-13");
  }
});

test("NO ACCIDENTAL DUPLICATE PROMPTS: every question's full text is unique across the whole batch", () => {
  const texts = mathsQuestions.map((q) => q.question);
  assert.equal(new Set(texts).size, texts.length);
});

test("NO ANSWER LEAKAGE: the answer string never appears verbatim inside its own question text", () => {
  for (const q of mathsQuestions) {
    const bareAnswer = q.answer.replace(/[£%]/g, "");
    assert.ok(!q.question.includes(bareAnswer) || bareAnswer.length < 2, `${q.id}: the answer must not be readable directly from the question text`);
  }
});

test("MARKING IS DETERMINISTIC: re-running verify() twice produces byte-identical results (no hidden randomness in recomputation)", () => {
  assert.deepEqual(verify(), verify());
});

test("ANTI-MEMORISATION: mr04-bv-convert's answers are not all the same letter (position alone cannot predict the answer)", () => {
  const answers = mathsQuestions.filter((q) => q.family_id === "mr04-bv-convert").map((q) => q.answer);
  assert.ok(new Set(answers).size >= 2);
});
