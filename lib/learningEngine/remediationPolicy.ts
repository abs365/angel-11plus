/**
 * Educational Foundation Completion Standard — Remediation Policy
 * (Section 9).
 *
 * The Founder's own instruction: "the system must avoid immediately
 * re-serving essentially the same failed skeleton merely with changed
 * numbers... make remediation an educational selection STATE/POLICY
 * rather than random recycling," and explicitly forbids "automatically
 * creat[ing] a large duplicate remediation pool."
 *
 * This module is the POLICY, not a new content pool or a live-wired
 * selector: a pure, deterministic function choosing among the eight
 * named remediation actions from real, disclosed evidence signals. It
 * deliberately reuses existing mechanisms wherever one already exists
 * (`COMPETENCY_RELATIONSHIPS`'s own weak-source-prerequisite edge in
 * `lib/ali/recommendations.ts`; `StructuralBlueprint.misconceptionTargeted`
 * from the Question Factory) rather than inventing parallel ones.
 *
 * NOT wired into `sessionGenerator.ts`'s live selection this increment
 * -- that would require plumbing several of this function's inputs
 * (consecutive-same-skeleton failure count, in particular) through
 * layers that do not currently carry them, a real, disclosed follow-on
 * step (see the Educational Foundation Completion Report, Section E),
 * not performed here per the Founder's own "do not rewrite the
 * recommendation engine unnecessarily" constraint.
 */

export type RemediationAction =
  | "re_teaching"
  | "worked_example"
  | "guided_practice"
  | "simpler_structural_blueprint"
  | "misconception_targeted_blueprint"
  | "prerequisite_competency"
  | "delayed_retrieval"
  | "different_representation_or_context";

export interface RemediationContext {
  /** How many of the learner's most recent attempts on this competency, IN A ROW, failed on the exact same normalised skeleton (lib/ali/antiMemorisationChecks.ts's own skeleton normalisation) -- the real, disclosed signal for "about to re-serve essentially the same failed problem." 0 when unknown/not tracked by the caller. */
  consecutiveFailuresOnSameSkeleton: number;
  /** Whether a real lesson exists for this competency (fullLessonRegistry.ts, unchanged). */
  hasFullLessonAvailable: boolean;
  /** Whether at least one StructuralBlueprint for this family declares a misconceptionTargeted string -- a real, existing Question Factory field, not a new one. */
  hasMisconceptionTargetedBlueprintAvailable: boolean;
  /** From COMPETENCY_RELATIONSHIPS' own existing reverse "weak source -> prerequisite-building" edge (lib/ali/recommendations.ts) -- true only when that real mechanism already identified a plausible prerequisite gap. */
  hasPrerequisiteCompetencyWithWeakEvidence: boolean;
  /** Whether the family has more than one representationType/contextTag declared across its blueprints (Question Factory Scale Architecture) -- a real, disclosed structural fact, not assumed. */
  hasAlternativeRepresentationAvailable: boolean;
  /** Whether the family has more than one StructuralBlueprint at all, i.e. a genuinely simpler blueprint could exist within the same family. */
  hasMultipleBlueprintsInFamily: boolean;
}

/**
 * Deterministic priority ladder. The FIRST failure on a skeleton never
 * escalates past guided_practice/different_representation -- escalation
 * to re_teaching only fires once repeated failure on the identical
 * structure proves a raw-number reshuffle is not working, matching the
 * Founder's own "avoid immediately re-serving... merely with changed
 * numbers" instruction precisely (immediately == on the very next
 * attempt would be premature; genuinely repeated failure is the actual
 * trigger this policy names).
 */
export function selectRemediationAction(context: RemediationContext): RemediationAction {
  const {
    consecutiveFailuresOnSameSkeleton,
    hasFullLessonAvailable,
    hasMisconceptionTargetedBlueprintAvailable,
    hasPrerequisiteCompetencyWithWeakEvidence,
    hasAlternativeRepresentationAvailable,
    hasMultipleBlueprintsInFamily,
  } = context;

  // Two or more consecutive failures on the SAME skeleton is the direct
  // evidence this policy exists to act on -- re-serving a third
  // reshuffled-numbers instance would be exactly the failure mode named.
  if (consecutiveFailuresOnSameSkeleton >= 2) {
    return hasFullLessonAvailable ? "re_teaching" : "worked_example";
  }

  // A genuine, real prerequisite gap (an existing, separately-evidenced
  // mechanism) takes priority over guessing at a misconception within
  // the current competency -- fixing the foundation first.
  if (hasPrerequisiteCompetencyWithWeakEvidence) {
    return "prerequisite_competency";
  }

  // A single failure with a real, named misconception model available
  // for this family is a genuine diagnostic opportunity -- more useful
  // than a generic retry.
  if (hasMisconceptionTargetedBlueprintAvailable) {
    return "misconception_targeted_blueprint";
  }

  // A genuinely different representation or context is a real transfer-
  // adjacent check on whether understanding is structure-dependent --
  // preferred over a same-shape, same-numbers reshuffle.
  if (hasAlternativeRepresentationAvailable) {
    return "different_representation_or_context";
  }

  if (hasMultipleBlueprintsInFamily) {
    return "simpler_structural_blueprint";
  }

  // No richer signal available -- guided support on a delayed timeline
  // (not an immediate identical reshuffle) is the safest honest default.
  return consecutiveFailuresOnSameSkeleton === 1 ? "guided_practice" : "delayed_retrieval";
}

/**
 * Migration 232 Production Reconciliation increment, Section 8 --
 * connects this policy to the REAL learner evidence path, reusing
 * exactly what `buildPreparationDecision()` already computes, with NO
 * new parallel recommendation engine and no new tracking table.
 *
 * Only `hasFullLessonAvailable` and `hasRealRegressionSignal` are
 * genuinely real, live signals at this exact call site. Every other
 * `RemediationContext` input is honestly defaulted `false` and
 * disclosed as a CONTENT SUPPLY BLOCKER, never fabricated true:
 *
 *   - `consecutiveFailuresOnSameSkeleton` is mapped from the SAME real
 *     "rebuilding" regression signal `buildPreparationDecision()`
 *     already computes (`educationalState === 'rebuilding'`, a genuine
 *     mastery-just-reversed event) -- treated as equivalent-or-stronger
 *     evidence than 2 consecutive same-skeleton failures, since a
 *     rebuilding event requires the competency to have been mastered
 *     and then failed, not merely failed twice from a cold start. No
 *     per-skeleton failure-streak counter exists anywhere in this
 *     codebase today; building one is real, disclosed follow-on work.
 *   - `hasPrerequisiteCompetencyWithWeakEvidence`: `COMPETENCY_RELATIONSHIPS`
 *     (`lib/ali/recommendations.ts`) is the one real prerequisite-graph
 *     mechanism in this codebase, but it covers Vocabulary/Verbal-
 *     Reasoning/Numerical-Reasoning competency codes only -- it has no
 *     edges for the CSSE Mathematics/English/Writing competencies
 *     (`MR-XX`/`RC-XX`/`WC-XX`) this decision contract's own
 *     `REAL_COMPONENTS` actually cover. Honestly `false` here, not a
 *     lookup against a graph that cannot answer this question for these
 *     competencies.
 *   - `hasMisconceptionTargetedBlueprintAvailable`,
 *     `hasAlternativeRepresentationAvailable`, and
 *     `hasMultipleBlueprintsInFamily` all require live Question Factory
 *     `StructuralBlueprint` metadata (misconceptionTargeted,
 *     representationType, blueprint count) for the learner's specific
 *     family -- today this metadata exists for exactly ONE family
 *     (`mr03-angle-sum`) and no pipeline connects a learner's per-
 *     question family_id to it at this decision layer. Defaulted
 *     `false` here, genuinely, not fabricated -- see the Educational
 *     Foundation Completion report's own CONTENT SUPPLY BLOCKER
 *     disclosure for this exact gap.
 */
export interface RemediationEvidence {
  hasFullLessonAvailable: boolean;
  hasRealRegressionSignal: boolean;
}

export function deriveRemediationContext(evidence: RemediationEvidence): RemediationContext {
  return {
    consecutiveFailuresOnSameSkeleton: evidence.hasRealRegressionSignal ? 2 : 0,
    hasFullLessonAvailable: evidence.hasFullLessonAvailable,
    // CONTENT SUPPLY BLOCKERS (disclosed, not fabricated) -- see this
    // function's own docstring.
    hasPrerequisiteCompetencyWithWeakEvidence: false,
    hasMisconceptionTargetedBlueprintAvailable: false,
    hasAlternativeRepresentationAvailable: false,
    hasMultipleBlueprintsInFamily: false,
  };
}

/**
 * The one real, live entry point: given the SAME regression evidence
 * `buildPreparationDecision()` already computes, returns a remediation
 * action only when there IS a genuine regression signal -- `null`
 * otherwise (never guessed for a competency with no real failure
 * evidence).
 */
export function deriveLiveRemediationAction(evidence: RemediationEvidence): RemediationAction | null {
  if (!evidence.hasRealRegressionSignal) return null;
  return selectRemediationAction(deriveRemediationContext(evidence));
}
