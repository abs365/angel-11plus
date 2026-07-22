"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, MapPin, Clock, ArrowRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
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
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-2xl">
            <ClipboardList size={22} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Revision Planner</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm">This week&apos;s focus, prioritised and explained</p>
          </div>
        </div>

        {pathwayEligible === false && (
          <InfoCard className="mt-6 flex items-start gap-3">
            <MapPin size={18} className="text-purple-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">Available for the CSSE pathway only.</p>
          </InfoCard>
        )}

        {pathwayEligible && plan === undefined && <p className="text-sm text-gray-400 dark:text-gray-500 mt-6" aria-live="polite">Loading…</p>}

        {pathwayEligible && plan === null && (
          <InfoCard className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">This planner isn&apos;t available right now.</p>
          </InfoCard>
        )}

        {pathwayEligible && plan && plan.items.length === 0 && (
          <InfoCard className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Nothing to prioritise right now — check back as your child completes more practice.</p>
          </InfoCard>
        )}

        {pathwayEligible && plan && plan.items.length > 0 && (
          <div className="mt-6">
            <InfoCard className="mb-4 flex items-center gap-2">
              <Clock size={16} className="text-purple-500 shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                About <span className="font-semibold">{plan.totalMinutes} minutes</span> this week, across {plan.items.length} focus area
                {plan.items.length === 1 ? "" : "s"}.
              </p>
            </InfoCard>

            <div className="space-y-2">
              {plan.items.map((item) => (
                <InfoCard key={item.competencyId}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.label}</p>
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500 shrink-0">~{item.estimatedMinutes} min</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{item.parentReason}</p>
                  {item.practiceAreaId && (
                    <Link
                      href={`/learning-intelligence/practice/${item.practiceAreaId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 mt-2"
                    >
                      Start this now <ArrowRight size={12} />
                    </Link>
                  )}
                </InfoCard>
              ))}
            </div>

            {/* WP5D — closes the loop: each item above already leads into
                Practice; this is the direct path back to Learning once
                practice is done, without requiring a specific item click
                first. Secondary — each item's own "Start this now" is the
                real primary action on this page. */}
            <div className="mt-6">
              <Link href="/learning-intelligence" className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Full Learning Report →
              </Link>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                Once you&apos;ve practised, your Learning Report updates with the new evidence.
              </p>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
