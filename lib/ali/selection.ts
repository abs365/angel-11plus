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

/**
 * Stage 3, Increment 002 (Evidence-Driven Difficulty Progression).
 * Ordinal ranking of the real `ContentDifficulty` values, used only to
 * compare two questions' relative challenge, never displayed or stored.
 */
const DIFFICULTY_RANK: Record<ContentDifficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
  challenge: 3,
};

/**
 * Provisional, disclosed as such (same convention as
 * `lib/ali/confidence.ts`'s own calibration constants) — the multiplier
 * applied to a candidate's base selection weight once real evidence
 * justifies escalating toward it. Deliberately never a weight reduction:
 * Stage 3 discovery (Decision 114) found the majority of Mathematics
 * families expose only a single `contentDifficulty` value, so a design
 * that *depressed* harder-tier weight by default (a "start at easy, earn
 * your way up" ceiling) would systematically penalise the majority of
 * real content for every learner, including ones with zero relevant
 * history — punishing content scarcity, not reflecting skill readiness.
 * Boost-only avoids this: a candidate's weight is only ever multiplied
 * up when real, trustworthy evidence supports it, and is otherwise
 * identical to today's unweighted behaviour — see this function's own
 * callers for the exact evidence gate.
 */
const DIFFICULTY_ESCALATION_MULTIPLIER = 1.5;

/**
 * For every skill (QuestionTypeId) present in `candidates`, the set of
 * difficulty ranks at which the learner has at least one genuinely
 * `mastered` question. Reuses `StudentQuestionHistoryRow.masteryState`
 * unmodified — no new evidence field, no duplicate mastery
 * representation (Increment 002's own architectural rule 4). Because
 * `masteryState` can only reach `"mastered"` via `distinctCorrectSessions
 * >= masteryThreshold` (lib/ali/mastery.ts's `applyAttemptOutcome()`),
 * which itself only ever increments for `supportTier === "independent"`,
 * this is already structurally immune to self-assessed-only evidence,
 * a single lucky answer, or raw repetition (`timesSeen`) — none of those
 * can produce a `"mastered"` reading on their own; this function inherits
 * that safety by construction rather than re-implementing it.
 */
export function computeMasteredRanksBySkill(
  candidates: BankQuestion[],
  history: Map<string, StudentQuestionHistoryRow>
): Map<string, Set<number>> {
  const result = new Map<string, Set<number>>();
  for (const q of candidates) {
    const row = history.get(q.id);
    if (row?.masteryState !== "mastered") continue;
    const rank = DIFFICULTY_RANK[q.contentDifficulty];
    const existing = result.get(q.skill);
    if (existing) {
      existing.add(rank);
    } else {
      result.set(q.skill, new Set([rank]));
    }
  }
  return result;
}

/**
 * The one genuine progression decision this increment adds: does `q`
 * deserve a difficulty-escalation boost right now? Two conditions, both
 * evidence-gated, neither ever fabricated:
 *
 *   1. A strictly-easier question sharing the same skill is genuinely
 *      `mastered` (see `computeMasteredRanksBySkill()` above for why this
 *      is already safe against self-assessment/repetition/luck). If no
 *      easier sibling exists at all — including the common real case of a
 *      skill with only one `contentDifficulty` value present — this is
 *      false and the candidate gets the ordinary, unboosted weight.
 *   2. `q` itself is not currently `"weak"` (the existing, unmodified
 *      two-consecutive-wrong-attempts signal, `applyAttemptOutcome()`).
 *      A struggling learner must not keep receiving an artificially
 *      elevated push toward a specific harder question they are
 *      demonstrably not yet managing — this is what keeps escalation from
 *      continuing once real difficulty is encountered. `q` is never
 *      removed from the pool by this — only returned to ordinary,
 *      unboosted weight, so it remains selectable and the session can
 *      still be constructed (Increment 002's own fallback requirement).
 */
export function computeDifficultyWeightMultiplier(
  question: BankQuestion,
  masteredRanksBySkill: Map<string, Set<number>>,
  history: Map<string, StudentQuestionHistoryRow>
): number {
  const row = history.get(question.id);
  if (row?.masteryState === "weak") return 1;

  const rankedMasterySiblings = masteredRanksBySkill.get(question.skill);
  if (!rankedMasterySiblings) return 1;

  const myRank = DIFFICULTY_RANK[question.contentDifficulty];
  for (const masteredRank of rankedMasterySiblings) {
    if (masteredRank < myRank) return DIFFICULTY_ESCALATION_MULTIPLIER;
  }
  return 1;
}

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

  // Stage 3, Increment 002 — difficulty-escalation multiplier, computed
  // once from the full candidate pool (not just `remaining`, so a
  // mastered easier sibling still counts even if it happened to be
  // excluded from *this* session by step 1). Deliberately NOT applied to
  // `masteredResurface` below — that bucket exists for retention
  // maintenance (Decision 4's own resurface mechanic), a different
  // purpose from progression, and this increment's own scope boundary
  // (rule 8: operate within existing mechanisms, not replace them) is
  // kept narrowest by leaving it untouched.
  const masteredRanksBySkill = computeMasteredRanksBySkill(candidates, history);
  const difficultyWeight = (question: BankQuestion) =>
    computeDifficultyWeightMultiplier(question, masteredRanksBySkill, history);

  const pool: Weighted[] = [
    ...unseen.map((question) => ({ question, weight: 3 * difficultyWeight(question), reason: "unseen" as SelectionReason })),
    ...eligibleSeen.map((question) => ({ question, weight: 2 * difficultyWeight(question), reason: "eligible-seen" as SelectionReason })),
    ...remainingOverridden.map((question) => ({ question, weight: 2 * difficultyWeight(question), reason: "weak-skill-override-pool" as SelectionReason })),
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
        ? `Competency "${q.skill}" is currently weak. Resurfaced ahead of its normal cooldown for remediation.`
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
