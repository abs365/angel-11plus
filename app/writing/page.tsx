"use client";

import { useState } from "react";
import {
  Pencil,
  Clock,
  CheckSquare,
  Square,
  ArrowLeft,
  Timer,
  CheckCircle,
  Star,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { writingPrompts } from "@/data/writing";
import { completeLesson } from "@/lib/progress";
import dynamic from "next/dynamic";
import type { WritingPrompt } from "@/types";
import type { WritingFeedback as WritingFeedbackData } from "@/types/writing-feedback";

// Lazy-load the feedback panel — only needed after submission, not on initial render.
const WritingFeedback = dynamic(() => import("@/components/WritingFeedback"), {
  loading: () => (
    <div className="animate-pulse bg-gray-100 rounded-2xl h-48" aria-hidden="true" />
  ),
});

type WritingState = "list" | "active" | "done";
type FeedbackState = "idle" | "loading" | "ready" | "error";

const typeColors: Record<string, string> = {
  narrative: "bg-orange-100 text-orange-700",
  descriptive: "bg-blue-100 text-blue-700",
  persuasive: "bg-purple-100 text-purple-700",
};

export default function WritingPage() {
  const [state, setState] = useState<WritingState>("list");
  const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt | null>(null);
  const [writingText, setWritingText] = useState("");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [xpGained, setXpGained] = useState(0);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>("idle");
  const [feedback, setFeedback] = useState<WritingFeedbackData | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const wordCount = writingText.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const checkedCount = Object.values(checklist).filter(Boolean).length;

  function startPrompt(prompt: WritingPrompt) {
    setSelectedPrompt(prompt);
    setWritingText("");
    setChecklist({});
    setFeedbackState("idle");
    setFeedback(null);
    setFeedbackError(null);
    setState("active");
  }

  function handleSubmit() {
    if (!selectedPrompt) return;
    const xp = Math.min(wordCount * 0.5 + checkedCount * 5 + 20, 100);
    const score = Math.round((checkedCount / selectedPrompt.checklist.length) * 100);
    completeLesson(`writing-${selectedPrompt.id}`, score, Math.round(xp));
    setXpGained(Math.round(xp));
    setState("done");
  }

  async function requestAIFeedback() {
    if (!selectedPrompt) return;
    setFeedbackState("loading");
    setFeedbackError(null);

    const checkedItems = selectedPrompt.checklist.filter((item) => checklist[item]);

    try {
      const res = await fetch("/api/writing-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptTitle: selectedPrompt.title,
          promptType: selectedPrompt.type,
          promptText: selectedPrompt.prompt,
          writingText,
          checkedItems,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedbackError(data.error ?? "Smart feedback is temporarily unavailable. Please try again.");
        setFeedbackState("error");
        return;
      }

      setFeedback(data as WritingFeedbackData);
      setFeedbackState("ready");
    } catch {
      setFeedbackError("Could not reach the server. Please check your connection.");
      setFeedbackState("error");
    }
  }

  function toggleCheck(item: string) {
    setChecklist((prev) => ({ ...prev, [item]: !prev[item] }));
  }

  // ── Done screen ──────────────────────────────────────────────────────────────
  if (state === "done" && selectedPrompt) {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto px-4 py-8 md:px-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 rounded-full mb-3">
              <CheckCircle size={28} className="text-orange-600" />
            </div>
            <h1 className="text-gray-900 font-bold text-2xl mb-1">Writing Submitted</h1>
            <p className="text-gray-500 text-sm">
              {wordCount} words · {checkedCount}/{selectedPrompt.checklist.length} checklist items
            </p>
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full font-semibold mt-3 text-sm">
              <Star size={15} className="text-orange-500" />
              +{xpGained} XP earned
            </div>
          </div>

          {/* Written piece */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">
              Your Response — {selectedPrompt.title}
            </p>
            <div>
              {writingText.split("\n").map((para, i) => (
                <p key={i} className="text-gray-700 text-[15px] leading-relaxed mb-3 last:mb-0">
                  {para || <>&nbsp;</>}
                </p>
              ))}
            </div>
          </div>

          {/* Checklist review */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-5">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">
              Checklist review
            </p>
            <div className="flex flex-col gap-2">
              {selectedPrompt.checklist.map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  {checklist[item] ? (
                    <CheckCircle size={15} className="text-green-500 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 shrink-0" />
                  )}
                  <p className={`text-sm ${checklist[item] ? "text-gray-700" : "text-gray-400"}`}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Feedback section */}
          {feedbackState === "idle" && (
            <button
              onClick={requestAIFeedback}
              className="w-full mb-5 flex items-center justify-center gap-2.5 bg-indigo-600 text-white rounded-xl py-4 font-semibold text-sm hover:bg-indigo-700 transition-colors"
            >
              <Sparkles size={16} />
              Get Angel Smart Feedback
            </button>
          )}

          {feedbackState === "loading" && (
            <div className="w-full mb-5 flex items-center justify-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl py-5">
              <svg
                className="animate-spin h-4 w-4 text-indigo-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="text-indigo-600 text-sm font-medium">Preparing Angel Smart Feedback…</p>
            </div>
          )}

          {feedbackState === "error" && feedbackError && (
            <div className="mb-5 bg-red-50 border border-red-100 rounded-xl px-4 py-3.5 flex items-start gap-2.5">
              <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-red-600 text-sm">{feedbackError}</p>
              </div>
              <button
                onClick={requestAIFeedback}
                className="text-red-500 text-xs font-semibold hover:text-red-700 transition-colors shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {feedbackState === "ready" && feedback && (
            <div className="mb-5">
              <WritingFeedback feedback={feedback} />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setState("list")}
              className="flex-1 bg-orange-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-orange-700 transition-colors"
            >
              Back to Writing
            </button>
            <button
              onClick={() => startPrompt(selectedPrompt)}
              className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3.5 font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // ── Active writing screen ────────────────────────────────────────────────────
  if (state === "active" && selectedPrompt) {
    return (
      <PageLayout>
        <div className="max-w-3xl mx-auto px-4 py-6 md:px-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => setState("list")}
              className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              Writing
            </button>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">{wordCount} words</span>
              <div className="flex items-center gap-1.5 text-orange-600 text-sm font-medium">
                <Timer size={15} />
                {selectedPrompt.timeMinutes} min task
              </div>
            </div>
          </div>

          {/* Prompt */}
          <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${typeColors[selectedPrompt.type]}`}
              >
                {selectedPrompt.type}
              </span>
              <span className="text-orange-600 text-xs flex items-center gap-1">
                <Clock size={11} />
                {selectedPrompt.timeMinutes} minutes
              </span>
            </div>
            <h2 className="text-gray-900 font-bold text-lg mb-2">{selectedPrompt.title}</h2>
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              {selectedPrompt.prompt}
            </div>
          </div>

          <div className="md:flex md:gap-6">
            {/* Writing area */}
            <div className="flex-1 min-w-0">
              <textarea
                value={writingText}
                onChange={(e) => setWritingText(e.target.value)}
                placeholder="Begin writing here..."
                className="w-full h-72 md:h-96 bg-white border border-gray-200 rounded-2xl px-5 py-4 text-[15px] text-gray-800 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-gray-400 text-xs">
                  Target: aim for{" "}
                  {selectedPrompt.type === "persuasive" ? "350+" : "300+"} words
                </p>
                <p
                  className={`text-xs font-medium ${
                    wordCount >= 300 ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {wordCount} words
                </p>
              </div>
            </div>

            {/* Checklist sidebar */}
            <div className="mt-4 md:mt-0 md:w-72 shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-4">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">
                  Checklist ({checkedCount}/{selectedPrompt.checklist.length})
                </p>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                  <div
                    className="bg-orange-400 h-full rounded-full transition-all"
                    style={{
                      width: `${(checkedCount / selectedPrompt.checklist.length) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2.5">
                  {selectedPrompt.checklist.map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleCheck(item)}
                      className="flex items-start gap-2.5 text-left group"
                    >
                      {checklist[item] ? (
                        <CheckSquare size={16} className="text-orange-500 mt-0.5 shrink-0" />
                      ) : (
                        <Square
                          size={16}
                          className="text-gray-300 mt-0.5 shrink-0 group-hover:text-gray-400 transition-colors"
                        />
                      )}
                      <span
                        className={`text-xs leading-snug transition-colors ${
                          checklist[item]
                            ? "text-gray-700 line-through"
                            : "text-gray-500"
                        }`}
                      >
                        {item}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={wordCount < 20}
            className="mt-5 w-full bg-orange-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-orange-700 disabled:opacity-40 transition-colors"
          >
            Submit Writing
          </button>
          {wordCount < 20 && (
            <p className="text-center text-gray-400 text-xs mt-2">
              Write at least 20 words to submit
            </p>
          )}
        </div>
      </PageLayout>
    );
  }

  // ── Prompt list ──────────────────────────────────────────────────────────────
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-orange-100 p-3 rounded-2xl">
            <Pencil size={22} className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-2xl">Creative Writing</h1>
            <p className="text-gray-400 text-sm">Narrative · Descriptive · Persuasive</p>
          </div>
        </div>

        {/* Tip */}
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 mb-5">
          <p className="text-orange-700 text-sm leading-relaxed">
            <strong>Examiner tip:</strong> In 11+ writing, quality beats quantity. One precise
            adjective is worth five vague ones. Vary your sentence openings and always leave time
            to proofread.
          </p>
        </div>

        {/* Smart coaching note */}
        <div className="flex items-center gap-2.5 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 mb-5">
          <Sparkles size={14} className="text-indigo-500 shrink-0" />
          <p className="text-indigo-700 text-sm">
            After submitting, you can request{" "}
            <strong>Angel Smart Feedback</strong> — tailored analysis of your technique, strengths, and
            one specific improvement.
          </p>
        </div>

        {/* Prompts */}
        <div className="grid gap-4">
          {writingPrompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => startPrompt(prompt)}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-orange-200 hover:shadow-sm active:scale-[0.98] transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${typeColors[prompt.type]}`}
                  >
                    {prompt.type}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={11} />
                    {prompt.timeMinutes} min
                  </span>
                </div>
                <span className="text-gray-300 text-xs">{prompt.checklist.length} point checklist</span>
              </div>
              <h3 className="text-gray-900 font-semibold text-base mb-2 group-hover:text-orange-700 transition-colors">
                {prompt.title}
              </h3>
              <p className="text-gray-400 text-sm leading-snug line-clamp-2">
                {prompt.prompt.split("\n")[0]}
              </p>
            </button>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
