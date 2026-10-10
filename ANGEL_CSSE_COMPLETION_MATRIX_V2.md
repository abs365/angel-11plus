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

## Priority 2 — mastery semantics (inc 5)

Principle: mastery is evidence of the skill, not memory of a question or family. The strongest evidence already in the
architecture is used; no new threshold was invented — the existing per-question independent-session threshold
(`mastery_threshold`, independent attempts only) is unchanged, and the new rule only widens *where* it must be met.

| Layer | Rule | Source |
|---|---|---|
| Question | threshold distinct **independent** sessions, supported-correct never counts | `lib/ali/mastery.ts` (unchanged) |
| Competency **validated** | threshold met in ≥2 question families (multi-family pool); single-family pool needs ≥2 distinct **skeletons** (normalised stem, numbers → `#`); pool that cannot offer two structures stays **developing** | `lib/ali/masteryValidation.ts` + `normaliseStemForNearDuplicateCheck` (existing) |
| Competency **durable** | `validated` + survived a ≥14-day maintenance review + transfer corroboration where a link exists | `lib/ali/durableMastery.ts` (unchanged; inherits the stronger `validated`) |
| Labels | unvalidated "mastered" already surfaces as *reinforcing* (provisional); validated as *mastered*; durable as *durably mastered* | `lib/ali/educationalState.ts` (unchanged) |
| Writing | excluded: always supported tier | unchanged |

Result type now exposes `grade` (none / developing / validated) and the breadth used. Live-data blast radius (read-only
query, all profiles incl. test accounts): of 16 learner×competency masteries, 10 meet the breadth rule and 6 would
show as developing instead — the intended correction. Not changed (and why): "unfamiliar transfer" and "delayed
retrieval" are already conditions of *durable* mastery rather than of *validated*, so they were not duplicated.

## Priority 3 — structural diversity and content growth (inc 6: package PREPARED, not applied)

Correction to my earlier reading: the "5–10 skeletons in a 40-item family" were mostly the family's real **blueprints**
(e.g. `mr04-compound-percentage`: 7 blueprints × ~6 variants). Structure by *demand* was real; what was absent is
*context* (one `contextTag` per family) and *representation* (prose only), and for number theory / arithmetic the
skills were only ever asked as bare computation. That is the gap this increment targets, in the three highest-volume
families whose context was uniformly bare:

| Family | New blueprints (all additive; existing blueprints untouched) | New demand |
|---|---|---|
| `mr05-factors-primes` (QT-MR-11) | HCF equal groups; LCM repeating events; smallest common multiple above a boundary; identify the one prime among disguised composites | translate a situation to HCF/LCM; boundary condition; classify from a list |
| `mr02-nth-term` (QT-MR-05) | pattern in context (matchsticks / tiles / chairs); first term exceeding a target; whole periods to reach a target (round **up**) | interpretation; threshold; rounding up |
| `mr01-whole-number-computation` (QT-MR-01) | containers needed (remainder → +1); change from a note; spend then share equally | interpret a remainder; two-step order |

Evidence: 10 new blueprints (4 + 3 + 3), each with a named misconception; answers derived deterministically and **re-derived in tests by
independent brute-force oracles** (simulation/scan, not the blueprint's own formula); family batch validation and diversity
gates pass (new-batch memorisation risk MEDIUM, dominance ≤ 0.33, 0 parameter-signature duplicates); 140 candidates with
deterministic stable ids (`csse-ctx-<blueprint>-NN`), difficulty mix skewed to medium/hard (no easy for mr01/mr02 — those
families already hold easy items). Representation is still prose: no table/chart renderer exists in Practice, and none
was invented — a renderer is a separate product decision.

Not touched: Mock (`mockEligible: false` on every blueprint). Nothing submitted, approved or published.

**Founder action to apply (in order):**
1. Read `scripts/output/csse-context-expansion/review-sheet.md` (all 140 items, plain text; sample at least one per blueprint).
2. Sign in as the admin in the browser, open DevTools → Console on any app page, paste `scripts/output/csse-context-expansion/submit-console-script.js`
   (submits only; candidates stay `pending_review` / `unpublished`).
3. Review/approve at `/admin-beta/question-factory`, then publish through the existing governed publication step.
4. Report any item you reject and why; rejections feed back into the blueprint, not into hand edits.

Effect when published: practice-eligible 901 → 1,041 (the first step toward 1,200 — the milestone is a direction, not a target to rush).

## Side finding — stored Maths `explanation` text (closed, no cleanup needed)

- Most `angel_original` and unlabelled-provenance rows (practice-eligible: English 139, Maths 190, Writing 6; more in Mock/reserve) store a **developer/author note** in `ali_question_bank.explanation` (increment, wave, "Assessment Brain", generation script). `lib/adminReview.ts` documents this field as the author's own per-question note.
- It does **not** reach a CSSE learner surface: the Practice page's `explanation` is the *session selection reason* (`SessionActivity.explanation`), not the bank field; no CSSE page renders `BankQuestion.explanation`. The only code that renders it (`ReasoningSession`, adaptive GL/Vocabulary mocks) serves pathways with **no active rows** in the bank.
- Verdict: intentionally internal metadata, not misstored learner content; no learner exposure today. Guard to keep: do not render `BankQuestion.explanation` on any CSSE learner surface without first replacing it with learner-facing text. (The 76 empty-explanation English items are a separate matter, fixed in inc 2.)

## Priority 4 — Continuous Writing (inc 7: package PREPARED, not applied)

| Gap | What was prepared | Status |
|---|---|---|
| 8 practice prompts (7 reflective, 1 picture) | **7 new candidates:** 4 reflective/discursive (`proudofother`, `onefriendmany`, `tradition`, `wintakepart`) and 3 picture-led narratives (`The Station Clock`, `The Last Bus`, `After Closing Time`), each picture an original SVG with five named story footholds visible in its alt text. Topics checked distinct from every Practice/Mock/reserve Writing topic. | Migration `268_csse_writing_expansion_candidates_pending_review.sql` (candidates only, NOT APPLIED); promotion template `scripts/output/csse-writing-expansion/269_promotion_TEMPLATE.sql` (all ids commented out; refuses unreviewed or Mock-exposed rows) |
| Skills to teach: task interpretation, ideas, structure, vocabulary, sentence construction, grammar, punctuation, spelling, revision | `WRITING_CRAFT_CHECKS` (9 checks, mapped to the existing 5 rubric dimensions, shown with the worked model before submitting) | **Live in code** |
| Revision from feedback | **Not built.** Practice Writing is a single submission; rewriting after AI feedback changes what counts as an attempt and needs a product decision. Revision *before* submitting is covered. | Open decision |
| Human calibration | `ANGEL_WRITING_HUMAN_CALIBRATION_PROTOCOL.md` (sample, two independent readers, measures, proposed thresholds). No calibration run; no result claimed. AI evidence stays supported tier and out of mastery. | Needs Founder/readers |

Resulting Writing supply if all 7 are approved: 15 practice prompts (11 reflective, 4 picture-led). Picture-led depth remains the thinner genre and
depends on illustration capacity; the three drawings are drafts for **Founder visual and educational review** (the Riverboat rule applies: reject if there is "nothing to write with the picture").

**Founder action:** (1) deploy (so the SVGs are live), (2) apply migration 268, (3) review each family at `/admin-beta/review` (looking at the pictures), recording a decision per family, (4) copy the template to `supabase/migrations/269_…`, uncomment only approved ids, apply.

## Priority 5 — assessment and Mock depth (inc 8: analysis and plan; nothing authored)

See `ANGEL_CSSE_ASSESSMENT_SUPPLY_PLAN.md`. Headline, from live data: one protected full form per paper; a second Maths form is short by
at least 28 items per-skill (38 spare/reserve items against 56 needed, 17 of them unreviewed), the first Maths form has no MR-08/MR-12/MR-14,
English has five reserve passages (40 questions) that could plausibly form Form B after independent validation, and there is no usable
picture-led Writing prompt for a second Mock (the only reserve picture is the rejected Riverboat). Mock-grade content was deliberately
not generated: an unreviewed item in a sealed form silently distorts measurement.

## Exit criteria status (as of this document)

| # | Criterion | Status |
|---|---|---|
| 1 | Competency coverage complete and evidence-mapped | **Mapped** (this matrix); none COMPLETE overall yet |
| 2 | Important competencies have credible teaching/remediation routes | **Largely met** in code (worked-method 36/37, strategy 17/17, worked example 15/17, ladder live); needs Founder acceptance of the ladder |
| 3 | English teaching/content depth mature | **Partial** (wrong-answer reveal done; 2 worked examples and passage variety open) |
| 4 | Maths has sufficient structural diversity | **In progress** (140 candidates prepared, unapplied; representation still prose) |
| 5 | Continuous Writing has mature practice depth | **In progress** (7 candidates prepared, unapplied; picture-led still the thin genre) |
| 6 | Mastery requires credible independent/transfer evidence | **Met in code** (breadth by family/skeleton; durable adds delay + transfer); unvalidated against outcomes |
| 7 | Retrieval/maintenance operational | **Capability exists** (14-day provisional review); learner evidence immature |
| 8 | Assessment depth supports progress measurement | **Not met** (one form per paper) |
| 9 | Protected Mock supply sufficient for the lifecycle | **Not met** (see supply plan) |
| 10 | Content supply on a governed path toward 1,200 → 2,000 → 3,000+ | **Started** (901 → 1,041 pending Founder application) |
| 11 | No known P0/P1 educational blocker | **None found** |
| 12 | Controlled-beta evidence collected without blocking improvements | **Yes** (Family #1 untouched) |

CSSE is therefore **not yet** ready to move from active completion to stable maintenance; the CSSE Pathway Completion Report is not issued.

## Continuation 2 (post Founder review)

| Item | Result |
|---|---|
| A. Remediation/mastery acceptance | `ANGEL_CSSE_FOUNDER_ACCEPTANCE_REMEDIATION_MASTERY.md` (test learner only; mastery acceptance = tests + natural use + read-only data re-check) |
| B. 140 Maths candidates | `ANGEL_CSSE_MATHS_CANDIDATES_EDUCATIONAL_REVIEW.md` (per blueprint: purpose, misconception, example, derivation, structural difference, context, difficulty, transfer, repetition risk). Still pending, not submitted. Recommendation: publish at most 8 of 14 `change-from-note` |
| C. Writing prompts review pack | `ANGEL_CSSE_WRITING_PROMPTS_FOUNDER_REVIEW_PACK.md` + `scripts/output/csse-writing-expansion/review-pack.html` (drawings embedded). Migration 268 still NOT applied |
| D. Representation | `ANGEL_CSSE_MATHEMATICAL_REPRESENTATION_GAP.md`. Reused the `prompt.stimulus` architecture; practice now renders table/chart/image; new bar-chart kind; 48 data-handling candidates prepared (pending) |
| Repo discipline | Committed HEAD verified green by `scripts/verify-clean-checkout.mjs` (install, tsc, build, 4,956 tests, 0 failures). The two failing test files exist only as **untracked local WIP** (`candidateStoreMapping`, `mr03CoordinateBlueprints`, dated 16 Sep), so main is not failing. Rule from here: explicit-path staging and `git diff --cached --stat` before every commit; use the clean-checkout script, not file-moving, for a green signal |

### E. Content expansion toward 1,200 (prepared, pending, nothing submitted)

| Set | Blueprints | Candidates | Targets |
|---|---|---|---|
| Context/structure (earlier) | 10 | 140 | MR-05 number theory in context, MR-02 sequences in context, MR-01 interpretation |
| Data handling (new, uses the table/bar-chart renderers) | 4 | 48 | QT-MR-09 (was 6 prose items) |
| Breadth (new) | 12 | 96 | QT-MR-14 precision (12 items), QT-MR-02 missing operand (4), QT-MR-03 measurement (5), QT-MR-10 time, QT-MR-05 rules, QT-MR-12 averages |
| **Total pending** | **26** | **284** | If all approved: 901 + 284 = **1,185** (short of 1,200 by design; no padding) |

Educational review: `ANGEL_CSSE_MATHS_CANDIDATES_EDUCATIONAL_REVIEW.md` (context set) and `ANGEL_CSSE_MATHS_EXPANSION_B_EDUCATIONAL_REVIEW.md` (data handling + breadth). Honest quality notes: every new family batch has exactly two structures, which the diversity gate rates HIGH (its own rule), so volumes are small and a third structure per family should precede scaling; the easy tier is thin in the new sets; 10 of 16 expansion-B blueprints use a table or chart the question genuinely needs. Not yet addressed: English supply (needs passages and validation) and picture-led Writing depth.

### F. English Form B supply (preparation only)
`ANGEL_CSSE_ENGLISH_FORM_B_SUPPLY_PLAN.md`. Five reserve passages reviewed. Recommended Form B: Compass Rose (narrative) + Salmon (informational), 18 questions / 31 marks against Form A's 22 / 39, so **6 sealed top-up items (8 marks) must be authored**. **Marking defect found:** Anning and Group Project mark free-text explanations as accepted-answer sets (9-13 accepted answers each), which must be repaired before any use. Salmon is a structure twin of the Timed Section's bee passage. Writing: Q1 from the independently validated reserve; **no usable picture-led Q2 exists**, so a sealed draft (`public/mock-assets/q2-picture-narrative/cornershop-v1.svg`) awaits visual approval. Nothing promoted, nothing activated.

### G. Mathematics Form B supply (preparation only)
`ANGEL_CSSE_MATHS_FORM_B_SUPPLY_PLAN.md`. Proposed Form B shape closes Form A's gaps (adds MR-08 x3, MR-12 x3, MR-14 x2). **32 of the 38 spare/reserve items are usable** (answers re-derived; a pre-review, not governed validation); **24 sealed items must be authored** (6 easy, 8 medium, 10 hard; largest need MR-04 x6). 6 items held for a Form C. Nothing promoted, nothing activated.

### H. Writing revision contract
`ANGEL_CSSE_WRITING_REVISION_CONTRACT.md`. Educational loop, hard rules (original immutable, revision linked and formative, never mastery, no improvement score, one revision per original, Mock excluded), and a two-tier design. **Tier 1 stores no child text** (a text-free evidence event) and is the recommended first increment; Tier 2 (storing writing) is a privacy decision and is not needed for the loop. Formative writing feedback is kept distinct from validated assessment / exam-readiness evidence throughout.

## Continuation 3 (Founder decisions A to J): outcome

| Item | Result |
|---|---|
| A. Approval pack | `ANGEL_CSSE_MATHS_BLUEPRINT_APPROVAL_PACK.md` (+ HTML). Governance: competency, family, blueprint, representative sample, deterministic validation, diversity check, failure and edge-case review, approval, publication. Now covers **380 candidates / 38 blueprints, 374 recommended** |
| B. Writing review pack | `ANGEL_CSSE_WRITING_PROMPTS_FOUNDER_REVIEW_PACK.md`. Later decision: the narrative pictures are **educational storyboards**; contracts in `ANGEL_CSSE_WRITING_NARRATIVE_ASSET_CONTRACTS.md`; nothing published |
| C. Coordinate grid | shared stimulus kind + renderer + validator; 5 blueprints (read, reflect in a drawn mirror, translate, fourth vertex, midpoint); 40 candidates; independent checks (generic transforms, diagonals bisect, equal steps) |
| D. Angle figures | shared stimulus kind + renderer + validator; 4 blueprints (triangle, straight line, around a point incl. reflex, isosceles with two equal unknowns); 32 candidates; a fifth blueprint was **rejected** (not distinct); every figure says "not drawn accurately" |
| E. Number line | justified by QT-MR-03 scale reading and QT-MR-14 rounding (both thin, prose-only); 3 blueprints; 24 candidates; exact thousandths arithmetic; independent checks (tick counting, subtraction, nearest-of-two) |
| F. English Form B | marking-contract repair for 8 explanation items (TIER2 to TIER5, manual); 2 Compass Rose fixes (Q5 wording the text does not support; Q2 accepted sets extended, though "the weathervane" was in fact already accepted); 6 sealed top-up items (8 marks) -> Form B reading 24 items / 39 marks; migration 271 **APPLIED and verified in production, do not rerun**; `ANGEL_CSSE_ENGLISH_FORM_B_COMPLETION.md` |
| G. Maths Form B | revalidation of 32 items (all answers re-derive; **one real marking defect**: `numberpyramid-02` instructed bracketed form marked wrong); 24 sealed items (6 easy / 8 medium / 10 hard) with 3 exact figures + 1 table; Form B = 56 items; migration 272 **APPLIED and verified in production, do not rerun**; `ANGEL_CSSE_MATHS_FORM_B_COMPLETION.md` |
| H. Writing revision (Tier 1) | implemented, Practice only, no child text stored, text-free event store off until migration 270 is applied and a flag is set; Mock cannot reach it |
| I. Calibration pack | `ANGEL_WRITING_CALIBRATION_PACK.md` + blank kit in `scripts/output/writing-calibration-pack/` + tested analysis measures; no calibration claimed |
| J. WIP resolution | `ANGEL_WIP_FILES_RESOLUTION.md`; all WIP classified, completed, integrated; clean checkout green |
| Founder acceptance | `ANGEL_CSSE_FOUNDER_ACCEPTANCE_REMEDIATION_MASTERY.md` Part 3 bundles the renderer check into the same session (after a small governed publish) |

### Maths representation coverage (live = deployed renderer; pending = candidates not yet submitted)
| Representation | Renderer | Pending candidates | Targets |
|---|---|---|---|
| Table | live | 24 (data handling) + timetable/function/mean tables (breadth) | QT-MR-09, -10, -05, -12 |
| Bar chart | live | 24 | QT-MR-09 |
| Coordinate grid | deployed | 40 | QT-MR-08 |
| Angle figure | deployed | 32 | QT-MR-07 |
| Number line | deployed | 24 | QT-MR-03, QT-MR-14 |
| Compound shape | live (earlier) | n/a | QT-MR-07 |
| Not yet: clock face, bar model, measurement diagram with ruler | none | none | not justified yet by thin competencies |

### Practice inventory
| | Count |
|---|---|
| **Currently live** (practice_eligible) | **901** (English 306, Maths 587, Writing 8) |
| **Pending approval** | Maths **380** candidates in 6 packages (374 recommended), Writing 7 prompts (migration 268) |
| **Projected if all Maths approved** | 901 + 380 = **1,281** (1,275 on the recommended set); with Writing 1,288 |
| Sealed Mock Form B (not Practice) | English top-up 6 items; Maths 24 items; Writing Q2 awaiting final artwork |

## Gate closure (after migrations 271 and 272 were applied and verified)

Applied and verified, no longer Founder actions or open correctness repairs: **migration 271** (English marking contract, Compass Rose fixes, six sealed items) and **migration 272** (`numberpyramid-02` repair, 24 sealed Maths items).
Both: **APPLIED, DO NOT RERUN** (`ANGEL_CSSE_GATE_CLOSURE_VERIFICATION.md`). **268 and 270 remain NOT AUTHORISED.**

**External unresolved specification:** the exact official comprehension/Writing mark split (not invented).

**Remaining CSSE completion gates (exactly these; none added):**
| # | Gate | State |
|---|---|---|
| 1 | Practice candidate governance and publication | 380 Maths candidates pending (374 recommended), approval pack ready; Writing prompts under gate 3 |
| 2 | Form B independent human validation | English (24 reading questions + Writing Q1/Q2) and Maths (56 items) validator packs prepared; Salmon replacement decision pending |
| 3 | Writing prompt approval and publication | 7 prompts pending (migration 268 not authorised) |
| 4 | Final Q2 production artwork | storyboards and contracts only; specialist pipeline to be selected |
| 5 | Writing human calibration evidence | kit ready, no thresholds, no claim |
| 6 | Founder production acceptance | script ready (remediation plus visual renderers) |

## Gate execution (Founder decisions of 2026-10-08, after verification of 271 and 272)

| Item | State |
|---|---|
| Salmon | **REJECTED AND REPLACED.** Preserved as evidence; `lib/ali/rejectedMockContent.ts` makes the Mock composer skip it and the manifest validator fail on it. Replacement: original passage **"The Great Stink"** (530 words), 11 questions, 18 marks (RC-01 x3, RC-02, RC-03, RC-04 x4, RC-06, RC-10). Form B reading = Compass Rose 13 questions / 21 marks + The Great Stink 11 / 18 = **24 questions, 39 marks**. Template migration 273 prepared, **NOT applied** (adds the sealed candidates and the passage review registration; records Salmon as rejected and deactivates it, deleting nothing) |
| Writing Q1 `screentime` | approved for human validation, **not** for activation; the validator pack carries the exact prompt and the six assessment points |
| Writing Q2 | specialist artwork route confirmed; storyboards only; not activated until final artwork has human visual and educational approval |
| Writing calibration | adjudication rule approved: Reader 1 + Reader 2, and independent Reader 3 where they differ on any dimension; every judgement preserved; no thresholds; no calibration claim |
| Marking robustness | coordinate normaliser (live in Practice on deploy; Mock scorer via migration **274, APPLIED and verified 2026-10-10**) and safe ordered-list separators (live on deploy, Practice and Mock Reading); Compass Rose accepted-answer semantics deliberately untouched, left to the English validator. `ANGEL_CSSE_MARKING_ROBUSTNESS.md` |
| Practice candidates | `ANGEL_CSSE_MATHS_PRACTICE_FINAL_DECISION_PACK.md`: 380 prepared, **all 380 re-verified from their own parameters**, **374 recommended** (37 blueprints APPROVE, 1 TRIM, 0 REVISE, 0 REJECT); the 6 not recommended are all from `mr01-bp-change-from-note`; risks preserved per family; publication package and runbook prepared, **nothing submitted or published**. Projected inventory 901 to **1,275** |
| Validator packs | English (13 Compass + 11 Great Stink + Writing Q1 and Q2) and Maths (56 items) regenerated; self-contained, no code access; APPROVE / REVISE / REJECT plus comments per item |
| Migrations | **268 and 270 NOT AUTHORISED.** 273 and 274 APPLIED and verified (DO NOT RERUN) |

Gate states (six, none added): (1) Practice governance and publication: final decision pack and publication package ready, awaiting Founder authorisation; (2) Form B human validation: packs ready, awaiting validators; (3) Writing prompt approval and publication: pending (268 not authorised); (4) final Q2 artwork: specialist provider to be selected; (5) calibration evidence: kit ready, no readers yet; (6) Founder production acceptance: after the relevant content is live.
