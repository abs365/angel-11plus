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
          key={entry.questionIds[0]}
          type="button"
          onClick={() => onSelect(entry.questionIds[0])}
          aria-current={entry.current || undefined}
          aria-label={`Question ${entry.index + 1}${entry.answered ? ", answered" : ", not answered yet"}${entry.flagged ? ", flagged for review" : ""}`}
          className={cn(
            "relative h-10 rounded-lg text-xs font-semibold flex items-center justify-center border transition-colors motion-reduce:transition-none",
            entry.current
              ? "border-[var(--angel-blue)] ring-2 ring-blue-200 dark:ring-blue-900"
              : "border-[var(--angel-border)]",
            entry.answered
              ? "bg-[var(--angel-navy)] text-white"
              : "bg-[var(--angel-paper)] text-[var(--angel-muted)]"
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
