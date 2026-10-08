# ANGEL 11+ — EI003 WAVE 3 PRODUCTION ACCEPTANCE AND EDUCATIONAL LONGEVITY REPORT

Date: 2026-09-09
Scope: Controlled candidate-store submission, publication, and full acceptance verification of the frozen 32-candidate Wave 3 English manifest (commit `d75fe42`), plus the Educational Longevity Position required after closure.

---

## A. Candidate-store submission

All 32 candidates submitted via `submit_question_candidate()` only, in 4 bounded batches of 8 (by family), from an authenticated admin session (`the Founder admin account`, confirmed `is_current_user_admin()=true`).

| Batch | Attempted | Succeeded | Failed |
|---|---|---|---|
| retrieval | 8 | 8 | 0 |
| comparative-extraction | 8 | 8 | 0 |
| motive-inference | 8 | 8 | 0 |
| effect-of-language | 8 | 8 | 0 |
| **Total** | **32** | **32** | **0** |

0 retries needed. `p_question_content` for every candidate embedded `marks`, `modelAnswer`, `acceptedAnswers`, `validationTier: "TIER2_ACCEPTED_SET"` from the start — the exact fields Wave 2's own payload builder omitted, causing Incidents A and B.

Pre-submission: manifest reconciled once (32 unique candidate IDs, valid family/blueprint/passage relationships), collision-checked against the live candidate store and question bank (0 candidate collisions, 0 bank collisions).

## B. Stored manifest reconciliation

Fetched live from `ali_question_candidate` after submission:

- 32/32 candidates present (0 missing)
- 32/32 `review_status = 'pending_review'`
- 32/32 `publication_status = 'unpublished'` (0 prematurely published)
- Family split: 8/8/8/8 (motive-inference, comparative-extraction, effect-of-language, retrieval)
- Blueprint split: 16/16 blueprints, exactly 2 candidates each
- 32/32 valid `passage_id` relationships (0 missing)
- 0 candidates with any marking-critical field (`marks`, `modelAnswer`, `acceptedAnswers`, `validationTier`) missing or stripped by the store

## C. Stored marking-contract verification (the most important technical acceptance check)

Source validity is not enough — this check reconstructs and exercises each **stored** candidate's marking contract (fetched live from `ali_question_candidate` *after* submission, not the local library files) against the real, imported production scoring functions (`validateEnglishMarkingContract` / `scoreEnglishComprehensionAnswer`, never a reimplementation).

Result: **32/32 PASS.** Canonical answer → full marks for every candidate; every approved variant → full marks; a programmatically-verified-disjoint wrong answer → zero marks; 0 NaN anywhere. No required field was stripped or altered by the candidate-store round trip.

(Script: `scripts/verify-ei003-wave3-stored-marking-contract-roundtrip.mjs`, input `scripts/output/ei003-wave3-stored-rows.json`, both local/uncommitted per §15.)

## D. Representative plausible-wrong check

6 hand-picked, genuinely plausible-but-incorrect answers were run through the same real scorer, covering all 4 families/contract types:

- Retrieval: "the girl with the long plait" (nearby distractor person) → 0 marks. "cass" (nearby distractor runner) → 0 marks.
- Comparative: a one-sided answer naming only a similarity, no difference → 0 marks.
- Motive: "connor made an unkind comment" (an unsupported motive the text never states) → 0 marks. "he is deliberately testing her" (rejected weighing) → 0 marks.
- Language: "'went' would work just as well" (the rejected alternative itself) → 0 marks.

All 6 correctly scored zero. No systematic false-positive found — no revision required.

## E. Human review

Conducted via `review_question_candidate()` after a genuine qualitative read of all 32 candidates' full content (question, evidence quotes, accepted/model answers, explanation guidance, blueprint fidelity) — not merely because automation passed.

Findings: clarity, passage grounding, age-appropriateness, and blueprint fidelity were all sound across all 32. Blueprint fidelity was checked individually against each of the 16 blueprints' stated demand (e.g. `ei003-w3-bp-comp-simdiff` genuinely requires both a similarity AND a difference, each independently evidenced — confirmed, not assumed). One minor cosmetic observation: the evidence-quote fragment for `ei003-w3-comp-simdiff-02` ("...without moving the cap") reads awkwardly out of context as a bare quotation fragment, though it is a confirmed exact substring of the real passage and does not appear in any learner-facing surface (only `explanationGuidance`, which is complete and clear, is learner-facing) — non-blocking, not a rejection reason.

**Decision: 32 approved, 0 held, 0 rejected.**

## F. Publication

Published via `publish_question_candidate()` in the same 4 family-grouped batches. All 32 succeeded (0 failures, 0 systematic issue encountered — no STOP condition triggered).

| Batch | Attempted | Succeeded | Failed |
|---|---|---|---|
| retrieval | 8 | 8 | 0 |
| comparative-extraction | 8 | 8 | 0 |
| motive-inference | 8 | 8 | 0 |
| effect-of-language | 8 | 8 | 0 |
| **Total** | **32** | **32** | **0** |

## G. Production inventory delta

- Production bank total: **1110** rows (post-publication)
- Rows with id `qf-ei003-w3-*`: exactly **32** (the precise, actual Wave 3 delta — not assumed, counted directly)
- All 32 confirmed `subject = 'english'`
- All 32 confirmed `active = true`, `eligibility_status = 'practice_eligible'`

## H. Family / blueprint / passage reconciliation

Per-family total counts (existing + new), cross-checked against each family file's own documented pre-existing baseline:

| Family | Total in bank | New (Wave 3) | Pre-existing (per source comment) | Match |
|---|---|---|---|---|
| wave1-fam-motive-inference | 12 | 8 | 4 | ✓ |
| wave1-fam-comparative-extraction | 12 | 8 | 4 | ✓ |
| wave1-fam-effect-of-language | 12 | 8 | 4 | ✓ |
| wave3-fam-rc01-retrieval | 13 | 8 | 5 | ✓ |

All 4 match the source files' own documented pre-existing baselines exactly — an independent cross-check that the delta accounting is correct.

**0 Mock leakage**: no `ali_mock_question_bank`-style table exists to leak into (probed, 404); all 9 distinct passages actually used by the 32 published rows carry `eligibility_status = 'provisional'` (the Practice-eligible track), not a Mock-governance-track status — and `publish_question_candidate()` itself structurally refuses to publish against a Mock-reserved passage, which the 32/32 publish success rate already proves by construction.

## I. Production correct-answer verification

Fetched live from `ali_question_bank` for all 32 published rows (post-publish, including the `passageText`/`passageTitle` merge) and re-run against the real scorer: **32/32 PASS.** Canonical → full marks for every candidate, 0 NaN. This proves the publish-time merge did not disturb any marking-critical field.

(Script: `scripts/verify-ei003-wave3-production-marking-contract.mjs`, input `scripts/output/ei003-wave3-published-rows.json`.)

## J. Production wrong-answer verification

Same production-fetched rows, same 6 representative plausible-wrong answers as §D, re-run against the actually-published data: all 6 correctly scored zero. Disjoint-wrong answers (programmatically verified to share zero keywords/substrings with any accepted answer) also scored zero for all 32.

## K. Real learner evidence

Attempted via the legitimate, non-admin Reading Comprehension Practice path (`/learning-intelligence/practice/reading-comprehension`, adaptively-selected question pool — no manipulated history, no forced question ID).

- Session 1 (8 questions): none of the 8 adaptively-selected questions were from the new 32-candidate pool, though 3 of our shared passages (New Girl, A Letter to Nana, Race Day) appeared with their own pre-existing (non-Wave-3) questions, confirming the shared-passage strategy is live in the real selection pool.
- Session 2 (8 questions): question 5 was an **exact match** to `ei003-w3-ret-combine-02` ("Name two separate things Marcus does to get into the attic before he reaches the trunk"). Submitted the canonical accepted answer through the real UI → **marked "Correct", full marks (1/1)**, matching the model answer exactly. This is genuine, unmanipulated, real-learner-path confirmation for the retrieval family, end to end (candidate → published row → real Practice UI → real scorer → correct feedback).

**Honest disclosure**: across 2 bounded 8-question sessions (16 questions total), the comparative-extraction, motive-inference, and effect-of-language families were not randomly surfaced by the adaptive selector. This is expected, not concerning — 32 new rows sit inside a 1110-row bank (≈2.9% per draw), so the odds of a random 16-question sample hitting all 4 new families are low. Deterministic evidence (§C, §I, §J — all 32 rows, all 4 families, verified against the real production scorer both stored and post-publish) is the primary and sufficient proof of correctness for the 3 families the browser session did not happen to surface; the retrieval-family real-learner confirmation demonstrates the full pipeline genuinely works end to end for at least one family, and there is no structural reason (family selection is not gated by family_id) the other 3 would behave differently.

## L. Teaching evidence

Verified via code path, not by reopening architecture: `app/learning-intelligence/practice/[area]/page.tsx` calls `getExamStrategyHint(familyId)` and `getWorkedExample(familyId)` directly, rendering the "Show a tip for this kind of question" / "See a worked example" controls I personally observed and used live during the §K walkthrough (both controls appeared across every question in both sessions). `lib/learningEngine/englishExamStrategies.ts` carries `ENGLISH_FAMILY_EXAM_STRATEGY` and `ENGLISH_FAMILY_WORKED_EXAMPLE` entries for all 4 Wave 3 family IDs (confirmed via source grep). The dedicated Wave 3 test suite (`tests/lib/learningEngine/englishExamStrategiesWave3.test.ts`, 6 assertions) passes, including the specific check that retrieval and comparative-extraction share the Founder-specified five-step model and that motive-inference / effect-of-language each carry their own distinct model. Reachable through the legitimate Teaching Engine path; architecture unchanged.

## M. Mock isolation

0 Mock leakage (detailed in §H). No Mock-track table exists for these rows to reach; the publish function's own passage-eligibility gate structurally enforces this, and the 100% publish success rate is itself proof no candidate ever touched a Mock-reserved passage.

## N. Anti-memorisation position

- 9 distinct passages used across the 32 new candidates (top-two combined 34.4%, largest single passage 18.75% — measured in the pre-submission analysis, unchanged by this phase).
- Per-family total depth is now 12-13 questions (was 4-5 pre-Wave-3) — real, meaningful depth added, not just volume.
- Blueprint depth: 16 distinct blueprints × 2 candidates each — every blueprint genuinely distinct in reasoning demand (verified by direct read in §E), not a mechanical restatement of Wave 2's pattern.
- Structural distinction confirmed by direct reading: e.g. retrieval's 4 blueprints require genuinely different skills (single fact / distractor discrimination / combining two facts / searching across intervening text), not variations of the same lookup.

**Honest residual risk**: 12-13 questions per family, while a real improvement, is still a modest pool for a determined learner doing many repeated practice cycles — this is depth added, not permanent immunity to memorisation. It should not be read as "these 4 families are now permanently solved."

## O. Factory safety-lifecycle proof

This wave built and then genuinely exercised a full lifecycle safety gate: **created → validated (source) → submitted → validated (stored, §C) → reviewed → published → validated (production, §I/§J) → delivered to a real learner (§K, retrieval family)**. Every stage used the real, imported production scoring function — never a reimplementation — and every stage's data was fetched live, not assumed. This is the first complete, end-to-end proof that the Wave 2 lesson ("source validity is not enough — stored/live validity must be proven separately") has been converted into a preventive Question Factory capability rather than a one-off fix: both Wave 2 incidents (missing marking fields; short-answer/LEGACY_HEURISTIC incompatibility) are exact regression cases in `englishMarkingContractGate.test.ts` and would have been caught before submission had they recurred here.

## P. Tests and repository status

- Full project test suite (`npm test`, the correct runner — not `vitest run`, which misapplies `node:test`-style files): **4261/4264 pass**. The 3 failures are the exact pre-existing, permanently-unrelated cases confirmed identical across every prior wave (`candidateStoreMapping.test.ts`, `mr03CoordinateBlueprints.test.ts`, `migration237PublishAnswerPersistenceCorrection.test.ts`) — untouched by this wave.
- `tsc --noEmit`: all errors confined to the same two pre-existing untracked files (`candidateStoreMapping.ts`, `mr03CoordinateBlueprints.ts`) — 0 errors in any file this wave touched or added.
- No source code was changed this phase (only data operations via governed RPCs, plus new local/uncommitted verification scripts). Per §15, **no new commit was created** — 0 bounded defects were found requiring correction. `d75fe42` remains the authoritative Wave 3 commit.

## Q. Material defects

**None found.** Every gate (§A-§L) passed cleanly on the first attempt with 0 systematic failures. One non-blocking cosmetic observation is recorded in §E (an evidence-quote fragment that reads awkwardly out of context but is not learner-facing and does not affect marking).

## R. FINAL WAVE 3 STATUS

**ANGEL EI003 WAVE 3: CLOSED.**

All closure conditions are met: 32/32 submitted, 32/32 reconciled, 32/32 stored-marking-contract-verified, 32/32 reviewed (32 approved), 32/32 published, exact +32 production delta confirmed, 32/32 production-marking-contract-verified, real-learner confirmation obtained for at least one family with the other 3 covered by equivalent deterministic production evidence, teaching path confirmed reachable, 0 Mock leakage, 0 material defects, full test suite and typecheck clean relative to this wave's own changes.

---

## S. Updated Educational Longevity Position

**Current production inventory** (live, `ali_question_bank`, post-Wave-3):

- Total questions: **1110**
- Practice-eligible + active: **900**
- By subject: English **407**, Maths **686**, Writing **17**
- Distinct question families: **62** (27 rows carry no `family_id` — legacy/ungrouped content)
- Families with ≥8 questions ("deep/healthy"): **29**
- Families with <8 questions ("thin/high-risk"): **33**, spanning from 7 down to single-digit and even 1-question families (several of the `eng-inc003-writing-*` rows sit at exactly 1)
- Teaching coverage: Reading Comprehension confirmed reachable with tip/worked-example scaffolding on essentially every question observed live; the 4 Wave 3 families now carry the Founder-specified five-step models.

**Largest remaining weaknesses**, in order of severity:

1. **Writing is critically thin** — 17 total questions against 407 English / 686 Maths. This is the single starkest imbalance in the whole bank and the clearest evidence-revealed gap, distinct from any planning assumption.
2. **33 of 62 families (53%) are thin** (<8 questions), several down to 1-3 — real memorisation exposure for a learner who practises repeatedly in those areas.
3. **27 questions carry no `family_id`** — these sit outside the family/blueprint depth-tracking model entirely and cannot currently benefit from the kind of teaching-strategy/worked-example scaffolding this wave relies on.
4. Unknown (not measured this wave): whether real learner performance history feeds back into what a learner is shown next (spaced repetition, weak-skill targeting) versus a flat/random draw from the eligible pool — this was outside this wave's bounded scope but is directly relevant to whether the existing 900-question pool is being used to its full effect.

**Estimated daily-use longevity**: for the 4 families this wave deepened, the platform can now support meaningfully more repeated practice before a learner starts recognising individual questions than before this wave (roughly 3x the prior depth in those 4 families). For the 33 thin families platform-wide, and Writing specifically, daily use over more than a few sessions risks real content exhaustion.

**Recommendation for next educational priority: (B) — learner / adaptive behaviour, not another content wave.**

Reasoning, not defaulting to "another content wave merely because EI003 has been a content programme": this wave's own work (§O) shows the platform now has both a hardened, self-defending content pipeline (Factory marking-safety gate, proven end to end) *and* a substantial existing pool (900 practice-eligible questions across 62 families). The open question this session's evidence surfaces most sharply is not "is there enough raw content" in the aggregate — it is whether that content is being *used* well: nothing verified this wave shows the real Practice session generator adapting to an individual learner's demonstrated weak areas versus drawing close to uniformly from the eligible pool. Standing project memory independently records that an adjacent adaptive-session capability (`Increment 021: Preparation Horizon Operationalisation` — real Practice session generation consuming difficulty lean/activity type) was already Founder-approved-with-amendment and is still awaiting Founder verification, not yet deployed — meaning this is a live, already-recognised open thread, not a manufactured one. Getting real learner performance data driving what a learner sees next would make every one of the 900 already-eligible questions work harder, independent of whether any single family is thin — whereas adding more content to already-thin families (a legitimate but narrower fix) would not by itself close that loop.

The two evidence-revealed content gaps (Writing at 17 questions; 33 thin families) are real and should not be ignored — but they are best treated as a bounded, targeted follow-up once the adaptive-behaviour question is resolved, not as the next full wave.

---

**STOP. No Wave 4 or further implementation programme has been started. This report is the final deliverable for this instruction.**
