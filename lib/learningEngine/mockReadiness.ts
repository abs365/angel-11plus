import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { RecommendationTrigger } from "@/types/ali/recommendationOrchestration";
import { fetchLearnerIntelligenceProfile } from "./profile";
import { getRecommendations } from "./educationalIntelligenceService";
import { ALL_COMPETENCY_IDS } from "./assessmentBrainMap";
import { getActiveMockForm, getSubmittedMockAttempts } from "@/lib/mockAttempt/client";

/**
 * Increment 3 (Progress + Results + Parent Dashboard) — real defect found
 * and fixed: `mockAttemptCount` previously came from getMockResults()
 * (lib/mockProgress.ts), a legacy localStorage store the real CSSE Mock
 * system (app/learning-intelligence/mock-exam/**) never writes to — its
 * own attempts live in ali_mock_attempt/ali_mock_attempt_report. For a
 * CSSE family this made `mockAttemptCount` structurally always 0,
 * regardless of how many real Mocks their child had actually completed,
 * feeding a wrong count into every one of this module's three real
 * consumers (this file's own computeCsseMockReadiness(), used by the Mock
 * Centre hub; CssePathwayParentContent.tsx's "Are they ready for a mock?"
 * card; and the standalone Mock Readiness page). Fixed once, here, by
 * discovering the same real, active CSSE forms app/mocks/page.tsx already
 * discovers (getActiveMockForm) and counting real submitted attempts
 * against each (getSubmittedMockAttempts) — both pre-existing,
 * already-tested functions, no new RPC, no new table, no scoring/
 * eligibility change.
 */
export async function fetchRealCsseMockAttemptCount(supabase: SupabaseClient<Database>): Promise<number> {
  const forms = await Promise.all([
    getActiveMockForm(supabase, "full_mock", "mathematics"),
    getActiveMockForm(supabase, "timed_section"),
  ]);
  const formIds = forms.map((f) => f.data?.formId).filter((id): id is string => Boolean(id));
  if (formIds.length === 0) return 0;
  const counts = await Promise.all(formIds.map((formId) => getSubmittedMockAttempts(supabase, formId)));
  return counts.reduce((sum, c) => sum + (c.data?.length ?? 0), 0);
}

/**
 * Mock Readiness Intelligence (Sprint 5, WP5C). "Help parents understand
 * whether another mock examination is educationally worthwhile based on
 * the evidence currently available."
 *
 * This is a pure categorical dispatch over already-real, already-computed
 * facts — NOT a new calculation. It performs zero arithmetic, introduces
 * zero new numeric thresholds, and imposes zero calendar/timing rule (no
 * "wait N days since your last mock"). Every input is a boolean or an enum
 * value some other, unmodified function already produced:
 *   - `hasAnyEvidence` — LearnerIntelligenceProfile.hasAnyEvidence (real).
 *   - `mockAttemptCount` — getMockResults().length (real, unchanged).
 *   - `topTriggerReason` — result.ordered[0]?.triggerReason from
 *     getRecommendations() (real; produced by the unmodified Recommendation
 *     Engine's own ranking — this function does not re-rank or re-score
 *     anything, it only reads whether a top candidate exists at all).
 *
 * The three verdicts are a direct expression of the mission's own framing
 * ("recommend the right mock at the right time," not "recommend more
 * mocks") — "practice-first" is expected to be the common outcome given
 * how often getRecommendations() has a real top candidate; "mock-valuable"
 * only fires when there is genuinely nothing more specific to point to.
 */
/**
 * Mock subject-routing P0 correction — a generic "take a mock" CTA never
 * names a subject, so it must never point at /learning-intelligence/
 * mock-exam directly (a full_mock there without ?subject= is ambiguous
 * between Mathematics and English and now fails closed). It routes to the
 * Mock Centre, where the family chooses the paper.
 */
export const MOCK_CENTRE_HREF = "/mocks";

export type MockReadinessVerdict = "practice-first" | "first-mock-valuable" | "mock-valuable";

export interface MockReadinessAssessment {
  verdict: MockReadinessVerdict;
  /** Why — grounded only in the real inputs above, never a prediction of outcome. */
  explanation: string;
  nextAction: { label: string; href: string };
}

export interface MockReadinessInput {
  hasAnyEvidence: boolean;
  mockAttemptCount: number;
  topTriggerReason: RecommendationTrigger | null;
}

export function assessMockReadiness(input: MockReadinessInput): MockReadinessAssessment {
  if (!input.hasAnyEvidence) {
    return {
      verdict: "practice-first",
      explanation:
        "There isn't yet enough recorded evidence for a mock to mean much. Practice first, so a mock has something real to test.",
      nextAction: { label: "See practice areas →", href: "/learning-intelligence/practice" },
    };
  }

  if (input.mockAttemptCount === 0) {
    return {
      verdict: "first-mock-valuable",
      explanation:
        "Your child has real practice evidence but hasn't sat a mock yet. A first mock would add valuable evidence about how that holds up under timed, exam-style conditions.",
      nextAction: { label: "Choose a mock →", href: MOCK_CENTRE_HREF },
    };
  }

  if (input.topTriggerReason !== null) {
    return {
      verdict: "practice-first",
      explanation:
        "There's a specific, known area to work on right now. Targeted practice there is more educationally valuable this week than another broad mock.",
      nextAction: { label: "See This Week's Revision Plan →", href: "/learning-intelligence/parent/revision-planner" },
    };
  }

  return {
    verdict: "mock-valuable",
    explanation:
      "Evidence is reasonably broad and there's no single area needing focused attention right now. A mock would add real, broad evidence under exam conditions.",
    nextAction: { label: "Choose a mock →", href: MOCK_CENTRE_HREF },
  };
}

/**
 * Mock Centre Experience Transformation — the readiness verdict plus the
 * one real input (`hasAnyEvidence`) needed to tell apart the two genuinely
 * different situations `assessMockReadiness()` both label "practice-first"
 * (no evidence at all, vs. evidence exists but a specific gap is known) —
 * both real, both already computed by the unmodified function; this just
 * carries the one extra real fact needed to display them as the Founder's
 * two distinct card states ("Building foundations" / "Keep practising")
 * without adding a fourth verdict to the categorical dispatch itself.
 */
export interface CsseMockReadiness {
  assessment: MockReadinessAssessment;
  hasAnyEvidence: boolean;
}

/**
 * Mock Centre Experience Transformation — the exact fetch-and-compute
 * sequence CssePathwayParentContent.tsx already performs inline (real
 * Learning Engine profile, real Recommendation Engine, real mock history),
 * extracted here so the Mock Centre can surface the same real readiness
 * verdict without a second, competing implementation. Returns null for a
 * non-CSSE pathway or when no client/profile is available — the Mock
 * Centre must render no readiness card at all in that case, never a
 * fabricated one (MOCK_READINESS_CAPABILITY_ASSESSMENT.md).
 */
export async function computeCsseMockReadiness(
  supabase: SupabaseClient<Database>,
  pathwayId: string | undefined
): Promise<CsseMockReadiness | null> {
  if (pathwayId !== "csse") return null;

  const profile = await fetchLearnerIntelligenceProfile(pathwayId);
  if (!profile || !profile.pathwayEligible) return null;

  const [recommendations, mockAttemptCount] = await Promise.all([
    getRecommendations(supabase, profile.profileId, ALL_COMPETENCY_IDS).catch(() => null),
    fetchRealCsseMockAttemptCount(supabase).catch(() => 0),
  ]);

  const topTriggerReason = recommendations?.ordered[0]?.triggerReason ?? null;

  const assessment = assessMockReadiness({
    hasAnyEvidence: profile.hasAnyEvidence,
    mockAttemptCount,
    topTriggerReason,
  });

  return { assessment, hasAnyEvidence: profile.hasAnyEvidence };
}
