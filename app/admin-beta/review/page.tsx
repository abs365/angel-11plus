"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, ArrowRight, ShieldAlert, LogOut, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { checkIsAdmin } from "@/lib/feedback";
import {
  fetchPendingReviewTargets, fetchReviewedTargetIds, fetchRepresentativeQuestions, fetchQuestionsForPassage,
  fetchPassageDetail, fetchTargetSummary, submitReview,
  type PendingReviewTarget, type RepresentativeQuestion, type PassageDetail, type ReviewDecision, type ReviewSubmission,
  type TargetSummary,
} from "@/lib/adminReview";
import { getExamStrategyHint, getWorkedExample } from "@/lib/learningEngine/englishExamStrategies";
import { getGuidedScaffoldKind, getGuidedInstructionText } from "@/lib/learningEngine/guidedPractice";
import { getSelfReflectionCategories, WRONG_ANSWER_CATEGORY_LABEL } from "@/lib/learningEngine/englishErrorClassification";

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
};

/** Graceful fallback for any family/passage not in the curated name map above — never shows a raw dash-separated ID as the primary label. */
function formatFallbackName(id: string): string {
  const withoutPrefix = id.replace(/^wave\d-eng-/, "").replace(/^wave\d-fam-/, "").replace(/^mr\d\d-/, "");
  return withoutPrefix.split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/**
 * Educational Increment 007F, Part 4/6 — plain-language educational
 * context for each target, so the reviewer is answering "would I trust
 * this to teach and assess a child preparing seriously for the 11+?",
 * not reading raw database rows. Every fact here is drawn from real,
 * already-documented evidence (ENGLISH_WAVE2_COVERAGE_MATRIX_V1.md,
 * MATHEMATICS_WAVE2_REVIEW_PACKS.md) — nothing invented for this UI.
 */
const FAMILY_EDUCATIONAL_CONTEXT: Record<string, { objective: string; evidenceBasis: string }> = {
  "wave2-fam-multiselect": {
    objective: "Recognise which of several statements about a passage are actually supported by the text, when told exactly how many to select.",
    evidenceBasis: "CSSE 2021 Main Test paper, Question 11 (tick-box format). Single-year evidence: the thinnest evidence base of any family in the programme.",
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
};

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

// ─── Plain-language reviewer questions (mapped to the real ali_family_review columns) ──

const CRITERIA: Array<{ key: keyof ReviewSubmission; question: string }> = [
  { key: "educationalValidity", question: "Is the educational content accurate?" },
  { key: "competencyValidity", question: "Does it genuinely assess the skill it claims to?" },
  { key: "questionTypeAlignment", question: "Does it match the real CSSE question pattern it's based on?" },
  { key: "answerCorrectnessVerified", question: "Are the answers and marking expectations correct?" },
  { key: "ambiguityFree", question: "Could a reasonable child give a different, equally defensible answer the key does not accept?" },
  { key: "wordingQuality", question: "Is the wording clear for an 11+ learner?" },
  { key: "ageAppropriate", question: "Is this age-appropriate for an 11+ candidate?" },
  { key: "difficultyAppropriate", question: "Is the difficulty appropriate for its stated level?" },
  { key: "transferValidity", question: "Is the transfer demand (how far this asks the learner to generalise) honestly classified?" },
  { key: "misconceptionQuality", question: "Is the recorded misconception a real, plausible mistake a child would make?" },
  { key: "variationBoundariesSound", question: "Do the easiest and hardest examples you saw genuinely represent the family's range?" },
  { key: "teachingQuality", question: "Does the teaching support genuinely help the learner, where one exists?" },
  { key: "examStrategyQuality", question: "Is the exam strategy shown to learners useful and safe advice?" },
  { key: "explanationQuality", question: "Where a model answer is shown, does it actually explain, not just restate?" },
  { key: "validationBehaviourSound", question: "Does the way Angel marks this match how CSSE would genuinely mark it?" },
  { key: "authenticityConfirmed", question: "Does this genuinely resemble a real CSSE question, not a generic worksheet?" },
  { key: "originalityConfirmed", question: "Is the content sufficiently original?" },
  { key: "copyrightRiskClear", question: "Is the content free of any copyright concern?" },
];

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

function ReviewForm({ target, onDone }: { target: PendingReviewTarget; onDone: () => void }) {
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
  const workedExample = target.reviewTargetType === "question_family" ? getWorkedExample(target.id) : undefined;
  const guidedScaffold = target.reviewTargetType === "question_family" ? getGuidedScaffoldKind(target.id) : undefined;
  const guidedInstruction = guidedScaffold ? getGuidedInstructionText(target.id, guidedScaffold) : undefined;
  const strategyHint = target.reviewTargetType === "question_family" ? getExamStrategyHint(target.id) : undefined;
  const remediationLabels = target.reviewTargetType === "question_family" ? getRemediationLabels(target.id) : [];

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (target.reviewTargetType === "passage") {
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
    const { error } = await submitReview(submission);
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
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Review recorded for {displayName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Decision: {submission.decision}. This does not change Practice Eligibility, since that is a separate, controlled activation step.
        </p>
        <button onClick={onDone} className="mt-4 text-sm font-semibold text-purple-600 dark:text-purple-400">Back to review pilot</button>
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
        <ArrowLeft size={13} /> Back to review pilot
      </button>

      <Card>
        <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
          {target.reviewTargetType === "passage" ? "Reading passage" : "Question family"}
        </p>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1 break-words">{displayName}</h1>
        <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-1 font-mono break-all">{target.id}</p>
      </Card>

      {loading && <p className="text-sm text-gray-400 dark:text-gray-500">Loading content…</p>}

      {!loading && educationalContext && (
        <Card>
          <SectionTitle letter="A" title="What this teaches" />
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{educationalContext.objective}</p>
          <div className="mt-4">
            <SectionTitle letter="B" title="Why it belongs in Angel 11+" />
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{educationalContext.evidenceBasis}</p>
          </div>
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
              ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">No worked example has been authored yet for this family. This is a genuine gap, not hidden from you.</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Guided Practice approach</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {guidedInstruction} {guidedScaffold && GUIDED_KIND_LABEL[guidedScaffold]}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Independent approach</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                The learner attempts the question unaided. Where Angel can check the answer automatically, feedback is immediate. Where it cannot (a free-text explanation), the learner compares their own answer to a model answer themselves, and this is never counted as independently verified mastery.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Exam strategy</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{strategyHint ?? "No exam strategy tip has been authored yet for this family."}</p>
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
            {CRITERIA.map(({ key, question }) => (
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
            {submitting ? "Submitting…" : (<>Submit review <ArrowRight size={16} /></>)}
          </button>
        </div>
      </Card>
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

function FullBacklogSection({ targets, onOpen }: { targets: PendingReviewTarget[]; onOpen: (t: PendingReviewTarget) => void }) {
  const [open, setOpen] = useState(false);
  const backlogTargets = targets.filter((t) => !PILOT_TARGET_IDS.includes(t.id));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 text-left"
      >
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Full Review Backlog ({backlogTargets.length} pending, outside this pilot)
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

function ReviewDashboard() {
  const [targets, setTargets] = useState<PendingReviewTarget[] | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<PendingReviewTarget | null>(null);

  async function load() {
    const [pending, reviewed] = await Promise.all([fetchPendingReviewTargets(), fetchReviewedTargetIds()]);
    setTargets(pending);
    setReviewedIds(reviewed);
  }

  useEffect(() => { load(); }, []);

  if (selected) {
    return <ReviewForm target={selected} onDone={() => { setSelected(null); load(); }} />;
  }

  if (targets === null) return <p className="text-sm text-gray-400 dark:text-gray-500">Loading review pilot…</p>;

  if (targets.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No pending review targets visible. If you expect targets here, confirm migrations 047/050/052/053/054 have
        been applied: see ANGEL_007D_REVIEW_BACKLOG_V1.md.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <PilotSection targets={targets} reviewedIds={reviewedIds} onOpen={setSelected} />
      <FullBacklogSection targets={targets} onOpen={setSelected} />
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
