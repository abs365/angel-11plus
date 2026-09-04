"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
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
  createMockAttempt,
  startMockAttempt,
  getMockAttemptManifest,
  getMockAttemptGrouping,
  getMockQuestion,
  submitMockAnswer,
  submitMockAttempt,
  setMockFlag,
  getResumableMockAttempt,
  getMockAttemptAnswers,
  getSubmittedMockAttempts,
} from "@/lib/mockAttempt/client";
import { requestReadingScoring, logReadingScoringRequestOutcome } from "@/lib/mockAttempt/readingScoringRequest";
import { computeSubjectPreparationSummary } from "@/lib/learningEngine/preparationState";
import { derivePreparationStage } from "@/lib/learningEngine/preparationStage";
import { resolvePreparationClock } from "@/lib/learningEngine/preparationClock";
import { classifyMockAccess, type MockAccessAssessment } from "@/lib/ali/mockAccessPolicy";
import { getSchoolYear } from "@/lib/progress";
import type { MockAttemptType, MockQuestionPayload } from "@/lib/mockAttempt/types";
import {
  resolveAttemptType,
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
import { ReadingPassage } from "@/components/mockAttempt/ReadingPassage";

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

// See the file header's own disclosed limitation: one server-authoritative
// timer for the whole attempt, not yet the real two-paper section model.
// Programme Completion Increment 016 — per-attempt-type duration, since a
// single fixed 60 minutes is Mathematics Mock 1's own duration specifically,
// not a universal figure. Reading Comprehension Mock 1's approved Angel
// timing decision (composition_provenance.timingDecision, migrations
// 212/217) is "45 minutes + 10 minutes reading time" -- found, corrected
// during this same increment's own audit, that this map originally wired
// through only 45, dropping the additional 10-minute reading allowance.
// Corrected to 55 (45+10): this codebase has one combined, server-
// authoritative timer, not a separately-enforced reading-only phase (the
// same "single combined sitting" interpretation the real CSSE English
// paper's own evidenced structure uses -- "a single 70-minute sitting
// (60 minutes + 10 minutes reading)", never two independently-clocked
// phases). Not invented here, only correctly wired through in full, since
// the active-form RPC itself does not return a duration figure to derive
// this from structurally.
const DURATION_MINUTES_BY_ATTEMPT_TYPE: Record<MockAttemptType, number> = {
  full_mock: 60,
  timed_section: 55,
  diagnostic_mock: 60,
};

const MOCK_DISPLAY_NAME_FALLBACK_BY_ATTEMPT_TYPE: Record<MockAttemptType, string> = {
  full_mock: "Mathematics Mock 1",
  timed_section: "Reading Comprehension Mock 1",
  diagnostic_mock: "Mock",
};

const INTRO_SUBTITLE_BY_ATTEMPT_TYPE: Record<MockAttemptType, string> = {
  full_mock: "A timed, sealed Mathematics sitting. You will not see whether an answer is correct until your report is ready.",
  timed_section: "A timed, sealed Reading Comprehension sitting. You will not see whether an answer is correct until your report is ready.",
  diagnostic_mock: "A timed, sealed assessment. You will not see whether an answer is correct until your report is ready.",
};

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

export default function MockExamPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  // Fail-safe validation, matching this codebase's own established
  // "absent/unrecognised is not an error, it silently falls back" pattern
  // (app/learning-intelligence/practice/[area]/page.tsx's own
  // requestedFocus). resolveAttemptType() is a pure, independently-tested
  // function (lib/mockAttempt/workspace.ts) — Programme Completion
  // Increment 016.
  const { type } = use(searchParams);
  const attemptType: MockAttemptType = resolveAttemptType(type);
  const durationMinutes = DURATION_MINUTES_BY_ATTEMPT_TYPE[attemptType];

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
  // Decision 220 (Mathematics Mock 1 report-release and discoverability
  // increment) — the caller's own past submitted attempts for this form,
  // so a returning learner can find a Mock they already finished, not
  // only one they are mid-way through (that remains getResumableMockAttempt()'s
  // own, separate job). Empty until the mount effect below resolves it.
  const [previousAttempts, setPreviousAttempts] = useState<{ attemptId: string; submittedAt: string }[]>([]);
  // Programme Increment 019, Part 6 — Mock Access Policy. Best-effort,
  // display-only, and deliberately never gates the "I'm ready to begin"
  // flow (see this page's own mount effect for why) — this Mock remains
  // TECHNICALLY_AVAILABLE and startable regardless of what this resolves
  // to; it only adds an honest, evidence-based note about whether current
  // evidence recommends it as the next best action right now.
  const [mockAccess, setMockAccess] = useState<MockAccessAssessment | null>(null);
  // Programme Completion Increment 015 — real form-metadata-driven
  // identity (migration 214's displayName), replacing the previously
  // hardcoded "Mathematics Mock 1" literal. Programme Completion
  // Increment 016 — the fallback (used only until the active form's own
  // displayName loads) is now keyed by the resolved attemptType, since
  // this page can serve more than one Mock family.
  const [mockDisplayName, setMockDisplayName] = useState(MOCK_DISPLAY_NAME_FALLBACK_BY_ATTEMPT_TYPE[attemptType]);

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
    // this client never triggers Mathematics scoring itself. Marking
    // happens automatically, server-side, the moment mock_submit_attempt()
    // locks the attempt (migration 074's own redefined report-init
    // trigger) — authoritative scoring is controlled by Angel's own
    // trusted database boundary, never learner/browser-initiated. This
    // client has no execute grant on mock_score_attempt at all.
    //
    // Programme Completion Increment 016 — Reading Comprehension content
    // cannot be scored that same way (mock_score_attempt() only
    // understands Mathematics' plain scalar answer contract; Reading's
    // real, tiered contract needs the TypeScript englishAnswerValidation
    // engine, which cannot run inside Postgres). For a genuine Reading
    // submission only, this client may REQUEST that its own just-locked
    // attempt be processed — a request, never a result: it supplies only
    // the attempt id it already legitimately owns, never any correctness/
    // marks/answer claim. The actual computation runs entirely server-
    // side (app/api/mock-reading-scoring/route.ts ->
    // lib/server/mockScoringAuthority.ts), authenticated as a dedicated,
    // least-privilege database role this client can never reach directly,
    // and every invariant that matters (canonical mark ceilings, TIER3/5
    // judgement-required content, manifest membership, idempotency) is
    // independently enforced by migration 219's own functions regardless
    // of what this request does or fails to do.
    //
    // ASSESSMENT SUBMISSION SUCCESS (this function, above this line —
    // mock_submit_attempt() has already committed) is deliberately kept
    // separate in code from POST-SUBMISSION SCORING PROCESSING (this
    // line, below): the scoring request is still never awaited by this
    // handler, so a scoring-service failure can never re-open, block, or
    // undo the learner's own already-successful submission. What changed
    // in the Founder invocation-reliability repair is only what happens
    // to the RESULT of that request — lib/mockAttempt/
    // readingScoringRequest.ts's own requestReadingScoring() now inspects
    // the real HTTP outcome instead of discarding it, and
    // logReadingScoringRequestOutcome() surfaces a non-success outcome
    // (bounded, non-blocking, console only). It still does not retry on
    // its own — recovery is the mock-report page's own bounded, idempotent
    // job (Part C of the same repair, lib/mockAttempt/workspace.ts's own
    // isReadingScoringRecoveryEligible()), and background/scheduled
    // recovery automation remains a separate, deferred piece (Founder
    // directive, Section F), not implemented in this increment.
    if (attemptType === "timed_section") {
      void requestReadingScoring(supabase, attemptId).then(logReadingScoringRequestOutcome);
    }
    setPhase("submitted");
  }, [attemptId, attemptType, currentPayloads, answerDrafts]);

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
      const active = await getActiveMockForm(supabase, attemptType);
      if (active.error) { setErrorMessage(active.error); setPhase("error"); return; }
      // Decision 220 — best-effort, and deliberately AFTER the phase
      // decision below, never gating it: a failure here must never block
      // the "I'm ready to begin" flow itself, only the optional "previous
      // Mock" section silently stays empty.
      if (isMockFormAvailable(active)) {
        if (active.data.displayName) setMockDisplayName(active.data.displayName);
        const submitted = await getSubmittedMockAttempts(supabase, active.data.formId);
        if (!submitted.error && submitted.data) setPreviousAttempts(submitted.data);
      }
      setPhase(isMockFormAvailable(active) ? "intro" : "unavailable");

      // Programme Increment 019, Part 6 — same best-effort, never-gating
      // pattern as the previous-attempts lookup immediately above. A
      // failure here leaves mockAccess null, and the page simply omits
      // the recommendation note — the "I'm ready to begin" flow is
      // completely unaffected either way.
      (async () => {
        const profileId = await ensureProfile();
        if (!profileId) return;
        const [writingSummary, mathsSummary, englishSummary] = await Promise.all([
          computeSubjectPreparationSummary(supabase, profileId, "Continuous Writing"),
          computeSubjectPreparationSummary(supabase, profileId, "Mathematics"),
          computeSubjectPreparationSummary(supabase, profileId, "English Comprehension"),
        ]);
        const clock = resolvePreparationClock(new Date());
        const stage = derivePreparationStage([writingSummary, mathsSummary, englishSummary], clock, getSchoolYear());
        setMockAccess(classifyMockAccess({ technicallyAvailable: isMockFormAvailable(active), stage, clock }));
      })().catch(() => {});
    })();
    // attemptType is resolved once from searchParams (use()) and is
    // stable for this component's lifetime — a real navigation to a
    // different ?type= remounts this page tree in the App Router, it
    // does not change this value in place. Declared as a dependency
    // below because this effect genuinely reads it, matching the real
    // rule, not a suppressed warning.
  }, [attemptType]);

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

    const active = await getActiveMockForm(supabase, attemptType);
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
      // See handleSubmit's own comment above: submission success and
      // scoring-request processing stay separate here too, and the
      // request is still never awaited.
      if (attemptType === "timed_section") {
        void requestReadingScoring(supabase, resumeAction.attemptId).then(logReadingScoringRequestOutcome);
      }
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
      const started = await startMockAttempt(supabase, resumeAction.attemptId, durationMinutes);
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

    // resumeAction.kind === "create_new". Migration 085 (Decision 135)
    // made mock_create_attempt() unconditionally reject attempt_type =
    // "full_mock" — a full_mock attempt must be created through an owned,
    // open Mock cycle. That migration's own header states this guard is
    // scoped to "full_mock" specifically: "timed_section and
    // diagnostic_mock behaviour through this same function is completely
    // unchanged" (confirmed directly against migration 085/107's source,
    // Programme Completion Increment 016). So Mathematics (full_mock)
    // keeps the cycle-aware path, byte-for-byte unchanged from before this
    // increment; every other attempt_type (Reading's timed_section today)
    // uses the plain, already-existing, already-uncycled path — not a new
    // Mock engine, the same one migration 070 has always provided for
    // non-full_mock attempts.
    let createdAttemptId: string;
    if (attemptType === "full_mock") {
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
      createdAttemptId = created.data;
    } else {
      const created = await createMockAttempt(supabase, active.data.formId, attemptType);
      if (created.error || !created.data) { setErrorMessage(created.error ?? "Could not create an attempt."); setPhase("error"); return; }
      createdAttemptId = created.data;
    }

    const started = await startMockAttempt(supabase, createdAttemptId, durationMinutes);
    if (started.error || !started.data) { setErrorMessage(started.error ?? "Could not start the attempt."); setPhase("error"); return; }

    await enterAttempt(supabase, createdAttemptId, started.data.expiresAt, new Map());
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
            {/* Gate 6 presentation correction (Founder decision) — this
                heading must never claim a combined English+Mathematics
                sitting. Programme Completion Increment 015 — name now
                comes from the real active form's own metadata (migration
                214), not a hardcoded literal. */}
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">{mockDisplayName}</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {INTRO_SUBTITLE_BY_ATTEMPT_TYPE[attemptType]}
            </p>
            {/* Programme Increment 019, Part 6 — Mock Access Policy. Never
                a claim that the learner "is Mock ready" (this increment's
                own explicit instruction) -- only a plain statement of
                whether current evidence recommends this as the next best
                action right now. The Mock itself is always startable
                below regardless of what this says. */}
            {mockAccess && mockAccess.availabilityLevel !== "educationally_recommended" && (
              <p className="text-amber-700 dark:text-amber-400 text-xs mt-2 leading-relaxed">{mockAccess.reasons[0]}</p>
            )}

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

            {previousAttempts.length > 0 && (
              <InfoCard className="mt-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Your previous Mock</p>
                <ul className="mt-2 space-y-1.5">
                  {previousAttempts.map((attempt) => (
                    <li key={attempt.attemptId}>
                      <Link
                        href={`/learning-intelligence/mock-report/${attempt.attemptId}`}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400"
                      >
                        Check your Mock report from {new Date(attempt.submittedAt).toLocaleDateString()} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </InfoCard>
            )}
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
            <Link href="/learning-intelligence" className="inline-block mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400">
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
                className="min-h-[44px] inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 px-2"
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
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400"
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
            {/* Decision 220 — attemptId is already known here; the report
                page itself (not this screen) is the safe surface that
                decides whether a report is actually ready to show, so no
                report_release_state check is duplicated here. */}
            {attemptId && (
              <ButtonLink href={`/learning-intelligence/mock-report/${attemptId}`} className="mt-5">
                Check your Mock report
              </ButtonLink>
            )}
            <ButtonLink href="/learning-intelligence" className="mt-3" variant="outline">
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
        {payload.passageText && <ReadingPassage title={payload.passageTitle} text={payload.passageText} />}
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
      {/* Every subpart in a group is a lettered split of the SAME
          original numbered question, so they always share one passage —
          payloads[0]'s passageText is authoritative for the whole group,
          never re-fetched or re-derived per subpart. */}
      {payloads[0].passageText && <ReadingPassage title={payloads[0].passageTitle} text={payloads[0].passageText} />}
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
