"use client";

import { getSupabaseClient } from "./supabase";
import { ensureLearnerSession } from "./learnerIdentity";
import type { Subject } from "@/types/supabase";
import type { UserProgress } from "@/types";

const DEVICE_ID_KEY = "angel11plus_device_id";

// ----------------------------------------------------------------
// Device identity — stable per browser/device, retained as continuity
// metadata only (ARCH-001 / ED-001 correction, 2026-07-23). No longer the
// security ownership mechanism — see lib/learnerIdentity.ts and
// ensureProfile() below. Kept so a returning device can be matched to a
// legacy, not-yet-claimed profile (claim_legacy_profile(), migration 019).
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
// Ensure a profile row exists for the current, real, authenticated
// learner identity (ED-001 permanent correction). Never creates a profile
// without a real auth.uid() — device_id alone is no longer sufficient to
// mint one. Safe to call repeatedly: looks up the existing profile for
// this auth user first, then tries to claim an unowned legacy device
// profile (migration 019's claim_legacy_profile(), a narrowly-scoped
// SECURITY DEFINER function — see that migration for the security
// reasoning), and only creates a brand-new row if neither exists.
//
// Returns null on any failure (never throws), logging a clear warning at
// the exact step that failed — the established convention every other
// lib/ali/*, lib/supabaseProgress.ts function already follows in this
// codebase, not a new error-handling shape callers would need to adapt to.
// ----------------------------------------------------------------

export async function ensureProfile(name = "Angel"): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const authUserId = await ensureLearnerSession();
  if (!authUserId) {
    console.warn("[Supabase] ensureProfile failed: no authenticated learner session available");
    return null;
  }

  const { data: existing, error: lookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (lookupError) {
    console.warn("[Supabase] ensureProfile lookup failed:", lookupError.message);
    return null;
  }
  if (existing) return existing.id;

  const deviceId = getDeviceId();
  if (deviceId) {
    const { data: claimedId, error: claimError } = await supabase.rpc("claim_legacy_profile", {
      p_device_id: deviceId,
    });
    if (claimError) {
      console.warn("[Supabase] claim_legacy_profile failed:", claimError.message);
    } else if (claimedId) {
      return claimedId;
    }
  }

  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({ auth_user_id: authUserId, device_id: deviceId || crypto.randomUUID(), name })
    .select("id")
    .single();

  if (insertError) {
    console.warn("[Supabase] ensureProfile insert failed:", insertError.message);
    return null;
  }
  return created.id;
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

  const profileId = await ensureProfile();
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

  const profileId = await ensureProfile();
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
