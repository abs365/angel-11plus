# WP-02: Proposed Question Metadata — Non-Verbal Reasoning, Spatial Reasoning, Mathematical Reasoning

**Status: PROPOSED — PENDING HUMAN REVIEW throughout this entire document.** Nothing below is authoritative. No value here has been imported into `ali_question_bank` or any application data path, and no existing metadata anywhere has been replaced. Per Decision 3 (this project's standing "do not automate metadata generation" principle, restated for this exact task in the WP-02 clarification), a human reviewer must confirm every row before it is used for anything beyond this proposal.

**Calibration Provenance (per Programme Decision APD-017):**

| Domain | Corpus size | Competency coverage | Repository snapshot |
|---|---|---|---|
| Non-Verbal Reasoning (`data/non-verbal-reasoning/*.ts`) | 40 questions (`nvr-001`–`nvr-040`) | 6 of 6 taxonomy competencies represented (`QUESTION_AUTHORING_STANDARD.md` §12.1) | commit `c17f516` (HEAD at time of tagging) |
| Spatial Reasoning (`data/spatial-reasoning/*.ts`) | 39 questions (`sr-001`–`sr-039`) | 5 of 5 competencies represented, one (`sr.rotation`) with only 1 real question — see Coverage Summary correction below | commit `c17f516` |
| Mathematical Reasoning / `numreason` (`data/numerical-reasoning/*.ts`) | 41 questions (`nr-001`–`nr-041`) | 6 of 6 competencies represented | commit `c17f516` |
| **Total corpus tagged** | **120 questions** — corrects a minor arithmetic error carried in `AEP-002`/`ARR-001`/`IWP-001` ("119"), which summed NVR+SR+numreason as 40+40+39 instead of the verified 40+39+41. Flagged honestly here; not a reason to reopen those frozen documents, only to record the accurate figure going forward. | | |

**Confidence rubric applied** (per the WP-02 clarification): **High** = clean single competency, unambiguous difficulty, explicit pathway, timing well-supported by a directly comparable case. **Medium** = one clearly stronger reading exists among plausible alternatives; difficulty or pathway required judgement. **Low** = genuine, multi-way ambiguity; flagged for priority human review. Confidence reflects confidence in the proposed metadata, not the quality of the question.

**A domain-wide pathway note, stated once rather than repeated 120 times:** NVR pathway (`["gl","cem","iseb"]`) and SR pathway (`["gl","iseb"]`, CEM pending, never `csse`) are High-confidence structural facts from `AEP-002_KNOWLEDGE_FRAMEWORK.md` §6. Mathematical Reasoning (`numreason`) pathway (`["gl","cem","iseb"]`) is **Medium confidence domain-wide** — unlike VR/NVR/Maths, no board names a paper that maps 1:1 onto this content; the assignment is a defensible interpretation, not an explicit source fact, and is flagged once here rather than in all 41 rows.

---

## Non-Verbal Reasoning (40 questions)

### `nvr.pattern-completion` (11 questions)

| ID | Difficulty | Est. time | Confidence |
|---|---|---|---|
| `nvr-001` | Easy | 18s | High |
| `nvr-013` | Easy | 18s | High |
| `nvr-024` | Medium | 30s | Medium |
| `nvr-012` | Medium | 30s | High |
| `nvr-020` | Medium | 32s | High |
| `nvr-023` | Hard | 55s | High *(matches `QUESTION_AUTHORING_STANDARD.md` §12.4's own worked example)* |
| `nvr-025` | Medium | 35s | Medium |
| `nvr-008` | Easy | 20s | High |
| `nvr-016` | Medium | 30s | High *(cited in §12.2)* |
| `nvr-021` | Medium | 30s | High *(cited in §12.2)* |
| `nvr-022` | Easy | 22s | Medium |

### `nvr.symbol-codes` (8 questions)

| ID | Difficulty | Est. time | Confidence |
|---|---|---|---|
| `nvr-007` | Easy | 20s | High |
| `nvr-017` | Medium | 40s | High *(cited in §12.2)* |
| `nvr-018` | Medium | 40s | High *(cited in §12.2)* |
| `nvr-019` | Easy | 20s | High *(cited in §12.2)* |
| `nvr-002` | Easy | 15s | High |
| `nvr-014` | Easy | 20s | High |
| `nvr-015` | Easy | 15s | High |
| `nvr-026` | Hard | 50s | High *(cited in §12.2)* |

### `nvr.rotation` (7 questions)

| ID | Difficulty | Est. time | Confidence |
|---|---|---|---|
| `nvr-003` | Easy | 15s | High |
| `nvr-009` | Medium | 30s | **Low** — see Ambiguous Questions |
| `nvr-027` | Easy | 15s | High *(cited in §12.2)* |
| `nvr-028` | Medium | 30s | High *(cited in §12.2)* |
| `nvr-030` | Medium | 35s | **Low** — see Ambiguous Questions |
| `nvr-039` | Hard | 40s | High *(cited in §12.2)* |
| `nvr-040` | Hard | 45s | High *(cited in §12.2)* |

### `nvr.reflection-symmetry` (8 questions)

| ID | Difficulty | Est. time | Confidence |
|---|---|---|---|
| `nvr-004` | Easy | 18s | High |
| `nvr-029` | Medium | 30s | Medium |
| `nvr-035` | Easy | 18s | High |
| `nvr-031` | Easy | 15s | High *(cited in §12.2)* |
| `nvr-032` | Easy | 15s | High |
| `nvr-033` | Medium | 25s | High *(cited in §12.2)* |
| `nvr-036` | Medium | 28s | **Low** — see Ambiguous Questions |
| `nvr-037` | Hard | 40s | High *(cited in §12.2)* |

### `nvr.shape-properties` (5 questions)

| ID | Difficulty | Est. time | Confidence |
|---|---|---|---|
| `nvr-006` | Easy | 20s | High |
| `nvr-010` | Easy | 18s | High |
| `nvr-034` | Easy | 20s | High |
| `nvr-038` | Hard | 35s | High *(cited in §12.2)* |
| `nvr-011` | Medium | 30s | **Low** — see Ambiguous Questions |

### `nvr.3d-shapes` (1 question — thinnest-populated NVR competency)

| ID | Difficulty | Est. time | Confidence |
|---|---|---|---|
| `nvr-005` | Medium | 35s | Medium — single-question competency, no comparable case exists to validate the timing estimate against |

---

## Spatial Reasoning (39 questions)

### `sr.paper-folding` (8 questions)

| ID | Difficulty | Est. time | Confidence |
|---|---|---|---|
| `sr-001` | Easy | 20s | High |
| `sr-002` | Easy | 20s | High |
| `sr-003` | Medium | 30s | Medium |
| `sr-013` | Easy | 20s | High *(cited in §13.2)* |
| `sr-014` | Medium | 32s | High *(cited in §13.2)* |
| `sr-015` | Hard | 45s | High *(cited in §13.2)* |
| `sr-019` | Hard | 45s | High *(cited in §13.2)* |
| `sr-020` | Medium | 32s | High |

### `sr.compass-grid-navigation` (12 questions)

| ID | Difficulty | Est. time | Confidence |
|---|---|---|---|
| `sr-004` | Easy | 18s | High |
| `sr-012` | Medium | 30s | Medium |
| `sr-023` | Easy | 18s | High *(cited in §13.2)* |
| `sr-025` | Easy | 15s | High |
| `sr-027` | Medium | 30s | High *(cited in §13.2)* |
| `sr-030` | Easy | 20s | Medium |
| `sr-031` | Easy | 18s | High |
| `sr-010` | Medium | 35s | Medium |
| `sr-024` | Hard | 40s | High *(cited in §13.2)* |
| `sr-026` | Medium | 32s | Medium |
| `sr-028` | Hard | 45s | High *(cited in §13.2)* |
| `sr-029` | Medium | 30s | **Low** — see Ambiguous Questions |

### `sr.3d-visualisation` (10 questions)

| ID | Difficulty | Est. time | Confidence |
|---|---|---|---|
| `sr-007` | Hard | 60s | Medium |
| `sr-008` | Easy | 20s | High |
| `sr-016` | Easy | 18s | High |
| `sr-017` | Medium | 30s | High *(cited in §13.2)* |
| `sr-018` | Hard | 55s | High *(cited in §13.2 and §13.4's worked example)* |
| `sr-021` | Easy | 22s | High |
| `sr-022` | Easy | 18s | High |
| `sr-035` | Medium | 30s | High *(cited in §13.2)* |
| `sr-036` | Easy | 18s | High |
| `sr-039` | Medium | 28s | Medium |

### `sr.rotation` (1 question only — see Coverage Summary correction)

| ID | Difficulty | Est. time | Confidence |
|---|---|---|---|
| `sr-009` | Medium | 30s | **Low** — see Ambiguous Questions |

### `sr.shape-properties-symmetry` (8 questions)

| ID | Difficulty | Est. time | Confidence |
|---|---|---|---|
| `sr-005` | Easy | 20s | High |
| `sr-006` | Easy | 18s | High |
| `sr-011` | Medium | 32s | Medium |
| `sr-032` | Easy | 18s | High *(cited in §13.2)* |
| `sr-033` | Medium | 30s | High *(cited in §13.2)* |
| `sr-034` | Medium | 28s | Medium — see Ambiguous Questions |
| `sr-037` | Easy | 18s | High *(cited in §13.2)* |
| `sr-038` | Medium | 35s | High *(cited in §13.2)* |

---

## Mathematical Reasoning / `numreason` (41 questions)

*(Domain-wide pathway confidence is Medium throughout, per the note above — the table below shows difficulty/competency confidence only; where a row's only source of Medium/Low is pathway, it is marked "pathway only.")*

### `numreason.sequences-analogies` (12 questions)

| ID | Difficulty | Est. time | Confidence |
|---|---|---|---|
| `nr-001` | Easy | 20s | High (pathway only) |
| `nr-002` | Easy | 20s | High (pathway only) |
| `nr-007` | Medium | 28s | Medium |
| `nr-013` | Hard | 45s | High *(cited in §14.2)* (pathway only) |
| `nr-014` | Easy | 20s | High *(cited in §14.2)* (pathway only) |
| `nr-015` | Medium | 30s | High *(cited in §14.2)* (pathway only) |
| `nr-016` | Medium | 30s | High *(cited in §14.2)* (pathway only) |
| `nr-017` | Medium | 30s | High *(cited in §14.2)* (pathway only) |
| `nr-018` | Easy | 20s | High *(cited in §14.2)* (pathway only) |
| `nr-003` | Medium | 30s | Medium |
| `nr-009` | Easy | 18s | High (pathway only) |
| `nr-011` | Medium | 28s | **Low** — see Ambiguous Questions |

### `numreason.function-machines` (5 questions)

| ID | Difficulty | Est. time | Confidence |
|---|---|---|---|
| `nr-008` | Medium | 28s | High (pathway only) |
| `nr-019` | Medium | 28s | High *(cited in §14.2)* (pathway only) |
| `nr-020` | Hard | 55s | High *(cited in §14.2 and §14.4's worked example)* (pathway only) |
| `nr-021` | Easy | 25s | **Low** — see Ambiguous Questions |
| `nr-022` | Medium | 28s | High *(cited in §14.2)* (pathway only) |

### `numreason.data-statistics` (10 questions)

| ID | Difficulty | Est. time | Confidence |
|---|---|---|---|
| `nr-004` | Easy | 20s | High (pathway only) |
| `nr-010` | Medium | 32s | High *(cited in §14.2)* (pathway only) |
| `nr-034` | Easy | 25s | High *(cited in §14.2)* (pathway only) |
| `nr-035` | Medium | 28s | High (pathway only) |
| `nr-036` | Medium | 30s | High *(cited in §14.2)* (pathway only) |
| `nr-037` | Easy | 20s | High *(cited in §14.2)* (pathway only) |
| `nr-038` | Hard | 40s | High *(cited in §14.2)* (pathway only) |
| `nr-039` | Medium | 25s | High *(cited in §14.2)* (pathway only) |
| `nr-040` | Easy | 22s | Medium |
| `nr-041` | Easy | 22s | High *(cited in §14.2)* (pathway only) |

### `numreason.money-measures` (5 questions)

| ID | Difficulty | Est. time | Confidence |
|---|---|---|---|
| `nr-012` | Medium | 35s | Medium |
| `nr-030` | Easy | 25s | High *(cited in §14.2)* (pathway only) |
| `nr-031` | Medium | 35s | High *(cited in §14.2)* (pathway only) |
| `nr-032` | Medium | 35s | High *(cited in §14.2)* (pathway only) |
| `nr-033` | Hard | 55s | High *(cited in §14.2)* (pathway only) |

### `numreason.percentages` (5 questions)

| ID | Difficulty | Est. time | Confidence |
|---|---|---|---|
| `nr-005` | Easy | 18s | Medium |
| `nr-023` | Easy | 20s | High *(cited in §14.2)* (pathway only) |
| `nr-024` | Medium | 32s | High *(cited in §14.2)* (pathway only) |
| `nr-025` | Easy | 15s | High *(cited in §14.2)* (pathway only) |
| `nr-026` | Medium | 28s | High *(cited in §14.2)* (pathway only) |

### `numreason.ratio-proportion` (4 questions)

| ID | Difficulty | Est. time | Confidence |
|---|---|---|---|
| `nr-006` | Easy | 25s | High (pathway only) |
| `nr-027` | Easy | 22s | High *(cited in §14.2)* (pathway only) |
| `nr-028` | Medium | 32s | High *(cited in §14.2)* (pathway only) |
| `nr-029` | Medium | 30s | High *(cited in §14.2)* (pathway only) |

**Note, honestly recorded:** `numreason.percentages`/`numreason.ratio-proportion` genuinely have no Hard/Challenge-tier real question anywhere in the corpus, exactly as `QUESTION_AUTHORING_STANDARD.md` §14.2 already flagged — no reverse-percentage question exists at all. This is not a tagging gap; it is a content gap, carried forward honestly rather than forced.

---

## Ambiguous Questions Requiring Human Judgement (Low confidence, full detail)

1. **`nvr-009`** (North, two 90° clockwise rotations → South) — difficulty judgement uncertain: each individual step is Easy, but the question is compound. Could reasonably be tagged Easy (the "half turn = opposite direction" shortcut is intuitive) or Medium (genuinely two composed steps). Recommend human comparison against `nvr-039`'s confirmed-Hard compound-rotation case to anchor where this sits.
2. **`nvr-030`** (which capital letter does NOT show 180° rotational symmetry: S/N/H/R) — structurally near-identical to `nvr-037` (confirmed Hard: find the exception among 4 options against a symmetry-type rule), yet was provisionally tagged Medium here for consistency with a plain single rotation. Recommend re-examining both together — they likely deserve the same tier.
3. **`nvr-036`** (numeral 8's lines of symmetry) — competency-mapping question: is a numeral properly `nvr.reflection-symmetry`, or does treating digits as "shapes" need its own carve-out? Difficulty is also uncertain for the same reason as item 2 above (elimination-style vs. direct-recall framing).
4. **`nvr-011`** (large triangle subdivided into 4, count total triangles including the large one) — competency-mapping question: currently under `nvr.shape-properties`, but the actual skill (counting compound/overlapping figures) may be closer to `sr.3d-visualisation`'s counting logic than to identifying shared properties. Recommend confirming whether "Shape Counting" deserves to remain folded into `nvr.shape-properties` at all.
5. **`sr-009`** (letter Z rotated 180° looks the same) — the single real question in `sr.rotation`. Structurally this is a rotational-*symmetry* check (does the rotated figure look identical), not a directional-turn question like `nvr.rotation`'s real content — despite sharing the category label "Rotation." Recommend confirming whether this question is correctly placed in `sr.rotation` at all, or whether it belongs with `sr.shape-properties-symmetry` instead — this is the single most consequential classification question in the whole set, since it is also this competency's *only* question.
6. **`sr-029`** (angle between clock hands at 3:00 = 90°) — tagged under "Grid Navigation" in the source data, but the actual content (a clock face) has nothing to do with grids or compass navigation. Recommend confirming whether this belongs in `sr.compass-grid-navigation` at all, or represents an uncatalogued angle-reasoning sub-skill.
7. **`nr-011`** (number grid, row-sums-to-18, solve for a missing cell) — currently under `numreason.sequences-analogies` (via "Number Grids"), but the underlying skill (apply a stated consistency constraint to solve for an unknown) is structurally closer to `nvr.symbol-codes`'s `nvr-026` than to sequence continuation. Recommend confirming the competency assignment.
8. **`nr-021`** (÷2 then +10 function machine, forward, clean numbers) — tagged Easy here, which would be the *first* genuinely Easy-tier example in `numreason.function-machines` (§14.2 stated no such example existed). Recommend confirming whether a clean two-step forward machine should count as Easy, or whether the competency's Easy tier should remain empty until a true single-step question is authored.

---

## Confidence Assessment (summary)

**Corrected 2026-07-18, per Programme Decision APD-051 (Granular Evidence Precedence) and `WP-22_CONTENT_DISPOSITION.md` §2.** The table below originally read 27/9/4 (NVR), 24/13/2 (SR), 30/8/3 (Math), totalling 81/30/9 — WP-22's review recounted every row directly from this document's own per-competency tables above and found those totals do not reconcile with this document's own detailed data, nor with the "Ambiguous Questions" section's own list of exactly 8 named IDs (not 9). Per APD-051, the verified item-level evidence takes precedence and the aggregate is corrected here; no individual question's difficulty/skill/confidence tag changes as a result — only this summary table's arithmetic.

| Domain | High | Medium | Low | Total |
|---|---|---|---|---|
| Non-Verbal Reasoning | 31 | 5 | 4 | 40 |
| Spatial Reasoning | 27 | 10 | 2 | 39 |
| Mathematical Reasoning | 34 | 5 | 2 | 41 |
| **Total** | **92 (76.7%)** | **20 (16.7%)** | **8 (6.7%)** | **120** |

*(Mathematical Reasoning's High-confidence count reflects difficulty/competency confidence only — its pathway assignment is Medium domain-wide per the note above, so no `numreason` row is High-confidence on every field simultaneously; the table above states this explicitly per row rather than silently inflating the count.)*

---

## Review Summary

The large majority of proposed tags (76.7% High, corrected — see Confidence Assessment above) rest directly on calibration reasoning already published and reviewed in `QUESTION_AUTHORING_STANDARD.md` §12–§14 (WP-01) — these are the lowest-risk rows for a reviewer to confirm quickly. The Medium tier (16.7%) is concentrated in genuinely fresh calibration judgements not covered by a WP-01 worked example, and in Mathematical Reasoning's domain-wide pathway uncertainty. The Low tier (6.7%, 8 questions) is small but disproportionately important — 5 of the 8 are competency-mapping questions, not difficulty questions, meaning the taxonomy itself (not just individual tagging) may benefit from a small refinement once a human reviews them.

**Inconsistencies discovered in the existing question bank, worth reporting even though outside WP-02's own scope to fix:**
- `sr.rotation` has only **1** real question (`sr-009`), not 3 as stated in `AEP-002_KNOWLEDGE_FRAMEWORK.md` §2.4 and `QUESTION_AUTHORING_STANDARD.md` §13.1 — verified by direct `grep` against the source files during this tagging pass. This is a minor citation error in frozen documents, not a defect requiring those documents to reopen, but is recorded here since it directly affects WP-02's own coverage numbers and should inform any future WP-01-style document revision.
- The overall corpus total is **120**, not 119 as stated in `AEP-002`/`ARR-001`/`IWP-001` (a simple addition slip: 40+39+41, previously miscounted as 40+40+39). Recorded for the same reason.
- Two questions (`sr-009`, `sr-029`) carry a source `category` label ("Rotation," "Grid Navigation" respectively) that does not clearly match their actual content on inspection — flagged in the Ambiguous Questions list rather than silently retagged, since correcting a source-data category label is a content-authoring decision, not a metadata-proposal one.

---

## Coverage Summary

| Domain | Competencies | Fully covered | Thinnest competency |
|---|---|---|---|
| Non-Verbal Reasoning | 6 | 6/6 have ≥1 question | `nvr.3d-shapes` (1 question) |
| Spatial Reasoning | 5 | 5/5 have ≥1 question | `sr.rotation` (**1 question, corrected from the previously-stated 3**) |
| Mathematical Reasoning | 6 | 6/6 have ≥1 question | `numreason.percentages`/`numreason.ratio-proportion` (populated, but genuinely no Hard/Challenge-tier content in either) |

**Recommendation carried forward from WP-01, now sharpened by real data:** `sr.rotation` is the single thinnest, least-validated competency in the entire 120-question corpus — one question, and that question's own competency placement is itself the review's top-priority open question (Ambiguous Questions item 5). This should be the first item any human reviewer looks at.

---

This entire document is PROPOSED — PENDING HUMAN REVIEW. No row becomes authoritative, no value is imported, and no existing metadata is replaced until a human reviewer confirms it.
