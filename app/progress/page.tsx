"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart2,
  Star,
  CheckCircle,
  Target,
  RefreshCw,
  Trophy,
  Award,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { getProgress, saveProgress, getSelectedPathwayId } from "@/lib/progress";
import { englishLessons } from "@/data/lessons";
import { computeAnalytics } from "@/lib/analytics";
import { computeGamification, BADGE_DEFINITIONS } from "@/lib/gamification";
import { computeParentReport, READINESS_CONFIG } from "@/lib/parentInsights";
import { getPathwayById } from "@/lib/pathways";
import JourneyTimeline from "@/components/JourneyTimeline";
import InsightCard from "@/components/InsightCard";
import { SubjectBar, SkillBar } from "@/components/SubjectBreakdown";
import BadgeCard from "@/components/BadgeCard";
import DifficultyBadge from "@/components/DifficultyBadge";
import { computeAdaptiveProfile } from "@/lib/adaptiveDifficulty";
import type { UserProgress } from "@/types";
import type { AnalyticsReport } from "@/types/analytics";
import type { GamificationState } from "@/types/gamification";
import type { AdaptiveProfile } from "@/types/adaptiveDifficulty";
import type { ParentReport } from "@/types/parent";
import type { Pathway } from "@/types/pathway";

const lessonNames: Record<string, string> = {
  "eng-001": "The Lighthouse Mystery",
  "eng-002": "The Boy Who Collected Silence",
  "eng-003": "Letters from the Trenches",
  "maths-reasoning": "Maths Reasoning Session",
  "maths-arithmetic": "Speed Arithmetic",
  "vocab-session": "Vocabulary Flashcards",
  "verbal-reasoning": "Verbal Reasoning Session",
  "non-verbal-reasoning": "Non-Verbal Reasoning Session",
  "spatial-reasoning": "Spatial Reasoning Session",
  "numerical-reasoning": "Numerical Reasoning Session",
};

for (let i = 1; i <= 4; i++) {
  lessonNames[`writing-wrt-00${i}`] = `Writing Prompt ${i}`;
}
lessonNames["mock-test"] = "Full Mock Test";

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [gamification, setGamification] = useState<GamificationState | null>(null);
  const [adaptiveProfile, setAdaptiveProfile] = useState<AdaptiveProfile | null>(null);
  const [parentReport, setParentReport] = useState<ParentReport | null>(null);
  const [pathway, setPathway] = useState<Pathway | undefined>();

  useEffect(() => {
    const p = getProgress();
    const r = computeAnalytics(p);
    const gam = computeGamification(p);
    setProgress(p);
    setReport(r);
    setGamification(gam);
    setAdaptiveProfile(computeAdaptiveProfile(p, r));
    // Progress Journey / Admission Context (Sprint 10) — reuses
    // computeParentReport() exactly as Dashboard/Parent Hub already do,
    // purely to read its existing examReadiness/hasEnoughData output; no
    // new calculation is introduced on this page.
    setParentReport(computeParentReport(p, r, gam));
    setPathway(getPathwayById(getSelectedPathwayId() ?? ""));
  }, []);

  function resetProgress() {
    if (confirm("Reset all progress? This cannot be undone.")) {
      const fresh: UserProgress = {
        xp: 0,
        streak: 1,
        completedLessons: [],
        scores: {},
        lastActivity: new Date().toISOString(),
      };
      saveProgress(fresh);
      setProgress(fresh);
    }
  }

  if (!progress) return null;

  const totalPossible = 16;
  const completionPct = Math.round((progress.completedLessons.length / totalPossible) * 100);

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-2xl">
              <BarChart2 size={22} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">My Progress</h1>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Track your 11+ journey</p>
            </div>
          </div>
          <button
            onClick={resetProgress}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Reset progress"
            aria-label="Reset progress"
          >
            <RefreshCw size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Progress Overview (Sprint 10) — one narrative line summarising
            existing report outputs, ahead of the detailed cards below. */}
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
          {report && report.hasEnoughData ? (
            <>
              You&apos;ve completed <strong className="text-gray-700 dark:text-gray-300">{report.totalSessions}</strong> session{report.totalSessions === 1 ? "" : "s"}, averaging <strong className="text-gray-700 dark:text-gray-300">{report.overallScore}%</strong>. Here&apos;s the story so far.
            </>
          ) : (
            "Complete a few sessions to start building your progress story."
          )}
        </p>

        {/* Progress Journey (Sprint 10) — replaces isolated charts with a
            narrative: reuses Sprint 3's JourneyTimeline (deriveActiveStageIndex,
            unmodified) for where the learner started/is now, and the existing
            XP Milestone bar directly below it for rank progression. No
            historical data is invented — hasEnoughData/examReadiness/
            nextMilestone are all existing, already-computed outputs. */}
        {parentReport && gamification && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-5">
            <h2 className="text-gray-900 dark:text-gray-100 font-semibold mb-4">Progress Journey</h2>
            <JourneyTimeline hasEnoughData={parentReport.hasEnoughData} readiness={parentReport.examReadiness} />
            <div className="mt-5 pt-4 border-t border-gray-50 dark:border-gray-800 space-y-1.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>
                <span className="font-semibold text-gray-800 dark:text-gray-100">Started:</span>{" "}
                {report && report.totalSessions > 0
                  ? `${report.totalSessions} session${report.totalSessions === 1 ? "" : "s"} completed so far.`
                  : "Not started yet."}
              </p>
              <p>
                <span className="font-semibold text-gray-800 dark:text-gray-100">Current position:</span>{" "}
                {READINESS_CONFIG[parentReport.examReadiness].label}: {READINESS_CONFIG[parentReport.examReadiness].description}
              </p>
              <p>
                <span className="font-semibold text-gray-800 dark:text-gray-100">Next milestone:</span>{" "}
                {gamification.nextMilestone
                  ? gamification.nextMilestone.label
                  : "Maximum rank reached. More milestones are on the way."}
              </p>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 text-center">
            <CheckCircle size={20} className="text-green-500 mx-auto mb-2" />
            <p className="text-gray-900 dark:text-gray-100 font-bold text-2xl">{progress.completedLessons.length}</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">Completed</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 text-center">
            <Target size={20} className="text-blue-500 mx-auto mb-2" />
            <p className="text-gray-900 dark:text-gray-100 font-bold text-2xl">{completionPct}%</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">Coverage</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 text-center">
            <Trophy size={20} className="text-amber-500 mx-auto mb-2" />
            <p className="text-gray-900 dark:text-gray-100 font-bold text-2xl">
              {Object.values(progress.scores).filter((s) => s >= 80).length}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">Strong scores</p>
          </div>
        </div>
        {/* Sprint 4 Completion Package (WP4A) — Coverage's denominator (16)
            was previously unexplained; this reuses the same real values
            already computed above, no new calculation. */}
        <p className="text-gray-400 dark:text-gray-500 text-xs mb-6 -mt-3">
          Coverage: {progress.completedLessons.length} of {totalPossible} available lessons completed.
        </p>

        {/* Completed lessons */}
        {progress.completedLessons.length > 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-5">
            <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
              <h2 className="text-gray-900 dark:text-gray-100 font-semibold">Completed Sessions</h2>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {progress.completedLessons.map((id) => {
                const score = progress.scores[id];
                const name = lessonNames[id] ?? id;
                return (
                  <div key={id} className="px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle size={15} className="text-green-400 shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">{name}</p>
                    </div>
                    {score !== undefined && (
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          score >= 80
                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                            : score >= 60
                            ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
                            : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {score}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-8 text-center mb-5">
            <Star size={24} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-gray-500 font-medium mb-1">No sessions completed yet</p>
            <p className="text-gray-300 dark:text-gray-600 text-sm">Start with English or Maths to begin your progress story</p>
          </div>
        )}

        {/* English lesson progress */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
            <h2 className="text-gray-900 dark:text-gray-100 font-semibold">English Lessons</h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {englishLessons.map((lesson) => {
              const done = progress.completedLessons.includes(lesson.id);
              const score = progress.scores[lesson.id];
              return (
                <div key={lesson.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        done ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                    <p className={`text-sm font-medium ${done ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"}`}>
                      {lesson.title}
                    </p>
                  </div>
                  {done && score !== undefined ? (
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        score >= 80
                          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                          : score >= 60
                          ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
                          : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"
                      }`}
                    >
                      {score}%
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300 dark:text-gray-600">Not started</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── ANALYTICS SECTION ─────────────────────────────── */}
        {report && (
          <>
            {/* Subject breakdown */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-900 dark:text-gray-100 font-semibold">Subject Breakdown</h2>
                {report.overallScore > 0 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    Overall avg: <strong className="text-gray-700 dark:text-gray-300">{report.overallScore}%</strong>
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-4">
                {report.subjects.map((s) => (
                  <SubjectBar key={s.subject} subject={s} />
                ))}
              </div>
            </div>

            {/* Competency Progress (Sprint 10) — a shared heading over the
                two existing competency sections below (Learning Confidence,
                Skill Analysis), presenting them as one connected picture
                rather than two isolated charts. Neither section's own data
                or calculation changes. */}
            {((adaptiveProfile && adaptiveProfile.subjectConfidence.some((c) => c.score > 0)) || report.skills.length > 0) && (
              <div className="mb-1">
                <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg">Competency Progress</h2>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5 mb-3">
                  How confident and accurate your child is becoming, by subject and skill.
                </p>
              </div>
            )}

            {/* Learning confidence */}
            {adaptiveProfile && adaptiveProfile.subjectConfidence.some((c) => c.score > 0) && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-4">
                <div className="mb-4">
                  <h2 className="text-gray-900 dark:text-gray-100 font-semibold">Learning Confidence</h2>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                    Combines accuracy and practice consistency per subject
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  {adaptiveProfile.subjectConfidence
                    .filter((c) => c.score > 0)
                    .map((c) => {
                      const barColor =
                        c.score >= 70 ? "bg-green-500"
                        : c.score >= 50 ? "bg-amber-400"
                        : "bg-red-400";
                      return (
                        <div key={c.subject} className="flex items-center gap-4">
                          <div className="w-24 shrink-0">
                            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium capitalize">
                              {c.subject === "mock-test" ? "Mock Test" : c.subject.charAt(0).toUpperCase() + c.subject.slice(1)}
                            </p>
                            <div className="mt-1">
                              <DifficultyBadge tier={c.tier} />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{c.score}%</span>
                              <span className="text-[10px] text-gray-300 dark:text-gray-600">
                                accuracy {c.accuracy}% · consistency {c.consistency}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                                style={{ width: `${c.score}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Skill analysis */}
            {report.skills.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-4">
                <div className="mb-4">
                  <h2 className="text-gray-900 dark:text-gray-100 font-semibold">Skill Analysis</h2>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                    Based on your answers so far, weakest skills shown first
                  </p>
                </div>

                {/* English skills */}
                {report.skills.filter((s) => s.group === "english").length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide mb-2.5">
                      English
                    </p>
                    <div className="flex flex-col gap-2.5">
                      {report.skills
                        .filter((s) => s.group === "english")
                        .map((s) => (
                          <SkillBar key={s.skill} skill={s} />
                        ))}
                    </div>
                  </div>
                )}

                {/* Maths skills */}
                {report.skills.filter((s) => s.group === "maths").length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide mb-2.5">
                      Maths
                    </p>
                    <div className="flex flex-col gap-2.5">
                      {report.skills
                        .filter((s) => s.group === "maths")
                        .map((s) => (
                          <SkillBar key={s.skill} skill={s} />
                        ))}
                    </div>
                  </div>
                )}

                {/* Reasoning skills */}
                {report.skills.filter((s) => s.group === "reasoning").length > 0 && (
                  <div className={report.skills.filter((s) => s.group !== "reasoning").length > 0 ? "mt-4" : ""}>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide mb-2.5">
                      Reasoning
                    </p>
                    <div className="flex flex-col gap-2.5">
                      {report.skills
                        .filter((s) => s.group === "reasoning")
                        .map((s) => (
                          <SkillBar key={s.skill} skill={s} />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Admission Context (Sprint 10) — explains how progress
                connects to the selected pathway using only existing
                pathway/readiness outputs (getSelectedPathwayId/
                getPathwayById, computeParentReport's examReadiness); links
                to the existing School Intelligence Hub (Sprint 7) rather
                than duplicating it. */}
            {parentReport && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-4">
                <h2 className="text-gray-900 dark:text-gray-100 font-semibold mb-1">Admission Context</h2>
                <p className="text-gray-400 dark:text-gray-500 text-xs mb-3">How this connects to your target school</p>
                {pathway ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                    You&apos;re preparing for the <strong className="text-gray-800 dark:text-gray-100">{pathway.name}</strong> pathway.
                    {parentReport.hasEnoughData && <> {READINESS_CONFIG[parentReport.examReadiness].description}</>}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                    No target pathway selected yet.{" "}
                    <Link href="/pathways" className="text-sky-700 dark:text-sky-400 font-medium hover:underline">
                      choose one
                    </Link>{" "}
                    to see how your progress connects to its assessment format.
                  </p>
                )}
                <Link
                  href="/pathways"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-3 py-1.5 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors"
                >
                  View School Intelligence →
                </Link>
              </div>
            )}

            {/* Learning insights */}
            {report.insights.length > 0 && (
              <div className="mb-4">
                <h2 className="text-gray-900 dark:text-gray-100 font-semibold mb-3">Learning Insights</h2>
                <div className="flex flex-col gap-3">
                  {report.insights.slice(0, 4).map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              </div>
            )}

            {/* Next recommendation */}
            {report.nextRecommendation && (
              <a
                href={report.nextRecommendation.href}
                className="block w-full bg-purple-600 text-white text-center rounded-xl py-3.5 font-semibold text-sm hover:bg-purple-700 transition-colors mb-4"
              >
                {report.nextRecommendation.label} →
              </a>
            )}
          </>
        )}

        {/* ── ACHIEVEMENTS ──────────────────────────────────────── */}
        {gamification && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-indigo-500" />
                <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg">Achievements</h2>
              </div>
              <span className="text-gray-400 dark:text-gray-500 text-sm">
                {gamification.earnedIds.length} / {BADGE_DEFINITIONS.length} earned
              </span>
            </div>

            {/* Weekly goal */}
            <div
              className={`flex items-center gap-3 rounded-xl px-4 py-3 mb-5 border ${
                gamification.weeklyGoal.isComplete
                  ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900"
                  : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
              }`}
            >
              <div className="flex gap-1.5 shrink-0">
                {Array.from({ length: gamification.weeklyGoal.target }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full ${
                      i < gamification.weeklyGoal.sessions
                        ? gamification.weeklyGoal.isComplete
                          ? "bg-emerald-400"
                          : "bg-indigo-400"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${gamification.weeklyGoal.isComplete ? "text-emerald-700 dark:text-emerald-300" : "text-gray-700 dark:text-gray-300"}`}>
                  {gamification.weeklyGoal.isComplete
                    ? "Weekly goal complete"
                    : `${gamification.weeklyGoal.sessions} of ${gamification.weeklyGoal.target} sessions this week`}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                  {gamification.weeklyGoal.isComplete
                    ? "Outstanding consistency this week."
                    : `${gamification.weeklyGoal.target - gamification.weeklyGoal.sessions} more session${gamification.weeklyGoal.target - gamification.weeklyGoal.sessions !== 1 ? "s" : ""} to reach your weekly target.`}
                </p>
              </div>
            </div>

            {/* Badge categories */}
            {(["streak", "skill", "subject", "milestone"] as const).map((category) => {
              const categoryBadges = BADGE_DEFINITIONS.filter((b) => b.category === category);
              const categoryLabels = {
                streak: "Consistency",
                skill: "Performance",
                subject: "Subject Mastery",
                milestone: "Milestones",
              };
              return (
                <div key={category} className="mb-6">
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide mb-3">
                    {categoryLabels[category]}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {categoryBadges.map((badge) => (
                      <BadgeCard
                        key={badge.id}
                        badge={badge}
                        earned={gamification.earnedIds.includes(badge.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
