"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { StatusIndicator, type StatusTone } from "@/components/ui/Progress";
import { ButtonLink } from "@/components/ui/Button";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { getActiveMockForm, isMockFormAvailable, getOpenMockCycle, getMostRecentMockCycle, getMockCycleAttempts } from "@/lib/mockAttempt/client";
import { deriveMockCycleSittingState, type MockCycleSittingState, type MockPaperState } from "@/lib/mockAttempt/cycleState";

/**
 * CSSE Two-Paper Mock, pre-activation completion pass (governing brief
 * §4-§8) — the smallest coherent learner-facing orchestration for a
 * COMPLETE CSSE MOCK sitting. Builds no new Mock engine: reuses the
 * existing, unmodified /learning-intelligence/mock-exam page for
 * actually taking each paper (?type=full_mock&subject=english|
 * mathematics, already wired), the existing ali_mock_cycle mechanism
 * (getOpenMockCycle/mock_create_cycle_attempt, untouched), and the
 * existing mock-report page for a submitted paper's own report. This
 * page's only job is to READ current sitting state fresh on every load
 * (never trusted from browser memory — §6) and present English and
 * Mathematics as two independent papers joined by one sitting (§5),
 * with a deliberate transition state between them (§7).
 *
 * PRODUCTION ACTIVATION: unaffected by this page's existence. Each
 * paper's own "Start"/"Resume" action is gated by the SAME
 * getActiveMockForm()/isMockFormAvailable() signal every other Mock
 * entry point in this app already uses — English stays honestly
 * "Not ready yet" for as long as english-full-mock-v1 stays
 * active=false (migration 245's own deliberate gate, untouched by this
 * page). No flag here overrides that; the page simply reports it
 * honestly, exactly like app/mocks/page.tsx already does for every
 * other Mock card.
 */

interface PaperInfo {
  subject: "english" | "mathematics";
  label: string;
  available: boolean;
  displayName: string;
}

function paperStatusDisplay(state: MockPaperState): { label: string; tone: StatusTone } {
  if (state === "submitted") return { label: "Submitted", tone: "success" };
  if (state === "in_progress") return { label: "In progress", tone: "warning" };
  return { label: "Not started", tone: "neutral" };
}

function PaperCard({ info, paperState, attemptId }: { info: PaperInfo; paperState: MockPaperState; attemptId: string | null }) {
  const status = paperStatusDisplay(paperState);
  const startHref = `/learning-intelligence/mock-exam?type=full_mock&subject=${info.subject}`;
  const reportHref = attemptId ? `/learning-intelligence/mock-report/${attemptId}` : undefined;
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2.5">
          {paperState === "submitted" ? (
            <CheckCircle2 size={18} className="text-green-600 shrink-0" />
          ) : paperState === "in_progress" ? (
            <PlayCircle size={18} className="text-amber-600 shrink-0" />
          ) : (
            <Circle size={18} className="text-gray-300 dark:text-gray-600 shrink-0" />
          )}
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{info.displayName}</h3>
        </div>
        <StatusIndicator tone={status.tone} label={status.label} />
      </div>
      {!info.available ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          This paper is not available yet. Angel does not yet have a complete, reviewed set of exam questions to draw from for it.
        </p>
      ) : paperState === "submitted" ? (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-gray-500">This paper has been submitted.</span>
          {reportHref && (
            <ButtonLink href={reportHref} variant="outline" size="sm">
              View report
            </ButtonLink>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-end">
          <ButtonLink href={startHref} variant="outline" size="sm" leftIcon={<PlayCircle size={14} />}>
            {paperState === "in_progress" ? "Resume" : "Start"}
          </ButtonLink>
        </div>
      )}
    </div>
  );
}

export default function CompleteCsseMockSittingPage() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [sitting, setSitting] = useState<MockCycleSittingState>({
    cycleId: "",
    mathematics: { subject: "mathematics", paperState: "not_started", attemptId: null, submittedAt: null },
    english: { subject: "english", paperState: "not_started", attemptId: null, submittedAt: null },
    sittingComplete: false,
  });
  const [papers, setPapers] = useState<Record<"english" | "mathematics", PaperInfo>>({
    english: { subject: "english", label: "Full English Paper", available: false, displayName: "Full English Paper" },
    mathematics: { subject: "mathematics", label: "Full Mathematics Paper", available: false, displayName: "Full Mathematics Paper" },
  });

  useEffect(() => {
    (async () => {
      const supabase = getSupabaseClient();
      if (!supabase) { setErrorMessage("Not connected."); setLoading(false); return; }

      const [englishActive, mathsActive] = await Promise.all([
        getActiveMockForm(supabase, "full_mock", "english"),
        getActiveMockForm(supabase, "full_mock", "mathematics"),
      ]);
      setPapers({
        english: {
          subject: "english",
          label: "Full English Paper",
          available: isMockFormAvailable(englishActive),
          displayName: englishActive.data?.displayName ?? "Full English Paper",
        },
        mathematics: {
          subject: "mathematics",
          label: "Full Mathematics Paper",
          available: isMockFormAvailable(mathsActive),
          displayName: mathsActive.data?.displayName ?? "Full Mathematics Paper",
        },
      });

      // Refresh/resume safety (§6): a profile is required to read the
      // caller's own cycle/attempts at all — no cycle means no sitting
      // has been started yet, which is a real, valid, not-an-error state
      // (every learner's first visit to this page).
      const profileId = await ensureProfile();
      if (!profileId) { setErrorMessage("Could not establish a learner profile."); setLoading(false); return; }

      const openCycle = await getOpenMockCycle(supabase);
      if (openCycle.error) { setErrorMessage(openCycle.error); setLoading(false); return; }
      // CSSE Two-Paper Mock, final production acceptance — a real, live
      // P1 defect found during the real-learner walkthrough:
      // getOpenMockCycle() deliberately returns null once BOTH papers in
      // a cycle are submitted (it is designed to answer "can a new cycle
      // be started," not "does this learner have a recent sitting worth
      // showing") — so a genuinely COMPLETE sitting rendered as if
      // nothing had been started at all. Fixed by falling back to the
      // caller's own most recent cycle (any status) whenever no OPEN one
      // exists, via a direct, RLS-gated read (no new RPC/migration).
      const cycleId = openCycle.data ?? (await getMostRecentMockCycle(supabase)).data;
      if (cycleId) {
        const attempts = await getMockCycleAttempts(supabase, cycleId);
        if (attempts.error) { setErrorMessage(attempts.error); setLoading(false); return; }
        setSitting(deriveMockCycleSittingState(cycleId, attempts.data ?? []));
      }
      setLoading(false);
    })();
  }, []);

  // Deliberate transition state (§7) — shown only when exactly one paper
  // is genuinely done and the other has not yet been submitted. Never
  // auto-advances the learner into the remaining paper; this is
  // information, not a redirect.
  const englishDone = sitting.english.paperState === "submitted";
  const mathsDone = sitting.mathematics.paperState === "submitted";
  const transitionMessage =
    englishDone && !mathsDone
      ? "English completed. Mathematics remains."
      : mathsDone && !englishDone
        ? "Mathematics completed. English remains."
        : null;

  return (
    <PageLayout breadcrumbs={[{ label: "Today", href: "/dashboard" }, { label: "Mock Centre", href: "/mocks" }, { label: "Complete CSSE Mock" }]}>
      <div className="max-w-2xl mx-auto px-4 pb-16 pt-6 md:pt-8 space-y-6">
        <div className="mb-1">
          <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl mb-1">Complete CSSE Mock</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            English and Mathematics, joined into one complete CSSE sitting. Each paper is its own separate, timed attempt — you can sit them back to back, or come back later for the second one.
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            This is not an official CSSE score, and Angel does not combine English and Mathematics into one single mark — no current CSSE source confirms how the two are weighted together. Each paper&apos;s own result stays visible separately.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading your sitting…</p>
        ) : errorMessage ? (
          <InfoCard className="text-sm text-red-600 dark:text-red-400">{errorMessage}</InfoCard>
        ) : (
          <>
            {transitionMessage && (
              <InfoCard className="flex items-start gap-3">
                <PlayCircle size={18} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{transitionMessage}</p>
              </InfoCard>
            )}

            {sitting.sittingComplete && (
              <InfoCard className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">Sitting complete</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">
                    Both papers have been submitted. Some parts of your English result may still be under review — the rest of your result stays available while that happens.
                  </p>
                  <Link
                    href={`/learning-intelligence/mock-exam/sitting/results?cycleId=${encodeURIComponent(sitting.cycleId)}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400"
                  >
                    View sitting result →
                  </Link>
                </div>
              </InfoCard>
            )}

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Your two papers</h2>
              <PaperCard info={papers.english} paperState={sitting.english.paperState} attemptId={sitting.english.attemptId} />
              <PaperCard info={papers.mathematics} paperState={sitting.mathematics.paperState} attemptId={sitting.mathematics.attemptId} />
            </section>
          </>
        )}
      </div>
    </PageLayout>
  );
}
