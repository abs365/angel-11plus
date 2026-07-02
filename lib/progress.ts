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

export function setSelectedPathway(id: string): void {
  const p = getProgress();
  saveProgress({ ...p, selectedPathwayId: id });
}

export function getSelectedPathwayId(): string | undefined {
  return getProgress().selectedPathwayId;
}
