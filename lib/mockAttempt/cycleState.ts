import type { MockCycleAttemptRow } from "./client";

/**
 * CSSE Two-Paper Mock, pre-activation completion pass — pure,
 * dependency-free derivation of sitting-level state from a cycle's own
 * attempt rows (lib/mockAttempt/client.ts's getMockCycleAttempts()).
 * Matches this codebase's own established discipline (lib/mockAttempt/
 * workspace.ts's own header): real decision logic lives in a pure,
 * testable function, not inline in a page component.
 *
 * Deliberately does NOT call the internal-only mock_cycle_is_open()
 * (migration 085) — that function is never granted to any client role.
 * This reads the SAME underlying fact (which subjects have an attempt,
 * and whether each is submitted) from rows RLS already lets the owner
 * read directly, computed fresh on every call, never cached across a
 * page load — the exact mechanism the governing brief's own "handle
 * refresh/resume safely using persisted state, not browser memory"
 * requirement (§6) calls for.
 */

export type MockPaperState = "not_started" | "in_progress" | "submitted";

export interface MockCycleSubjectState {
  subject: "mathematics" | "english";
  paperState: MockPaperState;
  attemptId: string | null;
  submittedAt: string | null;
}

export interface MockCycleSittingState {
  cycleId: string;
  mathematics: MockCycleSubjectState;
  english: MockCycleSubjectState;
  /** true only once BOTH subjects have a submitted attempt -- the one gate acceptance test K/L/O below all hinge on. */
  sittingComplete: boolean;
}

function deriveSubjectState(subject: "mathematics" | "english", attempts: readonly MockCycleAttemptRow[]): MockCycleSubjectState {
  // Migration 085's own unique partial index (cycle_id, subject) means
  // at most one attempt per subject can exist for a given cycle -- this
  // find is never ambiguous by construction of the schema itself, not
  // merely by convention.
  const attempt = attempts.find((a) => a.subject === subject) ?? null;
  if (!attempt) return { subject, paperState: "not_started", attemptId: null, submittedAt: null };
  if (attempt.status === "submitted") {
    return { subject, paperState: "submitted", attemptId: attempt.attemptId, submittedAt: attempt.submittedAt };
  }
  // assigned/ready/in_progress/expired all mean "a paper exists but is
  // not yet a completed submission" from the SITTING's own point of
  // view -- an expired-but-not-yet-finalised attempt is not silently
  // treated as done (Founder's own acceptance gate K/L: "completing one
  // paper alone must never look like a complete sitting").
  return { subject, paperState: "in_progress", attemptId: attempt.attemptId, submittedAt: null };
}

export function deriveMockCycleSittingState(cycleId: string, attempts: readonly MockCycleAttemptRow[]): MockCycleSittingState {
  const mathematics = deriveSubjectState("mathematics", attempts);
  const english = deriveSubjectState("english", attempts);
  return {
    cycleId,
    mathematics,
    english,
    sittingComplete: mathematics.paperState === "submitted" && english.paperState === "submitted",
  };
}
