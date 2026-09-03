import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scoreReadingAttempt } from "@/lib/server/mockScoringAuthority";

/**
 * Programme Completion Increment 016 — Authoritative Reading Comprehension
 * Scoring, the one HTTP surface a learner's own browser may call after a
 * genuine Reading Mock submission. Deliberately thin: this route's own
 * job is exactly one thing — confirm the CALLER genuinely owns the
 * attempt they're asking about, using the SAME RLS-scoped read every
 * other Mock read in this app already uses (the caller's own forwarded
 * access token, anon key, no elevated privilege at all) — then hand off
 * to lib/server/mockScoringAuthority.ts's own, separately-verified
 * (status/form/manifest/marks/TIER3) privileged operation. This route
 * itself asserts nothing about correctness, marks, or scoring state; it
 * only decides whether this caller is allowed to REQUEST that their own
 * attempt be processed — an ordinary web-app authorization check, not a
 * scoring-integrity boundary (that boundary lives entirely inside
 * migration 219's own functions, and holds regardless of what this route
 * does or fails to do).
 */
export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Missing authorization." }, { status: 401 });
  }

  let attemptId: string;
  try {
    const body = await request.json();
    attemptId = body.attemptId;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!attemptId || typeof attemptId !== "string") {
    return NextResponse.json({ error: "attemptId is required." }, { status: 400 });
  }

  // RLS-scoped read using the caller's own forwarded session — the same
  // trust level as every other Mock read this app already performs
  // client-side, not the privileged scoring connection. A caller can only
  // ever see their own attempts here; this is ordinary RLS, unmodified.
  const learnerClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: attempt, error } = await learnerClient
    .from("ali_mock_attempt")
    .select("id, status, form_id")
    .eq("id", attemptId)
    .maybeSingle();

  if (error || !attempt) {
    return NextResponse.json({ error: "Attempt not found." }, { status: 404 });
  }
  if (attempt.status !== "submitted") {
    return NextResponse.json({ error: "Attempt is not submitted." }, { status: 409 });
  }
  if (attempt.form_id !== "reading-comprehension-mock-1") {
    return NextResponse.json({ error: "Not a Reading Comprehension Mock 1 attempt." }, { status: 400 });
  }

  const result = await scoreReadingAttempt(attemptId);
  return NextResponse.json(result);
}
