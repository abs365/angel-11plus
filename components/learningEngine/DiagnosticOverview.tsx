import { COMPETENCIES } from "@/lib/learningEngine/assessmentBrainMap";
import type { CompetencyId, DiagnosticFindings } from "@/lib/learningEngine/types";

/**
 * Feature 4 — Diagnostic Overview (LEARNING_ENGINE_V1.md §4). Reads the
 * five named categories exactly as computed by lib/learningEngine/
 * diagnostics.ts — no filtering, no invented category.
 *
 * Increment 3 (Progress + Results + Parent Dashboard) — this component is
 * also rendered on the accepted Practice results screen
 * (app/learning-intelligence/practice/[area]/page.tsx), which stays
 * closed/frozen this increment; its export signature
 * (`{ findings: DiagnosticFindings }`) is unchanged so that call site
 * needs no edit. What changed is internal presentation only: the prior
 * version was five separately-coloured icon cards (Strengths/Mastered
 * Skills/Emerging Skills/Development Areas/Low Confidence Areas) plus a
 * sixth dashed "Not Yet Evidenced" card — exactly the "grid of rounded
 * statistic cards" / "icon tile beside every heading" / "rainbow category
 * colours" pattern the governing design standard rules out. Rewritten as
 * two calm, typography-led groups a family actually asks about --
 * "What's going well" (strengths + mastered + emerging skills, the real
 * positive-evidence categories) and "What to work on" (development areas
 * + low-confidence areas) — no icon, no colour-block, no card grid. The
 * "Not Yet Evidenced" coverage list is dropped from this component
 * entirely: it duplicates the page-level honest zero-evidence state every
 * caller of this component already shows, and repeating a long list of
 * "nothing yet" competencies a second time inside this component added
 * length without adding a genuine answer to a family's question.
 */
function CompetencyChipList({ ids }: { ids: CompetencyId[] }) {
  if (ids.length === 0) {
    return <p className="text-xs text-[var(--angel-muted)] italic">None yet</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <span key={id} className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--angel-paper)] text-[var(--angel-ink)]">
          {COMPETENCIES[id].name}
        </span>
      ))}
    </div>
  );
}

export function DiagnosticOverview({ findings }: { findings: DiagnosticFindings }) {
  const goingWell = [...findings.strengths, ...findings.masteredSkills, ...findings.emergingSkills];
  const toWorkOn = [...findings.developmentAreas, ...findings.lowConfidenceAreas];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--angel-blue)] mb-2">What&apos;s going well</p>
        <CompetencyChipList ids={goingWell} />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--angel-muted)] mb-2">What to work on</p>
        <CompetencyChipList ids={toWorkOn} />
      </div>
    </div>
  );
}
