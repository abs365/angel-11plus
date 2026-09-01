import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canSubmitAnswer,
  runGuardedSubmission,
  resolveOutcomeLabel,
  shouldRenderMisconceptionNote,
  humanizeMisconceptionText,
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

/**
 * humanizeMisconceptionText — Completion Assurance Programme, Completion
 * A. Surfaced only once MathsActivity's misconceptionLabel gate was
 * removed: the 5 families Stage 3 Increments 003/006 authored used a
 * kebab-case slug style for addressesMisconception, unlike every
 * pre-existing Mathematics family's real prose (migrations 039/040
 * onward). A presentation-only reformatting — the stored value is never
 * touched, and any text that is already prose passes through unchanged.
 */
test("a real Stage 3 slug value is converted to a capitalised, punctuated sentence", () => {
  assert.equal(
    humanizeMisconceptionText("applying-the-two-transformations-in-the-wrong-order-or-only-applying-one-of-them"),
    "Applying the two transformations in the wrong order or only applying one of them."
  );
});

test("every one of the 5 real Stage 3 slug values reformats into a clean sentence", () => {
  const realSlugs = [
    "applying-the-percentage-to-the-new-value-instead-of-dividing-to-undo-it",
    "subtracting-the-total-elapsed-time-incorrectly-or-adding-instead-of-subtracting",
    "comparing-prices-without-converting-to-the-same-unit-first",
    "treating-the-mean-as-the-total-instead-of-multiplying-by-the-count-first",
    "applying-the-two-transformations-in-the-wrong-order-or-only-applying-one-of-them",
  ];
  for (const slug of realSlugs) {
    const result = humanizeMisconceptionText(slug);
    assert.ok(!result.includes("-"), `${slug}: no hyphen should remain in "${result}"`);
    assert.match(result, /^[A-Z]/, `${slug}: must start with a capital letter, got "${result}"`);
    assert.ok(result.endsWith("."), `${slug}: must end with a full stop, got "${result}"`);
  }
});

test("real prose (every pre-existing Mathematics family) passes through completely unchanged", () => {
  const realProse = "Applying the stated operation directly to the two visible numbers instead of using its inverse to find the missing one.";
  assert.equal(humanizeMisconceptionText(realProse), realProse);
});

test("prose containing a genuine hyphenated word is never mangled — the whole-string slug shape must not match", () => {
  const realProseWithHyphen = "Treating a well-known shortcut as if it always applies, without checking the question's own conditions.";
  assert.equal(humanizeMisconceptionText(realProseWithHyphen), realProseWithHyphen);
});

test("undefined and empty input return an empty string, never a fabricated message", () => {
  assert.equal(humanizeMisconceptionText(undefined), "");
  assert.equal(humanizeMisconceptionText(""), "");
});

test("a slug already ending mid-word with no trailing period still gets exactly one added, never doubled", () => {
  assert.equal(humanizeMisconceptionText("misreading-the-question"), "Misreading the question.");
});

test("Gate 4/5 walkthrough defect: the exact live-observed raw slug (Storm at the Harbour, w3-rc10-am-06) now humanizes correctly -- the function itself already worked, it was only never called on the Reading render path (fixed in app/learning-intelligence/practice/[area]/page.tsx)", () => {
  assert.equal(
    humanizeMisconceptionText("focuses-only-on-the-physical-action-of-moving-faster-missing-the-implied-unspoken-fear"),
    "Focuses only on the physical action of moving faster missing the implied unspoken fear."
  );
});

// ---------------------------------------------------------------------
// Production regression wave (this session): the all-lowercase detection
// regex silently rejected any slug containing a capitalised proper noun,
// leaving 4 real migration-063 rows rendering raw in production. Detection
// is now "no spaces, has a hyphen" -- the real, reliable signal in this
// codebase's actual content, not case. Each of the 4 live-affected rows
// gets its own named regression test, plus a lowercase-slug and a
// real-prose control to prove neither direction broke.
// ---------------------------------------------------------------------

test("regression (w3-rc10-am-01, live production defect): a slug with an embedded capitalised proper noun now humanizes, preserving the name unchanged", () => {
  assert.equal(
    humanizeMisconceptionText("reads-the-sentence-as-literally-about-volume-not-Mayas-inner-state"),
    "Reads the sentence as literally about volume not Mayas inner state."
  );
});

test("regression (w3-rc10-am-03, live production defect, directly reproduced this session)", () => {
  assert.equal(
    humanizeMisconceptionText("reads-the-description-as-simply-about-untidy-plants-not-Toms-feelings"),
    "Reads the description as simply about untidy plants not Toms feelings."
  );
});

test("regression (w3-rc10-wc-04, live production defect, directly reproduced this session)", () => {
  assert.equal(
    humanizeMisconceptionText("treats-whistling-as-only-showing-happiness-missing-the-contrast-with-Priyas-effort"),
    "Treats whistling as only showing happiness missing the contrast with Priyas effort."
  );
});

test("regression (w3-rc10-wc-08, live production defect)", () => {
  assert.equal(
    humanizeMisconceptionText("notices-the-actions-changed-but-does-not-connect-it-to-the-shift-in-Jaydens-feelings"),
    "Notices the actions changed but does not connect it to the shift in Jaydens feelings."
  );
});

test("control: a plain all-lowercase slug still humanizes exactly as before (no regression from broadening detection)", () => {
  assert.equal(
    humanizeMisconceptionText("describes-the-colour-literally-without-linking-it-to-the-implied-threat"),
    "Describes the colour literally without linking it to the implied threat."
  );
});

test("control: real prose containing capitalised proper nouns and spaces is still left completely unchanged", () => {
  const realProseWithNames = "Assuming Maya or Priya's reaction reflects the whole class's mood, rather than her own private feeling.";
  assert.equal(humanizeMisconceptionText(realProseWithNames), realProseWithNames);
});
