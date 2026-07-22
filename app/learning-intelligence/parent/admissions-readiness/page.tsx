"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, MapPin, ClipboardList } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { getSelectedPathwayId } from "@/lib/progress";
import { getSupabaseClient } from "@/lib/supabase";
import { fetchLearnerIntelligenceProfile } from "@/lib/learningEngine/profile";
import { getRecommendations } from "@/lib/learningEngine/educationalIntelligenceService";
import { ALL_COMPETENCY_IDS } from "@/lib/learningEngine/assessmentBrainMap";
import { ReadinessSummary } from "@/components/learningEngine/ReadinessSummary";
import { EvidenceProfile } from "@/components/learningEngine/EvidenceProfile";
import { RecommendationExplanation } from "@/components/learningEngine/parent/RecommendationExplanation";
import { HistoricalContextPanel } from "@/components/parent/HistoricalContextPanel";
import type { LearnerIntelligenceProfile } from "@/lib/learningEngine/types";
import type { RecommendationRuntimeResult } from "@/lib/ali/persistence/recommendationRuntime";

/**
 * Admissions Readiness Foundation (Sprint 5, WP5A). Built exactly against
 * docs/intelligence/ADMISSIONS_INTELLIGENCE_V1_DESIGN.md §5/§8/§9/§10 —
 * a composition of already-real, already-computed Educational Intelligence
 * Engine output, plus the one real cited admissions fact, kept in its own
 * separate section per EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md §10's rule
 * (never blended into Readiness). No new calculation of any kind — every
 * value here is read, unmodified, from functions Sprints 1-4 already built.
 *
 * Four sections, deliberately kept visually and structurally distinct
 * (this sprint's explicit requirement):
 *   1. Educational Readiness — ReadinessSummary, unchanged.
 *   2. Educational Evidence — EvidenceProfile, unchanged.
 *   3. Historical Context — the one real CSSE fact, cited, never combined
 *      with 1 or 2, never phrased as a prediction.
 *   4. Recommended Next Action — RecommendationExplanation, unchanged,
 *      followed by exactly one page-level primary CTA (WP4D's one-
 *      primary-action rule) toward the Revision Planner.
 *
 * Mock Exam Historical Context integration (Design §6) was reclassified by
 * the Founder as V1 Backlog during WP5G's Decision Support review, not
 * built here — WP5B itself became the Readiness Evidence Timeline instead.
 */
export default function AdmissionsReadinessPage() {
  const [pathwayEligible, setPathwayEligible] = useState<boolean | undefined>(undefined);
  const [profile, setProfile] = useState<LearnerIntelligenceProfile | null | undefined>(undefined);
  const [recommendations, setRecommendations] = useState<RecommendationRuntimeResult | null | undefined>(undefined);

  useEffect(() => {
    const pathwayId = getSelectedPathwayId();
    const eligible = pathwayId === "csse";
    setPathwayEligible(eligible);
    if (!eligible) return;

    fetchLearnerIntelligenceProfile(pathwayId ?? undefined)
      .then((p) => {
        setProfile(p);
        const supabase = getSupabaseClient();
        if (p?.pathwayEligible && supabase) {
          getRecommendations(supabase, p.profileId, ALL_COMPETENCY_IDS)
            .then(setRecommendations)
            .catch(() => setRecommendations(null));
        }
      })
      .catch(() => setProfile(null));
  }, []);

  const loaded = profile !== undefined;

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Learning Report", href: "/learning-intelligence" },
        { label: "Parent Dashboard", href: "/learning-intelligence/parent" },
        { label: "Admissions Readiness" },
      ]}
    >
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-2xl">
            <GraduationCap size={22} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Admissions Readiness</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              What real evidence shows so far — not a prediction of the outcome
            </p>
          </div>
        </div>

        {pathwayEligible === false && (
          <InfoCard className="mt-6 flex items-start gap-3">
            <MapPin size={18} className="text-purple-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">Available for the CSSE pathway only.</p>
          </InfoCard>
        )}

        {pathwayEligible && !loaded && <p className="text-sm text-gray-400 dark:text-gray-500 mt-6" aria-live="polite">Loading…</p>}

        {pathwayEligible && loaded && profile === null && (
          <InfoCard className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">This page isn&apos;t available right now.</p>
          </InfoCard>
        )}

        {pathwayEligible && profile && !profile.pathwayEligible && (
          <InfoCard className="mt-6 flex items-start gap-3">
            <MapPin size={18} className="text-purple-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              This section is built entirely from CSSE&apos;s own official exam evidence.
            </p>
          </InfoCard>
        )}

        {pathwayEligible && profile && profile.pathwayEligible && (
          <div className="space-y-8 mt-6">
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-1">Educational Readiness</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                How well-evidenced each part of CSSE&apos;s exam is, area by area — never a single blended score.
              </p>
              <ReadinessSummary readiness={profile.readiness} />
              {/* Sprint 5 (WP5B) — secondary link; the page's one primary
                  action (Revision Planner, below) is unchanged. */}
              <Link href="/learning-intelligence/parent/readiness-timeline" className="inline-block text-xs font-semibold text-purple-600 dark:text-purple-400 mt-2">
                See how this changed over time →
              </Link>
            </section>

            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-1">Educational Evidence</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                How much of what CSSE actually tests has real recorded evidence behind it.
              </p>
              <EvidenceProfile competencies={profile.competencies} />
            </section>

            <HistoricalContextPanel />

            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Recommended Next Action</h2>
              {recommendations === undefined && <p className="text-sm text-gray-400 dark:text-gray-500" aria-live="polite">Loading…</p>}
              {recommendations !== undefined && (
                <RecommendationExplanation result={recommendations ?? { ordered: [], explanations: new Map(), vetoedCompetencyCodes: [] }} />
              )}
            </section>

            {/* One primary action for this page (WP4D discipline) — the
                recommendation above explains WHY; this is the one place to
                act on it, continuing the established sequence. */}
            <div>
              <Link
                href="/learning-intelligence/parent/revision-planner"
                className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                <ClipboardList size={14} /> See This Week&apos;s Revision Plan →
              </Link>
              {/* Sprint 5 (WP5C) — secondary link; the primary action above is unchanged. */}
              <div className="mt-2">
                <Link href="/learning-intelligence/parent/mock-readiness" className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Is another mock worthwhile right now? →
                </Link>
              </div>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              Angel does not predict admissions outcomes, offer likelihood, or how your child compares to other
              applicants — only what real evidence exists, and CSSE&apos;s own published facts, shown separately.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
