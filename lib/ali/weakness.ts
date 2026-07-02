import type { BankQuestion, CompetencyCode } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";

/**
 * Derives weak competencies natively from ALI's own history data — a
 * competency is weak if any question within it currently has
 * mastery_state === 'weak' (lib/ali/mastery.ts).
 *
 * Deliberately does NOT use the existing buildReplayQueue()/report.skills
 * signal (lib/replayEngine.ts): that operates on the app's coarse SkillType,
 * which is uniformly "verbal-reasoning" for every VR question (ALI_DECISION_
 * LOG.md Decision 13) and cannot distinguish weak competencies from strong
 * ones. ALI computes its own fine-grained weak-competency signal instead.
 */
export function deriveWeakCompetencies(
  bank: BankQuestion[],
  history: Map<string, StudentQuestionHistoryRow>
): Set<CompetencyCode> {
  const weak = new Set<CompetencyCode>();
  for (const q of bank) {
    if (history.get(q.id)?.masteryState === "weak") {
      weak.add(q.skill);
    }
  }
  return weak;
}
