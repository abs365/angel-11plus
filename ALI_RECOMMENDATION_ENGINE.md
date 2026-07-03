# ALI Recommendation Engine

**Phase:** ALI Foundation Completion, Part 2 — Cross-Subject Recommendations. Implements the model designed in `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §1–§4, scoped conservatively per explicit instruction: direct evidence always wins, cross-subject inference only supplements, confidence stays conservative, recommendations only appear with sufficient evidence.

**What shipped:** `types/ali/recommendations.ts` + `lib/ali/recommendations.ts` (`COMPETENCY_RELATIONSHIPS`, `computeCrossSubjectRecommendations()`) — a small, hand-authored relationship graph and a pure function that reads existing `AliCompetencySignal` data (no new Supabase reads, no new stored data) and returns conservative supplementary suggestions.

**What did NOT ship:** any UI surfacing. `computeCrossSubjectRecommendations()` is not called from `lib/adaptiveEngine.ts`'s Daily Mission ranking, `lib/parentInsights.ts`'s Parent Insights, or any route — it is real, working code, computed and available, but **internal-only for now**, exactly the same status Learning Gain has held since Phase 1.4 (Decision 31: "not exposed to any UI in this phase... intended as a real signal for a future phase"). This matches the explicit "No UI redesign" scope boundary for this phase.

---

## 1. The relationship graph — hand-authored, not mined

`COMPETENCY_RELATIONSHIPS` (`lib/ali/recommendations.ts`) has 6 edges, grounded only in competency codes that actually exist in this codebase:

| From → To | Type | Strength | Live today? |
|---|---|---|---|
| `vocabulary.synonyms` → `vr.synonyms` | shared-mechanism | strong | **Yes** |
| `vocabulary.antonyms` → `vr.antonyms` | shared-mechanism | strong | **Yes** |
| `vocabulary.in-context` → `english.vocabulary-in-context` | shared-mechanism | strong | **Yes** |
| `english.vocabulary-in-context` → `vocabulary.in-context` | sequential-dependency | strong | **Yes** (the one live "moderate confidence" example) |
| `maths.fractions` → `numerical-reasoning.fractions` | shared-mechanism | moderate | No — dormant, numerical-reasoning has no ALI competency data yet |
| `vr.sequences` → `english.inference` | shared-mechanism | weak | No — deliberately weak, never fires (§2) |

Per `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §1.4: authored by hand against real curriculum structure, never inferred from usage correlation — the same "do not automate metadata generation" principle that governs every competency taxonomy in this project.

**A reclassification worth flagging, not silently making:** `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §1.2 originally sketched Vocabulary↔VR as `sequential-dependency`. On implementation, the Vocabulary→VR edges are reclassified as `shared-mechanism`/`strong`, because the concrete behaviour the instruction asks for ("**Strong** Vocabulary may support Verbal Reasoning") is mastery-driven — matching the shared-mechanism/mastered-source rule (§2), not the sequential-dependency/weak-source rule. The original design doc explicitly flagged its row-type categorisations as illustrative and "not relationships ALI can act on today" (§1.2's own caveat) — this is a refinement made when the abstract design met concrete implementation, not a silent contradiction.

---

## 2. Confidence tiers and the rules that produce them

**Only 2 of the 3 declared strength levels ever produce output** — deliberately conservative, not by omission:

- **High confidence** — a `strong` shared-mechanism edge, fires only when the source competency is genuinely `mastered` (real evidence-based mastery per `lib/ali/mastery.ts` — distinct-session evidence, never a single lucky attempt).
- **Moderate confidence** — a (non-weak) sequential-dependency edge, fires only when the source competency's real state is `weak`. Framed as "may help," explicitly never as a diagnosis of the target competency itself (`ALI_CROSS_SUBJECT_INTELLIGENCE.md` §3.2 rule 3's language requirement, carried through into the actual generated `reason` string, not just described in prose).
- **`weak`-strength edges never fire, regardless of source state.** `moderate`-strength shared-mechanism edges also never fire under the current rules (only `strong` shared-mechanism does) — two of the three declared tiers are permanently inert until real usage data justifies promoting them, per `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §5.4's explicitly deferred "numeric edge weighting."

---

## 3. Evidence threshold

The threshold is `mastery_state = 'mastered'` (for the high-confidence path) or `'weak'` (for the moderate-confidence path) — both already evidence-based, revocable states computed by `lib/ali/mastery.ts` from distinct-session evidence, not a single attempt. No additional volume threshold is layered on top: mastery itself already requires 2–3 distinct correct sessions (`ali_mastery_defaults`), which is a real evidence bar in its own right. Adding a second, separate threshold on top would be inventing precision this system's inputs don't support yet — the same restraint `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §1.3 already applied to edge weighting (qualitative strength, not a fitted numeric coefficient).

---

## 4. The safety rule, enforced structurally

**"Never recommend another subject if a proven weak competency still requires remediation"** is implemented as: a recommendation is only ever generated for a target competency that has **zero direct evidence** in its own subject's signal (`!attemptedCompetencies.includes(target)`). If a competency has been directly attempted at all — mastered, weak, or merely learning — this function produces no recommendation touching it, full stop. This isn't a priority-ordering rule that could theoretically be miscalibrated (e.g., "rank direct evidence higher, but still show both") — it's a hard exclusion, checked before any confidence tier is even considered. A cross-subject inference literally cannot be generated for a competency direct evidence already covers.

---

## 5. Fallback behaviour

No qualifying edge → `computeCrossSubjectRecommendations()` returns an empty array. Silence is the safe default — the function never manufactures a recommendation to have something to show. This matters given the current bar: with only 6 edges, 2 of them permanently inert, and 2 confidence tiers requiring real mastered/weak state on the source side, an empty array is the expected, common result for most students most of the time — that's a feature of staying conservative, not a bug to work around.

---

## 6. Validated (pure-function script, same technique as every prior phase)

- A mastered `vocabulary.synonyms` (with `vr.synonyms` untested) produces exactly one high-confidence recommendation naming both competencies by human label.
- The same scenario, but with `vr.synonyms` already directly attempted (any state) — produces zero recommendations for that competency, confirming the safety rule fires even when a real mastered source exists.
- A weak `english.vocabulary-in-context` (with `vocabulary.in-context` untested) produces exactly one moderate-confidence recommendation, framed as "may help."
- The `numerical-reasoning`-pointing and `weak`-strength edges never produce output under any tested signal combination.
- No recommendation ever references a raw competency code — every `reason` string uses `competencyLabel()`, reusing the same label dictionary Daily Missions and Parent Insights already depend on.

---

## Explicitly out of scope for this document

No route, mission-ranking change, or Parent Insights change is made here. If/when this is wired into a live surface, that is a separate, smaller, future decision — the hard part (the conservative rules and the safety guarantee) is already built and already testable in isolation.
