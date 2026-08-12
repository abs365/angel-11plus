# Continuous Writing Excellence Model V1

**Programme:** Angel Assessment Transformation Execution Programme — Release 1
**Prepared:** 2026-08-11
**Status:** Design only. No code, no scoring, no competency finalised in the schema sense — this is the model a future, separately-approved implementation phase would build against.
**Grounding:** `CONTINUOUS_WRITING_EVIDENCE_REVIEW_V1.md`, produced immediately before this document from direct primary-source reading, not assumed.

---

## 0. Why This Model Is Not a Single Uniform Pipeline

The Evidence Review found a real asymmetry: the **task** (what CSSE asks, its timing, its dual-genre structure, its double-marking process) is STABLE-PATTERN evidenced across all 3 years. The **marking/scoring** layer is not — the only rubric is undated, has a blank Grammar criterion for 3 of 4 bands, and never states how it maps onto the numeric totals. This model is deliberately built so that strength of evidence, not convenience, determines how confidently each stage can be built. Per the governing instruction, **TEACHING, PRACTICE, and ASSESSMENT are kept structurally distinct**, not blended into one "write an essay, get a score" loop — because blending them is exactly how a child needing targeted instruction ends up being handed complete essays and a number instead.

## 1. The Full Loop

```
DIAGNOSE → TARGETED TEACHING → COMPONENT PRACTICE → GUIDED APPLICATION →
COMPLETE WRITING → TIMED WRITING → ASSESSMENT → FEEDBACK →
DELIBERATE IMPROVEMENT → REASSESSMENT → MASTERY MAINTENANCE
```

## 2. The Working Dimension Set (Evidence-Bounded)

Per the Evidence Review §8, the official rubric supports exactly **5 dimensions**, no finer: **Ideas, Vocabulary (incl. spelling), Grammar, Structure, Punctuation.** Any further decomposition (planning, cohesion, sentence variety as distinct from sentence construction, tone/register, etc.) is **Angel's own educational interpretation, not CSSE-evidenced**, and must be labelled as such everywhere it appears — never presented to a parent as an official CSSE breakdown.

**Design choice, disclosed:** within "Structure" specifically (which the rubric bundles paragraphs + connectives + sentence variety together), a future implementation *may* choose to track sub-signals separately for teaching-sequencing purposes (e.g. "this child's paragraphing is weak but sentence variety is fine") — but this is an internal Angel interpretation layer sitting *underneath* the evidenced 5-dimension model, not a replacement for it, and any parent-facing language must stay at the evidenced 5-dimension level unless a future Founder decision explicitly approves surfacing the interpretive layer.

## 3. Stage-by-Stage Design

### DIAGNOSE
**Input:** existing writing evidence (prior submissions, if any) plus, where absent, a short diagnostic prompt. **Output:** a per-dimension status across the 5 evidenced dimensions — not a single score. **Evidence basis:** MEDIUM — the 5-dimension set is evidenced; *how* to diagnose status within each dimension from a child's actual writing is Angel's own educational judgement (no official diagnostic instrument exists). **Classification: mostly TEACHING-adjacent, informs what comes next — not itself an assessment event.**

### TARGETED TEACHING
Direct instruction on the single weakest evidenced dimension, not a generic "how to write well" lesson. E.g. if Structure is weak specifically because of paragraphing, teach paragraphing directly — short, focused, example-driven. **Classification: TEACHING.** No writing is scored at this stage. This is the stage the governing instruction is most concerned Angel currently skips (§10: "do not repeatedly give complete essays... requires targeted instruction first").

### COMPONENT PRACTICE
Short, low-stakes exercises isolating the taught skill — e.g. a paragraphing drill on a given paragraph-worth of jumbled sentences, not a full essay. **Classification: PRACTICE.** Feedback here is corrective and immediate, not a holistic score.

### GUIDED APPLICATION
A short piece of writing (a few sentences to one paragraph) deliberately applying the taught skill, with scaffolding (a partial structure, a sentence starter). **Classification: PRACTICE**, higher-stakes than component practice but still not a full timed sitting.

### COMPLETE WRITING
A full response to a CSSE-shaped prompt (reflective/discursive OR picture-narrative, matching the real 2-genre pattern), untimed. **Classification: PRACTICE**, the first point a whole piece is produced, but still not under exam conditions.

### TIMED WRITING
The same complete-writing task, now under the real ~20-minute-within-60 constraint (Evidence Review §2, STABLE PATTERN). **Classification: PRACTICE**, the closest rehearsal of the real condition, but explicitly not yet "the assessment" — a timed attempt with no formal record is still practice, matching this programme's own "practice ≠ mock ≠ production" discipline established throughout Release 1.

### ASSESSMENT
**This is the evidentially weakest stage, and must be built and disclosed as such.** Recommended minimum bar before any Assessment-stage implementation: (a) never claim a numeric score maps to real CSSE marks — the mapping is INSUFFICIENT EVIDENCE; (b) if a 0-100 or similar score is shown at all, it must be labelled as an Angel-internal progress indicator, not a CSSE-equivalent mark, replacing the current writing-feedback endpoint's unlabelled, CSSE-attributed score (Evidence Review §9a); (c) feedback content should stay within the 5 evidenced dimensions, described in the rubric's own terms where the rubric has terms (e.g. "ambitious vocabulary used appropriately," directly from Band 4's Vocabulary text), not invented adjectives; (d) Grammar feedback below the top band has no official description to draw on — flag this honestly rather than inventing what "insecure tenses" should look like.

### FEEDBACK
Directly tied to the Assessment stage's dimension-level output, in the same "what/why/what it would mean/what's next" pattern already established for Angel's recommendation explanations elsewhere in this programme (§1 of the governing Personalisation instruction) — not a generic AI-tutor voice untethered from the 5-dimension model.

### DELIBERATE IMPROVEMENT
A second targeted-teaching pass on whatever the Assessment stage found weakest, closing the loop back to stage 2 rather than starting a new topic — this is what distinguishes a genuine improvement loop from a content catalogue.

### REASSESSMENT
A second Complete/Timed Writing attempt, compared against the first on the same 5 dimensions — improvement is measured as a dimension-level delta, not a single score changing.

### MASTERY MAINTENANCE
Once a dimension is judged secure, it moves to periodic, lower-frequency maintenance practice rather than disappearing — the same "focus without forgetting" principle the companion Blueprint document designs generally, applied here specifically.

## 4. What This Model Explicitly Does Not Do

- Does not invent a CSSE-equivalent numeric mark.
- Does not decompose Continuous Writing more finely than 5 dimensions for anything presented as CSSE-evidenced.
- Does not replace the current writing-feedback endpoint (out of this increment's authority) — names it as a known gap for a future, separately-authorised implementation phase.
- Does not assume double-marking/moderation can or should be replicated by a single LLM pass — flags this as an open design question, not a solved one.
