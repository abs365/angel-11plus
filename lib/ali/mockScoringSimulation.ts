/**
 * Mathematics Mock 1 — Release-QA Scoring Simulation (Decision 216).
 * Mirrors `mock_score_attempt()`'s own real, live per-question marking
 * branch (`supabase/migrations/104_mock_mathematics_grouped_scoring_and_
 * marking_mode_safety.sql`, the only version of this function — no later
 * migration redefines it) as a pure, independently-testable function —
 * the same "shadow the real server-side SQL logic in pure TS" discipline
 * this codebase already applies elsewhere (`lib/ali/mockEligibility.ts`
 * mirroring `fetchMockEligibleQuestionBank()`, `lib/ali/mockComposition.ts`
 * mirroring the swap mechanic). This is NOT a new marking rule — it is
 * the existing one, made exercisable without live database access, a
 * standing, disclosed limitation throughout this entire arc since
 * Decision 189.
 *
 * Scope: deterministic marking only (marking_mode `deterministic` or
 * unset, subject not `writing`, stored answer contains no `;`) — every
 * one of this Mock's 56 rows satisfies these conditions (re-confirmed
 * directly this session by inspecting the real pool), so the
 * `requires_manual_marking` branch is out of scope for this simulation.
 */

export type MockScoringStatus = "correct" | "incorrect" | "unanswered";

export interface MockScoringOutcome {
  questionId: string;
  status: MockScoringStatus;
  marksAwarded: number;
  marksAvailable: number;
}

export interface MockScoringResult {
  rawAchieved: number;
  rawAvailable: number;
  /** Rounded to 1 decimal place, matching `round(..., 1)` in the real SQL. Null only when rawAvailable is 0 (never the case for this Mock's own 56 rows). */
  percentage: number | null;
  answeredCount: number;
  unansweredCount: number;
  correctCount: number;
  incorrectCount: number;
  outcomes: MockScoringOutcome[];
}

/**
 * Byte-for-byte port of `mock_score_attempt()`'s own marking branch
 * (migration 104, lines ~157-212): empty/whitespace response is
 * unanswered; otherwise, attempt a `::numeric` cast of BOTH the response
 * and the stored answer inside one shared guard — PostgreSQL's `::numeric`
 * rejects any non-numeric-shaped string (currency symbols, letters,
 * etc.), the same behaviour `Number()` returning `NaN` reproduces here;
 * if either cast fails, BOTH values are discarded (never a partial
 * numeric comparison) and marking falls back to an exact,
 * case/whitespace-insensitive string comparison. Numeric comparison uses
 * the real function's own `< 0.0001` tolerance.
 */
export function scoreMockResponse(storedAnswer: string, responseValue: string | null | undefined): MockScoringStatus {
  if (responseValue === null || responseValue === undefined || responseValue.trim() === "") {
    return "unanswered";
  }

  const parsedResponse = Number(responseValue);
  const parsedAnswer = Number(storedAnswer);
  const bothNumeric =
    !Number.isNaN(parsedResponse) && responseValue.trim() !== "" && !Number.isNaN(parsedAnswer) && storedAnswer.trim() !== "";

  if (bothNumeric) {
    return Math.abs(parsedResponse - parsedAnswer) < 0.0001 ? "correct" : "incorrect";
  }
  return responseValue.trim().toLowerCase() === storedAnswer.trim().toLowerCase() ? "correct" : "incorrect";
}

export interface MockScoringRow {
  id: string;
  answer: string;
  marks: number;
}

/**
 * Full attempt-level aggregation, mirroring `mock_score_attempt()`'s own
 * outer loop and final `overall` computation exactly (raw achieved/
 * available, percentage rounded to 1dp, answered/unanswered/correct/
 * incorrect counts).
 */
export function scoreMockAttempt(rows: readonly MockScoringRow[], responsesById: ReadonlyMap<string, string>): MockScoringResult {
  let rawAchieved = 0;
  let rawAvailable = 0;
  let answeredCount = 0;
  let unansweredCount = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  const outcomes: MockScoringOutcome[] = [];

  for (const row of rows) {
    rawAvailable += row.marks;
    const responseValue = responsesById.get(row.id) ?? null;
    const status = scoreMockResponse(row.answer, responseValue);
    const marksAwarded = status === "correct" ? row.marks : 0;

    if (status === "unanswered") unansweredCount += 1;
    else {
      answeredCount += 1;
      if (status === "correct") correctCount += 1;
      else incorrectCount += 1;
    }
    rawAchieved += marksAwarded;
    outcomes.push({ questionId: row.id, status, marksAwarded, marksAvailable: row.marks });
  }

  const percentage = rawAvailable === 0 ? null : Math.round((rawAchieved / rawAvailable) * 1000) / 10;
  return { rawAchieved, rawAvailable, percentage, answeredCount, unansweredCount, correctCount, incorrectCount, outcomes };
}
