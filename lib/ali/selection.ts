import type { BankQuestion, CompetencyCode, ContentDifficulty } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";
import type { SelectionReason, SelectionTraceEntry } from "@/types/ali/observability";

/**
 * Question-count cooldown thresholds (ALI_DECISION_LOG.md Decision 4).
 * Measured in intervening questions presented to the student, not calendar
 * time — behaviour stays consistent regardless of study frequency.
 * `challenge` (20) is a floor, raisable as a constant change.
 */
export const COOLDOWN_QUESTIONS: Record<ContentDifficulty, number> = {
  easy: 5,
  medium: 10,
  hard: 15,
  challenge: 20,
};

/** Mastered questions get a longer secondary cooldown before resurfacing at all. */
const MASTERED_RESURFACE_MULTIPLIER = 3;

interface Weighted {
  question: BankQuestion;
  weight: number;
  reason: SelectionReason;
}

export interface SelectionResult {
  questions: BankQuestion[];
  trace: SelectionTraceEntry[];
}

/**
 * Selects `count` questions from `candidates` for one adaptive mock section.
 * Pure function, no I/O — reads pre-fetched candidates/history, returns both
 * the selection and a trace explaining every decision (ALI_VALIDATION_
 * PROTOCOL.md — Phase ALI 1.1 observability, internal/debugging only, never
 * shown to end users). See ADAPTIVE_ASSESSMENT_ENGINE_IMPLEMENTATION_PLAN.md §3.
 *
 * Order of operations matters:
 *   1. Absolute exclusion of the immediately preceding mock's questions
 *      (Decision 11) — computed as the exact set of history rows sharing
 *      this profile's most recent sequence stamp. Runs before anything else
 *      and is never overridden by weak-skill status.
 *   2. Cooldown eligibility by difficulty-tiered question-count distance
 *      (Decision 4).
 *   3. Weighted partition: unseen > eligible-seen > mastered-due-for-resurface
 *      > cooling-down (excluded by default).
 *   4. Weak-skill override: a cooling-down question (never one excluded by
 *      step 1) becomes eligible if its competency is in `weakSkills`.
 *   4b. Guaranteed minimum reserve for overridden questions (Decision 17).
 *   5. Weighted random sample without replacement.
 */
export function selectQuestions(
  candidates: BankQuestion[],
  history: Map<string, StudentQuestionHistoryRow>,
  currentSequence: number,
  weakSkills: Set<CompetencyCode>,
  count: number,
  random: () => number = Math.random
): SelectionResult {
  // Step 1 — absolute exclusion of the immediately preceding mock's questions.
  let previousMockStamp = -1;
  for (const row of history.values()) {
    if (row.lastPresentedAtSequence > previousMockStamp) {
      previousMockStamp = row.lastPresentedAtSequence;
    }
  }
  const previousMockQuestionIds = new Set<string>();
  if (previousMockStamp >= 0) {
    for (const row of history.values()) {
      if (row.lastPresentedAtSequence === previousMockStamp) {
        previousMockQuestionIds.add(row.questionId);
      }
    }
  }

  const remaining = candidates.filter((q) => !previousMockQuestionIds.has(q.id));

  // Steps 2-4 — partition into weighted pools.
  const unseen: BankQuestion[] = [];
  const eligibleSeen: BankQuestion[] = [];
  const masteredResurface: BankQuestion[] = [];
  const coolingDown: BankQuestion[] = [];
  const cooldownById = new Map<string, { distance: number | null; threshold: number; eligible: boolean }>();

  for (const q of remaining) {
    const row = history.get(q.id);
    const threshold = COOLDOWN_QUESTIONS[q.contentDifficulty];

    if (!row || row.timesSeen === 0) {
      unseen.push(q);
      cooldownById.set(q.id, { distance: null, threshold, eligible: true });
      continue;
    }

    const distance = currentSequence - row.lastPresentedAtSequence;
    const eligible = distance >= threshold;
    cooldownById.set(q.id, { distance, threshold, eligible });

    if (row.masteryState === "mastered") {
      if (distance >= threshold * MASTERED_RESURFACE_MULTIPLIER) {
        masteredResurface.push(q);
      } else {
        coolingDown.push(q);
      }
      continue;
    }

    if (eligible) {
      eligibleSeen.push(q);
    } else {
      coolingDown.push(q);
    }
  }

  // Step 4 — weak-skill override: cooling-down questions (not step-1-excluded)
  // in a weak competency become eligible.
  const overridden: BankQuestion[] = [];
  const stillCoolingDown: BankQuestion[] = [];
  for (const q of coolingDown) {
    if (weakSkills.has(q.skill)) {
      overridden.push(q);
    } else {
      stillCoolingDown.push(q);
    }
  }

  // Step 4b — guaranteed minimum inclusion for overridden weak-skill questions
  // (Decision 17 — equal-weight eligibility alone doesn't guarantee weak
  // competencies are actually revisited, only makes it possible).
  const reasonById = new Map<string, SelectionReason>();
  const selected: BankQuestion[] = [];
  if (overridden.length > 0 && count > 0) {
    const reserveCount = Math.min(overridden.length, Math.max(1, Math.floor(count * 0.2)));
    const reservedPool: Weighted[] = overridden.map((question) => ({
      question,
      weight: 1,
      reason: "weak-skill-override-reserved",
    }));
    const reserved = weightedSampleWithoutReplacement(reservedPool, reserveCount, random);
    for (const q of reserved) reasonById.set(q.id, "weak-skill-override-reserved");
    selected.push(...reserved);
  }
  const reservedIds = new Set(selected.map((q) => q.id));
  const remainingOverridden = overridden.filter((q) => !reservedIds.has(q.id));

  const pool: Weighted[] = [
    ...unseen.map((question) => ({ question, weight: 3, reason: "unseen" as SelectionReason })),
    ...eligibleSeen.map((question) => ({ question, weight: 2, reason: "eligible-seen" as SelectionReason })),
    ...remainingOverridden.map((question) => ({ question, weight: 2, reason: "weak-skill-override-pool" as SelectionReason })),
    ...masteredResurface.map((question) => ({ question, weight: 1, reason: "mastered-resurface" as SelectionReason })),
  ];

  // Step 5 — weighted random sample without replacement, filling the rest
  // of the section around the reserved weak-skill slots.
  const additional = weightedSampleWithoutReplacement(pool, count - selected.length, random);
  for (const q of additional) {
    const source = pool.find((w) => w.question.id === q.id);
    if (source) reasonById.set(q.id, source.reason);
  }
  selected.push(...additional);

  // Fallback: only if the eligible pool is smaller than `count` (expected at
  // small first-slice bank sizes, not a steady-state concern once the bank
  // grows). Never falls back into step-1-excluded questions.
  if (selected.length < count) {
    const alreadySelected = new Set(selected.map((q) => q.id));
    const fallbackPool: Weighted[] = stillCoolingDown
      .filter((q) => !alreadySelected.has(q.id))
      .map((question) => ({ question, weight: 1, reason: "fallback-shortfall" as SelectionReason }));
    const fallbackAdditional = weightedSampleWithoutReplacement(
      fallbackPool,
      count - selected.length,
      random
    );
    for (const q of fallbackAdditional) reasonById.set(q.id, "fallback-shortfall");
    selected.push(...fallbackAdditional);
  }

  const trace: SelectionTraceEntry[] = selected.map((q) => {
    const cooldown = cooldownById.get(q.id) ?? {
      distance: null,
      threshold: COOLDOWN_QUESTIONS[q.contentDifficulty],
      eligible: true,
    };
    const reason = reasonById.get(q.id) ?? "unseen";
    const weakOverride = reason === "weak-skill-override-reserved" || reason === "weak-skill-override-pool";
    return {
      questionId: q.id,
      competency: q.skill,
      difficultyTier: q.contentDifficulty,
      selectionReason: reason,
      cooldownStatus: cooldown,
      weakSkillOverride: weakOverride,
      replayReason: weakOverride
        ? `Competency "${q.skill}" is currently weak — resurfaced ahead of its normal cooldown for remediation.`
        : null,
    };
  });

  return { questions: selected, trace };
}

function weightedSampleWithoutReplacement(
  pool: Weighted[],
  count: number,
  random: () => number
): BankQuestion[] {
  const remaining = [...pool];
  const result: BankQuestion[] = [];

  while (result.length < count && remaining.length > 0) {
    const totalWeight = remaining.reduce((sum, w) => sum + w.weight, 0);
    let roll = random() * totalWeight;
    let pickIndex = remaining.length - 1;
    for (let i = 0; i < remaining.length; i++) {
      roll -= remaining[i].weight;
      if (roll <= 0) {
        pickIndex = i;
        break;
      }
    }
    result.push(remaining[pickIndex].question);
    remaining.splice(pickIndex, 1);
  }

  return result;
}
