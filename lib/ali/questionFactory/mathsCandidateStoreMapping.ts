import type { MathsQuestionCandidate, ValidationResult, StructuralBlueprint } from "./types";

/**
 * Educational Increment 003, Wave 1 -- Maths-only candidate-store mapping,
 * extracted as its own file so the Maths publication path (and this
 * increment's blueprintId provenance fix, see §A of the Wave 1 report)
 * can be committed to git cleanly, with zero import-time dependency on
 * English content.
 *
 * This is a straight extraction of `mapMathsCandidateToStoreRow`,
 * `SubmitQuestionCandidateArgs`, and `verifyNoFabricatedOrMissingRequiredFields`
 * from `candidateStoreMapping.ts` -- no behaviour change beyond the
 * blueprintId fix itself, which already existed in that file before this
 * extraction. `candidateStoreMapping.ts` also holds `mapEnglishCandidateToStoreRow`
 * and its own transitive imports (englishTypes.ts, the 6 English family
 * files, familyTaxonomy.ts) -- that whole cluster was `git rm --cached`'d
 * in an earlier, unrelated phase after an incomplete commit broke the
 * Vercel build (kept on disk, untracked, deliberately left alone here per
 * explicit Founder instruction: "preserve the other developer's/local
 * work on disk, do not discard unrelated work"). Committing
 * `candidateStoreMapping.ts` as-is would require ALSO committing that
 * entire entangled cluster to make it importable, reproducing the exact
 * incident this file exists to avoid repeating. `mapMathsCandidateToStoreRow`
 * itself never referenced any English import -- only `mapEnglishCandidateToStoreRow`
 * and its own supporting code did -- so this extraction is mechanical, not
 * a redesign: identical Maths logic, zero English coupling.
 *
 * One additional, disclosed difference from the original: the original
 * file's `validation` parameter type included `"independentlyVerified"` in
 * its `Pick<ValidationResult, ...>`, a field that does not exist on the
 * real `ValidationResult` (lib/ali/questionFactory/types.ts) -- a
 * pre-existing, disclosed type-drift defect from the same earlier,
 * unrelated, uncommitted body of work (see the Wave 1 report's own §S).
 * Reproducing it here would defeat the entire point of this extraction
 * (a clean file that actually typechecks) without fixing anything in the
 * old, deliberately-untouched file -- so this version's `Pick` and its one
 * corresponding read (`p_mathematical_validation`) simply omit the
 * non-existent field, matching the real, current `ValidationResult` shape.
 * At runtime this field was always `undefined` anyway (there is no such
 * property to read), so this is a type-level correction only, not a
 * behaviour change.
 *
 * A second, same-class omission: the original file's `p_question_content`
 * also included `diagram: candidate.diagram ?? null, diagrams:
 * candidate.diagrams ?? null` -- `MathsQuestionCandidate` never declares
 * either field (confirmed: no reference to "diagram" anywhere in
 * candidateGeneration.ts or types.ts), and no generation path has ever
 * populated one, so these were always `undefined` -> `null` dead code,
 * never a real, exercised capability. Omitted here for the same reason:
 * a pre-existing, disclosed, unrelated gap (from an earlier diagram-
 * rendering fix that only ever touched `types/index.ts`'s `MathsQuestion`,
 * never this factory's own `MathsQuestionCandidate`), not something any
 * of this wave's 18 blueprints use or need, and reproducing it here would
 * only reintroduce the same dead type error this extraction exists to
 * remove. Diagram-bearing candidate provenance remains a real, separate,
 * future gap for whichever family actually needs it -- not silently
 * declared fixed by this file's omission.
 */
export interface SubmitQuestionCandidateArgs {
  p_candidate_id: string;
  p_family_id: string;
  p_generation_spec_id: string;
  p_generation_spec_version: string;
  p_subject: "maths" | "english" | "writing";
  p_competency_id: string;
  p_skill: string;
  p_question_type: string;
  p_pathway: string[];
  p_preparation_stage: string | null;
  p_difficulty: "easy" | "medium" | "hard" | "challenge";
  p_question_content: Record<string, unknown>;
  p_claimed_answer: string;
  p_worked_explanation: string | null;
  p_distractors: Record<string, unknown> | null;
  p_mathematical_validation: Record<string, unknown>;
  p_similarity_validation: Record<string, unknown>;
}

/**
 * Maps ONE approved Maths candidate + its own blueprint + its own
 * ValidationResult (the real, already-computed output of
 * `validateBlueprintCandidate`, never re-derived or fabricated here)
 * into the exact `submit_question_candidate()` RPC argument shape
 * (migration 230).
 *
 * `p_candidate_id` is deliberately NOT the candidate's own (timestamp-
 * suffixed, non-deterministic) `candidateId` -- callers MUST supply a
 * stable, deterministic id (e.g. derived from familyId + a stable
 * per-batch sequence number, decided ONCE at manifest-materialisation
 * time and persisted, never regenerated at submission time), matching
 * the table's own primary-key idempotency guard.
 */
export function mapMathsCandidateToStoreRow(
  stableCandidateId: string,
  candidate: MathsQuestionCandidate,
  blueprint: Pick<StructuralBlueprint<Record<string, number>>, "familyId" | "competencyId" | "questionTypeId" | "blueprintId">,
  validation: Pick<ValidationResult, "mathematicallyValid" | "approved" | "reasons">
): SubmitQuestionCandidateArgs {
  return {
    p_candidate_id: stableCandidateId,
    p_family_id: blueprint.familyId,
    // Scale Architecture candidates are blueprint-generated, not
    // spec-generated (Wave 1/2's original single-spec shape) --
    // blueprintId is the closest honest analogue of "generation_spec_id"
    // for this candidate, disclosed as such, never silently reusing
    // familyId as if it meant something more specific.
    p_generation_spec_id: candidate.blueprintId ?? blueprint.familyId,
    p_generation_spec_version: "1",
    p_subject: "maths",
    p_competency_id: blueprint.competencyId,
    p_skill: blueprint.questionTypeId,
    p_question_type: "short-answer",
    p_pathway: ["csse"],
    p_preparation_stage: null,
    p_difficulty: candidate.difficulty,
    p_question_content: {
      question: candidate.question,
      workingSteps: candidate.workingSteps,
      params: candidate.params,
      reasoningRoute: candidate.reasoningRoute,
      contextTag: candidate.contextTag,
      unknownPosition: candidate.unknownPosition,
      representationType: candidate.representationType ?? null,
      // Educational Increment 003, §A/§4 -- blueprint identity must
      // survive candidate creation AND publication. candidate.blueprintId
      // was already captured on MathsQuestionCandidate and already used
      // above for p_generation_spec_id, but was never copied into
      // p_question_content before this fix, so it never reached the
      // published row's `prompt` JSON. Falls back to blueprint.blueprintId
      // (never fabricated -- the blueprint that generated this candidate)
      // only for candidates whose own blueprintId is unset, matching the
      // same fallback already used for p_generation_spec_id above.
      blueprintId: candidate.blueprintId ?? blueprint.blueprintId ?? null,
    },
    p_claimed_answer: candidate.claimedAnswer,
    p_worked_explanation: candidate.workingSteps.join(" "),
    p_distractors: candidate.acceptedAnswerForms ? { acceptedAnswerForms: candidate.acceptedAnswerForms } : null,
    p_mathematical_validation: { mathematicallyValid: validation.mathematicallyValid, reasons: validation.reasons },
    p_similarity_validation: { approved: validation.approved, reasons: validation.reasons.filter((r) => r === "exact_duplicate_of_existing_bank_row" || r === "exact_duplicate_within_batch") },
  };
}

/**
 * Structural, non-DB check: every field `submit_question_candidate()`
 * declares NOT NULL is genuinely populated with a real (never
 * fabricated/placeholder) value. Run against a mapped row before it is
 * ever handed to a real submission script -- catches a mapping defect
 * locally, without needing a live database connection.
 */
export function verifyNoFabricatedOrMissingRequiredFields(args: SubmitQuestionCandidateArgs): { valid: boolean; missing: string[] } {
  const requiredNonNull: (keyof SubmitQuestionCandidateArgs)[] = [
    "p_candidate_id", "p_family_id", "p_generation_spec_id", "p_generation_spec_version", "p_subject",
    "p_skill", "p_pathway", "p_difficulty", "p_question_content", "p_claimed_answer",
    "p_mathematical_validation", "p_similarity_validation",
  ];
  const missing = requiredNonNull.filter((k) => args[k] === null || args[k] === undefined || args[k] === "");
  return { valid: missing.length === 0, missing };
}
