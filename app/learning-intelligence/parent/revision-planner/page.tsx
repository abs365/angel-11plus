"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { getSelectedPathwayId } from "@/lib/progress";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { generateRevisionPlan, type RevisionPlan } from "@/lib/learningEngine/revisionPlanner";

/**
 * Revision Planner (Sprint 4, ANGEL-CSSE-002A, Parent Intelligence,
 * Deliverable 4 — prioritised weekly focus + time guidance + educational
 * reasoning). Every item's reasoning comes from lib/ali/explainability.ts's
 * generateExplanation() — no new copy on this page.
 */
export default function RevisionPlannerPage() {
  const [pathwayEligible, setPathwayEligible] = useState<boolean | undefined>(undefined);
  const [plan, setPlan] = useState<RevisionPlan | null | undefined>(undefined);

  useEffect(() => {
    const pathwayId = getSelectedPathwayId();
    const eligible = pathwayId === "csse";
    setPathwayEligible(eligible);
    if (!eligible) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      setPlan(null);
      return;
    }
    ensureProfile()
      .then((profileId) => {
        if (!profileId) return setPlan(null);
        return generateRevisionPlan(supabase, profileId).then(setPlan);
      })
      .catch(() => setPlan(null));
  }, []);

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Learning Report", href: "/learning-intelligence" },
        { label: "Parent Dashboard", href: "/learning-intelligence/parent" },
        { label: "Revision Planner" },
      ]}
    >
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <h1 className="text-[var(--angel-navy)] font-bold text-3xl md:text-4xl leading-tight">Revision Planner</h1>
        <p className="text-[var(--angel-muted)] text-sm md:text-base mt-2 max-w-xl">This week&apos;s focus, prioritised and explained.</p>

        {pathwayEligible === false && (
          <div className="mt-6 flex items-start gap-3 bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5">
            <MapPin size={18} className="text-[var(--angel-blue)] mt-0.5 shrink-0" />
            <p className="text-sm text-[var(--angel-ink)]">Available for the CSSE pathway only.</p>
          </div>
        )}

        {pathwayEligible && plan === undefined && <p className="text-sm text-[var(--angel-muted)] mt-6" aria-live="polite">Loading…</p>}

        {pathwayEligible && plan === null && (
          <div className="mt-6 text-center bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-6">
            <p className="text-sm text-[var(--angel-muted)]">This planner isn&apos;t available right now.</p>
          </div>
        )}

        {pathwayEligible && plan && plan.items.length === 0 && (
          <div className="mt-6 text-center bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-6">
            <p className="text-sm text-[var(--angel-muted)]">Nothing to prioritise right now. Check back as your child completes more practice.</p>
          </div>
        )}

        {pathwayEligible && plan && plan.items.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-center gap-2 bg-[var(--angel-sky)] rounded-lg p-4">
              <Clock size={16} className="text-[var(--angel-blue)] shrink-0" />
              <p className="text-sm text-[var(--angel-ink)]">
                About <span className="font-semibold text-[var(--angel-navy)]">{plan.totalMinutes} minutes</span> this week, across {plan.items.length} focus area
                {plan.items.length === 1 ? "" : "s"}.
              </p>
            </div>

            <div className="bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg divide-y divide-[var(--angel-border)]">
              {plan.items.map((item) => (
                <div key={item.competencyId} className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--angel-navy)]">{item.label}</p>
                    <span className="text-xs font-medium text-[var(--angel-muted)] shrink-0">~{item.estimatedMinutes} min</span>
                  </div>
                  <p className="text-sm text-[var(--angel-ink)] mt-1">{item.parentReason}</p>
                  {item.practiceAreaId && (
                    <Link
                      href={`/learning-intelligence/practice/${item.practiceAreaId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--angel-blue)] mt-2 hover:underline"
                    >
                      Start this now <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* WP5D — closes the loop: each item above already leads into
                Practice; this is the direct path back to Learning once
                practice is done, without requiring a specific item click
                first. Secondary — each item's own "Start this now" is the
                real primary action on this page. */}
            <div className="mt-6">
              <Link href="/learning-intelligence" className="text-xs font-semibold text-[var(--angel-muted)] hover:text-[var(--angel-blue)]">
                Full Learning Report →
              </Link>
              <p className="text-[11px] text-[var(--angel-muted)] mt-0.5">
                Once you&apos;ve practised, your Learning Report updates with the new evidence.
              </p>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
