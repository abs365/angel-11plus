"use client";

import { getSupabaseClient } from "./supabase";
import { ensureLearnerSession } from "./learnerIdentity";
import type { Subject, Database } from "@/types/supabase";
import type { UserProgress } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";

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
// reasoning, and migration 188 for the evidence-safety hardening on top
// of it), and only creates a brand-new row if neither exists.
//
// Returns null on any failure (never throws), logging a clear warning at
// the exact step that failed — the established convention every other
// lib/ali/*, lib/supabaseProgress.ts function already follows in this
// codebase, not a new error-handling shape callers would need to adapt to.
//
// Gate 3 production defect (this session): profiles.device_id has carried
// a UNIQUE NOT NULL constraint since the very first schema (migration
// 001), from an era where device_id WAS the entire learner-identity
// mechanism ("one row per device"). Migration 019 deliberately replaced
// that ownership model with auth_user_id (which has its own, independent
// UNIQUE constraint, migration 002) and demoted device_id to "continuity
// metadata only" — kept solely so claim_legacy_profile() can look up a
// device's own prior unclaimed anonymous activity. That demotion was
// never carried through to the schema: profiles_device_id_key is still
// enforced today, even though it is no longer a valid proxy for learner
// identity once two DIFFERENT authenticated people can legitimately use
// the same physical device (a shared family device; a device reused
// across separate test/learner accounts). A first-time authenticated
// signup on such a device, once claim_legacy_profile() correctly refuses
// to hand over the existing occupant's evidence-bearing profile
// (migration 188), fell through to this INSERT — which then collided on
// profiles_device_id_key, since that device_id was already attached to
// the OTHER person's row. ensureProfile() returned null; the learner saw
// "no profile."
//
// Fix: device_id is not, and must never become, a second ownership key —
// auth_user_id already is that key, and remains untouched here. So a
// device_id collision on this INSERT is not a reason to fail: retry once
// with a freshly generated, guaranteed-unused device_id for this new
// profile. This does not touch profiles_device_id_key itself (still
// UNIQUE NOT NULL, still enforced, still proven safe by the existing
// verification suite) and does not change claim_legacy_profile() or its
// migration-188 guards at all — it only stops a same-device collision
// from blocking a brand-new authenticated learner from getting their own
// clean profile. The common case (no collision — the overwhelming
// majority of first-time signups, on a device with no prior conflicting
// occupant) is completely unaffected: the browser's own device_id is
// still used, preserving exactly the same future claim_legacy_profile()
// continuity this mechanism has always provided.
//
// Deliberately NOT handled here (out of scope for this proven defect,
// disclosed rather than silently ignored): a collision on
// profiles_auth_user_id_key specifically — i.e. two concurrent
// ensureProfile() calls for the same brand-new authenticated user
// racing each other — is a different, unconfirmed scenario this session
// explicitly investigated and could not prove occurred; it is not
// speculatively "fixed" alongside this proven device_id defect.
// ----------------------------------------------------------------

const PROFILES_DEVICE_ID_UNIQUE_VIOLATION = "profiles_device_id_key";

/**
 * `injectedClient` is test-support only, mirroring ensureLearnerSession()'s
 * own established pattern (lib/learnerIdentity.ts) — every real call site
 * omits it and gets the real singleton via getSupabaseClient(). Exists so
 * the device_id-collision retry logic below (the proven Gate 3 defect
 * correction) can be exercised directly against a fake client rather than
 * requiring a live database, the same reasoning ensureLearnerSession's own
 * doc comment already gives.
 */
export async function ensureProfile(
  name = "Angel",
  injectedClient?: SupabaseClient<Database>
): Promise<string | null> {
  const supabase = injectedClient ?? getSupabaseClient();
  if (!supabase) return null;

  const authUserId = await ensureLearnerSession(injectedClient);
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

  const insertProfile = (deviceIdForInsert: string) =>
    supabase.from("profiles").insert({ auth_user_id: authUserId, device_id: deviceIdForInsert, name }).select("id").single();

  let { data: created, error: insertError } = await insertProfile(deviceId || crypto.randomUUID());

  if (insertError?.code === "23505" && insertError.message.includes(PROFILES_DEVICE_ID_UNIQUE_VIOLATION)) {
    // This device's own device_id already belongs to a different
    // learner's profile — see the function-level comment above. Retry
    // once with a fresh, guaranteed-unused device_id rather than fail;
    // auth_user_id (already validated above to have no existing row)
    // remains this new profile's real, unambiguous owner either way.
    ({ data: created, error: insertError } = await insertProfile(crypto.randomUUID()));
  }

  if (insertError) {
    console.warn("[Supabase] ensureProfile insert failed:", insertError.message);
    return null;
  }
  return created?.id ?? null;
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
// Mirror the active pathway (lib/progress.ts's selectedPathwayId, the
// authoritative source) onto the profiles row, so it has a real database
// record for verification (Active Pathway Context, migration 026). Best
// effort: if the migration has not been applied yet, this fails silently
// like every other sync in this file, and the app keeps working from
// localStorage exactly as it does today.
// ----------------------------------------------------------------

export async function syncSelectedPathway(pathwayId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const profileId = await ensureProfile();
  if (!profileId) return;

  const { error } = await supabase
    .from("profiles")
    .update({ selected_pathway_id: pathwayId, pathway_selected_at: new Date().toISOString() })
    .eq("id", profileId);

  if (error) {
    console.warn("[Supabase] syncSelectedPathway failed:", error.message);
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
