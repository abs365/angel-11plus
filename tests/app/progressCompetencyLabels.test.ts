import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Completion Assurance Programme, Completion C — a second, related raw-
 * identifier leak found during this Completion's own live verification
 * (not one of the three externally reported findings, but the exact same
 * category Part 4 explicitly directs to search for): the "Learning
 * Confidence" section on /progress derived its subject label from
 * `c.subject.charAt(0).toUpperCase() + c.subject.slice(1)`, which left a
 * raw slug hyphen in text for any multi-word subject (e.g.
 * "Verbal-reasoning", visually "Verbal-Reasoning" once CSS `capitalize`
 * ran on it) — an internal identifier fragment, not real prose. Source-
 * text assertions, matching this project's established convention for
 * files with no jsdom test harness (englishRemediationRendering.test.ts,
 * mathsRemediationRendering.test.ts, mockAvailabilityPresentation.test.ts).
 */

const PROGRESS_PAGE = readFileSync("app/progress/page.tsx", "utf8");

test("Learning Confidence no longer derives its subject label by capitalising the first letter of the raw internal subject slug", () => {
  assert.ok(
    !PROGRESS_PAGE.includes('c.subject.charAt(0).toUpperCase() + c.subject.slice(1)'),
    "the raw-slug capitalisation fallback must be removed"
  );
});

test("Learning Confidence now reuses the same canonical, already-computed subject label (report.subjects[].label) instead of re-deriving one from the slug", () => {
  assert.match(
    PROGRESS_PAGE,
    /report\?\.subjects\.find\(\(s\) => s\.subject === c\.subject\)\?\.label \?\? c\.subject/,
    "must reuse the one canonical label source, not a second parallel formatting rule"
  );
});
