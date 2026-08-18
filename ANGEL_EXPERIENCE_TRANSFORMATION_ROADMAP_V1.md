# ANGEL 11+ — Experience Transformation Roadmap, V1

**Status:** Proposed staged sequence only. **Not implemented. Not begun.** Derived from the Gap Register's own dependency analysis, not a default template order.

---

## Sequence, derived from the evidence

**Stage 1 — Design-system foundation** (closes C2, C3; unblocks everything else)
Typeface selection and adoption; consolidate the seven card primitives into one governed system with resolved colour-key naming; formalise the existing spacing rhythm into named tokens. This is the correct first stage specifically because H2 (header pattern), H4 (loading polish), and the eventual card-level work inside every IMPROVE-classified page in the Benchmark document all become cheaper once this lands — doing page-by-page work first would mean redoing it once the foundation changes.

**Stage 2 — Keyboard interaction standard** (closes C1)
Named as a candidate "early high-value improvement" per the directive's own suggestion, and the Gap Register agrees: C1 has the highest learner-friction score of any single item and the lowest implementation dependency (it does not require Stage 1 to be useful, though applying the eventual visual focus-ring styling consistently benefits from Stage 1 existing first). **Recommendation: sequence this second, immediately after the type/card foundation, not deferred to "polish."**

**Stage 3 — Question/practice interaction shell** (closes H3)
Build the one shared question-rendering shell once Stage 1's primitives exist to build it from and Stage 2's keyboard patterns are proven on a real surface (Practice) before being propagated to Learn and Mock.

**Stage 4 — Learner dashboard re-hierarchy** (closes M1)
Re-centre around one primary action, using Stage 1's card/type system and Stage 3's shell for any embedded question preview.

**Stage 5 — Icon and copy sweep** (closes H1)
A policy-driven pass (Section K/R of the Experience System) across every existing surface — mechanically bounded once the policy exists, deliberately sequenced after the structural stages so it isn't redone when a page's layout changes underneath it.

**Stage 6 — Parent experience extension**
Extend the already-strong CSSE progressive-disclosure pattern (Benchmark Part 3) to every pathway, using the Stage 1-3 foundation.

**Stage 7 — Mock visual experience**
Apply the finished system to the Mock workspace (already semantically sound per 008E/008F) and the Mock report pages — a lighter lift than most stages, since the underlying structure is already correct.

**Stage 8 — Responsive/accessibility hardening**
A dedicated pass once every surface exists in its new form — auditing tablet-specific layouts (M2) and confirming universal `motion-reduce`/focus/ARIA coverage (M3), rather than re-checking each stage individually.

**Stage 9 — Commercial/public surface polish**
Landing/entry, onboarding — lowest priority per the evidence, since this session's own audit found no public marketing surface in the current scope with the same severity of findings as the authenticated product itself.

---

## Quick wins (separable from the structural sequence, safe to schedule opportunistically)

- Typeface adoption (Stage 1's own core action) is itself close to a quick win in isolation — one file, low risk, highest commercial-trust payoff identified in the entire benchmark.
- Icon sweep on the specific, already-named instances (`CssePathwayParentContent.tsx`'s three decorative icons) — small, bounded, no dependency on anything else.
- Loading-state skeleton treatment (H4/L1) — cosmetic, low-risk, can land any time after Stage 1.

## Structural changes (genuinely require sequencing, not shortcuts)

- Card system consolidation (C3) — touches every page that currently imports `components/ui/Card.tsx`; must be planned as a real migration, not a drive-by edit.
- Shared question shell (H3) — the largest single piece of structural work in this roadmap; deliberately placed after both the design foundation and the keyboard standard so it's built once, correctly, not iterated on live.
- Keyboard interaction (C1) — structurally larger than it first appears, since it touches every answer-input type (numeric/short-text/multiple-choice/multi-select/passage) individually, per the Experience System's own Section O.

---

*Document version: V1. Date: 2026-08-18. Sequence proposed only; no stage has been started. Each stage references the specific Gap Register item(s) it closes, not an assumed default order.*
