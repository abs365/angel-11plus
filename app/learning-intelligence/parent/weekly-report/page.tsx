"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, ClipboardList, MapPin } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { getSelectedPathwayId } from "@/lib/progress";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { fetchRecentActivity, type RecentActivityItem } from "@/lib/learningEngine/activity";
import { fetchEducationalMilestones } from "@/lib/ali/persistence/auditStore";
import { getRecommendations } from "@/lib/learningEngine/educationalIntelligenceService";
import { ALL_COMPETENCY_IDS } from "@/lib/learningEngine/assessmentBrainMap";
import { RecentActivity } from "@/components/learningEngine/RecentActivity";
import { EducationalTimeline } from "@/components/learningEngine/EducationalTimeline";
import { RecommendationExplanation } from "@/components/learningEngine/parent/RecommendationExplanation";
import type { EducationalAuditRecord } from "@/types/ali/audit";
import type { RecommendationRuntimeResult } from "@/lib/ali/persistence/recommendationRuntime";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Weekly Learning Report (Sprint 4, ANGEL-CSSE-002A, Parent Intelligence,
 * Deliverable 3 — "what improved, what changed, what should happen next").
 * Every section reuses an already-built, already-audited-clean component —
 * this page adds no new explanation copy, only a 7-day date window applied
 * to the same real functions the Timeline and Parent Dashboard already use.
 * "What improved" and "what changed" are both real, discrete, already-
 * recorded facts (milestones; dated attempt history) — never a fabricated
 * before/after comparison, since no historical-tier-snapshot mechanism
 * exists (see EducationalTimeline.tsx's own note).
 */
export default function WeeklyLearningReportPage() {
  const [pathwayEligible, setPathwayEligible] = useState<boolean | undefined>(undefined);
  const [milestones, setMilestones] = useState<EducationalAuditRecord[] | null | undefined>(undefined);
  const [activity, setActivity] = useState<RecentActivityItem[] | null | undefined>(undefined);
  const [recommendations, setRecommendations] = useState<RecommendationRuntimeResult | null | undefined>(undefined);

  useEffect(() => {
    const pathwayId = getSelectedPathwayId();
    const eligible = pathwayId === "csse";
    setPathwayEligible(eligible);
    if (!eligible) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      setMilestones(null);
      setActivity(null);
      setRecommendations(null);
      return;
    }
    const sinceIso = new Date(Date.now() - SEVEN_DAYS_MS).toISOString();
    ensureProfile()
      .then((profileId) => {
        if (!profileId) {
          setMilestones(null);
          setActivity(null);
          setRecommendations(null);
          return;
        }
        fetchEducationalMilestones(supabase, profileId, sinceIso).then(setMilestones).catch(() => setMilestones(null));
        fetchRecentActivity(supabase, profileId, 50, sinceIso).then(setActivity).catch(() => setActivity(null));
        getRecommendations(supabase, profileId, ALL_COMPETENCY_IDS)
          .then(setRecommendations)
          .catch(() => setRecommendations(null));
      })
      .catch(() => {
        setMilestones(null);
        setActivity(null);
        setRecommendations(null);
      });
  }, []);

  const loaded = milestones !== undefined && activity !== undefined && recommendations !== undefined;
  const nothingThisWeek = (milestones?.length ?? 0) === 0 && (activity?.length ?? 0) === 0;

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Learning Report", href: "/learning-intelligence" },
        { label: "Parent Dashboard", href: "/learning-intelligence/parent" },
        { label: "Weekly Report" },
      ]}
    >
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-2xl">
            <CalendarDays size={22} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Weekly Learning Report</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm">The last 7 days: what improved, what changed, what&apos;s next</p>
          </div>
        </div>

        {pathwayEligible === false && (
          <InfoCard className="mt-6 flex items-start gap-3">
            <MapPin size={18} className="text-purple-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">Available for the CSSE pathway only.</p>
          </InfoCard>
        )}

        {pathwayEligible && !loaded && <p className="text-sm text-gray-400 dark:text-gray-500 mt-6" aria-live="polite">Loading…</p>}

        {pathwayEligible && loaded && nothingThisWeek && (
          <InfoCard className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No activity recorded this week yet.</p>
            <Link href="/learning-intelligence/practice" className="inline-block text-xs font-semibold text-purple-600 dark:text-purple-400 mt-2">
              Start a practice session →
            </Link>
          </InfoCard>
        )}

        {pathwayEligible && loaded && !nothingThisWeek && (
          <div className="space-y-8 mt-6">
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">What improved</h2>
              <EducationalTimeline milestones={milestones ?? []} />
            </section>

            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">What changed</h2>
              <RecentActivity items={activity ?? []} plainLanguage />
            </section>

            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">What should happen next</h2>
              <RecommendationExplanation result={recommendations ?? { ordered: [], explanations: new Map(), vetoedCompetencyCodes: [] }} />
            </section>

            {/* WP4D (FD-022) — one clear primary next step, continuing the
                stated sequence toward Revision -> Practice. */}
            <Link
              href="/learning-intelligence/parent/revision-planner"
              className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <ClipboardList size={14} /> See This Week&apos;s Revision Plan →
            </Link>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
