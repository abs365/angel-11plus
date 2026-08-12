"use client";

import Link from "next/link";
import { BookOpen, Calculator, PenLine, HelpCircle } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { PRACTICE_AREAS } from "@/lib/learningEngine/practiceContent";

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
 */
const AREA_ICON: Record<string, typeof BookOpen> = {
  "reading-comprehension": BookOpen,
  mathematics: Calculator,
  "continuous-writing": PenLine,
};

export default function PracticeAreaSelectorPage() {
  return (
    <PageLayout
      breadcrumbs={[{ label: "Learning Report", href: "/learning-intelligence" }, { label: "Practice" }]}
    >
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Choose a Practice Area</h1>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
          Each activity you complete updates your Skills Profile, Evidence Profile, Readiness and Recommendations.
        </p>

        <div className="grid gap-3 mt-6">
          {PRACTICE_AREAS.map((area) => {
            const Icon = AREA_ICON[area.id];
            return (
              <Link key={area.id} href={`/learning-intelligence/practice/${area.id}`}>
                <InfoCard className="flex items-center gap-4 hover:border-sky-300 dark:hover:border-sky-700 transition-colors">
                  <div className="bg-sky-100 dark:bg-sky-900 p-3 rounded-2xl shrink-0">
                    <Icon size={20} className="text-sky-700 dark:text-sky-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{area.label}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{area.description}</p>
                  </div>
                </InfoCard>
              </Link>
            );
          })}

          <InfoCard className="flex items-center gap-4 opacity-60">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl shrink-0">
              <HelpCircle size={20} className="text-gray-400 dark:text-gray-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Vocabulary: not available here</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">
                Vocabulary isn&apos;t part of this skills structure yet, so Vocabulary practice cannot yet connect to
                your learning report. Vocabulary practice is still available from the main Learn hub, it just won&apos;t
                appear on this dashboard.
              </p>
            </div>
          </InfoCard>
        </div>
      </div>
    </PageLayout>
  );
}
