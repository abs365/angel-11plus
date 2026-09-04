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
    transferClass: row.transfer_class ?? undefined,
  };
}

/**
 * Practice eligibility (Educational Increment 005 Part A; corrected
 * Decision 152, Protected Mock Content Isolation Correction).
 *
 * ROOT CAUSE OF THE DEFECT THIS REPLACES: the original constant here,
 * `PRACTICE_ELIGIBLE_STATUSES`, accepted `practice_eligible`,
 * `authentic_assessment_candidate`, `independently_validated`, AND
 * `mock_eligible` — modelled as "a row must be at this status OR HIGHER,"
 * treating `eligibility_status` as a single linear ladder where a later
 * stage implies every earlier stage's privileges. That model is wrong:
 * `eligibility_status` actually encodes TWO separate, non-nested tracks
 * that happen to share one column — a Practice track
 * (provisional -> practice_eligible) and a Mock-governance track
 * (authentic_assessment_candidate -> independently_validated ->
 * mock_eligible, RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md's own
 * transition sequence). Being further along the Mock track does not mean
 * a row has ever been authorised for Practice; it means the opposite —
 * that row is reserved, protected assessment content specifically
 * because it has NOT been exposed to any learner yet. The old constant's
 * blacklist-shaped exclusion (provisional only) let every Mock-track
 * status silently pass through Practice's own retrieval function,
 * `fetchQuestionBank()` below, into the real Practice session pool
 * (`lib/learningEngine/sessionGenerator.ts`) and the Learn lesson pages
 * (`app/learning-intelligence/learn/mathematics/{percentages,arithmetic}
 * /page.tsx`) — with no downstream re-filter anywhere in
 * `lib/ali/selection.ts` or `lib/learningEngine/*` (confirmed absent by
 * direct search).
 *
 * CORRECTED MODEL: a positive allow-list of exactly one status, per
 * Decision 152's own explicit instruction to prefer
 * `eligibility_status = 'practice_eligible'` over a growing IN-list.
 * "provisional" remains excluded (Increment 004/005's own original
 * intent, unchanged — see the historical note below); every Mock-track
 * status (`authentic_assessment_candidate`, `independently_validated`,
 * `mock_eligible`) is now also structurally excluded, not merely
 * probabilistically unlikely to be selected. This is reinforced, not
 * merely duplicated, at the database layer: migration 100 narrows
 * `ali_question_bank`'s own RLS SELECT policy from "any status except
 * mock_eligible" to this exact same single allowed value (plus the
 * existing admin carve-out for review), so the boundary holds even for a
 * future caller that queries `ali_question_bank` directly, bypassing this
 * function entirely.
 *
 * Historical note on "provisional" (Educational Increment 004/005 Part
 * A): audited first (migration 033), not excluded blindly — 40 of the 46
 * pre-Increment-003 rows carried a disclosed, non-forced Question
 * Type/competency mapping and were promoted to `practice_eligible`; 6
 * (mth-003/004/005/006/007b, wrt-003) have the migration's own inline
 * comment admitting a forced fit, judgement call, or scoring-mechanism
 * irregularity (RELEASE_1_GAP_ANALYSIS.md §4) and remain `provisional`,
 * quarantined from Practice until remediated.
 */
const PRACTICE_ELIGIBLE_STATUS = "practice_eligible";

/**
 * Fetches the ALI question bank filtered to a subject + pathway. Used by
 * the real Practice session generator (`lib/learningEngine/
 * sessionGenerator.ts`), the Learn lesson pages, and
 * `lib/adaptiveMockBuilder.ts` to get the candidate pool for a section
 * before calling `lib/ali/selection.ts`'s `selectQuestions()`.
 *
 * Retirement/provenance/eligibility enforcement (Educational Increment
 * 004 §13, Increment 005 Part A; corrected Decision 152 — see
 * `PRACTICE_ELIGIBLE_STATUS`'s own docstring above for why): excludes
 * active=false, provenance="evidence_only", and every eligibility_status
 * other than exactly "practice_eligible" — all filtered in application
 * code, not via a Postgrest `.neq()`, because provenance/eligibility_
 * status default differently across the bank's history and SQL's
 * `x != 'y'` evaluates to NULL (excluding, not including) for a NULL
 * column; filtering here is correct regardless of which rows have which
 * value set. A row with no eligibility_status at all (should not occur —
 * the column has a NOT NULL default — but handled defensively) is
 * treated as not yet eligible, not silently admitted. This is defence in
 * depth: migration 100's own RLS policy is the authoritative boundary,
 * enforced regardless of what this function does.
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
        q.eligibilityStatus === PRACTICE_ELIGIBLE_STATUS
    );
}

/**
 * Mock firewall (Educational Increment 003, ANGEL_CONTENT_SCALE_GATE_V1.md
 * §16). fetchQuestionBank() above now ALSO enforces eligibility (corrected
 * Decision 152 — historically it did not, see its own docstring), but this
 * function remains independently, explicitly scoped to exactly
 * "mock_eligible" regardless of that other function's own behaviour: a row
 * existing in the bank, and even a row being Practice-eligible, is not the
 * same claim as a row being fit for an authenticated mock. As of this
 * migration, zero rows (old or new) carry "mock_eligible" — by design,
 * since no item has yet had the independent review + pool-balance check
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
