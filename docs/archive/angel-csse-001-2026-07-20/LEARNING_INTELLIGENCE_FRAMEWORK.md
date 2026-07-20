# Learning Intelligence Framework

**Work Package:** ANGEL-CSSE-001 — Deliverable 4
**Status:** Documentation only. Reconciles the work package's seven requested dimensions (Knowledge mastery, Skill mastery, Reasoning mastery, Confidence, Speed, Accuracy, Consistency) against `docs/intelligence/LEARNING_ENGINE_V1.md`, which is **complete and frozen**. Four of the seven already exist under a different name. Two require a genuine, disclosed extension to the frozen model. One directly conflicts with an explicit boundary the frozen model already sets, and is not resolved unilaterally here.

---

## 1. Method

Learning Engine V1 already defines a complete learner-evidence model (Evidence Signal × Evidence Tier, rolled up into Diagnostic Intelligence categories) and states its own boundaries explicitly in its §9, including a direct refusal to model anything without "a traceable basis in Assessment Brain's evidence" (Principle 7). Every one of this work package's seven requested dimensions is checked against that existing model before anything new is proposed. This avoids the same failure mode already found and corrected in this Blueprint programme: building a second, parallel model that duplicates or silently contradicts a first.

## 2. Dimension-by-dimension reconciliation

### 2.1 Accuracy — already exists, no new construct needed

Learning Engine V1 §3.2's **Evidence Signal** (`Not Yet Observed` / `Developing` / `Not Yet Demonstrated` / `Demonstrated`) is, by its own definition, an accuracy construct: it states "whether the outcome met the format's own Measurement Purpose" — i.e., whether the learner got it right, in a pattern, against a defined correctness standard. **Accuracy is not a missing dimension; it is Evidence Signal under a different name.** No new field is proposed.

### 2.2 Consistency — already exists, no new construct needed

Learning Engine V1 §3.3's **Evidence Tier** (ET-0 to ET-4) is explicitly a consistency-over-breadth-and-time construct: ET-3 requires "a consistent pattern across more than one mapped Question Type/format," and ET-4 requires that pattern "sustained across more than one observed point in time." **Consistency is not a missing dimension; it is Evidence Tier's own defining criterion.** No new field is proposed.

### 2.3 Knowledge mastery / Skill mastery / Reasoning mastery — reconciled as a competency classification layer, not three new evidence axes

Learning Engine V1 already has a mastery construct: **"Mastered Skills"** (§4) — competencies with a Demonstrated signal at ET-4, "the highest evidence ceiling this model can express." The work package's request for three separate mastery *types* (Knowledge / Skill / Reasoning) is better satisfied by classifying Assessment Brain V1's 13 competencies by cognitive type, and reporting the existing Mastered-Skills logic per class — not by building three parallel mastery-scoring mechanisms. Classification below, using each competency's own Assessment Brain V1 description (not a new judgement):

| Class | Competencies | Rationale |
|---|---|---|
| **Knowledge** | RC-01 (Literal Retrieval), RC-03 (Word/Phrase Meaning), MR-05 (Number Properties) | Retrieval/recall-dominant — "what is stated" or "what is defined," not multi-step reasoning. |
| **Skill** | MR-01 (Arithmetic Calculation), MR-06 (Precision Under Exact-Match), WC-01 (Sustained Composition), WC-02 (Multi-Dimensional Writing Quality) | Procedural execution — correctly *performing* a defined operation or sustained output, not primarily interpretive. |
| **Reasoning** | RC-02 (Inference), RC-04 (Sequential Ordering), AR-01 (Pattern Inference), MR-02 (Algebraic/Symbolic), MR-03 (Geometric/Spatial), MR-04 (Multi-Step Word-Problem) | Multi-step, inferential, or transfer-dependent — the learner must combine information or apply a rule to a new case, not just recall or execute. |

This is an **additive classification tag on existing competencies**, exactly like the Topic layer added in `CSSE_COMPETENCY_TOPIC_MAPPING.md` — it does not change any Evidence Signal, Evidence Tier, or Diagnostic category logic. "Knowledge mastery" for a learner is simply the existing Mastered-Skills/Diagnostic logic (§4), filtered to the Knowledge-class competencies; likewise for Skill and Reasoning. No new computation, no new evidence requirement.

### 2.4 Speed — genuinely new, groundable in real existing data, requires formal extension

**Speed is not currently a dimension in Learning Engine V1 at all.** Its §9 boundaries do not name it explicitly, but its Principle 7 ("No Invented Constructs... no construct in this model is a black box... traceable to Assessment Brain") means it cannot simply be added by assertion. It can, however, be **grounded in real, already-collected data**, unlike Confidence (Section 2.5) — this is the material difference between the two:

- `ali_question_bank.estimated_time_seconds` (migration `005`) already sets a real, per-question expected-time budget for every question in the live schema.
- `ali_student_question_history.last_presented_at` (migration `006`) already timestamps every presentation. A "time taken" measurement would require one additional real field (a submission timestamp, or a client-measured elapsed-time value) — not a new table, an additive column.
- CSSE's own paper-level timing is real and sourced (`CSSE_EXAMINATION_BLUEPRINT.md` §2/§3: 70-minute English, 60-minute Maths) — meaning a real, evidenced "expected pace" benchmark exists to compare against, unlike a fabricated one.

**Recommendation, not performed here:** propose Speed as a **new profile element** in a future Learning Engine V1.1 — "for a given Question Type, whether the learner's elapsed time is faster than, comparable to, or slower than that type's `estimated_time_seconds`" — reported as a qualitative band (per Learning Engine V1's own "never a bare number" convention, §6's readiness-banding precedent), not a raw number. This requires the same formal, logged correction process Assessment Brain V1 §10 and this programme's own established convention require — proposed, not silently added.

### 2.5 Confidence — direct conflict with an explicit existing boundary, not resolved here

This is the one dimension this document cannot cleanly reconcile, because "Confidence" is genuinely ambiguous and its two readings lead to opposite conclusions:

- **If "Confidence" means evidentiary confidence** (how sure Angel can be about a competency claim) — **this already exists twice over**: Assessment Brain V1's own HIGH/MEDIUM/LOW/INSUFFICIENT EVIDENCE scale (exam-level) and Learning Engine V1's Evidence Tier ET-0→ET-4 (learner-level, §3.3). Nothing new is needed under this reading.
- **If "Confidence" means the child's own psychological self-assurance** (how confident the child *feels*) — this is **explicitly, directly forbidden** by Learning Engine V1 §9: *"Model behaviour or psychology. No construct for motivation, engagement, mindset, attention, learning style, or similar is defined — none has a traceable basis in Assessment Brain's evidence, and Principle 7 forbids inventing one."* Building this would not be an extension of the frozen model, as Speed is — it would be a direct reversal of one of its explicitly-stated boundaries.

**This document does not decide which reading the work package intends, and does not build either version.** A psychological-confidence construct, if genuinely wanted, requires a Founder decision to formally overturn Learning Engine V1 §9's behavioural-modelling exclusion — a significant, disclosed reversal, not a documentation detail, and structurally identical in kind to Product Experience Standard V1's own "Correction Log" pattern for reversing a previously-frozen decision. Not performed here.

## 3. Summary

| Requested dimension | Status |
|---|---|
| Accuracy | Already exists (Evidence Signal) |
| Consistency | Already exists (Evidence Tier) |
| Knowledge mastery | Already exists (Mastered Skills), reported per new Knowledge-class competency tag |
| Skill mastery | Already exists (Mastered Skills), reported per new Skill-class competency tag |
| Reasoning mastery | Already exists (Mastered Skills), reported per new Reasoning-class competency tag |
| Speed | Genuinely new; groundable in real existing data; proposed for a future logged Learning Engine V1.1 extension |
| Confidence | Ambiguous; one reading already satisfied, the other directly conflicts with an explicit existing boundary and requires a Founder decision to reverse — not resolved here |

**Zero new evidence axes were silently added to the frozen model. One classification layer (cognitive type) was added additively, in the same pattern as the Topic layer in Deliverable 2. One dimension (Speed) is proposed, not built. One dimension (Confidence) is flagged as requiring an explicit Founder decision before any work proceeds.**
