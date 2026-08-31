import { Award, ShieldCheck, HeartHandshake, Sparkles } from "lucide-react";
import { InfoCard } from "@/components/ui/Card";
import { competencyLabel } from "@/lib/ali/labels";
import type { EducationalAuditRecord, ConclusionType } from "@/types/ali/audit";

/**
 * Educational Timeline (Sprint 2, ANGEL-CSSE-002A) — a real chronology of
 * significant educational milestones (Higher-Evidence-Required conclusions:
 * mastery, durable mastery, wellbeing-pacing), sourced from
 * ali_educational_audit via fetchEducationalMilestones(). This is NOT
 * LEARNING_ENGINE_V1.md §3.6's Historical Progress (a tier-over-time trend
 * still has no persistence mechanism) — it is a real, honest log of the
 * moments the Engine itself already treats as milestones, plain-language
 * only, no raw competency/tier codes.
 */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function milestoneText(record: EducationalAuditRecord): string {
  const label = competencyLabel(record.competencyOrDimension);
  switch (record.conclusionType) {
    case "durable-mastery":
      return `Durably mastered ${label}, still solid even after a break`;
    case "mastery":
      return `Mastered ${label}`;
    case "wellbeing-veto":
      return `Took a well-earned pause on ${label}`;
    case "recommendation":
    case "readiness-dimension":
      return `Update recorded for ${label}`;
  }
}

function milestoneIcon(conclusionType: ConclusionType) {
  switch (conclusionType) {
    case "durable-mastery":
      return <ShieldCheck size={16} className="text-blue-500 shrink-0" />;
    case "mastery":
      return <Award size={16} className="text-emerald-500 shrink-0" />;
    case "wellbeing-veto":
      return <HeartHandshake size={16} className="text-amber-500 shrink-0" />;
    default:
      return <Sparkles size={16} className="text-gray-400 shrink-0" />;
  }
}

export function EducationalTimeline({ milestones }: { milestones: EducationalAuditRecord[] }) {
  if (milestones.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
        No milestones recorded yet. This fills in as mastery is reached and confirmed.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {milestones.map((record) => (
        <InfoCard key={record.id} className="flex items-center gap-3">
          {milestoneIcon(record.conclusionType)}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{milestoneText(record)}</p>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{formatDate(record.concludedAt)}</span>
        </InfoCard>
      ))}
    </div>
  );
}
