# QT-RC-01 Pilot — Original Angel Item

**Prepared:** 2026-08-10, per the frozen Authoring Brief.
**Step:** 3-4 of 9. **This item is a controlled Release 1 educational artefact — it has NOT been inserted into `ali_question_bank` or any production table.**

---

## Item

| Field | Value |
|---|---|
| Proposed `id` | `eng-001-q5` (next available slot in the existing "The Lighthouse Mystery" learning unit — not yet reserved or written anywhere) |
| `subject` | `english` |
| `skill` (Question Type) | `QT-RC-01` |
| Competency | RC-01 (Literal Retrieval from Narrative Text) |
| `pathway` | `['csse']` |
| `content_difficulty` | `easy` |
| `question_type` | `short-answer` |
| `estimated_time_seconds` | `45` |
| `learning_unit_id` | `eng-001` (shares the existing passage, matching the established convention) |
| `mastery_threshold` | `2` (matches the `easy` default per `ali_mastery_defaults`, migration 005) |

**Passage used (existing Angel content, `eng-001`, already live since migration 013 — not newly authored, not CSSE's text):**

> *"The wind whipped across the harbour as Mira pressed herself against the cold stone wall of the lighthouse. Three weeks had passed since the keeper had vanished, and still no explanation had emerged. The light continued to sweep the dark water in its steady, mechanical arc, indifferent to the mystery it illuminated.*
>
> *She had found the notebook wedged behind a loose brick on the second landing — its pages dense with cramped handwriting, each entry growing more frantic than the last. The final entry simply read: "It knows I'm here."*
>
> *Above her, the great lens hummed and revolved. Somewhere below, the sea answered with its patient, ancient rhythm. Mira turned the notebook over in her hands. Whatever had happened here, the lighthouse held its secrets close."*

**Question:**

> Where exactly did Mira find the notebook?

**Marks:** 1

**Model answer:** Wedged behind a loose brick on the second landing.

**Hint (optional, per `QUESTION_AUTHORING_STANDARD.md` §1 — omitted here):** not included; the stem is already narrowly scoped, matching the brief's "no whole-passage scanning" requirement, so a hint is not needed for an `easy`-tier item per the Standard's own guidance ("optional for easy").

**Explanation:** The passage states directly: "She had found the notebook wedged behind a loose brick on the second landing." This is a single, explicitly-stated fact requiring only location, not interpretation — Assessment Brain QT-RC-01, competency RC-01.

## Scoring Architecture Check (Step 4)

**Acceptable answer form:** open free-text short answer; per `AEP-002` Observation 7's evidenced convention (mark schemes instruct flexible/paraphrase acceptance), a scorer should accept any answer that correctly identifies "wedged behind a loose brick on the second landing" in substance, not only verbatim — e.g. "behind a brick on the second landing" should score full marks; "in the lighthouse" should not (too vague to demonstrate genuine location).

**Scoring rule:** standard binary correct/incorrect for a 1-mark literal-retrieval item — no partial credit, matching every other existing `short-answer` English item already in `ali_question_bank` (e.g. `eng-001-q2`, `eng-002-q3`).

**Proof that no special-case scoring workaround is required:** this item uses exactly the same `question_type: 'short-answer'` grading pathway as all four existing `eng-001-*` items and, more broadly, as `QT-RC-01`'s own already-authenticated instances (`eng-003-q3` uses the same short-answer mechanism for QT-RC-08). No compound-answer checker (like `mth-006`'s semicolon-split case, flagged in `RELEASE_1_GAP_ANALYSIS.md` §4), no new answer format, no new UI component is needed. The standard architecture is sufficient — nothing to STOP and report here.

## Why This Item Satisfies the Brief

- **One reasoning step:** locate the sentence naming the notebook's location, transcribe it.
- **Stem narrows the search space:** "found the notebook" points directly at one sentence in paragraph 2, matching the source pattern's scoped-stem convention.
- **No forced fit:** the fact is unambiguous and singular — no competing interpretation, no judgement required, cleanly RC-01 and nothing else.
- **Original:** new question against Angel's own existing passage; no CSSE character, scenario, or wording is present anywhere in this item.
