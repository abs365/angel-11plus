# Mathematics Lesson 002 — Skill Selection

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Mathematics Learning Sequence Expansion (Educational Increment 002)
**Prepared:** 2026-08-12
**Governing instruction:** "Select the lesson from the strongest remaining authenticated CSSE Mathematics evidence already held by Angel. The decision must be evidence-led... Do not assume MR-01 remains the correct competency merely because lesson one used it."

---

## 1. Evidence reviewed

- `ali_question_bank`, full `maths` subject rows (queried directly against the live database, both `pathway=['csse']` and `pathway=['csse-founder-validation']`), including `skill` (Question Type), `content_difficulty`, `explanation`, `mastery_threshold`.
- `lib/learningEngine/assessmentBrainMap.ts` — the 6 Mathematics competencies (MR-01 through MR-06) and their Question Type mappings.
- `docs/intelligence/ASSESSMENT_BRAIN_V1.md` §3, §4, §7 — the frozen, canonical Evidence Maturity (EMC) ratings per competency and per Question Type, and the explicit correction history (MR-02/MR-03/MR-04 were upgraded EMC-2 → EMC-4 after a full three-year re-review; MR-01 and MR-05 were **explicitly considered for the same upgrade and rejected**, remaining capped below MR-02/03/04).
- `MATHEMATICS_LEARNING_DESIGN.md`, `MATHEMATICS_PROGRESSION_AND_MASTERY_MODEL.md` — Lesson 001's own design and evidence architecture, to identify what is already proven and what is genuinely new ground.
- `FAMILY_CHOICE_AND_RECOMMENDED_FOCUS_MODEL_V1.md`, Family Choice Pilot reports — to check whether the Pilot's own findings constrain or inform this selection (they do not name a specific "next skill"; the Pilot is scoped to MR-01 only, see §5 below).

## 2. Evidence Maturity is not what Lesson 001 might suggest

Per `ASSESSMENT_BRAIN_V1.md` §7's frozen scale (EMC-4 = Established, highest; EMC-1 = Provisional, lowest), the six Mathematics competencies rank:

| Competency | Name | EMC | Confidence |
|---|---|---|---|
| MR-02 | Algebraic / Symbolic Problem-Solving | **EMC-4** | HIGH |
| MR-03 | Geometric and Spatial Reasoning | **EMC-4** | HIGH |
| MR-04 | Multi-Step Word-Problem Interpretation | **EMC-4** | HIGH |
| MR-06 | Precision Under Exact-Match Conditions | **EMC-4** | HIGH |
| MR-01 | Arithmetic Calculation (Lesson 001's own competency) | EMC-3 | HIGH (no-calc) / MEDIUM (depth) |
| MR-05 | Number Properties and Number Theory | EMC-2 | LOW |

MR-01 was **explicitly considered** for the EMC-4 upgrade given to MR-02/03/04 and **explicitly rejected** — AEP-004 found only partial, not full, multi-year support. Lesson 001's own competency is therefore not, on the formal evidence scale, the strongest available. This selection takes that scale at face value rather than assuming continuity with Lesson 001.

## 3. Real, usable question count per competency (pathway = `csse`, production-reachable today)

| Competency | Production items | Notes |
|---|---|---|
| MR-01 | 11 (beyond Lesson 001's own 3 teaching items) | Deepest pool by far, but EMC-3, and further arithmetic content risks reading as "more of the same" directly after Lesson 001 |
| MR-04 | 5 (`mth-010`, `qa-007`, `mth-007b`, `mth-001`, `mth-005`) across 3 distinct Question Types (QT-MR-04 Percentage/Proportional Change, QT-MR-10 Elapsed-Time, QT-MR-13 Best-Value) | QT-MR-04 alone: 3 items, all EMC-4/HIGH, all citing the full 3-year evidence base (CSSE-006/011/016) |
| MR-03 | 2 (`mth-003`, `mth-009`) | `mth-003` is **self-flagged** in its own `explanation` as an imperfect, judgement-call tagging (mixed algebraic+geometric question, dominant-skill decision) — a genuine authenticity concern, see §4 |
| MR-02 | 1 (`mth-006`) | Sequence/function-rule item with a **compound answer** requiring the existing semicolon-split checker — real, but thin, and adds UI complexity beyond the established single-value-answer teaching-item pattern |
| MR-05 | 1 (`qa-010`) | Single item, matches MR-05's own EMC-2/LOW rating |
| MR-06 | 0 | No QT-MR-14-tagged rows exist in the bank at all |

## 4. Ranked candidates

Ranked per the eight required criteria (authenticity/evidence strength; usable question count; educational importance; CSSE frequency/relevance; coherent single-skill teachability; guided-learning suitability; independent-transfer suitability; honest measurability).

### 1st — MR-04, Question Type QT-MR-04 (Percentage / Proportional Change)

- **Evidence strength:** EMC-4 (Established), HIGH confidence, full 3-year evidence (CSSE-006, 011, 016) — the same tier as the strongest Mathematics competencies in the frozen Brain.
- **Question count:** 3 real production items on this exact Question Type (`mth-010`, `qa-007`, `mth-007b`), of which 2 are genuinely the same concrete skill (percentage-of-a-quantity) and 1 is excluded for a real skill mismatch despite the shared tag (§ Question Authenticity Gate, `MATHEMATICS_LESSON_002_EVIDENCE_MAP.md`).
- **Educational importance / CSSE frequency:** Percentage-of-a-quantity is one of the most common calculation types in UK 11+ maths papers generally, and is directly evidenced across all three held CSSE years.
- **Coherent teachability:** Bounded to a single, nameable operation ("find X% of a quantity"), distinct from Lesson 001's column arithmetic, so the subject journey gains genuine new ground rather than repeating the same operation family.
- **Guided/independent/transfer suitability:** The "find 10%, then build up" method scaffolds naturally into 2–3 discrete hint steps (matching Lesson 001's hint ladder exactly), has a single numeric answer (no compound-answer UI complexity), and supports a genuinely different fresh-transfer problem at the same skill.
- **Honest measurability:** Single-value numeric answer, checked by the existing `checkMathsAnswer()` unmodified.

### 2nd — MR-01, a remaining arithmetic sub-skill (e.g. multiplication/division/decimals)

- **Evidence strength:** EMC-3, one tier below the winner — explicitly not upgraded by AEP-004.
- **Question count:** Strongest pool by volume (11 unused items), lowest content-authoring risk, safest continuation of an already-proven pattern.
- **Educational importance:** Real and high (arithmetic fluency underpins everything), but Lesson 001 already teaches this competency; a second MR-01 lesson risks feeling like "more of the same operation" rather than a new skill in the subject journey (governing instruction §9: "a learner should be able to understand... what comes next" as a *coherent subject journey*, not a repeat).
- Runner-up on evidence-maturity grounds alone; would have been the safe, low-risk default, which is exactly why the governing instruction warned against assuming it by default.

### 3rd — MR-03, Geometric and Spatial Reasoning (e.g. volume/area formula application)

- **Evidence strength:** EMC-4 (Established), formally tied with MR-04 for the highest tier.
- **Question count:** Only 2 production items, and one (`mth-003`) is self-flagged as an imperfect, judgement-call tagging — a real authenticity concern, not a clean pool. Building a full guided → independent → transfer sequence would mean authoring nearly all-new content against a single genuinely clean precedent (`mth-009`), a materially higher content-authoring and provenance risk than MR-04's 2 clean items.
- Rejected for this increment specifically because of thin, partly-questionable evidence, not because the competency itself is weak — flagged as a strong candidate for a future Lesson 003 once more Geometric/Spatial content exists.

## 5. Selected

**MR-04, Question Type QT-MR-04 — "Percentage / Proportional Change," narrowed to the concrete skill: calculating a specified percentage of a whole-number quantity.**

## 6. Disclosed limitation: Family Choice Pilot scope

The Family Choice Pilot (`app/learning-intelligence/founder-validation/family-choice/page.tsx`) is hardcoded to a single pilot competency, MR-01. This increment does **not** extend the Pilot to MR-04 — doing so would mean modifying a named, frozen pilot mechanism outside this increment's authority. Lesson 002's evidence is fully visible through the general Educational Intelligence / Parent Dashboard paths (unmodified), just not through the Family Choice choice-injection mechanism specifically. See `MATHEMATICS_LEARNING_SEQUENCE_RULES.md` §4.
