"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, ArrowRight, ShieldAlert, LogOut, Mail } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { checkIsAdmin } from "@/lib/feedback";
import {
  fetchPendingReviewTargets, fetchRepresentativeQuestions, fetchQuestionsForPassage, fetchPassageDetail, submitReview,
  type PendingReviewTarget, type RepresentativeQuestion, type PassageDetail, type ReviewDecision, type ReviewSubmission,
} from "@/lib/adminReview";
import { getExamStrategyHint, getWorkedExample } from "@/lib/learningEngine/englishExamStrategies";
import { getGuidedScaffoldKind } from "@/lib/learningEngine/guidedPractice";

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
    objective: "Compare two mathematical quantities or expressions and determine their relationship.",
    evidenceBasis: "CSSE-006 (2023), CSSE-011 (2022), CSSE-016 (2021) Mathematics papers.",
  },
};

/**
 * Educational Increment 007E, Part 9 — the smallest secure internal
 * review interface needed for the first genuine human educational
 * review to happen through the real ali_family_review mechanism, rather
 * than the Founder hand-writing SQL. Reuses /admin-beta's exact
 * authentication gate (Supabase magic-link + is_current_user_admin()) —
 * not exposed to learners or ordinary parents. Not a CMS: it can only
 * read pending targets and their real content, and insert one review
 * decision — it cannot edit content, cannot delete anything, and cannot
 * change eligibility_status (see ANGEL_EDUCATIONAL_REVIEW_OPERATING_
 * MODEL_V1.md §5 — activation is a distinct, later, migration-based step).
 */

const CRITERIA: Array<{ key: keyof ReviewSubmission; label: string }> = [
  { key: "educationalValidity", label: "Educational validity" },
  { key: "competencyValidity", label: "Competency validity" },
  { key: "questionTypeAlignment", label: "Question Type alignment" },
  { key: "answerCorrectnessVerified", label: "Answer correctness verified" },
  { key: "ambiguityFree", label: "Ambiguity-free" },
  { key: "wordingQuality", label: "Wording quality" },
  { key: "ageAppropriate", label: "Age appropriate" },
  { key: "difficultyAppropriate", label: "Difficulty appropriate" },
  { key: "transferValidity", label: "Transfer classification valid" },
  { key: "misconceptionQuality", label: "Misconception/trap quality" },
  { key: "variationBoundariesSound", label: "Variation/boundaries sound" },
  { key: "teachingQuality", label: "Teaching quality (MODEL/worked example)" },
  { key: "examStrategyQuality", label: "Exam strategy quality" },
  { key: "explanationQuality", label: "Explanation quality" },
  { key: "validationBehaviourSound", label: "Answer-validation behaviour sound" },
  { key: "authenticityConfirmed", label: "CSSE authenticity confirmed" },
  { key: "originalityConfirmed", label: "Originality confirmed" },
  { key: "copyrightRiskClear", label: "Copyright risk clear" },
];

const DECISIONS: { value: ReviewDecision; label: string }[] = [
  { value: "approved", label: "Approved" },
  { value: "approved_with_amendment", label: "Approved with amendment" },
  { value: "requires_revalidation", label: "Requires revalidation" },
  { value: "rejected", label: "Rejected" },
];

function emptySubmission(target: PendingReviewTarget, reviewerName: string): ReviewSubmission {
  return {
    reviewTargetType: target.reviewTargetType, targetId: target.id, reviewer: reviewerName,
    qualificationBasis: "",
    decision: "approved", notes: "", evidenceReference: "", provenanceReference: "",
    educationalValidity: null, competencyValidity: null, wordingQuality: null, ageAppropriate: null,
    ambiguityFree: null, difficultyAppropriate: null, misconceptionQuality: null, explanationQuality: null,
    variationBoundariesSound: null, authenticityConfirmed: null, questionTypeAlignment: null,
    answerCorrectnessVerified: null, transferValidity: null, teachingQuality: null, examStrategyQuality: null,
    validationBehaviourSound: null, originalityConfirmed: null, copyrightRiskClear: null,
  };
}

function TriState({ value, onChange }: { value: boolean | null; onChange: (v: boolean | null) => void }) {
  return (
    <div className="flex gap-1">
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

function ReviewForm({ target, onDone }: { target: PendingReviewTarget; onDone: () => void }) {
  const [reviewerName, setReviewerName] = useState("");
  const [submission, setSubmission] = useState<ReviewSubmission>(() => emptySubmission(target, ""));
  const [passage, setPassage] = useState<PassageDetail | null>(null);
  const [questions, setQuestions] = useState<RepresentativeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const educationalContext = FAMILY_EDUCATIONAL_CONTEXT[target.id];
  const workedExample = target.reviewTargetType === "question_family" ? getWorkedExample(target.id) : undefined;
  const guidedScaffold = target.reviewTargetType === "question_family" ? getGuidedScaffoldKind(target.id) : undefined;
  const strategyHint = target.reviewTargetType === "question_family" ? getExamStrategyHint(target.id) : undefined;

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
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Review recorded for {target.id}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Decision: {submission.decision}. This does not change Practice Eligibility, since that is a separate, controlled activation step.
        </p>
        <button onClick={onDone} className="mt-4 text-sm font-semibold text-purple-600 dark:text-purple-400">Back to backlog</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button onClick={onDone} className="text-xs font-semibold text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
        <ArrowLeft size={13} /> Back to backlog
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
        <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
          {target.reviewTargetType === "passage" ? "Reading passage" : "Question family"}
        </p>
        {educationalContext ? (
          <>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{educationalContext.objective}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2"><strong>Evidence basis:</strong> {educationalContext.evidenceBasis}</p>
          </>
        ) : (
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{target.id}</h1>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          {workedExample && (
            <span className="text-[11px] font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-1 rounded-lg">
              Has a worked teaching example
            </span>
          )}
          {guidedScaffold && (
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-lg">
              Has real Guided Practice support
            </span>
          )}
          {strategyHint && (
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2 py-1 rounded-lg">
              Has an exam strategy tip
            </span>
          )}
        </div>
        {strategyHint && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2"><strong>Exam strategy shown to learners:</strong> {strategyHint}</p>
        )}
        {target.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{target.notes}</p>}
        <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-3 font-mono">{target.id}</p>
      </div>

      {loading && <p className="text-sm text-gray-400 dark:text-gray-500">Loading content…</p>}

      {!loading && passage && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{passage.title}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {passage.wordCount} words · {passage.readingComplexity} · {passage.genre} · content_version {passage.contentVersion} · active={String(passage.active)} · {passage.eligibilityStatus}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 whitespace-pre-line leading-relaxed max-h-96 overflow-y-auto">
            {passage.originalText}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">{passage.copyrightStatus} · provenance: {passage.provenance}</p>
        </div>
      )}

      {!loading && questions.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            {target.reviewTargetType === "passage" ? "All questions on this passage" : `Representative sample (${questions.length})`}
          </p>
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="border-t border-gray-50 dark:border-gray-800 pt-3 first:border-t-0 first:pt-0">
                <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500">{q.id} · {q.contentDifficulty} · {q.transferClass ?? "no transfer class"} · v{q.contentVersion}</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">{q.question}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"><strong>Model answer:</strong> {q.modelAnswer}</p>
                {q.addressesMisconception && (
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1"><strong>Misconception:</strong> {q.addressesMisconception}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && questions.length === 0 && !passage && (
        <p className="text-sm text-amber-600 dark:text-amber-400">No content found for this target: nothing to review yet.</p>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Your review</p>

        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Reviewer name (required, a review cannot be recorded anonymously)</label>
          <input
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="Your full name"
            className="w-full mt-1 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Your qualification to review this (required, e.g. teaching experience, subject knowledge, 11+ preparation experience)
          </label>
          <input
            value={submission.qualificationBasis}
            onChange={(e) => setSubmission((s) => ({ ...s, qualificationBasis: e.target.value }))}
            placeholder="e.g. Founder, 11+ preparation experience, programme owner"
            className="w-full mt-1 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5"
          />
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
            This is recorded with your review. Describe your own real basis for judging this content, do not accept a suggestion that does not genuinely apply to you.
          </p>
        </div>

        <div className="space-y-2">
          {CRITERIA.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
              <TriState
                value={submission[key] as boolean | null}
                onChange={(v) => setSubmission((s) => ({ ...s, [key]: v }))}
              />
            </div>
          ))}
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Decision</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {DECISIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setSubmission((s) => ({ ...s, decision: d.value }))}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  submission.decision === d.value
                    ? "bg-purple-600 text-white"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Evidence reference</label>
            <input
              value={submission.evidenceReference}
              onChange={(e) => setSubmission((s) => ({ ...s, evidenceReference: e.target.value }))}
              placeholder="e.g. ENGLISH_WAVE2_REVIEW_PACKS_V1.md#..."
              className="w-full mt-1 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Provenance reference</label>
            <input
              value={submission.provenanceReference}
              onChange={(e) => setSubmission((s) => ({ ...s, provenanceReference: e.target.value }))}
              className="w-full mt-1 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5"
            />
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
    </div>
  );
}

function ReviewDashboard() {
  const [targets, setTargets] = useState<PendingReviewTarget[] | null>(null);
  const [selected, setSelected] = useState<PendingReviewTarget | null>(null);

  async function load() {
    setTargets(await fetchPendingReviewTargets());
  }

  useEffect(() => { load(); }, []);

  if (selected) {
    return <ReviewForm target={selected} onDone={() => { setSelected(null); load(); }} />;
  }

  if (targets === null) return <p className="text-sm text-gray-400 dark:text-gray-500">Loading backlog…</p>;

  if (targets.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No pending review targets visible. If you expect targets here, confirm migrations 047/050/052/053/054 have
        been applied: see ANGEL_007D_REVIEW_BACKLOG_V1.md.
      </p>
    );
  }

  const passages = targets.filter((t) => t.reviewTargetType === "passage");
  const families = targets.filter((t) => t.reviewTargetType === "question_family");

  return (
    <div className="space-y-5">
      {([["English/Mathematics passages", passages], ["Question families", families]] as const).map(([label, list]) => (
        list.length > 0 && (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3 border-b border-gray-50 dark:border-gray-800">
              {label} ({list.length} pending)
            </p>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {list.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between gap-3"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.id}</span>
                  <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )
      ))}
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
