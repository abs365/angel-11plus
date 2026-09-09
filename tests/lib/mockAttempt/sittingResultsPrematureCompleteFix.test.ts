import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * CSSE Two-Paper Mock, final production acceptance — a real, live
 * defect found during the real-learner walkthrough: immediately after
 * both papers were submitted, the sitting results page claimed
 * "Sitting complete — all assessment complete" while both the English
 * and Mathematics sections simultaneously said "result is not yet
 * available" — an internally contradictory, misleading message, caused
 * by reading an empty writingAssessments array (before either report
 * was released, so no assessment had even started) as "nothing needs
 * review." This project has no jsdom/React Testing Library, so this
 * mirrors the established convention: structural source-text assertions
 * against the real component source.
 */

const SOURCE = fs.readFileSync("app/learning-intelligence/mock-exam/sitting/results/page.tsx", "utf8");

test("a bothReportsAvailable check exists and gates allAssessmentReviewComplete, not just sittingComplete+anyReviewRequired", () => {
  assert.match(SOURCE, /const bothReportsAvailable = englishReport !== null && mathsReport !== null;/);
  assert.match(SOURCE, /const allAssessmentReviewComplete = sittingComplete && bothReportsAvailable && !anyReviewRequired;/);
});

test("a distinct resultsStillPreparing state exists for sittingComplete && !bothReportsAvailable", () => {
  assert.match(SOURCE, /const resultsStillPreparing = sittingComplete && !bothReportsAvailable;/);
});

test("the status banner renders three distinct messages, never claiming 'all assessment complete' while results are still preparing", () => {
  const bannerMatch = SOURCE.match(/\{resultsStillPreparing[\s\S]*?<\/InfoCard>/);
  assert.ok(bannerMatch, "status banner block not found");
  const body = bannerMatch![0];
  assert.match(body, /Sitting complete — results still being prepared/);
  assert.match(body, /Sitting complete — all assessment complete/);
  assert.match(body, /Sitting complete — some assessment still under review/);
  // The "complete" claim must be reachable only through the non-preparing branch.
  const completeIndex = body.indexOf("Sitting complete — all assessment complete");
  const preparingIndex = body.indexOf("resultsStillPreparing ?");
  assert.ok(preparingIndex !== -1 && preparingIndex < completeIndex, "resultsStillPreparing must be checked before claiming assessment is complete");
});
