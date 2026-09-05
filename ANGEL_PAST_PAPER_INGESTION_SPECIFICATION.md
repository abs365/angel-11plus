# Angel 11+ — Past-Paper Ingestion Specification

**Prepared:** 2026-09-05, Phase 4/Section 9 supporting document. This specification is deliberately conservative: it stops at a licensing decision point the Founder must make personally, per their own explicit instruction that "a legal/licensing decision requires founder authority." Nothing in this document authorises ingesting any actual past-paper content, and no ingestion has been performed.

---

## 1. Why This Is Gated, Not Just Designed

CSSE, GL Assessment, CEM, and ISEB past papers (and their official practice/familiarisation materials) are, in the general case, copyrighted works of the issuing body or its publisher. This is true regardless of whether a paper is freely downloadable from a school or council website — free access is not the same as a licence to reproduce, adapt, or commercially redistribute the content. Angel is a commercial product; using an exam board's actual questions as Angel practice content (verbatim, lightly reworded, or "inspired by" closely enough to be a derivative work) creates a genuine legal exposure the Founder named explicitly: **"Angel must not create future commercial risk by copying proprietary question banks."**

This specification therefore separates two things that are easy to conflate:

- **Analysis** of past papers (structure, mark schemes, topic coverage, question *style* and difficulty calibration) — informs Angel's own original-question specifications, carries no meaningful copyright exposure, and is already partially reflected in `docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md`.
- **Ingestion** of past papers as source material for practice content — a genuine licensing question, addressed below.

---

## 2. What a Safe Ingestion Pipeline Would Look Like, IF Licensing Permits It

Structured for completeness, not as an approval to proceed:

1. **Founder-supplied source only.** No scraping, no automated web retrieval of exam-board content — the Founder's own instruction ("do not scrape or reproduce copyrighted question banks") already rules this out as a mechanism, regardless of licensing status.
2. **Provenance tagging at the point of entry.** `ali_question_bank.provenance` already exists as a column (confirmed live this session). Any past-paper-derived item must be tagged with its real source (board, paper, year, question number) at ingestion, not left blank — this is the field the capacity audit's §16 already names as present but "no automated scan" exists to check it is actually populated correctly.
3. **Transformation, not reproduction, as the working assumption.** Even where a licence permits use, the safest default is that Angel authors a genuinely new, structurally-inspired-but-independently-written question, using the past paper only as a difficulty/style/topic reference — the same discipline as Section 1's "analysis, not ingestion" distinction, applied item-by-item rather than paper-by-paper.
4. **Mandatory human educational review**, routing through the same existing surface as every other content source (`ANGEL_QUESTION_FACTORY_SPECIFICATION.md` Stage 5) — no past-paper-derived item skips review because it "came from a real exam."
5. **A dedicated, disclosed inventory class.** If ingestion proceeds, past-paper-derived content should be visibly distinguishable in `provenance` and in any future content-supply reporting, so a future audit (or a licensing dispute) can immediately identify the scope of what was ingested, from where, and under what stated basis.

---

## 3. What This Document Does Not Do

- It does not confirm any specific exam board's licensing terms — that requires the Founder to obtain or confirm a licence, or to make a documented risk decision, personally.
- It does not recommend a timeline or priority for ingestion relative to the other supply sources in `ANGEL_QUESTION_SUPPLY_ARCHITECTURE.md` — that section already places this item behind a licensing gate, not on the sequenced build path, until the gate clears.
- It does not treat "no licence explicitly denies this" as equivalent to "this is permitted." The default position, absent a Founder decision, is **do not ingest**.

## 4. Open Question for the Founder

Whether Angel already holds, or should seek, any licence or permission from CSSE, GL Assessment, CEM, or ISEB (or their publishers) for use of past-paper material in any form. Until this is answered, this specification's Section 2 remains a design-only reference, not an implementation plan.
