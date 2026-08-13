# English MODEL/Guided/Remediation Coverage Audit — all 9 families

**Prepared:** Educational Increment 007C completion, 2026-08-13.
**Purpose:** per the Founder's Part 7 instruction, classify every one of the 9 English families' support route so no family is left with only generic feedback where family-specific teaching is educationally required. Not every family needs a FULL model — this audit records the honest classification made for each, and why.

| Family | MODEL (worked example) | Guided Practice scaffold | Post-attempt remediation |
|---|---|---|---|
| `wave2-fam-multiselect` | **FULL** — safe scenario, `englishExamStrategies.ts` | **REAL/verified** — live selection-count check (`selection-count-check`), prevents committing the over-selection error structurally | Real: `OVER_SELECTION` / `UNDER_SELECTION`, directly from `checkMultiSelect`'s own result |
| `wave1-fam-sequencing` | **FULL** | **REAL/verified** — first ordered item given as an anchor (`sequence-anchor`), matching the directive's own named example of legitimate scaffolding | Real: `EVIDENCE_NOT_LOCATED` (zero marks) vs `SEQUENCE_ERROR` (right items, wrong position), from `checkOrderedSequence`'s own position data |
| `wave1-fam-two-character` | **FULL** | **LIGHTWEIGHT** — family-specific instructional text (`locate-instruction`): answer in two separate parts before combining | Self-reflection checklist (Tier 3, self-assessed): `CHARACTER_COMPARISON_WITHOUT_EVIDENCE`, `WEAK_QUOTATION` |
| `wave1-fam-quote-explain` | **FULL** | **REAL/verified** — staged quotation check (`staged-quotation`) via `checkQuotationPresent`, non-blocking, repeatable before submission | Self-reflection checklist: `WEAK_QUOTATION`, `EXPLANATION_MISMATCH` |
| `wave1-fam-vocab-explain` | **FULL** (added on completion — was LIGHTWEIGHT at first report) | **LIGHTWEIGHT** — instructional (`locate-instruction`) | Real: `VOCABULARY_CONTEXT_ERROR` for Tier 2 wrong answers |
| `wave1-fam-emotion-cause` | **LIGHTWEIGHT** — exam-strategy hint only, no worked example (evidence for a dedicated scenario was judged thinner than the 5 FULL families) | **REAL/verified** — reuses `staged-quotation` (the underlying Tier 5 check is structurally identical to Tier 3's) | Self-reflection checklist: `EVIDENCE_NOT_LOCATED`, `UNSUPPORTED_INFERENCE` |
| `wave1-fam-direct-retrieval` | **GUIDED STRATEGY** — exam-strategy hint only | **LIGHTWEIGHT** — instructional | Generic (no automatic classification defensible beyond correct/incorrect for a Tier 2 retrieval fact) |
| `wave1-fam-tick-justify` | **GUIDED STRATEGY** — exam-strategy hint only | **LIGHTWEIGHT** — instructional | Self-assessed (Tier 3); no dedicated self-reflection set defined — falls back to the model-answer comparison only, disclosed as a genuine remaining gap |
| `wave1-fam-synonym-battery` | **GUIDED STRATEGY** — exam-strategy hint only | **LIGHTWEIGHT** — instructional | Real: `VOCABULARY_CONTEXT_ERROR` for Tier 2 wrong answers |

**Summary:** 5 of 9 families now have a FULL worked example (was 4 at the first 007C report; `vocab-explain` added on completion). 3 families have a REAL, verified Guided Practice interaction (`multiselect`, `sequencing`, `quote-explain`); `emotion-cause` reuses the same verified mechanic as `quote-explain` since its underlying check (`checkNamedComponent`) is structurally the same shape as a quotation check. The remaining 5 families get a real, family-specific instructional scaffold (not a shared generic string — verified by `tests/lib/learningEngine/guidedPractice.test.ts`), not silence.

**Honest gap:** `wave1-fam-tick-justify` has no dedicated self-reflection category set — it falls back to the bare model-answer comparison the self-assessment flow already provided before 007C. This is disclosed, not hidden, as a candidate for the next English increment.
