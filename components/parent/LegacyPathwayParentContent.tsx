"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calculator,
  BookMarked,
  Pencil,
  ClipboardList,
  Trophy,
  Target,
  TrendingUp,
  Clock,
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
  Sparkles,
  Flag,
  HelpCircle,
} from "lucide-react";
import { getProgress, getSelectedPathwayId } from "@/lib/progress";
import { computeAnalytics } from "@/lib/analytics";
import { computeGamification } from "@/lib/gamification";
import { computeParentReport, READINESS_CONFIG } from "@/lib/parentInsights";
import { getPathwayById } from "@/lib/pathways";
import { getEligibleSubjectKeys } from "@/lib/ali/pathwayEligibility";
import JourneyTimeline from "@/components/JourneyTimeline";
import { AtAGlancePanel } from "@/components/parent/AtAGlancePanel";
import { InfoCard } from "@/components/ui/Card";
import type { ParentReport } from "@/types/parent";
import type { SubjectAnalytics, SubjectKey } from "@/types/analytics";
import type { Pathway } from "@/types/pathway";
import type { XPMilestone } from "@/types/gamification";
import DifficultyBadge from "@/components/DifficultyBadge";

/**
 * Sprint 4 Completion Package (FD-020, WP4B) — the pathway-specific content
 * for every non-CSSE pathway (GL/CEM/ISEB/Independent/core-foundation/
 * not-sure), extracted verbatim from the former standalone /parent page.
 * Same computeParentReport() data, same JSX, same calculations — a pure
 * move into a branch of the unified Parent Dashboard shell (Mock Performance
 * moved out, now shared — see MockHistorySection). No educational
 * calculation changed by this extraction.
 */

const SUBJECT_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  english: BookOpen,
  maths: Calculator,
  vocabulary: BookMarked,
  writing: Pencil,
  "mock-test": ClipboardList,
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

function statusLabel(s: SubjectAnalytics["status"]): { text: string; className: string } {
  switch (s) {
    case "strong":
      return { text: "Strong", className: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" };
    case "developing":
      return { text: "Developing", className: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300" };
    case "weak":
      return { text: "Focus area", className: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300" };
    case "not-started":
      return { text: "Not started", className: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400" };
  }
}

function InsightIcon({ type }: { type: "positive" | "attention" | "action" }) {
  if (type === "positive")
    return <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />;
  if (type === "attention")
    return <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />;
  return <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />;
}

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

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 text-center">
      {icon}
      <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
      <p className="text-[11px] text-gray-400 dark:text-gray-500">{label}</p>
    </div>
  );
}

export function LegacyPathwayParentContent() {
  const [report, setReport] = useState<ParentReport | null>(null);
  const [pathway, setPathway] = useState<Pathway | undefined>();
  const [nextMilestone, setNextMilestone] = useState<XPMilestone | null>(null);

  useEffect(() => {
    const p = getProgress();
    const analytics = computeAnalytics(p);
    const gamification = computeGamification(p);
    setReport(computeParentReport(p, analytics, gamification));
    setPathway(getPathwayById(getSelectedPathwayId() ?? ""));
    setNextMilestone(gamification.nextMilestone);
  }, []);

  // WP4E (FD-023) — every sibling page/branch shows real loading text; this
  // one previously rendered nothing at all while report was still null,
  // a real behaviour inconsistency even though it's normally a single tick.
  if (!report) return <p className="text-sm text-gray-400 dark:text-gray-500" aria-live="polite">Loading…</p>;

  const readinessCfg = READINESS_CONFIG[report.examReadiness];
  const strongSubjects = report.subjects.filter((s) => s.status === "strong" && s.subject !== "mock-test");
  const eligibleKeys = pathway ? getEligibleSubjectKeys(pathway.id) : undefined;
  const pathwayFocusAreas = eligibleKeys
    ? report.focusAreas.filter((area) => eligibleKeys.has(area.href.replace("/", "") as SubjectKey))
    : [];
  const groupedInsights = {
    positive: report.parentInsights.filter((i) => i.type === "positive"),
    attention: report.parentInsights.filter((i) => i.type === "attention"),
    action: report.parentInsights.filter((i) => i.type === "action"),
  };

  if (!report.hasEnoughData) return <EmptyState />;

  // WP4C (Parent Trust) — every answer below reuses data already computed
  // above for the sections further down this page; no new calculation, no
  // fabricated score. "Should I be concerned" reuses the same real
  // attention-type insights already shown in "Weekly Guidance" — when none
  // exist (the common case), the honest answer is calm, not an
  // overclaiming "all good."
  const atAGlanceAnswers = {
    improving: groupedInsights.positive[0]
      ? groupedInsights.positive[0].text
      : "Not yet a clear signal — that's normal in the first few sessions, and it fills in with more practice.",
    thisWeek: report.focusAreas[0] ? (
      <>
        Focus on <span className="font-medium">{report.focusAreas[0].label}</span> — see Priority Improvement Areas below.
      </>
    ) : (
      "Keep up regular practice across subjects."
    ),
    whyRecommended: report.focusAreas[0]?.detail ?? "No specific priority identified yet.",
    concern: groupedInsights.attention[0] ? groupedInsights.attention[0].text : "No signs of concern in recent evidence.",
    outcome: (
      <>
        <span className="font-medium">{readinessCfg.label}</span> — {readinessCfg.description}
      </>
    ),
  };

  const primaryNextHref = report.focusAreas[0]?.href ?? "/dashboard";
  const primaryNextLabel = report.focusAreas[0] ? `Focus on ${report.focusAreas[0].label} →` : "Continue Practising →";

  return (
    <div className="space-y-5">
      <AtAGlancePanel answers={atAGlanceAnswers} />

      {/* WP4D (FD-022) — one clear primary next step. This pathway has no
          Revision Planner equivalent (Educational Intelligence Engine has
          no model for it), so the honest primary action is the same
          highest-priority focus area already shown in "Priority
          Improvement Areas" below, not a fabricated substitute. */}
      <Link
        href={primaryNextHref}
        className="inline-block bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
      >
        {primaryNextLabel}
      </Link>

      <section className={`rounded-2xl p-5 ${readinessCfg.bgColor}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
              Current Readiness
            </p>
            <p className={`text-lg font-bold ${readinessCfg.textColor}`}>{readinessCfg.label}</p>
          </div>
        </div>
        <div className="h-2 bg-white/60 dark:bg-black/30 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-700 ${readinessCfg.barColor}`}
            style={{ width: `${readinessCfg.pct}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{readinessCfg.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/50 dark:border-black/20">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Weekly Progress</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {report.weeklySessions} session{report.weeklySessions === 1 ? "" : "s"} this week
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Strengths</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {strongSubjects.length > 0
                ? strongSubjects.map((s) => s.label).join(", ")
                : "Still building — no strong subjects identified yet."}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Priority Improvement Areas</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {report.focusAreas.length > 0
                ? report.focusAreas.map((a) => a.label).join(", ")
                : "No priority areas identified yet."}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Next Recommended Focus</p>
            {report.focusAreas[0] ? (
              <Link href={report.focusAreas[0].href} className="text-sm font-semibold text-purple-700 dark:text-purple-300 hover:underline">
                {report.focusAreas[0].label} →
              </Link>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300">Keep up regular practice across subjects.</p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          Progress Story
        </h2>
        <JourneyTimeline hasEnoughData={report.hasEnoughData} readiness={report.examReadiness} />
        <div className="mt-5 pt-4 border-t border-gray-50 dark:border-gray-800 space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>
            <span className="font-semibold text-gray-800 dark:text-gray-100">Started:</span>{" "}
            {report.totalSessions} session{report.totalSessions === 1 ? "" : "s"} completed so far, {report.overallScore > 0 ? `averaging ${report.overallScore}%` : "building an initial picture"}.
          </p>
          <p>
            <span className="font-semibold text-gray-800 dark:text-gray-100">Current position:</span>{" "}
            {readinessCfg.label} — {readinessCfg.description}
          </p>
          <p className="flex items-start gap-1.5">
            <Flag size={13} className="text-purple-500 shrink-0 mt-0.5" />
            <span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">Next milestone:</span>{" "}
              {nextMilestone ? nextMilestone.label : "All current milestones reached — more are on the way."}
            </span>
          </p>
        </div>
      </section>

      <section>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total Sessions" value={String(report.totalSessions)} icon={<Target size={16} className="text-purple-500" />} />
          <StatCard
            label="Overall Score"
            value={report.overallScore > 0 ? `${report.overallScore}%` : "—"}
            icon={<TrendingUp size={16} className="text-blue-500" />}
          />
          <StatCard
            label="Time Practised"
            value={report.estimatedMinutes >= 60 ? `${Math.round(report.estimatedMinutes / 60)}h` : `${report.estimatedMinutes}m`}
            icon={<Clock size={16} className="text-green-500" />}
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Learning Pathway
        </h2>
        <Link href="/pathways" className="bg-white dark:bg-gray-900 rounded-xl p-4 flex items-center gap-3 hover:shadow-sm transition-shadow block">
          <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center shrink-0">
            <MapPin size={17} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            {pathway ? (
              <>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{pathway.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{pathway.subjects.join(" · ")}</p>
                {pathwayFocusAreas.length > 0 && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
                    {pathwayFocusAreas.length} of your priority area{pathwayFocusAreas.length === 1 ? "" : "s"} relate{pathwayFocusAreas.length === 1 ? "s" : ""} directly to this pathway
                  </p>
                )}
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
                      {conf && conf.score > 0 && <DifficultyBadge tier={conf.tier} />}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sl.className}`}>{sl.text}</span>
                    </div>
                  </div>
                  {s.attempts > 0 ? (
                    <>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${s.avgScore}%` }} />
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
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sl.className}`}>{sl.text}</span>
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

      {report.competencySummaries.map((summary) => (
        <section key={summary.subject}>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            {summary.subjectLabel} — How They&apos;re Doing
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

      {report.parentInsights.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Weekly Guidance
          </h2>
          <div className="space-y-4">
            {groupedInsights.positive.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">Doing Well</p>
                <div className="space-y-2">
                  {groupedInsights.positive.map((insight) => (
                    <div key={insight.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 flex gap-3">
                      <InsightIcon type={insight.type} />
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insight.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {groupedInsights.attention.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">Areas to Support</p>
                <div className="space-y-2">
                  {groupedInsights.attention.map((insight) => (
                    <div key={insight.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 flex gap-3">
                      <InsightIcon type={insight.type} />
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insight.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {groupedInsights.action.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">Suggested Actions</p>
                <div className="space-y-2">
                  {groupedInsights.action.map((insight) => (
                    <div key={insight.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 flex gap-3">
                      <InsightIcon type={insight.type} />
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insight.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* WP4C — an honest description of THIS system's real mechanism.
          Deliberately different wording from the CSSE dashboard's "How
          Angel decides": this pathway's guidance comes from session counts,
          scores and streaks compared against fixed milestones, not the
          Educational Intelligence Engine (which has no model for this
          pathway) — claiming the same explanation for both would overstate
          what this page actually does. */}
      <InfoCard className="flex items-start gap-3">
        <HelpCircle size={16} className="text-gray-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">How this guidance works</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            These suggestions come from your child&apos;s real session history — scores, streaks and which subjects
            they&apos;ve tried — compared against typical preparation milestones. It updates after every session.
          </p>
        </div>
      </InfoCard>

      {report.focusAreas.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Priority Improvement Areas
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
                <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">This Week</h2>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5">
          <div className="text-center">
            <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{report.weeklySessions}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Sessions this week</p>
          </div>
        </div>
      </section>

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

      <section className="bg-purple-50 dark:bg-purple-950 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
            <Trophy size={15} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">More on the way</p>
            <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
              We&apos;re adding more detailed reporting, email summaries, and exam countdown features soon.
              Your feedback helps shape what we build next.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
