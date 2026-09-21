"use client";

import { getProgress } from "./progress";
import { syncFullProgress, ensureProfile, getDeviceId, subjectFromLessonId } from "./supabaseProgress";
import { getSupabaseClient } from "./supabase";

import { learnerStorageKey } from "./learnerContext";

export const MIGRATED_BASE_KEY = "angel11plus_migrated_v1";
// Multi-learner: "already pushed" is per learner, so one child's flag can
// neither block nor duplicate another child's one-time push.
const migratedKey = () => learnerStorageKey(MIGRATED_BASE_KEY);

/**
 * Runs once per device after Supabase keys are configured.
 * Pushes the full localStorage snapshot (XP, scores, completed lessons) up to Supabase.
 * Marks completion in localStorage so it never runs twice.
 */
export async function migrateLocalProgressToSupabase(): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return; // Supabase not configured yet

  const deviceId = getDeviceId();
  if (!deviceId) return;

  const key = migratedKey();
  if (!key) return; // active learner not known yet
  const alreadyMigrated = localStorage.getItem(key);
  if (alreadyMigrated) return;

  const progress = getProgress();

  // If nothing to migrate, just mark done
  if (progress.completedLessons.length === 0 && progress.xp === 0) {
    localStorage.setItem(key, "1");
    return;
  }

  try {
    const profileId = await ensureProfile();
    if (!profileId) return;

    // Push aggregate stats
    await syncFullProgress(progress);

    // Push one lesson_progress row per completed lesson (best scores only)
    const inserts = progress.completedLessons.map((lessonId) => ({
      profile_id: profileId,
      lesson_id: lessonId,
      subject: subjectFromLessonId(lessonId),
      score: progress.scores[lessonId] ?? 0,
      xp_gained: 0, // historical — exact xp per lesson not tracked separately
    }));

    if (inserts.length > 0) {
      const { error } = await supabase.from("lesson_progress").insert(inserts);
      if (error) {
        console.warn("[Supabase] Migration insert failed:", error.message);
        return; // Don't mark as migrated — will retry next session
      }
    }

    localStorage.setItem(key, "1");
    console.info("[Supabase] Local progress migrated successfully.");
  } catch (err) {
    console.warn("[Supabase] Migration error:", err);
  }
}
