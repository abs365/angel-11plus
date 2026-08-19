import { test } from "node:test";
import assert from "node:assert/strict";
import { computeEducationalState } from "@/lib/ali/educationalState";
import { computeCompetencyConfidence } from "@/lib/ali/confidence";
import { applyAttemptOutcome } from "@/lib/ali/mastery";
import { realEvidenceLabel } from "@/lib/learningEngine/progressionLabel";

/**
 * Stage 2 Educational Integrity Correction — the full end-to-end proof of
 * the Founder-reported incident and its fix. This is Part 15's required
 * permanent regression test: the original "hu" scenario reproduced
 * conceptually (real functions, synthetic profile/session data — no
 * learner data is touched), asserting the corrected outcome, plus a
 * positive counterpart proving genuine independent evidence still
 * progresses normally. lib/ali/educationalState.ts had no prior unit test
 * coverage at all before this increment.
 */

const FRESH_ROW = {
  timesSeen: 0,
  timesCorrect: 0,
  distinctCorrectSessions: 0,
  lastCorrectSessionId: null,
  lastAttemptCorrect: null,
  secondLastAttemptCorrect: null,
  masteryState: "new" as const,
};

test("THE ORIGINAL INCIDENT, CORRECTED: a fresh competency + one self-assessed 'hu' -> Yes no longer reaches building-knowledge/Developing", () => {
  // Step 1: before any attempt.
  const before = computeCompetencyConfidence({
    competencyCode: "RC-02",
    questions: [{ questionId: "w1-raceday-05", timesSeen: 0, distinctCorrectSessions: 0, masteryThreshold: 3, confidenceWeight: 0.9 }],
  });
  assert.equal(before, "insufficient");

  // Step 2: exactly what recordOutcome() does for "hu" self-assessed "Yes"
  // — isCorrect=true, supportTier="supported" (unchanged meaning),
  // verified=false (Stage 2's fix — this is the one new fact).
  const afterHu = applyAttemptOutcome(FRESH_ROW, true, "session-1", 3, "supported");
  assert.equal(afterHu.timesSeen, 1, "the attempt is genuinely preserved, not discarded");
  assert.equal(afterHu.distinctCorrectSessions, 0, "supportTier still correctly blocks mastery-progress evidence");
  assert.equal(afterHu.masteryState, "new", "mastery is not fabricated");

  // Step 3: confidence, now verified-aware.
  const confidenceAfter = computeCompetencyConfidence({
    competencyCode: "RC-02",
    questions: [
      {
        questionId: "w1-raceday-05",
        timesSeen: afterHu.timesSeen,
        distinctCorrectSessions: afterHu.distinctCorrectSessions,
        masteryThreshold: 3,
        confidenceWeight: 0.9,
        verified: false, // the actual fix
      },
    ],
  });
  assert.equal(confidenceAfter, "insufficient", "THE FIX: self-assessed-only evidence must not clear the insufficient floor");

  // Step 4: full educational state.
  const state = computeEducationalState({
    competencyCode: "RC-02",
    questions: [
      {
        questionId: "w1-raceday-05",
        timesSeen: afterHu.timesSeen,
        distinctCorrectSessions: afterHu.distinctCorrectSessions,
        masteryThreshold: 3,
        confidenceWeight: 0.9,
        verified: false,
        lastAttemptCorrect: afterHu.lastAttemptCorrect,
      },
    ],
    confidenceTier: confidenceAfter,
    masteryState: afterHu.masteryState,
    validated: false,
    durable: false,
    reviewDue: false,
  });
  assert.equal(state, "exploring", "THE FIX: competency correctly stays at 'no independently verified evidence yet'");
  assert.notEqual(state, "building-knowledge", "must never reach the state that previously displayed 'Developing'");

  // Step 5: the parent/learner-facing label.
  const displayed = realEvidenceLabel(state);
  assert.notEqual(displayed.label, "Developing", "THE PROVEN DEFECT is closed: 'hu' alone can no longer produce this label");
});

test("POSITIVE COUNTERPART: a genuinely independently-verified correct attempt still produces normal progression", () => {
  const before = computeCompetencyConfidence({
    competencyCode: "RC-01",
    questions: [{ questionId: "w1-raceday-01", timesSeen: 0, distinctCorrectSessions: 0, masteryThreshold: 3, confidenceWeight: 0.9 }],
  });
  assert.equal(before, "insufficient");

  // A genuine independent, automatically-verified correct attempt (Tier 2, auto-scored).
  const afterCorrect = applyAttemptOutcome(FRESH_ROW, true, "session-1", 3, "independent");
  assert.equal(afterCorrect.distinctCorrectSessions, 1, "independent correct evidence must still advance mastery progress normally");

  const confidenceAfter = computeCompetencyConfidence({
    competencyCode: "RC-01",
    questions: [
      {
        questionId: "w1-raceday-01",
        timesSeen: afterCorrect.timesSeen,
        distinctCorrectSessions: afterCorrect.distinctCorrectSessions,
        masteryThreshold: 3,
        confidenceWeight: 0.9,
        verified: true,
      },
    ],
  });
  assert.equal(confidenceAfter, "low", "real evidence exists but threshold (3) is not yet met — correctly not 'insufficient'");

  const state = computeEducationalState({
    competencyCode: "RC-01",
    questions: [
      {
        questionId: "w1-raceday-01",
        timesSeen: afterCorrect.timesSeen,
        distinctCorrectSessions: afterCorrect.distinctCorrectSessions,
        masteryThreshold: 3,
        confidenceWeight: 0.9,
        verified: true,
        lastAttemptCorrect: afterCorrect.lastAttemptCorrect,
      },
    ],
    confidenceTier: confidenceAfter,
    masteryState: afterCorrect.masteryState,
    validated: false,
    durable: false,
    reviewDue: false,
  });
  assert.equal(state, "building-knowledge", "genuine progress correctly still reaches this state");
  assert.equal(realEvidenceLabel(state).label, "Developing", "genuine progress correctly still earns this label");
});

test("a self-assessed WRONG attempt ('Not quite') is also correctly excluded from clearing the insufficient floor on its own", () => {
  const afterWrong = applyAttemptOutcome(FRESH_ROW, false, "session-1", 3, "supported");
  const confidenceAfter = computeCompetencyConfidence({
    competencyCode: "RC-02",
    questions: [
      {
        questionId: "w1-raceday-05",
        timesSeen: afterWrong.timesSeen,
        distinctCorrectSessions: afterWrong.distinctCorrectSessions,
        masteryThreshold: 3,
        confidenceWeight: 0.9,
        verified: false,
      },
    ],
  });
  assert.equal(confidenceAfter, "insufficient");
});
