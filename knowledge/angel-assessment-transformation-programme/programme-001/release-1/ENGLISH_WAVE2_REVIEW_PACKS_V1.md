# English Wave 2 — Review-Ready Passage/Family Packs

**Prepared:** Educational Increment 007C, 2026-08-13.
**Purpose:** review evidence for all 8 Wave 2 passages and the 1 new family, via the extended `ali_family_review` mechanism (migration 047), matching `ENGLISH_WAVE1_REVIEW_PACKS_V1.md`'s format. All content `provisional`, none self-promoted.
**Automated validation status:** PASS — 0 duplicate IDs/questions, 0 dash violations, 0 quotation-verification failures across all 50 questions (2 case-sensitivity mismatches caught and fixed before this migration was written, same discipline as Wave 1).

## Passages

| Passage | Genre/structure | Priority addressed | Word count | Difficulty |
|---|---|---|---|---|
| `wave2-eng-lastslice` | Third-person, sibling dialogue | Two-character (contrasting approaches to fairness) | 328 | medium |
| `wave2-eng-morningpatrol` | Third-person, routine disrupted | Sequencing (explicit usual-order vs. actual-order contrast) | 354 | medium |
| `wave2-eng-understudy` | First-person, performance anxiety | Emotion-cause + vocabulary depth | 332 | hard |
| `wave2-eng-twoletters` | Epistolary, two paired letters | Two-character via dual first-person voices (structurally new: 2 letters, not 1) | 303 | medium |
| `wave2-eng-longwalk` | First-person, journey narrative | Multi-select (new family) + sequencing | 310 | medium |
| `wave2-eng-sciencefair` | Third-person, rival characters | Two-character (contrasting preparation styles) | 338 | medium |
| `wave2-eng-stormwarning` | First-person, family crisis response | Multi-select + sequencing | 330 | medium |
| `wave2-eng-pianorecital` | Third-person, performance/description | Vocabulary/synonym depth | 312 | hard |

**Originality check:** manual comparison against all 3 CSSE extracts read across 007A/007B/007C (I Capture the Castle, The Good Companions, A Traveller in Time) — no shared names, plots, or wording. `wave2-eng-twoletters`'s dual-letter structure and `wave2-eng-longwalk`/`wave2-eng-stormwarning`'s multi-select framing are original applications of evidenced CSSE archetypes, not derived from any specific source text.

## Family coverage (this wave's additions to Wave 1's 8 established families, plus 1 new)

| Family | Wave 1 count | Wave 2 additions | New total |
|---|---|---|---|
| `wave1-fam-direct-retrieval` | 6 | 8 | 14 |
| `wave1-fam-vocab-explain` | 6 | 8 | 14 |
| `wave1-fam-synonym-battery` | 6 | 5 | 11 |
| `wave1-fam-tick-justify` | 6 | 6 | 12 |
| `wave1-fam-quote-explain` | 6 | 6 | 12 |
| `wave1-fam-sequencing` | 6 | 6 | 12 |
| `wave1-fam-two-character` | 1 | 3 | 4 |
| `wave1-fam-emotion-cause` | 6 | 5 | 11 |
| `wave2-fam-multiselect` (new) | 0 | 3 | 3 |

**Honest gap disclosure:** the 60-90 question planning range's floor (60) was not reached — 50 questions authored, reported as the real, final count rather than padded. `wave2-fam-multiselect` (3 instances) and `wave1-fam-two-character` (3 instances, now 4 total including Wave 1's) remain below their coverage-matrix targets (6 each) — genuine depth gaps for Wave 3, named explicitly, not concealed inside the total count.

## Answer-validation architecture applied

Adds Tier 6 (multi-select) to the existing 5 tiers, directly evidenced by the 2023 paper's own over-selection rule ("will lose all the marks"), tested against that exact rule (`tests/lib/learningEngine/englishAnswerValidation.test.ts`). Under-selection partial credit (1 mark per correct selection) is disclosed as a defensible policy inference, not a directly-evidenced rule — the specific multi-select mark scheme was not among the papers read.

**This is not an independent reviewer's sign-off.** All 8 passages and the 1 new family remain `provisional`, pending the same review gate as Wave 1.
