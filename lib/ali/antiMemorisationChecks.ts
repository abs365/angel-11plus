/**
 * Programme Increment 019, Part 12 — Anti-Memorisation Contract.
 *
 * Deterministic, mechanical safeguards only — the ones software can
 * actually verify without pretending to exercise educational judgement.
 * Per this increment's own explicit instruction: "Do not claim semantic
 * originality can be fully automated. Human educational review remains
 * mandatory for judgement-heavy cases." Nothing in this module makes a
 * quality/originality/difficulty judgement — every function here answers
 * a narrow, mechanically-checkable question (are these two ids the same?
 * are these two stems byte-identical once normalised? has this learner
 * seen too much of one family recently?) and nothing broader.
 */

import type { BankQuestion } from "@/types/ali/questionBank";

// ─── Duplicate IDs ──────────────────────────────────────────────────────

export interface DuplicateIdFinding {
  id: string;
  occurrences: number;
}

/** Real, mechanical: two rows sharing the same primary key is never legitimate. */
export function findDuplicateIds(rows: readonly { id: string }[]): DuplicateIdFinding[] {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.id, (counts.get(row.id) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([id, occurrences]) => ({ id, occurrences }));
}

// ─── Duplicate / near-identical stems ───────────────────────────────────

/**
 * Extracts a question's own stem text for comparison. Deliberately reads
 * only the fields already known, real, and present across the real
 * prompt shapes this codebase's own types declare (`stem`, `question`,
 * `text` — the common literal field names across MathsQuestion/
 * ReasoningQuestion/EnglishComprehensionPrompt/WritingPrompt) rather than
 * inventing a new field. Returns "" (never throws) when none is present,
 * so a caller can decide how to treat an unreadable stem rather than this
 * function silently guessing.
 */
export function extractStemText(prompt: unknown): string {
  if (!prompt || typeof prompt !== "object") return "";
  const p = prompt as Record<string, unknown>;
  const candidate = p.stem ?? p.question ?? p.text ?? p.passageText;
  return typeof candidate === "string" ? candidate : "";
}

/** Byte-identical (after trimming) stem text across two DIFFERENT question ids -- never a legitimate outcome, regardless of family. */
export interface ExactDuplicateStemFinding {
  ids: string[];
  stem: string;
}

export function findExactDuplicateStems(rows: readonly { id: string; prompt: unknown }[]): ExactDuplicateStemFinding[] {
  const byStem = new Map<string, string[]>();
  for (const row of rows) {
    const stem = extractStemText(row.prompt).trim();
    if (!stem) continue;
    const existing = byStem.get(stem);
    if (existing) existing.push(row.id);
    else byStem.set(stem, [row.id]);
  }
  return [...byStem.entries()].filter(([, ids]) => ids.length > 1).map(([stem, ids]) => ({ ids, stem }));
}

/**
 * Normalises a stem for a NEAR-identical comparison: lowercase, collapse
 * whitespace runs, and replace every run of digits with a single `#`
 * placeholder — catching the specific, real "same sentence, numbers
 * changed" pattern this increment's own Part 11 names as NOT genuinely
 * new content (a parametric variant, not a distinct family), while never
 * claiming to detect paraphrase, synonym substitution, or any other
 * semantic rewrite (those remain human-review territory, per this
 * module's own docstring).
 */
export function normaliseStemForNearDuplicateCheck(stem: string): string {
  return stem
    .toLowerCase()
    .replace(/\d+/g, "#")
    .replace(/\s+/g, " ")
    .trim();
}

export interface NearIdenticalStemFinding {
  ids: string[];
  normalisedStem: string;
}

/** Same mechanism as findExactDuplicateStems, over the normalised text -- deliberately narrow (numeric-substitution only), never a general similarity/paraphrase detector. */
export function findNearIdenticalStems(rows: readonly { id: string; prompt: unknown }[]): NearIdenticalStemFinding[] {
  const byNormalised = new Map<string, string[]>();
  for (const row of rows) {
    const stem = extractStemText(row.prompt).trim();
    if (!stem) continue;
    const normalised = normaliseStemForNearDuplicateCheck(stem);
    if (!normalised) continue;
    const existing = byNormalised.get(normalised);
    if (existing) existing.push(row.id);
    else byNormalised.set(normalised, [row.id]);
  }
  return [...byNormalised.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([normalisedStem, ids]) => ({ ids, normalisedStem }));
}

// ─── Same-family over-selection ─────────────────────────────────────────

/**
 * True when a candidate session draws too heavily from one family — a
 * real, mechanical guard against the exhaustion pattern Increment 017/018
 * quantified (most Mathematics families have only 2-4 rows; serving 3 of
 * them in one short session all but guarantees visible repetition).
 * `maxPerFamily` is supplied by the caller, never hardcoded here — this
 * module does not choose the policy number, only checks against it.
 */
export function checkFamilyOverSelection(
  selectedQuestionIds: readonly string[],
  familyIdByQuestionId: ReadonlyMap<string, string | undefined>,
  maxPerFamily: number
): { familyId: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const id of selectedQuestionIds) {
    const familyId = familyIdByQuestionId.get(id);
    if (!familyId) continue;
    counts.set(familyId, (counts.get(familyId) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count > maxPerFamily).map(([familyId, count]) => ({ familyId, count }));
}

// ─── Recent learner exposure ────────────────────────────────────────────

/** Candidates the learner has genuinely already seen recently -- real overlap only, never a heuristic guess about "similar" content. */
export function checkRecentLearnerExposure(
  candidateIds: readonly string[],
  recentlyServedQuestionIds: ReadonlySet<string>
): string[] {
  return candidateIds.filter((id) => recentlyServedQuestionIds.has(id));
}

// ─── Mock/Practice crossover ─────────────────────────────────────────────

/**
 * Reuses the SAME real exposure concept the live firewall already
 * enforces at the database layer (migrations 208/209,
 * `ali_mock_exposed_question_ids`) — this function does not duplicate or
 * weaken that boundary, it is a second, independent, application-layer
 * check over the same real fact, useful for a pre-release content-QA pass
 * before content ever reaches the database.
 */
export function checkMockPracticeCrossover(
  candidateIds: readonly string[],
  exposedToMockQuestionIds: ReadonlySet<string>
): string[] {
  return candidateIds.filter((id) => exposedToMockQuestionIds.has(id));
}

/** Passage-level equivalent, mirroring `ali_mock_exposed_passage_ids` (migration 209). */
export function checkPassageReuseIntoProhibitedContext(
  candidatePassageIds: readonly string[],
  exposedToMockPassageIds: ReadonlySet<string>
): string[] {
  return candidatePassageIds.filter((id) => exposedToMockPassageIds.has(id));
}

// ─── Convenience: run every check ────────────────────────────────────────

export interface AntiMemorisationReport {
  duplicateIds: DuplicateIdFinding[];
  exactDuplicateStems: ExactDuplicateStemFinding[];
  nearIdenticalStems: NearIdenticalStemFinding[];
}

/**
 * Runs the three checks that operate over a single content pool (ids,
 * exact stems, near-identical stems) in one pass. Family-over-selection,
 * recent-exposure, and Mock/Practice crossover are deliberately NOT
 * folded in here — each needs session/learner/exposure context this
 * function does not have, and calling them out separately keeps each
 * check's own dependency small and independently testable (this module's
 * own governing discipline throughout).
 */
export function runContentPoolChecks(rows: readonly BankQuestion[]): AntiMemorisationReport {
  return {
    duplicateIds: findDuplicateIds(rows),
    exactDuplicateStems: findExactDuplicateStems(rows),
    nearIdenticalStems: findNearIdenticalStems(rows),
  };
}
