"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Calculator, BookMarked, Pencil, Play, Compass } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { getProgress } from "@/lib/progress";
import { computeAnalytics } from "@/lib/analytics";
import { computeAdaptiveState } from "@/lib/adaptiveEngine";
import { ProgressBar } from "@/components/ui/Progress";
import { ButtonLink } from "@/components/ui/Button";
import { SUBJECT_ESTIMATED_MINUTES, SUBJECT_LEARNING_OBJECTIVE } from "@/lib/subjectMeta";
import type { AnalyticsReport, SubjectKey } from "@/types/analytics";
import type { DailyMission } from "@/types/adaptive";

/**
 * Sprint 4 (Learning Experience Transformation) — the Learning Hub.
 * Mirrors app/reasoning/page.tsx's existing precedent exactly: collapsing
 * several peer-weighted subjects into one guided entry point
 * (ANGEL_NAVIGATION_ARCHITECTURE.md §2's own "collapse by mental model"
 * test, restated as this whole platform's standing Navigation Philosophy
 * in AXT-002 §2). Every data source here is reused unmodified —
 * computeAnalytics() and computeAdaptiveState() are called exactly as
 * they already are on the Dashboard/English/Maths pages; no new
 * calculation is introduced anywhere in this file.
 */

const SUBJECTS: {
  key: SubjectKey;
  href: string;
  label: string;
  icon: typeof BookOpen;
  color: string;
  iconBg: string;
}[] = [
  { key: "english", href: "/english", label: "English Comprehension", icon: BookOpen, color: "text-purple-600 dark:text-purple-400", iconBg: "bg-purple-100 dark:bg-purple-900" },
  { key: "maths", href: "/maths", label: "Maths Reasoning", icon: Calculator, color: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-100 dark:bg-blue-900" },
  { key: "vocabulary", href: "/vocabulary", label: "Vocabulary Builder", icon: BookMarked, color: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-100 dark:bg-emerald-900" },
  { key: "writing", href: "/writing", label: "Creative Writing", icon: Pencil, color: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-100 dark:bg-amber-900" },
];

export default function LearningHubPage() {
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [mission, setMission] = useState<DailyMission | null>(null);

  useEffect(() => {
    const p = getProgress();
    const r = computeAnalytics(p);
    const adaptive = computeAdaptiveState(p, r);
    setReport(r);
    setMission(adaptive.dailyMission);
  }, []);

  const learnMissionItem = mission?.items.find((item) =>
    SUBJECTS.some((s) => s.href === item.href)
  );

  return (
    <PageLayout breadcrumbs={[{ label: "My Admission Journey", href: "/dashboard" }, { label: "Learn" }]}>
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6">
          <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl mb-1.5">Learning Hub</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed">
            Your core subjects, presented as one guided learning pathway rather than four separate lists.
          </p>
        </div>

        {/* Quick Resume — reuses the same real Daily Mission output the
            Dashboard already renders, not a second recommendation. */}
        {learnMissionItem && (
          <div className="bg-purple-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-2xl p-4 mb-6 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 min-w-0">
              <Compass size={16} className="text-purple-500 shrink-0" />
              <p className="text-sm text-purple-800 dark:text-purple-200 min-w-0 truncate">
                Continue where you left off: <span className="font-semibold">{learnMissionItem.label}</span>
              </p>
            </div>
            <ButtonLink href={learnMissionItem.href} variant="primary" size="sm" leftIcon={<Play size={13} />}>
              Continue learning
            </ButtonLink>
          </div>
        )}

        {/* Learning pathway — each subject card shows its real objective,
            estimated time, and a Learning Path Visualisation bar sourced
            from the subject's own real, already-computed avgScore. Never
            a fabricated completion percentage. */}
        <div className="space-y-3">
          {SUBJECTS.map((subject) => {
            const analytics = report?.subjects.find((s) => s.subject === subject.key);
            const Icon = subject.icon;
            return (
              <Link
                key={subject.key}
                href={subject.href}
                className="block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 hover:shadow-md active:scale-[0.98] transition-all group"
              >
                <div className="flex items-start gap-3.5 mb-3">
                  <div className={`p-3 rounded-2xl shrink-0 ${subject.iconBg}`}>
                    <Icon size={20} className={subject.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base text-gray-900 dark:text-gray-100">{subject.label}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">
                      {SUBJECT_LEARNING_OBJECTIVE[subject.key]}
                    </p>
                  </div>
                  <span className="text-xs text-gray-300 dark:text-gray-600 shrink-0">~{SUBJECT_ESTIMATED_MINUTES[subject.key]} min</span>
                </div>

                {analytics && analytics.attempts > 0 ? (
                  <ProgressBar percent={analytics.avgScore} color="purple" label={`${subject.label} average score`} />
                ) : (
                  <p className="text-xs text-gray-300 dark:text-gray-600">Not started yet</p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
