# Findings: Test Structure & Format Evolution

**Programme:** Assessment Excellence Programme — Phase 3, Workstream 1
**Scope:** Synthesis only. No new web research performed. Every claim below traces to a Phase 2 register entry (`AEP2-###`), an existing `knowledge/csse/` asset (`CSSE-###`), or a specific Angel file:line. Where evidence is insufficient, that is stated explicitly rather than filled with a plausible guess.
**Inputs read:** `ASSESSMENT_EXCELLENCE_EVIDENCE_REGISTER.md`, `research-notes/01-csse-consortium.md`, `KA-001_KNOWLEDGE_ACQUISITION_REPORT.md` + `knowledge/csse/assets/CSSE-001.md`, `docs/intelligence/ASSESSMENT_BRAIN_V1.md`, `CSSE_EXAMINATION_BLUEPRINT.md`, `CSSE_QUESTION_TAXONOMY.md`, `CSSE_COMPETENCY_TOPIC_MAPPING.md`, `lib/learningEngine/assessmentBrainMap.ts`.

---

# Finding 1: Core Two-Paper Test Structure Is Evidenced as Stable From 2021 Entry Through 2027 Entry, With Two Genuine Within-Component Fluctuations That Do Not Amount to a Trend

## 1. Official Evidence

**Two-subject, single-day structure.** CSSE-001 (2027 Entry Information Guide, Level B, held under KA-001) confirms candidates sit two written papers — English and Mathematics — on one day, raw-scored, standardised, age-adjusted, weighted 50/50, with no re-marking and no offer below standardised score 303 (`ASSESSMENT_BRAIN_V1.md` Observation 1, HIGH confidence, citing CSSE-001).

**Annual sitting pattern across five entry cohorts.** Phase 2's research notes independently confirm, via direct `pdftotext` extraction (not filename inference), three further Information Guide editions still live on `csse.org.uk`:
- 2025 Entry guide: test date "Saturday 21st September 2024" (`research-notes/01-csse-consortium.md` item 2; register `AEP2-066`/`AEP2-012`/`AEP2-088`)
- 2026 Entry guide: test date "Saturday 20th September 2025" (`research-notes/01-csse-consortium.md` item 1; register `AEP2-065`)
- 2027 Entry guide (CSSE-001): test date "Saturday 19th September 2026"

These three dates, plus CSSE-001's own 2027 Entry cycle, establish an unbroken annual single-Saturday sitting pattern for at least five consecutive entry cohorts (2023 through 2027, combining CSSE-001/003/006 evidence with the newly-confirmed guide dates). No official source in either evidence base states or implies a change to the one-day, two-subject format in any of these years.

**English internal structure (2021-2023 only).** `ASSESSMENT_BRAIN_V1.md` Observation 2 (HIGH) — drawn from CSSE-003/004/008/009/013/014 — establishes English as a single 70-minute sitting (60 min + 10 min reading) divided into three timed sections: Comprehension (30 min), Applied Reasoning (10 min), Continuous Writing (20 min, separate booklet). This is confirmed identically across all three held years (2021, 2022, 2023).

**Two genuine within-component fluctuations, both confined to a single evidence base (2021-2023):**
- Mathematics question count: 21 numbered questions in 2021 and 2022, 20 in 2023, within an unchanged 60-minute/60-mark paper (Observation 3, HIGH — corrected under Assessment Brain V1's consolidation from an earlier factual error; citing CSSE-006/007/011/012/016/017).
- Continuous Writing numeric mark total: 15 marks (2021), 15 marks (2022), 20 marks (2023) — and a Content/SPAG marks split appears on the 2023 paper only, absent in 2021 and 2022 (Observations 9 and 13, MEDIUM; citing CSSE-004/009/014).

**Comprehension+Reasoning combined section total** also varies (45 vs 40 marks across the three years; the 2022 figure is unextractable from the available marking scheme) — Observation 4, MEDIUM, an acknowledged open gap, not a confirmed three-point series.

## 2. Educational Interpretation

**Long-term trend (sustained, multi-cohort):** the one-paper-per-subject, one-day, 50/50-weighted, age-standardised, 303-floor architecture is the only element with evidence spanning five entry cohorts (2023-2027 via the Information Guide dates, reinforced by 2021-2023 paper-level detail). This is genuine long-term stability, not merely an assumption of continuity.

**Short-term variation, not a trend:** the Mathematics question-count change (21→21→20) and the Comprehension+Reasoning combined-total variation (45/unknown/40) are each drawn from only three data points, with one year in each series unresolved or the odd one out. Neither series has enough points to distinguish "trending down" from "ordinary year-to-year format tweaking." Calling either a trend would overstate what three data points (one incomplete) can support.

**One-off anomaly, flagged not generalised:** the Continuous Writing mark-total jump to 20 and the appearance of a Content/SPAG split both occur in the same year (2023) and nowhere else in the held evidence. Because they co-occur, it is plausible they reflect one coordinated marking-scheme change introduced for 2023 — but with no 2024 or 2025 Continuous Writing paper held, there is no evidence whether this became the new stable pattern or reverted. This must be reported as a single-year anomaly with a plausible-but-unconfirmed follow-on, not as an established policy change.

**No conflict between the ANGEL-CSSE-001 doc set and Phase 2 evidence on this specific point.** `CSSE_EXAMINATION_BLUEPRINT.md` §3 independently corroborates the two-paper, same-day, 120-combined-mark, age-standardised structure using its own (lower-rigor, secondary-source) 2026 research, and states this is "consistent with Section 2" (the Assessment Brain primary-source structure). The two evidence bases agree here.

## 3. Implication for Angel

- **The 13-competency model's Mathematics domain (MR-01 through MR-06) and Mathematics Question Types (QT-MR-01 through QT-MR-14):** **aligned.** The underlying content domains (arithmetic, algebra, geometry, word problems, number theory) are confirmed stable across all three held years, and nothing in the newer Information Guide dates contradicts this. Recommend: **retain.**
- **The English Comprehension competencies (RC-01 through RC-04) and their Question Types:** **aligned** with the 2021-2023 evidence; the annual sitting-pattern evidence (Finding 1) gives no reason to doubt currency, but note this finding did not itself re-verify Comprehension's internal structure past 2023 — see Finding 2 for the one component (Applied Reasoning) where currency is actually in question. Recommend: **retain.**
- **WC-01 (Sustained Original Composition) and WC-02 (Multi-Dimensional Writing Quality):** **partially aligned.** WC-01 rests on a stable 3/3-year format; WC-02 already carries EMC-1 (Provisional) status in Assessment Brain V1 precisely because of the unresolved rubric-vs-marks gap this Finding reconfirms (Observation 10, narrowed but not resolved by Observation 13). Recommend: **retain**, with the existing open-gap flag preserved — this Finding adds no new evidence to resolve it.

## 4. Founder Review

Every classification and recommendation above is provisional. No architectural or content decision about Angel's Assessment Brain, competency model, or question-type taxonomy should be taken from this Finding alone — it is a synthesis of existing evidence, not a Founder-approved instruction. Architectural decisions remain Founder-approval-only.

---

# Finding 2: The Claimed "Applied Reasoning Removed From September 2024" Structural Change Cannot Be Confirmed or Refuted by the Official Evidence Phase 2 Acquired — This Is an Evidence Gap, Not a Resolved Fact

## 1. Official Evidence

`CSSE_EXAMINATION_BLUEPRINT.md` §5 (work package ANGEL-CSSE-001, not part of the Phase 2 Evidence Register) states: *"With effect from September 2024 (2025 Entry) the English paper does not contain Applied Reasoning questions,"* attributed to a single source, `elevenace.com` — a third-party 11+ tutoring website. The Blueprint's own §7 summary table rates this claim **"MEDIUM — single secondary source, not independently corroborated against a primary 2024/2025 document."** `elevenace.com` does not appear anywhere in the Phase 2 Evidence Register (`AEP2-001` through `AEP2-101`) and is not a Level 1 or Level 2 source under this programme's evidence hierarchy — it is uncited, tertiary material outside Phase 2's evidence base entirely.

Phase 2 did separately, independently acquire three official CSSE Information Guide editions covering exactly the period in question:
- `AEP2-066` / `AEP2-012` / `AEP2-088` — CSSE 11+ Information Guide, **2025 Entry** (test sat 21 Sept 2024 — the first cohort the elevenace.com claim says is affected)
- `AEP2-065` — CSSE 11+ Information Guide, **2026 Entry** (test sat 20 Sept 2025)
- CSSE-001 — CSSE 11+ Information Guide, **2027 Entry** (already held under KA-001, test sat 19 Sept 2026)

Critically, per `research-notes/01-csse-consortium.md` items 1-2 and the register's own Validation Status column, Phase 2's verification of these three documents was **document-identity verification only** — `curl` HTTP 200 + `pdftotext` confirmation that the extracted text opens with the correct title and test date. None of the three register entries, nor the readiness report, records that the guides' internal sections describing paper format/subject composition were read or extracted. `AEP2-012`'s own Notes field records only that it was used to cross-verify a school's PAN figure and the CSSE-wide 303 floor — not exam structure. No AEP2-### entry, and no line in `ASSESSMENT_EXCELLENCE_SOURCE_READINESS_REPORT.md`, states what the 2025 or 2026 Entry guide says (or does not say) about Applied Reasoning.

## 2. Educational Interpretation

This is neither a confirmed long-term trend, nor a short-term variation, nor a confirmed one-off anomaly — it is an **unresolved evidence gap**. Two things are true simultaneously and must not be blended:

1. Assessment Brain V1's Applied Reasoning evidence (Observation 2, Observation 5, competency AR-01, Question Type QT-AR-01) is itself solid **for the years it covers** — real primary-source papers, 2021-2023, HIGH confidence on the section's existence.
2. Whether that section is still present in the 2025, 2026, or 2027 Entry papers is **genuinely unknown** from any Level 1 or Level 2 evidence currently held. The claim that it was removed rests on one uncorroborated tertiary source; but its *absence* from that claim's confirmation is equally not evidence that Applied Reasoning *is* still present — Phase 2 simply never read that part of the documents it already downloaded.

**Where the two evidence bases genuinely conflict:** `CSSE_EXAMINATION_BLUEPRINT.md` treats this as an open, single-source-only finding and explicitly declines to apply it as a correction to Assessment Brain V1 (its own §5, citing Assessment Brain V1's freeze condition). This Finding does not disagree with that caution — if anything it reinforces it: Phase 2's acquisition of the very editions that could resolve this (2025/2026/2027 Entry guides) makes the follow-up action the Blueprint already recommended ("acquire the actual CSSE Guide... and, if it confirms the Applied Reasoning removal, run a formal correction") a **live, low-cost, already-half-done task** — the documents are identified and their URLs are known; only the read-and-extract step remains.

## 3. Implication for Angel

- **Competency AR-01 ("Letter-Code Pattern Inference and Application") and Question Type QT-AR-01:** **partially aligned.** Aligned with the verified 2021-2023 primary-source evidence; currency for the 2025-2027 cohorts Angel's current learners are actually preparing for is **unconfirmed**, not confirmed-stable and not confirmed-removed. Recommend: **strengthen** — specifically, read the internal content of the already-identified `AEP2-065`/`AEP2-066` Information Guides (and cross-check CSSE-001's own 2027 Entry text) for their paper-format/section description before any structural decision is made. Do **not** retire or hide AR-01 on the strength of a single uncited tertiary source; do **not** treat it as settled-current either.
- **The "Applied Reasoning" `AssessmentComponent` wired into Angel's code** (`lib/learningEngine/assessmentBrainMap.ts:27,50,90,98` — `COMPETENCIES["AR-01"]`, `QUESTION_TYPE_PRIMARY_COMPETENCY["QT-AR-01"]`, and `Applied Reasoning` listed in both `COMPONENT_SUBJECT` and `ALL_ASSESSMENT_COMPONENTS`) is currently live application logic built on the same 2021-2023-only evidence. Because Assessment Brain V1 is explicitly frozen and this file is documented as "a direct transcription" of it (`assessmentBrainMap.ts:9`), the code is internally consistent with its own frozen source — but that source's currency for present-day learners is exactly the open question above. Recommend: **strengthen** (resolve the evidence gap) before considering any change to this file; this Finding makes no code-change recommendation itself.

## 4. Founder Review

This Finding does not resolve whether Applied Reasoning has been removed from the CSSE English paper. It states plainly that the evidence to answer that question either way is not currently held in verified form, despite the source documents already being identified and downloadable. Every recommendation above (strengthen, not retire/hide/replace) is provisional guidance only. The decision whether to authorise the follow-up read-and-verify action, and any subsequent decision about AR-01/QT-AR-01's status, remains Founder-approval-only and is not inferred here.

---

## Summary Table

| Element | Evidence pattern | Classification | Recommendation |
|---|---|---|---|
| Two-paper, one-day, 50/50-weighted, 303-floor structure | Long-term (5 cohorts, 2023-2027) | Aligned | Retain |
| Mathematics domains (MR-01–06) / Question Types | Stable, 3/3 years (2021-2023) | Aligned | Retain |
| Comprehension (RC-01–04) | Stable, 3/3 years (2021-2023); not re-checked past 2023 in this Finding | Aligned | Retain |
| Mathematics question count (20 vs 21) | Short-term variation, 3 data points | Aligned (does not affect competency model) | Retain |
| Continuous Writing marks (15/15/20) + Content/SPAG split | One-off anomaly, 2023 only | Partially aligned (WC-02 already EMC-1) | Retain, gap unresolved |
| Applied Reasoning (AR-01 / QT-AR-01) currency for 2025-2027 cohorts | Unresolved evidence gap — single uncorroborated tertiary claim vs. unread official guides | Partially aligned | Strengthen (read the already-held 2025/2026/2027 Information Guides) |

*All classifications and recommendations in this document are provisional and subject to Founder review. No implementation or redesign has been performed.*
