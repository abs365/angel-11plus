# WP-20: Knowledge Graph Authoring — Proposed Competency Relationships

**Status:** PROPOSED — PENDING HUMAN REVIEW. Nothing in this document is production data. No file in `lib/ali/` or `supabase/migrations/` is changed by this work package.
**Work package:** WP-20 (`IWP-002_ENGINE_INTEGRATION_PROGRAMME.md` §1), authorised after WP-19.
**Category:** Content authoring (human-owned) — the same category and review pattern as `WP-02_PROPOSED_METADATA.md` and `WP-15`'s Probability question proposals, per IWP-002 §5's own recommendation for this work package.
**Governing shape:** `CompetencyRelationship` (`types/ali/recommendations.ts`) — `fromCompetency`, `toCompetency`, `toSubject`, `relationshipType`, `strength`, `rationale`. No new shape is introduced; this proposal only adds candidate rows for the existing, already-approved structure.

---

## 1. What this document is and is not

This document proposes new `CompetencyRelationship` edges for Founder/educational review. It does **not**:

- Modify `lib/ali/recommendations.ts`'s live `COMPETENCY_RELATIONSHIPS` array (the array that actually feeds `computeCrossSubjectRecommendations()`, a live function).
- Wire any edge into WP-19's `recommendationRuntime.ts` (that runtime is explicitly direct-evidence-only today; extending it to shared-mechanism/sequential-dependency candidates is future work, gated on this proposal's approval).
- Wire anything into `buildDailyMission` or any other learner-facing surface.
- Fabricate a relationship to increase recommendation coverage. Every row below traces to a specific rationale already reasoned about in `AEP-002_KNOWLEDGE_FRAMEWORK.md` §5/§10 or `ALI_CROSS_SUBJECT_INTELLIGENCE.md` — none is newly invented by this work package. Where AEP-002 §10 named a relationship only at the level of a whole domain ("Numerical Reasoning (general)", "Verbal Reasoning (general)") rather than a specific competency code, it is **excluded** from this proposal (§5 below) rather than arbitrarily narrowed to a specific code — narrowing that vague reference to a concrete pair would itself be new, uncredited educational judgement, which this work package's authorisation ("author only evidence-supported... relationships") does not license.

---

## 2. Method

Source material, not re-derived: `AEP-002_KNOWLEDGE_FRAMEWORK.md` §5 (Learning Transfer Map) and §10 (Cross-Subject Relationships), which already consolidated `ALI_CROSS_SUBJECT_INTELLIGENCE.md`'s original graph with new findings and assigned each row an evidence rating in §12 ("New cross-subject/transfer links... Strong where the error itself is shared..., Moderate otherwise... grounded in real repository content and/or public research, but not yet validated against Angel's own student data"). This work package's only new contribution is:

1. Expanding each AEP-002 §10 row that named multiple concrete target competencies (e.g. "`maths.fractions` → `maths.money`/`maths.percentages`/.../`numreason.ratio-proportion`") into individual `CompetencyRelationship` rows, one edge per pair — the structure the type actually requires.
2. Checking each resulting edge's `fromCompetency`/`toCompetency` against the **real, currently-populated** competency vocabulary (`lib/ali/labels.ts`, `WP-02_PROPOSED_METADATA.md`) to mark it **Real** (both sides exist in live/tagged content today) or **Dormant** (one or both sides depend on content/tagging not yet approved) — the same honest distinction the one existing dormant edge in `lib/ali/recommendations.ts` already uses for `numerical-reasoning.fractions`.

---

## 3. Existing live edges (unchanged — for context only, not part of this proposal)

Already shipped in `lib/ali/recommendations.ts`'s `COMPETENCY_RELATIONSHIPS`: `vocabulary.synonyms→vr.synonyms`, `vocabulary.antonyms→vr.antonyms`, `vocabulary.in-context→english.vocabulary-in-context` (and its reverse), `maths.fractions→numerical-reasoning.fractions` (dormant), `vr.sequences→english.inference` (deliberately weak, never fires). None of these is touched by this proposal.

---

## 4. Proposed new edges

### 4.1 `maths.algebra`/`maths.powers-roots` ↔ `vr.letter-codes`/`vr.number-codes` — **REAL, immediately instantiable**

Both sides of every edge in this group are populated, real, live competency codes today (`lib/ali/labels.ts`).

| fromCompetency | toCompetency | toSubject | relationshipType | strength | rationale |
|---|---|---|---|---|---|
| `maths.algebra` | `vr.letter-codes` | verbal-reasoning | shared-mechanism | moderate | Shared rule-application mechanism (apply a consistent substitution/transformation rule), numeric vs. alphabetic domain. `AEP-002_KNOWLEDGE_FRAMEWORK.md` §5/§10. |
| `maths.algebra` | `vr.number-codes` | verbal-reasoning | shared-mechanism | moderate | Same mechanism as above, numeric-to-numeric domain — the closer of the two pairings. `AEP-002` §5/§10. |
| `maths.powers-roots` | `vr.letter-codes` | verbal-reasoning | shared-mechanism | moderate | Same shared rule-application mechanism. `AEP-002` §5/§10. |
| `maths.powers-roots` | `vr.number-codes` | verbal-reasoning | shared-mechanism | moderate | Same shared rule-application mechanism. `AEP-002` §5/§10. |

### 4.2 `maths.fractions` → `maths.money`/`maths.percentages`/`maths.ratio-proportion` — **REAL, immediately instantiable**

The AEP-001 §2.12 constitutional transfer chain (Fractions → Money → Ratio → Percentages → Probability), restricted here to the three steps where **both** sides are real, populated Mathematics competencies today. AEP-002 §10 classifies the whole chain as shared-mechanism (proportional reasoning underlies all four), not sequential-dependency — followed here exactly as rated, not reinterpreted.

| fromCompetency | toCompetency | toSubject | relationshipType | strength | rationale |
|---|---|---|---|---|---|
| `maths.fractions` | `maths.money` | maths | shared-mechanism | strong | Proportional reasoning underlies both; part of the AEP-001 §2.12 constitutional transfer chain. `AEP-002` §5/§10. |
| `maths.fractions` | `maths.percentages` | maths | shared-mechanism | strong | Same chain, same mechanism. `AEP-002` §5/§10. |
| `maths.fractions` | `maths.ratio-proportion` | maths | shared-mechanism | strong | Same chain, same mechanism. `AEP-002` §5/§10. |

**Probability step, restated honestly:** AEP-002 §5 itself names Probability as "a real gap — no probability competency exists anywhere in Angel's content, in any domain, today." WP-15's proposed Probability questions (`WP-15_PROBABILITY_PROPOSED_QUESTIONS.md` or equivalent, still pending review) do not yet constitute an approved, populated competency code, so no edge to a Probability competency is proposed here. This is the same real gap AEP-002 named, not a new one this work package found.

### 4.3 `maths.percentages`/`maths.ratio-proportion` → `numreason.percentages`/`numreason.ratio-proportion` — **DORMANT**

Both target competencies exist only as WP-02's still-pending tagging of `data/numerical-reasoning/*.ts` content (`WP-02_PROPOSED_METADATA.md`), not as an approved, live competency vocabulary. Structurally correct and worth keeping in the graph for the moment Numerical Reasoning tagging is approved, per the existing precedent for `numerical-reasoning.fractions`'s dormancy note.

| fromCompetency | toCompetency | toSubject | relationshipType | strength | rationale |
|---|---|---|---|---|---|
| `maths.percentages` | `numreason.percentages` | numerical-reasoning | shared-mechanism | strong | Same competency, different question format — real curriculum relationship, dormant until WP-02's Numerical Reasoning tagging is approved. `AEP-002` §10. |
| `maths.ratio-proportion` | `numreason.ratio-proportion` | numerical-reasoning | shared-mechanism | strong | Same as above. `AEP-002` §10. |
| `maths.fractions` | `numreason.money-measures` | numerical-reasoning | shared-mechanism | strong | Continuation of the §4.2 chain into the not-yet-approved Numerical Reasoning domain. Dormant. `AEP-002` §5/§10. |
| `maths.fractions` | `numreason.percentages` | numerical-reasoning | shared-mechanism | strong | Same. Dormant. `AEP-002` §5/§10. |
| `maths.fractions` | `numreason.ratio-proportion` | numerical-reasoning | shared-mechanism | strong | Same. Dormant. `AEP-002` §5/§10. |

### 4.4 `nvr.pattern-completion` → `vr.sequences` — **DORMANT**

`vr.sequences` is real and live; `nvr.pattern-completion` exists only in WP-02's still-pending tagging of `data/non-verbal-reasoning/*.ts` (11 questions tagged, per `WP-02_PROPOSED_METADATA.md` §`nvr.pattern-completion`).

| fromCompetency | toCompetency | toSubject | relationshipType | strength | rationale |
|---|---|---|---|---|---|
| `nvr.pattern-completion` | `vr.sequences` | verbal-reasoning | shared-mechanism | moderate | Shared rule-inference-from-examples mechanism, abstract visual vs. abstract symbolic domain. Dormant until WP-02's NVR tagging is approved. `AEP-002` §5/§10. |

### 4.5 `nvr.rotation` → `sr.rotation`/`sr.compass-grid-navigation` — **DORMANT, and additionally content-thin**

AEP-002 §10 rates this the "strongest-evidenced new link," since the *error* (clockwise/anticlockwise confusion), not just the skill, is shared. Both `nvr.rotation` and `sr.*` exist only in WP-02's still-pending tagging. Worth flagging beyond ordinary dormancy: `WP-02_PROPOSED_METADATA.md` records `sr.rotation` as the single thinnest-populated competency in the entire tagged corpus — **1 real question**, corrected down from an earlier document's stated 3. The relationship mechanism itself is well-evidenced; whether this specific edge would produce a *useful* recommendation once live (given how little `sr.rotation` content exists to recommend into) is a separate, real concern this proposal surfaces rather than resolves.

| fromCompetency | toCompetency | toSubject | relationshipType | strength | rationale |
|---|---|---|---|---|---|
| `nvr.rotation` | `sr.rotation` | spatial-reasoning | shared-mechanism | strong | Same mental-rotation skill; the *error itself* (not just the skill) is shared. Dormant until WP-02's NVR/Spatial tagging is approved. Target competency currently has only 1 real question — see caution above. `AEP-002` §5/§10; `WP-02_PROPOSED_METADATA.md`. |
| `nvr.rotation` | `sr.compass-grid-navigation` | spatial-reasoning | shared-mechanism | strong | Same mechanism, second target competency (12 questions tagged — not content-thin). Dormant until WP-02's tagging is approved. `AEP-002` §5/§10. |

---

## 5. Explicitly not proposed — vague or unfounded, excluded rather than narrowed

AEP-002 §10 names three additional rows this document does **not** turn into edges, because each names a whole domain ("(general)") rather than a specific competency code, and picking a specific target code on this work package's own authority would be new, uncredited judgement rather than operationalising an already-reviewed relationship:

- `maths.fractions` → Numerical Reasoning (general)
- `maths.powers-roots`/`maths.factors-multiples` → Numerical Reasoning (general)
- `maths.problem-solving` → Verbal Reasoning (general), rated **Weak** in AEP-002 §10 itself — even if narrowed to a specific code, AEP-002's own rating means this would never fire under `computeCrossSubjectRecommendations()`'s existing, unmodified "weak-strength edges never fire" rule (§6 below), so there is no practical value in resolving the ambiguity to add it.

No relationship outside AEP-002 §5/§10's already-reasoned set is proposed here. In particular, no edge is proposed purely to "fill in" a subject that currently has few or no cross-subject links — that would be exactly the fabrication-for-coverage this work package's authorisation prohibits.

---

## 6. Interaction with the existing safety rule (unchanged)

Per `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §4 (restated in AEP-002 §10, enforced today in `lib/ali/recommendations.ts`'s `computeCrossSubjectRecommendations()`): cross-subject evidence must never override, replace, or reduce the priority of a proven subject-specific weakness's remediation, and a `weak`-strength edge never fires regardless of source state. Nothing in this proposal changes that rule, and every edge above is `moderate` or `strong` — none would be excluded by the weak-edge rule, but none is exempt from the direct-evidence-always-wins rule either, if and when any of these are ever approved and coded.

---

## 7. Open naming inconsistency, flagged not resolved

`lib/ali/recommendations.ts`'s one existing dormant edge uses the full-word prefix `numerical-reasoning.fractions`. `WP-02_PROPOSED_METADATA.md` (the actual pending tagging of real Numerical Reasoning content) and `AEP-002_KNOWLEDGE_FRAMEWORK.md` §10 both use the abbreviated prefix `numreason.*` — the convention this proposal follows in §4.3, since it matches the real, already-authored (if not yet approved) content tags. Whichever convention is ultimately approved when Numerical Reasoning tagging is reviewed, the other naming's edges (including the one already live in `lib/ali/recommendations.ts`) will need renaming to match. This is a real, pre-existing inconsistency this work package surfaced while cross-checking real competency codes — not something WP-20 has the standing to resolve unilaterally, and not resolved here.

---

## 8. Summary table

| Group | Edges | Real today | Dormant |
|---|---|---|---|
| §4.1 algebra/powers-roots ↔ letter/number codes | 4 | 4 | 0 |
| §4.2 fractions → money/percentages/ratio (maths-internal) | 3 | 3 | 0 |
| §4.3 percentages/ratio/fractions → numreason.* | 5 | 0 | 5 |
| §4.4 pattern-completion → sequences | 1 | 0 | 1 |
| §4.5 rotation → sr.rotation/compass-grid-navigation | 2 | 0 | 2 |
| **Total proposed** | **15** | **7** | **8** |

---

## 9. What this document authorises

Nothing. No code file is created or modified by this work package. These 15 edges require explicit educational review and approval before any of them may be added to `lib/ali/recommendations.ts`'s live array, and the 8 dormant edges additionally require WP-02's NVR/Spatial/Numerical-Reasoning tagging to itself be approved first. Per this work package's authorisation: WP-19 remains unwired to any learner-facing surface, and no learner-facing recommendation presentation begins as a result of this document.
