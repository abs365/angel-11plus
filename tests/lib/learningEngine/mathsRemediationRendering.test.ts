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
  const blockMatch = src.match(/\{shouldRenderMathsMisconceptionNote\(submitted, lastCorrect, addressesMisconception, misconceptionLabel\) && \(([\s\S]*?)\n {8}\)\}/);
  assert.ok(blockMatch, "MathsActivity's remediation block not found");
  return blockMatch![1];
}

// --- A/B: the render gate itself no longer requires misconceptionLabel ---

test("A/B: MathsActivity's remediation block is gated by the shared Maths predicate alone, never additionally by misconceptionLabel as a prerequisite", () => {
  const src = mathsActivitySource();
  // Educational Depth Programme, Phase 1 Wave 1 -- the gate is now
  // shouldRenderMathsMisconceptionNote, which takes the family label as a
  // FALLBACK argument rather than treating it as a prerequisite. Completion
  // A's actual protective intent (a missing label must never suppress real
  // row-level text) is unchanged and is proven directly, against the real
  // predicate rather than against source text, in
  // practiceInteractionGuard.test.ts.
  assert.match(
    src,
    /\{shouldRenderMathsMisconceptionNote\(submitted, lastCorrect, addressesMisconception, misconceptionLabel\) && \(/,
    "the remediation block must be gated by the shared Maths predicate"
  );
  // The old, incorrect gate required `&& misconceptionLabel` directly after
  // the predicate call -- assert that exact broken pattern is still gone.
  assert.ok(
    !/shouldRenderMathsMisconceptionNote\([^)]*\) && misconceptionLabel/.test(src),
    "misconceptionLabel must never be an additional AND-prerequisite for rendering the remediation block"
  );
  // And the widened gate must genuinely still pass the row-level text
  // through as the first-choice signal, not have been replaced by a
  // label-only block.
  assert.ok(
    /shouldRenderMathsMisconceptionNote\(submitted, lastCorrect, addressesMisconception, /.test(src),
    "the row-level text must still be the predicate's own primary argument"
  );
});

test("A: addressesMisconception renders on its own presence alone -- never nested inside a misconceptionLabel check -- and is passed through the humanizer before display", () => {
  const block = remediationBlock();
  assert.match(
    block,
    /<p[^>]*>\{humanizeMisconceptionText\(addressesMisconception\)\}<\/p>/,
    "addressesMisconception must render as its own paragraph, humanized before display"
  );
  // Wave 1: the text paragraph is now guarded by `addressesMisconception &&`
  // because the block can be entered on the family label alone (the 398-row
  // no-text case). That guard must depend on the TEXT's own presence, never
  // on the label -- otherwise Completion A's defect returns.
  assert.match(
    block,
    /\{addressesMisconception && \(/,
    "the text paragraph must be guarded by the presence of the text itself"
  );
  // Non-nesting is proven structurally rather than by a cross-line regex
  // (which would false-positive on two SIBLING conditionals): the label
  // conditional must be the single-line, self-closing form asserted by
  // test B below, so it is necessarily closed before the text paragraph
  // begins. A multi-line `{misconceptionLabel && (` opener is the only
  // shape that could enclose the text, so its absence is the real check.
  assert.ok(
    !/\{misconceptionLabel && \(/.test(block),
    "misconceptionLabel must not open a multi-line conditional that could enclose the misconception text"
  );
  const labelLine = block.split(String.fromCharCode(10)).find((l) => l.includes("misconceptionLabel &&"));
  assert.ok(labelLine && labelLine.trimEnd().endsWith("}"), "the label conditional must open and close on one line");
  assert.ok(labelLine && !labelLine.includes("humanizeMisconceptionText"), "the label conditional must not contain the misconception text");
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
  const callCount = (src.match(/shouldRenderMathsMisconceptionNote\(/g) ?? []).length;
  assert.equal(callCount, 1, "MathsActivity must call the shared predicate exactly once, never a parallel local condition");
  // MathsActivity must not also call the English/shared gate -- two gates in
  // one component is exactly the divergence this test exists to prevent.
  const sharedGateCalls = (src.match(/[^s]shouldRenderMisconceptionNote\(/g) ?? []).length;
  assert.equal(sharedGateCalls, 0, "MathsActivity must not additionally call the un-widened shared predicate");
});

// --- E: recently activated hard families are genuinely reachable ---

// Educational Increment 003, Wave 1 -- `mr01-reverse-mean`,
// `mr04-reverse-percentage`, and `mr04-time-reverse` deliberately GAINED
// real MATHS_FAMILY_TEACHING_CONTENT entries this wave (closing a real,
// previously-disclosed zero-coverage gap for exactly these 3 families --
// see ANGEL_EDUCATIONAL_INCREMENT_003_WAVE1_PRE_PUBLICATION_REPORT.md
// §J). `mr03-coord-combined` and `mr04-bv-convert` were not touched and
// genuinely still have none. Split accordingly, rather than silently
// weakening the original "no dedicated teaching content" assertion for
// all 5 -- the fallback-path proof (test E below) still needs a REAL
// no-teaching-content family to be meaningful, and now also proves the
// positive case for the 3 families this wave added content to.
const STILL_NO_TEACHING_CONTENT = ["mr03-coord-combined", "mr04-bv-convert"];
const GAINED_TEACHING_CONTENT_IN_EI003_WAVE1 = ["mr01-reverse-mean", "mr04-reverse-percentage", "mr04-time-reverse"];

test("E: mr03-coord-combined and mr04-bv-convert still have no dedicated teaching content (the exact fallback path this correction fixes); mr01-reverse-mean/mr04-reverse-percentage/mr04-time-reverse now DO (Educational Increment 003, Wave 1) -- every family carries real addressesMisconception text regardless", () => {
  const allNewQuestions = [...mr04DepthQuestions, ...inc006DepthQuestions];
  const families = new Set(allNewQuestions.map((q: { family_id: string }) => q.family_id));
  assert.deepEqual(
    [...families].sort(),
    ["mr01-reverse-mean", "mr03-coord-combined", "mr04-bv-convert", "mr04-reverse-percentage", "mr04-time-reverse"].sort()
  );
  for (const familyId of STILL_NO_TEACHING_CONTENT) {
    assert.ok(families.has(familyId));
    assert.equal(getMathsTeachingContent(familyId), undefined, `${familyId} must remain a genuine no-teaching-content family for this test to be meaningful`);
  }
  for (const familyId of GAINED_TEACHING_CONTENT_IN_EI003_WAVE1) {
    assert.ok(families.has(familyId));
    assert.notEqual(getMathsTeachingContent(familyId), undefined, `${familyId} gained real teaching content in Educational Increment 003 Wave 1 -- this must not silently regress back to undefined`);
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
  // Comments are stripped before counting. The original guard counted raw
  // source occurrences, which made it fail whenever a comment merely NAMED
  // the identifier -- coupling a real leakage guard to prose. Stripping
  // comments keeps the guard's actual intent (no stray or duplicated render
  // path) without that fragility.
  const src = mathsActivitySource()
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  const occurrences = [...src.matchAll(/addressesMisconception/g)].length;
  // prop type declaration, destructured parameter, gate argument,
  // text-presence guard, interpolated render = exactly 5 real references.
  // The 5th (the text-presence guard) is new in Educational Depth
  // Programme Phase 1 Wave 1, which allows the block to be entered on the
  // family label alone when a row carries no text of its own.
  assert.equal(occurrences, 5, `expected exactly 5 references to addressesMisconception in MathsActivity, found ${occurrences}`);
});
