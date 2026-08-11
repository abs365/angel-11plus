import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { FamilyFocusSelection } from "@/types/ali/familyFocus";

/**
 * Family Choice Pilot — real Supabase read/write path for
 * ali_family_focus_selection (migration 022). Follows the exact
 * established pattern lib/ali/persistence/durableMasteryStore.ts already
 * uses: graceful failure (console.warn + a safe fallback, never throw).
 *
 * This module does not decide anything educational — it only gives a
 * family's real choice somewhere real to be read from and written to.
 * The choice-injection point itself (lib/learningEngine/sessionGenerator.ts)
 * is the only consumer that turns this stored fact into selection
 * behaviour, and it is wellbeing-veto-aware when it does — this module has
 * no opinion on that and does not gate anything.
 */

type FamilyFocusRow = Database["public"]["Tables"]["ali_family_focus_selection"]["Row"];

function rowToSelection(row: FamilyFocusRow): FamilyFocusSelection {
  return {
    profileId: row.profile_id,
    competencyCode: row.competency_code,
    source: "family-selected",
    active: row.active,
    selectedAt: row.selected_at,
    removedAt: row.removed_at,
  };
}

/** Returns null when no selection exists yet, or the row exists but is inactive (a real, distinct state a caller must check `active` on — never coerced to "no selection"). */
export async function fetchFamilyFocusSelection(
  supabase: SupabaseClient<Database>,
  profileId: string
): Promise<FamilyFocusSelection | null> {
  const { data, error } = await supabase
    .from("ali_family_focus_selection")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    console.warn("[ALI] fetchFamilyFocusSelection failed:", error.message);
    return null;
  }
  return data ? rowToSelection(data) : null;
}

/**
 * Upserts the family's chosen competency as the active focus — matches
 * the (profile_id) primary key migration 022 defines, so choosing again
 * (including choosing a different competency) replaces the prior
 * selection rather than accumulating rows. Pilot scope: exactly one
 * active chosen competency at a time, per the Founder-approved
 * single-competency increment.
 */
export async function saveFamilyFocusSelection(
  supabase: SupabaseClient<Database>,
  profileId: string,
  competencyCode: string,
  now: Date = new Date()
): Promise<boolean> {
  const { error } = await supabase.from("ali_family_focus_selection").upsert(
    {
      profile_id: profileId,
      competency_code: competencyCode,
      source: "family-selected",
      active: true,
      selected_at: now.toISOString(),
      removed_at: null,
    },
    { onConflict: "profile_id" }
  );

  if (error) {
    console.warn("[ALI] saveFamilyFocusSelection failed:", error.message);
    return false;
  }
  return true;
}

/**
 * Deactivates the current focus selection — sets active=false and records
 * removed_at, never deletes the row, so the prior choice and its
 * timestamps remain visible (real provenance, not erased history). A
 * removed selection is never re-activated implicitly; a family choosing
 * to focus again calls saveFamilyFocusSelection() again, which is a new,
 * real, timestamped decision.
 */
export async function removeFamilyFocusSelection(
  supabase: SupabaseClient<Database>,
  profileId: string,
  now: Date = new Date()
): Promise<boolean> {
  const { error } = await supabase
    .from("ali_family_focus_selection")
    .update({ active: false, removed_at: now.toISOString() })
    .eq("profile_id", profileId);

  if (error) {
    console.warn("[ALI] removeFamilyFocusSelection failed:", error.message);
    return false;
  }
  return true;
}
