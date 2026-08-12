import type { BankQuestion, ContentDifficulty } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";
import type { CompetencyId, QuestionTypeId, LearnerIntelligenceProfile } from "./types";
import { QUESTION_TYPE_PRIMARY_COMPETENCY } from "./assessmentBrainMap";

/**
 * Adaptive Paper Builder (Phase 4, Sprint 2, Increment 1) — implements
 * ADAPTIVE_MOCK_INTELLIGENCE_SPECIFICATION_V1.md §4/§9. Pure, no I/O, no
 * persistence — the sole consumer of already-real Educational Intelligence
 * facts (LearnerIntelligenceProfile's diagnostics, StudentQuestionHistoryRow's
 * timesSeen/lastPresentedAt), never a new evidence model, confidence tier, or
 * scoring formula. CSSE-only, per the specification's own scope boundary
 * (§2) and this sprint's Architecture Rules — nothing here touches, imports
 * from, or is reachable from `lib/ali/*` or `lib/adaptiveMockBuilder.ts`
 * (GL's separate, deliberately-not-reused adaptive engine).
 *
 * Deliberately simpler than lib/ali/selection.ts's weighted-cooldown-sampling
 * machinery: that module's fine-grained per-question weighting exists to
 * serve GL's own ALI confidence model and is out of this specification's
 * scope to import or replicate (Architecture Rules — "no pathway-specific
 * shortcuts", and Increment 3A's finding that GL's evidence model must not
 * be conflated with CSSE's). The selection rule this file implements —
 * priority-tier-first, unseen-before-seen, deterministic given a seed — is
 * the CSSE-appropriate equivalent named in the specification, built from
 * CSSE's own real inputs, not a copy of GL's.
 */

export type AdaptivePaperSubject = "english" | "maths" | "writing";

export interface AdaptivePaperTargetCounts {
  english: number;
  maths: number;
  writing: number;
}

export type SelectionPriorityTier = "priority" | "standard" | "unmapped";

export interface AdaptivePaperSelectionRationale {
  subject: AdaptivePaperSubject;
  questionId: string;
  competencyId: CompetencyId | null;
  priorityTier: SelectionPriorityTier;
  everSeen: boolean;
  /** Plain-language, mechanically derived — never freeform/generated text, same discipline as Recommendation.reason (LEARNING_ENGINE_V1.md §9). Internal/debugging only, never shown to a learner or parent — same status as lib/ali/observability.ts's MockGenerationTrace. */
  reason: string;
}

export interface AdaptivePaperCoverageSummary {
  candidatesConsidered: Record<AdaptivePaperSubject, number>;
  selectedCounts: Record<AdaptivePaperSubject, number>;
  competenciesRepresented: CompetencyId[];
  /** Named a priority competency (development area / low-confidence / not-yet-evidenced) but zero eligible candidates existed to represent it — disclosed honestly, never silently dropped or backfilled with an unrelated question (spec §6.2). */
  priorityCompetenciesUnavailable: CompetencyId[];
}

export type AdaptivePaperDifficultySummary = Record<AdaptivePaperSubject, Record<ContentDifficulty, number>>;

export interface AdaptivePaperValidationCheck {
  rule: string;
  passed: boolean;
  detail: string;
}

export interface AdaptivePaperValidationResult {
  passed: boolean;
  checks: AdaptivePaperValidationCheck[];
}

export interface AdaptivePaperResult {
  activities: BankQuestion[];
  coverage: AdaptivePaperCoverageSummary;
  difficulty: AdaptivePaperDifficultySummary;
  validation: AdaptivePaperValidationResult;
  rationale: AdaptivePaperSelectionRationale[];
}

const SUBJECTS: AdaptivePaperSubject[] = ["english", "maths", "writing"];

/** Every competency the real, unmodified Diagnostic Findings names as needing attention — spec §4.2. Read-only consumption of an already-computed fact, never a new categorisation. */
function priorityCompetencyIds(profile: LearnerIntelligenceProfile): Set<CompetencyId> {
  return new Set<CompetencyId>([
    ...profile.diagnostics.developmentAreas,
    ...profile.diagnostics.lowConfidenceAreas,
    ...profile.diagnostics.notYetEvidenced,
  ]);
}

/** Never invents a mapping (same discipline as resolveBankEvidenceContext(), lib/learningEngine/legacyPracticeEvidence.ts:76) — a skill code with no real Assessment Brain entry resolves honestly to null. */
function resolveCompetencyId(question: BankQuestion): CompetencyId | null {
  return QUESTION_TYPE_PRIMARY_COMPETENCY[question.skill as QuestionTypeId] ?? null;
}

function shuffleInPlace<T>(arr: T[], random: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface AnnotatedCandidate {
  question: BankQuestion;
  competencyId: CompetencyId | null;
  priorityTier: SelectionPriorityTier;
  everSeen: boolean;
}

function annotate(
  question: BankQuestion,
  history: Map<string, StudentQuestionHistoryRow>,
  priorityIds: Set<CompetencyId>
): AnnotatedCandidate {
  const competencyId = resolveCompetencyId(question);
  const priorityTier: SelectionPriorityTier =
    competencyId === null ? "unmapped" : priorityIds.has(competencyId) ? "priority" : "standard";
  const row = history.get(question.id);
  const everSeen = Boolean(row && row.timesSeen > 0);
  return { question, competencyId, priorityTier, everSeen };
}

/** priority-unseen(0) < priority-seen(1) < standard-unseen(2) < standard-seen(3) < unmapped-unseen(4) < unmapped-seen(5). */
function rank(c: AnnotatedCandidate): number {
  const tierRank = c.priorityTier === "priority" ? 0 : c.priorityTier === "standard" ? 1 : 2;
  const seenRank = c.everSeen ? 1 : 0;
  return tierRank * 2 + seenRank;
}

function reasonFor(c: AnnotatedCandidate): string {
  if (c.priorityTier === "unmapped") {
    return "No Assessment Brain competency mapping resolved for this question's skill code. Included only to help fill this subject's target, never prioritised.";
  }
  if (c.priorityTier === "priority") {
    return `Prioritised: "${c.competencyId}" is a recorded development area, low-confidence area, or not-yet-evidenced competency.`;
  }
  return c.everSeen
    ? "Standard-priority competency, previously seen. Included to fill the remaining target after priority and unseen candidates."
    : "Standard-priority competency, not yet seen. Included to fill the remaining target.";
}

function selectForSubject(
  subject: AdaptivePaperSubject,
  candidates: BankQuestion[],
  history: Map<string, StudentQuestionHistoryRow>,
  priorityIds: Set<CompetencyId>,
  target: number,
  random: () => number
): { selected: BankQuestion[]; rationale: AdaptivePaperSelectionRationale[] } {
  if (target <= 0 || candidates.length === 0) return { selected: [], rationale: [] };

  const annotated = candidates.map((q) => annotate(q, history, priorityIds));
  // Seeded shuffle breaks ties within each priority/seen bucket, then a
  // stable sort (Array.prototype.sort is stable per ES2019+) orders by
  // bucket — same evidence + same seed always reproduces the same paper.
  const ordered = shuffleInPlace([...annotated], random).sort((a, b) => rank(a) - rank(b));
  const picked = ordered.slice(0, Math.min(target, ordered.length));

  return {
    selected: picked.map((p) => p.question),
    rationale: picked.map((p) => ({
      subject,
      questionId: p.question.id,
      competencyId: p.competencyId,
      priorityTier: p.priorityTier,
      everSeen: p.everSeen,
      reason: reasonFor(p),
    })),
  };
}

function validateSelection(
  activities: BankQuestion[],
  bankBySubject: Record<AdaptivePaperSubject, BankQuestion[]>,
  targetCounts: AdaptivePaperTargetCounts
): AdaptivePaperValidationResult {
  const checks: AdaptivePaperValidationCheck[] = [];

  // Spec §6.1 — never select content outside the real, fetched bank.
  const allIds = new Set(SUBJECTS.flatMap((s) => bankBySubject[s].map((q) => q.id)));
  const allFromRealBank = activities.every((q) => allIds.has(q.id));
  checks.push({
    rule: "no-untagged-content",
    passed: allFromRealBank,
    detail: allFromRealBank
      ? "Every selected question is drawn from the real, fetched question bank."
      : "A selected question was not found in the fetched bank. Selection integrity violated.",
  });

  // Spec §4.3 — a subject with real candidates and a non-zero target must be represented.
  const missingSubjects = SUBJECTS.filter((s) => {
    const subjectIds = new Set(bankBySubject[s].map((q) => q.id));
    const represented = activities.some((q) => subjectIds.has(q.id));
    return bankBySubject[s].length > 0 && targetCounts[s] > 0 && !represented;
  });
  checks.push({
    rule: "sample-whole-structure",
    passed: missingSubjects.length === 0,
    detail:
      missingSubjects.length === 0
        ? "Every subject with eligible content and a non-zero target is represented."
        : `Subjects with content and a target but zero selected questions: ${missingSubjects.join(", ")}.`,
  });

  // No question selected twice.
  const ids = activities.map((q) => q.id);
  const noDuplicates = new Set(ids).size === ids.length;
  checks.push({
    rule: "no-duplicate-questions",
    passed: noDuplicates,
    detail: noDuplicates ? "No question appears twice in this paper." : "A question id appears more than once in the selection.",
  });

  // Never exceed the requested target for any subject.
  const withinTarget = SUBJECTS.every((s) => {
    const subjectIds = new Set(bankBySubject[s].map((q) => q.id));
    const selectedForSubject = activities.filter((q) => subjectIds.has(q.id)).length;
    return selectedForSubject <= targetCounts[s];
  });
  checks.push({
    rule: "within-target-counts",
    passed: withinTarget,
    detail: withinTarget ? "No subject exceeds its requested target count." : "A subject's selection exceeded its requested target count.",
  });

  return { passed: checks.every((c) => c.passed), checks };
}

/**
 * Builds one adaptive CSSE mock paper. Pure — no Supabase call, no
 * persistence, no mutation of any argument. Callers are responsible for
 * fetching `bankBySubject` (fetchQuestionBank per subject, unchanged),
 * `profile` (fetchLearnerIntelligenceProfile("csse"), unchanged), and
 * `history` (fetchStudentHistory, unchanged) before calling this function,
 * and for all persistence (recordPresentation/recordOutcome/
 * processEvidenceForCompetency/recordReadinessSnapshot/the Mock Attempt
 * Ledger) after it returns — none of that happens here (Sprint 2 Increment
 * 1 constraints).
 */
export function buildAdaptivePaper(
  bankBySubject: Record<AdaptivePaperSubject, BankQuestion[]>,
  profile: LearnerIntelligenceProfile,
  history: Map<string, StudentQuestionHistoryRow>,
  targetCounts: AdaptivePaperTargetCounts,
  random: () => number = Math.random
): AdaptivePaperResult {
  const priorityIds = priorityCompetencyIds(profile);

  const activities: BankQuestion[] = [];
  const rationale: AdaptivePaperSelectionRationale[] = [];
  const candidatesConsidered = {} as Record<AdaptivePaperSubject, number>;
  const selectedCounts = {} as Record<AdaptivePaperSubject, number>;
  const difficulty = {} as AdaptivePaperDifficultySummary;

  for (const subject of SUBJECTS) {
    const candidates = bankBySubject[subject] ?? [];
    candidatesConsidered[subject] = candidates.length;

    const { selected, rationale: subjectRationale } = selectForSubject(
      subject,
      candidates,
      history,
      priorityIds,
      targetCounts[subject],
      random
    );

    activities.push(...selected);
    rationale.push(...subjectRationale);
    selectedCounts[subject] = selected.length;

    const diffCounts = { easy: 0, medium: 0, hard: 0, challenge: 0 } as Record<ContentDifficulty, number>;
    for (const q of selected) diffCounts[q.contentDifficulty] += 1;
    difficulty[subject] = diffCounts;
  }

  const competenciesRepresented = Array.from(
    new Set(activities.map((q) => resolveCompetencyId(q)).filter((id): id is CompetencyId => id !== null))
  );
  const priorityCompetenciesUnavailable = Array.from(priorityIds).filter(
    (id) => !competenciesRepresented.includes(id)
  );

  return {
    activities,
    coverage: {
      candidatesConsidered,
      selectedCounts,
      competenciesRepresented,
      priorityCompetenciesUnavailable,
    },
    difficulty,
    validation: validateSelection(activities, bankBySubject, targetCounts),
    rationale,
  };
}
