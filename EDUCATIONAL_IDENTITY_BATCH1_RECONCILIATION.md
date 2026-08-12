# Educational Identity Registration — Batch 1 Reconciliation Report (CORRECTED)

**Superseded in part by `EDUCATIONAL_IDENTITY_PHASE2C_FINAL_REPORT.md`**, which covers all three batches and is the authoritative source for final counts. This file is retained as the detailed Batch 1 record, corrected per the Founder's mandatory reconciliation instruction (2026-07-23).

**Correction applied**: the original version of this report (13 new registrations, 0 requiring review) is wrong. Two of the 13 — `eng-002-q2` and `eng-003-q2` — were genuine judgement calls presented with more certainty than the evidence supports. Both have been re-examined and moved to **requires-review**. Batch 1 now registers **11** items, not 13.

---

## Mandatory correction — the two reconciled judgement calls

### `eng-002-q2`

**Source**: "Look at the three types of silence Leo collects. What do these tell us about his home life?" (marks: 3, `data/lessons.ts`, lesson `eng-002`)

**Originally selected**: `QT-RC-05` (Quotation-and-Explanation, competency RC-02)
**Rejected alternative considered originally**: `QT-RC-08` (List-N-Items Extraction, competency RC-01)

**Why neither survives scrutiny**: `QT-RC-05`'s own already-tagged examples (`eng-002-q1`, `eng-002-q3`) each centre on **one specific quoted phrase** the student explains. This question instead references three items already enumerated *in the question itself* and asks the student to synthesise across all three — a different task shape. `QT-RC-08` means finding/listing N items **from the text**; here the three items are already given, and the actual task is inferring their combined significance, not extracting them.

**Outcome**: `educational_review_required`. Neither candidate's definition is met without stretching it.

### `eng-003-q2`

**Source**: "Why does Thomas compare the sound of the guns to 'weather — threatening but distant, like a storm that may or may not arrive'? What does this tell us about life in the trenches?" (marks: 3, `data/lessons.ts`, lesson `eng-003`)

**Originally selected**: `QT-RC-10` (Effect-of-Language Interpretation, competency RC-02)
**Rejected alternative considered originally**: `QT-RC-05` (Quotation-and-Explanation, competency RC-02)

**Why neither survives scrutiny**: this question sits genuinely between two already-used Question Types with **comparable strength on each side** — `QT-RC-10` per `eng-001-q3`'s "what effect/what technique" framing, `QT-RC-05` per `eng-002-q3`'s "what does this simile tell us" framing. The question's own phrasing plausibly matches either precedent equally well. The original report's own reasoning already flagged this as "genuinely ambiguous" — that admission itself is the evidence that certainty was not, in fact, present.

**Outcome**: `educational_review_required`. Not resolved by preference between two equally-plausible readings.

---

## Corrected Batch 1 counts

| | Original report | Corrected |
|---|---|---|
| Newly registered | 13 | **11** |
| Requiring educational review | 0 | **2** |

All other Batch 1 entries (`eng-001-q1`, `eng-001-q4`, `eng-003-q1`, and all 8 quick-arithmetic items) are unaffected — each matches an already-tagged sibling's Question Type by direct structural analogy, not a contested judgement call. See `scripts/educational-identity-registration.ts`'s `BATCH_1_REGISTRATIONS` for the retained reasoning and `BATCH_1_REVIEW` for the two corrected entries.

Sections 1 (source inventory), 2 (existing-18 reconciliation), 3 (collision report), and 7 (dotted-code inventory) from the original version of this report are unchanged and still accurate — see `EDUCATIONAL_IDENTITY_PHASE2C_FINAL_REPORT.md` for the consolidated, corrected version of all of them alongside Batches 2 and 3.
