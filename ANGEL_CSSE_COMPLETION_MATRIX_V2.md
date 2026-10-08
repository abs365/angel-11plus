# ANGEL 11+ — CSSE COMPLETION MATRIX (V2, 2026-10-08)

Canonical competency model: the 12 live CSSE competencies in `lib/learningEngine/assessmentBrainMap.ts`
(AR-01 is historical and excluded — Applied Reasoning left the CSSE paper from the 2025 entry). Question types
(`QT-*`) are the unit the live bank is tagged with. No competency has been added to inflate counts.
Data is live production (read-only aggregate queries, 2026-10-08) plus the real code; it is not copied from earlier reports.

Status rules (applied the same way to every row):

| Dimension | COMPLETE | PARTIAL | MISSING |
|---|---|---|---|
| Depth | ≥30 practice items, ≥2 families | 1–29 items | none |
| Structure | families vary reasoning route/context (spot-checked) | large family with few distinct skeletons | — |
| Teaching | every live family has worked-method/strategy + guided support | some families lack it | none |
| Remediation | wrong answer → reveal + reasoned next step + re-route | partial of these | none |
| Transfer | `transfer_class` tagged on a meaningful share | few/none tagged | — |
| Mock | ≥2 items in a live protected form | reserve only | not in any form |

## Teaching capabilities (distinct, not interchangeable)

"Five full lessons" is one capability among eight. It must not be read as "only five areas have teaching".

| Capability | What it is | Live coverage (verified in code + bank, 2026-10-08) |
|---|---|---|
| FULL LESSON | Explain → model → guided → independent → transfer page | 5 competencies: MR-01, MR-03, MR-04, RC-01, RC-02 |
| WORKED-METHOD TEACHING (Maths) | Per-family method, relationship, separate worked scenario, verification, misconception category | **36 of 37** Maths families. Only `mr05-number-property-search` is uncovered, **intentionally**, under the existing transfer-safety decision (not reopened without new evidence) |
| STRATEGY TEACHING (English) | Per-family "efficient exam method" line | **17 of 17** English families |
| WORKED EXAMPLE (English) | Per-family safe scenario, model reasoning, weak-answer contrast | **15 of 17** (missing: `wave1-fam-synonym-battery`, `wave1-fam-emotion-cause`) |
| GUIDED SUPPORT | Scaffolded attempt, supported tier | English scaffolds on 9 families; Maths guided step-reveal on every family with worked-method content (answer-leak caps set per family); Writing guided checklist |
| REMEDIATION | What happens after a wrong answer | Authored misconception note where it exists; post-answer correct-answer reveal + "Next time" strategy (inc 2); **in-session support ladder + structure change (inc 4)** |
| TRANSFER | Items tagged `transfer_class` | See question-type table (MR-14 has none) |
| RETRIEVAL | Delayed re-exposure / maintenance review | Capability exists (14-day provisional interval); learner evidence immature |

## Competency summary

| Competency | Question types | Practice items | Families | Depth | Structure | Teaching | Remediation | Transfer | Mock | Overall |
|---|---|---|---|---|---|---|---|---|---|---|
| RC-01 Literal retrieval | RC-01,07,08,09 | 105 | 8 | COMPLETE | PARTIAL (passages) | COMPLETE | PARTIAL→inc 1 | PARTIAL | COMPLETE | **PARTIAL** |
| RC-02 Inference | RC-02,05,10 | 95 | 6 | COMPLETE | PARTIAL | COMPLETE | PARTIAL | PARTIAL | COMPLETE | **PARTIAL** |
| RC-03 Meaning in context | RC-03,04 | 66 | 3 | COMPLETE | PARTIAL | PARTIAL (1 family lacks worked example) | PARTIAL→inc 1 | PARTIAL | COMPLETE | **PARTIAL** |
| RC-04 Sequencing | RC-06 | 40 | 2 | COMPLETE | PARTIAL | COMPLETE | PARTIAL→inc 1 | PARTIAL | COMPLETE | **PARTIAL** |
| MR-01 Arithmetic | MR-01,02,03,09,12 | 152 | 9 | COMPLETE | PARTIAL (4 big families, 6–10 skeletons each) | PARTIAL (2 tiny families) | PARTIAL | PARTIAL | COMPLETE (MR-12 not in form) | **PARTIAL** |
| MR-02 Algebra/symbolic | MR-05,06 | 101 | 6 | COMPLETE | PARTIAL | COMPLETE | PARTIAL | PARTIAL | COMPLETE | **PARTIAL** |
| MR-03 Geometry/spatial | MR-07,08 | 132 | 7 | COMPLETE | PARTIAL (angle-sum, compound area); coordinate COMPLETE | PARTIAL (1 family) | PARTIAL | PARTIAL | PARTIAL (MR-08 not in a form) | **PARTIAL** |
| MR-04 Word problems | MR-04,10,13 | 129 | 9 | COMPLETE | PARTIAL (compound %); reverse families COMPLETE | PARTIAL (1 family) | PARTIAL | PARTIAL | COMPLETE | **PARTIAL** |
| MR-05 Number properties | MR-11 | 61 | 4 | COMPLETE | PARTIAL (factors-primes) | PARTIAL (1 family) | PARTIAL | PARTIAL | COMPLETE | **PARTIAL** |
| MR-06 Precision | MR-14 | 12 | 2 | PARTIAL | PARTIAL | COMPLETE | PARTIAL | **MISSING** (0 tagged) | **MISSING** | **PARTIAL (thin)** |
| WC-01 Sustained composition | WC-01a, 01b | 8 | 8 (1 item each) | **PARTIAL** (8 prompts) | PARTIAL | PARTIAL | PARTIAL (feedback only) | n/a | PARTIAL | **PARTIAL (largest gap)** |
| WC-02 Multi-dimensional quality | (rubric) | — | — | n/a | n/a | n/a | n/a | n/a | n/a | assessed through WC-01 only; AI score uncalibrated |

No competency is MISSING outright; none is COMPLETE overall yet. The matrix is closed row by row below.

## Question-type detail (live bank, practice-eligible)

| QT | Items | Fam | easy/med/hard/chal | Transfer-tagged | In live Mock form | Mock reserve | Notes |
|---|---|---|---|---|---|---|---|
| RC-01 | 48 | 2 | 16/24/8/0 | 19 | 9 | 12 | 20 items had empty explanation (inc 1) |
| RC-02 | 42 | 2 | 2/21/17/2 | 17 | 6 | 7 | few easy items |
| RC-03 | 35 | 2 | 2/23/10/0 | 14 | 5 | 2 | 20 empty-explanation |
| RC-04 | 31 | 1 | 5/16/10/0 | 11 | 11 | 8 | single family; 20 empty-explanation |
| RC-05 | 8 | 1 | 0/6/2/0 | 3 | 4 | 1 | thin |
| RC-06 | 40 | 2 | 6/27/5/2 | 16 | 4 | 3 | 16 empty-explanation |
| RC-07 | 29 | 3 | 0/20/5/4 | 12 | 3 | 3 | no easy tier |
| RC-08 | 22 | 2 | 0/11/7/4 | 13 | 2 | 0 | no easy tier |
| RC-09 | 6 | 1 | 0/5/1/0 | 6 | 2 | 0 | thin; multi-select only |
| RC-10 | 45 | 3 | 8/19/12/6 | 18 | 4 | 4 | |
| MR-01 | 74 | 4 | 12/34/28/0 | 20 | 4 | 0 | whole-number family: 53 items |
| MR-02 | 4 | 1 | 0/4/0/0 | 4 | 6 | 0 | thin |
| MR-03 | 5 | 1 | 1/4/0/0 | 4 | 3 | 2 | thin |
| MR-04 | 84 | 4 | 8/44/27/5 | 15 | 8 | 0 | |
| MR-05 | 55 | 2 | 21/27/7/0 | 15 | 4 | 3 | |
| MR-06 | 46 | 4 | 16/21/9/0 | 16 | 8 | 3 | |
| MR-07 | 90 | 5 | 29/40/19/2 | 29 | 4 | 2 | |
| MR-08 | 42 | 2 | 21/14/7/0 | 7 | **0** | 0 | not in any live form |
| MR-09 | 6 | 1 | 1/5/0/0 | 5 | 6 | 0 | thin |
| MR-10 | 34 | 2 | 3/8/17/6 | 9 | 6 | 0 | |
| MR-11 | 61 | 4 | 22/24/15/0 | 20 | 4 | 3 | |
| MR-12 | 63 | 2 | 7/25/27/4 | 8 | **0** | 2 | not in any live form |
| MR-13 | 11 | 3 | 0/8/3/0 | 11 | 3 | 2 | thin |
| MR-14 | 12 | 2 | 1/9/2/0 | **0** | **0** | 0 | no transfer tagging, no Mock |
| WC-01a | 7 | 7 | 0/0/7/0 | 7 | 1 | 8 | one item per family |
| WC-01b | 1 | 1 | 0/0/1/0 | 1 | 1 | 1 | one picture prompt |

## Closure plan (educational gap → increment), highest impact first

| # | Gap | Dimension | Increment | Status |
|---|---|---|---|---|
| 1 | Mastery could rest on one remembered question (`some()` in `validateCompetencyMastery`) | mastery/transfer | Mastery now needs the threshold met in ≥2 question families | **DONE, deployed `f728d81`** |
| 2 | 76 English items: wrong answer showed only "Not quite" | remediation (English) | Post-submission correct-answer reveal + family "Next time" strategy (Practice only) | **DONE, deployed `f728d81`** |
| 3 | Remediation not wired into the live loop | remediation | Inc 4: session outcome log, support ladder (strategic hint → worked reasoning → re-teach), failed family not re-served next, policy inputs fed from the real bank | **DONE (see Priority 1 notes), pending Founder acceptance** |
| 4 | Maths structural diversity (6–10 skeletons in 40-item families) | structure | Blueprint-level expansion through the Question Factory gate; needs Founder-applied publication | needs Founder application |
| 5 | Writing: 8 prompts, uncalibrated AI | Writing | Governed prompt expansion + human-calibration protocol | needs Founder review of prompts |
| 6 | Mock depth: one form per paper; MR-08/12/14 absent | assessment | Additional protected forms from reserve + new authored items | needs Founder application |
| 7 | Teaching gaps: Maths families without worked-method content | teaching | `mr03-coord-combined` and `mr04-bv-convert` now covered (inc 3). `mr05-number-property-search` stays uncovered by an earlier TRANSFER-UNSAFE decision, not reopened. English worked examples for 2 families still open | **PARTLY DONE** |
| 8 | MR-14 transfer tagging; thin QTs (MR-02/03/09/13, RC-05/09) | depth | Factory blueprints | needs Founder application |

Governance limits that apply to this programme (not obstacles to bypass): publication is admin-gated
(`submit_question_candidate` / `publish_question_candidate`); migrations are applied by the Founder only; Mock
content stays sealed from Practice; no official CSSE mark split exists in the repo and none is invented.

## Priority 1 — live remediation wiring: what was hardcoded, what is now real

Path traced: learner answer → `recordAndAdvance` (outcome + support tier recorded) → Educational Intelligence evidence →
*(previously nothing changed in-session)* → next session's weak-skill override. The session list was fixed at load, and
`remediationPolicy` fired only from the dashboard's "rebuilding" regression signal.

| `RemediationContext` input | Before | Now | Why |
|---|---|---|---|
| `consecutiveFailuresOnSameSkeleton` | 2 if "rebuilding", else 0 | Real in-session run of wrong answers **in the same family** | No per-skeleton counter exists; a family is a deliberately broader stand-in, so support may escalate slightly early rather than claim a skeleton |
| `hasFullLessonAvailable` | real | real | unchanged |
| `hasMisconceptionTargetedBlueprintAvailable` | false | from bank: family has authored misconception text | availability of content, not a diagnosis of the learner |
| `hasAlternativeRepresentationAvailable` | false | from bank: >1 context tag / representation in family | |
| `hasMultipleBlueprintsInFamily` | false | from bank: >1 `blueprintId` in family | |
| `hasPrerequisiteCompetencyWithWeakEvidence` | false | **still false** | the only prerequisite graph has no CSSE MR/RC/WC edges; it cannot answer the question |

Live behaviour (Practice only; Mock and Writing untouched): 1st wrong in a family → strategic hint (existing "Next time" / misconception
note); 2nd → worked reasoning on a separate fixed scenario; 3rd → explicit re-teaching with a link to the full lesson where one exists
(otherwise worked reasoning). After any wrong answer the next item comes from a different family where one remains
(same competency preferred). The live question's answer is never shown by the ladder. Angel does not claim to know *why* an answer was wrong.
