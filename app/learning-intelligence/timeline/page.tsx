"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { getSelectedPathwayId } from "@/lib/progress";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { fetchRecentActivity, type RecentActivityItem } from "@/lib/learningEngine/activity";
import { fetchEducationalMilestones } from "@/lib/ali/persistence/auditStore";
import { RecentActivity } from "@/components/learningEngine/RecentActivity";
import { EducationalTimeline } from "@/components/learningEngine/EducationalTimeline";
import type { EducationalAuditRecord } from "@/types/ali/audit";

/**
 * Progress Timeline (Capability 3, Wave 3; extended Sprint 2, ANGEL-CSSE-002A
 * Deliverable 4 — Educational Timeline).
 *
 * Two distinct sections, both real, neither new calculation. "Milestones"
 * (added Sprint 2) reads ali_educational_audit via fetchEducationalMilestones()
 * — the real, already-written record of every mastery/durable-mastery/
 * wellbeing-pacing conclusion the Engine has reached, chronologically. "Every
 * activity" remains the raw attempt log from Wave 3, reusing
 * lib/learningEngine/activity.ts unchanged. Neither is LEARNING_ENGINE_V1.md
 * §3.6's Historical Progress (a tier-over-time trend graph) — that would need
 * periodic snapshots of computed state, which still has no persistence
 * mechanism (Wave 1 §10(1); Wave 3's Parent Dashboard "Evidence Composition"
 * section notes the same real gap). Milestones close part of that gap
 * honestly (real discrete events, real dates); a continuous trend remains
 * genuinely undelivered.
 */
export default function ProgressTimelinePage() {
  const [pathwayEligible, setPathwayEligible] = useState<boolean | undefined>(undefined);
  const [items, setItems] = useState<RecentActivityItem[] | null | undefined>(undefined);
  const [milestones, setMilestones] = useState<EducationalAuditRecord[] | null | undefined>(undefined);

  useEffect(() => {
    const pathwayId = getSelectedPathwayId();
    const eligible = pathwayId === "csse";
    setPathwayEligible(eligible);
    if (!eligible) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      setItems(null);
      setMilestones(null);
      return;
    }
    ensureProfile()
      .then((profileId) => {
        if (!profileId) {
          setItems(null);
          setMilestones(null);
          return;
        }
        fetchRecentActivity(supabase, profileId, 50).then(setItems);
        fetchEducationalMilestones(supabase, profileId).then(setMilestones).catch(() => setMilestones(null));
      })
      .catch(() => {
        setItems(null);
        setMilestones(null);
      });
  }, []);

  return (
    <PageLayout breadcrumbs={[{ label: "Learning Report", href: "/learning-intelligence" }, { label: "Progress Timeline" }]}>
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <h1 className="text-[var(--angel-navy)] font-bold text-3xl md:text-4xl leading-tight">Progress Timeline</h1>
        <p className="text-[var(--angel-muted)] text-sm md:text-base mt-2 max-w-xl">Every CSSE practice activity you&apos;ve completed, newest first.</p>

        {pathwayEligible === false && (
          <div className="mt-6 flex items-start gap-3 bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5">
            <MapPin size={18} className="text-[var(--angel-blue)] mt-0.5 shrink-0" />
            <p className="text-sm text-[var(--angel-ink)]">Available for the CSSE pathway only.</p>
          </div>
        )}

        {pathwayEligible && items === undefined && <p className="text-sm text-[var(--angel-muted)] mt-6" aria-live="polite">Loading…</p>}

        {pathwayEligible && items === null && (
          <div className="mt-6 text-center bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-6">
            <p className="text-sm text-[var(--angel-muted)]">Your timeline isn&apos;t available right now.</p>
          </div>
        )}

        {pathwayEligible && items && (
          <div className="mt-6 space-y-8">
            <section>
              <h2 className="text-[var(--angel-navy)] font-bold text-lg md:text-xl mb-3">Milestones</h2>
              {milestones === undefined && <p className="text-sm text-[var(--angel-muted)]" aria-live="polite">Loading…</p>}
              {milestones !== undefined && <EducationalTimeline milestones={milestones ?? []} />}
            </section>

            <section>
              <h2 className="text-[var(--angel-navy)] font-bold text-lg md:text-xl mb-3">Every activity</h2>
              <RecentActivity items={items} />
            </section>

            <p className="text-[11px] text-[var(--angel-muted)] leading-relaxed">
              Milestones above are real, dated events: mastery and durable mastery, as the Engine reaches them. What
              Angel doesn&apos;t yet show is a continuous trend of how your Evidence Tier moved between those
              moments.
            </p>

            {/* WP4D (FD-022) — one clear primary next step; this page had none before. */}
            <Link
              href="/learning-intelligence/practice"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Practise now →
            </Link>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
