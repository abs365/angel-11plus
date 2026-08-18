"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Target,
  BarChart2,
  MapPin,
  Puzzle,
  Play,
  Trophy,
  ChevronRight,
  Clock,
  Compass,
  TrendingUp,
  Pencil,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
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
import NewBadgeBanner from "@/components/NewBadgeBanner";
import InsightCard from "@/components/InsightCard";
import { getPathwayById } from "@/lib/pathways";
import { Card, PremiumCard, MissionCard } from "@/components/ui/Card";
import { ProgressBar, ReadinessIndicator, StatusIndicator } from "@/components/ui/Progress";
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
 * Angel V2.1 EEP-002 (Homepage Excellence) — the homepage is no longer a
 * dashboard; it is the learner's daily coaching starting point ("how am I
 * doing / what should I do today / why does it matter / what's next").
 * Every data source is reused unchanged from Sprints 1-10
 * (computeAnalytics, computeAdaptiveState, computeGamification,
 * computeParentReport, getPathwayById/getSelectedPathwayId,
 * lib/mockProgress.ts) — this sprint only removes duplication and
 * reorders/re-emphasises presentation. Specifically removed as
 * duplicated or low-value, per this sprint's own "every section must
 * justify its presence": the standalone Journey Timeline section (its
 * stage was already shown in the Hero's own chip, and the full stepper
 * is unchanged and still lives on /progress, Sprint 10's Progress
 * Journey); the separate "Recommended Next Step" card (it repeated
 * Today's Mission's own #1 item and reason text verbatim); the
 * Readiness Snapshot's Momentum/Next-Milestone card pair and Recent
 * Progress's StatCard trio (both repeated the Hero's own XP/streak/
 * session numbers a second and third time); the always-visible Badges
 * Earned grid (redundant with NewBadgeBanner's celebratory moment and
 * /progress's own Achievements section); and the seven-card Quick
 * Access subject grid (redundant with the persistent sidebar nav and
 * the Learn/Practice/Mock Centre hub pages themselves).
 */

// ─── Mission priority styles ────────────────────────────────────────────────
// Final Visual Refinement (Section 4) — priority is now read primarily from
// position/numbering/typography, with colour reduced to one small dot per
// item rather than a saturated uppercase pill. See Card.tsx's MISSION_STYLE
// for the matching card-surface/border half of this same change.

const MISSION_ACCENT_DOT: Record<string, string> = {
  primary: "bg-amber-500",
  secondary: "bg-sky-500",
  review: "bg-emerald-500",
};

const MISSION_LABEL_TYPE: Record<string, string> = {
  primary: "text-gray-900 dark:text-gray-100 font-bold text-base",
  secondary: "text-gray-900 dark:text-gray-100 font-semibold text-sm",
  review: "text-gray-600 dark:text-gray-400 font-medium text-sm",
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

/**
 * Sprint 3 — the Admission Hero's stage line reuses JourneyTimeline's own
 * stage labels, not a second naming scheme. EEP-003: updated to match
 * JourneyTimeline.tsx's own relabelled STAGES exactly (Building
 * Foundations / Building Skills / Developing Confidence / Admission
 * Ready) — same five positions, same derivation, calmer wording only.
 */
const STAGE_NAMES = ["Starting", "Building Foundations", "Building Skills", "Developing Confidence", "Admission Ready"] as const;

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

/**
 * EEP-003 (Calm Progress & Premium Educational Identity) — the streak>=14
 * branch previously read "Fourteen days strong," leading with a raw
 * streak count; reworded to lead with confidence/preparation instead, per
 * this sprint's "reduce emphasis on... Streaks; increase emphasis on...
 * Confidence" instruction. Same trigger conditions and real signals
 * (progress.streak, weeklyGoal, completedLessons.length) throughout —
 * wording only.
 */
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

// ─── Admission Hero — reuses PremiumCard (Sprint 1). Product Experience
// Standard V1 Correction 2 removes the Level/XP/streak stat line entirely
// (previously de-emphasised into one small line per EEP-002/003 — this
// Wave removes it, not just repositions it). The session count alone
// remains: it's a plain completion count, not a gamification score.
//
// AN-102 (Premium Dashboard Experience) — the Hero must answer "how is my
// child doing / what's today's focus / how confident are we" within five
// seconds. Three additions, all reusing already-computed data, no new
// calculation:
//   - A third chip surfaces READINESS_CONFIG's own label (the same real,
//     evidence-based band Progress Snapshot already shows via
//     ReadinessIndicator below) — "confidence" was previously only visible
//     after scrolling past Today's Mission.
//   - A "Focus today" line names the mission's own #1 item — previously
//     only visible inside the Mission card itself.
//   - text-purple-200 → text-purple-100 for the greeting line: measured at
//     ~3.95:1 against the card's purple-600 fill, below the 4.5:1 AA
//     threshold for normal text (purple-100 measures ~4.56:1) — the same
//     class of correction as Sprint 1's own logged success/warning/info
//     WCAG fixes, found and fixed here rather than left for a later audit.
// ───────────────────────────────────────────────────────────────────────

const CHILD_NAME_KEY = "angel_child_name";

/**
 * No mechanism anywhere in this product currently captures a real child's
 * name (`profiles.name` exists in the schema but is always the literal
 * default "Angel", written once, never read back — verified in
 * lib/supabaseProgress.ts before writing this). Rather than fabricate a
 * name or invent a new schema-backed profile feature (outside this work
 * package's "Dashboard only" scope, and no migration is permitted), this
 * is a minimal, local-only, fully optional and fully reversible affordance
 * — the same tier of mechanism getSelectedPathwayId() already uses. It is
 * a deliberate, disclosed interpretation of Step 3's "child's name"
 * requirement, not a claim that this is how the product will store names
 * long-term; flagged for Founder review in the AN-102 report.
 */
function saveChildName(next: string): string | null {
  const trimmed = next.trim().slice(0, 40);
  if (!trimmed) return null;
  localStorage.setItem(CHILD_NAME_KEY, trimmed);
  return trimmed;
}

function AdmissionHero({
  progress,
  weeklyGoal,
  pathway,
  hasEnoughData,
  readiness,
  focusLabel,
  childName,
  onSaveChildName,
}: {
  progress: UserProgress;
  weeklyGoal: WeeklyGoal | null;
  pathway: Pathway | undefined;
  hasEnoughData: boolean;
  readiness: ParentReport["examReadiness"] | null;
  focusLabel: string | null;
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
    <PremiumCard>
      {/* New Angel Visual System — PremiumCard is now a light surface
          (Card.tsx), so its contents read dark-on-light with a soft purple
          accent, matching every other card in the product, instead of the
          previous white/light-tint-on-solid-colour treatment. */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
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
            className="flex items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-sky-700 dark:hover:text-sky-400 text-xs font-medium shrink-0 py-1 transition-colors motion-reduce:transition-none"
          >
            <Pencil size={11} aria-hidden="true" />
            {childName ? "Edit" : "Add your child's name"}
          </button>
        )}
      </div>

      {editingName && (
        <form onSubmit={handleNameSubmit} className="flex items-center gap-2 mb-4">
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
            className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-2"
          />
          <button
            type="submit"
            className="text-xs font-semibold bg-sky-700 text-white rounded-lg px-3 py-2 hover:bg-sky-800 transition-colors motion-reduce:transition-none"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditingName(false)}
            className="text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-2 transition-colors motion-reduce:transition-none"
          >
            Cancel
          </button>
        </form>
      )}

      <p className="text-gray-900 dark:text-gray-100 font-bold text-2xl leading-snug mb-6">{message}</p>

      {/* Final Visual Refinement (Section 5) — these three chips are
          metadata, not brand actions or interactive controls: the text
          itself already communicates meaning, so a saturated purple pill
          repeated three times in a row added colour volume without adding
          information, and crowded the Hero's real content (greeting,
          message, focus line). Neutral pills now, no colour asked of them. */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        <span className="inline-flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-full px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400">
          <MapPin size={12} aria-hidden="true" />
          {pathway ? pathway.name : "No target school chosen yet"}
        </span>
        <span className="inline-flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-full px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400">
          <Compass size={12} aria-hidden="true" />
          {STAGE_NAMES[stageIndex]}
        </span>
        <span className="inline-flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-full px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400">
          <TrendingUp size={12} aria-hidden="true" />
          {confidenceLabel}
        </span>
      </div>

      {focusLabel && (
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Focus today: <span className="text-gray-900 dark:text-gray-100 font-medium">{focusLabel}</span>
        </p>
      )}

      <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500 text-xs pt-4 border-t border-gray-100 dark:border-gray-800">
        <span>{progress.completedLessons.length} sessions</span>
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
  const [pathway, setPathway] = useState<Pathway | undefined>();
  const [parentReport, setParentReport] = useState<ParentReport | null>(null);
  const [childName, setChildName] = useState<string | null>(null);
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
    // Readiness Snapshot reuses computeParentReport() exactly as app/parent/page.tsx
    // already does — same three real inputs, no new calculation.
    setParentReport(computeParentReport(p, r, gamification));
    // AN-102 — read alongside everything else already loaded here, rather
    // than a second effect, so this doesn't add a new instance of this
    // file's existing (pre-AN-102) set-state-in-effect pattern.
    setChildName(localStorage.getItem(CHILD_NAME_KEY));
    // Increment 4 — one read, derived per-pathway below via the pure
    // bestScoreForPathway()/countForPathway() helpers, same idiom.
    getMockResults().then(setMockResults);
    migrateLocalProgressToSupabase().catch(() => {});

    // Educational Increment 007V (Part 8/9/10) + 007W (Part 2) — the
    // bounded, proven integration both increments ship together: for a
    // CSSE learner, fetch canonical evidence for every real CSSE subject
    // with content (Mathematics, English, Continuous Writing — real
    // ali_student_question_history via lib/learningEngine/
    // preparationState.ts, never bypassing the Educational Intelligence
    // Engine), then:
    //   1. Correct the Writing entry in the legacy report if real
    //      evidence disagrees (007V, unchanged, still a no-op when they
    //      already agree).
    //   2. Feed Mathematics/English evidence into the SAME real-evidence
    //      branch lib/adaptiveEngine.ts's urgency()/aliReasonText() were
    //      ALREADY built to prefer (the p.aliCompetencySignal shape) —
    //      007W's own root-cause finding: that branch exists precisely for
    //      this, but was previously only ever fed by the separate
    //      /mocks/adaptive/* pages, never by the real CSSE Practice
    //      pathway, so it was permanently empty for a CSSE-only learner and
    //      every mission decision fell through to the legacy branch. No new
    //      mission-selection logic was written — the existing,
    //      already-correct real-evidence branch just finally receives real
    //      data, held in memory only for this render (see
    //      missionViewProgress below — never persisted via
    //      recordAliCompetencySignal, per the bounded-volatility fix this
    //      increment also made: a dashboard view must never write learning
    //      evidence).
    // A brief legacy-then-corrected render is an accepted, pre-existing
    // pattern on this page (getMockResults() already resolves after
    // initial render the same way); it never shows a false "0%" or a
    // recommendation to unavailable content, only ever the pre-existing
    // legacy copy briefly before the honest one replaces it. Because
    // nothing in this block is persisted, the settled (post-async) state is
    // now deterministic across repeated loads given unchanged evidence.
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

          // 007W bounded-volatility fix -- viewing the dashboard must never
          // manufacture or persist learning evidence (a real defect this
          // increment's own live verification caught: recordAliCompetency
          // Signal() previously wrote maths/english signals to localStorage
          // on every page view, which then fed the NEXT load's initial
          // synchronous paint before that load's own async correction
          // landed, producing a genuinely different mission on repeated
          // loads with zero learner activity between them). Maths/English
          // now follow Writing's own, already-correct, already-persistence-
          // free pattern exactly: recomputed fresh from real Supabase
          // evidence every load, held only in memory for this render, never
          // written back to UserProgress. This view-only object feeds
          // mission selection alone -- it is deliberately NOT passed to
          // computeParentReport(), preserving 007W's own disclosed scoping
          // decision (no Maths/English insight-card migration this
          // increment) exactly as before, so this fix changes no other
          // surface's behaviour.
          const missionViewProgress: UserProgress = {
            ...p,
            aliCompetencySignal: {
              ...p.aliCompetencySignal,
              maths: toAliCompetencySignal(mathsSummary, "maths"),
              english: toAliCompetencySignal(englishSummary, "english"),
            },
          };

          // Part 5 -- prove the preparation stage has real operational
          // value: when real evidence supports a stage beyond
          // "insufficient_evidence," its principle replaces the mission
          // tagline. This is deliberately messaging-only this increment; it
          // never changes which activities are selected.
          //
          // Programme Increment 008B -- school year is now plumbed in from
          // the real, parent-supplied UserProgress.schoolYear (007W's own
          // disclosed gap: this parameter previously had no real caller
          // anywhere). Absent (undefined) still means "developmentally
          // eligible for late-stage work" per derivePreparationStage's own
          // unchanged, pre-existing convention -- a parent who has not set
          // a school year sees exactly the same behaviour as before this
          // change, never a new restriction.
          const stage = derivePreparationStage(
            [writingSummary, mathsSummary, englishSummary],
            resolvePreparationClock(new Date()),
            p.schoolYear
          );
          const adaptiveMission = computeAdaptiveState(missionViewProgress, correctedReport).dailyMission;
          const correctedMission =
            stage === "insufficient_evidence" ? adaptiveMission : { ...adaptiveMission, tagline: stagePrinciple(stage) };

          setReport(correctedReport);
          setMission(correctedMission);
          setParentReport(computeParentReport(p, correctedReport, gamification));
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
    const saved = saveChildName(name);
    if (saved) setChildName(saved);
  }

  const accentBg = pathway ? (pathwayIconBg[pathway.accentColor] ?? pathwayIconBg.purple) : pathwayIconBg.purple;
  const accentText = pathway ? (pathwayIconText[pathway.accentColor] ?? pathwayIconText.purple) : pathwayIconText.purple;
  const topMissionItem = mission && mission.items.length > 0 ? mission.items[0] : null;
  const mockSupported = pathway && MOCK_PATHWAY_IDS.includes(pathway.id as MockPathwayId);
  const bestMockScore = mockSupported ? bestScoreForPathway(mockResults, pathway!.id as MockPathwayId) : null;
  const mockAttempts = mockSupported ? countForPathway(mockResults, pathway!.id as MockPathwayId) : 0;

  return (
    <PageLayout breadcrumbs={[{ label: "My Admission Journey" }]}>
      <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-8">

        {/* AN-102 — this page had no <h1> anywhere in its render tree
            (Breadcrumbs renders a <span>, not a heading), so every visible
            <h2> below was skipping a level. The Hero's own message is
            dynamic/motivational copy, not a stable page title, so a
            visually-hidden, stable heading carries the real document
            structure instead of changing the Hero's design. */}
        <h1 className="sr-only">Today</h1>

        {/* 1. Admission Hero */}
        {progress && (
          <AdmissionHero
            progress={progress}
            weeklyGoal={weeklyGoal}
            pathway={pathway}
            hasEnoughData={report?.hasEnoughData ?? false}
            readiness={parentReport?.examReadiness ?? null}
            focusLabel={topMissionItem?.label ?? null}
            childName={childName}
            onSaveChildName={handleSaveChildName}
          />
        )}

        {newBadgeIds.length > 0 && (
          <NewBadgeBanner newlyEarnedIds={newBadgeIds} onDismiss={handleDismissBanner} />
        )}

        {/* 2. School Focus — EEP-002: shrunk from a full section with its
             own H2 and description text into a slim strip placed directly
             above Today's Mission, connecting pathway to today's mission
             spatially rather than as an equally-weighted separate section
             ("keep pathway information short, meaningful and connected to
             today's mission"). The claim that today's mission is
             pathway-prioritised is real: lib/adaptiveEngine.ts's
             buildDailyMission() calls getEligibleSubjectKeys(selectedPathwayId)
             to filter candidates before building the mission — verified in
             source, not asserted. The standalone Journey Timeline section
             is removed entirely — its stage is already shown in the Hero's
             "Stage: X" chip above, and the full stepper is unchanged and
             still available on /progress (Sprint 10's Progress Journey). */}
        <Link
          href="/pathways"
          className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3 hover:shadow-sm hover:border-sky-100 dark:hover:border-sky-900 active:scale-[0.98] transition-all motion-reduce:transition-none group"
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accentBg}`}>
            <MapPin size={17} className={accentText} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {pathway ? `Today's mission is prioritised for ${pathway.name}` : "Choose your target pathway"}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {pathway ? "Tap to review School Intelligence" : "GL · CEM · CSSE · ISEB · Independent"}
            </p>
          </div>
          <ChevronRight size={16} aria-hidden="true" className="text-gray-300 dark:text-gray-600 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors motion-reduce:transition-none shrink-0" />
        </Link>

        {/* 3. Today's Admission Mission — EEP-002: this is now the
             homepage's primary visual focus, moved directly beneath the
             Hero and School Focus strip rather than sitting several
             sections down the page. Every item already states its
             objective (label), expected benefit (EXPECTED_OUTCOME, keyed
             on the engine's own priority field), estimated effort
             (estimatedMinutes) and links to a primary action (Start
             Today's Mission) — all four of this sprint's required fields
             were already real and reused, only the position changed. */}
        {/* Product Experience Standard, Stage 1 (ANGEL_EXPERIENCE_SYSTEM_V1.md
            Section C/Part 16) — Today's Mission is the dashboard's PRIMARY
            action: a larger heading (text-2xl, up from text-xl) and a raised,
            accent-bordered Card visually separate it from the SECONDARY
            sections below (Progress Snapshot, Mock Examinations), which keep
            a smaller heading and a flat card — establishing real typographic
            hierarchy instead of every section reading as equally weighted. */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-900 flex items-center justify-center shrink-0">
                <Target size={17} className="text-sky-700 dark:text-sky-400" />
              </div>
              <div>
                <h2 className="text-gray-900 dark:text-gray-100 font-bold text-2xl leading-tight">Today&apos;s Admission Mission</h2>
                {pathway && (
                  <p className="text-xs text-sky-700 dark:text-sky-400 font-medium mt-0.5">{pathway.shortName} pathway</p>
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
            <Card elevation="raised" accent="primary" padding="none" className="overflow-hidden">
              <ol className="p-5 space-y-3 list-none">
                {mission.items.map((item, i) => (
                  <MissionCard key={item.id} priority={item.priority}>
                    <div className="w-6 h-6 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full shrink-0 ${MISSION_ACCENT_DOT[item.priority]}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                          {PRIORITY_LABEL[item.priority]}
                        </span>
                      </div>
                      <p className={`leading-snug mb-1 ${MISSION_LABEL_TYPE[item.priority]}`}>{item.label}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{item.reason}</p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Clock size={10} className="text-gray-300 dark:text-gray-600" />
                          <span className="text-gray-400 dark:text-gray-500 text-xs">~{item.estimatedMinutes} min</span>
                        </div>
                        <span className="text-gray-300 dark:text-gray-600 text-xs">·</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs italic">{EXPECTED_OUTCOME[item.priority]}</span>
                      </div>
                    </div>
                  </MissionCard>
                ))}
              </ol>
              <div className="h-px bg-gray-100 dark:bg-gray-800 mx-5" />
              <div className="p-5">
                <Link
                  href={mission.items[0].href}
                  className="flex items-center justify-center gap-2.5 w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.98] dark:bg-purple-600 dark:hover:bg-purple-500 text-white rounded-xl py-3.5 font-semibold text-sm transition-all motion-reduce:transition-none shadow-sm shadow-purple-200 dark:shadow-purple-950"
                >
                  <Play size={16} aria-hidden="true" />
                  Start Today&apos;s Mission
                </Link>
                {/* AN-102 — answers "what happens after today's work" at the
                    exact point a parent/child decides to start, using only
                    real, already-true product behaviour (progress and the
                    Learning Report already update after every session) —
                    not a new promise or calculation. */}
                <p className="text-gray-400 dark:text-gray-500 text-xs text-center mt-3">
                  Your Progress and Learning Report update automatically once you finish.
                </p>
              </div>
            </Card>
          ) : (
            <Card elevation="raised" padding="spacious" className="text-center">
              <div className="w-16 h-16 bg-sky-50 dark:bg-sky-950 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target size={30} className="text-sky-400 dark:text-sky-600" />
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-bold text-base mb-1.5">Start your first session</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed mb-5 max-w-xs mx-auto">
                Complete any practice to unlock your personalised admission mission
              </p>
              {/* New Angel Legacy Experience Audit: this first-run empty
                  state (no evidence yet, so no Daily Mission items) must not
                  send a CSSE-pathway learner into the old, superseded
                  /english lesson hub — the same branching Navigation.tsx
                  already applies to the top nav's own Learn link. */}
              <Link
                href={getSelectedPathwayId() === "csse" ? "/learning-intelligence/learn" : "/english"}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white rounded-xl px-5 py-2.5 font-semibold text-sm transition-all motion-reduce:transition-none"
              >
                <Play size={14} aria-hidden="true" />
                Start Learning
              </Link>
            </Card>
          )}
        </section>

        {/* 4. Progress Snapshot — EEP-002: merges the previous Readiness
             Snapshot, Recommended Next Step and Recent Progress sections
             into one concise card, per this sprint's own "present a
             concise overview; encourage deeper exploration through the
             Progress page rather than duplicating information." Removed:
             the Momentum/Next-Milestone card pair and the StatCard trio
             (both repeated the Hero's own XP/streak/session numbers a
             second or third time), the standalone Recommended Next Step
             card (repeated Today's Mission's own #1 item verbatim), and
             the always-visible Badges Earned grid (redundant with
             NewBadgeBanner's celebratory moment and /progress's own
             Achievements section). Every value shown reuses an existing,
             already-computed field — no new metric is introduced. */}
        <section>
          <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-3">Progress Snapshot</h2>
          {parentReport && parentReport.hasEnoughData ? (
            <Card padding="comfortable" className="space-y-4">
              <ReadinessIndicator readiness={parentReport.examReadiness} />

              {report && (report.strongSubjects.length > 0 || report.weakSubjects.length > 0) && (
                <div>
                  {/* AN-102 — one narrative lead-in instead of two bare
                      "Strong:"/"Focus:" labels sitting beside a chip row;
                      same two already-computed lists (report.strongSubjects/
                      weakSubjects), no new calculation. */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                    {report.strongSubjects.length > 0 && report.weakSubjects.length > 0
                      ? "Doing well, and where to focus next:"
                      : report.strongSubjects.length > 0
                        ? "Doing well in:"
                        : "Worth focusing on next:"}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {report.strongSubjects.map((label) => (
                      <StatusIndicator key={label} tone="success" label={label} />
                    ))}
                    {report.weakSubjects.map((label) => (
                      <StatusIndicator key={label} tone="warning" label={label} />
                    ))}
                  </div>
                </div>
              )}

              {weeklyGoal && (
                <div>
                  <ProgressBar
                    percent={(weeklyGoal.sessions / weeklyGoal.target) * 100}
                    color={weeklyGoal.isComplete ? "emerald" : "purple"}
                    label="Weekly goal progress"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    {weeklyGoal.isComplete ? "Weekly goal complete. Great work!" : `${weeklyGoal.sessions} of ${weeklyGoal.target} sessions this week`}
                  </p>
                </div>
              )}

              {report && report.hasEnoughData && report.insights.length > 0 && (
                <div className="pt-1 flex flex-col gap-2">
                  {report.insights.slice(0, 2).map((insight) => (
                    <InsightCard key={insight.id} insight={insight} compact />
                  ))}
                </div>
              )}

              <ButtonLink href="/progress" variant="outline" size="sm" className="w-full justify-center">
                View full progress →
              </ButtonLink>
            </Card>
          ) : (
            <Card padding="none" className="px-4 py-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-50 dark:bg-sky-950 rounded-xl flex items-center justify-center shrink-0">
                <BarChart2 size={18} className="text-sky-300 dark:text-sky-700" />
              </div>
              <div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Not enough data yet</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">Complete a few more sessions to unlock your progress snapshot</p>
              </div>
            </Card>
          )}
        </section>

        {/* 5. Mock Examinations Available — honestly framed as "available,"
             not "scheduled": no real mock-scheduling concept exists
             anywhere in this codebase, and this sprint does not invent
             one. Kept as-is: genuinely unique information (this pathway's
             own attempt count / best score) not shown anywhere else on
             the homepage. */}
        <section>
          <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-3">Mock Examinations Available</h2>
          {pathway && mockSupported ? (
            <Link
              href="/mocks"
              className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-5 py-4 shadow-sm hover:shadow-md active:scale-[0.98] transition-all motion-reduce:transition-none group"
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
              <ChevronRight size={18} aria-hidden="true" className="text-gray-300 dark:text-gray-600 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors motion-reduce:transition-none shrink-0" />
            </Link>
          ) : (
            <Card padding="none" className="px-4 py-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-50 dark:bg-pink-950 rounded-xl flex items-center justify-center shrink-0">
                <Trophy size={18} className="text-pink-300 dark:text-pink-700" />
              </div>
              <div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                  {pathway ? "No mock exam yet for this pathway" : "Choose target schools to see available mocks"}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">Visit the Mock Centre to see what&apos;s available</p>
              </div>
            </Card>
          )}
        </section>

        {/* 6. Continue Learning — EEP-002: reduced from a four-button
             action row PLUS a seven-card illustrated subject grid down to
             just the four most relevant actions, per this sprint's own
             "reduce visual clutter, surface only the most relevant
             activities." The removed subject grid duplicated navigation
             the persistent sidebar and the Learn/Practice/Mock Centre hub
             pages already provide. "Review Progress" is replaced with
             "Learn" here since Progress Snapshot above already has its
             own "View Full Progress" link — this row now covers the three
             real hubs (Learn/Practice/Mocks) plus the one auto-picked
             Continue action, with no duplicate route across the two. */}
        <section>
          <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-3">Continue Learning</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Product Experience Standard V1 §6 — one primary CTA per page;
                "Start Today's Mission" above is the page's primary action,
                so this shortcut is secondary, not a second solid-purple CTA. */}
            <ButtonLink href={topMissionItem?.href ?? "/english"} variant="secondary" size="sm" leftIcon={<Play size={14} />}>
              Continue
            </ButtonLink>
            <ButtonLink
              href={getSelectedPathwayId() === "csse" ? "/learning-intelligence/learn" : "/learn"}
              variant="secondary"
              size="sm"
              leftIcon={<BookOpen size={14} />}
            >
              Learn
            </ButtonLink>
            <ButtonLink
              href={getSelectedPathwayId() === "csse" ? "/learning-intelligence/practice" : "/reasoning"}
              variant="secondary"
              size="sm"
              leftIcon={<Puzzle size={14} />}
            >
              Practise
            </ButtonLink>
            <ButtonLink href="/mocks" variant="outline" size="sm" leftIcon={<Trophy size={14} />}>
              Take a mock
            </ButtonLink>
          </div>
        </section>

        {/* 7. About + disclaimer — kept as-is; already minimal and serves
             a real legal/trust purpose. */}
        <Card padding="comfortable">
          <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">About Angel 11+</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-2">
            Original exam-style practice for UK 11+ preparation across English, Maths, Reasoning, Writing and Vocabulary.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs leading-relaxed">
            Angel 11+ provides original practice content and is not affiliated with or endorsed by any exam board or school.
          </p>
        </Card>

      </div>
    </PageLayout>
  );
}
