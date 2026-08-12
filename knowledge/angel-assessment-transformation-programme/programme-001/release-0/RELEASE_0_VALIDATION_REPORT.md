# Release 0 — Validation Report

**Programme:** Angel Assessment Transformation Execution Programme — Release 0 (Governance and Evidence Foundation)
**Status:** All Release 0 validation requirements complete.
**Prepared:** 2026-08-05

---

## Validation Framework Applied

Per `ASSESSMENT_TRANSFORMATION_BLUEPRINT_V1.md` §11 and `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §12, every item is checked against the relevant dimensions of the 6-dimension framework (technical correctness, educational correctness, explainability, trust, wellbeing protection, regression) — applied selectively per item, since not every dimension applies to every item (e.g. wellbeing protection is not meaningful for a governance-document addition with no parent-facing surface).

---

## Item 1 — Applied Reasoning Evidence Governance Issue

| Dimension | Result |
|---|---|
| Educational correctness | **Pass.** The finding (Information Guides never describe internal paper structure, in either edition read) is a direct, verifiable observation from the primary source text itself, not an inference. Both editions' relevant FAQ text quoted verbatim in the Execution Report and matches exactly. |
| Trust | **Pass.** No claim is made that Applied Reasoning is present or absent — the report states plainly that the question remains open and names the specific reason and the specific follow-up action required. This is the correct trust posture under the "do not fabricate missing... educational conclusions" rule. |
| Explainability | **Pass.** The resolution states exactly which 2 documents were read, exactly what they do and do not contain, and why that specific document type cannot answer the question. |
| Regression | N/A — no code or content changed. |

**Independent cross-check performed:** the 2025 and 2026 Entry Guide FAQ text was compared side-by-side; both are word-for-word identical on this point, which is itself the evidence that the silence is structural (a document-type property) rather than a single year's omission.

## Item 2 — Consortium Membership Clarification

| Dimension | Result |
|---|---|
| Educational correctness | **Pass.** The 7-Grammar-school scope finding and the 9-vs-10-member finding both trace directly to quoted primary-source text (school-type labels, explicit membership-count statements) in 2 independently-dated official documents. |
| Trust | **Pass.** The report does not claim the Consortium's membership is now permanently "9" — it explicitly states membership is not fixed and should be re-checked at each future guide edition, consistent with the newly-added `KNOWLEDGE_GOVERNANCE.md` §11.2 (Annual Re-Verification Cadence). |
| Explainability | **Pass.** The distinction between the stable 7 Grammar schools, the stable 2 "bi-lateral/comprehensive" partial members, and the 1 member whose status changed between editions (St Bernard's) is stated explicitly, not collapsed into a single number. |
| Regression | N/A — no code or content changed. |

**Independent cross-check performed:** the "CSSE Schools" listing and the explicit total-membership sentence were checked in both the 2025 Entry and 2026 Entry Guides; the discrepancy (10 vs 9, with St Bernard's specifically absent from the later edition) was confirmed by direct comparison of both documents' own text, not inferred from one document alone.

**Bonus finding validation:** the WHSG PAN figure (184) found in the 2026 Entry Guide was cross-checked against the already-registered AEP2-026 (192, WHSG's own document) and AEP2-031 (184, Southend Council) — confirmed as a genuine 3rd data point, correctly recorded as strengthening but not resolving the existing conflict (AEP4-C01), per `KNOWLEDGE_GOVERNANCE.md` §11.3's explicit rule against resolving a Conflicting-Sources-Unresolved fact by convenience or majority count.

## Item 3 — `KNOWLEDGE_GOVERNANCE.md` Strengthening

| Dimension | Result |
|---|---|
| Technical correctness | **Pass.** Markdown renders correctly; section numbering (11, with 11.1–11.4) is sequential and does not collide with existing Sections 1–10. |
| Educational/governance correctness | **Pass.** All 3 elements named in AEP4-D15's acceptance-evidence requirement are present: Evidence Year (§11.1), annual re-verification cadence (§11.2), conflicting-sources-unresolved state (§11.3). |
| Explainability | **Pass.** §11's own opening paragraph states why the section exists, what it does and does not change, and cites the specific decision (AEP4-D15) and specific evidence (the Conflict Register) that motivated it. |
| Trust | **Pass.** §11.4 explicitly states this section does not alter Sections 1–10, preventing any reader from assuming a broader governance rewrite occurred. |
| Regression | **Pass.** `git diff` confirms Sections 1–10 are byte-for-byte unchanged; the addition is purely appended content. |

## Item 4 — Mock Disclosure

| Dimension | Result |
|---|---|
| Technical correctness | **Pass.** `npx tsc --noEmit -p .` — full-repository type-check, **zero errors, exit code 0**, run after the change. |
| Educational correctness | **Pass.** The disclosure content matches the Execution Report's own findings exactly (content pool depth, timing structure) — it does not overstate or understate the gap. |
| Explainability | **Pass.** Both the intro-screen and results-screen copy state plainly what is currently limited and why a quick or high score shouldn't be read as a readiness signal. |
| Trust | **Pass.** The previous "this is a real exam condition" claim, which the Assessment Excellence Programme found inaccurate given the timing model, is removed rather than left standing alongside a new disclaimer that would have contradicted it. |
| Wellbeing protection | **Pass, reviewed with the extra scrutiny `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §3 (Educational Safety Principle) requires for anything admissions/exam-proximity-adjacent.** The copy was deliberately worded to avoid alarm ("still being expanded," "we're actively expanding") rather than deficit-framing ("this mock doesn't work") — informs without inducing anxiety. |
| Regression | **Pass.** `git diff` confirms changes are confined to 2 JSX render branches (`intro`, `results`) inside `mock-exam/page.tsx`; no change to any function, hook, state variable, or evidence-pipeline call. GL/CEM/ISEB pathway files (`lib/adaptiveMockBuilder.ts`, `app/mocks/adaptive/gl/page.tsx`, `components/parent/MockHistorySection.tsx`) confirmed untouched by `git status`. |

---

## Cross-Item Validation: Permanent Covenant Preserved

Confirmed directly, not assumed:
- `docs/intelligence/ASSESSMENT_BRAIN_V1.md` — untouched (`git status` confirms no change).
- `docs/intelligence/LEARNING_ENGINE_V1.md` — untouched.
- `docs/intelligence/EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` — untouched.
- Adaptive Selection (`lib/learningEngine/adaptiveMockPaperBuilder.ts`), Evidence Pipeline (`lib/ali/history.ts`, `lib/learningEngine/educationalIntelligenceService.ts`), Mock Attempt Ledger (`lib/mockProgress.ts`) — untouched.
- GL, CEM, ISEB pathway architecture — untouched, and explicitly not touched by design in Item 4 (see the Execution Report's "deliberate scope decision" note re: `MockHistorySection.tsx`).

## Overall Validation Result

**All 4 Release 0 items pass validation against every applicable dimension.** No item required a fix-and-retest cycle. No regression was found in any dimension checked.
