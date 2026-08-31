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

## Continuous Writing Practice Readiness (Decision 259)

Decision 258 found Writing Practice correctly gated by `eligibility_status = 'practice_eligible'` — no Writing prompt has ever been authorised onto that track, a Founder authorisation decision, not a defect. Decision 259 separated "is the content deep and varied enough to be worth authorising" from that authorisation decision itself, and replaces the single content-depth table above (which counts Writing only as a raw prompt count) with 5 explicit Writing-specific stages, none of which change `eligibility_status` on any content by themselves:

| Stage | Definition | Status |
|---|---|---|
| Foundation Depth | The 7 live/candidate QT-WC-01a rows (migrations 098, 153, 167) plus this decision's 2 new candidate rows (migration 169, NOT applied) exist, covering real-experience, opinion, and imagination response bases per docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md §5. | **Reached** — 9 authored (7 live/candidate + 2 new candidate), across 2 evidenced demand shapes (descriptive-reflective, narrative-imaginative) with no remaining structurally-identical pair left unaddressed by design (migration 169 targets the one found: cookopinion-01/screentime-01). |
| Practice Launch Readiness | Minimum inventory before Founder authorisation is worth considering: **at least 8 prompts spanning at least 3 genuinely distinct structural demand shapes** (not topic variation — e.g. narrated-event-with-change, descriptive-justificatory, direct-opinion, dilemma-engagement, bounded-imagination), so routine Practice does not repeatedly serve the same rhetorical task with a different noun. Reasoning: free-text Writing production has materially lower direct-answer memorisation risk than MCQ comprehension (Decision 258 §D), so the binding constraint is topic/demand rehearsal, not answer leakage — met primarily by structural variety, not raw count. | **Content-side threshold met** (9 authored, 4+ structural shapes once migration 169's 2 prompts are reviewed and promoted); **authorisation not requested or granted** — a separate Founder decision, out of this document's scope. |
| Practice Operational Depth | 12-14 prompts, each with an established support-level classification (Decision 256/257/258 architecture), sustaining variety across a normal multi-week Practice cadence without the same prompt recurring inside one rotation window. | Not yet reached — needs 3-5 more authored/reviewed prompts beyond Practice Launch Readiness. |
| Protected Assessment Reserve | A durable subset of prompts *never* served in routine Practice, held back for future Mock, reassessment, and transfer verification — sized so Mock's eventual launch is not forced to reuse Practice-seen material. Recommend reserving no fewer than 3-4 prompts once the pool is large enough that reserving them does not starve Practice itself; premature to size precisely at current volume. Requires a durable classification (e.g. a `practice_pool` vs `assessment_reserve` distinction) as its own future migration — not created by this document. | Design-only; no prompt is currently marked `mock_eligible` or reserved by any mechanism — none should be, per this decision's own constraint. |
| English Mock Readiness | Writing joins the separate English Mock programme once QT-WC-01b (picture-stimulus) readiness is resolved or explicitly descoped, and a genuine independent-review pathway for Writing Mock content exists (mirroring `mock_maths_independent_review`'s precedent for Mathematics). | Blocked — QT-WC-01b remains unimplemented (image generation/rights/storage/accessibility/rendering architecture does not exist); no Writing Mock review pathway exists yet. Writing stays excluded from Mock (unchanged since Decision 257 §G). |

**QT-WC-01b status:** still explicitly deferred, unchanged by this decision. No image pipeline, rights, storage, accessibility, learner-rendering, or review-rendering work has been started for it; nothing in Decision 259 begins it.

## Superseded

This document's original content-depth table (Decision 243 §12) is retained above for comprehension/passage tracking, which Decision 259 does not revise; Decision 243's full analysis (QT-RC coverage matrix, passage diversity, anti-memorisation model, singleton-family audit) remains the authoritative source and is not reproduced here. For Writing specifically, the 5-stage table immediately above supersedes the single "Writing prompts" column as the more accurate readiness model.
