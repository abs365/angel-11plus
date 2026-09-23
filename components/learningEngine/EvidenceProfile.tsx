import type { CompetencyStatus } from "@/lib/learningEngine/types";

/**
 * Feature 3 — Evidence Profile (LEARNING_ENGINE_V1.md §3.1 Question Type
 * Exposure + §3.4 Assessment Coverage).
 *
 * Increment 3 (Progress + Results + Parent Dashboard) — the prior version
 * of this component was a content-authoring inventory ("Platform content
 * available: X of 27 question types") plus a grid of one small card per
 * question type. That is genuinely internal product/content-ops
 * information — a family has no educational reason to know how many of
 * Angel's own question types have been authored yet, and a per-item card
 * grid is exactly the "one card per metric" pattern the governing
 * instruction rules out. Rewritten as a single, honest evidence-basis
 * statement: how much real practice this picture is built from, in plain
 * language ("Instead of: Evidence count: 7 / Prefer: Based on your recent
 * practice"). The underlying computation (`mappedQuestionTypes`,
 * `timesSeen`, `contentExists`) is completely unchanged — this is a
 * presentation change only, no new calculation, no fabricated number.
 */
export function EvidenceProfile({ competencies }: { competencies: CompetencyStatus[] }) {
  const allExposures = competencies.flatMap((c) => c.mappedQuestionTypes);
  const totalAttempts = allExposures.reduce((sum, e) => sum + e.timesSeen, 0);
  const skillsWithAttempts = allExposures.filter((e) => e.timesSeen > 0).length;

  if (totalAttempts === 0) {
    return (
      <p className="text-sm text-[var(--angel-muted)]">
        Angel hasn&apos;t recorded any real practice yet, so this picture is still empty.
      </p>
    );
  }

  return (
    <p className="text-sm text-[var(--angel-muted)]">
      Based on {totalAttempts} real practice attempt{totalAttempts === 1 ? "" : "s"} across {skillsWithAttempts} skill
      {skillsWithAttempts === 1 ? "" : "s"} so far.
    </p>
  );
}
