import { test } from "node:test";
import assert from "node:assert/strict";
import { computeCompetencyConfidence } from "@/lib/ali/confidence";

/**
 * Stage 2 Educational Integrity Correction — lib/ali/confidence.ts had no
 * prior unit test coverage. These cover both the pre-existing behaviour
 * (unaffected by this increment) and the new `verified` field's
 * anyEvidence gate (migration 076), the direct fix for the proven "hu"
 * self-assessed incident.
 */

test("insufficient: zero questions attempted", () => {
  const tier = computeCompetencyConfidence({
    competencyCode: "RC-02",
    questions: [{ questionId: "q1", timesSeen: 0, distinctCorrectSessions: 0, masteryThreshold: 3, confidenceWeight: 0.9 }],
  });
  assert.equal(tier, "insufficient");
});

test("REGRESSION (the proven defect): a single self-assessed (verified: false) attempt no longer clears the insufficient floor", () => {
  const tier = computeCompetencyConfidence({
    competencyCode: "RC-02",
    questions: [
      { questionId: "w1-raceday-05", timesSeen: 1, distinctCorrectSessions: 0, masteryThreshold: 3, confidenceWeight: 0.9, verified: false },
    ],
  });
  assert.equal(tier, "insufficient", "THE FIX: one self-assessed attempt alone must not be treated as real evidence");
});

test("positive: a single automatically-verified attempt (verified: true, or omitted) DOES clear the insufficient floor — unaffected by the fix", () => {
  const explicit = computeCompetencyConfidence({
    competencyCode: "RC-01",
    questions: [
      { questionId: "q1", timesSeen: 1, distinctCorrectSessions: 0, masteryThreshold: 3, confidenceWeight: 0.9, verified: true },
    ],
  });
  assert.equal(explicit, "low");

  const omitted = computeCompetencyConfidence({
    competencyCode: "RC-01",
    questions: [{ questionId: "q1", timesSeen: 1, distinctCorrectSessions: 0, masteryThreshold: 3, confidenceWeight: 0.9 }],
  });
  assert.equal(omitted, "low", "omitting `verified` must default to true — every pre-migration/Mock caller is unaffected");
});

test("mixed: one verified attempt among several unverified-only questions still clears the floor", () => {
  const tier = computeCompetencyConfidence({
    competencyCode: "RC-02",
    questions: [
      { questionId: "q1", timesSeen: 1, distinctCorrectSessions: 0, masteryThreshold: 3, confidenceWeight: 0.9, verified: false },
      { questionId: "q2", timesSeen: 1, distinctCorrectSessions: 0, masteryThreshold: 3, confidenceWeight: 0.9, verified: true },
    ],
  });
  assert.equal(tier, "low", "real evidence elsewhere in the competency must not be hidden by one self-assessed question");
});

test("threshold met with high confidence weight still reaches high tier — unaffected by the verified fix", () => {
  const tier = computeCompetencyConfidence({
    competencyCode: "MR-01",
    questions: [
      { questionId: "q1", timesSeen: 6, distinctCorrectSessions: 6, masteryThreshold: 3, confidenceWeight: 0.95, verified: true },
    ],
  });
  assert.equal(tier, "high");
});
