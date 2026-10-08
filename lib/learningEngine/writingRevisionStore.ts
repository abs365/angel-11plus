import { getSupabaseClient } from "@/lib/supabase";
import { isTextFreeEvent, type RevisionEvidenceEvent } from "./writingRevision";

/**
 * Best-effort recording of the text-free revision event (see writingRevision.ts). It is OFF until the Founder applies
 * migration 270 and sets NEXT_PUBLIC_WRITING_REVISION_EVENTS=1: until then the learning loop works fully on the
 * learner's screen and nothing is sent. Failures never affect the learner. Refuses anything that is not text-free.
 * Never writes to question outcomes, mastery, or the original attempt's evidence.
 */
export async function recordWritingRevisionEvent(event: RevisionEvidenceEvent): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_WRITING_REVISION_EVENTS !== "1") return false;
  if (!isTextFreeEvent(event)) return false;
  const client = getSupabaseClient();
  if (!client) return false;
  const { data, error } = await client.rpc("record_writing_revision_event" as never, {
    p_question_id: event.questionId,
    p_session_key: event.sessionKey,
    p_chosen_area: event.chosenArea,
    p_original_reads: event.originalReads,
    p_revised_reads: event.revisedReads,
    p_word_count_change_band: event.wordCountChangeBand,
  } as never);
  return !error && data === true;
}
