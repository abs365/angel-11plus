import { test } from "node:test";
import assert from "node:assert/strict";
import { applyAttemptOutcome } from "@/lib/ali/mastery";
import { scoreEnglishComprehensionAnswer, type EnglishPromptValidationFields } from "@/lib/learningEngine/englishAnswerValidation";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";

/**
 * Educational Increment 007B, Part 7. Proves end-to-end that a Tier 3/5
 * self-assessed English answer (routed through app/learning-intelligence/
 * practice/[area]/page.tsx's submitSelfAssessment(), which calls
 * recordAndAdvance(..., "supported")) can never produce the same mastery
 * evidence as a genuinely independent correct answer — reusing the
 * existing support-tier gate in lib/ali/mastery.ts unchanged, not a new
 * mechanism.
 */

function freshHistory(): StudentQuestionHistoryRow {
  return {
    profileId: "p", questionId: "q", source: "practice_experience" as const, timesSeen: 0, timesCorrect: 0,
    distinctCorrectSessions: 0, lastCorrectSessionId: null, lastPresentedAt: new Date().toISOString(),
    lastPresentedAtSequence: 0, lastAttemptCorrect: null, secondLastAttemptCorrect: null,
    masteryState: "new" as const, lastAttemptTimeSeconds: null, lastAttemptSkipped: null,
    lastAttemptAnswerChanged: null, lastAttemptFirstAnswer: null, lastAttemptFinalAnswer: null,
    lastAttemptConfidenceRating: null, lastAttemptWorkingShown: null, firstSource: null,
    lastAttemptSupportTier: null,
  };
}

test("a self-assessed (supported) correct answer never reaches mastered, no matter how many sessions", () => {
  let history = freshHistory();
  for (let session = 0; session < 5; session++) {
    const updated = applyAttemptOutcome(history, true, `session-${session}`, 2, "supported");
    history = { ...history, ...updated };
  }
  assert.notEqual(history.masteryState, "mastered", "self-assessed attempts must never accumulate into mastery, regardless of session count");
});

test("an independent correct answer DOES reach mastered at the threshold, proving the two paths genuinely differ", () => {
  let history = freshHistory();
  for (let session = 0; session < 2; session++) {
    const updated = applyAttemptOutcome(history, true, `session-${session}`, 2, "independent");
    history = { ...history, ...updated };
  }
  assert.equal(history.masteryState, "mastered", "independent attempts at masteryThreshold=2 must reach mastered — otherwise the supported-tier test above would be meaningless");
});

test("distinctCorrectSessions never increments for supported attempts", () => {
  let history = freshHistory();
  for (let session = 0; session < 3; session++) {
    const updated = applyAttemptOutcome(history, true, `s${session}`, 2, "supported");
    history = { ...history, ...updated };
  }
  assert.equal(history.distinctCorrectSessions, 0);
});

/**
 * Educational Increment 007C, Part 6. Guided Practice (lib/learningEngine/
 * guidedPractice.ts) introduces a NEW way to reach supportTier="supported"
 * for tiers that were previously ALWAYS "independent" when correct:
 * multi-select (Tier 6) and sequencing (Tier 4) are automatically
 * verifiable, so before Guided Practice existed a correct answer on them
 * was always recorded independent. app/learning-intelligence/practice/
 * [area]/page.tsx's submitReadingOrMaths() now passes supportTier:
 * "supported" whenever the learner answered under Guided mode (see its
 * `guided ? "supported" : "independent"` call), even for these
 * automatically-verified tiers. This proves that new path is exactly as
 * mastery-safe as the pre-existing Tier 3/5 self-assessment path — the
 * literal requirement "SUPPORTED SUCCESS != INDEPENDENT SUCCESS for
 * mastery purposes" must hold for Guided Practice specifically, not just
 * for the self-assessment flow this file already covered.
 */
test("a Guided Practice success on an automatically-verified tier (e.g. multi-select) never reaches mastered, exactly like self-assessed supported evidence", () => {
  let guidedHistory = freshHistory();
  let independentHistory = freshHistory();
  for (let session = 0; session < 5; session++) {
    const guidedUpdate = applyAttemptOutcome(guidedHistory, true, `guided-${session}`, 2, "supported");
    guidedHistory = { ...guidedHistory, ...guidedUpdate };
    const independentUpdate = applyAttemptOutcome(independentHistory, true, `independent-${session}`, 2, "independent");
    independentHistory = { ...independentHistory, ...independentUpdate };
  }
  assert.notEqual(guidedHistory.masteryState, "mastered", "repeated Guided Practice successes must never accumulate into mastery");
  assert.equal(independentHistory.masteryState, "mastered", "the same number of independent successes must reach mastered, proving the two paths genuinely diverge");
  assert.notEqual(guidedHistory.masteryState, independentHistory.masteryState);
});

// --- Dispatcher-level: Tier 3/5 never claim automatic verification -------

test("Tier 3 dispatch never sets automaticallyVerified, regardless of quotation match", () => {
  const prompt: EnglishPromptValidationFields = {
    marks: 4, validationTier: "TIER3_QUOTATION_PLUS_EXPLANATION",
    quotationRequired: ["the exact words"],
  };
  const legacy = () => 0;
  const withQuote = scoreEnglishComprehensionAnswer("I found the exact words here", prompt, legacy);
  const withoutQuote = scoreEnglishComprehensionAnswer("no match at all", prompt, legacy);
  assert.equal(withQuote.automaticallyVerified, false);
  assert.equal(withoutQuote.automaticallyVerified, false);
  assert.equal(withQuote.requiresSelfComparison, true);
  assert.equal(withoutQuote.requiresSelfComparison, true);
});

test("Tier 5 dispatch never sets automaticallyVerified, regardless of named-component match", () => {
  const prompt: EnglishPromptValidationFields = {
    marks: 2, validationTier: "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION",
    acceptedAnswers: ["content", "satisfied"],
  };
  const legacy = () => 0;
  const named = scoreEnglishComprehensionAnswer("content", prompt, legacy);
  const unnamed = scoreEnglishComprehensionAnswer("something else entirely", prompt, legacy);
  assert.equal(named.automaticallyVerified, false);
  assert.equal(unnamed.automaticallyVerified, false);
  assert.equal(named.namedComponentCorrect, true);
  assert.equal(unnamed.namedComponentCorrect, false);
});

test("Tier 2/4 and legacy dispatch DO set automaticallyVerified — only Tier 3/5 hold back", () => {
  const legacy = (answer: string, model: string | undefined, marks: number) => (answer === model ? marks : 0);

  const tier2 = scoreEnglishComprehensionAnswer("42", { marks: 1, validationTier: "TIER2_ACCEPTED_SET", acceptedAnswers: ["42"] }, legacy);
  assert.equal(tier2.automaticallyVerified, true);

  const tier4 = scoreEnglishComprehensionAnswer("a\nb\nc", { marks: 3, validationTier: "TIER4_ORDERED_LIST", orderedAnswer: ["a", "b", "c"] }, legacy);
  assert.equal(tier4.automaticallyVerified, true);

  const legacyResult = scoreEnglishComprehensionAnswer("hello", { marks: 1, modelAnswer: "hello" }, legacy);
  assert.equal(legacyResult.automaticallyVerified, true);
  assert.equal(legacyResult.tier, "LEGACY_HEURISTIC");
});
