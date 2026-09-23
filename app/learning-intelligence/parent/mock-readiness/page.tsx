"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Info } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { getSelectedPathwayId } from "@/lib/progress";
import { getSupabaseClient } from "@/lib/supabase";
import { fetchLearnerIntelligenceProfile } from "@/lib/learningEngine/profile";
import { getRecommendations } from "@/lib/learningEngine/educationalIntelligenceService";
import { ALL_COMPETENCY_IDS } from "@/lib/learningEngine/assessmentBrainMap";
import { assessMockReadiness, fetchRealCsseMockAttemptCount, type MockReadinessAssessment } from "@/lib/learningEngine/mockReadiness";
import { ReadinessSummary } from "@/components/learningEngine/ReadinessSummary";
import { EvidenceProfile } from "@/components/learningEngine/EvidenceProfile";
import { HistoricalContextPanel } from "@/components/parent/HistoricalContextPanel";
import type { LearnerIntelligenceProfile } from "@/lib/learningEngine/types";
import type { RecommendationTrigger } from "@/types/ali/recommendationOrchestration";

/**
 * Mock Readiness Intelligence (Sprint 5, WP5C). Built exactly against this
 * sprint's mission — "help parents understand whether another mock is
 * educationally worthwhile," never "recommend more mocks." Every section
 * reuses already-real, already-computed data (ReadinessSummary,
 * EvidenceProfile, getRecommendations(), fetchRealCsseMockAttemptCount());
 * the one new piece, assessMockReadiness(), is a pure categorical read of
 * that data — no new calculation, no prediction, no calendar/timing rule.
 *
 * Increment 3 — real defect found and fixed: the mock attempt count
 * previously came from getMockResults() (lib/mockProgress.ts), a legacy
 * localStorage store the real CSSE Mock system never writes to, so this
 * page's readiness verdict was always computed against a count of 0
 * regardless of how many real Mocks a CSSE learner had actually completed.
 * Now uses fetchRealCsseMockAttemptCount(), the same real Supabase-backed
 * count used on the Parent Dashboard's own "Are they ready for a mock?"
 * card. That helper returns a count only (no per-attempt dates), so the
 * former "most recently on {date}" sub-fact is no longer shown — the real,
 * accurate count stands on its own.
 *
 * Five clearly separated sections (WP5C's original four, plus WP5E's
 * Historical Context, applied here consistently with Admissions Readiness):
 *   1. Current Educational Evidence — EvidenceProfile, unchanged.
 *   2. Readiness — ReadinessSummary, unchanged.
 *   3. Educational Value of Another Mock — the assessment + the real mock
 *      attempt count shown as a fact, not a rule.
 *   4. Historical Context — HistoricalContextPanel, unchanged from
 *      Admissions Readiness (WP5E) — CSSE's own real fact, never blended
 *      with 3's interpretation of this child's own evidence.
 *   5. Recommended Next Action — exactly one primary CTA (WP4D discipline),
 *      matching whichever real conclusion the assessment reached.
 */
export default function MockReadinessPage() {
  const [pathwayEligible, setPathwayEligible] = useState<boolean | undefined>(undefined);
  const [profile, setProfile] = useState<LearnerIntelligenceProfile | null | undefined>(undefined);
  const [topTriggerReason, setTopTriggerReason] = useState<RecommendationTrigger | null | undefined>(undefined);
  const [mockAttemptCount, setMockAttemptCount] = useState<number>(0);

  useEffect(() => {
    const pathwayId = getSelectedPathwayId();
    const eligible = pathwayId === "csse";
    setPathwayEligible(eligible);
    if (!eligible) return;

    const supabase = getSupabaseClient();
    if (supabase) {
      fetchRealCsseMockAttemptCount(supabase).then(setMockAttemptCount).catch(() => setMockAttemptCount(0));
    } else {
      setMockAttemptCount(0);
    }

    fetchLearnerIntelligenceProfile(pathwayId ?? undefined)
      .then((p) => {
        setProfile(p);
        if (p?.pathwayEligible && supabase) {
          getRecommendations(supabase, p.profileId, ALL_COMPETENCY_IDS)
            .then((result) => setTopTriggerReason(result.ordered[0]?.triggerReason ?? null))
            .catch(() => setTopTriggerReason(null));
        }
      })
      .catch(() => setProfile(null));
  }, []);

  const loaded = profile !== undefined && topTriggerReason !== undefined;

  const assessment: MockReadinessAssessment | undefined =
    loaded && profile
      ? assessMockReadiness({
          hasAnyEvidence: profile.hasAnyEvidence,
          mockAttemptCount,
          topTriggerReason: topTriggerReason ?? null,
        })
      : undefined;

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Learning Report", href: "/learning-intelligence" },
        { label: "Parent Dashboard", href: "/learning-intelligence/parent" },
        { label: "Admissions Readiness", href: "/learning-intelligence/parent/admissions-readiness" },
        { label: "Mock Readiness" },
      ]}
    >
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <h1 className="text-[var(--angel-navy)] font-bold text-3xl md:text-4xl leading-tight">Mock Readiness</h1>
        <p className="text-[var(--angel-muted)] text-sm md:text-base mt-2 max-w-xl">Is another mock exam worthwhile right now?</p>

        {pathwayEligible === false && (
          <div className="mt-6 flex items-start gap-3 bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5">
            <MapPin size={18} className="text-[var(--angel-blue)] mt-0.5 shrink-0" />
            <p className="text-sm text-[var(--angel-ink)]">Available for the CSSE pathway only.</p>
          </div>
        )}

        {pathwayEligible && !loaded && <p className="text-sm text-[var(--angel-muted)] mt-6" aria-live="polite">Loading…</p>}

        {pathwayEligible && loaded && !profile && (
          <div className="mt-6 text-center bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-6">
            <p className="text-sm text-[var(--angel-muted)]">This page isn&apos;t available right now.</p>
          </div>
        )}

        {pathwayEligible && profile && !profile.pathwayEligible && (
          <div className="mt-6 flex items-start gap-3 bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5">
            <MapPin size={18} className="text-[var(--angel-blue)] mt-0.5 shrink-0" />
            <p className="text-sm text-[var(--angel-ink)]">
              This section is built entirely from CSSE&apos;s own official exam evidence.
            </p>
          </div>
        )}

        {pathwayEligible && profile && profile.pathwayEligible && assessment && (
          <div className="space-y-8 mt-6">
            <section>
              <h2 className="text-[var(--angel-navy)] font-bold text-lg md:text-xl mb-1">Current Educational Evidence</h2>
              <p className="text-xs text-[var(--angel-muted)] mb-3">What&apos;s been recorded so far, area by area.</p>
              <EvidenceProfile competencies={profile.competencies} />
            </section>

            <section>
              <h2 className="text-[var(--angel-navy)] font-bold text-lg md:text-xl mb-1">Readiness</h2>
              <p className="text-xs text-[var(--angel-muted)] mb-3">How well-evidenced each part of the exam is right now.</p>
              <ReadinessSummary readiness={profile.readiness} />
            </section>

            <section>
              <h2 className="text-[var(--angel-navy)] font-bold text-lg md:text-xl mb-1">Educational Value of Another Mock</h2>
              <div className="flex items-start gap-3 bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5">
                <Info size={16} className="text-[var(--angel-muted)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-[var(--angel-ink)]">{assessment.explanation}</p>
                  <p className="text-[11px] text-[var(--angel-muted)] mt-2">
                    {mockAttemptCount > 0
                      ? `${mockAttemptCount} mock${mockAttemptCount === 1 ? "" : "s"} attempted so far.`
                      : "No mocks attempted yet."}
                  </p>
                </div>
              </div>
            </section>

            {/* WP5E — Historical Context, reused unchanged from Admissions
                Readiness. Its own section, never merged with "Educational
                Value of Another Mock" above — that's real educational
                interpretation of this child's evidence; this is one
                external fact about CSSE itself. Kept visually and
                conceptually independent, per this sprint's explicit rule. */}
            <HistoricalContextPanel />

            <section>
              <h2 className="text-[var(--angel-navy)] font-bold text-lg md:text-xl mb-3">Recommended Next Action</h2>
              {/* One primary action (WP4D discipline) — reflects the real
                  conclusion above, never a second competing option. */}
              <Link
                href={assessment.nextAction.href}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                {assessment.nextAction.label}
              </Link>
              {/* WP5D — Revision Planner is the journey's next step from
                  here; kept reachable (secondary) even when the real
                  verdict above points elsewhere, so the stated Mock
                  Readiness -> Revision path is never a dead end. Omitted
                  when it's already the primary action, to avoid a literal
                  duplicate link. */}
              {assessment.nextAction.href !== "/learning-intelligence/parent/revision-planner" && (
                <div className="mt-2">
                  <Link href="/learning-intelligence/parent/revision-planner" className="text-xs font-semibold text-[var(--angel-muted)] hover:text-[var(--angel-blue)]">
                    See This Week&apos;s Revision Plan →
                  </Link>
                </div>
              )}
            </section>

            <p className="text-xs text-[var(--angel-muted)] leading-relaxed">
              This reflects real, recorded evidence only. It is not a prediction of how your child would score, and
              there is no fixed rule about how often to sit a mock. It changes as new evidence comes in.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
