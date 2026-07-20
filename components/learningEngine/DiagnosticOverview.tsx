import { Award, TrendingUp, Sprout, AlertCircle, HelpCircle } from "lucide-react";
import { InfoCard } from "@/components/ui/Card";
import { COMPETENCIES } from "@/lib/learningEngine/assessmentBrainMap";
import type { CompetencyId, DiagnosticFindings } from "@/lib/learningEngine/types";

/**
 * Feature 4 — Diagnostic Overview (LEARNING_ENGINE_V1.md §4). Renders the
 * five named categories exactly as computed by lib/learningEngine/
 * diagnostics.ts, plus the "not yet evidenced" coverage list — kept
 * visually separate from the five diagnostic categories, never merged into
 * Development Areas, per §4's explicit rule that absence of evidence is
 * not itself a finding.
 */
const SECTIONS: { key: keyof DiagnosticFindings; label: string; icon: typeof Award; iconTone: string; bgTone: string }[] = [
  { key: "strengths", label: "Strengths", icon: Award, iconTone: "text-emerald-600 dark:text-emerald-400", bgTone: "bg-emerald-50 dark:bg-emerald-950" },
  { key: "masteredSkills", label: "Mastered Skills", icon: TrendingUp, iconTone: "text-purple-600 dark:text-purple-400", bgTone: "bg-purple-50 dark:bg-purple-950" },
  { key: "emergingSkills", label: "Emerging Skills", icon: Sprout, iconTone: "text-sky-600 dark:text-sky-400", bgTone: "bg-sky-50 dark:bg-sky-950" },
  { key: "developmentAreas", label: "Development Areas", icon: AlertCircle, iconTone: "text-amber-600 dark:text-amber-400", bgTone: "bg-amber-50 dark:bg-amber-950" },
  { key: "lowConfidenceAreas", label: "Low Confidence Areas", icon: HelpCircle, iconTone: "text-gray-600 dark:text-gray-400", bgTone: "bg-gray-100 dark:bg-gray-800" },
];

function CompetencyChipList({ ids }: { ids: CompetencyId[] }) {
  if (ids.length === 0) {
    return <p className="text-xs text-gray-400 dark:text-gray-500 italic">None yet</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <span key={id} className="text-xs font-medium px-2 py-1 rounded-lg bg-white/70 dark:bg-black/20">
          {COMPETENCIES[id].name}
        </span>
      ))}
    </div>
  );
}

export function DiagnosticOverview({ findings }: { findings: DiagnosticFindings }) {
  return (
    <div className="space-y-3">
      {SECTIONS.map(({ key, label, icon: Icon, iconTone, bgTone }) => (
        <InfoCard key={key} className={bgTone}>
          <div className="flex items-center gap-2 mb-2">
            <Icon size={16} className={iconTone} />
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
          </div>
          <CompetencyChipList ids={findings[key] as CompetencyId[]} />
        </InfoCard>
      ))}

      {findings.notYetEvidenced.length > 0 && (
        <InfoCard className="border-dashed">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Not Yet Evidenced (coverage gap, not a finding)</p>
          <CompetencyChipList ids={findings.notYetEvidenced} />
        </InfoCard>
      )}
    </div>
  );
}
