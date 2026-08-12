import type { EducationalIntelligenceSnapshot } from "./educationalIntelligenceService";

/**
 * Mathematics Learning Sequence Expansion (Educational Increment 002) —
 * extracted from app/learning-intelligence/learn/mathematics/arithmetic/
 * page.tsx's own realEvidenceLabel(), which duplicated this exact mapping
 * inline. Lesson 002 and the Learn hub both need the identical translation
 * from a real, unmodified educationalState to the plain-language family
 * label MATHEMATICS_PROGRESSION_AND_MASTERY_MODEL.md defines — one shared
 * definition now, not three copies drifting apart. No new state, no new
 * computation: every input here is a real educationalState value the
 * Educational Intelligence Engine already produced.
 */
export function realEvidenceLabel(
  educationalState: EducationalIntelligenceSnapshot["educationalState"] | undefined
): { label: string; description: string } {
  switch (educationalState) {
    case "rebuilding":
      return { label: "Not yet understood", description: "This needs another look. Let's go through it again." };
    case "practising":
    case "reinforcing":
    case "building-knowledge":
      return { label: "Developing", description: "Real progress. More practice will build this up further." };
    case "mastered":
    case "durably-mastered":
      return { label: "Consistent", description: "This is solid. Well done." };
    case "reviewing":
      return { label: "Maintenance needed", description: "This was solid before. A quick check-in will confirm it still is." };
    default:
      return { label: "Ready to practise", description: "One real attempt recorded. More evidence builds the picture." };
  }
}

/**
 * Not-yet-started variant for surfaces (the Learn hub) that only ever show
 * a lesson's resting state, never its mid-lesson local navigation state
 * ("Learning", "Ready to practise" pre-Independent-Check) — those two
 * labels are lesson-page-local UI state, deliberately not modelled here,
 * per MATHEMATICS_PROGRESSION_AND_MASTERY_MODEL.md §2's own distinction.
 */
export function hubProgressionLabel(
  educationalState: EducationalIntelligenceSnapshot["educationalState"] | undefined
): { label: string; description: string } {
  if (educationalState === undefined || educationalState === "exploring") {
    return { label: "Not yet started", description: "No real attempts recorded yet." };
  }
  return realEvidenceLabel(educationalState);
}
