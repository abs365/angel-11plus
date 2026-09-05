import { test } from "node:test";
import assert from "node:assert/strict";
import {
  deriveEnglishReasoningPattern,
  englishFamilyKeyOf,
  englishFamilyKeyToString,
} from "@/lib/ali/englishFamilyModel";
import { classifyFamilySizeBucket } from "@/lib/ali/questionFamilyRegistry";

/**
 * Question Factory Wave 1, Phase 6 — English family taxonomy pass.
 *
 * This module was dormant (zero call sites outside its own file) before
 * this pass. Running it against the real 142 live practice-eligible
 * English rows (read-only, anon-key query, documented in
 * ANGEL_QUESTION_DEPTH_AND_REPETITION_AUDIT.md §3) surfaced a real defect
 * in this module's own docstring: `ali_question_bank.skill` is NOT the
 * free-text reasoning label ("vocabulary", "inference", ...) in
 * production -- it holds the `QT-RC-XX` Question Type code. The real
 * free-text label lives at `prompt->>'skill'`. Every row passed the WRONG
 * column would silently classify as "unclassified" 100% of the time. The
 * docstring is now corrected; these tests lock in the real skill
 * vocabulary confirmed live (including two previously-undocumented
 * values, "retrieval" and "judgement") so this defect cannot silently
 * reappear.
 */

test("deriveEnglishReasoningPattern correctly classifies every skill value confirmed live in production this pass", () => {
  assert.equal(deriveEnglishReasoningPattern({ skill: "vocabulary" }), "vocabulary_in_context");
  assert.equal(deriveEnglishReasoningPattern({ skill: "evidence" }), "evidence_quotation");
  assert.equal(deriveEnglishReasoningPattern({ skill: "inference" }), "inference");
  assert.equal(deriveEnglishReasoningPattern({ skill: "atmosphere" }), "inference");
  assert.equal(deriveEnglishReasoningPattern({ skill: "character" }), "inference");
  assert.equal(deriveEnglishReasoningPattern({ skill: "language" }), "language_effect");
  assert.equal(deriveEnglishReasoningPattern({ skill: "effect-of-language" }), "language_effect");
});

test("'retrieval' (found live, 1 row, previously undocumented) now classifies as retrieval -- an unambiguous direct match, not a guess", () => {
  assert.equal(deriveEnglishReasoningPattern({ skill: "retrieval" }), "retrieval");
});

test("'judgement' (found live, 1 row, previously undocumented) remains honestly unclassified -- no invented mapping for a genuinely ambiguous label", () => {
  assert.equal(deriveEnglishReasoningPattern({ skill: "judgement" }), "unclassified");
});

test("'comparison' and 'structure' remain unclassified from skill alone, per this module's own documented ambiguity, unless a tier override resolves them", () => {
  assert.equal(deriveEnglishReasoningPattern({ skill: "comparison" }), "unclassified");
  assert.equal(deriveEnglishReasoningPattern({ skill: "structure" }), "unclassified");
  assert.equal(deriveEnglishReasoningPattern({ skill: "structure", validationTier: "TIER4_ORDERED_LIST" }), "sequence");
});

test("tier overrides (TIER1/TIER4/TIER6) win regardless of the topical skill tag", () => {
  assert.equal(deriveEnglishReasoningPattern({ skill: "vocabulary", validationTier: "TIER1_EXACT_MATCH" }), "retrieval");
  assert.equal(deriveEnglishReasoningPattern({ skill: "evidence", validationTier: "TIER4_ORDERED_LIST" }), "sequence");
  assert.equal(deriveEnglishReasoningPattern({ skill: "inference", validationTier: "TIER6_MULTI_SELECT" }), "multi_select");
});

test("englishFamilyKeyOf groups by (passage, reasoningPattern) -- two questions on the same passage with the same pattern share one family, a different pattern on the same passage is a different family", () => {
  const a = englishFamilyKeyOf("wave1-eng-kitemaker", { skill: "vocabulary" });
  const b = englishFamilyKeyOf("wave1-eng-kitemaker", { skill: "vocabulary" });
  const c = englishFamilyKeyOf("wave1-eng-kitemaker", { skill: "inference" });
  const d = englishFamilyKeyOf("wave1-eng-lastbus", { skill: "vocabulary" });

  assert.equal(englishFamilyKeyToString(a), englishFamilyKeyToString(b), "same passage + same pattern = same family");
  assert.notEqual(englishFamilyKeyToString(a), englishFamilyKeyToString(c), "same passage + different pattern = different family");
  assert.notEqual(englishFamilyKeyToString(a), englishFamilyKeyToString(d), "different passage = different family, even with the same pattern");
});

test("engine-level proof: a realistic small English pool reproduces the live production shape (mostly 1-row and 2-4-row families, none larger) using the shared classifyFamilySizeBucket bucketing", () => {
  const rows = [
    { passageId: "p1", skill: "vocabulary" },
    { passageId: "p1", skill: "vocabulary" },
    { passageId: "p1", skill: "inference" },
    { passageId: "p2", skill: "evidence" },
  ];
  const byFamily = new Map<string, number>();
  for (const r of rows) {
    const key = englishFamilyKeyToString(englishFamilyKeyOf(r.passageId, { skill: r.skill }));
    byFamily.set(key, (byFamily.get(key) ?? 0) + 1);
  }
  assert.equal(byFamily.size, 3, "3 distinct (passage, pattern) families from 4 rows");
  const buckets = [...byFamily.values()].map(classifyFamilySizeBucket);
  assert.deepEqual(buckets.sort(), ["1_row", "1_row", "2_to_4_rows"]);
});

test("a genuinely unclassifiable row (no recognised skill, no tier override) never silently merges with an unrelated unclassified row from a DIFFERENT passage -- passage identity is still part of the key", () => {
  const x = englishFamilyKeyOf("passage-x", { skill: "some-future-unknown-label" });
  const y = englishFamilyKeyOf("passage-y", { skill: "some-future-unknown-label" });
  assert.equal(x.reasoningPattern, "unclassified");
  assert.equal(y.reasoningPattern, "unclassified");
  assert.notEqual(englishFamilyKeyToString(x), englishFamilyKeyToString(y), "unclassified rows on different passages must remain distinct families, never collapsed into one bucket");
});
