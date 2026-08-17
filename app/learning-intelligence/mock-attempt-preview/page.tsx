"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { createMockAttempt, startMockAttempt, getMockQuestion, submitMockAnswer, submitMockAttempt } from "@/lib/mockAttempt/client";
import type { MockQuestionPayload } from "@/lib/mockAttempt/types";

/**
 * Programme Increment 008D, Part 11/12 — the first real Mock experience
 * shell. Deliberately unlinked from every navigation surface (no
 * Navigation.tsx entry, no PageLayout wrapper) — this is a foundation
 * preview, not the final visual redesign, and must not be reachable by a
 * real learner browsing the app normally.
 *
 * Requires migration 070 to be applied AND a test fixture form to exist
 * (see scripts/verify-mock-attempt-engine.mjs's own header for the exact
 * SQL) — if either is missing, this page fails honestly rather than
 * crashing or fabricating content.
 *
 * Visual principles applied (008A's own standard, reused): no XP/streak/
 * confetti, calm and serious tone, clear question/timer hierarchy, no
 * gamified rewards anywhere in this flow.
 */

const TEST_FORM_ID = "008d-test-fixture-form";

type Phase = "pre-exam" | "in-progress" | "submitted" | "error";

export default function MockAttemptPreviewPage() {
  const [phase, setPhase] = useState<Phase>("pre-exam");
  const [error, setError] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<MockQuestionPayload | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (phase !== "in-progress" || !expiresAt) return;
    const tick = () => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setRemainingSeconds(remaining);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [phase, expiresAt]);

  async function handleBeginAssessment() {
    setError(null);
    const supabase = getSupabaseClient();
    if (!supabase) { setError("Not connected."); setPhase("error"); return; }
    const profileId = await ensureProfile();
    if (!profileId) { setError("Could not establish a learner profile."); setPhase("error"); return; }

    const created = await createMockAttempt(supabase, TEST_FORM_ID, "diagnostic_mock");
    if (created.error || !created.data) { setError(created.error ?? "Could not create an attempt."); setPhase("error"); return; }

    const started = await startMockAttempt(supabase, created.data, 30);
    if (started.error || !started.data) { setError(started.error ?? "Could not start the attempt."); setPhase("error"); return; }

    setAttemptId(created.data);
    setExpiresAt(started.data.expiresAt);

    const question = await getMockQuestion(supabase, created.data, "mr01-wholenum-01");
    if (question.error || !question.data) { setError(question.error ?? "Could not retrieve the first question."); setPhase("error"); return; }
    setCurrentQuestion(question.data);
    setPhase("in-progress");
  }

  async function handleSubmitAssessment() {
    if (!attemptId) return;
    setSubmitting(true);
    const supabase = getSupabaseClient();
    if (!supabase) return;
    if (currentQuestion && answer.trim()) {
      await submitMockAnswer(supabase, attemptId, currentQuestion.questionId, { value: answer.trim() });
    }
    const result = await submitMockAttempt(supabase, attemptId);
    setSubmitting(false);
    if (result.error) { setError(result.error); setPhase("error"); return; }
    setPhase("submitted");
  }

  const shellStyle = { minHeight: "100vh", background: "#f7f8fa", color: "#1a1d23", fontFamily: "system-ui, sans-serif" };

  if (phase === "error") {
    return (
      <div style={shellStyle}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "48px 20px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Assessment foundation preview</p>
          <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.6 }}>This assessment could not be started. {error}</p>
        </div>
      </div>
    );
  }

  if (phase === "pre-exam") {
    return (
      <div style={shellStyle}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "48px 20px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Assessment foundation preview</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 12 }}>Before you begin</h1>
          <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.6, color: "#374151" }}>
            This assessment is timed. Answer each question as best you can. You will not see whether an answer is correct until your report is ready.
          </p>
          <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.6, color: "#374151" }}>
            Once you submit, the assessment is complete and cannot be changed.
          </p>
          <button
            onClick={handleBeginAssessment}
            style={{ marginTop: 28, padding: "12px 24px", background: "#1a1d23", color: "#fff", borderRadius: 8, fontWeight: 600, fontSize: 15, border: "none", cursor: "pointer" }}
          >
            Begin assessment
          </button>
        </div>
      </div>
    );
  }

  if (phase === "submitted") {
    return (
      <div style={shellStyle}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "48px 20px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Assessment foundation preview</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 12 }}>Your assessment has been submitted</h1>
          <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.6, color: "#374151" }}>
            Your assessment is being processed. Your report will be ready soon.
          </p>
        </div>
      </div>
    );
  }

  // in-progress
  const minutes = remainingSeconds != null ? Math.floor(remainingSeconds / 60) : null;
  const seconds = remainingSeconds != null ? remainingSeconds % 60 : null;
  return (
    <div style={shellStyle}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>Question 1</p>
          <p style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {minutes != null ? `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}` : "--:--"}
          </p>
        </div>
        {currentQuestion && (
          <div style={{ marginTop: 28 }}>
            <p style={{ fontSize: 17, lineHeight: 1.6 }}>{String(currentQuestion.question)}</p>
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Your answer"
              style={{ marginTop: 20, width: "100%", padding: "10px 14px", fontSize: 15, border: "1px solid #d1d5db", borderRadius: 8 }}
            />
          </div>
        )}
        <button
          onClick={handleSubmitAssessment}
          disabled={submitting}
          style={{ marginTop: 32, padding: "12px 24px", background: "#1a1d23", color: "#fff", borderRadius: 8, fontWeight: 600, fontSize: 15, border: "none", cursor: "pointer", opacity: submitting ? 0.6 : 1 }}
        >
          {submitting ? "Submitting…" : "Submit assessment"}
        </button>
      </div>
    </div>
  );
}
