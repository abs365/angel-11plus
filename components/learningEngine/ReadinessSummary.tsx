import { InfoCard } from "@/components/ui/Card";
import { StatusIndicator } from "@/components/ui/Progress";
import { COMPETENCIES } from "@/lib/learningEngine/assessmentBrainMap";
import type { ComponentReadiness, ReadinessBand } from "@/lib/learningEngine/types";

/**
 * Feature 5 — Learning Readiness Summary (LEARNING_ENGINE_V1.md §6).
 * Component-scoped, qualitative bands only — no percentage, no aggregate
 * exam-readiness score, no pass/fail implication. Renders exactly the
 * evidence distribution computeComponentReadiness() already derived.
 */
const BAND_TONE: Record<ReadinessBand, "success" | "info" | "neutral"> = {
  "Well Evidenced": "success",
  "Partially Evidenced": "info",
  "Not Yet Evidenced": "neutral",
};

export function ReadinessSummary({ readiness }: { readiness: ComponentReadiness[] }) {
  return (
    <div className="space-y-3">
      {readiness.map((r) => (
        <InfoCard key={r.component}>
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{r.component}</p>
            <StatusIndicator tone={BAND_TONE[r.band]} label={r.band} />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {r.strengths.length} strength{r.strengths.length === 1 ? "" : "s"} · {r.developmentAreas.length} development area
            {r.developmentAreas.length === 1 ? "" : "s"} · {r.notYetEvidenced.length} of {r.competencyIds.length} not yet evidenced
          </p>
          {r.strengths.length > 0 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5">
              {r.strengths.map((id) => COMPETENCIES[id].name).join(", ")}
            </p>
          )}
        </InfoCard>
      ))}
    </div>
  );
}
