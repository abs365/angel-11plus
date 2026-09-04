import type { CompetencyId } from "@/lib/learningEngine/types";

/**
 * Programme Increment 020, Part 10 — Visual Education Matrix, completed
 * for all 6 Mathematics competencies (Increment 019 deferred this).
 *
 * A real implementation-planning asset, not competitor imitation: each
 * classification is the honest answer to "would a diagram/interaction/
 * video change whether this competency's questions can be fairly and
 * clearly posed," not a decorative-media checklist. Every classification
 * below is disclosed reasoning, the same "provisional judgement call"
 * discipline this programme already applies to its numeric thresholds
 * (see lib/learningEngine/preparationStage.ts's own docstring) — not
 * derived from an external standard.
 */

export type VisualNeed =
  | "text_sufficient"
  | "visual_useful"
  | "visual_required"
  | "interactive_useful"
  | "short_video_may_help";

export interface VisualEducationAssessment {
  competencyId: CompetencyId;
  primaryClassification: VisualNeed;
  /** Secondary classifications this competency also genuinely qualifies for, beyond the primary one -- e.g. a competency can be VISUAL_REQUIRED and INTERACTIVE_USEFUL at once. Never inflated merely to look thorough. */
  alsoApplies: VisualNeed[];
  reason: string;
}

export const MATHEMATICS_VISUAL_EDUCATION_MATRIX: VisualEducationAssessment[] = [
  {
    competencyId: "MR-01",
    primaryClassification: "text_sufficient",
    alsoApplies: [],
    reason:
      "Arithmetic procedure (the four operations, place value) is abstract and numeric by nature. The existing Lesson 001 (arithmetic/page.tsx) already teaches it well with worked-example text alone; no real question in this family is under-specified without a diagram.",
  },
  {
    competencyId: "MR-02",
    primaryClassification: "visual_useful",
    alsoApplies: [],
    reason:
      "Sequences (mr02-nth-term, mr02-sequence-rule) can be shown as a real number pattern, and simple equations can be shown as a bar/balance model -- genuinely clarifying, but every existing item is already fairly answerable from stated numbers/rules alone, so this is USEFUL, not REQUIRED.",
  },
  {
    competencyId: "MR-03",
    primaryClassification: "visual_required",
    alsoApplies: ["interactive_useful"],
    reason:
      "The one competency where a diagram is not optional: a compound/rectilinear shape, a coordinate transformation, or an angle configuration cannot be fairly posed in text alone without forcing the learner to construct their own mental diagram from a dimension list -- a genuine fairness and clarity problem, not a preference. Confirmed against this program's own audit finding that zero diagrams exist anywhere in Mathematics content today. An interactive shape-builder/protractor would help further but is out of scope for Wave 1 -- no interactive-content framework exists in this codebase yet, and building one merely to check a box is exactly what Part 11 forbids.",
  },
  {
    competencyId: "MR-04",
    primaryClassification: "text_sufficient",
    alsoApplies: ["visual_useful"],
    reason:
      "Multi-step word-problem reasoning is primarily a reading/sequencing skill, not a visual one -- the existing Lesson 002 (percentages) teaches it well in text. VISUAL_USEFUL applies only to the subset of items that embed a genuine real-world dataset (already served by the existing MockTableStimulus data-table mechanism, lib/mockAttempt/types.ts -- not a new need this matrix introduces).",
  },
  {
    competencyId: "MR-05",
    primaryClassification: "text_sufficient",
    alsoApplies: [],
    reason:
      "Number properties (factors, multiples, primes, squares) are abstract numeric relationships. A factor tree could illustrate one method, but the CSSE-relevant skill is recognising and applying the property directly, not the tree itself -- not required for fairness.",
  },
  {
    competencyId: "MR-06",
    primaryClassification: "text_sufficient",
    alsoApplies: [],
    reason:
      "Precision Under Exact-Match Conditions is explicitly a cross-cutting response-format discipline (CSSE_COMPETENCY_TOPIC_MAPPING.md: \"applies across every topic above rather than being its own content area\"), not a topic with visual content of its own -- there is no diagram that would change whether an exact-match instruction is followed.",
  },
];

export function getVisualEducationAssessment(competencyId: CompetencyId): VisualEducationAssessment | undefined {
  return MATHEMATICS_VISUAL_EDUCATION_MATRIX.find((a) => a.competencyId === competencyId);
}
