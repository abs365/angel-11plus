import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { ContentDifficulty } from "@/types/ali/questionBank";

/**
 * Reads ali_mastery_defaults — the configurable difficulty->threshold
 * mapping (ALI_DECISION_LOG.md Decision 10). Falls back to the same values
 * seeded by migration 005 if the table is unreachable, so callers never
 * hard-fail on a config read — but the table remains the source of truth
 * for tuning, not this fallback.
 */
const FALLBACK_DEFAULTS: Record<ContentDifficulty, number> = {
  easy: 2,
  medium: 2,
  hard: 3,
  challenge: 3,
};

export async function fetchMasteryDefaults(
  supabase: SupabaseClient<Database>
): Promise<Record<ContentDifficulty, number>> {
  const { data, error } = await supabase.from("ali_mastery_defaults").select("*");

  if (error || !data) {
    console.warn("[ALI] fetchMasteryDefaults failed, using fallback:", error?.message);
    return { ...FALLBACK_DEFAULTS };
  }

  const result = { ...FALLBACK_DEFAULTS };
  for (const row of data) {
    result[row.content_difficulty] = row.default_threshold;
  }
  return result;
}
