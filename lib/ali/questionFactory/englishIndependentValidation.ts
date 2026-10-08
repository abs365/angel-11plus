/**
 * Controlled Scale Increment 002 — English Independent Validation.
 *
 * The Maths lesson applied to English from the start: an author's own
 * claim that "this accepted answer is correct" is UNTRUSTED, exactly
 * like a Maths blueprint's own `claimedAnswer`. Every function here
 * checks a candidate's claim against the actual, real text of its
 * source passage -- never against the author's own say-so, and never
 * against a second copy of the same claim. This is the ANCHOR half of
 * the deterministic/evidence-anchored/human_required split
 * (`englishTypes.ts`); the semantic-judgement half (is this REALLY the
 * right meaning/synonym/best quotation?) is never claimed to be
 * mechanically provable, and is not attempted here.
 */

import type { EnglishPassage, EnglishQuestionCandidate, EnglishIndependentCheckResult } from "./englishTypes";
import { checkAcceptedAnswerSet, checkOrderedSequence, checkQuotationPresent } from "@/lib/learningEngine/englishAnswerValidation";

function normaliseForSearch(s: string): string {
  return s.toLowerCase().replace(/[.,!?;:'"()]/g, "").replace(/\s+/g, " ").trim();
}

/** True when `needle` appears as a normalised substring of the passage's full text -- the passage is the ground truth, never the author's own claim. */
function appearsInPassage(passage: EnglishPassage, needle: string): boolean {
  const haystack = normaliseForSearch(passage.text);
  return haystack.includes(normaliseForSearch(needle));
}

/**
 * DETERMINISTIC anchor for Retrieval: at least one accepted answer form
 * must be a genuine, verbatim (tolerant) substring of the passage --
 * a retrieval question's whole premise is that the answer is literally
 * stated, so if NO accepted form appears in the real text, the
 * candidate is factually broken, not merely stylistically imperfect.
 */
export function verifyRetrievalEvidenced(passage: EnglishPassage, acceptedAnswers: string[]): EnglishIndependentCheckResult {
  const found = acceptedAnswers.some((a) => appearsInPassage(passage, a));
  return {
    matches: found,
    category: "deterministic",
    method: "verbatim_substring_search_against_passage_text",
    notes: found ? undefined : "No accepted answer form was found verbatim in the passage text -- a retrieval answer must be literally stated.",
  };
}

/**
 * DETERMINISTIC anchor for Sequencing: every item named in the claimed
 * correct order must itself be evidenced somewhere in the passage (so
 * the ordering task is genuinely about real textual events, not
 * fabricated ones), AND the CLAIMED order must match the order those
 * same items' own defining phrases actually first appear in the
 * passage text -- a genuine, mechanical cross-check against the real
 * narrative sequence, not merely trusting the author's ordering.
 */
export function verifySequenceOrderEvidenced(passage: EnglishPassage, correctOrderAcceptedSets: string[][]): EnglishIndependentCheckResult {
  const normalisedPassage = normaliseForSearch(passage.text);
  const firstPositions: number[] = [];
  for (const acceptedSet of correctOrderAcceptedSets) {
    const positions = acceptedSet.map((phrase) => normalisedPassage.indexOf(normaliseForSearch(phrase))).filter((pos) => pos >= 0);
    if (positions.length === 0) {
      return { matches: false, category: "deterministic", method: "textual_position_cross_check", notes: `No accepted phrase for one sequence position was found in the passage: ${JSON.stringify(acceptedSet)}` };
    }
    firstPositions.push(Math.min(...positions));
  }
  const isAscending = firstPositions.every((pos, i) => i === 0 || pos >= firstPositions[i - 1]);
  return {
    matches: isAscending,
    category: "deterministic",
    method: "textual_position_cross_check",
    notes: isAscending ? undefined : `Claimed order does not match the real order these events first appear in the passage text (positions: ${firstPositions.join(", ")}).`,
  };
}

/**
 * EVIDENCE-ANCHORED anchor for Vocabulary/Meaning-in-Context and Synonym
 * Selection: the TARGET WORD/PHRASE the question is actually about must
 * genuinely appear in the passage (never a fabricated word the passage
 * doesn't contain) -- mechanically checkable. Whether the claimed
 * MEANING/synonym is semantically correct in context is NOT mechanically
 * checkable and is never claimed to be -- that judgement is why this
 * returns category "evidence_anchored", not "deterministic".
 */
export function verifyTargetWordEvidenced(passage: EnglishPassage, targetWord: string): EnglishIndependentCheckResult {
  const found = appearsInPassage(passage, targetWord);
  return {
    matches: found,
    category: "evidence_anchored",
    method: "target_word_presence_check",
    notes: found
      ? "Target word/phrase confirmed present in the passage. The semantic correctness of the claimed meaning/synonym is NOT mechanically verified here and requires human educational review."
      : "Target word/phrase was not found in the passage text at all -- a fabricated or mistyped target, a genuine defect.",
  };
}

/**
 * EVIDENCE-ANCHORED anchor for Quotation + Explanation: the required
 * quotation must be a genuine, verbatim (tolerant) substring of the
 * passage -- reuses the SAME `checkQuotationPresent` function the real
 * live runtime grading path already uses (`englishAnswerValidation.ts`),
 * never a second, parallel implementation. The accompanying explanation
 * is explicitly out of scope (HUMAN_REQUIRED, never claimed gradable).
 */
export function verifyQuotationEvidenced(passage: EnglishPassage, requiredQuotation: string): EnglishIndependentCheckResult {
  const result = checkQuotationPresent(passage.text, requiredQuotation);
  return {
    matches: result.quotationFound,
    category: "evidence_anchored",
    method: "checkQuotationPresent_against_passage_text",
    notes: result.quotationFound ? "Quotation confirmed present. The accompanying explanation is HUMAN_REQUIRED, never automatically graded." : "Required quotation was not found verbatim in the passage text.",
  };
}

/**
 * Increment 002 Revision, Section 2 -- EVIDENCE-ANCHORED anchor for
 * `eng-qe-bp-two-part-quotation`, closing the systemic gap the
 * Educational Calibration found: the prior implementation checked only
 * `requiredQuotation`, silently leaving `secondRequiredQuotation`
 * unverified (a claim made in prose guidance, never machine-checked).
 * BOTH quotations must now independently pass `checkQuotationPresent`
 * -- neither is validated merely because the other passed (each call is
 * independent; a passing first quotation does not short-circuit the
 * second check). A distinctness check (the two quotations must not be
 * the same substring, after normalisation) enforces the blueprint's own
 * "evidence spans TWO separate quotations, not one single spot"
 * requirement -- a candidate cannot satisfy this blueprint by repeating
 * one quotation twice.
 *
 * Honest scope, unchanged from the single-quotation check: this proves
 * BOTH quotations are genuine, verbatim, real substrings of the passage
 * (mechanical, deterministic in the sense that presence is either true
 * or false) -- it does NOT mechanically prove either quotation is the
 * educationally RIGHT evidence for the specific claim being asked about,
 * or that the explanation correctly links them. Those semantic
 * judgements remain evidence_anchored/human-reviewed, exactly as for
 * every other Quotation + Explanation blueprint -- never silently
 * upgraded to "fully verified" by this fix.
 */
export function verifyTwoPartQuotationEvidenced(passage: EnglishPassage, firstQuotation: string, secondQuotation: string): EnglishIndependentCheckResult {
  const firstResult = checkQuotationPresent(passage.text, firstQuotation);
  const secondResult = checkQuotationPresent(passage.text, secondQuotation);

  if (!firstResult.quotationFound && !secondResult.quotationFound) {
    return { matches: false, category: "evidence_anchored", method: "checkQuotationPresent_against_passage_text_both_parts", notes: "Neither required quotation was found verbatim in the passage text." };
  }
  if (!firstResult.quotationFound) {
    return { matches: false, category: "evidence_anchored", method: "checkQuotationPresent_against_passage_text_both_parts", notes: "The FIRST required quotation was not found verbatim in the passage text (the second was)." };
  }
  if (!secondResult.quotationFound) {
    return { matches: false, category: "evidence_anchored", method: "checkQuotationPresent_against_passage_text_both_parts", notes: "The SECOND required quotation was not found verbatim in the passage text (the first was) -- this is exactly the gap the Educational Calibration review found and this fix closes." };
  }
  const normalisedFirst = normaliseForSearch(firstQuotation);
  const normalisedSecond = normaliseForSearch(secondQuotation);
  if (normalisedFirst === normalisedSecond || normalisedFirst.includes(normalisedSecond) || normalisedSecond.includes(normalisedFirst)) {
    return { matches: false, category: "evidence_anchored", method: "checkQuotationPresent_against_passage_text_both_parts", notes: "The two required quotations are not genuinely distinct evidence (one is the same as, or entirely contains, the other) -- this blueprint requires evidence spanning two separate quotations, not one quotation counted twice." };
  }
  return {
    matches: true,
    category: "evidence_anchored",
    method: "checkQuotationPresent_against_passage_text_both_parts",
    notes: "Both required quotations independently confirmed present and genuinely distinct. The accompanying explanation (how the two pieces of evidence work together) is HUMAN_REQUIRED, never automatically graded.",
  };
}

/**
 * DETERMINISTIC anchor for single_select (Synonym Selection and
 * similar): the candidate's own claimed correct option must pass the
 * SAME real accepted-answer-set check (`checkAcceptedAnswerSet`) against
 * itself trivially, but the genuinely useful independent check here is
 * structural: exactly one option must be marked correct, every
 * DISTRACTOR must carry a disclosed rationale (Section 9), and the
 * correct option's own text must not be a byte-identical duplicate of
 * any distractor (a real, catchable authoring defect).
 */
export function verifySingleSelectStructure(candidate: Pick<EnglishQuestionCandidate, "options" | "correctOptionIndex" | "distractorRationale">): EnglishIndependentCheckResult {
  const { options, correctOptionIndex, distractorRationale } = candidate;
  if (!options || correctOptionIndex === undefined) {
    return { matches: false, category: "deterministic", method: "single_select_structural_check", notes: "Missing options or correctOptionIndex." };
  }
  if (correctOptionIndex < 0 || correctOptionIndex >= options.length) {
    return { matches: false, category: "deterministic", method: "single_select_structural_check", notes: "correctOptionIndex out of range." };
  }
  const uniqueOptions = new Set(options.map((o) => normaliseForSearch(o)));
  if (uniqueOptions.size !== options.length) {
    return { matches: false, category: "deterministic", method: "single_select_structural_check", notes: "Two options are byte-identical after normalisation -- a genuine authoring defect." };
  }
  const distractorIndices = options.map((_, i) => i).filter((i) => i !== correctOptionIndex);
  const missingRationale = distractorIndices.filter((i) => !distractorRationale?.[i]);
  if (missingRationale.length > 0) {
    return { matches: false, category: "deterministic", method: "single_select_structural_check", notes: `Distractor(s) at index ${missingRationale.join(",")} have no disclosed rationale.` };
  }
  return { matches: true, category: "deterministic", method: "single_select_structural_check" };
}

/**
 * Increment 002 Sequencing sub-checks. `eng-seq-bp-before-after` and
 * `eng-seq-bp-insert-position` reuse `correctOrderAcceptedSets` with a
 * documented, blueprint-specific convention (never the generic "one
 * accepted set per ordered-list position" meaning those two blueprints
 * don't actually have):
 *   - before-after: exactly 2 entries, [[eventNamedFirstInQuestion],
 *     [eventNamedSecondInQuestion]] -- the TRUE before/after relation is
 *     derived from which anchor's own text genuinely appears earlier in
 *     the passage, then cross-checked against the candidate's own
 *     claimed acceptedAnswers[0] ("before"/"after").
 *   - insert-position: [[newEventAnchor], ...partialOrderAnchorsInOrder]
 *     -- confirms the new event's anchor is real and falls strictly
 *     between the first and last given anchor points (a genuine,
 *     mechanical bound-check); it does not resolve the EXACT claimed
 *     slot among several candidate gaps, which is why this one case is
 *     disclosed as evidence_anchored, not deterministic.
 */
function verifyBeforeAfterClaim(passage: EnglishPassage, candidate: EnglishQuestionCandidate): EnglishIndependentCheckResult {
  const sets = candidate.correctOrderAcceptedSets ?? [];
  const claimed = (candidate.acceptedAnswers?.[0] ?? "").toLowerCase().trim();
  if (sets.length !== 2) return { matches: false, category: "deterministic", method: "before_after_position_check", notes: "Expected exactly 2 anchor phrases (the two events named in the question)." };
  const normalisedPassage = normaliseForSearch(passage.text);
  const posX = normalisedPassage.indexOf(normaliseForSearch(sets[0][0]));
  const posY = normalisedPassage.indexOf(normaliseForSearch(sets[1][0]));
  if (posX < 0 || posY < 0) return { matches: false, category: "deterministic", method: "before_after_position_check", notes: "One of the two anchor phrases was not found in the passage." };
  const trueRelation = posX < posY ? "before" : "after";
  return { matches: trueRelation === claimed, category: "deterministic", method: "before_after_position_check", notes: trueRelation === claimed ? undefined : `The real textual order gives "${trueRelation}", not "${claimed}".` };
}

function verifyInsertPositionClaim(passage: EnglishPassage, candidate: EnglishQuestionCandidate): EnglishIndependentCheckResult {
  const sets = candidate.correctOrderAcceptedSets ?? [];
  if (sets.length < 3) return { matches: false, category: "evidence_anchored", method: "insert_position_bound_check", notes: "Expected the new event's anchor plus at least 2 partial-order anchors." };
  const normalisedPassage = normaliseForSearch(passage.text);
  const posOf = (phrase: string) => normalisedPassage.indexOf(normaliseForSearch(phrase));
  const newEventPos = posOf(sets[0][0]);
  const anchorPositions = sets.slice(1).map((s) => posOf(s[0]));
  if (newEventPos < 0 || anchorPositions.some((p) => p < 0)) {
    return { matches: false, category: "evidence_anchored", method: "insert_position_bound_check", notes: "The new event's anchor or one of the given partial-order anchors was not found in the passage." };
  }
  const withinBounds = newEventPos > Math.min(...anchorPositions) && newEventPos < Math.max(...anchorPositions);
  return {
    matches: withinBounds,
    category: "evidence_anchored",
    method: "insert_position_bound_check",
    notes: withinBounds
      ? "New event's anchor confirmed to fall within the given partial order's span. The EXACT claimed slot (which specific gap) is not independently resolved here and remains subject to human educational review."
      : "New event's anchor falls outside the span of the given partial-order anchors -- the claimed insertion cannot be correct.",
  };
}

/**
 * Runs the correct independent check for a candidate based on its own
 * `responseType`/`validationCategory`/`blueprintId` -- the single entry
 * point the generation/review pipeline calls, mirroring
 * `validateBlueprintCandidate`'s own dispatch role for Maths.
 */
export function runEnglishIndependentCheck(candidate: EnglishQuestionCandidate, passage: EnglishPassage): EnglishIndependentCheckResult {
  if (candidate.familyName === "Sequencing") {
    if (candidate.blueprintId === "eng-seq-bp-full-order") return verifySequenceOrderEvidenced(passage, candidate.correctOrderAcceptedSets ?? []);
    if (candidate.blueprintId === "eng-seq-bp-first-last") return verifyRetrievalEvidenced(passage, candidate.acceptedAnswers ?? []);
    if (candidate.blueprintId === "eng-seq-bp-before-after") return verifyBeforeAfterClaim(passage, candidate);
    if (candidate.blueprintId === "eng-seq-bp-insert-position") return verifyInsertPositionClaim(passage, candidate);
  }

  switch (candidate.responseType) {
    case "short_answer": {
      if (!candidate.acceptedAnswers || candidate.acceptedAnswers.length === 0) {
        return { matches: false, category: "deterministic", method: "none", notes: "No acceptedAnswers declared." };
      }
      if (candidate.familyName === "Retrieval") return verifyRetrievalEvidenced(passage, candidate.acceptedAnswers);
      // Vocabulary/Meaning-in-Context and similar open-explanation families: verify the target word is real, disclose the semantic-judgement gap.
      const targetWordMatch = candidate.question.match(/["'“]([^"'”]+)["'”]/);
      const targetWord = targetWordMatch ? targetWordMatch[1] : candidate.acceptedAnswers[0];
      return verifyTargetWordEvidenced(passage, targetWord);
    }
    case "ordered_list": {
      if (!candidate.correctOrderAcceptedSets) return { matches: false, category: "deterministic", method: "none", notes: "No correctOrderAcceptedSets declared." };
      return verifySequenceOrderEvidenced(passage, candidate.correctOrderAcceptedSets);
    }
    case "single_select": {
      const structural = verifySingleSelectStructure(candidate);
      if (!structural.matches) return structural;
      const targetWordMatch = candidate.question.match(/["'“]([^"'”]+)["'”]/);
      if (targetWordMatch) return verifyTargetWordEvidenced(passage, targetWordMatch[1]);
      return structural;
    }
    case "quotation_plus_explanation": {
      if (!candidate.requiredQuotation) return { matches: false, category: "evidence_anchored", method: "none", notes: "No requiredQuotation declared." };
      // Increment 002 Revision, Section 2 -- a candidate declaring BOTH
      // quotations (eng-qe-bp-two-part-quotation) must have BOTH
      // independently verified, never just the first.
      if (candidate.secondRequiredQuotation) {
        return verifyTwoPartQuotationEvidenced(passage, candidate.requiredQuotation, candidate.secondRequiredQuotation);
      }
      return verifyQuotationEvidenced(passage, candidate.requiredQuotation);
    }
  }
}

// Re-exported for candidates/tests that want to exercise the real
// runtime-grading tiers directly against a candidate's own declared
// accepted-answer data (never a second, parallel implementation).
export { checkAcceptedAnswerSet, checkOrderedSequence, checkQuotationPresent };
