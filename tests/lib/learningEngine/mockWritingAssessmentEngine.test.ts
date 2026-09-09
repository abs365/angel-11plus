import { test } from "node:test";
import assert from "node:assert/strict";
import { assessWritingResponseForMock } from "@/lib/learningEngine/mockWritingAssessmentEngine";

/**
 * Migration 245 — Mock-grade Continuous Writing assessment engine.
 * Mocks global fetch (the OpenAI call) so the deterministic parts —
 * assessment_status derivation, dimension validation/defaulting, the
 * confidence-ceiling enforcement — are testable without a live API call,
 * matching this codebase's own established discipline for
 * lib/learningEngine/writingRubric.ts's own pure-function tests.
 */

function fakeOpenAiFetch(responseBody: unknown, ok = true) {
  return async () =>
    ({
      ok,
      status: ok ? 200 : 500,
      json: async () => ({ choices: [{ message: { content: JSON.stringify(responseBody) } }] }),
      text: async () => "error",
    }) as Response;
}

function fullDimensionsResponse(level: "developing" | "secure" | "strong", confident = true) {
  return {
    dimensions: ["ideas", "vocabulary", "grammar", "structure", "punctuation"].map((dimension) => ({
      dimension,
      level,
      comment: `A real comment about ${dimension}.`,
      confident,
    })),
  };
}

test("a normal, sufficiently-long, on-topic response with all dimensions confident yields assessment_status='complete'", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fakeOpenAiFetch(fullDimensionsResponse("secure", true)) as typeof fetch;
  try {
    const result = await assessWritingResponseForMock("fake-key", {
      promptTitle: "A Time You Changed Your Mind",
      promptType: "descriptive",
      promptText: "Write about a time when you changed your mind about something.",
      checklist: ["Write at least six sentences"],
      responseText:
        "I used to think that trying new foods was pointless because I already knew what I liked. Then one evening my grandmother made a dish I had always refused to try. I was surprised by how much I enjoyed it. Since then I have tried many new foods without hesitating. My opinion changed because of that single meal. Now I actively look forward to trying things I have never eaten before.",
    });
    assert.equal(result.assessmentStatus, "complete");
    assert.deepEqual(result.reviewRequiredReasons, []);
    assert.equal(result.dimensions.length, 5);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("a response shorter than the CSSE-evidenced 6-sentence minimum yields assessment_status='review_required' with a deterministic reason, never model self-confidence", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fakeOpenAiFetch(fullDimensionsResponse("strong", true)) as typeof fetch;
  try {
    const result = await assessWritingResponseForMock("fake-key", {
      promptTitle: "A Time You Changed Your Mind",
      promptType: "descriptive",
      promptText: "Write about a time when you changed your mind about something.",
      checklist: [],
      responseText: "I do not know what to write.",
    });
    assert.equal(result.assessmentStatus, "review_required");
    assert.ok(result.reviewRequiredReasons.length > 0);
    assert.match(result.reviewRequiredReasons[0], /shorter than the CSSE-evidenced minimum/);
    // The pre-flight gate's own confidence ceiling forces every dimension
    // to confident:false regardless of what the model itself claimed —
    // never trusts model self-confidence for a short response.
    assert.ok(result.dimensions.every((d) => d.confident === false));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("a response the model itself flags as not confident on individual dimensions is reflected in review_required_reasons, even when the response is otherwise long enough", async () => {
  const originalFetch = globalThis.fetch;
  const longOnTopicText =
    "I used to think that trying new foods was pointless because I already knew what I liked. Then one evening my grandmother made a dish I had always refused to try. I was surprised by how much I enjoyed it. Since then I have tried many new foods without hesitating. My opinion changed because of that single meal. Now I actively look forward to trying things I have never eaten before.";
  const mixedConfidence = {
    dimensions: [
      { dimension: "ideas", level: "secure", comment: "Clear.", confident: true },
      { dimension: "vocabulary", level: "secure", comment: "Fine.", confident: true },
      { dimension: "grammar", level: "developing", comment: "Uncertain.", confident: false },
      { dimension: "structure", level: "secure", comment: "Fine.", confident: true },
      { dimension: "punctuation", level: "secure", comment: "Fine.", confident: true },
    ],
  };
  globalThis.fetch = fakeOpenAiFetch(mixedConfidence) as typeof fetch;
  try {
    const result = await assessWritingResponseForMock("fake-key", {
      promptTitle: "A Time You Changed Your Mind",
      promptType: "descriptive",
      promptText: "Write about a time when you changed your mind about something.",
      checklist: [],
      responseText: longOnTopicText,
    });
    assert.equal(result.assessmentStatus, "review_required");
    assert.ok(result.reviewRequiredReasons.some((r) => r.includes("Grammar")));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("a malformed/missing dimensions array from the model is defaulted safely, never throws, and produces an honest degraded comment", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fakeOpenAiFetch({}) as typeof fetch; // no dimensions key at all
  try {
    const result = await assessWritingResponseForMock("fake-key", {
      promptTitle: "A Time You Changed Your Mind",
      promptType: "descriptive",
      promptText: "Write about a time when you changed your mind about something.",
      checklist: [],
      responseText:
        "I used to think that trying new foods was pointless because I already knew what I liked. Then one evening my grandmother made a dish I had always refused to try. I was surprised by how much I enjoyed it. Since then I have tried many new foods without hesitating.",
    });
    assert.equal(result.dimensions.length, 5);
    assert.ok(result.dimensions.every((d) => d.level === "developing"));
    assert.ok(result.dimensions[0].comment.includes("could not generate a reliable comment"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("overallIndicator is always computed deterministically server-side, never trusted from the model even if the model supplied one", async () => {
  const originalFetch = globalThis.fetch;
  const withFakeOverallScore = { ...fullDimensionsResponse("strong", true), overallScore: 3 }; // implausibly low, must be ignored
  globalThis.fetch = fakeOpenAiFetch(withFakeOverallScore) as typeof fetch;
  try {
    const result = await assessWritingResponseForMock("fake-key", {
      promptTitle: "A Time You Changed Your Mind",
      promptType: "descriptive",
      promptText: "Write about a time when you changed your mind about something.",
      checklist: [],
      responseText:
        "I used to think that trying new foods was pointless because I already knew what I liked. Then one evening my grandmother made a dish I had always refused to try. I was surprised by how much I enjoyed it. Since then I have tried many new foods without hesitating. My opinion changed because of that single meal. Now I actively look forward to trying things I have never eaten before.",
    });
    // "strong" for every dimension -> a high computed indicator, not 3.
    assert.ok(result.overallIndicator >= 80, `expected a high deterministic indicator, got ${result.overallIndicator}`);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("an OpenAI HTTP failure throws (the caller must treat this as an incomplete assessment, never a fabricated pass)", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fakeOpenAiFetch({}, false) as typeof fetch;
  try {
    await assert.rejects(() =>
      assessWritingResponseForMock("fake-key", {
        promptTitle: "A Time You Changed Your Mind",
        promptType: "descriptive",
        promptText: "Write about a time when you changed your mind about something.",
        checklist: [],
        responseText: "Any response text here for this particular test case scenario.",
      })
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
