"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Calculator,
  BookMarked,
  Pencil,
  ClipboardList,
  Flame,
  Trophy,
  Target,
  TrendingUp,
  Clock,
  Zap,
  ChevronRight,
  Star,
  AlertCircle,
  CheckCircle,
  Info,
  MapPin,
  Puzzle,
  Shapes,
  Compass,
  Hash,
  FileText,
  Play,
  Sparkles,
} from "lucide-react";
import { getProgress, getSelectedPathwayId } from "@/lib/progress";
import { getMockResults } from "@/lib/mockProgress";
import type { MockResult } from "@/types/mock";
import { computeAnalytics } from "@/lib/analytics";
import { computeGamification, BADGE_DEFINITIONS } from "@/lib/gamification";
import { computeParentReport, READINESS_CONFIG } from "@/lib/parentInsights";
import { getPathwayById } from "@/lib/pathways";
import type { ParentReport } from "@/types/parent";
import type { SubjectAnalytics } from "@/types/analytics";
import type { SubjectConfidence } from "@/types/adaptiveDifficulty";
import type { Pathway } from "@/types/pathway";
import DifficultyBadge from "@/components/DifficultyBadge";

// ─── Subject icon map ────────────────────────────────────────────────────────

const SUBJECT_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  english: BookOpen,
  maths: Calculator,
  vocabulary: BookMarked,
  writing: Pencil,
  "mock-test": ClipboardList,
  // Aligned to the canonical subject identity table — ANGEL_DESIGN_LANGUAGE.md §2.
  // This previously used Brain/Eye/Box, diverging from Navigation.tsx/dashboard's
  // Puzzle/Shapes/Compass for the same three subjects — a real inconsistency,
  // corrected here rather than left as a second, competing icon set.
  "verbal-reasoning": Puzzle,
  "non-verbal-reasoning": Shapes,
  "spatial-reasoning": Compass,
  "numerical-reasoning": Hash,
};

const SUBJECT_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
  english: { bar: "bg-purple-500", bg: "bg-purple-50 dark:bg-purple-950", text: "text-purple-700 dark:text-purple-300" },
  maths: { bar: "bg-blue-500", bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-300" },
  vocabulary: { bar: "bg-green-500", bg: "bg-green-50 dark:bg-green-950", text: "text-green-700 dark:text-green-300" },
  writing: { bar: "bg-orange-500", bg: "bg-orange-50 dark:bg-orange-950", text: "text-orange-700 dark:text-orange-300" },
  "mock-test": { bar: "bg-pink-500", bg: "bg-pink-50 dark:bg-pink-950", text: "text-pink-700 dark:text-pink-300" },
  "verbal-reasoning": { bar: "bg-violet-500", bg: "bg-violet-50 dark:bg-violet-950", text: "text-violet-700 dark:text-violet-300" },
  "non-verbal-reasoning": { bar: "bg-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950", text: "text-cyan-700 dark:text-cyan-300" },
  "spatial-reasoning": { bar: "bg-teal-500", bg: "bg-teal-50 dark:bg-teal-950", text: "text-teal-700 dark:text-teal-300" },
  "numerical-reasoning": { bar: "bg-rose-500", bg: "bg-rose-50 dark:bg-rose-950", text: "text-rose-700 dark:text-rose-300" },
};

// ─── Status label ────────────────────────────────────────────────────────────

function statusLabel(s: SubjectAnalytics["status"]): {
  text: string;
  className: string;
} {
  switch (s) {
    case "strong":
      return { text: "Strong", className: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" };
    case "developing":
      return { text: "Developing", className: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300" };
    case "weak":
      return { text: "Needs work", className: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300" };
    case "not-started":
      return { text: "Not started", className: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400" };
  }
}

// ─── Insight icon ────────────────────────────────────────────────────────────

function InsightIcon({ type }: { type: "positive" | "attention" | "action" }) {
  if (type === "positive")
    return <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />;
  if (type === "attention")
    return <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />;
  return <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />;
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
        <BookOpen size={28} className="text-purple-600 dark:text-purple-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No data yet</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
        Your child hasn&apos;t completed any sessions yet. Once they start practising, this dashboard will fill with progress data.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center gap-2 bg-purple-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
      >
        Go to Student App
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ParentDashboardPage() {
  const [report, setReport] = useState<ParentReport | null>(null);
  const [pathway, setPathway] = useState<Pathway | undefined>();
  const [mockResults, setMockResults] = useState<MockResult[]>([]);

  useEffect(() => {
    const p = getProgress();
    const analytics = computeAnalytics(p);
    const gamification = computeGamification(p);
    setReport(computeParentReport(p, analytics, gamification));
    setPathway(getPathwayById(getSelectedPathwayId() ?? ""));
    setMockResults(getMockResults());
  }, []);

  if (!report) return null;

  const readinessCfg = READINESS_CONFIG[report.examReadiness];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Student App
          </Link>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Parent Dashboard</span>
          <span className="text-xs text-purple-600 dark:text-purple-300 font-semibold bg-purple-50 dark:bg-purple-950 px-2 py-1 rounded-full">
            Beta
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-12">
        {!report.hasEnoughData ? (
          <EmptyState />
        ) : (
          <div className="space-y-5 pt-5">

            {/* Overview stats */}
            <section>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  label="Total Sessions"
                  value={String(report.totalSessions)}
                  icon={<Target size={16} className="text-purple-500" />}
                />
                <StatCard
                  label="Current Streak"
                  value={`${report.streak}d`}
                  icon={<Flame size={16} className="text-orange-500" />}
                />
                <StatCard
                  label="Overall Score"
                  value={report.overallScore > 0 ? `${report.overallScore}%` : "—"}
                  icon={<TrendingUp size={16} className="text-blue-500" />}
                />
                <StatCard
                  label="Time Practised"
                  value={
                    report.estimatedMinutes >= 60
                      ? `${Math.round(report.estimatedMinutes / 60)}h`
                      : `${report.estimatedMinutes}m`
                  }
                  icon={<Clock size={16} className="text-green-500" />}
                />
              </div>
            </section>

            {/* Learning Pathway */}
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Learning Pathway
              </h2>
              <Link
                href="/pathways"
                className="bg-white dark:bg-gray-900 rounded-xl p-4 flex items-center gap-3 hover:shadow-sm transition-shadow block"
              >
                <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center shrink-0">
                  <MapPin size={17} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  {pathway ? (
                    <>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{pathway.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                        {pathway.subjects.join(" · ")}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">No pathway selected</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tap to choose GL, CEM, CSSE or another pathway</p>
                    </>
                  )}
                </div>
                <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 shrink-0" />
              </Link>
            </section>

            {/* Exam Readiness */}
            <section className={`rounded-2xl p-5 ${readinessCfg.bgColor}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                    Exam Readiness
                  </p>
                  <p className={`text-lg font-bold ${readinessCfg.textColor}`}>
                    {readinessCfg.label}
                  </p>
                </div>
                <div className={`text-2xl font-black ${readinessCfg.textColor}`}>
                  {readinessCfg.pct}%
                </div>
              </div>
              <div className="h-2 bg-white/60 dark:bg-black/30 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${readinessCfg.barColor}`}
                  style={{ width: `${readinessCfg.pct}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{readinessCfg.description}</p>
            </section>

            {/* Subject Grid */}
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Subject Breakdown
              </h2>
              <div className="space-y-2">
                {report.subjects.map((s) => {
                  const Icon = SUBJECT_ICONS[s.subject] ?? BookOpen;
                  const colors = SUBJECT_COLORS[s.subject];
                  const sl = statusLabel(s.status);
                  const conf = report.subjectConfidence.find((c) => c.subject === s.subject);
                  return (
                    <div key={s.subject} className="bg-white dark:bg-gray-900 rounded-xl p-4 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors.bg}`}>
                        <Icon size={17} className={colors.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{s.label}</span>
                          <div className="flex items-center gap-1.5">
                            {conf && conf.score > 0 && (
                              <DifficultyBadge tier={conf.tier} />
                            )}
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sl.className}`}>
                              {sl.text}
                            </span>
                          </div>
                        </div>
                        {s.attempts > 0 ? (
                          <>
                            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${colors.bar}`}
                                style={{ width: `${s.avgScore}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              Avg {s.avgScore}%
                              {conf && conf.score > 0 && ` · Confidence ${conf.score}%`}
                              {` · ${s.attempts} session${s.attempts !== 1 ? "s" : ""}`}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-400 dark:text-gray-500">No sessions yet</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Reasoning Readiness */}
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Reasoning Readiness
              </h2>
              <div className="space-y-2">
                {report.subjects
                  .filter((s) => ["verbal-reasoning", "non-verbal-reasoning", "spatial-reasoning", "numerical-reasoning"].includes(s.subject))
                  .map((s) => {
                    const Icon = SUBJECT_ICONS[s.subject] ?? Puzzle;
                    const colors = SUBJECT_COLORS[s.subject] ?? { bar: "bg-gray-500", bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300" };
                    const sl = statusLabel(s.status);
                    return (
                      <div key={s.subject} className="bg-white dark:bg-gray-900 rounded-xl p-4 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors.bg}`}>
                          <Icon size={17} className={colors.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{s.label}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sl.className}`}>
                              {sl.text}
                            </span>
                          </div>
                          {s.attempts > 0 ? (
                            <>
                              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${s.avgScore}%` }} />
                              </div>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Avg {s.avgScore}% · {s.attempts} session{s.attempts !== 1 ? "s" : ""}</p>
                            </>
                          ) : (
                            <p className="text-xs text-gray-400 dark:text-gray-500">No sessions yet</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>

            {/* Mock Performance */}
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Mock Performance
              </h2>
              {mockResults.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-0.5">No mocks attempted yet</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed mb-3">
                      Timed mock exams reveal how your child performs under exam conditions. Aim for at least one mock per fortnight.
                    </p>
                    <Link
                      href="/mocks"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-3 py-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                    >
                      <Play size={12} />
                      Start a Practice Mock
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Summary row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Mocks completed</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{mockResults.length}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Best score</p>
                      <p className={`text-2xl font-black ${
                        Math.max(...mockResults.map(r => r.totalScore)) >= 75
                          ? "text-green-600"
                          : Math.max(...mockResults.map(r => r.totalScore)) >= 55
                          ? "text-amber-600"
                          : "text-red-500"
                      }`}>
                        {Math.max(...mockResults.map(r => r.totalScore))}%
                      </p>
                    </div>
                  </div>

                  {/* Recent mock results */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Recent Mocks</p>
                      <Link href="/mocks" className="text-xs text-purple-600 dark:text-purple-400 font-medium">View all</Link>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                      {mockResults.slice(-3).reverse().map((r) => (
                        <div key={r.id} className="px-4 py-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                            <FileText size={13} className="text-gray-400 dark:text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{r.pathwayName}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-sm font-bold ${r.totalScore >= 75 ? "text-green-600" : r.totalScore >= 55 ? "text-amber-600" : "text-red-500"}`}>
                              {r.totalScore}%
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{r.durationMinutes} min</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section breakdown of most recent mock */}
                  {mockResults.length > 0 && mockResults[mockResults.length - 1].sectionResults.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Last Mock — Section Breakdown</p>
                      </div>
                      <div className="p-4 space-y-3">
                        {mockResults[mockResults.length - 1].sectionResults.map((s) => (
                          <div key={s.sectionId}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{s.sectionName}</span>
                              <span className={`text-xs font-bold ${s.score >= 75 ? "text-green-600" : s.score >= 55 ? "text-amber-600" : "text-red-500"}`}>
                                {s.score}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${s.score >= 75 ? "bg-green-500" : s.score >= 55 ? "bg-amber-400" : "bg-red-400"}`}
                                style={{ width: `${s.score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    href="/mocks"
                    className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Play size={14} />
                    Start another mock
                  </Link>
                </div>
              )}
            </section>

            {/* Competency Summary (Phase ALI 1.4) — competency-first messaging
                for subjects with real ALI data, in place of raw percentages. */}
            {report.competencySummaries.map((summary) => (
              <section key={summary.subject}>
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  {summary.subjectLabel} — How They're Doing
                </h2>
                <div className="space-y-2">
                  {summary.recentlyMastered.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 flex gap-3">
                      <Sparkles size={18} className="text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Just mastered</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {summary.recentlyMastered.map((i) => i.label).join(", ")} — great progress this session.
                        </p>
                      </div>
                    </div>
                  )}
                  {summary.strengths.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 flex gap-3">
                      <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Strengths</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          Your child is confident with {summary.strengths.map((i) => i.label).join(", ")}.
                        </p>
                      </div>
                    </div>
                  )}
                  {summary.improving.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 flex gap-3">
                      <TrendingUp size={18} className="text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Improving</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          Getting stronger with {summary.improving.map((i) => i.label).join(", ")} — keep up the regular practice.
                        </p>
                      </div>
                    </div>
                  )}
                  {summary.focusNext.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 flex gap-3">
                      <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Focus next</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {summary.focusNext.map((i) => i.label).join(", ")} would benefit from a little extra practice.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            ))}

            {/* Parent Insights */}
            {report.parentInsights.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Parent Insights
                </h2>
                <div className="space-y-2">
                  {report.parentInsights.map((insight) => (
                    <div key={insight.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 flex gap-3">
                      <InsightIcon type={insight.type} />
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insight.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Focus Areas */}
            {report.focusAreas.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Recommended Focus
                </h2>
                <div className="space-y-2">
                  {report.focusAreas.map((area) => (
                    <Link
                      key={area.label}
                      href={area.href}
                      className="bg-white dark:bg-gray-900 rounded-xl p-4 flex items-start gap-3 group block hover:shadow-sm transition-shadow"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{area.label}</span>
                          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-full shrink-0 ml-2">
                            {area.frequency}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{area.detail}</p>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors shrink-0 mt-0.5"
                      />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Weekly Summary */}
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                This Week
              </h2>
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{report.weeklySessions}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Sessions</p>
                  </div>
                  <div className="text-center border-x border-gray-100 dark:border-gray-800">
                    <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{report.weeklyXP}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">XP earned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{report.streak}d</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Streak</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-indigo-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Rank: <span className="font-semibold text-gray-900 dark:text-gray-100">{report.rank}</span>
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{report.xp} XP total</span>
                </div>
              </div>
            </section>

            {/* Badges */}
            {report.earnedBadges.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Badges Earned ({report.earnedBadges.length})
                </h2>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4">
                  <div className="flex flex-wrap gap-2">
                    {report.earnedBadges.map((badge) => (
                      <div
                        key={badge.id}
                        title={badge.description}
                        className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full px-3 py-1.5"
                      >
                        <Star size={12} className="text-amber-500" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Beta feedback */}
            <section className="bg-purple-50 dark:bg-purple-950 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
                  <Trophy size={15} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">Parent Dashboard — Beta</p>
                  <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                    This dashboard is in beta. We&apos;re adding more detailed reporting, email summaries, and exam countdown features soon.
                    Your feedback helps shape what we build next.
                  </p>
                </div>
              </div>
            </section>

            {/* Legal disclaimer */}
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed px-4 pb-2">
              Angel 11+ provides original exam-style practice and is not affiliated with or endorsed by any exam board or school.
            </p>

          </div>
        )}
      </main>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4">
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}
