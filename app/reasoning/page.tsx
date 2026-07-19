"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Puzzle, Shapes, Compass, Hash, Play } from "lucide-react";
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
    <PageLayout>
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm mb-5 transition-colors"
        >
          <ArrowLeft size={16} />
          Home
        </Link>

        <div className="mb-6">
          <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl mb-2">Practice</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-lg">
            Reasoning skills are tested across nearly every UK selective school entrance exam. Each discipline below
            strengthens a specific competency and adapts to your level as you practise — consistent practice here
            contributes directly to admission readiness.
          </p>
        </div>

        {practiceMissionItem && (
          <div className="bg-purple-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-2xl p-4 mb-6 flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm text-purple-800 dark:text-purple-200 min-w-0">
                Continue where you left off: <span className="font-semibold">{practiceMissionItem.label}</span>
              </p>
            </div>
            <ButtonLink href={practiceMissionItem.href} variant="primary" size="sm" leftIcon={<Play size={13} />}>
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
      </div>
    </PageLayout>
  );
}
