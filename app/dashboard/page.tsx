"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calculator,
  BookMarked,
  Pencil,
  Target,
  BarChart2,
  Flame,
  Star,
  MapPin,
  Puzzle,
  Play,
  Trophy,
  ChevronRight,
  Clock,
  Compass,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SubjectCard from "@/components/SubjectCard";
import { getProgress, markBadgesSeen, getSelectedPathwayId } from "@/lib/progress";
import { migrateLocalProgressToSupabase } from "@/lib/migrateProgress";
import { computeAnalytics } from "@/lib/analytics";
import { computeAdaptiveState } from "@/lib/adaptiveEngine";
import { computeGamification, BADGE_DEFINITIONS } from "@/lib/gamification";
import { computeParentReport } from "@/lib/parentInsights";
import { getBestMockScoreForPathway, getMockCountForPathway } from "@/lib/mockProgress";
import NewBadgeBanner from "@/components/NewBadgeBanner";
import InsightCard from "@/components/InsightCard";
import { getPathwayById } from "@/lib/pathways";
import { PremiumCard, MissionCard, StatCard, RecommendationCard } from "@/components/ui/Card";
import { ProgressBar, ReadinessIndicator, Badge, StatusIndicator } from "@/components/ui/Progress";
import { ButtonLink } from "@/components/ui/Button";
import JourneyTimeline, { deriveActiveStageIndex } from "@/components/JourneyTimeline";
import type { UserProgress } from "@/types";
import type { AnalyticsReport } from "@/types/analytics";
import type { DailyMission as DailyMissionData } from "@/types/adaptive";
import type { WeeklyGoal, XPMilestone } from "@/types/gamification";
import type { Pathway } from "@/types/pathway";
import type { ParentReport } from "@/types/parent";
import type { MockPathwayId } from "@/types/mock";

/**
 * Angel V2.0 Sprint 2 (Platform Shell) — "My Admission Journey" replaces
 * the previous generic dashboard concept on this same route (/dashboard —
 * routing compatibility preserved). Every data source below is reused
 * unchanged from the prior dashboard: computeAnalytics(), computeAdaptiveState(),
 * computeGamification(), getPathwayById()/getSelectedPathwayId() are called
 * identically. computeParentReport() (already real, already used by
 * app/parent/page.tsx) and lib/mockProgress.ts's real mock-history readers
 * are the only two *newly reused* (not newly computed) data sources this
 * page adds, for the Readiness Snapshot and Upcoming Mock Examinations
 * sections respectively. No competency calculation, recommendation
 * algorithm, or analytics formula is modified anywhere in this file.
 */

// ─── Subject data (unchanged from the prior dashboard) ────────────────────────

const coreSubjects = [
  {
    href: "/english",
    title: "English Comprehension",
    description: "Inference, evidence & atmosphere. Original exam-style passages.",
    icon: BookOpen,
    color: "purple" as const,
    badge: "3 lessons",
  },
  {
    href: "/maths",
    title: "Maths Reasoning",
    description: "Problem-solving, fractions, algebra & timed arithmetic.",
    icon: Calculator,
    color: "blue" as const,
    badge: "10 questions",
  },
  {
    href: "/vocabulary",
    title: "Vocabulary Builder",
    description: "Tier 2 & 3 words with definitions, synonyms and challenges.",
    icon: BookMarked,
    color: "green" as const,
    badge: "Word of the day",
  },
  {
    href: "/writing",
    title: "Creative Writing",
    description: "Narrative, descriptive & persuasive prompts with checklists.",
    icon: Pencil,
    color: "orange" as const,
    badge: "4 prompts",
  },
  {
    href: "/mocks",
    title: "Mock Centre",
    description: "Timed GL, CEM, CSSE & ISEB-style mock exams. Section by section.",
    icon: Target,
    color: "pink" as const,
    badge: "4 pathways",
  },
  {
    href: "/progress",
    title: "My Progress",
    description: "Track your scores, streaks, XP and completed lessons.",
    icon: BarChart2,
    color: "indigo" as const,
  },
];

const reasoningHub = {
  href: "/reasoning",
  title: "Practice",
  description: "Verbal, Non-Verbal, Spatial & Numerical — required for GL, CEM, ISEB and more.",
  icon: Puzzle,
  color: "violet" as const,
  badge: "4 disciplines",
};

// ─── Mission priority styles (unchanged) ───────────────────────────────────────

const missionPriorityChip: Record<string, string> = {
  primary: "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400",
  secondary: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  review: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
};

const PRIORITY_LABEL: Record<string, string> = {
  primary: "Focus",
  secondary: "Next",
  review: "Maintain",
};

/**
 * Sprint 3 (Admission Journey Experience) — "Expected outcome" copy, derived
 * from `item.priority` (an existing, already-computed field — see
 * lib/adaptiveEngine.ts's buildDailyMission()) rather than any new
 * calculation. Fixed, honest, non-fabricated presentation text keyed on a
 * value the recommendation engine already produced.
 */
const EXPECTED_OUTCOME: Record<string, string> = {
  primary: "Directly strengthens your current focus area",
  secondary: "Builds on today's momentum",
  review: "Keeps a mastered skill sharp",
};

/** Sprint 3 — the Admission Hero's stage line reuses JourneyTimeline's own stage labels, not a second naming scheme. */
const STAGE_NAMES = ["Starting", "Building Skills", "Strengthening", "Mock Ready", "Exam Ready"] as const;

const pathwayIconBg: Record<string, string> = {
  blue: "bg-blue-100 dark:bg-blue-900",
  indigo: "bg-indigo-100 dark:bg-indigo-900",
  purple: "bg-purple-100 dark:bg-purple-900",
  emerald: "bg-emerald-100 dark:bg-emerald-900",
  amber: "bg-amber-100 dark:bg-amber-900",
  teal: "bg-teal-100 dark:bg-teal-900",
  gray: "bg-gray-100 dark:bg-gray-800",
};

const pathwayIconText: Record<string, string> = {
  blue: "text-blue-600 dark:text-blue-400",
  indigo: "text-indigo-600 dark:text-indigo-400",
  purple: "text-purple-600 dark:text-purple-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
  teal: "text-teal-600 dark:text-teal-400",
  gray: "text-gray-600 dark:text-gray-400",
};

const MOCK_PATHWAY_IDS: MockPathwayId[] = ["gl", "cem", "csse", "iseb"];

function getEncouragingMessage(progress: UserProgress, weeklyGoal: WeeklyGoal | null): string {
  if (weeklyGoal?.isComplete) return "Weekly goal achieved — outstanding consistency.";
  if (progress.streak >= 14) return "Fourteen days strong. You're building unstoppable habits.";
  if (progress.streak >= 7) return "A full week of practice. Real habits are forming.";
  if (progress.streak >= 3) return "Great consistency this week — keep going.";
  if (progress.completedLessons.length >= 20) return "You're building a strong foundation. Keep it up.";
  if (progress.completedLessons.length >= 5) return "Solid progress — you're on the right track.";
  if (progress.completedLessons.length >= 1) return "Welcome back. Let's make today count.";
  return "Your admission journey starts here.";
}

// ─── Admission Hero — reuses PremiumCard (Sprint 1) instead of a bespoke
// gradient div. Sprint 3 adds target school + admission stage to the
// existing Welcome content; both are already-computed values (pathway,
// hasEnoughData + examReadiness), not new calculations. ────────────────────

function AdmissionHero({
  progress,
  weeklyGoal,
  milestoneProgress,
  nextMilestone,
  pathway,
  hasEnoughData,
  readiness,
}: {
  progress: UserProgress;
  weeklyGoal: WeeklyGoal | null;
  milestoneProgress: number;
  nextMilestone: XPMilestone | null;
  pathway: Pathway | undefined;
  hasEnoughData: boolean;
  readiness: ParentReport["examReadiness"] | null;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const level = Math.floor(progress.xp / 100) + 1;
  const message = getEncouragingMessage(progress, weeklyGoal);
  const stageIndex = readiness ? deriveActiveStageIndex(hasEnoughData, readiness) : 0;

  return (
    <PremiumCard>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-purple-200 text-sm font-medium">{greeting}</p>
          <h1 className="text-white font-bold text-2xl mt-0.5 leading-tight">My Admission Journey</h1>
        </div>
        <div className="bg-white/15 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
          <Star size={13} className="text-yellow-300" />
          <span className="text-white text-sm font-bold">Level {level}</span>
        </div>
      </div>

      {/* Target school + admission stage — both real, already-computed values */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1 text-xs text-purple-100">
          <MapPin size={12} />
          {pathway ? pathway.name : "No target school chosen yet"}
        </span>
        <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1 text-xs text-purple-100">
          <Compass size={12} />
          Stage: {STAGE_NAMES[stageIndex]}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className="text-white font-bold text-2xl leading-none">{progress.xp}</p>
          <p className="text-purple-300 text-xs mt-1">Total XP</p>
        </div>
        <div className="h-8 w-px bg-white/20" />
        <div className="flex items-center gap-1.5">
          <Flame size={16} className="text-orange-300 shrink-0" />
          <div>
            <p className="text-white font-bold text-2xl leading-none">{progress.streak}</p>
            <p className="text-purple-300 text-xs mt-1">Day streak</p>
          </div>
        </div>
        <div className="h-8 w-px bg-white/20" />
        <div>
          <p className="text-white font-bold text-2xl leading-none">{progress.completedLessons.length}</p>
          <p className="text-purple-300 text-xs mt-1">Sessions</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-purple-300 mb-1.5">
          <span>{progress.xp} XP</span>
          {nextMilestone ? (
            <span>→ {nextMilestone.label} ({nextMilestone.threshold} XP)</span>
          ) : (
            <span>Top Rank reached</span>
          )}
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{ width: `${nextMilestone ? milestoneProgress : 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white/10 rounded-xl px-4 py-2.5 flex gap-2.5 items-center">
        <Compass size={14} className="text-yellow-300 shrink-0" />
        <p className="text-purple-100 text-sm font-medium leading-snug">{message}</p>
      </div>
    </PremiumCard>
  );
}

// ─── My Admission Journey ───────────────────────────────────────────────────────

export default function DashboardPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [mission, setMission] = useState<DailyMissionData | null>(null);
  const [weeklyGoal, setWeeklyGoal] = useState<WeeklyGoal | null>(null);
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
  const [milestoneProgress, setMilestoneProgress] = useState<number>(0);
  const [nextMilestone, setNextMilestone] = useState<XPMilestone | null>(null);
  const [pathway, setPathway] = useState<Pathway | undefined>();
  const [parentReport, setParentReport] = useState<ParentReport | null>(null);

  useEffect(() => {
    const p = getProgress();
    const r = computeAnalytics(p);
    const adaptive = computeAdaptiveState(p, r);
    const gamification = computeGamification(p);

    setProgress(p);
    setReport(r);
    setMission(adaptive.dailyMission);
    setWeeklyGoal(gamification.weeklyGoal);
    setNewBadgeIds(gamification.newlyEarnedIds);
    setEarnedBadgeIds(gamification.earnedIds);
    setMilestoneProgress(gamification.milestoneProgress);
    setNextMilestone(gamification.nextMilestone);
    setPathway(getPathwayById(getSelectedPathwayId() ?? ""));
    // Readiness Snapshot reuses computeParentReport() exactly as app/parent/page.tsx
    // already does — same three real inputs, no new calculation.
    setParentReport(computeParentReport(p, r, gamification));
    migrateLocalProgressToSupabase().catch(() => {});
  }, []);

  function handleDismissBanner() {
    markBadgesSeen(newBadgeIds);
    setNewBadgeIds([]);
  }

  const earnedBadges = BADGE_DEFINITIONS.filter((b) => earnedBadgeIds.includes(b.id));
  const accentBg = pathway ? (pathwayIconBg[pathway.accentColor] ?? pathwayIconBg.purple) : pathwayIconBg.purple;
  const accentText = pathway ? (pathwayIconText[pathway.accentColor] ?? pathwayIconText.purple) : pathwayIconText.purple;
  const topMissionItem = mission && mission.items.length > 0 ? mission.items[0] : null;
  const mockSupported = pathway && MOCK_PATHWAY_IDS.includes(pathway.id as MockPathwayId);
  const bestMockScore = mockSupported ? getBestMockScoreForPathway(pathway!.id as MockPathwayId) : null;
  const mockAttempts = mockSupported ? getMockCountForPathway(pathway!.id as MockPathwayId) : 0;

  return (
    <PageLayout breadcrumbs={[{ label: "My Admission Journey" }]}>
      <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-8">

        {/* 1. Admission Hero */}
        {progress && (
          <AdmissionHero
            progress={progress}
            weeklyGoal={weeklyGoal}
            milestoneProgress={milestoneProgress}
            nextMilestone={nextMilestone}
            pathway={pathway}
            hasEnoughData={report?.hasEnoughData ?? false}
            readiness={parentReport?.examReadiness ?? null}
          />
        )}

        {newBadgeIds.length > 0 && (
          <NewBadgeBanner newlyEarnedIds={newBadgeIds} onDismiss={handleDismissBanner} />
        )}

        {/* 2. School Intelligence — "pathway" already models which exam
             board/school family a learner is targeting (AEP-002 §13); no
             new school data model is introduced, only renamed framing.
             EEP-001 (Navigation Excellence): renamed from "Target Schools"
             to match the nav item and the /pathways page's own H1 (both
             already "School Intelligence" since Sprint 7) — this dashboard
             heading was the one remaining place still using the older
             label. */}
        <section>
          <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-3">School Intelligence</h2>
          <Link
            href="/pathways"
            className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-5 py-4 shadow-sm hover:shadow-md hover:border-purple-100 dark:hover:border-purple-900 active:scale-[0.98] transition-all group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${accentBg}`}>
              <MapPin size={22} className={accentText} />
            </div>
            <div className="flex-1 min-w-0">
              {pathway ? (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 dark:text-purple-500 mb-0.5">
                    Current Target
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 font-bold text-base leading-snug">{pathway.name}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5 line-clamp-1">{pathway.description}</p>
                </>
              ) : (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 dark:text-purple-500 mb-0.5">
                    Get Started
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 font-bold text-base leading-snug">Choose Your Pathway</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">GL · CEM · CSSE · ISEB · Independent</p>
                </>
              )}
            </div>
            <ChevronRight size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors shrink-0" />
          </Link>
        </section>

        {/* 2b. Journey Timeline — presentation only; see components/JourneyTimeline.tsx
             for the exact, honest mapping onto existing hasEnoughData/examReadiness. */}
        <section>
          <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-4">Your Admissions Journey</h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <JourneyTimeline hasEnoughData={report?.hasEnoughData ?? false} readiness={parentReport?.examReadiness ?? "not-ready"} />
          </div>
        </section>

        {/* 3. Today's Admission Mission */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
                <Target size={17} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl leading-tight">Today&apos;s Admission Mission</h2>
                {pathway && (
                  <p className="text-xs text-purple-500 dark:text-purple-400 font-medium mt-0.5">{pathway.shortName} pathway</p>
                )}
              </div>
            </div>
            {mission && mission.items.length > 0 && (
              <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                <Clock size={12} />
                <span className="text-xs font-medium">~{mission.totalMinutes} min</span>
              </div>
            )}
          </div>

          {mission && mission.items.length > 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <ol className="p-5 space-y-3 list-none">
                {mission.items.map((item, i) => (
                  <MissionCard key={item.id} priority={item.priority}>
                    <div className="w-6 h-6 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${missionPriorityChip[item.priority]}`}>
                          {PRIORITY_LABEL[item.priority]}
                        </span>
                        <span className="text-gray-900 dark:text-gray-100 font-semibold text-sm">{item.label}</span>
                      </div>
                      <p className="text-gray-400 dark:text-gray-500 text-xs leading-relaxed">{item.reason}</p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Clock size={10} className="text-gray-300 dark:text-gray-600" />
                          <span className="text-gray-300 dark:text-gray-600 text-xs">~{item.estimatedMinutes} min</span>
                        </div>
                        <span className="text-gray-300 dark:text-gray-600 text-xs">·</span>
                        <span className="text-gray-400 dark:text-gray-500 text-xs italic">{EXPECTED_OUTCOME[item.priority]}</span>
                      </div>
                    </div>
                  </MissionCard>
                ))}
              </ol>
              <div className="h-px bg-gray-100 dark:bg-gray-800 mx-5" />
              <div className="p-5">
                <Link
                  href={mission.items[0].href}
                  className="flex items-center justify-center gap-2.5 w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.98] dark:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-xl py-3.5 font-semibold text-sm transition-all shadow-sm shadow-purple-200 dark:shadow-purple-950"
                >
                  <Play size={16} />
                  Start Today&apos;s Mission
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target size={30} className="text-purple-400 dark:text-purple-600" />
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-bold text-base mb-1.5">Start your first session</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed mb-5 max-w-xs mx-auto">
                Complete any practice to unlock your personalised admission mission
              </p>
              <Link href="/english" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white rounded-xl px-5 py-2.5 font-semibold text-sm transition-all">
                <Play size={14} />
                Start Learning
              </Link>
            </div>
          )}
        </section>

        {/* 4. Readiness Snapshot — every value below reuses an existing,
             already-computed field (report.strongSubjects/weakSubjects,
             progress.streak/weeklyGoal, gamification.nextMilestone,
             parentReport.examReadiness). No new metric is introduced. */}
        <section>
          <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-3">Readiness Snapshot</h2>
          {parentReport && parentReport.hasEnoughData ? (
            <div className="space-y-3">
              <ReadinessIndicator readiness={parentReport.examReadiness} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-600 mb-2">Current Strengths</p>
                  {report && report.strongSubjects.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {report.strongSubjects.map((label) => (
                        <StatusIndicator key={label} tone="success" label={label} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500">No standout strengths yet — every session helps build one.</p>
                  )}
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-600 mb-2">Priority Improvement Areas</p>
                  {report && report.weakSubjects.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {report.weakSubjects.map((label) => (
                        <StatusIndicator key={label} tone="warning" label={label} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500">No priority areas flagged right now.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950 flex items-center justify-center shrink-0">
                    <Flame size={16} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Momentum</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {progress?.streak ?? 0} day streak{weeklyGoal ? ` · ${weeklyGoal.sessions}/${weeklyGoal.target} sessions this week` : ""}
                    </p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                    <Star size={16} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Next Milestone</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {nextMilestone ? `${nextMilestone.label} at ${nextMilestone.threshold} XP` : "Top rank reached"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950 rounded-xl flex items-center justify-center shrink-0">
                <BarChart2 size={18} className="text-purple-300 dark:text-purple-700" />
              </div>
              <div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Not enough data yet</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">Complete a few more sessions to unlock your readiness snapshot</p>
              </div>
            </div>
          )}
        </section>

        {/* 5. Recommended Next Step — spotlights the same top-priority mission
             item above via RecommendationCard, the same real reason text,
             not a second recommendation computation. */}
        {topMissionItem && (
          <section>
            <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-3">Recommended Next Step</h2>
            <RecommendationCard icon={Target} title={topMissionItem.label} reason={topMissionItem.reason} color="purple" />
          </section>
        )}

        {/* 6. Recent Progress */}
        {progress && (
          <section>
            <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-3">Recent Progress</h2>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <StatCard icon={Flame} value={progress.streak} label="Day streak" color="orange" />
              <StatCard icon={Trophy} value={progress.completedLessons.length} label="Sessions" color="amber" />
              <StatCard icon={Star} value={progress.xp} label="Total XP" color="purple" />
            </div>

            {weeklyGoal && (
              <div className="mb-3">
                <ProgressBar
                  percent={(weeklyGoal.sessions / weeklyGoal.target) * 100}
                  color={weeklyGoal.isComplete ? "emerald" : "purple"}
                  label="Weekly goal progress"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  {weeklyGoal.isComplete ? "Weekly goal complete — great work!" : `${weeklyGoal.sessions} of ${weeklyGoal.target} sessions this week`}
                </p>
              </div>
            )}

            {earnedBadges.length > 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-600 mb-3">Badges Earned</p>
                <div className="flex flex-wrap gap-2">
                  {earnedBadges.slice(0, 6).map((badge) => (
                    <Badge key={badge.id} label={badge.name} />
                  ))}
                  {earnedBadges.length > 6 && (
                    <Link href="/progress" className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      +{earnedBadges.length - 6} more
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950 rounded-xl flex items-center justify-center shrink-0">
                  <Trophy size={18} className="text-purple-300 dark:text-purple-700" />
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Badges unlock as you learn</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">Complete sessions to earn your first badge</p>
                </div>
              </div>
            )}

            {/* Learning Insights — existing functionality (previously its own
                section), carried forward unchanged inside Recent Progress
                rather than dropped, per "existing functionality continues to
                operate unchanged." */}
            {report && report.hasEnoughData && report.insights.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-600">Learning Insights</p>
                  <Link href="/progress" className="text-purple-600 dark:text-purple-400 text-xs font-medium hover:underline">
                    Full report →
                  </Link>
                </div>
                <div className="flex flex-col gap-2">
                  {report.insights.slice(0, 2).map((insight) => (
                    <InsightCard key={insight.id} insight={insight} compact />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* 7. Upcoming Mock Examinations — honestly framed as "available," not
             "scheduled": no real mock-scheduling concept exists anywhere in
             this codebase, and this sprint does not invent one. */}
        <section>
          <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-3">Mock Examinations Available</h2>
          {pathway && mockSupported ? (
            <Link
              href="/mocks"
              className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-5 py-4 shadow-sm hover:shadow-md active:scale-[0.98] transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-900 flex items-center justify-center shrink-0">
                <Trophy size={22} className="text-pink-600 dark:text-pink-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 dark:text-gray-100 font-bold text-base leading-snug">{pathway.name} Mock Exam</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                  {mockAttempts > 0 ? `${mockAttempts} attempt${mockAttempts === 1 ? "" : "s"} · Best score ${bestMockScore}%` : "Not attempted yet"}
                </p>
              </div>
              <ChevronRight size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors shrink-0" />
            </Link>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-50 dark:bg-pink-950 rounded-xl flex items-center justify-center shrink-0">
                <Trophy size={18} className="text-pink-300 dark:text-pink-700" />
              </div>
              <div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                  {pathway ? "No mock exam yet for this pathway" : "Choose target schools to see available mocks"}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">Visit the Mock Centre to see what&apos;s available</p>
              </div>
            </div>
          )}
        </section>

        {/* 8. Quick Actions — the four actions this sprint asks for explicitly,
             each reusing an existing route; the fuller subject grid below is
             kept as existing functionality, not replaced. */}
        <section>
          <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
            <ButtonLink href={topMissionItem?.href ?? "/english"} variant="primary" size="sm" leftIcon={<Play size={14} />}>
              Continue
            </ButtonLink>
            <ButtonLink href="/reasoning" variant="secondary" size="sm" leftIcon={<Puzzle size={14} />}>
              Practise
            </ButtonLink>
            <ButtonLink href="/mocks" variant="secondary" size="sm" leftIcon={<Trophy size={14} />}>
              Take a Mock
            </ButtonLink>
            <ButtonLink href="/progress" variant="outline" size="sm" leftIcon={<BarChart2 size={14} />}>
              Review Progress
            </ButtonLink>
          </div>

          <div className="mb-4">
            <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl">Quick Access</h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-0.5">English · Maths · Vocabulary · Writing · Mock Centre</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreSubjects.map((subject) => (
              <SubjectCard key={subject.href} {...subject} />
            ))}
          </div>
          <div className="mt-7">
            <SubjectCard {...reasoningHub} />
          </div>
        </section>

        {/* 9. About + disclaimer */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">About Angel 11+</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-2">
            Original exam-style practice for UK 11+ preparation across English, Maths, Reasoning, Writing and Vocabulary.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs leading-relaxed">
            Angel 11+ provides original practice content and is not affiliated with or endorsed by any exam board or school.
          </p>
        </div>

      </div>
    </PageLayout>
  );
}
