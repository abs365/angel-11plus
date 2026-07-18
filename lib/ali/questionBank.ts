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
  };
}

/**
 * Fetches the ALI question bank filtered to a subject + pathway. Used by
 * lib/adaptiveMockBuilder.ts to get the candidate pool for a section before
 * calling lib/ali/selection.ts's selectQuestions().
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

  return data.map(rowToBankQuestion);
}
