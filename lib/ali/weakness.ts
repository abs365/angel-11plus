import type { BankQuestion, CompetencyCode } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";
import type { AliCompetencySignal } from "@/types/ali/missionSignal";

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

/**
 * Derives the full competency-level signal bridged into UserProgress
 * (Phase ALI 1.3 — lib/progress.ts's recordAliCompetencySignal()), consumed
 * by lib/adaptiveEngine.ts's Daily Mission prioritisation. Pure, no I/O.
 *
 * A competency is `mastered` when every attempted question within it is
 * currently mastered (a partial mix of mastered/weak/learning within one
 * competency is not counted as mastered — the competency as a whole isn't
 * safe yet). `attemptedCompetencies` is the denominator Daily Missions uses
 * for a mastery-ratio-based urgency band (ALI_LEARNING_MODEL.md §4.2) — it
 * excludes competencies with zero attempted questions entirely.
 *
 * `previousSignal` (Phase ALI 1.4, optional) is the last cached signal for
 * this subject, if any — used only to compute `recentlyMasteredCompetencies`
 * as the set-difference against the new `masteredCompetencies` (competencies
 * that became mastered as of this call). Passing it in keeps this function
 * pure — no hidden state, no timestamp-window heuristics.
 */
export function deriveCompetencySignal(
  bank: BankQuestion[],
  history: Map<string, StudentQuestionHistoryRow>,
  subject: string,
  previousSignal?: AliCompetencySignal
): AliCompetencySignal {
  const byCompetency = new Map<CompetencyCode, { attempted: number; mastered: number }>();
  for (const q of bank) {
    const row = history.get(q.id);
    if (!row || row.timesSeen === 0) continue;
    const entry = byCompetency.get(q.skill) ?? { attempted: 0, mastered: 0 };
    entry.attempted += 1;
    if (row.masteryState === "mastered") entry.mastered += 1;
    byCompetency.set(q.skill, entry);
  }

  const attemptedCompetencies = [...byCompetency.keys()];
  const masteredCompetencies = attemptedCompetencies.filter(
    (c) => byCompetency.get(c)!.mastered === byCompetency.get(c)!.attempted
  );
  const weakCompetencies = [...deriveWeakCompetencies(bank, history)];

  const previouslyMastered = new Set(previousSignal?.masteredCompetencies ?? []);
  const recentlyMasteredCompetencies = masteredCompetencies.filter((c) => !previouslyMastered.has(c));

  return {
    subject,
    weakCompetencies,
    masteredCompetencies,
    attemptedCompetencies,
    recentlyMasteredCompetencies,
    updatedAt: new Date().toISOString(),
  };
}
