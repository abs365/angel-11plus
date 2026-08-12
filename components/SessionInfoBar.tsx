import { Clock, Target as TargetIcon } from "lucide-react";
import { StatusIndicator } from "@/components/ui/Progress";
import type { SkillAnalytics, SubjectAnalytics } from "@/types/analytics";

/**
 * Sprint 4 (Learning Experience Transformation) — the Study Sessions
 * requirement, made real: at the entry point of a subject (before a
 * session begins), communicates learning objective, competencies
 * supported, estimated study time, and progress — all from data this
 * codebase already computes. Never shown once an active session/quiz
 * state begins (inserted only in each subject page's own "not yet
 * started" header), so it doesn't compete for attention with the actual
 * retrieval-practice moment (AEP-001 §2.1), consistent with the
 * Manifesto's "carried, not tested" principle.
 */
interface SessionInfoBarProps {
  objective: string;
  estimatedMinutes: number;
  /** Real SkillAnalytics for this subject's group, where one exists (English/Maths/reasoning only, per types/analytics.ts's own SkillAnalytics.group union) — omitted, never fabricated, for subjects without a granular skill breakdown (Vocabulary/Writing). */
  skills?: SkillAnalytics[];
  /** The subject's own real, already-computed analytics row — used for an honest progress signal (avgScore where attempted, an honest "not started" state otherwise). Never a new metric. */
  subjectAnalytics?: SubjectAnalytics;
  /** Sprint 5 (Practice Experience) — "Suggested preparation" text (lib/subjectMeta.ts's SUBJECT_SUGGESTED_PREPARATION). Presentation copy only; omitted where a subject has none defined. */
  preparation?: string;
  /** Sprint 5 — "Expected benefit" text (lib/subjectMeta.ts's SUBJECT_EXPECTED_BENEFIT). Presentation copy only; omitted where a subject has none defined. */
  expectedBenefit?: string;
}

export default function SessionInfoBar({ objective, estimatedMinutes, skills, subjectAnalytics, preparation, expectedBenefit }: SessionInfoBarProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-5">
      <div className="flex items-start gap-2 mb-3">
        <TargetIcon size={14} className="text-indigo-400 dark:text-indigo-500 mt-0.5 shrink-0" />
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{objective}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <Clock size={12} />
          <span>~{estimatedMinutes} min</span>
        </div>
        {subjectAnalytics && subjectAnalytics.attempts > 0 && (
          <>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {subjectAnalytics.attempts} session{subjectAnalytics.attempts === 1 ? "" : "s"} · {subjectAnalytics.avgScore}% average
            </span>
          </>
        )}
      </div>

      {skills && skills.length > 0 ? (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-600 mb-1.5">Competencies in this session</p>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <StatusIndicator
                key={s.skill}
                tone={s.status === "weak" ? "warning" : s.status === "strong" ? "success" : "neutral"}
                label={s.label}
              />
            ))}
          </div>
        </div>
      ) : (
        subjectAnalytics && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {subjectAnalytics.attempts > 0 ? "Whole-subject practice. No individual skill breakdown yet." : "Not started yet."}
          </p>
        )
      )}

      {(preparation || expectedBenefit) && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-1.5">
          {preparation && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-600 dark:text-gray-300">Before you start:</span> {preparation}
            </p>
          )}
          {expectedBenefit && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-600 dark:text-gray-300">Why it matters:</span> {expectedBenefit}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
