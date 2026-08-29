# Angel English Content Roadmap V1

**Status:** Planning document. Records Decision 243's content-depth roadmap and Decision 244's explicit correction to it (§11). Documentation only — no code, no migration, no implementation of any item below.

## Content-depth stages (Decision 243 §12, unchanged)

| Stage | Passages | Numbered comprehension experiences | Writing prompts |
|---|---|---|---|
| FOUNDATION DEPTH (current + Increment 003) | 8 | ~55-60 | 7 |
| OPERATIONAL DEPTH | 14-16 | ~100-120 | 10-12, 2+ task shapes |
| SUSTAINABLE DEPTH | 22-26 | ~160-190 | 15+, incl. QT-WC-01b once its own architecture increment lands |

## Parallel Product Experience Track (Decision 244 §11 — supersedes Decision 243 §M timing)

Decision 243's original recommendation placed the 5 known English experience issues (review-UI provenance overexposure, passage typography, Writing workspace basicness, hand-rolled controls, tablet/mobile reading verification) at the **Operational Depth** boundary. Decision 244 explicitly overrides this: deferring all learner-experience work until 14-16 passages exist risks letting content volume outrun product quality.

**Corrected position:** a parallel product-experience track begins **during Foundation Depth** (i.e. now, alongside Increment 003), tracked separately from content authoring, not gated on reaching Operational Depth. This is a scheduling correction only — no design or implementation work is authorised by this document. The five items, in the order they become load-bearing as content volume grows:

1. Learner passage typography/readability — becomes load-bearing as soon as Increment 003's 3 new passages (8 total) are read by real learners.
2. Removal of technical/internal terminology from learner-facing surfaces — independent of content volume, should not wait on any passage count.
3. Tablet/mobile reading experience verification — same reasoning as (1).
4. Writing workspace — becomes load-bearing once the Writing prompt pool diversifies (Increment 003 adds the first non-reflective/discursive task shape).
5. Hand-rolled controls / design-system consolidation — the admin Educational Review UI redesign specifically **may remain secondary** to the four learner/parent-facing items above, per Decision 244 §11's explicit instruction.

No item above is scheduled, scoped, or implemented by this document. This is a roadmap-position correction only, to be actioned as its own future Decision.

## Superseded

This document's content-depth table reproduces Decision 243 §12 for a single reference point; Decision 243's full analysis (QT-RC coverage matrix, passage diversity, anti-memorisation model, singleton-family audit) remains the authoritative source and is not reproduced here.
