import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { forwardedLearnerHeaders } from "@/lib/learnerRequestForwarding";
import { assessWritingResponseForMock } from "@/lib/learningEngine/mockWritingAssessmentEngine";

/**
 * Migration 245 — Mock-grade Continuous Writing assessment, transport +
 * orchestration. Mirrors app/api/mock-release-report/route.ts's own
 * established pattern exactly: the caller's own forwarded session (never
 * a privileged connection) drives every database read/write, so every
 * real authorization decision is made by the database's own
 * `mock_persist_writing_assessment()` (migration 245) and existing RLS
 * policies, never by this route.
 *
 * The one thing this route does that a pure-transport route does not:
 * calls OpenAI (server-side only, the API key never reaches a browser)
 * to compute the assessment before persisting it. This can only ever run
 * AFTER a Mock attempt is submitted (the RPC itself refuses any attempt
 * that is not `status = 'submitted'`) — never during the live, sealed
 * paper. Keeps Practice's own /api/writing-feedback route completely
 * untouched, per the governing brief's own instruction to keep Practice
 * and Mock experiences separate.
 */

/**
 * CSSE Two-Paper Mock P1 Repair, recovery-path defect — production
 * evidence proved this route could return 200 with an empty `assessed`
 * array (ali_writing_assessment stays empty) while leaving ZERO server-
 * side trace of why: a failed OpenAI call or a failed persist RPC were
 * both silently `continue`d per item, with no console output of any
 * kind. The sibling /api/mock-reading-scoring route already solved this
 * exact observability gap (Increment 016's own logScoringEvent) -- this
 * mirrors that same, already-approved pattern exactly: one fixed,
 * developer-authored literal per event, never the learner's own response
 * text, never the OpenAI API key, never the raw exception object.
 */
type WritingLogStage = "config" | "auth" | "request" | "pending-lookup" | "bank-lookup" | "assess" | "persist" | "summary";

function logWritingAssessmentEvent(
  attemptId: string,
  stage: WritingLogStage,
  outcome: "success" | "failure",
  detail?: string
): void {
  console.log(
    JSON.stringify({
      scope: "mock-writing-assessment",
      attemptId,
      stage,
      outcome,
      detail: detail ? detail.slice(0, 200) : undefined,
      at: new Date().toISOString(),
    })
  );
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RUBRIC_VERSION = 1;
const ASSESSMENT_VERSION = 1;

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!url || !anonKey) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  if (!openAiKey) return NextResponse.json({ error: "assessment_unavailable" }, { status: 503 });

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const { attemptId } = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  if (typeof attemptId !== "string" || !UUID_PATTERN.test(attemptId)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  // The caller's own forwarded session — identical pattern to every other
  // Mock route in this app. Every DB read below is RLS-scoped to this
  // caller's own attempts; every write goes through a SECURITY DEFINER
  // function that independently re-validates ownership.
  const callerClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader, ...forwardedLearnerHeaders(request) } },
    auth: { persistSession: false },
  });

  // Find this attempt's own pending (requires_manual_marking, subject=writing)
  // question ids via mock_get_pending_writing_question_ids() (migration
  // 253) -- NOT a direct read of ali_mock_attempt_report, whose own SELECT
  // policy (ali_mock_attempt_report_select_released, migration 072) is
  // scoped to "owner AND released": this route runs specifically to help
  // an unreleased attempt reach a releasable state, so a direct RLS-gated
  // read here always returned zero rows for exactly the case this route
  // exists to serve (production-confirmed: 404 "report_not_available" for
  // every genuinely eligible, unreleased request). The new function
  // resolves ownership internally (profile_id = caller, never RLS) and
  // exposes only the bounded list this route needs -- no other report
  // field is ever read pre-release by this route.
  const { data: pendingIds, error: pendingError } = await callerClient.rpc("mock_get_pending_writing_question_ids", {
    p_attempt_id: attemptId,
  });
  if (pendingError) {
    logWritingAssessmentEvent(attemptId, "pending-lookup", "failure", pendingError.message);
    return NextResponse.json({ error: "report_not_available" }, { status: 404 });
  }
  if (!pendingIds || pendingIds.length === 0) {
    logWritingAssessmentEvent(attemptId, "pending-lookup", "success", "no_pending_items");
    return NextResponse.json({ assessed: [], alreadyComplete: true });
  }
  logWritingAssessmentEvent(attemptId, "pending-lookup", "success", `pending_count:${pendingIds.length}`);

  // Migration 254 — ali_question_bank's own RLS (ali_question_bank_select_
  // all, migration 100) only lets a non-admin caller see practice_eligible
  // rows; both Writing questions are mock_eligible, so a plain RLS-scoped
  // read here always returned zero rows (production-confirmed: pending_
  // count:2 immediately followed by assessed_count:0, no "assess" stage
  // log for either question -- writingRows was silently empty). This
  // function bypasses that RLS the same way every other Mock content-
  // delivery function already does (mock_get_question(), migration 070),
  // never by relaxing the policy itself, and internally reuses (never
  // reimplements) mock_get_pending_writing_question_ids()'s own
  // ownership/pending derivation.
  const { data: writingRows, error: bankError } = await callerClient.rpc("mock_get_writing_question_content", {
    p_attempt_id: attemptId,
  });
  if (bankError) {
    logWritingAssessmentEvent(attemptId, "bank-lookup", "failure", bankError.message);
    return NextResponse.json({ error: "server_error" }, { status: 502 });
  }
  const results: { questionId: string; persisted: boolean; assessmentStatus: string }[] = [];

  for (const row of writingRows) {
    const questionId = row.question_id;
    const prompt = row.prompt as { title?: string; type?: string; prompt?: string; checklist?: string[]; stimulus?: { type?: string } };
    const { data: answerRow } = await callerClient
      .from("ali_mock_attempt_answer")
      .select("response")
      .eq("attempt_id", attemptId)
      .eq("question_id", questionId)
      .maybeSingle();
    const responseText = (answerRow?.response as { value?: string } | null)?.value;
    if (!responseText || !responseText.trim()) {
      logWritingAssessmentEvent(attemptId, "assess", "success", `${questionId}:unanswered`);
      continue; // genuinely unanswered — nothing to assess
    }

    let assessment: Awaited<ReturnType<typeof assessWritingResponseForMock>>;
    try {
      assessment = await assessWritingResponseForMock(openAiKey, {
        promptTitle: prompt.title ?? questionId,
        promptType: prompt.type ?? "descriptive",
        promptText: prompt.prompt ?? "",
        checklist: prompt.checklist ?? [],
        responseText,
      });
    } catch (err) {
      // A failed AI call is never silently treated as "complete" — the
      // learner/reviewer sees this item still pending, not a fabricated
      // pass. No partial write occurs. Now logged (bounded, never the
      // learner's own response text or the API key) instead of vanishing
      // without trace.
      logWritingAssessmentEvent(attemptId, "assess", "failure", `${questionId}:${err instanceof Error ? err.message : "unknown"}`);
      continue;
    }

    // CSSE Two-Paper Mock, pre-activation completion pass (migration 246)
    // — this route has no access to a manifest's own "section" label
    // (it only ever fetches ali_question_bank rows by id), so task type
    // is derived from a real, structural signal already present on the
    // row's own prompt: the CSSE genre split IS the presence of a
    // picture stimulus — Q1 (reflective/discursive) never carries one,
    // Q2 (picture-narrative) always does (see lib/ali/questionFactory/
    // englishQ2PictureNarrativeFamily.ts). Not a guess, and not
    // hardcoded: a genuinely different Writing row shape now correctly
    // resolves to "Q2" instead of silently mislabelling it "Q1".
    const taskType: "Q1" | "Q2" = prompt.stimulus?.type === "image" ? "Q2" : "Q1";

    const { data: persisted, error: persistError } = await (
      callerClient.rpc as unknown as (
        fn: "mock_persist_writing_assessment",
        args: Record<string, unknown>
      ) => Promise<{ data: boolean | null; error: { message: string } | null }>
    )("mock_persist_writing_assessment", {
      p_attempt_id: attemptId,
      p_question_id: questionId,
      p_task_type: taskType,
      p_rubric_version: RUBRIC_VERSION,
      p_assessment_version: ASSESSMENT_VERSION,
      p_dimensions: assessment.dimensions,
      p_overall_indicator: assessment.overallIndicator,
      p_assessment_status: assessment.assessmentStatus,
      p_review_required_reasons: assessment.reviewRequiredReasons.length > 0 ? assessment.reviewRequiredReasons : null,
      p_automated_model: "gpt-4o-mini",
    });

    if (persistError) {
      logWritingAssessmentEvent(attemptId, "persist", "failure", `${questionId}:${persistError.message}`);
    } else {
      logWritingAssessmentEvent(attemptId, "persist", "success", `${questionId}:${assessment.assessmentStatus}`);
    }

    results.push({ questionId, persisted: Boolean(persisted) && !persistError, assessmentStatus: assessment.assessmentStatus });
  }

  logWritingAssessmentEvent(attemptId, "summary", "success", `assessed_count:${results.length}`);
  return NextResponse.json({ assessed: results });
}
