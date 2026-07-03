# English Competency Framework

**Phase:** ALI 2.1 — English Intelligence, Step 1–2 (competency taxonomy + metadata requirements). **Design only. No code, no schema, no migrations.** Companion to `ALI_ENGLISH_IMPLEMENTATION_PLAN.md` (Steps 3–4 of this phase) and `QUESTION_AUTHORING_STANDARD.md` (the existing permanent standard this framework extends with an English section, same way §3 covers Verbal Reasoning and §11 covers Mathematics).

---

## 0. Scope decision: Reading Comprehension only

`Lesson.subject` (`types/index.ts`) already separates three distinct English-language content types: `"english"` (reading comprehension), `"vocabulary"`, `"writing"`. `ALI_VERSION.md`'s Roadmap already treats Vocabulary as its own future phase (2.2, after English). This framework covers **Reading Comprehension only** (`data/lessons.ts`, `englishLessons`, `subject: "english"`) — matching both the existing type boundary and the roadmap's stated ordering. Vocabulary (`data/vocabulary.ts`) and Writing (`data/writing.ts`) are reviewed briefly in §5 to explain why each needs its own future design pass rather than being folded in here silently, but neither is in scope for Phase 2.1.

---

## 1. Content actually reviewed

All 3 real English Reading Comprehension lessons in `data/lessons.ts`, 10 questions total:

| Lesson | Passage genre | Questions | Legacy `skill` tags used |
|---|---|---|---|
| `eng-001` "The Lighthouse Mystery" | Suspense narrative | `eng-001-q1..q4` | atmosphere, vocabulary, inference, inference |
| `eng-002` "The Boy Who Collected Silence" | Literary/character narrative | `eng-002-q1..q3` | character, inference, evidence |
| `eng-003` "Letters from the Trenches" | Historical epistolary narrative | `eng-003-q1..q3` | inference, inference, evidence |

Real usage count of the app's existing `SkillType` values relevant to English (`types/index.ts`): **inference ×5, evidence ×2, atmosphere ×1, character ×1, vocabulary ×1**. Two more English-relevant `SkillType` values are defined but used by **zero** real questions: `explanation`, `structure`.

---

## 2. The key refinement finding

Reviewing all 10 real questions closely (the same discipline Decision 13/33 applied to Verbal Reasoning and Mathematics — derive the taxonomy from what the content actually tests, not from the tag it happens to carry) surfaces a real mismatch: **`atmosphere`, `character`, and `evidence` are topic labels, not distinct cognitive skills.**

Every one of these 4 questions asks the same underlying thing — identify specific textual evidence and infer meaning, effect, or personality from it:

- `eng-001-q1` (tagged `atmosphere`): "What atmosphere does the writer create... **use evidence from the text**" — an inference from evidence, about mood.
- `eng-002-q1` (tagged `character`): "What impression do you get of Leo's character... **use at least two pieces of evidence**" — an inference from evidence, about personality.
- `eng-002-q3` (tagged `evidence`): "What does this simile tell us about Leo?" — an inference from a specific piece of evidence (the simile) already selected for the student.
- `eng-003-q3` (tagged `evidence`): "How does Thomas try to reassure his mother? Find three specific examples" — closer to genuine evidence-selection than the others, but the model answer's actual mark-earning content ("directly acknowledging her concern," "creating a sense of connection") is still explanatory inference about *why* each example works, not bare retrieval of the examples themselves.

Structurally, these 4 questions are indistinguishable from the 5 questions already tagged `inference` (e.g. `eng-003-q1`: "What does Thomas mean when he says he 'no longer recognises the young man'... What has changed?"). The legacy tags describe *what part of the text* the question is about (atmosphere, character, a piece of evidence) rather than *what skill* is being tested (inferring meaning from evidence). This mirrors Decision 34's Mathematics finding that a question can touch several surface topics while testing one dominant reasoning step — here it's the reverse direction: several different *surface labels* were used for what is really one dominant *reasoning skill*.

**Conclusion:** these 9 of 10 real questions collapse into a single grounded competency, `english.inference`, under the "one primary competency per question" rule (§4). Only `eng-001-q2` ("What does the word 'frantic' tell us...") is a genuinely distinct skill — reasoning about a specific word's meaning in context, not inferring meaning/character/atmosphere from a passage-level pattern of evidence.

---

## 3. Proposed competency taxonomy

Following the same taxonomy discipline as VR (10 competencies, Decision 13) and Mathematics (16 competencies, Decision 33): derive what's real, and be explicit about what's defined-for-the-future versus what's a genuine content or format gap — not a single list pretending every category is equally ready.

### 3.1 Populated today (real questions exist)

| Competency code | Label | What it tests | Real example |
|---|---|---|---|
| `english.inference` | Inference | Inferring meaning, character, atmosphere, or effect from textual evidence — the writer implies rather than states it directly | `eng-001-q1`, `eng-001-q3`, `eng-001-q4`, `eng-002-q1`, `eng-002-q2`, `eng-002-q3`, `eng-003-q1`, `eng-003-q2`, `eng-003-q3` (9 questions — see §2 for why atmosphere/character/evidence tags collapse here) |
| `english.vocabulary-in-context` | Vocabulary in Context | The meaning or effect of a specific word or phrase *as used in this passage* — distinct from the standalone `vocabulary.ts` word-bank, which tests word knowledge independent of any passage | `eng-001-q2` ("What does the word 'frantic' tell us...") |

### 3.2 Defined, no real content yet (standard 11+ comprehension categories, genuinely absent from the current 3 passages)

| Competency code | Label | What it would test | Status |
|---|---|---|---|
| `english.retrieval` | Retrieval | Locating an explicit, literally-stated fact directly from the text, with no interpretation required | *(none — every real question requires interpretation; not one question in the current bank asks the student to simply locate a stated fact)* |
| `english.authors-purpose` | Author's Purpose | Why the writer made a specific structural or stylistic choice, or the overall intent of a passage (inform/persuade/entertain/describe) — distinct from `inference`, which is about what a detail implies, not why the writer chose the technique | *(none — closest is the `atmosphere`-tagged question, but that asks what effect is created, not why the writer chose to create it; a genuinely distinct construct)* |
| `english.sequencing` | Sequencing | Correctly ordering events, ideas, or steps described across a passage | *(none)* |
| `english.summarising` | Summarising | Condensing a passage or section into its key points, in the student's own words | *(none — all 3 passages are short single-scene extracts; summarising needs a longer or multi-section passage to test meaningfully)* |
| `english.prediction` | Prediction | Inferring a likely *future*, unstated event from the evidence and trajectory established so far — narrower than `english.inference`, which covers meaning already present in the text, not events yet to come | *(none)* |

### 3.3 Genuine structural gap, not just a content gap

| Competency code | Label | Why this is a bigger gap than §3.2 |
|---|---|---|
| `english.grammar` | Grammar | No standalone gradable question of this type exists anywhere in the app. Grammar only appears as unscored self-check checklist bullets inside Writing prompts (`data/writing.ts`, e.g. "Check paragraphing and punctuation carefully") — never as a `Question` object with a correct answer. |
| `english.punctuation` | Punctuation | Same gap — checklist-only today (e.g. "Check: commas, speech marks, capital letters, full stops" in `wrt-001`), never a gradable item. |
| `english.spelling` | Spelling | Same gap — no spelling-testing content exists in any form, checklist or otherwise. |

Populating §3.2 is a content-authoring task (write new passages/questions in the existing `Question` shape). Populating §3.3 requires a **new discrete question format** first (e.g. "select the correctly punctuated sentence" as a multiple-choice item) — the current app has no mechanic for testing grammar/punctuation/spelling as an atomic, machine-gradable question at all, unlike Retrieval/Author's Purpose/Sequencing/Summarising/Prediction, which just need new passages written in the format that already exists. This distinction is carried into `ALI_ENGLISH_IMPLEMENTATION_PLAN.md` §3 as a scoping boundary for the first build slice.

---

## 4. One primary competency per question

Per Step 2's instruction and the same rule already established for Mathematics (`QUESTION_AUTHORING_STANDARD.md` §11.3, Decision 34): every English question gets exactly one primary competency, tagged by the dominant reasoning step that determines whether the answer earns marks — not every topic or skill the question's surface content touches.

**Worked resolution of the hardest real case:** `eng-001-q1` asks about atmosphere *and* requires citing evidence *and* implicitly rewards vocabulary awareness (the model answer discusses word choices like "indifferent"). Under the one-primary-competency rule, this is tagged `english.inference` — the reasoning step actually being assessed is inferring an intended effect from evidence, not identifying vocabulary or naming the atmosphere in isolation. The same resolution applies to all 8 other questions folded into `english.inference` in §2.

---

## 5. Vocabulary and Writing — briefly reviewed, confirmed out of scope

- **Vocabulary (`data/vocabulary.ts`, 12 words)** — word/definition/synonym/antonym data, no passage dependency, structurally closer to an atomic MCQ-style item than Comprehension is (a "choose the correct synonym" question fits ALI's existing selection model cleanly). This makes Vocabulary a **more** straightforward future ALI subject than Comprehension, not less — worth noting for whoever scopes Phase 2.2, but not built here.
- **Writing (`data/writing.ts`, 4 prompts + `app/api/writing-feedback/route.ts`)** — extended free-response essays, self-checked against a checklist, with an existing LLM-based feedback endpoint that already produces a 0–100 `overallScore`. This is structurally the *furthest* from ALI's atomic per-question model of any English-language content (one submission, one holistic score, no per-competency breakdown at all today) — a future ALI pass on Writing would need its own design work on what a "competency" even means for a single extended piece, not a natural extension of this framework's taxonomy.

Neither is touched by Phase 2.1. Both are flagged here so a future reader knows they were considered and deliberately deferred, not overlooked.

---

## Explicitly out of scope for this document

No code, schema, migrations, or hand-tagging of the real 10 questions happens here. This document defines the taxonomy and explains its grounding; `ALI_ENGLISH_IMPLEMENTATION_PLAN.md` covers metadata field strategy in schema terms, the adaptive-behaviour review, validation approach, and migration strategy.
