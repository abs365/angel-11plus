import { StatusIndicator } from "@/components/ui/Progress";
import { COMPETENCIES } from "@/lib/learningEngine/assessmentBrainMap";
import type { ComponentReadiness, ReadinessBand } from "@/lib/learningEngine/types";

/**
 * Feature 5 — Learning Readiness Summary (LEARNING_ENGINE_V1.md §6).
 * Component-scoped, qualitative bands only — no percentage, no aggregate
 * exam-readiness score, no pass/fail implication. Renders exactly the
 * evidence distribution computeComponentReadiness() already derived.
 *
 * Increment 3 — also rendered on the accepted, frozen Practice results
 * screen; export signature unchanged. Band labels translated from audit-
 * register phrasing ("Well/Partially/Not Yet Evidenced") to plain
 * language, and the dense "X strengths · Y development areas · Z of N not
 * yet evidenced" line simplified to one honest, warm sentence — same
 * underlying counts, no new computation.
 */
const BAND_TONE: Record<ReadinessBand, "success" | "info" | "neutral"> = {
  "Well Evidenced": "success",
  "Partially Evidenced": "info",
  "Not Yet Evidenced": "neutral",
};

const BAND_LABEL: Record<ReadinessBand, string> = {
  "Well Evidenced": "Building well",
  "Partially Evidenced": "Getting started",
  "Not Yet Evidenced": "Not started yet",
};

export function ReadinessSummary({ readiness }: { readiness: ComponentReadiness[] }) {
  return (
    <div className="divide-y divide-[var(--angel-border)]">
      {readiness.map((r) => (
        <div key={r.component} className="py-4 first:pt-0">
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
            <p className="text-sm font-semibold text-[var(--angel-navy)]">{r.component}</p>
            <StatusIndicator tone={BAND_TONE[r.band]} label={BAND_LABEL[r.band]} />
          </div>
          <p className="text-xs text-[var(--angel-muted)]">
            {r.strengths.length} skill{r.strengths.length === 1 ? "" : "s"} going well · {r.developmentAreas.length} to work on
          </p>
          {r.strengths.length > 0 && (
            <p className="text-xs text-[var(--angel-ink)] mt-1.5 opacity-90">
              {r.strengths.map((id) => COMPETENCIES[id].name).join(", ")}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
