import type { BankQuestion, ContentDifficulty } from "@/types/ali/questionBank";
import type { MockPathwayId } from "@/types/mock";
import { computeGroupMarks, groupQuestionsByGroupId, isGroupedItem, marksOf, sortGroupMembers } from "./assessmentHierarchy";
import { isMockEligibleCandidate, type MockEligibilityCandidate } from "./mockEligibility";

/** `BankQuestion`'s `eligibilityStatus`/`active` are optional keys; `MockEligibilityCandidate` requires both keys present (value may still be null/undefined) -- this adapter states that explicitly rather than widening the eligibility predicate's own contract. */
function toEligibilityCandidate(row: BankQuestion): MockEligibilityCandidate {
  return { eligibilityStatus: row.eligibilityStatus, active: row.active, subject: row.subject, pathway: row.pathway };
}

/**
 * Mathematics First Mock — Minimum Composition/Freeze Capability
 * (Decision 210 Part 7/10, Decision 211, Decision 212). Deliberately
 * small: this is the "minimum safe capability" the governing directive
 * asked for, not a general Mock engine, not adaptive selection, not
 * recurring generation. Builds directly on the existing, already-proven
 * primitives rather than duplicating them:
 *
 *   - `isGroupedItem`/`groupQuestionsByGroupId`/`sortGroupMembers`/
 *     `computeGroupMarks`/`marksOf` (./assessmentHierarchy.ts) — Mock
 *     Programme Increment 005's own grouping/mark-aggregation logic,
 *     whose docstring explicitly anticipated exactly this: "a future
 *     form-assembly/scoring increment has a proven, reusable starting
 *     point rather than needing to invent this logic from scratch."
 *   - `isMockEligibleCandidate` (./mockEligibility.ts) — the single,
 *     already-tested per-item Mock-eligibility predicate (subject +
 *     pathway + active + eligibility_status).
 *
 * A "numbered-question experience" is either one grouped family (every
 * subpart sharing a `questionGroupId`, summed marks) or one standalone
 * question (its own single experience) — the same unit Decision 210's
 * own composition-ceiling arithmetic has used throughout this arc
 * (Decisions 183-210), now made real and independently re-derivable
 * from an actual candidate pool rather than hand-computed.
 */

export interface MockExperience {
  /** The `questionGroupId` for a grouped family, or the sole question's own `id` for a standalone experience — always unique within one pool. */
  experienceId: string;
  /** Every row's `id` belonging to this experience, in deterministic display order (groupOrder ascending, then id, matching `sortGroupMembers`'s own tie-break — a no-op for a singleton). */
  questionIds: string[];
  isGrouped: boolean;
  /** Sum of every member's own `prompt.marks`. A member with unresolvable marks contributes 0 (see `computeGroupMarks`) — never assumed. */
  marks: number;
  /** True only when every member's own marks resolved to a real number — a composer must never select an experience with unresolved marks. */
  marksFullyResolved: boolean;
  contentDifficulties: ContentDifficulty[];
  skills: string[];
  familyId: string | undefined;
}

/**
 * Builds the full set of numbered-question experiences from a candidate
 * pool, deterministic regardless of the pool's own fetch order. Grouped
 * families are built via `groupQuestionsByGroupId`/`sortGroupMembers`
 * (unchanged, imported, not reimplemented); every non-grouped row becomes
 * its own singleton experience. Experiences are returned sorted by
 * `experienceId` ascending — callers that need a specific ordering (e.g.
 * richest-first for composition) must sort again themselves; this
 * function's own ordering is deliberately just "stable and reproducible,"
 * not the composition ordering.
 */
export function buildExperiences(pool: readonly BankQuestion[]): MockExperience[] {
  const byId = new Map(pool.map((q) => [q.id, q]));
  const grouped = groupQuestionsByGroupId(pool);
  const experiences: MockExperience[] = [];
  const consumedIds = new Set<string>();

  for (const [groupId, members] of grouped) {
    const ordered = sortGroupMembers(members);
    const { totalMarks, unresolvedCount } = computeGroupMarks(ordered);
    const rows = ordered.map((m) => byId.get(m.id)).filter((r): r is BankQuestion => r !== undefined);
    experiences.push({
      experienceId: groupId,
      questionIds: ordered.map((m) => m.id),
      isGrouped: true,
      marks: totalMarks,
      marksFullyResolved: unresolvedCount === 0,
      contentDifficulties: rows.map((r) => r.contentDifficulty),
      skills: [...new Set(rows.map((r) => r.skill))],
      familyId: rows[0]?.familyId,
    });
    for (const id of ordered.map((m) => m.id)) consumedIds.add(id);
  }

  for (const q of pool) {
    if (isGroupedItem(q) || consumedIds.has(q.id)) continue;
    const marks = marksOf(q);
    experiences.push({
      experienceId: q.id,
      questionIds: [q.id],
      isGrouped: false,
      marks: marks ?? 0,
      marksFullyResolved: typeof marks === "number",
      contentDifficulties: [q.contentDifficulty],
      skills: [q.skill],
      familyId: q.familyId,
    });
  }

  return experiences.sort((a, b) => a.experienceId.localeCompare(b.experienceId));
}

export interface ManifestValidationFailure {
  code:
    | "unknown_question_id"
    | "duplicate_question_id"
    | "not_mock_eligible"
    | "partial_grouped_family"
    | "unresolved_marks"
    | "empty_manifest";
  detail: string;
  questionId?: string;
  questionGroupId?: string;
}

export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
  challenge: number;
}

export interface ManifestValidationReport {
  valid: boolean;
  /** Raw `ali_question_bank` rows referenced by the candidate manifest — one per question id, including duplicates and unknown ids counted but not resolved. */
  rawRowCount: number;
  /** Number of distinct numbered-question experiences (grouped families count once). */
  numberedQuestionCount: number;
  totalMarks: number;
  difficultyDistribution: DifficultyDistribution;
  /** Skill/archetype code -> number of experiences whose own skill set includes it (a grouped family with mixed skills across subparts counts once per distinct skill it carries). */
  skillDistribution: Record<string, number>;
  familyIds: string[];
  questionIds: string[];
  failures: ManifestValidationFailure[];
}

const EMPTY_DIFFICULTY: DifficultyDistribution = { easy: 0, medium: 0, hard: 0, challenge: 0 };

/**
 * Validates a proposed manifest (an ordered list of `ali_question_bank`
 * ids) against a candidate pool, fully fail-closed: any problem is
 * recorded as a `ManifestValidationFailure` and `valid` is `false` — this
 * function never silently drops, reorders, deduplicates, or completes a
 * malformed manifest on the caller's behalf. Rejects, per the governing
 * directive: unknown ids, duplicate ids, anything not genuinely
 * mock-eligible (wrong `eligibility_status` — including
 * `authentic_assessment_candidate`/`independently_validated` — inactive,
 * wrong subject, or wrong pathway, via the existing, unmodified
 * `isMockEligibleCandidate`), a partially-selected grouped family (some
 * but not all of a group's own mock-eligible siblings present), and an
 * experience whose marks did not fully resolve. Reports full statistics
 * even when invalid, so a caller can see exactly how far a rejected
 * manifest got.
 */
export function validateManifest(
  candidateIds: readonly string[],
  pool: readonly BankQuestion[],
  targetSubject: BankQuestion["subject"],
  targetPathway: MockPathwayId
): ManifestValidationReport {
  const failures: ManifestValidationFailure[] = [];
  const byId = new Map(pool.map((q) => [q.id, q]));

  if (candidateIds.length === 0) {
    failures.push({ code: "empty_manifest", detail: "Candidate manifest contains no question ids." });
  }

  const seen = new Set<string>();
  for (const id of candidateIds) {
    if (seen.has(id)) {
      failures.push({ code: "duplicate_question_id", detail: `Question id "${id}" appears more than once in the manifest.`, questionId: id });
    }
    seen.add(id);
  }

  const resolvedRows: BankQuestion[] = [];
  for (const id of candidateIds) {
    const row = byId.get(id);
    if (!row) {
      failures.push({ code: "unknown_question_id", detail: `Question id "${id}" was not found in the supplied candidate pool.`, questionId: id });
      continue;
    }
    resolvedRows.push(row);
    if (!isMockEligibleCandidate(toEligibilityCandidate(row), targetSubject, targetPathway)) {
      failures.push({
        code: "not_mock_eligible",
        detail: `Question id "${id}" is not a valid mock-eligible candidate (eligibilityStatus="${row.eligibilityStatus ?? "undefined"}", active=${String(row.active)}, subject="${row.subject}").`,
        questionId: id,
      });
    }
  }

  // Grouped-family completeness: for every group represented among the
  // resolved rows, every mock-eligible/active sibling of that group in
  // the WHOLE pool (not just the candidate) must also be present.
  const candidateIdSet = new Set(candidateIds);
  const groupsTouched = new Set(resolvedRows.filter((r) => isGroupedItem(r)).map((r) => r.questionGroupId as string));
  for (const groupId of groupsTouched) {
    const eligibleSiblings = pool.filter(
      (q) => q.questionGroupId === groupId && isMockEligibleCandidate(toEligibilityCandidate(q), targetSubject, targetPathway)
    );
    const missing = eligibleSiblings.filter((q) => !candidateIdSet.has(q.id));
    if (missing.length > 0) {
      failures.push({
        code: "partial_grouped_family",
        detail: `Grouped family "${groupId}" is only partially selected -- missing ${missing.map((m) => m.id).join(", ")}.`,
        questionGroupId: groupId,
      });
    }
  }

  const experiences = buildExperiences(resolvedRows);
  for (const exp of experiences) {
    if (!exp.marksFullyResolved) {
      failures.push({ code: "unresolved_marks", detail: `Experience "${exp.experienceId}" has one or more members with unresolvable marks.`, questionGroupId: exp.isGrouped ? exp.experienceId : undefined });
    }
  }

  const difficultyDistribution: DifficultyDistribution = { ...EMPTY_DIFFICULTY };
  for (const exp of experiences) {
    for (const d of exp.contentDifficulties) difficultyDistribution[d] += 1;
  }

  const skillDistribution: Record<string, number> = {};
  for (const exp of experiences) {
    for (const skill of exp.skills) skillDistribution[skill] = (skillDistribution[skill] ?? 0) + 1;
  }

  return {
    valid: failures.length === 0,
    rawRowCount: candidateIds.length,
    numberedQuestionCount: experiences.length,
    totalMarks: experiences.reduce((sum, e) => sum + e.marks, 0),
    difficultyDistribution,
    skillDistribution,
    familyIds: [...new Set(experiences.map((e) => e.familyId).filter((f): f is string => f !== undefined))].sort(),
    questionIds: [...candidateIds],
    failures,
  };
}

export interface CompositionResult {
  manifestQuestionIds: string[];
  report: ManifestValidationReport;
}

/**
 * Deterministic "richest-first" composition — the exact swap-mechanic
 * heuristic Decisions 183-210 have applied by hand throughout this arc,
 * now expressed as real, tested code: selecting the `targetExperienceCount`
 * highest-marks experiences from the eligible pool maximises total marks
 * for a fixed experience-count exactly as "a new experience displaces the
 * weakest currently-included experience" does when applied to
 * completion — sorting all candidate experiences by marks descending and
 * taking the top N is mathematically equivalent to that iterative
 * process, not merely an approximation of it.
 *
 * Ties (equal marks) are broken by `experienceId` ascending — fully
 * reproducible given the same pool, never randomised, never dependent on
 * fetch order (the pool is first reduced to mock-eligible/active/
 * subject/pathway-matching rows only, then `buildExperiences()` already
 * sorts its own output by `experienceId` before this function re-sorts by
 * marks, so the marks-descending sort's own tie-break is deterministic).
 *
 * If fewer than `targetExperienceCount` eligible experiences exist, every
 * available experience is selected (never invents content to fill the
 * gap — Decision 210 Part 8's own "do not automatically force the target"
 * discipline, reused here structurally, not just as a prose promise).
 */
export function composeCandidateMock(
  pool: readonly BankQuestion[],
  targetExperienceCount: number,
  targetSubject: BankQuestion["subject"],
  targetPathway: MockPathwayId
): CompositionResult {
  const eligiblePool = pool.filter((q) => isMockEligibleCandidate(toEligibilityCandidate(q), targetSubject, targetPathway));
  const experiences = buildExperiences(eligiblePool).filter((e) => e.marksFullyResolved);

  const ranked = [...experiences].sort((a, b) => b.marks - a.marks || a.experienceId.localeCompare(b.experienceId));
  const selected = ranked.slice(0, Math.max(0, targetExperienceCount));

  const manifestQuestionIds = selected.flatMap((e) => e.questionIds);
  const report = validateManifest(manifestQuestionIds, pool, targetSubject, targetPathway);

  return { manifestQuestionIds, report };
}
