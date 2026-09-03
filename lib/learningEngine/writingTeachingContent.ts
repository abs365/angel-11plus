/**
 * CSSE Completion Programme, Phase D — Continuous Writing teaching
 * architecture (ANGEL_PHASE_D_CONTINUOUS_WRITING_STANDARD_V1.md Part 6).
 * Same shape as lib/learningEngine/mathsTeachingContent.ts's proven
 * pattern (Educational Increment 007L/007M): a plain
 * Record<taskFamilyId, WritingFamilyTeachingContent>, not a database
 * table, not a second engine. Bounded to the one task family Part 7 of
 * the design document justifies building now — the picture-narrative
 * family remains deferred (needs an original, non-copyrighted image
 * asset, a separate content-sourcing step).
 */

export type WritingTaskFamily = "writing-reflective-discursive";

export interface WritingPlanningQuestion {
  question: string;
  purpose: string;
}

/**
 * MODEL — a fixed, safe, non-live worked example. Never the live
 * prompt's own topic (verified: no shared significant word with the one
 * real live Writing row's prompt, `wrt-003` — see
 * tests/lib/learningEngine/writingTeachingContent.test.ts). Teaches the
 * method (what a reflective/discursive answer needs structurally), never
 * merely restates "write well."
 */
export interface WritingModelExample {
  /** What to notice — the structural cue that identifies this family. */
  whatToNotice: string;
  /** The organising principle that matters, in words. */
  approach: string;
  /** A safe, separate worked topic — never the live prompt. */
  topic: string;
  /** The MODEL's own short worked opening (2-3 sentences), demonstrating the approach, not a full answer. */
  workedOpening: string;
  /** What makes the worked opening work, tied to the 5 evidenced dimensions where genuinely relevant. */
  reasoning: string[];
}

export interface WritingFamilyTeachingContent {
  model: WritingModelExample;
  /** 3-4 structuring questions specific to this genre's real demands — reflective/discursive and picture-narrative genuinely need different planning prompts (Part 6/7 of the design document), not one generic template. */
  planningScaffold: WritingPlanningQuestion[];
  /** The single most common misconception this family's real evidence points to, per Part 7's design. */
  commonMisconception: string;
}

export const WRITING_FAMILY_TEACHING_CONTENT: Record<WritingTaskFamily, WritingFamilyTeachingContent> = {
  "writing-reflective-discursive": {
    model: {
      whatToNotice: "The question asks for YOUR own experience or opinion, not a made-up story and not a list of general facts about the topic.",
      approach: "Decide your view or pick your real experience first, then plan your strongest points in the order you'll use them, before you start writing in full sentences.",
      topic: "Describe a time you had to be patient, and explain what you learned from it.",
      workedOpening: "Waiting is something I have never been good at, but the summer I spent three weeks recovering from a broken ankle taught me more about patience than anything before it. At first, every slow day felt like a punishment.",
      reasoning: [
        "Answers the actual question straight away (patience, a real experience) rather than opening with unrelated scene-setting.",
        "Uses a specific, concrete detail (three weeks, a broken ankle) instead of a vague general statement.",
        "The second sentence already signals a personal reflection is coming, not just an account of events.",
      ],
    },
    planningScaffold: [
      { question: "What is your view, or what real experience will you write about?", purpose: "Forces a genuine personal stance before any writing starts, addressing the most common misconception directly." },
      { question: "What is your strongest reason or clearest memory?", purpose: "Identifies the one point worth developing in depth, rather than a shallow list." },
      { question: "What order will you put your points in?", purpose: "A bounded structuring step, not a full essay plan, matching Guided Application's own scope." },
      { question: "How will you end, so the reader remembers your point?", purpose: "Prompts a genuine conclusion rather than the writing simply stopping." },
    ],
    commonMisconception: "Writing general facts or a made-up story about the topic area, instead of the candidate's own real experience or genuine opinion the question actually asked for.",
  },
};

export function getWritingTeachingContent(family?: WritingTaskFamily | null): WritingFamilyTeachingContent | undefined {
  if (!family) return undefined;
  return WRITING_FAMILY_TEACHING_CONTENT[family];
}

/**
 * Maps a live prompt's own `type` field to a real CSSE task family, where
 * one genuinely applies. `WritingPrompt.type` (types/index.ts) is a
 * closed union of exactly `"narrative" | "descriptive" | "persuasive"` —
 * no stored prompt has ever used, or can type-check as, `"reflective"` or
 * `"discursive"`.
 *
 * Programme Completion Increment 005 correction: this map previously keyed
 * on `"reflective"`/`"discursive"` (values no real prompt can ever carry)
 * and deliberately left `"narrative"` unmapped, reasoning that
 * `type: "narrative"` meant the deferred QT-WC-01b picture-stimulus
 * family. That premise was wrong: every row this codebase has ever tagged
 * `type: "narrative"` (`eng-inc003-writing-imaginedplace-01`, migration
 * 167; `eng-pc003-writing-difficulttask` and `eng-pc005-writing-
 * somethingnew`, migrations 196/198) is QT-WC-01a — the SAME evidenced,
 * text-only reflective/discursive family every `"descriptive"` row also
 * uses; "narrative" here only distinguishes the response's internal
 * shape (a chronological/imagined event arc) for readiness-gate
 * diversity, never a different CSSE question type. Zero rows anywhere in
 * this bank are QT-WC-01b. Net effect of the old mapping: since no real
 * prompt could ever carry `"reflective"` or `"discursive"`, Guided
 * Practice's worked-example/teaching scaffold for Continuous Writing was
 * unreachable for every real prompt, despite being reported "Confirmed"
 * against a hand-constructed family id (see ANGEL_ENGLISH_CONTENT_
 * FOUNDATION_INCREMENT_004_WRITING_FOUNDER_INSPECTION_V1.md Part 1) rather
 * than the real `prompt.type` value production actually passes through
 * `getWritingTaskFamilyForPromptType()`.
 *
 * `"persuasive"` remains deliberately unmapped: `wrt-003`, the one
 * `persuasive`-typed row, is a genuine forced-fit (`provisional`,
 * migration 033) with no confirmed CSSE evidence behind its speech
 * register, so it correctly receives no CSSE-aligned teaching content.
 */
const PROMPT_TYPE_TO_FAMILY: Partial<Record<string, WritingTaskFamily>> = {
  narrative: "writing-reflective-discursive",
  descriptive: "writing-reflective-discursive",
};

export function getWritingTaskFamilyForPromptType(promptType?: string | null): WritingTaskFamily | undefined {
  if (!promptType) return undefined;
  return PROMPT_TYPE_TO_FAMILY[promptType];
}
