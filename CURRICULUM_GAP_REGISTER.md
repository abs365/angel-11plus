# Curriculum Gap Register

**Status:** Living document — append-only record of known curriculum gaps in Angel's knowledge architecture. Created 2026-07-18 per Programme Decision APD-003, item 3.
**Governing documents:** `AEP-001_LEARNING_SCIENCE_CONSTITUTION.md`, `AEP-002_KNOWLEDGE_FRAMEWORK.md`
**Purpose:** Record known gaps between Angel's real content/competency coverage and what a complete Grammar School knowledge architecture requires, so future educational releases can be prioritised against a single authoritative list rather than gaps being rediscovered independently each time. **This register does not implement content.** Adding an entry here is a documentation act, not a build commitment.

**How to use this register:** every entry has a stable ID (`GAP-NNN`, never reused), a discovery source, a description of the gap, its consequence if left unaddressed, and a status. New gaps discovered during any future AEP document, audit, or product review should be added here rather than left buried in the document that discovered them.

---

## GAP-001 — Probability

**Discovered:** 2026-07-18, `AEP-002_KNOWLEDGE_FRAMEWORK.md` §5 (Learning Transfer Map), while mapping the AEP-001 §2.12-mandated transfer chain Fractions → Money → Ratio → Percentages → Probability.

**Description:** No probability competency, question, or content exists anywhere in Angel — not in `maths.*`, not in `numreason.*`, not in any other domain. Every other step of the mandated transfer chain (Fractions, Money, Ratio, Percentages) has real, populated content; Probability is the one step with nothing.

**Consequence if left unaddressed:** the Learning Transfer Principle's illustrative chain (AEP-001 §2.12) cannot be completed end-to-end for any learner — proportional-reasoning transfer stops one step short of where the constitutional mandate points. Probability is also a standard topic across GL/CSSE/CEM/ISEB Mathematics content generally (structural fact, not yet paper-verified against migrated programme materials — see AEP-002 §6's evidence-provenance note).

**Status:** Open. Not implemented, not scheduled. No content authoring has occurred as a result of this entry — recording the gap is the entirety of this register's action per APD-003's explicit "do not implement new content" instruction.

---

## GAP-002 — Mock Exam Bank Naming/Mapping Misalignment

**Discovered:** 2026-07-18, during WP-04 (Pathway Eligibility Filter) implementation, while investigating whether the static mock exam system (`app/mocks/[pathway]/page.tsx`, `MOCK_CONFIGS`) could leak cross-pathway content the same way Daily Mission could before WP-04's fix.

**Description:** The static mock system has only four content banks (`vr`/`nvr`/`sr`/`nr`, `type BankKey`). Every pathway's section labelled "English" (or "English & Language," or "English Comprehension") actually draws from the **Verbal Reasoning** bank (`bank: "vr"`), and every section labelled "Maths"/"Mathematics" actually draws from the **Mathematical Reasoning** (`numreason`) bank (`bank: "nr"`) — not from the real curriculum English (`data/lessons.ts`) or Mathematics (`data/maths.ts`) content at all. This spans every pathway's config (`gl`, `cem`, `csse`, `iseb`), not only CSSE's.

**Consequence if left unaddressed:** a family sitting a static mock believes they are practising curriculum English/Mathematics content when they are actually practising Verbal/Mathematical Reasoning puzzle-style content under an English/Maths label — a real content-integrity issue distinct from (and arguably more consequential than) the cross-pathway recommendation leakage WP-04 closed, since it affects every pathway's static mocks, not just an out-of-pathway domain.

**Encouraging finding, recorded for completeness:** CSSE's static mock config specifically has no `nvr`/`sr` sections at all (only its mislabelled `vr`-as-English and `nr`-as-Maths sections) — so, despite the naming/mapping issue, it does not currently expose CSSE learners to genuine Non-Verbal/Spatial Reasoning content in the static mock system. The naming/mapping problem is real but is not, on its own, a cross-pathway leakage repeat of AEP-002 Real Gap #5.

**Status:** Open. Not implemented, not scheduled — per explicit instruction (APD-021), this was not modified as part of WP-04 and is reserved as its own future work package. Recommended scope for that future package: review bank naming, bank-to-section mapping, and pathway alignment across all four static mock configs.

---

## GAP-003 — No Baseline/Diagnostic Assessment Exists

**Discovered:** 2026-07-18, WP-13 (Implementation Programme), confirming with code-level evidence what `AEP-004_LEARNING_JOURNEY_FRAMEWORK.md` §4 had only flagged as an apparent gap.

**Description:** No baseline or diagnostic assessment exists anywhere in the codebase. `app/page.tsx` redirects straight to `/dashboard`; `app/getting-started/page.tsx` is a static, passive parent-facing guide, not an interactive assessment. A new learner's first captured signal is their pathway choice alone — every competency confidence band starts at "insufficient" with nothing to seed it sooner.

**Consequence if left unaddressed:** Daily Mission and every other recommendation surface run on zero learner-specific evidence for as long as it takes organic practice to accumulate it — correct behaviour given the evidence that exists, but slower to become genuinely personalised than it could be.

**Status:** Open. A full design exists (`WP-13_BASELINE_ASSESSMENT_FINDINGS.md`) — format, framing, journey placement, data model (reuses existing `ali_student_question_history`, no new schema). Explicitly not built as part of WP-13 — the actual new route/flow is a materially larger, product-surface-visible undertaking than this Implementation Programme's other work packages so far, and is recommended as its own future work package, not yet numbered in `IWP-001`.

---

*(Future gaps discovered during AEP-003 onward, or during any subsequent educational audit, should be appended below as GAP-004, etc., following the same structure.)*
