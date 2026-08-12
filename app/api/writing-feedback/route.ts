import { NextRequest, NextResponse } from "next/server";
import type { WritingFeedbackRequest, WritingFeedback } from "@/types/writing-feedback";

// copy-guard-ignore-start: this is an instruction TO the AI model, never
// rendered verbatim to a learner or parent — it is deliberately allowed to
// name the prohibited characters so the model knows what to avoid
// producing in its OWN output. Real learner-facing text (this route's
// NextResponse error strings) stays outside this suppressed span.
const SYSTEM_PROMPT = `You are a supportive writing coach giving 10–11 year olds general, craft-focused feedback on a practice piece of writing.

You are NOT a CSSE (or any other exam board) examiner, and your feedback is NOT a validated or calibrated CSSE mark — do not claim, imply, or reference any specific exam board's marking standard, examiners, or grading criteria anywhere in your response. Give feedback on general writing craft only:
- Originality and imagination
- Technical accuracy: spelling, punctuation, grammar
- Ambitious vocabulary used correctly — not just long words for their own sake
- Varied sentence structures and openings
- A controlled narrative or descriptive voice
- Atmosphere created through technique, not merely description

Your feedback style:
- Reference the student's exact words and phrases wherever possible
- Be specific, not general ("Your use of 'crept' is effective" not "Good verbs")
- Never use empty praise: "Great job!", "Well done!", "Excellent!", "Amazing"
- Be honest about weaknesses — direct, constructive, and encouraging
- Write like a knowledgeable private tutor, not a generic grammar checker

Your analysis covers four areas:
1. Strengths — 2 specific items: what is genuinely working well, with reference to the text
2. Areas to Improve — 2 to 3 specific, actionable issues the student can address now
3. Suggested Upgrade — take ONE short excerpt (1–2 sentences) verbatim from their text and show a stronger version. Explain what changed and name the technique used. Keep the improvement grounded in the student's voice.
4. Tutor Tip — ONE memorable, actionable technique they should apply in their next attempt

overallScore (0–100) is a general writing-quality estimate only — it is not calibrated against any exam board's mark scheme and must not be described as one. Base it on the craft qualities above; do not attach exam-entry or pass/fail-style descriptions to any score range.

If writing is very short (under 60 words), note this in areas to improve.
If writing appears off-topic, note this.

Writing style rule: never use an em dash (—) or en dash (–) as sentence punctuation anywhere in your response. Write natural sentences using full stops, commas, semicolons or colons instead.

Return ONLY valid JSON with no markdown, no preamble, no explanation outside the object:
{
  "strengths": [string, string],
  "areasToImprove": [string, string, string],
  "suggestedUpgrade": {
    "original": string,
    "improved": string,
    "explanation": string
  },
  "tutorTip": string,
  "overallScore": number
}`;
// copy-guard-ignore-end

/**
 * Runtime Copy Quality Guard for AI-generated feedback: replaces an em/en
 * dash used as prose punctuation (surrounded by whitespace, e.g. "strong —
 * but rushed") with a comma. Deliberately leaves a dash with no surrounding
 * whitespace untouched (e.g. "10–15", a numeric range this model has no
 * reason to produce here, but preserved on the same principle as the
 * static guard in scripts/copy-quality-guard.mjs, for consistency).
 */
function stripDashPunctuation(text: string): string {
  return text.replace(/\s+[—–]\s+/g, ", "); // copy-guard-ignore-line: this line's dash characters are the regex pattern being matched, not prose
}

function buildUserMessage(body: WritingFeedbackRequest): string {
  const checklist =
    body.checkedItems.length > 0
      ? `\nChecklist items the student confirmed:\n${body.checkedItems.map((i) => `- ${i}`).join("\n")}`
      : "";

  // Cap at ~1500 words to control token cost
  const words = body.writingText.trim().split(/\s+/);
  const capped = words.length > 1500 ? words.slice(0, 1500).join(" ") + " [...]" : body.writingText;

  return `Writing prompt: "${body.promptTitle}" (${body.promptType})

Prompt text:
${body.promptText}
${checklist}

Student's response:
${capped}`;
}

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
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserMessage(body) },
        ],
        temperature: 0.3,
        max_tokens: 900,
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

  // Clamp score to valid range
  feedback.overallScore = Math.max(0, Math.min(100, Math.round(feedback.overallScore ?? 0)));

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

  return NextResponse.json(feedback);
}
