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

const EARNED_ICON_CLASS: Record<BadgeDefinition["color"], string> = {
  orange: "bg-orange-100 text-orange-500",
  red: "bg-red-100 text-red-500",
  rose: "bg-rose-100 text-rose-500",
  purple: "bg-purple-100 text-purple-600",
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  amber: "bg-amber-100 text-amber-600",
  indigo: "bg-indigo-100 text-indigo-600",
  pink: "bg-pink-100 text-pink-600",
  gray: "bg-gray-100 text-gray-500",
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
      <div className={`flex items-start gap-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 ${compact ? "p-3" : "p-4"}`}>
        <div className="shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <Lock size={13} className="text-gray-300" />
        </div>
        <div className="min-w-0">
          <p className="text-gray-300 font-semibold text-sm truncate">{badge.name}</p>
          {!compact && (
            <p className="text-gray-300 text-xs mt-0.5 leading-snug">{badge.description}</p>
          )}
        </div>
      </div>
    );
  }

  const iconClass = EARNED_ICON_CLASS[badge.color];

  return (
    <div className={`flex items-start gap-3 bg-white rounded-xl border border-gray-100 ${compact ? "p-3" : "p-4"}`}>
      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${iconClass}`}>
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-gray-800 font-semibold text-sm truncate">{badge.name}</p>
        {!compact && (
          <p className="text-gray-400 text-xs mt-0.5 leading-snug">{badge.description}</p>
        )}
      </div>
    </div>
  );
}
