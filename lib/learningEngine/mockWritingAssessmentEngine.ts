import { runWritingPreflightChecks, computeOverallScoreFromDimensions, WRITING_DIMENSIONS, WRITING_DIMENSION_LABEL } from "./writingRubric";
import { WRITING_FEEDBACK_SYSTEM_PROMPT, buildWritingFeedbackUserMessage, stripDashPunctuation } from "./writingFeedbackPrompt";
import type { WritingDimensionFeedback } from "@/types/writing-feedback";

/**
 * Migration 245 — Mock-grade Continuous Writing assessment engine.
 *
 * Deliberately NOT a refactor of app/api/writing-feedback/route.ts (the
 * live, working Practice feedback endpoint) — per the governing brief's
 * own instruction to keep Practice and Mock experiences separate, that
 * route is left completely untouched. This module reuses the SAME
 * underlying, already-tested primitives it depends on
 * (runWritingPreflightChecks, WRITING_FEEDBACK_SYSTEM_PROMPT,
 * buildWritingFeedbackUserMessage, computeOverallScoreFromDimensions) —
 * zero new classification logic — but adds one new thing neither the
 * rubric module nor the Practice route has: a DETERMINISTIC assessment_
 * status derivation (`complete` vs `review_required`), reusing the
 * pre-flight gate's own already-computed, already-deterministic signals
 * (meetsMinimumLength / likelyOffTopic / likelyTemplateOrCopied / each
 * dimension's own `confident` flag) — never model self-confidence, never
 * an invented percentage, exactly as the governing brief requires.
 */

export interface MockWritingAssessmentInput {
  promptTitle: string;
  promptType: string;
  promptText: string;
  checklist: string[];
  responseText: string;
  modelText?: string;
}

export interface MockWritingAssessmentResult {
  dimensions: WritingDimensionFeedback[];
  overallIndicator: number;
  assessmentStatus: "complete" | "review_required";
  reviewRequiredReasons: string[];
}

/** Deterministic reasons only — the exact signals named in the governing brief §5 ("evidence is insufficient", "rubric dimensions cannot be assessed reliably"), never a free-text model excuse. */
function deriveReviewRequiredReasons(
  preflight: ReturnType<typeof runWritingPreflightChecks>,
  dimensions: WritingDimensionFeedback[]
): string[] {
  const reasons: string[] = [];
  if (!preflight.meetsMinimumLength) reasons.push(`response is shorter than the CSSE-evidenced minimum of ${preflight.sentenceCount < 1 ? 0 : preflight.sentenceCount} sentence(s) (aim for at least six)`);
  if (preflight.likelyOffTopic) reasons.push("response does not appear to engage with the set prompt");
  if (preflight.likelyTemplateOrCopied) reasons.push("response is suspiciously close to the family's own worked example");
  const unconfidentDimensions = dimensions.filter((d) => !d.confident).map((d) => WRITING_DIMENSION_LABEL[d.dimension]);
  if (unconfidentDimensions.length > 0) reasons.push(`could not reliably assess: ${unconfidentDimensions.join(", ")}`);
  return reasons;
}

/**
 * Calls the OpenAI model directly (this function must only ever run
 * server-side — the API key is never sent to a browser) and validates/
 * sanitises the result with the exact same defensive discipline as the
 * live Practice route: every dimension is present (defaulted to
 * "developing" + an honest degraded comment if the model omitted it),
 * the pre-flight gate's own confidence verdict is a hard ceiling the
 * model cannot override, and overallIndicator is always computed
 * deterministically server-side, never trusted from the model.
 */
export async function assessWritingResponseForMock(
  apiKey: string,
  input: MockWritingAssessmentInput
): Promise<MockWritingAssessmentResult> {
  const preflight = runWritingPreflightChecks(input.responseText, input.promptText, input.modelText);
  const preflightFlags: string[] = [];
  if (!preflight.meetsMinimumLength) preflightFlags.push(`shorter than the CSSE-evidenced minimum of ${preflight.sentenceCount < 1 ? "0" : preflight.sentenceCount} sentence(s) detected (aim for at least six)`);
  if (preflight.likelyOffTopic) preflightFlags.push("may not engage with the actual prompt");
  const preflightNote = preflightFlags.length > 0 ? `\nAutomatic pre-check flags (verify honestly, do not ignore): ${preflightFlags.join("; ")}.` : "";

  const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: WRITING_FEEDBACK_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildWritingFeedbackUserMessage(
            { promptTitle: input.promptTitle, promptType: input.promptType, promptText: input.promptText, writingText: input.responseText, checkedItems: input.checklist },
            preflightNote
          ),
        },
      ],
      temperature: 0.3,
      max_tokens: 1300,
      response_format: { type: "json_object" },
    }),
  });

  if (!openAiResponse.ok) {
    const errText = await openAiResponse.text().catch(() => "");
    throw new Error(`OpenAI request failed (${openAiResponse.status}): ${errText.slice(0, 300)}`);
  }

  const completion = await openAiResponse.json();
  const raw = completion?.choices?.[0]?.message?.content;
  if (!raw) throw new Error("OpenAI returned an empty response");

  let parsed: { dimensions?: unknown };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("OpenAI response could not be parsed as JSON");
  }

  const validLevels = new Set(["developing", "secure", "strong"]);
  const rawDimensions = Array.isArray(parsed.dimensions) ? (parsed.dimensions as Record<string, unknown>[]) : [];
  const dimensions: WritingDimensionFeedback[] = WRITING_DIMENSIONS.map((dimension) => {
    const found = rawDimensions.find((d) => d && d.dimension === dimension);
    const level = found && validLevels.has(found.level as string) ? (found.level as WritingDimensionFeedback["level"]) : "developing";
    const comment =
      found && typeof found.comment === "string" && (found.comment as string).trim()
        ? stripDashPunctuation(found.comment as string)
        : `Angel could not generate a reliable comment on ${WRITING_DIMENSION_LABEL[dimension]} for this response.`;
    const modelConfident = Boolean(found?.confident);
    return { dimension, level, comment, confident: preflight.confidence === "low" ? false : modelConfident };
  });

  const overallIndicator = computeOverallScoreFromDimensions(dimensions);
  const reviewRequiredReasons = deriveReviewRequiredReasons(preflight, dimensions);
  const assessmentStatus: "complete" | "review_required" = reviewRequiredReasons.length > 0 ? "review_required" : "complete";

  return { dimensions, overallIndicator, assessmentStatus, reviewRequiredReasons };
}
