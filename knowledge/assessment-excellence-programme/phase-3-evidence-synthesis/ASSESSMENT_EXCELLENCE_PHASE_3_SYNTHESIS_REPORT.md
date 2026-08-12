# Assessment Excellence Programme — Phase 3 Synthesis Report

**Programme:** Angel 11+ Assessment Excellence Programme — Phase 3 (Evidence Synthesis and Longitudinal Analysis)
**Status:** Synthesis complete. Submitted for **Founder review** — no recommendation below has been implemented, and none should be treated as a decision until the Founder acts on it.
**Prepared:** 2026-08-05
**Scope discipline maintained throughout:** no implementation, no assessment redesign, no change to the Assessment Brain or Educational Intelligence engine, no new educational content. Every claim traces to a Phase 2 `AEP2-###` citation or a real, checked line of Angel's own code/docs.

---

## How this synthesis was run

Phase 2 acquired and verified 101 official sources. Phase 3 did not acquire anything new — it dispatched 6 parallel synthesis workstreams, each assigned a distinct evidence theme, each required to follow the Founder's mandated 4-part structure for every finding: **Official Evidence → Educational Interpretation → Implication for Angel → Founder Review**. Before dispatch, a capability map of Angel's actual CSSE-related code and docs was produced (not assumed) so every "Implication for Angel" section could compare evidence against real, current application state rather than guesswork. Each workstream's deliverable was independently compiled and checkpointed as it returned; two of the most load-bearing claims (an `assessmentBrainMap.ts` code citation, and the "PROPOSED, empty schema only" schema citation) were independently re-verified by direct file inspection before being accepted into this report.

**The 6 workstreams and their deliverables** (all under `findings/`):
1. `01-test-structure-evolution.md` — Test Structure & Format Evolution
2. `02-standardisation-methodology.md` — Standardisation Methodology & the 303 Floor
3. `03-per-school-admissions-structure.md` — Per-School Admissions Structure
4. `04-score-cutoff-trends.md` — Score Cutoff Trends & Longitudinal Patterns
5. `05-candidate-volume-and-competitive-landscape.md` — Candidate Volume & Competitive Landscape
6. `06-evidence-reliability-and-policy-change-patterns.md` — Evidence Reliability & Policy-Change Patterns

This report synthesises across those 6, rather than repeating them — read the individual files for full detail, per-school breakdowns, and every citation.

---

## The two headline findings

**1. The CSSE 303 floor does not mean the same thing at every school — and Angel's current framing doesn't yet disclose that.**
Independently re-verified 2023-entry data shows actual lowest-offered scores ranging from 303 to 366 across the 7 schools. The floor was the *literal, binding* cutoff only for the 4 Southend-administered schools' priority-area category that year; at the Colchester schools and at KEGS, real candidates cleared it by 30-63 points. Angel's existing `CSSE_COMBINED_SCORE_FLOOR = 303` constant is factually correct and already carries a "not a target" disclaimer — but read alone, it risks a parent inferring 303 is roughly what's needed, when the evidence shows most schools' actual thresholds sit well above it. (Workstream 2, Finding 2.)

**2. Angel's own design document named a precondition for building per-school admissions content — and Phase 2 has now met it, for PAN and priority-area/oversubscription facts specifically, at all 7 schools.**
`ADMISSIONS_INTELLIGENCE_V1_DESIGN.md` explicitly states its `school`/`school_admission_threshold` schema is "PROPOSED, empty schema only — do not populate without real data acquisition," naming "real per-school data" as one of two possible triggers. That trigger is now evidenced for PAN, priority-area definitions, and oversubscription-category structure across all 7 named schools for the 2023-2027 window — independently verified, cross-checked in most cases against a second official host. The *other* named trigger (a genuinely comparable mock-to-CSSE score scale) remains unmet and was never in Phase 2's scope. This is the sharpest, most concrete finding across all 6 workstreams: not "Angel is doing something wrong," but "a condition Angel's own design set for itself has now been satisfied, and only a Founder decision stands between that evidence and any future population of the schema." (Workstream 3, Finding "Implication for Angel's Admissions Schema.")

---

## Consolidated alignment summary

| Angel capability | Classification | Recommendation | Workstream |
|---|---|---|---|
| Two-paper/one-day/50-50-weighted/303-floor test architecture | Aligned | Retain | 1 |
| Mathematics competency domains (MR-01–06) | Aligned | Retain | 1 |
| English Comprehension competencies (RC-01–04) | Aligned | Retain | 1 |
| WC-01/WC-02 Writing competencies | Partially aligned (pre-existing open gap, not newly created) | Retain, gap unresolved | 1 |
| Applied Reasoning (AR-01/QT-AR-01) — currency for 2025-2027 cohorts | Partially aligned — unresolved evidence gap, not confirmed either way | **Strengthen** (read the already-downloaded 2025/2026 Information Guides — a low-cost, half-done task) | 1 |
| Standardisation-methodology disclosure (`admissionsContext.ts`, Assessment Brain V1 Obs. 1, Admissions Intelligence design §4.2) | Aligned | Retain | 2 |
| 303-floor constant, bare framing | Aligned as fact, partially aligned in framing | **Strengthen** (add per-school range context, still "beside, never blended") | 2 |
| `school` table (PAN / priority-area / oversubscription structure) | **Not aligned** — evidentiary precondition now met, zero rows exist | Describe-only: populate with per-school, per-year, per-source-cited rows, with an explicit geography-type discriminator (CRGS has none at all) and explicit dual-value handling for the 2 live conflicts — **not built here** | 3 |
| `school_admission_threshold` table (score cutoffs) | **Not aligned**, but for a distinct, harder reason (score-scale non-comparability remains genuinely unsolved) | More design care needed than `school`; **not a simple data-entry task** | 3 |
| `consortium_threshold_fact` (303, as a DB row vs. code constant) | Partially aligned — fact already live as a constant, just not as a row | Retain current implementation; no urgency to convert | 2, 3 |
| Absence of any per-school content in `CssePathwayParentContent.tsx` | Not aligned with now-available evidence (was correctly gated before Phase 2) | Founder-decision item only — no recommendation to build is made | 3 |
| Exclusion of offer prediction / peer comparison / school-choice guidance | Aligned — evidence actively supports this caution, not merely permits it | Retain | 4, 5 |
| Non-predictive Admissions Readiness design overall | Aligned | Retain (one narrow, low-risk option named for Founder consideration: showing the 303 floor per-relevant-school; not recommended to build) | 4 |
| Competitiveness/demand-trend framing (currently absent) | Aligned (by absence — nothing to correct) | Retain | 5 |
| `KNOWLEDGE_GOVERNANCE.md` lifecycle model, as applied to admissions data specifically | Partially aligned — sound for exam-paper evidence, untested for admissions-cycle volatility | **Strengthen** (evidence-year tag, annual re-verification cadence, formal "conflicting sources, unresolved" state) — described conceptually only | 6 |

**No capability across all 6 workstreams was classified "replace," "hide," or "retire."** The strongest actions any workstream recommends are "strengthen" (3 instances, all low-cost and already-scoped) and the schema-population option (explicitly described, explicitly not built, explicitly Founder-gated).

---

## Consolidated list of open items carried forward (not resolved by this synthesis)

1. **Applied Reasoning currency (2025-2027 cohorts)** — unresolved; the documents that could settle it are already downloaded, only unread. (WS1)
2. **WHSG's PAN for September 2026 entry** — 192 (school) vs 184 (council), both Level 1, no hierarchy tiebreaker exists. (WS3, WS4, WS6)
3. **SHSG's 2026/27 arrangements** — official vs. a convincingly-branded third-party mirror with non-reconciling figures; resolved procedurally toward the official source, but the impostor-document risk to parents searching independently is itself flagged. (WS3, WS4, WS6)
4. **CCHSG's own two Sept-2025 cutoff figures disagree with each other** (321-322 vs 323-324), and its two policy documents disagree on the same year's applicant/tested counts (630/697 vs 626/726). (WS4, WS5)
5. **CSSE's 7-vs-10-member-school scope question** — CSSE's own Publication Scheme names 10 schools; this programme scopes 7. Not a volatility issue, a definitional one. (WS6)
6. **Three documented policy changes with no located consultation trail** — CCHSG's Priority Area/SPP introduction, SHSG's 44-place PAN increase, KEGS's residency-date and threshold changes. All real and dated; none has an evidenced rationale. (WS3, WS6)
7. **Whether the CSSE-wide "16-year candidate volume" document (AEP2-074) would change any of the above** — it remains entirely unread (image-only PDF); no claim in this synthesis relies on it. (WS5)
8. **Whether the possible 2024-2025 "floor-departure" signal seen independently at SHSG, WHSG, and WHSB is a real emerging pattern or three coincidental single-year events** — explicitly named as unresolved with only one data point per school. (WS4)

None of these 8 items is treated as resolved anywhere in the 6 findings documents. Each is recorded exactly as encountered.

---

## Founder Review

Every classification and recommendation in this report, and in the 6 underlying findings documents, is provisional. No code, schema, frozen document (including `ASSESSMENT_BRAIN_V1.md`, which is FROZEN and would require its own numbered Correction Log entry for any change), or parent-facing content has been modified in producing this synthesis. Where a recommendation is "strengthen," the findings describe *what* strengthening would concretely mean without building it. Where evidence now appears to satisfy a precondition Angel's own design previously set (the `school` schema case), this report states that plainly but does not infer that the Founder wants to act on it — that decision, and its timing relative to the rest of this program, remains entirely the Founder's.

Per the programme's governing instruction, this Phase 3 synthesis produces permanent educational evidence intended to guide future Angel assessment decisions — it does not itself authorise any of them.

---

*Full per-finding detail, every citation, and every school-by-school breakdown lives in `findings/01-*.md` through `findings/06-*.md`. Progress and resume state are tracked in `register/PHASE_3_PROGRESS_CHECKPOINT.md`.*
