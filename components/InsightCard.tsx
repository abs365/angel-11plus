import type { LearningInsight } from "@/types/analytics";
import {
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Trophy,
  Flame,
  Info,
} from "lucide-react";

interface InsightCardProps {
  insight: LearningInsight;
  compact?: boolean;
}

const colorMap = {
  // AN-108 — "purple" is this map's fallback default (`?? colorMap.purple`
  // below) for an unmatched insight colour, so it's the same "purple as
  // dominant default" pattern corrected elsewhere in the card/button/
  // progress system. Zero-Purple pass (2026-08-31): now renders slate,
  // same value as the separate "indigo" key below — the two were already
  // duplicates of each other pre-Zero-Purple (both indigo-family), so
  // this preserves that existing relationship rather than introducing a
  // new distinction that wasn't there before.
  purple: {
    bg: "bg-slate-50 dark:bg-slate-950",
    border: "border-slate-100 dark:border-slate-900",
    icon: "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300",
    title: "text-slate-900 dark:text-slate-100",
    body: "text-slate-700 dark:text-slate-300",
  },
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-950",
    border: "border-emerald-100 dark:border-emerald-900",
    icon: "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300",
    title: "text-emerald-900 dark:text-emerald-100",
    body: "text-emerald-700 dark:text-emerald-300",
  },
  orange: {
    bg: "bg-amber-50 dark:bg-amber-950",
    border: "border-amber-100 dark:border-amber-900",
    icon: "bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300",
    title: "text-amber-900 dark:text-amber-100",
    body: "text-amber-700 dark:text-amber-300",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950",
    border: "border-red-100 dark:border-red-900",
    icon: "bg-red-100 dark:bg-red-900 text-red-500 dark:text-red-300",
    title: "text-red-900 dark:text-red-100",
    body: "text-red-700 dark:text-red-300",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-100 dark:border-blue-900",
    icon: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300",
    title: "text-blue-900 dark:text-blue-100",
    body: "text-blue-700 dark:text-blue-300",
  },
  indigo: {
    bg: "bg-slate-50 dark:bg-slate-950",
    border: "border-slate-100 dark:border-slate-900",
    icon: "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300",
    title: "text-slate-900 dark:text-slate-100",
    body: "text-slate-700 dark:text-slate-300",
  },
  pink: {
    bg: "bg-pink-50 dark:bg-pink-950",
    border: "border-pink-100 dark:border-pink-900",
    icon: "bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300",
    title: "text-pink-900 dark:text-pink-100",
    body: "text-pink-700 dark:text-pink-300",
  },
} as const;

const typeIcon = {
  strength: TrendingUp,
  weakness: AlertTriangle,
  suggestion: Lightbulb,
  milestone: Trophy,
  streak: Flame,
  info: Info,
};

export default function InsightCard({ insight, compact = false }: InsightCardProps) {
  const c = colorMap[insight.color as keyof typeof colorMap] ?? colorMap.purple;
  const Icon = typeIcon[insight.type];

  if (compact) {
    return (
      <div className={`${c.bg} ${c.border} border rounded-2xl px-4 py-3 flex items-start gap-3`}>
        <div className={`${c.icon} p-1.5 rounded-lg shrink-0 mt-0.5`}>
          <Icon size={14} />
        </div>
        <div className="min-w-0">
          <p className={`${c.title} font-semibold text-sm leading-tight mb-0.5`}>
            {insight.title}
          </p>
          <p className={`${c.body} text-xs leading-snug`}>{insight.body}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${c.bg} ${c.border} border rounded-2xl p-5 flex gap-4`}>
      <div className={`${c.icon} p-2.5 rounded-xl shrink-0 h-fit`}>
        <Icon size={18} />
      </div>
      <div>
        <p className={`${c.title} font-semibold text-sm mb-1`}>{insight.title}</p>
        <p className={`${c.body} text-sm leading-relaxed`}>{insight.body}</p>
      </div>
    </div>
  );
}
