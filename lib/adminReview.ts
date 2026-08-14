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

export type ReviewTargetType = "passage" | "question_family";
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
}

/** prompt is stored as jsonb (typed `unknown` at the client) — narrows just enough to read the two display fields safely, without claiming to know its full shape. */
function promptText(prompt: unknown, key: "question" | "modelAnswer"): string {
  if (prompt && typeof prompt === "object" && key in prompt) {
    const value = (prompt as Record<string, unknown>)[key];
    if (typeof value === "string") return value;
  }
  return key === "question" ? "(no question text found)" : "(no model answer found)";
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

/** Educational Increment 007F, Part 1 — every family_id/passage id that has at least one REAL decision recorded (anything other than the placeholder pending row), so the UI can show "X of 7 reviewed" and per-card status honestly. A target can have both a pending row (history, never deleted) and a real decision row; this only counts the latter. */
export async function fetchReviewedTargetIds(): Promise<Set<string>> {
  const supabase = getSupabaseClient();
  if (!supabase) return new Set();
  const { data, error } = await supabase
    .from("ali_family_review")
    .select("family_id")
    .neq("decision", "pending_independent_review");
  if (error || !data) return new Set();
  return new Set(data.map((r) => r.family_id));
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

/** Up to `limit` real questions for a family — the reviewer's representative + boundary sample (Operating Model §3), not the full sibling set. */
export async function fetchRepresentativeQuestions(familyId: string, limit = 8): Promise<RepresentativeQuestion[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("ali_question_bank")
    .select("id, subject, skill, prompt, family_id, learning_unit_id, content_difficulty, transfer_class, addresses_misconception, content_version, active, provenance, eligibility_status")
    .eq("family_id", familyId)
    .limit(limit);
  if (error || !data) return [];
  const mapped = data.map((r) => ({
    id: r.id, subject: r.subject, skill: r.skill,
    question: promptText(r.prompt, "question"),
    modelAnswer: promptText(r.prompt, "modelAnswer"),
    familyId: r.family_id, learningUnitId: r.learning_unit_id,
    contentDifficulty: r.content_difficulty, transferClass: r.transfer_class,
    addressesMisconception: r.addresses_misconception, contentVersion: r.content_version,
    active: r.active, provenance: r.provenance, eligibilityStatus: r.eligibility_status,
  }));
  return sortByDifficulty(mapped);
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

/** Combines qualification basis and the reviewer's own findings into the single `notes` field, per the Operating Model §2's deliberate choice not to add a separate credentialing column — the qualification line is never silently dropped. */
export function buildNotesWithQualification(s: ReviewSubmission): string {
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
