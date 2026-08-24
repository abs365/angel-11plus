"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, ArrowRight, ShieldAlert, LogOut, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { checkIsAdmin } from "@/lib/feedback";
import {
  fetchPendingReviewTargets, fetchReviewedTargetIds, fetchRepresentativeQuestions, fetchQuestionsForPassage,
  fetchPassageDetail, fetchTargetSummary, submitReview,
  REVIEW_CRITERIA, FAMILY_EDUCATIONAL_CONTEXT, FAMILY_MARKING_BASIS,
  fetchMathsTeachingReviewedFamilyIds, submitMathsTeachingReview,
  MATHS_TEACHING_REVIEW_CRITERIA, MATHS_TEACHING_REVIEW_METADATA, MATHS_TEACHING_CONTENT_VERSION,
  MATHS_TEACHING_REVIEW_TARGET_IDS,
  fetchEnglishTeachingReviewedFamilyIds, submitEnglishTeachingReview,
  ENGLISH_TEACHING_REVIEW_METADATA, ENGLISH_TEACHING_CONTENT_VERSION, ENGLISH_TEACHING_REVIEW_TARGET_IDS,
  fetchWritingTeachingReviewedFamilyIds, submitWritingTeachingReview,
  WRITING_TEACHING_CONTENT_VERSION, WRITING_TEACHING_REVIEW_TARGET_IDS,
  fetchQuestionsByIds, fetchSevenXReviewStatus, buildSevenXNotesPrefix, SEVEN_X_FAMILIES, SEVEN_X_TARGET_IDS,
  groupQuestionsForReview,
  fetchMr04DepthReviewStatus, buildMr04DepthNotesPrefix, MR04_DEPTH_FAMILIES, MR04_DEPTH_TARGET_IDS,
  fetchInc006DepthReviewStatus, buildInc006DepthNotesPrefix, INC006_DEPTH_FAMILIES, INC006_DEPTH_TARGET_IDS,
  fetchMockMrBatch001ReviewStatus, buildMockMrBatch001NotesPrefix, submitMockMathsIndependentReview,
  MOCK_MR_BATCH001_FAMILIES, MOCK_MR_BATCH001_TARGET_IDS,
  fetchMockMrBatch002ReviewStatus, buildMockMrBatch002NotesPrefix,
  MOCK_MR_BATCH002_FAMILIES, MOCK_MR_BATCH002_TARGET_IDS,
  fetchMockMrBatch003ReviewStatus, buildMockMrBatch003NotesPrefix,
  MOCK_MR_BATCH003_FAMILIES, MOCK_MR_BATCH003_TARGET_IDS,
  fetchMockEnglishPassageBatch001ReviewStatus, submitMockEnglishPassageIndependentReview,
  MOCK_ENGLISH_PASSAGE_BATCH001_TARGET_ID,
  fetchMockWritingBatch001ReviewStatus, buildMockWritingBatch001NotesPrefix, submitMockWritingPromptIndependentReview,
  MOCK_WRITING_BATCH001_FAMILIES, MOCK_WRITING_BATCH001_TARGET_IDS,
  type PendingReviewTarget, type RepresentativeQuestion, type PassageDetail, type ReviewDecision, type ReviewSubmission,
  type TargetSummary, type MathsTeachingReviewSubmission, type SevenXReviewStatus, type SevenXFamilyConfig,
} from "@/lib/adminReview";
import { getExamStrategyHint, getWorkedExample } from "@/lib/learningEngine/englishExamStrategies";
import { getGuidedScaffoldKind, getGuidedInstructionText } from "@/lib/learningEngine/guidedPractice";
import { getSelfReflectionCategories, WRONG_ANSWER_CATEGORY_LABEL } from "@/lib/learningEngine/englishErrorClassification";
import { getMathsTeachingContent, MATHS_MISCONCEPTION_CATEGORY_LABEL, effectiveGuidedRevealStepCount } from "@/lib/learningEngine/mathsTeachingContent";
import { getWritingTeachingContent } from "@/lib/learningEngine/writingTeachingContent";
import { WRITING_DIMENSIONS, WRITING_DIMENSION_LABEL } from "@/lib/learningEngine/writingRubric";

/**
 * Educational Increment 007F, "Reviewer Experience Correction" — the
 * Founder inspected the first version of this page and found it exposed
 * raw implementation identifiers (wave1-fam-quote-explain, mr04-elapsed-
 * time) and the full 44-target backlog as the primary view, making the
 * reviewer decode internal architecture instead of performing an
 * educational review. This rewrite fixes that: a clearly bounded
 * "First Educational Review Pilot" section (the same 7 targets from
 * ENGLISH_007E_PILOT_REVIEW_PACK_V1.md) leads the page, every target
 * gets a plain-language name and educational-context summary before its
 * technical ID appears (small, secondary), and the full backlog is
 * demoted to a collapsed section beneath the pilot.
 *
 * Still not a CMS and still cannot change eligibility_status — see
 * ANGEL_EDUCATIONAL_REVIEW_OPERATING_MODEL_V1.md §5.
 */

// ─── Pilot scope and human-readable naming ─────────────────────────────────

const PILOT_TARGET_IDS = [
  "wave2-fam-multiselect",
  "wave1-fam-sequencing",
  "wave1-fam-quote-explain",
  "wave1-fam-two-character",
  "wave1-fam-vocab-explain",
  "wave2-eng-surprise",
  "mr02-compare",
];

/**
 * Educational Increment 007H, Controlled Review Batch 2 — selected in
 * ANGEL_007H_BATCH2_SELECTION_V1.md from the existing provisional corpus
 * (no new content authored). Kept as its own section, distinct from the
 * First Educational Review Pilot above, per the Founder's Part 5
 * instruction: the two batches must never be merged into one count.
 */
const BATCH2_TARGET_IDS = [
  "wave1-fam-direct-retrieval",
  "wave1-fam-synonym-battery",
  "wave1-fam-emotion-cause",
  "mr03-classify",
  "mr04-far-percent",
  "mr04-mixed-divisibility",
];

/**
 * Educational Increment 007I, Controlled Review Batch 3 — selected in
 * ANGEL_007I_BATCH3_SELECTION_V1.md from the existing provisional
 * Mathematics corpus (no new content authored). All 7 Mathematics
 * families; kept as its own section, distinct from the Pilot and Batch 2
 * above, matching the same "never merge batch counts" rule.
 */
const BATCH3_TARGET_IDS = [
  "mr01-missing-operand",
  "mr03-coordinate",
  "mr01-measurement-conversion",
  "mr01-data-table",
  "mr04-elapsed-time",
  "mr01-average-mean",
  "mr02-nth-term",
];

/**
 * Educational Increment 007K, Controlled Review Batch 4 — selected in
 * ANGEL_007K_MATHEMATICS_DEPTH_AND_BATCH4_READINESS_V1.md Part 7 from the
 * remaining registered-family Mathematics corpus (no new content
 * authored). All 9 remaining registered Mathematics families; kept as its
 * own section, distinct from the Pilot, Batch 2, and Batch 3 above,
 * matching the same "never merge batch counts" rule. Closes the
 * registered-family Mathematics review backlog (the 5 ungrouped legacy
 * questions remain deliberately unclassified and out of scope).
 */
const BATCH4_TARGET_IDS = [
  "mr04-best-value",
  "mr02-far-ratio-context",
  "mr05-factors-primes",
  "mr05-constrained-multiple",
  "mr03-angle-ratio",
  "mr02-sum-difference",
  "mr04-compound-percentage",
  "mr03-mixed-perimeter",
  "mr04-far-recipe",
];

/**
 * Educational Increment 007T, Post-Migration 064 Review-Surface
 * Reconciliation — root cause of the missing "007T Content Review"
 * section: FullBacklogSection's own filter only excludes the four
 * hardcoded arrays above (PILOT/BATCH2/BATCH3/BATCH4). Migration 064's 11
 * targets (whether or not they exist live — this section renders an
 * honest empty state per group if they do not, exactly like every batch
 * section above) were never added to a named array, so they would fall
 * into the generic, unlabelled backlog regardless of whether migration
 * 064 itself succeeded. Split into 3 named sub-arrays (not one flat list)
 * so Mathematics, English Effect-of-Language, and Passages can be shown
 * as clearly separated groups, per the Founder's explicit instruction.
 */
const SEVEN_T_MATHS_TARGET_IDS = [
  "mr01-whole-number-computation",
  "mr01-decimal-computation",
  "mr01-fraction-computation",
  "mr01-multistep-order-of-operations",
];
const SEVEN_T_ENGLISH_TARGET_IDS = [
  "wave3-fam-rc10-word-choice",
  "wave3-fam-rc10-atmosphere-mood",
];
const SEVEN_T_PASSAGE_TARGET_IDS = [
  "wave3-eng-emptyclassroom",
  "wave3-eng-bakersapprentice",
  "wave3-eng-lettertograndad",
  "wave3-eng-stormharbour",
  "wave3-eng-newtrainers",
];
const SEVEN_T_TARGET_IDS = [...SEVEN_T_MATHS_TARGET_IDS, ...SEVEN_T_ENGLISH_TARGET_IDS, ...SEVEN_T_PASSAGE_TARGET_IDS];

// MATHS_TEACHING_REVIEW_TARGET_IDS (the exact 22 Phase B families) now
// lives in lib/adminReview.ts, imported above — the single source of
// truth both this page and tests/lib/adminReview.test.ts check against,
// so the UI's target list and the underlying data can never silently
// drift apart.

const FAMILY_DISPLAY_NAME: Record<string, string> = {
  "wave2-fam-multiselect": "Selecting Multiple Correct Statements",
  "wave1-fam-sequencing": "Sequencing Events and Evidence",
  "wave1-fam-quote-explain": "Quotation and Explanation",
  "wave1-fam-two-character": "Comparing Two Characters",
  "wave1-fam-vocab-explain": "Vocabulary in Context",
  "wave1-fam-direct-retrieval": "Direct Retrieval",
  "wave1-fam-synonym-battery": "Synonym Recognition",
  "wave1-fam-tick-justify": "Tick and Justify",
  "wave1-fam-emotion-cause": "Emotion and Cause",
  "mr02-compare": "Comparing Algebraic Expressions",
  "mr03-classify": "Classifying Triangles by Angle",
  "mr04-far-percent": "Proportional Reasoning (Far Transfer)",
  "mr04-mixed-divisibility": "Simultaneous Divisibility Conditions",
  "mr01-missing-operand": "Missing Operand (Reverse Reasoning)",
  "mr03-coordinate": "Coordinate Transformations",
  "mr01-measurement-conversion": "Measurement Conversion",
  "mr01-data-table": "Reading and Interpreting Data Tables",
  "mr04-elapsed-time": "Multi-Step Elapsed Time",
  "mr01-average-mean": "Calculating the Mean",
  "mr02-nth-term": "Pattern Inference and the nth Term",
  "mr04-best-value": "Best Value Comparison",
  "mr02-far-ratio-context": "Ratio Share with Follow-On",
  "mr05-factors-primes": "Factors and Primes",
  "mr05-constrained-multiple": "Constrained Multiples",
  "mr03-angle-ratio": "Angle Ratios",
  "mr02-sum-difference": "Sum and Difference",
  "mr04-compound-percentage": "Successive Percentage Change",
  "mr03-mixed-perimeter": "Area to Perimeter",
  "mr04-far-recipe": "Recipe Scaling",
  "mr02-sequence-rule": "Two-Step Sequence Rules (Forward and Reverse)",
  "mr02-substitution": "Substituting Linked Relationships",
  "mr03-angle-sum": "Angle Sum in Triangles and Quadrilaterals",
  "mr05-number-property": "Number Property Definitions",
  "precision-dec": "Rounding to a Decimal Place",
  "precision-frac": "Exact Fractional Answers",
  "mr05-number-property-search": "Searching for a Number with a Property",
  "writing-reflective-discursive": "Reflective and Discursive Writing",
  // Educational Increment 007T — first controlled content batch (provisional, not yet activated).
  "mr01-whole-number-computation": "Whole-Number Direct Arithmetic",
  "mr01-decimal-computation": "Decimal Direct Arithmetic",
  "mr01-fraction-computation": "Fraction Direct Arithmetic",
  "mr01-multistep-order-of-operations": "Multi-Step and Order of Operations",
  "wave3-fam-rc10-word-choice": "Word-Choice Implication",
  "wave3-fam-rc10-atmosphere-mood": "Atmosphere and Mood",
  // Stage 3, Increment 003/004 — MR-04 content depth batch (Decisions 116-117).
  "mr04-reverse-percentage": "Reverse Percentage Change",
  "mr04-time-reverse": "Reverse Elapsed Time",
  "mr04-bv-convert": "Best Value with Unit Conversion",
  // Stage 3, Increment 006 (Decision 121 discovery/authoring).
  "mr01-reverse-mean": "Reverse Mean (Missing Value)",
  "mr03-coord-combined": "Combined Coordinate Transformations",
  // Mock Programme Increment 004, Batch 001 (Decision 141) — Mathematics Mock candidates, all authentic_assessment_candidate.
  "mock-mr02-invdiv": "Mock: Missing Divisor (One-Step Inverse)",
  "mock-mr02-twostep": "Mock: Two-Step Inverse Arithmetic",
  "mock-mr03-unitconv": "Mock: Unit Conversion with Calculation",
  "mock-mr09-data": "Mock: Data Table Reasoning",
  "mock-mr05-forward": "Mock: Function Machine (Forward)",
  "mock-mr05-inverse": "Mock: Function Machine (Inverse)",
  "mock-mr13-bestvalue": "Mock: Best-Value Comparison",
  // Mock Programme Increment 004, Batch 002 (Decision 145) — Mathematics Mock candidates, all authentic_assessment_candidate.
  "mock-mr04-percentchange": "Mock: Successive Percentage Change",
  "mock-mr04-reversepercent": "Mock: Reverse Percentage Change",
  "mock-mr06-sumdiff": "Mock: Sum and Difference",
  "mock-mr06-multiplerelation": "Mock: Multiple Relationship (k-Times)",
  "mock-mr07-triangleanglesum": "Mock: Algebraic Angle Sum",
  "mock-mr07-isoscelesproperty": "Mock: Isosceles Triangle Property",
  "mock-mr10-forwardschedule": "Mock: Forward Elapsed Time",
  "mock-mr10-reverseschedule": "Mock: Reverse Elapsed Time",
  "mock-mr11-truefalsejudgement": "Mock: Number-Property True/False",
  "mock-mr11-propertysearch": "Mock: Number-Property Search",
};

/** Graceful fallback for any family/passage not in the curated name map above — never shows a raw dash-separated ID as the primary label. */
function formatFallbackName(id: string): string {
  const withoutPrefix = id.replace(/^wave\d-eng-/, "").replace(/^wave\d-fam-/, "").replace(/^mr\d\d-/, "");
  return withoutPrefix.split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/** Real remediation categories a family's wrong-answer feedback can genuinely draw on — reuses the live functions, never a separately-maintained duplicate for the 3 automatically-verified families whose logic isn't expressible as a static lookup without a live scoring result. */
function getRemediationLabels(familyId: string): string[] {
  const selfReflection = getSelfReflectionCategories(familyId).map((c) => WRONG_ANSWER_CATEGORY_LABEL[c]);
  if (selfReflection.length > 0) return selfReflection;
  if (familyId === "wave2-fam-multiselect") return [WRONG_ANSWER_CATEGORY_LABEL.OVER_SELECTION, WRONG_ANSWER_CATEGORY_LABEL.UNDER_SELECTION];
  if (familyId === "wave1-fam-sequencing") return [WRONG_ANSWER_CATEGORY_LABEL.EVIDENCE_NOT_LOCATED, WRONG_ANSWER_CATEGORY_LABEL.SEQUENCE_ERROR];
  if (familyId === "wave1-fam-vocab-explain" || familyId === "wave1-fam-synonym-battery") return [WRONG_ANSWER_CATEGORY_LABEL.VOCABULARY_CONTEXT_ERROR];
  return [];
}

const GUIDED_KIND_LABEL: Record<string, string> = {
  "selection-count-check": "A real, checked scaffold: Angel counts the learner's selections live and warns before they submit too many.",
  "sequence-anchor": "A real, checked scaffold: the first correct step is given to the learner as a starting point.",
  "staged-quotation": "A real, checked scaffold: the learner can check whether they found the right quotation before writing their explanation.",
  "locate-instruction": "A written tip shown to the learner, not an interactive checked scaffold.",
};

// ─── Plain-language reviewer questions now live in lib/adminReview.ts as
// REVIEW_CRITERIA, so the Yes-is-good semantic convention (Educational
// Increment 007F, Review Evidence Clarification, Part 2) is unit-testable
// without loading this React module. ──────────────────────────────────

const DECISIONS: { value: ReviewDecision; label: string; hint: string }[] = [
  { value: "approved", label: "Approved", hint: "Ready to move toward Practice, pending a separate activation step." },
  { value: "approved_with_amendment", label: "Approved with amendment", hint: "Sound, but needs a specific, correctable fix first." },
  { value: "requires_revalidation", label: "Requires revalidation", hint: "You cannot confirm something yet and need it resolved before deciding." },
  { value: "rejected", label: "Rejected", hint: "Should not be activated as it stands." },
];

function emptySubmission(target: PendingReviewTarget, reviewerName: string): ReviewSubmission {
  return {
    reviewTargetType: target.reviewTargetType, targetId: target.id, reviewer: reviewerName,
    qualificationBasis: "",
    // Educational Increment 007F correction — the Founder's own directive
    // states plainly: "Claude must never preselect APPROVED." No decision
    // has a default; the reviewer must actively choose one.
    decision: null,
    notes: "", evidenceReference: "", provenanceReference: "",
    educationalValidity: null, competencyValidity: null, wordingQuality: null, ageAppropriate: null,
    ambiguityFree: null, difficultyAppropriate: null, misconceptionQuality: null, explanationQuality: null,
    variationBoundariesSound: null, authenticityConfirmed: null, questionTypeAlignment: null,
    answerCorrectnessVerified: null, transferValidity: null, teachingQuality: null, examStrategyQuality: null,
    validationBehaviourSound: null, originalityConfirmed: null, copyrightRiskClear: null,
  };
}

function TriState({ value, onChange }: { value: boolean | null; onChange: (v: boolean | null) => void }) {
  return (
    <div className="flex gap-1 shrink-0">
      {[["Yes", true], ["No", false], ["N/A", null]].map(([label, v]) => (
        <button
          key={label as string}
          type="button"
          onClick={() => onChange(v as boolean | null)}
          className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
            value === v
              ? v === false ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
              : v === true ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              : "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
          }`}
        >
          {label as string}
        </button>
      ))}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">{children}</div>;
}

function SectionTitle({ letter, title }: { letter: string; title: string }) {
  return (
    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-2">
      {letter}. {title}
    </p>
  );
}

// ─── Full review form (per Founder's A-F ordering) ─────────────────────────

function ReviewForm({
  target, onDone, reviewType = "content_review", sevenX,
}: {
  target: PendingReviewTarget;
  onDone: () => void;
  reviewType?: "content_review" | "english_teaching_review" | "mock_maths_independent_review" | "mock_english_passage_independent_review" | "mock_writing_prompt_independent_review";
  /**
   * Educational Increment 007X, Founder Review-Surface Correction — when
   * set, this review is scoped to a specific, newly authored batch of
   * sibling questions within `target.id`'s family, not the family's full
   * sibling set. `questionIds` are shown as the reviewable content (via
   * fetchQuestionsByIds, not the family-wide fetchRepresentativeQuestions);
   * `reclassified` are shown separately, disclosed as unchanged content
   * whose family_id metadata moved this batch, never counted as "new."
   * `disclosure` is a fixed banner making explicit that any earlier
   * approval of this family does not cover this batch. On submit, the
   * resulting review row's notes are prefixed with `notesPrefix` (a
   * stable, batch-specific marker string built by the caller, e.g.
   * buildSevenXNotesPrefix or buildMr04DepthNotesPrefix — generalised
   * here, Stage 3 Increment 004, so a second scoped-review batch could
   * reuse this exact form without conflating its own marker/count with
   * 007X's) so the SAME distinction holds for the decision this form
   * itself produces, not only for the pending placeholder that preceded
   * it.
   */
  sevenX?: {
    questionIds: string[];
    reclassified?: { id: string; note: string }[];
    disclosure: string;
    notesPrefix: string;
  };
}) {
  const [reviewerName, setReviewerName] = useState("");
  const [submission, setSubmission] = useState<ReviewSubmission>(() => emptySubmission(target, ""));
  const [passage, setPassage] = useState<PassageDetail | null>(null);
  const [questions, setQuestions] = useState<RepresentativeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const displayName = FAMILY_DISPLAY_NAME[target.id] ?? (passage?.title || formatFallbackName(target.id));
  const educationalContext = FAMILY_EDUCATIONAL_CONTEXT[target.id];
  // Educational Increment 007H, Part 7 — found and fixed here: this page
  // previously called the English-only guidedPractice/englishExamStrategies
  // helpers for every question_family target regardless of subject. For a
  // Mathematics family (e.g. mr02-compare, and now this batch's 3
  // Mathematics targets) getGuidedScaffoldKind() correctly returns
  // undefined, but getGuidedInstructionText() then falls through to its
  // generic default ("find the exact part of the passage..."), which is
  // false for Mathematics content — there is no passage and no Guided
  // Practice mechanic for Mathematics anywhere in the codebase
  // (lib/learningEngine/guidedPractice.ts's FAMILY_SCAFFOLD is keyed
  // entirely by English family IDs). Gating on subject fixes the false
  // claim rather than papering over it with different wording.
  const subject = questions[0]?.subject ?? (passage ? "english" : target.id.startsWith("mr") ? "maths" : "english");
  const isEnglish = subject === "english";
  const workedExample = target.reviewTargetType === "question_family" && isEnglish ? getWorkedExample(target.id) : undefined;
  const guidedScaffold = target.reviewTargetType === "question_family" && isEnglish ? getGuidedScaffoldKind(target.id) : undefined;
  const guidedInstruction = guidedScaffold ? getGuidedInstructionText(target.id, guidedScaffold) : undefined;
  const strategyHint = target.reviewTargetType === "question_family" && isEnglish ? getExamStrategyHint(target.id) : undefined;
  const remediationLabels = target.reviewTargetType === "question_family" && isEnglish ? getRemediationLabels(target.id) : [];
  const markingBasis = FAMILY_MARKING_BASIS[target.id];

  const [reclassifiedQuestions, setReclassifiedQuestions] = useState<RepresentativeQuestion[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (sevenX) {
        // Educational Increment 007X, Founder Review-Surface Correction —
        // exact-ID-scoped, never the family-wide fetch: a family can
        // contain long-approved siblings alongside these newly authored
        // ones, and this view must show only the latter (plus, separately,
        // any reclassified-but-unchanged row).
        const [newQs, reclassifiedQs] = await Promise.all([
          fetchQuestionsByIds(sevenX.questionIds),
          sevenX.reclassified && sevenX.reclassified.length > 0
            ? fetchQuestionsByIds(sevenX.reclassified.map((r) => r.id))
            : Promise.resolve([]),
        ]);
        setQuestions(newQs);
        setReclassifiedQuestions(reclassifiedQs);
      } else if (target.reviewTargetType === "passage") {
        const [p, qs] = await Promise.all([fetchPassageDetail(target.id), fetchQuestionsForPassage(target.id)]);
        setPassage(p);
        setQuestions(qs);
      } else {
        setQuestions(await fetchRepresentativeQuestions(target.id));
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.id]);

  useEffect(() => {
    setSubmission((s) => ({ ...s, reviewer: reviewerName }));
  }, [reviewerName]);

  async function handleSubmit() {
    if (!submission.decision) {
      setSubmitError("Choose a decision before submitting: this is your judgement to make, not a default.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    // Educational Increment 007X, Founder Review-Surface Correction — the
    // resulting decision row's own notes are prefixed with the same
    // 007X batch marker fetchSevenXReviewStatus() looks for, so this
    // decision is itself correctly identifiable as covering only this
    // batch's question IDs, not the whole family, exactly like the
    // pending placeholder it resolves. Reuses submitReview() unchanged —
    // no second review system, no new review_type, no schema change.
    const submissionToSend = sevenX
      ? { ...submission, notes: `${sevenX.notesPrefix}\n\n${submission.notes}`.trim() }
      : submission;
    // CSSE Completion Programme Phase C, Part 13 — reviewType routes to a
    // distinct review_type on the same table (migration 060), never
    // conflated with a content_review row for the same family. Every
    // other field/validation/notes-building path is identical; only which
    // row is inserted differs.
    const { error } =
      reviewType === "english_teaching_review" ? await submitEnglishTeachingReview(submissionToSend)
      : reviewType === "mock_maths_independent_review" ? await submitMockMathsIndependentReview(submissionToSend)
      : reviewType === "mock_english_passage_independent_review" ? await submitMockEnglishPassageIndependentReview(submissionToSend)
      : reviewType === "mock_writing_prompt_independent_review" ? await submitMockWritingPromptIndependentReview(submissionToSend)
      : await submitReview(submissionToSend);
    setSubmitting(false);
    if (error) {
      setSubmitError(error);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
        <CheckCircle2 size={28} className="text-emerald-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {reviewType === "english_teaching_review" ? "Teaching review" : "Review"} recorded for {displayName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {reviewType === "mock_maths_independent_review" || reviewType === "mock_english_passage_independent_review" || reviewType === "mock_writing_prompt_independent_review"
            ? "Decision: " + submission.decision + ". This does not promote any question, passage, or prompt to independently_validated or mock_eligible, and does not activate any Mock form: those remain separate, controlled steps."
            : "Decision: " + submission.decision + ". This does not change Practice Eligibility, since that is a separate, controlled activation step."}
        </p>
        <button onClick={onDone} className="mt-4 text-sm font-semibold text-purple-600 dark:text-purple-400">
          Back to {reviewType === "english_teaching_review" ? "English Teaching Review" : "review pilot"}
        </button>
      </div>
    );
  }

  const easiest = questions[0];
  const hardest = questions.length > 1 ? questions[questions.length - 1] : undefined;
  const unusual = questions.find((q) => q.transferClass === "FAR_TRANSFER" && q !== easiest && q !== hardest);
  const otherExamples = questions.filter((q) => q !== easiest && q !== hardest && q !== unusual);

  return (
    <div className="space-y-5 max-w-full overflow-x-hidden">
      <button onClick={onDone} className="text-xs font-semibold text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
        <ArrowLeft size={13} /> Back to {reviewType === "english_teaching_review" ? "English Teaching Review" : "review pilot"}
      </button>

      <Card>
        <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
          {target.reviewTargetType === "passage" ? "Reading passage" : "Question family"}
        </p>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1 break-words">{displayName}</h1>
        <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-1 font-mono break-all">{target.id}</p>
      </Card>

      {sevenX && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Reviewing newly authored content only</p>
          <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">{sevenX.disclosure}</p>
          <p className="text-xs text-amber-800 dark:text-amber-300 mt-2 font-semibold">
            {sevenX.questionIds.length} new question{sevenX.questionIds.length === 1 ? "" : "s"} below require your review. Earlier siblings in this family are not part of this decision.
          </p>
        </div>
      )}

      {loading && <p className="text-sm text-gray-400 dark:text-gray-500">Loading content…</p>}

      {!loading && sevenX && reclassifiedQuestions.length > 0 && (
        <Card>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Reclassified, not new</p>
          {sevenX.reclassified?.map((r) => {
            const q = reclassifiedQuestions.find((rq) => rq.id === r.id);
            return (
              <div key={r.id} className="mt-2 border-t border-gray-100 dark:border-gray-800 pt-2 first:border-0 first:pt-0">
                <p className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">{r.id}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{r.note}</p>
                {q && <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{q.question}</p>}
              </div>
            );
          })}
        </Card>
      )}

      {!loading && educationalContext && (
        <Card>
          <SectionTitle letter="A" title="What this teaches" />
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{educationalContext.objective}</p>
          <div className="mt-4">
            <SectionTitle letter="B" title="Why it belongs in Angel 11+" />
            {educationalContext.confirmedFromEvidence ? (
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Confirmed from CSSE evidence</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-0.5">{educationalContext.confirmedFromEvidence}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Angel's original teaching content</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-0.5">{educationalContext.angelExtension}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">Evidence limitation</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-0.5">{educationalContext.evidenceLimitation}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{educationalContext.evidenceBasis}</p>
            )}
          </div>
          {markingBasis && markingBasis.length > 0 && (
            <div className="mt-4">
              <SectionTitle letter="D" title="Directly evidenced vs. inferred marking" />
              <div className="space-y-2">
                {markingBasis.map((m) => (
                  <div key={m.rule} className="flex items-start gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${
                      m.status === "directly-evidenced"
                        ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
                    }`}>
                      {m.status === "directly-evidenced" ? "EVIDENCED" : "INFERRED"}
                    </span>
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{m.rule}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{m.citation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {!loading && !passage && target.reviewTargetType === "question_family" && (
        <Card>
          <SectionTitle letter="C" title="How Angel teaches it" />
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">MODEL approach</p>
              {workedExample ? (
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                  <p><strong>Example:</strong> {workedExample.scenario}</p>
                  <p><strong>Reasoning shown:</strong> {workedExample.modelReasoning}</p>
                  <p><strong>A weaker answer:</strong> {workedExample.weakAnswerLooksLike}</p>
                  <p><strong>What improves it:</strong> {workedExample.whatImprovesIt}</p>
                </div>
              ) : isEnglish ? (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">No worked example has been authored yet for this family. This is a genuine gap, not hidden from you.</p>
              ) : (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Mathematics has no separate live worked-example component. Each question's own <code>workingSteps</code> array is shown as a step-by-step explanation after the learner submits an answer. See the sample questions below for real examples.</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Guided Practice approach</p>
              {isEnglish ? (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {guidedInstruction} {guidedScaffold && GUIDED_KIND_LABEL[guidedScaffold]}
                </p>
              ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Dedicated Guided Practice is not yet implemented for this Mathematics family. This is a genuine, project-wide gap disclosed in Educational Increment 007H, not specific to this family. Every currently practice-eligible Mathematics family has the same limitation.</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Independent approach</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                The learner attempts the question unaided. Where Angel can check the answer automatically, feedback is immediate. Where it cannot (a free-text explanation), the learner compares their own answer to a model answer themselves, and this is never counted as independently verified mastery.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Exam strategy</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{strategyHint ?? (isEnglish ? "No exam strategy tip has been authored yet for this family." : "No dedicated exam-strategy tip has been authored for Mathematics families yet.")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Wrong-answer remediation</p>
              {remediationLabels.length > 0 ? (
                <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1 list-disc list-inside">
                  {remediationLabels.map((l) => <li key={l}>{l}</li>)}
                </ul>
              ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">No specific remediation categories are defined for this family yet; the learner only sees the model answer.</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {!loading && reviewType === "english_teaching_review" && ENGLISH_TEACHING_REVIEW_METADATA[target.id] && (
        <Card>
          <SectionTitle letter="E" title="What Educational Increment 007O changed (Phase C)" />
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Remediation before this phase</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{ENGLISH_TEACHING_REVIEW_METADATA[target.id].remediationBeforePhaseC}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Now shown after a wrong answer, for the first time</p>
              {questions[0]?.addressesMisconception ? (
                <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 rounded-xl p-3 mt-1">
                  <p className="font-semibold">A common mistake with this kind of question:</p>
                  <p className="mt-1">{questions[0].addressesMisconception}</p>
                  <p className="text-[10px] text-blue-400 dark:text-blue-500 mt-2">Real text from a representative question in this family, shown exactly as a learner would see it (not a description of it).</p>
                </div>
              ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">No addresses_misconception text found on the representative question sampled. Check other questions in this family.</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Transfer / passage-diversity note</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{ENGLISH_TEACHING_REVIEW_METADATA[target.id].transferNote}</p>
            </div>
            {ENGLISH_TEACHING_REVIEW_METADATA[target.id].knownGap && (
              <div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Known gap, disclosed not hidden</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{ENGLISH_TEACHING_REVIEW_METADATA[target.id].knownGap}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {!loading && passage && (
        <Card>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{passage.title}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {passage.wordCount} words, {passage.readingComplexity} reading demand, {passage.genre.replace(/-/g, " ")}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 whitespace-pre-line leading-relaxed max-h-96 overflow-y-auto break-words">
            {passage.originalText}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">{passage.copyrightStatus}. Provenance: {passage.provenance}.</p>
        </Card>
      )}

      {!loading && questions.length > 0 && (
        <Card>
          <SectionTitle letter="D" title="Questions to review" />
          {sevenX || target.reviewTargetType === "passage" ? (
            // Decision 152, Review-Surface Grouping Correction — this is a
            // bounded, exact-scoped question set (a sevenX batch, or a
            // passage's complete attached set), never a large ordinary
            // family with many long-approved siblings, so every question
            // is shown, in full, in its natural order — never sampled down
            // to "easiest/hardest/unusual" examples with the rest hidden
            // behind a collapsed toggle. A grouped numbered question
            // (question_group_id set) is rendered as ONE coherent unit
            // with its subparts together, never as unrelated flat rows.
            <div className="space-y-4">
              {groupQuestionsForReview(questions).map((group) => (
                <div key={group.key} className="border-t border-gray-50 dark:border-gray-800 pt-3 first:border-t-0 first:pt-0">
                  {group.items.length > 1 && (
                    <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">
                      One numbered question: {group.items.length} subparts, reviewed together
                    </p>
                  )}
                  <div className={group.items.length > 1 ? "space-y-3 pl-3 border-l-2 border-indigo-100 dark:border-indigo-900" : ""}>
                    {group.items.map((question) => (
                      <div key={question.id}>
                        {question.subpartLabel && (
                          <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                            Subpart {question.subpartLabel}
                            {question.markingMode ? ` · marking: ${question.markingMode.replace(/_/g, " ")}` : ""}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">{question.question}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"><strong>Model answer ({question.contentDifficulty} difficulty):</strong> {question.modelAnswer}</p>
                        {question.addressesMisconception && (
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1"><strong>Common trap:</strong> {question.addressesMisconception}</p>
                        )}
                        {question.transferClass && (
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Transfer demand: {question.transferClass.replace(/_/g, " ").toLowerCase()}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {[
                ["Representative example", easiest && questions.length === 1 ? easiest : questions[Math.floor(questions.length / 2)]],
                ["Easiest example", easiest],
                ["Hardest example", hardest],
                ["Unusual / transfer example", unusual],
              ].filter(([, q]) => q).map(([label, q]) => {
                const question = q as RepresentativeQuestion;
                return (
                  <div key={`${label}-${question.id}`} className="border-t border-gray-50 dark:border-gray-800 pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0">
                    <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">{label as string}</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">{question.question}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"><strong>Model answer ({question.contentDifficulty} difficulty):</strong> {question.modelAnswer}</p>
                    {question.addressesMisconception && (
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1"><strong>Common trap:</strong> {question.addressesMisconception}</p>
                    )}
                    {question.transferClass && (
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Transfer demand: {question.transferClass.replace(/_/g, " ").toLowerCase()}</p>
                    )}
                  </div>
                );
              })}
              {otherExamples.length > 0 && (
                <details className="mt-3">
                  <summary className="text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer">{otherExamples.length} more example(s)</summary>
                  <div className="space-y-3 mt-2">
                    {otherExamples.map((q) => (
                      <div key={q.id} className="border-t border-gray-50 dark:border-gray-800 pt-3">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{q.question}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"><strong>Model answer ({q.contentDifficulty}):</strong> {q.modelAnswer}</p>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </>
          )}
        </Card>
      )}

      {!loading && questions.length === 0 && !passage && (
        <p className="text-sm text-amber-600 dark:text-amber-400">No content found for this target: nothing to review yet.</p>
      )}

      {!loading && (questions.length > 0 || passage) && (
        <Card>
          <SectionTitle letter="E" title="Automated checks" />
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            {passage
              ? "This passage and every question attached to it have been mechanically checked for internal consistency: no duplicate questions, every required quotation appears verbatim in the passage text, and each question's declared marking method matches the shape of its actual answer data."
              : "Every question in this family has been mechanically checked: no duplicate questions, verbatim quotation checks where the family requires a quotation, and each question's declared marking method matches the shape of its actual answer data."}
          </p>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-2">
            These are mechanical checks, not an educational judgement. That is what your review below provides.
          </p>
        </Card>
      )}

      <Card>
        <SectionTitle letter="F" title="Your judgement" />

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Your name (required, a review cannot be recorded anonymously)</label>
            <input
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="Your full name"
              className="w-full mt-1 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Your basis for reviewing this (required)
            </label>
            <input
              value={submission.qualificationBasis}
              onChange={(e) => setSubmission((s) => ({ ...s, qualificationBasis: e.target.value }))}
              placeholder="e.g. teaching experience, subject knowledge, 11+ preparation experience"
              className="w-full mt-1 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5"
            />
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
              Record your own real basis for judging this content. This is recorded with your review.
            </p>
          </div>

          <div className="space-y-2">
            {REVIEW_CRITERIA.map(({ key, question }) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <span className="text-xs text-gray-600 dark:text-gray-400">{question}</span>
                <TriState
                  value={submission[key] as boolean | null}
                  onChange={(v) => setSubmission((s) => ({ ...s, [key]: v }))}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Findings / notes {submission.decision === "rejected" && "(required for a rejection)"}
            </label>
            <textarea
              value={submission.notes}
              onChange={(e) => setSubmission((s) => ({ ...s, notes: e.target.value }))}
              rows={4}
              className="w-full mt-1 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5"
              placeholder="What you checked, what you found, any amendment needed…"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Your decision (required, choose one)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {DECISIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setSubmission((s) => ({ ...s, decision: d.value }))}
                  className={`text-left p-3 rounded-xl border transition-colors ${
                    submission.decision === d.value
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <p className="text-xs font-semibold">{d.label}</p>
                  <p className={`text-[11px] mt-0.5 ${submission.decision === d.value ? "text-purple-100" : "text-gray-400 dark:text-gray-500"}`}>{d.hint}</p>
                </button>
              ))}
            </div>
          </div>

          {submitError && <p className="text-xs text-red-500">{submitError}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting || !reviewerName.trim() || !submission.qualificationBasis.trim()}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            {submitting ? "Submitting…" : (<>Submit {reviewType === "english_teaching_review" ? "teaching " : ""}review <ArrowRight size={16} /></>)}
          </button>

          {reviewType === "english_teaching_review" && (
            <p className="text-[10px] text-gray-300 dark:text-gray-600">Reviewing teaching-content version: {ENGLISH_TEACHING_CONTENT_VERSION}</p>
          )}
        </div>
      </Card>
    </div>
  );
}

// ─── Mathematics Teaching Review — CSSE Completion Programme Phase B ───────
// A distinct review experience from ReviewForm above: it judges the
// MODEL/Guided-practice/Remediation TEACHING layer Educational Increment
// 007M added (Decision 62), not the underlying question content itself
// (that's what the batches above already judged, for the 12 of these 22
// families that happen to also appear in Batch 2/3/4 — a different,
// earlier evidence trail, never conflated with this one; see
// lib/adminReview.ts's review_type docstring). Reuses this same page's
// existing Card/SectionTitle/TriState/DECISIONS building blocks and the
// existing authenticated /admin-beta/review architecture — no parallel
// review system.

function emptyMathsTeachingSubmission(targetId: string): MathsTeachingReviewSubmission {
  return {
    targetId, reviewer: "", qualificationBasis: "", decision: null, notes: "",
    mathematicallyCorrect: null, modelUnderstandable: null, modelTeachesMethod: null,
    guidedPracticeBalanced: null, supportReducedAppropriately: null, remediationUseful: null,
    languageAgeAppropriate: null, teachingRelevantToSkill: null, exampleAvoidsAnswerLeakage: null,
    conceptualExplanationSufficient: null, independentExpectationAppropriate: null, clearAndUnambiguous: null,
  };
}

function MathsTeachingReviewForm({ familyId, onDone }: { familyId: string; onDone: () => void }) {
  const [submission, setSubmission] = useState<MathsTeachingReviewSubmission>(() => emptyMathsTeachingSubmission(familyId));
  const [questions, setQuestions] = useState<RepresentativeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const displayName = FAMILY_DISPLAY_NAME[familyId] ?? formatFallbackName(familyId);
  const teachingContent = getMathsTeachingContent(familyId);
  const metadata = MATHS_TEACHING_REVIEW_METADATA[familyId];
  const educationalContext = FAMILY_EDUCATIONAL_CONTEXT[familyId];
  const misconceptionLabel = teachingContent ? MATHS_MISCONCEPTION_CATEGORY_LABEL[teachingContent.misconceptionCategory] : undefined;

  useEffect(() => {
    (async () => {
      setLoading(true);
      setQuestions(await fetchRepresentativeQuestions(familyId, 50));
      setLoading(false);
    })();
  }, [familyId]);

  async function handleSubmit() {
    if (!submission.decision) {
      setSubmitError("Choose a decision before submitting: this is your judgement to make, not a default.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    const { error } = await submitMathsTeachingReview(submission);
    setSubmitting(false);
    if (error) { setSubmitError(error); return; }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
        <CheckCircle2 size={28} className="text-emerald-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Teaching review recorded for {displayName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Decision: {submission.decision}. This is a separate evidence record from any earlier content review of this family, and does not change Practice Eligibility.
        </p>
        <button onClick={onDone} className="mt-4 text-sm font-semibold text-purple-600 dark:text-purple-400">Back to Mathematics Teaching Review</button>
      </div>
    );
  }

  const representative = questions.length > 0 ? questions[Math.floor(questions.length / 2)] : undefined;

  return (
    <div className="space-y-5 max-w-full overflow-x-hidden">
      <button onClick={onDone} className="text-xs font-semibold text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
        <ArrowLeft size={13} /> Back to Mathematics Teaching Review
      </button>

      <Card>
        <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Mathematics Teaching Review</p>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1 break-words">{displayName}</h1>
        <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-1 font-mono break-all">{familyId}</p>
        {metadata && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{metadata.competency} · {metadata.questionType}</p>
        )}
      </Card>

      {loading && <p className="text-sm text-gray-400 dark:text-gray-500">Loading content…</p>}

      {!loading && educationalContext && (
        <Card>
          <SectionTitle letter="A" title="What the child is learning" />
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{educationalContext.objective}</p>
          <div className="mt-4">
            <SectionTitle letter="B" title="Why this matters for CSSE preparation" />
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{educationalContext.evidenceBasis}</p>
          </div>
        </Card>
      )}

      {!loading && representative && (
        <Card>
          <SectionTitle letter="C" title="Representative real question" />
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{representative.question}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"><strong>Correct answer ({representative.contentDifficulty} difficulty):</strong> {representative.modelAnswer}</p>
        </Card>
      )}

      {!loading && teachingContent && (
        <Card>
          <SectionTitle letter="D" title="MODEL example and explanation" />
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5">
            <p><strong>What to notice: </strong>{teachingContent.model.whatToNotice}</p>
            <p><strong>The rule: </strong>{teachingContent.model.relationship}</p>
            <p><strong>Worked example (never the live question&apos;s own numbers): </strong>{teachingContent.model.scenario}</p>
            <ul className="list-disc list-inside space-y-0.5">
              {teachingContent.model.reasoning.map((step, i) => <li key={i}>{step}</li>)}
            </ul>
            <p><strong>Answer: </strong>{teachingContent.model.answer}</p>
            <p><strong>Check it: </strong>{teachingContent.model.verification}</p>
          </div>
        </Card>
      )}

      {!loading && teachingContent && (
        <MathsGuidedPracticeSummary teachingContent={teachingContent} representative={representative} />
      )}

      <Card>
        <SectionTitle letter="F" title="Wrong-answer remediation and common misconception" />
        {teachingContent && misconceptionLabel ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Remediation category: </strong>{misconceptionLabel}</p>
            {representative?.addressesMisconception && (
              <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Common misconception addressed: </strong>{representative.addressesMisconception}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-amber-600 dark:text-amber-400">No remediation content found for this family. This would be a genuine gap, not expected for any of the 22 Phase B families.</p>
        )}
      </Card>

      <Card>
        <SectionTitle letter="G" title="Independent Practice expectation" />
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          The learner attempts the question unaided (no MODEL, no Guided step reveal). Angel checks the answer automatically and gives immediate feedback. Independent success is the only kind of attempt that can move mastery evidence forward.
        </p>
      </Card>

      {metadata && (
        <Card>
          <SectionTitle letter="H" title="Transfer classification and known limitation" />
          <p className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${metadata.transferClassification === "TRANSFER-SUFFICIENT" ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300" : "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"}`}>
            {metadata.transferClassification}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">{metadata.transferNote}</p>
          {metadata.knownLimitation && (
            <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed mt-2"><strong>Known limitation: </strong>{metadata.knownLimitation}</p>
          )}
        </Card>
      )}

      <Card>
        <SectionTitle letter="I" title="Mastery protection" />
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          A supported (Guided or otherwise assisted) success can never, by itself, establish independently-verified mastery or advance the learner&apos;s mastery streak. Only a later, genuinely independent correct attempt can do that, unchanged and re-proven, not modified, by this phase (Decision 62).
        </p>
      </Card>

      <Card>
        <SectionTitle letter="J" title="Your judgement" />
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Your name (required, a review cannot be recorded anonymously)</label>
            <input
              value={submission.reviewer}
              onChange={(e) => setSubmission((s) => ({ ...s, reviewer: e.target.value }))}
              placeholder="Your full name"
              className="w-full mt-1 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Your basis for reviewing this (required)</label>
            <input
              value={submission.qualificationBasis}
              onChange={(e) => setSubmission((s) => ({ ...s, qualificationBasis: e.target.value }))}
              placeholder="Founder and parent with direct experience of preparing children for the Essex CSSE 11+, including previous use of 11+ tuition, practice materials and mock examinations."
              className="w-full mt-1 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5"
            />
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
              This is only suggested wording, shown as a placeholder: nothing is pre-filled. Enter or confirm your own real basis; it is recorded with your review.
            </p>
          </div>

          <div className="space-y-2">
            {MATHS_TEACHING_REVIEW_CRITERIA.map(({ key, question }) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <span className="text-xs text-gray-600 dark:text-gray-400">{question}</span>
                <TriState
                  value={submission[key] as boolean | null}
                  onChange={(v) => setSubmission((s) => ({ ...s, [key]: v }))}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Findings / notes {submission.decision === "rejected" && "(required for a rejection)"}
            </label>
            <textarea
              value={submission.notes}
              onChange={(e) => setSubmission((s) => ({ ...s, notes: e.target.value }))}
              rows={4}
              className="w-full mt-1 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5"
              placeholder="What you checked, what you found, any amendment needed…"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Your decision (required, choose one)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {DECISIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setSubmission((s) => ({ ...s, decision: d.value }))}
                  className={`text-left p-3 rounded-xl border transition-colors ${
                    submission.decision === d.value
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <p className="text-xs font-semibold">{d.label}</p>
                  <p className={`text-[11px] mt-0.5 ${submission.decision === d.value ? "text-purple-100" : "text-gray-400 dark:text-gray-500"}`}>{d.hint}</p>
                </button>
              ))}
            </div>
          </div>

          {submitError && <p className="text-xs text-red-500">{submitError}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting || !submission.reviewer.trim() || !submission.qualificationBasis.trim()}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            {submitting ? "Submitting…" : (<>Submit teaching review <ArrowRight size={16} /></>)}
          </button>

          <p className="text-[10px] text-gray-300 dark:text-gray-600">Reviewing teaching-content version: {MATHS_TEACHING_CONTENT_VERSION}</p>
        </div>
      </Card>
    </div>
  );
}

/** Section E — Guided Practice sequence and its maximum reveal boundary, computed from the representative question's own real, live workingSteps (the same field the real Practice pathway reads from ali_question_bank.prompt — never a second, hand-maintained copy) via the exact same effectiveGuidedRevealStepCount rule that pathway applies. */
function MathsGuidedPracticeSummary({ teachingContent, representative }: {
  teachingContent: NonNullable<ReturnType<typeof getMathsTeachingContent>>;
  representative?: RepresentativeQuestion;
}) {
  const cap = teachingContent.maxGuidedRevealSteps;
  const workingSteps = representative?.workingSteps ?? null;
  const realStepCount = workingSteps?.length ?? 0;
  const effectiveStepCount = effectiveGuidedRevealStepCount(realStepCount, cap);

  return (
    <Card>
      <SectionTitle letter="E" title="Guided Practice sequence and maximum reveal boundary" />
      {workingSteps && workingSteps.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-700 dark:text-gray-300">A representative question&apos;s real, stored working steps (the same steps Guided Practice progressively reveals, never a second, separately-authored copy):</p>
          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
            {workingSteps.map((s, i) => (
              <li key={i} className={i >= effectiveStepCount ? "text-gray-400 dark:text-gray-600" : undefined}>
                {s}{i >= effectiveStepCount && " (capped, never revealed pre-submission)"}
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Maximum Guided reveal boundary: <strong>{effectiveStepCount} of {realStepCount}</strong> real steps
            {cap !== undefined && cap < realStepCount && " (capped by design, see Known limitation below)"}
            {effectiveStepCount === 0 && ". No Guided reveal control renders for this family."}
          </p>
        </div>
      ) : (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          This family&apos;s live rows have no stored working steps. Guided step reveal is architecturally absent (0 of 0), not a design choice. Confirmed by direct query, not assumed.
        </p>
      )}
    </Card>
  );
}

// ─── Continuous Writing Teaching Review — CSSE Completion Programme
// Phase D. Unlike Maths/English Teaching Review, this has no live DB
// question to fetch (the bounded proof deliberately did not author new
// content, ANGEL_PHASE_D_CONTINUOUS_WRITING_STANDARD_V1.md Part 10) —
// the review pack presents the MODEL/planning/rubric design directly,
// not a live representative question.

function WritingTeachingReviewForm({ familyId, onDone }: { familyId: string; onDone: () => void }) {
  const [submission, setSubmission] = useState<ReviewSubmission>(() => emptySubmission({ id: familyId, reviewTargetType: "question_family", notes: null }, ""));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const displayName = FAMILY_DISPLAY_NAME[familyId] ?? formatFallbackName(familyId);
  const teachingContent = getWritingTeachingContent(familyId as "writing-reflective-discursive");

  async function handleSubmit() {
    if (!submission.decision) {
      setSubmitError("Choose a decision before submitting: this is your judgement to make, not a default.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    const { error } = await submitWritingTeachingReview(submission);
    setSubmitting(false);
    if (error) { setSubmitError(error); return; }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
        <CheckCircle2 size={28} className="text-emerald-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Teaching review recorded for {displayName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Decision: {submission.decision}. This is a design/proof review, not a content-eligibility decision: no Writing content is Practice Eligible or Mock Eligible as a result.
        </p>
        <button onClick={onDone} className="mt-4 text-sm font-semibold text-purple-600 dark:text-purple-400">Back to Continuous Writing Teaching Review</button>
      </div>
    );
  }

  if (!teachingContent) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
        <p className="text-sm text-amber-600 dark:text-amber-400">No teaching content found for {familyId}.</p>
        <button onClick={onDone} className="mt-4 text-sm font-semibold text-purple-600 dark:text-purple-400">Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-full overflow-x-hidden">
      <button onClick={onDone} className="text-xs font-semibold text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
        <ArrowLeft size={13} /> Back to Continuous Writing Teaching Review
      </button>

      <Card>
        <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Continuous Writing Teaching Review</p>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1 break-words">{displayName}</h1>
        <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-1 font-mono break-all">{familyId}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">CSSE Continuous Writing, Question 1 pattern (reflective/discursive). No live DB question exists for this family yet, so this reviews the design and bounded-proof code directly, per Phase D&apos;s own bounded-scope instruction not to author new content merely to populate a review pack.</p>
      </Card>

      <Card>
        <SectionTitle letter="A" title="MODEL example" />
        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5">
          <p><strong>What to notice: </strong>{teachingContent.model.whatToNotice}</p>
          <p><strong>Approach: </strong>{teachingContent.model.approach}</p>
          <p><strong>Worked example topic (never the live prompt): </strong>{teachingContent.model.topic}</p>
          <p><strong>Worked opening: </strong>{teachingContent.model.workedOpening}</p>
          <ul className="list-disc list-inside space-y-0.5">
            {teachingContent.model.reasoning.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      </Card>

      <Card>
        <SectionTitle letter="B" title="Planning scaffold" />
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
          {teachingContent.planningScaffold.map((q) => (
            <li key={q.question}>
              <p className="font-semibold">{q.question}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{q.purpose}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <SectionTitle letter="C" title="Common misconception this family teaches against" />
        <p className="text-sm text-gray-700 dark:text-gray-300">{teachingContent.commonMisconception}</p>
      </Card>

      <Card>
        <SectionTitle letter="D" title="CSSE-evidenced assessment rubric (Ideas / Vocabulary / Grammar / Structure / Punctuation)" />
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          Every response is judged against exactly these five dimensions, sourced from the official CSSE Continuous Writing sample mark scheme (still the current, live-linked document, confirmed 2026-08-17, ANGEL_PHASE_D_CONTINUOUS_WRITING_STANDARD_V1.md Part 2), never an invented craft-quality list. Each dimension gets a qualitative level (developing/secure/strong, matching the official rubric&apos;s own banded language, never a fabricated numeric sub-score) and a comment referencing the student&apos;s own words.
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-0.5">
          {WRITING_DIMENSIONS.map((d) => <li key={d}>{WRITING_DIMENSION_LABEL[d]}</li>)}
        </ul>
      </Card>

      <Card>
        <SectionTitle letter="E" title="Confidence gate and safety design" />
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          Before any AI call, a deterministic pre-flight check (length against the real CSSE-evidenced six-sentence minimum, off-topic and template/copy detection, prompt-injection marker detection) computes a confidence verdict. When confidence is low, every dimension is forced to &quot;not confident&quot; in code, regardless of what the model itself claims, verified live via scripts/writing-rubric-calibration.mjs, including a real prompt-injection attempt that the model did not comply with. The Angel-internal progress indicator (a labelled, non-CSSE score) is always computed deterministically from the five dimension levels, never trusted directly from the model: a real defect found in live calibration (the model was observed to omit its own score) is fixed by this design, not merely worked around.
        </p>
      </Card>

      <Card>
        <SectionTitle letter="F" title="Mastery protection" />
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          Every AI-scored Writing attempt is recorded with supportTier &quot;supported&quot;, unconditionally, regardless of confidence or score (Decision 60&apos;s quarantine, unmodified by this phase). No Writing evidence in this codebase can independently establish mastery.
        </p>
      </Card>

      <Card>
        <SectionTitle letter="G" title="Your judgement" />
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Your name (required, a review cannot be recorded anonymously)</label>
            <input
              value={submission.reviewer}
              onChange={(e) => setSubmission((s) => ({ ...s, reviewer: e.target.value }))}
              placeholder="Your full name"
              className="w-full mt-1 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Your basis for reviewing this (required)</label>
            <input
              value={submission.qualificationBasis}
              onChange={(e) => setSubmission((s) => ({ ...s, qualificationBasis: e.target.value }))}
              placeholder="Founder and parent with direct experience of preparing children for the Essex CSSE 11+, including previous use of 11+ tuition, practice materials and mock examinations."
              className="w-full mt-1 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5"
            />
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
              This is only suggested wording, shown as a placeholder: nothing is pre-filled. Enter or confirm your own real basis; it is recorded with your review.
            </p>
          </div>

          <div className="space-y-2">
            {REVIEW_CRITERIA.map(({ key, question }) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <span className="text-xs text-gray-600 dark:text-gray-400">{question}</span>
                <TriState
                  value={submission[key] as boolean | null}
                  onChange={(v) => setSubmission((s) => ({ ...s, [key]: v }))}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Findings / notes {submission.decision === "rejected" && "(required for a rejection)"}
            </label>
            <textarea
              value={submission.notes}
              onChange={(e) => setSubmission((s) => ({ ...s, notes: e.target.value }))}
              rows={4}
              className="w-full mt-1 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5"
              placeholder="What you checked, what you found, any amendment needed…"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Your decision (required, choose one)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {DECISIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setSubmission((s) => ({ ...s, decision: d.value }))}
                  className={`text-left p-3 rounded-xl border transition-colors ${
                    submission.decision === d.value
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <p className="text-xs font-semibold">{d.label}</p>
                  <p className={`text-[11px] mt-0.5 ${submission.decision === d.value ? "text-purple-100" : "text-gray-400 dark:text-gray-500"}`}>{d.hint}</p>
                </button>
              ))}
            </div>
          </div>

          {submitError && <p className="text-xs text-red-500">{submitError}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting || !submission.reviewer.trim() || !submission.qualificationBasis.trim()}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            {submitting ? "Submitting…" : (<>Submit teaching review <ArrowRight size={16} /></>)}
          </button>

          <p className="text-[10px] text-gray-300 dark:text-gray-600">Reviewing teaching-content version: {WRITING_TEACHING_CONTENT_VERSION}</p>
        </div>
      </Card>
    </div>
  );
}

function WritingTeachingSection({ reviewedIds, onOpen }: { reviewedIds: Set<string>; onOpen: (familyId: string) => void }) {
  const reviewedCount = WRITING_TEACHING_REVIEW_TARGET_IDS.filter((id) => reviewedIds.has(id)).length;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-rose-200 dark:border-rose-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-rose-100 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40">
        <p className="text-sm font-bold text-rose-900 dark:text-rose-200">Continuous Writing Teaching Review</p>
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">{reviewedCount} of {WRITING_TEACHING_REVIEW_TARGET_IDS.length} reviewed</p>
        <p className="text-[11px] text-rose-500 dark:text-rose-500 mt-1.5 leading-relaxed">
          Judges the CSSE Completion Programme Phase D bounded proof: MODEL, planning scaffold, and CSSE-evidenced rubric for the reflective/discursive task family. No new Writing content was authored or activated by this phase.
        </p>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {WRITING_TEACHING_REVIEW_TARGET_IDS.map((id) => (
          <TeachingTargetCard key={id} familyId={id} subtitle="CSSE Continuous Writing, Question 1 pattern" reviewed={reviewedIds.has(id)} onOpen={() => onOpen(id)} />
        ))}
      </div>
    </div>
  );
}

// ─── List views: pilot summary cards + collapsed full backlog ──────────────

function TargetCard({ target, onOpen }: { target: PendingReviewTarget; onOpen: () => void }) {
  const [summary, setSummary] = useState<TargetSummary | null>(null);
  const displayName = FAMILY_DISPLAY_NAME[target.id] ?? formatFallbackName(target.id);

  useEffect(() => {
    (async () => {
      const reviewed = (await fetchReviewedTargetIds()).has(target.id);
      setSummary(await fetchTargetSummary(target, reviewed));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.id]);

  return (
    <button
      onClick={onOpen}
      className="w-full text-left px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{displayName}</p>
          {summary && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {summary.subject === "maths" ? "Mathematics" : "English"}
              {target.reviewTargetType === "passage" ? " passage" : " question family"}
              {summary.questionCount > 0 && ` · ${summary.questionCount} question${summary.questionCount === 1 ? "" : "s"}`}
              {summary.difficultyRange !== "unknown" && ` · ${summary.difficultyRange} difficulty`}
            </p>
          )}
          {summary?.reviewed && (
            <span className="inline-block mt-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              Reviewed
            </span>
          )}
        </div>
        <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0 mt-1" />
      </div>
    </button>
  );
}

function PilotSection({ targets, reviewedIds, onOpen }: { targets: PendingReviewTarget[]; reviewedIds: Set<string>; onOpen: (t: PendingReviewTarget) => void }) {
  const pilotTargets = PILOT_TARGET_IDS
    .map((id) => targets.find((t) => t.id === id))
    .filter((t): t is PendingReviewTarget => Boolean(t));
  const reviewedCount = PILOT_TARGET_IDS.filter((id) => reviewedIds.has(id)).length;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-purple-200 dark:border-purple-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-purple-100 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/40">
        <p className="text-sm font-bold text-purple-900 dark:text-purple-200">First Educational Review Pilot</p>
        <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">{reviewedCount} of {PILOT_TARGET_IDS.length} reviewed</p>
      </div>
      {pilotTargets.length === 0 ? (
        <p className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">
          None of the 7 pilot targets are visible yet. Confirm migrations 047/050/052/053/054 are applied.
        </p>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {pilotTargets.map((t) => <TargetCard key={t.id} target={t} onOpen={() => onOpen(t)} />)}
        </div>
      )}
    </div>
  );
}

function Batch2Section({ targets, reviewedIds, onOpen }: { targets: PendingReviewTarget[]; reviewedIds: Set<string>; onOpen: (t: PendingReviewTarget) => void }) {
  const batch2Targets = BATCH2_TARGET_IDS
    .map((id) => targets.find((t) => t.id === id))
    .filter((t): t is PendingReviewTarget => Boolean(t));
  const reviewedCount = BATCH2_TARGET_IDS.filter((id) => reviewedIds.has(id)).length;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-sky-200 dark:border-sky-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-sky-100 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/40">
        <p className="text-sm font-bold text-sky-900 dark:text-sky-200">Controlled Review Batch 2</p>
        <p className="text-xs text-sky-600 dark:text-sky-400 mt-0.5">{reviewedCount} of {BATCH2_TARGET_IDS.length} reviewed</p>
      </div>
      {batch2Targets.length === 0 ? (
        <p className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">
          None of the 6 Batch 2 targets are visible yet. See ANGEL_007H_BATCH2_SELECTION_V1.md.
        </p>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {batch2Targets.map((t) => <TargetCard key={t.id} target={t} onOpen={() => onOpen(t)} />)}
        </div>
      )}
    </div>
  );
}

function Batch3Section({ targets, reviewedIds, onOpen }: { targets: PendingReviewTarget[]; reviewedIds: Set<string>; onOpen: (t: PendingReviewTarget) => void }) {
  const batch3Targets = BATCH3_TARGET_IDS
    .map((id) => targets.find((t) => t.id === id))
    .filter((t): t is PendingReviewTarget => Boolean(t));
  const reviewedCount = BATCH3_TARGET_IDS.filter((id) => reviewedIds.has(id)).length;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-amber-200 dark:border-amber-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-amber-100 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40">
        <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Controlled Review Batch 3</p>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{reviewedCount} of {BATCH3_TARGET_IDS.length} reviewed</p>
      </div>
      {batch3Targets.length === 0 ? (
        <p className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">
          None of the 7 Batch 3 targets are visible yet. See ANGEL_007I_BATCH3_SELECTION_V1.md.
        </p>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {batch3Targets.map((t) => <TargetCard key={t.id} target={t} onOpen={() => onOpen(t)} />)}
        </div>
      )}
    </div>
  );
}

function Batch4Section({ targets, reviewedIds, onOpen }: { targets: PendingReviewTarget[]; reviewedIds: Set<string>; onOpen: (t: PendingReviewTarget) => void }) {
  const batch4Targets = BATCH4_TARGET_IDS
    .map((id) => targets.find((t) => t.id === id))
    .filter((t): t is PendingReviewTarget => Boolean(t));
  const reviewedCount = BATCH4_TARGET_IDS.filter((id) => reviewedIds.has(id)).length;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-emerald-100 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40">
        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Controlled Review Batch 4</p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">{reviewedCount} of {BATCH4_TARGET_IDS.length} reviewed</p>
      </div>
      {batch4Targets.length === 0 ? (
        <p className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">
          None of the 9 Batch 4 targets are visible yet. See ANGEL_007K_MATHEMATICS_DEPTH_AND_BATCH4_READINESS_V1.md.
        </p>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {batch4Targets.map((t) => <TargetCard key={t.id} target={t} onOpen={() => onOpen(t)} />)}
        </div>
      )}
    </div>
  );
}

/** One named sub-group within SevenTSection (Mathematics, English Effect of Language, or Passages) — a thin wrapper around the same TargetCard every other section uses, never a new evidence source. */
function SevenTSubGroup({ heading, ids, targets, onOpen }: { heading: string; ids: string[]; targets: PendingReviewTarget[]; onOpen: (t: PendingReviewTarget) => void }) {
  const found = ids.map((id) => targets.find((t) => t.id === id)).filter((t): t is PendingReviewTarget => Boolean(t));
  return (
    <div>
      <p className="px-5 pt-3 pb-1 text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide">{heading}</p>
      {found.length === 0 ? (
        <p className="px-5 pb-3 text-sm text-gray-400 dark:text-gray-500">
          None of the {ids.length} targets are visible yet. Confirm migration 064 has been applied.
        </p>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {found.map((t) => <TargetCard key={t.id} target={t} onOpen={() => onOpen(t)} />)}
        </div>
      )}
    </div>
  );
}

/**
 * Educational Increment 007T Content Review — the first controlled
 * content batch (Decision 69), independently verified against live
 * production (Decision 70). 6 question families (4 Mathematics, 2
 * English Effect-of-Language) and 5 newly commissioned English passages,
 * shown as three clearly separated named sub-groups per the Founder's
 * explicit instruction, reusing the exact same TargetCard/ReviewForm
 * evidence path every other section on this page already uses — no new
 * review mechanism.
 */
function SevenTSection({ targets, reviewedIds, onOpen }: { targets: PendingReviewTarget[]; reviewedIds: Set<string>; onOpen: (t: PendingReviewTarget) => void }) {
  const reviewedCount = SEVEN_T_TARGET_IDS.filter((id) => reviewedIds.has(id)).length;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-teal-200 dark:border-teal-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-teal-100 dark:border-teal-900 bg-teal-50 dark:bg-teal-950/40">
        <p className="text-sm font-bold text-teal-900 dark:text-teal-200">007T Content Review</p>
        <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">{reviewedCount} of {SEVEN_T_TARGET_IDS.length} reviewed</p>
        <div className="mt-2 text-xs text-teal-800 dark:text-teal-300 space-y-0.5">
          <p>• All 34 questions in this batch remain PROVISIONAL. Reviewing a family does not activate it.</p>
          <p>• Mathematics: Practice content is review-ready, but dedicated MODEL/Guided teaching content has NOT YET been authored for these 4 families.</p>
          <p>• English: uses the new Effect-of-Language families (QT-RC-10), distinct from the 9 existing named English families.</p>
          <p>• Passage review is separate from question-family review. The 5 passages below are their own review target.</p>
          <p>• No Mock content is involved anywhere in this batch.</p>
        </div>
      </div>
      <SevenTSubGroup heading="Mathematics" ids={SEVEN_T_MATHS_TARGET_IDS} targets={targets} onOpen={onOpen} />
      <SevenTSubGroup heading="English Effect of Language" ids={SEVEN_T_ENGLISH_TARGET_IDS} targets={targets} onOpen={onOpen} />
      <SevenTSubGroup heading="Passages" ids={SEVEN_T_PASSAGE_TARGET_IDS} targets={targets} onOpen={onOpen} />
    </div>
  );
}

/**
 * Educational Increment 007X, Founder Review-Surface Correction — a
 * dedicated section for the 14 newly authored Mathematics questions,
 * built because all 4 target families already carry historical review
 * decisions a family-level "Reviewed" boolean cannot distinguish from
 * approval of this new content (Decision 79). `sevenXStatus` (from
 * fetchSevenXReviewStatus, batch-marker-scoped) drives the reviewed
 * badge here, never the shared family-level `reviewedIds` every other
 * section uses. Each card opens a ReviewForm scoped to exactly that
 * family's new question IDs (ReviewForm's own `sevenX` prop), never the
 * family's full sibling set.
 */
function SevenXSection({
  targets, sevenXStatus, onOpen,
}: {
  targets: PendingReviewTarget[];
  sevenXStatus: Map<string, SevenXReviewStatus>;
  onOpen: (t: PendingReviewTarget, sevenX: SevenXFamilyConfig) => void;
}) {
  const reviewedCount = SEVEN_X_FAMILIES.filter((f) => sevenXStatus.get(f.familyId)?.reviewed).length;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-amber-200 dark:border-amber-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-amber-100 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40">
        <p className="text-sm font-bold text-amber-900 dark:text-amber-200">007X Mathematics Content Review</p>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{reviewedCount} of {SEVEN_X_FAMILIES.length} families reviewed. 14 new questions total.</p>
        <div className="mt-2 text-xs text-amber-800 dark:text-amber-300 space-y-0.5">
          <p>• All 14 new questions remain PROVISIONAL. Reviewing a family does not activate it.</p>
          <p>• Every family below already has an earlier approval for its ORIGINAL siblings. That earlier approval does not cover the new questions shown here.</p>
          <p>• mr05-number-property-search remains classified TRANSFER-UNSAFE; these new siblings do not automatically change that.</p>
          <p>• No Mock content is involved anywhere in this batch.</p>
        </div>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {SEVEN_X_FAMILIES.map((f) => {
          const status = sevenXStatus.get(f.familyId);
          const pendingTarget = targets.find((t) => t.id === f.familyId && (t.notes ?? "").includes("007X"));
          return (
            <button
              key={f.familyId}
              disabled={!pendingTarget}
              onClick={() => pendingTarget && onOpen(pendingTarget, f)}
              className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between gap-3 disabled:opacity-50"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{FAMILY_DISPLAY_NAME[f.familyId] ?? formatFallbackName(f.familyId)}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {f.newQuestionIds.length} new question{f.newQuestionIds.length === 1 ? "" : "s"}
                  {f.reclassified && f.reclassified.length > 0 ? ` + ${f.reclassified.length} reclassified` : ""}
                  {status?.reviewed ? ` · reviewed (${status.decision})` : " · not yet reviewed"}
                </p>
              </div>
              {status?.reviewed ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Stage 3, Increment 006 (Mathematics Structural Depth Expansion) — a
 * dedicated section for the 8 newly authored questions across 2 new
 * families (mr01-reverse-mean, mr03-coord-combined), structurally
 * identical to Mr04DepthSection below (own array, own marker, own status
 * map). Included in the same increment that authored the content, per
 * explicit instruction, so no follow-up correction is needed this time.
 */
function Inc006DepthSection({
  targets, status, onOpen,
}: {
  targets: PendingReviewTarget[];
  status: Map<string, SevenXReviewStatus>;
  onOpen: (t: PendingReviewTarget, family: SevenXFamilyConfig) => void;
}) {
  const reviewedCount = INC006_DEPTH_FAMILIES.filter((f) => status.get(f.familyId)?.reviewed).length;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-teal-200 dark:border-teal-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-teal-100 dark:border-teal-900 bg-teal-50 dark:bg-teal-950/40">
        <p className="text-sm font-bold text-teal-900 dark:text-teal-200">Stage 3 Mathematics Structural Depth Review</p>
        <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">{reviewedCount} of {INC006_DEPTH_FAMILIES.length} families reviewed. 8 new questions total.</p>
        <div className="mt-2 text-xs text-teal-800 dark:text-teal-300 space-y-0.5">
          <p>• All 8 new questions remain PROVISIONAL. Reviewing a family does not activate it.</p>
          <p>• Both families below are entirely new: no earlier review of any kind exists for either of them.</p>
          <p>• Each card discloses the technical-authoring findings from this increment before you review.</p>
          <p>• No Mock content is involved anywhere in this batch.</p>
        </div>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {INC006_DEPTH_FAMILIES.map((f) => {
          const s = status.get(f.familyId);
          const pendingTarget = targets.find((t) => t.id === f.familyId && (t.notes ?? "").includes("STAGE3-INC006-DEPTH"));
          return (
            <button
              key={f.familyId}
              disabled={!pendingTarget}
              onClick={() => pendingTarget && onOpen(pendingTarget, f)}
              className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between gap-3 disabled:opacity-50"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{FAMILY_DISPLAY_NAME[f.familyId] ?? formatFallbackName(f.familyId)}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {f.newQuestionIds.length} new question{f.newQuestionIds.length === 1 ? "" : "s"}
                  {s?.reviewed ? ` · reviewed (${s.decision})` : " · not yet reviewed"}
                  {!pendingTarget ? " · migration 082 not yet applied" : ""}
                </p>
              </div>
              {s?.reviewed ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Stage 3, Increment 004, Post-Increment Review-Readiness Correction — a
 * dedicated section for the 11 newly authored MR-04 questions across 3
 * brand-new families (Decision 116 authored them; Decision 117 reviewed
 * them technically and found this section did not exist to present them
 * to a real reviewer). Structurally identical to SevenXSection above
 * (own array, own marker, own status map) rather than reusing 007X's own
 * count/marker, per this project's established "never merge batch
 * counts" rule (Decision 56 and SEVEN_X_BATCH_MARKER's own docstring).
 */
function Mr04DepthSection({
  targets, status, onOpen,
}: {
  targets: PendingReviewTarget[];
  status: Map<string, SevenXReviewStatus>;
  onOpen: (t: PendingReviewTarget, family: SevenXFamilyConfig) => void;
}) {
  const reviewedCount = MR04_DEPTH_FAMILIES.filter((f) => status.get(f.familyId)?.reviewed).length;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-rose-200 dark:border-rose-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-rose-100 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40">
        <p className="text-sm font-bold text-rose-900 dark:text-rose-200">Stage 3 MR-04 Content Depth Review</p>
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">{reviewedCount} of {MR04_DEPTH_FAMILIES.length} families reviewed. 11 new questions total.</p>
        <div className="mt-2 text-xs text-rose-800 dark:text-rose-300 space-y-0.5">
          <p>• All 11 new questions remain PROVISIONAL. Reviewing a family does not activate it.</p>
          <p>• All 3 families below are entirely new: no earlier review of any kind exists for any of them.</p>
          <p>• Each card discloses Stage 3 Increment 004 technical-review findings (Decision 117), including known content-depth limitations, before you review.</p>
          <p>• No Mock content is involved anywhere in this batch.</p>
        </div>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {MR04_DEPTH_FAMILIES.map((f) => {
          const s = status.get(f.familyId);
          const pendingTarget = targets.find((t) => t.id === f.familyId && (t.notes ?? "").includes("STAGE3-INC004-MR04-DEPTH"));
          return (
            <button
              key={f.familyId}
              disabled={!pendingTarget}
              onClick={() => pendingTarget && onOpen(pendingTarget, f)}
              className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between gap-3 disabled:opacity-50"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{FAMILY_DISPLAY_NAME[f.familyId] ?? formatFallbackName(f.familyId)}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {f.newQuestionIds.length} new question{f.newQuestionIds.length === 1 ? "" : "s"}
                  {s?.reviewed ? ` · reviewed (${s.decision})` : " · not yet reviewed"}
                  {!pendingTarget ? " · migration 079 not yet applied" : ""}
                </p>
              </div>
              {s?.reviewed ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Mock Programme Increment 004, Batch 001 (Decision 141) — a dedicated
 * section for the 18 newly authored Mathematics Mock candidate questions
 * across 7 new families, structurally mirroring Inc006DepthSection above
 * (own array, own marker, own status map) with two deliberate
 * differences: (1) review_type is 'mock_maths_independent_review', not
 * 'content_review' — routed through submitMockMathsIndependentReview(),
 * never submitReview(); (2) every row here is currently
 * authentic_assessment_candidate, not provisional, and the messaging
 * below says so plainly, since "Practice Eligible"/"provisional"
 * language would misdescribe this batch's real eligibility state.
 * Reviewing a family here does not promote it to independently_validated
 * or mock_eligible, and does not create or touch any ali_mock_form row —
 * those remain separate, later, Founder-authorised steps (Decision 141).
 */
function MockMrBatch001Section({
  targets, status, onOpen,
}: {
  targets: PendingReviewTarget[];
  status: Map<string, SevenXReviewStatus>;
  onOpen: (t: PendingReviewTarget, family: SevenXFamilyConfig) => void;
}) {
  const reviewedCount = MOCK_MR_BATCH001_FAMILIES.filter((f) => status.get(f.familyId)?.reviewed).length;
  const totalQuestions = MOCK_MR_BATCH001_FAMILIES.reduce((n, f) => n + f.newQuestionIds.length, 0);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40">
        <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Mock Mathematics Batch 001 Review</p>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
          {reviewedCount} of {MOCK_MR_BATCH001_FAMILIES.length} families reviewed. {totalQuestions} new questions total across 7 families.
        </p>
        <div className="mt-2 text-xs text-indigo-800 dark:text-indigo-300 space-y-0.5">
          <p>• These are Mock candidates, not Practice questions: none has ever been, or will be, automatically promoted from Practice.</p>
          <p>• All {totalQuestions} questions are currently <strong>authentic_assessment_candidate</strong>. None is mock_eligible. None is used by any Mock form.</p>
          <p>• {totalQuestions} rows represent approximately 9 genuinely distinct reasoning structures: several families contain hand-verified variants of the same underlying structure, not independent experiences. Each card discloses which.</p>
          <p>• QT-MR-01 (already the largest single Question Type in the Practice bank) was deliberately excluded from this batch.</p>
          <p>• Mathematics anti-memorisation requires genuine structural diversity, not merely changed numbers. See each family&apos;s own disclosure below for how this batch approached that.</p>
          <p>• Approving a family here does not activate it: promotion to independently_validated, and any later move to mock_eligible, remain separate, later, Founder-authorised steps.</p>
        </div>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {MOCK_MR_BATCH001_FAMILIES.map((f) => {
          const s = status.get(f.familyId);
          const pendingTarget = targets.find((t) => t.id === f.familyId && (t.notes ?? "").includes("MOCK-INC004-BATCH001"));
          return (
            <button
              key={f.familyId}
              disabled={!pendingTarget}
              onClick={() => pendingTarget && onOpen(pendingTarget, f)}
              className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between gap-3 disabled:opacity-50"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{FAMILY_DISPLAY_NAME[f.familyId] ?? formatFallbackName(f.familyId)}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {f.newQuestionIds.length} new question{f.newQuestionIds.length === 1 ? "" : "s"}
                  {s?.reviewed ? ` · reviewed (${s.decision})` : " · not yet reviewed"}
                  {!pendingTarget ? " · migration 089 not yet applied" : ""}
                </p>
              </div>
              {s?.reviewed ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Mock Programme Increment 004, Batch 002 (Decision 145) — a dedicated
 * section for the 20 newly authored Mathematics Mock candidate questions
 * across 10 new families, structurally identical to MockMrBatch001Section
 * above (own array, own marker, own status map, own `review_type =
 * 'mock_maths_independent_review'` routed through the same
 * submitMockMathsIndependentReview()), built in the SAME increment that
 * authored the content, per explicit instruction, so no follow-up
 * review-readiness correction is needed this time.
 */
function MockMrBatch002Section({
  targets, status, onOpen,
}: {
  targets: PendingReviewTarget[];
  status: Map<string, SevenXReviewStatus>;
  onOpen: (t: PendingReviewTarget, family: SevenXFamilyConfig) => void;
}) {
  const reviewedCount = MOCK_MR_BATCH002_FAMILIES.filter((f) => status.get(f.familyId)?.reviewed).length;
  const totalQuestions = MOCK_MR_BATCH002_FAMILIES.reduce((n, f) => n + f.newQuestionIds.length, 0);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40">
        <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Mock Mathematics Batch 002 Review</p>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
          {reviewedCount} of {MOCK_MR_BATCH002_FAMILIES.length} families reviewed. {totalQuestions} new questions total across 10 families.
        </p>
        <div className="mt-2 text-xs text-indigo-800 dark:text-indigo-300 space-y-0.5">
          <p>• These are Mock candidates, not Practice questions: none has ever been, or will be, automatically promoted from Practice.</p>
          <p>• All {totalQuestions} questions are currently <strong>authentic_assessment_candidate</strong>. None is mock_eligible. None is used by any Mock form.</p>
          <p>• {totalQuestions} rows represent 10 genuinely distinct reasoning structures, 2 per family: a foundational structure paired with a genuinely harder reverse/inverse/search structure. Each card discloses its own pair.</p>
          <p>• Question Types: QT-MR-04, QT-MR-06, QT-MR-07, QT-MR-10, QT-MR-11, five genuinely different reasoning domains (proportional change, algebra, geometry, time, number-property judgement). QT-MR-01 was again deliberately excluded.</p>
          <p>• Approving a family here does not activate it: promotion to independently_validated, and any later move to mock_eligible, remain separate, later, Founder-authorised steps.</p>
        </div>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {MOCK_MR_BATCH002_FAMILIES.map((f) => {
          const s = status.get(f.familyId);
          const pendingTarget = targets.find((t) => t.id === f.familyId && (t.notes ?? "").includes("MOCK-INC004-BATCH002"));
          return (
            <button
              key={f.familyId}
              disabled={!pendingTarget}
              onClick={() => pendingTarget && onOpen(pendingTarget, f)}
              className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between gap-3 disabled:opacity-50"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{FAMILY_DISPLAY_NAME[f.familyId] ?? formatFallbackName(f.familyId)}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {f.newQuestionIds.length} new question{f.newQuestionIds.length === 1 ? "" : "s"}
                  {s?.reviewed ? ` · reviewed (${s.decision})` : " · not yet reviewed"}
                  {!pendingTarget ? " · migration 092 not yet applied" : ""}
                </p>
              </div>
              {s?.reviewed ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MockMrBatch003Section({
  targets, status, onOpen,
}: {
  targets: PendingReviewTarget[];
  status: Map<string, SevenXReviewStatus>;
  onOpen: (t: PendingReviewTarget, family: SevenXFamilyConfig) => void;
}) {
  const reviewedCount = MOCK_MR_BATCH003_FAMILIES.filter((f) => status.get(f.familyId)?.reviewed).length;
  const totalQuestions = MOCK_MR_BATCH003_FAMILIES.reduce((n, f) => n + f.newQuestionIds.length, 0);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40">
        <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Mock Mathematics Batch 003 Review</p>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
          {reviewedCount} of {MOCK_MR_BATCH003_FAMILIES.length} families reviewed. {totalQuestions} new questions total across 4 families.
        </p>
        <div className="mt-2 text-xs text-indigo-800 dark:text-indigo-300 space-y-0.5">
          <p>• These are Mock candidates, not Practice questions: none has ever been, or will be, automatically promoted from Practice.</p>
          <p>• All {totalQuestions} questions are currently <strong>authentic_assessment_candidate</strong>. None is mock_eligible. None is used by any Mock form.</p>
          <p>• Question Types: QT-MR-01, QT-MR-08, QT-MR-10, QT-MR-12 (one family, mock-mr01mr10-costumeschedule, is a GROUPED family: 2 numbered-question instances of 2 subparts each, using migration 093&apos;s grouping columns for the first time).</p>
          <p>• Approving a family here does not activate it: promotion to independently_validated, and any later move to mock_eligible, remain separate, later, Founder-authorised steps.</p>
        </div>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {MOCK_MR_BATCH003_FAMILIES.map((f) => {
          const s = status.get(f.familyId);
          const pendingTarget = targets.find((t) => t.id === f.familyId && (t.notes ?? "").includes("MOCK-INC004-BATCH003"));
          return (
            <button
              key={f.familyId}
              disabled={!pendingTarget}
              onClick={() => pendingTarget && onOpen(pendingTarget, f)}
              className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between gap-3 disabled:opacity-50"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{FAMILY_DISPLAY_NAME[f.familyId] ?? formatFallbackName(f.familyId)}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {f.newQuestionIds.length} new question{f.newQuestionIds.length === 1 ? "" : "s"}
                  {s?.reviewed ? ` · reviewed (${s.decision})` : " · not yet reviewed"}
                  {!pendingTarget ? " · migration 096 not yet applied" : ""}
                </p>
              </div>
              {s?.reviewed ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Mock Programme Increment 006, English Mock Content Foundation, Batch 001
 * (Track B), Decision 151 — a dedicated section for the single new
 * Comprehension passage + its complete 12-numbered-question attached
 * question set, reviewed as ONE unit via the existing generic
 * `target.reviewTargetType === "passage"` path in ReviewForm (shows the
 * passage and every attached question together, never per-question),
 * with `review_type = 'mock_english_passage_independent_review'` routed
 * through submitMockEnglishPassageIndependentReview().
 */
function MockEnglishPassageBatch001Section({
  targets, status, onOpen,
}: {
  targets: PendingReviewTarget[];
  status: Map<string, SevenXReviewStatus>;
  onOpen: (t: PendingReviewTarget) => void;
}) {
  const s = status.get(MOCK_ENGLISH_PASSAGE_BATCH001_TARGET_ID);
  const pendingTarget = targets.find((t) => t.id === MOCK_ENGLISH_PASSAGE_BATCH001_TARGET_ID && (t.notes ?? "").includes("MOCK-INC006-ENGLISH-BATCH001"));
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-teal-200 dark:border-teal-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-teal-100 dark:border-teal-900 bg-teal-50 dark:bg-teal-950/40">
        <p className="text-sm font-bold text-teal-900 dark:text-teal-200">Mock English Comprehension Batch 001 Review</p>
        <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">
          {s?.reviewed ? "Reviewed" : "Not yet reviewed"} · 1 passage, 12 numbered questions (13 rows: 11 standalone + 1 grouped 2-subpart question)
        </p>
        <div className="mt-2 text-xs text-teal-800 dark:text-teal-300 space-y-0.5">
          <p>• This is a Mock candidate, not Practice content: it has never been, and will not be, automatically promoted from Practice.</p>
          <p>• The passage and its complete attached question set are currently <strong>authentic_assessment_candidate</strong>. Neither is mock_eligible. Neither is used by any Mock form.</p>
          <p>• Reviewed as ONE unit: the passage together with all 12 numbered questions, never by reviewing individual questions in isolation.</p>
          <p>• Approving this passage does not activate it: promotion to independently_validated, and any later move to mock_eligible, remain separate, later, Founder-authorised steps.</p>
        </div>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        <button
          disabled={!pendingTarget}
          onClick={() => pendingTarget && onOpen(pendingTarget)}
          className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between gap-3 disabled:opacity-50"
        >
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">The Boat in the Boathouse</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
              12 numbered questions
              {s?.reviewed ? ` · reviewed (${s.decision})` : " · not yet reviewed"}
              {!pendingTarget ? " · migration 099 not yet applied" : ""}
            </p>
          </div>
          {s?.reviewed ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />}
        </button>
      </div>
    </div>
  );
}

/**
 * Mock Programme Increment 006, English Mock Content Foundation, Batch 001
 * (Track B), Decision 151 — the 3 new Continuous Writing candidate
 * prompts, structurally identical to MockMrBatch003Section above (own
 * array, own marker, own status map), reviewed via the `sevenX` prop
 * (exact-id lookup, not the generic family_id fallback — see
 * MOCK_WRITING_BATCH001_FAMILIES' own comment in lib/adminReview.ts for
 * why), `review_type = 'mock_writing_prompt_independent_review'` routed
 * through submitMockWritingPromptIndependentReview().
 */
function MockWritingBatch001Section({
  targets, status, onOpen,
}: {
  targets: PendingReviewTarget[];
  status: Map<string, SevenXReviewStatus>;
  onOpen: (t: PendingReviewTarget, family: SevenXFamilyConfig) => void;
}) {
  const reviewedCount = MOCK_WRITING_BATCH001_FAMILIES.filter((f) => status.get(f.familyId)?.reviewed).length;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-teal-200 dark:border-teal-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-teal-100 dark:border-teal-900 bg-teal-50 dark:bg-teal-950/40">
        <p className="text-sm font-bold text-teal-900 dark:text-teal-200">Mock Continuous Writing Batch 001 Review</p>
        <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">
          {reviewedCount} of {MOCK_WRITING_BATCH001_FAMILIES.length} prompts reviewed. All QT-WC-01a.
        </p>
        <div className="mt-2 text-xs text-teal-800 dark:text-teal-300 space-y-0.5">
          <p>• These are Mock candidates, not Practice content: none has ever been, or will be, automatically promoted from Practice.</p>
          <p>• All 3 prompts are currently <strong>authentic_assessment_candidate</strong>. None is mock_eligible. None is used by any Mock form.</p>
          <p>• Three genuinely different prompt shapes, not one shape with the topic swapped: a personal-change narrative, a relationship/emotion narrative, and a direct opinion-question prompt.</p>
          <p>• No AI Writing scoring is enabled for any of these prompts: the existing scoring/quarantine boundary (Decisions 47/60/61/106) is unchanged.</p>
          <p>• Approving a prompt here does not activate it: promotion to independently_validated, and any later move to mock_eligible, remain separate, later, Founder-authorised steps.</p>
        </div>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {MOCK_WRITING_BATCH001_FAMILIES.map((f) => {
          const s = status.get(f.familyId);
          const pendingTarget = targets.find((t) => t.id === f.familyId && (t.notes ?? "").includes("MOCK-INC006-ENGLISH-BATCH001"));
          return (
            <button
              key={f.familyId}
              disabled={!pendingTarget}
              onClick={() => pendingTarget && onOpen(pendingTarget, f)}
              className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between gap-3 disabled:opacity-50"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{FAMILY_DISPLAY_NAME[f.familyId] ?? formatFallbackName(f.familyId)}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  1 new prompt
                  {s?.reviewed ? ` · reviewed (${s.decision})` : " · not yet reviewed"}
                  {!pendingTarget ? " · migration 099 not yet applied" : ""}
                </p>
              </div>
              {s?.reviewed ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Educational Increment 007T, Migration 064 Review-Surface Reconciliation
 * Part 6 correction — `reviewedIds` (now scoped to review_type =
 * 'content_review', see fetchReviewedTargetIds()) is cross-referenced
 * here so a target whose pending placeholder row was superseded by a
 * LATER, real content_review decision — submitted directly through this
 * very backlog, outside any named batch array, which the append-only
 * model never deletes the old placeholder row for — no longer inflates
 * the "pending" count or list. This does not touch, and cannot be
 * satisfied by, a maths/english/writing teaching-review decision for the
 * same family_id (a different review_type entirely, deliberately
 * excluded by fetchReviewedTargetIds()'s own scope).
 */
function FullBacklogSection({ targets, reviewedIds, onOpen }: { targets: PendingReviewTarget[]; reviewedIds: Set<string>; onOpen: (t: PendingReviewTarget) => void }) {
  const [open, setOpen] = useState(false);
  const backlogTargets = targets.filter((t) =>
    !PILOT_TARGET_IDS.includes(t.id) && !BATCH2_TARGET_IDS.includes(t.id) && !BATCH3_TARGET_IDS.includes(t.id) &&
    !BATCH4_TARGET_IDS.includes(t.id) && !SEVEN_T_TARGET_IDS.includes(t.id) && !SEVEN_X_TARGET_IDS.includes(t.id) &&
    !MR04_DEPTH_TARGET_IDS.includes(t.id) && !INC006_DEPTH_TARGET_IDS.includes(t.id) &&
    !MOCK_MR_BATCH001_TARGET_IDS.includes(t.id) && !MOCK_MR_BATCH002_TARGET_IDS.includes(t.id) &&
    !MOCK_MR_BATCH003_TARGET_IDS.includes(t.id) &&
    t.id !== MOCK_ENGLISH_PASSAGE_BATCH001_TARGET_ID && !MOCK_WRITING_BATCH001_TARGET_IDS.includes(t.id) &&
    !reviewedIds.has(t.id));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 text-left"
      >
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Full Review Backlog ({backlogTargets.length} genuinely unresolved, outside this pilot)
        </span>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>
      {open && (
        <div className="divide-y divide-gray-50 dark:divide-gray-800 border-t border-gray-50 dark:border-gray-800">
          {backlogTargets.map((t) => (
            <button
              key={t.id}
              onClick={() => onOpen(t)}
              className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between gap-3"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{FAMILY_DISPLAY_NAME[t.id] ?? formatFallbackName(t.id)}</span>
              <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** A single card in the Mathematics Teaching Review section — deliberately not TargetCard (that fetches a content-review TargetSummary via fetchTargetSummary/fetchReviewedTargetIds, the WRONG evidence source for this review type). Plain-language name first, family_id as small secondary text only, per the directive's own instruction. */
function TeachingTargetCard({ familyId, subtitle, reviewed, onOpen }: { familyId: string; subtitle?: string; reviewed: boolean; onOpen: () => void }) {
  const displayName = FAMILY_DISPLAY_NAME[familyId] ?? formatFallbackName(familyId);
  return (
    <button onClick={onOpen} className="w-full text-left px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{displayName}</p>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
          {reviewed && (
            <span className="inline-block mt-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              Reviewed
            </span>
          )}
        </div>
        <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0 mt-1" />
      </div>
    </button>
  );
}

/**
 * CSSE Completion Programme, Phase B — the Founder's own required
 * "Mathematics Teaching Review" section, clearly separated from the
 * content-review pilot/batches above (a distinct review_type, a distinct
 * evidence trail, a distinct 22-family target list — see this file's own
 * MATHS_TEACHING_REVIEW_TARGET_IDS docstring). Shows the genuine current
 * count from persisted review evidence, never a hardcoded number.
 */
function MathsTeachingSection({ reviewedIds, onOpen }: { reviewedIds: Set<string>; onOpen: (familyId: string) => void }) {
  const reviewedCount = MATHS_TEACHING_REVIEW_TARGET_IDS.filter((id) => reviewedIds.has(id)).length;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40">
        <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Mathematics Teaching Review</p>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">{reviewedCount} of {MATHS_TEACHING_REVIEW_TARGET_IDS.length} reviewed</p>
        <p className="text-[11px] text-indigo-500 dark:text-indigo-500 mt-1.5 leading-relaxed">
          Judges the MODEL, Guided Practice, and remediation teaching content added for these 22 Mathematics families (CSSE Completion Programme Phase B). This is separate from, and does not reuse, any earlier content review of the underlying questions.
        </p>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {MATHS_TEACHING_REVIEW_TARGET_IDS.map((id) => {
          const metadata = MATHS_TEACHING_REVIEW_METADATA[id];
          return (
            <TeachingTargetCard
              key={id} familyId={id}
              subtitle={metadata ? `${metadata.competency} · ${metadata.questionType}` : undefined}
              reviewed={reviewedIds.has(id)} onOpen={() => onOpen(id)}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * CSSE Completion Programme, Phase C, Part 13 — the Founder's own required
 * "English Teaching Review" section, clearly separated from both the
 * content-review pilot/batches above and from Mathematics Teaching Review
 * (a distinct review_type, a distinct evidence trail, a distinct 8-family
 * target list — see ENGLISH_TEACHING_REVIEW_TARGET_IDS's own docstring in
 * lib/adminReview.ts). Shows the genuine current count from persisted
 * review evidence, never a hardcoded number.
 */
function EnglishTeachingSection({ reviewedIds, onOpen }: { reviewedIds: Set<string>; onOpen: (familyId: string) => void }) {
  const reviewedCount = ENGLISH_TEACHING_REVIEW_TARGET_IDS.filter((id) => reviewedIds.has(id)).length;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-teal-200 dark:border-teal-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-teal-100 dark:border-teal-900 bg-teal-50 dark:bg-teal-950/40">
        <p className="text-sm font-bold text-teal-900 dark:text-teal-200">English Teaching Review</p>
        <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">{reviewedCount} of {ENGLISH_TEACHING_REVIEW_TARGET_IDS.length} reviewed</p>
        <p className="text-[11px] text-teal-500 dark:text-teal-500 mt-1.5 leading-relaxed">
          Judges Educational Increment 007O&apos;s change: reviewed wrong-answer remediation text, previously never shown to learners, now rendered live for these 8 families (CSSE Completion Programme Phase C). Separate from, and does not reuse, any earlier content review of the underlying questions.
        </p>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {ENGLISH_TEACHING_REVIEW_TARGET_IDS.map((id) => {
          const metadata = ENGLISH_TEACHING_REVIEW_METADATA[id];
          return (
            <TeachingTargetCard
              key={id} familyId={id}
              subtitle={metadata ? `${metadata.competency} · ${metadata.questionType}` : undefined}
              reviewed={reviewedIds.has(id)} onOpen={() => onOpen(id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function ReviewDashboard() {
  const [targets, setTargets] = useState<PendingReviewTarget[] | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<PendingReviewTarget | null>(null);
  const [teachingReviewedIds, setTeachingReviewedIds] = useState<Set<string>>(new Set());
  const [selectedTeachingFamilyId, setSelectedTeachingFamilyId] = useState<string | null>(null);
  const [englishTeachingReviewedIds, setEnglishTeachingReviewedIds] = useState<Set<string>>(new Set());
  const [selectedEnglishTeachingFamilyId, setSelectedEnglishTeachingFamilyId] = useState<string | null>(null);
  const [writingTeachingReviewedIds, setWritingTeachingReviewedIds] = useState<Set<string>>(new Set());
  const [selectedWritingTeachingFamilyId, setSelectedWritingTeachingFamilyId] = useState<string | null>(null);
  const [sevenXStatus, setSevenXStatus] = useState<Map<string, SevenXReviewStatus>>(new Map());
  const [selectedSevenX, setSelectedSevenX] = useState<{ target: PendingReviewTarget; family: SevenXFamilyConfig } | null>(null);
  const [mr04DepthStatus, setMr04DepthStatus] = useState<Map<string, SevenXReviewStatus>>(new Map());
  const [selectedMr04Depth, setSelectedMr04Depth] = useState<{ target: PendingReviewTarget; family: SevenXFamilyConfig } | null>(null);
  const [inc006DepthStatus, setInc006DepthStatus] = useState<Map<string, SevenXReviewStatus>>(new Map());
  const [selectedInc006Depth, setSelectedInc006Depth] = useState<{ target: PendingReviewTarget; family: SevenXFamilyConfig } | null>(null);
  const [mockMrBatch001Status, setMockMrBatch001Status] = useState<Map<string, SevenXReviewStatus>>(new Map());
  const [selectedMockMrBatch001, setSelectedMockMrBatch001] = useState<{ target: PendingReviewTarget; family: SevenXFamilyConfig } | null>(null);
  const [mockMrBatch002Status, setMockMrBatch002Status] = useState<Map<string, SevenXReviewStatus>>(new Map());
  const [selectedMockMrBatch002, setSelectedMockMrBatch002] = useState<{ target: PendingReviewTarget; family: SevenXFamilyConfig } | null>(null);
  const [mockMrBatch003Status, setMockMrBatch003Status] = useState<Map<string, SevenXReviewStatus>>(new Map());
  const [selectedMockMrBatch003, setSelectedMockMrBatch003] = useState<{ target: PendingReviewTarget; family: SevenXFamilyConfig } | null>(null);
  const [mockEnglishPassageBatch001Status, setMockEnglishPassageBatch001Status] = useState<Map<string, SevenXReviewStatus>>(new Map());
  const [selectedMockEnglishPassageBatch001, setSelectedMockEnglishPassageBatch001] = useState<PendingReviewTarget | null>(null);
  const [mockWritingBatch001Status, setMockWritingBatch001Status] = useState<Map<string, SevenXReviewStatus>>(new Map());
  const [selectedMockWritingBatch001, setSelectedMockWritingBatch001] = useState<{ target: PendingReviewTarget; family: SevenXFamilyConfig } | null>(null);

  async function load() {
    const [pending, reviewed, teachingReviewed, englishTeachingReviewed, writingTeachingReviewed, sevenX, mr04Depth, inc006Depth, mockMrBatch001, mockMrBatch002, mockMrBatch003, mockEnglishPassageBatch001, mockWritingBatch001] = await Promise.all([
      fetchPendingReviewTargets(), fetchReviewedTargetIds(), fetchMathsTeachingReviewedFamilyIds(), fetchEnglishTeachingReviewedFamilyIds(), fetchWritingTeachingReviewedFamilyIds(),
      fetchSevenXReviewStatus(SEVEN_X_TARGET_IDS), fetchMr04DepthReviewStatus(MR04_DEPTH_TARGET_IDS), fetchInc006DepthReviewStatus(INC006_DEPTH_TARGET_IDS),
      fetchMockMrBatch001ReviewStatus(MOCK_MR_BATCH001_TARGET_IDS), fetchMockMrBatch002ReviewStatus(MOCK_MR_BATCH002_TARGET_IDS),
      fetchMockMrBatch003ReviewStatus(MOCK_MR_BATCH003_TARGET_IDS),
      fetchMockEnglishPassageBatch001ReviewStatus(), fetchMockWritingBatch001ReviewStatus(MOCK_WRITING_BATCH001_TARGET_IDS),
    ]);
    setTargets(pending);
    setReviewedIds(reviewed);
    setTeachingReviewedIds(teachingReviewed);
    setEnglishTeachingReviewedIds(englishTeachingReviewed);
    setWritingTeachingReviewedIds(writingTeachingReviewed);
    setSevenXStatus(sevenX);
    setMr04DepthStatus(mr04Depth);
    setInc006DepthStatus(inc006Depth);
    setMockMrBatch001Status(mockMrBatch001);
    setMockMrBatch002Status(mockMrBatch002);
    setMockMrBatch003Status(mockMrBatch003);
    setMockEnglishPassageBatch001Status(mockEnglishPassageBatch001);
    setMockWritingBatch001Status(mockWritingBatch001);
  }

  useEffect(() => { load(); }, []);

  if (selectedTeachingFamilyId) {
    return <MathsTeachingReviewForm familyId={selectedTeachingFamilyId} onDone={() => { setSelectedTeachingFamilyId(null); load(); }} />;
  }

  if (selectedEnglishTeachingFamilyId) {
    const target: PendingReviewTarget = { id: selectedEnglishTeachingFamilyId, reviewTargetType: "question_family", notes: null };
    return <ReviewForm target={target} reviewType="english_teaching_review" onDone={() => { setSelectedEnglishTeachingFamilyId(null); load(); }} />;
  }

  if (selectedWritingTeachingFamilyId) {
    return <WritingTeachingReviewForm familyId={selectedWritingTeachingFamilyId} onDone={() => { setSelectedWritingTeachingFamilyId(null); load(); }} />;
  }

  if (selected) {
    return <ReviewForm target={selected} onDone={() => { setSelected(null); load(); }} />;
  }

  if (selectedSevenX) {
    const { target, family } = selectedSevenX;
    return (
      <ReviewForm
        target={target}
        onDone={() => { setSelectedSevenX(null); load(); }}
        sevenX={{
          questionIds: family.newQuestionIds, reclassified: family.reclassified, disclosure: family.disclosure,
          notesPrefix: buildSevenXNotesPrefix(target.id, family.newQuestionIds),
        }}
      />
    );
  }

  if (selectedMr04Depth) {
    const { target, family } = selectedMr04Depth;
    return (
      <ReviewForm
        target={target}
        onDone={() => { setSelectedMr04Depth(null); load(); }}
        sevenX={{
          questionIds: family.newQuestionIds, reclassified: family.reclassified, disclosure: family.disclosure,
          notesPrefix: buildMr04DepthNotesPrefix(target.id, family.newQuestionIds),
        }}
      />
    );
  }

  if (selectedInc006Depth) {
    const { target, family } = selectedInc006Depth;
    return (
      <ReviewForm
        target={target}
        onDone={() => { setSelectedInc006Depth(null); load(); }}
        sevenX={{
          questionIds: family.newQuestionIds, reclassified: family.reclassified, disclosure: family.disclosure,
          notesPrefix: buildInc006DepthNotesPrefix(target.id, family.newQuestionIds),
        }}
      />
    );
  }

  if (selectedMockMrBatch001) {
    const { target, family } = selectedMockMrBatch001;
    return (
      <ReviewForm
        target={target}
        reviewType="mock_maths_independent_review"
        onDone={() => { setSelectedMockMrBatch001(null); load(); }}
        sevenX={{
          questionIds: family.newQuestionIds, reclassified: family.reclassified, disclosure: family.disclosure,
          notesPrefix: buildMockMrBatch001NotesPrefix(target.id, family.newQuestionIds),
        }}
      />
    );
  }

  if (selectedMockMrBatch002) {
    const { target, family } = selectedMockMrBatch002;
    return (
      <ReviewForm
        target={target}
        reviewType="mock_maths_independent_review"
        onDone={() => { setSelectedMockMrBatch002(null); load(); }}
        sevenX={{
          questionIds: family.newQuestionIds, reclassified: family.reclassified, disclosure: family.disclosure,
          notesPrefix: buildMockMrBatch002NotesPrefix(target.id, family.newQuestionIds),
        }}
      />
    );
  }

  if (selectedMockMrBatch003) {
    const { target, family } = selectedMockMrBatch003;
    return (
      <ReviewForm
        target={target}
        reviewType="mock_maths_independent_review"
        onDone={() => { setSelectedMockMrBatch003(null); load(); }}
        sevenX={{
          questionIds: family.newQuestionIds, reclassified: family.reclassified, disclosure: family.disclosure,
          notesPrefix: buildMockMrBatch003NotesPrefix(target.id, family.newQuestionIds),
        }}
      />
    );
  }

  if (selectedMockEnglishPassageBatch001) {
    return (
      <ReviewForm
        target={selectedMockEnglishPassageBatch001}
        reviewType="mock_english_passage_independent_review"
        onDone={() => { setSelectedMockEnglishPassageBatch001(null); load(); }}
      />
    );
  }

  if (selectedMockWritingBatch001) {
    const { target, family } = selectedMockWritingBatch001;
    return (
      <ReviewForm
        target={target}
        reviewType="mock_writing_prompt_independent_review"
        onDone={() => { setSelectedMockWritingBatch001(null); load(); }}
        sevenX={{
          questionIds: family.newQuestionIds, reclassified: family.reclassified, disclosure: family.disclosure,
          notesPrefix: buildMockWritingBatch001NotesPrefix(target.id, family.newQuestionIds),
        }}
      />
    );
  }

  if (targets === null) return <p className="text-sm text-gray-400 dark:text-gray-500">Loading review pilot…</p>;

  return (
    <div className="space-y-5">
      <MathsTeachingSection reviewedIds={teachingReviewedIds} onOpen={setSelectedTeachingFamilyId} />
      <EnglishTeachingSection reviewedIds={englishTeachingReviewedIds} onOpen={setSelectedEnglishTeachingFamilyId} />
      <WritingTeachingSection reviewedIds={writingTeachingReviewedIds} onOpen={setSelectedWritingTeachingFamilyId} />
      {targets.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No pending content-review targets visible. If you expect targets here, confirm migrations 047/050/052/053/054 have
          been applied: see ANGEL_007D_REVIEW_BACKLOG_V1.md.
        </p>
      ) : (
      <>
      <PilotSection targets={targets} reviewedIds={reviewedIds} onOpen={setSelected} />
      <Batch2Section targets={targets} reviewedIds={reviewedIds} onOpen={setSelected} />
      <Batch3Section targets={targets} reviewedIds={reviewedIds} onOpen={setSelected} />
      <Batch4Section targets={targets} reviewedIds={reviewedIds} onOpen={setSelected} />
      <SevenTSection targets={targets} reviewedIds={reviewedIds} onOpen={setSelected} />
      <SevenXSection targets={targets} sevenXStatus={sevenXStatus} onOpen={(target, family) => setSelectedSevenX({ target, family })} />
      <Mr04DepthSection targets={targets} status={mr04DepthStatus} onOpen={(target, family) => setSelectedMr04Depth({ target, family })} />
      <Inc006DepthSection targets={targets} status={inc006DepthStatus} onOpen={(target, family) => setSelectedInc006Depth({ target, family })} />
      <MockMrBatch001Section targets={targets} status={mockMrBatch001Status} onOpen={(target, family) => setSelectedMockMrBatch001({ target, family })} />
      <MockMrBatch002Section targets={targets} status={mockMrBatch002Status} onOpen={(target, family) => setSelectedMockMrBatch002({ target, family })} />
      <MockMrBatch003Section targets={targets} status={mockMrBatch003Status} onOpen={(target, family) => setSelectedMockMrBatch003({ target, family })} />
      <MockEnglishPassageBatch001Section targets={targets} status={mockEnglishPassageBatch001Status} onOpen={setSelectedMockEnglishPassageBatch001} />
      <MockWritingBatch001Section targets={targets} status={mockWritingBatch001Status} onOpen={(target, family) => setSelectedMockWritingBatch001({ target, family })} />
      <FullBacklogSection targets={targets} reviewedIds={reviewedIds} onOpen={setSelected} />
      </>
      )}
    </div>
  );
}

// ─── Sign-in / auth gate — identical pattern to app/admin-beta/page.tsx ────

function AdminSignIn() {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("sending");
    setErrorMsg("");
    const { error } = await signInWithMagicLink(email.trim());
    if (error) { setState("error"); setErrorMsg(error); } else { setState("sent"); }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={24} className="text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Educational Review</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Admin-only access, sign in required</p>
        </div>
        {state === "sent" ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Check your email, we sent a magic link to <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="email" value={email} onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
                placeholder="you@example.com" autoComplete="email" autoFocus required
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            {state === "error" && <p className="text-xs text-red-500">{errorMsg}</p>}
            <button
              type="submit" disabled={state === "sending" || !email.trim()}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {state === "sending" ? "Sending…" : (<>Send magic link <ArrowRight size={16} /></>)}
            </button>
          </form>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
          <Link href="/dashboard" className="hover:underline">← Back to app</Link>
        </p>
      </div>
    </div>
  );
}

function NotAuthorized({ email, onSignOut }: { email: string | null; onSignOut: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Not authorised</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
          {email ? <>Signed in as <strong>{email}</strong>, but</> : "This account"} does not have admin access.
        </p>
        <button onClick={onSignOut} className="mt-6 inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </div>
  );
}

type AccessState = "checking" | "not-signed-in" | "not-admin" | "admin";

export default function AdminReviewPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [access, setAccess] = useState<AccessState>("checking");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setAccess("not-signed-in"); return; }
    checkIsAdmin().then((isAdmin) => setAccess(isAdmin ? "admin" : "not-admin"));
  }, [authLoading, user]);

  if (authLoading || access === "checking") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">Checking access…</p>
      </div>
    );
  }
  if (access === "not-signed-in") return <AdminSignIn />;
  if (access === "not-admin") return <NotAuthorized email={user?.email ?? null} onSignOut={signOut} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin-beta" className="text-purple-700 dark:text-purple-400 font-bold text-base shrink-0">Angel 11+</Link>
            <span className="text-gray-300 dark:text-gray-700 shrink-0">·</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">Educational Review</span>
          </div>
          <button onClick={signOut} className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-3 py-1.5 rounded-lg">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6 pb-16">
        <ReviewDashboard />
      </main>
    </div>
  );
}
