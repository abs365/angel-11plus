import { CheckCircle2, XCircle, Circle } from "lucide-react";
import type { RecentActivityItem } from "@/lib/learningEngine/activity";

/**
 * Feature — Recent Learning Activity (Capability 3, Wave 3). A raw,
 * timestamped log of real recorded attempts — NOT a re-implementation of
 * LEARNING_ENGINE_V1.md §3.6 Historical Progress (which would require
 * point-in-time snapshots of computed Evidence Tier/Signal that no
 * persistence mechanism exists for yet). Every field here is a fact
 * already stored on ali_student_question_history — no interpretation is
 * added.
 *
 * Increment 3 — the raw Question Type ID (e.g. "QT-RC-03") used to render
 * in the subtitle for any caller that omitted the `plainLanguage` prop.
 * Confirmed by tracing every real call site: none ever omits it — this
 * was dead code, not a real learner-facing choice, and it directly
 * violated the Non-Negotiable Product Principle ("avoid... question-
 * family IDs... unless genuine educational reason") for whichever future
 * caller might have relied on the default. Removed outright: this
 * component now always speaks in plain language, for every caller.
 */
function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function RecentActivity({ items }: { items: RecentActivityItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--angel-muted)] italic">
        No practice activity recorded yet. This fills in as you complete practice sessions.
      </p>
    );
  }

  return (
    <div className="divide-y divide-[var(--angel-border)]">
      {items.map((item, i) => (
        <div key={`${item.questionTypeId}-${item.updatedAt}-${i}`} className="flex items-center justify-between gap-3 py-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            {item.lastAttemptCorrect === true && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
            {item.lastAttemptCorrect === false && <XCircle size={16} className="text-amber-500 shrink-0" />}
            {item.lastAttemptCorrect === null && <Circle size={16} className="text-[var(--angel-muted)] shrink-0" />}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--angel-navy)] truncate">{item.competencyName}</p>
              <p className="text-[11px] text-[var(--angel-muted)]">
                {item.timesSeen} attempt{item.timesSeen === 1 ? "" : "s"} total
              </p>
            </div>
          </div>
          <span className="text-xs text-[var(--angel-muted)] shrink-0">{timeAgo(item.updatedAt)}</span>
        </div>
      ))}
    </div>
  );
}
