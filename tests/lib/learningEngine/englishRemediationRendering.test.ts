import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * CSSE Completion Programme, Phase C, Part 3 — closes the English
 * remediation-rendering gap identified in the completion baseline and
 * re-confirmed by direct code trace this phase: `addresses_misconception`
 * is 100% populated for every named, Practice Eligible English question
 * (human-reviewed content, Controlled Review Batches 1-4) but was never
 * rendered anywhere in `ReadingActivity` (`app/learning-intelligence/
 * practice/[area]/page.tsx`) — only `MathsActivity` ever received it.
 *
 * No `jsdom`/React Testing Library exists in this project's test setup
 * (confirmed: `package.json`'s `test` script is plain `tsx --test`), so
 * this mirrors the established pattern `tests/lib/learningEngine/
 * writingMasterySafety.test.ts` already uses for asserting behaviour of
 * this same file: a source-text regex check against the real page
 * component, not a rendered-DOM assertion.
 *
 * Stage 3, Increment 001 update — the inline `submitted && !lastCorrect
 * && addressesMisconception` condition this file originally matched was
 * extracted into `shouldRenderMisconceptionNote()`
 * (`lib/learningEngine/practiceInteractionGuard.ts`) so both
 * ReadingActivity and MathsActivity are provably identical rather than
 * merely assumed to be, and so the gating logic itself has real
 * behavioural test coverage (`tests/lib/learningEngine/
 * practiceInteractionGuard.test.ts`) rather than only a source-text
 * regex. No rendering behaviour changed — this file's own regexes are
 * updated to match the new call site; the gating semantics they used to
 * verify inline are now verified more rigorously in that other file.
 */

const PAGE_PATH = "app/learning-intelligence/practice/[area]/page.tsx";

function readingActivitySource(): string {
  const src = readFileSync(PAGE_PATH, "utf8");
  const start = src.indexOf("function ReadingActivity(");
  const end = src.indexOf("function MathsActivity(");
  assert.ok(start !== -1 && end !== -1 && end > start, "could not isolate the ReadingActivity function body");
  return src.slice(start, end);
}

test("ReadingActivity's function signature accepts an addressesMisconception prop", () => {
  const src = readingActivitySource();
  assert.match(src, /addressesMisconception[?]?:\s*string/, "ReadingActivity must declare an addressesMisconception prop");
});

test("ReadingActivity renders addressesMisconception, gated via the shared shouldRenderMisconceptionNote() predicate (never before submission, never on a correct answer)", () => {
  const src = readingActivitySource();
  assert.match(
    src,
    /\{shouldRenderMisconceptionNote\(submitted, lastCorrect, addressesMisconception\) && \(/,
    "the remediation block must be gated by the shared predicate, exactly like MathsActivity's equivalent block -- see practiceInteractionGuard.test.ts for the predicate's own gating semantics (submitted && !lastCorrect && addressesMisconception)"
  );
});

test("ReadingActivity's remediation block actually interpolates the real addressesMisconception value, not a hardcoded placeholder", () => {
  const src = readingActivitySource();
  const blockMatch = src.match(/\{shouldRenderMisconceptionNote\(submitted, lastCorrect, addressesMisconception\) && \(([\s\S]*?)\)\}/);
  assert.ok(blockMatch, "remediation block not found");
  assert.match(blockMatch![1], /\{addressesMisconception\}/, "the block must render the real prop value");
});

test("the remediation framing never claims to know the specific learner's own reasoning (no 'you probably thought' / 'you assumed' phrasing)", () => {
  const src = readingActivitySource();
  const blockMatch = src.match(/\{shouldRenderMisconceptionNote\(submitted, lastCorrect, addressesMisconception\) && \(([\s\S]*?)\)\}/);
  assert.ok(blockMatch);
  const lower = blockMatch![1].toLowerCase();
  assert.ok(!lower.includes("you thought") && !lower.includes("you assumed"), "must not fabricate a diagnosis of this specific learner's reasoning");
});

test("the call site passes the real current.addressesMisconception value, not omitted or hardcoded", () => {
  const src = readFileSync(PAGE_PATH, "utf8");
  const callMatch = src.match(/<ReadingActivity[\s\S]*?\/>/);
  assert.ok(callMatch, "ReadingActivity call site not found");
  assert.match(callMatch![0], /addressesMisconception=\{current\.addressesMisconception\}/);
});

test("addressesMisconception is never referenced anywhere before the submitted-and-incorrect gate in ReadingActivity (no pre-submission leakage path)", () => {
  const src = readingActivitySource();
  // Every occurrence of the identifier outside the prop declaration/
  // destructuring and the one gated render block must not exist -- this
  // guards against a future edit accidentally adding a second, ungated
  // render path for the same data.
  const occurrences = [...src.matchAll(/addressesMisconception/g)].length;
  // 1: prop type declaration, 2: destructured parameter, 3: gate condition,
  // 4: interpolated render = exactly 4 real references.
  assert.equal(occurrences, 4, `expected exactly 4 references to addressesMisconception in ReadingActivity, found ${occurrences} -- investigate any new reference for a leakage risk`);
});
