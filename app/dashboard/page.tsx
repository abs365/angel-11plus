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
  CheckCircle,
  Trophy,
  Award,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SubjectCard from "@/components/SubjectCard";
import { getProgress, markBadgesSeen, getSelectedPathwayId } from "@/lib/progress";
import { migrateLocalProgressToSupabase } from "@/lib/migrateProgress";
import { computeAnalytics } from "@/lib/analytics";
import { computeAdaptiveState } from "@/lib/adaptiveEngine";
import { computeGamification, BADGE_DEFINITIONS } from "@/lib/gamification";
import InsightCard from "@/components/InsightCard";
import NewBadgeBanner from "@/components/NewBadgeBanner";
import { getPathwayById } from "@/lib/pathways";
import type { UserProgress } from "@/types";
import type { AnalyticsReport } from "@/types/analytics";
import type { DailyMission as DailyMissionData } from "@/types/adaptive";
import type { WeeklyGoal, XPMilestone } from "@/types/gamification";
import type { Pathway } from "@/types/pathway";

// ─── Subject data ─────────────────────────────────────────────────────────────

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
    title: "Practice Mocks",
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

// Angel UX V3 — the 4 reasoning disciplines are no longer listed
// individually on the dashboard (previously 4 more subject cards below the
// 6 core ones — 10 cards on one screen). They collapse into one Reasoning
// Hub card, mirroring the nav collapse (ANGEL_NAVIGATION_ARCHITECTURE.md §2).
const reasoningHub = {
  href: "/reasoning",
  title: "Reasoning",
  description: "Verbal, Non-Verbal, Spatial & Numerical — required for GL, CEM, ISEB and more.",
  icon: Puzzle,
  color: "violet" as const,
  badge: "4 disciplines",
};

// ─── Mission priority styles ───────────────────────────────────────────────────

const missionPriorityBorder: Record<string, string> = {
  primary: "border-l-rose-400 dark:border-l-rose-600",
  secondary: "border-l-amber-400 dark:border-l-amber-600",
  review: "border-l-emerald-400 dark:border-l-emerald-600",
};

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

// ─── Pathway accent ───────────────────────────────────────────────────────────

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

// ─── Encouraging message ──────────────────────────────────────────────────────

function getEncouragingMessage(progress: UserProgress, weeklyGoal: WeeklyGoal | null): string {
  if (weeklyGoal?.isComplete) return "Weekly goal achieved — outstanding consistency.";
  if (progress.streak >= 14) return "Fourteen days strong. You're building unstoppable habits.";
  if (progress.streak >= 7) return "A full week of practice. Real habits are forming.";
  if (progress.streak >= 3) return "Great consistency this week — keep going.";
  if (progress.completedLessons.length >= 20) return "You're building a strong foundation. Keep it up.";
  if (progress.completedLessons.length >= 5) return "Solid progress — you're on the right track.";
  if (progress.completedLessons.length >= 1) return "Welcome back. Let's make today count.";
  return "Welcome to Angel 11+. Your journey starts here.";
}

// ─── Welcome Hero ─────────────────────────────────────────────────────────────

function WelcomeHero({
  progress,
  weeklyGoal,
  milestoneProgress,
  nextMilestone,
}: {
  progress: UserProgress;
  weeklyGoal: WeeklyGoal | null;
  milestoneProgress: number;
  nextMilestone: XPMilestone | null;
}) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const level = Math.floor(progress.xp / 100) + 1;
  const message = getEncouragingMessage(progress, weeklyGoal);

  return (
    <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 rounded-2xl px-6 py-5 shadow-lg shadow-purple-200 dark:shadow-purple-950">
      {/* Name + Level */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-purple-200 text-sm font-medium">{greeting}</p>
          <h1 className="text-white font-bold text-2xl mt-0.5 leading-tight">Angel</h1>
        </div>
        <div className="bg-white/15 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
          <Star size={13} className="text-yellow-300" />
          <span className="text-white text-sm font-bold">Level {level}</span>
        </div>
      </div>

      {/* Stats row */}
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
          <p className="text-white font-bold text-2xl leading-none">
            {progress.completedLessons.length}
          </p>
          <p className="text-purple-300 text-xs mt-1">Sessions</p>
        </div>
      </div>

      {/* Milestone progress bar */}
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

      {/* Encouraging message */}
      <div className="bg-white/10 rounded-xl px-4 py-2.5 flex gap-2.5 items-center">
        <Sparkles size={14} className="text-yellow-300 shrink-0" />
        <p className="text-purple-100 text-sm font-medium leading-snug">{message}</p>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

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
    migrateLocalProgressToSupabase().catch(() => {});
  }, []);

  function handleDismissBanner() {
    markBadgesSeen(newBadgeIds);
    setNewBadgeIds([]);
  }

  const earnedBadges = BADGE_DEFINITIONS.filter((b) => earnedBadgeIds.includes(b.id));
  const accentBg = pathway ? (pathwayIconBg[pathway.accentColor] ?? pathwayIconBg.purple) : pathwayIconBg.purple;
  const accentText = pathway ? (pathwayIconText[pathway.accentColor] ?? pathwayIconText.purple) : pathwayIconText.purple;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-8">

        {/* 1. Welcome Hero */}
        {progress && (
          <WelcomeHero
            progress={progress}
            weeklyGoal={weeklyGoal}
            milestoneProgress={milestoneProgress}
            nextMilestone={nextMilestone}
          />
        )}

        {/* 2. New Badge Banner */}
        {newBadgeIds.length > 0 && (
          <NewBadgeBanner newlyEarnedIds={newBadgeIds} onDismiss={handleDismissBanner} />
        )}

        {/* 3. Today's Mission */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
                <Target size={17} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl leading-tight">
                  Today&apos;s Mission
                </h2>
                {pathway && (
                  <p className="text-xs text-purple-500 dark:text-purple-400 font-medium mt-0.5">
                    {pathway.shortName} pathway
                  </p>
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
              {/* Mission items — an ordered list of prioritised actions (AEI-002:
                  semantic <ol>/<li>, not just a visual "1/2/3" chip, so a
                  screen reader announces "list, N items" / "item N of N";
                  list-none preserves the exact prior visual appearance). */}
              <ol className="p-5 space-y-3 list-none">
                {mission.items.map((item, i) => (
                  <li
                    key={item.id}
                    className={`flex items-start gap-3.5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border-l-4 ${missionPriorityBorder[item.priority]}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${missionPriorityChip[item.priority]}`}
                        >
                          {PRIORITY_LABEL[item.priority]}
                        </span>
                        <span className="text-gray-900 dark:text-gray-100 font-semibold text-sm">
                          {item.label}
                        </span>
                      </div>
                      <p className="text-gray-400 dark:text-gray-500 text-xs leading-relaxed">
                        {item.reason}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Clock size={10} className="text-gray-300 dark:text-gray-600" />
                        <span className="text-gray-300 dark:text-gray-600 text-xs">
                          ~{item.estimatedMinutes} min
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>

              {/* Divider */}
              <div className="h-px bg-gray-100 dark:bg-gray-800 mx-5" />

              {/* Single CTA */}
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
            /* Empty state — first visit */
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target size={30} className="text-purple-400 dark:text-purple-600" />
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-bold text-base mb-1.5">
                Start your first session
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed mb-5 max-w-xs mx-auto">
                Complete any practice to unlock your personalised daily mission
              </p>
              <Link
                href="/english"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white rounded-xl px-5 py-2.5 font-semibold text-sm transition-all"
              >
                <Play size={14} />
                Start Learning
              </Link>
            </div>
          )}
        </section>

        {/* 4. Continue Learning — Core Subjects */}
        <section>
          <div className="mb-4">
            <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl">
              Continue Learning
            </h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-0.5">
              English · Maths · Vocabulary · Writing · Mocks
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreSubjects.map((subject) => (
              <SubjectCard key={subject.href} {...subject} />
            ))}
          </div>

          {/* Reasoning Hub — one card, not four (Angel UX V3) */}
          <div className="mt-7">
            <SubjectCard {...reasoningHub} />
          </div>
        </section>

        {/* 5. Achievements */}
        {progress && (
          <section>
            <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-3">
              Achievements
            </h2>

            {/* Coloured stat cards */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-orange-50 dark:bg-orange-950 rounded-2xl border border-orange-100 dark:border-orange-900 p-4 text-center">
                <Flame size={24} className="text-orange-500 mx-auto mb-2" />
                <p className="text-orange-900 dark:text-orange-100 font-bold text-2xl leading-none">
                  {progress.streak}
                </p>
                <p className="text-orange-400 dark:text-orange-500 text-[11px] mt-1.5 font-medium">
                  Day streak
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950 rounded-2xl border border-amber-100 dark:border-amber-900 p-4 text-center">
                <Trophy size={24} className="text-amber-500 mx-auto mb-2" />
                <p className="text-amber-900 dark:text-amber-100 font-bold text-2xl leading-none">
                  {progress.completedLessons.length}
                </p>
                <p className="text-amber-400 dark:text-amber-500 text-[11px] mt-1.5 font-medium">
                  Sessions
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950 rounded-2xl border border-purple-100 dark:border-purple-900 p-4 text-center">
                <Star size={24} className="text-purple-500 mx-auto mb-2" />
                <p className="text-purple-900 dark:text-purple-100 font-bold text-2xl leading-none">
                  {progress.xp}
                </p>
                <p className="text-purple-400 dark:text-purple-500 text-[11px] mt-1.5 font-medium">
                  Total XP
                </p>
              </div>
            </div>

            {/* Weekly goal */}
            {weeklyGoal && (
              <div
                className={`flex items-center gap-3 rounded-xl px-4 py-3.5 border mb-3 ${
                  weeklyGoal.isComplete
                    ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900"
                    : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
                }`}
              >
                {weeklyGoal.isComplete ? (
                  <CheckCircle size={20} className="text-emerald-500 shrink-0" />
                ) : (
                  <div className="flex gap-1.5 shrink-0">
                    {Array.from({ length: weeklyGoal.target }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          i < weeklyGoal.sessions
                            ? "bg-indigo-400 dark:bg-indigo-500"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                )}
                <p
                  className={`text-sm font-medium leading-snug ${
                    weeklyGoal.isComplete
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {weeklyGoal.isComplete
                    ? "Weekly goal complete — great work!"
                    : `${weeklyGoal.sessions} of ${weeklyGoal.target} sessions this week`}
                </p>
              </div>
            )}

            {/* Earned badges */}
            {earnedBadges.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-600 mb-3">
                  Badges Earned
                </p>
                <div className="flex flex-wrap gap-2">
                  {earnedBadges.slice(0, 6).map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-full text-xs font-medium border border-purple-100 dark:border-purple-900"
                    >
                      <Award size={11} />
                      {badge.name}
                    </div>
                  ))}
                  {earnedBadges.length > 6 && (
                    <Link
                      href="/progress"
                      className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      +{earnedBadges.length - 6} more
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* No badges yet */}
            {earnedBadges.length === 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950 rounded-xl flex items-center justify-center shrink-0">
                  <Award size={18} className="text-purple-300 dark:text-purple-700" />
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                    Badges unlock as you learn
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                    Complete sessions to earn your first badge
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 6. Your Pathway */}
        <section>
          <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-3">
            Your Pathway
          </h2>
          <Link
            href="/pathways"
            className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-5 py-4 shadow-sm hover:shadow-md hover:border-purple-100 dark:hover:border-purple-900 active:scale-[0.98] transition-all group"
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${accentBg}`}
            >
              <MapPin size={22} className={accentText} />
            </div>
            <div className="flex-1 min-w-0">
              {pathway ? (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 dark:text-purple-500 mb-0.5">
                    Current Pathway
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 font-bold text-base leading-snug">
                    {pathway.name}
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5 line-clamp-1">
                    {pathway.description}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 dark:text-purple-500 mb-0.5">
                    Get Started
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 font-bold text-base leading-snug">
                    Choose Your 11+ Pathway
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                    GL · CEM · CSSE · ISEB · Independent
                  </p>
                </>
              )}
            </div>
            <ChevronRight
              size={18}
              className="text-gray-300 dark:text-gray-600 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors shrink-0"
            />
          </Link>
        </section>

        {/* 7. Learning Insights */}
        {report && report.hasEnoughData && report.insights.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl">
                Learning Insights
              </h2>
              <Link
                href="/progress"
                className="text-purple-600 dark:text-purple-400 text-xs font-medium hover:underline"
              >
                Full report →
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {report.insights.slice(0, 2).map((insight) => (
                <InsightCard key={insight.id} insight={insight} compact />
              ))}
            </div>
          </section>
        )}

        {/* 8. About + disclaimer */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
            About Angel 11+
          </p>
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
