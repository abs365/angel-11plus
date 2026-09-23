"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import PageLayout from "@/components/PageLayout";
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
        <h1 className="text-[var(--angel-navy)] font-bold text-3xl md:text-4xl leading-tight">Recommendations</h1>
        <p className="text-[var(--angel-muted)] text-sm md:text-base mt-2 max-w-xl">What to focus on next, based on your recorded evidence.</p>

        {profile === undefined && <p className="text-sm text-[var(--angel-muted)] mt-6" aria-live="polite">Loading…</p>}

        {profile === null && (
          <div className="mt-6 text-center bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-6">
            <p className="text-sm text-[var(--angel-muted)]">Recommendations aren&apos;t available right now.</p>
          </div>
        )}

        {profile && !profile.pathwayEligible && (
          <div className="mt-6 flex items-start gap-3 bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5">
            <MapPin size={18} className="text-[var(--angel-blue)] mt-0.5 shrink-0" />
            <p className="text-sm text-[var(--angel-ink)]">Available for the CSSE pathway only.</p>
          </div>
        )}

        {profile && profile.pathwayEligible && (
          <div className="mt-6">
            <RecommendationSummary recommendations={profile.recommendations} />
            {/* WP4D (FD-022) — one clear primary next step; this page had none before. */}
            <Link
              href="/learning-intelligence/practice"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors mt-6"
            >
              Practise now →
            </Link>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
