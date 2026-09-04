# MR-03 Compound Shapes — Founder Content Review

Programme Increment 020, Wave 1. Family: `mr03-compound-area-perimeter` (8 rows, migration 222, NOT applied). Registered for review by migration 223. **Current status: PENDING FOUNDER EDUCATIONAL REVIEW** — nothing in this family is Approved. The recommendations below are this session's own educational judgement for you to accept, amend, or overrule; only your decision, recorded through `/admin-beta/review`, constitutes real approval.

---

## How to read this document

Each entry shows the question exactly as a learner will see it, its diagram described in plain English, the worked solution, and the specific educational reasoning and misconception it targets. Raw SQL/JSON is not reproduced — see `supabase/migrations/222_mathematics_mr03_compound_shape_wave1.sql` only if you want the implementation detail.

**Mechanically re-verified this session** (not merely re-asserted): every stored answer, diagram vertex set, and edge label was independently recomputed from the shape's own coordinates via a shoelace-formula script (`area`/`perimeter` derived purely from the (x,y) points, cross-checked against the stored answer). All 8 passed. Detail is noted per-question below.

---

## 1. `mr03-compound-01` — Guided practice (this Wave's new Learn lesson's own guided step)

- **Variant:** baseline (first instance of the family's foundation-tier shape)
- **Difficulty:** Easy — Foundation Access
- **Inventory intention:** RENEWABLE (once promoted)
- **Marks:** 1

**Question as shown:** "A garden is shaped like the letter L, made of two rectangular sections. The lower section is 9m by 4m. The upper section is 4m by 3m. What is the total area of the garden?"

**Diagram (plain English):** An L-shaped outline — a wide lower rectangle sitting under a narrower upper rectangle attached to its left-hand side. Four edges are labelled directly: the bottom (9 m), the lower section's right-hand side (4 m), the upper section's right-hand side (3 m), and the upper section's top (4 m). The two remaining edges (the inward step, and the full left-hand side) are not labelled — they are not needed to find the area.

**Correct answer:** 48 m²

**Worked solution:** Split into two rectangles → lower 9m × 4m = 36 m²; upper 4m × 3m = 12 m²; total 36 + 12 = 48 m².

**Educational reasoning tested:** Recognising that an unfamiliar compound shape decomposes into rectangles the learner already knows how to handle (reuses the existing arithmetic area skill; the only new step is the decomposition itself).

**Likely misconception:** Adding the four given lengths directly (9+4+4+3 = 20) instead of multiplying each rectangle's own two sides first. The lesson's guided-attempt feedback names this exact pattern if a learner types 20.

**Why meaningfully different from the other seven:** The first exposure to the shape type — no perimeter, no inference, no representation twist. Purely "can this be split into two known rectangles."

**Founder judgement required:** None identified.

---

## 2. `mr03-compound-02` — Independent practice (lesson's own independent step)

- **Variant:** Parametric variant of #1
- **Difficulty:** Easy — Foundation Access
- **Inventory intention:** RENEWABLE
- **Marks:** 1

**Question as shown:** "A classroom floor plan is L-shaped, made of two rectangular sections. The main section is 8m by 5m. The smaller section is 3m by 2m. What is the total area of the floor?"

**Diagram:** Same L-shape structure as #1, different numbers and a different real-world context (a floor plan, not a garden). Labelled: bottom (8 m), lower-right (5 m), upper-right (2 m), top (3 m).

**Correct answer:** 46 m²

**Worked solution:** Main 8×5 = 40 m²; smaller 3×2 = 6 m²; total 46 m².

**Educational reasoning tested:** Same as #1, attempted without support — the lesson's own genuine "can they do it alone" evidence point.

**Likely misconception:** Same pattern as #1 (adding raw lengths: 8+5+3+2 = 18).

**Why meaningfully different:** Different context and numbers from #1 (a real parametric sibling, not the identical question), and it is the specific item the lesson records as the learner's first independent evidence for MR-03.

**Founder judgement required:** None identified.

---

## 3. `mr03-compound-03` — Standard practice (perimeter, new skill)

- **Variant:** Context variant of the family's shape, extending the skill to perimeter
- **Difficulty:** Medium — Standard
- **Inventory intention:** MEASUREMENT-adjacent RENEWABLE (`NEAR_TRANSFER`)
- **Marks:** 2

**Question as shown:** "A school hall is L-shaped. Four of its sides measure 12m, 5m, 3m and 5m, as shown. What is the perimeter of the hall?"

**Diagram:** The same L-shape family, four edges labelled (12 m, 5 m, 3 m, 5 m going around); the two remaining edges (the inward step and the full left side) are deliberately **not** labelled — finding them is the point of the question.

**Correct answer:** 40 m

**Worked solution:** Missing horizontal (the step) = 12 − 5 = 7 m. Missing vertical (the full left side) = 5 + 3 = 8 m. Sum all six sides: 12+5+7+3+5+8 = 40 m.

**Educational reasoning tested:** The family's real second skill — a compound shape has 6 sides, not 4, and the 2 unlabelled ones must be inferred from the labelled ones before a perimeter can be summed at all.

**Likely misconception:** Adding only the 4 labelled sides (12+5+3+5 = 25) and forgetting the hidden sides exist at all. This is the specific error the lesson's own "Watch out for" section and this family's `mathsTeachingContent.ts` entry both target.

**Why meaningfully different:** First perimeter item in the family — genuinely different skill from #1/#2 (which never require inferring a hidden edge), not merely a harder version of the same task.

**Founder judgement required:** None identified.

---

## 4. `mr03-compound-04` — Standard practice (perimeter, parametric sibling)

- **Variant:** Parametric variant of #3
- **Difficulty:** Medium — Standard
- **Inventory intention:** RENEWABLE (`NEAR_TRANSFER`)
- **Marks:** 2

**Question as shown:** "A factory floor is L-shaped. Four of its sides measure 14m, 6m, 4m and 6m, as shown. What is the perimeter of the floor?"

**Diagram:** Same structure as #3, new numbers/context.

**Correct answer:** 48 m

**Worked solution:** Missing horizontal = 14 − 6 = 8 m. Missing vertical = 6 + 4 = 10 m. Sum: 14+6+8+4+6+10 = 48 m.

**Educational reasoning tested:** Same as #3, repeated with fresh numbers so the skill is practised more than once before the family advances in difficulty.

**Likely misconception:** Same as #3 (14+6+4+6 = 30, hidden sides omitted).

**Why meaningfully different:** Parametric sibling of #3 — deliberately, not a new skill (the family needs at least 2 exposures to "infer the hidden sides" before moving on).

**Founder judgement required:** None identified.

---

## 5. `mr03-compound-05` — Secure practice (representation variant)

- **Variant:** Representation variant — the notch is on the *opposite* corner, and the worked method is deliberately the *outer-rectangle-minus-notch* approach rather than the split-into-two-rectangles approach used everywhere else in the family
- **Difficulty:** Hard — Secure
- **Inventory intention:** RENEWABLE (`NEAR_TRANSFER`)
- **Marks:** 2

**Question as shown:** "A field is shaped like the diagram shown, with a rectangular section missing from one corner. The full outer rectangle would measure 11m by 9m, but a 4m by 5m rectangle is missing from the bottom-left corner. What is the area of the field?"

**Diagram:** A large rectangle with a smaller rectangular bite taken out of the **bottom-left** corner (every other diagram in this family cuts from the top-right) — a deliberate orientation change so a learner cannot pattern-match on "the notch is always up there." Labelled: top (11 m), right (9 m), bottom-right segment (7 m), notch height (5 m), notch width (4 m).

**Correct answer:** 79 m²

**Worked solution:** Two independently cross-checked methods, both shown to the learner: (a) full rectangle 11×9 = 99 m², minus notch 4×5 = 20 m², giving 99−20 = 79 m²; (b) split into two rectangles instead — 7×9 = 63 m² plus 4×4 = 16 m², giving 63+16 = 79 m². Both agree.

**Educational reasoning tested:** That the "split into two rectangles" method taught in the lesson is one valid route among several — the outer-minus-notch method is equally valid and sometimes faster, and a learner should recognise both.

**Likely misconception:** Adding the missing corner's area to the outer rectangle instead of subtracting it, or subtracting from the wrong outer dimension.

**Why meaningfully different:** The only item that changes the shape's orientation AND deliberately teaches a second, different reasoning route rather than repeating the family's own default method.

**Founder judgement required:** None identified.

---

## 6. `mr03-compound-06` — Transfer (unseen reasoning direction)

- **Variant:** Reasoning variant — reverses the family's forward direction (given sides, find perimeter/area) into "given the perimeter, find a missing side"
- **Difficulty:** Hard — Transfer
- **Inventory intention:** MEASUREMENT (tagged `FAR_TRANSFER`)
- **Marks:** 2

**Question as shown:** "An L-shaped field has a perimeter of 44m. The narrower upper section measures 5m by 4m. The lower section is 6m tall, but its width is unknown, as shown. What is the width of the lower section?"

**Diagram:** Same family shape; the bottom edge is labelled **"?"** (the value to find) instead of a number; the other three needed edges are labelled (6 m, 4 m, 5 m). The shape's total perimeter (44 m) is stated in the question text, not as a diagram label.

**Correct answer:** 12 m

**Worked solution:** Let the unknown width be W. Going around all six sides: W + 6 + (W−5) + 4 + 5 + (6+4) = perimeter, which simplifies to 2W + 20 = 44, so W = 12. Check: the six real sides are 12, 6, 7, 4, 5, 10, which sum to 44 ✓.

**Educational reasoning tested:** This is Part 1's required "unseen transfer" item — solving for an unknown side algebraically from a stated total, rather than a rehearsed forward calculation. Genuinely the hardest reasoning step in the family.

**Likely misconception:** Treating the perimeter figure as if it were the area, or guessing W rather than setting up the total-sides equation.

**Why meaningfully different:** The only item in the family that runs the reasoning in reverse — every other item gives the shape's own sides and asks for area/perimeter; this one gives the perimeter and asks for a side.

**Founder judgement required — YES, flagging genuinely:** This diagram is drawn to real proportional scale from its actual coordinates (the renderer scales real (x,y) points uniformly; it does not distort them). Because the "?" edge is rendered at its **true, solved length** (12, exactly twice the length of the "6 m" edge shown beside it), a visually sharp learner could in principle estimate the answer by eye from the diagram's own proportions, rather than deriving it algebraically — partially undermining the point of a "transfer/reasoning" question. **Recommended fix, not yet made:** for this question only, either (a) redraw the unknown edge at a fixed, neutral placeholder length decoupled from its true value (keeping every other edge's true proportion), or (b) present this one item without a diagram, relying on the stated numbers alone, since the algebra does not depend on a picture. I have not made this change, since it is a genuine design judgement (visual support vs. information leak), not a mechanical defect, and belongs to your review rather than a unilateral edit.

---

## 7. `mr03-compound-07` — Challenge (deeper structural complexity)

- **Variant:** Genuinely new structural depth (a 3-rectangle "staircase" decomposition, not a 2-piece L-shape)
- **Difficulty:** Challenge — the family's one challenge-tier item, and the codebase's second challenge-tier Mathematics question overall (of 294, once this one lands)
- **Inventory intention:** RENEWABLE (`MIXED_TRANSFER`)
- **Marks:** 3

**Question as shown:** "A stepped patio is shown, made of three rectangular sections stacked like stairs. Six of its sides measure 12m, 3m, 4m, 3m, 4m and 3m, as shown. What is the total area of the patio?"

**Diagram:** A three-step staircase outline (8 edges, not 6) — three rectangular strips of decreasing width stacked on top of each other. Six of the eight edges are labelled (12, 3, 4, 3, 4, 3 m going around); the final left-hand edge (the total height, 9 m) is left for the learner to infer as the sum of the three strip heights.

**Correct answer:** 72 m²

**Worked solution:** Three horizontal strips: bottom 12×3 = 36 m²; middle (12−4)×3 = 8×3 = 24 m²; top 4×3 = 12 m². Total 36+24+12 = 72 m².

**Educational reasoning tested:** Extending the family's decomposition method from 2 pieces to 3 — a genuine reasoning-depth step, not merely bigger numbers.

**Likely misconception:** Treating the whole shape as one plain rectangle (e.g. 12×9) instead of splitting it into its three genuinely different-width strips.

**Why meaningfully different:** The only 8-edge, 3-rectangle shape in the family; every other item is a 6-edge, 2-rectangle L-shape.

**Founder judgement required:** None identified, though you may wish to confirm the reading age/wording of "stepped patio... stacked like stairs" is pitched appropriately for the intended year group.

---

## 8. `mr03-compound-08` — Retrieval anchor / lesson's fresh retry item

- **Variant:** Parametric variant of #1/#2, deliberately smaller and simpler numbers
- **Difficulty:** Easy — Foundation Access
- **Inventory intention:** RENEWABLE
- **Marks:** 1

**Question as shown:** "A small patio is L-shaped, made of two rectangular sections. The main section is 6m by 3m. The smaller section is 3m by 2m. What is the total area of the patio?"

**Diagram:** Same structure as #1/#2, smaller numbers.

**Correct answer:** 24 m²

**Worked solution:** Main 6×3 = 18 m²; smaller 3×2 = 6 m²; total 24 m².

**Educational reasoning tested:** Same foundation skill as #1/#2 — this item's real purpose is serving as (a) the Learn lesson's own "fresh opportunity" retry question after remediation, and (b) a simple, low-friction item for the existing spaced-retrieval engine to resurface later.

**Likely misconception:** Same pattern (6+3+3+2 = 14, raw lengths added).

**Why meaningfully different:** A third, independent instance of the foundation pattern — deliberately the simplest numbers in the family, chosen for its retrieval/retry role rather than to teach anything new.

**Founder judgement required:** None identified.

---

## Family-level diversity check

Explicitly checked for: *"every compound-shape question from Angel is solved in exactly the same way."* **Not present as a flat pattern.** Five genuinely distinct methods are represented across the 8 items: (1) split-into-2-rectangles-for-area (#1, #2, #8 — deliberately identical to each other, since these are parametric foundation-tier siblings meant to rehearse one method before advancing); (2) infer-2-hidden-edges-then-sum-perimeter (#3, #4 — likewise a deliberate parametric pair); (3) outer-rectangle-minus-notch on a mirrored orientation (#5); (4) reverse algebraic reasoning from a stated total (#6); (5) 3-way decomposition (#7). Only the two explicitly-labelled parametric pairs repeat a method by design — that is what makes them parametric variants rather than a defect.

## Migration 222 safety re-verification (this session, mechanical, not re-asserted from memory)

Re-read the full file and independently re-ran a shoelace-formula script against every diagram's own raw coordinates, cross-checked against every stored answer:

- Exactly 8 `insert into public.ali_question_bank` statements, each idempotent (`on conflict (id) do nothing`), no other table touched.
- All 8 rows: `subject = 'maths'`, `skill = 'QT-MR-07'` (→ competency MR-03), `family_id = 'mr03-compound-area-perimeter'` (new, no collision — confirmed via repo-wide grep), `provenance = 'angel_original'`, `eligibility_status = 'provisional'` (never `practice_eligible`/`mock_eligible` anywhere in the file).
- No id collides with any existing question anywhere in the 223 migration files (checked individually).
- Every diagram is a simple, non-self-intersecting rectilinear polygon (no diagonal edges, no zero-length edges, no out-of-bounds edge-label index).
- Every stored area/perimeter answer matches the shoelace-formula recomputation from the diagram's own real coordinates, independently of the migration's own prose working — including `#6`, where the apparent "mismatch" my first verification pass flagged was a false positive in my own script's classification logic (it compared the answer to the shape's total perimeter rather than recognising the answer is a single side length; re-checked by hand, correct).
- No existing question is overwritten (all 8 ids are new).

**Migration 222: READY for controlled Founder review process** — one design-judgement flag on `#6`'s diagram (above), not a defect.

## Migration 223 safety re-verification

Re-read the full file: registers exactly one review target (`question_family` / `mr03-compound-area-perimeter`), reviewer `'UNASSIGNED'` (never impersonates a reviewer or auto-approves), touches `ali_family_review` only (no `ali_question_bank` reference anywhere in the file), idempotent via `where not exists`, additive-only (no `update`/`delete`). Does not promote Practice eligibility and does not make any content learner-reachable by itself — registration and reachability are and remain two separate operations.

**Migration 223: READY for controlled Founder review process.**

## Visual verification

**VISUAL VERIFICATION DEFERRED.** Attempted this session via browser automation (a static HTML harness reproducing `CompoundShapeDiagram`'s exact rendering logic against all 8 real diagrams was built and is ready at short notice); the Chrome browser extension was not connected in this environment, so no actual on-screen rendering, mobile/tablet/desktop layout check, or label-overlap check was performed. Source-level inspection only supports (never proves) that: labels are positioned outward from each shape's centroid (reducing overlap risk by construction), the SVG scales to fit any container width (`w-full max-w-[240px]`), and the component is dark-mode aware. These are structural signals, not a PASS — genuine visual confirmation (including the `#6` scale-leak concern above) requires an actual render pass in a future session with browser access.
