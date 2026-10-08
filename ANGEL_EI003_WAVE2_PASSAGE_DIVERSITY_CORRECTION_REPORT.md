# ANGEL 11+ — EI003 WAVE 2 PASSAGE-DIVERSITY CORRECTION REPORT

Status: correction implemented and verified. **Not submitted, not reviewed, not published. Wave 3 not begun.**

---

## A. Before passage distribution

Recomputed directly from the 5 family source files as they stood immediately after the Wave 2 pre-publication report (before this correction):

| Passage | Count | % of 40 | Families used | Genre |
|---|---|---|---|---|
| The Relay Baton | 10 | 25.0% | 5 | fiction_narrative |
| The Last Delivery | 11 | 27.5% | 5 | fiction_narrative |
| Crossing the Fen | 8 | 20.0% | 4 | travel_exploration |
| The Attic Workshop | 5 | 12.5% | 2 | descriptive_prose |
| The Clock That Stopped | 5 | 12.5% | 3 | human_interest_memoir |
| The Glass Frog's Hidden Trick | 1 | 2.5% | 1 | nature_science |

Top-two (Relay Baton + Last Delivery) = 21/40 = **52.5%**. This matches the Wave 2 pre-publication report's own §O figure exactly — confirmed, not disputed.

## B. Root cause of 52% concentration

Traced to exactly two families: `wave3-fam-rc07-comparative` and `wave3-fam-rc08-emotion`. Before correction, both drew **exclusively** from 3 of the 6 passages (Relay Baton, Last Delivery, Crossing the Fen) and never once used "The Clock That Stopped," despite that passage containing two real characters (narrator and grandmother) with a genuine relationship arc, an explicit emotional turn (confidence → discouragement → excitement), and a ready-made conflicting-evidence line ("'There,' she said, as though she'd expected this outcome the entire time, though I've never been sure she really did").

This is an **authoring-habit** root cause, not a structural necessity: Relay Baton and Last Delivery are the two most obviously multi-character, event-driven passages in the set, and both families were repeatedly written against them by default rather than by deliberately surveying all 6 passages for usable material. It is not accidental in the sense of a bug, but it is not a deliberate, justified design choice either — no family in the source files' own docstrings claims Clock That Stopped or Crossing the Fen are unsuitable for comparative/emotion reasoning, and this correction proves they are fully suitable.

## C. Changes made

Five candidates were redistributed. In every case, only `passageId`, `question`, `acceptedAnswers`, `evidenceQuotes`, and `explanationGuidance` changed — `candidateId`, `blueprintId`, and `familyId` are untouched, preserving blueprint/family ancestry exactly.

| Candidate ID | Blueprint | Family | Old passage | New passage |
|---|---|---|---|---|
| `ei003-w2-comp-time-02` | `ei003-w2-bp-comp-across-time` | comparative | The Relay Baton | The Clock That Stopped |
| `ei003-w2-comp-simdiff-02` | `ei003-w2-bp-comp-similarity-difference` | comparative | The Last Delivery | The Clock That Stopped |
| `ei003-w2-emotion-arc-01` | `ei003-w2-bp-emotion-arc` | emotion | The Relay Baton | The Clock That Stopped |
| `ei003-w2-emotion-conflict-02` | `ei003-w2-bp-emotion-conflicting` | emotion | The Relay Baton | The Clock That Stopped |
| `ei003-w2-emotion-arc-02` | `ei003-w2-bp-emotion-arc` | emotion | The Last Delivery | Crossing the Fen |

Each new question was written to arise naturally from real material already present in the target passage's own text (verified by direct re-read of the passage file before writing any quote):

- **`comp-time-02`** (compare across time): narrator's stated expectation at the start ("I expected this to take an afternoon. It took most of that summer.") vs. stated feeling by August ("I remember feeling, by then, that we'd failed.").
- **`comp-simdiff-02`** (similarity + difference): narrator and grandmother both work the clock every Sunday morning all summer (similarity, shared action) vs. their divergent August states — narrator feels they've failed, grandmother "didn't seem to share this feeling" and keeps calmly testing (difference).
- **`emotion-arc-01`** (emotion arc): narrator's arc from confident expectation → August discouragement → sudden excitement on hearing the clock finally run ("I heard it from the hallway... and ran back in").
- **`emotion-conflict-02`** (conflicting evidence): the grandmother's outward composure ("'There,' she said, as though she'd expected this outcome the entire time") directly undercut by the narrator's own stated doubt ("though I've never been sure she really did") — a ready-made conflicting-evidence pair already present in the passage, not invented.
- **`emotion-arc-02`** (emotion arc): narrator's arc across the fen crossing — wary at the guide's warning → alert once Priti sinks into the mud → relieved reaching solid ground "just as the tide... began sliding back in behind us."

## D. Any additional original passages created

**None.** All five redistributions were achieved using the 6 passages already approved in Wave 2. No new passage was required, confirming the Founder's expectation that redistribution alone could likely resolve the concentration without needing further original writing.

## E. Final passage distribution

Recomputed by running `scripts/validate-ei003-wave2-manifest.mjs` and a dedicated exposure script against the corrected files:

| Passage | Count | % of 40 |
|---|---|---|
| The Last Delivery | 9 | 22.5% |
| The Clock That Stopped | 9 | 22.5% |
| Crossing the Fen | 9 | 22.5% |
| The Relay Baton | 7 | 17.5% |
| The Attic Workshop | 5 | 12.5% |
| The Glass Frog's Hidden Trick | 1 | 2.5% |

No passage exceeds 22.5% — inside the ~20-25% standard set for this correction. The two previously-dominant passages (Relay Baton, Last Delivery) have both dropped materially.

## F. Top-two concentration before vs after

| | Before | After |
|---|---|---|
| Top-two passages | The Relay Baton + The Last Delivery | The Last Delivery + The Clock That Stopped (or Fen — three-way tie at 9) |
| Top-two combined count | 21/40 | 18/40 |
| Top-two combined % | 52.5% | **45.0%** |

45.0% is below a majority (>50%), satisfying the Founder's explicit "avoid any two passages carrying a majority" requirement. Every possible pairing among the three passages now tied at 9 candidates each is also 18/40 = 45.0%, so no reordering of "top two" changes this result.

## G. Final genre distribution

| Genre | Count | % of 40 |
|---|---|---|
| fiction_narrative (Relay Baton + Last Delivery) | 16 | 40.0% |
| human_interest_memoir (Clock That Stopped) | 9 | 22.5% |
| travel_exploration (Crossing the Fen) | 9 | 22.5% |
| descriptive_prose (Attic Workshop) | 5 | 12.5% |
| nature_science (Glass Frog) | 1 | 2.5% |

Genre diversity has improved as a direct consequence of the passage rebalancing: human_interest_memoir and travel_exploration each moved from a smaller share to a full 22.5%, reducing fiction_narrative's dominance from 21/40 (52.5%) to 16/40 (40.0%). Glass Frog (nature_science) remains thin at 1 candidate — this was already true before the correction and is out of scope for a bounded redistribution task (the Founder's instructions authorized redistribution to fix concentration, not a general rebalancing of every passage to equal size).

## H. 40-candidate reconciliation

Total candidates before correction: 40. Total after correction: **40**. No candidate was added or removed — this was a pure redistribution, exactly as instructed ("Do NOT increase volume by default"). Confirmed programmatically via `scripts/validate-ei003-wave2-manifest.mjs`: `Total new candidates: 40`.

## I. 20-blueprint reconciliation

All 20 blueprints from the approved Wave 2 blueprint set remain represented, with unchanged per-blueprint candidate counts (only `passageId`/content changed on 5 candidates, never `blueprintId`). Confirmed programmatically: `Total new blueprints: 20`, and the standalone exposure script reports `Distinct blueprints represented: 20`. No blueprint was created, removed, or merged during this correction.

## J. Five-family reconciliation

| Family | Candidates (before) | Candidates (after) |
|---|---|---|
| `wave3-fam-rc06-sequencing` | 8 | 8 |
| `wave3-fam-rc07-comparative` | 8 | 8 |
| `wave3-fam-rc08-emotion` | 8 | 8 |
| `wave3-fam-rc10-atmosphere-mood` | 8 | 8 |
| `wave3-fam-rc10-word-choice` | 8 | 8 |

All five families retain their full approved depth (8/8 unchanged) and all still show 4 distinct blueprints per family (confirmed by the validator's per-family coverage output). No family was hollowed out by this correction.

## K. Quote/evidence-integrity revalidation

Every one of the 5 changed candidates was rewritten with `evidenceQuotes` re-sourced from a fresh, direct re-read of the real passage text in `lib/ali/questionFactory/ei003Wave2Passages.ts` (lines 110-127 for "The Clock That Stopped," lines 130-145 for "Crossing the Fen") immediately before writing each quote — the same discipline that caught 8 real quote-integrity defects earlier in Wave 2.

`scripts/validate-ei003-wave2-manifest.mjs` was re-run after all 5 edits. It independently verifies every `evidenceQuotes` entry as an exact substring of its (possibly new) passage's real text via `passage.text.includes(quote)`, checks blueprintId/candidateId uniqueness, passage/blueprint reference validity, family-blueprint consistency, non-empty acceptedAnswers/explanationGuidance, the ≥3-blueprint-per-family minimum, and duplicate-question detection.

Result: **`DETERMINISTIC VALIDATION: PASS`** — 0 problems, 40 candidates, 20 blueprints, 6 passages. No stale evidence strings survived the redistribution.

## L. Human review of changed content

All 5 changed candidates were read together with their new passage's full real text (not evidence quotes in isolation):

- **`comp-time-02`** — natural. The question asks the learner to compare two explicitly-stated feelings at two clearly separated points in time; both evidence quotes are unambiguous first-person statements. No accidental clue, no ambiguity, age-appropriate.
- **`comp-simdiff-02`** — natural, and notably avoids the ambiguous duplicate phrase in the source text ("only mildly interested, the way she might examine a puzzle with an unexpected extra piece," which appears twice, once re: a dropped gear and once near — but not identical to — the August passage) by instead using an unambiguous, single-occurrence quote for the grandmother's difference evidence. Correctly demands two independently-supported halves (similarity + difference), matching the blueprint's own contract.
- **`emotion-arc-01`** — natural three-point arc, each point textually distinct and explicit (expectation → stated failure feeling → the hallway/running-back-in moment). No emotion word is put in the narrator's mouth by the question itself; the learner must still infer "excitement" from the described action, preserving the family's core inferential demand.
- **`emotion-conflict-02`** — this is the strongest of the five: the passage already supplies a genuine conflicting-evidence pair (grandmother's composed line vs. narrator's immediate, explicit doubt) with no invention needed. Preserves the family's hardest (FAR_TRANSFER) demand faithfully.
- **`emotion-arc-02`** — natural three-point arc (guide's warning → Priti's near-accident → safe arrival with tide returning). One judgement call: the "wary at the start" evidence is technically the guide's warning to the group rather than a description of the narrator's own interior state — flagged here as a minor, disclosed interpretive step (a reasonable 11+ learner infers the narrator shares the group's wariness after being warned), not a defect, since the question asks about "feelings during the crossing" broadly and the arc's middle and end points are both unambiguous first-person-adjacent evidence.

**Representative sanity-check sample of unchanged candidates** (one per family, not from a redistributed passage): `ei003-w2-comp-reactions-01` (Relay Baton, unchanged), `ei003-w2-emotion-action-02` (Last Delivery, unchanged), `ei003-w2-atm-single-01` (Attic Workshop, unchanged), `ei003-w2-wc-conn-02` (Crossing the Fen, unchanged — passage itself now carries more total weight, but this specific candidate's content is untouched), and one sequencing candidate spot-checked directly in the source file. All read naturally, evidence quotes match the passage text on inspection, and no unintended interaction with the redistribution was found (sequencing and word-choice/atmosphere families were not touched by this correction and their candidates are unchanged).

## M. Anti-memorisation result

Before this correction, a learner encountering two of the six passages repeatedly (Relay Baton, Last Delivery) would have been exposed to 52.5% of all new Wave 2 content through just those two texts — a real memorisation/passage-recognition risk for the exact families this wave was designed to deepen. After correction, no single passage exceeds 22.5%, and the largest possible two-passage combination is 45.0% (below a majority). Genre concentration has also eased (fiction_narrative dropped from 52.5% to 40.0% of new content). This materially reduces passage-recognition risk while preserving all educational content exactly as approved.

## N. Tests/build status

- **Targeted Wave 2 test** (`tests/lib/learningEngine/englishExamStrategiesWave2Inference.test.ts`): 5/5 pass, including the check that no worked example leaks real candidate question text (this check specifically re-validates against the 5 newly-changed questions, since it dynamically imports all candidate files at test time).
- **Full regression suite** (`npm test`, 4,247 tests): **4,244 pass, 3 fail.** The 3 failures are `tests/lib/ali/questionFactory/candidateStoreMapping.test.ts`, `tests/lib/ali/questionFactory/mr03CoordinateBlueprints.test.ts`, and `tests/supabase/migration237PublishAnswerPersistenceCorrection.test.ts` — the same three pre-existing, already-confirmed-unrelated failures identified before this correction began (rooted in the pre-existing untracked `candidateStoreMapping.ts`/`mr03CoordinateBlueprints.ts` files and unrelated to Wave 2). **Zero new failures caused by this correction.**
- **Typecheck** (`npx tsc --noEmit`): all resulting errors are confined to the same two pre-existing unrelated files above (`ValidationResult.independentlyVerified` / `StructuralBlueprint.independentAnswerCheck` drift, and an implicit-any parameter in `mr03CoordinateBlueprints.ts`). **Zero typecheck errors in any of the 5 files touched by this correction** (`ei003Wave2ComparativeFamily.ts`, `ei003Wave2EmotionFamily.ts`).
- Build was not run standalone beyond typecheck, since (per the established lesson from Wave 1) local `next build` is unreliable while the pre-existing untracked cluster remains in the working tree; typecheck confirms the correction's own files are clean, consistent with how Wave 1 and the original Wave 2 report handled the same constraint.

## O. Material findings

1. The 52% concentration was real and correctly identified in the original Wave 2 report — this correction confirms it, not merely accepts the Founder's framing on faith.
2. Root cause is authoring habit (defaulting to the two richest-feeling passages), not a structural limitation of the other passages — Clock That Stopped in particular was under-used despite being fully suitable for comparative and emotion-inference reasoning.
3. Redistribution alone (no new passages) was sufficient to bring both the per-passage and top-two-combined concentration inside the Founder's stated bounds, confirming the instruction's own expectation that a small number of moves should suffice.
4. One minor, disclosed interpretive step in `emotion-arc-02` (inferring the narrator shares the group's warned-of wariness) — not treated as a defect, but recorded honestly per this session's standing disclosure discipline.
5. No regressions: identical pre-existing test/typecheck failures, zero new ones; all 20 blueprints and all 5 families' 8/8 depth preserved exactly.

## P. GO/REVISE/NO-GO for candidate-store submission

**GO.**

The passage-diversity correction is complete, bounded, and verified: 40 candidates preserved (no volume increase), 20/20 blueprints intact, 5/5 families at full approved depth, top-two passage concentration reduced from 52.5% to 45.0% (below majority), no passage above 22.5%, all 5 changed candidates' evidence deterministically re-validated with zero problems, representative human review found the changes natural and educationally coherent, and the full regression suite shows zero new failures. Nothing has been committed, submitted, reviewed, or published, and Wave 3 has not begun, per instruction.

**STOP. Do not submit. Do not publish. Do not begin Wave 3.**
