import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * CSSE Two-Paper Mock, final production acceptance — a real, live P1
 * defect found during the real-learner walkthrough: mock_submit_answer()
 * (migration 245) correctly refuses an answer during a form's own
 * reading phase, but the exam page treated that refusal like any other
 * fatal error, routing the learner into the generic "We couldn't
 * continue this assessment" screen. This project has no jsdom/React
 * Testing Library, so this mirrors the established convention:
 * structural source-text assertions against the real component source.
 */

const SOURCE = fs.readFileSync("app/learning-intelligence/mock-exam/page.tsx", "utf8");

test("a dedicated, non-fatal readingPhaseNotice state exists, separate from the fatal errorMessage/phase='error' path", () => {
  assert.match(SOURCE, /const \[readingPhaseNotice, setReadingPhaseNotice\] = useState<string \| null>\(null\)/);
});

test("handleAnswerAndAdvance detects the exact, stable reading-phase refusal text and does not route it into the fatal error phase", () => {
  const fnMatch = SOURCE.match(/async function handleAnswerAndAdvance\([\s\S]*?\n  }\n/);
  assert.ok(fnMatch, "handleAnswerAndAdvance not found");
  const body = fnMatch![0];
  assert.match(body, /failed\.error\.includes\("is still in its reading phase"\)/);
  assert.match(body, /setReadingPhaseNotice\(/);
  // The reading-phase branch must return before reaching the fatal path.
  const readingBranch = body.match(/if \(typeof failed\.error === "string" && failed\.error\.includes\("is still in its reading phase"\)\) \{[\s\S]*?\}/);
  assert.ok(readingBranch);
  assert.doesNotMatch(readingBranch![0], /setPhase\("error"\)/);
});

test("every other submit-answer failure still routes to the original, unchanged fatal error phase", () => {
  const fnMatch = SOURCE.match(/async function handleAnswerAndAdvance\([\s\S]*?\n  }\n/);
  const body = fnMatch![0];
  assert.match(body, /setErrorMessage\(failed\.error as string\);\s*\n\s*setPhase\("error"\);/);
});

test("the reading-phase notice is cleared at the start of every retry attempt", () => {
  const fnMatch = SOURCE.match(/async function handleAnswerAndAdvance\([\s\S]*?\n  }\n/);
  const body = fnMatch![0];
  assert.match(body, /setReadingPhaseNotice\(null\);/);
});

test("the notice renders as a calm, non-alarming inline banner in the in-progress view, never the fatal error screen's copy", () => {
  assert.match(SOURCE, /\{readingPhaseNotice && \(/);
  const bannerMatch = SOURCE.match(/\{readingPhaseNotice && \([\s\S]*?\)\}/);
  assert.ok(bannerMatch);
  assert.match(bannerMatch![0], /\{readingPhaseNotice\}/);
  assert.doesNotMatch(bannerMatch![0], /We couldn't continue|Start over/);
});
