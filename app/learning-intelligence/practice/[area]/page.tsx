"use client";

import { use, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { withTimeout } from "@/lib/withTimeout";
import { recordPresentation, recordOutcome } from "@/lib/ali/history";
import { completeLesson, recordSkillResult, getSelectedPathwayId, setSelectedPathway } from "@/lib/progress";
import { fetchLearnerIntelligenceProfile } from "@/lib/learningEngine/profile";
import { recordReadinessSnapshot } from "@/lib/learningEngine/learningHistory";
import { QUESTION_TYPE_PRIMARY_COMPETENCY } from "@/lib/learningEngine/assessmentBrainMap";
import { generatePersonalisedSession } from "@/lib/learningEngine/sessionGenerator";
import {
  getEducationalIntelligence,
  processEvidenceForCompetency,
  type EducationalIntelligenceSnapshot,
} from "@/lib/learningEngine/educationalIntelligenceService";
import type { CompetencyId, QuestionTypeId } from "@/lib/learningEngine/types";
import {
  getPracticeArea,
  checkMathsAnswer,
  scoreEnglishAnswer,
  WRITING_CORRECTNESS_THRESHOLD,
} from "@/lib/learningEngine/practiceContent";
import { scoreEnglishComprehensionAnswer, type EnglishScoringResult, type ValidationTier } from "@/lib/learningEngine/englishAnswerValidation";
import { getExamStrategyHint, getWorkedExample } from "@/lib/learningEngine/englishExamStrategies";
import { CompetencyProfile } from "@/components/learningEngine/CompetencyProfile";
import { EvidenceProfile } from "@/components/learningEngine/EvidenceProfile";
import { DiagnosticOverview } from "@/components/learningEngine/DiagnosticOverview";
import { ReadinessSummary } from "@/components/learningEngine/ReadinessSummary";
import { RecommendationSummary } from "@/components/learningEngine/RecommendationSummary";
import type { BankQuestion } from "@/types/ali/questionBank";
import type { LearnerIntelligenceProfile } from "@/lib/learningEngine/types";
import type { WritingFeedback } from "@/types/writing-feedback";
import type { EnglishComprehensionPrompt } from "@/types/ali/questionBank";
import type { MathsQuestion } from "@/types/index";

type Mode = "intro" | "loading" | "error" | "session" | "results";

/**
 * Capability 3, Wave 2 — Practice Experience session runner. One dynamic
 * route serving all three areas (Reading Comprehension / Mathematics /
 * Continuous Writing) since the journey shape is identical across all
 * three (Start -> Complete activity -> Record evidence -> Updated profile);
 * only the per-activity renderer and correctness check differ.
 *
 * Persistence reuses lib/ali/history.ts's real recordPresentation/
 * recordOutcome unchanged (Wave 1's read-side already reads the same
 * tables these write to) — tagged source: "practice_experience" so it's
 * distinguishable from the adaptive mocks' "adaptive_mock" writes without
 * a schema change (ali_student_question_history.source is a plain,
 * open-ended text column by design).
 */
export default function PracticeSessionPage({ params }: { params: Promise<{ area: string }> }) {
  const { area: areaId } = use(params);
  const area = getPracticeArea(areaId);

  const [mode, setMode] = useState<Mode>("intro");
  const [errorMessage, setErrorMessage] = useState("");
  const [activities, setActivities] = useState<BankQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [writingFeedback, setWritingFeedback] = useState<WritingFeedback | null>(null);
  const [writingFeedbackError, setWritingFeedbackError] = useState("");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [correctCount, setCorrectCount] = useState(0);
  // Educational Increment 007B, Part 3-4 — English Answer Validation
  // Architecture live-loop integration. Non-null only for Tier 3/5
  // Reading Comprehension answers, where Angel can verify part of the
  // response (a quotation, or a named component like an emotion) but
  // cannot reliably auto-grade the accompanying explanation. Rendering
  // this instead of an immediate correct/incorrect tick is what keeps
  // that limitation honest, per the explicit instruction not to convert
  // an unverifiable component into false mastery evidence.
  const [pendingSelfAssessment, setPendingSelfAssessment] = useState<EnglishScoringResult | null>(null);
  // Educational Increment 007C, Part 9 — the automatically-verified
  // result of the last attempt (Tier 2/4/6/legacy only), kept so wrong-
  // answer feedback can be specific (e.g. multi-select over-selection)
  // rather than a bare "incorrect". Only ever holds data this closure
  // genuinely computed — never a fabricated diagnosis.
  const [lastAutoResult, setLastAutoResult] = useState<EnglishScoringResult | null>(null);
  const [profile, setProfile] = useState<LearnerIntelligenceProfile | null | undefined>(undefined);
  // Sprint 3 (ANGEL-CSSE-002A, Personalised Practice) — per-activity learner
  // explanations and the session-level parent/learner summary, both from
  // generatePersonalisedSession(). Keyed by question id.
  const [activityExplanations, setActivityExplanations] = useState<Map<string, string>>(new Map());

  const profileIdRef = useRef<string>("");
  const sessionIdRef = useRef<string>(`practice-${areaId}-${Date.now()}`);
  const supabaseRef = useRef<ReturnType<typeof getSupabaseClient>>(null);
  // Pre-SESSION Educational Intelligence snapshots (Deliverable 7 fix —
  // see recordAndAdvance()'s docstring below for why these must be
  // captured before recordPresentation() runs, not inside recordAndAdvance).
  const preSessionSnapshotsRef = useRef<Map<CompetencyId, EducationalIntelligenceSnapshot>>(new Map());

  if (!area) {
    return (
      <PageLayout breadcrumbs={[{ label: "Learning Report", href: "/learning-intelligence" }, { label: "Practice" }]}>
        <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
          <InfoCard>
            <p className="text-sm text-gray-500 dark:text-gray-400">Unknown practice area.</p>
            <Link href="/learning-intelligence/practice" className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-2 inline-block">
              Back to practice
            </Link>
          </InfoCard>
        </div>
      </PageLayout>
    );
  }

  async function loadAndStart() {
    setMode("loading");
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("no client");
      supabaseRef.current = supabase;

      const profileId = await withTimeout(ensureProfile(), 10000, "your practice profile");
      if (!profileId) throw new Error("no profile");
      profileIdRef.current = profileId;

      // This page is CSSE-scoped, matching the Learning Engine model it
      // feeds (LEARNING_ENGINE_V1.md — no basis for GL/CEM/ISEB learners).
      // Practising here implies CSSE, so we set it — consistent with how
      // /pathways already lets a learner change their selected pathway.
      if (getSelectedPathwayId() !== "csse") setSelectedPathway("csse");

      const session = await withTimeout(
        generatePersonalisedSession(supabase, profileId, area!.id, new Date()),
        10000,
        "today's activities"
      );
      const tagged = session.activities.map((a) => a.question);

      if (tagged.length === 0) {
        throw new Error(session.summary);
      }

      setActivityExplanations(new Map(session.activities.map((a) => [a.question.id, a.explanation])));

      // Capture each competency's Educational Intelligence snapshot BEFORE
      // recordPresentation() below touches last_presented_at for every
      // question in this session. last_presented_at is also the real
      // signal a Maintenance Review's calendar gap is computed from
      // (lib/ali/durableMastery.ts's isMaintenanceReviewDue) — capturing
      // the pre-attempt snapshot later, inside recordAndAdvance(), would
      // read a last_presented_at this same session's own load step had
      // already reset to "now" moments earlier, permanently hiding any
      // genuine review-due gap. Reusing this cached snapshot for each
      // competency's first answer this session, instead of a fresh read
      // taken after recordPresentation, is what makes a real Maintenance
      // Review detectable at all through this page.
      const competencyIdsThisSession = new Set(
        tagged
          .map((q) => QUESTION_TYPE_PRIMARY_COMPETENCY[q.skill as QuestionTypeId])
          .filter((id): id is CompetencyId => Boolean(id))
      );
      preSessionSnapshotsRef.current = new Map(
        await Promise.all(
          Array.from(competencyIdsThisSession).map(
            async (id) => [id, await getEducationalIntelligence(supabase, profileId, id)] as const
          )
        )
      );

      await withTimeout(
        recordPresentation(supabase, profileId, tagged.map((q) => q.id), "practice_experience"),
        10000,
        "starting your session"
      );

      setActivities(tagged);
      setIndex(0);
      setCorrectCount(0);
      setMode("session");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setMode("error");
    }
  }

  const current = activities[index];

  function resetActivityUiState() {
    setAnswer("");
    setSubmitted(false);
    setLastCorrect(null);
    setPendingSelfAssessment(null);
    setLastAutoResult(null);
    setWritingFeedback(null);
    setWritingFeedbackError("");
    setCheckedItems(new Set());
  }

  async function recordAndAdvance(
    isCorrect: boolean,
    legacySkill: string,
    supportTier: "independent" | "supported" = "independent"
  ) {
    setLastCorrect(isCorrect);
    setSubmitted(true);
    if (isCorrect) setCorrectCount((c) => c + 1);

    const supabase = supabaseRef.current;
    if (supabase && profileIdRef.current) {
      // Educational Intelligence evidence pipeline (Permanent Engineering
      // Rule 1 — no feature may bypass the Engine). The pre-attempt
      // snapshot must reflect state from BEFORE this attempt's evidence is
      // written, so processEvidenceForCompetency() can detect a genuine
      // Maintenance Review event. For a competency's first answer this
      // session, that is the snapshot loadAndStart() captured before
      // recordPresentation() touched last_presented_at (see its comment);
      // for any later answer in the same competency this session, a fresh
      // read is correct (no session-start reset has intervened since).
      // recordOutcome() is awaited, not fire-and-forget, so it cannot race
      // the post-attempt read inside processEvidenceForCompetency().
      const competencyId = QUESTION_TYPE_PRIMARY_COMPETENCY[current.skill as QuestionTypeId];
      let preAttemptSnapshot: EducationalIntelligenceSnapshot | null = null;
      if (competencyId) {
        const cached = preSessionSnapshotsRef.current.get(competencyId);
        if (cached) {
          preAttemptSnapshot = cached;
          preSessionSnapshotsRef.current.delete(competencyId);
        } else {
          preAttemptSnapshot = await getEducationalIntelligence(supabase, profileIdRef.current, competencyId).catch(
            () => null
          );
        }
      }

      await recordOutcome(
        supabase,
        profileIdRef.current,
        current.id,
        isCorrect,
        sessionIdRef.current,
        current.masteryThreshold,
        undefined,
        supportTier
      ).catch(() => {});

      if (competencyId && preAttemptSnapshot) {
        processEvidenceForCompetency(
          supabase,
          profileIdRef.current,
          competencyId,
          preAttemptSnapshot,
          isCorrect
        ).catch(() => {});
      }
    }
    // Legacy bridge — keeps existing Dashboard/Parent Hub XP & skill
    // displays consistent with this new activity, same convention the
    // adaptive mocks already use. Best-effort; SkillType is a coarse
    // legacy union, so an unrecognised value is simply skipped.
    try {
      recordSkillResult(legacySkill as Parameters<typeof recordSkillResult>[0], isCorrect);
    } catch {
      /* legacySkill not a recognised legacy SkillType — safe to skip */
    }
  }

  async function submitReadingOrMaths() {
    if (area!.id === "mathematics") {
      const q = current.prompt as MathsQuestion;
      const isCorrect = checkMathsAnswer(answer, String(q.answer));
      await recordAndAdvance(isCorrect, q.skill);
    } else {
      // Educational Increment 007B, Part 3 — dispatches through the 007A
      // Answer Validation Architecture. Legacy content (the original 13
      // rows, no validationTier metadata) falls through to the exact same
      // scoreEnglishAnswer heuristic and "independent" recording as
      // before, byte-for-byte — this is an extension, not a replacement.
      const q = current.prompt as EnglishComprehensionPrompt & {
        acceptedAnswers?: string[]; quotationRequired?: string[]; orderedAnswer?: string[];
        validationTier?: ValidationTier;
      };
      const result = scoreEnglishComprehensionAnswer(answer, q, scoreEnglishAnswer);
      if (result.automaticallyVerified) {
        setLastAutoResult(result);
        await recordAndAdvance(result.earnedMarks === q.marks, q.skill);
      } else {
        // Do not fabricate correctness. Hold the attempt for the
        // learner's own self-comparison against the model answer —
        // recordAndAdvance() is deferred until they respond (Part 7).
        setSubmitted(true);
        setPendingSelfAssessment(result);
      }
    }
  }

  async function submitSelfAssessment(learnerSaysCorrect: boolean) {
    const q = current.prompt as EnglishComprehensionPrompt;
    // "supported" — reuses the existing support-tier gate (lib/ali/
    // mastery.ts) unchanged: mastery only ever advances for
    // supportTier === "independent", so a self-assessed attempt can
    // never accidentally produce the same mastery evidence as a
    // genuinely independent correct answer (Part 7's explicit
    // requirement), with no new mechanism invented.
    await recordAndAdvance(learnerSaysCorrect, q.skill, "supported");
    setPendingSelfAssessment(null);
  }

  async function submitWriting() {
    const q = current.prompt as { title: string; prompt: string; type: string };
    setWritingFeedbackError("");
    try {
      const res = await fetch("/api/writing-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptTitle: q.title,
          promptType: q.type,
          promptText: q.prompt,
          writingText: answer,
          checkedItems: Array.from(checkedItems),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setWritingFeedbackError(body.error ?? "Smart feedback is temporarily unavailable.");
        return;
      }
      const feedback: WritingFeedback = await res.json();
      setWritingFeedback(feedback);
      await recordAndAdvance(feedback.overallScore >= WRITING_CORRECTNESS_THRESHOLD, "writing");
    } catch {
      setWritingFeedbackError("Smart feedback is temporarily unavailable. Please check your connection.");
    }
  }

  async function goToNextOrFinish() {
    if (index + 1 < activities.length) {
      setIndex((i) => i + 1);
      resetActivityUiState();
      return;
    }

    // Finish: legacy XP/streak completion, then the real, refreshed
    // Learning Engine profile — completing the mission's "Updated learner
    // profile -> Updated readiness -> Recommendations" flow steps by
    // reusing Wave 1's own dashboard components unchanged.
    const score = Math.round((correctCount / activities.length) * 100);
    const xp = Math.max(10, Math.round((correctCount / activities.length) * 50) + 10);
    try {
      completeLesson(`practice-${areaId}`, score, xp);
    } catch {
      /* legacy bridge best-effort */
    }

    setMode("results");
    fetchLearnerIntelligenceProfile("csse")
      .then((fetchedProfile) => {
        setProfile(fetchedProfile);
        // Phase 3.0, WP3 (Learning History) — reuses the profile this call
        // already fetched; no second fetch, no new computation. Best-effort.
        if (fetchedProfile && fetchedProfile.pathwayEligible && supabaseRef.current) {
          recordReadinessSnapshot(supabaseRef.current, fetchedProfile.profileId, fetchedProfile.readiness).catch(() => {});
        }
      })
      .catch(() => setProfile(null));
  }

  return (
    <PageLayout breadcrumbs={[{ label: "Learning Report", href: "/learning-intelligence" }, { label: "Practice", href: "/learning-intelligence/practice" }, { label: area.label }]}>
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {mode === "intro" && (
          <div>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">{area.label}</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">{area.description}</p>
            <InfoCard className="mt-6">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Every question you answer here updates your Skills Profile, Evidence Profile, Readiness and
                Recommendations on your learning report.
              </p>
              <button
                onClick={loadAndStart}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Start practice
              </button>
            </InfoCard>
          </div>
        )}

        {mode === "loading" && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-6" aria-live="polite">Preparing your practice…</p>
        )}

        {mode === "error" && (
          <InfoCard className="mt-6 text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">We couldn&apos;t prepare this practice session</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{errorMessage}</p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                onClick={loadAndStart}
                className="min-h-[44px] inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 px-2"
              >
                <RotateCcw size={14} /> Try again
              </button>
              <Link href="/learning-intelligence/practice" className="min-h-[44px] inline-flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 px-2">
                Back to practice
              </Link>
            </div>
          </InfoCard>
        )}

        {mode === "session" && current && (
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Question {index + 1} of {activities.length}
            </p>

            {activityExplanations.get(current.id) && (
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 mb-3">
                {activityExplanations.get(current.id)}
              </p>
            )}

            {area.id === "reading-comprehension" && (
              <ReadingActivity
                prompt={current.prompt as EnglishComprehensionPrompt}
                familyId={current.familyId}
                answer={answer}
                setAnswer={setAnswer}
                submitted={submitted}
                lastCorrect={lastCorrect}
                pendingSelfAssessment={pendingSelfAssessment}
                lastAutoResult={lastAutoResult}
                onSelfAssess={submitSelfAssessment}
                onSubmit={submitReadingOrMaths}
                onNext={goToNextOrFinish}
                isLast={index + 1 === activities.length}
              />
            )}

            {area.id === "mathematics" && (
              <MathsActivity
                prompt={current.prompt as MathsQuestion}
                answer={answer}
                setAnswer={setAnswer}
                submitted={submitted}
                lastCorrect={lastCorrect}
                onSubmit={submitReadingOrMaths}
                onNext={goToNextOrFinish}
                isLast={index + 1 === activities.length}
              />
            )}

            {area.id === "continuous-writing" && (
              <WritingActivity
                prompt={current.prompt as { title: string; prompt: string; checklist: string[] }}
                answer={answer}
                setAnswer={setAnswer}
                checkedItems={checkedItems}
                setCheckedItems={setCheckedItems}
                submitted={submitted}
                feedback={writingFeedback}
                feedbackError={writingFeedbackError}
                onSubmit={submitWriting}
                onNext={goToNextOrFinish}
                isLast={index + 1 === activities.length}
              />
            )}
          </div>
        )}

        {mode === "results" && (
          <div>
            <InfoCard className="text-center">
              <CheckCircle2 size={28} className="text-emerald-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Practice complete: {correctCount} of {activities.length} correct
              </p>
            </InfoCard>

            {profile === undefined && <p className="text-sm text-gray-400 dark:text-gray-500 mt-6">Updating your profile…</p>}
            {profile === null && (
              <InfoCard className="mt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">Your profile couldn&apos;t be refreshed right now.</p>
              </InfoCard>
            )}
            {profile && profile.pathwayEligible && (
              <div className="space-y-8 mt-6">
                <section>
                  <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Updated Skills Profile</h2>
                  <CompetencyProfile competencies={profile.competencies} />
                </section>
                <section>
                  <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Evidence Profile</h2>
                  <EvidenceProfile competencies={profile.competencies} />
                </section>
                <section>
                  <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Diagnostic Overview</h2>
                  <DiagnosticOverview findings={profile.diagnostics} />
                </section>
                <section>
                  <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Updated Readiness</h2>
                  <ReadinessSummary readiness={profile.readiness} />
                </section>
                <section>
                  <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Recommendations</h2>
                  <RecommendationSummary recommendations={profile.recommendations} />
                </section>
              </div>
            )}

            {/* The child's own next step is the primary action here, not a
                parent-facing destination — a student journey shouldn't end
                by handing the child off to their parent's dashboard. Parent
                Dashboard and the full report stay real, one tap away, just
                visually secondary. */}
            <div className="mt-8">
              <Link
                href="/learning-intelligence/practice"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Keep practising →
              </Link>
              <div className="flex items-center gap-4 flex-wrap mt-3">
                <Link href="/dashboard" className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Back to Today
                </Link>
                <Link href="/learning-intelligence" className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Full learning report →
                </Link>
                <Link href="/learning-intelligence/parent" className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Parent Dashboard →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

function ReadingActivity({
  prompt, familyId, answer, setAnswer, submitted, lastCorrect, pendingSelfAssessment, lastAutoResult, onSelfAssess, onSubmit, onNext, isLast,
}: {
  prompt: EnglishComprehensionPrompt;
  familyId?: string;
  answer: string;
  setAnswer: (v: string) => void;
  submitted: boolean;
  lastCorrect: boolean | null;
  pendingSelfAssessment: EnglishScoringResult | null;
  lastAutoResult: EnglishScoringResult | null;
  onSelfAssess: (learnerSaysCorrect: boolean) => void;
  onSubmit: () => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const [showStrategyHint, setShowStrategyHint] = useState(false);
  const [showWorkedExample, setShowWorkedExample] = useState(false);
  const strategyHint = getExamStrategyHint(familyId);
  const workedExample = getWorkedExample(familyId);

  return (
    <InfoCard className="mt-3">
      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{prompt.passageTitle}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
        {prompt.passageText}
      </p>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-4">{prompt.question}</p>

      {/* Educational Increment 007B, Part 6 — the same efficient-method
          content as ENGLISH_WAVE1_TEACHING_CARDS_V1.md, in plain
          child-facing language, never exposing the family id itself. */}
      <div className="flex flex-wrap gap-2 mt-2">
        {strategyHint && !submitted && (
          <button
            onClick={() => setShowStrategyHint((v) => !v)}
            className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            {showStrategyHint ? "Hide tip" : "Show a tip for this kind of question"}
          </button>
        )}
        {/* Educational Increment 007C, Part 7 — MODEL step: a worked
            example using a safe, separate teaching scenario, never the
            live question's own passage or wording. */}
        {workedExample && !submitted && (
          <button
            onClick={() => setShowWorkedExample((v) => !v)}
            className="text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 dark:hover:bg-purple-900 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            {showWorkedExample ? "Hide worked example" : "See a worked example"}
          </button>
        )}
      </div>
      {showStrategyHint && !submitted && strategyHint && (
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 rounded-xl p-3">
          {strategyHint}
        </p>
      )}
      {showWorkedExample && !submitted && workedExample && (
        <div className="mt-2 text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 rounded-xl p-3 space-y-1.5">
          <p><strong>Example: </strong>{workedExample.scenario}</p>
          <p><strong>How to think about it: </strong>{workedExample.modelReasoning}</p>
          <p><strong>A weaker answer: </strong>{workedExample.weakAnswerLooksLike}</p>
          <p><strong>What makes it better: </strong>{workedExample.whatImprovesIt}</p>
        </div>
      )}

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={submitted}
        rows={4}
        className="w-full mt-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
        placeholder="Type your answer…"
      />

      {/* Educational Increment 007B, Part 4 — self-comparison step for
          questions Angel can only partially verify. What Angel checked is
          shown separately from what the learner must judge for themselves;
          neither is presented as an automatic Correct/Incorrect. */}
      {submitted && pendingSelfAssessment ? (
        <div className="mt-3 space-y-3">
          {pendingSelfAssessment.quotationFound !== undefined && (
            <p className="text-xs rounded-xl p-3 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {pendingSelfAssessment.quotationFound
                ? "Angel found the exact words you needed in your answer."
                : "Angel could not find the exact words you needed. Check you copied them precisely from the passage."}
            </p>
          )}
          {pendingSelfAssessment.namedComponentCorrect !== undefined && (
            <p className="text-xs rounded-xl p-3 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {pendingSelfAssessment.namedComponentCorrect
                ? "Angel recognised the feeling you named."
                : "Angel didn't recognise the feeling you named. Check it against the model answer below."}
            </p>
          )}
          {prompt.modelAnswer && (
            <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <strong>Model answer: </strong>
              {prompt.modelAnswer}
            </p>
          )}
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Angel can&apos;t automatically mark your explanation. Compare it to the model answer above. Did you explain it well?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onSelfAssess(true)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                Yes, I explained it well
              </button>
              <button
                onClick={() => onSelfAssess(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                Not quite
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <SubmitOrNext submitted={submitted} lastCorrect={lastCorrect} onSubmit={onSubmit} onNext={onNext} isLast={isLast} disabled={!answer.trim()} />
          {/* Educational Increment 007C, Part 9 — specific multi-select
              remediation, using only the real classification checkMultiSelect
              already computed (over-selection vs under-selection vs wrong
              selections), never a fabricated diagnosis. */}
          {submitted && !lastCorrect && lastAutoResult?.multiSelectDetail && (
            <p className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 rounded-xl p-3 mt-3">
              {lastAutoResult.multiSelectDetail.overSelected
                ? `You ticked ${lastAutoResult.multiSelectDetail.selectedCount} boxes, more than the ${lastAutoResult.multiSelectDetail.requiredCount} asked for. Selecting more than the number instructed loses all the marks for this question, even if some ticks were right.`
                : `You selected ${lastAutoResult.multiSelectDetail.correctCount} of the ${lastAutoResult.multiSelectDetail.requiredCount} correct boxes. Check each option against the passage one at a time before you decide.`}
            </p>
          )}
          {submitted && prompt.modelAnswer && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <strong>Model answer: </strong>
              {prompt.modelAnswer}
            </p>
          )}
        </>
      )}
    </InfoCard>
  );
}

function MathsActivity({
  prompt, answer, setAnswer, submitted, lastCorrect, onSubmit, onNext, isLast,
}: {
  prompt: MathsQuestion;
  answer: string;
  setAnswer: (v: string) => void;
  submitted: boolean;
  lastCorrect: boolean | null;
  onSubmit: () => void;
  onNext: () => void;
  isLast: boolean;
}) {
  return (
    <InfoCard className="mt-3">
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{prompt.question}</p>
      <input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={submitted}
        className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
        placeholder="Your answer…"
      />
      <SubmitOrNext submitted={submitted} lastCorrect={lastCorrect} onSubmit={onSubmit} onNext={onNext} isLast={isLast} disabled={!answer.trim()} />
      {submitted && prompt.workingSteps && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
          <strong>Correct answer: {String(prompt.answer)}</strong>
          <ul className="list-disc list-inside mt-1 space-y-0.5">
            {prompt.workingSteps.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
    </InfoCard>
  );
}

function WritingActivity({
  prompt, answer, setAnswer, checkedItems, setCheckedItems, submitted, feedback, feedbackError, onSubmit, onNext, isLast,
}: {
  prompt: { title: string; prompt: string; checklist: string[] };
  answer: string;
  setAnswer: (v: string) => void;
  checkedItems: Set<string>;
  setCheckedItems: (s: Set<string>) => void;
  submitted: boolean;
  feedback: WritingFeedback | null;
  feedbackError: string;
  onSubmit: () => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  return (
    <InfoCard className="mt-3">
      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{prompt.title}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-line leading-relaxed">{prompt.prompt}</p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={submitted}
        rows={10}
        className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
        placeholder="Write your response…"
      />
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{wordCount} words</p>

      <div className="mt-3 space-y-1.5">
        {prompt.checklist.map((item) => (
          <label key={item} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              disabled={submitted}
              checked={checkedItems.has(item)}
              onChange={(e) => {
                const next = new Set(checkedItems);
                if (e.target.checked) next.add(item);
                else next.delete(item);
                setCheckedItems(next);
              }}
            />
            {item}
          </label>
        ))}
      </div>

      {!submitted && (
        <button
          onClick={onSubmit}
          disabled={wordCount < 10}
          className="mt-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Submit for feedback
        </button>
      )}
      {feedbackError && <p className="text-xs text-red-500 mt-2">{feedbackError}</p>}

      {feedback && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            {feedback.overallScore >= WRITING_CORRECTNESS_THRESHOLD ? (
              <CheckCircle2 size={16} className="text-emerald-500" />
            ) : (
              <XCircle size={16} className="text-amber-500" />
            )}
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Overall score: {feedback.overallScore}/100</p>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            AI-generated general writing-quality guidance, not a CSSE (or any exam board&apos;s) official or validated mark.
          </p>
          <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-2">
            <p><strong>Strengths:</strong> {feedback.strengths.join(" · ")}</p>
            <p><strong>Areas to improve:</strong> {feedback.areasToImprove.join(" · ")}</p>
            <p><strong>Tutor tip:</strong> {feedback.tutorTip}</p>
          </div>
          <button
            onClick={onNext}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            {isLast ? "See updated profile" : "Next"} <ArrowRight size={14} />
          </button>
        </div>
      )}
    </InfoCard>
  );
}

function SubmitOrNext({
  submitted, lastCorrect, onSubmit, onNext, isLast, disabled,
}: {
  submitted: boolean;
  lastCorrect: boolean | null;
  onSubmit: () => void;
  onNext: () => void;
  isLast: boolean;
  disabled: boolean;
}) {
  if (!submitted) {
    return (
      <button
        onClick={onSubmit}
        disabled={disabled}
        className="mt-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
      >
        Submit
      </button>
    );
  }
  return (
    <div className="mt-3 flex items-center gap-3">
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
        {lastCorrect ? (
          <><CheckCircle2 size={16} className="text-emerald-500" /> Correct</>
        ) : (
          <><XCircle size={16} className="text-amber-500" /> Not quite</>
        )}
      </span>
      <button
        onClick={onNext}
        className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
      >
        {isLast ? "See updated profile" : "Next"} <ArrowRight size={14} />
      </button>
    </div>
  );
}
