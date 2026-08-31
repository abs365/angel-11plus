import { Award, ShieldCheck, HeartHandshake, Sparkles } from "lucide-react";
import { InfoCard } from "@/components/ui/Card";
import { competencyLabel } from "@/lib/ali/labels";
import type { EducationalAuditRecord, ConclusionType } from "@/types/ali/audit";

/**
 * Readiness Evidence Timeline (Sprint 5, WP5B). Reuses the exact same real
 * data as components/learningEngine/EducationalTimeline.tsx
 * (ali_educational_audit via fetchEducationalMilestones(), unchanged) —
 * this is a richer per-entry presentation of the same real records, not a
 * new data source or a new calculation. Built as its own component rather
 * than modifying EducationalTimeline, so the simpler existing timeline
 * (used elsewhere) is unaffected.
 *
 * Every entry is split into exactly three labelled parts, per this
 * sprint's explicit requirement:
 *   - Observed Evidence: a plain restatement of the record's own real
 *     fields (competency, conclusion, date) — nothing beyond what
 *     ali_educational_audit actually stored for that row.
 *   - Educational Interpretation: what that conclusion means, in the same
 *     plain-language register EducationalTimeline already established.
 *   - Recommended Next Action: the REAL, already-built mechanism that
 *     conclusion type triggers (e.g. Durable Mastery's Maintenance Review),
 *     described generically — never a re-run of the live Recommendation
 *     Engine for a past event, which would misrepresent a historical
 *     record as a current, active recommendation.
 *
 * Ordered oldest-first (a presentational reversal of
 * fetchEducationalMilestones()'s newest-first fetch, not a new query) so
 * the page reads as a forward-moving story of real evidence, per this
 * sprint's "chronological, easy to understand" requirement.
 */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function observedEvidence(record: EducationalAuditRecord): string {
  const label = competencyLabel(record.competencyOrDimension);
  switch (record.conclusionType) {
    case "mastery":
      return `On ${formatDate(record.concludedAt)}, your child's evidence in ${label} was strong enough to confirm mastery.`;
    case "durable-mastery":
      return `On ${formatDate(record.concludedAt)}, ${label} was checked again after a genuine gap, and still held.`;
    case "wellbeing-veto":
      return `On ${formatDate(record.concludedAt)}, Angel noticed signs of strain around ${label} and paused practice there.`;
    case "recommendation":
    case "readiness-dimension":
      return `On ${formatDate(record.concludedAt)}, an update was recorded for ${label}.`;
  }
}

function educationalInterpretation(conclusionType: ConclusionType): string {
  switch (conclusionType) {
    case "mastery":
      return "This means Angel now trusts this is a skill your child can rely on. It's not a one-off correct answer, but a real, repeated pattern.";
    case "durable-mastery":
      return "This is the strongest evidence Angel produces: the skill survived a real time gap, not just the sessions where it was first learned.";
    case "wellbeing-veto":
      return "This means the pattern of recent attempts suggested a short break would help more than more practice right then.";
    case "recommendation":
    case "readiness-dimension":
      return "This reflects a change in Angel's evidence for this area.";
  }
}

function recommendedNextAction(conclusionType: ConclusionType): string {
  switch (conclusionType) {
    case "mastery":
      return "No action needed. Angel will check back in after a natural gap to confirm this stays solid.";
    case "durable-mastery":
      return "No action needed. This is now considered durably held.";
    case "wellbeing-veto":
      return "No action needed. Angel already adjusted the pace here.";
    case "recommendation":
    case "readiness-dimension":
      return "See Recommended Next Action above for what's current right now.";
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

export function ReadinessEvidenceTimeline({ milestones }: { milestones: EducationalAuditRecord[] }) {
  if (milestones.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
        No readiness milestones recorded yet. This fills in as your child&apos;s evidence grows.
      </p>
    );
  }

  const chronological = [...milestones].sort(
    (a, b) => new Date(a.concludedAt).getTime() - new Date(b.concludedAt).getTime()
  );

  return (
    <div className="space-y-3">
      {chronological.map((record) => (
        <InfoCard key={record.id} className="flex items-start gap-3">
          <div className="mt-0.5">{milestoneIcon(record.conclusionType)}</div>
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Observed Evidence</p>
              <p className="text-sm text-gray-900 dark:text-gray-100">{observedEvidence(record)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Educational Interpretation</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{educationalInterpretation(record.conclusionType)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Recommended Next Action</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{recommendedNextAction(record.conclusionType)}</p>
            </div>
          </div>
        </InfoCard>
      ))}
    </div>
  );
}
