import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getMathsTeachingContent } from "@/lib/learningEngine/mathsTeachingContent";
import { mathsQuestions as mr04DepthQuestions } from "../../../scripts/generate-mr04-depth-batch.mjs";
import { mathsQuestions as inc006DepthQuestions } from "../../../scripts/generate-inc006-structural-depth-batch.mjs";

/**
 * Completion Assurance Programme, Completion A (MR-04+/Increment 006
 * governed decision) — closes the Mathematics misconception-rendering
 * gap the external completion review found and this session independently
 * confirmed: MathsActivity required `misconceptionLabel` (sourced from a
 * family's optional dedicated teaching content) before it would render
 * the question's own real `addressesMisconception` text at all, silently
 * discarding valid, independently-reviewed feedback for every family
 * without a teaching-content object -- including every "hard" structural-
 * depth family Stage 3 authored and activated this arc.
 *
 * Mirrors tests/lib/learningEngine/englishRemediationRendering.test.ts's
 * own established source-text-regex convention (no jsdom/React Testing
 * Library in this project's test setup) and reuses the existing,
 * unmodified `getMathsTeachingContent()` data-layer function -- this is a
 * rendering-condition fix, not a new mechanism.
 */

const PAGE_PATH = "app/learning-intelligence/practice/[area]/page.tsx";

function mathsActivitySource(): string {
  const src = readFileSync(PAGE_PATH, "utf8");
  const start = src.indexOf("function MathsActivity(");
  assert.ok(start !== -1, "could not locate MathsActivity");
  // MathsActivity is the last top-level function in this file — slice to EOF.
  return src.slice(start);
}

function remediationBlock(): string {
  const src = mathsActivitySource();
  const blockMatch = src.match(/\{shouldRenderMisconceptionNote\(submitted, lastCorrect, addressesMisconception\) && \(([\s\S]*?)\n {8}\)\}/);
  assert.ok(blockMatch, "MathsActivity's remediation block not found");
  return blockMatch![1];
}

// --- A/B: the render gate itself no longer requires misconceptionLabel ---

test("A/B: MathsActivity's remediation block is gated ONLY by the shared shouldRenderMisconceptionNote() predicate, never additionally by misconceptionLabel", () => {
  const src = mathsActivitySource();
  assert.match(
    src,
    /\{shouldRenderMisconceptionNote\(submitted, lastCorrect, addressesMisconception\) && \(/,
    "the remediation block must be gated by the shared predicate alone, matching ReadingActivity's own call site exactly"
  );
  // The old, incorrect gate additionally required `&& misconceptionLabel`
  // directly after the predicate call -- assert that exact broken pattern
  // is gone, not merely that *a* working pattern exists elsewhere.
  assert.ok(
    !/shouldRenderMisconceptionNote\(submitted, lastCorrect, addressesMisconception\) && misconceptionLabel/.test(src),
    "misconceptionLabel must never be an additional prerequisite for rendering the remediation block"
  );
});

test("A: addressesMisconception itself renders unconditionally inside the block, not nested inside a misconceptionLabel check, and is passed through the humanizer before display", () => {
  const block = remediationBlock();
  assert.match(
    block,
    /<p[^>]*>\{humanizeMisconceptionText\(addressesMisconception\)\}<\/p>/,
    "addressesMisconception must render as its own unconditional paragraph, humanized before display"
  );
});

test("B: misconceptionLabel, when present, still renders as an optional heading ahead of the humanized misconception text", () => {
  const block = remediationBlock();
  assert.match(block, /\{misconceptionLabel && <p[^>]*>\{misconceptionLabel\}<\/p>\}/, "misconceptionLabel must remain an optional enhancement, not removed entirely");
  const labelIndex = block.indexOf("misconceptionLabel &&");
  const textIndex = block.indexOf("{humanizeMisconceptionText(addressesMisconception)}");
  assert.ok(labelIndex !== -1 && textIndex !== -1 && labelIndex < textIndex, "when present, the label heading must precede the misconception text");
});

// --- C/D: reused, unmodified gating semantics (not reimplemented here) ---

test("C/D: the underlying submitted/lastCorrect/addressesMisconception gating is the same shared, already-tested predicate — not duplicated or weakened in this file", () => {
  // shouldRenderMisconceptionNote's own behaviour (false when
  // addressesMisconception is falsy; false on a correct answer; false
  // before submission) is already proven directly in
  // practiceInteractionGuard.test.ts. This test only proves MathsActivity
  // still calls that exact shared function, not a local reimplementation.
  const src = mathsActivitySource();
  const callCount = (src.match(/shouldRenderMisconceptionNote\(/g) ?? []).length;
  assert.equal(callCount, 1, "MathsActivity must call the shared predicate exactly once, never a parallel local condition");
});

// --- E: recently activated hard families are genuinely reachable ---

test("E: every MR-04-depth and Increment-006 family has no dedicated teaching content (the exact fallback path this correction fixes) but does carry real addressesMisconception text", () => {
  const allNewQuestions = [...mr04DepthQuestions, ...inc006DepthQuestions];
  const families = new Set(allNewQuestions.map((q: { family_id: string }) => q.family_id));
  assert.deepEqual(
    [...families].sort(),
    ["mr01-reverse-mean", "mr03-coord-combined", "mr04-bv-convert", "mr04-reverse-percentage", "mr04-time-reverse"].sort()
  );
  for (const familyId of families) {
    assert.equal(getMathsTeachingContent(familyId), undefined, `${familyId} must remain a genuine no-teaching-content family for this test to be meaningful`);
  }
  for (const q of allNewQuestions as { id: string; misconception: string }[]) {
    assert.ok(q.misconception && q.misconception.trim().length > 0, `${q.id} must carry real misconception text for this correction to have any effect`);
  }
});

// --- F: existing families with teaching content are unaffected ---

test("F: a family WITH dedicated teaching content still resolves a real misconceptionLabel (existing behaviour intact, not regressed by this correction)", () => {
  const content = getMathsTeachingContent("mr04-elapsed-time");
  assert.ok(content, "mr04-elapsed-time is expected to have dedicated teaching content");
});

test("no pre-submission or duplicate leakage path was introduced: addressesMisconception appears exactly where expected in MathsActivity", () => {
  const src = mathsActivitySource();
  const occurrences = [...src.matchAll(/addressesMisconception/g)].length;
  // prop type declaration, destructured parameter, gate condition,
  // interpolated render = exactly 4 real references, same discipline as
  // englishRemediationRendering.test.ts's own equivalent guard.
  assert.equal(occurrences, 4, `expected exactly 4 references to addressesMisconception in MathsActivity, found ${occurrences}`);
});
