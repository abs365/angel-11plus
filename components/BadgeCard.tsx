import {
  Flame,
  Star,
  Award,
  Search,
  Zap,
  BookMarked,
  Pencil,
  BookOpen,
  Calculator,
  ClipboardList,
  Trophy,
  Target,
  Lock,
} from "lucide-react";
import type { BadgeDefinition } from "@/types/gamification";

const ICON_MAP: Record<string, React.ElementType> = {
  Flame,
  Star,
  Award,
  Search,
  Zap,
  BookMarked,
  Pencil,
  BookOpen,
  Calculator,
  ClipboardList,
  Trophy,
  Target,
};

// Zero-Purple pass (2026-08-31): "purple" key rendered identical classes to
// the live "blue" key below after the mechanical purple→blue sweep — a real
// collision, since both are genuinely distinct badge-colour options here.
// Moved to cyan instead, which nothing else in this map already uses.
const EARNED_ICON_CLASS: Record<BadgeDefinition["color"], string> = {
  orange: "bg-orange-100 dark:bg-orange-900 text-orange-500 dark:text-orange-300",
  red: "bg-red-100 dark:bg-red-900 text-red-500 dark:text-red-300",
  rose: "bg-rose-100 dark:bg-rose-900 text-rose-500 dark:text-rose-300",
  purple: "bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-300",
  blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300",
  green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300",
  amber: "bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300",
  indigo: "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300",
  pink: "bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300",
  gray: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
};

interface BadgeCardProps {
  badge: BadgeDefinition;
  earned: boolean;
  compact?: boolean;
}

export default function BadgeCard({ badge, earned, compact = false }: BadgeCardProps) {
  const Icon = ICON_MAP[badge.iconName] ?? Zap;

  if (!earned) {
    return (
      <div className={`flex items-start gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 ${compact ? "p-3" : "p-4"}`}>
        <div className="shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <Lock size={13} className="text-gray-300 dark:text-gray-600" />
        </div>
        <div className="min-w-0">
          <p className="text-gray-300 dark:text-gray-600 font-semibold text-sm truncate">{badge.name}</p>
          {!compact && (
            <p className="text-gray-300 dark:text-gray-600 text-xs mt-0.5 leading-snug">{badge.description}</p>
          )}
        </div>
      </div>
    );
  }

  const iconClass = EARNED_ICON_CLASS[badge.color];

  return (
    <div className={`flex items-start gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 ${compact ? "p-3" : "p-4"}`}>
      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${iconClass}`}>
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-gray-800 dark:text-gray-100 font-semibold text-sm truncate">{badge.name}</p>
        {!compact && (
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5 leading-snug">{badge.description}</p>
        )}
      </div>
    </div>
  );
}
