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

import type { MockAttemptType, MockManifestGroupingEntry, MockQuestionPayload, MockStimulus, MockTableStimulus, ResumableMockAttempt } from "./types";

const VALID_ATTEMPT_TYPES: readonly MockAttemptType[] = ["full_mock", "timed_section", "diagnostic_mock"];

/**
 * Programme Completion Increment 016 — the mock-exam page now serves more
 * than one Mock family, selected via a `?type=` query param. Never trusts
 * that value blindly: resolves only the three real MockAttemptType
 * values, and fails safely to "full_mock" for anything missing or
 * unrecognised — the exact, always-safe default this page has used since
 * before this increment, so every bare `/learning-intelligence/mock-exam`
 * bookmark/link keeps working byte-for-byte unchanged.
 */
export function resolveAttemptType(rawType: string | undefined): MockAttemptType {
  return VALID_ATTEMPT_TYPES.includes(rawType as MockAttemptType) ? (rawType as MockAttemptType) : "full_mock";
}

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
 * Decision 217 (Mathematics Mock 1 attempt-resume remediation) — the
 * SAME "pull the decision logic out into a pure, testable function"
 * discipline this file's own header already establishes, applied to the
 * one genuinely new branch handleBegin() needed: given
 * `getResumableMockAttempt()`'s own result, which of the four possible
 * actions should the caller take? A pure function that owns exactly this
 * decision, so it is testable without any live database or browser.
 *
 *   - no resumable attempt exists            -> create_new  (unchanged
 *                                                pre-217 behaviour)
 *   - one exists, but its own time is already
 *     past                                    -> finalize_expired (never
 *                                                resume as though time
 *                                                remains — Section 6)
 *   - one exists, never started (`assigned`)  -> start_fresh (no time
 *                                                consumed yet, safe to
 *                                                start now)
 *   - one exists, already running             -> resume_in_progress
 *     (`in_progress`, not expired)               (never re-call
 *                                                mock_start_attempt() —
 *                                                its own precondition
 *                                                would reject it anyway)
 */
export type MockResumeAction =
  | { kind: "create_new" }
  | { kind: "finalize_expired"; attemptId: string }
  | { kind: "start_fresh"; attemptId: string }
  | { kind: "resume_in_progress"; attemptId: string; expiresAt: string };

export function determineMockResumeAction(resumable: ResumableMockAttempt | null): MockResumeAction {
  if (!resumable) return { kind: "create_new" };
  if (resumable.isExpired) return { kind: "finalize_expired", attemptId: resumable.attemptId };
  if (resumable.status === "assigned") return { kind: "start_fresh", attemptId: resumable.attemptId };
  return { kind: "resume_in_progress", attemptId: resumable.attemptId, expiresAt: resumable.expiresAt ?? "" };
}

/**
 * Decision 217 — the deterministic recovery position (Section 5): the
 * first display unit not yet fully answered, reusing the existing,
 * already-tested `unansweredUnitIndices()` rather than inventing new
 * "last visited question" state (this codebase's own `ali_mock_attempt.
 * current_section` column is declared but never actually written by any
 * function — confirmed this session — so there is genuinely nothing to
 * restore beyond answer-completeness itself). Falls back to unit 0 when
 * every unit is already answered (or, equivalently, for a fresh attempt
 * with no answers at all, where unit 0 IS the first unanswered unit).
 */
export function computeResumeStartIndex(units: readonly DisplayUnit[], answeredQuestionIds: ReadonlySet<string>): number {
  return unansweredUnitIndices(units, answeredQuestionIds)[0] ?? 0;
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

/**
 * Structured Assessment Stimulus (Decision 170) — the real, tested
 * validation every render site must call before trusting a payload's
 * `stimulus` value, since it arrives off jsonb with no server-side
 * schema enforcement. Fails closed: anything not shaped exactly like a
 * table (right keys, headers/rows both string arrays, every row the
 * same width as headers, at least one header and one row) returns
 * false rather than being guessed at or partially rendered — the same
 * discipline buildDisplayUnits() already applies to malformed grouping
 * data.
 */
export function isValidTableStimulus(value: unknown): value is MockTableStimulus {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.type !== "table") return false;
  if (v.caption !== undefined && typeof v.caption !== "string") return false;
  const headers = v.headers;
  if (!Array.isArray(headers) || headers.length === 0 || !headers.every((h) => typeof h === "string")) return false;
  const rows = v.rows;
  if (!Array.isArray(rows) || rows.length === 0) return false;
  return rows.every((row) => Array.isArray(row) && row.length === headers.length && row.every((cell) => typeof cell === "string"));
}

/**
 * One structured stimulus per DISPLAY UNIT (Decision 170), not per raw
 * response component: `prompt.stimulus` is additive JSON attached to
 * whichever raw row(s) in a group actually carry the shared dataset
 * (this project's own convention: every subpart that genuinely depends
 * on it restates the identical stimulus, exactly as every subpart
 * already restates identical shared numbers in prose for a genuine
 * Classification-A family — see Decision 168/169). Rendering it once
 * per raw component would repeat the same table under every subpart;
 * this function is the "smallest safe deduplication at the display-unit
 * level" the Founder's own directive asked for — generic over ANY set
 * of payloads, coupled to nothing but "the first valid stimulus present
 * in this unit," never to a family id or name.
 */
export function selectDisplayUnitStimulus(payloads: readonly MockQuestionPayload[]): MockStimulus | null {
  for (const payload of payloads) {
    if (isValidTableStimulus(payload.stimulus)) return payload.stimulus;
  }
  return null;
}

/** One shared stem plus each item's own remaining, subpart-specific text, in the same order as the input. */
export interface ResolvedSharedStem {
  stem: string;
  tails: string[];
}

/**
 * Shared-Scenario Presentation Correction (Decision 180) — resolves a
 * genuine shared stem for a grouped numbered question, generic over ANY
 * family, never coupled to a family id or name. Founder production
 * review of mock-mr06-linkedvalues found the review and learner
 * renderers both render every subpart's own COMPLETE, self-contained
 * `question` text in full (the correct, unchanged storage contract for
 * persistence/scoring/audit), which is exactly right when subparts
 * genuinely differ but produces the identical opening paragraph three
 * times over for a family whose subparts restate one byte-identical
 * shared scenario. Automatic derivation (diffing/parsing sentence
 * boundaries out of the stored `question` strings) was explicitly
 * rejected as a fragile heuristic that could misfire on coincidental
 * prefixes or punctuation edge cases; this function instead trusts only
 * an explicit, authored `sharedStem` content-contract field
 * (`prompt.sharedStem`, migration 121/122), and — even then — only acts
 * on it after re-verifying, deterministically and exactly, that it is
 * genuinely safe to use:
 *
 *   1. every item in the group must carry the SAME non-empty
 *      `sharedStem` value (a mismatch, or any item missing it, means
 *      "not a safe shared stem for this group" -- fail closed);
 *   2. every item's own `question` text must literally START WITH that
 *      exact stem (defence in depth against a stem that was authored
 *      but has drifted out of sync with the actual stored question);
 *   3. every item's own remaining tail (after the stem is removed) must
 *      be non-empty (a subpart with nothing left to show after removing
 *      the stem would be a broken, empty render -- never accepted).
 *
 * Any group failing any of these returns `null`, and every existing
 * caller already falls back to rendering each item's full `question`
 * text unchanged -- exactly today's behaviour, for every family that
 * has never set `sharedStem` (which is every family before this
 * increment, and every ordinary Classification B/C/S family after it).
 */
export function resolveGroupSharedStem(
  items: readonly { question: string; sharedStem: string | null | undefined }[]
): ResolvedSharedStem | null {
  if (items.length <= 1) return null;
  const first = items[0].sharedStem;
  if (typeof first !== "string" || first.length === 0) return null;
  if (!items.every((item) => item.sharedStem === first)) return null;
  if (!items.every((item) => item.question.startsWith(first))) return null;
  const tails = items.map((item) => item.question.slice(first.length).trimStart());
  if (tails.some((tail) => tail.length === 0)) return null;
  return { stem: first, tails };
}
