/**
 * CSSE English Full Paper, Migration 245 — Q2 (picture-narrative)
 * Continuous Writing family scaffold.
 *
 * DISCLOSED, DELIBERATE GAP: this file specifies the family/task
 * structure, prompt text, planning scaffold, and rubric mapping for the
 * CSSE-evidenced Q2 genre ("write a story based on the picture below" —
 * ANGEL_PHASE_D_CONTINUOUS_WRITING_STANDARD_V1.md Part 2, primary-source
 * evidenced 3/3 real papers read) — but does NOT include a real image
 * asset. This session has no image-generation or licensed-stock-image-
 * sourcing capability, and copying a real CSSE examination image would
 * violate the governing brief's own explicit copyright instruction
 * (§9/§11/§14). Rather than ship a task with a fabricated/placeholder
 * image, or silently skip Q2 entirely, this file exists so a future
 * increment with genuine image-authoring capability can complete exactly
 * one already-fully-specified task without re-deriving the educational
 * design from scratch.
 *
 * NOT inserted into ali_question_bank by this migration/increment — an
 * incomplete task (no real imageAssetUrl) must never be marked
 * practice_eligible or mock_eligible (governing brief §7/§8: "only
 * promote content that meets the full Mock standard"). This is a design
 * file only.
 *
 * Rubric compatibility: identical to Q1 — the CSSE-evidenced 5-dimension
 * rubric (lib/learningEngine/writingRubric.ts's WRITING_DIMENSIONS) is
 * not genre-specific (ANGEL_PHASE_D_CONTINUOUS_WRITING_STANDARD_V1.md
 * Part 7: "the rubric itself is not family-specific evidence"). No new
 * rubric logic is required once a real image exists — only a real
 * MockImageStimulus value (lib/mockAttempt/types.ts, migration 245)
 * needs to be authored and attached.
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
 * One fully-specified task, deliberately not authored to any real image
 * yet (`imageAssetUrl: null`). The scene description below exists so a
 * future image-sourcing/generation step has a precise, reviewed brief to
 * work from — it is NOT shown to the learner as text-only stimulus; a
 * genuine picture-narrative task requires the actual image (CSSE's own
 * evidenced format), never a text description standing in for one.
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
      imageAssetUrl: null,
      altText:
        "An old, weathered garden shed with a slightly ajar door, standing at the edge of an overgrown garden late in the afternoon. PENDING: no real image asset exists yet -- see this file's own header.",
      caption: undefined,
    },
  },
];
