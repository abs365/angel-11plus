import type { BankQuestion, CompetencyCode, ContentDifficulty } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";
import type { SelectionReason, SelectionTraceEntry } from "@/types/ali/observability";
import type { LearningUnit, LearningUnitSelectionResult } from "@/types/ali/learningUnit";
import { COOLDOWN_QUESTIONS } from "./selection";

const DIFFICULTY_RANK: Record<ContentDifficulty, number> = { easy: 0, medium: 1, hard: 2, challenge: 3 };
const RANK_TO_DIFFICULTY: ContentDifficulty[] = ["easy", "medium", "hard", "challenge"];

/** Mastered units get the same longer secondary cooldown as mastered questions (lib/ali/selection.ts). */
const MASTERED_RESURFACE_MULTIPLIER = 3;

/**
 * Groups a flat candidate list into Learning Units by `learningUnitId`
 * (ALI_DECISION_LOG.md Decision 36). Pure, generic across subjects — for
 * VR/Maths this produces one single-question unit per question (unchanged
 * behaviour, since `learningUnitId === id` for those subjects); for Reading
 * Comprehension it produces one unit per passage.
 */
export function groupQuestionsByLearningUnit(candidates: BankQuestion[]): LearningUnit[] {
  const byUnit = new Map<string, BankQuestion[]>();
  for (const q of candidates) {
    const list = byUnit.get(q.learningUnitId) ?? [];
    list.push(q);
    byUnit.set(q.learningUnitId, list);
  }

  const units: LearningUnit[] = [];
  for (const [id, questions] of byUnit) {
    const skills = [...new Set(questions.map((q) => q.skill))];
    const hardestRank = Math.max(...questions.map((q) => DIFFICULTY_RANK[q.contentDifficulty]));
    units.push({
      id,
      subject: questions[0].subject,
      questions,
      skills,
      contentDifficulty: RANK_TO_DIFFICULTY[hardestRank],
    });
  }
  return units;
}

interface WeightedUnit {
  unit: LearningUnit;
  weight: number;
  reason: SelectionReason;
}

/**
 * Selects exactly one Learning Unit and returns every question belonging to
 * it — units are never split apart (Decision 36). Mirrors
 * lib/ali/selection.ts's cooldown/weak-skill-override philosophy at unit
 * granularity instead of per-question granularity. Does NOT call or modify
 * `selectQuestions()` — VR/Maths (Learning Unit = Question) are completely
 * unaffected by this module's existence; this is new code, not a redesign
 * of the existing engine (explicit phase instruction).
 *
 * Unit-level conventions, documented here since they have no per-question
 * equivalent:
 *   - A unit's cooldown threshold uses its HARDEST constituent question's
 *     difficulty tier — conservative (favours under- over over-resurfacing
 *     a mixed-difficulty passage) and simple, a first-pass choice like the
 *     full-marks-only correctness rule (ALI_ENGLISH_IMPLEMENTATION_PLAN.md §2.2).
 *   - A unit counts as "mastered" only if EVERY one of its questions is
 *     individually mastered — a partially-mastered passage is still
 *     ordinary eligible-seen, so its not-yet-mastered question keeps
 *     getting reinforcement.
 *   - Weak-skill override happens at the HIGHEST selection weight, not via
 *     a reserved-slot floor (Decision 17's mechanism doesn't translate
 *     directly to a single pick) — this is the Learning-Unit-granularity
 *     expression of "weak competencies are revisited": a unit covering a
 *     currently-weak competency outranks everything else in the pool.
 */
export function selectLearningUnit(
  units: LearningUnit[],
  history: Map<string, StudentQuestionHistoryRow>,
  currentSequence: number,
  weakSkills: Set<CompetencyCode>,
  random: () => number = Math.random
): LearningUnitSelectionResult {
  // Step 1 — absolute exclusion of the immediately preceding mock's units,
  // exactly as lib/ali/selection.ts does at question granularity.
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

  const remaining = units.filter((u) => !u.questions.some((q) => previousMockQuestionIds.has(q.id)));

  const unseen: LearningUnit[] = [];
  const eligibleSeen: LearningUnit[] = [];
  const masteredResurface: LearningUnit[] = [];
  const coolingDown: LearningUnit[] = [];

  for (const unit of remaining) {
    const threshold = COOLDOWN_QUESTIONS[unit.contentDifficulty];
    const rows = unit.questions
      .map((q) => history.get(q.id))
      .filter((r): r is StudentQuestionHistoryRow => !!r);

    if (rows.length === 0 || rows.every((r) => r.timesSeen === 0)) {
      unseen.push(unit);
      continue;
    }

    const lastSeenSequence = Math.max(...rows.map((r) => r.lastPresentedAtSequence));
    const distance = currentSequence - lastSeenSequence;
    const eligible = distance >= threshold;
    const allMastered = unit.questions.every((q) => history.get(q.id)?.masteryState === "mastered");

    if (allMastered) {
      if (distance >= threshold * MASTERED_RESURFACE_MULTIPLIER) {
        masteredResurface.push(unit);
      } else {
        coolingDown.push(unit);
      }
      continue;
    }

    if (eligible) {
      eligibleSeen.push(unit);
    } else {
      coolingDown.push(unit);
    }
  }

  // Weak-skill override: a cooling-down unit is eligible again, at top
  // priority, if any of its competencies is currently weak.
  const overridden: LearningUnit[] = [];
  const stillCoolingDown: LearningUnit[] = [];
  for (const unit of coolingDown) {
    if (unit.skills.some((s) => weakSkills.has(s))) {
      overridden.push(unit);
    } else {
      stillCoolingDown.push(unit);
    }
  }

  const pool: WeightedUnit[] = [
    ...overridden.map((unit) => ({ unit, weight: 5, reason: "weak-skill-override-pool" as SelectionReason })),
    ...unseen.map((unit) => ({ unit, weight: 3, reason: "unseen" as SelectionReason })),
    ...eligibleSeen.map((unit) => ({ unit, weight: 2, reason: "eligible-seen" as SelectionReason })),
    ...masteredResurface.map((unit) => ({ unit, weight: 1, reason: "mastered-resurface" as SelectionReason })),
  ];

  let chosen = weightedSampleOne(pool, random);
  let reason: SelectionReason = "fallback-shortfall";
  if (chosen) reason = chosen.reason;

  // Fallback: only if every unit is still cooling down with no override —
  // expected at small fixture/early-bank sizes, same caveat as
  // selectQuestions()'s fallback-shortfall path.
  if (!chosen) {
    const fallbackPool: WeightedUnit[] = stillCoolingDown.map((unit) => ({
      unit,
      weight: 1,
      reason: "fallback-shortfall" as SelectionReason,
    }));
    chosen = weightedSampleOne(fallbackPool, random);
  }

  if (!chosen) {
    return { unit: null, questions: [], trace: [] };
  }

  const selectedUnit = chosen.unit;
  const weakOverride = reason === "weak-skill-override-pool";
  const threshold = COOLDOWN_QUESTIONS[selectedUnit.contentDifficulty];
  const trace: SelectionTraceEntry[] = selectedUnit.questions.map((q) => {
    const row = history.get(q.id);
    const distance = row ? currentSequence - row.lastPresentedAtSequence : null;
    const isWeakQuestion = weakOverride && weakSkills.has(q.skill);
    return {
      questionId: q.id,
      competency: q.skill,
      difficultyTier: q.contentDifficulty,
      selectionReason: reason,
      cooldownStatus: {
        distance,
        threshold,
        eligible: distance === null ? true : distance >= threshold,
      },
      weakSkillOverride: isWeakQuestion,
      replayReason: isWeakQuestion
        ? `Competency "${q.skill}" is currently weak — this Learning Unit was chosen ahead of its normal cooldown for remediation.`
        : null,
    };
  });

  return { unit: selectedUnit, questions: selectedUnit.questions, trace };
}

function weightedSampleOne(pool: WeightedUnit[], random: () => number): WeightedUnit | undefined {
  if (pool.length === 0) return undefined;
  const totalWeight = pool.reduce((sum, w) => sum + w.weight, 0);
  let roll = random() * totalWeight;
  for (const w of pool) {
    roll -= w.weight;
    if (roll <= 0) return w;
  }
  return pool[pool.length - 1];
}
