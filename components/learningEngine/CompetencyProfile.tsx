import { InfoCard } from "@/components/ui/Card";
import { StatusIndicator } from "@/components/ui/Progress";
import { EvidenceTierBadge, evidenceSignalTone } from "./EvidenceTierBadge";
import { COMPETENCIES, ALL_ASSESSMENT_COMPONENTS } from "@/lib/learningEngine/assessmentBrainMap";
import type { CompetencyStatus } from "@/lib/learningEngine/types";

/**
 * Feature 2 — Competency Profile (LEARNING_ENGINE_V1.md §3.2/§3.3).
 * Shows every one of Assessment Brain's 13 competencies, grouped by its
 * owning Assessment Component, each with its real, computed Evidence
 * Signal and Evidence Tier — never a fabricated or placeholder value.
 * Renders exactly what CompetencyStatus[] contains, no filtering that
 * would hide an ET-0/"Not Yet Observed" competency (Principle 6:
 * absence of evidence must be shown honestly, not omitted).
 */
export function CompetencyProfile({ competencies }: { competencies: CompetencyStatus[] }) {
  const byId = new Map(competencies.map((c) => [c.competencyId, c]));

  return (
    <div className="space-y-4">
      {ALL_ASSESSMENT_COMPONENTS.map((component) => {
        const ids = Object.keys(COMPETENCIES).filter((id) => COMPETENCIES[id as keyof typeof COMPETENCIES].component === component);
        if (ids.length === 0) return null;
        return (
          <div key={component}>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">{component}</p>
            <div className="space-y-2">
              {ids.map((id) => {
                const status = byId.get(id as keyof typeof COMPETENCIES);
                if (!status) return null;
                const meta = COMPETENCIES[id as keyof typeof COMPETENCIES];
                return (
                  <InfoCard key={id} className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{meta.name}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">{id}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <StatusIndicator tone={evidenceSignalTone(status.signal)} label={status.signal} />
                      <EvidenceTierBadge tier={status.tier} />
                    </div>
                  </InfoCard>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
