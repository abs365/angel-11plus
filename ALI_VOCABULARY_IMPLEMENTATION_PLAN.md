# ALI Vocabulary Implementation Plan

**Phase:** ALI 2.2 — Vocabulary Intelligence. Fourth ALI-covered subject. Companion to `VOCABULARY_COMPETENCY_FRAMEWORK.md` (taxonomy, Learning Unit interpretation). This document covers metadata strategy, the adaptive-selection approach, correctness model, and validation — then the actual implementation follows, reusing the existing architecture exactly (no `lib/ali/*` module changed to accommodate this subject, same proof point as Mathematics and Reading Comprehension).

---

## 1. Metadata strategy

### 1.1 Even lighter than Reading Comprehension — zero new migration

- `subject_type` already includes `'vocabulary'` (migration 001, one of the original 5 values) — no enum change.
- `question_type` stays `'multiple-choice'` — already the default value on `ali_question_bank`, and Vocabulary's items are genuinely MCQ (unlike English's free-text), so no new `question_type` value is needed either (English needed `'open-response'`; Vocabulary needs nothing new at all).
- `learning_unit_id` (migration 007) is already subject-agnostic — Vocabulary reuses the column with no schema change, exactly as designed.
- **No migration 008 is created for this phase.** This is a real, checked finding, not an assumption: Vocabulary is the first ALI subject to require zero net-new schema across the board.

### 1.2 Prompt shape — new type, reusing existing fields

```ts
export interface VocabularyPrompt {
  id: string;
  word: string;
  question: string;       // e.g. "Which word is closest in meaning to 'trepidation'?"
  options: string[];       // 4 options, exactly one correct
  correctAnswer: string;
  skill: SkillType;         // "vocabulary" — legacy bridge, same value English's vocabulary-in-context questions already use
  marks: number;            // 1 per item, MCQ
}
```
Added to `BankQuestion.prompt`'s union (`types/ali/questionBank.ts`) alongside `ReasoningQuestion | MathsQuestion | EnglishComprehensionPrompt`. `explanation` (top-level `BankQuestion` field) carries the reasoning for the correct answer, same convention as every other subject.

### 1.3 Where the MCQ options come from

Each of the 3 approved competencies reshapes an existing `VocabWord` field into an MCQ item, using **real word data**, not fabricated content, at hand-tagging time:
- `vocabulary.synonyms`: "Which word means the same as X?" — correct answer from `synonyms[]`, distractors from other words' unrelated synonyms/antonyms.
- `vocabulary.antonyms`: "Which word means the opposite of X?" — correct answer from `antonyms[]`, distractors similarly.
- `vocabulary.in-context`: "Which sentence uses X correctly?" — correct answer is the word's own `exampleSentence` (or a close paraphrase), distractors are other words' example sentences with the target word substituted incorrectly.

Distractor selection is a real authoring judgement (avoiding accidentally-plausible wrong answers), not something to automate — same principle as every other subject's hand-tagging.

---

## 2. Correctness model — the third distinct grading paradigm, and why it's the simplest one

VR/Maths: exact-match against a single correct value. English: keyword-overlap heuristic against a model answer (approximate). **Vocabulary's adaptive MCQ items are exact-match**, like VR/Maths — a real advantage of reshaping vocabulary content into MCQ form rather than reusing the existing self-report flashcard mechanic. `isCorrect = (selectedOption === correctAnswer)`, no heuristic, no full-marks-only special case needed (Decision 37 doesn't apply here — there is no partial credit on a single-answer MCQ item).

**The existing flashcard/self-report activity (`app/vocabulary/page.tsx`) is untouched** — this phase adds a new, separate adaptive MCQ practice mode, exactly the same isolation convention as every prior ALI subject (new route beside the existing one, zero changes to the static experience).

---

## 3. Adaptive-selection approach — Learning Unit, reused exactly

Per `VOCABULARY_COMPETENCY_FRAMEWORK.md` §6, Learning Unit = one word + every item generated from it. This is **structurally identical** to Reading Comprehension's passage-grouping (`lib/ali/learningUnit.ts`'s `groupQuestionsByLearningUnit()`/`selectLearningUnit()`), just at a smaller scale (up to 3 items per unit, vs. 2–4 questions per passage). Zero changes to `lib/ali/learningUnit.ts` are required — the module is already fully generic over `learningUnitId`, with no subject-specific logic inside it. This is the concrete re-test of Decision 36's claim that future Learning Units "plug into the same pair with zero further changes to either function."

**Consequence:** the adaptive Vocabulary route selects one word (Learning Unit) per session using the exact same cooldown/weak-skill-override priority as English, and presents every item belonging to that word together.

---

## 4. What does not change

`lib/ali/selection.ts`, `lib/adaptiveMockBuilder.ts`, `lib/ali/mastery.ts`, `lib/ali/weakness.ts`, `lib/ali/history.ts`, `lib/ali/questionBank.ts`, `lib/ali/config.ts`, `lib/adaptiveEngine.ts`, `lib/parentInsights.ts` — none of these need any change. `lib/ali/labels.ts` gains exactly 3 new entries (`vocabulary.synonyms`, `vocabulary.antonyms`, `vocabulary.in-context`), the same small, additive change every prior subject needed.

---

## 5. Validation approach

Same pure-function `npx tsx` script technique as every prior phase, extended to cover:
1. Adaptive vocabulary selection — a word (Learning Unit) is chosen and all its items presented together, never split.
2. Competency tracking — `vocabulary.synonyms`/`vocabulary.antonyms`/`vocabulary.in-context` mastery/weak states computed correctly and independently (mirroring Phase 2.1's inference/vocabulary-in-context independence check, this time within Vocabulary's own 3 competencies).
3. Parent Intelligence — `competencySummaries` includes a `vocabulary` entry with correct human labels.
4. Daily Missions — a weak Vocabulary competency can become the primary mission item.
5. No regressions — VR + Maths + English + Vocabulary coexist with zero cross-subject signal leakage (4-way, extending Decision 39's 3-way check).

---

## Explicitly out of scope for this document

No hand-tagging of the real 12 words happens here (`VOCABULARY_COMPETENCY_FRAMEWORK.md` §7) — a synthetic dev fixture (fabricated illustrative words, not the real 12) unblocks code development in parallel, same precedent as every prior subject.
