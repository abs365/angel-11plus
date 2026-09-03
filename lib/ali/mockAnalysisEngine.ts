import { QUESTION_TYPE_PRIMARY_COMPETENCY } from "@/lib/learningEngine/assessmentBrainMap";
import type {
  MockCompetencyEvidenceEntry,
  MockNextPracticePriority,
  MockQuestionOutcomeStatus,
  MockSkillEvidence,
  MockSkillEvidenceEntry,
  MockSkillEvidenceLevel,
  MockStrengthOrPriorityEntry,
  MockSubjectBreakdownEntry,
} from "@/lib/mockAttempt/types";

/**
 * Mathematics Mock 1 — Deterministic Mock Analysis Engine, pure-function
 * mirror (Decision 223). Byte-for-byte port of `mock_analyse_attempt()`'s
 * own aggregation/classification logic (`supabase/migrations/
 * 151_mock_deterministic_analysis_engine.sql`) — the same "shadow the
 * real server-side SQL logic in pure TS" discipline this codebase
 * already applies (`lib/ali/mockScoringSimulation.ts`, `lib/ali/
 * mockComposition.ts`).
 *
 * EVIDENCE CONTRACT: OBSERVED = the outcome rows passed in (already
 * scored by mock_score_attempt(), untouched here). DERIVED = this
 * module's own per-skill arithmetic. AUTHORED EDUCATIONAL EVIDENCE =
 * the `contentDifficulty`/`addressesMisconception` values the caller
 * supplies per question id (mirroring a live `ali_question_bank` join —
 * this module performs no I/O itself). Never reads or returns a stored
 * correct answer, `workingSteps`, or the learner's own response text.
 *
 * The minimum-2-observations evidence threshold below is a Decision-223
 * convention, disclosed as such, not sourced from any existing
 * specification — see the migration's own header for the full
 * rationale.
 */

export interface MockAnalysisOutcomeInput {
  questionId: string;
  status: MockQuestionOutcomeStatus;
  marksAwarded: number | null;
  marksAvailable: number;
  questionTypeId: string | null;
}

/** Mirrors the live `ali_question_bank` columns this engine reads per question — nothing else. */
export interface MockAnalysisQuestionBankLookup {
  contentDifficulty: "easy" | "medium" | "hard" | "challenge" | null;
  /** The misconception the QUESTION is designed to diagnose — never a claim about the learner's own actual reasoning. */
  addressesMisconception: string | null;
}

export interface MockAnalysisResult {
  skillEvidence: MockSkillEvidence;
  strengths: MockStrengthOrPriorityEntry[];
  weaknesses: MockStrengthOrPriorityEntry[];
  competencyEvidence: MockCompetencyEvidenceEntry[];
  subjectBreakdown: MockSubjectBreakdownEntry[];
}

/** Mirrors `mock_question_type_competency()` (migration 151) exactly — deliberately duplicated, verified against `QUESTION_TYPE_PRIMARY_COMPETENCY` by a dedicated test, since it is the SAME real, single mapping, not a second invented one. */
export function questionTypeCompetency(questionTypeId: string): string | null {
  return (QUESTION_TYPE_PRIMARY_COMPETENCY as Record<string, string | undefined>)[questionTypeId] ?? null;
}

/** Mirrors `mock_analyse_attempt()`'s own Pass-2 classification exactly. */
export function classifySkillEvidence(subpartCount: number, correctCount: number): MockSkillEvidenceLevel {
  if (subpartCount < 2) return "insufficient_evidence";
  if (correctCount === subpartCount) return "demonstrated_securely";
  if (correctCount === 0) return "not_yet_demonstrated";
  return "developing";
}

interface SkillAccumulator {
  questionTypeId: string;
  marksAchieved: number;
  marksAvailable: number;
  subpartCount: number;
  correctCount: number;
  difficultyDistribution: { easy: number; medium: number; hard: number; challenge: number };
  misconceptionNotes: string[];
}

/**
 * Full attempt-level analysis, mirroring `mock_analyse_attempt()`'s own
 * three passes exactly: (1) per-skill accumulation from OBSERVED outcome
 * rows plus AUTHORED EDUCATIONAL EVIDENCE looked up per question id, (2)
 * per-skill classification into bySkill/strengths/weaknesses, (3)
 * deterministic next-practice priority selection (not_yet_demonstrated
 * ranked before developing, then by marks lost descending, then
 * questionTypeId ascending — top 3).
 */
export function analyseMockAttempt(
  outcomes: readonly MockAnalysisOutcomeInput[],
  questionBank: ReadonlyMap<string, MockAnalysisQuestionBankLookup>,
  attemptId: string,
  formId: string,
  scoredAt: string,
  overall: { rawMarksAchieved: number; rawMarksAvailable: number; percentage: number | null } | null
): MockAnalysisResult {
  const bySkillOrder: string[] = [];
  const accumulators = new Map<string, SkillAccumulator>();
  const competencyEvidence: MockCompetencyEvidenceEntry[] = [];

  for (const outcome of outcomes) {
    if (outcome.questionTypeId === null || outcome.status === "requires_manual_marking") continue;

    const qt = outcome.questionTypeId;
    const bankRow = questionBank.get(outcome.questionId);
    const marksAvailable = outcome.marksAvailable ?? 0;
    const marksAwarded = outcome.marksAwarded ?? 0;

    let acc = accumulators.get(qt);
    if (!acc) {
      acc = {
        questionTypeId: qt,
        marksAchieved: 0,
        marksAvailable: 0,
        subpartCount: 0,
        correctCount: 0,
        difficultyDistribution: { easy: 0, medium: 0, hard: 0, challenge: 0 },
        misconceptionNotes: [],
      };
      accumulators.set(qt, acc);
      bySkillOrder.push(qt);
    }

    acc.marksAchieved += marksAwarded;
    acc.marksAvailable += marksAvailable;
    acc.subpartCount += 1;
    if (outcome.status === "correct") acc.correctCount += 1;

    if (bankRow?.contentDifficulty) {
      acc.difficultyDistribution[bankRow.contentDifficulty] += 1;
    }
    if (outcome.status !== "correct" && bankRow?.addressesMisconception) {
      acc.misconceptionNotes.push(bankRow.addressesMisconception);
    }

    competencyEvidence.push({
      competencyId: questionTypeCompetency(qt) ?? "",
      questionTypeId: qt,
      source: "mock",
      correct: outcome.status === "correct",
      attemptId,
      formId,
      scoredAt,
    });
  }

  const bySkill: MockSkillEvidenceEntry[] = [];

  for (const qt of bySkillOrder) {
    const acc = accumulators.get(qt)!;
    const percentage = acc.marksAvailable > 0 ? Math.round((acc.marksAchieved / acc.marksAvailable) * 1000) / 10 : null;
    const evidenceLevel = classifySkillEvidence(acc.subpartCount, acc.correctCount);
    const competencyId = questionTypeCompetency(qt);

    bySkill.push({
      questionTypeId: qt,
      competencyId,
      marksAchieved: acc.marksAchieved,
      marksAvailable: acc.marksAvailable,
      percentage,
      subpartCount: acc.subpartCount,
      correctCount: acc.correctCount,
      evidenceLevel,
      difficultyDistribution: acc.difficultyDistribution,
      misconceptionNotes: acc.misconceptionNotes.slice(0, 2),
    });
  }

  // Roll up QT-level evidence to COMPETENCY level for strengths/weaknesses
  // only -- several QT codes share one competency (e.g. QT-MR-01/02/03/09
  // all -> MR-01); without this, the same competency label could appear
  // more than once in one strengths/weaknesses sentence. Mirrors the SQL
  // migration's own Pass 2b exactly -- one entry per competency,
  // re-classified at the competency's own aggregate subpart/correct
  // count using the identical threshold rule.
  const competencyRollup = new Map<string, { subpartCount: number; correctCount: number }>();
  for (const s of bySkill) {
    if (s.competencyId === null) continue;
    const existing = competencyRollup.get(s.competencyId) ?? { subpartCount: 0, correctCount: 0 };
    existing.subpartCount += s.subpartCount;
    existing.correctCount += s.correctCount;
    competencyRollup.set(s.competencyId, existing);
  }
  const strengths: MockStrengthOrPriorityEntry[] = [];
  const weaknesses: MockStrengthOrPriorityEntry[] = [];
  for (const competencyId of [...competencyRollup.keys()].sort()) {
    const { subpartCount, correctCount } = competencyRollup.get(competencyId)!;
    const evidenceLevel = classifySkillEvidence(subpartCount, correctCount);
    const entry: MockStrengthOrPriorityEntry = { competencyId, questionCount: subpartCount, correctCount };
    if (evidenceLevel === "demonstrated_securely") strengths.push(entry);
    else if (evidenceLevel === "not_yet_demonstrated" || evidenceLevel === "developing") weaknesses.push(entry);
  }

  const nextPracticePriorities: MockNextPracticePriority[] = bySkill
    .filter((s) => s.evidenceLevel === "not_yet_demonstrated" || s.evidenceLevel === "developing")
    .map((s) => ({ ...s, marksLost: s.marksAvailable - s.marksAchieved, rank: s.evidenceLevel === "not_yet_demonstrated" ? 0 : 1 }))
    .sort((a, b) => a.rank - b.rank || b.marksLost - a.marksLost || a.questionTypeId.localeCompare(b.questionTypeId))
    .slice(0, 3)
    .map((s) => ({ questionTypeId: s.questionTypeId, competencyId: s.competencyId }));

  // Programme Completion Increment 015 — the one real Mathematics-
  // specific assumption found when tracing this pipeline for Reading
  // Comprehension Mock 1 readiness: `subject` was hardcoded to
  // "mathematics" regardless of the attempt's real content. Derived here
  // instead from the actual questionTypeId prefixes this attempt
  // contains (QT-RC-*/QT-WC-* -> "english", matching ali_mock_form's own
  // subject check constraint values; anything else, including QT-MR-* and
  // any attempt with no scored outcomes, keeps the pre-existing
  // "mathematics" default — the only case this codebase has ever
  // actually produced until now). No current UI surface renders
  // subjectBreakdown (confirmed this session — grepped every app/ and
  // lib/ caller); fixed anyway since it is a real Mathematics-specific
  // assumption in a genuine API payload field, not merely a display bug.
  const attemptSubject = bySkill.some((s) => s.questionTypeId.startsWith("QT-RC-") || s.questionTypeId.startsWith("QT-WC-"))
    ? "english"
    : "mathematics";
  const subjectBreakdown: MockSubjectBreakdownEntry[] = overall
    ? [{ subject: attemptSubject, marksAchieved: overall.rawMarksAchieved, marksAvailable: overall.rawMarksAvailable, percentage: overall.percentage }]
    : [];

  return {
    skillEvidence: { bySkill, nextPracticePriorities },
    strengths,
    weaknesses,
    competencyEvidence,
    subjectBreakdown,
  };
}
