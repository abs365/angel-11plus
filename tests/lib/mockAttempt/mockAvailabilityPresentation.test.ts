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

test("A — the CSSE cards' badges are derived from csseMocks state, itself set from isMockFormAvailable() -- generalised in Programme Completion Increment 016 from a single full_mock-only flag to one entry per discovered CSSE Mock form", () => {
  assert.match(MOCK_CENTRE, /full_mock: \{ available: false, displayName: CSSE_MOCK_META\.full_mock\.fallbackName \}/, "must start false — never a false 'Available' flash");
  assert.match(MOCK_CENTRE, /timed_section: \{ available: false, displayName: CSSE_MOCK_META\.timed_section\.fallbackName \}/, "Reading must also start false");
  assert.match(MOCK_CENTRE, /available: isMockFormAvailable\(result\)/);
  assert.match(MOCK_CENTRE, /tone=\{available \? "success" : "neutral"\}/, "the reusable CsseRichMockCard component derives tone from its own available prop");
});

test("A — SimpleMockCard (reused for the CSSE card in the no-pathway-selected view) never shows 'Available' when available=false", () => {
  assert.match(MOCK_CENTRE, /available\?: boolean/, "SimpleMockCard must accept an explicit availability signal");
  assert.match(MOCK_CENTRE, /label=\{best !== undefined \? "Completed" : available \? "Available" : "Not ready yet"\}/);
});

// --- B (continued): the Mock Centre must never route into a dead-end "Start mock" when unavailable ---

test("B — the Mock Centre shows 'Go to Practice' instead of 'Start mock' when a CSSE mock is unavailable, in both card render paths (CsseRichMockCard and SimpleMockCard, each defined once in source and reused per discovered form)", () => {
  const goToPracticeCount = (MOCK_CENTRE.match(/Go to Practice/g) ?? []).length;
  assert.equal(goToPracticeCount, 2, "expected the fallback action in both the isCsse branch's CsseRichMockCard and SimpleMockCard");
  assert.ok(MOCK_CENTRE.includes("available ? (") , "the mock-exam link must be conditional on real availability");
});

test("A — the Mock Readiness card's own CTA is redirected to Practice when it would otherwise point at an unavailable mock, without touching assessMockReadiness()'s own verdict/explanation logic. Programme Completion Increment 016 — generalised to anyCsseMockAvailable, true when EITHER discovered CSSE form (Mathematics or Reading) is available, not just Mathematics", () => {
  assert.match(
    MOCK_CENTRE,
    /readiness\.assessment\.nextAction\.href === "\/learning-intelligence\/mock-exam" && !anyCsseMockAvailable/,
    "the readiness card's CTA must be conditioned on real content availability across all discovered CSSE forms"
  );
  assert.match(MOCK_CENTRE, /const anyCsseMockAvailable = csseMocks\.full_mock\.available \|\| csseMocks\.timed_section\.available/);
  assert.match(MOCK_CENTRE, /See practice areas/, "the fallback CTA must lead somewhere Angel can genuinely deliver");
  // The explanation text itself is read straight from readiness.assessment.explanation,
  // completely unconditionally -- proving the underlying readiness verdict/copy is untouched.
  assert.match(MOCK_CENTRE, /\{readiness\.assessment\.explanation\}/);
});

// --- D: historical mock results must remain reachable independently of new-mock availability ---

test("D — Mock History (recentResults) renders unconditionally on having results, never gated by CSSE mock availability", () => {
  const historyBlockMatch = MOCK_CENTRE.match(/\{recentResults\.length > 0 && \(([\s\S]*?)\n {8}\)\}/);
  assert.ok(historyBlockMatch, "the Mock History section must exist, gated only on having real results");
  assert.ok(!historyBlockMatch![0].includes("csseMocks") && !historyBlockMatch![0].includes("anyCsseMockAvailable"), "historical results must not depend on whether a NEW mock can currently be started");
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
