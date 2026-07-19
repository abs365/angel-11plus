"use client";

import { Award, X, ChevronRight } from "lucide-react";
import { BADGE_DEFINITIONS } from "@/lib/gamification";

interface NewBadgeBannerProps {
  newlyEarnedIds: string[];
  onDismiss: () => void;
}

/**
 * AEI-002 (Core Learner Experience) — carries role="status" so a
 * screen-reader user is told about a new achievement without needing to
 * notice the visual banner. Accessibility-only addition; appearance
 * unchanged.
 */
export default function NewBadgeBanner({ newlyEarnedIds, onDismiss }: NewBadgeBannerProps) {
  if (newlyEarnedIds.length === 0) return null;

  const badges = newlyEarnedIds
    .map((id) => BADGE_DEFINITIONS.find((b) => b.id === id))
    .filter(Boolean);

  const names = badges.map((b) => b!.name).join(" · ");
  // EEP-003 (Calm Progress & Premium Educational Identity) — "unlocked"
  // read as video-game-mechanic language; reworded to "earned," a calmer
  // word for the same real event (still fires under the same condition,
  // still links to /progress, still dismissible the same way).
  const label =
    newlyEarnedIds.length === 1
      ? "New achievement earned"
      : `${newlyEarnedIds.length} new achievements earned`;

  return (
    <div
      role="status"
      className="mt-4 bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 rounded-2xl px-4 py-3.5 flex items-center gap-3"
    >
      <div className="shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
        <Award size={15} className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-indigo-500 dark:text-indigo-400 text-sm font-medium truncate">{names}</p>
      </div>
      <a
        href="/progress"
        onClick={onDismiss}
        className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-xs font-semibold shrink-0 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
      >
        View
        <ChevronRight size={13} />
      </a>
      <button
        onClick={onDismiss}
        className="shrink-0 text-indigo-300 dark:text-indigo-700 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
        aria-label="Dismiss"
      >
        <X size={15} />
      </button>
    </div>
  );
}
