import type { EducationalState } from "@/types/ali/educationalState";

/**
 * Educational Supply & Progression Integration Gate — Teaching State.
 *
 * The Founder's own brief named eight teaching stages explicitly
 * (explicit teaching, worked example, guided practice, scaffolded
 * practice, independent practice, transfer, mastery check,
 * maintenance/retrieval) and asked for a deterministic architecture
 * distinguishing them. Every ingredient this needs ALREADY EXISTS,
 * scattered across separately-evidenced modules that were never unified
 * under one named state:
 *
 *   - `lib/ali/educationalState.ts`'s 8-state model (exploring ->
 *     building-knowledge -> practising -> reinforcing -> mastered ->
 *     durably-mastered -> reviewing -> rebuilding) is the real evidence
 *     signal this module reads, never recomputed.
 *   - `lib/learningEngine/fullLessonRegistry.ts`'s `hasFullLessonAvailable`
 *     is the real signal for whether EXPLICIT_TEACHING/WORKED_EXAMPLE
 *     content exists for a competency at all.
 *   - `lib/ali/mastery.ts`'s `supportTier` ("independent" | "supported")
 *     is the real signal already distinguishing support-assisted from
 *     independent success.
 *   - `lib/ali/durableMastery.ts`'s `isMaintenanceReviewDue` is the real
 *     signal for MAINTENANCE_RETRIEVAL.
 *
 * This module does not replace, recompute, or wrap any of the above. It
 * adds exactly one new thing none of them provides: a single deterministic
 * mapping from that existing evidence onto ONE of the Founder's eight
 * named states, so Question Factory content (see
 * `lib/ali/questionFactory/types.ts`'s `TeachingUse`) and a future
 * teaching UI have one shared vocabulary to target. `deriveTeachingState`
 * is a pure function over primitive/already-computed inputs -- it is
 * deliberately NOT wired into `sessionGenerator.ts` or `selection.ts`
 * this increment (per the Founder's own "do not rewrite the
 * recommendation engine unnecessarily" instruction). This is the
 * integration CONTRACT; wiring it into live selection is follow-on work.
 */

export type TeachingState =
  | "explicit_teaching"
  | "worked_example"
  | "guided_practice"
  | "scaffolded_practice"
  | "independent_practice"
  | "transfer"
  | "mastery_check"
  | "maintenance_retrieval";

/** Assessment modes never receive a TeachingState at all -- see isTeachingAssistancePermitted below. */
export type LearnerActivityMode = "practice" | "placement" | "mock_attempt";

export interface TeachingStateContext {
  educationalState: EducationalState;
  /** From `fullLessonRegistry.ts`'s hasFullLessonAvailable() -- real content availability, never assumed. */
  hasFullLessonAvailable: boolean;
  /** True only when the learner has never attempted this competency before (no question history rows). */
  isFirstEncounterEver: boolean;
  /** From the most recent attempt's `ali_mastery.ts` supportTier, or null if no attempt yet exists. */
  lastAttemptSupportTier: "independent" | "supported" | null;
  /** From `durableMastery.ts`'s isMaintenanceReviewDue() against the competency's last_presented_at. */
  maintenanceReviewDue: boolean;
}

/**
 * Deterministic: the same context always produces the same state. Ordered
 * as a priority ladder (retrieval/maintenance and mastery-check checks
 * first, since they can apply to an otherwise-mastered competency that
 * would otherwise fall through to independent_practice) -- never a
 * probabilistic or AI-judged classification.
 */
export function deriveTeachingState(context: TeachingStateContext): TeachingState {
  const { educationalState, hasFullLessonAvailable, isFirstEncounterEver, lastAttemptSupportTier, maintenanceReviewDue } = context;

  // A durably-mastered or mastered competency due for a spaced-retrieval
  // check takes priority over every other signal -- this is exactly the
  // "revisit after time has passed to test retention" state, and it must
  // never be silently reclassified as independent_practice merely because
  // the evidence otherwise looks strong.
  if (maintenanceReviewDue && (educationalState === "mastered" || educationalState === "durably-mastered" || educationalState === "reviewing")) {
    return "maintenance_retrieval";
  }

  // Rebuilding (a real regression -- mastery just reversed) always routes
  // back to explicit teaching, regardless of prior history, matching
  // preparationStage.ts's own "a real regression forces teaching,
  // overriding an otherwise-strong distribution" precedent exactly.
  if (educationalState === "rebuilding") {
    return hasFullLessonAvailable ? "explicit_teaching" : "guided_practice";
  }

  if (educationalState === "exploring" && isFirstEncounterEver) {
    return hasFullLessonAvailable ? "explicit_teaching" : "worked_example";
  }

  if (educationalState === "exploring" || educationalState === "building-knowledge") {
    // A prior attempt existed but needed heavy support -- the learner has
    // seen a worked example already (or none exists); guided practice is
    // the correct next step either way.
    return lastAttemptSupportTier === "supported" ? "guided_practice" : "worked_example";
  }

  if (educationalState === "practising") {
    return "scaffolded_practice";
  }

  if (educationalState === "reinforcing") {
    return "independent_practice";
  }

  if (educationalState === "mastered" || educationalState === "durably-mastered") {
    // Independent success already demonstrated -- the next genuine
    // educational demand is transfer (a different structure/context),
    // not more of the same practice, per the Founder's own "familiar
    // skills, unfamiliar problems" principle.
    return "transfer";
  }

  // "reviewing" without a maintenance review yet due: the competency is
  // provisionally settled but not yet independently re-confirmed --
  // mastery_check is the correct demand (evidence that it can be
  // completed independently and reliably), not more open-ended practice.
  return "mastery_check";
}

/**
 * The Founder's Section 11/25 requirement, stated as an explicit,
 * reusable contract: "during a genuine mock attempt: NO hints, teaching,
 * worked examples, remediation, answer explanations, mastery prompts."
 *
 * This is intentionally a SECOND, independent layer on top of the real,
 * already-existing enforcement: `mock_get_question()` (migration 070) is
 * a SECURITY DEFINER function whose return payload is a hand-picked
 * field allow-list that structurally cannot include hint/explanation
 * content -- that DB-level firewall is the actual production guarantee,
 * unmodified by this function. This pure, application-layer contract
 * exists so that any FUTURE teaching-state-aware UI code has one
 * explicit, testable place to check "is teaching assistance allowed
 * right now" without re-deriving mock-detection logic ad hoc -- defence
 * in depth, never a replacement for the DB gate.
 */
export function isTeachingAssistancePermitted(mode: LearnerActivityMode): boolean {
  return mode !== "mock_attempt";
}
