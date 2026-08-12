import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { BankQuestion, AliSubject } from "@/types/ali/questionBank";
import type { MockPathwayId } from "@/types/mock";

type BankRow = Database["public"]["Tables"]["ali_question_bank"]["Row"];

function rowToBankQuestion(row: BankRow): BankQuestion {
  return {
    id: row.id,
    subject: row.subject as AliSubject,
    skill: row.skill,
    pathway: row.pathway as MockPathwayId[],
    contentDifficulty: row.content_difficulty,
    questionType: row.question_type as BankQuestion["questionType"],
    estimatedTimeSeconds: row.estimated_time_seconds,
    prompt: row.prompt as BankQuestion["prompt"],
    explanation: row.explanation,
    hint: row.hint ?? undefined,
    confidenceWeight: row.confidence_weight,
    learningObjective: row.learning_objective ?? undefined,
    revisionPriority: row.revision_priority as BankQuestion["revisionPriority"],
    masteryThreshold: row.mastery_threshold,
    usageCount: row.usage_count,
    avgSuccessRate: row.avg_success_rate,
    learningUnitId: row.learning_unit_id,
    addressesMisconception: row.addresses_misconception ?? undefined,
    transferLinks: row.transfer_links ?? undefined,
    familyId: row.family_id ?? undefined,
    provenance: row.provenance ?? undefined,
    eligibilityStatus: row.eligibility_status,
    active: row.active,
  };
}

/**
 * Fetches the ALI question bank filtered to a subject + pathway. Used by
 * lib/adaptiveMockBuilder.ts to get the candidate pool for a section before
 * calling lib/ali/selection.ts's selectQuestions().
 *
 * Retirement/provenance enforcement (Educational Increment 004 §13):
 * excludes active=false and provenance="evidence_only" — both filtered in
 * application code, not via a Postgrest .neq(), because provenance is
 * nullable on every one of the 52 rows that predate migration 030/031 and
 * SQL's `x != 'evidence_only'` evaluates to NULL (excluding, not including)
 * for a NULL column; filtering here keeps that large majority correctly
 * included. Deliberately NOT filtering on eligibility_status: per
 * RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md, "Provisional Content" is not
 * technically Practice Eligible, but literally enforcing that today would
 * remove the 46 pre-Increment-003 rows (all still "provisional", including
 * the Founder-verified Mathematics Reference Vertical Lessons 1-2) from
 * Practice entirely — a severe, undisclosed regression, not a gap closure.
 * Recorded as a genuine open question for the Founder rather than silently
 * implemented either way.
 */
export async function fetchQuestionBank(
  supabase: SupabaseClient<Database>,
  subject: AliSubject,
  pathway: MockPathwayId
): Promise<BankQuestion[]> {
  const { data, error } = await supabase
    .from("ali_question_bank")
    .select("*")
    .eq("subject", subject)
    .contains("pathway", [pathway]);

  if (error || !data) {
    console.warn("[ALI] fetchQuestionBank failed:", error?.message);
    return [];
  }

  return data
    .map(rowToBankQuestion)
    .filter((q) => q.active !== false && q.provenance !== "evidence_only");
}

/**
 * Mock firewall (Educational Increment 003, ANGEL_CONTENT_SCALE_GATE_V1.md
 * §16). fetchQuestionBank() above returns every row matching subject+
 * pathway regardless of eligibility_status — correct for Practice, which
 * has never enforced eligibility and is out of this firewall's scope
 * (retrofitting it would risk regressing the already-verified Mathematics
 * Reference Vertical and general Practice pool). Mock must not make that
 * same assumption: a row existing in the bank is not the same claim as a
 * row being fit for an authenticated mock. As of this migration, zero rows
 * (old or new) carry "mock_eligible" — by design, since no item has yet
 * had the independent review + pool-balance check
 * RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md's Mock Eligible gate requires.
 * Callers must treat an empty result as "insufficient validated Mock
 * content," never as an error to silently fall back past.
 */
export async function fetchMockEligibleQuestionBank(
  supabase: SupabaseClient<Database>,
  subject: AliSubject,
  pathway: MockPathwayId
): Promise<BankQuestion[]> {
  const { data, error } = await supabase
    .from("ali_question_bank")
    .select("*")
    .eq("subject", subject)
    .contains("pathway", [pathway])
    .eq("eligibility_status", "mock_eligible")
    .eq("active", true);

  if (error || !data) {
    console.warn("[ALI] fetchMockEligibleQuestionBank failed:", error?.message);
    return [];
  }

  return data.map(rowToBankQuestion);
}
