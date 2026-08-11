# Mathematics Reference Vertical Blueprint

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Mathematics Learn → Practise Reference Vertical
**Prepared:** 2026-08-11
**Production baseline:** commit `3f6f1e3bc040a91478b0bcad389284da2e2447d4`, `https://angel-11plus.vercel.app/`

---

## 1. Objective

Build the first complete educational vertical — LEARN → PRACTISE → EVIDENCE → FEEDBACK → NEXT ACTION → MASTERY/MAINTENANCE — for exactly one Mathematics area, as the reference pattern later English, Continuous Writing, and further Mathematics areas will follow. Not a curriculum-wide transformation.

## 2. Area selection — re-verified, not assumed

Per the governing instruction's explicit "verify rather than automatically selecting it," MR-01 (Arithmetic Calculation) was re-confirmed this session with **fresh, direct evidence**, not carried over from the earlier Family Choice Pilot finding:

A live query against the production Supabase project (`agxunwcdatosrmzhhuxj`) counted real content per competency group:

| Competency group | Question Types | Live rows |
|---|---|---|
| **MR-01** | QT-MR-01, QT-MR-02, QT-MR-03, QT-MR-09, QT-MR-12 | **15** |
| RC-01–RC-04 (all four English competencies combined) | QT-RC-01…QT-RC-10 | 13 |
| MR-04 group | QT-MR-04, QT-MR-10, QT-MR-13 | 5 |
| MR-02/MR-03 group | QT-MR-05, QT-MR-06 / QT-MR-07, QT-MR-08 | 2 / 3 |
| MR-05 | QT-MR-11 | 1 |
| AR-01 | QT-AR-01 | 0 (Gate 3 deferred) |
| WC-01 | QT-WC-01a/b | 1 |

MR-01 has more real content on its own than all four English competencies combined, and no unresolved evidence gate (unlike AR-01/Gate 3 or Continuous Writing/WC-01). This satisfies all six selection criteria in the governing instruction §2: strong official evidence (below), authentic examination relevance (CSSE's own opening-question format, all three held years), sufficient existing platform support (Learning Engine V1, Practice runner, Family Choice, wellbeing, durable mastery — all already real and CSSE-scoped), sufficient content evidence (15 live items), no unresolved evidence gate, and demonstrated Learn→Practise→Evidence capability (the same evidence pipeline already proven end-to-end in the Family Choice Pilot).

## 3. Focused teaching topic within MR-01

MR-01 spans several sub-skills (direct computation, unit conversion, data reading, averages). Rather than spreading one lesson thinly across all of them, this vertical teaches the single most evidenced, most foundational sub-skill in depth: **written column methods for whole-number addition and subtraction, including regrouping (carrying and borrowing)**.

Evidence basis: `data/founderValidation/csseFounderValidationEvidence.ts`'s `fv-mth-001` entry cites CSSE-006/011/016 Q1–Q3 (2021–2023 Entry) as "the paper's opening question format in an identical shape across all three years," confirmed EMC-4/HIGH, with a documented difficulty basis of "single-step subtraction with borrowing." Two real, already-live production items match this pattern exactly: `qa-001` (847 + 356, carrying) and `qa-002` (1000 − 473, borrowing across zeros — CSSE's own hardest real regrouping case).

The broader MR-01 pool (multiplication, division, decimals, fractions, powers/roots — see `EXISTING_MATHEMATICS_CONTENT_AUTHENTICITY_REVIEW.md`) supplies the Practise stage's legitimate variation beyond the taught topic, without requiring a second lesson to be authored for this increment.

## 4. What this vertical proves

The full LEARN → PRACTISE → EVIDENCE → FEEDBACK → NEXT ACTION → MASTERY/MAINTENANCE cycle, using entirely real, already-built architecture (Learning Engine V1's evidence pipeline, `lib/ali/explainability.ts`, `lib/ali/wellbeing.ts`, the Family Choice Pilot's choice-injection point, durable mastery and maintenance review) — genuinely new work is confined to: the teaching content itself, the Learn UI that presents it, and the progression-state translation layer. No second evidence system, no new mastery model, no new wellbeing mechanism.

## 5. Deliverables

Ten documents (this one plus nine others — see the programme directory), plus real, implemented, production-deployed code.

## 6. Explicit boundaries (per governing instruction §18)

Not in scope this increment: mass Mathematics transformation, English, Applied Reasoning, Continuous Writing scoring, mass content authoring (150–250 items), or the full Mock Readiness engine.
