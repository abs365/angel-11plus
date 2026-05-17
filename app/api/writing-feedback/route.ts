import { NextRequest, NextResponse } from "next/server";
import type { WritingFeedbackRequest, WritingFeedback } from "@/types/writing-feedback";

const SYSTEM_PROMPT = `You are an expert writing tutor for the Essex CSSE 11+ selective school entrance examination. You give precise, intelligent feedback that helps 10–11 year olds improve their writing for the exam.

Essex CSSE examiners reward:
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

Scoring guide for overallScore (0–100):
- 85–100: Exceptional — confident candidate for selective school entry
- 70–84: Strong — a few focused refinements will push this to excellent
- 55–69: Developing — clear potential but technique needs consistent application
- 40–54: Foundation — ideas present, but basic errors need addressing throughout
- Below 40: Significant work needed across fundamentals

If writing is very short (under 60 words), note this in areas to improve.
If writing appears off-topic, note this.

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
      { error: "AI feedback is not configured on this server." },
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
      { error: "Could not reach the AI service. Please try again." },
      { status: 502 }
    );
  }

  if (!openAiResponse.ok) {
    const errText = await openAiResponse.text().catch(() => "");
    console.error("OpenAI error:", openAiResponse.status, errText);
    return NextResponse.json(
      { error: "AI service returned an error. Please try again." },
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

  return NextResponse.json(feedback);
}
