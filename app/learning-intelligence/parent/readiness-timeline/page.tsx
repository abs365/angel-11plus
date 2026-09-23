"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, ClipboardList, Target } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { getSelectedPathwayId } from "@/lib/progress";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { fetchEducationalMilestones } from "@/lib/ali/persistence/auditStore";
import { ReadinessEvidenceTimeline } from "@/components/parent/ReadinessEvidenceTimeline";
import type { EducationalAuditRecord } from "@/types/ali/audit";

/**
 * Readiness Evidence Timeline (Sprint 5, WP5B). Reuses
 * fetchEducationalMilestones() unchanged (Sprint 2) — the exact same real
 * data the general Progress Timeline page already reads — with no date
 * filter, so it tells the whole story, not just the last 7 days. No new
 * Educational Intelligence calculation: every fact rendered already
 * existed in ali_educational_audit before this page was built.
 */
export default function ReadinessTimelinePage() {
  const [pathwayEligible, setPathwayEligible] = useState<boolean | undefined>(undefined);
  const [milestones, setMilestones] = useState<EducationalAuditRecord[] | null | undefined>(undefined);

  useEffect(() => {
    const pathwayId = getSelectedPathwayId();
    const eligible = pathwayId === "csse";
    setPathwayEligible(eligible);
    if (!eligible) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      setMilestones(null);
      return;
    }
    ensureProfile()
      .then((profileId) => {
        if (!profileId) return setMilestones(null);
        return fetchEducationalMilestones(supabase, profileId).then(setMilestones);
      })
      .catch(() => setMilestones(null));
  }, []);

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Learning Report", href: "/learning-intelligence" },
        { label: "Parent Dashboard", href: "/learning-intelligence/parent" },
        { label: "Admissions Readiness", href: "/learning-intelligence/parent/admissions-readiness" },
        { label: "Readiness Timeline" },
      ]}
    >
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <h1 className="text-[var(--angel-navy)] font-bold text-3xl md:text-4xl leading-tight">Readiness Timeline</h1>
        <p className="text-[var(--angel-muted)] text-sm md:text-base mt-2 max-w-xl">Why readiness has changed, in your child&apos;s own real evidence.</p>

        {pathwayEligible === false && (
          <div className="mt-6 flex items-start gap-3 bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5">
            <MapPin size={18} className="text-[var(--angel-blue)] mt-0.5 shrink-0" />
            <p className="text-sm text-[var(--angel-ink)]">Available for the CSSE pathway only.</p>
          </div>
        )}

        {pathwayEligible && milestones === undefined && (
          <p className="text-sm text-[var(--angel-muted)] mt-6" aria-live="polite">Loading…</p>
        )}

        {pathwayEligible && milestones === null && (
          <div className="mt-6 text-center bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-6">
            <p className="text-sm text-[var(--angel-muted)]">This timeline isn&apos;t available right now.</p>
          </div>
        )}

        {pathwayEligible && milestones && (
          <div className="mt-6 space-y-6">
            <ReadinessEvidenceTimeline milestones={milestones} />

            {milestones.length > 0 && (
              <div>
                {/* WP5D — Mock Readiness is the journey's next step from
                    here (Readiness Timeline -> Mock Readiness -> Revision):
                    now that the history is visible, the natural question is
                    whether another mock adds to it. Revision Planner is
                    real and kept, but visually secondary so the two don't
                    compete. */}
                <Link
                  href="/learning-intelligence/parent/mock-readiness"
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  <Target size={14} /> Is Another Mock Worthwhile? →
                </Link>
                <div className="mt-2">
                  <Link href="/learning-intelligence/parent/revision-planner" className="text-xs font-semibold text-[var(--angel-muted)] hover:text-[var(--angel-blue)] inline-flex items-center gap-1">
                    <ClipboardList size={13} /> See This Week&apos;s Revision Plan →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
