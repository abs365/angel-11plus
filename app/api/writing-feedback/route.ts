import { NextRequest, NextResponse } from "next/server";
import type { WritingFeedbackRequest, WritingFeedback, WritingDimensionFeedback } from "@/types/writing-feedback";
import { runWritingPreflightChecks, WRITING_DIMENSIONS, WRITING_DIMENSION_LABEL, computeOverallScoreFromDimensions } from "@/lib/learningEngine/writingRubric";
import { WRITING_FEEDBACK_SYSTEM_PROMPT, stripDashPunctuation, buildWritingFeedbackUserMessage } from "@/lib/learningEngine/writingFeedbackPrompt";

/**
 * CSSE Completion Programme, Phase D
 * (ANGEL_PHASE_D_CONTINUOUS_WRITING_STANDARD_V1.md Part 4/5). The system
 * prompt and user-message builder live in
 * lib/learningEngine/writingFeedbackPrompt.ts (a Next-independent
 * module) specifically so scripts/writing-rubric-calibration.mjs can
 * import the exact same prompt this route sends — no separately-
 * maintained copy that could drift from what is actually deployed.
 */

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Smart feedback is temporarily unavailable." },
      { status: 503 }
    );
  }

  let body: WritingFeedbackRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.writingText || body.writingText.trim().split(/\s+/).length < 10) {
    return NextResponse.json({ error: "Writing is too short to analyse." }, { status: 400 });
  }

  // CSSE Completion Programme Phase D — pre-flight confidence gate
  // (lib/learningEngine/writingRubric.ts), run before the AI call. This
  // is advisory context for the model (a hint, since the heuristic can
  // be wrong), but its own `confidence` verdict is enforced as a hard,
  // deterministic ceiling on the returned dimensions below — never
  // merely a suggestion the model can override by claiming confidence
  // itself.
  const preflight = runWritingPreflightChecks(body.writingText, body.promptText);
  const preflightFlags: string[] = [];
  if (!preflight.meetsMinimumLength) preflightFlags.push(`shorter than the CSSE-evidenced minimum of ${preflight.sentenceCount < 1 ? "0" : preflight.sentenceCount} sentence(s) detected (aim for at least six)`);
  if (preflight.likelyOffTopic) preflightFlags.push("may not engage with the actual prompt");
  const preflightNote = preflightFlags.length > 0 ? `\nAutomatic pre-check flags (verify honestly, do not ignore): ${preflightFlags.join("; ")}.` : "";

  let openAiResponse: Response;
  try {
    openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: WRITING_FEEDBACK_SYSTEM_PROMPT },
          { role: "user", content: buildWritingFeedbackUserMessage(body, preflightNote) },
        ],
        temperature: 0.3,
        max_tokens: 1300,
        response_format: { type: "json_object" },
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Smart feedback is temporarily unavailable. Please check your connection." },
      { status: 502 }
    );
  }

  if (!openAiResponse.ok) {
    const errText = await openAiResponse.text().catch(() => "");
    console.error("OpenAI error:", openAiResponse.status, errText);
    return NextResponse.json(
      { error: "Smart feedback is temporarily unavailable. Please try again." },
      { status: 502 }
    );
  }

  const completion = await openAiResponse.json();
  const raw = completion?.choices?.[0]?.message?.content;

  if (!raw) {
    return NextResponse.json(
      { error: "AI returned an empty response. Please try again." },
      { status: 502 }
    );
  }

  let feedback: WritingFeedback;
  try {
    feedback = JSON.parse(raw) as WritingFeedback;
  } catch {
    console.error("Failed to parse AI response:", raw);
    return NextResponse.json(
      { error: "AI response could not be parsed. Please try again." },
      { status: 502 }
    );
  }

  // CSSE Completion Programme Phase D — validate and sanitize the
  // dimensions array defensively (an LLM's JSON structure is never
  // guaranteed byte-for-byte even with response_format: json_object),
  // then enforce the pre-flight gate's own confidence verdict as a hard
  // ceiling: if the deterministic check found low confidence, every
  // dimension is forced to confident: false regardless of what the
  // model itself claimed — a code-level guarantee, not merely a prompt
  // instruction the model could fail to follow.
  const validLevels = new Set(["developing", "secure", "strong"]);
  const rawDimensions = Array.isArray(feedback.dimensions) ? feedback.dimensions : [];
  feedback.dimensions = WRITING_DIMENSIONS.map((dimension) => {
    const found = rawDimensions.find((d) => d && d.dimension === dimension);
    const level = found && validLevels.has(found.level) ? found.level : "developing";
    const comment = found && typeof found.comment === "string" && found.comment.trim()
      ? found.comment
      : `Angel could not generate a reliable comment on ${WRITING_DIMENSION_LABEL[dimension]} for this response.`;
    const modelConfident = Boolean(found?.confident);
    return {
      dimension,
      level,
      comment,
      confident: preflight.confidence === "low" ? false : modelConfident,
    } satisfies WritingDimensionFeedback;
  });

  // Never trust the model's own overallScore: found via live calibration
  // (scripts/writing-rubric-calibration.mjs) that the model does not
  // reliably include this key at all (finish_reason "stop", not
  // truncated — a genuine omission, not a length limit), which the
  // previous code's `?? 0` fallback would have silently turned into a
  // fake "0/100". Always computed deterministically from the five
  // (now-validated) dimension levels instead, so it can never be
  // missing and can never disagree with the dimensions shown alongside it.
  feedback.overallScore = computeOverallScoreFromDimensions(feedback.dimensions);

  // Copy Quality Guard (runtime): the system prompt instructs the model not
  // to use em/en dash punctuation, but an LLM cannot be guaranteed to
  // comply, so every AI-generated field is swept as a safety net before it
  // reaches a learner. `suggestedUpgrade.original` is deliberately excluded:
  // it must stay a verbatim quote of the student's own writing, dash and
  // all, per this route's own "take ONE short excerpt... verbatim" instruction.
  feedback.strengths = feedback.strengths.map(stripDashPunctuation) as [string, string];
  feedback.areasToImprove = feedback.areasToImprove.map(stripDashPunctuation);
  feedback.suggestedUpgrade.improved = stripDashPunctuation(feedback.suggestedUpgrade.improved);
  feedback.suggestedUpgrade.explanation = stripDashPunctuation(feedback.suggestedUpgrade.explanation);
  feedback.tutorTip = stripDashPunctuation(feedback.tutorTip);
  feedback.dimensions = feedback.dimensions.map((d) => ({ ...d, comment: stripDashPunctuation(d.comment) }));

  return NextResponse.json(feedback);
}
