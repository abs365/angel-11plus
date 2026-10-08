# ANGEL 11+ — EI003 WAVE 3 ENGLISH REASONING + MARKING SAFETY PRE-SUBMISSION REPORT

Status: marking-contract safety gate built and regression-proven against both real Wave 2 incidents; 32 candidates manufactured, deterministically validated, and gate-verified for the 4 authorised families. **Pre-publication stop — not submitted, not reviewed, not published.**

---

## A. Live four-family baseline

Queried directly from production immediately before design work began (not the stale EI003 planning numbers):

| Family | Real production count | Skill code | Marks convention | Difficulty spread (pre-Wave-3) | Blueprint depth | Teaching coverage |
|---|---|---|---|---|---|---|
| `wave3-fam-rc01-retrieval` | 5 | QT-RC-01 | 1 | `easy` only | 0 distinct blueprints | 0 |
| `wave1-fam-comparative-extraction` | 4 | QT-RC-07 | 2 | `medium` only | 0 distinct blueprints | 0 |
| `wave1-fam-motive-inference` | 4 | QT-RC-02 | 2 | `medium`/`hard` | 0 distinct blueprints | 0 |
| `wave1-fam-effect-of-language` | 4 | QT-RC-10 | 2 | `medium`/`hard` | 0 distinct blueprints | 0 |

All 17 existing rows confirmed `eligibility_status = 'practice_eligible'`, `validationTier = 'TIER2_ACCEPTED_SET'` already (these families were never affected by either Wave 2 incident — their own marking contracts were already complete and correct).

## B. Existing question/passage analysis

Every one of the 17 existing rows was read in full. Each family is a genuine single reasoning skeleton repeated with different passages/characters, exactly as previously reported:

- **Retrieval**: "locate one clearly-stated detail" — 5 questions, `easy` only, no distractor or combination demand.
- **Comparative-extraction**: "compare how [one character] feels/behaves at the start of the passage with the end" — all 4 existing rows use this identical shape (`w1-lastbus-09`, `w1-raceday-08`, `w1-letter-08`, `w1-newgirl-08`), 2 marks each.
- **Motive-inference**: "why does character X do/say Y" — all 4 existing rows (`w1-kitemaker-09`, `w1-newgirl-09`, `w1-atticdoor-09`, `w1-letter-09`), 2 marks each.
- **Effect-of-language**: "interpret one figurative comparison's effect" — all 4 existing rows (`w1-lastbus-08`, `w1-atticdoor-08`, `w1-kitemaker-08`, `w1-raceday-09`), 2 marks each.

Passages already in use across these 17 rows: 11 distinct, already-live `ali_passage_bank` entries (6 from Wave 1: The Kite Maker, The Last Bus, The New Girl, The Attic Door, Race Day, A Letter to Nana; 5 from the retrieval-specific pool: The Empty Classroom, Letter to Grandad, The Baker's Apprentice, The New Trainers, The Storm at the Harbour). No new passage was needed or authored — this pool already offers genuine variety.

Memorisation risk, pre-Wave-3: real, structural — each family's own single reasoning skeleton meant a learner weak-flagged on any of these 4 families would see the exact same question *shape* every time, varying only surface details.

## C. Wave 2 marking incident prevention implemented

Built `lib/ali/questionFactory/englishMarkingContractGate.ts` — see §D-G.

## D. Exact marking-contract gate

`validateEnglishMarkingContract()` exercises the REAL, imported `scoreEnglishComprehensionAnswer`/`scoreEnglishAnswer` (never a reimplementation) against a candidate's full declared contract:

1. `marks` is a valid positive integer.
2. Required fields are present for the declared tier (`acceptedAnswers` where the tier needs it; `modelAnswer` where the implicit `LEGACY_HEURISTIC` path needs it) — checked *before* ever calling the scorer, so a known-incomplete contract fails with a precise reason instead of a downstream `NaN`.
3. The canonical approved answer earns exactly `marks` through the real scorer, with no `NaN` anywhere and no silent routing to a self-comparison tier the gate cannot certify.
4. Every approved variant also earns full marks.
5. A genuinely disjoint wrong answer (built via `buildDisjointWrongAnswer()`, which programmatically excludes any real keyword — or substring of one — shared with the approved answers, closing the exact "nonsense contains sense" test-construction mistake found during Wave 2's own post-repair verification) earns zero.
6. Every supplied plausible-wrong answer also earns zero.

## E. Fail-closed conditions

A candidate is invalid (never submission-ready) if: `marks` is missing/invalid; a required field for its declared/implicit tier is missing; the canonical answer produces `NaN`; the canonical answer does not earn full marks; an approved variant does not earn full marks; the disjoint wrong answer earns nonzero marks; or any plausible-wrong answer earns nonzero marks. The gate never substitutes a different scorer or tier — it reports the precise failure against the candidate's own declared contract.

## F. Regression evidence for NaN/missing-field incident (CASE 4, 5)

`tests/lib/ali/questionFactory/englishMarkingContractGate.test.ts`, using safe fixtures (not the historical Wave 2 questions): a contract with `acceptedAnswers` but no `marks`/`modelAnswer`/`validationTier` fails validation *before* the scorer is ever called, with a reason explicitly naming "the Wave 2 Incident A shape." All 11 tests pass.

## G. Regression evidence for short-answer incompatibility (CASE 2, 2b, 3)

Same test file: a short emotion answer ("nervous") and a short sequencing answer ("b, a, c") each pass under a `TIER2_ACCEPTED_SET` contract (correct answer full marks, unrelated/differently-ordered answer zero) — and CASE 2b explicitly reproduces the *original* Incident B failure by routing the identical short answer through `LEGACY_HEURISTIC` instead, confirming the gate would have caught Wave 2's real defect had it existed at the time.

## H. Teaching additions

Added `ENGLISH_FAMILY_EXAM_STRATEGY` and `ENGLISH_FAMILY_WORKED_EXAMPLE` entries for all 4 families (previously zero coverage), using the Founder-specified models: retrieval and comparative-extraction share one five-step model (WHAT INFORMATION DO I NEED? → WHERE IS THE EVIDENCE? → WHAT DOES IT ACTUALLY SAY? → WHICH DETAIL ANSWERS THE QUESTION? → CHECK.); motive-inference uses its own (WHAT HAPPENED? → WHAT EVIDENCE MATTERS? → WHAT DOES IT SUGGEST? → WHICH MOTIVE FITS BEST? → JUSTIFY.); effect-of-language uses its own (WHICH WORD/PHRASE? → WHAT DOES IT MEAN HERE? → WHAT DOES IT SUGGEST? → WHY DID THE WRITER CHOOSE IT? → WHAT EFFECT DOES IT CREATE?). Every worked example uses a safe, separate scenario (a shuffling old dog, a groaning gate, a heavy bag offered unprompted) — confirmed, by test, never reproducing any of the 32 real candidates' own question text.

## I. New passages

**None.** All 32 candidates reuse the existing, already-live 11-passage pool, per instruction ("reuse existing passages only where educationally natural... create additional original passages only where needed for genuine diversity"). Inspection confirmed the existing pool already supports genuinely distinct blueprint demands across all 4 families without needing new material.

## J. Genuine blueprints by family

4 blueprints per family (16 total), each following that family's own Founder-specified progression — not a mechanical copy of Wave 2's pattern, independently judged as genuinely justified per family after inspecting the real existing content (§B):

- **Retrieval**: explicit single detail (FOUNDATION, the real production shape) → distinguish from a nearby distractor (DEVELOPMENT) → combine two explicit details (INDEPENDENT) → retrieve across evidence separated by intervening text (TRANSFER).
- **Comparative-extraction**: single-character before/after (FOUNDATION, the real production shape) → compare two different characters' reactions (DEVELOPMENT) → compare two settings/descriptions (INDEPENDENT) → similarity AND difference (TRANSFER).
- **Motive-inference**: motive from a direct action (FOUNDATION, the real production shape) → motive from what is said/not said (DEVELOPMENT) → weighing two plausible motives against the evidence (INDEPENDENT) → a motive that shifts/deepens across the passage (TRANSFER).
- **Effect-of-language**: a single figurative comparison's effect (FOUNDATION, the real production shape) → a word's precise meaning in context, no figurative language (DEVELOPMENT) → word-substitution rationale (INDEPENDENT) → a cumulative, repeated word-choice pattern (TRANSFER).

## K. Difficulty coverage

| Family | easy | medium | hard | challenge |
|---|---|---|---|---|
| `wave3-fam-rc01-retrieval` | 2 | 4 | 2 | 0 |
| `wave1-fam-comparative-extraction` | 0 | 4 | 2 | 2 |
| `wave1-fam-motive-inference` | 0 | 2 | 4 | 2 |
| `wave1-fam-effect-of-language` | 0 | 4 | 2 | 2 |

Retrieval now has a genuine `easy`→`hard` ladder (previously `easy` only). The other three families now reach `challenge` (previously capped at `hard`), grown through evidence distance, cross-character/cross-passage comparison, weighing competing evidence, and cumulative-pattern synthesis — never through obscure vocabulary alone.

## L. Candidate count manufactured

**32 total** (8 per family, 2 per blueprint) — the smallest volume judged sufficient to turn each family into a genuinely usable, blueprint-diverse Practice pool, not a push toward any headline total.

## M. Family reconciliation

8/8/8/8 confirmed programmatically against the actual manifest (not assumed from arithmetic).

## N. Blueprint reconciliation

16/16 confirmed, exactly 4 per family, exactly 2 candidates per blueprint (`scripts/validate-ei003-wave3-manifest.mjs`).

## O. Passage distribution

9 distinct passages used across the 32 new candidates (`scripts/analyze-ei003-wave3-passage-exposure.mjs`). Largest single passage share: The Baker's Apprentice, 6/32 (18.75%) — under the ~20-25% per-passage target established during the Wave 2 correction. Top-two combined share: 34.4% — well under a majority. No passage is used by fewer than 2 of the 4 families where it appears at all, avoiding the "easy-for-authoring" over-concentration the Wave 2 lesson specifically warned against.

## P. Marking-contract distribution

All 32 candidates: `validationTier = 'TIER2_ACCEPTED_SET'` — matching each family's own already-live, pre-existing convention (not a new choice; confirmed identical on all 17 pre-existing rows before this wave began). `marks` matches each family's own existing convention exactly: 1 for retrieval, 2 for the other three. No candidate uses `LEGACY_HEURISTIC` or any other tier.

## Q. Correct-answer scorer validation

`scripts/validate-ei003-wave3-marking-contracts.mjs`, run against the real, imported production scorer: **32/32** candidates' own canonical answer (and every approved variant) earns full marks, with zero `NaN` results.

## R. Wrong-answer scorer validation

Same run: **32/32** candidates' programmatically-verified-disjoint wrong answer earns zero marks. For 6 representative candidates spanning all 4 families (a distractor-style retrieval pair, a comparative similarity/difference case, both motive-weighing candidates, and one language-substitution case), an additional genuinely plausible-but-wrong answer (the wrong person, a superficial "both are similar because..." claim, an unsupported alternative motive, an equally-plausible-sounding word) was also tested and correctly scored zero — proving the gate does not merely reject nonsense, and that `TIER2_ACCEPTED_SET`'s order-sensitive, token-based matching resists the "same vocabulary, wrong conclusion" failure mode.

## S. Human educational review

All 32 candidates were read together with their real passage text during authoring (not a separate detached review pass) — every evidence quote was individually located and copied from the exact passage text before being written into `evidenceQuotes`, and every explanation was checked for: answer defensibility (each explanation traces the claimed answer to specific, quoted evidence); no accidental clues in the question's own phrasing; teaching content kept on a separate, safe scenario, confirmed never reproducing live question text (§H, test-enforced); no formulaic "the author uses X to make it interesting" language (confirmed absent by direct search); and structural non-repetition (no two candidates within a family share a reasoning skeleton). A representative spot-check across all 4 families and all 16 blueprints found no ambiguity, no double-counted evidence, and no age-inappropriate content.

## T. Anti-memorisation assessment

Before Wave 3, each of these 4 families was a single repeated reasoning skeleton — a learner weak-flagged on any of them would see the same question *shape* every time. After Wave 3 (once published): 4 genuinely distinct blueprints per family, 9 shared-but-not-concentrated passages, and a real difficulty ladder. This is a material, structural improvement in memorisation resistance for these four specific families — not a claim that it solves Angel's whole content-depth problem.

## U. Tests/typecheck/build

All verified inside an isolated `git worktree` at the pre-Wave-3 commit (`a3b005c`), containing only the 13 bounded Wave 3 files plus a symlinked `node_modules`:

- **Typecheck**: 0 errors in the isolated worktree.
- **Targeted tests**: 17/17 pass (11 marking-gate + 6 teaching).
- **Deterministic manifest validator**: PASS — 32 candidates, 16 blueprints, 0 quote-integrity problems.
- **Marking-contract gate**: PASS — 32/32.
- **Production build**: exit 0, `✓ Compiled successfully`.
- **Full repository regression suite** (run outside the worktree, on the real working tree): 4,261/4,264 pass — the same 3 pre-existing, already-known-unrelated failures (`candidateStoreMapping.test.ts`, `mr03CoordinateBlueprints.test.ts`, `migration237PublishAnswerPersistenceCorrection.test.ts`), zero new failures.

## V. Commit/deployment status

Committed and pushed: **`d75fe42`** on `main` (`a3b005c..d75fe42`), 13 files, 1,622 insertions, 0 deletions. Historical Wave 2 content (`b3c6bfa`, migrations 241/242/243) is untouched.

## W. Material defects/findings

1. **3 quote-integrity defects caught and fixed during this wave's own deterministic validation** (before any commit): three evidence quotes from "The New Girl" were transcribed with a lowercase sentence-initial letter ("a girl..."/"her carefully rehearsed...") where the real passage text capitalises the start of the sentence ("A girl..."/"Her carefully rehearsed..."). Caught by the exact-substring validator on its first run, fixed, and re-verified — the same discipline, and the same class of defect, Wave 2's own validator caught 8 times.
2. **No marking-contract defect was found in any of the 32 candidates** — the new gate passed all 32 on its first run once the quote fixes above were applied, evidence that authoring directly against the real scoring contract from the start (rather than discovering incompatibility post-publication, as in Wave 2) is achievable.
3. No other defect found. No pre-existing unrelated failure was reopened or touched.

## X. Expected post-publication family depths

If this manifest is later submitted, reviewed, and published unchanged: `wave3-fam-rc01-retrieval` 5→13, `wave1-fam-comparative-extraction` 4→12, `wave1-fam-motive-inference` 4→12, `wave1-fam-effect-of-language` 4→12. Not performed in this task.

## Y. GO / REVISE / NO-GO FOR CANDIDATE-STORE SUBMISSION

**GO.**

The marking-contract safety gate is built, regression-proven against both real Wave 2 incidents using safe fixtures, and — critically — every one of the 32 real Wave 3 candidates already passes it against the real production scorer, with zero defects found. Blueprint design is genuinely differentiated per family (not mechanically copied), teaching content is in place, passage exposure is healthy, and the full regression suite, typecheck, and build are all clean with zero new failures. Nothing has been submitted, reviewed, or published, and Wave 4 has not begun.

**STOP. Do not submit. Do not review. Do not publish. Do not begin Wave 4.**
