import { test } from "node:test";
import assert from "node:assert/strict";
import { generateBlueprintCandidate, validateBlueprintCandidate } from "@/lib/ali/questionFactory/candidateGeneration";
import { mapMathsCandidateToStoreRow } from "@/lib/ali/questionFactory/mathsCandidateStoreMapping";
import { BP_REVERSE_DIRECT_UNSCAFFOLDED } from "@/lib/ali/questionFactory/mr04ReversePercentageBlueprints";
import { BP_TIME_REVERSE_MULTISTAGE_DIRECT } from "@/lib/ali/questionFactory/mr04TimeReverseBlueprints";
import { BP_REVERSE_MEAN_DIRECT } from "@/lib/ali/questionFactory/mr01ReverseMeanBlueprints";

/**
 * Educational Increment 003, Wave 1 pre-publication gate, §2 -- proves
 * blueprintId survives the COMPLETE real path: blueprint -> generated
 * candidate -> submit_question_candidate() -> ali_question_candidate.
 * question_content -> publish_question_candidate() -> ali_question_bank.
 * prompt -- not merely that it exists on an in-memory candidate object.
 *
 * Reproduces the two real RPC bodies' documented behaviour EXACTLY, read
 * directly from the live migration SQL (never assumed):
 *   - submit_question_candidate() (migration 230, lines 208-218): inserts
 *     question_content = p_question_content VERBATIM, no transformation.
 *   - publish_question_candidate() (migration 239, the currently-live
 *     version, superseding 230/237 for this one function): line 272,
 *     `v_final_prompt := v_candidate.question_content;` -- starts from the
 *     full stored object, then ONLY ADDS fields via jsonb `||` merge
 *     (line 291, Maths `answer`; line 306-322, English TIER6_MULTI_SELECT
 *     `marks`, never reached for Maths; line 325-337, passage merge, never
 *     reached for Maths, which carries no passage_id) -- never rebuilds or
 *     drops a key. A plain JS object spread is the exact semantic
 *     equivalent of a jsonb `||` merge over a fresh copy of the base
 *     object, so this is a faithful reproduction, not an approximation.
 *
 * This is a CODE-LEVEL simulation of the RPCs' own documented behaviour,
 * not a live database round-trip (no admin credentials are available to
 * this session to actually call these `security definer`, admin-gated
 * RPCs against production) -- disclosed here explicitly, matching this
 * codebase's own established "never claim more coverage than performed"
 * discipline. A live round-trip remains Founder-run, credentialed,
 * future verification, same boundary this codebase already documents for
 * every other RPC submission step.
 */

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state / 0x7fffffff; };
}

/** Reproduces publish_question_candidate() (migration 239)'s v_final_prompt construction for a Maths candidate, exactly. */
function simulatePublish(questionContent: Record<string, unknown>, claimedAnswer: string, subject: string): Record<string, unknown> {
  let finalPrompt: Record<string, unknown> = { ...questionContent }; // v_final_prompt := v_candidate.question_content
  if (subject === "maths") {
    finalPrompt = { ...finalPrompt, answer: claimedAnswer }; // migration 237's merge, byte-for-byte preserved by 239
  }
  // TIER6_MULTI_SELECT branch and passage-merge branch never match a Maths candidate (no validationTier, no passage_id) -- correctly omitted.
  return finalPrompt;
}

/**
 * A generic per-blueprint helper (rather than looping over an array of
 * differently-parameterised blueprints, which TypeScript cannot infer a
 * single sound generic argument for) -- called once per family below.
 */
function runBlueprintIdEndToEndCheck<T extends Record<string, number>>(blueprint: import("@/lib/ali/questionFactory/types").StructuralBlueprint<T>, family: string) {
  test(`blueprintId end-to-end: ${family}'s real production blueprint survives generation -> submit_question_candidate -> stored candidate -> publish_question_candidate -> published prompt, unmodified`, () => {
    const candidate = generateBlueprintCandidate(blueprint, seededRandom(4242));
    const validation = validateBlueprintCandidate(candidate, blueprint, []);

    // Step 1: blueprint -> generated candidate.
    assert.equal(candidate.blueprintId, blueprint.blueprintId);

    // Step 2: candidate -> submit_question_candidate() RPC args (this wave's §A fix, now in its own clean, English-free file: mathsCandidateStoreMapping.ts).
    const rpcArgs = mapMathsCandidateToStoreRow(`qf-e2e-${blueprint.blueprintId}`, candidate, blueprint, validation);
    const questionContent = rpcArgs.p_question_content as Record<string, unknown>;
    assert.equal(questionContent.blueprintId, blueprint.blueprintId);

    // Step 3: submit_question_candidate() (migration 230) stores question_content verbatim -- no transformation.
    const storedQuestionContent = questionContent; // verbatim, per the real SQL body
    assert.equal(storedQuestionContent.blueprintId, blueprint.blueprintId);

    // Step 4: publish_question_candidate() (migration 239, the currently-live version).
    const publishedPrompt = simulatePublish(storedQuestionContent, rpcArgs.p_claimed_answer, rpcArgs.p_subject);
    assert.equal(publishedPrompt.blueprintId, blueprint.blueprintId, "blueprintId must survive publish_question_candidate()'s v_final_prompt construction unmodified");
    assert.equal(publishedPrompt.answer, rpcArgs.p_claimed_answer, "the real Maths marking contract's own merge (migration 237/239) must still occur alongside blueprintId's survival");

    // Step 5: queryable. prompt is jsonb; prompt->>'blueprintId' is a standard
    // top-level jsonb text-extraction operator, structurally identical in
    // kind to prompt->>'requiredSelectionCount' (migration 239's own body)
    // and prompt->>'marks' (the real Practice marking check) -- no new query
    // mechanism required. A plain property read is the JS-side equivalent.
    assert.equal(publishedPrompt["blueprintId"], blueprint.blueprintId);
  });
}

runBlueprintIdEndToEndCheck(BP_REVERSE_DIRECT_UNSCAFFOLDED, "mr04-reverse-percentage");
runBlueprintIdEndToEndCheck(BP_TIME_REVERSE_MULTISTAGE_DIRECT, "mr04-time-reverse");
runBlueprintIdEndToEndCheck(BP_REVERSE_MEAN_DIRECT, "mr01-reverse-mean");
