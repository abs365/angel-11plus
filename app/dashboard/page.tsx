"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Target,
  BarChart2,
  MapPin,
  Play,
  Trophy,
  ChevronRight,
  Clock,
  Compass,
  TrendingUp,
  Pencil,
  Info,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import Popover from "@/components/ui/Popover";
import { getProgress, markBadgesSeen, getSelectedPathwayId } from "@/lib/progress";
import { migrateLocalProgressToSupabase } from "@/lib/migrateProgress";
import { computeAnalytics } from "@/lib/analytics";
import { computeAdaptiveState } from "@/lib/adaptiveEngine";
import { computeGamification } from "@/lib/gamification";
import { computeParentReport, READINESS_CONFIG } from "@/lib/parentInsights";
import { getMockResults, bestScoreForPathway, countForPathway } from "@/lib/mockProgress";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { computeSubjectPreparationSummary, applyCanonicalWritingEvidence, toAliCompetencySignal } from "@/lib/learningEngine/preparationState";
import { derivePreparationStage, stagePrinciple } from "@/lib/learningEngine/preparationStage";
import { resolvePreparationClock } from "@/lib/learningEngine/preparationClock";
import { buildPreparationDecision, type PreparationDecision, type ActivityType } from "@/lib/learningEngine/preparationDecision";
import { hasFullLessonAvailable } from "@/lib/learningEngine/fullLessonRegistry";
import { getRecommendations } from "@/lib/learningEngine/educationalIntelligenceService";
import { competencyLabel } from "@/lib/ali/labels";
import NewBadgeBanner from "@/components/NewBadgeBanner";
import { getPathwayById } from "@/lib/pathways";
import { useChildName } from "@/lib/useChildName";
import { useHouseholdMode } from "@/lib/useHouseholdMode";
import ParentSetupCard from "@/components/parent/ParentSetupCard";
import { ButtonLink } from "@/components/ui/Button";
import { deriveActiveStageIndex } from "@/components/JourneyTimeline";
import type { UserProgress } from "@/types";
import type { AnalyticsReport } from "@/types/analytics";
import type { DailyMission as DailyMissionData } from "@/types/adaptive";
import type { WeeklyGoal } from "@/types/gamification";
import type { Pathway } from "@/types/pathway";
import type { ParentReport } from "@/types/parent";
import type { MockPathwayId, MockResult } from "@/types/mock";

/**
 * AUTHENTICATED EXPERIENCE & DESIGN SYSTEM MIGRATION, Increment 1 (Today) —
 * presentation-layer rewrite only, per the governing instruction's own "no
 * educational regression... experience layer only" boundary. Every data
 * source below (getProgress, computeAnalytics, computeAdaptiveState,
 * computeGamification, computeParentReport, the CSSE preparationDecision
 * block, getMockResults) is BYTE-IDENTICAL to the prior implementation —
 * this pass changed zero lines inside the data-fetching effect. What
 * changed is composition and colour: the governing instruction's own
 * suggested hierarchy (Greeting -> Today's Plan -> primary recommended
 * activity -> "why this today?" -> duration -> Start action -> secondary
 * progress/Mock) replaces the previous two-stacked-cards layout (a
 * standalone "Angel recommends next" card directly above a separate
 * Mission-list card, both real, but presented as two competing surfaces
 * rather than one connected story), and ANGEL_11PLUS_PRODUCT_DESIGN_
 * STANDARD_V1.md's tokens (--angel-navy/-ink/-blue/-sky/-border/-paper)
 * replace the generic gray-900/gray-500/gray-100/sky-700 classes
 * throughout. The Angel tokens already branch light/dark via CSS
 * (app/globals.css), so most elements below need no separate `dark:`
 * class -- verified against the homepage's own identical convention.
 */

const MISSION_ACCENT_DOT: Record<string, string> = {
  primary: "bg-amber-500",
  secondary: "bg-sky-500",
  review: "bg-emerald-500",
};

const PRIORITY_LABEL: Record<string, string> = {
  primary: "Focus",
  secondary: "Next",
  review: "Maintain",
};

/**
 * Turns the canonical decision contract's own ActivityType + competencyId
 * into a plain learner-facing phrase ("Learn percentages", "Practise
 * inference", "Revisit fractions"...). Pure presentation: every decision
 * this function's INPUT reflects was already made by
 * lib/learningEngine/preparationDecision.ts -- unchanged from the prior
 * implementation.
 */
function describeRecommendedActivity(activityType: ActivityType, competencyId: string | null): string {
  const label = competencyId ? competencyLabel(competencyId) : null;
  switch (activityType) {
    case "placement_check":
      return "Complete a short placement check";
    case "teaching_lesson":
      return label ? `Learn ${label}` : "Learn a new topic";
    case "guided_practice":
      return label ? `Practise ${label} with support` : "Practise with support";
    case "independent_practice":
      return label ? `Practise ${label}` : "Practise independently";
    case "revision_retrieval":
      return label ? `Revisit ${label}` : "Revisit a previous topic";
    case "unseen_transfer_check":
      return label ? `Try an unseen ${label} check` : "Try an unseen transfer check";
    case "timed_assessment":
      return "Take an appropriate timed assessment";
  }
}

const STAGE_NAMES = ["Starting", "Building Foundations", "Building Skills", "Developing Confidence", "Admission Ready"] as const;

const MOCK_PATHWAY_IDS: MockPathwayId[] = ["gl", "cem", "csse", "iseb"];

function getEncouragingMessage(progress: UserProgress, weeklyGoal: WeeklyGoal | null): string {
  if (weeklyGoal?.isComplete) return "Weekly goal achieved. Outstanding consistency.";
  if (progress.streak >= 14) return "Your consistency is building real, lasting confidence.";
  if (progress.streak >= 7) return "A full week of practice. Real habits are forming.";
  if (progress.streak >= 3) return "Great consistency this week. Keep going.";
  if (progress.completedLessons.length >= 20) return "You're building a strong foundation. Keep it up.";
  if (progress.completedLessons.length >= 5) return "Solid progress. You're on the right track.";
  if (progress.completedLessons.length >= 1) return "Welcome back. Let's make today count.";
  return "Your admission journey starts here.";
}

// The child's display name is a local-only, optional label (LR-01) -- its
// storage, per-account scoping and legacy migration live in
// lib/childProfile.ts, read through useChildName().

function OrientationHeader({
  progress,
  weeklyGoal,
  pathway,
  hasEnoughData,
  readiness,
  childName,
  onSaveChildName,
}: {
  progress: UserProgress;
  weeklyGoal: WeeklyGoal | null;
  pathway: Pathway | undefined;
  hasEnoughData: boolean;
  readiness: ParentReport["examReadiness"] | null;
  childName: string | null;
  onSaveChildName: (name: string) => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const message = getEncouragingMessage(progress, weeklyGoal);
  const stageIndex = readiness ? deriveActiveStageIndex(hasEnoughData, readiness) : 0;
  const confidenceLabel = READINESS_CONFIG[readiness ?? "not-ready"].label;

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSaveChildName(nameDraft);
    setEditingName(false);
    setNameDraft("");
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-[var(--angel-muted)] text-sm font-medium">
          {greeting}
          {childName ? `, ${childName}` : ""}
        </p>
        {!editingName && (
          <button
            type="button"
            onClick={() => {
              setNameDraft(childName ?? "");
              setEditingName(true);
            }}
            className="flex items-center gap-1 text-[var(--angel-muted)] hover:text-[var(--angel-blue)] text-xs font-medium shrink-0 py-1 transition-colors motion-reduce:transition-none"
          >
            <Pencil size={11} aria-hidden="true" />
            {childName ? "Edit" : "Add your child's first name"}
          </button>
        )}
      </div>

      {editingName && (
        <form onSubmit={handleNameSubmit} className="flex items-center gap-2 mb-3">
          <label htmlFor="child-name-input" className="sr-only">
            Child&apos;s name
          </label>
          <input
            id="child-name-input"
            type="text"
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            placeholder="e.g. Priya"
            className="flex-1 min-w-0 bg-[var(--angel-ivory)] placeholder-[var(--angel-muted)] text-[var(--angel-navy)] text-sm rounded-lg px-3 py-2 border border-[var(--angel-border)] focus-visible:outline-2 focus-visible:outline-[var(--angel-blue)] focus-visible:outline-offset-2"
          />
          <button
            type="submit"
            className="text-xs font-semibold bg-[var(--angel-blue)] text-white rounded-lg px-3 py-2 hover:opacity-90 transition-opacity motion-reduce:transition-none"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditingName(false)}
            className="text-xs font-medium text-[var(--angel-muted)] hover:text-[var(--angel-navy)] px-2 py-2 transition-colors motion-reduce:transition-none"
          >
            Cancel
          </button>
        </form>
      )}

      <p className="text-[var(--angel-navy)] font-bold text-xl leading-snug mb-3">{message}</p>

      <div className="flex items-center gap-2 flex-wrap text-xs text-[var(--angel-muted)]">
        <span className="inline-flex items-center gap-1.5 bg-[var(--angel-sky)] rounded-full px-3 py-1.5 text-[var(--angel-ink)]">
          <MapPin size={12} aria-hidden="true" />
          {pathway ? pathway.name : "No target school chosen yet"}
        </span>
        <span className="inline-flex items-center gap-1.5 bg-[var(--angel-sky)] rounded-full px-3 py-1.5 text-[var(--angel-ink)]">
          <Compass size={12} aria-hidden="true" />
          {STAGE_NAMES[stageIndex]}
        </span>
        <span className="inline-flex items-center gap-1.5 bg-[var(--angel-sky)] rounded-full px-3 py-1.5 text-[var(--angel-ink)]">
          <TrendingUp size={12} aria-hidden="true" />
          {confidenceLabel}
        </span>
        <span>{progress.completedLessons.length} sessions so far</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [mission, setMission] = useState<DailyMissionData | null>(null);
  const [preparationDecision, setPreparationDecision] = useState<PreparationDecision | null>(null);
  const [weeklyGoal, setWeeklyGoal] = useState<WeeklyGoal | null>(null);
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([]);
  const [pathway, setPathway] = useState<Pathway | undefined>();
  const [parentReport, setParentReport] = useState<ParentReport | null>(null);
  const { name: childName, ready: childNameReady, save: saveChildName } = useChildName();
  const { isLearnerMode } = useHouseholdMode();
  const [mockResults, setMockResults] = useState<MockResult[]>([]);

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
    setPathway(getPathwayById(getSelectedPathwayId() ?? ""));
    setParentReport(computeParentReport(p, r, gamification));
    getMockResults().then(setMockResults);
    migrateLocalProgressToSupabase().catch(() => {});

    if (p.selectedPathwayId === "csse") {
      const supabase = getSupabaseClient();
      if (supabase) {
        (async () => {
          const profileId = await ensureProfile();
          if (!profileId) return;

          const [writingSummary, mathsSummary, englishSummary] = await Promise.all([
            computeSubjectPreparationSummary(supabase, profileId, "Continuous Writing"),
            computeSubjectPreparationSummary(supabase, profileId, "Mathematics"),
            computeSubjectPreparationSummary(supabase, profileId, "English Comprehension"),
          ]);

          const correctedReport = applyCanonicalWritingEvidence(r, writingSummary.evidenceState);

          const missionViewProgress: UserProgress = {
            ...p,
            aliCompetencySignal: {
              ...p.aliCompetencySignal,
              maths: toAliCompetencySignal(mathsSummary, "maths"),
              english: toAliCompetencySignal(englishSummary, "english"),
            },
          };

          const preparationClock = resolvePreparationClock(new Date());
          const stage = derivePreparationStage([writingSummary, mathsSummary, englishSummary], preparationClock, p.schoolYear);
          const adaptiveMission = computeAdaptiveState(missionViewProgress, correctedReport).dailyMission;
          const correctedMission =
            stage === "insufficient_evidence" ? adaptiveMission : { ...adaptiveMission, tagline: stagePrinciple(stage) };

          setReport(correctedReport);
          setMission(correctedMission);
          setParentReport(computeParentReport(p, correctedReport, gamification));

          const allCompetencyIds = [writingSummary, mathsSummary, englishSummary].flatMap((s) => s.competencies.map((c) => c.competencyId));
          getRecommendations(supabase, profileId, allCompetencyIds, new Date(), preparationClock.daysRemaining)
            .then((recommendations) => {
              const decision = buildPreparationDecision(
                [writingSummary, mathsSummary, englishSummary],
                preparationClock,
                p.schoolYear,
                recommendations.ordered,
                recommendations.vetoedCompetencyCodes,
                { hasFullLessonAvailable }
              );
              setPreparationDecision(decision);
            })
            .catch(() => {});
        })().catch(() => {
          // Real ALI evidence is unreachable (offline, RLS, etc.) -- fail
          // open to the legacy report already set above, never block or
          // error the dashboard for a correction pass that is additive by
          // design.
        });
      }
    }
  }, []);

  function handleDismissBanner() {
    markBadgesSeen(newBadgeIds);
    setNewBadgeIds([]);
  }

  function handleSaveChildName(name: string) {
    saveChildName(name);
  }

  const mockSupported = pathway && MOCK_PATHWAY_IDS.includes(pathway.id as MockPathwayId);
  const bestMockScore = mockSupported ? bestScoreForPathway(mockResults, pathway!.id as MockPathwayId) : null;
  const mockAttempts = mockSupported ? countForPathway(mockResults, pathway!.id as MockPathwayId) : 0;

  const primaryItem = mission && mission.items.length > 0 ? mission.items[0] : null;
  const secondaryItems = mission && mission.items.length > 1 ? mission.items.slice(1) : [];
  // The single "why this today" line: prefer the canonical decision
  // contract's own stagePrincipleText (CSSE, real evidence) when it has
  // resolved; the primary mission item's own real reason otherwise or in
  // the meantime -- never invented, always one of these two already-real
  // engine outputs.
  const whyToday = preparationDecision?.stagePrincipleText ?? primaryItem?.reason ?? null;
  const primaryActivityLabel = preparationDecision
    ? describeRecommendedActivity(preparationDecision.recommendedActivityType, preparationDecision.recommendedCompetencyId)
    : primaryItem?.label ?? null;

  return (
    <PageLayout breadcrumbs={[{ label: "My Admission Journey" }]}>
      <div className="max-w-4xl lg:max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <h1 className="sr-only">Today</h1>

        {progress && (
          <OrientationHeader
            progress={progress}
            weeklyGoal={weeklyGoal}
            pathway={pathway}
            hasEnoughData={report?.hasEnoughData ?? false}
            readiness={parentReport?.examReadiness ?? null}
            childName={childName}
            onSaveChildName={handleSaveChildName}
          />
        )}

        {progress && childNameReady && (!childName || !pathway) && (
          <ParentSetupCard
            hasName={Boolean(childName)}
            pathwayName={pathway?.shortName ?? null}
            onSaveName={handleSaveChildName}
          />
        )}

        {newBadgeIds.length > 0 && (
          <div className="mt-5">
            <NewBadgeBanner
              newlyEarnedIds={newBadgeIds}
              onDismiss={handleDismissBanner}
              progressHref={getSelectedPathwayId() === "csse" ? "/learning-intelligence" : "/progress"}
            />
          </div>
        )}

        <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
          <div className="lg:col-span-2">
            <section>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-[var(--angel-navy)] font-bold text-2xl leading-tight">Today&apos;s Plan</h2>
                  {isLearnerMode ? (
                    pathway && (
                      <p className="text-xs text-[var(--angel-muted)] font-medium mt-0.5">
                        Your preparation: {pathway.shortName}
                      </p>
                    )
                  ) : pathway ? (
                    <Link
                      href="/pathways"
                      className="inline-flex items-center gap-1 text-xs text-[var(--angel-blue)] font-medium mt-0.5 hover:underline"
                    >
                      {pathway.shortName} pathway · School Intelligence
                      <ChevronRight size={11} aria-hidden="true" />
                    </Link>
                  ) : (
                    <Link href="/pathways" className="inline-flex items-center gap-1 text-xs text-[var(--angel-blue)] font-medium mt-0.5 hover:underline">
                      Choose your target pathway
                      <ChevronRight size={11} aria-hidden="true" />
                    </Link>
                  )}
                </div>
                {mission && mission.items.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[var(--angel-muted)] bg-[var(--angel-sky)] px-3 py-1.5 rounded-full shrink-0">
                    <Clock size={12} />
                    <span className="text-xs font-medium">~{mission.totalMinutes} min</span>
                  </div>
                )}
              </div>

              {primaryItem ? (
                // ONE connected hero surface: recommended activity, the real
                // "why this today" evidence (canonical decision contract when
                // resolved, the mission engine's own reason otherwise), effort
                // and a single clear Start action -- replaces the previous
                // two-stacked-cards layout (a standalone "Angel recommends
                // next" card directly above a separate mission-list card)
                // with the governing design standard's own connected-section
                // hierarchy. Both real data sources are still shown, in one
                // place, never invented.
                <div className="bg-[var(--angel-paper)] rounded-lg border border-[var(--angel-border)] shadow-sm overflow-hidden">
                  <div className="p-5 md:p-6 border-b border-[var(--angel-border)]">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--angel-blue)] mb-1.5">
                      Today&apos;s recommended activity
                    </p>
                    <p className="text-[var(--angel-navy)] font-bold text-xl leading-snug mb-2">
                      {primaryActivityLabel ?? primaryItem.label}
                    </p>
                    {whyToday && (
                      <div className="flex items-start gap-2 mt-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--angel-muted)] mb-1">
                            Why this today?
                          </p>
                          <p className="text-[var(--angel-ink)] text-sm leading-relaxed opacity-90">{whyToday}</p>
                        </div>
                        {/* LR-01 — child-accessible, just-in-time transparency at
                            the one point the product acts on a child's own
                            performance evidence to choose what to show next. */}
                        <Popover
                          label="Why does Angel suggest this?"
                          align="right"
                          trigger={(props) => (
                            <button
                              {...props}
                              className="shrink-0 text-[var(--angel-muted)] hover:text-[var(--angel-navy)] p-0.5"
                            >
                              <Info size={16} aria-hidden="true" />
                              <span className="sr-only">Why does Angel suggest this?</span>
                            </button>
                          )}
                        >
                          <div className="w-72 max-w-[80vw] bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg shadow-lg p-4 text-sm text-[var(--angel-ink)] leading-relaxed">
                            <p className="font-semibold text-[var(--angel-navy)] mb-2">Why does Angel suggest this?</p>
                            <ul className="space-y-1.5 list-disc pl-4">
                              <li>Angel remembers how you&apos;re getting on with each topic you practise.</li>
                              <li>Your answers and results help Angel suggest useful practice for next time.</li>
                              <li>Your parent or carer can see your learning progress.</li>
                              <li>If you write something for feedback, a computer program helps check it and give you tips.</li>
                              <li>Angel doesn&apos;t need things like your address, a photo, or your location to work.</li>
                              <li>Not sure about something? Ask your parent or carer — they&apos;re in charge of your Angel account.</li>
                              <li>You, or your parent or carer, can always ask us for help with your information.</li>
                            </ul>
                            <Link href="/privacy" className="inline-block mt-3 text-[var(--angel-blue)] font-medium hover:underline">
                              Read our full Privacy Notice →
                            </Link>
                          </div>
                        </Popover>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mt-4 text-xs text-[var(--angel-muted)]">
                      <Clock size={12} aria-hidden="true" />
                      <span>~{primaryItem.estimatedMinutes} min</span>
                    </div>
                  </div>
                  <div className="p-5 md:p-6">
                    <ButtonLink href={primaryItem.href} size="lg" className="w-full justify-center" leftIcon={<Play size={16} aria-hidden="true" />}>
                      Start today&apos;s plan
                    </ButtonLink>
                    <p className="text-[var(--angel-muted)] text-xs text-center mt-3">
                      Your Progress and Learning Report update automatically once you finish.
                    </p>
                  </div>

                  {secondaryItems.length > 0 && (
                    <div className="border-t border-[var(--angel-border)] px-5 md:px-6 py-4">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--angel-muted)] mb-2.5">
                        Then
                      </p>
                      <ul className="space-y-2.5">
                        {secondaryItems.map((item) => (
                          <li key={item.id}>
                            <Link href={item.href} className="flex items-start gap-2.5 group">
                              <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${MISSION_ACCENT_DOT[item.priority]}`} />
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[var(--angel-navy)] text-sm font-semibold group-hover:underline">{item.label}</span>
                                  <span className="text-[9px] font-bold uppercase tracking-wide text-[var(--angel-muted)]">
                                    {PRIORITY_LABEL[item.priority]}
                                  </span>
                                </span>
                                <span className="block text-[var(--angel-muted)] text-xs leading-relaxed mt-0.5">{item.reason}</span>
                              </span>
                              <span className="text-[var(--angel-muted)] text-xs shrink-0">~{item.estimatedMinutes} min</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                // Placement / new-learner state: honest about needing a
                // starting check, never claiming personalisation before
                // evidence exists (governing instruction's own wording).
                <div className="bg-[var(--angel-paper)] rounded-lg border border-[var(--angel-border)] shadow-sm p-8 text-center">
                  <div className="w-16 h-16 bg-[var(--angel-sky)] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Target size={30} className="text-[var(--angel-blue)]" />
                  </div>
                  <p className="text-[var(--angel-navy)] font-bold text-base mb-1.5">Let&apos;s find your starting point</p>
                  <p className="text-[var(--angel-muted)] text-sm leading-relaxed mb-5 max-w-xs mx-auto">
                    A short check helps Angel choose the right level and what to practise first.
                  </p>
                  <ButtonLink
                    href={getSelectedPathwayId() === "csse" ? "/learning-intelligence/learn" : "/english"}
                    leftIcon={<Play size={14} aria-hidden="true" />}
                  >
                    Start
                  </ButtonLink>
                </div>
              )}
            </section>
          </div>

          <div className="mt-8 lg:mt-0 lg:col-span-1">
            <div className="bg-[var(--angel-paper)] rounded-lg border border-[var(--angel-border)] p-5 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--angel-muted)] mb-3">
                  Your Progress
                </p>
                {parentReport && parentReport.hasEnoughData ? (
                  <div className="space-y-3">
                    <ReadinessBar readiness={parentReport.examReadiness} />
                    {weeklyGoal && (
                      <p className="text-xs text-[var(--angel-muted)]">
                        {weeklyGoal.isComplete
                          ? "Weekly goal complete. Great work!"
                          : `${weeklyGoal.sessions} of ${weeklyGoal.target} sessions this week`}
                      </p>
                    )}
                    <ButtonLink
                      href={getSelectedPathwayId() === "csse" ? "/learning-intelligence" : "/progress"}
                      variant="outline"
                      size="sm"
                      className="w-full justify-center"
                    >
                      View full progress →
                    </ButtonLink>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--angel-sky)] rounded-lg flex items-center justify-center shrink-0">
                      <BarChart2 size={18} className="text-[var(--angel-blue)] opacity-60" />
                    </div>
                    <p className="text-[var(--angel-muted)] text-xs leading-relaxed">
                      Complete a few more sessions to unlock your progress snapshot
                    </p>
                  </div>
                )}
              </div>

              <div className="h-px bg-[var(--angel-border)]" />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--angel-muted)] mb-3">
                  Mock Exams
                </p>
                {pathway && mockSupported ? (
                  <Link href="/mocks" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-lg bg-[var(--angel-sky)] flex items-center justify-center shrink-0">
                      <Trophy size={18} className="text-[var(--angel-blue)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--angel-navy)] font-semibold text-sm leading-snug">{pathway.name} Mock Exam</p>
                      <p className="text-[var(--angel-muted)] text-xs mt-0.5">
                        {mockAttempts > 0 ? `${mockAttempts} attempt${mockAttempts === 1 ? "" : "s"} · Best ${bestMockScore}%` : "Not attempted yet"}
                      </p>
                    </div>
                    <ChevronRight size={16} aria-hidden="true" className="text-[var(--angel-muted)] group-hover:text-[var(--angel-blue)] transition-colors motion-reduce:transition-none shrink-0" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--angel-sky)] rounded-lg flex items-center justify-center shrink-0 opacity-60">
                      <Trophy size={18} className="text-[var(--angel-blue)]" />
                    </div>
                    <p className="text-[var(--angel-muted)] text-xs leading-relaxed">
                      {pathway ? "No mock exam yet for this pathway" : "Choose target schools to see available mocks"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--angel-border)]">
          <p className="text-[var(--angel-muted)] text-xs font-semibold uppercase tracking-wide mb-2">About Angel 11+</p>
          <p className="text-[var(--angel-muted)] text-xs leading-relaxed opacity-90">
            Original exam-style practice for UK 11+ preparation across English, Maths, Reasoning, Writing and Vocabulary. Angel 11+ provides original practice content and is not affiliated with or endorsed by any exam board or school.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}

/**
 * Same visual language as the prior ReadinessIndicator (components/ui/
 * Progress.tsx), reimplemented locally with Angel tokens rather than
 * editing that shared component -- Progress.tsx's own page is explicitly
 * out of this increment's scope (governing instruction: "It does NOT
 * redesign... Progress internals"), and ReadinessIndicator is consumed
 * there too. Same real READINESS_CONFIG data, same bar semantics.
 */
function ReadinessBar({ readiness }: { readiness: ParentReport["examReadiness"] }) {
  const config = READINESS_CONFIG[readiness];
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-[var(--angel-navy)]">{config.label}</span>
      </div>
      <div className="bg-[var(--angel-sky)] rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--angel-blue)] transition-all duration-700"
          style={{ width: `${config.pct}%` }}
        />
      </div>
    </div>
  );
}
