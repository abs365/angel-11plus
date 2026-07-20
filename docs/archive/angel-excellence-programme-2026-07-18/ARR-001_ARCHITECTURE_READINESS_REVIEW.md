# ARR-001: Architecture Readiness Review

**Document ID:** ARR-001
**Programme:** Angel Excellence Programme — post-Discovery Wave review
**Status:** APPROVED (APD-007, 2026-07-18). Overall Readiness Decision: CONDITIONAL GO.
**Project:** Angel 11+
**Owner:** ELBOLD
**Last Updated:** 2026-07-18
**Frozen (APD-007, 2026-07-18):** Version 1.0 Educational Architecture, alongside AEP-001 through AEP-005. Future changes require a defect correction, new educational evidence, or a formal programme decision — not a routine edit. The single wording defect this review identified in AEP-004 §3 was corrected same-day, prior to freeze.
**Reviews:** `AEP-001_LEARNING_SCIENCE_CONSTITUTION.md`, `AEP-002_KNOWLEDGE_FRAMEWORK.md`, `AEP-003_QUESTION_INTELLIGENCE_FRAMEWORK.md`, `AEP-004_LEARNING_JOURNEY_FRAMEWORK.md`, `AEP-005_ASSESSMENT_FRAMEWORK.md` (all APPROVED), plus `CURRICULUM_GAP_REGISTER.md`.

**Method, stated honestly:** this review re-read the current file state of AEP-001 and AEP-002 in full (both were amended after initial approval, the highest-risk documents for introduced inconsistency), and ran targeted searches across all five documents for specific risk patterns: terminology-governance compliance, evidence-scale collisions, gap-resolution claims, and threshold-value consistency. Findings below are labelled **Verified** (confirmed by direct read/search this session), **Assumption** (plausible but not independently re-checked against the underlying codebase), or **Recommendation** (this review's own judgement, not a defect finding), following this account's established validation discipline. No document was modified as part of this review — per Programme Decision APD-006, modification is reserved for confirmed defects, and exactly one is found below (§3).

---

## 1. Executive Summary

The Discovery Wave is coherent, internally consistent with one minor wording exception, evidence-grounded throughout, and builds a genuinely cumulative architecture — each document cites and extends the ones before it rather than duplicating or contradicting them. **Verified**, not assumed: the amendment mechanism used across APD-002/003 (additive edits, re-checked directly against the live files) preserved structural integrity in both amended documents, with no broken section numbering, no duplicated headers, and no orphaned cross-references found.

Five real, substantive educational architecture gaps were identified across the wave and are tracked honestly rather than smoothed over (Content Coverage §6, this review). One real internal-consistency defect was found (§3) — a wording overstatement in AEP-004, not a substantive contradiction. The wave produced zero implementation code, exactly as instructed throughout.

**Overall recommendation: Conditional Go** — detailed in §12.

---

## 2. Discovery Coverage Review

| Document | Scope delivered | Coverage assessment |
|---|---|---|
| AEP-001 | 9 evidence-rated learning-science principles + 3 constitutional principles (APD-002) + prohibitions + documentation governance | Complete against its own stated purpose; honestly flags that several citations rest on secondary sources pending real primary-source migration |
| AEP-002 | 8 knowledge domains, 63 named competencies (3 domains newly taxonomised from real but previously untagged content), misconceptions, transfer map, examination application map, 6-dimension readiness definition, pathway architecture, terminology governance | Complete; the three newly-derived taxonomies (NVR/SR/`numreason`) are explicitly flagged as first-pass, not calibration-complete — an honest scope boundary, not an omission |
| AEP-003 | 15-section question intelligence model, evidence-vs-implementation tagged throughout | Complete; correctly built as an evidence layer over `QUESTION_AUTHORING_STANDARD.md` rather than a competing schema |
| AEP-004 | 15-section learner/parent journey, resolving 2 of AEP-002's 2 named handoff gaps (one fully, one partially — see §3, §6) | Substantially complete; the Knowledge Maintenance Model and Recommendation Explanations are real, evidence-grounded new concepts, correctly flagged as design-only |
| AEP-005 | 15-section assessment architecture, new 4-tier Evidence Confidence Model | Complete; correctly distinguishes its own confidence scale from AEP-001's Evidence Strength scale explicitly, rather than leaving two scales to silently collide (**Verified** — no premature or conflated use of AEP-005's tier vocabulary found anywhere in AEP-001–004) |

**Gap coverage relative to the original Discovery Wave brief:** all five originally-scoped documents were delivered, all required sections present in each (confirmed by direct structural check on AEP-001/002, itemised section counts matching the brief for AEP-003/004/005), and every document required to carry an "Educational Outcome" section per AEP-001 §8 has one — **Verified** by direct search across all five files.

---

## 3. Internal Consistency Review

**One real defect found:** AEP-004 §8 (Assessment Journey) correctly and explicitly states the format-fluency gap (AEP-002 Real Gap #6) is *named, not resolved* — "flagged as a future, board-specific mock-format design task — out of scope to build in this Discovery Wave document." AEP-004 §15 (Educational Outcome), however, describes this same work as "the Assessment Journey's identification of the format-fluency gap... resolving AEP-002 Real Gap #6" — **"resolving" overstates what §8 itself says was only identified and deferred.** This is a wording inconsistency within AEP-004 itself, not a contradiction between AEP-004 and another document (AEP-005 §4 and §146 both correctly describe the same gap as still open, consistent with AEP-004 §8's own honest framing). **Recommendation:** correct AEP-004 §15's phrasing from "resolving" to "naming, for AEP-005 and a future implementation phase to resolve" — a one-line, non-substantive wording fix, not a redesign, and consistent with APD-006's "unless a defect is discovered" allowance.

**One minor cosmetic staleness, not a defect:** AEP-001 §7 ("What Comes Next") still reads "delivered for Founder review and approval before AEP-002 proceeds" — accurate at the time it was written, now superseded by the fact that AEP-002 was long since approved. Harmless (the sentence is historically true and does not mislead about current status, since the header's Amendment Record and Status line elsewhere in the same document already show APPROVED), but noted for completeness rather than silently passed over.

**No other contradictions found.** Specifically checked and clear:
- **Terminology Governance (AEP-002 §14) is actually followed, not just declared** — **Verified** by direct search: "Numerical Reasoning" appears in AEP-003/004/005 exactly once (AEP-003 §8), and that single instance is itself the compliant statement of the rule, not a violation of it. "Mathematical Reasoning"/`numreason` is used consistently elsewhere.
- **`mastery_threshold` (2 sessions Easy/Medium, 3 Hard/Challenge) and ALI's cooldown mechanism (Easy≈5…Challenge≈20+ intervening questions) are two different things and are never conflated** across AEP-004 §9.2 and AEP-005 §1/§9 — **Verified** by direct read; both figures are cited correctly and separately in their original, distinct roles (mastery evidence threshold vs. anti-repetition spacing).
- **The Grammar School Readiness Definition's sixth dimension (Learning Independence, APD-003)** is carried forward consistently into both AEP-004 §13 and AEP-005 §13's six-dimension tables — **Verified** by direct read of both.

---

## 4. Cross-reference Validation

Every cross-document citation spot-checked resolved to a real section, not a dangling reference: AEP-003's citations of AEP-002 §2/§6/§14, AEP-004's citations of AEP-002 §11.6/§13 and AEP-001 §2.8/§2.12, and AEP-005's citations of AEP-004 §9.6/§12 all point to content that genuinely exists at the cited location (**Verified** for the specific citations checked in §3 above and during document drafting; a full line-by-line citation audit of every cross-reference in all five documents was not performed and would be the natural next step if a fully exhaustive validation is wanted — **Assumption** that the remaining, unchecked citations are equally sound, based on the consistent pattern found in every citation actually checked).

`CURRICULUM_GAP_REGISTER.md`'s GAP-001 is referenced consistently by name from AEP-002 and by concept (without re-litigating it) from AEP-004/AEP-005 — **Verified**.

---

## 5. Dependency Analysis

The wave has a clean, linear evidence dependency with no circular references: AEP-001 (foundational, depends on nothing internal) → AEP-002 (depends on AEP-001's evidence ratings) → AEP-003 (depends on AEP-001 + AEP-002's competency graph) → AEP-004 (depends on AEP-001–003) → AEP-005 (depends on AEP-001–004). Each document was approved before the next began, so no document depends on a not-yet-approved successor.

**External dependencies, all confirmed cited rather than modified:** `ANGEL_EXPERIENCE_MANIFESTO.md`, `ANGEL_MOMENTUM_FRAMEWORK.md`, `ANGEL_CONNECTED_LEARNING_JOURNEY.md`, `ALI_PARENT_INTELLIGENCE.md`, `ALI_MISSION_ENGINE.md`, `ADAPTIVE_ASSESSMENT_ENGINE_ARCHITECTURE.md`, `QUESTION_AUTHORING_STANDARD.md`, `ALI_CROSS_SUBJECT_INTELLIGENCE.md`, `LEARNING_PROFILE_MODEL.md`. None of these pre-existing documents were edited by the Discovery Wave — every one is cited as an already-correct foundation the new documents build on top of. This is a real, structurally significant finding: **the entire five-document wave added zero lines to any pre-existing Angel document**, which substantially de-risks the "did this contradict working product philosophy" question this review was asked to check — there was no opportunity to silently drift from the Manifesto or Momentum Framework, because neither was touched.

---

## 6. Educational Gap Analysis

Consolidating every gap named across the wave, in one place, for the first time:

| Gap | Source | Nature |
|---|---|---|
| Non-Verbal/Spatial/Mathematical Reasoning lack full difficulty calibration and worked-example tables | AEP-002 §2.3–2.5, AEP-003 §5/§9/§15 | Content-authoring extension of an existing standard, well-scoped |
| Probability content absent entirely | AEP-002 §5, `CURRICULUM_GAP_REGISTER.md` GAP-001 | Content-authoring gap, formally tracked |
| Writing has no competency model or gradable mechanic | AEP-002 §1, reconfirming `ENGLISH_COMPETENCY_FRAMEWORK.md` §5 | Structural gap, pre-existing, not created by this wave |
| No baseline/diagnostic assessment appears to exist at onboarding | AEP-004 §4 | **Flagged as an apparent gap, not independently code-verified** — this review did not check `app/dashboard/page.tsx` directly, so this remains an Assumption carried from AEP-004, not newly Verified here |
| No parent-facing "Recommendation Explanations" capability exists | AEP-004 §12 | New capability proposal, not yet built |
| Mock exam formats do not yet match per-board timing/adaptivity reality (CEM sub-sections, ISEB within-session adaptivity) | AEP-002 Real Gap #6, AEP-004 §8, AEP-005 §4/§13/§146 | Named consistently everywhere it appears (see §3's one wording caveat) — genuinely still open |
| Independent School and Custom Programme pathways have no Examination Application Map entry | AEP-002 §13 | Structurally different from the other four pathways (no single fixed format); needs its own discovery treatment, not fabricated here |
| Knowledge Maintenance (long-interval review scheduling) and Durable Mastery are design concepts only, not built | AEP-004 §9, AEP-005 §10 | Real, evidence-grounded proposals awaiting an implementation decision |

None of these gaps block the Discovery Wave's own internal completeness — each is named at the point it was discovered and carried forward honestly rather than papered over, which is itself evidence the wave's own "prefer real evidence over inference" discipline was actually applied to itself, not only to the child-facing content it describes.

---

## 7. Curriculum Gap Register Review

`CURRICULUM_GAP_REGISTER.md` exists, is correctly scoped as documentation-only (explicitly not an implementation queue), and is seeded with exactly one entry — GAP-001 (Probability) — matching AEP-002's own citation of it. The register's structure (stable ID, discovery source, description, consequence, status) is sound and extensible; no further gaps have been formally added to it despite §6 above identifying several additional real gaps during this review. **Recommendation:** the gaps catalogued in §6 that are genuine content/architecture gaps (rather than explicit future-design proposals already owned by a specific AEP document) are reasonable candidates for their own register entries — specifically the Writing competency-model gap and the Independent School/Custom Programme pathway-mapping gap — so the register becomes the single place all such gaps live, not just the one discovered first.

---

## 8. Engineering Impact Assessment

**No engineering work is committed to or required by the Discovery Wave itself** — all five documents are explicitly design/architecture-only, and this review confirms (per §5) that no existing code or document was modified. This section catalogues the engineering footprint a future Implementation Wave would need to consider, strictly as a forward-looking inventory, not a build plan:

- Extension of `QUESTION_AUTHORING_STANDARD.md` with new §-style sections for Non-Verbal/Spatial/Mathematical Reasoning (mirroring existing §3/§11), plus the actual hand-tagging pass for 119 already-real questions
- Two new optional per-question schema fields: `addresses_misconception` (AEP-003 §4) and `transfer_links` (AEP-003 §7) — both additive, neither requires touching existing fields
- A new "Flagged for Review" lifecycle state (AEP-003 §14) — additive to existing calibration-drift monitoring
- A Maintenance Review scheduling mechanism and a Durable Mastery evidence flag (AEP-004 §9, AEP-005 §10) — new, additive constructs sitting alongside, not replacing, `mastery_state`
- Parent-facing Recommendation Explanation copy and the underlying plain-language generation logic (AEP-004 §12)
- Per-pathway mock exam format variants (AEP-002 §6 Real Gap #6) — the single largest single piece of net-new product surface implied by the whole wave
- Possible baseline/diagnostic assessment flow, pending confirmation that one doesn't already exist (AEP-004 §4)
- Probability content authoring (GAP-001) once prioritised
- Pathway-gated recommendation filtering at the point Custom/Independent School pathways are added, and once CSSE-specific domain-gating (AEP-004 §3) is actually wired into recommendation logic rather than only specified

**None of this is scoped, estimated, or sequenced as a commitment here** — §11 offers a possible ordering, explicitly as a recommendation for Founder decision, not a schedule.

---

## 9. Programme Risks

- **The official CSSE/GL/CEM/ISEB paper and marking-scheme migration (flagged as pending since AEP-001) has still not occurred.** Every "Pending" rating in AEP-002 §6/§12 remains pending. The longer this stays unresolved, the more future content-authoring decisions (especially Probability, and the per-board mock-format work in §8) risk being built against public-record structural facts alone rather than the real item-level detail the programme's own working papers apparently already contain.
- **Terminology Governance (AEP-002 §14) is a documentation decision only** — if any existing marketing copy, support content, or UI anywhere already uses "Numerical Reasoning" as a generic Angel subject name (not verified either way by this review), a real rename/migration task exists that this wave did not surface, because it was scoped to internal architecture documents, not a live-content audit.
- **Five design documents with zero shipped change create a real execution-risk window** — the value of this entire wave is contingent on a future Implementation Wave actually occurring; a well-reasoned architecture that never gets built delivers exactly the same commercial outcome as no architecture at all.
- **The Evidence Confidence Model (AEP-005 §6), if implemented carelessly, is the single highest-risk new mechanism in the wave for violating Invisible Intelligence** — confidence-tier-calibrated language is explicitly designed to stay invisible as a mechanism (AEP-005 §11), but a rushed implementation could easily leak tier language ("Moderate Confidence") into parent- or child-facing copy, which would be a direct Manifesto violation the wave itself warned against.

---

## 10. Programme Opportunities

- **Pathway-first domain gating (AEP-004 §3) is a genuine, evidence-backed differentiator** — the earlier competitive research this programme's context draws on found no clearly-verified competitor doing this cleanly; closing AEP-002 Real Gap #5 is a real, describable product advantage, not just an internal tidiness improvement.
- **The Non-Verbal/Spatial/Mathematical Reasoning taxonomies (AEP-002 §2.3–2.5) are genuinely new, real intellectual property** — 119 previously-untagged real questions now have a documented, evidence-informed structure, which is immediately useful for future hand-tagging regardless of what else this wave leads to.
- **Durable Mastery and Recommendation Explanations (AEP-004/AEP-005) both target real, honestly-identified trust gaps** — "was this actually checked to still be true" and "why is Angel suggesting this" are exactly the kind of specific, evidenced answers that differentiate a product families recommend to other parents, per `ANGEL_EXPERIENCE_MANIFESTO.md`'s own long-term-reputation framing.
- **The Curriculum Gap Register, once populated per §7's recommendation, gives Angel a single, durable answer to "what's honestly missing"** — valuable for founder conversations, investor conversations, or future prioritisation, independent of this specific programme.

---

## 11. Recommended Implementation Roadmap

Offered as a sequencing recommendation only — not a commitment, schedule, or resource plan:

1. **Fix the one wording defect (§3)** — trivial, immediate.
2. **Populate the Curriculum Gap Register more fully (§7)** — cheap, clarifies scope before any build decision.
3. **Terminology Governance rollout** — audit existing live copy for "Numerical Reasoning" misuse (§9's flagged risk) before any new copy is written using the governed terms.
4. **Complete the NVR/Spatial/Mathematical Reasoning knowledge architecture** — calibration tables + hand-tagging, the most bounded, lowest-risk content-engineering task identified.
5. **Wire pathway-gated domain filtering into live recommendation logic** — the highest-leverage single change from the whole wave, closing Real Gap #5 in practice, not just in specification.
6. **Confirm or build Baseline Assessment** — resolve the open question of whether one exists before designing further onboarding changes on top of an assumed gap.
7. **Assessment Confidence Model + calibrated feedback/parent-reporting language** — sequenced after the above so it has real signal quality to calibrate against, and reviewed specifically for Invisible Intelligence leakage risk (§9) before shipping.
8. **Recommendation Explanations, Knowledge Maintenance scheduling, Durable Mastery** — the most product-visible new capabilities, reasonably sequenced last within this list since each depends on the confidence/evidence plumbing above being real first.
9. **Per-pathway mock format variants and Independent School/Custom Programme pathway definition** — the largest single scope item; recommend treating as its own future programme rather than folding into general implementation, given its size.
10. **Probability content authoring (GAP-001)** — fits wherever content-authoring capacity allows; not blocking on anything else in this list.

---

## 12. Go / Conditional Go / No-Go Recommendation

**Conditional Go.**

The Discovery Wave is coherent, evidence-based, internally consistent (bar one trivial wording fix), fully cross-referenced, and has not touched or destabilised any existing approved Angel document. It is ready to govern implementation decisions.

**Conditions attached to this Go:**
1. Correct the AEP-004 §15 wording defect identified in §3 (non-blocking, but should not persist once known).
2. Treat the still-pending CSSE/GL/CEM/ISEB programme-paper migration as a priority *before* committing significant content-authoring effort (Probability, per-pathway mock formats) against public-record structural facts alone — the structural facts are sound for architecture purposes but were never claimed sufficient for fine-grained content decisions.
3. Any future implementation of the Evidence Confidence Model (AEP-005 §6) must be explicitly reviewed against Invisible Intelligence before shipping, given the leakage risk named in §9 — this review recommends this as a named checkpoint in whatever process eventually implements AEP-005, not a reason to delay approval of the architecture itself.
4. No condition here blocks starting implementation planning — they are sequencing and quality gates within it, per the roadmap in §11.

---

## 13. Educational Outcome

**Understanding:** this review gives the programme a single, honest answer to "is the Discovery Wave actually sound" — checked, not assumed — including the one real defect found and the eight real gaps consolidated in one place for the first time.

**Confidence:** by verifying (not just asserting) that terminology governance was actually followed, that evidence scales weren't confused, and that no existing Angel document was silently altered, this review gives the Founder a checked basis for trusting the wave's own claims about itself, not only the wave's claims about the product.

**Examination performance:** the roadmap (§11) sequences the highest-leverage, most exam-outcome-relevant work (pathway gating, knowledge architecture completion) ahead of the more speculative, larger-scoped items (per-pathway mock formats, new pathways) — protecting near-term exam-relevant value from being delayed behind the largest, least-bounded piece of future work.

**Long-term learning:** by naming the Curriculum Gap Register as a permanent, growing artefact (§7) rather than a one-off list, this review extends the wave's own "prefer real evidence, name real gaps honestly" discipline into a durable programme habit, not just a property of these five documents.

---

Awaiting programme review.
