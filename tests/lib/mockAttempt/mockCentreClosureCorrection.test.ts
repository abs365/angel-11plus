import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Increment 3 Closure Correction (Founder production visual testing) —
 * Sections 3 and 4. Real Founder production screenshot evidence:
 * "Reading Comprehension Mock 1" claimed "The complete CSSE Mock, with
 * Continuous Writing and Mathematics together, is still being built."
 * directly beneath the already-available CsseCompleteMockCard -- a stale,
 * self-contradicting claim about current product capability. Separately,
 * the non-affiliation disclosure used a warning-style amber panel that
 * visually competed with the learner's actual Mock choices.
 *
 * Structural/source-text assertions, matching this project's established
 * convention for this exact class of page (no jsdom/React Testing Library
 * in this repository's test setup).
 */

const PAGE = readFileSync("app/mocks/page.tsx", "utf8");

test("the 'still being built' claim about the complete CSSE Mock is conditional on completeCsseMockAvailable, never unconditional", () => {
  assert.doesNotMatch(
    PAGE,
    /description:\s*"[^"]*is still being built\.?"/,
    "the stale claim must never be a hardcoded, unconditional description string again"
  );
  assert.match(PAGE, /function csseMockDescription\(/, "the description must be computed, gated on real availability");
  assert.match(PAGE, /completeCsseMockAvailable\s*\?\s*meta\.baseDescription\s*:\s*`\$\{meta\.baseDescription\}\s*\$\{meta\.notYetCompleteNote\}`/);
});

test("both CSSE mock cards (rich, pathway-prioritised and simple, no-pathway-selected) pass completeCsseMockAvailable through to the description", () => {
  assert.match(PAGE, /completeCsseMockAvailable=\{completeCsseMockAvailable\}/, "CsseRichMockCard must receive the real, live availability flag");
  assert.match(PAGE, /description=\{csseMockDescription\(attemptType, completeCsseMockAvailable\)\}/, "the no-pathway-selected SimpleMockCard must use the same gated description, not the old static field");
});

test("csseMockDescription() never claims the complete Mock is still being built once it is genuinely available", () => {
  // Import indirectly via a structural check: the not-yet-complete note is
  // ONLY appended in the false branch of the ternary (proven by the exact
  // ternary shape asserted above); this test locks the two real sentences
  // themselves so a future edit cannot silently reintroduce the
  // contradiction by renaming the field instead of removing the claim.
  assert.match(PAGE, /notYetCompleteNote:\s*"The complete CSSE Mock, with English and Mathematics together, is still being built\."/);
  assert.match(PAGE, /notYetCompleteNote:\s*"The complete CSSE Mock, with Continuous Writing and Mathematics together, is still being built\."/);
  assert.doesNotMatch(PAGE, /baseDescription:\s*"[^"]*is still being built/, "the base (always-shown) description must never itself contain the stale claim");
});

test("the non-affiliation disclosure is calm/secondary typography, not a warning-style amber panel", () => {
  assert.doesNotMatch(PAGE, /bg-amber-50|bg-amber-950|border-amber-100|border-amber-900|text-amber-700|text-amber-300/, "no amber warning-panel styling may remain on this page");
  assert.match(
    PAGE,
    /<p className="text-\[11px\] text-\[var\(--angel-muted\)\] leading-relaxed">\s*\n\s*These are original practice papers created by Angel 11\+\./,
    "the disclosure text itself must be unchanged, only its visual treatment"
  );
});

test("no other CSSE Mock Centre surface (app/mocks/page.tsx or app/learning-intelligence/mock-exam/**) contains a stale 'still being built'/'being rebuilt'/'coming soon' claim", () => {
  const sittingPage = readFileSync("app/learning-intelligence/mock-exam/sitting/page.tsx", "utf8");
  const mockExamPage = readFileSync("app/learning-intelligence/mock-exam/page.tsx", "utf8");
  for (const [name, src] of [["sitting", sittingPage], ["mock-exam", mockExamPage]] as const) {
    assert.doesNotMatch(src, /still being built|being rebuilt|coming soon/i, `${name}/page.tsx must not claim stale development status`);
  }
});
