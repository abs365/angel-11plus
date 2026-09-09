import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  // Find this attempt's own pending (requires_manual_marking, subject=writing)
  // outcomes via the report row the caller already owns (RLS-gated read,
  // same as lib/mockAttempt/client.ts's getMockAttemptReport()).
  const { data: reportRow, error: reportError } = await callerClient
    .from("ali_mock_attempt_report")
    .select("question_outcomes")
    .eq("attempt_id", attemptId)
    .maybeSingle();
  if (reportError || !reportRow) {
    return NextResponse.json({ error: "report_not_available" }, { status: 404 });
  }

  const outcomes = (reportRow.question_outcomes as { questionId: string; status: string }[]) ?? [];
  const pendingIds = outcomes.filter((o) => o.status === "requires_manual_marking").map((o) => o.questionId);
  if (pendingIds.length === 0) {
    return NextResponse.json({ assessed: [], alreadyComplete: true });
  }

  const { data: bankRows, error: bankError } = await callerClient
    .from("ali_question_bank")
    .select("id, subject, prompt")
    .in("id", pendingIds);
  if (bankError) return NextResponse.json({ error: "server_error" }, { status: 502 });

  const writingRows = (bankRows ?? []).filter((r) => r.subject === "writing");
  const results: { questionId: string; persisted: boolean; assessmentStatus: string }[] = [];

  for (const row of writingRows) {
    const prompt = row.prompt as { title?: string; type?: string; prompt?: string; checklist?: string[]; stimulus?: { type?: string } };
    const { data: answerRow } = await callerClient
      .from("ali_mock_attempt_answer")
      .select("response")
      .eq("attempt_id", attemptId)
      .eq("question_id", row.id)
      .maybeSingle();
    const responseText = (answerRow?.response as { value?: string } | null)?.value;
    if (!responseText || !responseText.trim()) continue; // genuinely unanswered — nothing to assess

    let assessment: Awaited<ReturnType<typeof assessWritingResponseForMock>>;
    try {
      assessment = await assessWritingResponseForMock(openAiKey, {
        promptTitle: prompt.title ?? row.id,
        promptType: prompt.type ?? "descriptive",
        promptText: prompt.prompt ?? "",
        checklist: prompt.checklist ?? [],
        responseText,
      });
    } catch {
      // A failed AI call is never silently treated as "complete" — the
      // learner/reviewer sees this item still pending, not a fabricated
      // pass. No partial write occurs.
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
      p_question_id: row.id,
      p_task_type: taskType,
      p_rubric_version: RUBRIC_VERSION,
      p_assessment_version: ASSESSMENT_VERSION,
      p_dimensions: assessment.dimensions,
      p_overall_indicator: assessment.overallIndicator,
      p_assessment_status: assessment.assessmentStatus,
      p_review_required_reasons: assessment.reviewRequiredReasons.length > 0 ? assessment.reviewRequiredReasons : null,
      p_automated_model: "gpt-4o-mini",
    });

    results.push({ questionId: row.id, persisted: Boolean(persisted) && !persistError, assessmentStatus: assessment.assessmentStatus });
  }

  return NextResponse.json({ assessed: results });
}
