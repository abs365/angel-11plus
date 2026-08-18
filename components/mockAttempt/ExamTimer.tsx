import { Clock } from "lucide-react";
import { classifyTimerUrgency, formatRemainingTime } from "@/lib/mockAttempt/workspace";
import { cn } from "@/lib/cn";

/**
 * Programme Increment 008E — 008V Part 12's timer standard: calm by
 * default, a single restrained colour shift in the last 10 minutes, a
 * clearer (still non-flashing, no sound, no per-second animation) cue in
 * the last minute. remainingSeconds is always derived from the server-
 * authoritative expiresAt (lib/mockAttempt/workspace.ts's own
 * computeRemainingSeconds) — this component only renders, never computes
 * or trusts a client-side deadline.
 */
export function ExamTimer({ remainingSeconds }: { remainingSeconds: number }) {
  const urgency = classifyTimerUrgency(remainingSeconds);
  const toneClasses =
    urgency === "final-warning"
      ? "text-red-600 dark:text-red-400"
      : urgency === "approaching-end"
        ? "text-amber-600 dark:text-amber-400"
        : "text-gray-700 dark:text-gray-300";

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums", toneClasses)}
      role="timer"
      aria-live={urgency === "final-warning" ? "assertive" : "off"}
      aria-label={`${formatRemainingTime(remainingSeconds)} remaining`}
    >
      <Clock size={14} aria-hidden="true" />
      {formatRemainingTime(remainingSeconds)}
    </span>
  );
}
