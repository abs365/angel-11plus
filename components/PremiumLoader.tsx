"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PremiumLoaderProps {
  /** First message shown immediately. */
  message: string;
  /**
   * Optional messages shown in order if loading takes longer than expected —
   * one every 3 seconds, holding on the last one (Phase 5B.2: "no loading
   * state should last forever" pairs with "if it takes a while, say so").
   */
  progressMessages?: string[];
  icon?: LucideIcon;
}

/**
 * Angel UX V3 — the shared loading experience for every adaptive practice
 * route (ANGEL_LOADING_EXPERIENCE.md). Replaces four separate developer-
 * placeholder loading strings ("Choosing your passage…", "Building your
 * adaptive mock…", etc.) with one premium, reusable moment. `message` should
 * always describe the outcome the student is waiting for, never the
 * internal mechanism producing it — never say "adaptive," "learning unit,"
 * or "competency" here (ANGEL_UX_V3_STRATEGY.md §3).
 *
 * AEI-001 (Consistency Foundation) — the rotating message carries
 * aria-live="polite"/aria-atomic="true" so a screen-reader user hears each
 * update, not just the first message. Accessibility-only addition; visual
 * appearance and timing are unchanged.
 */
export default function PremiumLoader({ message, progressMessages, icon: Icon = Sparkles }: PremiumLoaderProps) {
  const allMessages = [message, ...(progressMessages ?? [])];
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (allMessages.length <= 1) return;
    if (step >= allMessages.length - 1) return;
    const timer = setTimeout(() => setStep((s) => s + 1), 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, allMessages.length]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-5">
        <div className="w-16 h-16 rounded-3xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center animate-pulse">
          <Icon size={28} className="text-purple-500 dark:text-purple-400" />
        </div>
        <p
          className="text-gray-600 dark:text-gray-300 text-sm font-medium"
          aria-live="polite"
          aria-atomic="true"
        >
          {allMessages[step]}
        </p>
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 dark:bg-purple-500 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 dark:bg-purple-500 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 dark:bg-purple-500 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
