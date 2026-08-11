"use client";

import Link from "next/link";
import { BookOpen, ArrowRight, Brain } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";

/**
 * New Learner Experience Migration — the CSSE-pathway "Learn" destination.
 * Per NEW_LEARN_MODEL.md, this is a deliberate, disclosed honest interim
 * state, not the target Learn experience: real, evidence-led CSSE Learn
 * content does not exist yet, and the governing instruction explicitly
 * forbids inventing it or reintroducing the old, non-CSSE-evidence-authentic
 * lesson content ("The Lighthouse Mystery" and its siblings) that the old
 * /learn hub still serves. This page links only to what is genuinely real
 * and working today — the CSSE Practice area and the Learning Report.
 *
 * Non-CSSE-pathway learners never reach this page — Navigation.tsx routes
 * them to the unchanged /learn hub instead.
 */
export default function CsseLearnPage() {
  return (
    <PageLayout breadcrumbs={[{ label: "Learn" }]}>
      <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Learn</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 leading-relaxed">
          Angel&apos;s CSSE Learn experience is being rebuilt around real, evidence-led preparation content — so
          it&apos;s honest about what it teaches and why. It isn&apos;t ready yet, and we&apos;d rather show you that
          plainly than fill this page with content that isn&apos;t genuinely CSSE preparation.
        </p>

        <div className="grid gap-3 mt-6">
          <Link href="/learning-intelligence/practice">
            <InfoCard className="flex items-center gap-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-2xl shrink-0">
                <BookOpen size={20} className="text-purple-600 dark:text-purple-400" />
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
            <InfoCard className="flex items-center gap-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
              <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-2xl shrink-0">
                <Brain size={20} className="text-indigo-600 dark:text-indigo-400" />
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
