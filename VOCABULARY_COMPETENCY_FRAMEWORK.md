# Vocabulary Competency Framework

**Phase:** ALI 2.2 — Vocabulary Intelligence, taxonomy definition. Companion to `ALI_VOCABULARY_IMPLEMENTATION_PLAN.md` (metadata strategy, adaptive approach, validation). Same discipline as `ENGLISH_COMPETENCY_FRAMEWORK.md` — derive the taxonomy from what the real content actually supports, not from the suggested list wholesale.

---

## 1. Content actually reviewed

`data/vocabulary.ts` — 12 real words (`voc-001`–`voc-012`). `VocabWord` (`types/index.ts`) has exactly these fields: `word`, `definition`, `synonyms: string[]`, `antonyms: string[]`, `exampleSentence`, `difficulty`, `category: "tier2" | "tier3" | "literary"`. Every one of the 12 real words has a non-empty `synonyms` array (4–5 entries), a non-empty `antonyms` array (3–5 entries), and a real `exampleSentence`.

The existing activity (`app/vocabulary/page.tsx`) is a flashcard session: reveal definition/synonyms/antonyms/example, then **self-report** "I knew it" / "Still learning" — plus an unscored "sentence challenge" (student writes a sentence using the word; never checked against anything, just redisplayed). **There is no machine-graded question anywhere in the existing Vocabulary activity** — a third distinct grading paradigm alongside VR/Maths's exact-match and English's keyword-heuristic (§3 of `ALI_VOCABULARY_IMPLEMENTATION_PLAN.md` covers what this means for ALI).

---

## 2. Suggested taxonomy checked against real content

| Suggested competency | Real grounding in `VocabWord`? |
|---|---|
| Synonyms | **Yes** — `synonyms: string[]` populated on all 12 words |
| Antonyms | **Yes** — `antonyms: string[]` populated on all 12 words |
| Vocabulary in Context | **Partial-but-real** — `exampleSentence` exists on all 12 words, and the existing UI already treats "use it in a sentence" as a real (if ungraded) activity |
| Multiple Meanings | **None** — `VocabWord` has exactly one `definition` field; no polysemy/sense-disambiguation structure exists anywhere |
| Prefixes | **None** — no morphological breakdown field |
| Suffixes | **None** — same |
| Root Words | **None** — same |
| Homophones | **None** — none of the 12 real words are homophone pairs (trepidation, melancholy, resolute, turbulent, indomitable, desolate, meticulous, enigmatic, luminous, tenacious, austere, ephemeral — all single academic/literary words, not phonetic-confusion pairs) |
| Idioms | **None** — all 12 are single words, not multi-word idiomatic phrases |
| Word Families | **None** — no family/derivational grouping field exists |

**Conclusion, same discipline as Decision 13/33/38:** 3 of the 10 suggested competencies have direct, real grounding; the other 7 have zero structural support in the current content or schema. Populating them would require both new content **and** a new schema shape (a morphology/multi-sense field `VocabWord` doesn't have) — a bigger gap than "no questions authored yet" (English's `english.retrieval` etc.), closer to "the underlying data model doesn't capture this dimension at all." Documented, not force-fitted.

---

## 3. Approved taxonomy (3 competencies, all populated)

| Competency code | Label | What it tests | Real grounding |
|---|---|---|---|
| `vocabulary.synonyms` | Synonyms | Selecting the closest-meaning word from options | `synonyms[]`, all 12 words |
| `vocabulary.antonyms` | Antonyms | Selecting the opposite-meaning word from options | `antonyms[]`, all 12 words |
| `vocabulary.in-context` | Vocabulary in Context | Recognising correct usage of a word within a sentence | `exampleSentence`, all 12 words |

## 4. Roadmap-only (7 competencies, zero content, schema gap)

`vocabulary.multiple-meanings`, `vocabulary.prefixes`, `vocabulary.suffixes`, `vocabulary.root-words`, `vocabulary.homophones`, `vocabulary.idioms`, `vocabulary.word-families` — defined here as placeholders for future authoring, not implemented, not tagged anywhere, no label entry in `lib/ali/labels.ts` (matching Decision 38's "no label for content that doesn't exist yet" precedent). Populating any of these needs a schema change to `VocabWord` (or a parallel authoring format) before it needs a tagging pass — a prerequisite this document doesn't attempt to design.

---

## 5. One primary competency per item — and what "item" means here

Every real word currently supports up to 3 distinct testable facets (a synonym question, an antonym question, a context-usage question) from the same underlying word data. Per the instruction ("every vocabulary item must have one primary competency"), the **item** is the individual question generated from a word for one facet — not the word itself. A single word can produce up to 3 items, each with exactly one competency (`vocabulary.synonyms` / `vocabulary.antonyms` / `vocabulary.in-context`), never a blended tag — same "one primary competency, tagged by what's actually being tested" rule as Decision 34/38.

## 6. Learning Unit = Word Set

Per the standing architectural instruction (Learning Unit = Word Set for Vocabulary), and grounded in the fact above (one word → up to 3 items): the natural, real grouping for a Vocabulary Learning Unit is **one word and every item generated from it** — the "set" is the set of facets tested about a single word, kept together so an adaptive session never asks about a word's synonym in isolation from its antonym/context facet if more than one is being tested. `learning_unit_id` = the word's own `id` (e.g. `voc-001`), shared across that word's synonym/antonym/context items — reusing `lib/ali/learningUnit.ts` exactly as built for Reading Comprehension, zero new selection logic (`ALI_VOCABULARY_IMPLEMENTATION_PLAN.md` §3 covers this in full).

This interpretation is stated explicitly because "word set" could also have meant a themed batch of several distinct words (e.g. grouped by `category`) — that reading was rejected because nothing in the real app currently batches multiple distinct words into one indivisible presentation unit; the real, existing grouping structure is one word ↔ its own multiple facets, which is what "never split apart" actually protects here.

---

## 7. Hand-tagging remains the long-term approach

Per the explicit instruction, this framework does not hand-tag the real 12 words itself — it defines the taxonomy and the item/unit shape so a future authoring pass (same "do not automate metadata generation" principle as VR/Maths/English) can turn each real word into 1–3 real MCQ items. `ALI_HAND_TAGGING_WORKFLOW.md` should gain a Vocabulary section once this framework is approved, following the same pattern as its existing VR/Maths/English sections.

---

## Explicitly out of scope for this document

No code, schema, or migrations are created here. Metadata field strategy, the adaptive-selection approach, and the correctness model for MCQ-style vocabulary items are covered in `ALI_VOCABULARY_IMPLEMENTATION_PLAN.md`.
