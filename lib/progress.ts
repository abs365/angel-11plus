"use client";

import type { UserProgress, SkillType } from "@/types";
import { syncLessonComplete, syncFullProgress, subjectFromLessonId } from "./supabaseProgress";
import { getMondayOfWeek } from "./gamification";

const KEY = "angel11plus_progress";

const defaultProgress: UserProgress = {
  xp: 0,
  streak: 1,
  completedLessons: [],
  scores: {},
  lastActivity: new Date().toISOString(),
};

export function getProgress(): UserProgress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return defaultProgress;
    return JSON.parse(stored) as UserProgress;
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(progress));
}

export function addXP(amount: number): UserProgress {
  const p = getProgress();
  const updated = { ...p, xp: p.xp + amount, lastActivity: new Date().toISOString() };
  saveProgress(updated);
  // Fire-and-forget sync — never awaited, never blocks UI
  syncFullProgress(updated).catch(() => {});
  return updated;
}

export function recordSkillResult(skill: SkillType, isCorrect: boolean): void {
  const p = getProgress();
  const prev = p.skillScores?.[skill] ?? { correct: 0, attempted: 0 };
  const updated: UserProgress = {
    ...p,
    skillScores: {
      ...p.skillScores,
      [skill]: {
        correct: prev.correct + (isCorrect ? 1 : 0),
        attempted: prev.attempted + 1,
      },
    },
  };
  saveProgress(updated);
}

export function completeLesson(lessonId: string, score: number, xpGained: number): UserProgress {
  const p = getProgress();
  const weekStart = getMondayOfWeek(new Date());
  const weeklyStats =
    p.weeklyStats?.weekStart === weekStart
      ? { weekStart, sessions: p.weeklyStats.sessions + 1 }
      : { weekStart, sessions: 1 };

  const updated: UserProgress = {
    ...p,
    xp: p.xp + xpGained,
    completedLessons: p.completedLessons.includes(lessonId)
      ? p.completedLessons
      : [...p.completedLessons, lessonId],
    scores: { ...p.scores, [lessonId]: Math.max(p.scores[lessonId] ?? 0, score) },
    lastActivity: new Date().toISOString(),
    weeklyStats,
  };
  saveProgress(updated);
  // Fire-and-forget sync — never awaited, never blocks UI
  const subject = subjectFromLessonId(lessonId);
  syncLessonComplete(lessonId, subject, score, xpGained, updated).catch(() => {});
  return updated;
}

export function markBadgesSeen(newIds: string[]): void {
  const p = getProgress();
  saveProgress({ ...p, earnedBadgeIds: [...(p.earnedBadgeIds ?? []), ...newIds] });
}

/**
 * Bridges an ALI competency-level signal into UserProgress (Phase ALI 1.3)
 * so lib/adaptiveEngine.ts's Daily Mission prioritisation can read it
 * synchronously without a Supabase round-trip. Purely additive — does not
 * touch `scores`/`skillScores` or the Math.max ratchet behaviour (left
 * unchanged per this phase's explicit safety instruction; see
 * ALI_DECISION_LOG.md Decision 24 and ALI_LEARNING_MODEL.md §2.2).
 */
export function recordAliCompetencySignal(
  subject: string,
  signal: import("@/types/ali/missionSignal").AliCompetencySignal
): void {
  const p = getProgress();
  saveProgress({
    ...p,
    aliCompetencySignal: { ...p.aliCompetencySignal, [subject]: signal },
  });
}

/**
 * Bridges an internal-only ALI Learning Gain snapshot into UserProgress
 * (Phase ALI 1.4). Not read by any UI in this phase — see
 * types/ali/learningGain.ts. Purely additive.
 */
export function recordAliLearningGain(
  subject: string,
  snapshot: import("@/types/ali/learningGain").LearningGainSnapshot
): void {
  const p = getProgress();
  saveProgress({
    ...p,
    aliLearningGain: { ...p.aliLearningGain, [subject]: snapshot },
  });
}

/**
 * Bridges the internal-only Learning Profile (Foundation Completion, Part
 * 3) into UserProgress. Not read by any UI yet — see
 * types/ali/learningProfile.ts and LEARNING_PROFILE_MODEL.md. Purely
 * additive, recomputed from data already bridged (aliCompetencySignal/
 * aliLearningGain), not a new source of truth.
 */
export function recordAliLearningProfile(
  profile: import("@/types/ali/learningProfile").LearningProfile
): void {
  const p = getProgress();
  saveProgress({ ...p, aliLearningProfile: profile });
}

export function setSelectedPathway(id: string): void {
  const p = getProgress();
  saveProgress({ ...p, selectedPathwayId: id });
}

export function getSelectedPathwayId(): string | undefined {
  return getProgress().selectedPathwayId;
}

/**
 * Work Package WP-09 — target exam date validation (EAW-004 §2.1). Pure
 * function so it's independently testable without touching localStorage:
 * must not be in the past, must fall within a plausible ~24-month window
 * for an 11+ entry-year exam. `now` is an explicit parameter for the same
 * testability reason lib/ali/durableMastery.ts's isMaintenanceReviewDue()
 * takes one.
 */
export function isPlausibleExamDate(dateIso: string, now: Date = new Date()): boolean {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return false;
  if (date.getTime() < now.getTime()) return false;
  const maxFuture = new Date(now);
  maxFuture.setMonth(maxFuture.getMonth() + 24);
  return date.getTime() <= maxFuture.getTime();
}

/**
 * Sets the target exam date. Per EAW-004 §2.1: a family's own stated date
 * is direct evidence and is never silently overridden — this function only
 * rejects implausible values (§ above), it does not check against any
 * pathway's public-record typical exam window.
 *
 * Programme Increment 008B — every call site of this function has always
 * supplied a parent-typed date, never an official CSSE-published one (no
 * such official-date source exists anywhere in this codebase), so
 * "parent_supplied" is the honest, correct provenance for every write
 * this function has ever made or will make until a genuinely different
 * evidence source is wired in.
 */
export function setTargetExamDate(dateIso: string): { success: boolean; error?: string } {
  if (!isPlausibleExamDate(dateIso)) {
    return { success: false, error: "That doesn't look like a valid upcoming exam date." };
  }
  const p = getProgress();
  saveProgress({ ...p, targetExamDate: dateIso, targetExamDateProvenance: "parent_supplied" });
  return { success: true };
}

export function getTargetExamDate(): string | undefined {
  return getProgress().targetExamDate;
}

/**
 * Pure core, directly testable without touching localStorage (same
 * pattern as isPlausibleExamDate above). "unknown" (never "parent_
 * supplied") both when no date exists at all, and when a date exists but
 * predates this field's introduction -- absence of evidence is never
 * silently upgraded into a specific claimed provenance.
 */
export function deriveExamDateProvenance(
  p: Pick<UserProgress, "targetExamDate" | "targetExamDateProvenance">
): "official" | "parent_supplied" | "estimated" | "unknown" {
  if (!p.targetExamDate) return "unknown";
  return p.targetExamDateProvenance ?? "unknown";
}

export function getTargetExamDateProvenance(): "official" | "parent_supplied" | "estimated" | "unknown" {
  return deriveExamDateProvenance(getProgress());
}

export function clearTargetExamDate(): void {
  const p = getProgress();
  saveProgress({ ...p, targetExamDate: undefined, targetExamDateProvenance: undefined });
}

const PLAUSIBLE_SCHOOL_YEARS = ["Year 4", "Year 5", "Year 6"] as const;

/** Pure core, directly testable. */
export function isValidSchoolYear(year: string): year is (typeof PLAUSIBLE_SCHOOL_YEARS)[number] {
  return (PLAUSIBLE_SCHOOL_YEARS as readonly string[]).includes(year);
}

/**
 * Programme Increment 008B — parent/guardian-supplied, optional, never
 * asked of the child (same convention as setTargetExamDate above).
 * Reuses lib/learningEngine/preparationStage.ts's own SchoolYear type; no
 * second type is defined. Feeds derivePreparationStage()'s schoolYear
 * parameter directly.
 */
export function setSchoolYear(year: string): { success: boolean; error?: string } {
  if (!isValidSchoolYear(year)) {
    return { success: false, error: "Choose Year 4, Year 5, or Year 6." };
  }
  const p = getProgress();
  saveProgress({ ...p, schoolYear: year });
  return { success: true };
}

export function getSchoolYear(): "Year 4" | "Year 5" | "Year 6" | undefined {
  return getProgress().schoolYear;
}

export function clearSchoolYear(): void {
  const p = getProgress();
  saveProgress({ ...p, schoolYear: undefined });
}
