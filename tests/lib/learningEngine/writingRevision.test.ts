import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  buildRevisionEvidenceEvent, canOfferRevision, chooseableAreas, compareDimensionReads, describeMovement,
  isTextFreeEvent, wordCountChangeBand, FORBIDDEN_COMPARISON_PHRASES, type DimensionRead,
} from "@/lib/learningEngine/writingRevision";

const r = (dimension: DimensionRead["dimension"], level: DimensionRead["level"], confident = true): DimensionRead => ({ dimension, level, confident });

test("comparison is per dimension; unconfident reads are not compared", () => {
  const m = compareDimensionReads([r("ideas", "developing"), r("grammar", "strong"), r("structure", "secure", false)], [r("ideas", "secure"), r("grammar", "secure"), r("structure", "strong")]);
  const by = Object.fromEntries(m.map((x) => [x.dimension, x.movement]));
  assert.equal(by.ideas, "moved_up");
  assert.equal(by.grammar, "moved_down");
  assert.equal(by.structure, "not_compared");
  assert.equal(by.punctuation, "not_compared");
});

test("wording is descriptive: no numbers, scores, marks or 'improved by'", () => {
  for (const m of ["moved_up", "same", "moved_down", "not_compared"] as const) for (const re of FORBIDDEN_COMPARISON_PHRASES) assert.doesNotMatch(describeMovement(m), re);
});

test("one revision per original; needs feedback", () => {
  assert.equal(canOfferRevision({ hasFeedback: true, revisionsMade: 0 }), true);
  assert.equal(canOfferRevision({ hasFeedback: true, revisionsMade: 1 }), false);
  assert.equal(canOfferRevision({ hasFeedback: false, revisionsMade: 0 }), false);
});

test("choosable areas: developing confident dimensions first, at most four", () => {
  const a = chooseableAreas({ dimensions: [r("ideas", "developing"), r("grammar", "developing", false), r("punctuation", "developing")], areasToImprove: ["a", "b", "c", "d"] });
  assert.deepEqual(a.map((x) => x.id), ["dim-ideas", "dim-punctuation", "area-0", "area-1"]);
});

test("the evidence event is text-free, supported and never counts toward mastery", () => {
  const e = buildRevisionEvidenceEvent({ questionId: "q-1", sessionKey: "abc-123", chosenArea: "ideas", originalReads: [r("ideas", "developing")], revisedReads: [r("ideas", "secure")], originalWords: 100, revisedWords: 130 });
  assert.equal(isTextFreeEvent(e), true);
  assert.equal(e.supportTier, "supported");
  assert.equal(e.countsTowardMastery, false);
  assert.equal(e.wordCountChangeBand, "longer");
  assert.equal(isTextFreeEvent({ ...e, note: "The dog ran home." }), false);
});

test("word-count bands", () => {
  assert.equal(wordCountChangeBand(100, 50), "much_shorter");
  assert.equal(wordCountChangeBand(100, 100), "similar");
  assert.equal(wordCountChangeBand(100, 200), "much_longer");
});

test("Mock cannot reach revision; store is off by default and migration has no text column", () => {
  assert.doesNotMatch(fs.readFileSync("app/learning-intelligence/mock-exam/page.tsx", "utf8"), /writingRevision|WritingRevisionPanel/);
  const store = fs.readFileSync("lib/learningEngine/writingRevisionStore.ts", "utf8");
  assert.match(store, /NEXT_PUBLIC_WRITING_REVISION_EVENTS !== "1"/);
  const sql = fs.readFileSync("supabase/migrations/270_writing_revision_events_TEMPLATE_NOT_APPLIED.sql", "utf8");
  assert.doesNotMatch(sql, /\b(writing_text|revised_text|original_text|body)\b/);
  assert.match(sql, /counts_toward_mastery = false/);
});
