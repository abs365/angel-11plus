# WP-22: Pending Content Review & Disposition

**Status:** Content review (human-owned), per `IWP-002_ENGINE_INTEGRATION_PROGRAMME.md` §1/§5. Prepares WP-02's 120-question tagging proposal and WP-15's 6 Probability questions for a genuine Founder disposition decision — this document does not itself approve, reject, or import anything.
**Companion artifact:** `WP-22_PROPOSED_IMPORT.sql` — 112 ready-to-run (not yet run) `INSERT INTO ali_question_bank` statements, generated mechanically from the real content in `data/non-verbal-reasoning`, `data/spatial-reasoning`, `data/numerical-reasoning` plus WP-02's own per-competency disposition tables. **Not executed. Do not run until this document's decisions are made.**

---

## 1. Why this exists

Per IWP-002 §5: "Content approval (WP-22) cannot be self-approved — WP-02 and WP-15's proposals were authored by the same process now being asked to review them. This work package's role is to prepare a clean import path and surface the proposals for a genuine, independent Founder decision, not to approve its own prior output." Everything below is preparation, not disposition.

---

## 2. A finding surfaced while preparing this review: WP-02's own summary table doesn't match its own detail tables

While building the disposition list, every one of WP-02's 120 per-row confidence tags was recounted directly from its per-competency tables (the row-level source, since that's what an actual import keys off). The result does not match `WP-02_PROPOSED_METADATA.md`'s own "Confidence Assessment (summary)" table:

| Domain | WP-02's stated summary (High/Med/Low) | Recomputed directly from WP-02's own per-row tables (High/Med/Low) |
|---|---|---|
| Non-Verbal Reasoning | 27 / 9 / 4 | **31 / 5 / 4** |
| Spatial Reasoning | 24 / 13 / 2 | **27 / 10 / 2** |
| Mathematical Reasoning | 30 / 8 / 3 | **34 / 5 / 2** |

The Low-confidence counts for NVR and SR happen to match (4 and 2); the Mathematical Reasoning Low count does not (3 stated vs. 2 actual), and every domain's High/Medium split is off by a consistent-looking margin. Cross-checked against WP-02's own separate "Ambiguous Questions Requiring Human Judgement" section, which lists exactly **8** specific IDs by name (not 9) — matching the recomputed total (4+2+2=8), not the summary table's total (4+2+3=9).

**This does not change any row's actual disposition** — every question below is dispositioned from WP-02's per-row table entries, which are internally consistent with each other and with the Ambiguous Questions list. It is reported because a reviewer relying on WP-02's summary percentages alone would be working from a number that doesn't reconcile with the document's own detailed data — the same category of honestly-reported inconsistency WP-02 itself already surfaced once (the "sr.rotation has 1 question, not 3" correction against `AEP-002`/`QUESTION_AUTHORING_STANDARD.md`).

---

## 3. WP-02 disposition: Non-Verbal / Spatial / Mathematical Reasoning (120 questions)

### 3.1 Ready for import once approved — 112 questions

Every High- or Medium-confidence row from WP-02's per-competency tables, with no competency-mapping ambiguity attached. Full SQL for all 112 rows is in `WP-22_PROPOSED_IMPORT.sql`, grouped by competency exactly as WP-02 grouped them.

| Domain | Competencies | Questions ready |
|---|---|---|
| Non-Verbal Reasoning | `nvr.pattern-completion` (11), `nvr.symbol-codes` (8), `nvr.rotation` (5), `nvr.reflection-symmetry` (7), `nvr.shape-properties` (4), `nvr.3d-shapes` (1) | 36 of 40 |
| Spatial Reasoning | `sr.paper-folding` (8), `sr.compass-grid-navigation` (11), `sr.3d-visualisation` (10), `sr.rotation` (**0**), `sr.shape-properties-symmetry` (8) | 37 of 39 |
| Mathematical Reasoning | `numreason.sequences-analogies` (11), `numreason.function-machines` (4), `numreason.data-statistics` (10), `numreason.money-measures` (5), `numreason.percentages` (5), `numreason.ratio-proportion` (4) | 39 of 41 |
| **Total** | **17 competencies** | **112** |

**`sr.rotation` gets zero rows this round.** Its only tagged question (`sr-009`) is one of the 8 held items below — meaning approving "everything ready" still leaves this competency completely empty. Worth the Founder's attention as its own decision, not just a side effect: either resolve `sr-009`'s placement now so this competency isn't empty, or explicitly accept `sr.rotation` stays unpopulated until new content is authored.

### 3.2 Held pending resolution — 8 questions

WP-02's own "Ambiguous Questions Requiring Human Judgement" section, reproduced here as the actual decision points, not re-litigated:

| ID | Competency (as tagged) | Concern | WP-02's own recommendation |
|---|---|---|---|
| `nvr-009` | `nvr.rotation` | Difficulty: Easy or Medium (compound two-step rotation) | Compare against `nvr-039` (confirmed Hard) to anchor |
| `nvr-030` | `nvr.rotation` | Difficulty: near-identical to confirmed-Hard `nvr-037`, tagged Medium here | Re-examine both together |
| `nvr-036` | `nvr.reflection-symmetry` | Competency mapping: is a numeral a "shape"? | Confirm placement or carve out a new category |
| `nvr-011` | `nvr.shape-properties` | Competency mapping: closer to `sr.3d-visualisation`'s counting logic? | Confirm whether "Shape Counting" belongs here |
| `sr-009` | `sr.rotation` | Competency mapping: this is a rotational-*symmetry* check, not a directional-turn question — and it's this competency's **only** question | Confirm placement, or move to `sr.shape-properties-symmetry` |
| `sr-029` | `sr.compass-grid-navigation` | Competency mapping: content is a clock-hands angle, not grid/compass navigation | Confirm placement or name a new sub-skill |
| `nr-011` | `numreason.sequences-analogies` | Competency mapping: closer to `nvr.symbol-codes`'s constraint-solving | Confirm assignment |
| `nr-021` | `numreason.function-machines` | Difficulty: would be the *first* Easy-tier example in this competency | Confirm whether Easy-tier should exist here yet |

Recommend resolving these as their own small decision, separate from and before the "ready" batch's approval — 5 of the 8 are competency-mapping questions, where importing the wrong `skill` value would actively corrupt WP-05/WP-06's per-competency evidence aggregation for whichever competency ends up wrongly credited, not merely under-tag a difficulty.

---

## 4. WP-15 disposition: Proposed Probability Questions (6 questions)

`WP-15_PROPOSED_PROBABILITY_QUESTIONS.md`'s 6 questions are **not** included in `WP-22_PROPOSED_IMPORT.sql` and require a different, prior decision: `maths.probability` itself is a proposed 17th Mathematics competency, not yet adopted anywhere (`QUESTION_AUTHORING_STANDARD.md` §11.2's table has 16). Two separate decisions are needed, in order:

1. **Adopt `maths.probability` as a real competency** (extends `QUESTION_AUTHORING_STANDARD.md` §11.2, closes the real gap `AEP-002_KNOWLEDGE_FRAMEWORK.md` §5 named — "no probability competency exists anywhere in Angel's content, in any domain, today"). This is a taxonomy decision, not a per-question one.
2. **Approve the 6 questions themselves** (all High author-confidence except `PQ-006`, Medium — the first Challenge-tier item for a brand-new competency with nothing to calibrate against).

If both are approved, the import path is structurally different from §3's: these 6 must first be added to `data/maths.ts` (the learner-facing bank, since Probability doesn't exist there either), per WP-15's own "Recommended next step" — only then does the same `ali_question_bank` hand-tagging/import step apply. Not generated here, since it depends on a decision (#1) not yet made.

---

## 5. What the import path actually is, for the 112 ready rows

Confirmed by inspecting the real schema (`supabase/migrations/005_ali_question_bank.sql`, `009_ali_question_metadata_extension.sql`) and the real read path (`app/mocks/adaptive/gl/page.tsx`'s `q.prompt as ReasoningQuestion` cast, confirming `prompt` stores the exact source `ReasoningQuestion` object verbatim, not a bespoke shape):

- `WP-22_PROPOSED_IMPORT.sql` is a plain SQL file, in the same "prepared, Founder-executed via the Supabase Dashboard SQL Editor" category as every other migration in this project — this sandbox has no live network path to the database, so it cannot be run from here regardless of approval status.
- Each `INSERT` is `on conflict (id) do nothing` — safe to run even if some rows were already imported by an earlier, out-of-repo process this document has no visibility into.
- `mastery_threshold` is derived from `ali_mastery_defaults` (easy/medium=2, hard/challenge=3, Decision 10) — not invented per-row.
- `confidence_weight` is left at the schema default `1.00` for all 112 rows. **This is a real, deliberate omission, not an oversight:** WP-02 did not propose a per-question confidence_weight, and inventing one here would misattribute a new, uncredited judgement to a metadata-review work package. Practical consequence: none of these 112 questions will ever be treated as "guessable format" by `lib/ali/confidence.ts`'s `GUESSABLE_CONFIDENCE_WEIGHT` check until a real value is assigned in a future, separate authoring pass — flagged as an open item for whoever does that pass, not resolved here.
- `pathway` is domain-wide per WP-02's own stated confidence: NVR/numreason `["gl","cem","iseb"]` (High for NVR, Medium domain-wide for numreason per WP-02's own note), SR `["gl","iseb"]` (High).

---

## 6. What this document authorises

Nothing. `WP-22_PROPOSED_IMPORT.sql` is generated, verified against the real source data (112/112 rows accounted for, no excluded ID present, no duplicate ID, every competency's row count matches its expected included/excluded split), and not executed. The 8 held questions and the 2 WP-15 taxonomy/content decisions require explicit Founder disposition before any SQL in this package is run.
