import type {
  RecommendationCandidate,
  OrchestrationInput,
} from "@/types/ali/recommendationOrchestration";

/**
 * Work Package WP-09 (Implementation Programme) — Recommendation
 * Orchestration and Prioritisation. Implements EAW-004 §4-§5's Tier 0-3
 * structure as a pure function over already-classified candidates —
 * consistent with the Derived State Hierarchy (APD-025), it consumes each
 * candidate's Educational State (WP-08) rather than recomputing anything.
 *
 * This function does not generate candidates (that remains the existing,
 * unmodified ALI selection mechanism, EAW-002 §4) — it orders a candidate
 * set that has already been generated and Pathway-filtered (WP-04's Stage
 * 0, upstream of this function entirely).
 */

/**
 * Calibration provenance (APD-017/APD-022): the exam-proximity reweighting
 * window is a provisional structural threshold, not the calibrated curve
 * EAW-004 §4-§5 describes and CALIBRATION_TRACEABILITY_REGISTER.md
 * explicitly gates on real target_exam_date usage data existing first.
 * This constant only turns Tier 3 reweighting on/off; it does not attempt
 * the graduated curve — that remains out of scope until real data exists,
 * per the register's own stated review trigger.
 */
const EXAM_PROXIMITY_WINDOW_DAYS = 60;

const STATE_RANK: Record<string, number> = {
  rebuilding: 0,
  practising: 1,
  "building-knowledge": 2,
  reinforcing: 3,
  reviewing: 4,
  exploring: 5,
  mastered: 6,
  "durably-mastered": 7,
};

const STRENGTH_RANK: Record<string, number> = { strong: 0, moderate: 1 };

export function orchestrateRecommendations(
  input: OrchestrationInput
): RecommendationCandidate[] {
  const { candidates, wellbeingVeto, daysUntilExam } = input;

  // Tier 0 — absolute veto, applied before anything else. No candidate
  // vetoed here is ever considered by any later tier, per EAW-004 §5.
  const survivors = candidates.filter((c) => !wellbeingVeto(c));

  // Tier 1 — direct evidence, always claims priority first, unchanged
  // ordering guarantee from the existing ALI selection mechanism.
  const tier1 = survivors
    .filter((c) => c.basis === "direct-evidence")
    .sort((a, b) => (STATE_RANK[a.educationalState] ?? 99) - (STATE_RANK[b.educationalState] ?? 99));

  // Tier 2 — supplementary, evidence-ranked, fills only competencies Tier 1
  // hasn't already claimed. Weak-strength relationship edges never fire
  // (AEP-002 §10.4's existing, unmodified rule) — excluded entirely, not
  // merely deprioritised.
  const tier1Competencies = new Set(tier1.map((c) => c.competencyCode));
  const tier2 = survivors
    .filter(
      (c) =>
        c.basis !== "direct-evidence" &&
        c.relationshipStrength !== "weak" &&
        !tier1Competencies.has(c.competencyCode)
    )
    .sort((a, b) => (STRENGTH_RANK[a.relationshipStrength ?? "moderate"] ?? 9) - (STRENGTH_RANK[b.relationshipStrength ?? "moderate"] ?? 9));

  let ordered = [...tier1, ...tier2];

  // Tier 3 — exam-proximity reweighting. Only activates when a target exam
  // date is actually set (daysUntilExam !== null) AND that date falls
  // within the reweighting window — per EAW-004 §2.1, absence must never
  // degrade or block Tiers 0-2's ordering, only optionally add to it.
  if (daysUntilExam !== null && daysUntilExam <= EXAM_PROXIMITY_WINDOW_DAYS) {
    ordered = reweightForExamProximity(ordered);
  }

  return ordered;
}

/**
 * Stable reweighting: format-matching candidates move ahead of non-
 * matching ones WITHIN their existing tier only — Tier 1 candidates never
 * move behind a Tier 2 candidate because of this, and vice versa,
 * preserving the Tier 0-2 ordering guarantee this function's own docstring
 * promises. Candidates with `matchesExamFormat === undefined` (the
 * real-world default today, since no consumer populates this field yet)
 * are treated as non-matching for ordering purposes only — never excluded,
 * never penalised beyond a stable sort position.
 */
function reweightForExamProximity(
  ordered: RecommendationCandidate[]
): RecommendationCandidate[] {
  const tier1 = ordered.filter((c) => c.basis === "direct-evidence");
  const tier2 = ordered.filter((c) => c.basis !== "direct-evidence");

  const byFormatMatch = (list: RecommendationCandidate[]) => [
    ...list.filter((c) => c.matchesExamFormat === true),
    ...list.filter((c) => c.matchesExamFormat !== true),
  ];

  return [...byFormatMatch(tier1), ...byFormatMatch(tier2)];
}
