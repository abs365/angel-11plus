import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { AssessmentComponent, CompetencyId } from "./types";
import { getRecommendations } from "./educationalIntelligenceService";
import { COMPETENCIES, ALL_COMPETENCY_IDS, COMPONENT_SUBJECT } from "./assessmentBrainMap";
import { PRACTICE_AREAS, type PracticeAreaId } from "./practiceContent";
import { generateExplanation } from "@/lib/ali/explainability";
import { getTargetExamDate } from "@/lib/progress";

/**
 * Revision Planner (Sprint 4, ANGEL-CSSE-002A, Parent Intelligence,
 * Deliverable 4 — prioritised weekly focus + time guidance + educational
 * reasoning). Cross-subject, unlike lib/learningEngine/sessionGenerator.ts's
 * per-area generatePersonalisedSession() — reuses the same real, ranked,
 * explainable getRecommendations() across every CSSE competency at once,
 * per Permanent Programme Principle "No feature may bypass the Educational
 * Intelligence Engine."
 */

/** Disclosed cap, matching sessionGenerator.ts's REVIEW_SLOT_CAP precedent — a weekly focus list, not the full competency set. */
const PLAN_ITEM_CAP = 5;

/**
 * Per-component minutes for a SINGLE revision item (not a full exam paper),
 * derived from ASSESSMENT_BRAIN_V1.md §2's real per-component exam timings
 * — Comprehension 30 min / ~10 questions, Applied Reasoning 10 min,
 * Continuous Writing 20 min (one full response), Mathematics 60 min / ~20
 * questions — scaled down to one item, not invented. First-pass, disclosed
 * estimate, same category of judgement call as practiceContent.ts's
 * WRITING_CORRECTNESS_THRESHOLD.
 */
const COMPONENT_REVISION_MINUTES: Record<AssessmentComponent, number> = {
  "English Comprehension": 10,
  "Applied Reasoning": 10,
  "Continuous Writing": 20,
  Mathematics: 10,
};

/**
 * Founder Review Gate fix (Quick Win #5) — resolves an AssessmentComponent
 * to the matching Practice area, reusing the two already-real maps
 * (COMPONENT_SUBJECT, PRACTICE_AREAS) rather than a new hardcoded table.
 * Undefined only if a component has no matching practice area (none do
 * today, but never assumed). Exported (Sprint 4 Completion Package, WP4D)
 * for reuse by RecommendationExplanation/RecommendationSummary's own
 * "Start this now" links — one resolver, not three copies.
 */
export function practiceAreaForComponent(component: AssessmentComponent): PracticeAreaId | undefined {
  const subject = COMPONENT_SUBJECT[component];
  return PRACTICE_AREAS.find((area) => area.subject === subject)?.id;
}

export interface RevisionPlanItem {
  competencyId: CompetencyId;
  label: string;
  component: AssessmentComponent;
  estimatedMinutes: number;
  /** Learner-facing reason (lib/ali/explainability.ts's "learner" audience). */
  learnerReason: string;
  /** Parent-facing reason ("parent" audience) — plain English, no jargon, no raw codes. */
  parentReason: string;
  /** Practice area to start now for this item, if one exists. */
  practiceAreaId?: PracticeAreaId;
}

export interface RevisionPlan {
  items: RevisionPlanItem[];
  totalMinutes: number;
}

function daysUntilFromTargetExamDate(now: Date): number | null {
  const targetIso = getTargetExamDate();
  if (!targetIso) return null;
  return Math.round((new Date(targetIso).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export async function generateRevisionPlan(
  supabase: SupabaseClient<Database>,
  profileId: string,
  now: Date = new Date()
): Promise<RevisionPlan> {
  const daysUntilExam = daysUntilFromTargetExamDate(now);
  const result = await getRecommendations(supabase, profileId, ALL_COMPETENCY_IDS, now, daysUntilExam);

  const items: RevisionPlanItem[] = result.ordered.slice(0, PLAN_ITEM_CAP).map((candidate) => {
    const competencyId = candidate.competencyCode as CompetencyId;
    const component = COMPETENCIES[competencyId].component;
    return {
      competencyId,
      label: COMPETENCIES[competencyId].name,
      component,
      estimatedMinutes: COMPONENT_REVISION_MINUTES[component],
      learnerReason: generateExplanation(candidate, "learner").text,
      parentReason: generateExplanation(candidate, "parent").text,
      practiceAreaId: practiceAreaForComponent(component),
    };
  });

  return {
    items,
    totalMinutes: items.reduce((sum, item) => sum + item.estimatedMinutes, 0),
  };
}
