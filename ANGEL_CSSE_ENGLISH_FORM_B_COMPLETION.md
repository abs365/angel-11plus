# ANGEL 11+ — CSSE ENGLISH FORM B COMPLETION (2026-10-08)

Status: **MIGRATION 271 APPLIED by the Founder and verified in production (see `ANGEL_CSSE_GATE_CLOSURE_VERIFICATION.md`): DO NOT RERUN.** Form B is sealed, not activated. No item is marked
`independently_validated` or `mock_eligible`. No official CSSE comprehension/Writing mark split is assumed.
Builds on `ANGEL_CSSE_ENGLISH_FORM_B_SUPPLY_PLAN.md`. Source of truth for every change below:
`lib/ali/questionFactory/englishFormBCompletion.ts` (tested by `tests/lib/ali/questionFactory/englishFormBCompletion.test.ts`),
recorded in `supabase/migrations/271_english_form_b_completion_APPLIED_DO_NOT_RERUN.sql` by
`scripts/generate-english-form-b-completion-migration.mjs`.

> **UPDATE (2026-10-08, Founder decision): SALMON IS REJECTED AND REPLACED.** Every reference to *How Salmon Find Their Way Home* below is historical. It overlapped the live bee Timed Section too closely (`ANGEL_CSSE_SALMON_BEE_DECISION.md`). The informational half of Form B is now the ORIGINAL passage **"The Great Stink"** (530 words, 11 questions, 18 marks), sealed and not activated; its migration (273) is prepared and NOT applied. Salmon, its 10 questions and the Salmon top-up item from migration 271 are preserved only as rejected/replaced evidence and are refused by the Mock composer and manifest validator (`lib/ali/rejectedMockContent.ts`). Form B is therefore: Compass Rose (13 questions, 21 marks) + The Great Stink (11 questions, 18 marks) = **24 questions, 39 marks**.

## 1. Marking-contract defect: repaired (as a template)

**Defect.** The eight free-text explanation items of *The Fossil Hunter of Lyme Regis* (Q3–Q6) and *Two Different Projects*
(Q3–Q6) are registered as `TIER2_ACCEPTED_SET`: an accepted-answer list of 9–13 phrases. A child who explains correctly in other
words is marked wrong, and a child who happens to include a listed phrase is marked right.

**Repair.** Move the eight items to `TIER5_NAMED_COMPONENT_PLUS_EXPLANATION`. The database already forces TIER3/TIER5 items to
`requires_manual_marking`, so a trained human marks them against the model answer; the old accepted answers stay as marker
support and never award marks. No engine, tier behaviour, or Practice code is changed. Q1–Q2 of both passages (true retrieval)
stay accepted-set. Applies only to rows still `authentic_assessment_candidate`.

*Consequence to be aware of:* Form B will contain more manually marked marks than a purely automatic form, as Form A already
does for its Q3-type items. This is the honest contract for explanation questions, not a regression.

## 2. Independent review of all five reserve passages (final)

Each passage was read against the stored text (read-only from production) and checked on the seven required dimensions. Findings
marked **H** need a human to verify or decide; I have not marked any item validated.

| Dimension | Compass Rose | Salmon | Pepper's Breakfast | Fossil Hunter (Anning) | Two Projects |
|---|---|---|---|---|---|
| Originality / provenance | `angel_original`, no external rights holder | same | same | same, real history, facts from general knowledge **H** | same |
| Factual accuracy | n/a (fiction); timing consistent | Hasler and Wisby 1951 odour imprinting is correct as I know it; magnetic imprinting is hedged. **H verify against sources** | n/a | Dates and events consistent with the commonly cited record; **H verify each** | n/a |
| Question–answer integrity | All 8 answers match the text. **Two defects fixed** (below) | All 10 match | One logic slip: old bowl still full yet "fed this morning" | Matches; 4 items had wrong marking tier | Matches; 4 items had wrong marking tier |
| Alternative-answer safety | Q2a/Q2b accepted sets were too narrow (fixed) | Synonym sets reasonable | not reviewed further | Repaired to manual | Repaired to manual |
| Skill coverage | RC-01×2, 02, 05, 06, 07×2, 10 | RC-01×3, 02, 04×4, 06, 10 | RC-01×3, 02×2, 04×4, 06 | RC-01×2, 03, 07, 10, 02 | RC-01×2, 02×2, 03, 10 |
| Overlap with Form A | none | **structure twin of the bee passage** (Timed Section) **H** | none | none | none |
| Difficulty / load | challenging, 585 words | moderate, 567 words | accessible, 416 words (short) | moderate, 508 words | moderate, 503 words |

**New findings from this pass (not in the earlier plan):**
- **Compass Rose Q5 asked something the text does not settle.** "…the order the passage describes them *first investigating* the
  clue" implies a sequence, but the passage has all four working at once ("meanwhile"). Re-worded to "the order the passage
  describes what each of them did on their own", which the text does fix (Elif, Casey, Wei, Grace). Tested against the passage.
- **Compass Rose Q2(a)/(b) rejected correct answers** such as "the church tower", "the bell tower", "the weathervane". Accepted
  sets extended (additions only, none that would accept a wrong character's answer).
- **Q2(b) requires a small inference** (the passage says the weathervane is on the sundial and that Casey read the clue as the
  sundial; it does not say in so many words that Casey's "bell" is the weathervane). **H** reviewer to confirm that this is an
  acceptable inference for the paper, or re-word.
- **Salmon, two odd phrases** ("no memory of ever having made the outward journey consciously"; "a salmon has no smell, no
  landmark…", where "no smell" means no usable scent at sea). Not defects of fact; **H** reviewer may wish to smooth them. Not
  edited here because the passage is reserve content under independent review and any edit should be the reviewer's.
- **Sensitivity (decision, not a defect).** *Two Different Projects* mentions a mother at hospital check-ups (reassured fine).
  Held out of Form B in any case.

## 3. Form B composition after the top-up

Pair (superseded): The Compass Rose Challenge (narrative) + How Salmon Find Their Way Home (informational), then Writing. **Current pair: The Compass Rose Challenge + The Great Stink.**

| | Form A (live) | Form B before | Top-up | **Form B after** |
|---|---|---|---|---|
| Reading items | 22 | 18 | +6 | **24** |
| Reading marks | 39 | 31 | +8 | **39** |
| RC-03 | 2 | 0 | +2 (2 marks each, manually marked) | 2 items / 4 marks |
| RC-04 | 8 | 4 | +4 (1 mark each, deterministic) | **8** |
| RC-01 / 02 / 05 / 06 / 07 / 10 | 3/2/1/2/2/2 | 5/2/1/2/2/2 | 0 | 5/2/1/2/2/2 |

The six new items (all sealed `authentic_assessment_candidate`, `angel_original`, ids `eng-fb-…`):

| Item | Skill | Marks | How marked |
|---|---|---|---|
| Compass Rose Q8: "the rules were stricter than any of them expected" | RC-03 | 2 | human: 1 for "tougher than expected", 1 for naming the alone-first rule |
| Compass Rose Q9–Q12: synonyms for *certain*, *methodically*, *admitted*, *faintly* | RC-04 | 1 each | deterministic accepted set, each tested against the real marking contract with plausible wrong answers (e.g. *slowly* for *methodically*) |
| Salmon Q8: "imprint" | RC-03 | 2 | human: 1 for learn/remember/fix, 1 for linking it to later use |

Automatic checks (all green): each target word/phrase occurs in its passage; each quoted phrase is verbatim; every synonym set
passes the production marking-contract gate and rejects its plausible wrong answers; no accepted synonym is the target word itself.
**Not yet done and cannot be done by me:** independent human review of the six items, and of both passages with their 24 items.

## 4. Writing for Form B

- **Q1:** use `screentime` or `cookopinion` (both already independently validated, opinion type, differing from Form A's
  experience-based Q1). **Founder choice outstanding;** recommendation `screentime`.
- **Q2 (picture-led narrative): The Corner Shop.** Status: **educational storyboard, not final artwork.** The exact learner-facing
  prompt, purpose, alternative story directions, accessibility description and integration contract are in
  `ANGEL_CSSE_WRITING_NARRATIVE_ASSET_CONTRACTS.md`. The sealed drawing stays unpublished; a specialist image pipeline will be
  evaluated separately. Form B therefore cannot be completed until final Q2 artwork is approved, regardless of the reading side.

## 5. Readiness against the gates

| Gate | State |
|---|---|
| Marking contract repaired | **done: migration 271 applied and verified** |
| Six top-up items authored | **done (sealed candidates, in 271)** |
| Independent human review of passages and 24 items | **outstanding (human)** |
| Founder choice of Writing Q1 | **outstanding** |
| Final Q2 artwork | **outstanding (separate pipeline decision)** |
| Compose with `composeCandidateMock`, freeze with `mockFreezeManifest`, register and activate | **not started, by instruction** |

## 6. Founder actions

1. ~~Apply migration 271~~ (done and verified; do not rerun).
2. Commission the independent human review (the Compass Rose passage and 13 items, The Great Stink passage and 11 items, fact-check of the 12 listed claims; the Compass Q2 accepted-answer semantics are left to the validator).
3. Choose Writing Q1. 4. Decide the Q2 artwork route. 5. Decide whether the Timed Section's bee passage should be swapped given
the Salmon structure twin.
