# ANGEL 11+ — CSSE MATHEMATICS FORM B: SUPPLY PLAN (2026-10-08)

Status: **preparation only.** No Form B exists, no row was changed, no migration was created, nothing is activated.
Counts are live read-only queries of production. The answer checks below are Claude's own working, which is a pre-review, **not** the governed independent validation (a human verifier is still required before any promotion to `mock_eligible`). No official CSSE mark structure is assumed.

## 1. Form A (live) and its coverage gaps

56 items over 11 skills, difficulty 8 easy / 22 medium / 26 hard. Per skill (items / experiences): MR-01 4/3, MR-02 6/2, MR-03 3/1, MR-04 8/3, MR-05 4/2, MR-06 8/3, MR-07 4/2, MR-09 6/2, MR-10 6/3, MR-11 4/1, MR-13 3/1.
**Form A contains no MR-08 (coordinates), MR-12 (averages) or MR-14 (precision) item.** Form B is the place to close that.

## 2. Proposed Form B shape **[proposal]** (56 items, same total as A)

| Skill | A | B target | Why changed |
|---|---|---|---|
| MR-01 | 4 | 4 | |
| MR-02 | 6 | 5 | make room for the missing skills |
| MR-03 | 3 | 3 | |
| MR-04 | 8 | 6 | " |
| MR-05 | 4 | 4 | |
| MR-06 | 8 | 6 | " |
| MR-07 | 4 | 4 | |
| MR-08 | 0 | **3** | coordinates absent from A |
| MR-09 | 6 | 4 | |
| MR-10 | 6 | 4 | |
| MR-11 | 4 | 4 | |
| MR-12 | 0 | **3** | averages absent from A |
| MR-13 | 3 | 4 | whole experiences only (see section 3) |
| MR-14 | 0 | **2** | precision absent from A |
| **Total** | 56 | **56** | |

This keeps A's load while adding the three missing skills. It is a design choice for the Founder to confirm, not a CSSE specification.

## 3. Existing protected items available for Form B (32 of the 38 spare and reserve items)

All grouped items are used as whole experiences (a group is never split). Answers below were re-derived by me from the full question text.

| Skill | Items used (status) | My answer check |
|---|---|---|
| MR-03 (2) | `mock-mr03mr07-perimeterarea-01a`, `-02a` (independently_validated) | 3.6 m + 2.5 m perimeter 12.2 ✓; 90 cm + 45 cm perimeter 270 ✓ |
| MR-07 (2) | `mock-mr03mr07-perimeterarea-01b`, `-02b` (independently_validated) | areas 9 ✓, 4050 ✓ |
| MR-05 (3) | `mock-mr05-numberpyramid-01..03` (reserve) | pyramid solved: A = 7 and the whole pyramid is consistent ✓; 144 = 16 × 9, five rows, 9 smallest with a whole bottom value ✓; statement B true, A and C false ✓ |
| MR-06 (5) | `mock-mr06-agenarrative-01..03`, `mock-mr06-sumdiff-01..02` | 2033 ✓ (ages 24 and 48); 2047 ✓ (38 and 62); earliest both-square year 2010 ✓ (1 and 25); larger 35 ✓; smaller 28 ✓ |
| MR-08 (2) | `mock-mr08-rotation-01..02` (mock_eligible) | (3,5) 90° clockwise to (5,-3) ✓; (-2,6) by 180° to (2,-6) ✓ |
| MR-09 (3) | `mock-mr09-data-01..03` | 31 − 18 = 13 ✓; mean 14 ✓; £628 ✓ |
| MR-10 (4) | `mock-mr10-fairprep-01..02`, `mock-mr10-reverseschedule-01..02` | 15:50 ✓; latest start 13:35 ✓; 14:00 ✓; 14:30 ✓ |
| MR-11 (4) | `mock-mr11-truefalsejudgement-01..02`, `mock-mr11-propertysearch-01..02` | true ✓; false ✓ (2 x 3); 37 ✓ (unique); 81 ✓ (unique) |
| MR-12 (3) | `mock-mr12-reversemean-01..02`, `mock-mr12-weightedmean-01` | 84 ✓; 43 ✓; 9 ✓ |
| MR-13 (4) | `mock-mr13-bestvalue-01..02`, `mock-mr13-toppingcombos-01..02` | £2.10 ✓; £1.50 ✓; 10 ✓; 20 ✓ |

Held back for a Form C (6 items): `mock-mr10-forwardschedule-01..02` (13:30 ✓, 17:10 ✓), `mock-mr11-impossibletotal-01..03` (11 ✓, 40 ✓, (8,5) ✓ with 5 and 8 the only mix), `mock-mr12-weightedmean-02` (3 ✓).

Wording points for the human verifier (answers are right; the wording could mislead): `numberpyramid-03` opens with "the top brick's value is 0", but the statements are conditionals independent of that premise, which may confuse; `numberpyramid-02` asks for a pair and the number of rows is deduced rather than given. None is a correctness error.

## 4. What must be authored: 24 sealed items

| Skill | New items | Difficulty (to be like A's mix) | Notes |
|---|---|---|---|
| MR-01 | 4 | 2 easy, 2 hard | arithmetic; A has 2 easy and 2 hard |
| MR-02 | 5 | 3 easy, 2 hard | symbolic/sequence; include one sequence-rule item |
| MR-03 | 1 | medium | measurement conversion item completing a group |
| MR-04 | 6 | 1 easy, 2 medium, 3 hard | multi-step word problems; the largest need |
| MR-05 | 1 | medium | number properties |
| MR-06 | 1 | medium | reasoning/precision-adjacent group member |
| MR-07 | 2 | 1 medium, 1 hard | geometry with a diagram if the diagram renderer allows |
| MR-08 | 1 | medium | reflection or translation, to sit with the two rotation items |
| MR-09 | 1 | hard | **use a table stimulus** (the Mock table renderer already exists) |
| MR-14 | 2 | 1 medium, 1 hard | precision: exact-match rounding under an instruction |
| **Total** | **24** | 6 easy, 8 medium, 10 hard | |

Authoring rules (all required):
1. **Original and sealed.** New family ids prefixed `mock-`, ids prefixed `mock-`, entering as `authentic_assessment_candidate`; never `practice_eligible`; never published through `publish_question_candidate` (the Practice route).
2. **No overlap with Practice.** Numbers, skeletons and scenarios must differ from every Practice blueprint and bank item. The existing `checkMockPracticeCrossover` anti-memorisation check applies, and a test compares new stems against the Practice bank.
3. **Deterministic marking** wherever the answer is objective (as all 32 existing items are), with answers re-derived by an independent method.
4. **Structure and load** modelled on the Founder-accepted Form A items (grouped experiences of two or three subparts, one scenario each); no CSSE style claim beyond that.
5. **Independent human review** before promotion; two-part answers (for example "9, 5") must be confirmed to mark correctly.

Method: the Practice factory is a good *design* source (blueprints, deterministic derivation, independent oracles) but its *outputs* must not be reused. A sealed Mock blueprint set, with Mock-disjoint parameter ranges and `mockEligible: true`, is the efficient route for the objectively marked skills (MR-01, MR-02, MR-04, MR-07, MR-14). It has not been built here: it needs the Founder's confirmation that the Practice blueprint library may serve as the design source, and an independent verifier.

## 5. Order of work and Founder actions

1. Confirm the Form B shape (section 2) and the design-source question (section 4).
2. Independent human validation of the 32 existing items (answers pre-checked above).
3. Author and independently validate the 24 new sealed items (a separate bounded increment per group of skills).
4. Then, and only then: promotion to `mock_eligible`, composition with `composeCandidateMock`, freeze via `mockFreezeManifest.ts`, a Founder-applied migration registering the form.
5. **Form B is not activated until all of this is complete.** English Form B and the Writing Mock pair follow the same rule (see the English Form B plan).

Resulting lifecycle once both papers have a Form B: a baseline form and a mid-preparation form per paper, with Form C and the Maths timed section still to come.
