# Angel 11+ — Educational Increment 007D — Authoritative Review Backlog

**Prepared:** 007D, 2026-08-13. **Verified against production** via direct anon-key query (English) and cross-referenced against migrations 038/041 (Mathematics review targets already registered).
**Scope:** every `provisional` Mathematics family and every English passage/question family, per the Founder's Part 2 instruction. Excludes anything already `practice_eligible` (already promoted, out of scope for this backlog) and excludes Mathematics content with no `family_id` grouping where it is already `practice_eligible`.

## A. English passages (15 targets: 6 Wave 1 + 9 Wave 2)

| Passage | Subject | Competency | Evidence basis | Automated validation | Review status | Eligibility | Blocking defects | Priority |
|---|---|---|---|---|---|---|---|---|
| `wave1-eng-kitemaker` | English | RC-01/02/03 | CSSE-003/005/008 read | PASS (Wave 1 suite) | pending_independent_review (mig. 048) | provisional | None known | High |
| `wave1-eng-lastbus` | English | RC-01/02/03 | CSSE-003/005/008 | PASS | pending_independent_review | provisional | None known | High |
| `wave1-eng-newgirl` | English | RC-01/02/03 | CSSE-003/005/008 | PASS | pending_independent_review | provisional | None known | High |
| `wave1-eng-atticdoor` | English | RC-01/02/03 | CSSE-003/005/008 | PASS | pending_independent_review | provisional | None known | High |
| `wave1-eng-raceday` | English | RC-01/02/03 | CSSE-003/005/008 | PASS | pending_independent_review | provisional | None known | High |
| `wave1-eng-lettertonana` | English | RC-01/02/03 | CSSE-003/005/008 | PASS | pending_independent_review | provisional | None known | High |
| `wave2-eng-lastslice` | English | RC-01/02/03/04 | CSSE-003/005/008/013 | PASS | pending_independent_review (mig. 050) | provisional | None known | High |
| `wave2-eng-morningpatrol` | English | RC-01/02/03/04 | as above | PASS | pending_independent_review | provisional | None known | High |
| `wave2-eng-understudy` | English | RC-01/02/03 | as above | PASS | pending_independent_review | provisional | None known | Medium |
| `wave2-eng-twoletters` | English | RC-01/02/03 | as above | PASS | pending_independent_review | provisional | None known | High |
| `wave2-eng-longwalk` | English | RC-01/02/04 | as above | PASS | pending_independent_review | provisional | None known | High (multiselect) |
| `wave2-eng-sciencefair` | English | RC-01/02/04 | as above | PASS | pending_independent_review | provisional | None known | High (two-character) |
| `wave2-eng-stormwarning` | English | RC-01/02/04 | as above | PASS | pending_independent_review | provisional | None known | High (multiselect) |
| `wave2-eng-pianorecital` | English | RC-01/02/03 | as above | PASS | pending_independent_review | provisional | None known | Medium |
| `wave2-eng-surprise` | English | RC-01/02/03/04 | as above | PASS | **approved** (Ayobami Lawal — Decision 51) | provisional | None known | High (2-char + multiselect) |

## B. English question families (9 targets)

| Family | Subject | QT | Instances (all waves) | Evidence basis | Automated validation | Review status | Blocking defects | Priority |
|---|---|---|---|---|---|---|---|---|
| `wave1-fam-direct-retrieval` | English | QT-RC-01 | 14 | CSSE-003/005/008/013 | PASS | pending_independent_review | None known | Medium (well-established) |
| `wave1-fam-vocab-explain` | English | QT-RC-05 | 17 | as above | PASS | **approved** (Ayobami Lawal — Decision 51) | None known | **High** (Part 8 priority) |
| `wave1-fam-synonym-battery` | English | QT-RC-05 | 11 | as above | PASS | pending_independent_review | None known | Medium |
| `wave1-fam-tick-justify` | English | QT-RC-02 | 11 (corrected 007I — Wave 1 count was misrecorded as 6/12; Race Day's slot went to `two-character` instead, true count always 5 Wave 1 + 6 Wave 2) | as above | PASS | pending_independent_review | Known gap: no dedicated self-reflection category set (disclosed, 007C) | Medium |
| `wave1-fam-quote-explain` | English | QT-RC-02 | 13 | as above | PASS | **approved** (Ayobami Lawal — Decision 51) | None known | **High** (Part 8 priority, most frequent CSSE pattern) |
| `wave1-fam-sequencing` | English | QT-RC-06 | 15 | as above | PASS | **approved** (Ayobami Lawal — Decision 51) | None known | **High** (Part 8 priority) |
| `wave1-fam-two-character` | English | QT-RC-07 | 6 | as above | PASS | **approved** (Ayobami Lawal — Decision 51) | Thinnest depth of the 8 original families (6, at target floor) | **High** (Part 8 priority) |
| `wave1-fam-emotion-cause` | English | QT-RC-08 | 11 | as above | PASS | pending_independent_review | None known | Medium |
| `wave2-fam-multiselect` | English | QT-RC-09 | 6 | CSSE-013/2021 Q11 only (single-year evidence, disclosed as thinner) | PASS, incl. real defect found+fixed (trailing-punctuation tokenisation) | **approved** (Ayobami Lawal — Decision 51) | Under-selection partial-credit rule is a disclosed policy inference, not directly evidenced | **High** (Part 8 priority, newest family) |

## C. Mathematics families (21 targets: 4 with review packs already prepared, 17 with none)

### C1. Review packs already prepared (`MATHEMATICS_WAVE2_REVIEW_PACKS.md`)

| Family | QT | Provisional count | Evidence basis | Automated validation | Review status | Priority |
|---|---|---|---|---|---|---|
| `mr02-compare` | QT-MR-06 | 3 | CSSE-006/011/016 | PASS (Mathematics test suite) | **approved** (Ayobami Lawal — Decision 51) | High |
| `mr03-classify` | QT-MR-07 | 3 | CSSE-006/011/016 | PASS | pending_independent_review | High |
| `mr04-far-percent` | QT-MR-04 | 3 | CSSE-006/011/016 | PASS | pending_independent_review | High |
| `mr04-mixed-divisibility` | QT-MR-13 | 3 | CSSE-006/016 | PASS | pending_independent_review | High |

### C2. No review target registered at all (real governance gap — pre-dates the review mechanism)

| Family | QT | Provisional count | Evidence basis | Automated validation | Review status | Priority |
|---|---|---|---|---|---|---|
| `mr02-sum-difference` | QT-MR-06 | 5 | Not verified this session | PASS (regression suite) | **No target registered** | Medium |
| `mr01-missing-operand` | QT-MR-02 | 4 | Not verified this session | PASS | **No target registered** | Medium |
| `mr03-coordinate` | QT-MR-08 | 3 | Not verified this session | PASS | **No target registered** | Medium |
| `mr05-constrained-multiple` | QT-MR-11 | 3 | Not verified this session | PASS | **No target registered** | Medium |
| `mr02-far-ratio-context` | QT-MR-06 | 3 | Not verified this session | PASS | **No target registered** | Medium |
| `mr03-mixed-perimeter` | QT-MR-07 | 3 | Not verified this session | PASS | **No target registered** | Medium |
| `mr04-far-recipe` | QT-MR-04 | 3 | Not verified this session | PASS | **No target registered** | Medium |
| `mr03-angle-ratio` | QT-MR-07 | 5 | Not verified this session | PASS | **No target registered** | Medium |
| `mr05-factors-primes` | QT-MR-11 | 5 | Not verified this session | PASS | **No target registered** | Medium |
| `mr01-measurement-conversion` | QT-MR-03 | 4 | Not verified this session | PASS | **No target registered** | Medium |
| `mr01-data-table` | QT-MR-09 | 5 | Not verified this session | PASS | **No target registered** | Medium |
| `mr04-elapsed-time` | QT-MR-10 | 5 | Not verified this session | PASS | **No target registered** | Medium |
| `mr01-average-mean` | QT-MR-12 | 4 | Not verified this session | PASS | **No target registered** | Medium |
| `mr02-nth-term` | QT-MR-05 | 5 | Not verified this session | PASS | **No target registered** | Medium |
| `mr04-compound-percentage` | QT-MR-04 | 5 | Not verified this session | PASS | **No target registered** | Medium |
| `mr04-best-value` | QT-MR-13 | 5 | Not verified this session | PASS | **No target registered** | Medium |
| *(ungrouped, no `family_id`)* | 11 distinct QT codes | 5 | Not verified this session | PASS | **No target, no family grouping at all** | Low (needs family assignment before it can even enter a review queue) |

**"Not verified this session" is an honest gap, not a claim these families lack evidence** — 006B/earlier increments authored this content with real CSSE evidence at the time, but re-confirming each family's specific evidence citation was out of scope for 007D's review-backlog cataloguing task and would need doing before independent review of these 17 families could proceed efficiently.

## Recommended review priority order (Part 2: "unlocks the greatest learner-ready supply safely")

1. **English families**: `two-character`, `sequencing`, `quote-explain`, `vocab-explain`, `multiselect` (Part 8's named priorities — reviewing these 5 families, using Part 4's efficient passage+family+representative+boundary approach, unlocks the newly built teaching loop across all 15 passages at once, since a family-level PASS applies to every instance).
2. **English passages** feeding those 5 families: `wave2-eng-surprise`, `wave2-eng-longwalk`, `wave2-eng-stormwarning`, `wave2-eng-sciencefair`, `wave2-eng-twoletters`, `wave2-eng-lastslice`, `wave2-eng-morningpatrol` (multiselect/two-character/sequencing carriers).
3. **Mathematics C1** (4 families, packs already exist — lowest-friction Mathematics reviews available).
4. **Mathematics C2** (17 families) — recommend a small evidence-reconfirmation pass before independent review, not authoring new content.
