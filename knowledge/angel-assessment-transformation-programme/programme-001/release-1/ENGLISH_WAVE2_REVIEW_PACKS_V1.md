# English Wave 2 — Review-Ready Passage/Family Packs

**Prepared:** Educational Increment 007C, 2026-08-13. **Updated:** 007C completion (same day) — adds `wave2-eng-surprise` (Part 4) and 12 additional questions across all 9 passages (Part 3).
**Purpose:** review evidence for all 9 Wave 2 passages and the 1 new family, via the extended `ali_family_review` mechanism (migration 047), matching `ENGLISH_WAVE1_REVIEW_PACKS_V1.md`'s format. All content `provisional`, none self-promoted.
**Automated validation status:** PASS — 0 duplicate IDs/questions, 0 dash violations, 0 quotation-verification failures across all 62 questions (2 case-sensitivity mismatches in the first 50 questions, plus 1 real multi-select tokenisation defect found via completion boundary testing — trailing punctuation on a selection token — fixed in `checkMultiSelect` itself, not worked around in content).

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
| `wave2-eng-surprise` (added on completion) | Third-person, cousin dialogue | Two-character (anxious organiser vs. relaxed helper) + multiselect + action-reconstruction sequencing | 306 | medium |

**Originality check:** manual comparison against all 3 CSSE extracts read across 007A/007B/007C (I Capture the Castle, The Good Companions, A Traveller in Time) — no shared names, plots, or wording. `wave2-eng-twoletters`'s dual-letter structure and `wave2-eng-longwalk`/`wave2-eng-stormwarning`'s multi-select framing are original applications of evidenced CSSE archetypes, not derived from any specific source text. `wave2-eng-surprise` was written on completion after assessing that the 8 original passages, particularly the short 303-word `wave2-eng-twoletters`, had already had their strongest quotable evidence used — a new passage was the honest choice over forcing a second weak two-character question out of thin evidence (Part 4).

## Family coverage (final, after completion)

| Family | Wave 1 count | Wave 2 (first 50) | Wave 2 completion (+12) | New total |
|---|---|---|---|---|
| `wave1-fam-direct-retrieval` | 6 | 8 | 0 | 14 |
| `wave1-fam-vocab-explain` | 6 | 8 | 3 | 17 |
| `wave1-fam-synonym-battery` | 6 | 5 | 0 | 11 |
| `wave1-fam-tick-justify` | 6 | 6 | 0 | 12 |
| `wave1-fam-quote-explain` | 6 | 6 | 1 | 13 |
| `wave1-fam-sequencing` | 6 | 6 | 3 | 15 |
| `wave1-fam-two-character` | 1 | 3 | 2 | **6** |
| `wave1-fam-emotion-cause` | 6 | 5 | 0 | 11 |
| `wave2-fam-multiselect` (new) | 0 | 3 | 3 | **6** |

**Gaps closed on completion:** question total 50 -> 62 (>=60 floor met). Multi-select 3 -> 6 (target met). Two-character 4 -> 6 cumulative (target met). Sequencing gained 3 structurally distinct new sub-types (action-reconstruction in `wave2-eng-surprise`, cause/effect in `wave2-eng-sciencefair`, dispersed-evidence spanning all 5 paragraphs in `wave2-eng-stormwarning`) rather than repeating the original 3-item reorder-events pattern — see `ENGLISH_WAVE2_MODEL_COVERAGE_AUDIT_V1.md` and `tests/content/englishWave2.test.ts`'s 4-item-chain structural check.

## Answer-validation architecture applied

Adds Tier 6 (multi-select) to the existing 5 tiers, directly evidenced by the 2023 paper's own over-selection rule ("will lose all the marks"), tested against that exact rule (`tests/lib/learningEngine/englishAnswerValidation.test.ts`). Under-selection partial credit (1 mark per correct selection) is disclosed as a defensible policy inference, not a directly-evidenced rule — the specific multi-select mark scheme was not among the papers read.

**This is not an independent reviewer's sign-off.** All 9 passages and the 1 new family remain `provisional`, pending the same review gate as Wave 1.
