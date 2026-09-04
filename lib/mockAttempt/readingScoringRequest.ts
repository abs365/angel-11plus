import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Programme Completion Increment 016, Founder invocation-reliability
 * repair (the increment that replaced the original fire-and-forget
 * `requestReadingScoring()` inline in app/learning-intelligence/mock-exam/
 * page.tsx). Shared by both callers of the one existing Reading scoring
 * HTTP surface (app/api/mock-reading-scoring/route.ts):
 *   - the mock-exam page, immediately after a genuine timed_section
 *     submission;
 *   - the mock-report page, as a bounded, idempotent recovery attempt
 *     when a submitted Reading Comprehension Mock 1 attempt's report is
 *     not yet visible (see lib/mockAttempt/workspace.ts's own
 *     isReadingScoringRecoveryEligible()).
 *
 * This module fixes the ORIGINAL defect (Founder investigation, this same
 * increment): the prior implementation awaited nothing beyond the fetch
 * call itself, never inspected `response.ok`, and discarded every HTTP
 * failure identically to a success. It does NOT change the underlying
 * contract this app already validated: still supplies only the attempt id
 * the caller already legitimately owns (no correctness/marks/answer claim
 * of any kind originates here), still authenticates via the caller's own
 * forwarded session token, still never awaited by either call site's own
 * submission-confirmation logic (see each call site's own comment for
 * why) — only what happens to the RESULT of that request has changed.
 */

/**
 * The one bounded outcome shape either caller ever sees. `reason` is
 * always a short, already-bounded category string — either one of this
 * module's own literal fallbacks, or the API route's own `error`/`reason`
 * field (itself never learner content — see route.ts's own contract:
 * every error string it returns is a fixed, developer-authored literal,
 * never anything read from the request body or database content).
 */
export type ReadingScoringRequestOutcome =
  | { ok: true; status: number }
  | { ok: false; status: number | null; reason: string };

const BOUNDED_REASON_MAX_LENGTH = 120;

/**
 * Reads a failure response's own bounded `error`/`reason` field, never the
 * full body. Falls back to a plain `http_<status>` literal for a body that
 * is missing, unparsable, or shaped unexpectedly — this function must
 * never throw and must never return anything beyond
 * BOUNDED_REASON_MAX_LENGTH characters, regardless of what the server
 * sent.
 */
async function boundedFailureReason(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    const candidate =
      body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : body && typeof body === "object" && "reason" in body && typeof (body as { reason: unknown }).reason === "string"
          ? (body as { reason: string }).reason
          : `http_${response.status}`;
    return candidate.slice(0, BOUNDED_REASON_MAX_LENGTH);
  } catch {
    return `http_${response.status}`;
  }
}

/**
 * Requests that a just-submitted (or, via the report page's own recovery
 * path, already-submitted) Reading attempt be scored. Always resolves —
 * never throws — with a typed outcome describing what actually happened,
 * so a caller can choose to log, retry, or ignore it, rather than the
 * outcome being silently indistinguishable from success.
 *
 * Deliberately still returns a Promise rather than blocking anything
 * itself: whether this is awaited, or fired with `void ...then(...)` and
 * left to resolve on its own, is each CALL SITE's own decision — see each
 * one's own comment. This function's own contract is only: inspect the
 * real result, never assume, never leak anything beyond a bounded reason
 * string.
 */
export async function requestReadingScoring(
  supabase: SupabaseClient<Database> | null,
  attemptId: string
): Promise<ReadingScoringRequestOutcome> {
  if (!supabase) return { ok: false, status: null, reason: "no_client" };
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return { ok: false, status: null, reason: "no_session" };

    const response = await fetch("/api/mock-reading-scoring", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ attemptId }),
    });
    if (!response.ok) {
      return { ok: false, status: response.status, reason: await boundedFailureReason(response) };
    }
    return { ok: true, status: response.status };
  } catch {
    // A thrown fetch (offline, aborted, DNS failure, etc.) — never the
    // caller's problem to unwind; still resolves to a typed outcome, and
    // still never blocks/undoes the learner's own already-successful
    // assessment submission (mock_submit_attempt() has already committed
    // by the time either call site reaches this function).
    return { ok: false, status: null, reason: "network_error" };
  }
}

/**
 * The one sanctioned place either call site logs a non-success outcome —
 * console only, bounded reason only, never the token, never any response
 * content beyond the already-bounded `reason` string, never a learner
 * answer (this function never even sees one; nothing in this module's own
 * request body or response handling ever touches answer content).
 */
export function logReadingScoringRequestOutcome(outcome: ReadingScoringRequestOutcome): void {
  if (outcome.ok) return;
  console.warn("[MockExam] Reading scoring request did not succeed (non-blocking):", outcome.status, outcome.reason);
}
