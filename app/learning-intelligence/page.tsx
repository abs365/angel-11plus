"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Brain, MapPin, ArrowRight } from "lucide-react";
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
 * Recent Learning Activity). Composes Competency Profile, Evidence Profile,
 * Diagnostic Overview (Coverage Gaps live in its own "Not Yet Evidenced"
 * section — not duplicated into a separate component), Learning Readiness,
 * Recommendation Summary, and Recent Learning Activity into one page, per
 * docs/intelligence/LEARNING_ENGINE_V1.md.
 *
 * CSSE-scoped only. Every value rendered on this page comes from
 * fetchLearnerIntelligenceProfile() — a real Supabase read against the
 * existing ali_question_bank/ali_student_question_history tables, keyed on
 * the new Assessment Brain V1 Question Type IDs. No value on this page is
 * hardcoded, randomised, or a placeholder: today, in production, this
 * reads as "no evidence yet" everywhere, honestly, because no content has
 * been authored/tagged against the new CSSE taxonomy — see the CAP-3 Wave
 * 1 evidence package for the full explanation of why, and what unblocks it.
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
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-2xl">
            <Brain size={22} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Learning Report</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm">CSSE skills evidence, diagnostics and readiness</p>
          </div>
        </div>

        {profile === undefined && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-6">Loading…</p>
        )}

        {profile === null && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Your learning report isn&apos;t available right now.</p>
          </div>
        )}

        {profile && !profile.pathwayEligible && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mt-6 flex items-start gap-3">
            <MapPin size={18} className="text-purple-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Your learning report is available for the CSSE pathway
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {pathway ? `Your current pathway is ${pathway.name}.` : "Choose CSSE as your target pathway to see this."}{" "}
                It is built entirely from CSSE&apos;s own official exam evidence (Assessment Brain V1), so it does not
                yet apply to GL, CEM, ISEB, or Independent preparation.
              </p>
              <Link href="/pathways" className="inline-block text-xs font-semibold text-purple-600 dark:text-purple-400 mt-3">
                Review School Intelligence →
              </Link>
            </div>
          </div>
        )}

        {profile && profile.pathwayEligible && (
          <div className="space-y-8 mt-6">
            <Link
              href="/learning-intelligence/practice"
              className="flex items-center justify-between gap-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-5 py-4 transition-colors"
            >
              <div>
                <p className="text-sm font-bold">Practice now</p>
                <p className="text-xs text-purple-100 mt-0.5">
                  Complete a Reading Comprehension, Mathematics or Continuous Writing activity to update this profile.
                </p>
              </div>
              <ArrowRight size={18} className="shrink-0" />
            </Link>

            <div className="flex items-center gap-4 flex-wrap text-xs font-semibold">
              <Link href="/learning-intelligence/recommendations" className="text-purple-600 dark:text-purple-400">
                Recommendation Centre →
              </Link>
              <Link href="/learning-intelligence/timeline" className="text-purple-600 dark:text-purple-400">
                Progress Timeline →
              </Link>
              <Link href="/learning-intelligence/parent" className="text-purple-600 dark:text-purple-400">
                Parent Dashboard →
              </Link>
              <Link href="/learning-intelligence/mock-exam" className="text-purple-600 dark:text-purple-400">
                CSSE mock exam →
              </Link>
            </div>

            {!profile.hasAnyContent && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-4">
                <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm">No evidence recorded yet</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 leading-relaxed">
                  Every skill below is shown honestly as &quot;Not Yet Observed.&quot; This isn&apos;t an error —
                  Angel&apos;s own content bank does not yet have any practice questions authored against CSSE&apos;s
                  official skills structure, so there is genuinely nothing to report yet.
                </p>
              </div>
            )}

            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Skills Profile</h2>
              <CompetencyProfile competencies={profile.competencies} durableCompetencyIds={durableCompetencyIds} />
            </section>

            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Evidence Profile</h2>
              <EvidenceProfile competencies={profile.competencies} />
            </section>

            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Diagnostic Overview &amp; Coverage Gaps</h2>
              <DiagnosticOverview findings={profile.diagnostics} />
            </section>

            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Learning Readiness</h2>
              <ReadinessSummary readiness={profile.readiness} />
            </section>

            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Recommendations</h2>
              <RecommendationSummary recommendations={profile.recommendations} />
            </section>

            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Recent Learning Activity</h2>
              <RecentActivity items={recentActivity} />
            </section>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
