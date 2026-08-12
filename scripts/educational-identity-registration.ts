/**
 * Educational Identity Registration Tool — Phase 2C.
 *
 * Governing principle (Founder-approved 2026-07-23): every educational
 * item must have exactly one permanent Educational Intelligence identity.
 * The canonical identity is the existing, live `ali_question_bank.id`
 * (text primary key, migration 005) — this tool does not invent a new
 * identity scheme. For legacy content, the source item's own existing id
 * is reused verbatim as the bank row's id, exactly as migration 013
 * already established for the first 18 rows.
 *
 * This tool exists only to strengthen the permanent Educational
 * Intelligence engines (Knowledge, Competency, Learning Graph, Mistake
 * Intelligence, Assessment, Admissions Intelligence, Parent Guidance) — it
 * is deliberately NOT a general content management system. Every item this
 * tool registers gets a real skill/QuestionTypeId (Knowledge Engine input)
 * that resolves to a real CompetencyId (Competency Engine input) via the
 * same `QUESTION_TYPE_PRIMARY_COMPETENCY` lookup every other Engine
 * consumer already uses. An item with no defensible mapping is marked
 * "requires review", never force-fitted.
 *
 * IDENTITY vs CLASSIFICATION (kept as two separate measures throughout):
 * `ali_question_bank.skill` is `not null` (migration 005) — there is
 * currently no way to give an item a canonical row without also giving it
 * a real skill/Question Type value. This means, in the CURRENT schema,
 * every item classified "requires-review" cannot yet receive a canonical
 * row either — identity coverage and classification coverage are
 * numerically coupled until a Founder decision resolves this (a schema
 * change to allow a null/placeholder skill, or some other mechanism). This
 * tool does not resolve that tension by inventing a Question Type or by
 * reusing the forbidden dotted-code vocabulary — it surfaces the coupling
 * explicitly wherever it matters (see buildFullReport()'s output and the
 * accompanying reconciliation report).
 *
 * Deterministic and idempotent by construction: no randomness, no
 * wall-clock timestamps in generated content, no network access. Running
 * this script twice against the same source tree produces byte-identical
 * output. Read-only against the source files — it never edits
 * data/*.ts, never touches app/ or components/, and never writes directly
 * to a database (no Supabase connection is available in this sandbox,
 * documented in EDUCATIONAL_IDENTITY_INTEGRATION_DISCOVERY.md).
 *
 * Run: npx tsx scripts/educational-identity-registration.ts
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { englishLessons } from "@/data/lessons";
import { mathsQuestions, quickArithmetic } from "@/data/maths";
import { vocabWords } from "@/data/vocabulary";
import { writingPrompts } from "@/data/writing";
import { verbalReasoningQuestions } from "@/data/verbal-reasoning";
import { nonVerbalReasoningQuestions } from "@/data/non-verbal-reasoning";
import { spatialReasoningQuestions } from "@/data/spatial-reasoning";
import { numericalReasoningQuestions } from "@/data/numerical-reasoning";
import { ALL_QUESTION_TYPE_IDS, QUESTION_TYPE_PRIMARY_COMPETENCY } from "@/lib/learningEngine/assessmentBrainMap";
import type { QuestionTypeId } from "@/lib/learningEngine/types";

const REPO_ROOT = path.resolve(__dirname, "..");

// ─── 1. Scan: every real item across the 8 known legacy sources ───────────

export type SourceFile =
  | "data/lessons.ts"
  | "data/maths.ts"
  | "data/vocabulary.ts"
  | "data/writing.ts"
  | "data/verbal-reasoning/*"
  | "data/non-verbal-reasoning/*"
  | "data/spatial-reasoning/*"
  | "data/numerical-reasoning/*";

export interface ScannedItem {
  id: string;
  sourceFile: SourceFile;
  subject: string;
  contentType: "reading-comprehension-question" | "maths-question" | "vocabulary-word" | "writing-prompt" | "reasoning-question";
}

export function scanAllSources(): ScannedItem[] {
  const items: ScannedItem[] = [];

  for (const lesson of englishLessons) {
    for (const q of lesson.questions) {
      items.push({ id: q.id, sourceFile: "data/lessons.ts", subject: "english", contentType: "reading-comprehension-question" });
    }
  }
  for (const q of [...mathsQuestions, ...quickArithmetic]) {
    items.push({ id: q.id, sourceFile: "data/maths.ts", subject: "maths", contentType: "maths-question" });
  }
  for (const w of vocabWords) {
    items.push({ id: w.id, sourceFile: "data/vocabulary.ts", subject: "vocabulary", contentType: "vocabulary-word" });
  }
  for (const p of writingPrompts) {
    items.push({ id: p.id, sourceFile: "data/writing.ts", subject: "writing", contentType: "writing-prompt" });
  }
  for (const q of verbalReasoningQuestions) {
    items.push({ id: q.id, sourceFile: "data/verbal-reasoning/*", subject: "verbal-reasoning", contentType: "reasoning-question" });
  }
  for (const q of nonVerbalReasoningQuestions) {
    items.push({ id: q.id, sourceFile: "data/non-verbal-reasoning/*", subject: "non-verbal-reasoning", contentType: "reasoning-question" });
  }
  for (const q of spatialReasoningQuestions) {
    items.push({ id: q.id, sourceFile: "data/spatial-reasoning/*", subject: "spatial-reasoning", contentType: "reasoning-question" });
  }
  for (const q of numericalReasoningQuestions) {
    items.push({ id: q.id, sourceFile: "data/numerical-reasoning/*", subject: "numerical-reasoning", contentType: "reasoning-question" });
  }

  return items;
}

// ─── 2. Reconciliation of the existing 18 ali_question_bank rows ──────────
//
// Transcribed directly from supabase/migrations/013_wave2_illustrative_
// practice_content.sql — the only migration that has ever inserted into
// ali_question_bank (verified: grep "insert into public.ali_question_bank"
// across every migration file returns exactly one match, migration 013).
// This is a small, closed, one-migration dataset — writing a general SQL
// parser for it would be scope creep ("do not build a broad content
// management platform"); transcribing it once, here, with this comment as
// the audit trail, is the proportionate choice. If a future migration ever
// adds more rows, this table must be updated to match before the tool's
// reconciliation check can be trusted again.
export interface ExistingBankRow {
  id: string;
  subject: string;
  skill: QuestionTypeId;
  learningUnitId: string;
}

export const EXISTING_BANK_ROWS: ExistingBankRow[] = [
  { id: "eng-001-q2", subject: "english", skill: "QT-RC-03", learningUnitId: "eng-001" },
  { id: "eng-001-q3", subject: "english", skill: "QT-RC-10", learningUnitId: "eng-001" },
  { id: "eng-002-q1", subject: "english", skill: "QT-RC-05", learningUnitId: "eng-002" },
  { id: "eng-002-q3", subject: "english", skill: "QT-RC-05", learningUnitId: "eng-002" },
  { id: "eng-003-q3", subject: "english", skill: "QT-RC-08", learningUnitId: "eng-003" },
  { id: "mth-002", subject: "maths", skill: "QT-MR-01", learningUnitId: "mth-002" },
  { id: "mth-004", subject: "maths", skill: "QT-MR-01", learningUnitId: "mth-004" },
  { id: "mth-008", subject: "maths", skill: "QT-MR-01", learningUnitId: "mth-008" },
  { id: "qa-008", subject: "maths", skill: "QT-MR-01", learningUnitId: "qa-008" },
  { id: "mth-006", subject: "maths", skill: "QT-MR-05", learningUnitId: "mth-006" },
  { id: "mth-003", subject: "maths", skill: "QT-MR-07", learningUnitId: "mth-003" },
  { id: "mth-009", subject: "maths", skill: "QT-MR-07", learningUnitId: "mth-009" },
  { id: "mth-010", subject: "maths", skill: "QT-MR-04", learningUnitId: "mth-010" },
  { id: "mth-007b", subject: "maths", skill: "QT-MR-04", learningUnitId: "mth-007b" },
  { id: "mth-005", subject: "maths", skill: "QT-MR-13", learningUnitId: "mth-005" },
  { id: "mth-001", subject: "maths", skill: "QT-MR-10", learningUnitId: "mth-001" },
  { id: "qa-010", subject: "maths", skill: "QT-MR-11", learningUnitId: "qa-010" },
  { id: "wrt-003", subject: "writing", skill: "QT-WC-01a", learningUnitId: "wrt-003" },
];

export interface NewRegistration {
  id: string;
  subject: "english" | "maths" | "writing" | "vocabulary";
  skill: QuestionTypeId;
  contentDifficulty: "easy" | "medium" | "hard" | "challenge";
  masteryThreshold: number;
  estimatedTimeSeconds: number;
  learningUnitId: string;
  reasoning: string;
}

export interface ReviewItem {
  id: string;
  subject: string;
  reason: string;
  rejectedCandidates?: string[];
}

// ─── 3. Batch 1 (English + Maths) ──────────────────────────────────────────
//
// MANDATORY CORRECTION (Founder instruction, 2026-07-23): the two items
// originally reported as "genuine judgement calls" (eng-002-q2, eng-003-q2)
// have been re-examined and moved to BATCH_1_REVIEW below — on rigorous
// re-reading, neither has a candidate Question Type that fits without
// stretching its definition, and this tool must not describe an ambiguous
// classification as certain. See each entry's rejectedCandidates for the
// specific alternatives considered.
export const BATCH_1_REGISTRATIONS: NewRegistration[] = [
  {
    id: "eng-001-q1",
    subject: "english",
    skill: "QT-RC-05",
    contentDifficulty: "medium",
    masteryThreshold: 2,
    estimatedTimeSeconds: 90,
    learningUnitId: "eng-001",
    reasoning:
      "Open interpretive question requiring evidence ('use evidence from the text') to support a judgement about atmosphere — same shape as eng-002-q1 (already tagged QT-RC-05, competency RC-02): asks what something reveals, supported by cited evidence, not a single quoted phrase's effect.",
  },
  {
    id: "eng-001-q4",
    subject: "english",
    skill: "QT-RC-10",
    contentDifficulty: "medium",
    masteryThreshold: 2,
    estimatedTimeSeconds: 90,
    learningUnitId: "eng-001",
    reasoning:
      "Asks 'why did the writer choose X, what effect does this create' about a specific stylistic choice (entry brevity) — same shape as eng-001-q3 (already tagged QT-RC-10, competency RC-02): an explicit effect-of-technique question, not a general evidence-based inference.",
  },
  {
    id: "eng-003-q1",
    subject: "english",
    skill: "QT-RC-05",
    contentDifficulty: "hard",
    masteryThreshold: 3,
    estimatedTimeSeconds: 120,
    learningUnitId: "eng-003",
    reasoning:
      "Gives a direct quotation ('no longer recognises the young man...') and asks for its meaning plus what has changed — Quotation-and-Explanation, matching eng-002-q1's tagged pattern (QT-RC-05, competency RC-02). Not QT-RC-03 (Word/Phrase Meaning): the quoted unit is a full clause with follow-on interpretation, not a single word/phrase gloss.",
  },
  {
    id: "qa-001",
    subject: "maths",
    skill: "QT-MR-01",
    contentDifficulty: "medium",
    masteryThreshold: 2,
    estimatedTimeSeconds: 60,
    learningUnitId: "qa-001",
    reasoning: "Direct arithmetic computation (847 + 356) — same shape as mth-002/mth-008/qa-008, already tagged QT-MR-01, competency MR-01.",
  },
  {
    id: "qa-002",
    subject: "maths",
    skill: "QT-MR-01",
    contentDifficulty: "medium",
    masteryThreshold: 2,
    estimatedTimeSeconds: 60,
    learningUnitId: "qa-002",
    reasoning: "Direct arithmetic computation (1000 - 473) — QT-MR-01, competency MR-01.",
  },
  {
    id: "qa-003",
    subject: "maths",
    skill: "QT-MR-01",
    contentDifficulty: "medium",
    masteryThreshold: 2,
    estimatedTimeSeconds: 60,
    learningUnitId: "qa-003",
    reasoning: "Direct arithmetic computation (24 x 35) — QT-MR-01, competency MR-01.",
  },
  {
    id: "qa-004",
    subject: "maths",
    skill: "QT-MR-01",
    contentDifficulty: "medium",
    masteryThreshold: 2,
    estimatedTimeSeconds: 60,
    learningUnitId: "qa-004",
    reasoning: "Direct arithmetic computation (756 / 9) — QT-MR-01, competency MR-01.",
  },
  {
    id: "qa-005",
    subject: "maths",
    skill: "QT-MR-01",
    contentDifficulty: "medium",
    masteryThreshold: 2,
    estimatedTimeSeconds: 60,
    learningUnitId: "qa-005",
    reasoning: "Direct arithmetic computation (12.5 x 8) — QT-MR-01, competency MR-01.",
  },
  {
    id: "qa-006",
    subject: "maths",
    skill: "QT-MR-01",
    contentDifficulty: "medium",
    masteryThreshold: 2,
    estimatedTimeSeconds: 60,
    learningUnitId: "qa-006",
    reasoning:
      "Fraction-of-quantity calculation (3/4 of 240). Reuses mth-004's own disclosed precedent exactly: fractions fold into Assessment Brain's Arithmetic Calculation domain since no dedicated fractions Question Type exists — QT-MR-01, competency MR-01.",
  },
  {
    id: "qa-007",
    subject: "maths",
    skill: "QT-MR-04",
    contentDifficulty: "medium",
    masteryThreshold: 2,
    estimatedTimeSeconds: 60,
    learningUnitId: "qa-007",
    reasoning:
      "Percentage-of-a-number calculation (15% of 60). Unlike fractions, Assessment Brain has a dedicated Question Type for this (QT-MR-04, Percentage/Proportional Change) — matches mth-010's precedent exactly, not QT-MR-01.",
  },
  {
    id: "qa-009",
    subject: "maths",
    skill: "QT-MR-01",
    contentDifficulty: "medium",
    masteryThreshold: 2,
    estimatedTimeSeconds: 60,
    learningUnitId: "qa-009",
    reasoning: "Direct arithmetic computation (2^3 x 5) — same shape as mth-002's power calculation, QT-MR-01, competency MR-01.",
  },
];

export const BATCH_1_REVIEW: ReviewItem[] = [
  {
    id: "eng-002-q2",
    subject: "english",
    rejectedCandidates: ["QT-RC-05", "QT-RC-08"],
    reason:
      "Source: 'Look at the three types of silence Leo collects. What do these tell us about his home life?' (marks: 3). " +
      "QT-RC-05 (Quotation-and-Explanation) rejected: that Question Type's own already-tagged examples (eng-002-q1, eng-002-q3) each centre on ONE specific quoted phrase the student explains; this question instead references three items already enumerated in the question itself and asks the student to synthesise across all three — a different task shape, not a quotation-and-explanation. " +
      "QT-RC-08 (List-N-Items Extraction) rejected: that Question Type means finding/listing N items FROM the text; here the three items are already given in the question, and the actual task is inferring their combined significance, not extracting them. " +
      "Neither candidate's definition is met without stretching it — marked for educational review rather than forced into either.",
  },
  {
    id: "eng-003-q2",
    subject: "english",
    rejectedCandidates: ["QT-RC-05", "QT-RC-10"],
    reason:
      "Source: \"Why does Thomas compare the sound of the guns to 'weather — threatening but distant, like a storm that may or may not arrive'? What does this tell us about life in the trenches?\" (marks: 3). " +
      "On re-examination this sits genuinely between two already-used Question Types with comparable strength on each side: QT-RC-10 (Effect-of-Language Interpretation, per eng-001-q3's 'what effect/what technique' framing) and QT-RC-05 (Quotation-and-Explanation, per eng-002-q3's 'what does this simile tell us' framing) — this question's phrasing ('why does he compare... what does this tell us') plausibly matches either precedent equally well, and the original report's own disclosed reasoning already flagged this as a judgement call rather than a clean match. Per the instruction not to describe an ambiguous classification as certain, this is moved to educational review instead of being resolved by preference.",
  },
];

// ─── 4. Batch 2 (Writing + Vocabulary) ─────────────────────────────────────
//
// Zero new registrations this batch — every remaining item genuinely lacks
// a defensible Question Type match, not because none was looked for.
export const BATCH_2_REGISTRATIONS: NewRegistration[] = [];

export const BATCH_2_REVIEW: ReviewItem[] = [
  {
    id: "wrt-001",
    subject: "writing",
    rejectedCandidates: ["QT-WC-01a", "QT-WC-01b"],
    reason:
      "Source: narrative story-opening prompt ('The Empty House', type: 'narrative'). Assessment Brain V1's Continuous Writing catalogue has exactly two Question Types: QT-WC-01a (Reflective/Discursive Prompt — opinion/argument/personal reflection, not narrative) and QT-WC-01b (Picture-Stimulus Narrative — requires a picture stimulus, which this prompt does not have, per migration 013's own disclosed finding that none of Angel's 4 writing prompts use one). A text-only narrative prompt fits neither definition without misrepresenting it.",
  },
  {
    id: "wrt-002",
    subject: "writing",
    rejectedCandidates: ["QT-WC-01a", "QT-WC-01b"],
    reason:
      "Source: pure descriptive prompt ('The Last Explorer', type: 'descriptive', 'Focus entirely on description'). Not reflective/discursive (QT-WC-01a) and not a picture-stimulus narrative (QT-WC-01b, and has no picture stimulus regardless) — description is a third genre Assessment Brain V1's 2-type Continuous Writing catalogue does not cover.",
  },
  {
    id: "wrt-004",
    subject: "writing",
    rejectedCandidates: ["QT-WC-01a", "QT-WC-01b"],
    reason:
      "Source: narrative story-opening prompt ('The Storm', type: 'narrative', text-only, no picture stimulus). Same reasoning as wrt-001 — fits neither of the two real Continuous Writing Question Types.",
  },
  ...vocabWords.map(
    (w): ReviewItem => ({
      id: w.id,
      subject: "vocabulary",
      rejectedCandidates: ["QT-RC-03", "QT-RC-04"],
      reason:
        `Source: standalone vocabulary flashcard (word: "${w.word}" — definition, synonyms, antonyms, example sentence; no reading passage). ` +
        "QT-RC-03 (Word/Phrase Meaning Explanation) and QT-RC-04 (Synonym Substitution List) are both explicitly categorised 'Comprehension' in Assessment Brain V1 §9 — i.e. they test a word's meaning IN THE CONTEXT of a specific reading passage, which this standalone flashcard format does not have. None of Assessment Brain V1's 27 Question Types describe a passage-free lexical item test. Vocabulary self-assessment ('knew it'/'still learning', as this page already records) is a self-report, not an objective correctness signal, and is not treated as one here either.",
    })
  ),
];

// ─── 5. Batch 3 (Verbal / Non-Verbal / Spatial / Numerical Reasoning) ──────
//
// Zero new registrations. Assessment Brain V1 defines competencies and
// Question Types only for the domains CSSE itself tests (English, Maths,
// Writing, Vocabulary) — it has no coverage at all for Verbal, Non-Verbal,
// Spatial, or Numerical Reasoning, since CSSE tests none of them
// (docs/intelligence/ASSESSMENT_BRAIN_V1.md §2, §11). This is a real,
// structural absence of evidence, not a gap this pass failed to close —
// no amount of per-item review would produce a real QT-* mapping here,
// because the taxonomy these items would need doesn't exist inside
// Assessment Brain V1's approved scope. Per the Founder's explicit
// instruction, this does NOT mean these subjects join the CSSE pathway,
// change route visibility, or gain a recommendation/prerequisite
// relationship — this batch is identity/classification bookkeeping only.
const REASONING_SUBJECTS = new Set(["verbal-reasoning", "non-verbal-reasoning", "spatial-reasoning", "numerical-reasoning"]);

export const BATCH_3_REGISTRATIONS: NewRegistration[] = [];

function buildBatch3Review(): ReviewItem[] {
  const reasoningItems = scanAllSources().filter((item) => REASONING_SUBJECTS.has(item.subject));
  return reasoningItems.map((item) => ({
    id: item.id,
    subject: item.subject,
    reason:
      "Assessment Brain V1 defines competencies/Question Types only for CSSE's own tested domains (English, Maths, Writing, Vocabulary) — it has no competency or Question Type coverage for Verbal/Non-Verbal/Spatial/Numerical Reasoning at all, since CSSE does not test these (ASSESSMENT_BRAIN_V1.md §2, §11). No evidence-supported QT-* mapping is possible under the current Assessment Brain V1 scope; not force-mapped, not given CSSE pathway relevance.",
  }));
}

export const BATCH_3_REVIEW: ReviewItem[] = buildBatch3Review();

// ─── 6. Validation ──────────────────────────────────────────────────────

export interface ValidationIssue {
  severity: "error" | "warning";
  message: string;
}

export function validateCrossSourceUniqueness(scanned: ScannedItem[]): ValidationIssue[] {
  const seen = new Map<string, SourceFile>();
  const issues: ValidationIssue[] = [];
  for (const item of scanned) {
    const existing = seen.get(item.id);
    if (existing && existing !== item.sourceFile) {
      issues.push({ severity: "error", message: `Duplicate id "${item.id}" used by both ${existing} and ${item.sourceFile}` });
    } else if (existing) {
      issues.push({ severity: "error", message: `Duplicate id "${item.id}" appears twice within ${item.sourceFile}` });
    }
    seen.set(item.id, item.sourceFile);
  }
  return issues;
}

export function validateBatchAgainstExisting(batch: NewRegistration[], existing: ExistingBankRow[]): ValidationIssue[] {
  const existingIds = new Set(existing.map((r) => r.id));
  const issues: ValidationIssue[] = [];
  for (const reg of batch) {
    if (existingIds.has(reg.id)) {
      issues.push({
        severity: "error",
        message: `Batch registration "${reg.id}" conflicts with an existing canonical row — never overwrite silently.`,
      });
    }
  }
  return issues;
}

export function validateQuestionTypeCodes(batch: NewRegistration[]): ValidationIssue[] {
  const validCodes = new Set<string>(ALL_QUESTION_TYPE_IDS);
  const issues: ValidationIssue[] = [];
  for (const reg of batch) {
    if (!validCodes.has(reg.skill)) {
      issues.push({ severity: "error", message: `"${reg.id}" uses "${reg.skill}", which is not a real Assessment Brain Question Type.` });
      continue;
    }
    if (!QUESTION_TYPE_PRIMARY_COMPETENCY[reg.skill]) {
      issues.push({ severity: "error", message: `"${reg.id}"'s Question Type "${reg.skill}" has no resolvable competency.` });
    }
  }
  return issues;
}

export function validateBatchInternalUniqueness(batch: NewRegistration[]): ValidationIssue[] {
  const seen = new Set<string>();
  const issues: ValidationIssue[] = [];
  for (const reg of batch) {
    if (seen.has(reg.id)) {
      issues.push({ severity: "error", message: `Batch registration id "${reg.id}" appears twice within the batch itself.` });
    }
    seen.add(reg.id);
  }
  return issues;
}

// ─── 7. Reconciliation classification (every scanned item -> status) ──────

export type RegistrationStatus = "already-registered" | "newly-registered" | "requires-review";

export interface ReconciledItem {
  id: string;
  sourceFile: SourceFile;
  subject: string;
  status: RegistrationStatus;
  skill?: QuestionTypeId;
  competencyId?: string;
  reason?: string;
}

export function reconcileAll(
  scanned: ScannedItem[],
  existing: ExistingBankRow[],
  registrations: NewRegistration[],
  reviewItems: ReviewItem[]
): ReconciledItem[] {
  const existingById = new Map(existing.map((r) => [r.id, r]));
  const registeredById = new Map(registrations.map((r) => [r.id, r]));
  const reviewById = new Map(reviewItems.map((r) => [r.id, r]));

  return scanned.map((item): ReconciledItem => {
    const existingRow = existingById.get(item.id);
    if (existingRow) {
      return {
        id: item.id,
        sourceFile: item.sourceFile,
        subject: item.subject,
        status: "already-registered",
        skill: existingRow.skill,
        competencyId: QUESTION_TYPE_PRIMARY_COMPETENCY[existingRow.skill],
      };
    }
    const newReg = registeredById.get(item.id);
    if (newReg) {
      return {
        id: item.id,
        sourceFile: item.sourceFile,
        subject: item.subject,
        status: "newly-registered",
        skill: newReg.skill,
        competencyId: QUESTION_TYPE_PRIMARY_COMPETENCY[newReg.skill],
        reason: newReg.reasoning,
      };
    }
    const review = reviewById.get(item.id);
    if (review) {
      return { id: item.id, sourceFile: item.sourceFile, subject: item.subject, status: "requires-review", reason: review.reason };
    }
    // Should be unreachable once all 3 batches are processed — surfaced
    // loudly (not silently defaulted) so a future gap is caught by tests,
    // not hidden.
    return {
      id: item.id,
      sourceFile: item.sourceFile,
      subject: item.subject,
      status: "requires-review",
      reason: "UNACCOUNTED — no batch has classified this item yet. This indicates a real gap in the tool's own coverage, not a content decision.",
    };
  });
}

// ─── 8. Migration SQL generation (additive, idempotent) ───────────────────

const englishByIdCache = new Map<string, { question: string; skill: string; marks: number; hint?: string; modelAnswer?: string; passageTitle: string; passageText?: string }>();
for (const lesson of englishLessons) {
  for (const q of lesson.questions) {
    englishByIdCache.set(q.id, {
      question: q.question,
      skill: q.skill,
      marks: q.marks,
      hint: q.hint,
      modelAnswer: q.modelAnswer,
      passageTitle: lesson.title,
      passageText: lesson.passage,
    });
  }
}
const mathsByIdCache = new Map<string, { question: string; answer: string; skill: string; difficulty: string; marks: number; workingSteps?: string[] }>();
for (const q of [...mathsQuestions, ...quickArithmetic]) {
  mathsByIdCache.set(q.id, { question: q.question, answer: String(q.answer), skill: q.skill, difficulty: q.difficulty, marks: q.marks, workingSteps: q.workingSteps });
}

function buildPromptJsonForRegistration(reg: NewRegistration): string {
  if (reg.subject === "english") {
    const src = englishByIdCache.get(reg.id)!;
    return JSON.stringify(
      { id: reg.id, question: src.question, skill: src.skill, marks: src.marks, hint: src.hint, modelAnswer: src.modelAnswer, passageTitle: src.passageTitle, passageText: src.passageText },
      null,
      2
    );
  }
  if (reg.subject === "maths") {
    const src = mathsByIdCache.get(reg.id)!;
    return JSON.stringify({ id: reg.id, question: src.question, answer: src.answer, skill: src.skill, difficulty: src.difficulty, marks: src.marks, workingSteps: src.workingSteps }, null, 2);
  }
  throw new Error(`buildPromptJsonForRegistration: no prompt-builder implemented for subject "${reg.subject}"`);
}

function generateMigrationSql(migrationNumber: string, batchLabel: string, registrations: NewRegistration[], reconciliationDocName: string): string {
  const lines: string[] = [];
  lines.push(`-- Angel Digital 11+ — Migration ${migrationNumber}`);
  lines.push(`-- Educational Identity Registration — Phase 2C, ${batchLabel}`);
  lines.push("-- Generated by scripts/educational-identity-registration.ts — deterministic,");
  lines.push("-- idempotent (on conflict do nothing, matching migration 013's own pattern).");
  lines.push("-- Every id below reuses the item's existing data/*.ts id verbatim — no new");
  lines.push(`-- identity minted. Every skill/competency mapping is disclosed with its`);
  lines.push(`-- reasoning in ${reconciliationDocName}.`);
  lines.push("-- Additive-only. Depends on migrations 005, 007, 013. Does not modify any");
  lines.push("-- existing row.");
  lines.push("-- Run this in: Supabase Dashboard > SQL Editor > New query");
  lines.push("");

  if (registrations.length === 0) {
    lines.push(`-- NO ROWS THIS BATCH. Every item scanned for ${batchLabel} was classified`);
    lines.push("-- 'requires-review' (no evidence-supported Question Type mapping exists) —");
    lines.push(`-- see ${reconciliationDocName} for the per-item reasoning. This file is`);
    lines.push("-- intentionally a no-op, kept in the migration sequence as a real, honest");
    lines.push("-- record that this batch was processed and found nothing safe to register,");
    lines.push("-- not skipped.");
    lines.push("select 1; -- intentional no-op, see comment above");
    lines.push("");
    return lines.join("\n");
  }

  lines.push("insert into public.ali_question_bank");
  lines.push("  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, mastery_threshold, learning_unit_id)");
  lines.push("values");
  lines.push("");

  const rows = registrations.map((reg, i) => {
    const promptJson = buildPromptJsonForRegistration(reg);
    const explanation = reg.reasoning.replace(/'/g, "''");
    const row =
      `('${reg.id}', '${reg.subject}', '${reg.skill}', array['csse'], '${reg.contentDifficulty}', 'short-answer', ${reg.estimatedTimeSeconds},\n` +
      ` $json$${promptJson}$json$,\n` +
      ` '${explanation}', ${reg.masteryThreshold}, '${reg.learningUnitId}')`;
    return row + (i === registrations.length - 1 ? "" : ",\n");
  });

  lines.push(rows.join("\n"));
  lines.push("");
  lines.push("on conflict (id) do nothing;");
  lines.push("");
  return lines.join("\n");
}

export function generateBatch1MigrationSql(): string {
  return generateMigrationSql("016", "Batch 1 (English + Maths)", BATCH_1_REGISTRATIONS, "EDUCATIONAL_IDENTITY_BATCH1_RECONCILIATION.md");
}
export function generateBatch2MigrationSql(): string {
  return generateMigrationSql("017", "Batch 2 (Writing + Vocabulary)", BATCH_2_REGISTRATIONS, "EDUCATIONAL_IDENTITY_PHASE2C_FINAL_REPORT.md");
}
export function generateBatch3MigrationSql(): string {
  return generateMigrationSql("018", "Batch 3 (Verbal / Non-Verbal / Spatial / Numerical Reasoning)", BATCH_3_REGISTRATIONS, "EDUCATIONAL_IDENTITY_PHASE2C_FINAL_REPORT.md");
}

// ─── 9. Report generation ─────────────────────────────────────────────────

export interface FullReport {
  totalScanned: number;
  bySourceFile: Record<string, number>;
  byStatus: Record<RegistrationStatus, number>;
  identityCoverage: { registered: number; total: number; percentage: number };
  classificationCoverage: { evidenceSupported: number; total: number; percentage: number };
  uniquenessIssues: ValidationIssue[];
  batchValidationIssues: ValidationIssue[];
  reconciled: ReconciledItem[];
}

const ALL_REGISTRATIONS = [...BATCH_1_REGISTRATIONS, ...BATCH_2_REGISTRATIONS, ...BATCH_3_REGISTRATIONS];
const ALL_REVIEW_ITEMS = [...BATCH_1_REVIEW, ...BATCH_2_REVIEW, ...BATCH_3_REVIEW];

export function buildFullReport(): FullReport {
  const scanned = scanAllSources();
  const uniquenessIssues = validateCrossSourceUniqueness(scanned);
  const batchValidationIssues = [
    ...validateBatchInternalUniqueness(ALL_REGISTRATIONS),
    ...validateBatchAgainstExisting(ALL_REGISTRATIONS, EXISTING_BANK_ROWS),
    ...validateQuestionTypeCodes(ALL_REGISTRATIONS),
  ];
  const reconciled = reconcileAll(scanned, EXISTING_BANK_ROWS, ALL_REGISTRATIONS, ALL_REVIEW_ITEMS);

  const bySourceFile: Record<string, number> = {};
  for (const item of scanned) bySourceFile[item.sourceFile] = (bySourceFile[item.sourceFile] ?? 0) + 1;

  const byStatus: Record<RegistrationStatus, number> = { "already-registered": 0, "newly-registered": 0, "requires-review": 0 };
  for (const item of reconciled) byStatus[item.status]++;

  const registered = byStatus["already-registered"] + byStatus["newly-registered"];
  const total = scanned.length;

  return {
    totalScanned: total,
    bySourceFile,
    byStatus,
    // Identity coverage and classification coverage are numerically equal
    // in this report — not a coincidence, but a direct consequence of
    // ali_question_bank.skill being NOT NULL: an item cannot get a
    // canonical row (identity) without also getting a real skill value
    // (classification) in the current schema. See the module doc comment.
    identityCoverage: { registered, total, percentage: Math.round((registered / total) * 10000) / 100 },
    classificationCoverage: { evidenceSupported: registered, total, percentage: Math.round((registered / total) * 10000) / 100 },
    uniquenessIssues,
    batchValidationIssues,
    reconciled,
  };
}

function main() {
  const report = buildFullReport();

  if (report.uniquenessIssues.some((i) => i.severity === "error") || report.batchValidationIssues.some((i) => i.severity === "error")) {
    console.error("Registration FAILED validation — see issues below. No files written.");
    for (const issue of [...report.uniquenessIssues, ...report.batchValidationIssues]) {
      console.error(`  [${issue.severity}] ${issue.message}`);
    }
    process.exit(1);
  }

  fs.writeFileSync(path.join(REPO_ROOT, "supabase/migrations/016_educational_identity_batch1_english_maths.sql"), generateBatch1MigrationSql(), "utf-8");
  fs.writeFileSync(path.join(REPO_ROOT, "supabase/migrations/017_educational_identity_batch2_writing_vocabulary.sql"), generateBatch2MigrationSql(), "utf-8");
  fs.writeFileSync(path.join(REPO_ROOT, "supabase/migrations/018_educational_identity_batch3_reasoning_subjects.sql"), generateBatch3MigrationSql(), "utf-8");

  fs.writeFileSync(path.join(REPO_ROOT, "EDUCATIONAL_IDENTITY_RECONCILIATION_REPORT.json"), JSON.stringify(report, null, 2), "utf-8");

  console.log(`Scanned ${report.totalScanned} real educational items across 8 sources.`);
  console.log("By status:", report.byStatus);
  console.log("Identity coverage:", report.identityCoverage);
  console.log("Classification coverage:", report.classificationCoverage);
  console.log("Wrote migrations 016, 017, 018 and EDUCATIONAL_IDENTITY_RECONCILIATION_REPORT.json");
}

if (require.main === module) {
  main();
}
