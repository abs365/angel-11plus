import { test } from "node:test";
import assert from "node:assert/strict";
import { derivePoolMembership, isPracticeVisible, isMockAttemptEligible } from "@/lib/ali/contentPool";

/**
 * Educational Supply & Progression Integration Gate, Section 25 --
 * "practice and mock-reserved pools remain separated," "protected mock
 * questions cannot leak into ordinary practice," "calibration content
 * cannot leak into learner practice."
 */

test("a candidate-table row is always the calibration pool, regardless of any eligibility_status argument", () => {
  assert.equal(derivePoolMembership("ali_question_candidate", "practice_eligible"), "calibration");
  assert.equal(derivePoolMembership("ali_question_candidate", "mock_eligible"), "calibration");
  assert.equal(derivePoolMembership("ali_question_candidate", undefined), "calibration");
});

test("practice_eligible bank rows are the practice pool; every other bank status is not", () => {
  assert.equal(derivePoolMembership("ali_question_bank", "practice_eligible"), "practice");
  assert.notEqual(derivePoolMembership("ali_question_bank", "provisional"), "practice");
  assert.notEqual(derivePoolMembership("ali_question_bank", "mock_eligible"), "practice");
  assert.notEqual(derivePoolMembership("ali_question_bank", "authentic_assessment_candidate"), "practice");
  assert.notEqual(derivePoolMembership("ali_question_bank", "independently_validated"), "practice");
});

test("mock_eligible and its pre-promotion mock-governance states are all the mock_reserved pool, never practice", () => {
  assert.equal(derivePoolMembership("ali_question_bank", "mock_eligible"), "mock_reserved");
  assert.equal(derivePoolMembership("ali_question_bank", "authentic_assessment_candidate"), "mock_reserved");
  assert.equal(derivePoolMembership("ali_question_bank", "independently_validated"), "mock_reserved");
});

test("provisional (and unspecified) bank rows are not_yet_eligible for either learner-facing pool", () => {
  assert.equal(derivePoolMembership("ali_question_bank", "provisional"), "not_yet_eligible");
  assert.equal(derivePoolMembership("ali_question_bank"), "not_yet_eligible");
});

test("isPracticeVisible/isMockAttemptEligible are mutually exclusive across every real pool value", () => {
  const pools = ["calibration", "practice", "mock_reserved", "not_yet_eligible"] as const;
  for (const pool of pools) {
    assert.notEqual(isPracticeVisible(pool) && isMockAttemptEligible(pool), true, `${pool} must never be both practice-visible and mock-attempt-eligible`);
  }
  assert.equal(isPracticeVisible("practice"), true);
  assert.equal(isMockAttemptEligible("mock_reserved"), true);
  assert.equal(isPracticeVisible("calibration"), false);
  assert.equal(isMockAttemptEligible("calibration"), false);
});
