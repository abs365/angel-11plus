# Release 0 — Execution Report

**Programme:** Angel Assessment Transformation Execution Programme — Release 0 (Governance and Evidence Foundation)
**Status:** Release 0 scope complete, as defined in the approved Implementation Roadmap's Wave 0.
**Prepared:** 2026-08-05
**Scope discipline:** Executed only the 4 items explicitly listed under Release 0's Scope. Did not begin Question Bank Transformation. Did not begin Mock Transformation. Did not modify Assessment Brain V1, Learning Engine V1, or Educational Intelligence Engine V1. Did not author assessment content.

---

## Item 1 — Applied Reasoning Evidence Governance Issue (AEP4-D05 / AEP4-C04)

**Implementation evidence:** Directly fetched and read, in full, both official CSSE 11+ Selective Test Information Guides already identified in the Evidence Register but never internally read for this purpose: the 2025 Entry edition (AEP2-066/012/088, published March 2024) and the 2026 Entry edition (AEP2-065, published March 2025). WebFetch's automated text extraction failed on both (compressed PDF streams, consistent with every prior CSSE PDF encountered in this program) — both were read directly via the Read tool's native PDF rendering, all 24 pages each.

**Finding:** Both editions' "What are the tests?" FAQ answer is **word-for-word identical**: *"Candidates will sit two tests. One in English and one in Mathematics. The English paper will last sixty minutes with ten minutes additional reading time. The Mathematics paper will last sixty minutes. The final scores for the individual papers are mathematically standardised and 'weighted', each being worth 50% of the marks."* Neither edition, nor any other section of either 24-page document, describes the English paper's internal structure — no mention of Applied Reasoning, Comprehension, Continuous Writing, or any sub-section, in either year.

**Resolution:** The claim in `CSSE_EXAMINATION_BLUEPRINT.md` §5 ("Applied Reasoning removed from September 2024") is **neither confirmed nor refuted** by this evidence — and now for a documented, structural reason: the CSSE Information Guide, as a document type, has never described the English paper's internal sections in any edition acquired by this programme. Its silence on Applied Reasoning is a property of what this document type covers, not information about whether the component still exists. Closing this question fully would require an actual English exam paper from 2024 Entry or later (the only papers this programme holds are 2021-2023 Entry, under KA-001) — a follow-up acquisition action, not something resolvable from documents already held.

**Validation evidence:** Cross-checked across 2 independently-dated editions (2025 and 2026 Entry) for internal consistency — identical wording confirms this is not a one-off omission in a single year's document.

**Regression evidence:** N/A — research/reading task, no code or content changed for this item.

**Production impact assessment:** None. No change to AR-01/QT-AR-01 classification, content, or presentation. AEP4-D05's status remains "Strengthen — evidence needed," now with a documented, specific reason why the two already-acquired candidate documents cannot settle it, and a specific, named next step (acquire an actual 2024+ English paper) rather than a generic "read the guides" instruction.

**Rollback assessment:** N/A — no change made.

---

## Item 2 — Consortium Membership Clarification (AEP4-D16 / AEP4-C05)

**Implementation evidence:** Using the same two Information Guide editions read for Item 1, both documents' "CSSE Schools" listing (with official school-type labels) and both documents' explicit total-membership statements were read and compared directly.

**Finding — resolved with real precision, going beyond the prior "10 vs 7" framing:**
- Both editions confirm the same **7 schools are officially typed "Grammar"** — Colchester County High School for Girls, Colchester Royal Grammar School, King Edward VI Grammar School, Southend High School for Boys, Southend High School for Girls, Westcliff High School for Boys, Westcliff High School for Girls. This is exactly this programme's existing 7-school research scope.
- Both editions confirm **Shoeburyness High School** ("Mixed Comprehensive," PAN 28) and **St. Thomas More High School for Boys** ("Boys R.C. Bi-Lateral Voluntary Aided," PAN 30) as stable CSSE members offering a small number of selective places alongside a predominantly non-selective intake — structurally different in kind from the 7 Grammar schools, consistent with how they were already described in the Phase 2 evidence (the "Partially Selective Schools" category in AEP2-005's score table).
- **New, previously-undocumented finding:** **St. Bernard's High School (Girls R.C. Bi-Lateral Voluntary Aided)** is listed as a CSSE member in the **2025 Entry** Guide (10 total members, explicit text: *"the same selective test is utilised by ten CSSE selective schools"*) but is **absent** from the **2026 Entry** Guide (9 total members, explicit text: *"the same selective test is utilised by nine CSSE selective schools"* and *"APPLICATION FOR SELECTIVE PLACES AT THE NINE CSSE SCHOOLS"*). This is a real, dated membership change — not previously recorded anywhere in the Phase 2, 3, or 4 corpus, which cited only AEP2-070's static "ten schools" figure from the Publication Scheme document.

**Resolution:** This programme's "7 named schools" scope is confirmed correct and principled — it exactly matches CSSE's own official "Grammar" category, not an arbitrary subset. The Consortium's *total* membership, however, is **not a fixed number** — confirmed 10 as of the 2025 Entry cycle, confirmed 9 as of the 2026 Entry cycle. Any future Angel content referring to "the CSSE Consortium" as a whole must either state a specific Evidence Year (per the newly-added `KNOWLEDGE_GOVERNANCE.md` §11.1, Item 3 below) or avoid a specific total-membership count entirely.

**Bonus finding, recorded not resolved:** The 2026 Entry Guide states Westcliff High School for Girls' PAN for 2026 entry as **184** — agreeing with Southend Council's own figure (AEP2-031) and disagreeing with WHSG's own "Determined Admissions Arrangements 2026-2027" document (AEP2-026), which states 192. This is now a **third independent data point**, 2 of 3 favouring 184. Per `KNOWLEDGE_GOVERNANCE.md` §11.3 (added under Item 3 below), this does not resolve AEP4-C01 — the conflict remains recorded as unresolved, since WHSG's own document is still a live, undated-superseded Level 1 source — but the weight of evidence is now disclosed accurately in the Conflict Register update below.

**Validation evidence:** Cross-checked across 2 independently-dated editions.

**Regression evidence:** N/A.

**Production impact assessment:** None — this is a research/evidence finding. No content, schema, or code was changed. It directly informs (but does not itself execute) any future Admissions Intelligence Activation work (Wave/Release 4 of the Roadmap).

**Rollback assessment:** N/A.

---

## Item 3 — Strengthen `KNOWLEDGE_GOVERNANCE.md` (AEP4-D15)

**Implementation evidence:** Added a new Section 11, "Admissions Data Governance," to `knowledge/KNOWLEDGE_GOVERNANCE.md` — 4 subsections: 11.1 Evidence Year (a mandatory field distinct from Publication Date), 11.2 Annual Re-Verification Cadence, 11.3 Conflicting Sources, Unresolved (a 6th Review Status value, admissions-scoped), 11.4 Relationship to Sections 1–10 (explicitly non-disruptive, additive only). Diff: +20 lines, 0 lines removed, Sections 1–10 byte-for-byte unchanged.

**Validation evidence:** Reviewed against AEP4-D15's own named acceptance-evidence requirement — all 3 elements it specified (evidence-year tag, re-verification cadence, conflicting-sources state) are present. Reviewed against Educational Intelligence Engine V1 §12's 6-dimension framework: educational/governance correctness confirmed (matches AEP4-D15's description exactly); explainability confirmed (each subsection states its own rationale inline); trust confirmed (the new section explicitly scopes itself to admissions data only and does not claim to alter Sections 1–10); regression confirmed by direct diff review — no existing section's text changed.

**Regression evidence:** `git diff knowledge/KNOWLEDGE_GOVERNANCE.md` shows a pure addition after the existing Section 10; no existing line was modified or deleted.

**Production impact assessment:** None. This is a documentation/governance-standard file with no code consumer today — no runtime behaviour, schema, or deployment is affected. It becomes load-bearing only once a future workstream (Admissions Intelligence Activation) begins populating admissions data and is expected to follow it.

**Rollback assessment:** Trivial. **Committed as `1dbd90a`** ("Angel Assessment Transformation Release 0 governance foundation", 2026-08-10) — `git revert 1dbd90a` fully undoes this change (that commit also contains Item 4's mock-exam change, so a revert undoes both together; a partial revert would need `git checkout 1dbd90a^ -- knowledge/KNOWLEDGE_GOVERNANCE.md` instead). Nothing yet depends on the new section, since no admissions data has been populated under it.

**Correction (2026-08-10):** this rollback assessment originally described the change as revertable while it was still an uncommitted working-tree diff — a `git revert` requires a commit, which did not yet exist at the time this report was first written (2026-08-05). The content and validation evidence above were accurate throughout; only the commit itself was missing. See `REPOSITORY_BASELINE_ASSESSMENT.md` (Release 1) for how this was found, and the commit line above for the correction.

---

## Item 4 — Ensure the Current Mock Is No Longer Presented as an Authentic CSSE Assessment (AEP4-D18)

**Implementation evidence:** 3 targeted, presentation-only edits to `app/learning-intelligence/mock-exam/page.tsx` (the CSSE-specific mock exam page; this file is not shared with the GL/CEM/ISEB pathways, which use separate components under `lib/adaptiveMockBuilder.ts` / `app/mocks/adaptive/gl/page.tsx` and were not touched):

1. Added a prominent, clearly-worded disclosure `InfoCard` on the intro screen, before the "Start mock exam" button, stating plainly that today's question set and timing don't yet fully match a real CSSE sitting, that completing it quickly or scoring well isn't a reliable readiness signal, and that content/timing expansion work is actively underway.
2. Softened the existing pre-start copy, which previously stated "this is a real exam condition" — a claim the Assessment Excellence Programme found is not accurate given the current timing model — to instead describe only the specific, true characteristic (no feedback until submission) without the broader authenticity claim.
3. Added a matching, shorter reminder on the results screen, since a parent reading a score is exactly the moment most likely to over-read it as a readiness signal.

**Deliberate scope decision, documented not silently made:** `components/parent/MockHistorySection.tsx` (which also displays past mock results, including CSSE ones, in the Parent Dashboard) was reviewed but **not modified**, because it is a shared, pathway-agnostic component also used by the GL pathway's mock history. Editing it risked bleeding CSSE-specific disclosure language into GL/CEM/ISEB pathway presentation, which Programme 001's Preservation Commitment explicitly protects. This is flagged as a candidate follow-up item, not completed here, and not silently dropped.

**Validation evidence:** `npx tsc --noEmit -p .` run against the full repository — **zero errors, exit code 0**. New copy manually reviewed against Educational Intelligence Engine V1 §12's Trust and Wellbeing Protection dimensions: the disclosure states the limitation factually and calmly, does not induce anxiety, does not imply the mock is broken or the child has done anything wrong, and is consistent with the Educational Safety Principle (§3, "no decision may increase a learner's anxiety").

**Regression evidence:** `git diff` confirms the changes are additive JSX/text only, inside the existing `intro` and `results` render branches — no change to `loadAndStart()`, `submitExam()`, the adaptive selection call, the timer logic, the grading logic, or any evidence-pipeline call (`recordPresentation`, `recordOutcome`, `processEvidenceForCompetency`, `recordReadinessSnapshot`). Full-repository type-check remained clean before and after.

**Production impact assessment:** This page is live-reachable in the current build. The change is presentational only — no behavioural, timing, content, or data-model change. Any learner or parent starting or completing a CSSE mock will now see the disclosure. No other page, pathway, or persisted data structure is affected.

**Rollback assessment:** Trivial. **Committed as `1dbd90a`** ("Angel Assessment Transformation Release 0 governance foundation", 2026-08-10) — `git revert 1dbd90a` fully undoes this change with no data or schema dependency (that commit also contains Item 3's governance-doc change; a partial revert would need `git checkout 1dbd90a^ -- app/learning-intelligence/mock-exam/page.tsx` instead).

**Correction (2026-08-10):** as with Item 3, this rollback assessment was written while the change was still an uncommitted working-tree diff; see the correction note under Item 3 for the full explanation.

---

## Summary

All 4 Release 0 scope items are complete. 2 items were evidence/governance work (no code touched); 2 items were real, narrow, presentation-and-documentation-only implementation work, each with clean type-check regression evidence and trivial rollback. No item touched Assessment Brain V1, Learning Engine V1, Educational Intelligence Engine V1, or any assessment content. No item began Question Bank Transformation or Mock Transformation.
