import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * CSSE Two-Paper Mock P1 Repair (P1-B) — the mock-exam workspace page must
 * request the authoritative Reading-scoring pass for english-full-mock-v1
 * too, not only the standalone reading-comprehension-mock-1 form (its
 * Reading manifest is copied from that form verbatim, migration 245, and
 * migration 251 widened the underlying database guard to match). Both the
 * fresh-submission call site and the resume/finalize-expired call site
 * must be widened identically. Structural source-text assertions, matching
 * this repository's own established convention for this file.
 */

const SOURCE = fs.readFileSync("app/learning-intelligence/mock-exam/page.tsx", "utf8");

test("both requestReadingScoring call sites now also fire for a full_mock attempt whose subject is english, not only timed_section", () => {
  const widenedConditionCount = (
    SOURCE.match(/attemptType === "timed_section" \|\| \(attemptType === "full_mock" && subject === "english"\)/g) ?? []
  ).length;
  assert.equal(widenedConditionCount, 2, "expected exactly two widened-condition occurrences (fresh submit, resume/finalize-expired)");

  const requestCalls = SOURCE.match(/void requestReadingScoring\(supabase, \w+(?:\.attemptId)?\)\.then\(logReadingScoringRequestOutcome\);/g) ?? [];
  assert.equal(requestCalls.length, 2, "expected exactly two requestReadingScoring call sites");
});

test("the fresh-submission handler's dependency array includes subject now that its condition reads it", () => {
  assert.match(SOURCE, /\}, \[attemptId, attemptType, subject, currentPayloads, answerDrafts\]\);/);
});

test("Mathematics (full_mock, subject undefined/mathematics) is unaffected -- the widened condition is additive, never a replacement of the timed_section check", () => {
  assert.match(SOURCE, /attemptType === "timed_section" \|\| \(attemptType === "full_mock" && subject === "english"\)/);
});
