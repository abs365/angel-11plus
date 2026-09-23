import { COMPETENCIES } from "@/lib/learningEngine/assessmentBrainMap";
import type { Recommendation, RecommendationCategory } from "@/lib/learningEngine/types";

/**
 * Feature 6 — Recommendation Summary (LEARNING_ENGINE_V1.md §7).
 *
 * Increment 3 (Progress + Results + Parent Dashboard) — also rendered on
 * the accepted, frozen Practice results screen; export signature
 * unchanged (`{ recommendations: Recommendation[] }`). The prior version
 * showed a coloured icon tile per recommendation category (Practice/
 * Consolidation/Revision/Extension/Review) with the title formatted as
 * "{Category} · {Skill}" — internal recommendation-engine taxonomy
 * exposed as the headline, and per-category colour tiles the governing
 * design standard rules out. "Angel recommends, family chooses": each
 * recommendation now reads as a plain next step ("Practise {skill}") with
 * its own real reason underneath, matching the instruction's own example
 * ("Practise percentages" / "Recent work suggests this skill needs more
 * independent practice") — same real category/competency/reason data,
 * fixed display order preserved (a presentation choice, never a priority
 * ranking, per the original file's own rule), just not shown as the
 * headline any more.
 */
const CATEGORY_VERB: Record<RecommendationCategory, string> = {
  Practice: "Practise",
  Consolidation: "Keep building",
  Revision: "Revisit",
  Extension: "Try extending",
  Review: "Review",
};

const DISPLAY_ORDER: RecommendationCategory[] = ["Revision", "Practice", "Consolidation", "Extension", "Review"];

export function RecommendationSummary({ recommendations }: { recommendations: Recommendation[] }) {
  if (recommendations.length === 0) {
    return (
      <p className="text-sm text-[var(--angel-muted)] italic">
        No recommendations yet. These are generated once there is recorded evidence to respond to.
      </p>
    );
  }

  return (
    <div className="divide-y divide-[var(--angel-border)]">
      {DISPLAY_ORDER.flatMap((category) => {
        const items = recommendations.filter((r) => r.category === category);
        return items.map((r) => (
          <div key={`${r.category}-${r.competencyId}`} className="py-4 first:pt-0">
            <p className="text-sm font-semibold text-[var(--angel-navy)]">
              {CATEGORY_VERB[r.category]} {COMPETENCIES[r.competencyId].name}
            </p>
            <p className="text-sm text-[var(--angel-ink)] leading-relaxed mt-0.5 opacity-90">{r.reason}</p>
          </div>
        ));
      })}
    </div>
  );
}
