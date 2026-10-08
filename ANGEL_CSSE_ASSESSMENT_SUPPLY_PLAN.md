# ANGEL 11+ — CSSE ASSESSMENT AND MOCK DEPTH: SUPPLY ANALYSIS AND PLAN (2026-10-08)

Status: **analysis and plan only. No Mock form, item or migration was created.** Every count below is a live read-only query
of production on 2026-10-08. Where a number is a design choice rather than a measurement, it is marked **[proposal]**.

Governance carried through unchanged: Mock content stays sealed from Practice; Mock has no hints, remediation, teaching or
answer reveal; no official CSSE mark structure is assumed (the comprehension/Writing split stays unresolved); new Mock
content is original and independently validated before it can be `mock_eligible`.

## 1. The assessment ladder: what exists

| Tier | Exists? | Evidence |
|---|---|---|
| Diagnostic | **Yes** (practice-pool based) | `placementDiagnostic.ts`: 2 unseen Practice items per competency; never Mock content |
| Skill/Topic check | **Partial** | A focused Practice session (family/competency focus) teaches as it goes; there is no *protected* skill check |
| Mixed check | **Partial** | Mixed Practice sessions only; no protected mixed check |
| Timed section | **English only** | 1 form, 28 questions (`timed_section`); none for Maths |
| Full Mock | **1 per paper** | Maths 56 questions; English 24 questions (22 reading + 2 Writing) |

A learner can therefore take each full paper **once** with a protected form. A second sitting would repeat questions they have already seen, which stops it measuring progress.

## 2. Protected supply today (items not yet in any live form)

| Skill | In full form | Spare `mock_eligible` | Reserve, not yet promoted | Spare + reserve |
|---|---|---|---|---|
| MR-01 | 4 | 0 | 0 | 0 |
| MR-02 | 6 | 0 | 0 | 0 |
| MR-03 | 3 | 0 | 2 | 2 |
| MR-04 | 8 | 0 | 0 | 0 |
| MR-05 | 4 | 0 | 3 | 3 |
| MR-06 | 8 | 2 | 3 | 5 |
| MR-07 | 4 | 0 | 2 | 2 |
| MR-08 | **0** | 2 | 0 | 2 |
| MR-09 | 6 | 3 | 0 | 3 |
| MR-10 | 6 | 6 | 0 | 6 |
| MR-11 | 4 | 4 | 3 | 7 |
| MR-12 | **0** | 2 | 2 | 4 |
| MR-13 | 3 | 2 | 2 | 4 |
| MR-14 | **0** | 0 | 0 | 0 |
| **Maths total** | **56** | **21** | **17** | **38** |

- A second Maths form with the *same per-skill shape as the first* needs 56 items; 38 exist (17 of them unreviewed), and the
  per-skill match is poor: 28 items would still be missing (MR-01 4, MR-02 6, MR-03 1, MR-04 8, MR-05 1, MR-06 3, MR-07 2, MR-09 3), with surplus only in MR-08/11/12/13.
- The first Maths form itself contains **no** MR-08 (coordinates), MR-12 (averages) or MR-14 (precision) item.

**English:** the full paper holds two passages (22 reading questions) plus two Writing tasks. Spare `mock_eligible`: 0. Reserve (not yet promoted): **5 passages, 40 questions**:
`salmonnavigation` 10, `peppersbreakfast` 10, `compassrosechallenge` 8, `anning` 6, `groupproject` 6. Reading questions are grouped by passage, so a second English paper is
*plausibly composable from this reserve* (for example `salmonnavigation` + `peppersbreakfast` + `anning`, 26 questions, three passages, covering RC-01/02/03/04/06/07/10 but
not RC-05/08/09), **after** independent validation and promotion, which has not happened.

**Writing:** the live mock pair is one reflective (`mindchange`) and one picture-led (`oldshed`). Reserve: 8 reflective candidates and 1 picture candidate, but that picture is the **rejected Riverboat**, so there is **no usable picture-led prompt** for a second Mock. The three new picture drawings from Priority 4 are Practice candidates and must not be reused as Mock.

## 3. What measuring progress across a preparation lifecycle needs **[proposal]**

| Sitting | Purpose | Needs |
|---|---|---|
| Baseline full paper | where the learner starts | existing Form A (both papers) |
| Mid-preparation full paper | has teaching and practice worked | **Form B** per paper |
| Pre-exam full paper | readiness | **Form C** per paper |
| Timed sections (English; Maths) | pacing between full papers | 1 English (exists) + 1 Maths (**none**) |

That is two additional protected forms per paper, plus a Maths timed section. Measured against section 2:

| Paper | Additional items needed | Available (spare + reserve) | Shortfall |
|---|---|---|---|
| Maths (B + C) | 112 + timed section | 38 (17 unreviewed) | **≥ 74**, before the timed section |
| English reading (B + C) | about 44 | 40 (unvalidated, 5 passages) | about 4 + 3 more passages for variety, if C should not reuse B's passages |
| Writing (B + C) | 2 reflective + 2 picture-led | 8 reflective (reviewable), 0 picture | **2 picture-led, sealed, original** |

Shortfall is a count of items, not a target to rush: Form B can be built first and Form C later.

## 4. Order of work, and what needs the Founder

1. **English Form B (smallest gap).** Founder-governed independent validation of the five reserve passages' questions, then promotion, then composition with the existing `composeCandidateMock` and freeze manifest (`mockFreezeManifest.ts`). Needs: reviewer decisions; a Founder-applied migration.
2. **Maths Form B authoring.** Original, Mock-grade items per the shortfall table, kept apart from Practice: separate blueprint set with `mockEligible: true`, ids prefixed `mock-`, different numbers and skeletons from every Practice blueprint, entering as `authentic_assessment_candidate` and promoted only after independent answer verification (the route the existing 77 Mock-eligible items took). Include MR-08, MR-12 and MR-14 so Form B closes the first form's coverage gaps. Needs: Founder confirmation that the Practice blueprint library may be used as the *design* source (not the outputs) and an independent verifier.
3. **Writing Mock pair B.** One original sealed picture-led prompt (and illustration) and one reflective prompt. Needs Founder visual and educational review, as with the Treehouse Lantern.
4. **Maths timed section.** Once Form B exists, compose a 20–30 minute section from items not used in any full form.
5. **Protected skill and mixed checks.** Short sealed sets drawn from the same reserve; lowest priority until Forms B and C exist.

Not decided here and not assumed: how marks are weighted between comprehension and Writing in any total, and whether the lifecycle needs three or more forms (the table above is a minimum, not a CSSE requirement).

## 5. Why nothing was authored in this increment

Authentic Mock items are the one content class where an unreviewed "plausible-looking" batch is harmful: a flawed item in a sealed form
silently distorts a learner's measurement and cannot be discovered by Practice telemetry. The Practice-side factory work (inc 6) is
validated by independent oracles and human review of candidates; the Mock-side equivalent needs the independent verifier and the
design decisions in section 4, so it is prepared as a plan with exact quantities rather than generated.
