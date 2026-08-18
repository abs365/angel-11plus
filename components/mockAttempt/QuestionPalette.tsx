import { Flag } from "lucide-react";
import type { PaletteEntry } from "@/lib/mockAttempt/workspace";
import { cn } from "@/lib/cn";

/**
 * Programme Increment 008E — 008V Part 6/11's question palette. State is
 * never colour-only (Part 11): answered/flagged/current are each carried
 * by a real visual difference (fill vs. outline, a flag icon, a ring) so
 * the palette stays legible for a colour-independent reading, not just a
 * colour-independent aria-label.
 */
export function QuestionPalette({
  entries,
  onSelect,
}: {
  entries: PaletteEntry[];
  onSelect: (questionId: string) => void;
}) {
  return (
    <div role="group" aria-label="Question overview" className="grid grid-cols-6 gap-2">
      {entries.map((entry) => (
        <button
          key={entry.questionId}
          type="button"
          onClick={() => onSelect(entry.questionId)}
          aria-current={entry.current || undefined}
          aria-label={`Question ${entry.index + 1}${entry.answered ? ", answered" : ", not answered yet"}${entry.flagged ? ", flagged for review" : ""}`}
          className={cn(
            "relative h-10 rounded-lg text-xs font-semibold flex items-center justify-center border transition-colors",
            entry.current
              ? "border-purple-600 ring-2 ring-purple-200 dark:ring-purple-900"
              : "border-gray-200 dark:border-gray-700",
            entry.answered
              ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900"
              : "bg-white text-gray-600 dark:bg-gray-900 dark:text-gray-400"
          )}
        >
          {entry.index + 1}
          {entry.flagged && (
            <Flag size={10} className="absolute -top-1 -right-1 text-amber-500 fill-amber-500" aria-hidden="true" />
          )}
        </button>
      ))}
    </div>
  );
}
