# Findings: Standardisation Methodology & the "303" Minimum Floor

**Programme:** Assessment Excellence Programme — Phase 3 (Evidence Synthesis), Workstream 2
**Scope:** Synthesis only, of already-verified Phase 2 evidence (`ASSESSMENT_EXCELLENCE_EVIDENCE_REGISTER.md`, AEP2-001..101, and `research-notes/01-csse-consortium.md`). No new web research performed. No file other than this one was edited.
**Status:** DRAFT for Founder review. Not implemented, not acted on.

---

# Finding 1: How CSSE Converts Raw Scores to Standardised Scores

## 1. Official Evidence

- CSSE candidates sit English and Mathematics on the same day; each is raw-scored, then standardised, then age-adjusted, then weighted 50/50 into a combined score (AEP2-067, AEP2-005; consistent with the pre-existing frozen `ASSESSMENT_BRAIN_V1.md` §2, Observation 1, itself sourced to CSSE-001).
- CSSE's own **Age Standardisation Statement** (AEP2-067, Evidence Level 1) states, in its own words as extracted directly from the document: "The results of all candidates will be analysed, by date of birth, to determine if a statistical age-adjustment is required... a modified approach to calculating age-adjustment will be adopted from October 2018." The document's metadata is dated 07/04/2020; the change it describes took effect from October 2018, following a ruling by the Office of the Schools Adjudicator.
- CSSE publishes an annual **Standardisation Report** for each entry year (AEP2-068, Evidence Level 1). The Phase 2 research note describes these reports as documenting "the mean/standard-deviation values CSSE used to convert that year's raw English and Maths scores into standardised scores (target mean 100, SD 15)" (`research-notes/01-csse-consortium.md`, item 4, introductory line). **This specific "target mean 100, SD 15" figure is the research note's own summary description of what a Standardisation Report is for — it is not shown in the register or notes as a verbatim quotation extracted from any specific report's text.** It should be treated as a plausible characterisation consistent with standard UK 11+ age-standardisation practice, not as an independently content-verified fact for any specific year.
- Of the 7 Standardisation Reports found (2019–2025 entry, by URL year label), only 3 were content-readable via `pdftotext`: the "2020 Entry" report (confirmed text: "11+ Standardisation Report - October 2019," n=5,465), the "2021 Entry" report (confirmed text: "11+ Standardisation Report - October 2021," n=4,815), and the "2023 Entry"-labelled report (confirmed text: "11+ Standardisation Report - October 2023," n=4,983) (AEP2-068). None of these three readable excerpts, as captured in the register/notes, includes the actual mean/SD numbers used that year — only the report's title, date, and candidate count (n) were captured.
- The other 4 reports (URL-labelled "2019," "2022," "2024," "2025" entry) are confirmed to exist, resolve on the official domain, and be valid, correctly-sized PDFs, but returned **zero extractable text** — image-only PDFs. Their internal content, including any mean/SD figures, was **not independently read** (AEP2-068).
- CSSE's own year-labelling convention offsets by one year: a report URL-labelled "20XX Entry" contains data from the October (20XX−1) test sitting. This was confirmed for the 3 readable reports only, not assumed for the other 4 (AEP2-068, `research-notes/01-csse-consortium.md` item 4).

## 2. Educational Interpretation

- **What is established (long-term, structural):** the two-paper, age-standardised, 50/50-weighted combined-score model is a stable structural feature of the CSSE process, evidenced consistently across CSSE-001 (2027 Entry guide, already held) and AEP2-005/AEP2-012 (2023 and 2025 entry cycles). This is not something that appears to vary year to year.
- **What is established but represents a one-off, dated change:** the age-adjustment *calculation method itself* changed once, effective October 2018, following an external regulatory ruling (Office of the Schools Adjudicator). This is a one-off historical event, not an ongoing trend — but it means any pre-October-2018 standardisation data (none of which is in this evidence base) would not be comparable on a like-for-like basis to the post-2018 data.
- **What is a genuine, disclosed evidence gap, not a finding:** the precise statistical mechanism (e.g. whether it is a simple linear rescale to a target mean/SD, a more complex banded adjustment, or something else) is not confirmed by directly-read primary text for 4 of the 7 available Standardisation Reports, and even for the 3 readable reports, the register does not show the actual mean/SD values being quoted. This is a real limitation of the evidence base, not something to be inferred or guessed at.
- No conflict exists in the evidence gathered — the gap is one of *completeness* (image-only PDFs, no PDF-to-image renderer available in the Phase 2 research environment), not of *disagreement* between sources.

## 3. Implication for Angel

| Angel component | Claim | Classification | Basis |
|---|---|---|---|
| `lib/learningEngine/admissionsContext.ts` — combined-score description ("age-standardised, weighted 50/50") | Matches the structural evidence exactly; makes no claim about the specific standardisation formula | **Aligned** | Structural claim only, fully supported by AEP2-005/AEP2-067 and pre-existing CSSE-001 |
| `docs/intelligence/ASSESSMENT_BRAIN_V1.md` §2, Observation 1 | Same structural claim, HIGH confidence, cited to CSSE-001 | **Aligned** | No overreach — does not claim to know the exact statistical mechanism |
| `docs/intelligence/ADMISSIONS_INTELLIGENCE_V1_DESIGN.md` §4.2 — "Angel does not hold CSSE's actual standardisation formula... no plan to acquire" | Accurately disclosed as a gap Angel does not close | **Aligned** | Directly consistent with the genuine evidence gap found in Phase 2 (4 of 7 reports unreadable, no mean/SD figures independently confirmed even for the readable 3) |

No Angel component currently claims to know or replicate CSSE's precise age-standardisation formula. The evidence found in Phase 2 does not change this picture — it confirms the gap is real (not merely assumed) and, if anything, shows the gap is *larger* than previously documented: even the 3 "readable" Standardisation Reports did not yield the actual mean/SD figures in what was captured, only title/date/n.

**Recommendation: retain** all three components as currently worded. No change is evidentially justified. If a future work package wanted to strengthen the methodology disclosure with a citation to the Age Standardisation Statement's October 2018 detail, that would be an optional content enhancement, not a correction — but is not recommended as necessary given the current wording already avoids overclaiming.

## 4. Founder Review

Every recommendation above is provisional and for Founder review only. No file other than this synthesis document has been changed. In particular: whether to attempt further acquisition of the 4 unread Standardisation Reports (e.g. via an external PDF-to-image renderer not available in the Phase 2 environment) is a Founder/programme-owner decision, not inferred here. No assumption is made about what the Founder will decide.

---

# Finding 2: The "303" Minimum Floor — Stability, and Whether It Means the Same Thing at Every School

## 1. Official Evidence

- **Where 303 is stated as policy:** CSSE's own 11+ Selective Test Information Guide — 2025 Entry (AEP2-012, published March 2024) states a "CSSE-wide floor of 303," explicitly distinguished in that same document from CRGS's own internal ">320 Priority-1 threshold." The pre-existing, separately-frozen `ASSESSMENT_BRAIN_V1.md` Observation 1 records the same 303 figure, sourced to CSSE-001 (Information Guide, 2027 Entry). This means the 303 policy statement has been found, worded consistently, in at least two separate editions of CSSE's Information Guide (2025 Entry and 2027 Entry), roughly two years apart in publication.
- **Where 303 is confirmed as actual 2023-entry outcome data:** AEP2-005 ("Scores of last selective place offered at each CSSE school on National Offer Day (1st March 2023)") is a single-year table, **independently re-fetched and content-verified by the Phase 2 compiler on 2026-08-05** (not merely accepted from an agent report). The full table, for 2023 entry, reads exactly as follows:

| School | Inside priority area | Outside priority area |
|---|---|---|
| Colchester County High School for Girls | *(no priority-area split)* | 333 |
| Colchester Royal Grammar School | *(no priority-area split)* | 340 |
| King Edward VI Grammar School | 347 | 366 |
| Southend High School for Boys | 303 | 342 |
| Southend High School for Girls | 303 | 324 |
| Westcliff High School for Boys | 303 | 349 |
| Westcliff High School for Girls | 303 | 342 |

  (AEP2-005; the document itself states these figures "fluctuate from year to year" and must not be treated as representative of any year other than 2023 entry.)
- **On the Colchester schools specifically:** AEP2-005 confirms Colchester County High School for Girls and Colchester Royal Grammar School have **no priority-area distinction** — each publishes a single lowest-offered score (333 and 340 respectively for 2023 entry), not an "inside/outside" pair. Neither figure is 303, or close to it.
- **On stability across years:** the evidence base does **not** contain a second, independently content-verified full 7-school table for any other year. The compiled "Historical Guidance Sheets 2019 Entry to 2024 Entry" document (AEP2-072/AEP2-089) was found to be a valid PDF on the official domain but returned no extractable text — its content, including whether the 303 figure or any other floor applied in those years, was **not independently read**. One further data point exists: a separately-read Historical Guidance Sheet opens with "Scores of last selective place offered at each CSSE school on National Offer Day (1st March 2024)... ESSEX GRAMMAR SCHOOLS 2024 ENTRY... Colchester County High School for Girls... 330" (`research-notes/01-csse-consortium.md`, item 8) — this is a single additional 2024-entry data point for one school only (CCHSG, 330, again with no priority-area split and again well above 303), not a second full-table cross-check of the floor itself.
- Two further CCHSG-specific figures for a different year (Sept 2025 cut-off) appear in the register, in mutual conflict: 321–322 per AEP2-053 vs. 323–324 per AEP2-054, both official CCHSG-authored FAQ documents, recorded as an internal unresolved conflict in Workstream 4's gap notes — not resolved here either. Both figures, whichever is correct, remain well above 303.

## 2. Educational Interpretation

**This is the central finding of this workstream, and it has not, to this compiler's knowledge, been stated plainly anywhere else in this programme's evidence base: 303 is a consortium-wide absolute policy backstop ("no offer below this score, anywhere, ever"), not a representative estimate of what any individual school's actual cut-off will be.**

- **Long-term / structural pattern (as far as evidence allows):** the 303 figure itself has been found stated, consistently and without contradiction, in two separately-dated editions of CSSE's own Information Guide (2025 Entry and 2027 Entry, ~2 years apart). No source in the evidence base states a different floor number for any year. This supports treating 303 as a stable **policy** figure over the window for which guide editions were found — but this is evidence of the *stated rule's* stability, not proof the *number* has never changed across the full 2016–2026 window, since no Information Guide edition older than 2025 Entry was checked for this specific figure.
- **Short-term variation (2023-entry snapshot, the only fully cross-verified year):** the *actual* lowest offered score varies enormously by school and by priority-area category within that single year — from 303 (the floor itself, at four schools' priority-area category) up to 366 (KEGS, outside priority area). This is a spread of 63 standardised-score points within one single year's data, all in one consortium.
- **A genuine, evidence-supported pattern, not an inference beyond the data:** in the one year for which full cross-verified data exists (2023 entry), the 303 floor was the *actual, binding* cut-off for priority-area applicants at exactly four schools — Southend High School for Boys, Southend High School for Girls, Westcliff High School for Boys, and Westcliff High School for Girls — all four being the Southend-administered group. At those same four schools, the *outside*-priority-area cut-off was substantially higher (324–349). At King Edward VI Grammar School, even the *inside*-priority-area cut-off (347) was well above the floor. At both Colchester schools — which have no priority-area distinction at all — the single published cut-off (333, 340) was also well above the floor.
- **Whether this exact four-schools-at-303 coincidence is itself a one-off feature of 2023 or a recurring structural pattern cannot be determined from this evidence base** — no other year has a fully cross-verified 7-school table. This must be stated as an open gap, not resolved by inference from the single available year.
- **Does 303 "mean the same thing" at every school? No — this is the direct, evidenced answer to the Founder's question.** It means one specific thing everywhere (a hard floor, no offer is ever made below it, per CSSE's own stated policy) but its *practical relevance* to any given school differs enormously: at the Colchester schools it is a distant, non-binding floor a successful candidate's score will exceed by 30+ points; at KEGS it is non-binding even for the "easier" (inside-area) category; at the four Southend-group schools in 2023 specifically, it happened to be the literal cut-off for priority-area candidates. Presenting 303 without this context risks a parent reading it as "roughly what you need," when the 2023 evidence shows most schools' actual thresholds sit well above it.
- No direct conflict exists between sources on the 303 figure itself. The conflicts found (WHSG PAN, CCHSG's two Sept-2025 cut-off figures) are unrelated administrative/data-quality issues in adjacent evidence, not disagreements about the 303 floor.

## 3. Implication for Angel

| Angel component | Current claim | Classification | Basis |
|---|---|---|---|
| `lib/learningEngine/admissionsContext.ts:31` (`CSSE_COMBINED_SCORE_FLOOR = 303`) and `CSSE_ADMISSIONS_CONTEXT_FACT` (line 34-36): *"CSSE's own published guidance states that no offer is made below a combined score of 303 across the English and Maths papers (age-standardised, weighted 50/50)."* | Factually correct as a policy statement | **Aligned** (as a bare fact) but **partially aligned** in framing | The 303 figure itself is now independently corroborated across two Information Guide editions (AEP2-012, and CSSE-001 already held) — stronger evidentiary footing than before Phase 2. But the sentence, read alone, does not disclose that actual per-school cut-offs in the one fully-verified year (2023) ranged from 303 to 366, and that 303 was the binding number at only 4 of 7 schools that year. A parent could reasonably (if incorrectly) read "no offer below 303" as "303 is roughly what's needed" |
| `CSSE_ADMISSIONS_CONTEXT_DISCLAIMER` (lines 44-46): *"This is not a score your child has been given, not a target to reach, and not a prediction..."* | Correctly warns against treating 303 as a target | **Aligned** | Already anticipates and partially mitigates the risk identified above, though it does so generically (warning against treating it as *any* target) rather than by disclosing the actual observed range |
| `docs/intelligence/ADMISSIONS_INTELLIGENCE_V1_DESIGN.md` §9: states `school`/`school_admission_threshold` schema is "PROPOSED, empty schema only — do not populate without real data acquisition," and that real per-school data acquisition is the explicit trigger to populate it | Accurately describes Angel's state as of the design doc's writing | **Not aligned with current evidence state (a gap, not an error)** | Phase 2 has now acquired exactly the real per-school data this design doc names as the populate-trigger — a genuine 7-school, single-year (2023 entry) cross-verified table (AEP2-005), plus partial multi-year data for individual schools elsewhere in the register. The design doc's stated condition appears to now be met, at least partially, but populating the schema remains a data-acquisition/product decision this synthesis explicitly does not make |
| `docs/intelligence/ASSESSMENT_BRAIN_V1.md` §2, Observation 1: "no offer below 303" | Same bare-floor framing as the code constant | **Partially aligned**, same reasoning as row 1 | This document is FROZEN per its own terms — any correction requires the numbered Correction Log process it defines, not a silent edit, and is explicitly out of scope for this synthesis to perform |

**Recommendations (provisional, not implemented):**
1. For the 303 constant and its associated fact/relevance/disclaimer strings in `admissionsContext.ts`: **strengthen**. The bare figure is well-evidenced and should be retained, but the surrounding context could be strengthened — using the now-available real 2023-entry per-school range (303–366) — to make explicit that 303 is a rarely-binding absolute floor, not a typical or representative cut-off, still respecting the existing "beside, never blended, never a prediction" architecture already established in the design doc.
2. For the `school`/`school_admission_threshold` empty schema: **no recommendation to populate it is made here** — that is a data-acquisition and product-architecture decision reserved for the Founder, per the design doc's own stated governance. This finding only notes that the evidentiary trigger the design doc names appears to now exist for one year (2023); it does not recommend acting on it.
3. For `ASSESSMENT_BRAIN_V1.md` Observation 1: **retain** as currently worded (it is a FROZEN document with its own correction process) but flag for a future, separately-authorised correction pass that could add the per-school-variance context now available, following that document's own Correction Log discipline rather than a silent edit here.

## 4. Founder Review

Every classification and recommendation in this section is provisional. Whether to strengthen the 303 disclosure with per-school range context, whether to treat Phase 2's 2023-entry table as sufficient grounds to populate the currently-empty `school`/`school_admission_threshold` schema, and whether to open a Correction Log entry against the FROZEN `ASSESSMENT_BRAIN_V1.md` are all architectural and content decisions reserved for the Founder. Nothing in this document infers what the Founder will decide on any of these points, and no code, schema, or frozen document has been changed as part of producing this finding.

---

## Evidence Completeness Summary (both findings)

- **Fully cross-verified, compiler-independent:** the 2023-entry 7-school score table (AEP2-005) and the Age Standardisation Statement's core DOB/October-2018 claim (AEP2-067).
- **Agent-verified, not independently re-fetched by the compiler this pass:** AEP2-012's "CSSE-wide floor of 303" statement, the readable Standardisation Reports' title/date/n (2020, 2021, 2023-labelled), the single 2024-entry CCHSG figure (330).
- **Confirmed to exist but content unread (image-only PDFs):** 4 of 7 Standardisation Reports (2019, 2022, 2024, 2025-labelled), the compiled 2019–2024 Historical Guidance Sheet. Any per-year change in the 303 floor, or the exact mean/SD standardisation values, for these years **cannot be confirmed or ruled out** from this evidence base — this is stated explicitly rather than guessed at.
- **Unresolved internal conflicts, recorded not resolved:** CCHSG's own two stated Sept-2025 cut-off figures (321–322 vs 323–324).
