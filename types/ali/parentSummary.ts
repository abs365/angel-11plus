/**
 * Parent-facing, competency-first summary (Phase ALI 1.4). Replaces
 * percentage-first messaging for subjects with real ALI competency data —
 * see lib/parentInsights.ts's buildCompetencySummaries().
 */
export interface CompetencySummaryItem {
  /** Raw competency code, e.g. "vr.letter-codes" — internal, not shown to parents. */
  code: string;
  /** Parent-friendly name, e.g. "Letter Codes". */
  label: string;
}

export interface CompetencyParentSummary {
  subject: string; // e.g. "verbal-reasoning"
  subjectLabel: string; // e.g. "Verbal Reasoning"
  strengths: CompetencySummaryItem[];
  improving: CompetencySummaryItem[];
  focusNext: CompetencySummaryItem[];
  recentlyMastered: CompetencySummaryItem[];
}
