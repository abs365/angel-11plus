import { InfoCard } from "@/components/ui/Card";
import { StatusIndicator } from "@/components/ui/Progress";
import { COMPETENCIES, ALL_ASSESSMENT_COMPONENTS, QUESTION_TYPE_PRIMARY_COMPETENCY } from "@/lib/learningEngine/assessmentBrainMap";
import type { CompetencyStatus } from "@/lib/learningEngine/types";

/**
 * Feature 3 — Evidence Profile (LEARNING_ENGINE_V1.md §3.1 Question Type
 * Exposure + §3.4 Assessment Coverage). This is the raw layer, one level
 * below Competency Profile's rolled-up view: which of the 27 Question
 * Types has Angel's own content bank authored anything for at all, and
 * which has the learner actually attempted. Both facts are shown — content
 * existing and learner exposure are different, and conflating "no content
 * yet" with "learner hasn't tried" would misrepresent which one applies
 * (a real, current-state distinction, not a hypothetical).
 */
export function EvidenceProfile({ competencies }: { competencies: CompetencyStatus[] }) {
  const allExposures = competencies.flatMap((c) => c.mappedQuestionTypes);
  const totalQuestionTypes = Object.keys(QUESTION_TYPE_PRIMARY_COMPETENCY).length;
  const withContent = allExposures.filter((e) => e.contentExists).length;
  const withAttempts = allExposures.filter((e) => e.timesSeen > 0).length;

  return (
    <div className="space-y-4">
      <InfoCard className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Assessment Coverage</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {withContent} of {totalQuestionTypes} Question Types have content authored · {withAttempts} attempted
          </p>
        </div>
        {withContent === 0 && <StatusIndicator tone="neutral" label="No content authored yet" />}
      </InfoCard>

      {ALL_ASSESSMENT_COMPONENTS.map((component) => {
        const compIds = Object.keys(COMPETENCIES).filter(
          (id) => COMPETENCIES[id as keyof typeof COMPETENCIES].component === component
        );
        const exposures = competencies
          .filter((c) => compIds.includes(c.competencyId))
          .flatMap((c) => c.mappedQuestionTypes);
        if (exposures.length === 0) return null;

        return (
          <div key={component}>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">{component}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {exposures.map((e) => (
                <InfoCard key={e.questionTypeId} className="py-2.5 px-3">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{e.questionTypeId}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                    {e.contentExists ? `${e.timesSeen} attempt${e.timesSeen === 1 ? "" : "s"}` : "No content yet"}
                  </p>
                </InfoCard>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
