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
    questionGroupId: row.question_group_id ?? undefined,
    groupOrder: row.group_order ?? undefined,
    subpartLabel: row.subpart_label ?? undefined,
    markingMode: row.marking_mode ?? undefined,
  };
}

/** Practice eligibility (Educational Increment 005 Part A). A row must be
 * at this status or higher to be considered "learner-ready," per
 * RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md's own status ordering.
 * "provisional" is deliberately excluded, closing the gap Increment 004
 * disclosed and left open — audited first (migration 033), not applied
 * blindly: 40 of the 46 pre-Increment-003 rows carry a disclosed,
 * non-forced Question Type/competency mapping and were promoted; 6
 * (mth-003/004/005/006/007b, wrt-003) have the migration's own inline
 * comment admitting a forced fit, judgement call, or scoring-mechanism
 * irregularity (RELEASE_1_GAP_ANALYSIS.md §4) and remain "provisional",
 * quarantined from Practice until remediated. */
const PRACTICE_ELIGIBLE_STATUSES = new Set([
  "practice_eligible",
  "authentic_assessment_candidate",
  "independently_validated",
  "mock_eligible",
]);

/**
 * Fetches the ALI question bank filtered to a subject + pathway. Used by
 * lib/adaptiveMockBuilder.ts to get the candidate pool for a section before
 * calling lib/ali/selection.ts's selectQuestions().
 *
 * Retirement/provenance/eligibility enforcement (Educational Increment 004
 * §13, Increment 005 Part A): excludes active=false, provenance=
 * "evidence_only", and eligibility_status="provisional" — all filtered in
 * application code, not via a Postgrest .neq(), because provenance/
 * eligibility_status default differently across the bank's history and
 * SQL's `x != 'y'` evaluates to NULL (excluding, not including) for a NULL
 * column; filtering here is correct regardless of which rows have which
 * value set. A row with no eligibility_status at all (should not occur —
 * the column has a NOT NULL default — but handled defensively) is treated
 * as not yet eligible, not silently admitted.
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
    .filter(
      (q) =>
        q.active !== false &&
        q.provenance !== "evidence_only" &&
        !!q.eligibilityStatus &&
        PRACTICE_ELIGIBLE_STATUSES.has(q.eligibilityStatus)
    );
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
