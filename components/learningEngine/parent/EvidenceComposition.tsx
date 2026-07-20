import { InfoCard } from "@/components/ui/Card";
import { EVIDENCE_TIER_LABEL, EVIDENCE_TIER_ORDER } from "@/lib/learningEngine/types";
import type { CompetencyStatus } from "@/lib/learningEngine/types";

/**
 * Parent Dashboard's "Evidence Growth" section (Capability 3, Wave 3) —
 * deliberately named "Evidence Composition" in the UI, not "Growth."
 *
 * A true growth/trend view (e.g. "3 competencies moved up a tier this
 * month") requires LEARNING_ENGINE_V1.md §3.6 Historical Progress —
 * point-in-time snapshots of computed state — which has no persistence
 * mechanism built (Wave 1 §10(1), reaffirmed throughout Wave 2/3). Showing
 * a trend without real historical data to support it would be exactly the
 * "unsupported educational claim" this Wave's mission forbids.
 *
 * What IS honestly supportable today: the current distribution of
 * competencies across evidence tiers, computed from data already in
 * profile.competencies (no new calculation, pure counting/grouping for
 * display). The explicit disclosure below is the point, not an
 * afterthought.
 */
export function EvidenceComposition({ competencies }: { competencies: CompetencyStatus[] }) {
  const counts = EVIDENCE_TIER_ORDER.map((tier) => ({
    tier,
    label: EVIDENCE_TIER_LABEL[tier],
    count: competencies.filter((c) => c.tier === tier).length,
  }));
  const total = competencies.length || 1;

  return (
    <InfoCard>
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Evidence Composition (today)</p>
      <div className="space-y-1.5 mt-3">
        {counts.map(({ tier, label, count }) => (
          <div key={tier} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-24 shrink-0">{label}</span>
            <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div className="h-full bg-purple-500 dark:bg-purple-400" style={{ width: `${(count / total) * 100}%` }} />
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 w-6 text-right shrink-0">{count}</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3 leading-relaxed">
        This is today&apos;s snapshot, not a trend over time — Angel does not yet keep a history of how this changes
        week to week, so we&apos;re not showing a growth line until that can be shown honestly.
      </p>
    </InfoCard>
  );
}
