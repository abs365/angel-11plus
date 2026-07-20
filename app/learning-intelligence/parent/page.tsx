"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, MapPin } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { getSelectedPathwayId } from "@/lib/progress";
import { getSupabaseClient } from "@/lib/supabase";
import { fetchLearnerIntelligenceProfile } from "@/lib/learningEngine/profile";
import { fetchRecentActivity, type RecentActivityItem } from "@/lib/learningEngine/activity";
import { COMPETENCIES } from "@/lib/learningEngine/assessmentBrainMap";
import { CompetencySummary } from "@/components/learningEngine/parent/CompetencySummary";
import { EvidenceComposition } from "@/components/learningEngine/parent/EvidenceComposition";
import { ReadinessSummary } from "@/components/learningEngine/ReadinessSummary";
import { RecentActivity } from "@/components/learningEngine/RecentActivity";
import type { LearnerIntelligenceProfile } from "@/lib/learningEngine/types";

/**
 * Parent Dashboard (Capability 3, Wave 3) — a separate, Assessment-Brain-
 * driven view, distinct from the existing legacy ALI-era /parent hub
 * (different taxonomy, different data model — see lib/learningEngine/
 * types.ts's own naming note on why the two systems are kept separate).
 * Nested under /learning-intelligence, matching Wave 2's established
 * naming-collision-avoidance convention, not layered into the already
 *-busy existing /parent page.
 *
 * Every section here reuses Wave 1's already-computed
 * LearnerIntelligenceProfile — no new educational calculation is
 * introduced anywhere on this page, per this Wave's mission rule.
 * Presentation is deliberately more restrained than the learner dashboard
 * (component-level grouping, competency names only, no raw Competency/
 * Question-Type/Tier codes) per LEARNING_ENGINE_V1.md §8's explicit
 * parent-facing-language rule.
 */
export default function ParentDashboardPage() {
  const [profile, setProfile] = useState<LearnerIntelligenceProfile | null | undefined>(undefined);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);

  useEffect(() => {
    const pathwayId = getSelectedPathwayId();
    fetchLearnerIntelligenceProfile(pathwayId ?? undefined)
      .then((p) => {
        setProfile(p);
        const supabase = getSupabaseClient();
        if (p?.pathwayEligible && supabase) {
          fetchRecentActivity(supabase, p.profileId).then(setRecentActivity).catch(() => setRecentActivity([]));
        }
      })
      .catch(() => setProfile(null));
  }, []);

  const evidencedCount = profile?.competencies.filter((c) => c.tier !== "ET-0").length ?? 0;
  const totalCount = profile?.competencies.length ?? 0;

  return (
    <PageLayout breadcrumbs={[{ label: "Learning Intelligence", href: "/learning-intelligence" }, { label: "Parent Dashboard" }]}>
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-2xl">
            <Users size={22} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Parent Dashboard</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Your child&apos;s CSSE progress, in plain language</p>
          </div>
        </div>

        {profile === undefined && <p className="text-sm text-gray-400 dark:text-gray-500 mt-6">Loading…</p>}

        {profile === null && (
          <InfoCard className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">This dashboard isn&apos;t available right now.</p>
          </InfoCard>
        )}

        {profile && !profile.pathwayEligible && (
          <InfoCard className="mt-6 flex items-start gap-3">
            <MapPin size={18} className="text-purple-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Available for the CSSE pathway</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                This dashboard is built entirely from CSSE&apos;s own official exam evidence, so it doesn&apos;t yet
                apply to other target schools.
              </p>
            </div>
          </InfoCard>
        )}

        {profile && profile.pathwayEligible && (
          <div className="space-y-8 mt-6">
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Child Progress</h2>
              <InfoCard>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {evidencedCount === 0
                    ? "No practice evidence recorded yet — this fills in as your child completes practice activities."
                    : `${evidencedCount} of ${totalCount} CSSE competencies now have some recorded evidence.`}
                </p>
                <Link href="/learning-intelligence/practice" className="inline-block text-xs font-semibold text-purple-600 dark:text-purple-400 mt-2">
                  See practice areas →
                </Link>
              </InfoCard>
            </section>

            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Competency Summary</h2>
              <CompetencySummary competencies={profile.competencies} />
            </section>

            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Readiness Summary</h2>
              <ReadinessSummary readiness={profile.readiness} />
            </section>

            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Evidence Growth</h2>
              <EvidenceComposition competencies={profile.competencies} />
            </section>

            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Development Areas</h2>
              <InfoCard>
                {profile.diagnostics.developmentAreas.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">None identified yet</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.diagnostics.developmentAreas.map((id) => (
                      <span key={id} className="text-xs font-medium px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        {COMPETENCIES[id].name}
                      </span>
                    ))}
                  </div>
                )}
              </InfoCard>
            </section>

            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Recent Activity</h2>
              <RecentActivity items={recentActivity} plainLanguage />
            </section>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
