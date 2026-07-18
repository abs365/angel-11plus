import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { OperationalEvent, AggregatedEventCount } from "@/types/ali/operationalEvent";

/**
 * Work Package WP-17 (IWP-002) — the real Supabase read/write path for
 * ali_operational_events / ali_operational_event_aggregates (migration
 * 010, WP-16). Does not change lib/ali/operationalEvent.ts's pure
 * partitionOperationalEvents() — this module is the I/O boundary around
 * it: fetch raw events, call the existing pure function, write back
 * whichever half of its output belongs in which table.
 */

export async function insertOperationalEvent(
  supabase: SupabaseClient<Database>,
  event: OperationalEvent
): Promise<boolean> {
  const { error } = await supabase.from("ali_operational_events").insert({
    event_type: event.eventType,
    learner_id: event.learnerId,
    competency_code: event.competencyCode,
    occurred_at: event.timestamp,
  });

  if (error) {
    console.warn("[ALI] insertOperationalEvent failed:", error.message);
    return false;
  }
  return true;
}

export async function fetchAllOperationalEvents(
  supabase: SupabaseClient<Database>
): Promise<OperationalEvent[]> {
  const { data, error } = await supabase.from("ali_operational_events").select("*");

  if (error || !data) {
    console.warn("[ALI] fetchAllOperationalEvents failed:", error?.message);
    return [];
  }

  return data.map((row) => ({
    eventType: row.event_type,
    learnerId: row.learner_id,
    competencyCode: row.competency_code,
    timestamp: row.occurred_at,
  }));
}

/**
 * The retention-boundary write: upserts the aggregate counts
 * partitionOperationalEvents() computed for the aged-out portion of the
 * event set, then deletes every raw event at or before the same cutoff
 * timestamp directly by date — not by re-matching the specific event
 * objects already in memory. An earlier version of this function deleted
 * by `learner_id` + a timestamp bound, which could have removed a *recent*
 * event that happened to share a learner_id with an aged-out one; deleting
 * directly against `occurred_at <= cutoff` is both simpler and correct,
 * since retention is inherently a date-boundary rule, not a per-row
 * identity rule.
 */
export async function applyRetentionPartition(
  supabase: SupabaseClient<Database>,
  cutoffTimestamp: string,
  aggregates: AggregatedEventCount[]
): Promise<boolean> {
  for (const agg of aggregates) {
    const { error } = await supabase.from("ali_operational_event_aggregates").upsert(
      {
        event_type: agg.eventType,
        competency_code: agg.competencyCode,
        time_bucket: agg.timeBucket,
        event_count: agg.count,
      },
      { onConflict: "event_type,competency_code,time_bucket" }
    );
    if (error) {
      console.warn("[ALI] applyRetentionPartition (aggregate upsert) failed:", error.message);
      return false;
    }
  }

  const { error: deleteError } = await supabase
    .from("ali_operational_events")
    .delete()
    .lte("occurred_at", cutoffTimestamp);

  if (deleteError) {
    console.warn("[ALI] applyRetentionPartition (delete aged events) failed:", deleteError.message);
    return false;
  }
  return true;
}
