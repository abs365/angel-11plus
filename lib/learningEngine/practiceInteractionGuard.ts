/**
 * Stage 2 (Experience Transformation Programme — Practice Question
 * Experience and Keyboard Interaction). A pure predicate, not a new
 * question-shell or interaction hook: the one piece of the new keyboard
 * contract that is meaningfully unit-testable without a DOM/React test
 * harness, which this repository does not have (its test suite is plain
 * Node `--test` over `.ts` logic/SQL assertions only — no jsdom, no
 * component rendering). Used identically by both the mouse path (Submit
 * button's own `disabled` prop) and the new Maths Enter-key path in
 * `app/learning-intelligence/practice/[area]/page.tsx`, so there is no
 * second submission implementation with its own, possibly-diverging rule.
 */
export function canSubmitAnswer(isSubmitting: boolean, submitted: boolean, answer: string): boolean {
  return !isSubmitting && !submitted && answer.trim().length > 0;
}

/**
 * Stage 2 — the same synchronous re-entry guard as canSubmitAnswer's ref
 * check, generalised to wrap Writing's async submission (the fetch to
 * /api/writing-feedback, which — unlike Maths/Reading — does not flip
 * `submitted` until after the request resolves, so the gap an in-flight
 * request leaves open is real and load-bearing here, not defensive
 * redundancy). `guard` is a plain mutable ref-shaped object so the
 * caller's own `useRef` keeps working as the single source of truth
 * across renders; `isBlocked` carries any additional state-based block
 * the caller already has (e.g. `writingSubmitting || submitted`) so this
 * function doesn't need to know about UI-specific state at all.
 *
 * The guarantee this proves, independent of any DOM/React harness: at
 * most one `task` runs at a time, and the guard clears in `finally` on
 * both success and failure — a genuine failure must allow retry, never
 * trap the learner in a permanently-blocked state.
 */
export async function runGuardedSubmission(
  guard: { current: boolean },
  isBlocked: boolean,
  task: () => Promise<void>
): Promise<boolean> {
  if (guard.current || isBlocked) return false;
  guard.current = true;
  try {
    await task();
    return true;
  } finally {
    guard.current = false;
  }
}

export type SubmitOrNextOutcomeLabel = "correct" | "self-assessed-correct" | "not-quite";

/**
 * Stage 2 Educational Integrity Correction — the pure decision behind
 * SubmitOrNext's rendered label, extracted for the same reason
 * canSubmitAnswer() is a pure function above: this repository has no
 * DOM/React harness to render the component and check pixels, but the
 * actual bug a Founder found live in production was exactly this
 * decision, not the surrounding JSX. A self-assessed "Yes" (Tier 3/5) and
 * a genuinely auto-verified correct answer both set lastCorrect=true;
 * before this fix, both rendered the identical "Correct" label, with
 * nothing distinguishing "Angel verified this" from "the learner told
 * Angel this was right" — the underlying evidence recording
 * (last_attempt_verified) was already correct throughout and is
 * unaffected by this; only the rendered label was ever wrong.
 */
export function resolveOutcomeLabel(
  lastCorrect: boolean | null,
  selfAssessed: boolean
): SubmitOrNextOutcomeLabel | null {
  if (lastCorrect === null) return null;
  if (!lastCorrect) return "not-quite";
  return selfAssessed ? "self-assessed-correct" : "correct";
}

/**
 * Stage 3, Increment 001 (English Misconception Feedback Parity) —
 * discovery for this increment claimed ReadingActivity never rendered
 * the reviewed `addressesMisconception` text MathsActivity already
 * showed. Direct inspection before implementing anything found that
 * claim false: Educational Increment 007O (commit 7b69638, 2026-08-17)
 * already added this exact rendering to ReadingActivity, predating this
 * entire Stage 2/3 arc. No missing feature existed to build.
 *
 * This function is the one genuine, safe, in-scope action available:
 * the shared gating condition both ReadingActivity and MathsActivity
 * already use inline (`submitted && !lastCorrect && addressesMisconception`)
 * had zero test coverage anywhere in this repository. Extracted verbatim
 * (byte-identical resulting boolean, no behaviour change) so both call
 * sites can be proven identical rather than merely assumed to be, and so
 * a future edit to either can't silently diverge from the other again.
 * MathsActivity keeps its own additional `misconceptionLabel` check
 * layered on top of this, unchanged and untouched.
 */
export function shouldRenderMisconceptionNote(
  submitted: boolean,
  lastCorrect: boolean | null,
  addressesMisconception: string | undefined
): boolean {
  // `!lastCorrect`, not `lastCorrect === false` — matches the original
  // inline JSX condition exactly (true for both `false` and `null`). In
  // both call sites this branch is only ever reached once lastCorrect has
  // already resolved to a real boolean (the pending-self-assessment
  // screen renders a separate branch entirely), so the two forms coincide
  // in practice today — but this function's contract is to reproduce the
  // original condition verbatim, not a semantically different one that
  // merely behaves the same under today's callers.
  return submitted && !lastCorrect && Boolean(addressesMisconception);
}
