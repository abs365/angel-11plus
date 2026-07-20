import { InfoCard } from "@/components/ui/Card";
import { COMPETENCIES, ALL_ASSESSMENT_COMPONENTS } from "@/lib/learningEngine/assessmentBrainMap";
import type { CompetencyStatus } from "@/lib/learningEngine/types";

/**
 * Parent-facing Competency Summary (Capability 3, Wave 3). Per
 * LEARNING_ENGINE_V1.md §8, parent-facing use must stay in "plain-language
 * terms rather than raw Signal/Tier codes" — this deliberately shows
 * competency NAMES and component-level counts only, never a raw
 * Competency ID (e.g. "RC-01") or Evidence Tier code (e.g. "ET-3"), unlike
 * the learner-facing CompetencyProfile component it's derived from. Same
 * underlying computed data (profile.competencies) — no new calculation.
 */
export function CompetencySummary({ competencies }: { competencies: CompetencyStatus[] }) {
  const byId = new Map(competencies.map((c) => [c.competencyId, c]));

  return (
    <div className="space-y-3">
      {ALL_ASSESSMENT_COMPONENTS.map((component) => {
        const ids = Object.keys(COMPETENCIES).filter((id) => COMPETENCIES[id as keyof typeof COMPETENCIES].component === component);
        const statuses = ids.map((id) => byId.get(id as keyof typeof COMPETENCIES)).filter((s): s is CompetencyStatus => !!s);
        const demonstrated = statuses.filter((s) => s.signal === "Demonstrated").map((s) => COMPETENCIES[s.competencyId].name);
        const notYet = statuses.filter((s) => s.tier === "ET-0").length;

        return (
          <InfoCard key={component}>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{component}</p>
            {demonstrated.length > 0 ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Showing real progress in: {demonstrated.join(", ")}</p>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">No demonstrated evidence yet</p>
            )}
            {notYet > 0 && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                {notYet} of {statuses.length} area{statuses.length === 1 ? "" : "s"} in this section not yet evidenced — a coverage gap, not a concern.
              </p>
            )}
          </InfoCard>
        );
      })}
    </div>
  );
}
