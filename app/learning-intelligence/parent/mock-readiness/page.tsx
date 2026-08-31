"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Info } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { getSelectedPathwayId } from "@/lib/progress";
import { getSupabaseClient } from "@/lib/supabase";
import { getMockResults } from "@/lib/mockProgress";
import { fetchLearnerIntelligenceProfile } from "@/lib/learningEngine/profile";
import { getRecommendations } from "@/lib/learningEngine/educationalIntelligenceService";
import { ALL_COMPETENCY_IDS } from "@/lib/learningEngine/assessmentBrainMap";
import { assessMockReadiness, type MockReadinessAssessment } from "@/lib/learningEngine/mockReadiness";
import { ReadinessSummary } from "@/components/learningEngine/ReadinessSummary";
import { EvidenceProfile } from "@/components/learningEngine/EvidenceProfile";
import { HistoricalContextPanel } from "@/components/parent/HistoricalContextPanel";
import type { LearnerIntelligenceProfile } from "@/lib/learningEngine/types";
import type { MockResult } from "@/types/mock";
import type { RecommendationTrigger } from "@/types/ali/recommendationOrchestration";

/**
 * Mock Readiness Intelligence (Sprint 5, WP5C). Built exactly against this
 * sprint's mission — "help parents understand whether another mock is
 * educationally worthwhile," never "recommend more mocks." Every section
 * reuses already-real, already-computed data (ReadinessSummary,
 * EvidenceProfile, getRecommendations(), getMockResults()); the one new
 * piece, assessMockReadiness(), is a pure categorical read of that data —
 * no new calculation, no prediction, no calendar/timing rule.
 *
 * Five clearly separated sections (WP5C's original four, plus WP5E's
 * Historical Context, applied here consistently with Admissions Readiness):
 *   1. Current Educational Evidence — EvidenceProfile, unchanged.
 *   2. Readiness — ReadinessSummary, unchanged.
 *   3. Educational Value of Another Mock — the assessment + real mock
 *      history facts (count, most recent date) shown as facts, not a rule.
 *   4. Historical Context — HistoricalContextPanel, unchanged from
 *      Admissions Readiness (WP5E) — CSSE's own real fact, never blended
 *      with 3's interpretation of this child's own evidence.
 *   5. Recommended Next Action — exactly one primary CTA (WP4D discipline),
 *      matching whichever real conclusion the assessment reached.
 */
export default function MockReadinessPage() {
  const [pathwayEligible, setPathwayEligible] = useState<boolean | undefined>(undefined);
  const [profile, setProfile] = useState<LearnerIntelligenceProfile | null | undefined>(undefined);
  const [topTriggerReason, setTopTriggerReason] = useState<RecommendationTrigger | null | undefined>(undefined);
  const [mockResults, setMockResults] = useState<MockResult[]>([]);

  useEffect(() => {
    const pathwayId = getSelectedPathwayId();
    const eligible = pathwayId === "csse";
    setPathwayEligible(eligible);
    if (!eligible) return;

    getMockResults().then(setMockResults);

    fetchLearnerIntelligenceProfile(pathwayId ?? undefined)
      .then((p) => {
        setProfile(p);
        const supabase = getSupabaseClient();
        if (p?.pathwayEligible && supabase) {
          getRecommendations(supabase, p.profileId, ALL_COMPETENCY_IDS)
            .then((result) => setTopTriggerReason(result.ordered[0]?.triggerReason ?? null))
            .catch(() => setTopTriggerReason(null));
        }
      })
      .catch(() => setProfile(null));
  }, []);

  const loaded = profile !== undefined && topTriggerReason !== undefined;

  const assessment: MockReadinessAssessment | undefined =
    loaded && profile
      ? assessMockReadiness({
          hasAnyEvidence: profile.hasAnyEvidence,
          mockAttemptCount: mockResults.length,
          topTriggerReason: topTriggerReason ?? null,
        })
      : undefined;

  const mostRecentMock = mockResults.length > 0 ? mockResults[mockResults.length - 1] : null;

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Learning Report", href: "/learning-intelligence" },
        { label: "Parent Dashboard", href: "/learning-intelligence/parent" },
        { label: "Admissions Readiness", href: "/learning-intelligence/parent/admissions-readiness" },
        { label: "Mock Readiness" },
      ]}
    >
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <div className="flex items-center gap-3 mb-2">
          <div>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Mock Readiness</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Is another mock exam worthwhile right now?</p>
          </div>
        </div>

        {pathwayEligible === false && (
          <InfoCard className="mt-6 flex items-start gap-3">
            <MapPin size={18} className="text-blue-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">Available for the CSSE pathway only.</p>
          </InfoCard>
        )}

        {pathwayEligible && !loaded && <p className="text-sm text-gray-400 dark:text-gray-500 mt-6" aria-live="polite">Loading…</p>}

        {pathwayEligible && loaded && !profile && (
          <InfoCard className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">This page isn&apos;t available right now.</p>
          </InfoCard>
        )}

        {pathwayEligible && profile && !profile.pathwayEligible && (
          <InfoCard className="mt-6 flex items-start gap-3">
            <MapPin size={18} className="text-blue-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              This section is built entirely from CSSE&apos;s own official exam evidence.
            </p>
          </InfoCard>
        )}

        {pathwayEligible && profile && profile.pathwayEligible && assessment && (
          <div className="space-y-8 mt-6">
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-1">Current Educational Evidence</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">What&apos;s been recorded so far, area by area.</p>
              <EvidenceProfile competencies={profile.competencies} />
            </section>

            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-1">Readiness</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">How well-evidenced each part of the exam is right now.</p>
              <ReadinessSummary readiness={profile.readiness} />
            </section>

            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-1">Educational Value of Another Mock</h2>
              <InfoCard className="flex items-start gap-3">
                <Info size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{assessment.explanation}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
                    {mostRecentMock
                      ? `${mockResults.length} mock${mockResults.length === 1 ? "" : "s"} attempted so far, most recently on ${new Date(mostRecentMock.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}.`
                      : "No mocks attempted yet."}
                  </p>
                </div>
              </InfoCard>
            </section>

            {/* WP5E — Historical Context, reused unchanged from Admissions
                Readiness. Its own section, never merged with "Educational
                Value of Another Mock" above — that's real educational
                interpretation of this child's evidence; this is one
                external fact about CSSE itself. Kept visually and
                conceptually independent, per this sprint's explicit rule. */}
            <HistoricalContextPanel />

            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Recommended Next Action</h2>
              {/* One primary action (WP4D discipline) — reflects the real
                  conclusion above, never a second competing option. */}
              <Link
                href={assessment.nextAction.href}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                {assessment.nextAction.label}
              </Link>
              {/* WP5D — Revision Planner is the journey's next step from
                  here; kept reachable (secondary) even when the real
                  verdict above points elsewhere, so the stated Mock
                  Readiness -> Revision path is never a dead end. Omitted
                  when it's already the primary action, to avoid a literal
                  duplicate link. */}
              {assessment.nextAction.href !== "/learning-intelligence/parent/revision-planner" && (
                <div className="mt-2">
                  <Link href="/learning-intelligence/parent/revision-planner" className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    See This Week&apos;s Revision Plan →
                  </Link>
                </div>
              )}
            </section>

            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              This reflects real, recorded evidence only. It is not a prediction of how your child would score, and
              there is no fixed rule about how often to sit a mock. It changes as new evidence comes in.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
