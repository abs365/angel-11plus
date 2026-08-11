import { Dumbbell, Layers, RotateCcw, ArrowUpRight, RefreshCw } from "lucide-react";
import { RecommendationCard } from "@/components/ui/Card";
import { COMPETENCIES } from "@/lib/learningEngine/assessmentBrainMap";
import type { Recommendation, RecommendationCategory } from "@/lib/learningEngine/types";

/**
 * Feature 6 — Recommendation Summary (LEARNING_ENGINE_V1.md §7). Renders
 * categories only, in a fixed display order for readability — this fixed
 * order is a presentation choice, not a priority ranking, and callers must
 * not treat it as one (§7/§9: no selection or prioritisation logic).
 * Reuses the existing RecommendationCard component (components/ui/Card.tsx)
 * directly rather than a new card treatment.
 */
const CATEGORY_ICON: Record<RecommendationCategory, typeof Dumbbell> = {
  Practice: Dumbbell,
  Consolidation: Layers,
  Revision: RotateCcw,
  Extension: ArrowUpRight,
  Review: RefreshCw,
};

const CATEGORY_COLOR: Record<RecommendationCategory, "purple" | "emerald" | "blue" | "amber"> = {
  Practice: "blue",
  Consolidation: "purple",
  Revision: "amber",
  Extension: "emerald",
  Review: "blue",
};

const DISPLAY_ORDER: RecommendationCategory[] = ["Revision", "Practice", "Consolidation", "Extension", "Review"];

export function RecommendationSummary({ recommendations }: { recommendations: Recommendation[] }) {
  if (recommendations.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
        No recommendations yet. These are generated once there is recorded evidence to respond to.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {DISPLAY_ORDER.flatMap((category) => {
        const items = recommendations.filter((r) => r.category === category);
        return items.map((r) => (
          <RecommendationCard
            key={`${r.category}-${r.competencyId}`}
            icon={CATEGORY_ICON[r.category]}
            title={`${r.category} · ${COMPETENCIES[r.competencyId].name}`}
            reason={r.reason}
            color={CATEGORY_COLOR[r.category]}
          />
        ));
      })}
    </div>
  );
}
