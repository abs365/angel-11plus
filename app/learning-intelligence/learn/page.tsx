"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, Brain, Calculator, Percent } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { getEducationalIntelligence, type EducationalIntelligenceSnapshot } from "@/lib/learningEngine/educationalIntelligenceService";
import { hubProgressionLabel } from "@/lib/learningEngine/progressionLabel";

/**
 * New Learner Experience Migration — the CSSE-pathway "Learn" destination.
 * Per NEW_LEARN_MODEL.md, this was launched as a deliberate, disclosed
 * honest interim state, since real evidence-led CSSE Learn content did not
 * exist yet. The Mathematics Reference Vertical (see
 * knowledge/.../mathematics-reference-vertical/) added the first genuine
 * lesson; the Mathematics Learning Sequence Expansion (Educational
 * Increment 002) adds a second, without claiming the rest of the
 * curriculum is ready, which it is not.
 *
 * Non-CSSE-pathway learners never reach this page — Navigation.tsx routes
 * them to the unchanged /learn hub instead.
 *
 * Sequencing (MATHEMATICS_LEARNING_SEQUENCE_RULES.md): each lesson's card
 * shows its own real, unmodified educationalState for its own competency
 * (MR-01 for Lesson 1, MR-04 for Lesson 2), fetched via the exact same
 * getEducationalIntelligence() call each lesson page itself already makes.
 * No new evidence computation, no invented prerequisite: both lessons are
 * always fully accessible, and any "recommended" framing is copy over real
 * evidence, never a lock.
 */
export default function CsseLearnPage() {
  const [arithmeticState, setArithmeticState] = useState<EducationalIntelligenceSnapshot["educationalState"] | undefined>(undefined);
  const [percentagesState, setPercentagesState] = useState<EducationalIntelligenceSnapshot["educationalState"] | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        if (!cancelled) setLoaded(true);
        return;
      }
      const profileId = await ensureProfile().catch(() => null);
      if (!profileId) {
        if (!cancelled) setLoaded(true);
        return;
      }
      const [arithmetic, percentages] = await Promise.all([
        getEducationalIntelligence(supabase, profileId, "MR-01").catch(() => null),
        getEducationalIntelligence(supabase, profileId, "MR-04").catch(() => null),
      ]);
      if (cancelled) return;
      setArithmeticState(arithmetic?.educationalState);
      setPercentagesState(percentages?.educationalState);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const arithmeticLabel = hubProgressionLabel(arithmeticState);
  const percentagesLabel = hubProgressionLabel(percentagesState);

  // Presentation-only ordering note (never a gate — both lessons are always
  // clickable): a family who hasn't touched Mathematics yet sees a gentle
  // steer toward Lesson 1; a family with real Lesson 1 evidence and no
  // Lesson 2 evidence yet sees Lesson 2 marked as the natural next step.
  const arithmeticStarted = arithmeticState !== undefined && arithmeticState !== "exploring";
  const percentagesStarted = percentagesState !== undefined && percentagesState !== "exploring";
  let percentagesNote: string | null = null;
  if (loaded && !percentagesStarted) {
    percentagesNote = arithmeticStarted ? "Recommended next" : "Most families start with Lesson 1";
  }

  return (
    <PageLayout breadcrumbs={[{ label: "Learn" }]}>
      <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Learn</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 leading-relaxed">
          Angel&apos;s CSSE Learn experience is being rebuilt one real lesson at a time, around genuine
          evidence-led preparation content. Two Mathematics lessons are ready today. The rest of the curriculum
          isn&apos;t yet, and we&apos;d rather show you that plainly than fill this page with content that isn&apos;t
          genuinely CSSE preparation.
        </p>

        <div className="grid gap-3 mt-6">
          <Link href="/learning-intelligence/learn/mathematics/arithmetic">
            <InfoCard className="flex items-center gap-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors border-blue-200 dark:border-blue-800">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-2xl shrink-0">
                <Calculator size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Mathematics: Adding and Subtracting Big Numbers</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  A real lesson: understand the method, try it with support, then try it alone.
                </p>
                {loaded && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{arithmeticLabel.label}</p>
                )}
              </div>
              <ArrowRight size={16} className="text-gray-300 dark:text-gray-600 shrink-0" />
            </InfoCard>
          </Link>

          <Link href="/learning-intelligence/learn/mathematics/percentages">
            <InfoCard className="flex items-center gap-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors border-blue-200 dark:border-blue-800">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-2xl shrink-0">
                <Percent size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Mathematics: Finding a Percentage of a Number</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  A real lesson: understand the method, try it with support, then try it alone.
                </p>
                {loaded && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                    {percentagesNote ?? percentagesLabel.label}
                  </p>
                )}
              </div>
              <ArrowRight size={16} className="text-gray-300 dark:text-gray-600 shrink-0" />
            </InfoCard>
          </Link>

          <Link href="/learning-intelligence/practice">
            <InfoCard className="flex items-center gap-4 hover:border-sky-300 dark:hover:border-sky-700 transition-colors">
              <div className="bg-sky-100 dark:bg-sky-900 p-3 rounded-2xl shrink-0">
                <BookOpen size={20} className="text-sky-700 dark:text-sky-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Start Practice instead</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Real, evidence-driven CSSE practice is available today across Reading Comprehension, Mathematics
                  and Continuous Writing.
                </p>
              </div>
              <ArrowRight size={16} className="text-gray-300 dark:text-gray-600 shrink-0" />
            </InfoCard>
          </Link>

          <Link href="/learning-intelligence">
            <InfoCard className="flex items-center gap-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl shrink-0">
                <Brain size={20} className="text-gray-500 dark:text-gray-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">See your Learning Report</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Real competency and evidence data from everything you&apos;ve practised so far.
                </p>
              </div>
              <ArrowRight size={16} className="text-gray-300 dark:text-gray-600 shrink-0" />
            </InfoCard>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
