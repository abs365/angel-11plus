import { Check } from "lucide-react";
import type { ExamReadiness } from "@/types/parent";
import { cn } from "@/lib/cn";

/**
 * Sprint 3 (Admission Journey Experience) — a presentation-only stepper.
 * Per this sprint's own instruction ("do not infer or calculate hidden
 * stages"), the active stage is derived from exactly two fields this
 * codebase already computes — `hasEnoughData` (AnalyticsReport) and
 * `examReadiness` (ParentReport, via the existing, unmodified
 * getExamReadiness()/READINESS_CONFIG) — nothing new is calculated here.
 *
 * Mapping, stated explicitly rather than left implicit:
 *   Starting              ← !hasEnoughData (a real, existing "not enough
 *                            evidence yet" state, not this sprint's invention)
 *   Building Foundations  ← hasEnoughData && examReadiness === "not-ready"
 *   Building Skills       ← examReadiness === "building"
 *   Developing Confidence ← examReadiness === "nearly-ready"
 *   Admission Ready       ← examReadiness === "exam-ready"
 * This is a five-position *label* over four existing enum values plus one
 * existing boolean — a renaming for presentation, not a fifth real state.
 *
 * EEP-003 (Calm Progress & Premium Educational Identity) — relabelled
 * positions 1-4 from "Building Skills / Strengthening / Mock Ready / Exam
 * Ready" to this sprint's preferred calm, confidence-building terminology
 * ("prefer Building Foundations / Building Skills / Developing Confidence
 * / Admission Ready rather than numerical-only language"). deriveActiveStageIndex
 * itself is unchanged — same four enum values, same boolean, same mapping
 * logic — only the display strings differ, everywhere this component is
 * used (Dashboard's Hero chip, /progress's Progress Journey, /parent's
 * Progress Story).
 */
const STAGES = ["Starting", "Building Foundations", "Building Skills", "Developing Confidence", "Admission Ready"] as const;

export function deriveActiveStageIndex(hasEnoughData: boolean, readiness: ExamReadiness): number {
  if (!hasEnoughData) return 0;
  switch (readiness) {
    case "not-ready":
      return 1;
    case "building":
      return 2;
    case "nearly-ready":
      return 3;
    case "exam-ready":
      return 4;
  }
}

interface JourneyTimelineProps {
  hasEnoughData: boolean;
  readiness: ExamReadiness;
}

export default function JourneyTimeline({ hasEnoughData, readiness }: JourneyTimelineProps) {
  const activeIndex = deriveActiveStageIndex(hasEnoughData, readiness);

  return (
    // Stage 8 (Responsive pass, 2026-08-31) — at 375px this 5-step stepper
    // genuinely overflowed its card with no scroll affordance, silently
    // clipping the "Admission Ready" label off the right edge (verified
    // live in-browser, not assumed). Reducing the per-step minimum width
    // and circle size on narrow viewports (sm: and up restore the original
    // values byte-for-byte) shrank the overflow but didn't reliably
    // eliminate it — a couple of the five step labels contain a single
    // long unbreakable word wide enough on its own to still push the row
    // past 375px in some cases. Wrapping in an overflow-x-auto container is
    // the actual fix: on any viewport too narrow for all five steps to sit
    // fully visible, the stepper scrolls horizontally instead of clipping
    // — content stays reachable rather than silently disappearing, and
    // nothing changes at any width wide enough to show it in full.
    <div className="overflow-x-auto">
    <ol aria-label="Admission journey stage" className="flex items-center w-full min-w-[320px]">
      {STAGES.map((stage, i) => {
        const complete = i < activeIndex;
        const current = i === activeIndex;
        // Stage 8 fix continued: `last:flex-none` (the actual root cause,
        // found after the min-width reduction above alone didn't fix it)
        // meant the last step — "Admission Ready", one of the longer
        // labels — didn't share in the flex-1 space distribution the
        // other four steps get, so it fell back to its natural content
        // width and pushed past the card's right edge on narrow
        // viewports. Removing it lets all five steps share available
        // space equally; harmless at wider viewports where there was
        // always room to spare.
        return (
          <li key={stage} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 min-w-[48px] sm:min-w-[64px]">
              <div
                aria-current={current ? "step" : undefined}
                className={cn(
                  "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors shrink-0",
                  complete && "bg-sky-600 border-sky-600 text-white",
                  current && "bg-white dark:bg-gray-900 border-sky-600 text-sky-700 dark:text-sky-400",
                  !complete && !current && "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500"
                )}
              >
                {complete ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[9px] sm:text-[10px] font-semibold text-center leading-tight",
                  current ? "text-sky-700 dark:text-sky-400" : "text-gray-400 dark:text-gray-500"
                )}
              >
                {stage}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-0.5 sm:mx-1 mb-4 rounded-full transition-colors",
                  i < activeIndex ? "bg-sky-600" : "bg-gray-200 dark:bg-gray-700"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
    </div>
  );
}
