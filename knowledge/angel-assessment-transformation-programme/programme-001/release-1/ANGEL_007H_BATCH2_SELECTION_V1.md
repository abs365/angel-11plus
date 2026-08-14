# Angel 11+ — Educational Increment 007H — Controlled Review Batch 2 Selection

**Prepared:** 007H, 2026-08-14. Selection made from the existing provisional corpus only — no new content authored, no new subject started, Mock untouched.
**Baseline this selection is drawn from:** live production, independently re-queried this session (`scripts/007h-baseline-reconciliation.mjs`, `scripts/007h-batch2-family-detail.mjs`), not reused from an earlier report. TOTAL 264 (English 117, Mathematics 146, Writing 1). Practice Eligible 135 (English 70, Mathematics 65). Provisional 129 (English 47, Mathematics 81, Writing 1). Mock Eligible 0. All figures match the directive's stated baseline exactly.

---

## 1. Why this batch, not an alternative composition

Part 2's gap analysis (full detail in the 007H report) found two things that should drive selection more than raw row count:

1. **Real zero-supply competencies exist behind the review gate.** English `QT-RC-04` (word-in-context synonym) has **no practice-eligible representation at all** — every one of its 11 questions is still provisional. Mathematics `QT-MR-13` (best-value / combinatorial reasoning) is in the same position — 8 provisional questions, 0 practice-eligible.
2. **Some "covered" skills are covered by repetition of a single item, not real variety.** English `QT-RC-01` (direct retrieval) and `QT-RC-08` (emotion-and-cause inference) each currently have exactly **one** practice-eligible instance apiece (both legacy singleton questions, `fv-eng-001-q1` and `eng-003-q3`) despite 14 and 11 well-evidenced provisional siblings sitting immediately behind the review gate. Mathematics `QT-MR-04` (percentage/proportional reasoning) is nominally "in supply" only because the same one percentages problem appears three times (guided / independent / independent-retry) — a learner doing this skill twice this month sees the identical numbers both times.

Both problems are exactly what the directive named as the thing Batch 2 must fix: not more rows, but rows that convert a single-item or zero-item competency into a real, variable, repeatable one.

The batch below was chosen because every target does at least one of those two things, and every target is also **low-friction to review** — each already has a complete, evidence-cited review pack from a prior increment (English: `ENGLISH_WAVE1_REVIEW_PACKS_V1.md` / `ENGLISH_WAVE2_REVIEW_PACKS_V1.md` / `ENGLISH_WAVE2_MODEL_COVERAGE_AUDIT_V1.md`; Mathematics: `MATHEMATICS_WAVE2_REVIEW_PACKS.md`), a registered `ali_family_review` target (migrations 038/041/048/050), automated validation already passing, and zero known blocking defects (`ANGEL_007D_REVIEW_BACKLOG_V1.md`).

**Alternative compositions considered and rejected:**
- **All 21 remaining Mathematics families at once** (the full C1+C2 set) — rejected. 16 of those families (C2) have a registered review target (migration 053) but no prepared review pack with representative/boundary exemplars; asking the Founder to review them now would violate Part 4's "do not ask the Founder to review poor internal artefacts." They are recommended for a future increment after a review-pack authoring pass, not for Batch 2.
- **All 4 remaining English families** (adding `wave1-fam-tick-justify`) — rejected for this batch specifically, not deferred forever. `tick-justify` shares its competency (`QT-RC-02`) with `wave1-fam-quote-explain`, already activated in 007G with 13 questions; `QT-RC-02` is not a zero-supply or single-item skill the way the three selected families are. Including it would have made the batch larger without addressing either Part 2 problem as directly. It is the natural first item for Batch 3.
- **English passages as separate targets** — rejected. The three selected English families are the same *generic, evidenced-once-and-applied-across-many-passages* pattern as 4 of the 5 families 007G already activated (`vocab-explain`, `sequencing`, `quote-explain`, `direct-retrieval`'s own type), none of which required a companion passage promotion in migration 055. Only the passage-*specific* structural families (`two-character`, `multiselect`) triggered a passage promotion in 007G, and none of Batch 2's families are of that kind. No passage is therefore selected as its own target this round (see the deferred list for the disclosed reasoning in full).

---

## 2. Selected targets

| # | Human-readable name | Target ID | Subject | Type | Competency | Family | Siblings | Passages | Difficulty range | Transfer range | Evidence basis | Eligibility | Review status | Teaching support |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Direct Retrieval (English Reading) | `wave1-fam-direct-retrieval` | English | question_family | RC-01 / QT-RC-01 | `wave1-fam-direct-retrieval` | 14 | 14 (all Wave 1+2 passages) | medium (11) / hard (3) | ROUTINE ×14 | Direct reading, CSSE-003/005/008/013 (Level A, Founder-Accepted) | provisional | pending_independent_review (target registered, migration 038) | GUIDED STRATEGY (exam-hint only) + LIGHTWEIGHT instructional Guided Practice scaffold |
| 2 | Word Meaning in Context — Synonym Battery (English Vocabulary) | `wave1-fam-synonym-battery` | English | question_family | RC-03 / QT-RC-04 | `wave1-fam-synonym-battery` | 11 | 11 | medium (8) / hard (3) | NEAR_TRANSFER ×11 | CSSE-003/005/008/013 | provisional | pending_independent_review (target registered, migration 038) | GUIDED STRATEGY + LIGHTWEIGHT instructional Guided Practice; real post-attempt `VOCABULARY_CONTEXT_ERROR` remediation |
| 3 | Emotion and Cause Inference (English Reading) | `wave1-fam-emotion-cause` | English | question_family | RC-02 / QT-RC-08 | `wave1-fam-emotion-cause` | 11 | 11 | medium (8) / hard (3) | FAR_TRANSFER ×11 | CSSE-003/005/008/013 | provisional | pending_independent_review (target registered, migration 038) | LIGHTWEIGHT MODEL (exam-hint only) + LIGHTWEIGHT instructional Guided Practice scaffold (corrected in 007H Part 7, see below) |
| 4 | Triangle Classification by Angle (Mathematics Geometry) | `mr03-classify` | Mathematics | question_family | MR-03 / QT-MR-07 | `mr03-classify` | 3 | 1 (`wave2-mr03-classify`, deterministic generator, not a reading passage) | medium ×3 | ROUTINE ×3 | CSSE-006 Q7/Q12, CSSE-011 Q12/Q17, CSSE-016 Q11 | provisional | pending_independent_review (target registered, migration 038/041) | No dedicated Guided Practice mechanic (Mathematics has none project-wide); `workingSteps` array is the only worked-example support |
| 5 | Proportional Reasoning — Far-Transfer Percentages (Mathematics) | `mr04-far-percent` | Mathematics | question_family | MR-04 / QT-MR-04, supporting MR-01 | `mr04-far-percent` | 3 | 1 (`wave2-mr04-far-percent`) | medium ×3 | FAR_TRANSFER ×3 | CSSE-006 Q1/Q13, CSSE-011 Q1/Q2/Q3, CSSE-016 Q1/Q2 | provisional | pending_independent_review (target registered, migration 038/041) | No dedicated Guided Practice mechanic; `workingSteps` only |
| 6 | Simultaneous Divisibility Constraints (Mathematics Number Properties) | `mr04-mixed-divisibility` | Mathematics | question_family | MR-04 / QT-MR-13, supporting MR-05 | `mr04-mixed-divisibility` | 3 | 1 (`wave2-mr04-mixed-divisibility`) | medium ×3 | MIXED_TRANSFER ×3 | CSSE-006, CSSE-016 | provisional | pending_independent_review (target registered, migration 038/041) | No dedicated Guided Practice mechanic; `workingSteps` only |

**Totals:** 6 targets (3 English families, 3 Mathematics families). **45 questions** (36 English + 9 Mathematics). **0 passages selected as independent targets** (see rationale above and deferred list below — this batch's families do not carry the passage-promotion dependency 007G established for `two-character`/`multiselect`).

### Expected learner-ready benefit per target

1. **`wave1-fam-direct-retrieval`** — takes `QT-RC-01` from 1 practice-eligible question (a single legacy singleton) to 14 real, evidence-grounded questions across 14 different passages. This is the single largest supply increase in the batch.
2. **`wave1-fam-synonym-battery`** — closes `QT-RC-04` from **zero** practice-eligible supply to 11 questions. The only English skill currently absent from learner-ready practice entirely.
3. **`wave1-fam-emotion-cause`** — takes `QT-RC-08` from 1 practice-eligible question to 11. Its Guided Practice mapping was found, during this session's Part 7 automated validation, to be misconfigured (see "Corrections made during Part 7 validation" below) and has been fixed to an honest instructional scaffold before being offered for review.
4. **`mr03-classify`** — adds a second Mathematics family to `QT-MR-07`, which currently has real depth (7 practice-eligible questions) but from only one family (`mr03-angle-sum`); a learner currently sees only one problem *shape* for this competency no matter how many times they practise it.
5. **`mr04-far-percent`** — the current `QT-MR-04` practice-eligible supply is functionally one item (the same percentages problem shown three times in guided/independent/retry mode, `learn-mth-percentages`). This adds 3 genuinely distinct FAR_TRANSFER percentage problems.
6. **`mr04-mixed-divisibility`** — closes `QT-MR-13` from zero practice-eligible supply to 3 questions; also the only currently-provisional Mathematics family combining two supporting competencies (MR-04 + MR-05) in one item, adding a distinct transfer type (MIXED_TRANSFER) the two `far-percent`/`classify` additions don't.

---

## 3. What was deliberately NOT selected, and why

| Content | Why deferred |
|---|---|
| `wave1-fam-tick-justify` (English, QT-RC-02, 11 questions) | Shares its competency with `wave1-fam-quote-explain`, already activated in 007G (13 questions live). Real value for depth/format variety, but does not close a supply gap the way the 3 selected families do. First candidate for Batch 3. |
| 14 English Wave 1/2 passages (still `provisional` as their own `ali_passage_bank` row) | Not required as companion targets for this batch's 3 families — none of them is a passage-*specific* structural family (contrast `two-character`/`multiselect`, which did require `wave2-eng-surprise`'s passage promotion alongside them in migration 055). Passage-level review remains open and unaffected by this batch; a future batch touching `two-character`-shaped or `multiselect`-shaped content would need to select specific passages alongside the family. |
| Mathematics C2, 16 families (`mr02-sum-difference` through `mr04-best-value`, 67 questions) | Each already has a registered `ali_family_review` target (migration 053), so the "no target registered" governance gap 007D found is closed — but none has a prepared review pack with representative/easy/hard exemplars the way the C1 four families and English families do. Selecting them now would mean asking the Founder to review raw database rows with no worked-through evidence trail, which Part 4 explicitly prohibits. Recommended next step (matching 007D's own recommendation): a review-pack authoring pass over these 16 families, *not* independent review directly, before they can be a future batch. |
| 5 ungrouped Mathematics rows with no `family_id` (`mth-003` through `mth-007b`) + 1 ungrouped Writing row (`wrt-003`) | Cannot enter the review queue at all under the current schema — `ali_family_review.family_id` is `NOT NULL` (migration 034), and migration 053 explicitly declined to invent a placeholder family for them rather than misrepresent six unrelated singleton items as a coherent family. These need a genuine content-classification decision (assign to a real family, or formally confirm as legitimate standalone items) before any review target can honestly be created — a distinct, structural piece of work, not a review-readiness gap. |

---

## 4. Review-pack readiness (Part 4 fields, per target)

All 6 targets already have **A** (what this teaches), **C** (evidence basis, cited above and in the source packs), **K** (representative question), **Q** (misconception mapping — 100% populated per question, verified live this session), **R** (automated validation — PASS, see Part 7 automated-validation results in the 007H report), and **S/T** (originality/provenance — `angel_original`, manually cross-checked against every CSSE extract read to date; no copyright risk identified) already documented to the same standard 007G's activated targets met.

Two fields are genuinely thinner for this batch than for 007G's targets, disclosed rather than hidden:

- **L/N (easiest / boundary question):** `mr04-far-percent` and `mr04-mixed-divisibility` have no authored "easy" difficulty variant — all 3 siblings in each family are `medium`. This is an existing, disclosed limitation from when these families were first authored (`MATHEMATICS_WAVE2_REVIEW_PACKS.md`), not something 007H introduced or hid. `mr03-classify`'s easiest variant (`mr03-cls-01`, 60°/60°/60°) and hardest (`mr03-cls-03`, 80°/60°/40°) are both present.
- **F/G (MODEL / Guided Practice) for the 3 Mathematics targets:** Angel has **no Mathematics Guided Practice mechanic anywhere in the codebase** (`lib/learningEngine/guidedPractice.ts` is keyed entirely by English family IDs) and no dedicated MODEL walkthrough component distinct from the per-question `workingSteps` array shown as the post-answer explanation. This is a genuine, project-wide gap, not specific to these 3 families — every currently-practice-eligible Mathematics family has the same limitation. Recorded here so the reviewer sees it plainly rather than assuming parity with English's scaffolding.

Representative/easiest/hardest exemplars (field K/L/M) for the batch, pulled from live production content this session:

- **`wave1-fam-direct-retrieval`** — representative: `w1-lastbus-01` ("What went wrong for the narrator right at the start of the passage?"); hardest: `w2-pianorecital-01` (requires locating a single four-word quoted phrase, `diff=hard`); no `easy` variant exists in this family (disclosed).
- **`wave1-fam-synonym-battery`** — representative: `w1-lastbus-03`; hardest: `w1-atticdoor-03`/`w2-understudy-03`/`w2-pianorecital-03` (all `diff=hard`, each requiring a synonym for a specific in-context sense, e.g. "mournful" vs. the surface-similar "morning"); no `easy` variant exists (disclosed).
- **`wave1-fam-emotion-cause`** — representative: `w1-kitemaker-07`; hardest: `w1-atticdoor-07` (requires distinguishing anticipation from fear in the passage's final sentence); no `easy` variant exists (disclosed).
- **`mr03-classify`** — representative: `mr03-cls-02` (90°/45°/45° → isosceles); easiest: `mr03-cls-01` (60°/60°/60°, immediately recognisable); hardest: `mr03-cls-03` (80°/60°/40°, requires actively ruling out both other categories).
- **`mr04-far-percent`** — representative: `mr04-far-01` (£20→£15 book, apply to £60 jacket); hardest: `mr04-far-03` (ratio 5/8, least "nice" of the three).
- **`mr04-mixed-divisibility`** — representative: `mr04-mix-01` (95, groups of 6/5); hardest: `mr04-mix-03` (wider 145–160 search range, less obviously "round" group sizes 6/8).

Every question in all 6 families carries a populated, question-specific `addresses_misconception` field (field Q) — spot-checked in full this session, 0 unpopulated.

**Conclusion: review-pack readiness is MET for all 6 targets**, with the two disclosed limitations above (both pre-existing, both honestly documented in their original source packs, neither hidden by this selection).

---

## 5. Part 7 automated validation results

Run independently this session against live production data (`scripts/007h-part7-validation.mjs`), re-fetched fresh rather than reused from earlier in this document. 74 individual checks across all 45 candidate questions: duplicate-ID detection (within batch and against the full 264-row corpus), duplicate question-text detection, family-membership consistency, `active`/`provenance`/`content_version`/`eligibility_status` consistency, misconception-field population, and answer-contract shape per `question_type`. **All 74 pass.**

Went further than schema-shape checking for the 3 Mathematics families: independently re-derived every stored answer from its question's own stated parameters, rather than trusting the generator's self-assertion.

- `mr03-classify`: recomputed each triangle's classification from its three angles (verifying they sum to 180 first). All 3 match the stored answer.
- `mr04-far-percent`: recomputed the proportional relationship independently for all 3 variants. All 3 match the stored answer, and all 3 confirm a whole-number result (no rounding masking an error).
- `mr04-mixed-divisibility`: exhaustively searched each stated range for numbers satisfying both conditions. All 3 confirm exactly one candidate exists (the uniqueness the family's design depends on) and it matches the stored answer.

**Correction made during Part 7 validation (found and fixed, not part of any human review):** while checking quotation integrity, an attempt to verify `wave1-fam-emotion-cause`'s quoted evidence against its passage text led to discovering that this family's Guided Practice mapping in `lib/learningEngine/guidedPractice.ts` was set to `"staged-quotation"`, the same live scaffold as `wave1-fam-quote-explain`. That scaffold's "Check my quotation" button reads `prompt.quotationRequired` directly in the live Practice page. Every one of the 11 `wave1-fam-emotion-cause` rows has `quotationRequired: undefined`; the family is actually graded as `TIER5_NAMED_COMPONENT_PLUS_EXPLANATION` against `prompt.acceptedAnswers` (a curated emotion-word list), never against a verbatim quotation. The practical effect: for any learner who reached Guided Practice on this family, clicking "Check my quotation" was mathematically guaranteed to report "Angel couldn't find the exact words yet," regardless of what they typed, including a fully correct answer. `ENGLISH_WAVE2_MODEL_COVERAGE_AUDIT_V1.md`'s claim that this family "reuses the same verified mechanic as `quote-explain`" was therefore incorrect.

This is an engineering/content-integrity defect, not an educational judgement call, so it was fixed directly: the family's scaffold is now `"locate-instruction"` (the same honest, already-established fallback used by `direct-retrieval`/`synonym-battery`), with its own family-specific instruction text. Re-verified: 197/197 tests pass (unchanged count, no test asserted the specific broken scaffold kind), clean `tsc --noEmit`, clean Copy Quality Guard (229 files), clean production build. This correction is recorded here and in the code's own comment, not presented as, or substituted for, the independent human review this family still requires.

A secondary, lower-severity finding from the same check: 6 of 12 single-quoted phrases inside `emotion-cause`'s `modelAnswer` text did not literal-match their passage verbatim. On inspection: 3 were artifacts of a naive quote-pairing regex (possessives like "Grandad's" and adjacent quote pairs, not real quotation claims), 1 used an authored ellipsis to elide two genuine fragments, 1 (`w1-raceday-07`) is a case-sensitivity mismatch of the same already-disclosed class noted in `ENGLISH_WAVE2_REVIEW_PACKS.md`, and 1 (`w1-lastbus-07`, "gives permission" vs. the passage's "given permission") is a paraphrase styled with quote marks. None of these affect grading: `modelAnswer` is reviewer/learner-facing explanatory prose, not a field any scoring path reads. Disclosed for completeness, not treated as blocking.
