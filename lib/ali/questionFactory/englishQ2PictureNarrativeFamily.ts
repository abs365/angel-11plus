/**
 * CSSE English Full Paper — Q2 (picture-narrative) Continuous Writing
 * family scaffold. Originally specified by migration 245 with
 * `imageAssetUrl: null` (no image-authoring capability existed yet).
 *
 * CSSE Two-Paper Mock, pre-activation completion pass (migration 246):
 * the task now points at a real, original, hand-authored SVG asset
 * (`public/mock-assets/q2-picture-narrative/old-shed-v1.svg`) — not
 * AI-generated, not sourced from any CSSE paper or third-party image
 * library, confirmed well-formed and confirmed to render correctly via a
 * live browser check. Still NOT inserted into `ali_question_bank` by
 * TypeScript alone — the actual production content row and manifest
 * attachment are governed, versioned SQL (migration 246), never a direct
 * write; this file remains the single source of truth for the task's
 * design that migration 246 reads from.
 *
 * Rubric compatibility: identical to Q1 — the CSSE-evidenced 5-dimension
 * rubric (lib/learningEngine/writingRubric.ts's WRITING_DIMENSIONS) is
 * not genre-specific. No new rubric logic was required.
 */

import type { MockImageStimulus } from "@/lib/mockAttempt/types";

export interface Q2PictureNarrativeTask {
  id: string;
  taskType: "Q2";
  title: string;
  /** The actual prompt instruction shown to the learner alongside the image — CSSE's own evidenced phrasing pattern is "Write a story based on the picture below," never prescribing a single correct story. */
  prompt: string;
  /** A small number of guided planning questions specific to this genre — genuinely different from Q1's reflective/discursive scaffold (Phase D Part 6: "reflective/discursive vs. picture-narrative genuinely need different planning prompts, not one generic template"). */
  planningScaffold: string[];
  checklist: string[];
  difficulty: "year6-exam";
  timeMinutes: number;
  stimulus: MockImageStimulus;
}

/**
 * One fully-specified task, now pointing at the real, verified SVG asset
 * authored for it. The `altText` below is the accessible text
 * description shown to assistive technology, not a stand-in for the
 * image — the image itself is what the learner sees and writes from.
 */
export const Q2_PICTURE_NARRATIVE_TASKS: Q2PictureNarrativeTask[] = [
  {
    id: "eng-q2-picturenarrative-oldshed",
    taskType: "Q2",
    title: "The Old Shed",
    prompt: "Write a story based on the picture below.",
    planningScaffold: [
      "Who is in the picture, or who might arrive next?",
      "What has just happened, just before this exact moment?",
      "What might happen next -- and does your story need a clear turning point?",
      "How does your story end -- does it need to resolve everything the picture suggests, or can it end on a single striking moment?",
    ],
    checklist: [
      "Write at least six sentences",
      "Base your story genuinely on what the picture shows, not an unrelated idea",
      "Include a clear turning point or moment of change, not just a description of the scene",
      "Use precise, well-chosen vocabulary",
      "Organise your writing into clear paragraphs",
      "Check spelling and punctuation carefully",
    ],
    difficulty: "year6-exam",
    timeMinutes: 25,
    stimulus: {
      type: "image",
      imageAssetUrl: "/mock-assets/q2-picture-narrative/old-shed-v1.svg",
      altText:
        "An old, weathered wooden shed stands at the edge of an overgrown garden in the late afternoon. Its door is slightly open, long grass and a climbing plant have grown up around its base, and a large tree stands beside it under a warm, softening sky.",
      caption: undefined,
    },
  },
];
