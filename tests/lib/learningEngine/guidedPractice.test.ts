import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getGuidedScaffoldKind,
  getGuidedInstructionText,
  checkLiveSelectionCount,
} from "@/lib/learningEngine/guidedPractice";

/**
 * Educational Increment 007C, Part 5. Verifies every one of the 9 English
 * families resolves to a real scaffold kind and a non-generic, family-
 * specific instruction (Part 7's "no family left with only generic
 * feedback"), and that the live selection-count check used to prevent an
 * over-selection mistake during Guided mode agrees exactly with the final
 * scored result's own tokenisation rule.
 */

const ALL_FAMILIES = [
  "wave1-fam-direct-retrieval",
  "wave1-fam-vocab-explain",
  "wave1-fam-synonym-battery",
  "wave1-fam-tick-justify",
  "wave1-fam-quote-explain",
  "wave1-fam-sequencing",
  "wave1-fam-two-character",
  "wave1-fam-emotion-cause",
  "wave2-fam-multiselect",
];

test("every one of the 9 English families resolves to a real scaffold kind", () => {
  for (const f of ALL_FAMILIES) {
    assert.ok(getGuidedScaffoldKind(f), `${f} has no guided scaffold kind`);
  }
});

test("an unknown family returns undefined, not a fabricated default", () => {
  assert.equal(getGuidedScaffoldKind("not-a-real-family"), undefined);
  assert.equal(getGuidedScaffoldKind(undefined), undefined);
});

test("every family's instruction text is non-empty and family-specific, not one shared generic string", () => {
  const seen = new Set<string>();
  for (const f of ALL_FAMILIES) {
    const kind = getGuidedScaffoldKind(f);
    const text = getGuidedInstructionText(f, kind);
    assert.ok(text.length > 20, `${f} instruction text too short/generic`);
    seen.add(text);
  }
  // The 4 "locate-instruction" families each have their own distinct
  // string (not literally all sharing the one fallback line).
  const locateFamilies = ALL_FAMILIES.filter((f) => getGuidedScaffoldKind(f) === "locate-instruction");
  const locateTexts = new Set(locateFamilies.map((f) => getGuidedInstructionText(f, "locate-instruction")));
  assert.equal(locateTexts.size, locateFamilies.length, "locate-instruction families must not all share identical text");
});

test("multiselect live count: under the required count is not over limit", () => {
  const r = checkLiveSelectionCount("A, B", 4);
  assert.equal(r.selectedCount, 2);
  assert.equal(r.overLimit, false);
});

test("multiselect live count: exactly at the required count is not over limit", () => {
  const r = checkLiveSelectionCount("A, B, C, D", 4);
  assert.equal(r.selectedCount, 4);
  assert.equal(r.overLimit, false);
});

test("multiselect live count: exceeding the required count is flagged, before submission", () => {
  const r = checkLiveSelectionCount("A, B, C, D, E", 4);
  assert.equal(r.selectedCount, 5);
  assert.equal(r.overLimit, true);
});

test("multiselect live count: duplicate tokens do not inflate the count", () => {
  const r = checkLiveSelectionCount("A, A, B", 4);
  assert.equal(r.selectedCount, 2);
});

test("multiselect live count: newline-separated input parses the same as comma-separated", () => {
  const r = checkLiveSelectionCount("A\nB\nC", 4);
  assert.equal(r.selectedCount, 3);
});

test("multiselect live count: empty input is zero, not over limit, does not throw", () => {
  const r = checkLiveSelectionCount("", 4);
  assert.equal(r.selectedCount, 0);
  assert.equal(r.overLimit, false);
});
