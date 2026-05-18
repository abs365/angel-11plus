"use client";

import { CheckCircle, AlertTriangle, ArrowRight, Lightbulb } from "lucide-react";
import type { WritingFeedback } from "@/types/writing-feedback";

interface ScoreConfig {
  label: string;
  barColor: string;
  badgeClass: string;
}

function scoreConfig(score: number): ScoreConfig {
  if (score >= 85) return { label: "Exam-ready", barColor: "bg-emerald-500", badgeClass: "bg-emerald-100 text-emerald-700" };
  if (score >= 70) return { label: "Strong", barColor: "bg-green-400", badgeClass: "bg-green-100 text-green-700" };
  if (score >= 55) return { label: "Developing", barColor: "bg-amber-400", badgeClass: "bg-amber-100 text-amber-700" };
  if (score >= 40) return { label: "Foundation", barColor: "bg-orange-400", badgeClass: "bg-orange-100 text-orange-700" };
  return { label: "Needs work", barColor: "bg-red-400", badgeClass: "bg-red-100 text-red-600" };
}

interface WritingFeedbackProps {
  feedback: WritingFeedback;
}

export default function WritingFeedback({ feedback }: WritingFeedbackProps) {
  const cfg = scoreConfig(feedback.overallScore);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header with score */}
      <div className="px-5 py-4 border-b border-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
              Angel Smart Feedback
            </p>
            <p className="text-gray-900 font-bold text-lg mt-0.5">Your Writing Feedback</p>
          </div>
          <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${cfg.badgeClass}`}>
            {feedback.overallScore}% · {cfg.label}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${cfg.barColor}`}
            style={{ width: `${feedback.overallScore}%` }}
          />
        </div>
      </div>

      {/* Strengths */}
      <div className="px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle size={15} className="text-emerald-500 shrink-0" />
          <p className="text-gray-800 font-semibold text-sm">Strengths</p>
        </div>
        <ul className="flex flex-col gap-2">
          {feedback.strengths.map((s, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <p className="text-gray-600 text-sm leading-relaxed">{s}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Areas to improve */}
      <div className="px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={15} className="text-amber-500 shrink-0" />
          <p className="text-gray-800 font-semibold text-sm">Areas to Improve</p>
        </div>
        <ul className="flex flex-col gap-2">
          {feedback.areasToImprove.map((a, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Suggested upgrade */}
      <div className="px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <ArrowRight size={15} className="text-purple-500 shrink-0" />
          <p className="text-gray-800 font-semibold text-sm">Suggested Upgrade</p>
        </div>
        <div className="space-y-2">
          <div className="bg-red-50 border-l-2 border-red-200 rounded-r-lg px-3 py-2.5">
            <p className="text-red-500 text-[10px] font-semibold uppercase tracking-wide mb-1">
              Original
            </p>
            <p className="text-gray-600 text-sm leading-relaxed italic">
              &ldquo;{feedback.suggestedUpgrade.original}&rdquo;
            </p>
          </div>
          <div className="bg-emerald-50 border-l-2 border-emerald-300 rounded-r-lg px-3 py-2.5">
            <p className="text-emerald-600 text-[10px] font-semibold uppercase tracking-wide mb-1">
              Improved
            </p>
            <p className="text-gray-700 text-sm leading-relaxed italic font-medium">
              &ldquo;{feedback.suggestedUpgrade.improved}&rdquo;
            </p>
          </div>
          <p className="text-gray-500 text-xs leading-relaxed pt-1">
            {feedback.suggestedUpgrade.explanation}
          </p>
        </div>
      </div>

      {/* Tutor tip */}
      <div className="px-5 py-4 bg-indigo-50">
        <div className="flex items-start gap-2.5">
          <Lightbulb size={15} className="text-indigo-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-indigo-700 text-xs font-semibold uppercase tracking-wide mb-1">
              Tutor Tip — apply this next time
            </p>
            <p className="text-indigo-900 text-sm leading-relaxed font-medium">
              {feedback.tutorTip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
