"use client";

import { useEffect, useState } from "react";
import { History, MapPin } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { getSelectedPathwayId } from "@/lib/progress";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { fetchRecentActivity, type RecentActivityItem } from "@/lib/learningEngine/activity";
import { RecentActivity } from "@/components/learningEngine/RecentActivity";

/**
 * Progress Timeline (Capability 3, Wave 3) — "Display learner educational
 * history. No new calculations."
 *
 * Deliberately implemented as a longer real activity log (every recorded
 * attempt, newest first), not a tier-over-time trend graph. A genuine
 * timeline of HOW evidence changed (e.g. "ET-1 -> ET-3 on 12 July") would
 * need LEARNING_ENGINE_V1.md §3.6 Historical Progress — periodic
 * snapshots of computed state — which no persistence mechanism exists for
 * yet (Wave 1 §10(1); Wave 2's Recommendation Model comment on why
 * "Review" is never emitted; Wave 3's own Parent Dashboard "Evidence
 * Composition" section, which is a snapshot for the same reason). This
 * page is real, honest educational history — a raw log of what was
 * attempted, and when — reusing lib/learningEngine/activity.ts unchanged,
 * with no new calculation of any kind.
 */
export default function ProgressTimelinePage() {
  const [pathwayEligible, setPathwayEligible] = useState<boolean | undefined>(undefined);
  const [items, setItems] = useState<RecentActivityItem[] | null | undefined>(undefined);

  useEffect(() => {
    const pathwayId = getSelectedPathwayId();
    const eligible = pathwayId === "csse";
    setPathwayEligible(eligible);
    if (!eligible) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      setItems(null);
      return;
    }
    ensureProfile()
      .then((profileId) => {
        if (!profileId) return setItems(null);
        return fetchRecentActivity(supabase, profileId, 50).then(setItems);
      })
      .catch(() => setItems(null));
  }, []);

  return (
    <PageLayout breadcrumbs={[{ label: "Learning Intelligence", href: "/learning-intelligence" }, { label: "Progress Timeline" }]}>
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-2xl">
            <History size={22} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Progress Timeline</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Every CSSE practice activity you&apos;ve completed, newest first</p>
          </div>
        </div>

        {pathwayEligible === false && (
          <InfoCard className="mt-6 flex items-start gap-3">
            <MapPin size={18} className="text-purple-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">Available for the CSSE pathway only.</p>
          </InfoCard>
        )}

        {pathwayEligible && items === undefined && <p className="text-sm text-gray-400 dark:text-gray-500 mt-6">Loading…</p>}

        {pathwayEligible && items === null && (
          <InfoCard className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Your timeline isn&apos;t available right now.</p>
          </InfoCard>
        )}

        {pathwayEligible && items && (
          <div className="mt-6">
            <RecentActivity items={items} />
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-4 leading-relaxed">
              This is a real activity log, not a trend chart — Angel doesn&apos;t yet keep a history of how your
              Evidence Tier changed over time, so this shows what you attempted and when, not how your standing has
              moved.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
