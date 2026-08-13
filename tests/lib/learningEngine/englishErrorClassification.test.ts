import { test } from "node:test";
import assert from "node:assert/strict";
import { checkMultiSelect, checkOrderedSequence, type EnglishScoringResult } from "@/lib/learningEngine/englishAnswerValidation";
import { classifyAutomaticError, getSelfReflectionCategories, WRONG_ANSWER_CATEGORY_LABEL } from "@/lib/learningEngine/englishErrorClassification";

/**
 * Educational Increment 007C, Part 8. Proves classifyAutomaticError only
 * ever names a category the scoring result's own structure actually
 * demonstrates (never fabricating beyond what a tier can support), and
 * that getSelfReflectionCategories never claims automatic detection for
 * tiers Angel cannot verify.
 */

test("multi-select over-selection classifies as OVER_SELECTION, not UNDER_SELECTION", () => {
  const detail = checkMultiSelect(["A", "B", "C", "D", "E"], ["A", "B", "C", "D"], 4);
  const result: EnglishScoringResult = { tier: "TIER6_MULTI_SELECT", automaticallyVerified: true, earnedMarks: detail.marks, requiresSelfComparison: false, multiSelectDetail: detail };
  assert.deepEqual(classifyAutomaticError(result), ["OVER_SELECTION"]);
});

test("multi-select under-selection classifies as UNDER_SELECTION", () => {
  const detail = checkMultiSelect(["A", "B"], ["A", "B", "C", "D"], 4);
  const result: EnglishScoringResult = { tier: "TIER6_MULTI_SELECT", automaticallyVerified: true, earnedMarks: detail.marks, requiresSelfComparison: false, multiSelectDetail: detail };
  assert.deepEqual(classifyAutomaticError(result), ["UNDER_SELECTION"]);
});

test("multi-select exact match earns no error classification at all", () => {
  const detail = checkMultiSelect(["A", "B", "C", "D"], ["A", "B", "C", "D"], 4);
  const result: EnglishScoringResult = { tier: "TIER6_MULTI_SELECT", automaticallyVerified: true, earnedMarks: detail.marks, requiresSelfComparison: false, multiSelectDetail: detail };
  assert.deepEqual(classifyAutomaticError(result), []);
});

test("sequencing: zero marks (nothing in position) classifies as EVIDENCE_NOT_LOCATED", () => {
  const detail = checkOrderedSequence(["wrong", "wrong", "wrong"], [["bask"], ["read"], ["wash"]]);
  const result: EnglishScoringResult = { tier: "TIER4_ORDERED_LIST", automaticallyVerified: true, earnedMarks: detail.marks, requiresSelfComparison: false, sequenceDetail: detail };
  assert.deepEqual(classifyAutomaticError(result), ["EVIDENCE_NOT_LOCATED"]);
});

test("sequencing: partial marks (right items, some out of position) classifies as SEQUENCE_ERROR, matching the real CSSE mark scheme's own worked example", () => {
  // The mark scheme's own example: bask/read/wash all individually correct but only "read" in the right position -> 1 of 3.
  const detail = checkOrderedSequence(["wash", "read", "bask"], [["bask"], ["read"], ["wash"]]);
  const result: EnglishScoringResult = { tier: "TIER4_ORDERED_LIST", automaticallyVerified: true, earnedMarks: detail.marks, requiresSelfComparison: false, sequenceDetail: detail };
  assert.deepEqual(classifyAutomaticError(result), ["SEQUENCE_ERROR"]);
});

test("sequencing: full marks earns no error classification", () => {
  const detail = checkOrderedSequence(["bask", "read", "wash"], [["bask"], ["read"], ["wash"]]);
  const result: EnglishScoringResult = { tier: "TIER4_ORDERED_LIST", automaticallyVerified: true, earnedMarks: detail.marks, requiresSelfComparison: false, sequenceDetail: detail };
  assert.deepEqual(classifyAutomaticError(result), []);
});

test("Tier 2 wrong answer in a vocabulary family classifies as VOCABULARY_CONTEXT_ERROR", () => {
  const result: EnglishScoringResult = { tier: "TIER2_ACCEPTED_SET", automaticallyVerified: true, earnedMarks: 0, requiresSelfComparison: false };
  assert.deepEqual(classifyAutomaticError(result, "wave1-fam-vocab-explain"), ["VOCABULARY_CONTEXT_ERROR"]);
  assert.deepEqual(classifyAutomaticError(result, "wave1-fam-synonym-battery"), ["VOCABULARY_CONTEXT_ERROR"]);
});

test("Tier 2 wrong answer in a non-vocabulary family classifies as nothing — no fabricated category where the tier can't support one", () => {
  const result: EnglishScoringResult = { tier: "TIER2_ACCEPTED_SET", automaticallyVerified: true, earnedMarks: 0, requiresSelfComparison: false };
  assert.deepEqual(classifyAutomaticError(result, "wave1-fam-direct-retrieval"), []);
});

test("self-reflection categories are only ever offered for self-assessed families, never claimed as automatic detection", () => {
  assert.deepEqual(getSelfReflectionCategories("wave1-fam-two-character"), ["CHARACTER_COMPARISON_WITHOUT_EVIDENCE", "WEAK_QUOTATION"]);
  assert.deepEqual(getSelfReflectionCategories("wave1-fam-quote-explain"), ["WEAK_QUOTATION", "EXPLANATION_MISMATCH"]);
  assert.deepEqual(getSelfReflectionCategories("wave1-fam-emotion-cause"), ["EVIDENCE_NOT_LOCATED", "UNSUPPORTED_INFERENCE"]);
});

test("self-reflection categories for a family with no defined set returns empty, not a guess", () => {
  assert.deepEqual(getSelfReflectionCategories("wave1-fam-direct-retrieval"), []);
  assert.deepEqual(getSelfReflectionCategories(undefined), []);
});

test("every WrongAnswerCategory used across the module has a human-readable label", () => {
  const allUsed = [
    "OVER_SELECTION", "UNDER_SELECTION", "EVIDENCE_NOT_LOCATED", "SEQUENCE_ERROR",
    "VOCABULARY_CONTEXT_ERROR", "CHARACTER_COMPARISON_WITHOUT_EVIDENCE", "WEAK_QUOTATION",
    "EXPLANATION_MISMATCH", "UNSUPPORTED_INFERENCE",
  ] as const;
  for (const c of allUsed) {
    assert.ok(WRONG_ANSWER_CATEGORY_LABEL[c] && WRONG_ANSWER_CATEGORY_LABEL[c].length > 0, `${c} has no label`);
  }
});
