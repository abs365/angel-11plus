import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveQuestionTypeOutcome, deriveEvidenceSignal, deriveEvidenceTier } from "@/lib/learningEngine/rollup";
import type { QuestionTypeExposure } from "@/lib/learningEngine/types";

/**
 * Stage 2 Educational Integrity Correction — lib/learningEngine/rollup.ts
 * (the Learning Engine V1 system that actually feeds the production
 * Learning Report's recommendation copy via profile.ts/recommendations.ts)
 * had no prior unit test coverage. Before this fix, a single self-assessed
 * "hu" -> "Yes" (timesSeen: 1, timesCorrect: 1) would have produced
 * outcome "success" and signal "Demonstrated" — an even stronger unearned
 * claim than the Educational Intelligence Engine's own "Developing".
 */

test("REGRESSION (the same class of defect, a second consumer): a self-assessed-only correct attempt (anyVerified: false) reports 'none', not 'success'", () => {
  assert.equal(deriveQuestionTypeOutcome(1, 1, false), "none");
});

test("a self-assessed-only WRONG attempt is also 'none', not 'struggle' — no evidence claim either way", () => {
  assert.equal(deriveQuestionTypeOutcome(1, 0, false), "none");
});

test("positive: a genuinely automatically-verified attempt still reports success/struggle/mixed normally — unaffected by the fix", () => {
  assert.equal(deriveQuestionTypeOutcome(1, 1, true), "success");
  assert.equal(deriveQuestionTypeOutcome(1, 0, true), "struggle");
  assert.equal(deriveQuestionTypeOutcome(2, 1, true), "mixed");
  assert.equal(deriveQuestionTypeOutcome(1, 1), "success", "omitting anyVerified must default to true (every existing caller unaffected)");
});

test("never attempted stays 'none' regardless of the verified flag", () => {
  assert.equal(deriveQuestionTypeOutcome(0, 0, false), "none");
  assert.equal(deriveQuestionTypeOutcome(0, 0, true), "none");
});

test("end-to-end: a competency whose only evidence is one self-assessed 'hu' reports Not Yet Observed signal, not Demonstrated", () => {
  const mapped: QuestionTypeExposure[] = [
    {
      questionTypeId: "QT-RC-02",
      contentExists: true,
      timesSeen: 1,
      timesCorrect: 1,
      distinctCorrectSessions: 0,
      outcome: deriveQuestionTypeOutcome(1, 1, false), // the fixed call, as evidence.ts now makes it
    },
  ];
  assert.equal(deriveEvidenceSignal(mapped), "Not Yet Observed", "THE FIX: no longer 'Demonstrated' from one self-assessed click");
  // Tier and Signal are deliberately independent axes (this file's own
  // docstring, Principle 3): the attempt itself genuinely happened
  // (timesSeen=1 is real and unfalsified, so Tier correctly stays ET-1,
  // "a small number of instances") — only the correctness SIGNAL derived
  // from `outcome` is what this fix corrects.
  assert.equal(deriveEvidenceTier(mapped), "ET-1");
});
