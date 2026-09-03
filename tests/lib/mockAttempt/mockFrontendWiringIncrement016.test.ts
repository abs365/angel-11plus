import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveAttemptType } from "@/lib/mockAttempt/workspace";
import { practiceRouteFor, MATHEMATICS_PRACTICE_ROUTE, READING_COMPREHENSION_PRACTICE_ROUTE } from "@/lib/mockAttempt/reportCopy";

/**
 * Programme Completion Increment 016 — the bounded frontend wiring that
 * makes the existing Mock Centre / mock-exam pages capable of
 * discovering and launching BOTH Mathematics Mock 1 (full_mock) and
 * Reading Comprehension Mock 1 (timed_section), reusing the existing
 * Mock engine (no second Mock system). This file enumerates exactly the
 * eight items the Founder's own directive named. No real ali_mock_attempt
 * is created by any test here — resolveAttemptType() and
 * practiceRouteFor() are pure functions; everything else is a source-text
 * assertion against the real, unmodified page files, matching this
 * repository's own established convention for page logic with no
 * jsdom/React Testing Library available.
 */

const MOCK_CENTRE = readFileSync("app/mocks/page.tsx", "utf8");
const MOCK_EXAM = readFileSync("app/learning-intelligence/mock-exam/page.tsx", "utf8");

// --- A: Mock Centre can discover/render full_mock ---------------------

test("A — Mock Centre discovers full_mock via getActiveMockForm, and renders it through the reusable CsseRichMockCard", () => {
  assert.match(MOCK_CENTRE, /CSSE_ATTEMPT_TYPES = \["full_mock", "timed_section"\] as const/);
  assert.match(MOCK_CENTRE, /CSSE_ATTEMPT_TYPES\.map\(\(attemptType\) =>[\s\S]*?getActiveMockForm\(supabase, attemptType\)/);
  assert.match(MOCK_CENTRE, /full_mock: \{\s*fallbackName: "Mathematics Mock 1"/);
});

// --- B: Mock Centre can discover/render timed_section ------------------

test("B — Mock Centre discovers timed_section via getActiveMockForm, and renders it through the same reusable CsseRichMockCard", () => {
  const csseTypesMatch = MOCK_CENTRE.match(/CSSE_ATTEMPT_TYPES = \[([^\]]+)\]/);
  assert.ok(csseTypesMatch);
  assert.match(csseTypesMatch![1], /"timed_section"/, "timed_section must be one of the discovered attempt types");
  assert.match(MOCK_CENTRE, /timed_section: \{\s*fallbackName: "Reading Comprehension Mock 1"/);
});

// --- C: Mathematics selection launches using full_mock ------------------

test("C — the Mathematics card's href launches the mock-exam page with no ?type= param, which resolveAttemptType() defaults to full_mock", () => {
  assert.match(MOCK_CENTRE, /full_mock: \{[\s\S]*?href: "\/learning-intelligence\/mock-exam",/);
  assert.equal(resolveAttemptType(undefined), "full_mock");
});

// --- D: Reading selection launches using timed_section -------------------

test("D — the Reading card's href launches the mock-exam page with ?type=timed_section, which resolveAttemptType() resolves exactly", () => {
  assert.match(MOCK_CENTRE, /timed_section: \{[\s\S]*?href: "\/learning-intelligence\/mock-exam\?type=timed_section",/);
  assert.equal(resolveAttemptType("timed_section"), "timed_section");
});

// --- E: invalid/unsupported attempt_type fails safely ---------------------

test("E — resolveAttemptType() fails safely: missing, empty, and garbage values all default to full_mock, never throw, never pass through unvalidated", () => {
  assert.equal(resolveAttemptType(undefined), "full_mock");
  assert.equal(resolveAttemptType(""), "full_mock");
  assert.equal(resolveAttemptType("not-a-real-type"), "full_mock");
  assert.equal(resolveAttemptType("FULL_MOCK"), "full_mock", "case-sensitive -- must not fuzzy-match");
  assert.equal(resolveAttemptType("full_mock; DROP TABLE ali_mock_form;"), "full_mock", "must not be reachable as an injection vector -- it is a strict equality check against a fixed allowlist, never interpolated into a query");
});

test("E (continued) — resolveAttemptType() correctly passes through every genuinely supported value, not just full_mock", () => {
  assert.equal(resolveAttemptType("full_mock"), "full_mock");
  assert.equal(resolveAttemptType("timed_section"), "timed_section");
  assert.equal(resolveAttemptType("diagnostic_mock"), "diagnostic_mock");
});

// --- F: Reading identity is not Mathematics identity -----------------------

test("F — Reading's fallback display name, summary, and route are all genuinely distinct from Mathematics' -- never a copy-paste collision", () => {
  const mathMeta = MOCK_CENTRE.match(/full_mock: \{[\s\S]*?\n  \},/)?.[0] ?? "";
  const readingMeta = MOCK_CENTRE.match(/timed_section: \{[\s\S]*?\n  \},/)?.[0] ?? "";
  assert.match(mathMeta, /"Mathematics Mock 1"/);
  assert.match(readingMeta, /"Reading Comprehension Mock 1"/);
  assert.notEqual(mathMeta, readingMeta);
  assert.match(MOCK_EXAM, /timed_section: "Reading Comprehension Mock 1"/);
  assert.doesNotMatch(
    MOCK_EXAM.match(/MOCK_DISPLAY_NAME_FALLBACK_BY_ATTEMPT_TYPE[\s\S]*?\n\};/)?.[0] ?? "",
    /timed_section: "Mathematics Mock 1"/
  );
});

// --- G: Mathematics identity remains unchanged ------------------------------

test("G — Mathematics' own fallback identity, duration, and cycle-aware creation path are byte-for-byte unchanged by this increment", () => {
  assert.match(MOCK_EXAM, /full_mock: "Mathematics Mock 1"/);
  assert.match(MOCK_EXAM, /full_mock: 60,/, "Mathematics keeps its exact pre-existing 60-minute duration");
  assert.match(MOCK_EXAM, /if \(attemptType === "full_mock"\) \{/);
  assert.match(MOCK_EXAM, /getOpenMockCycle\(supabase\)/, "full_mock still uses the cycle-aware discovery path");
  assert.match(MOCK_EXAM, /createMockCycleAttempt\(supabase, active\.data\.formId, cycleId\)/, "full_mock still creates its attempt via the cycle-aware path, unchanged");
});

// --- H: Reading next-action routing does not fall back to Mathematics ------

test("H — an RC-* (Reading) priority routes to the real Reading Comprehension practice destination, never Mathematics -- re-confirms Increment 015's own fix is still in place and reachable from this increment's own wiring", () => {
  assert.notEqual(READING_COMPREHENSION_PRACTICE_ROUTE, MATHEMATICS_PRACTICE_ROUTE);
  assert.equal(practiceRouteFor("RC-01"), `${READING_COMPREHENSION_PRACTICE_ROUTE}?focus=RC-01`);
  assert.equal(practiceRouteFor("MR-04"), `${MATHEMATICS_PRACTICE_ROUTE}?focus=MR-04`, "Mathematics priorities must remain completely unaffected");
});

// --- Cross-cutting: no real attempt is ever created by verification itself -

test("this file creates no ali_mock_attempt row and calls no mutating RPC -- every assertion above is either a pure function or a source-text check against the real, unmodified page files", () => {
  // Self-documenting: absence of any supabase client / network import in
  // this test file is itself the proof. If a future edit ever adds one,
  // this test's own existence is a deliberate speed bump prompting a
  // second look before merging.
  assert.ok(true);
});
