import { cn } from "@/lib/cn";
import { EVIDENCE_TIER_LABEL, EVIDENCE_TIER_ORDER } from "@/lib/learningEngine/types";
import type { EvidenceSignal, EvidenceTier } from "@/lib/learningEngine/types";

/**
 * Renders an Evidence Tier as a discrete 5-step indicator — deliberately
 * NOT a percentage bar. LEARNING_ENGINE_V1.md §3.3 defines ET-0..ET-4 as a
 * categorical scale, not a continuous quantity, and the mission for this
 * feature explicitly forbids "arbitrary percentages" — a filled-bar-by-%
 * treatment would misrepresent a 5-step category as measured precision it
 * does not have. Each step is filled up to (and including) the tier
 * reached; the label is always shown alongside, never colour/shape alone
 * (matching this codebase's existing accessibility rule for StatusIndicator,
 * components/ui/Progress.tsx).
 */
export function EvidenceTierBadge({ tier, className }: { tier: EvidenceTier; className?: string }) {
  const reachedIndex = EVIDENCE_TIER_ORDER.indexOf(tier);
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className="flex items-center gap-0.5" role="img" aria-label={`Evidence tier: ${EVIDENCE_TIER_LABEL[tier]}`}>
        {EVIDENCE_TIER_ORDER.map((step, i) => (
          <span
            key={step}
            className={cn(
              "w-2.5 h-2.5 rounded-sm",
              i <= reachedIndex && i > 0 ? "bg-purple-500 dark:bg-purple-400" : "bg-gray-200 dark:bg-gray-700"
            )}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{EVIDENCE_TIER_LABEL[tier]}</span>
    </div>
  );
}

const SIGNAL_TONE: Record<EvidenceSignal, "success" | "warning" | "info" | "neutral"> = {
  Demonstrated: "success",
  Developing: "info",
  "Not Yet Demonstrated": "warning",
  "Not Yet Observed": "neutral",
};

export function evidenceSignalTone(signal: EvidenceSignal) {
  return SIGNAL_TONE[signal];
}
