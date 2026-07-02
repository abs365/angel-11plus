/**
 * Cached snapshot of ALI competency state, bridged into UserProgress
 * (localStorage) so lib/adaptiveEngine.ts's mission prioritisation can read
 * it synchronously without a Supabase round-trip — same bridge pattern as
 * the confidence/replay/readiness write-back (ADAPTIVE_ASSESSMENT_ENGINE_
 * IMPLEMENTATION_PLAN.md §0.5.3), extended to carry competency-level data.
 *
 * Purely additive to UserProgress — does not touch `scores`/`skillScores`
 * or the Math.max ratchet behaviour (ALI_LEARNING_MODEL.md Decision 24,
 * left unchanged per this phase's explicit safety instruction).
 */
export interface AliCompetencySignal {
  subject: string; // AliSubject, e.g. "verbal-reasoning"
  weakCompetencies: string[];
  masteredCompetencies: string[];
  attemptedCompetencies: string[]; // denominator for mastery ratio — includes weak/learning/mastered, excludes 'new'
  // Competencies that transitioned into `masteredCompetencies` as of THIS
  // signal write, relative to the previously cached signal (Phase ALI 1.4).
  // A subset of masteredCompetencies, not an additional category — used by
  // Parent Insights' "Recently Mastered" section.
  recentlyMasteredCompetencies: string[];
  updatedAt: string;
}
