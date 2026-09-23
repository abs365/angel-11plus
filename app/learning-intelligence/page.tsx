"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { getSelectedPathwayId } from "@/lib/progress";
import { getPathwayById } from "@/lib/pathways";
import { getSupabaseClient } from "@/lib/supabase";
import { fetchLearnerIntelligenceProfile } from "@/lib/learningEngine/profile";
import { fetchRecentActivity, type RecentActivityItem } from "@/lib/learningEngine/activity";
import { getEducationalIntelligence } from "@/lib/learningEngine/educationalIntelligenceService";
import { ALL_COMPETENCY_IDS } from "@/lib/learningEngine/assessmentBrainMap";
import { CompetencyProfile } from "@/components/learningEngine/CompetencyProfile";
import { EvidenceProfile } from "@/components/learningEngine/EvidenceProfile";
import { DiagnosticOverview } from "@/components/learningEngine/DiagnosticOverview";
import { ReadinessSummary } from "@/components/learningEngine/ReadinessSummary";
import { RecommendationSummary } from "@/components/learningEngine/RecommendationSummary";
import { RecentActivity } from "@/components/learningEngine/RecentActivity";
import type { LearnerIntelligenceProfile } from "@/lib/learningEngine/types";
import type { Pathway } from "@/types/pathway";

/**
 * Feature 1 — Learner Dashboard (Capability 3, Wave 1; enhanced Wave 3 with
 * Recent Learning Activity). CSSE-scoped only. Every value rendered on this
 * page comes from fetchLearnerIntelligenceProfile() — a real Supabase read
 * against ali_question_bank/ali_student_question_history — no value is
 * hardcoded, randomised, or a placeholder.
 *
 * Increment 3 (Progress + Results + Parent Dashboard) — reorganised around
 * the questions a learner actually asks (How am I doing? / What's going
 * well? / What to work on? / What should I do next? / Recent work?)
 * instead of a flat list of engine-named sections ("Evidence Profile",
 * "Diagnostic Overview & Coverage Gaps"). Every section still traces to
 * the exact same real fetch and computation as before — this pass changed
 * presentation and section boundaries, not what is computed.
 *
 * Real defect found and fixed while verifying this page's own zero-
 * evidence state: the banner was gated on `!profile.hasAnyContent`, which
 * checks whether ANY of Angel's own content exists for ANY of the 13
 * competencies (lib/learningEngine/profile.ts:55) — a platform-content
 * fact, true today regardless of which learner is asking, since real
 * Mathematics/Reading/Writing content now exists. That gate could
 * essentially never show for any learner, new or experienced. The correct,
 * genuinely learner-specific signal is `hasAnyEvidence`
 * (profile.ts:56 — true once this learner's own tier moves past ET-0),
 * which is what the banner now checks. lib/learningEngine/profile.ts
 * itself is unchanged — both flags were already computed correctly; only
 * which one this page reads for this purpose was wrong.
 */
export default function LearningIntelligencePage() {
  const [profile, setProfile] = useState<LearnerIntelligenceProfile | null | undefined>(undefined);
  const [pathway, setPathway] = useState<Pathway | undefined>();
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [durableCompetencyIds, setDurableCompetencyIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const pathwayId = getSelectedPathwayId();
    setPathway(getPathwayById(pathwayId ?? ""));
    fetchLearnerIntelligenceProfile(pathwayId ?? undefined)
      .then((p) => {
        setProfile(p);
        const supabase = getSupabaseClient();
        if (p?.pathwayEligible && supabase) {
          fetchRecentActivity(supabase, p.profileId).then(setRecentActivity).catch(() => setRecentActivity([]));

          // Deliverable 6 — real Educational Intelligence Engine data
          // (Durable Mastery) surfaced on the existing Skills Profile
          // section, reusing this dashboard rather than a new screen.
          // Per-competency, independent of the rest of this page's own
          // read path (fetchLearnerIntelligenceProfile), so a failure here
          // never blocks the page's existing content from rendering.
          Promise.all(
            ALL_COMPETENCY_IDS.map((id) =>
              getEducationalIntelligence(supabase, p.profileId, id)
                .then((snapshot) => (snapshot.durableMastery.durable ? id : null))
                .catch(() => null)
            )
          ).then((results) => {
            setDurableCompetencyIds(new Set(results.filter((id) => id !== null) as string[]));
          });
        }
      })
      .catch(() => setProfile(null));
  }, []);

  return (
    <PageLayout breadcrumbs={[{ label: "Learning Report" }]}>
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <h1 className="text-[var(--angel-navy)] font-bold text-3xl md:text-4xl leading-tight">Learning Report</h1>
        <p className="text-[var(--angel-muted)] text-sm md:text-base mt-2 max-w-xl">
          A clear picture of how your CSSE preparation is going, built entirely from real work you&apos;ve completed.
        </p>

        {profile === undefined && (
          <p className="text-sm text-[var(--angel-muted)] mt-6" aria-live="polite">Loading…</p>
        )}

        {profile === null && (
          <div className="bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-6 mt-6 text-center">
            <p className="text-sm text-[var(--angel-muted)]">Your learning report isn&apos;t available right now.</p>
          </div>
        )}

        {profile && !profile.pathwayEligible && (
          <div className="bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-6 mt-6 flex items-start gap-3">
            <MapPin size={18} className="text-[var(--angel-blue)] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[var(--angel-navy)]">
                Your learning report is available for the CSSE pathway
              </p>
              <p className="text-xs text-[var(--angel-muted)] mt-1">
                {pathway ? `Your current pathway is ${pathway.name}.` : "Choose CSSE as your target pathway to see this."}{" "}
                It is built entirely from CSSE&apos;s own official exam evidence, so it does not
                yet apply to GL, CEM, ISEB, or Independent preparation.
              </p>
              <Link href="/pathways" className="inline-block text-xs font-semibold text-[var(--angel-blue)] mt-3 hover:underline">
                Review School Intelligence →
              </Link>
            </div>
          </div>
        )}

        {profile && profile.pathwayEligible && (
          <div className="mt-8 space-y-10">
            <Link
              href="/learning-intelligence/practice"
              className="flex items-center justify-between gap-3 bg-[var(--angel-sky)] rounded-lg px-6 py-5 group"
            >
              <div>
                <p className="text-[var(--angel-navy)] font-bold text-base">Practise now</p>
                <p className="text-[var(--angel-muted)] text-sm mt-0.5">
                  Complete a Reading Comprehension, Mathematics or Continuous Writing activity to update this report.
                </p>
              </div>
              <ArrowRight size={18} className="text-[var(--angel-blue)] shrink-0 group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none" />
            </Link>

            {!profile.hasAnyEvidence && (
              <div className="bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg px-5 py-5">
                <p className="text-[var(--angel-navy)] font-semibold text-sm">You&apos;re just getting started</p>
                <p className="text-[var(--angel-muted)] text-sm mt-1 leading-relaxed">
                  Complete a few practice activities and Angel will begin building a clearer picture of what&apos;s
                  going well and what to work on next.
                </p>
              </div>
            )}

            <section>
              <h2 className="text-[var(--angel-navy)] font-bold text-lg md:text-xl mb-2">How you&apos;re doing</h2>
              <EvidenceProfile competencies={profile.competencies} />
              <div className="mt-4">
                <ReadinessSummary readiness={profile.readiness} />
              </div>
            </section>

            <DiagnosticOverview findings={profile.diagnostics} />

            <section>
              <h2 className="text-[var(--angel-navy)] font-bold text-lg md:text-xl mb-2">What to do next</h2>
              <p className="text-sm text-[var(--angel-muted)] mb-3">
                Angel recommends — you and your family choose what to act on.
              </p>
              <RecommendationSummary recommendations={profile.recommendations} />
            </section>

            <section>
              <h2 className="text-[var(--angel-navy)] font-bold text-lg md:text-xl mb-2">Recent work</h2>
              <RecentActivity items={recentActivity} />
            </section>

            <div>
              <Link href="/learning-intelligence/parent" className="text-sm font-semibold text-[var(--angel-blue)] hover:underline">
                Parent Dashboard →
              </Link>
              <p className="text-xs text-[var(--angel-muted)] mt-0.5">
                See this same evidence from a parent&apos;s view, including Admissions Readiness.
              </p>
            </div>

            <div className="pt-6 border-t border-[var(--angel-border)]">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--angel-muted)] mb-3">More ways to explore</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
                <Link href="/learning-intelligence/recommendations" className="text-[var(--angel-blue)] hover:underline">
                  Recommendation Centre
                </Link>
                <Link href="/learning-intelligence/timeline" className="text-[var(--angel-blue)] hover:underline">
                  Progress Timeline
                </Link>
                <Link href="/learning-intelligence/parent/weekly-report" className="text-[var(--angel-blue)] hover:underline">
                  Weekly Report
                </Link>
                <Link href="/learning-intelligence/parent/revision-planner" className="text-[var(--angel-blue)] hover:underline">
                  Revision Planner
                </Link>
                <Link href="/learning-intelligence/mock-exam" className="text-[var(--angel-blue)] hover:underline">
                  CSSE mock exam
                </Link>
                <Link href="/learning-intelligence/parent/journey" className="text-[var(--angel-blue)] hover:underline">
                  How this all fits together
                </Link>
              </div>
            </div>

            <section>
              <h2 className="text-[var(--angel-navy)] font-bold text-lg md:text-xl mb-2">All skills, in detail</h2>
              <p className="text-sm text-[var(--angel-muted)] mb-3">
                Every skill CSSE preparation covers, shown honestly even where nothing has been recorded yet.
              </p>
              <CompetencyProfile competencies={profile.competencies} durableCompetencyIds={durableCompetencyIds} />
            </section>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
