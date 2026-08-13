# English Wave 1 — Review-Ready Passage/Family Packs

**Prepared:** Educational Increment 007B, 2026-08-13.
**Purpose:** let an independent reviewer evaluate each passage and family via a passage/question-family-keyed extension of `ali_family_review` (007A design), without inspecting every one of the 42 questions individually. All 6 passages and 42 questions are currently `eligibility_status = 'provisional'` — none is self-promoted, none is Mock Eligible.
**Evidence basis for the whole wave:** direct reading of CSSE-003/005 (2023 Main Test paper + marking scheme) and CSSE-008 (2022 Main Test paper), Level A, Founder-Accepted, reconciled in Educational Increment 007A.
**Automated validation status (`scripts/generate-english-wave1.mjs`):** PASS — 0 duplicate IDs, 0 duplicate questions, 0 dash-style violations, 0 quotation-verification failures (every quotation any question requires as evidence independently confirmed to appear verbatim in its own passage before migration 044 was written).

---

## Passage: `wave1-eng-kitemaker` — "The Kite Maker"

- **Genre/type:** contemporary realistic fiction, third-person, 430 words, moderate complexity.
- **Structural signature:** grandparent-teaches-grandchild-a-skill scene; withheld-praise emotional arc.
- **Questions:** 7, covering RC-01 (retrieval), RC-03 (vocabulary + synonym battery), RC-02 (tick+justify, quote+explain, emotion+cause), RC-04 (sequencing).
- **Originality check:** no character names, plot events, or distinctive wording shared with the CSSE extracts read in 007A ("I Capture the Castle", "The Good Companions"). Original scenario (kite-making) not present in either source.
- **Copyright risk:** none identified — wholly original Angel prose.
- **Answer-validation coverage:** Tier 2 (retrieval, vocabulary), Tier 3 (tick+justify, quote+explain, emotion+cause — quotation half only), Tier 4 (sequencing).

## Passage: `wave1-eng-lastbus` — "The Last Bus"

- **Genre/type:** contemporary realistic fiction, first-person, 408 words, moderate-high complexity.
- **Structural signature:** time-pressure/tension scene with a clear chronological action chain — deliberately chosen to test RC-04 sequencing against a first-person, high-stakes narrative rather than only a calm third-person one.
- **Questions:** 7, same family spread as above.
- **Originality check:** confirmed distinct — no overlap with either CSSE extract's plot (a bath interrupted by visitors; a school supper scene). Original scenario (running for a bus before an audition).
- **Copyright risk:** none identified.
- **Answer-validation coverage:** as above.

## Passage: `wave1-eng-newgirl` — "The New Girl"

- **Genre/type:** contemporary realistic fiction, third-person, 361 words, moderate-high complexity.
- **Structural signature:** internal-thought-vs-external-speech contrast — deliberately chosen ground for the tick+justify and quote+explain families, since the passage's core device (planned vs. actual dialogue) makes "does X think/feel Y" genuinely inferential rather than obvious.
- **Questions:** 7.
- **Originality check:** confirmed distinct from both CSSE sources.
- **Copyright risk:** none identified.
- **Answer-validation coverage:** as above.

## Passage: `wave1-eng-atticdoor` — "The Attic Door"

- **Genre/type:** contemporary realistic fiction, third-person, 377 words, high complexity (the wave's densest vocabulary/most descriptive passage, by design — see difficulty distribution below).
- **Structural signature:** descriptive/atmospheric suspense scene, heavier on personification and sensory language than the other 5 — deliberately chosen to test RC-03 against genuinely richer vocabulary ("mournful", "grimy", "savouring") than the more conversational passages.
- **Questions:** 7.
- **Originality check:** confirmed distinct — no shared plot, characters, or wording with either CSSE source.
- **Copyright risk:** none identified.
- **Answer-validation coverage:** as above.

## Passage: `wave1-eng-raceday` — "Race Day"

- **Genre/type:** contemporary realistic fiction, third-person, 374 words, moderate complexity.
- **Structural signature:** the wave's only two-character-contrast passage, purpose-built for `wave1-fam-two-character` (RC-02 comparative) — Ade and Cass's opposed preparation styles give genuine, evidence-backed contrast rather than a superficial comparison.
- **Questions:** 7, including the wave's only `wave1-fam-two-character` instance (a deliberate scope decision — see Question Family Depth note below).
- **Originality check:** confirmed distinct from both CSSE sources.
- **Copyright risk:** none identified.
- **Answer-validation coverage:** as above.

## Passage: `wave1-eng-lettertonana` — "A Letter to Nana"

- **Genre/type:** epistolary fiction (first-person letter), 406 words, moderate complexity.
- **Structural signature:** the wave's only non-third/first-person-narrative structural format — deliberately included to test whether the passage architecture (007A) and question families generalise beyond straight narrative prose to a differently-structured text type, per the 007B directive's "meaningful variation across evidence-supported CSSE text demands" instruction, within the evidence-confirmed narrative-fiction genre (no non-fiction genre is manufactured — see Genre Note below).
- **Questions:** 7.
- **Originality check:** confirmed distinct — original scenario (a child adjusting to a house move), not derived from any CSSE source.
- **Copyright risk:** none identified.
- **Answer-validation coverage:** as above.

---

## Question family cross-reference

| Family | Competency / QT | Instances | Transfer spread |
|---|---|---|---|
| `wave1-fam-direct-retrieval` | RC-01 / QT-RC-01 | 6 (1 per passage) | ROUTINE ×6 |
| `wave1-fam-vocab-explain` | RC-03 / QT-RC-03 | 6 | NEAR ×4, FAR ×2 |
| `wave1-fam-synonym-battery` | RC-03 / QT-RC-04 | 6 | NEAR ×6 |
| `wave1-fam-tick-justify` | RC-02 / QT-RC-02 | 6 | MIXED ×6 |
| `wave1-fam-quote-explain` | RC-02 / QT-RC-02 | 6 | MIXED ×6 |
| `wave1-fam-sequencing` | RC-04 / QT-RC-06 | 6 | NEAR ×6 |
| `wave1-fam-emotion-cause` | RC-02 / QT-RC-08 | 6 | FAR ×6 |
| `wave1-fam-two-character` | RC-02 / QT-RC-07 | 1 (Race Day only) | MIXED ×1 |

**Question Family Depth note:** `wave1-fam-two-character` has only 1 instance this wave, not 6, because it requires a passage purpose-built with two contrasting characters — of the 6 passages authored, only Race Day has this structure. Manufacturing a forced two-character contrast into the other 5 passages, which are built around a single protagonist, would have weakened those passages' own structural integrity. Recorded honestly as a depth gap for Wave 2, not padded to look even.

**Genre note:** all 6 passages are narrative fiction (5 third/first-person prose, 1 epistolary), matching the ONLY genre the 007A evidence (2022/2023 CSSE Main Test papers, both read directly) actually supports. No non-fiction/informational passage is included — the evidence read does not show CSSE uses one in this paper section, and inventing one would violate the 007B directive's own "do not force genres that CSSE evidence does not support" instruction. If a future evidence pass (e.g. reading a wider set of CSSE assets) finds non-fiction demand, that would justify revisiting this, not before.

## Difficulty distribution

| `content_difficulty` | Passages | Basis |
|---|---|---|
| medium | 5 | word count 361-430, moderate-to-moderate-high vocabulary/inference demand |
| hard | 1 (The Attic Door) | denser descriptive vocabulary, personification, longer average sentence length |

Deliberately not medium-heavy across every dimension despite 5 of 6 passages sharing the `medium` label: within `medium`, reading complexity is itself labelled at finer grain (`moderate` ×4, `moderate-high` ×2) and transfer class varies substantially per question (ROUTINE 6 / NEAR_TRANSFER 14 / MIXED_TRANSFER 12 / FAR_TRANSFER 10) — difficulty is not collapsed into one axis.

## Misconception coverage

All 42 questions carry a populated `addresses_misconception` field — 0/42 unpopulated, in contrast to the audited 007A legacy 13 rows (0/13 populated). Each misconception is question-specific (not a generic template), naming the actual likely error pattern for that exact question (e.g. w1-atticdoor-03's "confusing 'mournful' with 'morning', a common spelling-based misreading at this age").

## Answer-validation architecture applied

- **Tier 2 (accepted-answer-set):** `wave1-fam-direct-retrieval`, `wave1-fam-vocab-explain`, `wave1-fam-synonym-battery` — 18 questions, each with an author-curated `acceptedAnswers` list, not generic keyword overlap.
- **Tier 3 (quotation + explanation):** `wave1-fam-tick-justify`, `wave1-fam-quote-explain`, `wave1-fam-two-character`, `wave1-fam-emotion-cause` — 24 questions. The quotation half is deterministically verifiable (`checkQuotationPresent`, unit-tested); the explanation half is explicitly marked `NOT_AUTOMATICALLY_GRADABLE` — no fabricated scoring precision.
- **Tier 4 (ordered list, CSSE's own partial-credit rule):** `wave1-fam-sequencing` — 6 questions, `orderedAnswer` arrays, validated against the exact partial-credit behaviour demonstrated in the 2023 CSSE mark scheme (see `tests/lib/learningEngine/englishAnswerValidation.test.ts`).

## Human-readable similarity/originality review (in addition to automated checks)

Manual comparison of all 6 passages against the two CSSE extracts read in 007A: no shared character names, no shared plot structure or sequence of events, no reproduced distinctive phrasing. Where a passage shares a broad scene type with a CSSE extract (e.g. both "The Kite Maker" and "The Good Companions" involve an adult-authority-figure interaction), the actual content, dialogue, and resolution are unrelated — matching scene TYPE (which 007A's evidence establishes as a legitimate archetype to teach from) is not the same as copying content, per the directive's own PAST-PAPER-EVIDENCE → EXTRACT-EDUCATIONAL-DEMAND → CREATE-ORIGINAL-MATERIAL model.

**This is not an independent reviewer's sign-off.** Per this project's established discipline (`ali_family_review`, migration 034: "no application code writes here as part of authoring or generation... a reviewer must not be the family's own author"), this pack prepares the material for a genuine independent review — it does not substitute for one. All 6 passages and 42 questions remain `provisional`.
