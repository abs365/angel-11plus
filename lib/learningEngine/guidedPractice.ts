/**
 * Educational Increment 007C, Part 5 — Guided Practice, first bounded
 * production version. Reuses the existing Learning Engine's supportTier
 * semantics (lib/ali/mastery.ts) unchanged: every guided attempt the
 * Practice page records is tagged "supported", never "independent" — see
 * tests/lib/learningEngine/guidedPractice.test.ts and the existing
 * mastery.ts tests this relies on for the mastery-safety proof.
 *
 * This module decides WHAT scaffold to show for a given family. It never
 * reveals the actual answer key text (quotationRequired, correctOptions,
 * acceptedAnswers) — the one line the Founder's directive drew — with one
 * disclosed, directive-authorised exception: "sequencing anchors" (Part 5's
 * own example of legitimate scaffolding) intentionally shows the FIRST
 * ordered item, not the rest.
 *
 * Coverage is intentionally uneven, matching Part 7's FULL/LIGHTWEIGHT/
 * GUIDED-STRATEGY/POST-ATTEMPT-REMEDIATION classification (see
 * ENGLISH_WAVE2_MODEL_COVERAGE_AUDIT_V1.md): 3 scaffold kinds are REAL and
 * verified against genuine data (selection-count-check, sequence-anchor,
 * staged-quotation-check); the remaining families get an honest,
 * family-specific instructional scaffold, not a fabricated verified check
 * the content model doesn't yet support (e.g. no per-question "correct
 * paragraph" field exists to verify a paragraph-locate stage against).
 */

export type GuidedScaffoldKind =
  | "selection-count-check"
  | "sequence-anchor"
  | "staged-quotation"
  | "locate-instruction";

const FAMILY_SCAFFOLD: Record<string, GuidedScaffoldKind> = {
  "wave2-fam-multiselect": "selection-count-check",
  "wave1-fam-sequencing": "sequence-anchor",
  "wave1-fam-quote-explain": "staged-quotation",
  // Educational Increment 007H, Part 7 — corrected from "staged-quotation".
  // ENGLISH_WAVE2_MODEL_COVERAGE_AUDIT_V1.md claimed this family reuses
  // quote-explain's verified staged-quotation check, but every
  // wave1-fam-emotion-cause question's prompt.quotationRequired is
  // undefined (this family is scored as
  // TIER5_NAMED_COMPONENT_PLUS_EXPLANATION against prompt.acceptedAnswers,
  // an emotion-word list, not a verbatim quotation). The live Practice
  // page's staged-quotation button (app/learning-intelligence/practice/
  // [area]/page.tsx) reads prompt.quotationRequired directly, so for this
  // family "Check my quotation" was guaranteed to report "Angel couldn't
  // find the exact words yet" regardless of what the learner typed, even
  // a fully correct answer. Found via 007H's independent Batch 2 content
  // validation (scripts/007h-part7-validation.mjs), before any human
  // review — not itself an educational review or a content-correctness
  // judgement, only a routing fix to an honest, already-established
  // fallback scaffold this family's actual content can support.
  "wave1-fam-emotion-cause": "locate-instruction",
  "wave1-fam-two-character": "locate-instruction",
  "wave1-fam-direct-retrieval": "locate-instruction",
  "wave1-fam-tick-justify": "locate-instruction",
  "wave1-fam-vocab-explain": "locate-instruction",
  "wave1-fam-synonym-battery": "locate-instruction",
};

export function getGuidedScaffoldKind(familyId?: string | null): GuidedScaffoldKind | undefined {
  if (!familyId) return undefined;
  return FAMILY_SCAFFOLD[familyId];
}

/**
 * Family-specific instruction text. Every family that reaches
 * "locate-instruction" gets a distinct, family-appropriate line, not one
 * generic message — per Part 7's "no family should be left with only
 * generic feedback where family-specific teaching is educationally
 * required."
 */
const LOCATE_INSTRUCTION_TEXT: Partial<Record<string, string>> = {
  "wave1-fam-two-character": "Answer in two parts: find evidence for the first person or character, then separately find evidence for the second, before you write your combined answer.",
  "wave1-fam-direct-retrieval": "Find the key word from the question in the passage first, then re-read the whole sentence it appears in before answering.",
  "wave1-fam-tick-justify": "Form a quick overall impression first, then go back and find two pieces of evidence specifically for that side, not the other.",
  "wave1-fam-vocab-explain": "Cover the tricky word with your finger and read the rest of the sentence around it before deciding what it means.",
  "wave1-fam-synonym-battery": "Go straight to the specific word given. Do not rely on your memory of the whole passage for its meaning.",
  "wave1-fam-emotion-cause": "Find the exact moment the question asks about, then look at the sentences just before and after it for the feeling and its cause, before you name the emotion.",
};

export function getGuidedInstructionText(familyId?: string | null, kind?: GuidedScaffoldKind): string {
  if (kind === "selection-count-check") {
    return "Tick as you go. Angel will warn you here, before you submit, if you have ticked more than the number asked for.";
  }
  if (kind === "sequence-anchor") {
    return "The first item is given below to get you started. Work out where the remaining items belong.";
  }
  if (kind === "staged-quotation") {
    return "First, type the exact words from the passage that answer this. Use the Check my quotation button as many times as you like before you explain what it shows.";
  }
  return (familyId && LOCATE_INSTRUCTION_TEXT[familyId]) || "Read the question again, then find the exact part of the passage it is asking about before you answer.";
}

export interface LiveSelectionCountCheck {
  selectedCount: number;
  overLimit: boolean;
}

/**
 * Mirrors englishAnswerValidation.ts's parseMultiSelectAnswer tokenisation
 * exactly (same split/trim/uppercase/dedupe rule), so the live guided-mode
 * counter and the final scored result can never disagree about what counts
 * as a selection.
 */
export function checkLiveSelectionCount(rawAnswer: string, requiredCount: number): LiveSelectionCountCheck {
  const tokens = rawAnswer
    .split(/[\r\n,]+/)
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length > 0);
  const selectedCount = new Set(tokens).size;
  return { selectedCount, overLimit: selectedCount > requiredCount };
}
