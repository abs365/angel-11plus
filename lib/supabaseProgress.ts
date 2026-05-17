"use client";

import { getSupabaseClient } from "./supabase";
import type { Subject } from "@/types/supabase";
import type { UserProgress } from "@/types";

const DEVICE_ID_KEY = "angel11plus_device_id";

// ----------------------------------------------------------------
// Device identity — stable anonymous ID per browser/device.
// Stored in localStorage. Linked to a Supabase profile row.
// ----------------------------------------------------------------

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// ----------------------------------------------------------------
// Resolve the profile ID for the current session.
// Authenticated users: looked up by auth_user_id.
// Anonymous users: looked up / created by device_id.
// ----------------------------------------------------------------

async function resolveProfileId(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  // Check if there's an authenticated session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Authenticated — look up by auth_user_id first
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (data) return data.id;
  }

  // Fall back to device profile
  return ensureProfile();
}

// ----------------------------------------------------------------
// Ensure a profile row exists for this device.
// Safe to call repeatedly — uses upsert on device_id.
// ----------------------------------------------------------------

export async function ensureProfile(name = "Angel"): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const deviceId = getDeviceId();
  if (!deviceId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .upsert({ device_id: deviceId, name }, { onConflict: "device_id" })
    .select("id")
    .single();

  if (error) {
    console.warn("[Supabase] ensureProfile failed:", error.message);
    return null;
  }
  return data.id;
}

// ----------------------------------------------------------------
// Push a lesson completion to Supabase.
// Called in background — never blocks the UI.
// ----------------------------------------------------------------

export async function syncLessonComplete(
  lessonId: string,
  subject: Subject,
  score: number,
  xpGained: number,
  currentProgress: UserProgress
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const profileId = await resolveProfileId();
  if (!profileId) return;

  const { error: lessonError } = await supabase
    .from("lesson_progress")
    .insert({
      profile_id: profileId,
      lesson_id: lessonId,
      subject,
      score,
      xp_gained: xpGained,
    });

  if (lessonError) {
    console.warn("[Supabase] syncLessonComplete insert failed:", lessonError.message);
  }

  const { error: statsError } = await supabase
    .from("user_stats")
    .upsert(
      {
        profile_id: profileId,
        total_xp: currentProgress.xp,
        streak: currentProgress.streak,
        last_activity: currentProgress.lastActivity,
      },
      { onConflict: "profile_id" }
    );

  if (statsError) {
    console.warn("[Supabase] syncLessonComplete stats upsert failed:", statsError.message);
  }
}

// ----------------------------------------------------------------
// Push a full progress snapshot to Supabase.
// ----------------------------------------------------------------

export async function syncFullProgress(progress: UserProgress): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const profileId = await resolveProfileId();
  if (!profileId) return;

  const { error } = await supabase
    .from("user_stats")
    .upsert(
      {
        profile_id: profileId,
        total_xp: progress.xp,
        streak: progress.streak,
        last_activity: progress.lastActivity,
      },
      { onConflict: "profile_id" }
    );

  if (error) {
    console.warn("[Supabase] syncFullProgress failed:", error.message);
  }
}

// ----------------------------------------------------------------
// Derive subject from a lesson ID string.
// ----------------------------------------------------------------

export function subjectFromLessonId(lessonId: string): Subject {
  if (lessonId.startsWith("eng-")) return "english";
  if (lessonId.startsWith("maths-")) return "maths";
  if (lessonId.startsWith("vocab-")) return "vocabulary";
  if (lessonId.startsWith("writing-")) return "writing";
  if (lessonId === "mock-test") return "mock-test";
  return "english";
}
