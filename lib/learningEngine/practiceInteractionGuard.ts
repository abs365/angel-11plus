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
