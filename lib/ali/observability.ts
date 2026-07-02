import type { MockGenerationTrace } from "@/types/ali/observability";

/**
 * Lightweight internal observability (Phase ALI 1.1 / ALI_VALIDATION_
 * PROTOCOL.md). Logs why every question in a generated mock was selected —
 * competency, difficulty tier, cooldown status, replay reason, confidence
 * influence — to the console only. Never persisted to a new table, never
 * rendered to end users. Intended for developer debugging and manual
 * validation-scenario verification (e.g. confirming a weak-skill override
 * actually fired) during this phase, not as a permanent analytics pipeline.
 */
export function logSelectionTrace(trace: MockGenerationTrace): void {
  if (typeof console === "undefined") return;

  const summary = `[ALI][trace] section=${trace.sectionId} tier=${trace.confidenceInfluence.tier} questions=${trace.entries.length}`;
  if (typeof console.groupCollapsed === "function") {
    console.groupCollapsed(summary);
  } else {
    console.log(summary);
  }

  console.log("target distribution:", trace.confidenceInfluence.targetDistribution);
  for (const entry of trace.entries) {
    console.log(
      `  ${entry.questionId} [${entry.competency}/${entry.difficultyTier}] ${entry.selectionReason}` +
        ` cooldown(distance=${entry.cooldownStatus.distance ?? "never-seen"}, threshold=${entry.cooldownStatus.threshold}, eligible=${entry.cooldownStatus.eligible})` +
        (entry.replayReason ? ` — ${entry.replayReason}` : "")
    );
  }

  if (typeof console.groupEnd === "function") console.groupEnd();
}
