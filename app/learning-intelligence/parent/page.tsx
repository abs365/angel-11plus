"use client";

import { useEffect, useState } from "react";
import PageLayout from "@/components/PageLayout";
import { getSelectedPathwayId } from "@/lib/progress";
import { getMockResults } from "@/lib/mockProgress";
import type { MockResult } from "@/types/mock";
import { CssePathwayParentContent } from "@/components/parent/CssePathwayParentContent";
import { LegacyPathwayParentContent } from "@/components/parent/LegacyPathwayParentContent";
import { MockHistorySection } from "@/components/parent/MockHistorySection";
import LearnerIdentityBanner from "@/components/parent/LearnerIdentityBanner";

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
 *
 * Increment 3 (Progress + Results + Parent Dashboard) — real defect found
 * and fixed: MockHistorySection reads getMockResults() (lib/mockProgress.ts),
 * a legacy localStorage store the real CSSE Mock system never writes to
 * (its own attempts live in ali_mock_attempt/ali_mock_attempt_report via
 * app/learning-intelligence/mock-exam/**). For a CSSE family this section
 * would always claim "No mocks attempted yet," even after real completed
 * CSSE Mocks — a false claim, not an honest zero-evidence state. Now shown
 * only for the pathway it is genuinely accurate for (GL/CEM/ISEB); CSSE's
 * own real Mock position is already shown correctly, elsewhere on this
 * page, by CssePathwayParentContent's "Are they ready for a mock?" card
 * (which this same increment also fixed to count real CSSE attempts).
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
        <h1 className="text-[var(--angel-navy)] font-bold text-3xl md:text-4xl leading-tight">Parent Dashboard</h1>
        <p className="text-[var(--angel-muted)] text-sm md:text-base mt-2 max-w-xl">
          A clear picture of how your child is progressing, and what to focus on next.
        </p>

        <div className="mt-6">
          <LearnerIdentityBanner />
        </div>

        {isCsse === undefined && <p className="text-sm text-[var(--angel-muted)] mt-6" aria-live="polite">Loading…</p>}

        {isCsse !== undefined && (
          <div className="space-y-10 mt-8">
            {isCsse ? <CssePathwayParentContent /> : <LegacyPathwayParentContent />}

            {!isCsse && <MockHistorySection mockResults={mockResults} />}

            <p className="text-xs text-[var(--angel-muted)] text-center leading-relaxed px-4">
              Angel 11+ provides original exam-style practice and is not affiliated with or endorsed by any exam board or school.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
