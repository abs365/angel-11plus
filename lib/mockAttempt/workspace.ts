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

import type { MockManifestGroupingEntry, MockQuestionPayload } from "./types";

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
 * Mathematics First Mock Form-Assembly Gate (Decision 161) — a
 * "display unit" is ONE learner-facing numbered question: either a
 * single standalone id (questionGroupId null — every question in this
 * codebase before this decision, and every non-Mathematics question
 * today), or every subpart of one grouped family together, in
 * groupOrder. This is the structure Section 7's own mandatory trace
 * found completely absent: the manifest and the workspace previously
 * treated every raw assigned id as its own displayed question, so a
 * grouped family's subparts (e.g. mock-mr01mr10-costumeschedule-01a/
 * -01b) were shown as two disconnected, flatly-numbered questions
 * instead of one "Question N (a) ... (b) ..." unit.
 */
export interface DisplayUnit {
  questionIds: string[];
  questionGroupId: string | null;
}

/**
 * Groups the manifest's raw, ordered id list into display units:
 * consecutive ids sharing the same non-null questionGroupId become one
 * unit; every other id becomes its own singleton unit — byte-identical
 * behaviour to treating every id as standalone, which is what every
 * non-grouped id in this pool already is. Fails closed to standalone,
 * never guesses from an id's own string shape (migration 104's own
 * rejected approach for the equivalent scoring-side problem): any id
 * with no matching entry in `grouping` at all is treated as its own
 * ungrouped unit rather than assumed to belong to a neighbour.
 */
export function buildDisplayUnits(
  rawIds: readonly string[],
  grouping: readonly MockManifestGroupingEntry[]
): DisplayUnit[] {
  const byId = new Map(grouping.map((entry) => [entry.questionId, entry]));
  const units: DisplayUnit[] = [];
  for (const id of rawIds) {
    const groupId = byId.get(id)?.questionGroupId ?? null;
    const previous = units[units.length - 1];
    if (groupId !== null && previous && previous.questionGroupId === groupId) {
      previous.questionIds.push(id);
    } else {
      units.push({ questionIds: [id], questionGroupId: groupId });
    }
  }
  return units;
}

/**
 * One entry per DISPLAY UNIT (Decision 161), in manifest order — the
 * shape 008V Part 5/6's question palette needs (answered/flagged/current
 * are orthogonal booleans, never collapsed into one enum, since a
 * question can genuinely be both answered and flagged at once). A unit
 * is "answered" only once every one of its response components is
 * answered, and "flagged" if any of its response components is flagged
 * — flagging is a whole-displayed-question action (see
 * app/learning-intelligence/mock-exam/page.tsx's own handleToggleFlag,
 * which calls setMockFlag for every id in the current unit together).
 */
export interface PaletteEntry {
  questionIds: string[];
  index: number;
  answered: boolean;
  flagged: boolean;
  current: boolean;
}

export function buildPalette(
  units: readonly DisplayUnit[],
  answeredQuestionIds: ReadonlySet<string>,
  flaggedQuestionIds: ReadonlySet<string>,
  currentUnitIndex: number
): PaletteEntry[] {
  return units.map((unit, index) => ({
    questionIds: unit.questionIds,
    index,
    answered: unit.questionIds.every((id) => answeredQuestionIds.has(id)),
    flagged: unit.questionIds.some((id) => flaggedQuestionIds.has(id)),
    current: index === currentUnitIndex,
  }));
}

/** Indices (into `units`) of every display unit not yet fully answered. */
export function unansweredUnitIndices(units: readonly DisplayUnit[], answeredQuestionIds: ReadonlySet<string>): number[] {
  const result: number[] = [];
  units.forEach((unit, index) => {
    if (!unit.questionIds.every((id) => answeredQuestionIds.has(id))) result.push(index);
  });
  return result;
}

/** Pure structural re-check, defence-in-depth on top of lib/mockAttempt/redaction.ts, that a payload actually belongs to this question before it's ever rendered. */
export function payloadMatchesQuestion(payload: MockQuestionPayload, expectedQuestionId: string): boolean {
  return payload.questionId === expectedQuestionId;
}
