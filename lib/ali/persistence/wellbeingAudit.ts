import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { WellbeingSignalResult } from "@/types/ali/wellbeing";
import { createAuditRecord } from "@/lib/ali/audit";
import { insertAuditRecord } from "@/lib/ali/persistence/auditStore";

/**
 * Work Package WP-21A (IWP-002) — the audit integration required by
 * WELLBEING_SIGNAL_CONTRACT.md §6: every fired Tier 0 pacing veto writes an
 * EducationalAuditRecord with the new `"wellbeing-veto"` conclusion_type
 * (migration 011). Reuses createAuditRecord() (WP-11) and
 * insertAuditRecord() (WP-17) entirely unmodified — this module adds no
 * new construction or persistence logic, only the specific call shape a
 * wellbeing veto needs.
 *
 * A veto that does *not* fire writes nothing — consistent with
 * EAW-002 §9's existing "not every decision needs a full audit record"
 * principle; the default, no-action state is not itself a conclusion
 * requiring its own audit trail entry.
 *
 * Documented judgement call: EducationalAuditRecord requires a non-null
 * `confidenceTierAtTime` (an Evidence Confidence tier, WP-05), which has
 * no literal equivalent for a wellbeing veto — a wellbeing decision isn't
 * a competency-mastery confidence judgement. Recorded here as `"high"`,
 * on the grounds that every condition capable of firing this veto at all
 * already requires compounding, multi-signal evidence by design (APD-044
 * item 5) — the veto itself is never fired on weak or single-point
 * evidence, so `"high"` honestly reflects the strength of what triggered
 * it, even though it is being reused across two different meanings of
 * "confidence." Flagged explicitly, not silently assumed.
 */
export async function recordWellbeingVetoAudit(
  supabase: SupabaseClient<Database>,
  learnerId: string,
  competencyCode: string,
  result: WellbeingSignalResult,
  now: Date
): Promise<string | null> {
  if (!result.veto) return null;

  const record = createAuditRecord({
    id: crypto.randomUUID(),
    conclusionType: "wellbeing-veto",
    learnerId,
    competencyOrDimension: competencyCode,
    confidenceTierAtTime: "high",
    concludedAt: now.toISOString(),
  });

  return insertAuditRecord(supabase, record);
}
