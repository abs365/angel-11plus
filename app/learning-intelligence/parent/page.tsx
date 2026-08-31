"use client";

import { useEffect, useState } from "react";
import PageLayout from "@/components/PageLayout";
import { getSelectedPathwayId } from "@/lib/progress";
import { getMockResults } from "@/lib/mockProgress";
import type { MockResult } from "@/types/mock";
import { CssePathwayParentContent } from "@/components/parent/CssePathwayParentContent";
import { LegacyPathwayParentContent } from "@/components/parent/LegacyPathwayParentContent";
import { MockHistorySection } from "@/components/parent/MockHistorySection";

/**
 * Unified Parent Dashboard (FD-020, Sprint 4 Completion Package, WP4B).
 * One shell, one canonical URL — replaces the former standalone /parent
 * (now a redirect, see next.config.ts) and the CSSE-only dashboard that
 * previously lived only at this route.
 *
 * Permanent Principle (FD-020): user journeys are shared, educational
 * intelligence is pathway-specific. This page owns the shared shell (header,
 * Mock History) and picks exactly one content branch by the family's
 * selected pathway — CSSE gets the real Educational Intelligence Engine
 * content (CssePathwayParentContent); every other pathway (GL/CEM/ISEB/
 * Independent/core-foundation/not-sure, or none selected) gets the real
 * evidence-based legacy content (LegacyPathwayParentContent, unchanged
 * computeParentReport() data). Neither branch is a placeholder for the
 * other — each renders only the pathway capability that genuinely exists.
 */
export default function ParentDashboardPage() {
  const [isCsse, setIsCsse] = useState<boolean | undefined>(undefined);
  const [mockResults, setMockResults] = useState<MockResult[]>([]);

  useEffect(() => {
    setIsCsse(getSelectedPathwayId() === "csse");
    getMockResults().then(setMockResults);
  }, []);

  return (
    <PageLayout breadcrumbs={[{ label: "Parent Dashboard" }]}>
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {/* Stage 5 pass (2026-08-31): icon-box removed — same cover-test
            failure as /progress and the dashboard's own prior fix
            (heading + subtitle already fully explain the page). */}
        <div className="flex items-center gap-3 mb-2">
          <div>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Parent Dashboard</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              A clear picture of how your child is progressing, and what to focus on next.
            </p>
          </div>
        </div>

        {isCsse === undefined && <p className="text-sm text-gray-400 dark:text-gray-500 mt-6" aria-live="polite">Loading…</p>}

        {isCsse !== undefined && (
          <div className="space-y-8 mt-6">
            {isCsse ? <CssePathwayParentContent /> : <LegacyPathwayParentContent />}

            <MockHistorySection mockResults={mockResults} />

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed px-4">
              Angel 11+ provides original exam-style practice and is not affiliated with or endorsed by any exam board or school.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
