"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Clock, CheckCircle2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { withTimeout } from "@/lib/withTimeout";
import { fetchQuestionBank } from "@/lib/ali/questionBank";
import { recordPresentation, recordOutcome } from "@/lib/ali/history";
import { completeLesson, recordSkillResult, getSelectedPathwayId, setSelectedPathway } from "@/lib/progress";
import { fetchLearnerIntelligenceProfile } from "@/lib/learningEngine/profile";
import { checkMathsAnswer, scoreEnglishAnswer, WRITING_CORRECTNESS_THRESHOLD } from "@/lib/learningEngine/practiceContent";
import { CompetencyProfile } from "@/components/learningEngine/CompetencyProfile";
import { ReadinessSummary } from "@/components/learningEngine/ReadinessSummary";
import { RecommendationSummary } from "@/components/learningEngine/RecommendationSummary";
import type { BankQuestion } from "@/types/ali/questionBank";
import type { LearnerIntelligenceProfile } from "@/lib/learningEngine/types";
import type { EnglishComprehensionPrompt } from "@/types/ali/questionBank";
import type { MathsQuestion } from "@/types/index";

type Mode = "intro" | "loading" | "error" | "exam" | "submitting" | "results";

/**
 * CSSE Mock Exam (Capability 3, Wave 4). Timed, exam-condition version of
 * Wave 2's Practice Experience: real submission at the end (not per-
 * question immediate feedback — a genuine exam condition, matching this
 * mission's "Timed mock exams / Submission / Evidence recording /
 * Learning Engine updates / Learner feedback" sequence, in that order),
 * covering every currently-tagged CSSE activity across all three areas in
 * one sitting (Reading Comprehension + Mathematics + Continuous Writing —
 * mirroring Assessment Brain V1's real English+Maths two-test structure,
 * §2). Reuses Wave 2's real content (migration 013), real graders, and
 * real recordPresentation/recordOutcome persistence unchanged — no new
 * educational logic, per this Wave's rule.
 *
 * Writing's grading requires a real LLM call (/api/writing-feedback) which
 * cannot happen mid-timer without the learner waiting on a network call
 * inside their exam time — it is graded immediately after Submit, before
 * the timer-dependent parts of the flow, exactly like the other two areas'
 * checkers, just async.
 */
export default function MockExamPage() {
  const [mode, setMode] = useState<Mode>("intro");
  const [errorMessage, setErrorMessage] = useState("");
  const [activities, setActivities] = useState<BankQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [profile, setProfile] = useState<LearnerIntelligenceProfile | null | undefined>(undefined);

  const profileIdRef = useRef<string>("");
  const sessionIdRef = useRef<string>("");
  const supabaseRef = useRef<ReturnType<typeof getSupabaseClient>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

      if (getSelectedPathwayId() !== "csse") setSelectedPathway("csse");

      const [english, maths, writing] = await Promise.all([
        withTimeout(fetchQuestionBank(supabase, "english", "csse"), 10000, "English questions"),
        withTimeout(fetchQuestionBank(supabase, "maths", "csse"), 10000, "Maths questions"),
        withTimeout(fetchQuestionBank(supabase, "writing", "csse"), 10000, "the writing task"),
      ]);
      const tagged = [...english, ...maths, ...writing].filter((q) => q.skill.startsWith("QT-"));

      if (tagged.length === 0) {
        throw new Error(
          "No mock exam content is available yet — the illustrative content set (migration 013) has not been applied to this database."
        );
      }

      const totalSeconds = tagged.reduce((sum, q) => sum + q.estimatedTimeSeconds, 0);

      await withTimeout(
        recordPresentation(supabase, profileId, tagged.map((q) => q.id), "mock_exam"),
        10000,
        "starting your exam"
      );

      setActivities(tagged);
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
    if (timerRef.current) clearInterval(timerRef.current);
    setMode("submitting");

    const supabase = supabaseRef.current;
    let correct = 0;

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

      if (supabase && profileIdRef.current) {
        await recordOutcome(
          supabase,
          profileIdRef.current,
          activity.id,
          isCorrect,
          sessionIdRef.current,
          activity.masteryThreshold
        ).catch(() => {});
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

    setMode("results");
    fetchLearnerIntelligenceProfile("csse").then(setProfile).catch(() => setProfile(null));
  }

  const current = activities[index];
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;

  return (
    <PageLayout breadcrumbs={[{ label: "Learning Intelligence", href: "/learning-intelligence" }, { label: "Mock exam" }]}>
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {mode === "intro" && (
          <div>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">CSSE Mock Exam</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              A single timed sitting covering Reading Comprehension, Mathematics and Continuous Writing — every
              currently tagged CSSE activity, one after another, with no feedback until you finish.
            </p>
            <InfoCard className="mt-6">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Answers aren&apos;t marked as you go — this is a real exam condition. Once you submit, your Learning
                Intelligence profile updates with everything you attempted.
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

        {mode === "loading" && <p className="text-sm text-gray-400 dark:text-gray-500 mt-6">Preparing your exam…</p>}

        {mode === "error" && (
          <InfoCard className="mt-6 text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">We couldn&apos;t prepare this exam</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{errorMessage}</p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <button onClick={loadAndStart} className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                Try again
              </button>
              <Link href="/learning-intelligence" className="text-xs font-semibold text-gray-500 dark:text-gray-400">
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

        {mode === "submitting" && <p className="text-sm text-gray-400 dark:text-gray-500 mt-6">Marking your exam…</p>}

        {mode === "results" && (
          <div>
            <InfoCard className="text-center">
              <CheckCircle2 size={28} className="text-emerald-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Exam complete — {correctCount} of {activities.length} correct
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
                  <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-3">Updated competency profile</h2>
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

            <Link href="/learning-intelligence" className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-8 inline-block">
              Full Learning Intelligence dashboard →
            </Link>
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
