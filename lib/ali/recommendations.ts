import type { AliCompetencySignal } from "@/types/ali/missionSignal";
import type { CompetencyRelationship, CrossSubjectRecommendation } from "@/types/ali/recommendations";
import { competencyLabel } from "./labels";

/**
 * The cross-subject competency relationship graph (ALI_CROSS_SUBJECT_
 * INTELLIGENCE.md §1.2/§1.3) — small, hand-authored, grounded only in
 * competency codes that actually exist in this codebase today. Not mined
 * from usage correlation (ALI_RECOMMENDATION_ENGINE.md §1).
 *
 * Only 3 of these 5 edges can ever fire (§below) — the other 2 are
 * documented, honest placeholders: one points at a subject (`numerical-
 * reasoning`) with zero ALI competency data (dormant until that subject is
 * ALI-covered), one is deliberately `weak` strength (a real but low-
 * confidence link, per the original design's own honesty about not every
 * relationship deserving equal trust).
 */
export const COMPETENCY_RELATIONSHIPS: CompetencyRelationship[] = [
  {
    fromCompetency: "vocabulary.synonyms",
    toCompetency: "vr.synonyms",
    toSubject: "verbal-reasoning",
    relationshipType: "shared-mechanism",
    strength: "strong",
    rationale: "Both test the same underlying skill — recognising close word-meaning relationships — just via different formats (MCQ word-pair vs. flashcard-style word).",
  },
  {
    fromCompetency: "vocabulary.antonyms",
    toCompetency: "vr.antonyms",
    toSubject: "verbal-reasoning",
    relationshipType: "shared-mechanism",
    strength: "strong",
    rationale: "Same relationship as above, for opposite-meaning recognition.",
  },
  {
    fromCompetency: "vocabulary.in-context",
    toCompetency: "english.vocabulary-in-context",
    toSubject: "english",
    relationshipType: "shared-mechanism",
    strength: "strong",
    rationale: "Both test recognising a word's correct meaning/usage — Vocabulary via a standalone sentence, English via a passage — the underlying skill (contextual word comprehension) is the same.",
  },
  {
    fromCompetency: "maths.fractions",
    toCompetency: "numerical-reasoning.fractions",
    toSubject: "numerical-reasoning",
    relationshipType: "shared-mechanism",
    strength: "moderate",
    rationale: "Real curriculum relationship (both require proportional reasoning) but numerical-reasoning has no ALI competency taxonomy or question bank yet — this edge is dormant (cannot fire, §below) until that subject is ALI-covered. Kept in the graph now so it's ready the moment it is, per the expansion strategy already documented in ALI_CROSS_SUBJECT_INTELLIGENCE.md §5.",
  },
  {
    fromCompetency: "vr.sequences",
    toCompetency: "english.inference",
    toSubject: "english",
    relationshipType: "shared-mechanism",
    strength: "weak",
    rationale: "Both draw on multi-step logical pattern-recognition, but the domains (abstract letter/number sequences vs. narrative inference) are different enough that this should be a low-confidence link, not a strong one — deliberately weak so it never fires a live recommendation (§below), flagged here explicitly so it isn't mistaken for an oversight.",
  },
  {
    fromCompetency: "english.vocabulary-in-context",
    toCompetency: "vocabulary.in-context",
    toSubject: "vocabulary",
    relationshipType: "sequential-dependency",
    strength: "strong",
    rationale: "A student weak at recognising word meaning within a passage may benefit from focused, standalone word-in-context practice as a prerequisite-building activity — the reverse direction from the shared-mechanism edges above, and the one live example of the 'moderate confidence, weak source' recommendation tier.",
  },
];

/**
 * Computes conservative, supplementary cross-subject recommendations from
 * whatever real ALI competency signals already exist (UserProgress.
 * aliCompetencySignal) — no new Supabase reads, no new stored data. Pure,
 * no I/O.
 *
 * Confidence tiers (ALI_RECOMMENDATION_ENGINE.md §2):
 *   - "high" — a `strong` shared-mechanism edge, fired only when the SOURCE
 *     competency is genuinely `mastered` (real evidence-based mastery,
 *     lib/ali/mastery.ts — not a single lucky attempt).
 *   - "moderate" — a `sequential-dependency` edge, fired only when the
 *     source competency is `weak` (suggesting a possible prerequisite gap,
 *     never asserting the target competency itself is weak).
 *   - `weak`-strength edges NEVER fire, regardless of source state — kept
 *     in the graph for completeness/future calibration only (§ moderate-
 *     strength shared-mechanism edges also never fire under current rules,
 *     for the same reason: conservative by design, not by omission).
 *
 * Safety rule, enforced structurally (not just documented): a recommendation
 * for a target competency is only ever generated if that competency has NO
 * direct evidence yet (`!attemptedCompetencies.includes(target)`) in its own
 * subject's signal. Direct evidence — even a `weak` direct signal — always
 * wins; this function cannot override or rank above it, because it never
 * produces output for a competency direct evidence already covers.
 *
 * Fallback behaviour: no qualifying edge -> empty array. Silence is the
 * safe default — this function never forces a recommendation to appear.
 */
export function computeCrossSubjectRecommendations(
  signals: Partial<Record<string, AliCompetencySignal>>,
  relationships: CompetencyRelationship[] = COMPETENCY_RELATIONSHIPS
): CrossSubjectRecommendation[] {
  const recommendations: CrossSubjectRecommendation[] = [];

  for (const edge of relationships) {
    if (edge.strength !== "strong" && edge.relationshipType === "shared-mechanism") continue;
    if (edge.strength === "weak") continue;

    const targetSignal = signals[edge.toSubject];
    if (targetSignal?.attemptedCompetencies.includes(edge.toCompetency)) continue; // Rule: direct evidence always wins

    let sourceSubject: string | undefined;
    let sourceState: "mastered" | "weak" | undefined;
    for (const [subject, signal] of Object.entries(signals)) {
      if (!signal) continue;
      if (signal.masteredCompetencies.includes(edge.fromCompetency)) {
        sourceSubject = subject;
        sourceState = "mastered";
        break;
      }
      if (!sourceState && signal.weakCompetencies.includes(edge.fromCompetency)) {
        sourceSubject = subject;
        sourceState = "weak";
      }
    }
    if (!sourceSubject || !sourceState) continue;

    if (edge.relationshipType === "shared-mechanism" && edge.strength === "strong" && sourceState === "mastered") {
      recommendations.push({
        targetCompetency: edge.toCompetency,
        targetSubject: edge.toSubject,
        sourceCompetency: edge.fromCompetency,
        sourceSubject,
        relationshipType: edge.relationshipType,
        confidence: "high",
        reason: `Mastering ${competencyLabel(edge.fromCompetency)} suggests real readiness to try ${competencyLabel(edge.toCompetency)} — worth exploring.`,
      });
    } else if (edge.relationshipType === "sequential-dependency" && sourceState === "weak") {
      recommendations.push({
        targetCompetency: edge.toCompetency,
        targetSubject: edge.toSubject,
        sourceCompetency: edge.fromCompetency,
        sourceSubject,
        relationshipType: edge.relationshipType,
        confidence: "moderate",
        reason: `Building ${competencyLabel(edge.fromCompetency)} may help with ${competencyLabel(edge.toCompetency)} — this is a suggestion, not a diagnosis of that competency itself.`,
      });
    }
  }

  return recommendations;
}
