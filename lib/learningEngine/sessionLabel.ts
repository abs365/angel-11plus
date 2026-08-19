import { PRACTICE_AREAS } from "./practiceContent";

/**
 * Completion Assurance Programme, Completion C, Part 4 — the single,
 * reusable boundary where any internal session/lesson id used as a key
 * into UserProgress.completedLessons is converted into parent-facing
 * copy. Progress's "Completed Sessions" list previously did
 * `lessonNames[id] ?? id`, so any id missing from that hand-maintained
 * map (proven: the canonical Practice engine's own `practice-${areaId}`
 * ids, plus several older legacy adaptive-mock ids) rendered as a raw
 * internal identifier. This function is the one place that gap is closed
 * — including a final safety net so a still-unknown id can never again
 * render as a bare, un-humanised slug.
 */

const CURATED_SESSION_LABELS: Record<string, string> = {
  "eng-001": "The Lighthouse Mystery",
  "eng-002": "The Boy Who Collected Silence",
  "eng-003": "Letters from the Trenches",
  "maths-reasoning": "Mathematics Reasoning Session",
  "maths-arithmetic": "Speed Arithmetic",
  "vocab-session": "Vocabulary Flashcards",
  "vocab-adaptive": "Vocabulary Session",
  "eng-adaptive": "English Session",
  "verbal-reasoning": "Verbal Reasoning Session",
  "non-verbal-reasoning": "Non-Verbal Reasoning Session",
  "spatial-reasoning": "Spatial Reasoning Session",
  "numerical-reasoning": "Numerical Reasoning Session",
  "mock-test": "Full Mock Test",
  "csse-founder-validation-assessment": "CSSE Assessment Session",
};

for (let i = 1; i <= 4; i++) {
  CURATED_SESSION_LABELS[`writing-wrt-00${i}`] = `Writing Prompt ${i}`;
}

const PRACTICE_PREFIX = "practice-";

function titleCaseFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function humanizeSessionId(id: string): string {
  if (id.startsWith(PRACTICE_PREFIX)) {
    const areaId = id.slice(PRACTICE_PREFIX.length);
    const area = PRACTICE_AREAS.find((a) => a.id === areaId);
    if (area) return `${area.label} Practice`;
  }

  const curated = CURATED_SESSION_LABELS[id];
  if (curated) return curated;

  // Last-resort safety net: never render a raw internal id verbatim.
  return titleCaseFromSlug(id);
}
