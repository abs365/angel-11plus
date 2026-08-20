// Educational Increment 007E, Part 7/9 — data layer for the admin
// Educational Review interface (app/admin-beta/review/page.tsx). Reads
// and writes go through ali_family_review / ali_passage_bank /
// ali_question_bank exactly as any other Supabase client call in this
// app — the real access control is migration 054's RLS policies
// (is_current_user_admin()), not this file. Mirrors lib/feedback.ts's
// established fetch-function style.
//
// Submitting a review here inserts ONE new ali_family_review row —
// existing pending rows are never deleted or overwritten (same
// append-only history convention every migration in this project uses).
// It never touches ali_question_bank.eligibility_status: an approved
// review is a human educational judgement, not an activation — see
// ANGEL_EDUCATIONAL_REVIEW_OPERATING_MODEL_V1.md §5.

import { getSupabaseClient } from "./supabase";

export type ReviewTargetType = "passage" | "question_family" | "writing_prompt";

/** Every review_type value the live ali_family_review_review_type_check constraint permits (migrations 034/059/060/061/087). */
export type ReviewType =
  | "content_review"
  | "maths_teaching_review"
  | "english_teaching_review"
  | "writing_teaching_review"
  | "mock_maths_independent_review"
  | "mock_english_passage_independent_review"
  | "mock_writing_prompt_independent_review";
export type ReviewDecision = "approved" | "approved_with_amendment" | "rejected" | "requires_revalidation";

/**
 * Educational Increment 007F, "Review Evidence Clarification" — moved
 * here (from app/admin-beta/review/page.tsx) so the semantic-consistency
 * convention below is unit-testable without loading React/JSX
 * (tests/lib/adminReview.test.ts).
 *
 * QUALITY RULE (the Founder's own instruction): for every criterion
 * where practical, Yes = criterion satisfied, No = a problem was found,
 * N/A = genuinely not applicable. `polarity: "yes-is-good"` records that
 * every criterion below meets this convention — a regression test
 * asserts every entry carries it, so a future edit that reintroduces a
 * negatively-framed question (Yes = bad) fails the test suite, not just
 * a human re-reading the UI.
 */
export interface ReviewCriterion {
  key: keyof ReviewSubmission;
  question: string;
  polarity: "yes-is-good";
}

export const REVIEW_CRITERIA: ReviewCriterion[] = [
  { key: "educationalValidity", question: "Is the educational content accurate?", polarity: "yes-is-good" },
  { key: "competencyValidity", question: "Does it genuinely assess the skill it claims to?", polarity: "yes-is-good" },
  { key: "questionTypeAlignment", question: "Does it match the real CSSE question pattern it's based on?", polarity: "yes-is-good" },
  { key: "answerCorrectnessVerified", question: "Are the answers and marking expectations correct?", polarity: "yes-is-good" },
  // Educational Increment 007F, Review Evidence Clarification — was
  // "Could a reasonable child give a different, equally defensible
  // answer the key does not accept?", where "No" (not "Yes") was the
  // desirable answer, breaking the Yes-is-good convention every other
  // criterion follows. Reframed positively without changing what it
  // actually checks (ambiguity-freedom).
  { key: "ambiguityFree", question: "Does the answer key accept every reasonable answer supported by the passage?", polarity: "yes-is-good" },
  { key: "wordingQuality", question: "Is the wording clear for an 11+ learner?", polarity: "yes-is-good" },
  { key: "ageAppropriate", question: "Is this age-appropriate for an 11+ candidate?", polarity: "yes-is-good" },
  { key: "difficultyAppropriate", question: "Is the difficulty appropriate for its stated level?", polarity: "yes-is-good" },
  { key: "transferValidity", question: "Is the transfer demand (how far this asks the learner to generalise) honestly classified?", polarity: "yes-is-good" },
  { key: "misconceptionQuality", question: "Is the recorded misconception a real, plausible mistake a child would make?", polarity: "yes-is-good" },
  { key: "variationBoundariesSound", question: "Do the easiest and hardest examples you saw genuinely represent the family's range?", polarity: "yes-is-good" },
  { key: "teachingQuality", question: "Does the teaching support genuinely help the learner, where one exists?", polarity: "yes-is-good" },
  { key: "examStrategyQuality", question: "Is the exam strategy shown to learners useful and safe advice?", polarity: "yes-is-good" },
  { key: "explanationQuality", question: "Where a model answer is shown, does it actually explain, not just restate?", polarity: "yes-is-good" },
  { key: "validationBehaviourSound", question: "Does the way Angel marks this match how CSSE would genuinely mark it?", polarity: "yes-is-good" },
  { key: "authenticityConfirmed", question: "Does this genuinely resemble a real CSSE question, not a generic worksheet?", polarity: "yes-is-good" },
  { key: "originalityConfirmed", question: "Is the content sufficiently original?", polarity: "yes-is-good" },
  { key: "copyrightRiskClear", question: "Is the content free of any copyright concern?", polarity: "yes-is-good" },
];

/**
 * Heuristic guard against reintroducing negative framing: a "yes-is-good"
 * question should not itself be phrased as "could/does X go wrong"
 * ("Could a reasonable child...", "Does it fail to...", "Is there a
 * problem..."). This is a defensible lint, not a proof of correct
 * framing — genuine review of new wording still matters — but it catches
 * the exact class of regression this correction fixes.
 */
const NEGATIVE_FRAMING_PATTERNS = [/^could\b/i, /\bfail to\b/i, /\bproblem with\b/i, /\bdoes not\b.*\?$/i, /\bwithout\b.*\?$/i];

export function hasNegativeFraming(question: string): boolean {
  return NEGATIVE_FRAMING_PATTERNS.some((p) => p.test(question));
}

/**
 * Educational Increment 007F, Review Evidence Clarification, Part 1 —
 * distinguishes what the accepted CSSE evidence itself demonstrates (A)
 * from Angel's own original teaching content built on that demonstrated
 * demand (B), and states the evidence's real limitation honestly (C).
 * `evidenceBasis` remains the short summary already shown for the other
 * 5 pilot families that don't yet need this fuller breakdown — nothing
 * about their entries changes.
 */
export interface FamilyEvidenceContext {
  objective: string;
  evidenceBasis: string;
  confirmedFromEvidence?: string;
  angelExtension?: string;
  evidenceLimitation?: string;
}

export const FAMILY_EDUCATIONAL_CONTEXT: Record<string, FamilyEvidenceContext> = {
  "wave2-fam-multiselect": {
    objective: "Recognise which of several statements about a passage are actually supported by the text, when told exactly how many to select.",
    evidenceBasis: "CSSE 2021 Main Test paper, Question 11 (tick-box format). Observed in 1 of the 3 CSSE Main Test years read for this programme.",
    confirmedFromEvidence: "The CSSE 2021 Main Test paper's Question 11 uses a tick-box format: candidates are told exactly how many statements to select from a longer list, and select the ones the passage supports.",
    angelExtension: "Angel's questions in this family are original: new passages, new statements, and new distractors, written by Angel to test the same structural demand the 2021 paper demonstrated. No Angel wording, passage, or generated variant is copied from, or derived from the specific wording of, any CSSE paper.",
    evidenceLimitation: "This exact tick-box structure was observed in only 1 of the 3 CSSE Main Test years read (2021; not present in the 2022 or 2023 papers read for this programme). It is a genuinely observed CSSE assessment demand, not a proven, annually recurring format, and should not be presented to a reviewer as more certain than that.",
  },
  "wave1-fam-sequencing": {
    objective: "Reconstruct the true order of events, actions, or a cause-and-effect chain from a passage, without relying on memory of a natural-feeling order.",
    evidenceBasis: "CSSE 2021/2022/2023 Main Test papers and the 2023 marking scheme's own worked example (which awards partial credit for items correct but out of position).",
  },
  "wave1-fam-quote-explain": {
    objective: "Find the exact words in a passage that answer a question, then explain what those words show, not just restate them.",
    evidenceBasis: "The single most frequent question pattern across all 3 CSSE years read for this programme.",
  },
  "wave1-fam-two-character": {
    objective: "Compare and contrast two people or characters in a passage using separate, specific evidence for each, not a one-sided answer.",
    evidenceBasis: "CSSE 2021/2022/2023 Main Test papers.",
  },
  "wave1-fam-vocab-explain": {
    objective: "Work out what a word or phrase means from how it is used in its sentence, not from memorised dictionary definitions.",
    evidenceBasis: "CSSE 2021/2022/2023 Main Test papers.",
  },
  "mr02-compare": {
    objective: "Evaluate two linear expressions at a stated value and judge whether the first is greater than, less than, or equal to the second.",
    evidenceBasis: "CSSE 2021/2022/2023 Mathematics papers (Algebraic/Symbolic Problem-Solving competency).",
  },
  // Educational Increment 007H, Controlled Review Batch 2.
  "wave1-fam-direct-retrieval": {
    objective: "Locate a single, explicitly stated fact or detail in a passage and report it accurately, without summarising or inferring beyond what the text says.",
    evidenceBasis: "CSSE 2021/2022/2023 Main Test papers (direct reading, ANGEL_007D_REVIEW_BACKLOG_V1.md). The most foundational comprehension demand present in every year read.",
  },
  "wave1-fam-synonym-battery": {
    objective: "Give a synonym for a word exactly as it is used in its specific sentence, not a generic dictionary definition or a synonym for a different, more common sense of the word.",
    evidenceBasis: "CSSE 2021/2022/2023 Main Test papers (direct reading, ANGEL_007D_REVIEW_BACKLOG_V1.md). Currently the only English competency (QT-RC-04) with zero practice-eligible supply. See ANGEL_007H_BATCH2_SELECTION_V1.md.",
  },
  "wave1-fam-emotion-cause": {
    objective: "Identify how a character feels at a specific point in a passage and explain, using evidence, why they feel that way. Not just naming an emotion without grounding it in the text.",
    evidenceBasis: "CSSE 2021/2022/2023 Main Test papers (direct reading, ANGEL_007D_REVIEW_BACKLOG_V1.md).",
  },
  "mr03-classify": {
    objective: "Classify a triangle as equilateral, isosceles or scalene from its three angles, using the equal-angles-imply-equal-opposite-sides property rather than guessing from appearance.",
    evidenceBasis: "CSSE-006 Q7/Q12, CSSE-011 Q12/Q17, CSSE-016 Q11 (Geometric Angle/Shape Reasoning competency). Review pack: MATHEMATICS_WAVE2_REVIEW_PACKS.md.",
  },
  "mr04-far-percent": {
    objective: "Recognise a proportional (not fixed-amount) relationship between a before/after pair of values, and apply that same relationship to a new value, without the prompt ever naming 'percentage' or 'fraction'.",
    evidenceBasis: "CSSE-006 Q1/Q13, CSSE-011 Q1/Q2/Q3, CSSE-016 Q1/Q2 (Percentage/Proportional Change Word Problem). Review pack: MATHEMATICS_WAVE2_REVIEW_PACKS.md. Disclosed limitation: all 3 variants share one narrative frame and use a 'nice' ratio; no non-simplifying ratio variant exists yet.",
  },
  "mr04-mixed-divisibility": {
    objective: "Find the one number that satisfies two simultaneous conditions (a stated range plus two grouping/divisibility rules) given in continuous prose, not as separate labelled equations.",
    evidenceBasis: "CSSE-006, CSSE-016 (Best-Value/Combinatorial Word Problem). Review pack: MATHEMATICS_WAVE2_REVIEW_PACKS.md. Uniqueness of the answer is verified at content-generation time, not asserted by hand.",
  },
  // Educational Increment 007I, Controlled Review Batch 3.
  "mr01-missing-operand": {
    objective: "Find an unknown number in a simple equation using the inverse operation, when the unknown can appear in any position, not only at the end.",
    evidenceBasis: "CSSE-006 Q2(b)(c)(d) (2023), CSSE-016 Q2(c)(d)/Q3(a)(b) (2021). Currently the only Mathematics competency (QT-MR-02) with zero practice-eligible supply. See ANGEL_007I_BATCH3_SELECTION_V1.md.",
  },
  "mr03-coordinate": {
    objective: "Apply a single geometric transformation (reflection in the x-axis, reflection in the y-axis, or a translation) to a coordinate pair.",
    evidenceBasis: "AEP-004 QT-MR-08 (Coordinate/Transformation Reasoning), CSSE Multi-Year Pattern Analysis. Currently the only other Mathematics competency (QT-MR-08) with zero practice-eligible supply.",
  },
  "mr01-measurement-conversion": {
    objective: "Convert two measurements to a common unit before combining them.",
    evidenceBasis: "CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-03 (Obs. 11): CSSE-006, CSSE-011, CSSE-016. Currently has only 1 practice-eligible question, a legacy singleton with no real family behind it.",
  },
  "mr01-data-table": {
    objective: "Read values from a small labelled table and apply the specific operation the question asks for, a targeted sum, a difference, or the range, not just read off one number.",
    evidenceBasis: "CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-09 (Obs. 11): CSSE-006, CSSE-011, CSSE-016. Currently has only 1 practice-eligible question, a legacy singleton.",
  },
  "mr04-elapsed-time": {
    objective: "Add several sequential durations onto a start time, carrying minutes into hours correctly.",
    evidenceBasis: "CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-10 (Obs. 11): CSSE-006, CSSE-011, CSSE-016. Currently has only 1 practice-eligible question, a legacy singleton.",
  },
  "mr01-average-mean": {
    objective: "Compute the mean of a small set of values, dividing by the correct count.",
    evidenceBasis: "CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-12 (Obs. 11): CSSE-006, CSSE-011, CSSE-016. Currently has only 1 practice-eligible question, a legacy singleton.",
  },
  "mr02-nth-term": {
    objective: "Infer the rule behind a number sequence and use it to find a term far beyond what is shown, without listing every term up to it.",
    evidenceBasis: "CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-05 (Obs. 11): CSSE-006, CSSE-011, CSSE-016. Breaks a current one-family monopoly on this competency (10 practice-eligible questions, all from a single family).",
  },
  // Educational Increment 007K, Controlled Review Batch 4.
  "mr04-best-value": {
    objective: "Compare unit prices across two options to determine which is genuinely cheaper per item, not just which total cost is smaller.",
    evidenceBasis: "CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-13 (Obs. 11): CSSE-006, CSSE-016. Currently the thinnest Practice Eligible Mathematics competency (3 questions, 1 family). See ANGEL_007K_MATHEMATICS_DEPTH_AND_BATCH4_READINESS_V1.md.",
  },
  "mr02-far-ratio-context": {
    objective: "Split a total by a stated ratio, then apply a second, separate operation to one of the resulting shares.",
    evidenceBasis: "CSSE-006 Q8/Q18, CSSE-011 Q6/Q18, CSSE-016 Q6. See ANGEL_007K_MATHEMATICS_DEPTH_AND_BATCH4_READINESS_V1.md.",
  },
  "mr05-factors-primes": {
    objective: "Count all factors of a number, or determine whether a number is prime.",
    evidenceBasis: "CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-11 (Obs. 11). See ANGEL_007K_MATHEMATICS_DEPTH_AND_BATCH4_READINESS_V1.md.",
  },
  "mr05-constrained-multiple": {
    objective: "Find the smallest (or largest) common multiple of two numbers that also satisfies a stated bound.",
    evidenceBasis: "CSSE-006 Q10, CSSE-011 Q13, CSSE-016. See ANGEL_007K_MATHEMATICS_DEPTH_AND_BATCH4_READINESS_V1.md.",
  },
  "mr03-angle-ratio": {
    objective: "Split a known angle total (180° on a line, 360° around a point) by a stated ratio to find the largest share.",
    evidenceBasis: "CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-07 (Obs. 11). See ANGEL_007K_MATHEMATICS_DEPTH_AND_BATCH4_READINESS_V1.md.",
  },
  "mr02-sum-difference": {
    objective: "Recover two unknown amounts from their sum and their stated difference.",
    evidenceBasis: "CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-06 (Obs. 11). See ANGEL_007K_MATHEMATICS_DEPTH_AND_BATCH4_READINESS_V1.md.",
  },
  "mr04-compound-percentage": {
    objective: "Apply two percentage changes in sequence, each to the result of the previous one, not both to the original value.",
    evidenceBasis: "CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-04 (Obs. 11). See ANGEL_007K_MATHEMATICS_DEPTH_AND_BATCH4_READINESS_V1.md.",
  },
  "mr03-mixed-perimeter": {
    objective: "Use a rectangle's area and one known side to find the other side, then compute the perimeter.",
    evidenceBasis: "CSSE-006 Q7/Q12, CSSE-011 Q12/Q17, CSSE-016 Q11. See ANGEL_007K_MATHEMATICS_DEPTH_AND_BATCH4_READINESS_V1.md. Answers carry a unit suffix; affected by the unit-answer validation defect fixed in Decision 55, now resolved and verified.",
  },
  "mr04-far-recipe": {
    objective: "Find a unit rate (amount per person) and scale it to a different number of people.",
    evidenceBasis: "CSSE-006 Q1/Q13, CSSE-011 Q1/Q2/Q3, CSSE-016 Q1/Q2. See ANGEL_007K_MATHEMATICS_DEPTH_AND_BATCH4_READINESS_V1.md. Answers carry a unit suffix; affected by the unit-answer validation defect fixed in Decision 55, now resolved and verified.",
  },
  // CSSE Completion Programme Phase B (Educational Increment 007M) — the 6
  // of the phase's 22 newly-taught families that had never previously
  // appeared in any Controlled Review Batch (content or teaching), so no
  // FAMILY_EDUCATIONAL_CONTEXT entry existed for them until now.
  "mr02-sequence-rule": {
    objective: "Apply a two-step numeric rule forwards to find an output, or reverse both steps in the opposite order to find the input that produced a given output.",
    evidenceBasis: "CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-05 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.",
  },
  "mr02-substitution": {
    objective: "Substitute two given algebraic relationships into a single total equation, so every unknown is expressed in terms of one variable before solving.",
    evidenceBasis: "CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-06 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.",
  },
  "mr03-angle-sum": {
    objective: "Find a missing angle in a triangle or quadrilateral by subtracting the known angles from the shape's fixed angle total (180° or 360°).",
    evidenceBasis: "CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-07 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.",
  },
  "mr05-number-property": {
    objective: "Apply the exact definition of a stated number property (e.g. prime, square, factor) directly to a number, rather than a related but different rule of thumb.",
    evidenceBasis: "CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-11 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.",
  },
  "precision-dec": {
    objective: "Round a decimal answer correctly to the number of decimal places asked for, using the next digit rather than truncating early.",
    evidenceBasis: "CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-14 (Obs. 3): CSSE-007, CSSE-012, CSSE-017. Precision Under Exact-Match applies as a cross-cutting scoring condition across every Mathematics Question Type, not as a separate content relationship.",
  },
  "precision-frac": {
    objective: "Give an answer as an exact fraction (not a rounded decimal) when the question's own instruction requires it.",
    evidenceBasis: "CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-14 (Obs. 3): CSSE-007, CSSE-012, CSSE-017. Precision Under Exact-Match applies as a cross-cutting scoring condition across every Mathematics Question Type, not as a separate content relationship.",
  },
  // Stage 3, Increment 003 (Decision 116) — 3 brand-new families, each
  // extending an already-validated sibling family's evidence basis to a
  // reverse/conversion direction that sibling never covered. No new
  // external CSSE-format research was performed for these specific
  // reverse/conversion structures this increment (per Stage 3, Increment
  // 004's own explicit instruction); evidenceBasis is stated with that
  // bound honestly rather than implying independently-researched support.
  "mr04-reverse-percentage": {
    objective: "Given a known percentage change and the resulting value, find the original value before the change: the reverse of the already-established mr04-compound-percentage family's own forward-only direction.",
    evidenceBasis: "Extends the already-validated mr04-compound-percentage family's evidence basis (percentage/proportional change is a confirmed CSSE Mathematics demand) to the reverse direction. See ALI_DECISION_LOG.md Decisions 116-117 for the full reconciliation and technical review.",
  },
  "mr04-time-reverse": {
    objective: "Given a finish time and a sequence of stage durations, find the start time: the reverse of the already-established mr04-elapsed-time family's own forward-only direction.",
    evidenceBasis: "Extends the already-validated mr04-elapsed-time family's evidence basis (elapsed-time word problems are a confirmed CSSE Mathematics demand) to the reverse direction. See ALI_DECISION_LOG.md Decisions 116-117 for the full reconciliation and technical review.",
  },
  "mr04-bv-convert": {
    objective: "Compare unit prices across two options where the units first require conversion to a common unit. Extends the already-established mr04-best-value family, whose existing siblings never require a conversion step.",
    evidenceBasis: "Extends the already-validated mr04-best-value family's evidence basis (best-value/unit-price comparison is a confirmed CSSE Mathematics demand) to include a genuine unit-conversion step. See ALI_DECISION_LOG.md Decisions 116-117 for the full reconciliation and technical review.",
  },
  // Stage 3, Increment 006 (Decision 121 discovery, this increment's
  // authoring) — 2 brand-new families. QT-MR-12's own inverse form and
  // QT-MR-08's own rotation-family gap are both named directly in
  // CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md's Measurement Purpose text for
  // those Question Types, not invented for this increment.
  "mr01-reverse-mean": {
    objective: "Given the mean of a set of values and all but one of the individual values, find the missing value. This is the inverse of the already-established mr01-average-mean family, which only ever gives all the values and asks for the mean.",
    evidenceBasis: "CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md's own Measurement Purpose for QT-MR-12 already names this inverse form directly: \"in its inverse form, [QT-MR-12 requires the candidate] to reconstruct a missing value... from a stated mean.\" See ALI_DECISION_LOG.md Decision 121 for the full discovery and this increment's decision entry for the authoring review.",
  },
  "mr03-coord-combined": {
    objective: "Apply two transformations (a reflection and a translation) to one point, in a stated order, where the two operations do not commute. Extends the already-established mr03-coordinate family, whose existing siblings each apply exactly one transformation.",
    evidenceBasis: "CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md's own Measurement Purpose for QT-MR-08 names transformation reasoning as this Question Type's own defined scope. See ALI_DECISION_LOG.md Decision 121 for the full discovery and this increment's decision entry for the authoring review.",
  },
};

/**
 * Educational Increment 007F, Review Evidence Clarification, Part 1D —
 * makes the directly-evidenced-vs-inferred distinction that already
 * existed in checkMultiSelect()'s own code comments
 * (lib/learningEngine/englishAnswerValidation.ts) visible to a human
 * reviewer, instead of only to whoever reads the source. Nothing here
 * changes the actual scoring behaviour or upgrades the inferred rule to
 * confirmed — it only surfaces the existing, real distinction.
 */
export interface MarkingBasisItem {
  rule: string;
  status: "directly-evidenced" | "inferred";
  citation: string;
}

export const FAMILY_MARKING_BASIS: Record<string, MarkingBasisItem[]> = {
  "wave2-fam-multiselect": [
    {
      rule: "Selecting more options than instructed loses all marks for the question, even if some of the selections were correct.",
      status: "directly-evidenced",
      citation: "CSSE 2023 Main Test paper, cover-page instruction: \"Candidates must NOT tick more boxes than they are instructed to. Any who do will lose all the marks for that question.\"",
    },
    {
      rule: "Selecting fewer than the required number earns one mark per correct selection made.",
      status: "inferred",
      citation: "No accepted CSSE marking-scheme artefact for this specific item type was among the evidence read for this programme (CSSE-003/005/008/013). This is a defensible educational scoring policy Angel has adopted, not a confirmed CSSE marking rule. If a marking scheme is found that states this explicitly, this classification should be revisited citing that exact source.",
    },
  ],
};

/**
 * CSSE Completion Programme, Phase B — Founder Educational Review
 * readiness (ANGEL_CSSE_COMPLETION_PROGRAMME_V1.md Phase B; the review
 * pack is ANGEL_PHASE_B_MATHEMATICS_TEACHING_COMPLETION_V1.md Part 10;
 * the underlying content is Decision 62 / Educational Increment 007M).
 *
 * This is a SEPARATE review type from the REVIEW_CRITERIA/FAMILY_
 * EDUCATIONAL_CONTEXT machinery above. The 18-criterion content review
 * above judges a question family's own wording/answer/CSSE-fit; this
 * judges the MODEL/Guided-practice/Remediation TEACHING layer Educational
 * Increment 007M added on top of already-existing families (12 of the 22
 * target families here already have an unrelated content_review row from
 * Controlled Review Batches 2-4, predating this teaching content — that
 * earlier approval must never be read as approval of teaching material
 * that did not exist when it was recorded, which is exactly why this is
 * `review_type = 'maths_teaching_review'`, a distinct value on the same
 * ali_family_review table, migration 059).
 */

/**
 * The exact 22 Mathematics families Educational Increment 007M added
 * MODEL/Guided/Remediation teaching content for (Decision 62;
 * ANGEL_PHASE_B_MATHEMATICS_TEACHING_COMPLETION_V1.md Part 3) — reconciled
 * fresh against lib/learningEngine/mathsTeachingContent.ts's own 26 keys,
 * minus the 4 pre-existing 007L proof families (mr01-missing-operand,
 * mr04-best-value, mr03-angle-ratio, mr01-measurement-conversion —
 * already-reviewed TEACHING content, not new in this phase, and already
 * covered by the pilot/earlier content-review batches) and minus
 * mr05-number-property-search (deliberately excluded from Phase B itself
 * as TRANSFER-UNSAFE — it has no teaching content to review). Exported
 * from here, not defined inline in app/admin-beta/review/page.tsx, so it
 * is the single source of truth both the UI and
 * tests/lib/adminReview.test.ts can check against
 * MATHS_TEACHING_REVIEW_METADATA and tests/lib/learningEngine/
 * mathsTeachingContent.test.ts's own independently-derived PHASE_B_FAMILIES
 * list, with no risk of the two silently drifting apart.
 */
export const MATHS_TEACHING_REVIEW_TARGET_IDS = [
  "mr01-average-mean",
  "mr01-data-table",
  "mr02-compare",
  "mr02-far-ratio-context",
  "mr02-nth-term",
  "mr02-sequence-rule",
  "mr02-substitution",
  "mr02-sum-difference",
  "mr03-angle-sum",
  "mr03-classify",
  "mr03-coordinate",
  "mr03-mixed-perimeter",
  "mr04-compound-percentage",
  "mr04-elapsed-time",
  "mr04-far-percent",
  "mr04-far-recipe",
  "mr04-mixed-divisibility",
  "mr05-constrained-multiple",
  "mr05-factors-primes",
  "mr05-number-property",
  "precision-dec",
  "precision-frac",
];

/** Static identifier for which version of lib/learningEngine/mathsTeachingContent.ts a Mathematics Teaching Review judged — the teaching content is a static code file, not a versioned database row, so a named Educational Increment + commit hash is the closest honest equivalent to a reviewed content_version. Update this only when the teaching content itself changes. */
export const MATHS_TEACHING_CONTENT_VERSION = "Educational Increment 007M (CSSE Completion Programme Phase B), commit e3f1c09";

export interface MathsTeachingReviewCriterion {
  key: keyof MathsTeachingReviewSubmission;
  question: string;
  polarity: "yes-is-good";
}

/**
 * The 12 educational-judgement questions from the Founder's own directive
 * Part 3 ("questions such as"), each rephrased where needed to keep the
 * project's established Yes-is-good convention (lib/adminReview.ts's own
 * `hasNegativeFraming` guard, tested against these below) — the directive
 * itself asks for this: "Keep polarity consistent so that YES means
 * educationally satisfactory wherever practical."
 */
export const MATHS_TEACHING_REVIEW_CRITERIA: MathsTeachingReviewCriterion[] = [
  { key: "mathematicallyCorrect", question: "Is the mathematical teaching correct?", polarity: "yes-is-good" },
  { key: "modelUnderstandable", question: "Would an 11+ child understand the MODEL?", polarity: "yes-is-good" },
  { key: "modelTeachesMethod", question: "Does the MODEL teach the method, not just give an answer?", polarity: "yes-is-good" },
  { key: "guidedPracticeBalanced", question: "Does Guided Practice give enough help while still leaving genuine thinking to the learner?", polarity: "yes-is-good" },
  { key: "supportReducedAppropriately", question: "Is support reduced appropriately moving from Guided to Independent practice?", polarity: "yes-is-good" },
  { key: "remediationUseful", question: "Is the remediation useful after a wrong answer?", polarity: "yes-is-good" },
  { key: "languageAgeAppropriate", question: "Is the language age-appropriate for an 11+ candidate?", polarity: "yes-is-good" },
  { key: "teachingRelevantToSkill", question: "Is the teaching relevant to the skill being tested?", polarity: "yes-is-good" },
  { key: "exampleAvoidsAnswerLeakage", question: "Does the MODEL example avoid leaking the live question's answer?", polarity: "yes-is-good" },
  { key: "conceptualExplanationSufficient", question: "Is there enough conceptual explanation, not just mechanical instruction?", polarity: "yes-is-good" },
  { key: "independentExpectationAppropriate", question: "Is the independent-practice expectation appropriate?", polarity: "yes-is-good" },
  { key: "clearAndUnambiguous", question: "Is everything clear, unambiguous, and appropriately simple for this age group?", polarity: "yes-is-good" },
];

export interface MathsTeachingReviewSubmission {
  targetId: string;
  reviewer: string;
  qualificationBasis: string;
  decision: ReviewDecision | null;
  notes: string;
  mathematicallyCorrect: boolean | null;
  modelUnderstandable: boolean | null;
  modelTeachesMethod: boolean | null;
  guidedPracticeBalanced: boolean | null;
  supportReducedAppropriately: boolean | null;
  remediationUseful: boolean | null;
  languageAgeAppropriate: boolean | null;
  teachingRelevantToSkill: boolean | null;
  exampleAvoidsAnswerLeakage: boolean | null;
  conceptualExplanationSufficient: boolean | null;
  independentExpectationAppropriate: boolean | null;
  clearAndUnambiguous: boolean | null;
}

/**
 * Per-family metadata for the review pack, sourced verbatim from
 * ANGEL_PHASE_B_MATHEMATICS_TEACHING_COMPLETION_V1.md Part 1A (Question
 * Type / competency) and Part 3 (transfer classification and its
 * supporting note — the exact reasoning recorded when the family was
 * designed, not re-derived or paraphrased here).
 */
export interface MathsTeachingReviewMetadata {
  competency: string;
  questionType: string;
  transferClassification: "TRANSFER-SUFFICIENT" | "TRANSFER-LIMITED";
  transferNote: string;
  knownLimitation?: string;
}

export const MATHS_TEACHING_REVIEW_METADATA: Record<string, MathsTeachingReviewMetadata> = {
  "mr01-average-mean": { competency: "MR-01 Arithmetic", questionType: "QT-MR-12 Average (Mean)", transferClassification: "TRANSFER-SUFFICIENT", transferNote: "4 genuinely distinct contexts." },
  "mr01-data-table": { competency: "MR-01 Arithmetic", questionType: "QT-MR-09 Data Reading", transferClassification: "TRANSFER-LIMITED", transferNote: "Only 3 distinct underlying datasets across 5 questions.", knownLimitation: "This family's own final workingSteps entry is a generic \"Compute the answer\" restatement, not real working. Guided reveal is capped so that step can never be shown before submission (see the Maximum Guided reveal boundary below)." },
  "mr02-compare": { competency: "MR-02 Algebraic/Symbolic", questionType: "QT-MR-06 Algebraic Symbol/Unknown", transferClassification: "TRANSFER-LIMITED", transferNote: "3 siblings." },
  "mr02-far-ratio-context": { competency: "MR-02 Algebraic/Symbolic", questionType: "QT-MR-06 Algebraic Symbol/Unknown", transferClassification: "TRANSFER-LIMITED", transferNote: "3 siblings." },
  "mr02-nth-term": { competency: "MR-02 Algebraic/Symbolic", questionType: "QT-MR-05 Sequence/Function-Rule", transferClassification: "TRANSFER-SUFFICIENT", transferNote: "5 siblings, varied start/difference/position, includes a negative-difference case." },
  "mr02-sequence-rule": { competency: "MR-02 Algebraic/Symbolic", questionType: "QT-MR-05 Sequence/Function-Rule", transferClassification: "TRANSFER-SUFFICIENT", transferNote: "10 siblings (5 rule-pairs), genuinely distinct rules." },
  "mr02-substitution": { competency: "MR-02 Algebraic/Symbolic", questionType: "QT-MR-06 Algebraic Symbol/Unknown", transferClassification: "TRANSFER-SUFFICIENT", transferNote: "5 siblings, every coefficient pair differs (borderline sufficient).", knownLimitation: "This family's compound answer format (e.g. \"A=6, C=3\") relies on brittle exact-text matching. A reordered but equivalent submission would currently fail. Pre-existing, flagged, not fixed by this phase (out of teaching-content scope)." },
  "mr02-sum-difference": { competency: "MR-02 Algebraic/Symbolic", questionType: "QT-MR-06 Algebraic Symbol/Unknown", transferClassification: "TRANSFER-LIMITED", transferNote: "Despite 5 siblings, every question uses an identical sentence template." },
  "mr03-angle-sum": { competency: "MR-03 Geometric/Spatial", questionType: "QT-MR-07 Geometric Angle/Shape", transferClassification: "TRANSFER-SUFFICIENT", transferNote: "7 siblings across triangle and quadrilateral sub-cases." },
  "mr03-classify": { competency: "MR-03 Geometric/Spatial", questionType: "QT-MR-07 Geometric Angle/Shape", transferClassification: "TRANSFER-LIMITED", transferNote: "Only 3 siblings, one per answer category: a real memorisation risk." },
  "mr03-coordinate": { competency: "MR-03 Geometric/Spatial", questionType: "QT-MR-08 Coordinate/Transformation", transferClassification: "TRANSFER-LIMITED", transferNote: "Thinnest of the geometry families: 3 siblings, 3 different sub-skills, no repetition of any one transformation type.", knownLimitation: "This family's parenthesised-pair answer format (e.g. \"(3, -5)\") relies on brittle exact-text matching. An unparenthesised but equivalent submission would currently fail. Pre-existing, flagged, not fixed by this phase (out of teaching-content scope)." },
  "mr03-mixed-perimeter": { competency: "MR-03 Geometric/Spatial", questionType: "QT-MR-07 Geometric Angle/Shape", transferClassification: "TRANSFER-LIMITED", transferNote: "Closest to a disguised clone set of the 22: the same word-problem template repeated 3 times, numbers only." },
  "mr04-compound-percentage": { competency: "MR-04 Multi-Step Word Problems", questionType: "QT-MR-04 Percentage/Proportional", transferClassification: "TRANSFER-SUFFICIENT", transferNote: "5 genuinely different price/percentage-pair combinations." },
  "mr04-elapsed-time": { competency: "MR-04 Multi-Step Word Problems", questionType: "QT-MR-10 Elapsed-Time", transferClassification: "TRANSFER-SUFFICIENT", transferNote: "Real numeric variation, but every question shares an identical 3-stage template (sufficient with a disclosed caveat)." },
  "mr04-far-percent": { competency: "MR-04 Multi-Step Word Problems", questionType: "QT-MR-04 Percentage/Proportional", transferClassification: "TRANSFER-LIMITED", transferNote: "3 siblings, distinct fractions." },
  "mr04-far-recipe": { competency: "MR-04 Multi-Step Word Problems", questionType: "QT-MR-04 Percentage/Proportional", transferClassification: "TRANSFER-LIMITED", transferNote: "3 siblings." },
  "mr04-mixed-divisibility": { competency: "MR-04 Multi-Step Word Problems", questionType: "QT-MR-13 Best-Value/Combinatorial", transferClassification: "TRANSFER-LIMITED", transferNote: "3 siblings, genuinely different divisor/remainder pairs." },
  "mr05-constrained-multiple": { competency: "MR-05 Number Properties", questionType: "QT-MR-11 Number-Property", transferClassification: "TRANSFER-LIMITED", transferNote: "3 siblings." },
  "mr05-factors-primes": { competency: "MR-05 Number Properties", questionType: "QT-MR-11 Number-Property", transferClassification: "TRANSFER-LIMITED", transferNote: "Nominally 5 siblings but only 2-3 per actual sub-skill (factor-count vs. primality). Flagged for a possible future family split." },
  "mr05-number-property": { competency: "MR-05 Number Properties", questionType: "QT-MR-11 Number-Property", transferClassification: "TRANSFER-SUFFICIENT", transferNote: "5 siblings, genuine conceptual variety (borderline sufficient).", knownLimitation: "This family's live rows have no stored workingSteps at all. Guided step reveal is architecturally absent for this family (not a design choice), confirmed by direct code-path check, not just by design intent." },
  "precision-dec": { competency: "MR-06 Precision Under Exact-Match", questionType: "QT-MR-14 Precision (cross-cutting)", transferClassification: "TRANSFER-LIMITED", transferNote: "All 3 siblings round up; no round-down example exists yet." },
  "precision-frac": { competency: "MR-06 Precision Under Exact-Match", questionType: "QT-MR-14 Precision (cross-cutting)", transferClassification: "TRANSFER-LIMITED", transferNote: "All 3 siblings are structurally identical." },
};

/** Every family_id that already has at least one real Mathematics Teaching Review decision recorded (review_type = 'maths_teaching_review'), so the UI can show "X of 22 reviewed" honestly from persisted evidence, not a hardcoded count. Deliberately does NOT reuse fetchReviewedTargetIds() above — that function is scoped to content_review rows (implicitly, since it never filters review_type) and conflating the two would let an old content-review approval masquerade as a teaching-review one. */
export async function fetchMathsTeachingReviewedFamilyIds(): Promise<Set<string>> {
  const supabase = getSupabaseClient();
  if (!supabase) return new Set();
  const { data, error } = await supabase
    .from("ali_family_review")
    .select("family_id")
    .eq("review_type", "maths_teaching_review");
  if (error || !data) return new Set();
  return new Set(data.map((r) => r.family_id));
}

/** Same validation discipline as validateReviewSubmission (reviewer required, qualification basis required and never pre-filled, decision never defaults, rejection requires notes) — kept as a separate function rather than a generic one because the two submission shapes' fields genuinely differ (12 teaching criteria vs. 18 content criteria), not because the rules differ. */
export function validateMathsTeachingReviewSubmission(s: MathsTeachingReviewSubmission): string | null {
  if (!s.reviewer.trim()) return "Reviewer name is required, a review cannot be recorded anonymously.";
  if (!s.qualificationBasis.trim()) return "Reviewer qualification basis is required (e.g. teaching experience, subject knowledge, 11+ preparation experience).";
  if (!s.decision) return "Choose a decision: this is never chosen for you.";
  if (s.decision === "rejected" && !s.notes.trim()) {
    return "A rejected decision requires notes explaining why (enforced by the database itself, but checked here for a clearer message).";
  }
  return null;
}

/** Inserts one real, traceable Mathematics Teaching Review decision — review_type = 'maths_teaching_review', a value migration 059 added specifically so this can never be conflated with, or overwrite, an earlier content_review row for the same family. Append-only, exactly like submitReview above; never touches ali_question_bank.eligibility_status. */
export async function submitMathsTeachingReview(s: MathsTeachingReviewSubmission): Promise<SubmitReviewResult> {
  const validationError = validateMathsTeachingReviewSubmission(s);
  if (validationError) return { error: validationError };
  if (!s.decision) return { error: "Choose a decision: this is never chosen for you." };
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "Not connected" };
  const { error } = await supabase.from("ali_family_review").insert({
    review_target_type: "question_family",
    review_type: "maths_teaching_review",
    family_id: s.targetId,
    reviewer: s.reviewer.trim(),
    decision: s.decision,
    notes: buildNotesWithQualification(s),
    teaching_content_version: MATHS_TEACHING_CONTENT_VERSION,
    teaching_mathematically_correct: s.mathematicallyCorrect,
    teaching_model_understandable: s.modelUnderstandable,
    teaching_model_teaches_method: s.modelTeachesMethod,
    teaching_guided_practice_balanced: s.guidedPracticeBalanced,
    teaching_support_reduced_appropriately: s.supportReducedAppropriately,
    teaching_remediation_useful: s.remediationUseful,
    teaching_language_age_appropriate: s.languageAgeAppropriate,
    teaching_relevant_to_skill: s.teachingRelevantToSkill,
    teaching_example_avoids_answer_leakage: s.exampleAvoidsAnswerLeakage,
    teaching_conceptual_explanation_sufficient: s.conceptualExplanationSufficient,
    teaching_independent_expectation_appropriate: s.independentExpectationAppropriate,
    teaching_clear_and_unambiguous: s.clearAndUnambiguous,
  });
  return { error: error ? error.message : null };
}

/**
 * CSSE Completion Programme, Phase C, Part 13 — Founder Educational Review
 * readiness for English (ANGEL_CSSE_COMPLETION_PROGRAMME_V1.md Phase C).
 * Judges the English teaching layer — most materially, Educational
 * Increment 007O's addresses_misconception rendering, live in
 * ReadingActivity for the first time — as a distinct evidence trail from
 * any earlier content_review of the same family (migration 060's own
 * design intent). Unlike Mathematics Teaching Review, this reuses the
 * existing REVIEW_CRITERIA/ReviewSubmission shape unchanged (see migration
 * 060's own comment: the 18 columns were already designed broad enough for
 * English's teaching-quality needs), so no new criteria type is defined
 * here — only a distinct target list, evidence-fetch scope, content
 * version, and submit function that force review_type =
 * 'english_teaching_review' instead of relying on the table's
 * 'content_review' default.
 */

/** Static identifier for which version of the ReadingActivity remediation-rendering behaviour (app/learning-intelligence/practice/[area]/page.tsx) an English Teaching Review judged. Update this only when that learner-facing behaviour itself changes again. */
export const ENGLISH_TEACHING_CONTENT_VERSION = "Educational Increment 007O (CSSE Completion Programme Phase C), commit 7b69638";

/**
 * The 8 named English families that are genuinely learner-reachable
 * (Practice Eligible > 0) and were therefore materially affected by
 * Educational Increment 007O's remediation-rendering change — every one
 * of them had 100%-populated addresses_misconception text that was never
 * rendered before this phase. `wave1-fam-tick-justify` (11 authored rows,
 * 0 Practice Eligible, still provisional/blocked) is deliberately excluded:
 * per this phase's own Part 2 instruction, "a capability counts only if
 * the learner can actually receive it through the real Practice pathway,"
 * and no learner can reach this family today.
 */
export const ENGLISH_TEACHING_REVIEW_TARGET_IDS = [
  "wave1-fam-direct-retrieval",
  "wave1-fam-synonym-battery",
  "wave1-fam-vocab-explain",
  "wave1-fam-quote-explain",
  "wave1-fam-sequencing",
  "wave1-fam-two-character",
  "wave1-fam-emotion-cause",
  "wave2-fam-multiselect",
];

export interface EnglishTeachingReviewMetadata {
  questionType: string;
  competency: string;
  modelStatus: "MODEL present" | "No MODEL authored yet";
  guidedClassification: "REAL" | "INSTRUCTIONAL ONLY";
  remediationBeforePhaseC: string;
  transferNote: string;
  knownGap?: string;
}

/**
 * Sourced directly from this phase's own live code trace and live
 * production data query (Part 2/5/6/7/8 of the governing directive), not
 * carried forward from any prior document's own self-assessment.
 */
export const ENGLISH_TEACHING_REVIEW_METADATA: Record<string, EnglishTeachingReviewMetadata> = {
  "wave1-fam-direct-retrieval": {
    questionType: "QT-RC-01 Literal Short-Answer", competency: "RC-01 Literal Retrieval",
    modelStatus: "No MODEL authored yet", guidedClassification: "INSTRUCTIONAL ONLY",
    remediationBeforePhaseC: "NONE. This family had zero wrong-answer remediation of any kind before this phase (no automatic classification applies to its tier, no self-reflection checklist exists for it). The largest named English family (14 Practice Eligible), with the most severe gap.",
    transferNote: "14 siblings across 14 distinct passages (good raw diversity), but 13 of those 14 passages are also drawn on by several other families' own questions.",
    knownGap: "No MODEL/worked example exists for this family (4 of 9 named families share this gap: direct-retrieval, synonym-battery, tick-justify, emotion-cause).",
  },
  "wave1-fam-synonym-battery": {
    questionType: "QT-RC-04 Synonym Substitution", competency: "RC-03 Word/Phrase Meaning",
    modelStatus: "No MODEL authored yet", guidedClassification: "INSTRUCTIONAL ONLY",
    remediationBeforePhaseC: "Automatic VOCABULARY_CONTEXT_ERROR classification only (fires when the scoring tier's own structure shows zero marks earned): real but generic, not the specific per-question text this phase now adds alongside it.",
    transferNote: "11 siblings across 11 distinct passages (good raw diversity); most of those 11 passages are also drawn on by several other families.",
    knownGap: "No MODEL/worked example exists for this family.",
  },
  "wave1-fam-vocab-explain": {
    questionType: "QT-RC-03/RC-05 Word/Phrase Meaning, Quotation-and-Explanation", competency: "RC-02/RC-03 (shared)",
    modelStatus: "MODEL present", guidedClassification: "INSTRUCTIONAL ONLY",
    remediationBeforePhaseC: "Automatic VOCABULARY_CONTEXT_ERROR classification only, same basis as synonym-battery.",
    transferNote: "17 siblings (the largest named family) across 15 distinct passages; most of those passages are also drawn on by several other families.",
  },
  "wave1-fam-quote-explain": {
    questionType: "QT-RC-05 Quotation-and-Explanation", competency: "RC-02 Inference & Justified Interpretation",
    modelStatus: "MODEL present", guidedClassification: "REAL",
    remediationBeforePhaseC: "Self-reflection checklist (WEAK_QUOTATION, EXPLANATION_MISMATCH), shown once the learner self-assesses their own self-assessed-tier answer as \"Not quite\".",
    transferNote: "13 siblings across 12 distinct passages; most of those passages are also drawn on by several other families.",
  },
  "wave1-fam-sequencing": {
    questionType: "QT-RC-06 Sequential Ordering", competency: "RC-04 Sequential Ordering",
    modelStatus: "MODEL present", guidedClassification: "REAL",
    remediationBeforePhaseC: "Automatic EVIDENCE_NOT_LOCATED/SEQUENCE_ERROR classification, derived directly from the scorer's own position-by-position comparison. The sequence-anchor Guided scaffold (Educational Increment 007G's own corrected scoring reconciliation) was independently re-tested live this phase and confirmed working.",
    transferNote: "15 siblings across 13 distinct passages; most of those passages are also drawn on by several other families.",
  },
  "wave1-fam-two-character": {
    questionType: "QT-RC-07 Multi-Entity Comparative", competency: "RC-01 Literal Retrieval",
    modelStatus: "MODEL present", guidedClassification: "INSTRUCTIONAL ONLY",
    remediationBeforePhaseC: "Self-reflection checklist (CHARACTER_COMPARISON_WITHOUT_EVIDENCE, WEAK_QUOTATION), independently re-tested live this phase and confirmed working correctly, including the addresses_misconception addition, only after the learner self-assesses \"Not quite\".",
    transferNote: "Thinnest family in this review set: only 6 siblings across 5 distinct passages.",
    knownGap: "Previously disclosed depth gap (only 6 siblings), deferred to Phase E, not addressed by this phase.",
  },
  "wave1-fam-emotion-cause": {
    questionType: "QT-RC-08 List-N-Items (feeling + cause)", competency: "RC-01/RC-02 (shared)",
    modelStatus: "No MODEL authored yet", guidedClassification: "INSTRUCTIONAL ONLY",
    remediationBeforePhaseC: "Self-reflection checklist (EVIDENCE_NOT_LOCATED, UNSUPPORTED_INFERENCE). Its Guided scaffold was corrected in Educational Increment 007H (routed away from a misapplied staged-quotation check to an honest instructional fallback), re-confirmed still correct this phase.",
    transferNote: "11 siblings across 11 distinct passages; most of those passages are also drawn on by several other families.",
    knownGap: "No MODEL/worked example exists for this family.",
  },
  "wave2-fam-multiselect": {
    questionType: "QT-RC-09 Multi-Select Tick-Box", competency: "RC-01 Literal Retrieval",
    modelStatus: "MODEL present", guidedClassification: "REAL",
    remediationBeforePhaseC: "Dedicated, specifically-worded over-/under-selection message (the only family with its own hand-written remediation copy, directly evidenced by a real CSSE cover-page marking instruction), independently re-tested live this phase and confirmed working correctly, including the addresses_misconception addition.",
    transferNote: "Thinnest family in this review set alongside two-character: only 6 siblings across 6 distinct passages.",
    knownGap: "Previously disclosed depth gap (only 6 siblings), deferred to Phase E, not addressed by this phase.",
  },
};

/** Every family_id that already has at least one real English Teaching Review decision recorded (review_type = 'english_teaching_review'). Deliberately separate from fetchReviewedTargetIds() above for the same reason fetchMathsTeachingReviewedFamilyIds() is: conflating review types would let an old content-review approval masquerade as covering the Phase C remediation-rendering change. */
export async function fetchEnglishTeachingReviewedFamilyIds(): Promise<Set<string>> {
  const supabase = getSupabaseClient();
  if (!supabase) return new Set();
  const { data, error } = await supabase
    .from("ali_family_review")
    .select("family_id")
    .eq("review_type", "english_teaching_review");
  if (error || !data) return new Set();
  return new Set(data.map((r) => r.family_id));
}

/** Inserts one real, traceable English Teaching Review decision — review_type = 'english_teaching_review' (migration 060), reusing the exact same ReviewSubmission shape/validation/notes convention as submitReview() above (English's 18 criteria already cover this review's needs), but forcing the distinct review_type and populating teaching_content_version, which submitReview() never sets (its rows keep the table's 'content_review' default). Append-only; never touches ali_question_bank.eligibility_status. */
export async function submitEnglishTeachingReview(s: ReviewSubmission): Promise<SubmitReviewResult> {
  const validationError = validateReviewSubmission(s);
  if (validationError) return { error: validationError };
  if (!s.decision) return { error: "Choose a decision: this is never chosen for you." };
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "Not connected" };
  const { error } = await supabase.from("ali_family_review").insert({
    review_target_type: "question_family",
    review_type: "english_teaching_review",
    family_id: s.targetId,
    reviewer: s.reviewer.trim(),
    decision: s.decision,
    notes: buildNotesWithQualification(s),
    evidence_reference: s.evidenceReference.trim() || null,
    provenance_reference: s.provenanceReference.trim() || null,
    teaching_content_version: ENGLISH_TEACHING_CONTENT_VERSION,
    educational_validity: s.educationalValidity,
    competency_validity: s.competencyValidity,
    wording_quality: s.wordingQuality,
    age_appropriate: s.ageAppropriate,
    ambiguity_free: s.ambiguityFree,
    difficulty_appropriate: s.difficultyAppropriate,
    misconception_quality: s.misconceptionQuality,
    explanation_quality: s.explanationQuality,
    variation_boundaries_sound: s.variationBoundariesSound,
    authenticity_confirmed: s.authenticityConfirmed,
    question_type_alignment: s.questionTypeAlignment,
    answer_correctness_verified: s.answerCorrectnessVerified,
    transfer_validity: s.transferValidity,
    teaching_quality: s.teachingQuality,
    exam_strategy_quality: s.examStrategyQuality,
    validation_behaviour_sound: s.validationBehaviourSound,
    originality_confirmed: s.originalityConfirmed,
    copyright_risk_clear: s.copyrightRiskClear,
  });
  return { error: error ? error.message : null };
}

/**
 * CSSE Completion Programme, Phase D, Part 12 — Founder Educational
 * Review readiness for Continuous Writing
 * (ANGEL_PHASE_D_CONTINUOUS_WRITING_STANDARD_V1.md). Judges the one
 * bounded-proof task family this phase built (MODEL, planning scaffold,
 * the CSSE-evidenced 5-dimension rubric, the confidence-gate design) as
 * a distinct evidence trail, `review_type = 'writing_teaching_review'`
 * (migration 061) — exactly the same pattern already established for
 * Mathematics (Decision 62-63) and English (Decision 64-65). Reuses the
 * existing 18-criterion REVIEW_CRITERIA/ReviewSubmission shape
 * unchanged, same reasoning as English Teaching Review.
 */

export const WRITING_TEACHING_CONTENT_VERSION = "Educational Increment 007Q (CSSE Completion Programme Phase D)";

/** Exactly the one task family this phase built (Part 7 of the design document) — picture-narrative is deferred pending an image asset, and is deliberately not a review target here since no content exists for it to review. */
export const WRITING_TEACHING_REVIEW_TARGET_IDS = ["writing-reflective-discursive"];

export async function fetchWritingTeachingReviewedFamilyIds(): Promise<Set<string>> {
  const supabase = getSupabaseClient();
  if (!supabase) return new Set();
  const { data, error } = await supabase
    .from("ali_family_review")
    .select("family_id")
    .eq("review_type", "writing_teaching_review");
  if (error || !data) return new Set();
  return new Set(data.map((r) => r.family_id));
}

/** Inserts one real, traceable Continuous Writing Teaching Review decision — review_type = 'writing_teaching_review' (migration 061). Append-only; never touches ali_question_bank.eligibility_status. */
export async function submitWritingTeachingReview(s: ReviewSubmission): Promise<SubmitReviewResult> {
  const validationError = validateReviewSubmission(s);
  if (validationError) return { error: validationError };
  if (!s.decision) return { error: "Choose a decision: this is never chosen for you." };
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "Not connected" };
  const { error } = await supabase.from("ali_family_review").insert({
    review_target_type: "question_family",
    review_type: "writing_teaching_review",
    family_id: s.targetId,
    reviewer: s.reviewer.trim(),
    decision: s.decision,
    notes: buildNotesWithQualification(s),
    evidence_reference: s.evidenceReference.trim() || null,
    provenance_reference: s.provenanceReference.trim() || null,
    teaching_content_version: WRITING_TEACHING_CONTENT_VERSION,
    educational_validity: s.educationalValidity,
    competency_validity: s.competencyValidity,
    wording_quality: s.wordingQuality,
    age_appropriate: s.ageAppropriate,
    ambiguity_free: s.ambiguityFree,
    difficulty_appropriate: s.difficultyAppropriate,
    misconception_quality: s.misconceptionQuality,
    explanation_quality: s.explanationQuality,
    variation_boundaries_sound: s.variationBoundariesSound,
    authenticity_confirmed: s.authenticityConfirmed,
    question_type_alignment: s.questionTypeAlignment,
    answer_correctness_verified: s.answerCorrectnessVerified,
    transfer_validity: s.transferValidity,
    teaching_quality: s.teachingQuality,
    exam_strategy_quality: s.examStrategyQuality,
    validation_behaviour_sound: s.validationBehaviourSound,
    originality_confirmed: s.originalityConfirmed,
    copyright_risk_clear: s.copyrightRiskClear,
  });
  return { error: error ? error.message : null };
}

export interface PendingReviewTarget {
  id: string; // the family_id column's value — either a real family id or a passage id
  reviewTargetType: ReviewTargetType;
  notes: string | null;
}

export interface RepresentativeQuestion {
  id: string;
  subject: string;
  skill: string;
  question: string;
  modelAnswer: string;
  familyId: string | null;
  learningUnitId: string | null;
  contentDifficulty: string;
  transferClass: string | null;
  addressesMisconception: string | null;
  contentVersion: number;
  active: boolean;
  provenance: string | null;
  eligibilityStatus: string;
  /** Mathematics-only, from the same prompt jsonb the Practice pathway itself reads (app/learning-intelligence/practice/[area]/page.tsx). null for English rows, or a Maths row with no stored steps (e.g. every mr05-number-property row — genuinely absent, not a fetch failure). Added for the CSSE Completion Programme Phase B Mathematics Teaching Review, so it can show a family's real Guided Practice sequence without a second, separately-fetched copy. */
  workingSteps: string[] | null;
}

/** prompt is stored as jsonb (typed `unknown` at the client) — narrows just enough to read the display fields safely, without claiming to know its full shape. */
function promptText(prompt: unknown, key: "question" | "modelAnswer"): string {
  if (prompt && typeof prompt === "object" && key in prompt) {
    const value = (prompt as Record<string, unknown>)[key];
    if (typeof value === "string") return value;
  }
  return key === "question" ? "(no question text found)" : "(no model answer found)";
}

function promptWorkingSteps(prompt: unknown): string[] | null {
  if (prompt && typeof prompt === "object" && "workingSteps" in prompt) {
    const value = (prompt as Record<string, unknown>).workingSteps;
    if (Array.isArray(value) && value.every((s) => typeof s === "string")) return value as string[];
  }
  return null;
}

export interface PassageDetail {
  id: string;
  title: string;
  originalText: string;
  genre: string;
  wordCount: number;
  readingComplexity: string;
  provenance: string;
  copyrightStatus: string;
  contentDifficulty: string;
  contentVersion: number;
  active: boolean;
  eligibilityStatus: string;
}

export interface ReviewSubmission {
  reviewTargetType: ReviewTargetType;
  targetId: string;
  reviewer: string;
  /** Educational Increment 007F, Part 2 — no dedicated column exists for this (Operating Model §2's deliberate choice not to build a separate credentialing system), so it is recorded as the first line of `notes`, never silently dropped. */
  qualificationBasis: string;
  /** Educational Increment 007F correction — never defaults to "approved"; null means the reviewer has not yet chosen. */
  decision: ReviewDecision | null;
  notes: string;
  evidenceReference: string;
  provenanceReference: string;
  // Original 10 criteria (migration 034)
  educationalValidity: boolean | null;
  competencyValidity: boolean | null;
  wordingQuality: boolean | null;
  ageAppropriate: boolean | null;
  ambiguityFree: boolean | null;
  difficultyAppropriate: boolean | null;
  misconceptionQuality: boolean | null;
  explanationQuality: boolean | null;
  variationBoundariesSound: boolean | null;
  authenticityConfirmed: boolean | null;
  // Extension criteria (migration 047)
  questionTypeAlignment: boolean | null;
  answerCorrectnessVerified: boolean | null;
  transferValidity: boolean | null;
  teachingQuality: boolean | null;
  examStrategyQuality: boolean | null;
  validationBehaviourSound: boolean | null;
  originalityConfirmed: boolean | null;
  copyrightRiskClear: boolean | null;
}

/** Every target currently awaiting review, per review_target_type. Empty array (not an error) if the calling session is not an admin — the RLS policy simply returns no rows. */
export async function fetchPendingReviewTargets(): Promise<PendingReviewTarget[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("ali_family_review")
    .select("family_id, review_target_type, notes")
    .eq("decision", "pending_independent_review")
    .order("review_target_type", { ascending: true });
  if (error || !data) return [];
  return data.map((r) => ({ id: r.family_id, reviewTargetType: r.review_target_type, notes: r.notes }));
}

/**
 * Educational Increment 007F, Part 1 — every family_id/passage id that has
 * at least one REAL decision recorded (anything other than the
 * placeholder pending row), so the UI can show "X of 7 reviewed" and
 * per-card status honestly. A target can have both a pending row
 * (history, never deleted) and a real decision row; this only counts the
 * latter.
 *
 * Educational Increment 007T, Migration 064 Review-Surface Reconciliation
 * Part 6 correction — explicitly scoped to `review_type = 'content_review'`
 * (the only review_type this function's every caller, and every
 * pending-placeholder row `fetchPendingReviewTargets()` can return, is
 * ever created against — submitReview()/the pilot/batch/007T
 * placeholder-seeding migrations never set review_type, so it always
 * takes the column's own 'content_review' default). Without this scope,
 * a family_id that happens to ALSO carry an approved
 * maths_teaching_review/english_teaching_review/writing_teaching_review
 * decision (Decisions 63/65/67) — a genuinely different review purpose,
 * submitted through entirely separate functions — would be wrongly
 * treated as "reviewed" here even if its own, separate content_review is
 * still genuinely outstanding. This is the exact "a [teaching] approval
 * must not accidentally satisfy a [content] review" failure this scope
 * closes, in either direction.
 */
export async function fetchReviewedTargetIds(): Promise<Set<string>> {
  const supabase = getSupabaseClient();
  if (!supabase) return new Set();
  const { data, error } = await supabase
    .from("ali_family_review")
    .select("family_id")
    .eq("review_type", "content_review")
    .neq("decision", "pending_independent_review");
  if (error || !data) return new Set();
  return new Set(data.map((r) => r.family_id));
}

/**
 * Educational Increment 007X, Founder Review-Surface Correction — the
 * stable, notes-text batch marker every 007X-related ali_family_review
 * row carries (both the original values()-table draft's prose, "Educational
 * Increment 007X, Part...", and the applied minimal form's "007X new
 * content review: ..." — see migration 067 and Decision 79 — contain this
 * exact substring). A family-level "Reviewed" boolean (fetchReviewedTargetIds
 * above) cannot distinguish "this family's ORIGINAL siblings were approved"
 * from "this family has newly authored siblings still awaiting review" —
 * both produce the same family_id with an approved content_review row. This
 * marker is the smallest safe extension of the existing schema (no new
 * column, no new review_type, no new table) that makes that distinction
 * queryable: a decision only counts as "007X reviewed" if its notes
 * mention this marker, so a historical Batch 2-4 / Phase B approval (which
 * predates 007X and never mentions it) can never satisfy it.
 */
export const SEVEN_X_BATCH_MARKER = "007X";

export interface SevenXReviewStatus {
  reviewed: boolean;
  decision: ReviewDecision | null;
  reviewer: string | null;
}

export interface SevenXReviewRow {
  family_id: string;
  review_type: string;
  decision: string;
  notes: string | null;
  reviewer: string;
}

/**
 * Pure core of fetchSevenXReviewStatus, directly unit-testable
 * (tests/lib/adminReview.sevenX.test.ts) against constructed rows
 * mirroring the exact shape of real historical + new evidence (a family
 * with a historical pending content review, a historical APPROVED content
 * review, an approved maths_teaching_review, and a new 007X pending
 * placeholder — sometimes duplicated — all coexisting, per Decision 79's
 * authenticated evidence). `rows` is assumed already filtered to
 * `review_type = 'content_review'` (the caller's own Supabase query does
 * this); this function's own extra `review_type` check is a second,
 * defensive guard in case a caller ever forgets to filter server-side.
 */
/**
 * Marker-parameterised so every batch that scopes review to a specific
 * subset of new siblings within an existing family (007X, and now Stage 3
 * Increment 004's MR-04 depth batch) reuses one proven implementation
 * rather than a copy each time — same reasoning as the marker-scoping
 * mechanism itself (SEVEN_X_BATCH_MARKER's own docstring above).
 * `deriveSevenXReviewStatus` below is an unchanged, exported thin wrapper
 * so every existing call site and test keeps working exactly as before.
 */
/**
 * `reviewType` defaults to `"content_review"` so every existing caller
 * (SEVEN_X/MR04_DEPTH/INC006_DEPTH, all genuinely content_review batches)
 * is completely unaffected. Mock Programme Increment 004's own batches
 * pass `"mock_maths_independent_review"` explicitly (Decision 139's own
 * distinct review_type, never conflated with content_review) — see
 * MOCK_MR_BATCH001_FAMILIES below.
 */
export function deriveBatchReviewStatus(
  rows: SevenXReviewRow[],
  familyIds: string[],
  marker: string,
  reviewType: ReviewType = "content_review"
): Map<string, SevenXReviewStatus> {
  const result = new Map<string, SevenXReviewStatus>(familyIds.map((id) => [id, { reviewed: false, decision: null, reviewer: null }]));
  for (const row of rows) {
    if (row.review_type !== reviewType) continue;
    if (row.decision === "pending_independent_review") continue;
    if (!row.notes || !row.notes.includes(marker)) continue;
    if (!result.has(row.family_id)) continue;
    result.set(row.family_id, { reviewed: true, decision: row.decision as ReviewDecision, reviewer: row.reviewer });
  }
  return result;
}

export function deriveSevenXReviewStatus(rows: SevenXReviewRow[], familyIds: string[]): Map<string, SevenXReviewStatus> {
  return deriveBatchReviewStatus(rows, familyIds, SEVEN_X_BATCH_MARKER);
}

/**
 * Per-family "has this specific 007X batch of newly authored siblings been
 * reviewed" status — deliberately NOT derived from fetchReviewedTargetIds()
 * (family-level, batch-blind). Only a non-pending content_review row whose
 * notes contain SEVEN_X_BATCH_MARKER counts; an approved maths_teaching_review
 * (a different review_type entirely) or a historical content_review that
 * predates 007X can never satisfy this, however many duplicate pending
 * placeholders exist underneath (duplicates are collapsed here into a
 * single boolean per family, so they can never produce duplicate review
 * cards in the UI). Thin I/O wrapper — all real logic lives in
 * deriveSevenXReviewStatus above.
 */
async function fetchBatchReviewStatus(
  familyIds: string[],
  marker: string,
  reviewType: ReviewType = "content_review"
): Promise<Map<string, SevenXReviewStatus>> {
  const supabase = getSupabaseClient();
  if (!supabase) return deriveBatchReviewStatus([], familyIds, marker, reviewType);
  const { data, error } = await supabase
    .from("ali_family_review")
    .select("family_id, review_type, decision, notes, reviewer, created_at")
    .in("family_id", familyIds)
    .eq("review_type", reviewType)
    .order("created_at", { ascending: true });
  if (error || !data) return deriveBatchReviewStatus([], familyIds, marker, reviewType);
  return deriveBatchReviewStatus(data, familyIds, marker, reviewType);
}

export async function fetchSevenXReviewStatus(familyIds: string[]): Promise<Map<string, SevenXReviewStatus>> {
  return fetchBatchReviewStatus(familyIds, SEVEN_X_BATCH_MARKER);
}

/**
 * Pure: the fixed disclosure line prepended to a 007X review's notes
 * before it is submitted through the existing submitReview() (never a
 * second review system) — this is what makes the resulting APPROVED row
 * itself, not just the pending placeholder, identifiable as covering
 * specifically these question IDs rather than the whole family.
 */
export function buildSevenXNotesPrefix(familyId: string, questionIds: string[]): string {
  return `${SEVEN_X_BATCH_MARKER} New Content Review for ${familyId}. Question IDs: ${questionIds.join(", ")}.`;
}

export interface SevenXFamilyConfig {
  familyId: string;
  newQuestionIds: string[];
  reclassified?: { id: string; note: string }[];
  disclosure: string;
}

/**
 * Educational Increment 007X, Founder Review-Surface Correction — the
 * exact 14 newly authored Mathematics questions (plus 1 metadata-only
 * reclassified legacy row, mth-003) from migration 066, one entry per
 * target family. Lives here (not app/admin-beta/review/page.tsx, where
 * PILOT_TARGET_IDS/BATCH2_TARGET_IDS/etc. live) so its exact question-ID
 * scope is directly unit-testable without a React/JSX dependency,
 * matching MATHS_TEACHING_REVIEW_TARGET_IDS's own precedent above. Built
 * as its own dedicated review section (matching the SEVEN_T_* UI
 * precedent) rather than relying on FullBacklogSection's family-level
 * reviewedIds exclusion, because all 4 of these families already carry
 * historical review decisions (content and/or teaching) that must never
 * be read as covering this new content — see Decision 79 and
 * ANGEL_007X_MATHEMATICS_CONTENT_DEPTH_EXPANSION_V1.md §29.4.
 */
export const SEVEN_X_FAMILIES: SevenXFamilyConfig[] = [
  {
    familyId: "mr05-number-property-search",
    newQuestionIds: ["mr05-search-03", "mr05-search-04", "mr05-search-05", "mr05-search-06", "mr05-search-07"],
    disclosure:
      "This family has no prior content or teaching review, and remains classified TRANSFER-UNSAFE (its 2 original siblings were too structurally similar to demonstrate independent transfer). These 5 new siblings genuinely vary the searched property, but that does not make them fully mature teaching content on its own. This review judges the new questions themselves, not the family's teaching-maturity status.",
  },
  {
    familyId: "mr03-mixed-perimeter",
    newQuestionIds: ["mr03-mix-04", "mr03-mix-05", "mr03-mix-06"],
    reclassified: [
      { id: "mth-003", note: "Pre-existing question, metadata-reclassified into this family this increment (007X). Its question content, working, answer, and eligibility_status (provisional) were unchanged: only its family_id was set." },
    ],
    disclosure:
      "This family's 3 original siblings already have an approved content review AND an approved Mathematics Teaching Review. Neither covers these 3 newly authored siblings, which have not been reviewed before.",
  },
  {
    familyId: "precision-frac",
    newQuestionIds: ["precision-frac-04", "precision-frac-05", "precision-frac-06"],
    disclosure:
      "This family's 3 original siblings already have an approved Mathematics Teaching Review. That review predates these 3 newly authored siblings and does not cover them.",
  },
  {
    familyId: "precision-dec",
    newQuestionIds: ["precision-dec-04", "precision-dec-05", "precision-dec-06"],
    disclosure:
      "This family's 3 original siblings already have an approved Mathematics Teaching Review. That review predates these 3 newly authored siblings and does not cover them.",
  },
];
export const SEVEN_X_TARGET_IDS = SEVEN_X_FAMILIES.map((f) => f.familyId);

/**
 * Stage 3, Increment 004, Post-Increment Review-Readiness Correction — the
 * 3 brand-new MR-04 families migration 078 (Decision 116) inserted as
 * `provisional`, made reviewable via the same scoped-batch mechanism
 * 007X established (SEVEN_X_FAMILIES above), with its own distinct
 * marker so this batch's evidence trail and count can never be conflated
 * with 007X's or any other batch's (the same "never merge batch counts"
 * rule this project has followed since Decision 56). Unlike every
 * SEVEN_X_FAMILIES entry, all 3 families here are entirely new — no
 * `reclassified` rows, and no prior review of any kind to distinguish
 * from. `disclosure` on each entry carries the exact, non-biasing
 * educational-review findings from Decision 117 (Stage 3, Increment 004's
 * own technical QA), so a real reviewer sees them without Claude's PASS
 * verdict being presented as, or substituting for, the independent review
 * itself — see ANGEL_EDUCATIONAL_REVIEW_OPERATING_MODEL_V1.md and this
 * project's standing rule that Claude must never self-approve content.
 */
export const MR04_DEPTH_BATCH_MARKER = "STAGE3-INC004-MR04-DEPTH";

export const MR04_DEPTH_FAMILIES: SevenXFamilyConfig[] = [
  {
    familyId: "mr04-reverse-percentage",
    newQuestionIds: ["mr04-revpct-01", "mr04-revpct-02", "mr04-revpct-03", "mr04-revpct-04"],
    disclosure:
      "This is a brand-new family with no prior review of any kind. Stage 3 Increment 004's own technical review (Decision 117) found all 4 questions mathematically correct and correctly targeted at the intended misconception, but also disclosed a limitation: mr04-revpct-01 and mr04-revpct-03 share a near-identical sentence template, differing only in the numeral/object/price, so the 4 questions represent closer to 2 distinct scenario shapes than 4 fully independent ones. Disclosed for your own judgement, not a recommendation either way.",
  },
  {
    familyId: "mr04-time-reverse",
    newQuestionIds: ["mr04-timerev-01", "mr04-timerev-02", "mr04-timerev-03", "mr04-timerev-04"],
    disclosure:
      "This is a brand-new family with no prior review of any kind. Stage 3 Increment 004's own technical review (Decision 117) found all 4 questions mathematically correct and correctly targeted at the intended misconception. All 4 intentionally share one structural template (finish time minus summed stage durations) by design, consistent with the existing mr04-elapsed-time family's own convention; only mr04-timerev-04 varies the input format (mixed hour/minute notation). Disclosed for your own judgement, not a recommendation either way.",
  },
  {
    familyId: "mr04-bv-convert",
    newQuestionIds: ["mr04-bvconv-01", "mr04-bvconv-02", "mr04-bvconv-03"],
    disclosure:
      "This is a brand-new family with no prior review of any kind. Stage 3 Increment 004's own technical review (Decision 117) found all 3 questions mathematically correct and correctly targeted at the intended misconception, with the most genuine structural variety of the three new families (three different products, three different unit-pairs, non-uniform answers).",
  },
];
export const MR04_DEPTH_TARGET_IDS = MR04_DEPTH_FAMILIES.map((f) => f.familyId);

export function buildMr04DepthNotesPrefix(familyId: string, questionIds: string[]): string {
  return `${MR04_DEPTH_BATCH_MARKER} New Content Review for ${familyId}. Question IDs: ${questionIds.join(", ")}.`;
}

export function deriveMr04DepthReviewStatus(rows: SevenXReviewRow[], familyIds: string[]): Map<string, SevenXReviewStatus> {
  return deriveBatchReviewStatus(rows, familyIds, MR04_DEPTH_BATCH_MARKER);
}

export async function fetchMr04DepthReviewStatus(familyIds: string[]): Promise<Map<string, SevenXReviewStatus>> {
  return fetchBatchReviewStatus(familyIds, MR04_DEPTH_BATCH_MARKER);
}

/**
 * Stage 3, Increment 006 (Mathematics Structural Depth Expansion) — the 2
 * brand-new families migration 081 (Decision 121's discovery, this
 * increment's authoring) inserted as `provisional`, made reviewable via
 * the same scoped-batch mechanism as MR04_DEPTH_FAMILIES, with its own
 * distinct marker so this batch's evidence trail and count can never be
 * conflated with Increment 004's or 007X's. Included proactively in the
 * same increment that authored the content, per explicit instruction, so
 * no follow-up review-readiness correction is required this time.
 */
export const INC006_DEPTH_BATCH_MARKER = "STAGE3-INC006-DEPTH";

export const INC006_DEPTH_FAMILIES: SevenXFamilyConfig[] = [
  {
    familyId: "mr01-reverse-mean",
    newQuestionIds: ["mr01-revmean-01", "mr01-revmean-02", "mr01-revmean-03", "mr01-revmean-04"],
    disclosure:
      "This is a brand-new family with no prior review of any kind. It requires reasoning from a stated mean and all-but-one of the underlying values to the missing value (total = mean x count, then subtract the known values) -- the inverse of the existing mr01-average-mean family, which only ever gives all the values and asks for the mean. All 4 siblings deliberately mirror the original family's own 4 contexts (scores, temperature, savings, distance) with entirely new numbers, so the forward/reverse relationship is visible, though this also means the underlying sentence shape is close to the original family's own convention. Disclosed for your own judgement, not a recommendation either way.",
  },
  {
    familyId: "mr03-coord-combined",
    newQuestionIds: ["mr03-combo-01", "mr03-combo-02", "mr03-combo-03", "mr03-combo-04"],
    disclosure:
      "This is a brand-new family with no prior review of any kind. It requires applying two transformations to one point in a stated order (reflection and translation, which do not commute -- the wrong order gives a different, plausible-looking wrong answer). 2 of the 4 siblings reflect-then-translate and 2 translate-then-reflect, and both x-axis and y-axis reflections are represented, so neither the order nor the axis is fixed across the family. Disclosed for your own judgement, not a recommendation either way.",
  },
];
export const INC006_DEPTH_TARGET_IDS = INC006_DEPTH_FAMILIES.map((f) => f.familyId);

export function buildInc006DepthNotesPrefix(familyId: string, questionIds: string[]): string {
  return `${INC006_DEPTH_BATCH_MARKER} New Content Review for ${familyId}. Question IDs: ${questionIds.join(", ")}.`;
}

export function deriveInc006DepthReviewStatus(rows: SevenXReviewRow[], familyIds: string[]): Map<string, SevenXReviewStatus> {
  return deriveBatchReviewStatus(rows, familyIds, INC006_DEPTH_BATCH_MARKER);
}

export async function fetchInc006DepthReviewStatus(familyIds: string[]): Promise<Map<string, SevenXReviewStatus>> {
  return fetchBatchReviewStatus(familyIds, INC006_DEPTH_BATCH_MARKER);
}

/**
 * Mock Programme Increment 004, Batch 001 (Decision 141) — the 18 new
 * Mathematics Mock candidate questions across 7 families, made reviewable
 * via the same scoped-batch mechanism as INC006_DEPTH_FAMILIES, with two
 * deliberate differences from every prior batch above: (1) its own
 * distinct `review_type`, `mock_maths_independent_review` (migration 087,
 * Decision 139) — never `content_review` — since this is the Assessment
 * Eligibility Model's own Authentic-Assessment-Candidate-to-
 * Independently-Validated transition, a genuinely different governance
 * question from an ordinary Practice content review; (2) every row's
 * `eligibility_status` is `authentic_assessment_candidate`, not
 * `provisional` — approving a family here still does NOT change that
 * status, does NOT promote to `independently_validated` or
 * `mock_eligible`, and does NOT create or touch any `ali_mock_form` row.
 * Reviewing is one governed step in a longer chain, not activation.
 */
export const MOCK_MR_BATCH001_BATCH_MARKER = "MOCK-INC004-BATCH001";

export const MOCK_MR_BATCH001_FAMILIES: SevenXFamilyConfig[] = [
  {
    familyId: "mock-mr02-invdiv",
    newQuestionIds: ["mock-mr02-invdiv-01", "mock-mr02-invdiv-02", "mock-mr02-invdiv-03"],
    disclosure:
      "This is a brand-new family with no prior review of any kind. One-step inverse division reasoning (find the missing divisor in \"a ÷ ___ = c\"), evidenced CSSE-006 Q2(b)(c)(d) and CSSE-016 Q2(c)(d)/Q3(a)(b). Fills a real gap: the existing mr01-missing-operand Practice family has 4 items, all medium difficulty; no easy or hard variant exists anywhere in the current bank. Difficulty here is easy. Disclosed for your own judgement, not a recommendation either way.",
  },
  {
    familyId: "mock-mr02-twostep",
    newQuestionIds: ["mock-mr02-twostep-01", "mock-mr02-twostep-02", "mock-mr02-twostep-03"],
    disclosure:
      "This is a brand-new family with no prior review of any kind. A genuinely different demand from mock-mr02-invdiv: two inverse operations (multiply, then add/subtract) must be undone in the correct order, not one. Difficulty here is hard, driven by that ordering demand rather than larger numbers. This session's own verification originally produced a near-duplicate answer against mock-mr02-invdiv-01 (both resolved to 8); the numbers were changed before this batch was recorded, disclosed here rather than left implicit. Disclosed for your own judgement, not a recommendation either way.",
  },
  {
    familyId: "mock-mr03-unitconv",
    newQuestionIds: ["mock-mr03-unitconv-01", "mock-mr03-unitconv-02", "mock-mr03-unitconv-03"],
    disclosure:
      "This is a brand-new family with no prior review of any kind. Multiply-then-convert reasoning across 3 distinct unit pairs (ml/L, cm/m, g/kg), evidenced CSSE-006 Q3, CSSE-011 Q4a, CSSE-016 Q5a (HIGH confidence, present all 3 years reviewed). Difficulty here is medium. Disclosed for your own judgement, not a recommendation either way.",
  },
  {
    familyId: "mock-mr09-data",
    newQuestionIds: ["mock-mr09-data-01", "mock-mr09-data-02", "mock-mr09-data-03"],
    disclosure:
      "This is a brand-new family with no prior review of any kind, and it is structurally different from every other family in this batch: its 3 rows are 3 genuinely distinct reasoning sub-structures (extremes-comparison, mean-calculation, multi-row revenue combination), not 3 variants of one structure, evidenced CSSE-006 Q11a, CSSE-011 Q15, CSSE-016 Q10. The third row (revenue combination) is deliberately hard, requiring three independently-calculated row totals to be combined. Disclosed for your own judgement, not a recommendation either way.",
  },
  {
    familyId: "mock-mr05-forward",
    newQuestionIds: ["mock-mr05-forward-01", "mock-mr05-forward-02"],
    disclosure:
      "This is a brand-new family with no prior review of any kind. Forward function-machine rule application (apply a stated two-step rule to an input), evidenced CSSE-006 Q5/Q11/Q15, CSSE-011 Q7/Q8, CSSE-016 Q21 (HIGH confidence, present all 3 years). Difficulty here is medium, matching the existing mr02-nth-term/mr02-sequence-rule Practice families' own forward-direction tier. Disclosed for your own judgement, not a recommendation either way.",
  },
  {
    familyId: "mock-mr05-inverse",
    newQuestionIds: ["mock-mr05-inverse-01", "mock-mr05-inverse-02"],
    disclosure:
      "This is a brand-new family with no prior review of any kind. The real gap this family closes: inverting a two-step function-machine rule (given the output, find the input) is directly evidenced as a real CSSE sub-format across all three years reviewed, but no item at any difficulty currently exists for it in the live bank. Difficulty here is hard, driven by the need to reverse both the operations and their order, not by larger numbers. Disclosed for your own judgement, not a recommendation either way.",
  },
  {
    familyId: "mock-mr13-bestvalue",
    newQuestionIds: ["mock-mr13-bestvalue-01", "mock-mr13-bestvalue-02"],
    disclosure:
      "This is a brand-new family with no prior review of any kind. Best-value unit-price comparison across 2 distinct product/unit contexts (juice/litre, rice/kilogram), evidenced CSSE-006 Q16 and CSSE-016 Q6 (MEDIUM confidence, 2 of 3 years). The scored answer is restructured to be the single lower per-unit price only (a bare number), not a free-text \"which pack\" judgement, to keep exact-match marking unambiguous. Difficulty here is medium. Disclosed for your own judgement, not a recommendation either way.",
  },
];
export const MOCK_MR_BATCH001_TARGET_IDS = MOCK_MR_BATCH001_FAMILIES.map((f) => f.familyId);

export function buildMockMrBatch001NotesPrefix(familyId: string, questionIds: string[]): string {
  return `${MOCK_MR_BATCH001_BATCH_MARKER} new content review: ${familyId}-01..0${questionIds.length} (Question IDs: ${questionIds.join(", ")})`;
}

export function deriveMockMrBatch001ReviewStatus(rows: SevenXReviewRow[], familyIds: string[]): Map<string, SevenXReviewStatus> {
  return deriveBatchReviewStatus(rows, familyIds, MOCK_MR_BATCH001_BATCH_MARKER, "mock_maths_independent_review");
}

export async function fetchMockMrBatch001ReviewStatus(familyIds: string[]): Promise<Map<string, SevenXReviewStatus>> {
  return fetchBatchReviewStatus(familyIds, MOCK_MR_BATCH001_BATCH_MARKER, "mock_maths_independent_review");
}

/**
 * Inserts one real, traceable Mock-content independent-review decision —
 * `review_type = 'mock_maths_independent_review'` (migration 087,
 * Decision 139), explicitly set here exactly as `submitMathsTeachingReview`
 * explicitly sets its own distinct review_type, rather than relying on
 * the table's own `'content_review'` default the way `submitReview()`
 * (unmodified, below) correctly does for every genuine content-review
 * batch. Reuses the exact same 18-criterion `ReviewSubmission` shape as
 * `submitReview()` — Mock content review and ordinary content review ask
 * the same educational questions, only the eligibility-pipeline meaning
 * of the resulting decision differs, which is what the distinct
 * `review_type` value records. Append-only; never touches
 * `ali_question_bank.eligibility_status`, never creates or touches any
 * `ali_mock_form` row.
 */
export async function submitMockMathsIndependentReview(s: ReviewSubmission): Promise<SubmitReviewResult> {
  const validationError = validateReviewSubmission(s);
  if (validationError) return { error: validationError };
  if (!s.decision) return { error: "Choose a decision: this is never chosen for you." };
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "Not connected" };
  const { error } = await supabase.from("ali_family_review").insert({
    review_target_type: s.reviewTargetType,
    review_type: "mock_maths_independent_review",
    family_id: s.targetId,
    reviewer: s.reviewer.trim(),
    decision: s.decision,
    notes: buildNotesWithQualification(s),
    evidence_reference: s.evidenceReference.trim() || null,
    provenance_reference: s.provenanceReference.trim() || null,
    educational_validity: s.educationalValidity,
    competency_validity: s.competencyValidity,
    wording_quality: s.wordingQuality,
    age_appropriate: s.ageAppropriate,
    ambiguity_free: s.ambiguityFree,
    difficulty_appropriate: s.difficultyAppropriate,
    misconception_quality: s.misconceptionQuality,
    explanation_quality: s.explanationQuality,
    variation_boundaries_sound: s.variationBoundariesSound,
    authenticity_confirmed: s.authenticityConfirmed,
    question_type_alignment: s.questionTypeAlignment,
    answer_correctness_verified: s.answerCorrectnessVerified,
    transfer_validity: s.transferValidity,
    teaching_quality: s.teachingQuality,
    exam_strategy_quality: s.examStrategyQuality,
    validation_behaviour_sound: s.validationBehaviourSound,
    originality_confirmed: s.originalityConfirmed,
    copyright_risk_clear: s.copyrightRiskClear,
  });
  return { error: error ? error.message : null };
}

export const DIFFICULTY_RANK: Record<string, number> = { easy: 0, medium: 1, hard: 2 };

/** Pure: true difficulty order (easy -> medium -> hard), not the database's default alphabetical order, which would wrongly place "hard" before "medium". Exported and unit-tested directly (tests/lib/adminReview.test.ts). */
export function sortByDifficulty<T extends { contentDifficulty: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (DIFFICULTY_RANK[a.contentDifficulty] ?? 1) - (DIFFICULTY_RANK[b.contentDifficulty] ?? 1));
}

/** Pure: turns a set of difficulty labels into the plain-language range shown on a target's summary card. */
export function computeDifficultyRange(difficulties: string[]): string {
  const distinct = [...new Set(difficulties)].sort((a, b) => (DIFFICULTY_RANK[a] ?? 1) - (DIFFICULTY_RANK[b] ?? 1));
  if (distinct.length === 0) return "unknown";
  if (distinct.length === 1) return distinct[0];
  return `${distinct[0]} to ${distinct[distinct.length - 1]}`;
}

/** Shared row -> RepresentativeQuestion mapping, reused by every fetch* function below so a future column addition only needs to change one place. */
function mapQuestionRow(r: {
  id: string; subject: string; skill: string; prompt: unknown; family_id: string | null; learning_unit_id: string | null;
  content_difficulty: string; transfer_class: string | null; addresses_misconception: string | null;
  content_version: number; active: boolean; provenance: string | null; eligibility_status: string;
}): RepresentativeQuestion {
  return {
    id: r.id, subject: r.subject, skill: r.skill,
    question: promptText(r.prompt, "question"),
    modelAnswer: promptText(r.prompt, "modelAnswer"),
    familyId: r.family_id, learningUnitId: r.learning_unit_id,
    contentDifficulty: r.content_difficulty, transferClass: r.transfer_class,
    addressesMisconception: r.addresses_misconception, contentVersion: r.content_version,
    active: r.active, provenance: r.provenance, eligibilityStatus: r.eligibility_status,
    workingSteps: promptWorkingSteps(r.prompt),
  };
}

const QUESTION_SELECT_COLUMNS = "id, subject, skill, prompt, family_id, learning_unit_id, content_difficulty, transfer_class, addresses_misconception, content_version, active, provenance, eligibility_status";

/** Up to `limit` real questions for a family — the reviewer's representative + boundary sample (Operating Model §3), not the full sibling set. */
export async function fetchRepresentativeQuestions(familyId: string, limit = 8): Promise<RepresentativeQuestion[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("ali_question_bank")
    .select(QUESTION_SELECT_COLUMNS)
    .eq("family_id", familyId)
    .limit(limit);
  if (error || !data) return [];
  return sortByDifficulty(data.map(mapQuestionRow));
}

/**
 * Educational Increment 007X, Founder Review-Surface Correction, Part 2 —
 * the exact-ID-scoped counterpart to fetchRepresentativeQuestions() above.
 * Used to show a bounded batch's own newly authored siblings (e.g. 007X's
 * 14 new Mathematics questions) without also pulling in every OTHER
 * sibling a shared family_id happens to have — the family-level fetch is
 * the wrong tool once a family can contain both long-reviewed and
 * newly-authored, not-yet-reviewed content at once.
 */
export async function fetchQuestionsByIds(ids: string[]): Promise<RepresentativeQuestion[]> {
  if (ids.length === 0) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("ali_question_bank")
    .select(QUESTION_SELECT_COLUMNS)
    .in("id", ids);
  if (error || !data) return [];
  return sortByDifficulty(data.map(mapQuestionRow));
}

export interface TargetSummary {
  subject: string;
  competencyCodes: string[];
  questionTypeCodes: string[];
  questionCount: number;
  difficultyRange: string;
  reviewed: boolean;
}

/** Educational Increment 007F, Part 3 — the summary card shown BEFORE a reviewer opens a target: enough to orient them, not the full review content. Computed from the same real rows the detail page uses, not a separate cached figure that could drift. */
export async function fetchTargetSummary(target: PendingReviewTarget, alreadyReviewed: boolean): Promise<TargetSummary> {
  const questions = target.reviewTargetType === "passage"
    ? await fetchQuestionsForPassage(target.id)
    : await fetchRepresentativeQuestions(target.id, 50);
  const subject = questions[0]?.subject ?? (target.id.startsWith("mr") ? "maths" : "english");
  const questionTypeCodes = [...new Set(questions.map((q) => q.skill))];
  const difficultyRange = computeDifficultyRange(questions.map((q) => q.contentDifficulty));
  return {
    subject, competencyCodes: [], questionTypeCodes,
    questionCount: questions.length, difficultyRange, reviewed: alreadyReviewed,
  };
}

/** Same shape, but scoped to a specific passage (learning_unit_id), for reviewing a complete passage's own question set. */
export async function fetchQuestionsForPassage(passageId: string): Promise<RepresentativeQuestion[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("ali_question_bank")
    .select("id, subject, skill, prompt, family_id, learning_unit_id, content_difficulty, transfer_class, addresses_misconception, content_version, active, provenance, eligibility_status")
    .eq("learning_unit_id", passageId);
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id, subject: r.subject, skill: r.skill,
    question: promptText(r.prompt, "question"),
    modelAnswer: promptText(r.prompt, "modelAnswer"),
    familyId: r.family_id, learningUnitId: r.learning_unit_id,
    contentDifficulty: r.content_difficulty, transferClass: r.transfer_class,
    addressesMisconception: r.addresses_misconception, contentVersion: r.content_version,
    active: r.active, provenance: r.provenance, eligibilityStatus: r.eligibility_status,
    workingSteps: promptWorkingSteps(r.prompt),
  }));
}

export async function fetchPassageDetail(passageId: string): Promise<PassageDetail | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("ali_passage_bank")
    .select("id, title, original_text, genre, word_count, reading_complexity, provenance, copyright_status, content_difficulty, content_version, active, eligibility_status")
    .eq("id", passageId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id, title: data.title, originalText: data.original_text, genre: data.genre,
    wordCount: data.word_count, readingComplexity: data.reading_complexity, provenance: data.provenance,
    copyrightStatus: data.copyright_status, contentDifficulty: data.content_difficulty,
    contentVersion: data.content_version, active: data.active, eligibilityStatus: data.eligibility_status,
  };
}

export interface SubmitReviewResult {
  error: string | null;
}

/**
 * Pure validation, independent of any Supabase connection, so it can be
 * unit-tested directly (tests/lib/adminReview.test.ts). Returns the
 * error message to show, or null when the submission is valid.
 */
export function validateReviewSubmission(s: ReviewSubmission): string | null {
  if (!s.reviewer.trim()) return "Reviewer name is required, a review cannot be recorded anonymously.";
  if (!s.qualificationBasis.trim()) return "Reviewer qualification basis is required (e.g. teaching experience, subject knowledge, 11+ preparation experience).";
  if (!s.decision) return "Choose a decision: this is never chosen for you.";
  if (s.decision === "rejected" && !s.notes.trim()) {
    return "A rejected decision requires notes explaining why (enforced by the database itself, but checked here for a clearer message).";
  }
  return null;
}

/** Combines qualification basis and the reviewer's own findings into the single `notes` field, per the Operating Model §2's deliberate choice not to add a separate credentialing column — the qualification line is never silently dropped. Structural parameter type (not `ReviewSubmission` itself) so the Mathematics Teaching Review submission (a distinct shape, see below) can reuse this exact logic rather than duplicating it. */
export function buildNotesWithQualification(s: { qualificationBasis: string; notes: string }): string {
  const qualificationLine = `Reviewer qualification: ${s.qualificationBasis.trim()}.`;
  return s.notes.trim() ? `${qualificationLine}\n\n${s.notes.trim()}` : qualificationLine;
}

/** Inserts one real, traceable review decision. Never updates eligibility_status — see this file's module docstring. */
export async function submitReview(s: ReviewSubmission): Promise<SubmitReviewResult> {
  const validationError = validateReviewSubmission(s);
  if (validationError) return { error: validationError };
  // validateReviewSubmission already rejects a null decision above, but
  // TypeScript can't narrow s.decision through that separate function
  // call — this re-check is redundant at runtime, purely to keep the
  // insert below correctly typed without an unsafe assertion.
  if (!s.decision) return { error: "Choose a decision: this is never chosen for you." };
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "Not connected" };
  const { error } = await supabase.from("ali_family_review").insert({
    review_target_type: s.reviewTargetType,
    family_id: s.targetId,
    reviewer: s.reviewer.trim(),
    decision: s.decision,
    notes: buildNotesWithQualification(s),
    evidence_reference: s.evidenceReference.trim() || null,
    provenance_reference: s.provenanceReference.trim() || null,
    educational_validity: s.educationalValidity,
    competency_validity: s.competencyValidity,
    wording_quality: s.wordingQuality,
    age_appropriate: s.ageAppropriate,
    ambiguity_free: s.ambiguityFree,
    difficulty_appropriate: s.difficultyAppropriate,
    misconception_quality: s.misconceptionQuality,
    explanation_quality: s.explanationQuality,
    variation_boundaries_sound: s.variationBoundariesSound,
    authenticity_confirmed: s.authenticityConfirmed,
    question_type_alignment: s.questionTypeAlignment,
    answer_correctness_verified: s.answerCorrectnessVerified,
    transfer_validity: s.transferValidity,
    teaching_quality: s.teachingQuality,
    exam_strategy_quality: s.examStrategyQuality,
    validation_behaviour_sound: s.validationBehaviourSound,
    originality_confirmed: s.originalityConfirmed,
    copyright_risk_clear: s.copyrightRiskClear,
  });
  return { error: error ? error.message : null };
}
