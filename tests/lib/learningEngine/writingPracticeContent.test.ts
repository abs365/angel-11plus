import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fetchEligibleWritingPrompts,
  isWritingPracticeReady,
  WRITING_READINESS_MIN_PROMPTS,
  WRITING_READINESS_MIN_SHAPES,
} from "@/lib/learningEngine/writingPracticeContent";
import type { WritingPrompt } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Programme Completion Increment 004 (Founder-authorised Writing Practice
 * foundation) — the real content source (ali_question_bank, practice_eligible
 * only) and its readiness gate, which must never expose a one-prompt Writing
 * programme (Founder's own explicit instruction).
 */

function makePrompt(overrides: Partial<WritingPrompt> = {}): WritingPrompt {
  return {
    id: "fixture-writing-1",
    title: "Fixture Prompt",
    prompt: "Write about something.",
    type: "narrative",
    difficulty: "year6-exam",
    checklist: ["Write at least six sentences"],
    timeMinutes: 25,
    ...overrides,
  };
}

function makeStubClient(rows: unknown[]): SupabaseClient<Database> {
  return {
    from: (table: string) => {
      if (table !== "ali_question_bank") throw new Error(`unexpected table: ${table}`);
      // Thenable builder, matching the real Supabase query-builder shape:
      // .select()/.eq() are chainable any number of times, and `await`-ing
      // the builder itself (via .then) resolves to the final { data, error }
      // result -- exactly how the real client supports .eq().eq().eq()
      // chains of arbitrary length before the query is actually awaited.
      const builder: any = {
        select: () => builder,
        eq: () => builder,
        then: (resolve: (v: { data: unknown; error: null }) => void) => resolve({ data: rows, error: null }),
      };
      return builder;
    },
  } as unknown as SupabaseClient<Database>;
}

test("isWritingPracticeReady requires at least WRITING_READINESS_MIN_PROMPTS prompts", () => {
  const onePrompt = [makePrompt({ id: "a", type: "narrative" }), ];
  assert.equal(WRITING_READINESS_MIN_PROMPTS >= 2, true, "the readiness floor itself must be at least 2 -- a single prompt must never read as ready");
  assert.equal(isWritingPracticeReady(onePrompt), false, "one prompt alone must never be 'ready', regardless of shape count");
});

test("isWritingPracticeReady requires at least WRITING_READINESS_MIN_SHAPES distinct response shapes, not merely enough rows", () => {
  const sameShapeTwice = [
    makePrompt({ id: "a", type: "narrative" }),
    makePrompt({ id: "b", type: "narrative" }),
  ];
  assert.equal(WRITING_READINESS_MIN_SHAPES >= 2, true);
  assert.equal(isWritingPracticeReady(sameShapeTwice), false, "two prompts of the identical shape must not count as genuine readiness");
});

test("isWritingPracticeReady returns true once genuine count AND shape diversity are both met", () => {
  const genuinelyDiverse = [
    makePrompt({ id: "a", type: "narrative" }),
    makePrompt({ id: "b", type: "descriptive" }),
  ];
  assert.equal(isWritingPracticeReady(genuinelyDiverse), true);
});

test("isWritingPracticeReady returns false for zero prompts (today's real, honest production state)", () => {
  assert.equal(isWritingPracticeReady([]), false);
});

test("fetchEligibleWritingPrompts returns [] for a null client, never throwing", async () => {
  const result = await fetchEligibleWritingPrompts(null);
  assert.deepEqual(result, []);
});

test("fetchEligibleWritingPrompts silently excludes a malformed stored prompt rather than rendering it", async () => {
  const client = makeStubClient([{ prompt: { id: "bad", title: "Missing fields" } }, { prompt: makePrompt({ id: "good" }) }]);
  const result = await fetchEligibleWritingPrompts(client);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "good");
});

test("fetchEligibleWritingPrompts never references the static fixture -- it is purely a database query", () => {
  const source = fetchEligibleWritingPrompts.toString();
  assert.ok(!source.includes("writingPrompts"), "must never fall back to the static fixture array");
});

// === Educational Depth Phase 1, Wave 2 — picture-narrative stimulus validation.

test("a well-formed 'picture-narrative' prompt with a real image stimulus passes validation and is returned", async () => {
  const withStimulus = makePrompt({
    id: "good-picture",
    type: "picture-narrative",
    stimulus: { type: "image", imageAssetUrl: "/practice-assets/writing-picture-narrative/riverboat-v1.svg", altText: "A boat on a misty riverbank." },
  });
  const client = makeStubClient([{ prompt: withStimulus }]);
  const result = await fetchEligibleWritingPrompts(client);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "good-picture");
  assert.equal(result[0].stimulus?.imageAssetUrl, "/practice-assets/writing-picture-narrative/riverboat-v1.svg");
});

test("a 'picture-narrative' prompt is silently excluded if its stimulus is malformed -- missing altText, missing imageAssetUrl, or the wrong type -- never rendered with a broken image", async () => {
  const missingAlt = makePrompt({ id: "bad-1", type: "picture-narrative", stimulus: { type: "image", imageAssetUrl: "/x.svg", altText: "" } as never });
  const missingUrl = makePrompt({ id: "bad-2", type: "picture-narrative", stimulus: { type: "image", imageAssetUrl: "", altText: "Something." } as never });
  const wrongType = makePrompt({ id: "bad-3", type: "picture-narrative", stimulus: { type: "chart", imageAssetUrl: "/x.svg", altText: "Something." } as never });
  const client = makeStubClient([{ prompt: missingAlt }, { prompt: missingUrl }, { prompt: wrongType }, { prompt: makePrompt({ id: "good" }) }]);
  const result = await fetchEligibleWritingPrompts(client);
  assert.deepEqual(result.map((p) => p.id), ["good"]);
});

test("a prompt with no 'stimulus' key at all (every pre-Wave-2 row) still validates exactly as before -- regression-safe", async () => {
  const noStimulus = makePrompt({ id: "no-stimulus" });
  assert.equal("stimulus" in noStimulus, false);
  const client = makeStubClient([{ prompt: noStimulus }]);
  const result = await fetchEligibleWritingPrompts(client);
  assert.equal(result.length, 1);
  assert.equal(result[0].stimulus, undefined);
});

test("'picture-narrative' is now accepted as a valid WritingPrompt.type, alongside the 3 pre-existing values", async () => {
  const client = makeStubClient([{ prompt: makePrompt({ id: "p", type: "picture-narrative" }) }]);
  const result = await fetchEligibleWritingPrompts(client);
  assert.equal(result.length, 1);
});
