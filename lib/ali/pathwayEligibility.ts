import type { SubjectKey } from "@/types/analytics";
import { PATHWAYS } from "@/lib/pathways";

/**
 * Pathway Eligibility Filter — Work Package WP-04 (Implementation Programme).
 *
 * Implements the mandatory Stage 0 filter specified in
 * EAW-002_LEARNING_INTELLIGENCE_ENGINE_ARCHITECTURE.md §4 (post-hotfix
 * EAW-D002): every recommendation candidate must be confirmed eligible for
 * the learner's selected pathway BEFORE candidate generation, not filtered
 * or de-prioritised afterward. This closes AEP-002_KNOWLEDGE_FRAMEWORK.md
 * Real Gap #5 — a CSSE-pathway learner must never be recommended Verbal
 * Reasoning, Non-Verbal Reasoning, Spatial Reasoning, or Mathematical
 * Reasoning content, because CSSE tests none of them.
 *
 * Grounded in this app's own existing `lib/pathways.ts` PATHWAYS data
 * (each pathway's `subjects` field, already reviewed product content) —
 * not re-derived from AEP-002 alone. One interpretive addition beyond a
 * literal reading of that data: CEM's eligible set includes
 * "non-verbal-reasoning" even though PATHWAYS' cem.subjects only lists
 * "Verbal Reasoning" — because AEP-002_KNOWLEDGE_FRAMEWORK.md §6 (public-
 * record research) establishes that CEM's own "Numerical Reasoning" paper
 * combines Maths and Non-Verbal Reasoning. Flagged here, not silently
 * assumed.
 */
const PATHWAY_SUBJECT_KEYS: Record<string, SubjectKey[]> = {
  gl: ["english", "maths", "verbal-reasoning", "non-verbal-reasoning"],
  cem: ["english", "maths", "verbal-reasoning", "non-verbal-reasoning", "numerical-reasoning"],
  csse: ["english", "writing", "maths", "vocabulary"],
  iseb: ["english", "maths", "verbal-reasoning", "non-verbal-reasoning"],
  independent: ["english", "maths", "writing"],
  "core-foundation": [
    "english",
    "maths",
    "vocabulary",
    "writing",
    "verbal-reasoning",
    "non-verbal-reasoning",
    "spatial-reasoning",
    "numerical-reasoning",
  ],
  "not-sure": ["english", "maths", "vocabulary", "writing"],
};

const ALL_SUBJECT_KEYS: SubjectKey[] = [
  "english",
  "maths",
  "vocabulary",
  "writing",
  "verbal-reasoning",
  "non-verbal-reasoning",
  "spatial-reasoning",
  "numerical-reasoning",
];

/**
 * Returns the set of SubjectKey values eligible for recommendation under a
 * given pathway. Falls back to every known subject (unfiltered — current,
 * pre-Stage-0 behaviour) when the pathway is undefined or unrecognised, per
 * AEP-004_LEARNING_JOURNEY_FRAMEWORK.md §3: a family who hasn't chosen a
 * pathway yet must never be blocked from practising, only filtered once a
 * real choice exists. `mock-test` is deliberately excluded from this
 * mapping entirely — it is not pathway-gated content, it is handled by its
 * own separate logic in buildDailyMission().
 */
export function getEligibleSubjectKeys(pathwayId: string | undefined): Set<SubjectKey> {
  if (!pathwayId) return new Set(ALL_SUBJECT_KEYS);

  const known = PATHWAY_SUBJECT_KEYS[pathwayId];
  if (!known) {
    // Defensive fallback for an unrecognised id (e.g. a future pathway not
    // yet added to this mapping) — never silently exclude everything.
    return new Set(ALL_SUBJECT_KEYS);
  }

  return new Set(known);
}

/** Exposed for verification/testing — confirms PATHWAY_SUBJECT_KEYS covers every real pathway in lib/pathways.ts. */
export function getKnownPathwayIds(): string[] {
  return PATHWAYS.map((p) => p.id);
}
