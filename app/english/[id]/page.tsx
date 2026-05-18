"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Star,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { englishLessons } from "@/data/lessons";
import { completeLesson } from "@/lib/progress";

const STOP_WORDS = new Set([
  "the","a","an","is","are","was","were","in","on","at","to","of","and","or",
  "but","that","this","with","as","it","its","he","she","they","his","her",
  "their","we","be","been","being","have","has","had","do","does","did","for",
  "from","by","not","which","who","what","how","when","there","more","so",
  "than","if","up","into","over","after","before","about","would","could",
  "should","make","use","also","very","just","even","like","some","all",
  "one","two","no","can","will","may","might","much","then","these","those",
  "my","your","our","him","them","us","me","you","said","says",
]);

function extractKeywords(text: string): string[] {
  return [...new Set(
    text
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
  )];
}

/**
 * Rubric: 0 = blank/unrelated, 1 = partial/vague, 2 = correct with evidence.
 * Scaled to actual question marks.
 */
function scoreAnswer(userAnswer: string, modelAnswer: string | undefined, maxMarks: number): number {
  const trimmed = userAnswer.trim();
  if (!trimmed || trimmed.length < 8) return 0;

  if (!modelAnswer) {
    return trimmed.length >= 40 ? maxMarks : Math.max(1, Math.round(maxMarks / 2));
  }

  const keywords = extractKeywords(modelAnswer);
  const userLower = trimmed.toLowerCase();
  const hits = keywords.filter((kw) => userLower.includes(kw)).length;
  const ratio = keywords.length > 0 ? hits / keywords.length : 0;
  // Length threshold scales with marks: 2-mark ≈ 56, 3-mark ≈ 64, 4-mark ≈ 72
  const lengthOk = trimmed.length >= 40 + maxMarks * 8;

  if (trimmed.length < 15 && hits === 0) return 0;
  if (hits === 0 && trimmed.length < 60) return 0;
  if (lengthOk && ratio >= 0.18) return maxMarks;
  return Math.max(1, Math.round(maxMarks / 2));
}

interface Props {
  params: Promise<{ id: string }>;
}

const skillColors: Record<string, string> = {
  inference: "bg-purple-100 text-purple-700",
  evidence: "bg-blue-100 text-blue-700",
  vocabulary: "bg-green-100 text-green-700",
  atmosphere: "bg-orange-100 text-orange-700",
  character: "bg-pink-100 text-pink-700",
  explanation: "bg-indigo-100 text-indigo-700",
  structure: "bg-gray-100 text-gray-700",
};

export default function EnglishLessonPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const lesson = englishLessons.find((l) => l.id === id);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [showModel, setShowModel] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  if (!lesson) {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-400">Lesson not found.</p>
        </div>
      </PageLayout>
    );
  }

  const totalMarks = lesson.questions.reduce((s, q) => s + q.marks, 0);
  const answeredCount = lesson.questions.filter((q) => (answers[q.id] ?? "").trim().length > 0).length;

  function handleSubmit() {
    const earnedMarks = lesson!.questions.reduce(
      (sum, q) => sum + scoreAnswer(answers[q.id] ?? "", q.modelAnswer, q.marks),
      0
    );
    const score = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
    const xp = Math.max(10, Math.round((earnedMarks / Math.max(totalMarks, 1)) * 50) + 10);
    completeLesson(lesson!.id, score, xp);
    setXpGained(xp);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto px-4 py-12 md:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <CheckCircle size={32} className="text-purple-600" />
            </div>
            <h1 className="text-gray-900 font-bold text-2xl mb-2">Lesson Complete!</h1>
            <p className="text-gray-500">
              You answered {answeredCount} of {lesson.questions.length} questions
            </p>
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full mt-3 font-semibold">
              <Star size={16} className="text-purple-500" />
              +{xpGained} XP earned
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-6">
            <p className="text-amber-800 font-semibold text-sm mb-1">Review Model Answers</p>
            <p className="text-amber-700 text-sm">
              Compare your responses to the model answers below to identify what to improve.
            </p>
          </div>

          {lesson.questions.map((q) => (
            <div key={q.id} className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${skillColors[q.skill] ?? "bg-gray-100 text-gray-600"}`}>
                  {q.skill}
                </span>
                <span className="text-xs text-gray-400">{q.marks} mark{q.marks !== 1 ? "s" : ""}</span>
              </div>

              <p className="text-gray-800 font-medium text-sm mb-3">{q.question}</p>

              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                <p className="text-xs text-gray-400 font-medium mb-1">Your answer:</p>
                <p className="text-gray-700 text-sm">
                  {answers[q.id]?.trim() || <em className="text-gray-400">Not answered</em>}
                </p>
              </div>

              {q.modelAnswer && (
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-xs text-green-600 font-medium mb-1">Model answer:</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{q.modelAnswer}</p>
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => router.push("/english")}
              className="flex-1 bg-purple-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-purple-700 transition-colors"
            >
              Back to English
            </button>
            <button
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
                setShowHints({});
                setShowModel({});
              }}
              className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3.5 font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {/* Back button */}
        <button
          onClick={() => router.push("/english")}
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-5 transition-colors"
        >
          <ArrowLeft size={16} />
          English
        </button>

        {/* Title */}
        <div className="mb-5">
          <h1 className="text-gray-900 font-bold text-2xl mb-1">{lesson.title}</h1>
          <p className="text-gray-400 text-sm">
            {lesson.questions.length} questions · {totalMarks} marks ·{" "}
            {lesson.estimatedMinutes} min
          </p>
        </div>

        {/* Passage */}
        {lesson.passage && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">
              Read carefully
            </p>
            <div className="prose prose-sm max-w-none">
              {lesson.passage.split("\n\n").map((para, i) => (
                <p key={i} className="text-gray-800 text-[15px] leading-[1.8] mb-4 last:mb-0">
                  {para}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="flex flex-col gap-5">
          {lesson.questions.map((q, qi) => (
            <div key={q.id} className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    {qi + 1}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${skillColors[q.skill] ?? "bg-gray-100 text-gray-600"}`}>
                    {q.skill}
                  </span>
                  <span className="text-xs text-gray-400">[{q.marks} mark{q.marks !== 1 ? "s" : ""}]</span>
                </div>
              </div>

              <p className="text-gray-800 font-medium text-[15px] leading-relaxed mb-4">
                {q.question}
              </p>

              <textarea
                value={answers[q.id] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                }
                placeholder="Write your answer here..."
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              />

              {/* Hint & model toggle buttons */}
              <div className="flex gap-2 mt-3">
                {q.hint && (
                  <button
                    onClick={() =>
                      setShowHints((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                    }
                    className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    <Lightbulb size={12} />
                    {showHints[q.id] ? "Hide hint" : "Show hint"}
                    {showHints[q.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                )}
              </div>

              {showHints[q.id] && q.hint && (
                <div className="mt-2 bg-amber-50 rounded-xl p-3">
                  <p className="text-amber-700 text-sm">{q.hint}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="mt-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-400">
              {answeredCount} of {lesson.questions.length} answered
            </p>
            <div className="flex-1 mx-4 bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-purple-500 h-full rounded-full transition-all"
                style={{
                  width: `${(answeredCount / lesson.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={answeredCount === 0}
            className="w-full bg-purple-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Submit Answers
          </button>
          <p className="text-gray-400 text-xs text-center mt-2">
            You can review model answers after submitting
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
