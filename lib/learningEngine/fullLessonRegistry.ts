import type { CompetencyId } from "./types";

/**
 * Programme Increment 020, Part "Preparation Decision Follow-up" — the one
 * canonical registry of which competencies currently have a complete Learn
 * lesson page (EXPLAIN -> MODEL -> GUIDED -> INDEPENDENT -> TRANSFER).
 *
 * Increment 020 found that `buildPreparationDecision`'s own
 * `hasFullLessonAvailable` callback (lib/learningEngine/preparationDecision.ts)
 * had never been supplied by any real caller before this increment's own
 * dashboard fix — it silently defaulted to "no lesson exists for any
 * competency," so a real lesson could never be recommended even when one
 * existed. That fix introduced a second real risk this module exists to
 * close: without ONE shared registry, every future caller (dashboard,
 * Learn hub, a future Mock-readiness page, ...) would need its own
 * hand-maintained set, and those sets could silently drift apart the
 * moment a new lesson shipped and only one page's copy got updated.
 *
 * This is deliberately still a plain source-level map, not derived from a
 * route/filesystem scan — Next.js route discovery at runtime would be a
 * materially larger change for a 3-entry table, and the actual manual step
 * (adding one line here) is the same size either way. What this module
 * fixes is having exactly ONE such line to add, not one per caller.
 */
export const FULL_LESSON_ROUTE: Partial<Record<CompetencyId, string>> = {
  "MR-01": "/learning-intelligence/learn/mathematics/arithmetic",
  "MR-04": "/learning-intelligence/learn/mathematics/percentages",
  "MR-03": "/learning-intelligence/learn/mathematics/compound-shapes",
  // Programme Increment 022 — Angel's first English Reading full lesson
  // (RC-01, Literal Retrieval). This is the first entry whose competency
  // is not Mathematics -- see practice/[area]/page.tsx's own
  // subject-matching guard around this registry, added at the same time,
  // which stops a recommendation for one subject's competency ever
  // silently redirecting a learner who is practising a different subject.
  "RC-01": "/learning-intelligence/learn/english/reading-retrieval",
};

export function hasFullLessonAvailable(competencyId: CompetencyId): boolean {
  return competencyId in FULL_LESSON_ROUTE;
}
