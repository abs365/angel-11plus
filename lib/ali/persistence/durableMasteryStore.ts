import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type {
  DurableMasteryRecord,
  MaintenanceReviewRecord,
  TransferCorroboration,
} from "@/types/ali/durableMastery";

/**
 * Work Package WP-17 (IWP-002, Runtime Persistence Integration) — the real
 * Supabase read/write path for ali_durable_mastery (migration 010, WP-16).
 * Follows the exact established pattern lib/ali/questionBank.ts's
 * fetchQuestionBank() already uses: graceful failure (console.warn + a
 * safe fallback, never throw), so a genuinely unreachable database
 * degrades the same way every other ALI read path already does, not a new
 * failure mode.
 *
 * This module does not change lib/ali/durableMastery.ts's pure
 * evaluateDurableMastery() at all — it only gives that function's real
 * output somewhere real to be read from and written to.
 */

type DurableMasteryRow = Database["public"]["Tables"]["ali_durable_mastery"]["Row"];

function rowToRecord(row: DurableMasteryRow): DurableMasteryRecord {
  return {
    competencyCode: row.competency_code,
    validated: row.validated,
    maintenanceReviews: (row.maintenance_reviews as MaintenanceReviewRecord[]) ?? [],
    transferCorroboration: (row.transfer_corroboration as TransferCorroboration) ?? {
      linkedCompetencyCode: null,
      corroborated: null,
    },
    durable: row.durable,
  };
}

export async function fetchDurableMasteryRecord(
  supabase: SupabaseClient<Database>,
  profileId: string,
  competencyCode: string
): Promise<DurableMasteryRecord | null> {
  const { data, error } = await supabase
    .from("ali_durable_mastery")
    .select("*")
    .eq("profile_id", profileId)
    .eq("competency_code", competencyCode)
    .maybeSingle();

  if (error) {
    console.warn("[ALI] fetchDurableMasteryRecord failed:", error.message);
    return null;
  }
  return data ? rowToRecord(data) : null;
}

/**
 * Upserts a DurableMasteryRecord — matches the (profile_id, competency_code)
 * unique constraint migration 010 defines, so a second evaluation for the
 * same learner/competency updates the existing row rather than duplicating
 * it.
 */
export async function saveDurableMasteryRecord(
  supabase: SupabaseClient<Database>,
  profileId: string,
  record: DurableMasteryRecord
): Promise<boolean> {
  const { error } = await supabase.from("ali_durable_mastery").upsert(
    {
      profile_id: profileId,
      competency_code: record.competencyCode,
      validated: record.validated,
      maintenance_reviews: record.maintenanceReviews,
      transfer_corroboration: record.transferCorroboration,
      durable: record.durable,
    },
    { onConflict: "profile_id,competency_code" }
  );

  if (error) {
    console.warn("[ALI] saveDurableMasteryRecord failed:", error.message);
    return false;
  }
  return true;
}
