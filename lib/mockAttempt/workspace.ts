/**
 * Programme Increment 008E — pure helper functions for the canonical
 * secure Mock workspace (app/learning-intelligence/mock-exam/page.tsx).
 * Deliberately separated from the page component: this project has no
 * React-rendering test infrastructure (no @testing-library, no jsdom —
 * confirmed by reading package.json before writing this file), but every
 * other piece of real logic in this codebase gets a real node:test test
 * regardless (see lib/mockAttempt/redaction.ts's own precedent). Pulling
 * the timer/palette/review logic out into pure functions here means it
 * gets the same real test coverage, not "untestable because it's in a
 * page component."
 */

import type { MockQuestionPayload } from "./types";

/** Never negative — a stale expiresAt in the past reads as 0 remaining, not a negative countdown. */
export function computeRemainingSeconds(expiresAt: string, now: number = Date.now()): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000));
}

export function isAttemptExpired(expiresAt: string, now: number = Date.now()): boolean {
  return computeRemainingSeconds(expiresAt, now) <= 0;
}

export function formatRemainingTime(remainingSeconds: number): string {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * 008V Part 12's own three timer states: calm by default, a single
 * restrained shift in the last 10 minutes, a clearer (still non-flashing)
 * cue in the last minute. No sound, no per-second tick animation — this
 * function only classifies state, rendering decides what (if anything)
 * changes visually.
 */
export type TimerUrgency = "normal" | "approaching-end" | "final-warning";

export function classifyTimerUrgency(remainingSeconds: number): TimerUrgency {
  if (remainingSeconds <= 60) return "final-warning";
  if (remainingSeconds <= 600) return "approaching-end";
  return "normal";
}

/**
 * One entry per assigned question, in manifest order — the shape
 * 008V Part 5/6's question palette needs (answered/flagged/current are
 * orthogonal booleans, never collapsed into one enum, since a question
 * can genuinely be both answered and flagged at once).
 */
export interface PaletteEntry {
  questionId: string;
  index: number;
  answered: boolean;
  flagged: boolean;
  current: boolean;
}

export function buildPalette(
  assignedQuestionIds: string[],
  answeredQuestionIds: ReadonlySet<string>,
  flaggedQuestionIds: ReadonlySet<string>,
  currentQuestionId: string | null
): PaletteEntry[] {
  return assignedQuestionIds.map((questionId, index) => ({
    questionId,
    index,
    answered: answeredQuestionIds.has(questionId),
    flagged: flaggedQuestionIds.has(questionId),
    current: questionId === currentQuestionId,
  }));
}

export function unansweredQuestionIds(assignedQuestionIds: string[], answeredQuestionIds: ReadonlySet<string>): string[] {
  return assignedQuestionIds.filter((id) => !answeredQuestionIds.has(id));
}

/** Pure structural re-check, defence-in-depth on top of lib/mockAttempt/redaction.ts, that a payload actually belongs to this question before it's ever rendered. */
export function payloadMatchesQuestion(payload: MockQuestionPayload, expectedQuestionId: string): boolean {
  return payload.questionId === expectedQuestionId;
}
