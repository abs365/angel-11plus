import { test } from "node:test";
import assert from "node:assert/strict";
import {
  findDuplicateIds,
  findExactDuplicateStems,
  findNearIdenticalStems,
  normaliseStemForNearDuplicateCheck,
  checkFamilyOverSelection,
  checkRecentLearnerExposure,
  checkMockPracticeCrossover,
  checkPassageReuseIntoProhibitedContext,
  runContentPoolChecks,
} from "@/lib/ali/antiMemorisationChecks";

/**
 * Question Factory Wave 1, Phase 1 — `lib/ali/antiMemorisationChecks.ts`
 * had zero test coverage of any kind before this file, despite being a
 * real, well-reasoned module (confirmed by the Wave 1 Gap Register). These
 * are real behavioural tests over the pure functions themselves, not a
 * mock of them — this is the proof the module actually does what its own
 * docstrings claim, independent of whether any caller wires it in.
 */

test("findDuplicateIds finds a real duplicate primary key, never flags genuinely distinct ids", () => {
  const rows = [{ id: "a" }, { id: "b" }, { id: "a" }, { id: "c" }];
  const result = findDuplicateIds(rows);
  assert.deepEqual(result, [{ id: "a", occurrences: 2 }]);
});

test("findExactDuplicateStems catches two different question ids with byte-identical (trimmed) stem text", () => {
  const rows = [
    { id: "q1", prompt: { stem: "What is 2 + 2?" } },
    { id: "q2", prompt: { stem: "  What is 2 + 2?  " } },
    { id: "q3", prompt: { stem: "What is 3 + 3?" } },
  ];
  const result = findExactDuplicateStems(rows);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0].ids.sort(), ["q1", "q2"]);
});

test("normaliseStemForNearDuplicateCheck collapses digit runs to a single placeholder and lowercases/trims whitespace", () => {
  assert.equal(normaliseStemForNearDuplicateCheck("What is 24% of 150?"), "what is #% of #?");
  assert.equal(normaliseStemForNearDuplicateCheck("  Multiply  7   by  9 "), "multiply 7 by 9".replace(/\d+/g, "#"));
});

test("findNearIdenticalStems catches the exact 'changing numbers only' pattern the Founder's own instruction names as NOT a genuine new family", () => {
  const rows = [
    { id: "v1", prompt: { stem: "What is 24% of 150?" } },
    { id: "v2", prompt: { stem: "What is 60% of 200?" } },
    { id: "v3", prompt: { stem: "What fraction of the shape is shaded?" } },
  ];
  const result = findNearIdenticalStems(rows);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0].ids.sort(), ["v1", "v2"]);
});

test("findNearIdenticalStems does not flag genuinely different stems that happen to share no digits", () => {
  const rows = [
    { id: "a", prompt: { stem: "What is the capital of France?" } },
    { id: "b", prompt: { stem: "Name a synonym for happy." } },
  ];
  assert.deepEqual(findNearIdenticalStems(rows), []);
});

test("rows with no readable stem text are skipped, never falsely grouped together under an empty string", () => {
  const rows = [{ id: "a", prompt: {} }, { id: "b", prompt: {} }, { id: "c", prompt: null }];
  assert.deepEqual(findExactDuplicateStems(rows), []);
  assert.deepEqual(findNearIdenticalStems(rows), []);
});

test("checkFamilyOverSelection flags a family drawn on more than the caller-supplied max, never hardcodes its own threshold", () => {
  const selected = ["q1", "q2", "q3", "q4"];
  const familyById = new Map([
    ["q1", "fam-a"],
    ["q2", "fam-a"],
    ["q3", "fam-a"],
    ["q4", "fam-b"],
  ]);
  assert.deepEqual(checkFamilyOverSelection(selected, familyById, 2), [{ familyId: "fam-a", count: 3 }]);
  assert.deepEqual(checkFamilyOverSelection(selected, familyById, 3), []);
});

test("checkRecentLearnerExposure returns only genuine overlap with the recently-served set, no heuristic guessing", () => {
  const recentlyServed = new Set(["q1", "q3"]);
  assert.deepEqual(checkRecentLearnerExposure(["q1", "q2", "q3", "q4"], recentlyServed), ["q1", "q3"]);
});

test("checkMockPracticeCrossover and checkPassageReuseIntoProhibitedContext both return only real overlap with the exposed set", () => {
  const exposedQuestions = new Set(["mq1"]);
  assert.deepEqual(checkMockPracticeCrossover(["mq1", "pq1"], exposedQuestions), ["mq1"]);
  const exposedPassages = new Set(["pass-1"]);
  assert.deepEqual(checkPassageReuseIntoProhibitedContext(["pass-1", "pass-2"], exposedPassages), ["pass-1"]);
});

test("runContentPoolChecks runs all three pool-level checks in one pass and returns a bounded report shape", () => {
  const rows = [
    { id: "a", prompt: { stem: "What is 5 + 5?" } },
    { id: "a", prompt: { stem: "What is 5 + 5?" } },
  ] as unknown as Parameters<typeof runContentPoolChecks>[0];
  const report = runContentPoolChecks(rows);
  assert.ok(report.duplicateIds.length > 0);
  assert.ok("exactDuplicateStems" in report && "nearIdenticalStems" in report);
});
