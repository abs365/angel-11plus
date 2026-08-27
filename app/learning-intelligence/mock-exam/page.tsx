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
  isMockFormAvailable,
  getOpenMockCycle,
  startNewMockCycle,
  createMockCycleAttempt,
  startMockAttempt,
  getMockAttemptManifest,
  getMockAttemptGrouping,
  getMockQuestion,
  submitMockAnswer,
  submitMockAttempt,
  setMockFlag,
  getResumableMockAttempt,
  getMockAttemptAnswers,
} from "@/lib/mockAttempt/client";
import type { MockAttemptType, MockQuestionPayload } from "@/lib/mockAttempt/types";
import {
  computeRemainingSeconds,
  isAttemptExpired,
  buildDisplayUnits,
  buildPalette,
  unansweredUnitIndices,
  selectDisplayUnitStimulus,
  isValidTableStimulus,
  resolveGroupSharedStem,
  determineMockResumeAction,
  computeResumeStartIndex,
  type DisplayUnit,
} from "@/lib/mockAttempt/workspace";
import { ExamTimer } from "@/components/mockAttempt/ExamTimer";
import { QuestionPalette } from "@/components/mockAttempt/QuestionPalette";
import { DataTableStimulus } from "@/components/mockAttempt/DataTableStimulus";

/**
 * Programme Increment 008E — Secure Mock Experience Integration and
 * Reporting Foundation. This is the canonical, learner-facing "Full CSSE
 * Mock" — the actual destination /mocks' own "Start mock" button links
 * to. It replaces the prior implementation's own data path entirely: no
 * fetchMockEligibleQuestionBank() (a raw, unprojected `.select("*")`
 * against ali_question_bank), no client-side grading. Every read/write of
 * Mock content or state now goes exclusively through the proven
 * SECURITY DEFINER functions from migrations 070/072/085/106/107 — see
 * lib/mockAttempt/client.ts.
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
 * Mathematics First Mock Form-Assembly Gate (Decision 161) — two
 * corrections made this increment, both to close gaps this increment's
 * own mandatory Section 7 trace found, not features added speculatively:
 *
 * 1. LEARNER ATTEMPT CREATION. Migration 085 (Decision 135) made
 *    mock_create_attempt() unconditionally reject attempt_type =
 *    "full_mock" — a full_mock attempt must be created via
 *    mock_create_cycle_attempt(form_id, cycle_id) as part of an owned,
 *    open, cadence-gated Mock cycle. This page previously still called
 *    the old, now-guarded path (migration 085's own header disclosed
 *    this exact gap as deliberately deferred "future bounded UI work").
 *    handleBegin() below now discovers or starts a cycle first
 *    (migration 107's new mock_get_open_cycle(), plus the existing,
 *    unchanged mock_start_new_cycle()) and creates the attempt through
 *    the cycle-aware path. A genuine cadence-not-yet-elapsed rejection
 *    from mock_start_new_cycle() is surfaced exactly as received, never
 *    bypassed — this is a routing correction onto the EXISTING,
 *    already-approved architecture, not a new attempt route and not a
 *    cadence change.
 *
 * 2. GROUPED-QUESTION RENDERING. mock_get_question() and the manifest
 *    previously carried no grouping identity at all, so a grouped
 *    family's subparts (e.g. mock-mr01mr10-costumeschedule-01a/-01b)
 *    would have rendered as two disconnected, flatly-numbered questions
 *    instead of one "Question N (a) ... (b) ..." unit — the exact
 *    defect class Decision 155 found and fixed for the ADMIN review
 *    surface, but that fix never reached this learner-facing page.
 *    Migration 106 adds questionGroupId/groupOrder/subpartLabel to both
 *    mock_get_question()'s payload and a new mock_get_attempt_grouping()
 *    call; lib/mockAttempt/workspace.ts's own buildDisplayUnits() turns
 *    the raw manifest into "display units" (one per numbered question,
 *    one or more response components each); every question/answer/
 *    navigation/palette/flag/submit operation below is expressed in
 *    terms of units, not raw ids. A standalone question is a
 *    single-id unit — byte-identical rendering to before this decision.
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
  // Completion Assurance Programme, Completion B — starts at "checking",
  // never "intro": a learner must never see "Before you begin" exam
  // instructions for a mock Angel cannot actually deliver. The mount
  // effect below resolves this to "intro" or "unavailable" before
  // anything exam-shaped renders. handleBegin()'s own re-check (below,
  // unchanged) remains the authoritative, transactional gate before an
  // attempt is actually created — this is a second, earlier check for
  // truthful presentation, not a replacement for it.
  const [phase, setPhase] = useState<Phase>("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [units, setUnits] = useState<DisplayUnit[]>([]);
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [currentPayloads, setCurrentPayloads] = useState<MockQuestionPayload[]>([]);
  const [answerDrafts, setAnswerDrafts] = useState<string[]>([]);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<string>>(new Set());
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<Set<string>>(new Set());
  const [questionLoading, setQuestionLoading] = useState(false);

  const supabaseRef = useRef<ReturnType<typeof getSupabaseClient>>(null);
  const submittedRef = useRef(false);
  // Decision 217 (attempt-resume remediation) — the caller's own latest
  // known submitted VALUE per question id, not just whether it was
  // answered (answeredQuestionIds, above, already tracks that for the
  // palette). Populated once from getMockAttemptAnswers() on a fresh
  // start (empty) or a resume (the learner's own real persisted
  // answers), then kept current as new answers are submitted during the
  // live session. loadUnit() reads this to pre-fill a revisited
  // question's own draft — fixing a real, pre-existing gap this session
  // found: navigating back to an already-answered question previously
  // always showed a blank field, even within a single unrefreshed
  // session, because loadUnit() only ever set blank drafts. A ref, not
  // state: it never needs to trigger a re-render by itself, only to be
  // read at the moment a unit loads.
  const answeredValuesRef = useRef<Map<string, string>>(new Map());

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current || !attemptId) return;
    submittedRef.current = true;
    const supabase = supabaseRef.current;
    if (!supabase) return;
    // Save whatever is in the current draft(s) before locking, same as
    // any other navigation: a timeout must not discard an in-progress
    // answer, including every response component of a grouped question.
    await Promise.all(
      currentPayloads.map((payload, index) => {
        const draft = answerDrafts[index] ?? "";
        if (!draft.trim()) return Promise.resolve();
        return submitMockAnswer(supabase, attemptId, payload.questionId, { value: draft.trim() }).catch(() => {});
      })
    );
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
  }, [attemptId, currentPayloads, answerDrafts]);

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

  // Completion Assurance Programme, Completion B — the pre-instructions
  // truthfulness check. Reuses getActiveMockForm()/isMockFormAvailable()
  // unchanged (the same authoritative signal handleBegin() itself already
  // uses to gate attempt creation) so this page can never show "Before
  // you begin" for a mock it cannot deliver. Runs once, on mount, before
  // anything exam-shaped renders.
  useEffect(() => {
    (async () => {
      const supabase = getSupabaseClient();
      if (!supabase) { setErrorMessage("Not connected."); setPhase("error"); return; }
      supabaseRef.current = supabase;
      const active = await getActiveMockForm(supabase, ATTEMPT_TYPE);
      if (active.error) { setErrorMessage(active.error); setPhase("error"); return; }
      setPhase(isMockFormAvailable(active) ? "intro" : "unavailable");
    })();
  }, []);

  async function loadUnit(supabase: NonNullable<typeof supabaseRef.current>, attemptIdValue: string, unit: DisplayUnit) {
    setQuestionLoading(true);
    const results = await Promise.all(unit.questionIds.map((id) => getMockQuestion(supabase, attemptIdValue, id)));
    setQuestionLoading(false);
    const failure = results.find((result) => result.error || !result.data);
    if (failure) {
      setErrorMessage(failure.error ?? "Could not load this question.");
      setPhase("error");
      return;
    }
    setCurrentPayloads(results.map((result) => result.data as MockQuestionPayload));
    // Pre-fill from the learner's own latest known submitted value, if
    // any — see answeredValuesRef's own docstring above. Falls back to
    // an empty draft for a genuinely unanswered question, unchanged.
    setAnswerDrafts(unit.questionIds.map((id) => answeredValuesRef.current.get(id) ?? ""));
  }

  // Decision 217 (attempt-resume remediation) — the shared tail of both
  // the fresh-start and resume paths below: given a real, already-
  // started attempt id and its own real expiresAt, loads its manifest/
  // grouping (unchanged), optionally reloads any already-persisted
  // answers (resume only — a fresh attempt has none), computes a
  // deterministic starting position, and enters "in-progress". Never
  // calls mock_start_attempt() itself — the caller decides if/when that
  // is needed, since it must never be called twice on the same attempt
  // (see migration 149's own header for why that is already structurally
  // enforced server-side).
  async function enterAttempt(
    supabase: NonNullable<typeof supabaseRef.current>,
    attemptIdValue: string,
    expiresAtValue: string,
    prefillAnswers: Map<string, string>
  ) {
    const manifest = await getMockAttemptManifest(supabase, attemptIdValue);
    if (manifest.error || !manifest.data || manifest.data.length === 0) {
      setErrorMessage(manifest.error ?? "Could not load this attempt's question list.");
      setPhase("error");
      return;
    }

    const grouping = await getMockAttemptGrouping(supabase, attemptIdValue);
    if (grouping.error) { setErrorMessage(grouping.error); setPhase("error"); return; }

    const displayUnits = buildDisplayUnits(manifest.data, grouping.data ?? []);

    // Deterministic recovery position (Section 5 of the governing
    // directive) — see computeResumeStartIndex()'s own docstring
    // (lib/mockAttempt/workspace.ts) for why no new "last visited
    // question" state is invented: current_section (migration 070) is
    // declared but never written by any function, so the first genuinely
    // unanswered display unit is the defensible, tested default —
    // byte-identical to unit 0 for a fresh attempt (nothing is answered
    // yet, so the first unanswered unit IS unit 0).
    const answeredIds = new Set(prefillAnswers.keys());
    const startIndex = computeResumeStartIndex(displayUnits, answeredIds);

    answeredValuesRef.current = prefillAnswers;
    setAttemptId(attemptIdValue);
    setExpiresAt(expiresAtValue);
    submittedRef.current = false;
    setAnsweredQuestionIds(answeredIds);
    setFlaggedQuestionIds(new Set());
    setUnits(displayUnits);
    setCurrentUnitIndex(startIndex);
    setPhase("in-progress");
    await loadUnit(supabase, attemptIdValue, displayUnits[startIndex]);
  }

  async function handleBegin() {
    setErrorMessage("");
    setPhase("checking");
    const supabase = getSupabaseClient();
    if (!supabase) { setErrorMessage("Not connected."); setPhase("error"); return; }
    supabaseRef.current = supabase;

    const active = await getActiveMockForm(supabase, ATTEMPT_TYPE);
    if (active.error) { setErrorMessage(active.error); setPhase("error"); return; }
    if (!isMockFormAvailable(active)) { setPhase("unavailable"); return; }

    setPhase("starting");
    const profileId = await ensureProfile();
    if (!profileId) { setErrorMessage("Could not establish a learner profile."); setPhase("error"); return; }

    // Migration 149 (Decision 217) — before creating a brand-new attempt,
    // discover whether the caller already has one for this exact form
    // (e.g. a refresh or lost tab mid-sitting). Absence is not an error —
    // the existing "no resumable attempt" branch below is byte-identical
    // to this file's own pre-217 behaviour.
    const resumable = await getResumableMockAttempt(supabase, active.data.formId);
    if (resumable.error) { setErrorMessage(resumable.error); setPhase("error"); return; }

    // The actual branching decision is a pure, independently-tested
    // function (lib/mockAttempt/workspace.ts) — see its own docstring
    // for the full rationale of each of the four possible outcomes.
    const resumeAction = determineMockResumeAction(resumable.data);

    if (resumeAction.kind === "finalize_expired") {
      // Timer integrity (Section 6): an expired attempt is never resumed
      // as though time remains. mock_get_question()/mock_submit_answer()
      // would already refuse further reads/writes against it regardless
      // (they independently re-check now() > expires_at server-side) —
      // this branch simply closes it out cleanly via the SAME
      // mock_submit_attempt() the live countdown already calls at expiry,
      // rather than leaving the learner stuck on a workspace that can
      // never successfully answer anything.
      const finalised = await submitMockAttempt(supabase, resumeAction.attemptId);
      if (finalised.error) { setErrorMessage(finalised.error); setPhase("error"); return; }
      setAttemptId(resumeAction.attemptId);
      submittedRef.current = true;
      setPhase("submitted");
      return;
    }

    if (resumeAction.kind === "start_fresh") {
      // Never started (e.g. the client crashed between creating the
      // attempt and starting it) — no time has been consumed, so start
      // it now, exactly as a fresh attempt would be. mock_start_attempt()
      // itself requires status = 'assigned' and can never be called
      // again once it succeeds — repeated resume can never re-start, and
      // therefore never extend, the timer.
      const started = await startMockAttempt(supabase, resumeAction.attemptId, DURATION_MINUTES);
      if (started.error || !started.data) { setErrorMessage(started.error ?? "Could not start the attempt."); setPhase("error"); return; }
      await enterAttempt(supabase, resumeAction.attemptId, started.data.expiresAt, new Map());
      return;
    }

    if (resumeAction.kind === "resume_in_progress") {
      // Genuinely resuming. Never call mock_start_attempt() again (it
      // would be rejected regardless, since its own precondition
      // requires status = 'assigned'). Use the real, already-set
      // expiresAt the lookup itself returned — never recomputed, never
      // extended.
      const answers = await getMockAttemptAnswers(supabase, resumeAction.attemptId);
      if (answers.error) { setErrorMessage(answers.error); setPhase("error"); return; }
      await enterAttempt(supabase, resumeAction.attemptId, resumeAction.expiresAt, answers.data ?? new Map());
      return;
    }

    // resumeAction.kind === "create_new" — unchanged from this file's own pre-217
    // behaviour. Migration 107 (Decision 161) — a full_mock attempt must
    // be created through an owned, open Mock cycle. Discover an existing
    // one first; only start a new one (subject to the ~14-day cadence
    // check that function itself enforces) if none exists. See this
    // file's own header for why the old, now-guarded mock_create_attempt()
    // path can no longer be used for attempt_type "full_mock".
    const openCycle = await getOpenMockCycle(supabase);
    if (openCycle.error) { setErrorMessage(openCycle.error); setPhase("error"); return; }
    let cycleId = openCycle.data;
    if (!cycleId) {
      const cycleStart = await startNewMockCycle(supabase);
      if (cycleStart.error || !cycleStart.data) {
        setErrorMessage(cycleStart.error ?? "Could not start a new Mock cycle.");
        setPhase("error");
        return;
      }
      cycleId = cycleStart.data;
    }

    const created = await createMockCycleAttempt(supabase, active.data.formId, cycleId);
    if (created.error || !created.data) { setErrorMessage(created.error ?? "Could not create an attempt."); setPhase("error"); return; }

    const started = await startMockAttempt(supabase, created.data, DURATION_MINUTES);
    if (started.error || !started.data) { setErrorMessage(started.error ?? "Could not start the attempt."); setPhase("error"); return; }

    await enterAttempt(supabase, created.data, started.data.expiresAt, new Map());
  }

  async function handleAnswerAndAdvance(nextUnitIndex: number | null) {
    const supabase = supabaseRef.current;
    const currentUnit = units[currentUnitIndex];
    if (!supabase || !attemptId || !currentUnit) return;

    const results = await Promise.all(
      currentUnit.questionIds.map((id, index) => {
        const draft = answerDrafts[index] ?? "";
        if (!draft.trim()) return Promise.resolve(null);
        return submitMockAnswer(supabase, attemptId, id, { value: draft.trim() });
      })
    );
    const failed = results.find((result) => result && result.error);
    if (failed) { setErrorMessage(failed.error as string); setPhase("error"); return; }

    const newlyAnswered = currentUnit.questionIds.filter((_, index) => (answerDrafts[index] ?? "").trim());
    if (newlyAnswered.length > 0) {
      setAnsweredQuestionIds((prev) => {
        const next = new Set(prev);
        newlyAnswered.forEach((id) => next.add(id));
        return next;
      });
      currentUnit.questionIds.forEach((id, index) => {
        const draft = (answerDrafts[index] ?? "").trim();
        if (draft) answeredValuesRef.current.set(id, draft);
      });
    }

    if (nextUnitIndex !== null) {
      setCurrentUnitIndex(nextUnitIndex);
      await loadUnit(supabase, attemptId, units[nextUnitIndex]);
    }
  }

  async function handleToggleFlag() {
    const supabase = supabaseRef.current;
    const currentUnit = units[currentUnitIndex];
    if (!supabase || !attemptId || !currentUnit) return;
    // Flagging is a whole-displayed-question action: a grouped unit's
    // subparts are flagged/unflagged together (matching buildPalette()'s
    // own "flagged if ANY subpart is flagged" read), never independently.
    const nextFlagged = !currentUnit.questionIds.some((id) => flaggedQuestionIds.has(id));
    const results = await Promise.all(currentUnit.questionIds.map((id) => setMockFlag(supabase, attemptId, id, nextFlagged)));
    const failed = results.find((result) => result.error);
    if (failed) { setErrorMessage(failed.error as string); setPhase("error"); return; }
    setFlaggedQuestionIds((prev) => {
      const next = new Set(prev);
      currentUnit.questionIds.forEach((id) => {
        if (nextFlagged) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  }

  const currentUnit: DisplayUnit | undefined = units[currentUnitIndex];
  const palette = buildPalette(units, answeredQuestionIds, flaggedQuestionIds, currentUnitIndex);
  const unanswered = unansweredUnitIndices(units, answeredQuestionIds);
  const expired = expiresAt ? isAttemptExpired(expiresAt) : false;
  const currentFlagged = !!currentUnit && currentUnit.questionIds.some((id) => flaggedQuestionIds.has(id));

  function goToUnitContainingId(id: string) {
    const targetIndex = units.findIndex((unit) => unit.questionIds.includes(id));
    if (targetIndex === -1) return;
    return targetIndex;
  }

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
              const previousIndex = currentUnitIndex > 0 ? currentUnitIndex - 1 : null;
              const nextIndex = currentUnitIndex >= 0 && currentUnitIndex < units.length - 1 ? currentUnitIndex + 1 : null;
              return (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Question {currentUnitIndex + 1} of {units.length}
                    </p>
                    <ExamTimer remainingSeconds={remainingSeconds ?? 0} />
                  </div>

                  <InfoCard>
                    {questionLoading || currentPayloads.length === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500" aria-live="polite">Loading question…</p>
                    ) : (
                      <MockQuestionRenderer
                        payloads={currentPayloads}
                        values={answerDrafts}
                        onChange={(index, value) => setAnswerDrafts((prev) => prev.map((draft, i) => (i === index ? value : draft)))}
                      />
                    )}

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50 dark:border-gray-800">
                      <button
                        onClick={handleToggleFlag}
                        disabled={!currentUnit}
                        aria-pressed={currentFlagged}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 disabled:opacity-30"
                      >
                        <Flag size={13} className={currentFlagged ? "text-amber-500 fill-amber-500" : ""} />
                        {currentFlagged ? "Flagged for review" : "Flag for review"}
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAnswerAndAdvance(previousIndex)}
                          disabled={previousIndex === null}
                          className="text-xs font-semibold text-gray-500 dark:text-gray-400 disabled:opacity-30 px-2"
                        >
                          Back
                        </button>
                        {nextIndex !== null ? (
                          <Button onClick={() => handleAnswerAndAdvance(nextIndex)} size="sm">
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
                    if (currentUnit && currentUnit.questionIds.includes(id)) return;
                    const targetIndex = goToUnitContainingId(id);
                    if (targetIndex !== undefined) void handleAnswerAndAdvance(targetIndex);
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
                  {palette.filter((entry) => entry.flagged).length} question{palette.filter((entry) => entry.flagged).length === 1 ? "" : "s"} flagged for review
                </p>
              </InfoCard>
            )}

            <QuestionPalette
              entries={palette}
              onSelect={(id) => {
                const targetIndex = goToUnitContainingId(id);
                if (targetIndex === undefined) return;
                setPhase("in-progress");
                void handleAnswerAndAdvance(targetIndex);
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
 * treatment is a named, deferred gap (see this file's header). Renders
 * `question` safely whether it's the plain string every fixture used so
 * far has been, or an unrecognised rich-content shape.
 *
 * Mathematics First Mock Form-Assembly Gate (Decision 161) — now accepts
 * one payload per response component in the current display unit. A
 * standalone question (`payloads.length === 1`) renders byte-identically
 * to before this decision. A grouped question (`payloads.length > 1`)
 * renders every subpart together, each with its own subpart label (from
 * ali_question_bank.subpart_label, migration 093/106 — never guessed
 * from array position) and its own independent answer control, matching
 * the real compound structure the content was authored and reviewed as
 * (migration 095, Decision 155).
 */
function MockQuestionRenderer({
  payloads,
  values,
  onChange,
}: {
  payloads: MockQuestionPayload[];
  values: string[];
  onChange: (index: number, value: string) => void;
}) {
  if (payloads.length <= 1) {
    const payload = payloads[0];
    const questionText = typeof payload.question === "string" ? payload.question : JSON.stringify(payload.question);
    const stimulus = isValidTableStimulus(payload.stimulus) ? payload.stimulus : null;
    return (
      <div>
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-2">
          <span className="uppercase tracking-wide font-semibold">{payload.subject}</span>
          <span>{payload.marks} mark{payload.marks === 1 ? "" : "s"}</span>
        </div>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">{questionText}</p>
        {stimulus && <DataTableStimulus stimulus={stimulus} />}
        <textarea
          value={values[0] ?? ""}
          onChange={(e) => onChange(0, e.target.value)}
          rows={4}
          className="w-full mt-4 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
          placeholder="Your answer…"
        />
      </div>
    );
  }

  const totalMarks = payloads.reduce((sum, payload) => sum + payload.marks, 0);
  // Decision 170 — one shared stimulus rendered once for the whole grouped
  // experience (display-unit level), never once per raw subpart.
  const sharedStimulus = selectDisplayUnitStimulus(payloads);
  // Shared-Scenario Presentation Correction (Decision 180) — resolved
  // only via the explicit sharedStem content contract (migration 121/
  // 122), never by parsing/diffing question text here. null for every
  // group that hasn't authored a genuinely safe shared stem (every group
  // before this increment, and every ordinary Classification B/C/S group
  // after it) — those render each subpart's full question text below,
  // byte-identical to before this correction.
  const questionTexts = payloads.map((payload) => (typeof payload.question === "string" ? payload.question : JSON.stringify(payload.question)));
  const sharedStem = resolveGroupSharedStem(payloads.map((payload, i) => ({ question: questionTexts[i], sharedStem: payload.sharedStem })));
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-2">
        <span className="uppercase tracking-wide font-semibold">{payloads[0].subject}</span>
        <span>{totalMarks} mark{totalMarks === 1 ? "" : "s"} total</span>
      </div>
      {sharedStimulus && <DataTableStimulus stimulus={sharedStimulus} />}
      {sharedStem && (
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed mb-4">{sharedStem.stem}</p>
      )}
      <div className="space-y-5">
        {payloads.map((payload, index) => {
          const questionText = sharedStem ? sharedStem.tails[index] : questionTexts[index];
          return (
            <div key={payload.questionId}>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                {payload.subpartLabel ?? `(${index + 1})`}
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">{questionText}</p>
              <textarea
                value={values[index] ?? ""}
                onChange={(e) => onChange(index, e.target.value)}
                rows={3}
                className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                placeholder="Your answer…"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
