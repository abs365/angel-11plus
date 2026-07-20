# CSSE Competency-to-Topic Mapping

**Work Package:** ANGEL-CSSE-001 — Deliverable 2
**Status:** Documentation only. Reconciliation, not replacement — every competency named below is one of Assessment Brain V1's existing 13, frozen 2026-07-20. No new competency is created by this document.
**Retained, cited by `docs/intelligence/EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md`** (ANGEL-CSSE-002A) — the Topic layer defined here is a content-mapping input to that document's Section 11 data model, not superseded by it.

**Naming note, added after this document's first draft:** this file was originally saved as `CSSE_COMPETENCY_FRAMEWORK.md` at the repository root, which collides in name (though not in path or content) with the real, pre-existing, 243-line `docs/intelligence/CSSE_COMPETENCY_FRAMEWORK.md` — AEP-003's actual competency framework, the one Assessment Brain V1 §3 itself cites as its source. That is the authoritative document; this one was renamed to `CSSE_COMPETENCY_TOPIC_MAPPING.md` to remove the collision. This file does not replace, restate, or compete with AEP-003's document — it adds one new layer (Topics) beneath the competencies AEP-003 already defined, exactly as described below.

---

## 1. Why this document does not define a second competency taxonomy

`docs/intelligence/ASSESSMENT_BRAIN_V1.md` §3 (itself consolidating `docs/intelligence/CSSE_COMPETENCY_FRAMEWORK.md`, AEP-003's original, unaltered by this document) already defines a complete, evidence-graded competency structure for CSSE — 4 domains, 13 competencies, each with a confidence rating, an Evidence Maturity Classification (EMC-1 to EMC-4), and citations back to the 17 real exam-paper/marking-scheme assets it was built from. That document is **frozen**: any new competency taxonomy built independently of it would create exactly the kind of parallel, non-reconciled model this programme has already identified as a real architectural risk elsewhere (two separate adaptive-practice engines doing the same job — see `ANGEL_V1_PRODUCT_EXPERIENCE_IMPLEMENTATION_AUDIT.md` Section 2, finding on Learning Report vs. legacy ALI).

This work package's brief asks for a finer-grained breakdown than Assessment Brain V1's 13 competencies provide (e.g. separate Reading/Vocabulary/Inference/Language analysis; separate Grammar/Spelling/Punctuation; ten named Maths topics). That granularity is real and useful — but it describes **curriculum content areas**, not **assessed, evidence-graded competencies**. This document adds that content layer explicitly *beneath* the existing competency layer, mapping every requested item to the competency that already, evidentially, covers it — rather than inventing new competencies that would have no exam-paper evidence behind them (a direct violation of Assessment Brain V1's own Principle basis and of Learning Engine V1's Principle 7, "No Invented Constructs").

**Two-layer model used throughout this document:**
- **Competency** (Assessment Brain V1, evidence-graded, frozen) — what the exam actually, measurably assesses.
- **Topic** (this document, new) — a named curriculum content area a competency draws on. Topics have no independent evidence rating of their own; they inherit their parent competency's confidence and EMC rating. A topic is a *label for organising practice content*, not a new unit of assessment.

## 2. English — requested decomposition, reconciled

| Requested topic | Parent competency (Assessment Brain V1) | Reconciliation note |
|---|---|---|
| Reading (general retrieval) | **RC-01** — Literal Retrieval from Narrative Text (HIGH / EMC-3) | Direct match. |
| Inference | **RC-02** — Inference and Justified Interpretation (MEDIUM / EMC-3) | Direct match. |
| Vocabulary | **RC-03** — Word/Phrase Meaning-in-Context Explanation (LOW / EMC-2) | Direct match. Note this competency rests on a single observed instance (Assessment Brain V1 §8) — treat any content tagged here as thin-evidence, not because the topic is unimportant but because the exam-paper evidence for it specifically is limited. |
| Language analysis (effect of word choice, technique) | **RC-02** (via Question Type QT-RC-10, "Effect-of-Language Interpretation") | Not a separate competency — Assessment Brain V1 rolls this up under RC-02 as one of its two mapped Question Types (the other is QT-RC-05, Quotation-and-Explanation). Kept as one competency, not split, because AEP-003 §6 (inherited by Assessment Brain V1) explicitly declined to assert fine-grained sub-distinctions the exam evidence doesn't independently support. |
| Sequential ordering | **RC-04** — Sequential Ordering of Textual Information (LOW / EMC-2) | Requested list did not name this explicitly, but it is a real, existing competency and is included for completeness — also single-instance evidence. |
| Writing (composition) | **WC-01** — Sustained Original Composition (HIGH / EMC-3) | Direct match. |
| Grammar | **WC-02** — Multi-Dimensional Writing Quality (LOW / EMC-1) | Not a separate competency. New public research (`CSSE_EXAMINATION_BLUEPRINT.md` §3) independently confirms Continuous Writing is explicitly assessed on "vocabulary, spelling, punctuation, grammar, and structural variety" — all four requested sub-skills genuinely are part of what WC-02 covers, corroborating Assessment Brain V1's own framing even though its EMC-1 rating (the lowest in the whole competency set) reflects a real, still-open rubric-vs-marks gap (Observation 10) that this new source does not resolve. |
| Spelling | **WC-02** | Same as Grammar, above. |
| Punctuation | **WC-02** | Same as Grammar, above. |

**Structural gap, inherited and not resolved here:** WC-02 is a single competency covering four distinct requested topics (Grammar, Spelling, Punctuation, plus the general "multi-dimensional quality" Assessment Brain V1 named it for) with the *lowest* evidence rating of any competency in the model. Splitting it into four separately-evidenced competencies is exactly the kind of new educational conclusion Assessment Brain V1's freeze forbids without a new, separately-authorised correction work package — flagged here as a strong candidate for that future work, not performed now.

## 3. Mathematics — requested decomposition, reconciled

| Requested topic | Parent competency (Assessment Brain V1) | Reconciliation note |
|---|---|---|
| Number (place value, number properties) | **MR-05** — Number Properties and Number Theory (LOW / EMC-2) | Direct match. Single-instance evidence (Assessment Brain V1 §8). |
| Arithmetic | **MR-01** — Arithmetic Calculation (HIGH-no-calc / MEDIUM-depth / EMC-3) | Direct match. |
| Fractions | **MR-01** or **MR-04**, depending on question framing | Assessment Brain V1 does not name Fractions as its own competency. A direct fraction computation (e.g. "simplify 3/8 + 1/6") is MR-01; a fraction embedded in a multi-step word problem is MR-04. No dedicated fraction competency exists — this is a genuine granularity limit inherited from the exam evidence, not an oversight of this reconciliation. |
| Decimals | **MR-01** | Same reasoning as Fractions — direct computation. |
| Percentages | **MR-04** — Multi-Step Word-Problem Interpretation (HIGH / EMC-4), via Question Type **QT-MR-04** "Percentage / Proportional Change" | Direct, well-evidenced match — this is the one requested Maths topic with its own named Question Type in Assessment Brain V1. |
| Ratio | **MR-04**, via the same QT-MR-04 proportional-change family | Reconciled the same way as Percentages; Assessment Brain V1 does not distinguish ratio from percentage/proportion at the competency level. |
| Measurement | **MR-01**, via Question Type **QT-MR-03** "Unit Conversion / Measurement" | This is a **known, explicitly documented gap** — Assessment Brain V1 §8 states plainly: *"unit/measurement conversion (QT-MR-03)... has no dedicated AEP-003 competency and [is] mapped to the closest existing one (MR-01) with a documented imperfect fit."* Reconciled here exactly as the source document reconciles it — not resolved, not improved on. |
| Geometry | **MR-03** — Geometric and Spatial Reasoning (HIGH / EMC-4) | Direct match, well-evidenced. |
| Algebra | **MR-02** — Algebraic / Symbolic Problem-Solving (HIGH / EMC-4) | Direct match, well-evidenced. |
| Problem Solving (multi-step word problems) | **MR-04** — Multi-Step Word-Problem Interpretation (HIGH / EMC-4) | Direct match. |

**Also present in Assessment Brain V1, not named in the work package's requested list, included for completeness:** **MR-06** — Precision Under Exact-Match Conditions (HIGH / EMC-4) — a cross-cutting competency (Assessment Brain V1's own description) reflecting that CSSE Maths marking is exact-match with no partial credit, which applies across every topic above rather than being its own content area.

**Structural gap, inherited and not resolved here:** data/chart/table reading (Question Type QT-MR-09) has the same "no dedicated competency, mapped to MR-01 with an imperfect fit" status as Measurement — Assessment Brain V1 §8, unresolved. Neither Fractions, Decimals, nor data-reading has a dedicated competency; all three requested/implied topics currently borrow evidence confidence from MR-01 or MR-04, which were rated for their own primary content, not these specifically.

## 4. Summary — competency-to-topic coverage map

| Domain | Competencies | Topics mapped | Topics with their own dedicated competency | Topics borrowing another competency's rating |
|---|---|---|---|---|
| English — Reading | RC-01, RC-02, RC-03, RC-04 | Reading, Inference, Vocabulary, Language analysis, Sequential ordering | 4 of 5 | Language analysis (shares RC-02) |
| English — Writing | WC-01, WC-02 | Writing, Grammar, Spelling, Punctuation | 1 of 4 | Grammar, Spelling, Punctuation (all share WC-02) |
| Maths | MR-01 to MR-06 | Number, Arithmetic, Fractions, Decimals, Percentages, Ratio, Measurement, Geometry, Algebra, Problem Solving | 5 of 10 (Number→MR-05, Arithmetic→MR-01, Percentages→MR-04, Geometry→MR-03, Algebra→MR-02, Problem Solving→MR-04) | Fractions, Decimals (share MR-01/MR-04 depending on framing), Ratio (shares MR-04), Measurement (shares MR-01, documented imperfect fit) |

**Total: 13 competencies (unchanged from Assessment Brain V1), 19 requested/implied topics, zero new competencies created.**

## 5. What this document recommends, not performs

1. A future, separately-authorised correction work package should consider splitting **WC-02** into named sub-competencies for Grammar, Spelling, and Punctuation specifically — the new public research in `CSSE_EXAMINATION_BLUEPRINT.md` §3 gives slightly firmer evidence that these are independently, explicitly assessed than Assessment Brain V1's original three papers alone showed.
2. A future correction work package should consider whether Fractions/Decimals/Ratio deserve dedicated Maths competencies, given how frequently they appear across the ten requested topics without one — but this document does not create them now, consistent with the freeze.
3. Both recommendations require the same evidentiary standard Assessment Brain V1 itself was held to (asset-cited, multi-year where possible) — not asserted from this reconciliation exercise alone.
