import type { BankQuestion } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";
import type { CompetencyId, QuestionTypeId } from "./types";
import type { SubjectPreparationSummary } from "./preparationState";
import { getQuestionTypesForCompetency, ALL_COMPETENCY_IDS } from "./assessmentBrainMap";

/**
 * Programme Increment 019, Part 3 — Late-Entrant Placement Architecture.
 *
 * The minimum viable placement mechanism: a BOUNDED STAGED diagnostic,
 * disclosed honestly as exactly that — per this increment's own explicit
 * instruction, "Otherwise implement a bounded staged diagnostic rather
 * than pretending it is adaptive." This is NOT item-response-theory
 * adaptive branching (no such infrastructure exists in this codebase
 * today, and building one is out of this foundation increment's scope);
 * it is a single, bounded sample spanning every real competency, whose
 * results are interpreted through the SAME real, unmodified evidence
 * engine (`computeSubjectPreparationSummary`) every other Practice
 * session already feeds.
 *
 * Deliberately draws ONLY from the Practice-eligible pool
 * (`fetchQuestionBank()`, unmodified — the caller is expected to have
 * already called it, exactly like every other real Practice session
 * generator in this codebase) — never a Mock form, never the SEALED
 * reserve, per this increment's own explicit "must NOT consume ordinary
 * sealed Mock reserve" instruction (Part 2/3). The RESULTS of a placement
 * session are simply real Practice attempts, recorded through the
 * existing, unmodified `recordOutcome()`/`recordPresentation()` — no new
 * table, no new persistence, no new content type. `interpretPlacementResults()`
 * below is purely a read-side reinterpretation of evidence that already
 * exists once those attempts are recorded.
 */

/** How many questions this diagnostic samples per competency -- bounded, disclosed, a policy constant a caller may override, never silently exceeded. */
export const DEFAULT_QUESTIONS_PER_COMPETENCY = 2;

export interface PlacementSession {
  /** One entry per real competency this session samples -- every entry in `ALL_COMPETENCY_IDS` by default, so no competency is silently skipped. */
  byCompetency: Map<CompetencyId, BankQuestion[]>;
  totalQuestionCount: number;
}

/**
 * Builds a bounded placement session from an already-fetched
 * Practice-eligible candidate pool (`fetchQuestionBank()`'s own real
 * output — this function performs no fetch of its own, keeping it
 * independently testable and honestly incapable of reaching Mock
 * content it was never given). Samples up to `questionsPerCompetency`
 * UNSEEN questions per competency where the candidate pool has any
 * (an already-seen question is not useful placement evidence — the whole
 * point is discovering what has never been demonstrated); falls back to
 * any candidate at all if literally everything has been seen (a
 * returning learner re-running placement, which this diagnostic does not
 * forbid, only does not specially optimise for).
 */
export function buildPlacementSession(
  candidates: readonly BankQuestion[],
  history: ReadonlyMap<string, StudentQuestionHistoryRow>,
  competencyIds: readonly CompetencyId[] = ALL_COMPETENCY_IDS,
  questionsPerCompetency: number = DEFAULT_QUESTIONS_PER_COMPETENCY,
  random: () => number = Math.random
): PlacementSession {
  const byCompetency = new Map<CompetencyId, BankQuestion[]>();
  let totalQuestionCount = 0;

  for (const competencyId of competencyIds) {
    const questionTypes = new Set(getQuestionTypesForCompetency(competencyId));
    const eligible = candidates.filter((q) => questionTypes.has(q.skill as QuestionTypeId));
    if (eligible.length === 0) continue;

    const unseen = eligible.filter((q) => !history.get(q.id) || history.get(q.id)!.timesSeen === 0);
    const pool = unseen.length > 0 ? unseen : eligible;

    const shuffled = [...pool].sort(() => random() - 0.5);
    const sample = shuffled.slice(0, Math.min(questionsPerCompetency, shuffled.length));
    if (sample.length > 0) {
      byCompetency.set(competencyId, sample);
      totalQuestionCount += sample.length;
    }
  }

  return { byCompetency, totalQuestionCount };
}

export type PlacementCompetencyOutcome = "likely_secure" | "likely_weak" | "still_insufficient_evidence";

export interface PlacementInterpretation {
  byCompetency: Map<CompetencyId, PlacementCompetencyOutcome>;
  likelySecureCompetencies: CompetencyId[];
  likelyWeakCompetencies: CompetencyId[];
  stillInsufficientCompetencies: CompetencyId[];
}

/**
 * Reads back the REAL evidence state (via the same, unmodified
 * `SubjectPreparationSummary[]` every other consumer of
 * `computeSubjectPreparationSummary()` already uses) after a placement
 * session's attempts have been recorded through the ordinary Practice
 * attempt path, and classifies each sampled competency. This function
 * computes nothing new — it is a bounded relabelling of the same
 * `confidenceTier`/`educationalState` fields the rest of this programme
 * already trusts, scoped to just the competencies this session actually
 * sampled.
 */
export function interpretPlacementResults(
  session: PlacementSession,
  subjects: SubjectPreparationSummary[]
): PlacementInterpretation {
  const byCompetencyEvidence = new Map(flattenToCompetencyMap(subjects));
  const byCompetency = new Map<CompetencyId, PlacementCompetencyOutcome>();
  const likelySecureCompetencies: CompetencyId[] = [];
  const likelyWeakCompetencies: CompetencyId[] = [];
  const stillInsufficientCompetencies: CompetencyId[] = [];

  for (const competencyId of session.byCompetency.keys()) {
    const evidence = byCompetencyEvidence.get(competencyId);
    let outcome: PlacementCompetencyOutcome;
    if (!evidence || evidence.confidenceTier === "insufficient") {
      outcome = "still_insufficient_evidence";
      stillInsufficientCompetencies.push(competencyId);
    } else if (evidence.educationalState === "mastered" || evidence.educationalState === "durably-mastered" || evidence.educationalState === "reinforcing") {
      outcome = "likely_secure";
      likelySecureCompetencies.push(competencyId);
    } else {
      outcome = "likely_weak";
      likelyWeakCompetencies.push(competencyId);
    }
    byCompetency.set(competencyId, outcome);
  }

  return { byCompetency, likelySecureCompetencies, likelyWeakCompetencies, stillInsufficientCompetencies };
}

function flattenToCompetencyMap(subjects: SubjectPreparationSummary[]) {
  return subjects.flatMap((s) => s.competencies).map((c) => [c.competencyId, c] as const);
}
