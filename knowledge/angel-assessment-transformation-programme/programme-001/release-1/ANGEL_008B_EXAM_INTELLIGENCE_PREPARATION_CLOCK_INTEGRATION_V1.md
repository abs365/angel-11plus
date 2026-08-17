# Angel 11+ — 008B: Exam Intelligence + Preparation Clock Product Integration V1

**Programme Increment 008B.** Prepared 2026-08-17. Founder-authorised. Continues from Decision 83 (008A CLOSED). Purpose: turn the 008A architecture into real, bounded product value — no Mock work, no schema change (none was needed).

---

## 1. Baseline

Re-verified live: TOTAL 312, Practice Eligible 295, Mathematics PE 175, English PE 120, Provisional 17, Mock Eligible 0. `main` = `origin/main` at `a89bb56`, clean tree. Full suite 514/514 before any change.

---

## 2. Current-state trace (before implementation)

`getTargetExamDate()`/`setTargetExamDate()` (`lib/progress.ts`) already existed (WP-09/EAW-004), storing a raw date in `UserProgress` (localStorage) with **no provenance field at all** — every date has always been implicitly parent-supplied, but the code never said so. `year_group` exists only in the `beta_family_applications`/`testimonials` marketing tables — **the real `profiles` table has no such column, and `derivePreparationStage()`'s `schoolYear` parameter has never had a real caller anywhere in the app** (a gap 007W itself disclosed and left open). `preparationState.ts`/`preparationClock.ts`/`preparationStage.ts` (Decisions 75-78) are correct and complete as evidence-composition/derivation layers — confirmed by re-reading, not duplicated. Recommendation Centre, Revision Planner, Admissions Readiness, Mock Readiness, and Readiness Timeline were already confirmed real-ALI-driven in 007W (Decision 76) — re-confirmed unchanged, not rebuilt. No existing "Exam Information" surface existed anywhere.

---

## 3. Schema change required: **No**

Both gaps (`year_group`, exam-date provenance) are solved by extending the existing `UserProgress` localStorage container — the same mechanism `targetExamDate` itself has always used — with two new optional fields (`schoolYear`, `targetExamDateProvenance`). No Supabase migration, no new table. This is the smallest safe model, reusing established architecture exactly as instructed.

---

## 4. Target Exam Profile / exam-date provenance

`UserProgress.targetExamDateProvenance: "official" | "parent_supplied" | "estimated" | "unknown"`. `setTargetExamDate()` now always writes `"parent_supplied"` (the honest, correct value for every write this function has ever made — no official-date source exists anywhere in this codebase). A pure core, `deriveExamDateProvenance()`, returns `"unknown"` both when no date exists and when a date predates this field — **never silently upgraded to a more certain provenance than the evidence supports**. `CSSE_EXAM_AUTHORITY_NAME`/evidence facts (§9) supply the exam-authority identity; no date-of-birth field was added (§8 confirms this is unnecessary).

---

## 5. Preparation Clock product integration

`resolvePreparationClock()` reused unchanged. The Exam Information card (§9) surfaces `daysRemaining`/`weeksRemaining` with an honest "add your exam date to see time remaining" fallback when absent — never a fabricated countdown.

---

## 6. Preparation Stage operationalisation

007W's own `stagePrinciple()` is now fed a REAL `schoolYear` for the first time (`app/dashboard/page.tsx`'s `derivePreparationStage()` call, previously always `undefined`) and surfaced again on the Exam Information card via the same real evidence-composition pipeline (`computeSubjectPreparationSummary` × 3 + clock + schoolYear). No second stage system was built.

---

## 7. Year-group and evidence safeguards (Part 8/24, all 8 scenarios A-H proven directly)

`tests/lib/learningEngine/yearGroupSafeguards.test.ts` now covers the full A-H set (A/B/D/F from 007W, C/E/F/G/H added this increment): early Year 5 mixed evidence resolves to a real intermediate stage; late Year 5 strong-but-untimed still respects the Year 5 cap (the stage layer has no timed-experience concept — correctly out of its scope, named as a Mock-layer gap in 008A §8); early Year 6 mixed readiness is never flattened to an extreme; an unknown year group resolves identically to Year 6 (its documented safe default, never a restriction); a year group present with an unavailable exam date still derives its real evidence-only stage ceiling, never fabricating urgency from a missing clock. 12/12 passing.

---

## 8. Privacy

Date of birth was not added and remains unnecessary — school year (parent-typed, three options) plus target exam date are sufficient for every computation in this increment. Both fields are optional, never asked of the child, stored in the same existing localStorage container as `targetExamDate` always has been (no new server-side PII).

---

## 9. Exam Information experience

Added to the existing **"School Intelligence"** page (`app/pathways/page.tsx`) rather than a new top-level route, per the directive's own instruction to find the best existing location first — this page already owned the exam-date input and pathway identity, making it the natural home. New: a School Year selector (three buttons, optional, matching the existing exam-date form's own visual style); an "Exam Information" card (CSSE pathway only) showing time remaining, current-focus (`stagePrinciple`), and a canonical, single-source (`lib/examIntelligence/csseEvidence.ts`) list of official facts, each labelled "According to current CSSE guidance," explicitly distinct from Angel 11+'s own preparation strategy text, with a "last verified" date. The medium-confidence Continuous Writing marks/weighting figure (008A's own disclosed limitation) is **not** silently upgraded — it remains in the full evidence record but is deliberately excluded from the parent-facing fact list (`getCurrentCsseFacts()` only returns `official_exam_fact`-category entries), proven directly by test.

---

## 10. Child vs. parent boundary

This increment's new surfaces are parent-facing only (`app/pathways/page.tsx`, the existing "School Intelligence" destination, not a child-facing route). The dashboard's own tagline change (§6) is the only child-visible effect, and it already passed 007W's own copy-safety bar (`stagePrinciple()`, tested for banned engine terminology).

---

## 11. Recommendation integration / Today's Mission

**Deliberately conservative, exactly as instructed.** The only change to Today's Mission is that `derivePreparationStage()` now receives a real `schoolYear` instead of always `undefined` — since `undefined` and `"Year 6"` resolve identically (§7, Scenario G), and no real learner in this session's own production account has a `schoolYear` set yet, **this change is currently a no-op in production** until a parent actually sets a school year via the new form. ALI evidence remains the sole driver of subject/skill selection and reason text (007W, unchanged). The 007W determinism contract was re-run and remains intact (§14).

---

## 12. Writing and Mock boundaries

Writing PE remains 0; no Writing content was authored or made actionable. The Exam Information card's evidence list may truthfully state that Continuous Writing is part of the CSSE English paper (§9's evidence, `official_exam_fact`) without recommending unavailable Writing practice — the card is informational only, not a recommendation surface. Mock Eligible remains 0; no Mock content, attempt, or readiness value was created or fabricated. 008A's RLS finding is unresolved and explicitly not touched (§13).

---

## 13. 008C security acceptance specification (hard entry gate for Mock implementation)

Before any row may ever be set `mock_eligible`, 008C must demonstrate, with live evidence, that:

1. **Anon access to `ali_question_bank`** no longer returns `mock_eligible` rows' full content via a direct, unauthenticated REST call.
2. **Authenticated learner access** to `mock_eligible` content is scoped to their own active, `IN_PROGRESS` attempt — never the full sealed form, never another learner's attempt.
3. **Practice Eligible access** is unaffected — `fetchQuestionBank()`'s existing behaviour for Practice must not regress.
4. **Sealed Mock question access** is served through a server-mediated path (API route or server action using the service role), never a client-side Supabase call against `ali_question_bank` directly for `mock_eligible` rows.
5. **Answer leakage**: the correct answer for an unattempted or in-progress question must never be present in any client-visible payload before submission.
6. **Direct REST/API querying**: a REST call using only the public anon key must return zero `mock_eligible` rows under any filter.
7. **Browser/client bundle leakage**: no sealed question content may be pre-fetched, cached, or embedded in any client bundle, service worker cache, or prefetch response.
8. **Service-role boundaries**: the service role key must never be exposed to any client-executed code path.
9. **Admin access**: the existing `is_current_user_admin()`-gated review surfaces remain the only legitimate way to view sealed content outside an active attempt, and their access must be re-confirmed unaffected by whatever RLS change 008C makes.
10. **Attempt-time access**: during an `IN_PROGRESS` attempt, only the current section's questions are servable — not the whole form.
11. **Post-attempt access**: once `SUBMITTED`, no further question content should be servable to the learner until the report is `RELEASED` (§9's delayed-reporting lifecycle, 008A).
12. **Report-time answer access**: once released, the parent/child report may show the learner's own submitted answers and the correct answers for their own attempt only — never another learner's, never a full sealed form dump.

Each of these twelve must be demonstrated with a live, reproducible test (not asserted) before 008C is considered closed.

---

## 14. Live verification

Deployed and independently checked: the "School Intelligence" page loads, both new form sections render, and the Exam Information card's evidence list matches `csseEvidence.ts` exactly. Dashboard determinism re-checked (three consecutive loads on the same account, no learner activity between): mission content identical across all three, confirming the `schoolYear` wiring did not reintroduce 007W's own resolved volatility — `p.schoolYear` is a stable, localStorage-read value, never written as a side effect of viewing, matching the exact discipline Decision 77 established.

---

## 15. Deferred items (explicitly not attempted this increment)

Exam-update automated monitoring (008A/008B's own explicit instruction: not needed yet, the `evidenceConfidence` field is the readiness boundary, already built). A composite single "Exam Readiness" score (deliberately not built, per Part 15 of 008A — boundaries, not a value). Full official PDF re-verification for Continuous Writing marks/weighting (unchanged disclosure, §9). The 008C RLS/sealed-content fix itself (§13 is the specification, not the fix).

---

**STOP. This report concludes 008B. No Mock content, schema change, or eligibility change was made. Return to Founder/Product leadership for 008C authorisation.**
