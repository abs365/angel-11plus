import { StatusIndicator } from "@/components/ui/Progress";
import { evidenceSignalTone, evidenceSignalLabel } from "./EvidenceTierBadge";
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
 *
 * `durableCompetencyIds` (Sprint 1, Deliverable 6) is optional and additive:
 * when a caller has resolved real Educational Intelligence Engine data
 * (lib/learningEngine/educationalIntelligenceService.ts's
 * durableMastery.durable, EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md §7) for a
 * competency, that competency's card shows a "Durably Mastered" chip in
 * addition to its existing Evidence Signal/Tier — a real distinction from
 * plain "mastered" (validated once) that no prior surface displayed.
 * Callers that do not pass it (e.g. the Practice results screen) render
 * exactly as before.
 *
 * Sprint 4 Completion Package (WP4A) — the raw CompetencyId ("RC-01") that
 * used to render under the name is removed. Earlier sprints treated "codes
 * visible to the learner, hidden from the parent" as a deliberate design
 * axis; FD-019's "Plain English throughout" supersedes that split for this
 * shared component, so the code is gone for every caller, not toggled.
 *
 * Increment 3 — the separate 5-step Evidence Tier badge (ET-0..ET-4,
 * shown alongside the Evidence Signal chip) was real but redundant
 * badge clutter: both described "how much evidence exists" in two
 * different vocabularies on the same row. EvidenceTierBadge.tsx's own
 * computation is untouched and still exported for any future caller that
 * needs the finer-grained tier; this component now shows one clear,
 * warm-language signal per skill instead of two overlapping indicators.
 */
export function CompetencyProfile({
  competencies,
  durableCompetencyIds,
}: {
  competencies: CompetencyStatus[];
  durableCompetencyIds?: Set<string>;
}) {
  const byId = new Map(competencies.map((c) => [c.competencyId, c]));

  return (
    <div className="space-y-4">
      {ALL_ASSESSMENT_COMPONENTS.map((component) => {
        const ids = Object.keys(COMPETENCIES).filter((id) => COMPETENCIES[id as keyof typeof COMPETENCIES].component === component);
        if (ids.length === 0) return null;
        return (
          <div key={component}>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--angel-muted)] mb-2">{component}</p>
            <div className="divide-y divide-[var(--angel-border)]">
              {ids.map((id) => {
                const status = byId.get(id as keyof typeof COMPETENCIES);
                if (!status) return null;
                const meta = COMPETENCIES[id as keyof typeof COMPETENCIES];
                return (
                  <div key={id} className="flex items-center justify-between gap-3 py-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--angel-navy)] truncate">{meta.name}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {durableCompetencyIds?.has(id) && (
                        <StatusIndicator tone="success" label="Confidently mastered" />
                      )}
                      <StatusIndicator tone={evidenceSignalTone(status.signal)} label={evidenceSignalLabel(status.signal)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
