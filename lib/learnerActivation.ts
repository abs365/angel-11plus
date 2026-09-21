"use client";

import { getSupabaseClient } from "./supabase";
import { getDeviceId, syncLearnerSetup, type LearnerSetupPatch } from "./supabaseProgress";
import { getLearnerContextSnapshot, learnerScopedKey, refreshLearnerContext } from "./learnerContext";
import { PROGRESS_BASE_KEY } from "./progress";
import { IN_PROGRESS_BASE_KEY } from "./mockProgress";
import { MIGRATED_BASE_KEY } from "./migrateProgress";
import { readChildName, normaliseChildName } from "./childProfile";

/**
 * One-time-per-load activation of the active learner (multi-learner,
 * migration 260). Runs after ensureProfile() resolves the learner.
 *
 *  1. Claim the legacy DEVICE-WIDE browser state for the ONE learner it
 *     belongs to -- only when that learner's profile row was created on
 *     this very device (profiles.device_id === this device's id), so a
 *     different account, or a second learner, on a shared device can never
 *     inherit it. Copy, never move: legacy keys are left untouched so the
 *     change is reversible and no evidence is lost.
 *  2. Reconcile the learner's preparation setup (pathway, exam date, school
 *     year) between the database (authoritative) and the learner-scoped
 *     local cache, and seed a fresh device's cache from the database.
 *  3. Adopt a first name a parent already entered locally (pre-260) so
 *     nobody has to type it again.
 * If the local cache changed after first paint, reload once so every page
 * renders from the reconciled state.
 */

const CLAIM_MARKER_KEY = "angel11plus_legacy_state_claimed_by";

type StateStorage = Pick<Storage, "getItem" | "setItem">;

/** Returns true if the learner's scoped blob was created from the legacy one. */
export function claimLegacyLocalState(storage: StateStorage, learnerId: string): boolean {
  try {
    if (storage.getItem(CLAIM_MARKER_KEY)) return false;
    const legacyProgress = storage.getItem(PROGRESS_BASE_KEY);
    const legacyMock = storage.getItem(IN_PROGRESS_BASE_KEY);
    if (!legacyProgress && !legacyMock) return false; // nothing to claim; leave the marker unset

    let copied = false;
    const progressKey = learnerScopedKey(PROGRESS_BASE_KEY, learnerId);
    if (legacyProgress && !storage.getItem(progressKey)) {
      storage.setItem(progressKey, legacyProgress);
      copied = true;
    }
    const mockKey = learnerScopedKey(IN_PROGRESS_BASE_KEY, learnerId);
    if (legacyMock && !storage.getItem(mockKey)) storage.setItem(mockKey, legacyMock);

    // The one-time "push local lessons to the database" flag travels with the
    // blob: without it the first learner would re-push already-synced lessons.
    const legacyMigrated = storage.getItem(MIGRATED_BASE_KEY);
    const migratedKey = learnerScopedKey(MIGRATED_BASE_KEY, learnerId);
    if (legacyMigrated && !storage.getItem(migratedKey)) storage.setItem(migratedKey, legacyMigrated);

    storage.setItem(CLAIM_MARKER_KEY, learnerId);
    return copied;
  } catch {
    return false;
  }
}

export interface LocalSetup {
  xp: number;
  streak: number;
  completedLessons: string[];
  lastActivity: string;
  selectedPathwayId?: string;
  targetExamDate?: string;
  targetExamDateProvenance?: "official" | "parent_supplied" | "estimated" | "unknown";
  schoolYear?: "Year 4" | "Year 5" | "Year 6";
  [k: string]: unknown;
}

export interface ServerSetup {
  selected_pathway_id: string | null;
  target_exam_date: string | null;
  target_exam_date_provenance: "official" | "parent_supplied" | "estimated" | "unknown" | null;
  school_year: "Year 4" | "Year 5" | "Year 6" | null;
  total_xp?: number | null;
  streak?: number | null;
  last_activity?: string | null;
}

/**
 * Pure reconciliation. The database is authoritative when it holds a value;
 * a value that exists only locally (set before setup moved to the database)
 * is pushed up rather than lost; a fresh device's empty XP/streak is seeded
 * from the database.
 */
export function reconcileSetup(
  local: LocalSetup,
  server: ServerSetup
): { local: LocalSetup; push: LearnerSetupPatch | null; changedLocal: boolean } {
  const next: LocalSetup = { ...local };
  const push: LearnerSetupPatch = {};
  let changedLocal = false;

  if (server.selected_pathway_id) {
    if (next.selectedPathwayId !== server.selected_pathway_id) {
      next.selectedPathwayId = server.selected_pathway_id;
      changedLocal = true;
    }
  } else if (next.selectedPathwayId) {
    push.selected_pathway_id = next.selectedPathwayId;
    push.pathway_selected_at = new Date().toISOString();
  }

  if (server.target_exam_date) {
    if (next.targetExamDate !== server.target_exam_date) {
      next.targetExamDate = server.target_exam_date;
      changedLocal = true;
    }
    const prov = server.target_exam_date_provenance ?? "unknown";
    if (next.targetExamDateProvenance !== prov) {
      next.targetExamDateProvenance = prov;
      changedLocal = true;
    }
  } else if (next.targetExamDate) {
    push.target_exam_date = next.targetExamDate;
    push.target_exam_date_provenance = next.targetExamDateProvenance ?? "unknown";
  }

  if (server.school_year) {
    if (next.schoolYear !== server.school_year) {
      next.schoolYear = server.school_year;
      changedLocal = true;
    }
  } else if (next.schoolYear) {
    push.school_year = next.schoolYear;
  }

  const localIsFresh = next.xp === 0 && next.completedLessons.length === 0;
  if (localIsFresh && (server.total_xp ?? 0) > 0) {
    next.xp = server.total_xp ?? 0;
    next.streak = server.streak ?? next.streak;
    if (server.last_activity) next.lastActivity = server.last_activity;
    changedLocal = true;
  }

  return { local: next, push: Object.keys(push).length > 0 ? push : null, changedLocal };
}

const activated = new Set<string>();

export async function activateLearner(learnerId: string | null): Promise<void> {
  if (!learnerId || typeof window === "undefined") return;
  if (activated.has(learnerId)) return;
  activated.add(learnerId);

  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const { data: row } = await supabase
      .from("profiles")
      .select("id, device_id, learner_name, selected_pathway_id, target_exam_date, target_exam_date_provenance, school_year")
      .eq("id", learnerId)
      .maybeSingle();
    if (!row) return;

    let changed = false;
    const sameDevice = row.device_id === getDeviceId();
    if (sameDevice) changed = claimLegacyLocalState(window.localStorage, learnerId);

    const { data: stats } = await supabase
      .from("user_stats")
      .select("total_xp, streak, last_activity")
      .eq("profile_id", learnerId)
      .maybeSingle();

    const key = learnerScopedKey(PROGRESS_BASE_KEY, learnerId);
    const raw = window.localStorage.getItem(key);
    const local: LocalSetup = raw
      ? (JSON.parse(raw) as LocalSetup)
      : { xp: 0, streak: 1, completedLessons: [], scores: {}, lastActivity: new Date().toISOString() };
    const result = reconcileSetup(local, {
      selected_pathway_id: row.selected_pathway_id,
      target_exam_date: row.target_exam_date,
      target_exam_date_provenance: row.target_exam_date_provenance,
      school_year: row.school_year,
      total_xp: stats?.total_xp,
      streak: stats?.streak,
      last_activity: stats?.last_activity,
    });
    if (result.changedLocal) {
      window.localStorage.setItem(key, JSON.stringify(result.local));
      changed = true;
    }
    if (result.push) await syncLearnerSetup(result.push);

    // Adopt a first name entered locally before names moved to the database.
    if (!row.learner_name && sameDevice) {
      const ctx = getLearnerContextSnapshot();
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData.session?.user;
      const legacyName = readChildName(window.localStorage, {
        id: ctx.uid,
        isPermanent: Boolean(sessionUser) && !sessionUser!.is_anonymous,
      });
      const name = legacyName ? normaliseChildName(legacyName) : null;
      if (name) {
        await syncLearnerSetup({ learner_name: name });
        if (ctx.uid && sessionData.session?.access_token) {
          await refreshLearnerContext(ctx.uid, sessionData.session.access_token);
        }
      }
    }

    if (changed) {
      const guard = `angel_activation_reload:${learnerId}`;
      if (!window.sessionStorage.getItem(guard)) {
        window.sessionStorage.setItem(guard, "1");
        window.location.reload();
      }
    }
  } catch (err) {
    console.warn("[Learner] activation failed:", err);
  }
}
