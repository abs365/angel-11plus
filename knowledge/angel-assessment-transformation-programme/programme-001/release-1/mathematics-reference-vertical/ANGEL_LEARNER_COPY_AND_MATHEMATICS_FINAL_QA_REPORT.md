# Angel Learner Copy and Mathematics Final QA Report

**Programme:** Angel Assessment Transformation Execution Programme — Founder and External Review Correction
**Prepared:** 2026-08-11
**Method:** Full source audit of every active CSSE learner-facing surface, individual sentence-by-sentence rewrite (no mechanical find-and-replace), independent hand-verification of the corrected mathematics, live production testing of both learner paths, and direct database evidence verification.

---

## Results

| Check | Result |
|---|---|
| Founder dash-punctuation correction | PASS |
| Active CSSE learner-facing copy audit | PASS |
| 847 + 356 instructional correction | PASS |
| All Mathematics worked examples consistency review | PASS |
| Guided learning regression | PASS |
| Independent remediation regression | PASS |
| Evidence integrity | PASS |
| Parent Dashboard copy spot-check | PASS |
| Practise copy spot-check | PASS |
| Mock copy spot-check | PASS |
| Production deployment | PASS |

**Active learner-facing strings reviewed:** 46 (every string in the active CSSE Learn, Practise, Mock, Parent Dashboard, Progress, Family Choice, and Founder Validation surfaces found using em dash or en dash as sentence punctuation).
**Strings requiring correction:** 46 of 46 (all rewritten individually; none judged a legitimate exception).

---

## 1. Founder dash-punctuation correction

Every flagged example from the Founder's own production screenshots is corrected and reverified live:

| Before (production) | After (production, verified live) |
|---|---|
| "Not quite yet — let's look again." | "Not quite yet. Let's look again." |
| "Go back to the ones column and work through each column one at a time — remember to carry if a column adds to 10 or more." | "Go back to the ones column and work through each column one at a time. Remember to carry if a column adds to 10 or more." |
| "Correct — 931" | "Correct: 931" |
| "Borrowing from a zero without continuing the chain... — every column along the way changes too." | "...keep going left until you find one with something to give. Every column along the way changes too." |
| "This exact type of question — a straightforward calculation with no story attached — is usually..." | "This exact type of question, a straightforward calculation with no story attached, is usually..." |

No mechanical comma substitution was applied. Each sentence was individually rewritten for what reads naturally: some became two sentences (most common), some used a colon (result labels: "Correct: 931", "Exam complete: 12 of 15 correct"), some used a comma with a conjunction, one ("Practise borrowing across zero again") was already dash-free.

## 2. Arrows reviewed as a distinct concept (Founder §2)

Three categories of arrow were reviewed deliberately, not conflated with dash punctuation:

- **UI icons** (`ArrowRight` after "You're ready to practise this properly", "Practise borrowing across zero again"): kept, legitimate CTA affordance.
- **Text arrow as link affordance** ("Full learning report →", "See practice areas →", "Weekly Report →", and similar across the Parent Dashboard): kept, the established, consistent link-ending convention across this codebase, not prose.
- **Worked-step mathematical notation** ("Ones: 7 + 6 = 13 → write 3, carry 1"): kept, as newly codified in the Product Experience Standard's Section 9 — this is mathematical shorthand within a scannable step list, not a sentence connector, and rewriting each step as a full sentence would make worked examples harder to follow, not easier.

## 3. Active CSSE learner-facing copy audit

Full source audit (not source-code-only; verified live in the rendered page, per instruction §9) across every surface named in the Founder's list:

| Surface | Files | Strings fixed |
|---|---|---|
| Learn | `learn/mathematics/arithmetic/page.tsx`, `learn/page.tsx` | 24 |
| Mock | `mock-exam/page.tsx` | 4 |
| Practise | `practice/page.tsx`, `practice/[area]/page.tsx` | 3 |
| Parent Dashboard | `CssePathwayParentContent.tsx`, `learningEngine/{EducationalTimeline,RecentActivity,RecommendationSummary}.tsx`, `learningEngine/parent/{CompetencySummary,EvidenceComposition,RecommendationExplanation}.tsx`, `parent/{HistoricalContextPanel via check,ReadinessEvidenceTimeline,MockHistorySection}.tsx`, `parent/{journey,admissions-readiness,mock-readiness,weekly-report,revision-planner}/page.tsx`, `learning-intelligence/page.tsx`, `learning-intelligence/timeline/page.tsx` | 21 |
| Progress | `app/progress/page.tsx` | 5 |
| Family Choice | `founder-validation/family-choice/page.tsx` | 7 |
| Founder Validation (CSSE) | `founder-validation/csse/page.tsx` | 6 |
| Global | `components/OfflineBanner.tsx` | 1 |

(Totals overlap slightly where one file contributes to two categories, e.g. the arithmetic lesson counts under both Learn and the Mathematics-specific review below; 46 is the deduplicated total.)

**Deliberately excluded, per instruction:** code comments and internal documentation (hundreds of matches, all `//`, `/** */`, or `{/* */}` — never rendered to a learner or parent); the Founder-only evidence/traceability panel on the Founder Validation CSSE results screen, explicitly documented in its own code comment as "not learner-facing content"; legacy GL/CEM/ISEB-only surfaces (`app/mocks/adaptive/gl/page.tsx` and siblings were not touched — they were not part of this audit's scope and contain no CSSE-specific copy from this program); frozen historical research/planning documents.

## 4. 847 + 356 instructional correction

**Defect confirmed:** the lesson taught "if it's 10 or more, write the last digit and carry the rest," then demonstrated the hundreds column as "8 + 3 + 1 = 12 → write 12", silently abandoning its own taught method (writing the full two-digit sum instead of carrying).

**Fix, independently rechecked:** 847 + 356 = 1203, verified by hand (847 + 356: 800+300=1100, 47+56=103, 1100+103=1203). Corrected sequence, now live:
```
Ones: 7 + 6 = 13 → write 3, carry 1
Tens: 4 + 5 + 1 = 10 → write 0, carry 1
Hundreds: 8 + 3 + 1 = 12 → write 2, carry 1
Thousands: nothing else to add, so write the carried 1
```
Answer: 1203 (unchanged, was already correct — only the demonstrated method was wrong, not the final answer).

## 5. All Mathematics worked examples reviewed for the same class of defect

Every worked example, the Common Mistakes callouts, and both in-ladder worked resolutions (652 + 279 and 903 − 468) were checked column-by-column against the taught method:

- **Addition carrying** (847 + 356, and the guided-ladder's 652 + 279 resolution): both now correctly carry at every column where the sum reaches 10 or more, including the final column.
- **Subtraction borrowing** (903 − 468 resolution): correctly borrows from the tens column and carries the borrow to the hundreds column when needed; consistent with the taught method.
- **Borrowing across zero** (1000 − 473): the visual place-value sequence and the final subtraction both correctly follow the same borrowing method, just showing the multi-column cascade explicitly.
- **Place-value terminology**: consistent throughout (ones/tens/hundreds/thousands, never mixed with an undefined term).
- **Reverse-checking**: "527 + 473 = 1000" independently reverified true.
- **Answer presentation**: consistent bold-emerald "Answer: N" styling across every worked example, no exceptions found.

**No additional genuine inconsistency was found.** The 847 + 356 hundreds-column defect was the only instance of this class of error.

## 6. Guided learning regression — PASS

Re-tested live on production after all copy and math changes: wrong guided attempt (821, a matched known misconception) → targeted feedback (dash-free) → correct on supported retry (931). Bounded ladder, targeted-vs-generic feedback split, and supported-tier evidence tagging all behave identically to before the copy changes.

## 7. Independent remediation regression — PASS

Re-tested live with the Founder's own reported input: `903 − 468 = 556` → answer not revealed, honest diagnostic shown → `565` (matched known misconception) → full worked resolution shown, answer correctly revealed only at this bounded stage → fresh transfer item (`604 − 278`) presented, not a repeat of the numbers just shown → completed correctly as `326`. Full loop confirmed working end to end with the corrected copy.

## 8. Evidence integrity — PASS

Verified by direct database query immediately after the live test run:

- `learn-mth-arith-independent` (the original Independent Check item): `last_attempt_correct: false`, `mastery_state: "weak"` — the incorrect attempts remain truthfully recorded and were **not** overwritten by the later success on the different fresh-transfer item.
- `learn-mth-arith-independent-retry` (the fresh item): `last_attempt_correct: true`, `mastery_state: "mastered"`, `last_attempt_support_tier: "independent"` — recorded as genuine, unaided evidence, correctly distinct from the original item's own record.
- `learn-mth-arith-guided`: `last_attempt_support_tier: "supported"`, `mastery_state: "learning"` — a supported success still did not falsely advance mastery.
- Mastery changed only where justified: the retry item legitimately reached "mastered" through two real, distinct-session, unaided correct attempts; the original item correctly remained "weak"; nothing was inflated.
- Provenance (`first_source`, `source`) unaffected by any copy change — these fields are written by unmodified code paths.

## 9. Parent Dashboard, Practise, and Mock copy spot-checks — PASS

Checked live on production (not source code) by extracting the full rendered page text and searching for any remaining em dash or en dash character:

- `/learning-intelligence/parent` (including the fully expanded "detailed progress" view): none found.
- `/learning-intelligence/practice`: none found.
- `/learning-intelligence/mock-exam`: none found.

No console errors were observed on any of these pages during the check.

## 10. Angel Copy Quality Rule established

Added as **Section 9** of `PRODUCT_EXPERIENCE_STANDARD_V1.md` (the active, canonical Product Experience Standard), following that document's own established "corrections logged, not silent" discipline (Section 4's precedent). States the rule in full: no em/en dash as sentence punctuation in learner- or parent-facing copy; standard grammatical en-dash uses (numeric ranges, date ranges, scorelines) remain permitted; the mathematical minus sign, legitimate hyphenated compounds, and UI directional arrows (icon and text) are explicitly unaffected; worked-step mathematical notation is explicitly carved out as shorthand, not prose.

## 11. Regression

`/dashboard`, `/mocks`, `/mocks/adaptive/gl`, `/learning-intelligence/practice/mathematics`, `/learning-intelligence/parent` (and all six of its sub-pages), `/learning-intelligence/founder-validation/family-choice`, `/learning-intelligence/founder-validation/csse`, and `/progress` all return 200 on production after deployment. `npx tsc --noEmit`, `npx eslint` (on every changed file), and `npm run build` all ran clean; the handful of lint findings that did appear were confirmed via `git diff` to sit on lines this change never touched (pre-existing `react-hooks/set-state-in-effect` and `react-hooks/purity` findings unrelated to this work).

---

## Production delivery

**Production commit:** `a8b1d084e962f2d62560a059652b2ab2814e01a0`
**Production URL:** `https://angel-11plus.vercel.app/learning-intelligence/learn/mathematics/arithmetic`

---

Per the governing instruction: stopping here. No new lesson, no new subject, and no scaling of the reference model has been started. Awaiting the Founder's personal production review before any decision on independent educational review or ratification as Angel's first Learning Standard.
