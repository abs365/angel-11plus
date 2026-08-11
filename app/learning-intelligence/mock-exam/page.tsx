"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Clock, CheckCircle2, RotateCcw } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { withTimeout } from "@/lib/withTimeout";
import { fetchQuestionBank } from "@/lib/ali/questionBank";
import { recordPresentation, recordOutcome, fetchStudentHistory } from "@/lib/ali/history";
import { completeLesson, recordSkillResult, getSelectedPathwayId, setSelectedPathway } from "@/lib/progress";
import { fetchLearnerIntelligenceProfile } from "@/lib/learningEngine/profile";
import { recordReadinessSnapshot } from "@/lib/learningEngine/learningHistory";
import { saveMockResult } from "@/lib/mockProgress";
import { QUESTION_TYPE_PRIMARY_COMPETENCY } from "@/lib/learningEngine/assessmentBrainMap";
import { buildAdaptivePaper, type AdaptivePaperSubject } from "@/lib/learningEngine/adaptiveMockPaperBuilder";
import {
  getEducationalIntelligence,
  processEvidenceForCompetency,
  type EducationalIntelligenceSnapshot,
} from "@/lib/learningEngine/educationalIntelligenceService";
import type { CompetencyId, QuestionTypeId } from "@/lib/learningEngine/types";
import { checkMathsAnswer, scoreEnglishAnswer, WRITING_CORRECTNESS_THRESHOLD } from "@/lib/learningEngine/practiceContent";
import { CompetencyProfile } from "@/components/learningEngine/CompetencyProfile";
import { ReadinessSummary } from "@/components/learningEngine/ReadinessSummary";
import { RecommendationSummary } from "@/components/learningEngine/RecommendationSummary";
import { HistoricalContextPanel } from "@/components/parent/HistoricalContextPanel";
import type { BankQuestion } from "@/types/ali/questionBank";
import type { LearnerIntelligenceProfile } from "@/lib/learningEngine/types";
import type { EnglishComprehensionPrompt } from "@/types/ali/questionBank";
import type { MathsQuestion } from "@/types/index";
import type { MockResult, MockSectionResult } from "@/types/mock";

type Mode = "intro" | "loading" | "error" | "exam" | "submitting" | "results";
type ExamMode = "standard" | "adaptive";

/**
 * Sprint 2, Increment 2 — the one, disclosed content-volume policy the
 * Adaptive Paper Builder needs from a caller (ADAPTIVE_MOCK_INTELLIGENCE_
 * SPECIFICATION_V1.md §11 named this an open item for this increment to
 * resolve). Not a scoring model and not an Educational Intelligence
 * threshold — a plain content-volume ratio, applied identically regardless
 * of subject or evidence: roughly half of whatever real tagged content
 * exists for a subject, floored at 1 if any exists at all, so a subject
 * with real content is never silently dropped from an adaptive paper.
 */
function adaptiveTargetCount(available: number): number {
  if (available === 0) return 0;
  return Math.max(1, Math.ceil(available / 2));
}

/**
 * CSSE Mock Exam (Capability 3, Wave 4). Timed, exam-condition version of
 * Wave 2's Practice Experience: real submission at the end (not per-
 * question immediate feedback — a genuine exam condition, matching this
 * mission's "Timed mock exams / Submission / Evidence recording /
 * Learning Engine updates / Learner feedback" sequence, in that order),
 * across all three areas in one sitting (Reading Comprehension +
 * Mathematics + Continuous Writing — mirroring Assessment Brain V1's real
 * English+Maths two-test structure, §2). Reuses Wave 2's real content
 * (migration 013), real graders, and real recordPresentation/recordOutcome
 * persistence unchanged — no new educational logic, per this Wave's rule.
 *
 * Sprint 2, Increment 2 added a Standard/Adaptive mode selector
 * (ADAPTIVE_MOCK_INTELLIGENCE_SPECIFICATION_V1.md). Standard (the default)
 * is unchanged from Wave 4 — every currently-tagged activity, one sitting.
 * Adaptive routes the same tagged content through the pure
 * buildAdaptivePaper() (lib/learningEngine/adaptiveMockPaperBuilder.ts) to
 * select a smaller, evidence-weighted subset *before* the exam starts —
 * every line below that point (timing, rendering, grading, the evidence
 * pipeline, the Mock Attempt Ledger, the results profile) is the identical
 * code path for both modes, operating on whichever `activities` array was
 * selected. No second exam runtime, no second scoring model, no second
 * persistence path exists anywhere in this file.
 *
 * Writing's grading requires a real LLM call (/api/writing-feedback) which
 * cannot happen mid-timer without the learner waiting on a network call
 * inside their exam time — it is graded immediately after Submit, before
 * the timer-dependent parts of the flow, exactly like the other two areas'
 * checkers, just async.
 */
export default function MockExamPage() {
  const [mode, setMode] = useState<Mode>("intro");
  const [examMode, setExamMode] = useState<ExamMode>("standard");
  const [errorMessage, setErrorMessage] = useState("");
  const [activities, setActivities] = useState<BankQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [profile, setProfile] = useState<LearnerIntelligenceProfile | null | undefined>(undefined);

  const profileIdRef = useRef<string>("");
  const sessionIdRef = useRef<string>("");
  // Captures which mode this sitting actually ran under, at load time — the
  // same "capture at start, read at submit" discipline totalSecondsRef
  // already uses, so a later examMode selector change can never retroactively
  // relabel an in-progress or just-completed sitting.
  const sittingModeRef = useRef<ExamMode>("standard");
  const supabaseRef = useRef<ReturnType<typeof getSupabaseClient>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Total allocated exam time (WP5G, Finding #1) — captured at start so
  // submitExam() can derive a real elapsed duration for saveMockResult(),
  // the same way the timer itself counts down from this value.
  const totalSecondsRef = useRef<number>(0);
  // Pre-SESSION Educational Intelligence snapshots (Sprint 2, mirroring the
  // Practice page's identical pattern) — captured before recordPresentation()
  // below resets last_presented_at, which Maintenance Review detection reads.
  const preSessionSnapshotsRef = useRef<Map<CompetencyId, EducationalIntelligenceSnapshot>>(new Map());
  // Duplicate-key defect fix (New Learner Experience Migration) — submitExam()
  // is wired to fire from two independent triggers (the countdown timer and
  // the manual submit button) with no mutual exclusion, the same defect
  // confirmed on the Founder Validation route. This ref-based guard makes a
  // second invocation a no-op, fixing the underlying identity problem rather
  // than only the resulting React key warning.
  const submittedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function loadAndStart() {
    setMode("loading");
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("no client");
      supabaseRef.current = supabase;

      const profileId = await withTimeout(ensureProfile(), 10000, "your exam profile");
      if (!profileId) throw new Error("no profile");
      profileIdRef.current = profileId;
      sessionIdRef.current = `mock-exam-${Date.now()}`;
      submittedRef.current = false;

      if (getSelectedPathwayId() !== "csse") setSelectedPathway("csse");

      const [english, maths, writing] = await Promise.all([
        withTimeout(fetchQuestionBank(supabase, "english", "csse"), 10000, "English questions"),
        withTimeout(fetchQuestionBank(supabase, "maths", "csse"), 10000, "Maths questions"),
        withTimeout(fetchQuestionBank(supabase, "writing", "csse"), 10000, "the writing task"),
      ]);
      const taggedBySubject: Record<AdaptivePaperSubject, BankQuestion[]> = {
        english: english.filter((q) => q.skill.startsWith("QT-")),
        maths: maths.filter((q) => q.skill.startsWith("QT-")),
        writing: writing.filter((q) => q.skill.startsWith("QT-")),
      };
      const tagged = [...taggedBySubject.english, ...taggedBySubject.maths, ...taggedBySubject.writing];

      if (tagged.length === 0) {
        throw new Error(
          "No mock exam content is available yet. The illustrative content set (migration 013) has not been applied to this database."
        );
      }

      sittingModeRef.current = examMode;
      let selectedActivities: BankQuestion[] = tagged;

      if (examMode === "adaptive") {
        // Same real inputs Educational Intelligence already computes —
        // nothing here recalculates a tier, a score, or a readiness band.
        const [adaptiveProfile, history] = await Promise.all([
          fetchLearnerIntelligenceProfile("csse"),
          withTimeout(fetchStudentHistory(supabase, profileId), 10000, "your practice history"),
        ]);
        if (!adaptiveProfile || !adaptiveProfile.pathwayEligible) {
          throw new Error("Your Educational Intelligence profile isn't available right now. Try Standard mode, or try Adaptive again shortly.");
        }
        const built = buildAdaptivePaper(
          taggedBySubject,
          adaptiveProfile,
          history,
          {
            english: adaptiveTargetCount(taggedBySubject.english.length),
            maths: adaptiveTargetCount(taggedBySubject.maths.length),
            writing: adaptiveTargetCount(taggedBySubject.writing.length),
          }
        );
        selectedActivities = built.activities;
      }

      const totalSeconds = selectedActivities.reduce((sum, q) => sum + q.estimatedTimeSeconds, 0);
      totalSecondsRef.current = totalSeconds;

      // Same pre-session snapshot capture as the Practice page — must run
      // before recordPresentation() resets last_presented_at, or a genuine
      // Maintenance Review gap would be permanently invisible to this sitting.
      const competencyIdsThisExam = new Set(
        selectedActivities
          .map((q) => QUESTION_TYPE_PRIMARY_COMPETENCY[q.skill as QuestionTypeId])
          .filter((id): id is CompetencyId => Boolean(id))
      );
      preSessionSnapshotsRef.current = new Map(
        await Promise.all(
          Array.from(competencyIdsThisExam).map(
            async (id) => [id, await getEducationalIntelligence(supabase, profileId, id)] as const
          )
        )
      );

      await withTimeout(
        recordPresentation(supabase, profileId, selectedActivities.map((q) => q.id), "mock_exam"),
        10000,
        "starting your exam"
      );

      setActivities(selectedActivities);
      setIndex(0);
      setAnswers({});
      setCorrectCount(0);
      setTimeLeftSeconds(totalSeconds);
      setMode("exam");

      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((t) => {
          if (t <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            submitExam();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setMode("error");
    }
  }

  function setAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function submitExam() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setMode("submitting");

    const supabase = supabaseRef.current;
    let correct = 0;
    // Finding #1 (WP5G) — real per-subject tallies, built from the same
    // isCorrect this loop already computes, so Mock Readiness can read a
    // real MockResult for this sitting instead of never receiving one.
    const bySubject: Record<string, { correct: number; total: number }> = {};

    for (const activity of activities) {
      const answer = answers[activity.id] ?? "";
      let isCorrect = false;
      let legacySkill = "reasoning";

      if (activity.subject === "maths") {
        const q = activity.prompt as MathsQuestion;
        isCorrect = checkMathsAnswer(answer, String(q.answer));
        legacySkill = q.skill;
      } else if (activity.subject === "english") {
        const q = activity.prompt as EnglishComprehensionPrompt;
        const earned = scoreEnglishAnswer(answer, q.modelAnswer, q.marks);
        isCorrect = earned === q.marks;
        legacySkill = q.skill;
      } else if (activity.subject === "writing") {
        // Real LLM feedback call, same grader as Wave 2's practice writing
        // activity — graded here (not during the timed section) since it
        // requires a network round-trip.
        try {
          const promptData = activity.prompt as { title: string; prompt: string; type: string };
          const res = await fetch("/api/writing-feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              promptTitle: promptData.title,
              promptType: promptData.type,
              promptText: promptData.prompt,
              writingText: answer,
              checkedItems: [],
            }),
          });
          if (res.ok) {
            const feedback = await res.json();
            isCorrect = feedback.overallScore >= WRITING_CORRECTNESS_THRESHOLD;
          }
        } catch {
          // Smart feedback unavailable — writing question counted as not
          // yet demonstrated for this sitting, same honest degradation as
          // every other best-effort call in this codebase.
        }
        legacySkill = "writing";
      }

      if (isCorrect) correct++;
      const subjectTally = bySubject[activity.subject] ?? { correct: 0, total: 0 };
      subjectTally.total += 1;
      if (isCorrect) subjectTally.correct += 1;
      bySubject[activity.subject] = subjectTally;

      if (supabase && profileIdRef.current) {
        await recordOutcome(
          supabase,
          profileIdRef.current,
          activity.id,
          isCorrect,
          sessionIdRef.current,
          activity.masteryThreshold
        ).catch(() => {});

        // Educational Intelligence evidence pipeline (Permanent Engineering
        // Rule 1) — same sequencing as the Practice page's recordAndAdvance():
        // consume this competency's cached pre-session snapshot on its first
        // answer this sitting, otherwise read fresh (no session-start reset
        // has intervened since).
        const competencyId = QUESTION_TYPE_PRIMARY_COMPETENCY[activity.skill as QuestionTypeId];
        if (competencyId) {
          const cached = preSessionSnapshotsRef.current.get(competencyId);
          let preAttemptSnapshot: EducationalIntelligenceSnapshot | null = null;
          if (cached) {
            preAttemptSnapshot = cached;
            preSessionSnapshotsRef.current.delete(competencyId);
          } else {
            preAttemptSnapshot = await getEducationalIntelligence(supabase, profileIdRef.current, competencyId).catch(
              () => null
            );
          }
          if (preAttemptSnapshot) {
            await processEvidenceForCompetency(
              supabase,
              profileIdRef.current,
              competencyId,
              preAttemptSnapshot,
              isCorrect
            ).catch(() => {});
          }
        }
      }
      try {
        recordSkillResult(legacySkill as Parameters<typeof recordSkillResult>[0], isCorrect);
      } catch {
        /* not a recognised legacy SkillType — safe to skip */
      }
    }

    setCorrectCount(correct);
    const score = Math.round((correct / activities.length) * 100);
    const xp = Math.max(20, Math.round((correct / activities.length) * 80) + 20);
    try {
      completeLesson("csse-mock-exam", score, xp);
    } catch {
      /* legacy bridge best-effort */
    }

    // Finding #1 (WP5G) — the real Educational Intelligence CSSE Mock Exam
    // never wrote to lib/mockProgress.ts, so Mock Readiness's
    // mockAttemptCount silently stayed at zero for every sitting of this
    // flow. Recorded here from the same real per-item outcomes above — no
    // new scoring logic, just the one missing write this flow was missing.
    const sectionResults: MockSectionResult[] = Object.entries(bySubject).map(([subject, tally]) => ({
      sectionId: subject,
      sectionName: subject.charAt(0).toUpperCase() + subject.slice(1),
      bank: subject,
      correct: tally.correct,
      total: tally.total,
      score: tally.total > 0 ? Math.round((tally.correct / tally.total) * 100) : 0,
    }));
    const elapsedSeconds = Math.max(0, totalSecondsRef.current - timeLeftSeconds);
    const mockResult: MockResult = {
      id: sessionIdRef.current || `csse-mock-${Date.now()}`,
      pathway: "csse",
      pathwayName: sittingModeRef.current === "adaptive" ? "CSSE Adaptive Mock Exam" : "CSSE Mock Exam",
      date: new Date().toISOString(),
      totalScore: score,
      sectionResults,
      durationMinutes: Math.round(elapsedSeconds / 60),
    };
    try {
      saveMockResult(mockResult);
    } catch {
      /* localStorage best-effort, same discipline as every other client-side write in this flow */
    }

    setMode("results");
    // IG-001 (Sprint 2, Increment 3) — the correct integration point is here,
    // after every question's Educational Audit write above has completed:
    // Readiness is a whole-profile concept (13 competencies), not a
    // per-question one, so it is a session-end hook, exactly like
    // recordLegacyPracticeSessionCompletion() (lib/learningEngine/
    // legacyPracticeEvidence.ts:160) and practice/[area]/page.tsx's
    // identical call — same function, same real `readiness` field this
    // page already fetches for the results screen below, no second fetch
    // and no new calculation. Standard and Adaptive share this one call
    // site unconditionally, so both follow the identical lifecycle (Task 3).
    fetchLearnerIntelligenceProfile("csse")
      .then((p) => {
        setProfile(p);
        if (p && p.pathwayEligible && supabase) {
          recordReadinessSnapshot(supabase, p.profileId, p.readiness).catch(() => {});
        }
      })
      .catch(() => setProfile(null));
  }

  const current = activities[index];
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;

  return (
    <PageLayout breadcrumbs={[{ label: "Learning Report", href: "/learning-intelligence" }, { label: "Mock exam" }]}>
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {mode === "intro" && (
          <div>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">CSSE Mock Exam</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              A single timed sitting covering Reading Comprehension, Mathematics and Continuous Writing.
            </p>

            {/* Angel Assessment Transformation Programme 001, Release 0 —
                Decision AEP4-D18. The Assessment Excellence Programme found
                this mock's current question pool and timing do not yet
                represent an authentic CSSE sitting (real CSSE structure is
                two separate timed papers, not one combined countdown), and
                that a capable learner can complete it in minutes. This
                notice must stay until Waves 1 and 2 of the Transformation
                Roadmap (content depth, then real paper/section timing) are
                both complete — do not remove it as a "quick win" ahead of
                that work actually landing. */}
            <InfoCard className="mt-4 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                This mock is still being expanded
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                Today&apos;s question set and timing don&apos;t yet fully match a real CSSE sitting. The real exam is
                two separate timed papers (English, then Mathematics), and this mock currently runs on a smaller,
                illustrative set of questions. Completing it quickly, or scoring well, isn&apos;t a reliable sign of
                how ready your child is for the real test. We&apos;re actively expanding the question bank and
                rebuilding the timing to match the real exam.
              </p>
            </InfoCard>

            {/* Sprint 2, Increment 2 — Standard/Adaptive mode selector.
                Standard is the default (Task 2); switching modes only
                changes which real, already-tagged content gets selected
                before the exam starts — everything after that (timing,
                grading, evidence, the Mock Attempt Ledger, Educational
                Intelligence) is the exact same code path either way. */}
            <div className="mt-5 inline-flex rounded-xl border border-gray-200 dark:border-gray-700 p-1 bg-gray-50 dark:bg-gray-900">
              <button
                onClick={() => setExamMode("standard")}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  examMode === "standard" ? "bg-purple-600 text-white" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setExamMode("adaptive")}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  examMode === "adaptive" ? "bg-purple-600 text-white" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Adaptive
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {examMode === "standard"
                ? "Every currently tagged CSSE activity, one after another, with no feedback until you finish."
                : "A shorter sitting drawn from the same real content, weighted toward the areas your recorded evidence says need it most. Coverage is still limited today, so not every area may be represented."}
            </p>

            <InfoCard className="mt-6">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Answers aren&apos;t marked as you go, matching the real exam&apos;s no-feedback-until-the-end format.
                Once you submit, your learning report updates with everything you attempted.
              </p>
              <button
                onClick={loadAndStart}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Start mock exam
              </button>
            </InfoCard>
          </div>
        )}

        {mode === "loading" && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-6" aria-live="polite">Preparing your exam…</p>
        )}

        {mode === "error" && (
          <InfoCard className="mt-6 text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">We couldn&apos;t prepare this exam</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{errorMessage}</p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                onClick={loadAndStart}
                className="min-h-[44px] inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 px-2"
              >
                <RotateCcw size={14} /> Try again
              </button>
              <Link href="/learning-intelligence" className="min-h-[44px] inline-flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 px-2">
                Back to dashboard
              </Link>
            </div>
          </InfoCard>
        )}

        {mode === "exam" && current && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Question {index + 1} of {activities.length}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Clock size={14} />
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </div>

            <InfoCard>
              {current.subject === "english" && (
                <ExamEnglish prompt={current.prompt as EnglishComprehensionPrompt} value={answers[current.id] ?? ""} onChange={(v) => setAnswer(current.id, v)} />
              )}
              {current.subject === "maths" && (
                <ExamMaths prompt={current.prompt as MathsQuestion} value={answers[current.id] ?? ""} onChange={(v) => setAnswer(current.id, v)} />
              )}
              {current.subject === "writing" && (
                <ExamWriting prompt={current.prompt as { title: string; prompt: string }} value={answers[current.id] ?? ""} onChange={(v) => setAnswer(current.id, v)} />
              )}

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50 dark:border-gray-800">
                <button
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  disabled={index === 0}
                  className="text-xs font-semibold text-gray-500 dark:text-gray-400 disabled:opacity-30"
                >
                  Back
                </button>
                {index + 1 < activities.length ? (
                  <button
                    onClick={() => setIndex((i) => i + 1)}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={submitExam}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                  >
                    Submit exam
                  </button>
                )}
              </div>
            </InfoCard>
          </div>
        )}

        {mode === "submitting" && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-6" aria-live="polite">Marking your exam…</p>
        )}

        {mode === "results" && (
          <div>
            <InfoCard className="text-center">
              <CheckCircle2 size={28} className="text-emerald-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Exam complete: {correctCount} of {activities.length} correct
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {sittingModeRef.current === "adaptive" ? "Adaptive sitting" : "Standard sitting"}
              </p>
              {/* AEP4-D18 — same reminder as the intro screen, restated here
                  because a results screen is exactly where a parent is most
                  likely to over-read a score as a readiness signal. */}
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-3">
                Today&apos;s content and timing are still being expanded to match a real CSSE sitting. Treat this
                as practice, not a finished readiness check.
              </p>
            </InfoCard>

            {/* Sprint 3, Increment 1 (ADMISSIONS_INTELLIGENCE_V1_DESIGN.md §6,
                Founder-reclassified backlog item, now closed) — the one real
                admissions fact, shown beside this sitting's own score, never
                blended into it (its own section, not nested inside the score
                card above or the profile sections below — the component's
                own governing rule). Unconditional on `profile` resolving,
                since HistoricalContextPanel takes no props and depends on
                nothing this page fetches. */}
            <div className="mt-6">
              <HistoricalContextPanel />
            </div>

            {profile === undefined && <p className="text-sm text-gray-400 dark:text-gray-500 mt-6">Updating your profile…</p>}
            {profile === null && (
              <InfoCard className="mt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">Your profile couldn&apos;t be refreshed right now.</p>
              </InfoCard>
            )}
            {profile && profile.pathwayEligible && (
              <div className="space-y-8 mt-6">
                <section>
                  <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Updated skills profile</h2>
                  <CompetencyProfile competencies={profile.competencies} />
                </section>
                <section>
                  <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Updated readiness</h2>
                  <ReadinessSummary readiness={profile.readiness} />
                </section>
                <section>
                  <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Recommendations</h2>
                  <RecommendationSummary recommendations={profile.recommendations} />
                </section>
              </div>
            )}

            {/* WP4D (FD-022) — one clear primary next step, matching the
                stated sequence Practice -> Results -> Parent Insight ->
                Revision -> Practice. */}
            <div className="mt-8">
              <Link
                href="/learning-intelligence/parent"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                See Parent Dashboard →
              </Link>
              <div className="mt-3">
                <Link href="/learning-intelligence" className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Full learning report →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

function ExamEnglish({ prompt, value, onChange }: { prompt: EnglishComprehensionPrompt; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{prompt.passageTitle}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
        {prompt.passageText}
      </p>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-4">{prompt.question}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full mt-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
        placeholder="Type your answer…"
      />
    </div>
  );
}

function ExamMaths({ prompt, value, onChange }: { prompt: MathsQuestion; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{prompt.question}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
        placeholder="Your answer…"
      />
    </div>
  );
}

function ExamWriting({ prompt, value, onChange }: { prompt: { title: string; prompt: string }; value: string; onChange: (v: string) => void }) {
  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
  return (
    <div>
      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{prompt.title}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-line leading-relaxed">{prompt.prompt}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
        placeholder="Write your response…"
      />
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{wordCount} words</p>
    </div>
  );
}
