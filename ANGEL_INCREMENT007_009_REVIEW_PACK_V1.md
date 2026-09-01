# Angel 11+ — Completion and Readiness Programme, Increments 007-009 Review Pack

**Purpose:** the bounded human-review batch for the Mathematics Gap-Archetype
authoring (Increments 007-009, migrations 170/174/176) and the Continuous
Writing checklist remediation (migration 173) produced under the Founder's
Completion and Readiness Programme directive, 2026-09-01. Mirrors the
established `ANGEL_007E_PILOT_REVIEW_PACK_V1.md` format. A qualified
reviewer should start here via `/admin-beta/review`, not the full backlog
— though note the known follow-up below (the UI's hardcoded per-batch
section has not yet been extended for these three new markers).

**Status: NOT YET REVIEWED. All content `authentic_assessment_candidate`,
all migrations unapplied.**

## Why these 8 targets

Every target below is source-evidenced (5 of the 6 Mathematics families
trace directly to a confirmed CSSE primary-source question, independently
re-read from the real paper and mark scheme this session; the 6th closes
a citation error found in Decision 226's own original citation), or is a
direct remediation of a Founder-identified defect (the Writing checklist).
None was authored to hit a volume target — each closes a specific,
evidence-named gap.

| # | Target | Type | Migration | Why this one |
|---|---|---|---|---|
| 1 | `mock-mr11-impossibletotal` | question_family (Mathematics) | 170 | Closes the highest-confidence SOURCE-CONTAINS gap from Decision 226 Section 7 (Frobenius-style impossible-total reasoning, 2022 Q5) — zero prior Angel content of this reasoning type existed anywhere. Also the pilot for this session's compound-answer scoring-contract question, since resolved (row -03 reuses the `mock-mr08-rotation`/Decision 174 terse-answer contract). |
| 2 | `mock-mr05-numberpyramid` | question_family (Mathematics) | 174 | Deepens the "Adequate" MR-02 competency with a genuinely new pyramid-deduction reasoning skill (2023 Q6) absent from every existing family — the only 3-subpart family this batch, spanning both additive and multiplicative pyramid rules. |
| 3 | `mock-mr13-toppingcombos` | question_family (Mathematics) | 174 | First-ever instantiation of QT-MR-13's own documented but previously-unclaimed combinatorial-counting sub-format (2023 Q16) — closes a named gap in the Question Type's own definition, not just a content-volume gap. |
| 4 | `mock-mr06-agenarrative` | question_family (Mathematics) | 174 | Deepens the well-populated QT-MR-06 group (4 existing families) with a genuinely distinct age-narrative structure (2023 Q17) — good test of whether family-level review distinguishes "same Question Type" from "same reasoning demand." Also carries a disclosed answer-format design decision (rewording to avoid the source's own "accept either answer" ambiguity) worth the reviewer's specific attention. |
| 5 | `mock-mr12-weightedmeancombine` | question_family (Mathematics) | 176 | The corrected 5th Decision 226 archetype (weighted-group mean, real source is 2023 Q19(b), not the originally-cited 2022 Q15 — a citation-fidelity correction disclosed in the migration's own header). Reviewer should independently confirm this citation correction, not take it on trust. |
| 6 | `mock-mr12-weightedmeanreverse` | question_family (Mathematics) | 176 | The algebraic reverse of #5 (2023 Q19(c)) — deliberately authored as its own family (not a subpart of #5) since it is a genuinely independent scenario, per this batch's own family-counting discipline. |
| 7 | `eng-inc003-writing-wc01a-favouriteplace` | writing_prompt | 169 (content), 172 (review registration) | Unchanged since Decision 259 — proceeding to review as originally authored, no defect found. |
| 8 | `eng-inc003-writing-wc01a-pocketmoney` | writing_prompt | 169 (content), **173 (checklist correction, review this AFTER 173 if applying in order)**, 172 (review registration) | The Founder identified this prompt's checklist reused two coaching items near-verbatim from `mock-writing-cookopinion-01`; migration 173 rewrites them to reflect the prompt's own genuine two-position-engagement demand. **Reviewer should assess the CORRECTED checklist (post-173), not the original migration-169 version**, if applying migrations before review. |

## What the reviewer needs

- Sign in with admin access, as for every prior batch.
- For the 6 Mathematics families: each migration's own SQL header carries
  the full evidence trail (SOURCE-CONTAINS citation independently
  re-verified against the real CSSE paper/mark scheme, overlap audit,
  7-condition authoring gate, two-method mathematical verification,
  subpart-independence proof, anti-memorisation audit) — read the
  migration file directly if the review UI's own summary is insufficient,
  exactly as this project's established practice recommends.
- **Independent verification available**: `scripts/verify-increment007-009-mathematics-answers.mjs`
  re-derives all 13 Mathematics answers from scratch by code (not by
  re-reading the hand-worked steps) — run it (`node scripts/verify-
  increment007-009-mathematics-answers.mjs`) for a fast, independent
  confirmation before or during review. 13/13 passed when last run this
  session.
- For the 2 Writing prompts: migration 169's header has the QT-WC-01a
  evidence basis; migration 173's header has the specific checklist
  defect and correction rationale for target #8.
- Known UI gap (disclosed, not yet fixed): `/admin-beta/review`'s
  hardcoded per-batch section lookup has not been extended for the
  `MOCK-STRUCTURAL-CAPACITY-INCREMENT007/008/009` markers — the
  `ali_family_review` placeholder rows exist and are queryable, but may
  not render in a dedicated section without that follow-up UI change
  (mirrors the exact gap Decision 250/251 found and fixed for English
  Increment 003 — same fix pattern would apply here).

## What has NOT happened yet

No migration (169-177) has been applied. No `eligibility_status` has
changed. No content has been activated for Practice or Mock. This pack
exists so review can begin efficiently once the Founder authorises
application — it does not itself constitute or imply review.
