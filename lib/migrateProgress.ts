"use client";

import { getProgress } from "./progress";
import { syncFullProgress, ensureProfile, getDeviceId, subjectFromLessonId } from "./supabaseProgress";
import { getSupabaseClient } from "./supabase";

const MIGRATED_KEY = "angel11plus_migrated_v1";

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

  const alreadyMigrated = localStorage.getItem(MIGRATED_KEY);
  if (alreadyMigrated) return;

  const progress = getProgress();

  // If nothing to migrate, just mark done
  if (progress.completedLessons.length === 0 && progress.xp === 0) {
    localStorage.setItem(MIGRATED_KEY, "1");
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

    localStorage.setItem(MIGRATED_KEY, "1");
    console.info("[Supabase] Local progress migrated successfully.");
  } catch (err) {
    console.warn("[Supabase] Migration error:", err);
  }
}
