"use client";

import { Award, X, ChevronRight } from "lucide-react";
import { BADGE_DEFINITIONS } from "@/lib/gamification";

interface NewBadgeBannerProps {
  newlyEarnedIds: string[];
  onDismiss: () => void;
  /**
   * Gate 4 — defaults to the legacy /progress page (unchanged behaviour for
   * any other caller), but the Dashboard passes the CSSE-aware destination
   * so a CSSE learner's achievements link lands on their real Educational
   * Intelligence evidence, matching the same fix already applied to the
   * primary nav's Progress tab and the Dashboard's own "View full progress"
   * button.
   */
  progressHref?: string;
}

/**
 * AEI-002 (Core Learner Experience) — carries role="status" so a
 * screen-reader user is told about a new achievement without needing to
 * notice the visual banner. Accessibility-only addition; appearance
 * unchanged.
 */
export default function NewBadgeBanner({ newlyEarnedIds, onDismiss, progressHref = "/progress" }: NewBadgeBannerProps) {
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
      className="mt-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl px-4 py-3.5 flex items-center gap-3"
    >
      <div className="shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center">
        <Award size={15} className="text-slate-600 dark:text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium truncate">{names}</p>
      </div>
      <a
        href={progressHref}
        onClick={onDismiss}
        className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-xs font-semibold shrink-0 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        View
        <ChevronRight size={13} />
      </a>
      <button
        onClick={onDismiss}
        className="shrink-0 text-slate-300 dark:text-slate-700 hover:text-slate-500 dark:hover:text-slate-400 transition-colors"
        aria-label="Dismiss"
      >
        <X size={15} />
      </button>
    </div>
  );
}
