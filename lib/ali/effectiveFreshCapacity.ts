import type { StudentQuestionHistoryRow } from "@/types/ali/history";
import type { InventoryClassification } from "./inventoryClass";

/**
 * Programme Increment 019, Part 10 — Effective Fresh Capacity foundation.
 *
 * Increment 017/018's own audit established RAW ITEM COUNT (194/142
 * learner-reachable Mathematics/English Practice questions) is not the
 * same question as EFFECTIVE FRESH CAPACITY — a learner who has already
 * seen every sibling in a small family has effectively no fresh capacity
 * left in that family, however large the raw pool looks. This module
 * does NOT fabricate a single precise score (explicitly forbidden by this
 * increment's own instruction) — it classifies one real, computable
 * signal per (learner, family) pair, using data that already exists:
 * `ali_student_question_history` (real, live, per-question exposure —
 * `timesSeen`/`lastPresentedAtSequence`) grouped by `family_id` (real,
 * live, 73 Mathematics families — Increment 018's own confirmed count).
 *
 * For Mathematics this is a REAL signal today, not a placeholder — no new
 * schema, no new event log, just an aggregation over data this codebase
 * already collects on every Practice attempt. For English (no family_id
 * — Part 8's own confirmed gap) this module returns
 * `"insufficient_metadata"` honestly rather than approximating one, per
 * this increment's own explicit permission to do exactly that when
 * evidence is genuinely insufficient.
 */

export type FreshnessClassification =
  | "fresh"
  | "renewable_due"
  | "recently_exhausted"
  | "insufficient_metadata";

export interface FamilyExposureSignal {
  familyId: string | null;
  /** Question ids belonging to this family, from the real (Mathematics-only, today) `family_id` grouping. */
  familyQuestionIds: readonly string[];
  /** This learner's real history rows for those exact question ids -- absent entries mean genuinely unseen. */
  history: ReadonlyMap<string, StudentQuestionHistoryRow>;
  inventoryClass?: InventoryClassification;
}

/**
 * Classifies one family's freshness for one learner, from real exposure
 * data only:
 *   - `insufficient_metadata` -- no family_id exists for this content
 *     (English, today) or the family has zero known member questions;
 *     never guessed.
 *   - `fresh` -- at least one sibling in the family is genuinely unseen
 *     (`timesSeen === 0` or no history row at all).
 *   - `recently_exhausted` -- every sibling has been seen, and the LEAST
 *     recently seen one is still within this codebase's own real cooldown
 *     window for its own difficulty (reuses `COOLDOWN_QUESTIONS`,
 *     lib/ali/selection.ts, unmodified -- not a new threshold).
 *   - `renewable_due` -- every sibling has been seen, but the least
 *     recently seen one has already cleared its real cooldown window --
 *     i.e. `lib/ali/selection.ts`'s own resurfacing mechanism (Increment
 *     017/018's own confirmed genuine strength) would legitimately
 *     re-offer it. This is RENEWABLE reuse, not fresh capacity, and this
 *     module labels it as such rather than conflating the two.
 *
 * `currentSequence`/`cooldownThreshold` are supplied by the caller
 * (exactly the same real inputs `selectQuestions()` itself already
 * requires) -- this module never re-derives or hardcodes a cooldown
 * value of its own.
 */
export function classifyFamilyFreshness(
  signal: FamilyExposureSignal,
  currentSequence: number,
  cooldownThresholdByQuestionId: ReadonlyMap<string, number>
): FreshnessClassification {
  if (!signal.familyId || signal.familyQuestionIds.length === 0) return "insufficient_metadata";

  let leastRecentDistance: number | null = null;
  let leastRecentThreshold = 0;

  for (const questionId of signal.familyQuestionIds) {
    const row = signal.history.get(questionId);
    if (!row || row.timesSeen === 0) return "fresh";

    const distance = currentSequence - row.lastPresentedAtSequence;
    if (leastRecentDistance === null || distance > leastRecentDistance) {
      leastRecentDistance = distance;
      leastRecentThreshold = cooldownThresholdByQuestionId.get(questionId) ?? 0;
    }
  }

  if (leastRecentDistance === null) return "insufficient_metadata";
  return leastRecentDistance >= leastRecentThreshold ? "renewable_due" : "recently_exhausted";
}

/**
 * Rolls a set of per-family classifications up into one bounded summary —
 * exactly the shape Part 10 asks the architecture to be ABLE to reason
 * about (family / learner exposure / inventory class / recency), without
 * collapsing it into a single fabricated number. `bySealedFamilyCount` is
 * reported separately and never summed into fresh/renewable/exhausted --
 * SEALED families are never a Practice freshness question at all.
 */
export interface EffectiveFreshCapacitySummary {
  freshFamilyCount: number;
  renewableDueFamilyCount: number;
  recentlyExhaustedFamilyCount: number;
  insufficientMetadataFamilyCount: number;
  sealedFamilyCount: number;
}

export function summariseFreshCapacity(
  classifications: readonly { classification: FreshnessClassification; inventoryClass?: InventoryClassification }[]
): EffectiveFreshCapacitySummary {
  const summary: EffectiveFreshCapacitySummary = {
    freshFamilyCount: 0,
    renewableDueFamilyCount: 0,
    recentlyExhaustedFamilyCount: 0,
    insufficientMetadataFamilyCount: 0,
    sealedFamilyCount: 0,
  };
  for (const c of classifications) {
    if (c.inventoryClass === "sealed") {
      summary.sealedFamilyCount += 1;
      continue;
    }
    if (c.classification === "fresh") summary.freshFamilyCount += 1;
    else if (c.classification === "renewable_due") summary.renewableDueFamilyCount += 1;
    else if (c.classification === "recently_exhausted") summary.recentlyExhaustedFamilyCount += 1;
    else summary.insufficientMetadataFamilyCount += 1;
  }
  return summary;
}
