"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { PRACTICE_AREAS, type PracticeAreaId } from "@/lib/learningEngine/practiceContent";
import { areaHasPracticeContent } from "@/lib/learningEngine/sessionGenerator";
import { getSupabaseClient } from "@/lib/supabase";

/**
 * Capability 3, Wave 2 — "Select practice area" step of the mission's UX
 * flow (Dashboard -> Select practice area -> Complete activity -> ...).
 *
 * Deliberately nested under /learning-intelligence rather than a top-level
 * /practice route: this app's navigation already has an established
 * "Practice" label pointing to /reasoning (Verbal/Non-Verbal/Spatial/
 * Numerical Reasoning) — see docs/operations/PRACTICE_NAVIGATION_
 * RECOMMENDATION.md, which explicitly warns against one word doing the
 * work of two different things. Nesting here keeps this feature clearly
 * scoped to the Assessment Brain V1 / Learning Engine V1 model it feeds,
 * with zero naming collision.
 *
 * Practise Hub Final Human-Design Refinement — the prior per-row icon tile
 * (BookOpen/Calculator/PenLine) was purely decorative, duplicating what
 * each subject's own title already says; removed per
 * ANGEL_11PLUS_PRODUCT_DESIGN_STANDARD_V1.md's governing rule against
 * icon/card/pill decoration that doesn't improve comprehension or
 * navigation. Typography, spacing and a restrained divider now carry the
 * hierarchy for these three rows instead.
 */

/**
 * Decision 258 — `undefined` (not yet checked) is deliberately treated as
 * unavailable everywhere below, not as available: the Founder's own
 * observation was a child reaching an apparently-available area only to
 * find nothing there, so this page must never claim availability it
 * hasn't actually confirmed against real content, not even for the brief
 * window before the live check resolves.
 */
type AreaAvailability = Partial<Record<PracticeAreaId, boolean>>;

export default function PracticeAreaSelectorPage() {
  const [availability, setAvailability] = useState<AreaAvailability>({});

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    Promise.all(
      PRACTICE_AREAS.map(async (area) => {
        const hasContent = await areaHasPracticeContent(supabase, area.id);
        return [area.id, hasContent] as const;
      })
    ).then((results) => {
      if (cancelled) return;
      setAvailability(Object.fromEntries(results));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageLayout
      breadcrumbs={[{ label: "Learning Report", href: "/learning-intelligence" }, { label: "Practice" }]}
    >
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <h1 className="text-[var(--angel-navy)] font-bold text-3xl md:text-4xl leading-tight">Choose a Practice Area</h1>
        <p className="text-[var(--angel-muted)] text-sm md:text-base mt-2 max-w-xl">
          Practise the skills you need for your preparation. Angel 11+ uses your work to understand what you&apos;re
          doing well and what to focus on next.
        </p>

        <div className="mt-8 bg-[var(--angel-sky)] rounded-lg px-6 md:px-8">
          <div className="divide-y divide-[var(--angel-border)]">
            {PRACTICE_AREAS.map((area) => {
              const isAvailable = availability[area.id];

              if (isAvailable !== true) {
                return (
                  <div key={area.id} className="py-5 opacity-60">
                    <p className="text-[var(--angel-navy)] text-lg font-semibold leading-snug">
                      {area.label}
                      {isAvailable === false ? ": being prepared" : ""}
                    </p>
                    <p className="text-[var(--angel-ink)] text-sm mt-1 leading-relaxed opacity-90">
                      {isAvailable === false
                        ? "This practice area doesn't have practice-ready content yet. Check back soon."
                        : "Checking availability…"}
                    </p>
                  </div>
                );
              }

              return (
                <Link key={area.id} href={`/learning-intelligence/practice/${area.id}`} className="flex items-center justify-between gap-4 py-5 group">
                  <div className="min-w-0 flex-1">
                    <p className="text-[var(--angel-navy)] text-lg font-semibold leading-snug group-hover:underline">{area.label}</p>
                    <p className="text-[var(--angel-ink)] text-sm mt-1 leading-relaxed opacity-90">{area.description}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[var(--angel-blue)] text-sm font-semibold shrink-0">
                    Start
                    <ArrowRight size={14} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
