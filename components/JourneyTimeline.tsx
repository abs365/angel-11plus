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
    <ol aria-label="Admission journey stage" className="flex items-center w-full">
      {STAGES.map((stage, i) => {
        const complete = i < activeIndex;
        const current = i === activeIndex;
        return (
          <li key={stage} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 min-w-[64px]">
              <div
                aria-current={current ? "step" : undefined}
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors shrink-0",
                  complete && "bg-purple-600 border-purple-600 text-white",
                  current && "bg-white dark:bg-gray-900 border-purple-600 text-purple-600 dark:text-purple-400",
                  !complete && !current && "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500"
                )}
              >
                {complete ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold text-center leading-tight",
                  current ? "text-purple-600 dark:text-purple-400" : "text-gray-400 dark:text-gray-500"
                )}
              >
                {stage}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-1 mb-4 rounded-full transition-colors",
                  i < activeIndex ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-700"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
