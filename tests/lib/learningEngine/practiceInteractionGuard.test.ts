import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canSubmitAnswer,
  runGuardedSubmission,
  resolveOutcomeLabel,
  shouldRenderMisconceptionNote,
} from "../../../lib/learningEngine/practiceInteractionGuard";

/**
 * Stage 2 (Practice Question Experience and Keyboard Interaction). Covers
 * exactly the safety-critical part of the new interaction contract that is
 * meaningfully testable without a DOM/component-rendering harness (this
 * repository's test suite has none): the guard both the mouse path
 * (Submit button's `disabled` prop) and the new Maths Enter-key path in
 * app/learning-intelligence/practice/[area]/page.tsx read from, so neither
 * can silently diverge from the other, plus (below) the async contract
 * `runGuardedSubmission` gives Writing's own submission. Focus management
 * and rendered keyboard behaviour still require real browser testing
 * (mandatory per this stage's own directive) — Stage 2 Founder real-device
 * evidence, not this file, is what proves those.
 */

test("allows submission with a non-empty answer, not submitting, not already submitted", () => {
  assert.equal(canSubmitAnswer(false, false, "42"), true);
});

test("blocks submission of an empty answer", () => {
  assert.equal(canSubmitAnswer(false, false, ""), false);
});

test("blocks submission of a whitespace-only answer", () => {
  assert.equal(canSubmitAnswer(false, false, "   "), false);
});

test("blocks submission while a submission is already in flight (the same-task race window)", () => {
  assert.equal(canSubmitAnswer(true, false, "42"), false);
});

test("blocks submission once already submitted, even with a valid answer", () => {
  assert.equal(canSubmitAnswer(false, true, "42"), false);
});

test("blocks a repeated Enter/click in the exact race window recordAndAdvance's own guard closes", () => {
  // Models two events landing before submitted=true has been reflected:
  // the ref-based `isSubmitting` flips true synchronously on the first
  // call, so the second call — even though `submitted` itself hasn't
  // caught up yet — is correctly blocked.
  let isSubmitting = false;
  const submitted = false;
  const answer = "17";

  const firstAllowed = canSubmitAnswer(isSubmitting, submitted, answer);
  assert.equal(firstAllowed, true);
  isSubmitting = true; // what the real guard does synchronously on entry

  const secondAllowed = canSubmitAnswer(isSubmitting, submitted, answer);
  assert.equal(secondAllowed, false);
});

test("resets correctly for a new question once the guard is cleared", () => {
  // Mirrors resetActivityUiState() setting isSubmittingRef.current = false
  // between questions.
  assert.equal(canSubmitAnswer(false, false, ""), false); // no answer typed yet
  assert.equal(canSubmitAnswer(false, false, "9"), true); // learner has typed an answer
});

/**
 * runGuardedSubmission — Writing's async submission contract (the one
 * genuinely different case: `submitted` doesn't flip until the fetch
 * resolves, so the in-flight window is real, not just the same-task race
 * window canSubmitAnswer closes above). Founder-directed coverage: proves
 * at most one in-flight call, and that the guard clears correctly on both
 * success and failure so a genuine failure allows retry rather than
 * trapping the learner — all without a DOM/React harness, using a plain
 * deferred promise to control exactly when the "request" resolves.
 */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

test("runGuardedSubmission: first valid call runs the task and reports it ran", async () => {
  const guard = { current: false };
  let taskRuns = 0;
  const ran = await runGuardedSubmission(guard, false, async () => {
    taskRuns += 1;
  });
  assert.equal(ran, true);
  assert.equal(taskRuns, 1);
  assert.equal(guard.current, false); // cleared after success
});

test("runGuardedSubmission: a second call while the first is still in flight is rejected — only one task runs", async () => {
  const guard = { current: false };
  let taskRuns = 0;
  const first = deferred<void>();

  const firstCall = runGuardedSubmission(guard, false, async () => {
    taskRuns += 1;
    await first.promise;
  });

  // Guard is set synchronously on entry, before the first task's own
  // await — so a second call arriving before the first resolves must see
  // it and be rejected without ever invoking its own task.
  assert.equal(guard.current, true);
  const secondRan = await runGuardedSubmission(guard, false, async () => {
    taskRuns += 1;
  });
  assert.equal(secondRan, false);
  assert.equal(taskRuns, 1); // the second task body never ran

  first.resolve();
  await firstCall;
  assert.equal(guard.current, false); // cleared once the in-flight call finishes
});

test("runGuardedSubmission: a failing task still clears the guard, allowing a legitimate retry", async () => {
  const guard = { current: false };
  let attempts = 0;

  await assert.rejects(
    runGuardedSubmission(guard, false, async () => {
      attempts += 1;
      throw new Error("network error");
    })
  );
  assert.equal(guard.current, false); // failure must not permanently trap the learner

  const retryRan = await runGuardedSubmission(guard, false, async () => {
    attempts += 1;
  });
  assert.equal(retryRan, true);
  assert.equal(attempts, 2);
});

test("runGuardedSubmission: isBlocked (e.g. writingSubmitting || submitted) prevents the call even when the ref guard is clear", async () => {
  const guard = { current: false };
  let taskRuns = 0;
  const ran = await runGuardedSubmission(guard, true, async () => {
    taskRuns += 1;
  });
  assert.equal(ran, false);
  assert.equal(taskRuns, 0);
  assert.equal(guard.current, false); // never set — isBlocked short-circuits before the guard is touched
});

/**
 * resolveOutcomeLabel — the Founder real-production finding, Stage 2
 * Educational Integrity Correction. Production evidence showed a
 * self-assessed "Yes" (Tier 3/5, e.g. w2-pianorecital-06's "How does
 * Freya feel..." question, answered "yes") rendering as an unqualified
 * "Correct" — visually and textually identical to a genuinely
 * auto-verified correct answer, even though the underlying evidence was
 * already correctly recorded as last_attempt_verified: false throughout.
 * This is the pure decision behind the fix, proven independent of the
 * surrounding JSX/DOM.
 */
test("no submission yet (lastCorrect null) has no outcome label", () => {
  assert.equal(resolveOutcomeLabel(null, false), null);
  assert.equal(resolveOutcomeLabel(null, true), null);
});

test("a genuinely auto-verified correct answer renders the plain 'correct' label, never the self-assessed variant", () => {
  assert.equal(resolveOutcomeLabel(true, false), "correct");
});

test("THE FIX: a self-assessed correct answer renders 'self-assessed-correct', distinct from a genuinely auto-verified 'correct'", () => {
  assert.equal(resolveOutcomeLabel(true, true), "self-assessed-correct");
  assert.notEqual(resolveOutcomeLabel(true, true), resolveOutcomeLabel(true, false));
});

test("an incorrect answer is always 'not-quite', regardless of whether it was self-assessed", () => {
  assert.equal(resolveOutcomeLabel(false, false), "not-quite");
  assert.equal(resolveOutcomeLabel(false, true), "not-quite");
});

/**
 * shouldRenderMisconceptionNote — Stage 3, Increment 001 (English
 * Misconception Feedback Parity). This is the shared gating condition
 * both ReadingActivity and MathsActivity already used inline, extracted
 * verbatim so both call sites are provably identical rather than merely
 * assumed to be. No behaviour change: this reproduces logic that has
 * rendered in production since commit 7b69638 (2026-08-17) — discovery
 * for this increment incorrectly claimed ReadingActivity never rendered
 * this feedback; direct inspection found it already did, well before
 * this increment began. What genuinely had zero test coverage before
 * this file was the gating condition itself.
 */
test("an incorrect, submitted English answer WITH authored misconception text renders the note", () => {
  assert.equal(shouldRenderMisconceptionNote(true, false, "A common confusion is..."), true);
});

test("a question with NO authored misconception text never fabricates feedback", () => {
  assert.equal(shouldRenderMisconceptionNote(true, false, undefined), false);
});

test("a CORRECT answer never shows the misconception note, even if the question has one authored", () => {
  assert.equal(shouldRenderMisconceptionNote(true, true, "A common confusion is..."), false);
});

test("an unsubmitted question never shows the note", () => {
  assert.equal(shouldRenderMisconceptionNote(false, false, "A common confusion is..."), false);
});

test("empty-string addressesMisconception is treated as absent, not shown as blank feedback", () => {
  assert.equal(shouldRenderMisconceptionNote(true, false, ""), false);
});

test("reproduces the original inline condition's exact null-handling (lastCorrect: null behaves as truthy-for-!lastCorrect, matching the pre-extraction JSX byte-for-byte)", () => {
  assert.equal(shouldRenderMisconceptionNote(true, null, "A common confusion is..."), true);
});
