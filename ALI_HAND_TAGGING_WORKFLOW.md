# ALI Hand-Tagging Workflow

**Purpose:** The concrete, step-by-step workflow for turning this repo's existing real question content into rows ready for `ali_question_bank`. The taxonomies and per-question standards this workflow follows are already fully defined and are **not repeated here** — this document is the process wrapper around them (who does what, in what order, what the deliverable looks like), not a re-derivation of the taxonomies themselves.

**Standing principle, unchanged since Slice 1 (Decision 3):** metadata generation is not automated. A human makes every tagging judgement (competency, difficulty, mastery threshold override). This workflow's job is to make that human judgement easy to apply consistently and easy to review — not to remove it.

**Companion documents (read these for the actual tagging rules):** `QUESTION_AUTHORING_STANDARD.md` (§1–§10 Verbal Reasoning, §11 Mathematics), `ENGLISH_COMPETENCY_FRAMEWORK.md` (Reading Comprehension).

---

## 0. What "done" looks like

One worksheet (spreadsheet or structured file — §5 covers format) per subject, with one row per **question** (not per Learning Unit — a Reading Comprehension passage still produces multiple rows, one per question, sharing a `learning_unit_id`). Every row has every field in §3 filled in, has passed the review pass in §4, and has explicit sign-off per §6 before it goes anywhere near `ALI_SEEDING_PLAN.md`'s import step.

---

## 1. Verbal Reasoning tagging

**Source content:** `data/verbal-reasoning/*.ts` — 52 real questions across `analogies.ts`, `base.ts`, `codes.ts`, `hidden-words.ts`, `sequences.ts`, `vocabulary.ts`.

**Taxonomy to apply:** `QUESTION_AUTHORING_STANDARD.md` §3 — 10 competency codes (`vr.analogies`, `vr.odd-one-out`, `vr.synonyms`, `vr.antonyms`, `vr.letter-codes`, `vr.number-codes`, `vr.word-codes`, `vr.hidden-words`, `vr.sequences`, `vr.compound-words`), derived from the app's existing `category` field on `ReasoningQuestion` (Decision 13) — for VR specifically, the category field already gives a strong starting signal per question; the tagging task is mapping each question's existing `category` to the matching `vr.*` code and confirming it's correct, not inventing a category from scratch.

**Learning Unit:** each question is its own unit — `learning_unit_id` = the question's own `id` (e.g. `vr-001` → `learning_unit_id: "vr-001"`). No shared-unit judgement needed for this subject.

**Difficulty calibration:** §4.1 (general rubric) and §4.2 (per-competency worked calibration) and §4.5 (`estimated_time_seconds` baselines by competency).

---

## 2. Mathematics tagging

**Source content:** `data/maths.ts` — 20 real questions (`mathsQuestions` + `quickArithmetic`).

**Taxonomy to apply:** `QUESTION_AUTHORING_STANDARD.md` §11.2 — 16 competency codes. Unlike VR, `MathsQuestion` has no existing `category` field to start from (§11.1) — the tagging task here is genuinely reading each question and assigning the competency that matches what it actually tests, using §11.2's table of real question-ID examples as the reference point (e.g. `mth-004`/`qa-006` → `maths.fractions`).

**Learning Unit:** each question is its own unit — `learning_unit_id` = the question's own `id`. Same as VR, no shared-unit judgement needed.

**Difficulty calibration:** §11.4 — includes explicit per-competency notes (e.g. `maths.algebra` scales with number of steps, not any single step's difficulty; `maths.problem-solving` should rarely be tagged `easy`).

**Multi-topic questions:** §11.3's rule applies — tag by the dominant skill that determines correctness, not every topic the surface content touches (e.g. `mth-003` → `maths.algebra`, not `maths.geometry`, per the worked example already in the standard).

---

## 3. English Reading Comprehension tagging (passage + Learning Unit)

**Source content:** `data/lessons.ts` — 3 real passages (`eng-001`, `eng-002`, `eng-003`), 10 real questions total.

**Taxonomy to apply:** `ENGLISH_COMPETENCY_FRAMEWORK.md` §3 — but **only the 2 approved competencies** (`english.inference`, `english.vocabulary-in-context`) are in scope for tagging right now (Decision 38). The framework document's §2 already shows the dominant-skill resolution for all 10 real questions (e.g. `eng-001-q1`, tagged `atmosphere` in the legacy `SkillType` field, resolves to `english.inference` under the one-primary-competency rule) — this tagging pass is applying that already-worked-through mapping to the worksheet, not re-deriving it.

**Learning Unit — the one genuinely new judgement this subject requires:** every question belonging to the same passage shares one `learning_unit_id`. Concretely: `eng-001-q1` through `eng-001-q4` all get `learning_unit_id: "eng-001"` (using the passage's own lesson id as the unit id is the simplest convention, mirroring how atomic subjects use their own question id). Do not invent a separate unit-id scheme — reuse the passage's existing `data/lessons.ts` `id`.

**Passage text duplication:** per `EnglishComprehensionPrompt`'s shape (`types/ali/questionBank.ts`), each question's own `prompt` carries a full copy of `passageTitle`/`passageText` — this is intentional (every question is self-contained, matching how `ReasoningQuestion`/`MathsQuestion` prompts are also self-contained), not a mistake to be deduplicated. When filling in the worksheet, copy the same passage text into every sibling question's row.

**Marks and model answer:** `data/lessons.ts`'s existing `marks` (2–4) and `modelAnswer` fields map directly — `marks` → `prompt.marks`, `modelAnswer` → both `prompt.modelAnswer` and the top-level `explanation` field (they should be identical; `explanation` is what the existing `scoreAnswer()` heuristic is scored against).

**Difficulty calibration:** no existing per-question difficulty signal exists in `data/lessons.ts` today (unlike VR's `category` field) — assign `content_difficulty` using the general rubric (`QUESTION_AUTHORING_STANDARD.md` §4.1), calibrated against the fact that these are the hardest-register passages in the app (historical/literary extracts, `year5-advanced`/`year5-core` app-level `Difficulty`) — expect most real English questions to land `medium`/`hard`, not `easy`.

---

## 4. Required metadata fields (every subject)

Every row needs every one of these before it's ready for import — this table is the same across all three subjects; only the *values* differ per §1–§3 above.

| Field | Source | Notes |
|---|---|---|
| `id` | Existing question id in the data file | Never invented — reuse `vr-0xx`/`mth-0xx`/`qa-0xx`/`eng-0xx-qN` exactly |
| `subject` | Fixed per worksheet (`verbal-reasoning` / `maths` / `english`) | Already valid in `subject_type` post-migration 004 |
| `skill` | This document's §1–§3 tagging pass | Fine-grained competency code, not the legacy `SkillType` |
| `pathway` | `["gl"]` for all current content | No non-GL adaptive content exists yet for any subject |
| `content_difficulty` | Tagging pass, per subject's calibration notes | `easy` / `medium` / `hard` / `challenge` |
| `question_type` | `"multiple-choice"` (VR/Maths using them) or `"short-answer"` (VR/Maths free-numeric) / `"open-response"` (English) | Matches each subject's existing synthetic fixture convention |
| `estimated_time_seconds` | Tagging pass, per subject's baseline table | VR: §4.5. English: no baseline table exists yet — estimate conservatively (90–150s given passage-reading time) until real timing data exists |
| `prompt` | The question's existing full content, reshaped into jsonb | `ReasoningQuestion` / `MathsQuestion` / `EnglishComprehensionPrompt` shape respectively |
| `explanation` | Existing `explanation`/`modelAnswer` field | Required, not nullable |
| `hint` | Existing `hint` field, if present | Nullable |
| `confidence_weight` | Default `1.00` unless a reviewer has a specific reason to override | Not used by any Slice-1-era logic yet — safe to leave at default |
| `learning_objective` | Optional, leave blank unless a reviewer wants to add one | Not used by any current logic |
| `revision_priority` | Default `3` unless a reviewer has a specific reason to override | 1–5 scale |
| `mastery_threshold` | From `ali_mastery_defaults` by `content_difficulty` (2 for easy/medium, 3 for hard/challenge) unless a reviewer overrides per-question | Per-question override takes precedence over the config table (Decision 10) |
| `learning_unit_id` | §1–§3 above | `= id` for VR/Maths; shared passage id for English |
| `usage_count` / `avg_success_rate` | Leave as `0` / `null` | Populated by real usage after import, never hand-set |

---

## 5. Worksheet format

A single spreadsheet (or CSV) per subject, one row per question, columns matching §4's table exactly (so the eventual import script in `ALI_SEEDING_PLAN.md` can map columns directly). `prompt`'s nested structure is the one field that can't be a flat spreadsheet cell — either a JSON-string column, or a small set of sub-columns (`prompt_question`, `prompt_answer`, `prompt_passageText`, etc.) that the import step assembles into the real jsonb shape. Either is acceptable; pick whichever is easier for the tagger to fill in by hand.

---

## 6. Quality review steps

1. **Self-check against the standard.** Before submitting a worksheet row as done, the tagger re-reads the relevant standard section (§1–§3 above) and confirms: one primary competency only (never multi-tagged), difficulty matches the calibration notes (not just a gut feeling), `estimated_time_seconds` is in the right ballpark for the competency.
2. **Independent second-reader spot check.** A reviewer who did not do the original tagging checks a sample — not every row, but enough to catch systematic misunderstandings early: for a worksheet of 10–20 rows (English, or a VR/Maths sub-batch), check at least 5; for the full 52-row VR or 20-row Maths worksheet, check at least 10. The reviewer re-applies §1–§3's rules independently and flags any row where they'd have tagged differently.
3. **Learning Unit check (English only).** Confirm every question sharing a passage has the identical `learning_unit_id`, and that no two different passages accidentally share one (a passage-linking bug here would let two unrelated passages' questions get shuffled together at selection time — the one failure mode Learning Units exist specifically to prevent).
4. **Disagreement resolution.** Any row where the second reader disagrees gets discussed and re-tagged by consensus, not overruled unilaterally — if the two of you can't agree, that's a signal the taxonomy itself may need a §1–§3 refinement, not just a tagging fix (the same discipline that produced Decisions 13/33/38 in the first place).

---

## 7. Sign-off process

- [ ] Every row in the subject's worksheet has passed the self-check (§6.1).
- [ ] The spot-check sample (§6.2) has been reviewed with zero unresolved disagreements.
- [ ] (English only) The Learning Unit check (§6.3) is complete.
- [ ] The worksheet is committed or otherwise saved somewhere durable (not just a local unsaved file) before import.
- [ ] Explicit written sign-off — a message or commit stating "VR / Maths / English worksheet approved for import" — before `ALI_SEEDING_PLAN.md`'s import step runs against it. No worksheet goes into `ali_question_bank` without this step; it's the same "approval before implementation" discipline this project has followed since the very first Blueprint→Validation→Implementation phase.
