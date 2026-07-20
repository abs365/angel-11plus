"use client";

import { useEffect, useState } from "react";
import { ClipboardList, MapPin } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { getSelectedPathwayId } from "@/lib/progress";
import { fetchLearnerIntelligenceProfile } from "@/lib/learningEngine/profile";
import { RecommendationSummary } from "@/components/learningEngine/RecommendationSummary";
import type { LearnerIntelligenceProfile } from "@/lib/learningEngine/types";

/**
 * Recommendation Centre (Capability 3, Wave 3) — pure display of
 * profile.recommendations. Zero new recommendation logic: reuses Wave 1's
 * computeRecommendations() (lib/learningEngine/recommendations.ts) and its
 * existing RecommendationSummary component completely unchanged. This
 * page's only job is to give recommendations a dedicated, focused home
 * distinct from the full dashboard, per this Wave's "display only" rule.
 */
export default function RecommendationCentrePage() {
  const [profile, setProfile] = useState<LearnerIntelligenceProfile | null | undefined>(undefined);

  useEffect(() => {
    const pathwayId = getSelectedPathwayId();
    fetchLearnerIntelligenceProfile(pathwayId ?? undefined).then(setProfile).catch(() => setProfile(null));
  }, []);

  return (
    <PageLayout breadcrumbs={[{ label: "Learning Report", href: "/learning-intelligence" }, { label: "Recommendations" }]}>
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-2xl">
            <ClipboardList size={22} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Recommendation Centre</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm">What to focus on next, based on your recorded evidence</p>
          </div>
        </div>

        {profile === undefined && <p className="text-sm text-gray-400 dark:text-gray-500 mt-6">Loading…</p>}

        {profile === null && (
          <InfoCard className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Recommendations aren&apos;t available right now.</p>
          </InfoCard>
        )}

        {profile && !profile.pathwayEligible && (
          <InfoCard className="mt-6 flex items-start gap-3">
            <MapPin size={18} className="text-purple-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">Available for the CSSE pathway only.</p>
          </InfoCard>
        )}

        {profile && profile.pathwayEligible && (
          <div className="mt-6">
            <RecommendationSummary recommendations={profile.recommendations} />
          </div>
        )}
      </div>
    </PageLayout>
  );
}
