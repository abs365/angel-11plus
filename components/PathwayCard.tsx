"use client";

import { CheckCircle } from "lucide-react";
import type { Pathway } from "@/types/pathway";

/** Exported (Sprint 7 — School Intelligence Experience) so the Target School Overview reuses the exact same accent-colour treatment as this card, rather than a second, parallel colour map. */
export const PATHWAY_COLOR_MAP: Record<
  string,
  { badge: string; border: string; check: string; bg: string }
> = {
  blue: {
    badge: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    check: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  indigo: {
    badge: "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-800",
    check: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-950",
  },
  purple: {
    badge: "bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
    check: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950",
  },
  emerald: {
    badge: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    check: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950",
  },
  amber: {
    badge: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    check: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950",
  },
  teal: {
    badge: "bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300",
    border: "border-teal-200 dark:border-teal-800",
    check: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950",
  },
  gray: {
    badge: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-700",
    check: "text-gray-500 dark:text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-800",
  },
};

interface Props {
  pathway: Pathway;
  selected?: boolean;
  onSelect: (id: string) => void;
}

export default function PathwayCard({ pathway, selected, onSelect }: Props) {
  const colors = PATHWAY_COLOR_MAP[pathway.accentColor] ?? PATHWAY_COLOR_MAP.gray;

  return (
    <button
      onClick={() => onSelect(pathway.id)}
      className={`w-full text-left bg-white dark:bg-gray-900 rounded-2xl p-5 border-2 transition-all duration-150 ${
        selected
          ? `${colors.border} shadow-sm`
          : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{pathway.name}</h3>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${colors.badge}`}
            >
              {pathway.badge}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{pathway.recommendedYears}</p>
        </div>
        {selected && (
          <CheckCircle size={20} className={`shrink-0 mt-0.5 ${colors.check}`} />
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{pathway.description}</p>

      {/* Subjects */}
      <div className={`rounded-xl px-4 py-3 ${colors.bg}`}>
        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">
          Subjects covered
        </p>
        <div className="flex flex-wrap gap-1.5">
          {pathway.subjects.map((s) => (
            <span
              key={s}
              className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 px-2.5 py-1 rounded-lg"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Exam notes */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 leading-relaxed">
        {pathway.examFormatNotes}
      </p>

      {/* Select label */}
      <div className="mt-4 flex items-center justify-end">
        {selected ? (
          <span className={`text-xs font-semibold ${colors.check}`}>
            Selected pathway
          </span>
        ) : (
          <span className="text-xs font-semibold text-sky-700 dark:text-sky-400">
            Select this pathway →
          </span>
        )}
      </div>
    </button>
  );
}
