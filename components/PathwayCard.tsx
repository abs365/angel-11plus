"use client";

import { CheckCircle } from "lucide-react";
import type { Pathway } from "@/types/pathway";

const COLOR_MAP: Record<
  string,
  { badge: string; border: string; check: string; bg: string }
> = {
  blue: {
    badge: "bg-blue-100 text-blue-700",
    border: "border-blue-200",
    check: "text-blue-600",
    bg: "bg-blue-50",
  },
  indigo: {
    badge: "bg-indigo-100 text-indigo-700",
    border: "border-indigo-200",
    check: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  purple: {
    badge: "bg-purple-100 text-purple-700",
    border: "border-purple-200",
    check: "text-purple-600",
    bg: "bg-purple-50",
  },
  emerald: {
    badge: "bg-emerald-100 text-emerald-700",
    border: "border-emerald-200",
    check: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  amber: {
    badge: "bg-amber-100 text-amber-700",
    border: "border-amber-200",
    check: "text-amber-600",
    bg: "bg-amber-50",
  },
  teal: {
    badge: "bg-teal-100 text-teal-700",
    border: "border-teal-200",
    check: "text-teal-600",
    bg: "bg-teal-50",
  },
  gray: {
    badge: "bg-gray-100 text-gray-600",
    border: "border-gray-200",
    check: "text-gray-500",
    bg: "bg-gray-50",
  },
};

interface Props {
  pathway: Pathway;
  selected?: boolean;
  onSelect: (id: string) => void;
}

export default function PathwayCard({ pathway, selected, onSelect }: Props) {
  const colors = COLOR_MAP[pathway.accentColor] ?? COLOR_MAP.gray;

  return (
    <button
      onClick={() => onSelect(pathway.id)}
      className={`w-full text-left bg-white rounded-2xl p-5 border-2 transition-all duration-150 ${
        selected
          ? `${colors.border} shadow-sm`
          : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-gray-900">{pathway.name}</h3>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${colors.badge}`}
            >
              {pathway.badge}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{pathway.recommendedYears}</p>
        </div>
        {selected && (
          <CheckCircle size={20} className={`shrink-0 mt-0.5 ${colors.check}`} />
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed mb-3">{pathway.description}</p>

      {/* Subjects */}
      <div className={`rounded-xl px-4 py-3 ${colors.bg}`}>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
          Subjects covered
        </p>
        <div className="flex flex-wrap gap-1.5">
          {pathway.subjects.map((s) => (
            <span
              key={s}
              className="text-xs font-medium text-gray-700 bg-white/80 px-2.5 py-1 rounded-lg"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Exam notes */}
      <p className="text-xs text-gray-400 mt-3 leading-relaxed">
        {pathway.examFormatNotes}
      </p>

      {/* Select label */}
      <div className="mt-4 flex items-center justify-end">
        {selected ? (
          <span className={`text-xs font-semibold ${colors.check}`}>
            Selected pathway
          </span>
        ) : (
          <span className="text-xs font-semibold text-purple-600">
            Select this pathway →
          </span>
        )}
      </div>
    </button>
  );
}
