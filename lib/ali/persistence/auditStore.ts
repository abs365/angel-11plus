import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { EducationalAuditRecord } from "@/types/ali/audit";

/**
 * Work Package WP-17 (IWP-002) — the real Supabase write path for
 * ali_educational_audit (migration 010, WP-16). Append-only by
 * convention (Programme Decision APD-029, Immutable Educational Evidence)
 * — insertAuditRecord() always inserts a new row; supersedeStoredAuditRecord()
 * is the only permitted update, and it only ever touches
 * superseded_by/supersede_reason on the row it targets, never any other
 * field, mirroring lib/ali/audit.ts's supersedeAuditRecord()'s own
 * "returns a new object, never mutates in place" discipline translated to
 * a real database write.
 */

export async function insertAuditRecord(
  supabase: SupabaseClient<Database>,
  record: EducationalAuditRecord
): Promise<string | null> {
  const { data, error } = await supabase
    .from("ali_educational_audit")
    .insert({
      id: record.id,
      conclusion_type: record.conclusionType,
      learner_id: record.learnerId,
      competency_or_dimension: record.competencyOrDimension,
      confidence_tier_at_time: record.confidenceTierAtTime,
      concluded_at: record.concludedAt,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.warn("[ALI] insertAuditRecord failed:", error?.message);
    return null;
  }
  return data.id;
}

/**
 * The one legitimate update against this table: marking a prior record as
 * superseded once a new conclusion supersedes it. Never touches any other
 * field on the row.
 */
export async function supersedeStoredAuditRecord(
  supabase: SupabaseClient<Database>,
  previousRecordId: string,
  newRecordId: string,
  reason: EducationalAuditRecord["supersedeReason"]
): Promise<boolean> {
  const { error } = await supabase
    .from("ali_educational_audit")
    .update({ superseded_by: newRecordId, supersede_reason: reason })
    .eq("id", previousRecordId);

  if (error) {
    console.warn("[ALI] supersedeStoredAuditRecord failed:", error.message);
    return false;
  }
  return true;
}

/**
 * Fetches the current (not-yet-superseded) audit record for a
 * learner/competency-or-dimension pair, if one exists — the natural
 * lookup before deciding whether a new conclusion supersedes a prior one.
 */
export async function fetchCurrentAuditRecord(
  supabase: SupabaseClient<Database>,
  learnerId: string,
  competencyOrDimension: string
): Promise<EducationalAuditRecord | null> {
  const { data, error } = await supabase
    .from("ali_educational_audit")
    .select("*")
    .eq("learner_id", learnerId)
    .eq("competency_or_dimension", competencyOrDimension)
    .is("superseded_by", null)
    .order("concluded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn("[ALI] fetchCurrentAuditRecord failed:", error.message);
    return null;
  }
  if (!data) return null;

  return {
    id: data.id,
    conclusionType: data.conclusion_type,
    learnerId: data.learner_id,
    competencyOrDimension: data.competency_or_dimension,
    confidenceTierAtTime: data.confidence_tier_at_time,
    concludedAt: data.concluded_at,
    supersededBy: data.superseded_by,
    supersedeReason: data.supersede_reason,
  };
}

/**
 * Sprint 2 (ANGEL-CSSE-002A) — the read-side this table never had. Every
 * Higher-Evidence-Required conclusion ever reached for a learner (mastery,
 * durable-mastery, wellbeing-veto), newest first, including superseded
 * records — a superseded record is still a real historical event (e.g. a
 * mastery later reinforced by durable mastery), not a mistake to hide. This
 * is the Educational Timeline's data source: the closest real thing this
 * schema has to LEARNING_ENGINE_V1.md §3.6's Historical Progress, per the
 * Architecture Closure Review's own finding that this table was built for
 * exactly that purpose.
 */
export async function fetchEducationalMilestones(
  supabase: SupabaseClient<Database>,
  learnerId: string,
  /**
   * Sprint 4 (ANGEL-CSSE-002A, Parent Intelligence) — optional lower bound
   * on `concluded_at` (ISO timestamp), e.g. for a "this week" report.
   * Omitted by every pre-Sprint-4 caller, so their behaviour is unchanged.
   */
  sinceIso?: string
): Promise<EducationalAuditRecord[]> {
  let query = supabase.from("ali_educational_audit").select("*").eq("learner_id", learnerId);
  if (sinceIso) query = query.gte("concluded_at", sinceIso);
  const { data, error } = await query.order("concluded_at", { ascending: false });

  if (error || !data) {
    if (error) console.warn("[ALI] fetchEducationalMilestones failed:", error.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    conclusionType: row.conclusion_type,
    learnerId: row.learner_id,
    competencyOrDimension: row.competency_or_dimension,
    confidenceTierAtTime: row.confidence_tier_at_time,
    concludedAt: row.concluded_at,
    supersededBy: row.superseded_by,
    supersedeReason: row.supersede_reason,
  }));
}
