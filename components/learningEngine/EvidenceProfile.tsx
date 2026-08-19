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
/**
 * WP5G (Sprint 5 Completion Package, Finding #2) — each card previously
 * rendered the raw QuestionTypeId ("QT-RC-01"); the WP4A comment here had
 * claimed this was already fixed via QUESTION_TYPE_PRIMARY_COMPETENCY, but
 * that import was only ever used to compute the header count, never to
 * resolve a per-card label. Cards are now labelled with the owning
 * competency's real name via QUESTION_TYPE_PRIMARY_COMPETENCY/COMPETENCIES
 * — several sibling cards sharing one label is expected and honest (distinct
 * content items testing the same named skill), not a display bug.
 */
export function EvidenceProfile({ competencies }: { competencies: CompetencyStatus[] }) {
  const allExposures = competencies.flatMap((c) => c.mappedQuestionTypes);
  const totalQuestionTypes = Object.keys(QUESTION_TYPE_PRIMARY_COMPETENCY).length;
  const withContent = allExposures.filter((e) => e.contentExists).length;
  const withAttempts = allExposures.filter((e) => e.timesSeen > 0).length;

  return (
    <div className="space-y-4">
      {/* Stage 2 Educational Integrity Correction (Part 11) — platform
          content availability and the learner's own attempted count were
          previously one line joined by a mid-dot, which a reasonable
          parent could read as "my child has covered 25 of 27 assessment
          types." Split into two clearly separate, separately labelled
          facts — same underlying data (withContent/withAttempts), no
          model change — so platform coverage can never be mistaken for
          learner achievement. */}
      <InfoCard className="flex items-center justify-between flex-wrap gap-2">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Assessment Coverage</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Platform content available: {withContent} of {totalQuestionTypes} question types
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Your child has attempted: {withAttempts} question types
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
              {exposures.map((e) => {
                const owningCompetencyId = QUESTION_TYPE_PRIMARY_COMPETENCY[e.questionTypeId];
                const label = owningCompetencyId ? COMPETENCIES[owningCompetencyId].name : e.questionTypeId;
                return (
                  <InfoCard key={e.questionTypeId} className="py-2.5 px-3">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{label}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                      {e.contentExists ? `${e.timesSeen} attempt${e.timesSeen === 1 ? "" : "s"}` : "No content yet"}
                    </p>
                  </InfoCard>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
