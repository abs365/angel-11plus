import { Info, AlertTriangle } from "lucide-react";
import { InfoCard } from "@/components/ui/Card";
import {
  CSSE_ADMISSIONS_CONTEXT_FACT,
  CSSE_ADMISSIONS_CONTEXT_RELEVANCE,
  CSSE_ADMISSIONS_CONTEXT_DISCLAIMER,
  CSSE_ADMISSIONS_CONTEXT_SOURCE,
} from "@/lib/learningEngine/admissionsContext";

/**
 * Historical Context (Sprint 5, WP5E). The one reusable rendering of the
 * one real admissions fact this platform holds — used everywhere that fact
 * is shown, so the label, structure, and wording are identical on every
 * page, not re-typed per caller. No calculation, no prediction: every
 * string comes from lib/learningEngine/admissionsContext.ts, unmodified.
 *
 * Four visually distinct parts, matching this sprint's four requirements
 * exactly (not merged into one paragraph a reader could skim past):
 *   1. A consistent "Historical Context" label — every occurrence.
 *   2. The fact itself.
 *   3. Why it's relevant here.
 *   4. What it explicitly does NOT imply — its own bordered callout, not
 *      buried in the same sentence as the fact.
 *
 * Governing rule (EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md §10): this panel
 * must always be rendered as its own section, never inside a Readiness or
 * Evidence component's own markup — visual and conceptual independence is
 * enforced by this component only ever being a sibling, never a child, of
 * those components. No caller should pass Readiness/Evidence data into
 * this component; it intentionally takes no props, so there is nothing to
 * blend.
 */
export function HistoricalContextPanel() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg">Historical Context</h2>
        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
          Not your child&apos;s evidence
        </span>
      </div>

      <InfoCard className="flex items-start gap-3">
        <Info size={16} className="text-gray-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{CSSE_ADMISSIONS_CONTEXT_FACT}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{CSSE_ADMISSIONS_CONTEXT_RELEVANCE}</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">{CSSE_ADMISSIONS_CONTEXT_SOURCE}</p>
        </div>
      </InfoCard>

      <InfoCard className="flex items-start gap-3 mt-2 border-amber-100 dark:border-amber-900">
        <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">What this does not mean</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{CSSE_ADMISSIONS_CONTEXT_DISCLAIMER}</p>
        </div>
      </InfoCard>
    </section>
  );
}
