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
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-100",
    icon: "bg-purple-100 text-purple-600",
    title: "text-purple-900",
    body: "text-purple-700",
  },
  green: {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    icon: "bg-emerald-100 text-emerald-600",
    title: "text-emerald-900",
    body: "text-emerald-700",
  },
  orange: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    icon: "bg-amber-100 text-amber-600",
    title: "text-amber-900",
    body: "text-amber-700",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-100",
    icon: "bg-red-100 text-red-500",
    title: "text-red-900",
    body: "text-red-700",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-100",
    icon: "bg-blue-100 text-blue-600",
    title: "text-blue-900",
    body: "text-blue-700",
  },
  indigo: {
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    icon: "bg-indigo-100 text-indigo-600",
    title: "text-indigo-900",
    body: "text-indigo-700",
  },
  pink: {
    bg: "bg-pink-50",
    border: "border-pink-100",
    icon: "bg-pink-100 text-pink-600",
    title: "text-pink-900",
    body: "text-pink-700",
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
