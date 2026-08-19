"use client";

import { useEffect, useState } from "react";
import { Puzzle, Shapes, Compass, Hash, Play, Sparkles, Clock } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SubjectCard from "@/components/SubjectCard";
import { ButtonLink } from "@/components/ui/Button";
import { getProgress } from "@/lib/progress";
import { computeAnalytics } from "@/lib/analytics";
import { computeAdaptiveState } from "@/lib/adaptiveEngine";
import type { AnalyticsReport } from "@/types/analytics";
import type { DailyMission } from "@/types/adaptive";
import type { SkillType } from "@/types";

// Angel V2.0 Sprint 5 (Practice Experience & Competency Journey) — this is
// the existing "Practice" nav entry (components/Navigation.tsx already
// labels /reasoning "Practice"); it already served as the entry point for
// the four reasoning subjects (AXT-002 §2's "collapse by mental model"
// pattern, established for these four routes before Learn's own Sprint 4
// collapse). This sprint enriches that existing hub in place — Quick
// Resume, real Competency Focus per subject, and real progress — rather
// than creating a second, competing entry point. The four underlying
// routes are completely unchanged.

const reasoningSubjects: {
  href: string;
  title: string;
  description: string;
  icon: typeof Puzzle;
  color: "violet" | "cyan" | "teal" | "rose";
  badge: string;
  skillType: SkillType;
}[] = [
  {
    href: "/verbal-reasoning",
    title: "Verbal Reasoning",
    description: "Word analogies, letter codes, hidden words & sequences.",
    icon: Puzzle,
    color: "violet",
    badge: "GL · CEM · ISEB",
    skillType: "verbal-reasoning",
  },
  {
    href: "/non-verbal-reasoning",
    title: "Non-Verbal Reasoning",
    description: "Pattern grids, rotation, reflection & symbol sequences.",
    icon: Shapes,
    color: "cyan",
    badge: "GL · ISEB",
    skillType: "non-verbal-reasoning",
  },
  {
    href: "/spatial-reasoning",
    title: "Spatial Reasoning",
    description: "Paper folding, 3D shapes, symmetry & compass directions.",
    icon: Compass,
    color: "teal",
    badge: "Independent",
    skillType: "spatial-reasoning",
  },
  {
    href: "/numerical-reasoning",
    title: "Numerical Reasoning",
    description: "Number patterns, ratio, averages & data interpretation.",
    icon: Hash,
    color: "rose",
    badge: "CEM · GL · ISEB",
    skillType: "numerical-reasoning",
  },
];

/**
 * Mock Centre Experience Transformation — relocated from app/mocks/page.tsx.
 * Real, GL-pathway content (fetchQuestionBank(..., "gl") in each of the four
 * runners below, confirmed by direct source read) that was previously the
 * first thing every pathway's "Mock" nav click reached, including CSSE
 * families. This is its correct home: the existing, unchanged Practise hub
 * for the pathway it actually belongs to. The four routes themselves are
 * completely unchanged (NEW_ANGEL_LEGACY_EXPERIENCE_AUDIT.md §4).
 */
const personalisedPracticeCards: {
  href: string;
  title: string;
  description: string;
  minutes: string;
  bg: string;
  border: string;
  badgeBg: string;
  badgeText: string;
}[] = [
  {
    href: "/mocks/adaptive/gl",
    title: "GL Verbal Reasoning",
    description: "Verbal Reasoning questions matched to your practice level.",
    minutes: "35 min",
    bg: "bg-violet-50 dark:bg-violet-950",
    border: "border-violet-100 dark:border-violet-900",
    badgeBg: "bg-violet-100 dark:bg-violet-900",
    badgeText: "text-violet-700 dark:text-violet-300",
  },
  {
    href: "/mocks/adaptive/maths",
    title: "Mathematics Practice",
    description: "Maths questions matched to your practice level.",
    minutes: "12 min",
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-100 dark:border-blue-900",
    badgeBg: "bg-blue-100 dark:bg-blue-900",
    badgeText: "text-blue-700 dark:text-blue-300",
  },
  {
    href: "/mocks/adaptive/english",
    title: "Reading Practice",
    description: "One passage at a time, with every question that belongs to it.",
    minutes: "10-15 min",
    bg: "bg-purple-50 dark:bg-purple-950",
    border: "border-purple-100 dark:border-purple-900",
    badgeBg: "bg-purple-100 dark:bg-purple-900",
    badgeText: "text-purple-700 dark:text-purple-300",
  },
  {
    href: "/mocks/adaptive/vocabulary",
    title: "Vocabulary Practice",
    description: "One word at a time: synonyms, antonyms and usage in context.",
    minutes: "5-10 min",
    bg: "bg-emerald-50 dark:bg-emerald-950",
    border: "border-emerald-100 dark:border-emerald-900",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900",
    badgeText: "text-emerald-700 dark:text-emerald-300",
  },
];

export default function ReasoningHubPage() {
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [mission, setMission] = useState<DailyMission | null>(null);

  useEffect(() => {
    const p = getProgress();
    const r = computeAnalytics(p);
    const adaptive = computeAdaptiveState(p, r);
    setReport(r);
    setMission(adaptive.dailyMission);
  }, []);

  // Quick Resume — reuses the same real Daily Mission output the Dashboard
  // and Learning Hub already render, filtered to this hub's four subjects;
  // not a second recommendation.
  const practiceMissionItem = mission?.items.find((item) =>
    reasoningSubjects.some((s) => s.href === item.href)
  );

  return (
    <PageLayout breadcrumbs={[{ label: "Today", href: "/dashboard" }, { label: "Practice" }]}>
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {/* AN-107: the manual "← Home" back-link is replaced with the same
            breadcrumbs prop Dashboard/Learning Hub already use — consistent
            navigation pattern, and "Home" predated AN-101's "Today" nav
            relabel. */}
        <div className="mb-6">
          <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl mb-2">Practice</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-lg">
            Reasoning skills are tested across nearly every UK selective school entrance exam. Each discipline below
            strengthens a specific competency and adapts to your level as you practise. Consistent practice here
            contributes directly to admission readiness.
          </p>
        </div>

        {/* AN-108: hub-chrome strip (not subject-specific) moved from purple to the muted-indigo educational accent. */}
        {practiceMissionItem && (
          <div className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 rounded-2xl p-4 mb-6 flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm text-indigo-800 dark:text-indigo-200 min-w-0">
                Continue where you left off: <span className="font-semibold">{practiceMissionItem.label}</span>
              </p>
            </div>
            <ButtonLink href={practiceMissionItem.href} variant="primary" size="sm" leftIcon={<Play size={13} aria-hidden="true" />}>
              Continue Practice
            </ButtonLink>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reasoningSubjects.map((subject) => {
            const skill = report?.skills.find((s) => s.skill === subject.skillType);
            const subjectRow = report?.subjects.find((s) => s.subject === subject.skillType);
            return (
              <SubjectCard
                key={subject.href}
                href={subject.href}
                title={subject.title}
                description={subject.description}
                icon={subject.icon}
                color={subject.color}
                badge={subject.badge}
                competency={skill ? { label: skill.label, percent: skill.estimatedAccuracy } : undefined}
                progressNote={
                  subjectRow && subjectRow.attempts > 0
                    ? `${subjectRow.attempts} session${subjectRow.attempts === 1 ? "" : "s"} · ${subjectRow.avgScore}% average`
                    : subjectRow
                    ? "Not started yet"
                    : undefined
                }
              />
            );
          })}
        </div>

        <div className="mt-8 space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Personalised Practice</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Short, daily sessions. Questions adapt to you every time.</p>
          </div>
          {personalisedPracticeCards.map((card) => (
            <div key={card.href} className={`rounded-2xl border ${card.bg} ${card.border} p-5`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${card.badgeBg} ${card.badgeText} flex items-center gap-1`}>
                    <Sparkles size={12} />
                    Personalised
                  </span>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{card.title}</h3>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock size={13} />
                  {card.minutes}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-1">{card.description}</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed mb-4">
                Currently a small sample set while we build out the full question bank.
              </p>
              <ButtonLink href={card.href} variant="outline" size="sm" leftIcon={<Play size={14} />}>
                Start practice
              </ButtonLink>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
