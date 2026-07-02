import type { AliCompetencySignal } from "@/types/ali/missionSignal";
import type { LearningGainSnapshot } from "@/types/ali/learningGain";

/**
 * Internal-only Learning Gain calculation (Phase ALI 1.4). Measures
 * improvement over time — the direction and magnitude of change between two
 * competency signals — rather than a raw score. Not exposed to any UI in
 * this phase (types/ali/learningGain.ts's doc comment); intended as a real
 * trend signal for a future phase (e.g. the Readiness Shadow Model).
 *
 * Deliberately a simple weighted delta, not a new adaptive feature or a
 * stored per-attempt log: newly mastered competencies count positively,
 * newly weak competencies count negatively, newly improving (attempted but
 * not yet mastered/weak) competencies count slightly positively. Symmetric
 * treatment means a student who regresses gets a real negative delta, not
 * just a smaller positive one — "improvement over time" has to be able to
 * go down as well as up to mean anything.
 */
export function computeLearningGainDelta(
  newSignal: AliCompetencySignal,
  previousSignal: AliCompetencySignal | undefined
): number {
  const prevMastered = new Set(previousSignal?.masteredCompetencies ?? []);
  const prevWeak = new Set(previousSignal?.weakCompetencies ?? []);
  const prevAttempted = new Set(previousSignal?.attemptedCompetencies ?? []);

  const newlyMastered = newSignal.masteredCompetencies.filter((c) => !prevMastered.has(c)).length;
  const newlyWeak = newSignal.weakCompetencies.filter((c) => !prevWeak.has(c)).length;
  const newlyAttempted = newSignal.attemptedCompetencies.filter((c) => !prevAttempted.has(c)).length;
  // A competency that was weak and no longer is (and isn't newly mastered,
  // i.e. moved to "learning") is also a real, if smaller, positive signal.
  const recoveredFromWeak = [...prevWeak].filter(
    (c) => !newSignal.weakCompetencies.includes(c) && !newSignal.masteredCompetencies.includes(c)
  ).length;

  return newlyMastered * 3 + newlyAttempted * 1 + recoveredFromWeak * 1 - newlyWeak * 2;
}

/** Applies a new delta to the running cumulative total. Pure. */
export function updateLearningGain(
  subject: string,
  previous: LearningGainSnapshot | undefined,
  delta: number
): LearningGainSnapshot {
  return {
    subject,
    delta,
    cumulative: (previous?.cumulative ?? 0) + delta,
    computedAt: new Date().toISOString(),
  };
}
