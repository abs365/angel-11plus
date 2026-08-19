import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Completion Assurance Programme, Completion B — structural/source-text
 * assertions against the two real learner-facing files this correction
 * touches. No jsdom/React Testing Library exists in this project's test
 * setup, so this mirrors the established convention (englishRemediation
 * Rendering.test.ts, mathsRemediationRendering.test.ts): regex checks
 * against the real component source, not a rendered-DOM assertion.
 */

const MOCK_CENTRE = readFileSync("app/mocks/page.tsx", "utf8");
const MOCK_EXAM = readFileSync("app/learning-intelligence/mock-exam/page.tsx", "utf8");

// --- B: the mock-exam page must never show exam instructions before checking ---

test("B — MockExamPage starts at 'checking', never 'intro': exam instructions are never shown before availability is confirmed", () => {
  assert.match(MOCK_EXAM, /useState<Phase>\("checking"\)/, "the initial phase must be 'checking', not 'intro'");
});

test("B — MockExamPage resolves phase from isMockFormAvailable() on mount, before any exam-shaped content can render", () => {
  assert.match(
    MOCK_EXAM,
    /setPhase\(isMockFormAvailable\(active\) \? "intro" : "unavailable"\)/,
    "the mount-time check must derive phase from the authoritative predicate, not a separate flag"
  );
});

test("B — handleBegin()'s own authoritative re-check also uses the shared predicate, not a separate condition that could diverge", () => {
  assert.match(MOCK_EXAM, /if \(!isMockFormAvailable\(active\)\) \{ setPhase\("unavailable"\); return; \}/);
});

// --- A: the Mock Centre must never hard-code "Available" for the CSSE mock ---

test("A — the Mock Centre no longer hard-codes tone=\"success\" label=\"Available\" for the CSSE card", () => {
  assert.ok(
    !/<StatusIndicator tone="success" label="Available" \/>/.test(MOCK_CENTRE),
    "no hard-coded 'Available' badge may remain for the Full CSSE Mock card"
  );
});

test("A — the CSSE card's badge is derived from csseMockAvailable, itself set from isMockFormAvailable()", () => {
  assert.match(MOCK_CENTRE, /const \[csseMockAvailable, setCsseMockAvailable\] = useState\(false\)/, "must start false — never a false 'Available' flash");
  assert.match(MOCK_CENTRE, /setCsseMockAvailable\(isMockFormAvailable\(result\)\)/);
  assert.match(MOCK_CENTRE, /tone=\{csseMockAvailable \? "success" : "neutral"\}/);
});

test("A — SimpleMockCard (reused for the CSSE card in the no-pathway-selected view) never shows 'Available' when available=false", () => {
  assert.match(MOCK_CENTRE, /available\?: boolean/, "SimpleMockCard must accept an explicit availability signal");
  assert.match(MOCK_CENTRE, /label=\{best !== undefined \? "Completed" : available \? "Available" : "Not ready yet"\}/);
});

// --- B (continued): the Mock Centre must never route into a dead-end "Start mock" when unavailable ---

test("B — the Mock Centre shows 'Go to Practice' instead of 'Start mock' when the CSSE mock is unavailable, in both card render paths", () => {
  const goToPracticeCount = (MOCK_CENTRE.match(/Go to Practice/g) ?? []).length;
  assert.equal(goToPracticeCount, 2, "expected the fallback action in both the isCsse branch and SimpleMockCard");
  assert.ok(!MOCK_CENTRE.includes('href="/learning-intelligence/mock-exam"') || MOCK_CENTRE.includes("csseMockAvailable ?"), "the mock-exam link must be conditional on real availability");
});

test("A — the Mock Readiness card's own CTA is redirected to Practice when it would otherwise point at an unavailable mock, without touching assessMockReadiness()'s own verdict/explanation logic", () => {
  assert.match(
    MOCK_CENTRE,
    /readiness\.assessment\.nextAction\.href === "\/learning-intelligence\/mock-exam" && !csseMockAvailable/,
    "the readiness card's CTA must be conditioned on real content availability"
  );
  assert.match(MOCK_CENTRE, /See practice areas/, "the fallback CTA must lead somewhere Angel can genuinely deliver");
  // The explanation text itself is read straight from readiness.assessment.explanation,
  // completely unconditionally -- proving the underlying readiness verdict/copy is untouched.
  assert.match(MOCK_CENTRE, /\{readiness\.assessment\.explanation\}/);
});

// --- D: historical mock results must remain reachable independently of new-mock availability ---

test("D — Mock History (recentResults) renders unconditionally on having results, never gated by csseMockAvailable", () => {
  const historyBlockMatch = MOCK_CENTRE.match(/\{recentResults\.length > 0 && \(([\s\S]*?)\n {8}\)\}/);
  assert.ok(historyBlockMatch, "the Mock History section must exist, gated only on having real results");
  assert.ok(!historyBlockMatch![0].includes("csseMockAvailable"), "historical results must not depend on whether a NEW mock can currently be started");
});

// --- E: no synthetic fixture anywhere near this corrected flow ---

test("E — neither corrected file imports any synthetic/test fixture; production availability can never be made to look true by fixture data", () => {
  assert.ok(!/SyntheticFixture|synthetic.*[Ff]ixture/.test(MOCK_CENTRE), "Mock Centre must not import or reference a synthetic fixture");
  assert.ok(!/SyntheticFixture|synthetic.*[Ff]ixture/.test(MOCK_EXAM), "the canonical mock-exam page must not import or reference a synthetic fixture");
});

// --- F: no internal implementation terminology leaks into learner-facing copy ---

/**
 * Strips // and /* *\/ comments so this test checks the same thing a
 * learner actually sees — rendered JSX text and string literal props —
 * not internal engineering commentary, which is free to name real
 * system internals for future maintainers.
 */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

test("F — no internal implementation terminology appears anywhere in either learner-facing file's rendered text (comments excluded)", () => {
  const forbidden = ["mock_eligible", "eligibility_status", "synthetic fixture", "question bank", "ali_question_bank", "ali_mock_form"];
  const mockCentreCode = stripComments(MOCK_CENTRE);
  const mockExamCode = stripComments(MOCK_EXAM);
  for (const term of forbidden) {
    assert.ok(!mockCentreCode.toLowerCase().includes(term.toLowerCase()), `Mock Centre must not expose "${term}"`);
    assert.ok(!mockExamCode.toLowerCase().includes(term.toLowerCase()), `mock-exam page must not expose "${term}"`);
  }
});

test("F — the corrected empty-state copy names no internal system, promises no date, and does not imply the learner did something wrong", () => {
  assert.ok(MOCK_CENTRE.includes("A full mock is not available right now"));
  assert.ok(!/\byou\s+(need|must|should have|forgot|missed)\b/i.test(MOCK_CENTRE), "must never imply the learner is at fault");
  assert.ok(!/\b(20\d\d|january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(
    MOCK_CENTRE.match(/A full mock is not available right now[\s\S]{0,300}/)?.[0] ?? ""
  ), "must never promise a specific date");
});
