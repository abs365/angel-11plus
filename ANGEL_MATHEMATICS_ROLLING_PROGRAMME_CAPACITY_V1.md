# Angel 11+ Mathematics — Rolling Programme Capacity Plan (Decision 226)

Investigation, quantification and programme planning only. No question authored, no migration created, no eligibility changed, no Mock 2 composed. Every figure below is labeled **RE-VERIFIED THIS SESSION** (live-computed against real migration source/`scripts/lib/mockMathematicsPool.mjs`) or **INHERITED** (cited from a prior Decision's own report, not independently re-derived this session, per this task's own explicit instruction to disclose which is which).

## 1. Current Verified Inventory

**Certified Mock-track pool** (`eligibility_status` = `mock_eligible` or `independently_validated`), RE-VERIFIED THIS SESSION via `scripts/lib/mockMathematicsPool.mjs`:
- **81 rows total**: 77 `mock_eligible` + 4 `independently_validated` (the Perimeter Area family, deliberately excluded from Mock 1).
- **33 numbered-question experiences across 31 families** (77-row `mock_eligible` slice; grouped multi-subpart families collapse to one experience each — e.g. `mock-mr11-roundingbounds` is 4 rows/4 marks but 1 experience).

**General Practice `practice_eligible` Mathematics estate**: **≈199 rows, heuristic estimate only — NOT independently row-verified this session** (grep-counted across 15 practice-authoring migrations; a precise count would require per-file tuple parsing not performed in this pass). This is the pool `lib/ali/questionBank.ts`'s `fetchQuestionBank()` actually draws from for ordinary Practice sessions — structurally separate from, and much larger than, the Mock-track pool above.

**`provisional`/`authentic_assessment_candidate` pipeline rows**: not separately quantified — these are transient pre-promotion states in the mock-track authoring chain; the 81-row figure above already reflects the current, post-promotion live state.

## 2. Mock 1 Consumption

RE-VERIFIED THIS SESSION against migration 147's own literal 56-id manifest, diffed against the 77-row `mock_eligible` pool:
- Mock 1 consumed **56 of 77 rows (21 numbered experiences, 56 marks)**.
- **Every family Mock 1 touched was consumed 100%** — zero partial families were left behind (confirmed structurally, matching migration 147's own grouped-family-completeness precondition).
- **Reserve: 21 rows / 21 marks / 12 numbered experiences**, spanning **10 entirely untouched families**: `mock-mr10-fairprep`, `mock-mr13-bestvalue`, `mock-mr06-sumdiff`, `mock-mr10-forwardschedule`, `mock-mr10-reverseschedule`, `mock-mr11-truefalsejudgement`, `mock-mr11-propertysearch`, `mock-mr08-rotation`, `mock-mr12-reversemean`, `mock-mr09-data`. Difficulty: medium 13, hard 8, easy 0.

## 3. Practice Capacity

Deliberately expressed as ranges — the adaptive selection algorithm (`lib/ali/selection.ts`) genuinely prevents a precise longevity prediction, per this task's own instruction. Governing mechanics: `COOLDOWN_QUESTIONS` (easy 5 / medium 10 / hard 15 / challenge 20 intervening questions before a row can resurface), a further ×3 multiplier once a row is `mastered`, and a Mathematics session size of 8 questions (`PRACTICE_AREAS`, `lib/learningEngine/practiceContent.ts`).

| Frequency | 4 weeks (questions presented) | 8 weeks | 12 weeks |
|---|---|---|---|
| 3 sessions/week | ~96 | ~192 | ~288 |
| 5 sessions/week | ~160 | ~320 | ~480 |
| Daily | ~224 | ~448 | ~672 |

Against a **≈199-row** `practice_eligible` pool: at 3 sessions/week, cumulative presentations pass the pool size somewhere around week 8; at 5/week or daily, this happens well inside 4 weeks. **Cooldown prevents the SAME row reappearing back-to-back, but does not prevent it recurring multiple times within an 8-12 week window at any of these frequencies** — the pool is genuinely smaller than sustained multi-month use at higher frequencies would consume without repetition. Whether repeated exposure to the same *row* becomes memorisation-risk repetition of the same *wording/pattern*, rather than healthy spaced review, depends entirely on Section 4's structural-variant finding: for the many single-instance archetype families, row-repetition **is** pattern-repetition, since no alternate phrasing of that archetype exists anywhere in the pool. **Assumption stated explicitly**: this table assumes even distribution across the pool; in practice, the weak-skill-override and mastered-resurface logic concentrate presentations on a learner's own weaker rows, which could make effective recurrence noticeably *faster* for a struggling learner's own weakest 1-2 archetypes than this even-distribution estimate suggests.

## 4. Archetype Depth Matrix (Mock-track pool)

RE-VERIFIED THIS SESSION. Of the 31 families in the 77-row `mock_eligible` pool, the large majority are **single-instance archetypes** — one family, one occurrence, zero cross-family structural variant available anywhere in the certified estate. Genuine multi-instance archetype groups confirmed: linked-quantity algebra (`linkedvalues`/`numberpuzzle`/`multiplerelation`/`sumdiff` — 4 families, each a real, structurally distinct relationship shape per Decision 205's own direct comparison, not a reskin), scheduling/timetables (~5 families), percentage (3 families), mean/frequency (3 families, though Decision 205 itself flags the weighted-differential-rate variant as still unclaimed — Section 7 below). Direct example (`mock-mr11-roundingbounds`, migration 140): its own 4 subparts genuinely test 4 distinct reasoning moves (upper bound / lower bound / bounded sum / bounded difference) — real internal variation, but still **one family for the entire "rounding-bounds" archetype** — any future reuse of this exact archetype shape would need an entirely new scenario, since no second instance exists anywhere in the pool.

**Competency coverage** (RE-VERIFIED THIS SESSION, mock-track 77-row pool):

| Competency | Rows | Classification |
|---|---|---|
| MR-01 Arithmetic Calculation | 24 | Adequate |
| MR-02 Algebraic/Symbolic | 14 | Adequate |
| MR-03 Geometric/Spatial | 6 | **Thin** |
| MR-04 Multi-Step Word-Problem | 25 | Adequate |
| MR-05 Number Properties | 8 | Adequate-but-narrow (1 family, `roundingbounds`) |
| **MR-06 Precision Under Exact-Match** | **0** | **Unrepresented — no row anywhere in the certified pool** |

## 5. Anti-Memorisation Assessment

**CRITICAL** (per this task's own classification bands): MR-06, zero instances anywhere — a learner sitting a hypothetical future Mock covering this competency would see it for the first time with no Practice exposure at all.

**THIN**: MR-03 (6 rows across 2 families); the single-instance-per-archetype pattern across most of the 31 families generally.

**ADEQUATE DEPTH** (genuine internal structural variation, though still single-family): the linked-quantity algebra group, scheduling group, percentage group.

**UNREPRESENTED** (real primary-source evidence exists, zero Angel content authored — Section 7).

**INHERITED, not re-derived this session**: Decision 205's own standing finding that the 9 Classification-A archetypes sitting at 1 instance each fall short of an estimated **14-21-instance minimum** for genuine anti-memorisation depth at programme scale. This session did not re-classify all 31 families against the source papers to reproduce that range independently (Decision 205 already did this exhaustively); it is cited, not re-verified, exactly as this task's own instruction requires disclosing. Nothing in the Increment 006 wave (which only deepened the already-counted `roundingbounds` archetype) would change this inherited figure.

## 6. Future Mock Capacity

The 21-mark reserve alone is **far short** of a second 56-mark Mock. Historical composer yield (Decision 213's own re-cited figure) reached only ≈93-97% of a 58-60 mark target from the FULL 77-row pool at Mock-1 authoring time — meaning even a "fresh" composition attempt tends to fall short of target without real headroom. **Minimum additional net-new content for Mock 2**: at least 35 more marks beyond the current 21-mark reserve (56 − 21) to reach a bare 56-mark floor, and realistically closer to 45-55 additional marks once the same composer-yield shortfall is accounted for. **Mock 3** would need a comparable further tranche again, since Mock 2 would itself consume most or all of the by-then-available reserve.

**Reuse/retirement**: no `retired`/`exposed_in_released_mock` `eligibility_status` value exists anywhere in the schema (re-confirmed, Decision 222 Part 8's own finding, unchanged). Until that mechanism exists, **Mock 1's own 56 rows must not be reused in Mock 2** by policy, not by any schema enforcement — this is a real, standing constraint on Mock 2 composition, independent of raw content volume. **Controlled reuse verdict**: not educationally defensible today, for any Mock-1-consumed row, until retirement tracking exists; the 21-mark reserve plus genuinely new authoring is the only safe path.

**No Mock 2 was composed by this decision** — figures above are capacity analysis only.

## 7. Content Gaps (Primary-Source Opportunities)

**INHERITED from Decision 205** (ALI_DECISION_LOG.md, the exhaustive audit of all 3 available real CSSE Mathematics papers — 2021/2022/2023 Entry, 62 numbered questions / 180 marks total. **This is the entire available primary-source evidence base, not a sample** — no 4th paper exists to check).

Five archetypes with confirmed real source evidence, zero Angel content authored against them, none appearing among the 31 current pool families:

| Archetype | Source | Occurrences |
|---|---|---|
| Number-pyramid structure | 2023 Q6 | 1, 3 distinct reasoning demands |
| Combinatorics / systematic counting | 2023 Q16 | 1 |
| Age-narrative algebra | 2023 Q17 | 1, 3 subparts |
| Frobenius-style impossible-score number theory | 2022 Q5 | 1, 3 subparts |
| Weighted-differential-rate mean extension | 2022 Q15 | 1, a real evidenced extension of the existing frequency-table-mean shape, not a duplicate |

**Exhausted** (zero further source evidence anywhere): best-value/unit-price — already fully mined by existing content.

**Visual/diagram-blocked content, re-quantified smaller than earlier decisions assumed**: only 3 of 62 source questions (≈5%), ≤6 marks total (cube-net/shape-matching ×2, one graph-point-plotting subpart). Angle geometry and coordinate rotation are already implemented text-only, not diagram-blocked — see Section 12.

## 8. Difficulty Gaps

RE-VERIFIED THIS SESSION: across the 81-row certified pool, **easy 8, medium 35, hard 38, challenge 0**. **No `challenge`-tier content exists anywhere in the Mock-track estate.** Mock 1 itself carries easy 8 / medium 22 / hard 26 (its own frozen `composition_provenance`), the reserve carries medium 13 / hard 8 / easy 0. The estate is not short of an accessible entry tier (easy 8, all inside Mock 1) or a middle-discrimination tier (medium 35, well-populated); it is short of two things specifically: (a) any genuine challenge-tier presence at all, and (b) easy-tier depth in the reserve (0 easy rows left after Mock 1 — a future Mock's own accessible opening would need entirely new easy content, since Mock 1 already claimed all 8 that exist). Per this task's own instruction, difficulty should not be manufactured merely to fill a quota — any future challenge-tier content should come from genuinely harder real reasoning demands the source papers or Angel's own extrapolation support (e.g. the Frobenius/combinatorics archetypes in Section 7 are natural challenge-tier candidates by their own nature), not an artificial re-labelling of existing medium/hard content.

## 9. Primary-Source Opportunities — Summary

The 62-question/180-mark corpus (Section 7) is fixed and fully audited; it will not grow. Five archetypes remain directly source-backed and unclaimed (SOURCE-CONTAINS tier available). Beyond those five, further depth (the "14-21 instances per archetype" inherited target, Section 5) **cannot** come from more primary-source discovery — it requires moving into AUTHORED-EXTRAPOLATION content (Angel-original, structurally faithful to an evidenced archetype but not itself drawn from a specific paper question) for any instance beyond what real papers directly support. This is a genuine, structural ceiling on how far "more primary-source mining" alone can take programme-scale depth — named explicitly here rather than left implicit.

## 10. Recommended Authoring Model

Evaluated against the four options this task names: **(A) one family at a time** — proven (it built Mock 1), but Decision 205's own finding that recent single-family waves (Increment 001-006) each added only ≈+1 mark of real Mock-ceiling gain under the richest-first composer, despite 3-4 marks of raw new content, shows this pattern has diminishing returns at programme scale, not Mock-1 scale specifically. **(D) another structure** was considered (e.g. authoring strictly by competency to close MR-06) but is a narrower special case of (C) below, not a distinct model. **(B) deepen existing high-value archetypes only** would leave MR-06 permanently uncovered and all 5 confirmed-evidenced gap archetypes unclaimed indefinitely — a worse outcome than a model that captures both. **Recommended: (C) a balanced batch across several thin/unrepresented archetypes**, sequenced to close the highest-confidence (SOURCE-CONTAINS), highest-structural-need (competency-coverage) gaps first, with archetype-deepening as an explicit second priority within the same programme rather than a separate initiative — optimising jointly for structural diversity, competency coverage, and future Mock capacity, not raw marks (per this task's own explicit instruction).

## 11. Minimum / Healthy / Strong Capacity Targets

Expressed in learner-experience and structural-variation terms, never raw row count alone, per this task's own instruction.

**MINIMUM**: every Classification-A archetype reaches ≥2 structurally distinct instances (up from ≈1 today); MR-06 has ≥1 real instance; MR-03 grows past 6 rows into a second family; ≥2 challenge-tier experiences exist somewhere in the pool; net-new, non-Mock-1-overlapping content reaches ≥56 marks (enough for one genuinely fresh Mock 2 composition attempt).

**HEALTHY**: every Classification-A archetype reaches ≥3 instances; all 5 confirmed-evidenced gap archetypes (Section 7) are authored; MR-06 reaches ≥2 instances; net-new content supports Mock 2 fully and makes a real start on a Mock 3 reserve; a genuine easy-tier presence exists again in the post-Mock-1/2 reserve (not zero, as it is today).

**STRONG**: every Classification-A archetype reaches 4-6 instances (a deliberately more conservative near-term interpretation of Decision 205's own inherited 14-21 upper estimate, not adopted wholesale here without independent re-verification); every one of the 6 MR-competencies has genuine, non-trivial coverage with no zero-coverage gap; at least two independent 56-mark Mock reserves exist beyond Mock 1; challenge-tier content exists across multiple competencies, not one.

## 12. Sequenced Authoring Roadmap (not implemented — planning only)

**Phase 1 (highest confidence, SOURCE-CONTAINS tier)**: author the 5 confirmed-evidenced gap archetypes (Section 7) plus a first MR-06 instance and MR-03 deepening — the cheapest-risk, most directly source-backed content available, and the only content that closes a genuine zero-coverage competency gap.

**Phase 2 (AUTHORED-EXTRAPOLATION tier, disclosed as such)**: deepen the most Mock-critical single-instance Classification-A archetypes to 2-3 instances each, using the SAME evidence-hierarchy discipline this programme has used throughout (never presented as SOURCE-CONTAINS when it isn't).

**Phase 3**: compose toward a Mock-2-ready net-new reserve (Section 6's own ≥35-45 mark target), validated via the same composition/curation/freeze pipeline already proven for Mock 1 — not begun here.

**Phase 4 (separately gated, not scheduled)**: decide on a retirement-tracking mechanism (Decision 222 Part 8's own named prerequisite) before Mock 2 may safely draw on any content overlapping Mock 1; revisit visual/diagram capability only if new primary-source evidence changes the ≈5%/≤6-mark finding (Section 7) — no such evidence exists today.

## 13. STOP/GO Gates

- **GO** for Phase 1 authoring: requires a separate, explicit Founder authorisation (a future Increment 007) — **not begun by this decision**.
- **STOP** before any Mock 2 composition: until net-new, non-overlapping content reaches ≥56 marks (Section 6/11).
- **STOP** before any Mock-1-adjacent content reuse: until a retirement-tracking mechanism exists (Decision 222 Part 8).
- **STOP** before diagram/visual capability investment: until new source evidence materially changes the ≈5%/≤6-mark finding (none exists today) — Decision 205's own "visual-later" verdict stands, confirmed rather than merely repeated.
- **STOP** before any parametric/automated question-generation capability (Section 10 of the governing task, not built here): requires a separately-scoped design distinguishing independently-authored-and-reviewed structural templates from safe parameter/context variation from unsafe reasoning-shortcut variation — no such design exists yet, and none should be built before Phase 1/2's own human-authored depth is underway, given the primary-source ceiling (Section 9) means most future depth requires genuine educational authoring judgement, not mechanical substitution.

---

**Final verdict: A — BEGIN BALANCED MULTI-FAMILY AUTHORING PROGRAMME.**
