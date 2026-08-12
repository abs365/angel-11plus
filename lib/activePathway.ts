import type { Pathway } from "@/types/pathway";
import { PATHWAYS, getPathwayById } from "./pathways";
import { getSelectedPathwayId, setSelectedPathway } from "./progress";
import { syncSelectedPathway } from "./supabaseProgress";

/**
 * Active Pathway Context (ANGEL 11+ ACTIVE PATHWAY CONTEXT AND LEARNER
 * FOCUS TRANSFORMATION). "Core Foundation" and "Not Sure Yet" are
 * legitimate starting states for a family who has not chosen an exam
 * board yet (see lib/pathways.ts's own copy), but they are not
 * examination pathways. Nothing that asserts a real exam target — the
 * top-bar switcher, pathway-aware routing — should ever treat them as one.
 */
export const REAL_PATHWAY_IDS = ["gl", "cem", "csse", "iseb", "independent"] as const;
export type RealPathwayId = (typeof REAL_PATHWAY_IDS)[number];

export function isRealPathway(id: string | undefined): id is RealPathwayId {
  return !!id && (REAL_PATHWAY_IDS as readonly string[]).includes(id);
}

export function getRealPathways(): Pathway[] {
  return PATHWAYS.filter((p) => isRealPathway(p.id));
}

/** The currently active pathway, or undefined if none is set or the current selection is Core Foundation / Not Sure (not a real exam target). */
export function getActivePathway(): Pathway | undefined {
  const id = getSelectedPathwayId();
  return isRealPathway(id) ? getPathwayById(id) : undefined;
}

/**
 * Switches the active pathway. Never touches scores, completedLessons,
 * mockResults, skillScores, or any ALI/Learning Engine field. Those are
 * keyed by subject/competency/lesson id, not by pathway, so existing
 * evidence is preserved automatically by not being part of this write
 * (Section 6 items 1-5). Best-effort server-side mirror, fire-and-forget,
 * same pattern lib/progress.ts's addXP() already uses.
 */
export function switchActivePathway(id: RealPathwayId): void {
  setSelectedPathway(id);
  syncSelectedPathway(id).catch(() => {});
}
