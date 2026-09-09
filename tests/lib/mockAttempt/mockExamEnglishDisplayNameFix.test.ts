import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * CSSE Two-Paper Mock, final production acceptance — a real, live P1
 * defect found during the actual real-learner walkthrough: beginning
 * the English full_mock paper showed "Mathematics Mock 1" / "A timed,
 * sealed Mathematics sitting" as its title/subtitle, because
 * english-full-mock-v1 has no composition_provenance.displayName set
 * (confirmed live) and the page's own fallback maps were keyed only by
 * attemptType -- a genuine gap now that two subject-pure forms share
 * attemptType="full_mock". This project has no jsdom/React Testing
 * Library, so this mirrors the established convention (e.g.
 * mockAvailabilityPresentation.test.ts): structural source-text
 * assertions against the real component source.
 */

const SOURCE = fs.readFileSync("app/learning-intelligence/mock-exam/page.tsx", "utf8");

test("a subject-aware fallback function exists, distinct from the generic attemptType-only maps", () => {
  assert.match(SOURCE, /function fallbackMockDisplayName\(attemptType: MockAttemptType, subject: "mathematics" \| "english" \| undefined\): string/);
  assert.match(SOURCE, /if \(attemptType === "full_mock" && subject === "english"\) return "Full English Paper";/);
});

test("a subject-aware intro subtitle function exists and never claims a Mathematics sitting for the English paper", () => {
  assert.match(SOURCE, /function introSubtitleFor\(attemptType: MockAttemptType, subject: "mathematics" \| "english" \| undefined\): string/);
  const fnMatch = SOURCE.match(/function introSubtitleFor\([\s\S]*?\n}/);
  assert.ok(fnMatch);
  assert.match(fnMatch![0], /A timed, sealed English sitting/);
});

test("the initial mockDisplayName state and the rendered subtitle both use the subject-aware functions, not the raw attemptType-only maps", () => {
  assert.match(SOURCE, /useState\(fallbackMockDisplayName\(attemptType, subject\)\)/);
  assert.match(SOURCE, /\{introSubtitleFor\(attemptType, subject\)\}/);
  // The raw maps must still exist (reused as the fallback for every
  // other case) but must never be indexed directly at either of these
  // two render-affecting call sites any more.
  assert.doesNotMatch(SOURCE, /useState\(MOCK_DISPLAY_NAME_FALLBACK_BY_ATTEMPT_TYPE\[attemptType\]\)/);
  assert.doesNotMatch(SOURCE, /\{INTRO_SUBTITLE_BY_ATTEMPT_TYPE\[attemptType\]\}/);
});

test("Mathematics and Reading Comprehension keep their exact original fallback strings, unaffected by this fix", () => {
  assert.match(SOURCE, /full_mock: "Mathematics Mock 1",/);
  assert.match(SOURCE, /timed_section: "Reading Comprehension Mock 1",/);
  assert.match(SOURCE, /full_mock: "A timed, sealed Mathematics sitting\. You will not see whether an answer is correct until your report is ready\.",/);
});
