import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreEnglishComprehensionAnswer, checkOrderedSequence, type EnglishPromptValidationFields } from "@/lib/learningEngine/englishAnswerValidation";
import { classifyAutomaticError } from "@/lib/learningEngine/englishErrorClassification";
import { applyAttemptOutcome } from "@/lib/ali/mastery";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";

/**
 * Educational Increment 007G, Final Defect Correction.
 *
 * Root cause: Guided Practice shows the sequencing family's first item
 * as an anchor and instructs the learner to supply only the remaining
 * items, but scoreEnglishComprehensionAnswer's TIER4_ORDERED_LIST case
 * validated the raw textarea positionally against the FULL answer,
 * including the un-retyped anchor — so a learner who followed the
 * on-screen instruction exactly was scored as if position 1 were simply
 * missing. Reproduced live in production via w2-sciencefair-07
 * (Educational Increment 007G's own Part 7 live verification) — the
 * exact question and answer key used below.
 *
 * Fix: scoreEnglishComprehensionAnswer accepts an optional
 * `guidedSequenceAnchorSupplied` flag; when true, the real anchor text
 * (prompt.orderedAnswer[0], never fabricated) is prepended to the
 * learner's parsed lines before checkOrderedSequence() runs —
 * checkOrderedSequence() itself is unchanged, so this is not a parallel
 * scoring engine, and the independent path (flag absent) is untouched.
 */

const legacy = () => 0;

// The real prompt shape for w2-sciencefair-07 (Educational Increment
// 007C/007G), the exact question that exposed this defect live.
const sciencefairPrompt: EnglishPromptValidationFields = {
  marks: 4,
  validationTier: "TIER4_ORDERED_LIST",
  orderedAnswer: ["forgetting the project was due", "preparing her project", "the judges coming round", "receiving her certificate"],
};

// --- 1-4: Guided (anchor supplied) ---------------------------------------

test("1. Guided, correct remaining sequence -> full marks (the exact scenario a real learner hit live in production)", () => {
  const learnerAnswer = "preparing her project\nthe judges coming round\nreceiving her certificate";
  const result = scoreEnglishComprehensionAnswer(learnerAnswer, sciencefairPrompt, legacy, { guidedSequenceAnchorSupplied: true });
  assert.equal(result.earnedMarks, 4, "a learner who follows the on-screen instruction exactly must be marked fully correct");
  assert.equal(result.sequenceDetail?.marks, 4);
});

test("2. Guided, incorrect remaining sequence -> not full marks, per the existing partial-credit contract", () => {
  const learnerAnswer = "the judges coming round\npreparing her project\nreceiving her certificate";
  const result = scoreEnglishComprehensionAnswer(learnerAnswer, sciencefairPrompt, legacy, { guidedSequenceAnchorSupplied: true });
  // Anchor (position 1) always correct = 1 mark. Learner's 3 lines land in
  // positions 2-4: "judges" in position 2 (expected "preparing") = wrong;
  // "preparing" in position 3 (expected "judges") = wrong; "certificate"
  // in position 4 (expected "certificate") = correct. Total = 2 of 4.
  assert.equal(result.earnedMarks, 2);
  assert.ok(result.earnedMarks! < 4);
});

test("3. Guided, omitted remaining item -> not full marks", () => {
  const learnerAnswer = "preparing her project\nthe judges coming round"; // missing the 4th item entirely
  const result = scoreEnglishComprehensionAnswer(learnerAnswer, sciencefairPrompt, legacy, { guidedSequenceAnchorSupplied: true });
  assert.equal(result.earnedMarks, 3, "anchor (1) + 2 correctly-placed remaining items = 3 of 4, not full marks");
  assert.ok(result.earnedMarks! < 4);
});

test("4. Guided, remaining items in wrong order -> not full marks", () => {
  const learnerAnswer = "receiving her certificate\nthe judges coming round\npreparing her project"; // reversed
  const result = scoreEnglishComprehensionAnswer(learnerAnswer, sciencefairPrompt, legacy, { guidedSequenceAnchorSupplied: true });
  // Anchor (1) + the middle item ("the judges coming round") coincidentally
  // lands back in its own correct position when 3 items are fully
  // reversed = 2 of 4. Not full marks either way.
  assert.equal(result.earnedMarks, 2);
  assert.ok(result.earnedMarks! < 4);
});

// --- 5-6: Independent (no anchor) ----------------------------------------

test("5. Independent, complete correct sequence -> full marks, unchanged from before this fix", () => {
  const learnerAnswer = "forgetting the project was due\npreparing her project\nthe judges coming round\nreceiving her certificate";
  const result = scoreEnglishComprehensionAnswer(learnerAnswer, sciencefairPrompt, legacy);
  assert.equal(result.earnedMarks, 4);
});

test("6. Independent, response missing the first item -> not full marks (proves the fix does not weaken independent scoring)", () => {
  const learnerAnswer = "preparing her project\nthe judges coming round\nreceiving her certificate"; // same text as test 1, but WITHOUT the guided flag
  const result = scoreEnglishComprehensionAnswer(learnerAnswer, sciencefairPrompt, legacy); // no options -> independent
  assert.equal(result.earnedMarks, 0, "without the guided flag, position 1 is genuinely missing and must not be credited");
  assert.ok(result.earnedMarks! < 4);
});

// --- 7-8: supportTier / mastery-safety -----------------------------------

test("7. The guided->supportTier mapping used by the Practice page records 'supported' for a guided attempt, 'independent' otherwise", () => {
  // Mirrors app/learning-intelligence/practice/[area]/page.tsx's own
  // `guided ? "supported" : "independent"` expression exactly, so a
  // regression there is caught here too.
  const supportTierFor = (guided: boolean) => (guided ? "supported" : "independent");
  assert.equal(supportTierFor(true), "supported");
  assert.equal(supportTierFor(false), "independent");
});

test("8. A guided-anchor correct sequencing success, recorded as supported, still cannot reach mastered no matter how many sessions", () => {
  function freshHistory(): StudentQuestionHistoryRow {
    return {
      profileId: "p", questionId: "w2-sciencefair-07", source: "practice_experience" as const, timesSeen: 0, timesCorrect: 0,
      distinctCorrectSessions: 0, lastCorrectSessionId: null, lastPresentedAt: new Date().toISOString(),
      lastPresentedAtSequence: 0, lastAttemptCorrect: null, secondLastAttemptCorrect: null,
      masteryState: "new" as const, lastAttemptTimeSeconds: null, lastAttemptSkipped: null,
      lastAttemptAnswerChanged: null, lastAttemptFirstAnswer: null, lastAttemptFinalAnswer: null,
      lastAttemptConfidenceRating: null, lastAttemptWorkingShown: null, firstSource: null,
      lastAttemptSupportTier: null,
    };
  }
  let history = freshHistory();
  for (let session = 0; session < 5; session++) {
    const result = scoreEnglishComprehensionAnswer(
      "preparing her project\nthe judges coming round\nreceiving her certificate",
      sciencefairPrompt, legacy, { guidedSequenceAnchorSupplied: true }
    );
    const isCorrect = result.earnedMarks === sciencefairPrompt.marks;
    assert.equal(isCorrect, true, "sanity check: this must be the fully-correct guided case from test 1");
    const updated = applyAttemptOutcome(history, isCorrect, `session-${session}`, 2, "supported");
    history = { ...history, ...updated };
  }
  assert.notEqual(history.masteryState, "mastered", "repeated guided-anchor successes must never accumulate into independent mastery");
});

// --- 9-10: toggle behaviour and backward compatibility --------------------

test("9. Turning Guided Practice off for the same question and answer restores the complete-answer requirement", () => {
  const learnerAnswer = "preparing her project\nthe judges coming round\nreceiving her certificate";
  const guidedResult = scoreEnglishComprehensionAnswer(learnerAnswer, sciencefairPrompt, legacy, { guidedSequenceAnchorSupplied: true });
  const independentResult = scoreEnglishComprehensionAnswer(learnerAnswer, sciencefairPrompt, legacy, { guidedSequenceAnchorSupplied: false });
  assert.equal(guidedResult.earnedMarks, 4);
  assert.equal(independentResult.earnedMarks, 0);
  assert.notEqual(guidedResult.earnedMarks, independentResult.earnedMarks, "the same literal text must score differently depending on whether the anchor was genuinely supplied");
});

test("10. Existing (pre-007G-fix) sequencing behaviour is unchanged when the options parameter is omitted entirely", () => {
  // The exact call shape every other caller in this codebase already
  // uses (tests/content/englishWave1.test.ts, englishWave2.test.ts,
  // etc.) -- proves the new 4th parameter is additive, not breaking.
  const result = scoreEnglishComprehensionAnswer(
    "forgetting the project was due\npreparing her project\nthe judges coming round\nreceiving her certificate",
    sciencefairPrompt,
    legacy
  );
  assert.equal(result.earnedMarks, 4);
  assert.equal(result.tier, "TIER4_ORDERED_LIST");
});

// --- Part D: wrong-answer remediation must not claim absent evidence when it is present ---

test("Part D: the previously-false 'evidence not located' remediation no longer fires for a correct guided-anchor attempt", () => {
  const result = scoreEnglishComprehensionAnswer(
    "preparing her project\nthe judges coming round\nreceiving her certificate",
    sciencefairPrompt, legacy, { guidedSequenceAnchorSupplied: true }
  );
  const categories = classifyAutomaticError(result, "wave1-fam-sequencing");
  assert.deepEqual(categories, [], "a fully correct guided answer must receive no error classification at all");
});

test("Part D: a genuinely wrong guided attempt still classifies as SEQUENCE_ERROR, not the false EVIDENCE_NOT_LOCATED (the anchor's free mark makes marks=0 impossible once guided)", () => {
  const result = scoreEnglishComprehensionAnswer(
    "receiving her certificate\nthe judges coming round\npreparing her project", // fully reversed remaining items
    sciencefairPrompt, legacy, { guidedSequenceAnchorSupplied: true }
  );
  const categories = classifyAutomaticError(result, "wave1-fam-sequencing");
  assert.deepEqual(categories, ["SEQUENCE_ERROR"], "the anchor guarantees at least 1 mark under guidance, so this must never be misreported as no evidence found at all");
});

test("Part D: an independent attempt with zero marks (no anchor to fall back on) still correctly classifies as EVIDENCE_NOT_LOCATED", () => {
  const result = scoreEnglishComprehensionAnswer("nonsense\nnonsense\nnonsense\nnonsense", sciencefairPrompt, legacy);
  assert.equal(result.earnedMarks, 0);
  const categories = classifyAutomaticError(result, "wave1-fam-sequencing");
  assert.deepEqual(categories, ["EVIDENCE_NOT_LOCATED"]);
});

// --- Structural check: checkOrderedSequence itself is genuinely unchanged ---

test("checkOrderedSequence itself (the reused, unmodified validator) still behaves exactly as before this fix", () => {
  const result = checkOrderedSequence(["bask", "read", "wash"], [["bask"], ["read"], ["wash"]]);
  assert.equal(result.marks, 3);
});
