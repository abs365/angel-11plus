import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Completion Assurance Programme, Completion D — a live-verification
 * finding (real screenshot evidence, not a stale-tooling artifact):
 * the Parent Dashboard's own "Are they ready for a mock?" card
 * (components/parent/CssePathwayParentContent.tsx) recommended "Start a
 * mock exam →" pointing at /learning-intelligence/mock-exam even while
 * production has 0 Mock Eligible content — the exact contradiction
 * Completion B (Decision 126) already corrected on the Mock Centre
 * itself (app/mocks/page.tsx), but this separate card was never touched
 * by that fix. Source-text assertions, matching this project's
 * established convention (mockAvailabilityPresentation.test.ts) for
 * files with no jsdom test harness.
 */

const PARENT_CONTENT = readFileSync("components/parent/CssePathwayParentContent.tsx", "utf8");

test("the Mock Readiness card's own CTA is redirected to Practice when it would otherwise point at an unavailable mock, without touching assessMockReadiness()'s own verdict/explanation logic", () => {
  assert.match(
    PARENT_CONTENT,
    /mockReadiness\.nextAction\.href === "\/learning-intelligence\/mock-exam" && !csseMockAvailable/,
    "the CTA must be conditioned on real content availability, mirroring app/mocks/page.tsx's own established fix"
  );
  assert.match(PARENT_CONTENT, /See practice areas/, "the fallback CTA must lead somewhere Angel can genuinely deliver");
  // mockReadiness.explanation is still read and rendered unconditionally --
  // proving the underlying readiness verdict/copy is untouched.
  assert.match(PARENT_CONTENT, /\{mockReadiness\.explanation\}/);
});

test("csseMockAvailable starts false, so the CTA never briefly claims a mock is available before the real check resolves", () => {
  assert.match(PARENT_CONTENT, /const \[csseMockAvailable, setCsseMockAvailable\] = useState\(false\)/);
});

test("availability is derived from the same authoritative predicate Completion B established (isMockFormAvailable over getActiveMockForm), not a second parallel signal", () => {
  assert.match(PARENT_CONTENT, /import \{ getActiveMockForm, isMockFormAvailable \} from "@\/lib\/mockAttempt\/client";/);
  assert.match(PARENT_CONTENT, /setCsseMockAvailable\(isMockFormAvailable\(result\)\)/);
});
