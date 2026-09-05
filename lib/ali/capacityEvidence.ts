import type { BankQuestion } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";
import { COOLDOWN_QUESTIONS } from "./selection";
import { classifyFamilyFreshness, summariseFreshCapacity, type EffectiveFreshCapacitySummary } from "./effectiveFreshCapacity";
import { groupingKeyOf } from "./exposureIntelligence";

/**
 * Question Factory Wave 2, Section 8 — the first real caller of
 * `lib/ali/effectiveFreshCapacity.ts`, which had tests (Wave 1) but no
 * live caller. Deliberately internal/evidence-only, per the Founder's own
 * explicit instruction: "Do not display a learner-facing number yet
 * unless its educational meaning is validated. First use it internally
 * for selection and capacity evidence."
 *
 * This module does NOT change what `selectQuestions()` picks -- it is a
 * read-only, second pass over the SAME candidate pool and history a
 * session generator already fetched, computed AFTER selection, for
 * internal visibility only (e.g. a future admin/ops capacity dashboard,
 * or a content-supply decision input). Wiring this into the live
 * SELECTION WEIGHTS themselves is deliberately deferred -- the existing,
 * proven `lib/ali/exposureIntelligence.ts` retrieval-stage weighting
 * already performs the live, wired anti-repetition job today, and
 * duplicating that with a second, differently-classified signal
 * (fresh/renewable_due/recently_exhausted vs NEW/IMMEDIATE_REMEDIATION/
 * SPACED_RETRIEVAL/MASTERY_MAINTENANCE) inside the same selection pass
 * risks two signals disagreeing with no arbitration rule -- a real design
 * question for a future increment, not a Wave 2 shortcut to paper over.
 */

export interface LearnerCapacityEvidence extends EffectiveFreshCapacitySummary {
  /** Total distinct families/groups the learner's candidate pool spans (fresh + renewable + exhausted + insufficient + sealed). */
  totalFamiliesConsidered: number;
}

/**
 * Computes a real, per-learner capacity-evidence summary from the exact
 * same candidate pool, history, and current sequence a session generator
 * already has in hand -- no new data fetch, no new learner model,
 * reusing `groupingKeyOf()` (family_id, falling back to learningUnitId)
 * so this reports against the SAME grouping Practice's own diversity pass
 * (`reduceFamilyClustering`) already uses, not a third, incompatible
 * definition of "family."
 */
export function computeLearnerCapacityEvidence(
  candidatePool: BankQuestion[],
  history: Map<string, StudentQuestionHistoryRow>,
  currentSequence: number
): LearnerCapacityEvidence {
  const byGroup = new Map<string, BankQuestion[]>();
  for (const q of candidatePool) {
    const key = groupingKeyOf(q);
    if (!key) continue;
    const existing = byGroup.get(key);
    if (existing) existing.push(q);
    else byGroup.set(key, [q]);
  }

  const cooldownThresholdByQuestionId = new Map<string, number>(candidatePool.map((q) => [q.id, COOLDOWN_QUESTIONS[q.contentDifficulty]]));

  const classifications = [...byGroup.entries()].map(([familyId, members]) => ({
    classification: classifyFamilyFreshness(
      {
        familyId,
        familyQuestionIds: members.map((m) => m.id),
        history,
      },
      currentSequence,
      cooldownThresholdByQuestionId
    ),
  }));

  const summary = summariseFreshCapacity(classifications);

  return {
    ...summary,
    totalFamiliesConsidered: byGroup.size,
  };
}
