# ANGEL 11+ — CSSE MATHEMATICS FORM B COMPLETION (2026-10-08)

Status: **prepared, sealed, not activated.** Nothing was applied to production. Migration 272 is a template. No item is marked
`independently_validated` or `mock_eligible`, and none is `practice_eligible`. No official CSSE mark structure is assumed.
Builds on `ANGEL_CSSE_MATHS_FORM_B_SUPPLY_PLAN.md`. Sources of truth (all tested):
`lib/ali/questionFactory/mockFormBMathsItems.ts` (24 new items), `mockFormBRevalidation.ts` (32 existing items), tests in
`tests/lib/ali/questionFactory/mockFormBMaths.test.ts`, template `supabase/migrations/272_maths_form_b_completion_TEMPLATE_NOT_APPLIED.sql`,
figures in `public/mock-assets/formb-maths/`, all produced by `scripts/generate-mock-form-b-maths-assets-and-migration.mjs`.

## 1. Revalidation of the 32 existing items: one real defect found

Each of the 32 stored answers was re-derived from the question text by a separately written route (see the record in code). **All 32
re-derived answers equal the stored answers.** One **marking defect** was found, which a pure answer check cannot see:

- `mock-mr05-numberpyramid-02` asks for the answer "in the form (smallest bottom-row value, number of rows)", so a child writes
  **"(9, 5)"**. The stored answer is **"9, 5"**, and the marker requires matching brackets, so the instructed form is **marked wrong**
  (tested against the real `checkMathsAnswer`). Repair (in migration 272): store `"(9, 5)"`. After repair "(9, 5)" and "(9,5)" are accepted.
  **Human verifier to confirm** that the Mock scoring path used for Form B treats the answer the same way as Practice's marker.
- Wording observations (not defects): `numberpyramid-03` opens with a premise ("the top brick's value is 0") that the three
  conditional statements do not depend on; `numberpyramid-02` asks for a pair and the row count is deduced, not given.
- Six items remain held for a Form C (unchanged): `forwardschedule-01/02`, `impossibletotal-01..03`, `weightedmean-02`.

## 2. The 24 sealed items

| Skill (QT) | New | Difficulty | What they test |
|---|---|---|---|
| QT-MR-01 arithmetic | 4 | 2 easy, 2 hard | subtraction and multiplication in context; brackets and order of operations; decimal multiply plus divide |
| QT-MR-02 missing operand | 5 | 3 easy, 2 hard | inverse operations; two-step and three-step "think of a number" reversals |
| QT-MR-03 measurement | 1 | medium | convert metres to centimetres, then divide |
| QT-MR-04 percentages | 6 | 1 easy, 2 medium, 3 hard | discount; complement; VAT then split; two successive reductions; **reverse percentage**; percentages of two groups |
| QT-MR-05 sequences/rules | 1 | medium | nth term from a linear sequence |
| QT-MR-06 algebraic reasoning | 1 | medium | digits that sum to 11 whose reversal adds 27 |
| QT-MR-07 geometry | 2 | medium, hard | **angles on a straight line (figure)**; **L-shaped area with hidden sides (figure)** |
| QT-MR-08 coordinates | 1 | medium | **reflection in a drawn y = x mirror (grid figure)**, point read from the grid |
| QT-MR-09 data handling | 1 | hard | **table stimulus**: apply a different price to each column, then total |
| QT-MR-14 precision | 2 | medium, hard | smallest number that rounds to 350; greatest whole cm for 6.4 m to 1 d.p. (error interval) |
| **Total** | **24** | **6 easy, 8 medium, 10 hard** | |

Properties verified automatically (all green): every answer is re-derived by an independently written oracle; the real marker accepts
the answer and **rejects three tempting wrong answers per item** (the named misconception); ids and families are `mock-fb-`; single
answers only (no multi-part answers); none of Form A's named skeletons (rotation, sum and difference, age narrative, pyramid) is cloned.
**Visuals are deterministic and exact:** the straight-line figure and the grid come from the shared figure renderers; the L-shape is an
exact builder. All three are static SVGs served through the **existing Mock image stimulus**, so **no Mock rendering code changed**. The
L-shape's missing-corner sides are not labelled and no labelled side equals a hidden one, so no label can be mistaken for it. The table
uses the existing Mock table stimulus. Question text carries no coordinate for the grid item.

**No overlap with Practice (checked against production, read-only):** for the 21 text items, no practice or Mock question shares the same
set of numbers (the one coincidence, `6, 4, 5`, is a different skeleton: "6 + 4 × 5"); the grid point was moved off the Practice item
`mr03-coord-03`'s (-3, 6) to (-4, 7) after the check found it. The anti-memorisation crossover check applies again at promotion.

## 3. Form B shape after the top-up

32 existing + 24 new = **56 items**, matching Form A's size, and per-skill counts equal the plan exactly (tested): MR-01 4, MR-02 5, MR-03 3,
MR-04 6, MR-05 4, MR-06 6, MR-07 4, **MR-08 3, MR-12 3, MR-14 2** (the three skills Form A lacks), MR-09 4, MR-10 4, MR-11 4, MR-13 4.
The overall difficulty mix of Form B is therefore not identical to Form A's 8/22/26, because the 32 reused items carry their own tiers;
the Founder confirmed the shape as a design choice, not a CSSE specification.

## 4. Limitations to disclose (not defects)

- The grid item's text equivalent names the point but not its coordinates, because reading them is the task. A non-visual accessible
  alternative must be arranged separately (for example a teacher-read description under exam access arrangements).
- Static SVGs live under a public path; they show only what the task shows. They are not referenced from Practice.
- The three MR-04 hard items and the MR-14 hard item rely on exact numeric entry; the marker is tolerant of format (spacing, trailing
  zeros, a pound sign) but not of rounding.

## 5. Readiness against the gates

| Gate | State |
|---|---|
| Revalidation record for the 32 items | **done** (one defect found, repair in 272) |
| 24 sealed items authored | **done (candidates in 272)** |
| Independent human validation of the 56 items | **outstanding (human)** |
| Founder confirmation of the Form B shape and of the Practice blueprint library as design source | **outstanding** (the 24 were hand-authored, not generated from the Practice blueprints) |
| Promotion to `mock_eligible`, `composeCandidateMock`, `mockFreezeManifest`, form registration, activation | **not started, by instruction** |

## 6. Founder actions

1. Apply migration 272 when ready (repairs the pyramid answer; adds 24 sealed candidates). 2. Commission the independent human validation of
all 56 items, starting with the marking-path check on `numberpyramid-02`. 3. Confirm the Form B shape. 4. Decide the accessible alternative
for the grid item.
