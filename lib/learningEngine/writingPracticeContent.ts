import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { WritingPrompt } from "@/types";

/**
 * Programme Completion Increment 004 (Founder-authorised) — the real
 * content source for CSSE Writing Practice: `ali_question_bank`, subject
 * = 'writing', gated by the same `eligibility_status = 'practice_eligible'`
 * boundary every other Practice surface in this codebase already respects
 * (and that `recordLegacyPracticeEvidence()`'s own bank lookup now
 * enforces too, per this increment's own integrity correction). This
 * module deliberately does NOT read `data/writing.ts`'s static fixture —
 * fixture-only content must never be served as though it were approved
 * Practice content.
 *
 * Readiness is a SEPARATE question from "does any real content exist."
 * `isWritingPracticeReady()` requires genuine response-shape diversity
 * (at least WRITING_READINESS_MIN_PROMPTS prompts across at least
 * WRITING_READINESS_MIN_SHAPES distinct `type` values), not merely a
 * non-zero count — the Founder's own explicit instruction: "DO NOT
 * publicly activate a one-prompt Writing programme... the learner-facing
 * CSSE Writing Practice state must remain honestly not ready" until
 * genuine breadth exists. As of this increment, zero rows are
 * `practice_eligible` (wrt-003 remains `provisional`; migrations 196/197
 * are NOT APPLIED) — so this correctly and honestly evaluates to "not
 * ready" today. Activation later becomes a content/review decision (apply
 * pending migrations, promote reviewed content), never a further
 * engineering task — this module needs no further change for that.
 */

export const WRITING_READINESS_MIN_PROMPTS = 2;
export const WRITING_READINESS_MIN_SHAPES = 2;

/**
 * Defensive shape validation, matching this codebase's own established
 * convention (e.g. lib/mockAttempt/redaction.ts's isValidMockQuestionPayload)
 * — a malformed or unexpectedly-shaped stored prompt is silently excluded,
 * never rendered. No fixture fallback of any kind.
 */
function isValidWritingPrompt(value: unknown): value is WritingPrompt {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.title === "string" &&
    typeof v.prompt === "string" &&
    (v.type === "narrative" || v.type === "descriptive" || v.type === "persuasive") &&
    typeof v.difficulty === "string" &&
    typeof v.timeMinutes === "number" &&
    Array.isArray(v.checklist) &&
    v.checklist.every((item) => typeof item === "string")
  );
}

/**
 * Fetches every genuinely practice_eligible, active Writing prompt.
 * Returns an empty array (never throws, never fabricates) on any error or
 * when no row is yet practice_eligible — the honest "nothing ready yet"
 * state, distinct from a network/client failure only in that both are
 * treated identically by the caller: no real content, no fixture stand-in.
 */
export async function fetchEligibleWritingPrompts(
  supabase: SupabaseClient<Database> | null
): Promise<WritingPrompt[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("ali_question_bank")
    .select("prompt")
    .eq("subject", "writing")
    .eq("eligibility_status", "practice_eligible")
    .eq("active", true);
  if (error || !data) return [];
  return data.map((row) => row.prompt).filter(isValidWritingPrompt);
}

/**
 * The one authoritative answer to "can Angel actually deliver real,
 * evidence-backed Writing Practice right now" — genuine breadth, not mere
 * existence. Mirrors the Mock Centre's own `isMockFormAvailable()`
 * discipline: a learner-facing "ready" claim must never be shown unless
 * this returns true.
 */
export function isWritingPracticeReady(prompts: WritingPrompt[]): boolean {
  if (prompts.length < WRITING_READINESS_MIN_PROMPTS) return false;
  const shapes = new Set(prompts.map((p) => p.type));
  return shapes.size >= WRITING_READINESS_MIN_SHAPES;
}
