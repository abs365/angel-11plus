"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Clock, CheckCircle2, RotateCcw, ShieldAlert } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { withTimeout } from "@/lib/withTimeout";
import { fetchQuestionBank } from "@/lib/ali/questionBank";
import { recordPresentation, recordOutcome } from "@/lib/ali/history";
import { completeLesson, recordSkillResult, getSelectedPathwayId, setSelectedPathway } from "@/lib/progress";
import { fetchLearnerIntelligenceProfile } from "@/lib/learningEngine/profile";
import { recordReadinessSnapshot } from "@/lib/learningEngine/learningHistory";
import { saveMockResult } from "@/lib/mockProgress";
import { QUESTION_TYPE_PRIMARY_COMPETENCY } from "@/lib/learningEngine/assessmentBrainMap";
import {
  getEducationalIntelligence,
  processEvidenceForCompetency,
  type EducationalIntelligenceSnapshot,
} from "@/lib/learningEngine/educationalIntelligenceService";
import type { CompetencyId, QuestionTypeId } from "@/lib/learningEngine/types";
import { checkMathsAnswer, scoreEnglishAnswer } from "@/lib/learningEngine/practiceContent";
import type { BankQuestion } from "@/types/ali/questionBank";
import type { EnglishComprehensionPrompt } from "@/types/ali/questionBank";
import type { MathsQuestion } from "@/types/index";
import type { MockResult, MockSectionResult, MockPathwayId } from "@/types/mock";
import { FOUNDER_VALIDATION_EVIDENCE } from "@/data/founderValidation/csseFounderValidationEvidence";

type Mode = "intro" | "loading" | "error" | "exam" | "submitting" | "results";

/**
 * Founder Validation Assessment (CSSE) — Angel Assessment Transformation
 * Execution Programme, Release 1. A controlled, non-production slice
 * (5 English Reading Comprehension + 6 Mathematics questions, 11 items
 * total) built from data/founderValidation/csseFounderValidationEvidence.ts
 * and migration 021's `ali_question_bank` rows (pathway =
 * 'csse-founder-validation' — deliberately distinct from the production
 * 'csse' pathway `app/learning-intelligence/mock-exam/page.tsx` reads, so
 * this content can never appear in the real Mock).
 *
 * Reuses, unchanged, the same real evidence pipeline the production Mock
 * uses: recordPresentation/recordOutcome (lib/ali/history.ts),
 * processEvidenceForCompetency (Educational Intelligence), and
 * recordReadinessSnapshot + saveMockResult (Mock Attempt Ledger) — per
 * the Founder's explicit instruction to reuse, not rebuild, sound
 * infrastructure. This means a genuine test sitting here writes real
 * evidence-pipeline rows and a real Mock Attempt Ledger entry under
 * whatever profile is testing it — disclosed explicitly on the intro
 * screen and in FOUNDER_TEST_INSTRUCTIONS.md, not hidden.
 *
 * No Applied Reasoning content exists here — AR-01 remains deferred
 * (Gate 3) and is untouched by this route. No Continuous Writing either
 * — judged not yet evidence-ready for this validation slice (see
 * FOUNDER_VALIDATION_ASSESSMENT_BLUEPRINT.md §Writing).
 */

const FV_PATHWAY = "csse-founder-validation" as MockPathwayId;

export default function FounderValidationCsseAssessment() {
  const [mode, setMode] = useState<Mode>("intro");
  const [errorMessage, setErrorMessage] = useState("");
  const [activities, setActivities] = useState<BankQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [perItemResults, setPerItemResults] = useState<
    { id: string; correct: boolean; userAnswer: string }[]
  >([]);

  const profileIdRef = useRef<string>("");
  const sessionIdRef = useRef<string>("");
  const supabaseRef = useRef<ReturnType<typeof getSupabaseClient>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSecondsRef = useRef<number>(0);
  const preSessionSnapshotsRef = useRef<Map<CompetencyId, EducationalIntelligenceSnapshot>>(new Map());
  // Duplicate-key defect fix (New Learner Experience Migration) — submitExam()
  // is wired to fire from two independent triggers (the countdown timer and
  // the manual submit button) with no mutual exclusion. React Strict Mode
  // double-invokes the timer's impure setState updater in dev, calling
  // submitExam() twice with the same sessionIdRef.current, producing two
  // identical-id MockResult records. This ref-based guard (checked/set
  // synchronously, unlike React state) makes a second invocation a no-op.
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

      const profileId = await withTimeout(ensureProfile(), 10000, "your test profile");
      if (!profileId) throw new Error("no profile");
      profileIdRef.current = profileId;
      sessionIdRef.current = `founder-validation-csse-${Date.now()}`;
      submittedRef.current = false;

      if (getSelectedPathwayId() !== "csse") setSelectedPathway("csse");

      const [english, maths] = await Promise.all([
        withTimeout(fetchQuestionBank(supabase, "english", FV_PATHWAY), 10000, "English questions"),
        withTimeout(fetchQuestionBank(supabase, "maths", FV_PATHWAY), 10000, "Maths questions"),
      ]);
      const selectedActivities = [...english, ...maths].filter((q) => q.id.startsWith("fv-"));

      if (selectedActivities.length === 0) {
        throw new Error(
          "No Founder Validation content is available yet — migration 021 " +
          "(supabase/migrations/021_founder_validation_csse_assessment.sql) has not been applied " +
          "to this database yet. Apply it via Supabase Dashboard > SQL Editor, then try again."
        );
      }

      const totalSeconds = selectedActivities.reduce((sum, q) => sum + q.estimatedTimeSeconds, 0);
      totalSecondsRef.current = totalSeconds;

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
        recordPresentation(supabase, profileId, selectedActivities.map((q) => q.id), "founder_validation_assessment"),
        10000,
        "starting this assessment"
      );

      setActivities(selectedActivities);
      setIndex(0);
      setAnswers({});
      setCorrectCount(0);
      setPerItemResults([]);
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
    const bySubject: Record<string, { correct: number; total: number }> = {};
    const results: { id: string; correct: boolean; userAnswer: string }[] = [];

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
      }

      results.push({ id: activity.id, correct: isCorrect, userAnswer: answer });
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
    setPerItemResults(results);
    const score = Math.round((correct / activities.length) * 100);
    const xp = Math.max(20, Math.round((correct / activities.length) * 80) + 20);
    try {
      completeLesson("csse-founder-validation-assessment", score, xp);
    } catch {
      /* legacy bridge best-effort */
    }

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
      id: sessionIdRef.current || `founder-validation-csse-${Date.now()}`,
      pathway: "csse",
      pathwayName: "CSSE Founder Validation Assessment",
      date: new Date().toISOString(),
      totalScore: score,
      sectionResults,
      durationMinutes: Math.round(elapsedSeconds / 60),
      source: "founder-validation",
    };
    try {
      saveMockResult(mockResult);
    } catch {
      /* localStorage best-effort, same discipline as the production Mock */
    }

    setMode("results");
    if (supabaseRef.current) {
      fetchLearnerIntelligenceProfile("csse")
        .then((p) => {
          if (p && p.pathwayEligible && supabaseRef.current) {
            recordReadinessSnapshot(supabaseRef.current, p.profileId, p.readiness).catch(() => {});
          }
        })
        .catch(() => {});
    }
  }

  const current = activities[index];
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Learning Report", href: "/learning-intelligence" },
        { label: "Founder Validation — CSSE" },
      ]}
    >
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <InfoCard className="mb-6 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40">
          <div className="flex items-start gap-2">
            <ShieldAlert size={18} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-800 dark:text-red-300">
                CSSE Assessment Transformation — Founder Validation
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-1 leading-relaxed">
                Not yet released to learners. This is a controlled, non-production slice (11 original items) built
                to let the Founder personally experience the new evidence-led CSSE assessment method before any
                scaling decision. It does not appear on, and is separate from, the real CSSE Mock.
              </p>
            </div>
          </div>
        </InfoCard>

        {mode === "intro" && (
          <div>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">
              CSSE Founder Validation Assessment
            </h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              5 English Reading Comprehension questions, then 6 Mathematics questions. One sitting, timed.
            </p>

            <InfoCard className="mt-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">What this is and isn&apos;t</p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 mt-2 space-y-1.5 list-disc list-inside">
                <li>Every item is original Angel content, traceable to specific official CSSE past-paper evidence — see the Evidence view on the results screen.</li>
                <li>
                  Timing is <strong>not</strong> a claim of exact exam equivalence — it is a scaled, evidence-informed
                  estimate for this smaller slice (11 items, not a full paper). Approximation disclosed, not hidden.
                </li>
                <li>Difficulty labels are educational judgements, not empirical CSSE measurements — no facility-rate data exists for any Angel content today.</li>
                <li>Applied Reasoning is not included — that evidence gate remains deferred.</li>
                <li>
                  Completing this writes real evidence-pipeline and Mock Attempt Ledger data under your current
                  profile, the same as a real Mock sitting would.
                </li>
              </ul>
            </InfoCard>

            <InfoCard className="mt-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Answers aren&apos;t marked as you go. Once you submit, you&apos;ll see your results and a full
                evidence breakdown for every item.
              </p>
              <button
                onClick={loadAndStart}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Start Founder Validation Assessment
              </button>
            </InfoCard>
          </div>
        )}

        {mode === "loading" && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-6" aria-live="polite">
            Preparing the assessment…
          </p>
        )}

        {mode === "error" && (
          <InfoCard className="mt-6 text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">We couldn&apos;t prepare this assessment</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{errorMessage}</p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                onClick={loadAndStart}
                className="min-h-[44px] inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 px-2"
              >
                <RotateCcw size={14} /> Try again
              </button>
              <Link
                href="/learning-intelligence"
                className="min-h-[44px] inline-flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 px-2"
              >
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
                <ExamEnglish
                  prompt={current.prompt as EnglishComprehensionPrompt}
                  value={answers[current.id] ?? ""}
                  onChange={(v) => setAnswer(current.id, v)}
                />
              )}
              {current.subject === "maths" && (
                <ExamMaths
                  prompt={current.prompt as MathsQuestion}
                  value={answers[current.id] ?? ""}
                  onChange={(v) => setAnswer(current.id, v)}
                />
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
                    Submit assessment
                  </button>
                )}
              </div>
            </InfoCard>
          </div>
        )}

        {mode === "submitting" && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-6" aria-live="polite">
            Marking your assessment…
          </p>
        )}

        {mode === "results" && (
          <div>
            <InfoCard className="text-center">
              <CheckCircle2 size={28} className="text-emerald-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Assessment complete — {correctCount} of {activities.length} correct
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Not a production readiness measurement — this is a Founder Validation sitting only.
              </p>
            </InfoCard>

            <FounderEvidenceView activities={activities} results={perItemResults} answers={answers} />

            <div className="mt-8">
              <Link
                href="/learning-intelligence"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Back to Learning Report →
              </Link>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

function ExamEnglish({
  prompt,
  value,
  onChange,
}: {
  prompt: EnglishComprehensionPrompt;
  value: string;
  onChange: (v: string) => void;
}) {
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

function ExamMaths({
  prompt,
  value,
  onChange,
}: {
  prompt: MathsQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
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

/**
 * Founder-only evidence/traceability panel (not learner-facing content —
 * this route as a whole is not learner-facing yet). Renders directly from
 * FOUNDER_VALIDATION_EVIDENCE, keyed by item id, alongside each item's
 * actual answer/marking outcome from this sitting.
 */
function FounderEvidenceView({
  activities,
  results,
  answers,
}: {
  activities: BankQuestion[];
  results: { id: string; correct: boolean; userAnswer: string }[];
  answers: Record<string, string>;
}) {
  const resultById = new Map(results.map((r) => [r.id, r]));
  return (
    <div className="mt-8">
      <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-1">Founder Evidence View</h2>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        Not learner-facing. Full traceability for every item in this sitting.
      </p>
      <div className="space-y-4">
        {activities.map((activity) => {
          const ev = FOUNDER_VALIDATION_EVIDENCE[activity.id];
          const result = resultById.get(activity.id);
          const correctAnswer =
            activity.subject === "maths"
              ? String((activity.prompt as MathsQuestion).answer)
              : (activity.prompt as EnglishComprehensionPrompt).modelAnswer ?? "";
          if (!ev) return null;
          return (
            <InfoCard key={activity.id}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono text-gray-500 dark:text-gray-400">{activity.id}</p>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    result?.correct
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                  }`}
                >
                  {result?.correct ? "Correct" : "Not correct"}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-2">
                {ev.section} — {ev.questionType}
              </p>
              <dl className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div><dt className="inline font-semibold">Competency: </dt><dd className="inline">{ev.competency}</dd></div>
                <div><dt className="inline font-semibold">Marks: </dt><dd className="inline">{ev.marks}</dd></div>
                <div><dt className="inline font-semibold">Evidence source(s): </dt><dd className="inline">{ev.evidenceSourceIds.join("; ")}</dd></div>
                <div><dt className="inline font-semibold">Evidence note: </dt><dd className="inline">{ev.evidenceNote}</dd></div>
                <div><dt className="inline font-semibold">Originality declaration: </dt><dd className="inline">{ev.originalityDeclaration}</dd></div>
                <div><dt className="inline font-semibold">Difficulty basis: </dt><dd className="inline">{ev.difficultyBasis}</dd></div>
                <div><dt className="inline font-semibold">Why it belongs: </dt><dd className="inline">{ev.whyItBelongs}</dd></div>
                <div><dt className="inline font-semibold">Correct answer: </dt><dd className="inline">{correctAnswer}</dd></div>
                <div><dt className="inline font-semibold">Your answer: </dt><dd className="inline">{answers[activity.id] || "(no answer given)"}</dd></div>
              </dl>
            </InfoCard>
          );
        })}
      </div>
    </div>
  );
}
