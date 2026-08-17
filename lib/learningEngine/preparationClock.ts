import { getTargetExamDate } from "@/lib/progress";

/**
 * Educational Increment 007V, Part 6 — the smallest safe operational form
 * of 007U's Preparation Clock design. Reuses `getTargetExamDate()`
 * (lib/progress.ts, existing, parent-supplied, optional) unchanged — no
 * schema change, no new persistence. Deliberately does NOT resolve an
 * "authoritative CSSE exam date" automatically: 007U's own Preparation
 * Clock design (ANGEL_007U_..._V1.md §6) requires an annual,
 * Founder-governed evidence-refresh cycle before any such date could be
 * used as a system-suggested default, and that governance step has not
 * happened. Until it does, `targetExamDate` is exactly the parent's own
 * configured date, or unavailable — never fabricated, never silently
 * defaulted to a CSSE date this module read from a document.
 *
 * The clock is educational CONTEXT only, per this increment's own
 * explicit instruction — it must never itself determine a preparation
 * stage (see preparationStage.ts, which combines this with real evidence).
 */

export type PreparationHorizonBand =
  | "long_horizon"
  | "coverage_building"
  | "transfer_building"
  | "exam_condition"
  | "final_preparation"
  | "unavailable";

export interface PreparationClock {
  /** ISO date string, exactly as the parent configured it — null when absent. Never fabricated. */
  targetExamDate: string | null;
  daysRemaining: number | null;
  weeksRemaining: number | null;
  horizonBand: PreparationHorizonBand;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Band boundaries are a disclosed, provisional judgement call (matching
 * the same calibration-ownership discipline lib/ali/confidence.ts's own
 * thresholds document) — not derived from any official CSSE source, since
 * CSSE publishes no "how many months before the exam should preparation
 * intensity change" guidance. Angel 11+ preparation POLICY, explicitly
 * distinguished from official CSSE EXAM FACTS (007U §6).
 */
function classifyHorizonBand(daysRemaining: number): PreparationHorizonBand {
  if (daysRemaining < 0) return "unavailable"; // a past target date is stale, not a real horizon — never guessed at
  if (daysRemaining > 365) return "long_horizon";
  if (daysRemaining > 180) return "coverage_building";
  if (daysRemaining > 90) return "transfer_building";
  if (daysRemaining > 21) return "exam_condition";
  return "final_preparation";
}

/**
 * Pure core — takes the target date explicitly rather than reading
 * `getTargetExamDate()` itself, so it is independently testable without
 * touching localStorage (the exact pattern lib/progress.ts's own
 * `isPlausibleExamDate()` already established for this same reason —
 * `getProgress()`/`saveProgress()` silently no-op outside a browser,
 * `typeof window === "undefined"`, so a test calling `setTargetExamDate()`
 * in Node would appear to succeed while persisting nothing).
 */
export function resolvePreparationClockFor(targetExamDate: string | undefined, now: Date = new Date()): PreparationClock {
  if (!targetExamDate) {
    return { targetExamDate: null, daysRemaining: null, weeksRemaining: null, horizonBand: "unavailable" };
  }
  const daysRemaining = Math.round((new Date(targetExamDate).getTime() - now.getTime()) / MS_PER_DAY);
  const weeksRemaining = Math.round(daysRemaining / 7);
  return { targetExamDate, daysRemaining, weeksRemaining, horizonBand: classifyHorizonBand(daysRemaining) };
}

/** Real entry point for app code — reads the parent's actual configured date via lib/progress.ts, then delegates to the pure core above. */
export function resolvePreparationClock(now: Date = new Date()): PreparationClock {
  return resolvePreparationClockFor(getTargetExamDate(), now);
}
