import { CheckCircle2, XCircle, Circle } from "lucide-react";
import { InfoCard } from "@/components/ui/Card";
import type { RecentActivityItem } from "@/lib/learningEngine/activity";

/**
 * Feature — Recent Learning Activity (Capability 3, Wave 3). A raw,
 * timestamped log of real recorded attempts — NOT a re-implementation of
 * LEARNING_ENGINE_V1.md §3.6 Historical Progress (which would require
 * point-in-time snapshots of computed Evidence Tier/Signal that no
 * persistence mechanism exists for yet). Every field here is a fact
 * already stored on ali_student_question_history — no interpretation is
 * added.
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

/**
 * `plainLanguage` (Wave 3 Parent Dashboard reuse) suppresses the raw
 * Question Type ID (e.g. "QT-RC-03") from the subtitle — LEARNING_ENGINE_V1.md
 * §8 requires parent-facing use to stay in "plain-language terms rather
 * than raw Signal/Tier codes"; the learner-facing dashboard keeps the code
 * visible (Wave 1's own design choice, unchanged here).
 */
export function RecentActivity({ items, plainLanguage = false }: { items: RecentActivityItem[]; plainLanguage?: boolean }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
        No practice activity recorded yet. This fills in as you complete practice sessions.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <InfoCard key={`${item.questionTypeId}-${item.updatedAt}-${i}`} className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            {item.lastAttemptCorrect === true && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
            {item.lastAttemptCorrect === false && <XCircle size={16} className="text-amber-500 shrink-0" />}
            {item.lastAttemptCorrect === null && <Circle size={16} className="text-gray-300 dark:text-gray-600 shrink-0" />}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{item.competencyName}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                {plainLanguage ? "" : `${item.questionTypeId} · `}
                {item.timesSeen} attempt{item.timesSeen === 1 ? "" : "s"} total
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{timeAgo(item.updatedAt)}</span>
        </InfoCard>
      ))}
    </div>
  );
}
