"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, ClipboardList, HelpCircle, GraduationCap, Route, ChevronDown, Target, Sparkles } from "lucide-react";
import { InfoCard } from "@/components/ui/Card";
import { getSelectedPathwayId } from "@/lib/progress";
import { getSupabaseClient } from "@/lib/supabase";
import { fetchLearnerIntelligenceProfile } from "@/lib/learningEngine/profile";
import { fetchRecentActivity, type RecentActivityItem } from "@/lib/learningEngine/activity";
import { fetchEducationalMilestones } from "@/lib/ali/persistence/auditStore";
import { getRecommendations } from "@/lib/learningEngine/educationalIntelligenceService";
import { COMPETENCIES, ALL_COMPETENCY_IDS } from "@/lib/learningEngine/assessmentBrainMap";
import { getMockResults } from "@/lib/mockProgress";
import { assessMockReadiness, type MockReadinessAssessment } from "@/lib/learningEngine/mockReadiness";
import { getActiveMockForm, isMockFormAvailable } from "@/lib/mockAttempt/client";
import { CompetencySummary } from "@/components/learningEngine/parent/CompetencySummary";
import { EvidenceComposition } from "@/components/learningEngine/parent/EvidenceComposition";
import { RecommendationExplanation } from "@/components/learningEngine/parent/RecommendationExplanation";
import { ReadinessSummary } from "@/components/learningEngine/ReadinessSummary";
import { RecentActivity } from "@/components/learningEngine/RecentActivity";
import { AtAGlancePanel } from "@/components/parent/AtAGlancePanel";
import type { LearnerIntelligenceProfile } from "@/lib/learningEngine/types";
import type { RecommendationRuntimeResult } from "@/lib/ali/persistence/recommendationRuntime";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Sprint 4 Completion Package (FD-020, WP4B) — the pathway-specific content
 * for CSSE families, extracted verbatim from the former standalone
 * /learning-intelligence/parent page into a branch of the unified Parent
 * Dashboard shell. Same Educational Intelligence Engine reads, same
 * calculations — a pure move. The nav-links row (Weekly Report/Revision
 * Planner) and the "How Angel decides" explainer stay here since they're
 * genuinely CSSE-specific (Educational Intelligence Engine has no
 * equivalent for other pathways); the legacy "Mock exam history" pointer
 * link is removed since Mock History is now shared, not a separate
 * destination (see MockHistorySection).
 */
export function CssePathwayParentContent() {
  const [profile, setProfile] = useState<LearnerIntelligenceProfile | null | undefined>(undefined);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationRuntimeResult | null | undefined>(undefined);
  const [weekActivityCount, setWeekActivityCount] = useState<number | undefined>(undefined);
  const [weekMilestoneCount, setWeekMilestoneCount] = useState<number | undefined>(undefined);
  const [mockAttemptCount, setMockAttemptCount] = useState<number | undefined>(undefined);
  // New Learner Experience Migration (Parent Dashboard Simplification) —
  // progressive disclosure: the dense, always-rendered section list below
  // is now opt-in, not the first thing a parent sees. Nothing here is
  // deleted or recomputed differently — see PARENT_DASHBOARD_SIMPLIFICATION_SPEC.md.
  const [showDetails, setShowDetails] = useState(false);
  // Completion Assurance Programme, Completion D — a live-verification
  // finding: this card's own "Start a mock exam →" CTA (below, driven by
  // assessMockReadiness()'s nextAction) had no signal for whether a real
  // CSSE mock actually exists, so it recommended one even while Mock
  // Eligible content is 0 in production — the exact contradiction
  // Completion B (Decision 126) already corrected on the Mock Centre
  // itself, but this separate Parent Dashboard card was never touched by
  // that fix. Starts false so the CTA never briefly claims availability.
  const [csseMockAvailable, setCsseMockAvailable] = useState(false);

  useEffect(() => {
    const pathwayId = getSelectedPathwayId();
    fetchLearnerIntelligenceProfile(pathwayId ?? undefined)
      .then((p) => {
        setProfile(p);
        const supabase = getSupabaseClient();
        if (supabase) {
          getActiveMockForm(supabase, "full_mock")
            .then((result) => setCsseMockAvailable(isMockFormAvailable(result)))
            .catch(() => setCsseMockAvailable(false));
        }
        if (p?.pathwayEligible && supabase) {
          fetchRecentActivity(supabase, p.profileId).then(setRecentActivity).catch(() => setRecentActivity([]));
          getRecommendations(supabase, p.profileId, ALL_COMPETENCY_IDS)
            .then(setRecommendations)
            .catch(() => setRecommendations(null));

          const sinceIso = new Date(Date.now() - SEVEN_DAYS_MS).toISOString();
          fetchRecentActivity(supabase, p.profileId, 50, sinceIso)
            .then((items) => setWeekActivityCount(items.length))
            .catch(() => setWeekActivityCount(0));
          fetchEducationalMilestones(supabase, p.profileId, sinceIso)
            .then((items) => setWeekMilestoneCount(items.length))
            .catch(() => setWeekMilestoneCount(0));
        }
        getMockResults()
          .then((results) => setMockAttemptCount(results.length))
          .catch(() => setMockAttemptCount(0));
      })
      .catch(() => setProfile(null));
  }, []);

  const evidencedCount = profile?.competencies.filter((c) => c.tier !== "ET-0").length ?? 0;
  const totalCount = profile?.competencies.length ?? 0;
  const topCandidate = recommendations?.ordered[0];
  const topParentReason = topCandidate
    ? recommendations?.explanations.get(topCandidate.competencyCode)?.find((e) => e.audience === "parent")?.text
    : undefined;
  const topCandidateLabel = topCandidate ? COMPETENCIES[topCandidate.competencyCode as keyof typeof COMPETENCIES]?.name : undefined;

  // New Learner Experience Migration — Mock Readiness, surfaced on the first
  // screen per the governing instruction. Reuses assessMockReadiness()
  // (lib/learningEngine/mockReadiness.ts) completely unmodified — a
  // categorical, evidence-based verdict, never a fabricated percentage. All
  // three inputs are real data this component already computes/fetches.
  const mockReadiness: MockReadinessAssessment | undefined =
    profile === undefined || recommendations === undefined || mockAttemptCount === undefined
      ? undefined
      : assessMockReadiness({
          hasAnyEvidence: profile?.hasAnyEvidence ?? false,
          mockAttemptCount,
          topTriggerReason: topCandidate?.triggerReason ?? null,
        });

  // WP4C (Parent Trust) — every answer below is read from data this
  // component already fetches for the sections further down the page; no
  // new calculation, no fabricated score. "Should I be concerned" uses the
  // real wellbeing veto signal (vetoedCompetencyCodes) — when it's empty
  // (the common case), the honest answer is calm, not an overclaiming
  // "all good."
  const atAGlanceAnswers = {
    improving:
      weekMilestoneCount === undefined ? "Checking…" : weekMilestoneCount > 0
        ? `Yes, ${weekMilestoneCount} milestone${weekMilestoneCount === 1 ? "" : "s"} reached this week.`
        : "No new milestones this week yet. That's normal early on, and it fills in as practice continues.",
    thisWeek: topCandidateLabel ? (
      <>
        Focus on <span className="font-medium">{topCandidateLabel}</span>. See the{" "}
        <Link href="/learning-intelligence/parent/revision-planner" className="text-purple-600 dark:text-purple-400 font-semibold">
          Revision Planner
        </Link>{" "}
        for this week&apos;s full plan.
      </>
    ) : (
      "Nothing specific yet. Check back once your child has completed some practice."
    ),
    whyRecommended: topParentReason ?? "No specific recommendation yet. This fills in once there's evidence to respond to.",
    concern:
      recommendations === undefined
        ? "Checking…"
        : (recommendations?.vetoedCompetencyCodes.length ?? 0) > 0
        ? "Angel noticed signs your child may benefit from a lighter few days. No action needed, just something worth knowing."
        : "No signs of concern in recent evidence.",
    outcome: (
      <>
        Angel doesn&apos;t produce a single predicted score. See{" "}
        <span className="font-medium">Readiness Summary</span> below for what to expect, area by area, based on real evidence.
      </>
    ),
  };

  return (
    <>
      {profile === undefined && <p className="text-sm text-gray-400 dark:text-gray-500" aria-live="polite">Loading…</p>}

      {profile === null && (
        <InfoCard className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">This dashboard isn&apos;t available right now.</p>
        </InfoCard>
      )}

      {profile && !profile.pathwayEligible && (
        <InfoCard className="flex items-start gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">CSSE evidence not available yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              This section is built entirely from CSSE&apos;s own official exam evidence.
            </p>
          </div>
        </InfoCard>
      )}

      {profile && profile.pathwayEligible && (
        <div className="space-y-6">
          {/* New Learner Experience Migration — first screen, four questions
              a parent actually has, understandable within ~10 seconds. See
              PARENT_DASHBOARD_SIMPLIFICATION_SPEC.md. Every value here is
              read from data already computed above; nothing new is fetched
              or calculated for this section. */}
          <section>
            <h2 className="text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wide mb-2">
              How is my child doing?
            </h2>
            <InfoCard>
              <p className="text-sm text-gray-700 dark:text-gray-300">{atAGlanceAnswers.improving}</p>
            </InfoCard>
          </section>

          <section>
            <h2 className="text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wide mb-2">
              What needs attention?
            </h2>
            <InfoCard className="flex items-start gap-3">
              <Sparkles size={16} className="text-purple-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {topCandidateLabel ? <>Angel recommends: {topCandidateLabel}</> : "No specific focus yet"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  {topParentReason ?? "This fills in once there's evidence to respond to."}
                </p>
                {/* Mathematics Reference Vertical — a real, working lesson
                    now exists for MR-01 specifically; link to it directly
                    rather than only the general Revision Planner, reusing
                    the recommendation data this card already computed. */}
                {topCandidate?.competencyCode === "MR-01" && (
                  <Link
                    href="/learning-intelligence/learn/mathematics/arithmetic"
                    className="inline-block text-xs font-semibold text-purple-600 dark:text-purple-400 mt-2"
                  >
                    Start this lesson →
                  </Link>
                )}
              </div>
            </InfoCard>
          </section>

          <section>
            <h2 className="text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wide mb-2">
              What should they do next?
            </h2>
            <Link
              href="/learning-intelligence/parent/revision-planner"
              className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <ClipboardList size={14} /> See This Week&apos;s Revision Plan →
            </Link>
          </section>

          <section>
            <h2 className="text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wide mb-2">
              Are they ready for a mock?
            </h2>
            <InfoCard className="flex items-start gap-3">
              <Target size={16} className="text-indigo-500 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                {mockReadiness === undefined ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500" aria-live="polite">Checking…</p>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {{
                        "practice-first": "Keep preparing",
                        "first-mock-valuable": "A first mock would be valuable",
                        "mock-valuable": "A mock would be valuable",
                      }[mockReadiness.verdict]}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{mockReadiness.explanation}</p>
                    {mockReadiness.nextAction.href === "/learning-intelligence/mock-exam" && !csseMockAvailable ? (
                      <Link href="/learning-intelligence/practice" className="inline-block text-xs font-semibold text-purple-600 dark:text-purple-400 mt-2">
                        See practice areas →
                      </Link>
                    ) : (
                      <Link href={mockReadiness.nextAction.href} className="inline-block text-xs font-semibold text-purple-600 dark:text-purple-400 mt-2">
                        {mockReadiness.nextAction.label}
                      </Link>
                    )}
                  </>
                )}
              </div>
            </InfoCard>
          </section>

          {/* Secondary links — progressive disclosure. Nothing below is
              deleted; it's opt-in rather than always-rendered. */}
          <div className="flex items-center gap-4 flex-wrap pt-1">
            <button
              onClick={() => setShowDetails((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400"
            >
              {showDetails ? "Hide detailed progress" : "View detailed progress"}
              <ChevronDown size={13} className={showDetails ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>
            <Link href="/learning-intelligence/parent/weekly-report" className="text-xs font-semibold text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
              <CalendarDays size={13} /> Weekly Report →
            </Link>
            <Link href="/learning-intelligence/parent/admissions-readiness" className="text-xs font-semibold text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
              <GraduationCap size={13} /> School/Admissions Readiness →
            </Link>
            <Link href="/learning-intelligence/parent/journey" className="text-xs font-semibold text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
              <Route size={13} /> Learning history →
            </Link>
          </div>

          {showDetails && (
        <div className="space-y-8 pt-4 border-t border-gray-100 dark:border-gray-800">
          <section>
            <AtAGlancePanel answers={atAGlanceAnswers} />
          </section>

          <section>
            <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Child Progress</h2>
            <InfoCard>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {evidencedCount === 0
                  ? "No practice evidence recorded yet. This fills in as your child completes practice activities."
                  : `${evidencedCount} of ${totalCount} CSSE skills now have some recorded evidence.`}
              </p>
              <Link href="/learning-intelligence/practice" className="inline-block text-xs font-semibold text-purple-600 dark:text-purple-400 mt-2">
                See practice areas →
              </Link>
            </InfoCard>
          </section>

          <section>
            <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">This Week</h2>
            <InfoCard>
              <p className="text-sm text-gray-700 dark:text-gray-300" aria-live="polite">
                {weekActivityCount === undefined || weekMilestoneCount === undefined
                  ? "Loading…"
                  : weekActivityCount === 0 && weekMilestoneCount === 0
                  ? "No activity recorded this week yet."
                  : `${weekActivityCount} activit${weekActivityCount === 1 ? "y" : "ies"} this week` +
                    (weekMilestoneCount > 0 ? `, ${weekMilestoneCount} milestone${weekMilestoneCount === 1 ? "" : "s"} reached.` : ".")}
              </p>
              <Link href="/learning-intelligence/parent/weekly-report" className="inline-block text-xs font-semibold text-purple-600 dark:text-purple-400 mt-2">
                Full weekly report →
              </Link>
            </InfoCard>
          </section>

          <section>
            <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">What&apos;s Next</h2>
            {topParentReason && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-3">
                Here&apos;s what your child needs next, and why:
              </p>
            )}
            {recommendations === undefined && <p className="text-sm text-gray-400 dark:text-gray-500" aria-live="polite">Loading…</p>}
            {recommendations !== undefined && <RecommendationExplanation result={recommendations ?? { ordered: [], explanations: new Map(), vetoedCompetencyCodes: [] }} />}
            {/* WP4C — moved here from the page's bottom so the explainer sits
                right where a parent is reading a recommendation and asking
                "why," instead of being isolated at the end of the page. */}
            <InfoCard className="flex items-start gap-3 mt-3">
              <HelpCircle size={16} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">How Angel decides what to recommend</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Every suggestion here comes from what your child has actually done in practice, real evidence of what
                  they can do confidently and what still needs work, never a fixed script. It updates as new evidence
                  comes in, and always explains why a particular skill was chosen.
                </p>
              </div>
            </InfoCard>
          </section>

          <section>
            <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Skills Summary</h2>
            <CompetencySummary competencies={profile.competencies} />
          </section>

          <section>
            <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Readiness Summary</h2>
            <ReadinessSummary readiness={profile.readiness} />
          </section>

          <section>
            <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Evidence Growth</h2>
            <EvidenceComposition competencies={profile.competencies} />
          </section>

          <section>
            <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Development Areas</h2>
            <InfoCard>
              {profile.diagnostics.developmentAreas.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 italic">None identified yet</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {profile.diagnostics.developmentAreas.map((id) => (
                    <span key={id} className="text-xs font-medium px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      {COMPETENCIES[id].name}
                    </span>
                  ))}
                </div>
              )}
            </InfoCard>
          </section>

          <section>
            <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Recent Activity</h2>
            <RecentActivity items={recentActivity} plainLanguage />
          </section>
        </div>
          )}
        </div>
      )}
    </>
  );
}
