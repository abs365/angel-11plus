# Content Health Register

**Status:** Living planning artefact. Created 2026-07-18 per Programme Decision APD-019.
**Governing documents:** `AEP-002_KNOWLEDGE_FRAMEWORK.md` (competency graph), `QUESTION_AUTHORING_STANDARD.md` (calibration standard), `WP-02_PROPOSED_METADATA.md` (proposed tagging, pending review), `CURRICULUM_GAP_REGISTER.md` (content gaps).

**Purpose:** A single, scannable per-competency health snapshot — question count, evidence maturity, known gaps, and priority for review vs. authoring — so future content decisions can be prioritised against one register rather than re-deriving the picture from six separate documents.

**This register is a planning artefact only. It shall not influence runtime educational recommendations** — nothing here is read by ALI's selection logic, the Recommendation Pipeline, or any other engine component. It exists purely to inform human authoring and review priorities.

**Evidence maturity scale used throughout:**
- **Calibrated** — real content, difficulty-calibrated, timing baselines exist.
- **Calibrated (proposed)** — real content, difficulty-calibrated, but individual question tagging is proposed and pending human review (`WP-02_PROPOSED_METADATA.md`), not yet confirmed.
- **Populated, uncalibrated** — real content exists but no difficulty rubric/timing baseline has been written for it yet.
- **Content gap** — competency is named and defined, zero real questions exist.
- **Structural gap** — no gradable question mechanic exists for this content at all, not even a format to author into.

**Implementation findings recorded here per Programme Decision APD-019 (not a revision of frozen architecture narrative, per its own explicit instruction):**
- The real corpus across NVR/Spatial/Mathematical Reasoning is **120 questions**, not 119 as stated in `AEP-002`/`ARR-001`/`IWP-001` — a simple addition slip (40+39+41, previously miscounted). Recorded here as the accurate figure for planning purposes; those frozen documents are not reopened to correct the narrative.
- **`sr.rotation` contains 1 real question, not 3** as stated in `AEP-002` §2.4/`QUESTION_AUTHORING_STANDARD.md` §13.1 — verified by direct search of the source data during WP-02. Recorded here, and reflected accurately in this register's Spatial Reasoning table below.

---

## Verbal Reasoning (10 competencies, 52 questions total)

| Competency | Count | Maturity | Known gaps | Review priority | Authoring priority |
|---|---|---|---|---|---|
| `vr.analogies` | ~10 | Calibrated | None named | Low | Low |
| `vr.odd-one-out` | ~5 | Calibrated | None named | Low | Low |
| `vr.synonyms` | ~5 | Calibrated | None named | Low | Low |
| `vr.antonyms` | ~5 | Calibrated | None named | Low | Low |
| `vr.letter-codes` | ~6 | Calibrated | None named | Low | Low |
| `vr.number-codes` | ~5 | Calibrated | None named | Low | Low |
| `vr.word-codes` | ~5 | Calibrated | None named | Low | Low |
| `vr.hidden-words` | ~4 | Calibrated | None named | Low | Low |
| `vr.sequences` | ~4 | Calibrated | None named | Low | Low |
| `vr.compound-words` | ~3 | Calibrated | None named | Low | Low |

*(Exact per-competency counts for the 52-question VR bank were not re-derived in this register — `QUESTION_AUTHORING_STANDARD.md` §3 is the authoritative source if precise counts are needed; approximate figures shown here for register completeness.)*

---

## Mathematics (16 competencies, 20 questions total)

| Competency | Count | Maturity | Known gaps | Review priority | Authoring priority |
|---|---|---|---|---|---|
| `maths.addition-subtraction` | 2 | Calibrated | Thin (2 Qs) | Low | Medium |
| `maths.multiplication` | 1 | Calibrated | Thin (1 Q) | Low | Medium |
| `maths.division` | 1 | Calibrated | Thin (1 Q) | Low | Medium |
| `maths.fractions` | 2 | Calibrated | Anchors the AEP-001 §2.12 transfer chain — high leverage despite low count | Low | **High** |
| `maths.decimals` | 2 | Calibrated | Thin | Low | Medium |
| `maths.percentages` | 2 | Calibrated | Transfer-linked to `numreason.percentages` | Low | Medium |
| `maths.ratio-proportion` | 1 | Calibrated | Thin (1 Q) | Low | Medium |
| `maths.algebra` | 2 | Calibrated | None named | Low | Low |
| `maths.geometry` | 2 | Calibrated | None named | Low | Low |
| `maths.measurement` | 1 | Calibrated | Thin (1 Q) | Low | Medium |
| `maths.time` | 0 | **Content gap** | No real question exists at all (`QUESTION_AUTHORING_STANDARD.md` §11.2) | Low | **High** |
| `maths.money` | 1 | Calibrated | Thin (1 Q) | Low | Medium |
| `maths.statistics` | 0 | **Content gap** | No real question exists at all | Low | **High** |
| `maths.problem-solving` | 2 | Calibrated | None named | Low | Low |
| `maths.powers-roots` | 3 | Calibrated | None named | Low | Low |
| `maths.factors-multiples` | 1 | Calibrated | Thin (1 Q) | Low | Medium |
| *(unassigned)* `maths.probability` | 0 | **Content gap, no competency code exists yet** | Tracked as `CURRICULUM_GAP_REGISTER.md` GAP-001, not yet formally added to this taxonomy | Medium | **High** |

---

## English (10 named competencies, 10 questions total, 2 populated)

| Competency | Count | Maturity | Known gaps | Review priority | Authoring priority |
|---|---|---|---|---|---|
| `english.inference` | 9 | Populated, uncalibrated | No difficulty rubric written yet (unlike VR/Maths §4/§11.4) | Medium | Low |
| `english.vocabulary-in-context` | 1 | Populated, uncalibrated | Single-question competency, thinnest populated English competency | Medium | **High** |
| `english.retrieval` | 0 | Content gap | Zero real questions | Low | Medium |
| `english.authors-purpose` | 0 | Content gap | Zero real questions | Low | Medium |
| `english.sequencing` | 0 | Content gap | Zero real questions | Low | Medium |
| `english.summarising` | 0 | Content gap | Needs a longer/multi-section passage to test meaningfully | Low | Medium |
| `english.prediction` | 0 | Content gap | Zero real questions | Low | Medium |
| `english.grammar` | 0 | **Structural gap** | No gradable mechanic exists anywhere in the app | Low | Low *(blocked on a format decision, not just authoring)* |
| `english.punctuation` | 0 | **Structural gap** | Same | Low | Low *(same block)* |
| `english.spelling` | 0 | **Structural gap** | Same | Low | Low *(same block)* |

---

## Vocabulary (10 named competencies, 12 words, 3 populated)

| Competency | Count | Maturity | Known gaps | Review priority | Authoring priority |
|---|---|---|---|---|---|
| `vocabulary.synonyms` | 12 | Populated, uncalibrated | No difficulty rubric written yet | Medium | Low |
| `vocabulary.antonyms` | 12 | Populated, uncalibrated | Same | Medium | Low |
| `vocabulary.in-context` | 12 | Populated, uncalibrated | Same | Medium | Low |
| `vocabulary.multiple-meanings` | 0 | **Structural gap** | `VocabWord` schema has no field to support this | Low | Low *(schema decision needed first)* |
| `vocabulary.prefixes` | 0 | **Structural gap** | Same | Low | Low |
| `vocabulary.suffixes` | 0 | **Structural gap** | Same | Low | Low |
| `vocabulary.root-words` | 0 | **Structural gap** | Same | Low | Low |
| `vocabulary.homophones` | 0 | **Structural gap** | Same | Low | Low |
| `vocabulary.idioms` | 0 | **Structural gap** | Same | Low | Low |
| `vocabulary.word-families` | 0 | **Structural gap** | Same | Low | Low |

---

## Non-Verbal Reasoning (6 competencies, 40 questions — WP-01/WP-02 corpus)

| Competency | Count | Maturity | Known gaps | Review priority | Authoring priority |
|---|---|---|---|---|---|
| `nvr.pattern-completion` | 11 | Calibrated (proposed) | Challenge tier has no real question | Medium | Low |
| `nvr.symbol-codes` | 8 | Calibrated (proposed) | Challenge tier has no real question | Medium | Low |
| `nvr.rotation` | 7 | Calibrated (proposed) | 2 of 7 questions flagged Low confidence in WP-02 | **High** | Low |
| `nvr.reflection-symmetry` | 8 | Calibrated (proposed) | 1 question flagged Low confidence | Medium | Low |
| `nvr.shape-properties` | 5 | Calibrated (proposed) | Thinnest-content NVR competency after `nvr.3d-shapes`; 1 question flagged Low confidence | Medium | Medium |
| `nvr.3d-shapes` | 1 | Calibrated (proposed) | Single-question competency | Medium | **High** |

## Spatial Reasoning (5 competencies, 39 questions)

| Competency | Count | Maturity | Known gaps | Review priority | Authoring priority |
|---|---|---|---|---|---|
| `sr.paper-folding` | 8 | Calibrated (proposed) | None beyond standard Challenge-tier gap | Low | Low |
| `sr.compass-grid-navigation` | 12 | Calibrated (proposed) | 1 question (`sr-029`) may not belong in this competency at all | **High** | Low |
| `sr.3d-visualisation` | 10 | Calibrated (proposed) | None beyond standard Challenge-tier gap | Low | Low |
| `sr.rotation` | **1 (corrected from previously-stated 3)** | Calibrated (proposed) | **Thinnest-evidenced competency in the entire 120-question corpus; its only question's own competency placement is itself disputed (`WP-02` Ambiguous Item 5)** | **Highest in register** | **High** |
| `sr.shape-properties-symmetry` | 8 | Calibrated (proposed) | 1 question flagged Medium-confidence difficulty | Medium | Low |

## Mathematical Reasoning / `numreason` (6 competencies, 41 questions)

| Competency | Count | Maturity | Known gaps | Review priority | Authoring priority |
|---|---|---|---|---|---|
| `numreason.sequences-analogies` | 12 | Calibrated (proposed) | 1 question's competency placement disputed | Medium | Low |
| `numreason.function-machines` | 5 | Calibrated (proposed) | No genuinely single-step Easy question; 1 reclassification disputed | Medium | Medium |
| `numreason.data-statistics` | 10 | Calibrated (proposed) | None beyond standard gaps | Low | Low |
| `numreason.money-measures` | 5 | Calibrated (proposed) | None beyond standard gaps | Low | Low |
| `numreason.percentages` | 5 | Calibrated (proposed) | **No Hard/Challenge-tier content at all — no reverse-percentage question exists** | Low | **High** |
| `numreason.ratio-proportion` | 4 | Calibrated (proposed) | No Hard/Challenge-tier content | Low | Medium |

## Writing (0 competencies)

| Competency | Count | Maturity | Known gaps | Review priority | Authoring priority |
|---|---|---|---|---|---|
| *(none defined)* | 4 prompts, ungraded per-competency | **Structural gap** | No competency model or gradable per-skill mechanic exists at all (`ENGLISH_COMPETENCY_FRAMEWORK.md` §5, reconfirmed `AEP-002` §1) | Low | Low *(blocked on a design decision, not an authoring task)* |

---

## Register-Wide Priorities (top 5, for a future authoring/review pass to start from)

1. **`sr.rotation`** — resolve whether `sr-009` is even correctly classified before authoring anything new; highest review priority in the register.
2. **Probability** — no competency code exists yet in any domain; `CURRICULUM_GAP_REGISTER.md` GAP-001 remains open.
3. **`numreason.percentages`/`numreason.ratio-proportion`** — populated but with a real, structural Hard/Challenge-tier gap.
4. **`maths.time`/`maths.statistics`** — zero real content, a standing gap since Phase ALI 2.0.
5. **`nvr.3d-shapes`** — single-question competency, thinnest in the NVR set.

---

This register does not authorise any authoring or engineering work by itself — it is a planning input for a future Founder decision on where to prioritise WP-02-onward content work, and is superseded piece by piece as gaps close, not replaced wholesale.
