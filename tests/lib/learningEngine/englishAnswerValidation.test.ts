import { test } from "node:test";
import assert from "node:assert/strict";
import { checkAcceptedAnswerSet, checkQuotationPresent, checkOrderedSequence, checkMultiSelect } from "@/lib/learningEngine/englishAnswerValidation";

/**
 * Educational Increment 007B. Exercises the 007A-designed Answer
 * Validation Architecture against real Wave 1 question data (not
 * synthetic examples) — see scripts/generate-english-wave1.mjs.
 */

// --- Tier 2: accepted-answer-set (vocabulary-in-context) -----------------

test("Tier 2: accepts a curated synonym even when it doesn't literally appear in the model answer", () => {
  // w1-kitemaker-02: "unhurried" -> accepted set includes "calm and slow", "not rushed", etc.
  const accepted = ["calm and slow", "not rushed", "taking his time", "relaxed, not in a hurry"];
  assert.equal(checkAcceptedAnswerSet("not rushed", accepted).correct, true);
  assert.equal(checkAcceptedAnswerSet("He was taking his time", accepted).correct, true);
});

test("Tier 2: rejects a plausible-sounding but wrong answer not in the accepted set", () => {
  const accepted = ["calm and slow", "not rushed", "taking his time", "relaxed, not in a hurry"];
  assert.equal(checkAcceptedAnswerSet("lazy", accepted).correct, false);
});

test("Tier 2: case-insensitive and whitespace-tolerant", () => {
  const accepted = ["ashamed", "self-conscious", "awkward", "humiliated"];
  assert.equal(checkAcceptedAnswerSet("  AWKWARD  ", accepted).correct, true);
});

test("Tier 2: empty answer never matches", () => {
  assert.equal(checkAcceptedAnswerSet("", ["ashamed"]).correct, false);
  assert.equal(checkAcceptedAnswerSet("   ", ["ashamed"]).correct, false);
});

// --- Tier 3: quotation verification (evidence half only) -----------------

test("Tier 3: finds a required quotation reproduced exactly", () => {
  const result = checkQuotationPresent(
    "Grandad did not move, which shows he wanted Femi to work it out.",
    "Grandad did not move"
  );
  assert.equal(result.quotationFound, true);
  assert.equal(result.explanationStatus, "NOT_AUTOMATICALLY_GRADABLE");
});

test("Tier 3: tolerates spelling/punctuation differences in the quotation, per the real CSSE mark scheme's own rule", () => {
  const result = checkQuotationPresent(
    "she says 'grandad did not move' which shows...",
    "Grandad did not move"
  );
  assert.equal(result.quotationFound, true, "case and punctuation must not cause a false negative, matching the mark scheme's own tolerance");
});

test("Tier 3: does not find a quotation that was paraphrased rather than quoted, matching the mark scheme's explicit rejection of paraphrase here", () => {
  const result = checkQuotationPresent(
    "He didn't move at all, which shows he wanted her to work it out.",
    "Grandad did not move"
  );
  assert.equal(result.quotationFound, false, "a paraphrase is not a quotation, even if it conveys the same meaning");
});

test("Tier 3: never claims the explanation half is gradable", () => {
  const result = checkQuotationPresent("anything", "anything");
  assert.equal(result.explanationStatus, "NOT_AUTOMATICALLY_GRADABLE");
});

// --- Tier 4: ordered sequence with CSSE's own partial-credit rule ---------

test("Tier 4: all three items correct and in order earns full marks", () => {
  const acceptedSets = [["looked at / measured the arms"], ["trimmed the longer arm"], ["checked it again"]];
  const result = checkOrderedSequence(
    ["looked at / measured the arms", "trimmed the longer arm", "checked it again"],
    acceptedSets
  );
  assert.equal(result.marks, 3);
});

test("Tier 4: matches the CSSE mark scheme's own worked example — one wrong item, two correct-and-in-position, earns 2 of 3", () => {
  // Mirrors the 2023 mark scheme's "get in bath/wash/read" example: 2 of 3 correct in position.
  const acceptedSets = [["bask"], ["wash"], ["read"]];
  const result = checkOrderedSequence(["get in bath", "wash", "read"], acceptedSets);
  assert.equal(result.marks, 2);
});

test("Tier 4: matches the CSSE mark scheme's own worked example — all items correct but only one in the right position, earns 1 of 3", () => {
  // Mirrors the 2023 mark scheme's "bask/read/wash" example: all correct individually, only position 1 right.
  const acceptedSets = [["bask"], ["wash"], ["read"]];
  const result = checkOrderedSequence(["bask", "read", "wash"], acceptedSets);
  assert.equal(result.marks, 1);
});

test("Tier 4: a missing final item does not throw and scores only the positions actually answered", () => {
  const acceptedSets = [["got lost on the first day"], ["made a friend (Yusra)"], ["still misses home, but less"]];
  const result = checkOrderedSequence(["got lost on the first day", "made a friend (Yusra)"], acceptedSets);
  assert.equal(result.marks, 2);
  assert.equal(result.totalPositions, 3);
});

// --- Tier 6: multi-select recognition (Educational Increment 007C) -------

test("Tier 6: exact selection of the correct set earns full marks", () => {
  const result = checkMultiSelect(["A", "D", "E", "G"], ["A", "D", "E", "G"], 4);
  assert.equal(result.marks, 4);
  assert.equal(result.exactMatch, true);
  assert.equal(result.overSelected, false);
});

test("Tier 6: order and case of selections do not matter", () => {
  const result = checkMultiSelect(["g", "a", "e", "d"], ["A", "D", "E", "G"], 4);
  assert.equal(result.marks, 4);
  assert.equal(result.exactMatch, true);
});

test("Tier 6: under-selection earns partial credit for correct selections only, per position", () => {
  const result = checkMultiSelect(["A", "D"], ["A", "D", "E", "G"], 4);
  assert.equal(result.marks, 2);
  assert.equal(result.exactMatch, false);
  assert.equal(result.overSelected, false);
});

test("Tier 6: wrong selections earn no credit for those selections, correct ones still count", () => {
  const result = checkMultiSelect(["A", "B", "C", "D"], ["A", "D", "E", "G"], 4);
  // A and D are correct; B and C are wrong (but within the allowed count of 4).
  assert.equal(result.marks, 2);
  assert.equal(result.overSelected, false);
});

test("Tier 6: over-selection loses ALL marks, per the directly-evidenced CSSE rule (\"will lose all the marks\")", () => {
  const result = checkMultiSelect(["A", "D", "E", "G", "H"], ["A", "D", "E", "G"], 4);
  assert.equal(result.overSelected, true);
  assert.equal(result.marks, 0, "even though 4 of the 5 selections are correct, over-selection must zero the mark, matching the CSSE cover-page rule exactly");
});

test("Tier 6: zero selections earns zero marks, does not throw", () => {
  const result = checkMultiSelect([], ["A", "D", "E", "G"], 4);
  assert.equal(result.marks, 0);
  assert.equal(result.selectedCount, 0);
});

test("Tier 6: a completely wrong selection set (all distractors) earns zero, not negative or NaN", () => {
  const result = checkMultiSelect(["B", "C", "F", "H"], ["A", "D", "E", "G"], 4);
  assert.equal(result.marks, 0);
  assert.equal(Number.isNaN(result.marks), false);
});
