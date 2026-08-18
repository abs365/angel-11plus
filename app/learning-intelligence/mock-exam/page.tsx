"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Flag, RotateCcw } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import Button, { ButtonLink } from "@/components/ui/Button";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import {
  getActiveMockForm,
  createMockAttempt,
  startMockAttempt,
  getMockAttemptManifest,
  getMockQuestion,
  submitMockAnswer,
  submitMockAttempt,
  setMockFlag,
} from "@/lib/mockAttempt/client";
import type { MockAttemptType, MockQuestionPayload } from "@/lib/mockAttempt/types";
import {
  computeRemainingSeconds,
  isAttemptExpired,
  buildPalette,
  unansweredQuestionIds,
} from "@/lib/mockAttempt/workspace";
import { ExamTimer } from "@/components/mockAttempt/ExamTimer";
import { QuestionPalette } from "@/components/mockAttempt/QuestionPalette";

/**
 * Programme Increment 008E — Secure Mock Experience Integration and
 * Reporting Foundation. This is the canonical, learner-facing "Full CSSE
 * Mock" — the actual destination /mocks' own "Start mock" button links
 * to. It replaces the prior implementation's own data path entirely: no
 * fetchMockEligibleQuestionBank() (a raw, unprojected `.select("*")`
 * against ali_question_bank), no client-side grading. Every read/write of
 * Mock content or state now goes exclusively through the 5 proven
 * SECURITY DEFINER functions from migration 070 (unmodified by this
 * increment) plus the 2 new ones from migration 072
 * (mock_get_active_form, mock_set_flag) — see lib/mockAttempt/client.ts.
 *
 * Deliberate scope boundary (008E directive, Part 8/"do not turn 008E
 * into the complete visual redesign"): this workspace proves the
 * canonical secure flow — instructions, timed single-sitting workspace,
 * question palette, flag/review, submission confirmation, neutral
 * delayed-report completion state — using the ONE server-authoritative
 * timer migration 070 already provides. It does not yet implement
 * 008V Part 6's full two-paper (English 60+10min reading, then a break,
 * then Mathematics 60min) section-by-section timing model — that needs a
 * new section-transition RPC this increment did not build, named as a
 * residual gap for a future increment, not silently assumed. It also
 * does not yet implement 008V Part 7's split-screen English passage
 * treatment — `question` payloads are rendered safely for either a plain
 * string or unrecognised rich content, not with the full passage layout.
 *
 * Deliberate scope boundary (008E directive, Part 6/"submission and full
 * diagnostic feedback are not necessarily the same event"; 008F): this
 * page does not grade anything itself, does not call the old Educational
 * Intelligence evidence pipeline, does not call recordReadinessSnapshot
 * or saveMockResult. Migration 074's own redefined report-init trigger
 * creates the report row and immediately, automatically, server-side
 * runs mock_score_attempt() the moment mock_submit_attempt() locks the
 * attempt — this client never triggers scoring itself and has no
 * execute grant on that function at all (008F Founder pre-application
 * architecture review: authoritative scoring must be controlled by
 * Angel's own trusted database boundary, never learner/browser-
 * initiated). A separate, admin-gated release step (mock_release_
 * report()) is still what actually surfaces the result — this page's
 * own submitted-state copy says exactly that, honestly, rather than
 * implying an immediate score.
 *
 * Because Content Boundary (008E directive) forbids creating Form A/B/C
 * or any real Mock content, and Mock Eligible remains 0, a real learner
 * visiting this page today will see the "no mock available yet" state
 * (mock_get_active_form returns no row) — functionally the same honest
 * outcome the prior implementation's own "not enough content" error gave,
 * now sourced from the correct, secure signal instead of an empty
 * eligibility-filtered client fetch.
 */

const ATTEMPT_TYPE: MockAttemptType = "full_mock";
// See the file header's own disclosed limitation: one server-authoritative
// timer for the whole attempt, not yet the real two-paper section model.
const DURATION_MINUTES = 60;

type Phase =
  | "intro"
  | "checking"
  | "unavailable"
  | "starting"
  | "in-progress"
  | "reviewing"
  | "submitting"
  | "submitted"
  | "error";

export default function MockExamPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [errorMessage, setErrorMessage] = useState("");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [assignedQuestionIds, setAssignedQuestionIds] = useState<string[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [currentPayload, setCurrentPayload] = useState<MockQuestionPayload | null>(null);
  const [answerDraft, setAnswerDraft] = useState("");
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<string>>(new Set());
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<Set<string>>(new Set());
  const [questionLoading, setQuestionLoading] = useState(false);

  const supabaseRef = useRef<ReturnType<typeof getSupabaseClient>>(null);
  const submittedRef = useRef(false);

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current || !attemptId) return;
    submittedRef.current = true;
    const supabase = supabaseRef.current;
    if (!supabase) return;
    // Save whatever is in the current draft before locking, same as any
    // other navigation: a timeout must not discard an in-progress answer.
    if (currentQuestionId && answerDraft.trim()) {
      await submitMockAnswer(supabase, attemptId, currentQuestionId, { value: answerDraft.trim() }).catch(() => {});
    }
    setPhase("submitting");
    const result = await submitMockAttempt(supabase, attemptId);
    if (result.error) { setErrorMessage(result.error); setPhase("error"); return; }
    // 008F, revised after Founder pre-application architecture review —
    // this client never triggers scoring itself. Marking now happens
    // automatically, server-side, the moment mock_submit_attempt() locks
    // the attempt (migration 074's own redefined report-init trigger) —
    // authoritative scoring is controlled by Angel's own trusted
    // database boundary, never learner/browser-initiated. This client
    // has no execute grant on mock_score_attempt at all.
    setPhase("submitted");
  }, [attemptId, currentQuestionId, answerDraft]);

  // Server-authoritative countdown — re-derives from expiresAt every
  // second, never trusts an accumulating client-side counter. Matches
  // the pattern already proven in the 008D preview shell.
  useEffect(() => {
    if ((phase !== "in-progress" && phase !== "reviewing") || !expiresAt) return;
    const tick = () => {
      const remaining = computeRemainingSeconds(expiresAt);
      setRemainingSeconds(remaining);
      if (remaining <= 0) void handleSubmit();
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [phase, expiresAt, handleSubmit]);

  async function loadCurrentQuestion(supabase: NonNullable<typeof supabaseRef.current>, attemptIdValue: string, questionId: string) {
    setQuestionLoading(true);
    const result = await getMockQuestion(supabase, attemptIdValue, questionId);
    setQuestionLoading(false);
    if (result.error || !result.data) {
      setErrorMessage(result.error ?? "Could not load this question.");
      setPhase("error");
      return;
    }
    setCurrentPayload(result.data);
    setAnswerDraft("");
  }

  async function handleBegin() {
    setErrorMessage("");
    setPhase("checking");
    const supabase = getSupabaseClient();
    if (!supabase) { setErrorMessage("Not connected."); setPhase("error"); return; }
    supabaseRef.current = supabase;

    const active = await getActiveMockForm(supabase, ATTEMPT_TYPE);
    if (active.error) { setErrorMessage(active.error); setPhase("error"); return; }
    if (!active.data) { setPhase("unavailable"); return; }

    setPhase("starting");
    const profileId = await ensureProfile();
    if (!profileId) { setErrorMessage("Could not establish a learner profile."); setPhase("error"); return; }

    const created = await createMockAttempt(supabase, active.data.formId, ATTEMPT_TYPE);
    if (created.error || !created.data) { setErrorMessage(created.error ?? "Could not create an attempt."); setPhase("error"); return; }

    const started = await startMockAttempt(supabase, created.data, DURATION_MINUTES);
    if (started.error || !started.data) { setErrorMessage(started.error ?? "Could not start the attempt."); setPhase("error"); return; }

    // The learner's own attempt manifest — IDs only, in order, never any
    // question content — via mock_get_attempt_manifest(). This is what
    // populates the full question palette from the start, rather than
    // building it up one visited question at a time.
    const manifest = await getMockAttemptManifest(supabase, created.data);
    if (manifest.error || !manifest.data || manifest.data.length === 0) {
      setErrorMessage(manifest.error ?? "Could not load this attempt's question list.");
      setPhase("error");
      return;
    }

    setAttemptId(created.data);
    setExpiresAt(started.data.expiresAt);
    submittedRef.current = false;
    setAnsweredQuestionIds(new Set());
    setFlaggedQuestionIds(new Set());
    setAssignedQuestionIds(manifest.data);
    setCurrentQuestionId(manifest.data[0]);
    setPhase("in-progress");
    await loadCurrentQuestion(supabase, created.data, manifest.data[0]);
  }

  async function handleAnswerAndAdvance(nextQuestionId: string | null) {
    const supabase = supabaseRef.current;
    if (!supabase || !attemptId || !currentQuestionId) return;
    if (answerDraft.trim()) {
      const result = await submitMockAnswer(supabase, attemptId, currentQuestionId, { value: answerDraft.trim() });
      if (result.error) { setErrorMessage(result.error); setPhase("error"); return; }
      setAnsweredQuestionIds((prev) => new Set(prev).add(currentQuestionId));
    }
    if (nextQuestionId) {
      setCurrentQuestionId(nextQuestionId);
      await loadCurrentQuestion(supabase, attemptId, nextQuestionId);
    }
  }

  async function handleToggleFlag() {
    const supabase = supabaseRef.current;
    if (!supabase || !attemptId || !currentQuestionId) return;
    const nextFlagged = !flaggedQuestionIds.has(currentQuestionId);
    const result = await setMockFlag(supabase, attemptId, currentQuestionId, nextFlagged);
    if (result.error) { setErrorMessage(result.error); setPhase("error"); return; }
    setFlaggedQuestionIds((prev) => {
      const next = new Set(prev);
      if (nextFlagged) next.add(currentQuestionId);
      else next.delete(currentQuestionId);
      return next;
    });
  }

  const palette = buildPalette(assignedQuestionIds, answeredQuestionIds, flaggedQuestionIds, currentQuestionId);
  const unanswered = unansweredQuestionIds(assignedQuestionIds, answeredQuestionIds);
  const expired = expiresAt ? isAttemptExpired(expiresAt) : false;

  return (
    <PageLayout breadcrumbs={[{ label: "Learning Report", href: "/learning-intelligence" }, { label: "Mock exam" }]}>
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {phase === "intro" && (
          <div>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Full CSSE Mock</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              A timed, sealed sitting. You will not see whether an answer is correct until your report is ready.
            </p>

            <InfoCard className="mt-5">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Before you begin</p>
              <ul className="mt-2 space-y-1.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed list-disc list-inside">
                <li>You&apos;ll need a pen or pencil nearby, just like the real test day: no calculator, no notes.</li>
                <li>Find a quiet space where you won&apos;t be interrupted for the timer&apos;s duration.</li>
                <li>Once the timer starts, this is the real, timed assessment. Answers aren&apos;t marked as you go.</li>
                <li>You can move between questions, flag any you&apos;re unsure about, and review before you submit.</li>
                <li>Once you submit, the attempt is complete and cannot be changed.</li>
              </ul>
              <Button onClick={handleBegin} className="mt-5">
                I&apos;m ready to begin
              </Button>
            </InfoCard>
          </div>
        )}

        {(phase === "checking" || phase === "starting") && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-6" aria-live="polite">
            {phase === "checking" ? "Checking for an available mock…" : "Preparing your assessment…"}
          </p>
        )}

        {phase === "unavailable" && (
          <InfoCard className="mt-6 text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">No mock is currently available</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 leading-relaxed">
              Angel would rather tell you that plainly than run a mock from content that hasn&apos;t been through full
              review yet. Practice is unaffected, since it uses a wider, evidence-tagged content set.
            </p>
            <Link href="/learning-intelligence" className="inline-block mt-4 text-xs font-semibold text-purple-600 dark:text-purple-400">
              Back to dashboard
            </Link>
          </InfoCard>
        )}

        {phase === "error" && (
          <InfoCard className="mt-6 text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">We couldn&apos;t continue this assessment</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{errorMessage}</p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                onClick={() => setPhase("intro")}
                className="min-h-[44px] inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 px-2"
              >
                <RotateCcw size={14} /> Start over
              </button>
              <Link href="/learning-intelligence" className="min-h-[44px] inline-flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 px-2">
                Back to dashboard
              </Link>
            </div>
          </InfoCard>
        )}

        {phase === "in-progress" && (
          <div>
            {(() => {
              const currentIndex = assignedQuestionIds.indexOf(currentQuestionId ?? "");
              const previousId = currentIndex > 0 ? assignedQuestionIds[currentIndex - 1] : null;
              const nextId = currentIndex >= 0 && currentIndex < assignedQuestionIds.length - 1 ? assignedQuestionIds[currentIndex + 1] : null;
              return (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Question {currentIndex + 1} of {assignedQuestionIds.length}
                    </p>
                    <ExamTimer remainingSeconds={remainingSeconds ?? 0} />
                  </div>

                  <InfoCard>
                    {questionLoading || !currentPayload ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500" aria-live="polite">Loading question…</p>
                    ) : (
                      <MockQuestionRenderer payload={currentPayload} value={answerDraft} onChange={setAnswerDraft} />
                    )}

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50 dark:border-gray-800">
                      <button
                        onClick={handleToggleFlag}
                        disabled={!currentQuestionId}
                        aria-pressed={!!currentQuestionId && flaggedQuestionIds.has(currentQuestionId)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 disabled:opacity-30"
                      >
                        <Flag size={13} className={currentQuestionId && flaggedQuestionIds.has(currentQuestionId) ? "text-amber-500 fill-amber-500" : ""} />
                        {currentQuestionId && flaggedQuestionIds.has(currentQuestionId) ? "Flagged for review" : "Flag for review"}
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAnswerAndAdvance(previousId)}
                          disabled={!previousId}
                          className="text-xs font-semibold text-gray-500 dark:text-gray-400 disabled:opacity-30 px-2"
                        >
                          Back
                        </button>
                        {nextId ? (
                          <Button onClick={() => handleAnswerAndAdvance(nextId)} size="sm">
                            Next
                          </Button>
                        ) : (
                          <Button onClick={() => { void handleAnswerAndAdvance(null); setPhase("reviewing"); }} variant="outline" size="sm">
                            Review &amp; submit
                          </Button>
                        )}
                      </div>
                    </div>
                  </InfoCard>
                </>
              );
            })()}

            {palette.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Question overview</p>
                  <button
                    onClick={() => { void handleAnswerAndAdvance(null); setPhase("reviewing"); }}
                    className="text-xs font-semibold text-purple-600 dark:text-purple-400"
                  >
                    Review &amp; submit
                  </button>
                </div>
                <QuestionPalette
                  entries={palette}
                  onSelect={(id) => {
                    if (id === currentQuestionId) return;
                    void handleAnswerAndAdvance(id);
                  }}
                />
              </div>
            )}
          </div>
        )}

        {phase === "reviewing" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg">Review before you submit</h2>
              <ExamTimer remainingSeconds={remainingSeconds ?? 0} />
            </div>

            {unanswered.length > 0 && (
              <InfoCard className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 mb-4">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  {unanswered.length} question{unanswered.length === 1 ? "" : "s"} not yet answered
                </p>
              </InfoCard>
            )}
            {flaggedQuestionIds.size > 0 && (
              <InfoCard className="mb-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {flaggedQuestionIds.size} question{flaggedQuestionIds.size === 1 ? "" : "s"} flagged for review
                </p>
              </InfoCard>
            )}

            <QuestionPalette
              entries={palette}
              onSelect={(id) => {
                setPhase("in-progress");
                void handleAnswerAndAdvance(id);
              }}
            />

            <div className="flex items-center justify-between mt-6">
              <button onClick={() => setPhase("in-progress")} className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Back to questions
              </button>
              <Button onClick={handleSubmit} disabled={expired}>
                Submit my Mock
              </Button>
            </div>
          </div>
        )}

        {phase === "submitting" && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-6" aria-live="polite">Submitting your assessment…</p>
        )}

        {phase === "submitted" && (
          <InfoCard className="mt-6 text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">Your Mock has been submitted</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Your assessment is safely recorded. Marking and analysis is a separate step, and your report will be
              ready once that&apos;s complete, not at the same moment as submitting.
            </p>
            <ButtonLink href="/learning-intelligence" className="mt-5" variant="outline">
              Back to dashboard
            </ButtonLink>
          </InfoCard>
        )}
      </div>
    </PageLayout>
  );
}

/**
 * Deliberately minimal — 008V Part 7's full split-screen passage
 * treatment is a named, deferred gap (see this file's header). This
 * renders `question` safely whether it's the plain string every fixture
 * used so far has been, or an unrecognised rich-content shape, without
 * ever assuming a structure this increment hasn't verified against real
 * content (none exists yet — Mock Eligible remains 0).
 */
function MockQuestionRenderer({
  payload,
  value,
  onChange,
}: {
  payload: MockQuestionPayload;
  value: string;
  onChange: (v: string) => void;
}) {
  const questionText = typeof payload.question === "string" ? payload.question : JSON.stringify(payload.question);
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-2">
        <span className="uppercase tracking-wide font-semibold">{payload.subject}</span>
        <span>{payload.marks} mark{payload.marks === 1 ? "" : "s"}</span>
      </div>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">{questionText}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full mt-4 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
        placeholder="Your answer…"
      />
    </div>
  );
}
