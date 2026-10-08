# CSSE Maths candidates (140, pending): educational review summary

Prepared for Founder review before any submission. **Nothing has been submitted, approved or published.** Numbers below are computed from the real blueprints and the prepared package; the 'structural difference' and 'transfer value' lines are my judgements for you to confirm or reject.

**How to read the result**: for each blueprint, ask (1) is the demand genuinely different from what the child already meets, (2) would an 11+ child recognise this as exam-style, (3) is the working correct and teachable, (4) is repetition acceptable.

## At a glance

| Blueprint | Competency | Family | Prepared | Difficulty mix | Distinct texts (of 4000 draws) |
|---|---|---|---|---|---|
| hcf-equal-groups | MR-05 | mr05-factors-primes | 14 | medium 6, easy 8 | 1101/4000 (MODERATE) |
| lcm-repeating-events | MR-05 | mr05-factors-primes | 14 | medium 7, easy 4, hard 3 | 735/4000 (MODERATE) |
| smallest-common-multiple-above | MR-05 | mr05-factors-primes | 14 | hard 6, medium 8 | 3370/4000 (LOW) |
| identify-the-prime | MR-05 | mr05-factors-primes | 14 | hard 7, medium 7 | 3977/4000 (LOW) |
| pattern-in-context | MR-02 | mr02-nth-term | 14 | hard 8, medium 6 | 3171/4000 (LOW) |
| first-term-exceeding | MR-02 | mr02-nth-term | 14 | hard 11, medium 3 | 3576/4000 (LOW) |
| whole-periods-to-target | MR-02 | mr02-nth-term | 14 | medium 3, hard 11 | 3939/4000 (LOW) |
| containers-needed | MR-01 | mr01-whole-number-computation | 14 | medium 9, hard 5 | 3611/4000 (LOW) |
| change-from-note | MR-01 | mr01-whole-number-computation | 14 | medium 10, hard 4 | 276/4000 (HIGHER) |
| spend-then-share | MR-01 | mr01-whole-number-computation | 14 | hard 10, medium 4 | 3974/4000 (LOW) |

## Cross-cutting points for the reviewer

- **Difficulty skews medium/hard** (no easy items for the `mr01` and `mr02` additions). Those families already hold easy items; the additions are about interpretation, not entry-level fluency.
- **Representation is prose only.** These blueprints add context and structure, not tables or diagrams (see the representation gap analysis).
- **Closest to existing material:** `mr02-bp-pattern-in-context` (context-only). Reasonable to drop if you want only structurally new demands.
- **Not Mock:** every blueprint is `mockEligible: false`; nothing here enters a protected form.
- **My recommendation on volume:** `change-from-note` has by far the smallest space (a few hundred distinct texts) and is the easiest blueprint; I would publish at most 8 of its 14 candidates. `first-term-exceeding` and `whole-periods-to-target` are 11 of 14 hard, so a learner who is not yet secure would meet them as stretch items only.
- **Effect if all approved:** practice-eligible 901 to 1,041. This is a step, not the milestone.

## Blueprint detail

### mr05-bp-hcf-equal-groups

- **Competency / family / skill:** MR-05 / `mr05-factors-primes` / QT-MR-11
- **Purpose:** Recognise that sharing two quantities into identical groups with nothing left over asks for their highest common factor, and find it.
- **Misconception targeted:** using the smaller number, or the lowest common multiple, when the situation asks for the highest common factor
- **Example question:** A shop has 56 apples and 63 oranges. They are packed into identical baskets, each with the same number of apples and the same number of oranges, with no fruit left over. What is the greatest number of baskets that can be filled?
- **Answer and derivation:** answer **7**. Every group has the same amount of each kind with none left over, so the number of groups must divide both 56 and 63 exactly. The greatest number that divides both is the highest common factor: HCF(56, 63) = 7.  _(derived by a deterministic function; re-derived in tests by an independent method, e.g. simulation or brute-force scan.)_
- **Structural difference from existing material:** Existing HCF items ask 'What is the HCF of a and b?' with no situation. Here the child must first recognise that 'identical groups, nothing left over, as many as possible' means HCF. The computation is the same; the recognition step is new.
- **Context variation:** 3 context tag(s): equal_groups_fruit_baskets (4), equal_groups_counters (5), equal_groups_class_teams (5)
- **Difficulty (of the 14 prepared):** medium 6, easy 8. Basis: context_translation, amount_magnitude.
- **Transfer value:** High. It is the standard exam form of HCF. A child who only knows the bare procedure cannot answer it unprompted.
- **Repetition risk:** MODERATE. 1101 distinct question texts in 4000 random draws. Wording rotates over three situations only; the numbers are always g×m and g×n with coprime m, n, so the HCF is always the intended g (3 to 12).

### mr05-bp-lcm-repeating-events

- **Competency / family / skill:** MR-05 / `mr05-factors-primes` / QT-MR-11
- **Purpose:** Recognise that two repeating events coinciding again asks for the lowest common multiple, and find it.
- **Misconception targeted:** multiplying the two intervals, or finding a common factor, instead of the lowest common multiple
- **Example question:** Asha visits the library every 6 days and Ben visits every 13 days. They are both there today. After how many days will they next both be there?
- **Answer and derivation:** answer **78**. They coincide again at a time that is a multiple of both 6 and 13; the first such time is the lowest common multiple. HCF(6, 13) = 1, so LCM = (6 × 13) ÷ 1 = 78.  _(derived by a deterministic function; re-derived in tests by an independent method, e.g. simulation or brute-force scan.)_
- **Structural difference from existing material:** Existing LCM items are bare 'LCM of a and b'. Here the situation (two repeating events) must be read as 'next time they coincide'. Pairs are chosen so neither interval divides the other, so the answer is never just the larger number.
- **Context variation:** 3 context tag(s): repeating_events_library (5), repeating_events_buses (5), repeating_events_lights (4)
- **Difficulty (of the 14 prepared):** medium 7, easy 4, hard 3. Basis: context_translation, lcm_magnitude.
- **Transfer value:** High. Recognising 'next time together' as LCM is the usual exam context.
- **Repetition risk:** MODERATE. 735 distinct question texts in 4000 random draws. Three situations only. Small number range (3 to 20) means a modest set of distinct pairs.

### mr05-bp-smallest-common-multiple-above

- **Competency / family / skill:** MR-05 / `mr05-factors-primes` / QT-MR-11
- **Purpose:** Find the smallest number above a stated boundary that is a multiple of two given numbers -- the common multiple and the boundary condition must both be used.
- **Misconception targeted:** stopping at the lowest common multiple and ignoring the boundary condition
- **Example question:** What is the smallest number greater than 118 that is a multiple of both 5 and 8?
- **Answer and derivation:** answer **120**. A multiple of both 5 and 8 is a multiple of their lowest common multiple, 40. The multiples of 40 go up in steps of 40; find the first one that is greater than 118: 120.  _(derived by a deterministic function; re-derived in tests by an independent method, e.g. simulation or brute-force scan.)_
- **Structural difference from existing material:** Adds a boundary condition on top of LCM: the answer is the first common multiple above k, so stopping at the LCM is wrong (enforced: k is at least the LCM).
- **Context variation:** 1 context tag(s): common_multiple_with_boundary (14)
- **Difficulty (of the 14 prepared):** hard 6, medium 8. Basis: lcm_magnitude, boundary_condition.
- **Transfer value:** Medium-high. Teaches that a common multiple is a family of numbers, not one value.
- **Repetition risk:** LOW. 3370 distinct question texts in 4000 random draws. One wording only (no context rotation); variation comes from a, b and k alone.

### mr05-bp-identify-the-prime

- **Competency / family / skill:** MR-05 / `mr05-factors-primes` / QT-MR-11
- **Purpose:** Pick out the one prime number from a list of four where the other three are composite numbers that look prime -- requires testing each number, not recognising a pattern.
- **Misconception targeted:** assuming an odd number that is not in a times table is prime (for example 51, 57, 91)
- **Example question:** Exactly one of these four numbers is prime: 73, 63, 91, 169. Which one?
- **Answer and derivation:** answer **73**. 63 = 3 × 21, so 63 is not prime. 91 = 7 × 13, so 91 is not prime. 169 = 13 × 13, so 169 is not prime. 73 has no factor other than 1 and itself, so it is the prime number.  _(derived by a deterministic function; re-derived in tests by an independent method, e.g. simulation or brute-force scan.)_
- **Structural difference from existing material:** Existing prime items are True/False on one number. Here the child must test four numbers and select the single prime; the three composites are drawn from a pool of look-alike primes (51, 57, 91, 119 ...), and the prime's position varies.
- **Context variation:** 1 context tag(s): classify_from_list (14)
- **Difficulty (of the 14 prepared):** hard 7, medium 7. Basis: composite_disguise.
- **Transfer value:** Medium. Builds the habit of testing for factors rather than recognising 'prime-looking' numbers.
- **Repetition risk:** LOW. 3977 distinct question texts in 4000 random draws. Composites come from a fixed pool of 18 numbers and primes from 15, so the space is large (combinations) but the vocabulary of numbers is small; a determined learner could memorise the pool over many sessions.

### mr02-bp-pattern-in-context

- **Competency / family / skill:** MR-02 / `mr02-nth-term` / QT-MR-05
- **Purpose:** Use the 'first term plus (n - 1) steps' rule on a growing physical pattern, recognising that the first pattern has no extra steps added.
- **Misconception targeted:** adding n lots of the step instead of n - 1, forgetting that the first pattern is already counted
- **Example question:** The first path is made from 12 tiles. Each longer path uses 6 more tiles than the last. How many tiles are in path number 23?
- **Answer and derivation:** answer **144**. Pattern 1 already has 12. To reach pattern 23, 22 lots of 6 are added. 12 + 22 × 6 = 144.  _(derived by a deterministic function; re-derived in tests by an independent method, e.g. simulation or brute-force scan.)_
- **Structural difference from existing material:** Existing nth-term items present the sequence as a list of terms. Here a physical pattern (matchsticks, tiles, chairs) grows, and the child must see that pattern 1 already exists, so n-1 steps are added.
- **Context variation:** 3 context tag(s): pattern_tile_paths (3), pattern_chair_rows (6), pattern_matchsticks (5)
- **Difficulty (of the 14 prepared):** hard 8, medium 6. Basis: context_translation, position_magnitude.
- **Transfer value:** Medium. The same rule in a concrete setting; an on-ramp from physical patterns to the abstract rule. Structurally close to the direct nth-term blueprint, so its main value is context, not a new demand.
- **Repetition risk:** LOW. 3171 distinct question texts in 4000 random draws. Closest to existing material of the ten; context-only variation. Reviewer may judge it adds limited structural depth.

### mr02-bp-first-term-exceeding

- **Competency / family / skill:** MR-02 / `mr02-nth-term` / QT-MR-05
- **Purpose:** Find the first term of an increasing sequence that is greater than a target -- a threshold question, not a 'find term n' or 'is it in the sequence' question.
- **Misconception targeted:** returning the last term below the target, or the target itself, instead of the first term above it
- **Example question:** A sequence starts at 18 and goes up by 5 each time: 18, 23, 28, ... What is the first term in the sequence that is greater than 80?
- **Answer and derivation:** answer **83**. From 18, count how many steps of 5 are needed to pass 80: (80 − 18) ÷ 5 = 12.4, so 13 steps are needed. 18 + 13 × 5 = 83.  _(derived by a deterministic function; re-derived in tests by an independent method, e.g. simulation or brute-force scan.)_
- **Structural difference from existing material:** A threshold question: 'first term greater than t'. Existing blueprints find term n, find n, or test membership; none asks for the first term past a boundary. The target is never itself a term.
- **Context variation:** 1 context tag(s): linear_sequence_threshold (14)
- **Difficulty (of the 14 prepared):** hard 11, medium 3. Basis: threshold_distance.
- **Transfer value:** Medium-high. Connects sequences to inequalities and to 'when does it first exceed'.
- **Repetition risk:** LOW. 3576 distinct question texts in 4000 random draws. One wording; variation from a, d, t alone. Difficulty skews hard (distance to target is often large).

### mr02-bp-whole-periods-to-target

- **Competency / family / skill:** MR-02 / `mr02-nth-term` / QT-MR-05
- **Purpose:** Use a repeated-addition rule to find how many whole periods are needed to reach a target, where the division does not come out exactly and the answer must be rounded UP.
- **Misconception targeted:** rounding the division down (or to the nearest whole number), so the target has not actually been reached
- **Example question:** A book has 61 pages. Sam has read 34 pages and reads 8 more pages each day. After how many whole days will he first have read at least 61 pages?
- **Answer and derivation:** answer **4**. Amount still needed: 61 − 34 = 27. 27 ÷ 8 = 3.38, which is not a whole number, so round UP to 4 (after only 3 whole periods the target has not yet been reached).  _(derived by a deterministic function; re-derived in tests by an independent method, e.g. simulation or brute-force scan.)_
- **Structural difference from existing material:** Whole periods to reach a target where the division is not exact and the answer must round UP. Existing sequence items never involve rounding.
- **Context variation:** 3 context tag(s): target_reading (4), target_plant_growth (6), target_savings (4)
- **Difficulty (of the 14 prepared):** medium 3, hard 11. Basis: context_translation, rounding_up_interpretation.
- **Transfer value:** High. Savings/reading/growth targets are classic exam word problems; rounding up is a well-documented error.
- **Repetition risk:** LOW. 3939 distinct question texts in 4000 random draws. Three situations. The 'pages read' wording reuses the page total as both the book length and the target, so check the sentence reads naturally.

### mr01-bp-containers-needed

- **Competency / family / skill:** MR-01 / `mr01-whole-number-computation` / QT-MR-01
- **Purpose:** Divide and then interpret the remainder in context: a part-filled container is still needed, so the answer is the quotient plus one.
- **Misconception targeted:** giving the whole-number quotient and ignoring the remainder, so some items have no container
- **Example question:** A school trip has 179 people. Each minibus carries 9 people. How many minibuses are needed so that everyone has a seat?
- **Answer and derivation:** answer **20**. 179 ÷ 9 = 19 remainder 8. 19 full containers hold 171; the 8 left over still need one more container, so 20 are needed.  _(derived by a deterministic function; re-derived in tests by an independent method, e.g. simulation or brute-force scan.)_
- **Structural difference from existing material:** Division followed by interpreting the remainder (a part-filled container is still needed). Existing division blueprints report the remainder or the exact quotient; none asks what the remainder means in a situation.
- **Context variation:** 3 context tag(s): containers_minibuses (4), containers_egg_trays (4), containers_biscuits (6)
- **Difficulty (of the 14 prepared):** medium 9, hard 5. Basis: context_translation, remainder_interpretation.
- **Transfer value:** High. 'How many buses are needed' is the standard remainder-interpretation question.
- **Repetition risk:** LOW. 3611 distinct question texts in 4000 random draws. Three situations; numbers 40 to 400 and container sizes 6 to 24.

### mr01-bp-change-from-note

- **Competency / family / skill:** MR-01 / `mr01-whole-number-computation` / QT-MR-01
- **Purpose:** Multiply to find a total cost, then subtract it from the amount paid -- two operations whose order is set by the situation.
- **Misconception targeted:** subtracting the price of one item from the note instead of the total cost
- **Example question:** Leo buys 5 model kits that cost £2 each. They pay with a £20 note. How many pounds change do they get?
- **Answer and derivation:** answer **10**. Total cost: 5 × £2 = £10. Change: £20 − £10 = £10.  _(derived by a deterministic function; re-derived in tests by an independent method, e.g. simulation or brute-force scan.)_
- **Structural difference from existing material:** Multiply to find a total, then subtract it from the note. A two-step order set by the situation; existing arithmetic blueprints are single-operation or add-then-multiply on bare numbers.
- **Context variation:** 4 context tag(s): shopping_model_kits (7), shopping_notebooks (2), shopping_stickers (2), shopping_rulers (3)
- **Difficulty (of the 14 prepared):** medium 10, hard 4. Basis: two_step_order.
- **Transfer value:** Medium. Foundation-level money context; useful for Year 4/5 learners and as a quick confidence builder.
- **Repetition risk:** HIGHER. 276 distinct question texts in 4000 random draws. Easiest of the ten and the smallest parameter space (two note values); four buyer/item rotations.

### mr01-bp-spend-then-share

- **Competency / family / skill:** MR-01 / `mr01-whole-number-computation` / QT-MR-01
- **Purpose:** Subtract an amount that is spent, then divide what remains equally -- the order (subtract, then divide) is set by the situation and the shared amount is the one asked for.
- **Misconception targeted:** dividing the whole amount by the number of groups and forgetting to take away what was spent first
- **Example question:** Some friends collect £560 for a present. They spend £70 on the present and share what is left equally between 5 charities. How many pounds does each charity receive?
- **Answer and derivation:** answer **98**. Money left after spending: £560 − £70 = £490. Share equally: £490 ÷ 5 = £98.  _(derived by a deterministic function; re-derived in tests by an independent method, e.g. simulation or brute-force scan.)_
- **Structural difference from existing material:** Subtract what was spent, then share the remainder equally. The order matters: dividing the whole amount first is the target misconception. Existing blueprints do not chain subtract then divide in a situation.
- **Context variation:** 3 context tag(s): spend_then_share_friends (7), spend_then_share_club (6), spend_then_share_fair (1)
- **Difficulty (of the 14 prepared):** hard 10, medium 4. Basis: two_step_order, context_translation.
- **Transfer value:** Medium-high. Multi-step money/sharing is a common exam shape.
- **Repetition risk:** LOW. 3974 distinct question texts in 4000 random draws. Three situations. The amounts are constrained to divide exactly, so only some (total, spend, k) combinations qualify.
