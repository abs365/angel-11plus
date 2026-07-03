# Practice Navigation Recommendation — Phase 5B.2

**Title:** Practice Navigation Recommendation
**Version:** 1.0
**Status:** Approved, implemented this phase
**Project:** Angel 11+
**Phase:** 5B.2 — Practice Experience Stabilisation
**Owner:** ELBOLD
**Last Updated:** July 2026
**Purpose:** Reviews the current "Assessment" navigation grouping against how UK parents and schools actually talk about exam preparation, and recommends the structure implemented in this phase.

---

## What Was Wrong

UX V3 collapsed "Mock Tests" into a nav item labelled "Practice," which then opened a page mixing personalised practice and full timed mocks together. `ANGEL_PRODUCT_PHILOSOPHY_UPDATE.md` had already identified half of this problem — that "Practice" was doing the work of two different words — but the navigation itself was never corrected to match; it still shows one "Assessment" section containing only "Practice" as a visible label, with "Mock Exams" nowhere in the nav at all. A parent scanning the sidebar for the one word they're most likely looking for — **Mock** — does not find it.

## How UK Parents and Schools Actually Talk About This

Every major reference point in UK 11+ preparation — GL Assessment and CEM's own past-paper language, independent-school entrance exam guidance, tutoring platforms, and school communications home to parents — uses the same small, stable vocabulary: **Mock Exam**, **Practice Paper**, **Assessment**, **Exam Readiness**. These words are not interchangeable synonyms a product can pick freely between; they mean specific, distinct things to a parent who has been through this process before, or is currently going through it with an older child, a tutor, or the target school itself. "Mock" specifically carries a precise meaning — a full, timed, exam-condition simulation — that no softer word ("Practice," "Assessment," "Readiness Check") correctly substitutes for. Hiding it doesn't make the product feel more modern; it makes a parent unsure whether Angel actually offers the one thing they came looking for.

## Recommendation

**Adopted — matches the founder's own final recommendation in this phase's brief, and is the correct resolution of the gap `ANGEL_PRODUCT_PHILOSOPHY_UPDATE.md` first identified:**

Replace the single "Assessment" nav section with two separately visible items:

```
Assessment
  Practice          →  /mocks  (renamed section: Personalised Practice)
  Mock Exams        →  /mocks  (renamed section: Mock Exams)
```

Both point to the same page (`/mocks`), which itself is restructured (see below) so each nav item lands on a page that immediately, visibly matches what was clicked — a parent who clicks "Mock Exams" should see Mock Exams first and prominently, not scroll past Personalised Practice to find them.

**Why link both to one page rather than splitting into two separate routes:** the two activities are related enough (same subjects, same underlying content, same pathway system) that a single, well-organised page serves both better than two disconnected ones would — the goal is visibility and clarity of language, not necessarily route-level separation. If a future phase finds that parents or students want a more separated experience, splitting into `/practice` and `/mocks` as distinct routes is a small, low-risk change to make later; it was not required to solve the actual problem identified here, which was a *language* problem, not a *routing* problem.

**Why this is better than only renaming labels without restructuring:** simply renaming "Practice" to "Mock Exams" in place would have hidden Practice instead of Mock Exams — the same mistake in the opposite direction. Two visible items, each correctly named, is the only version of this fix that doesn't just relocate the ambiguity.

## What This Resolves

- Mock Exams becomes a first-class, nav-visible destination — matching what parents actually search for.
- Practice remains equally visible, correctly distinguished as the personalised, lower-stakes daily activity rather than being confused with a full exam simulation.
- ALI stays exactly as invisible as it already was — nothing about this change touches ALI's mechanism or its naming; it only corrects which trusted educational words are visible in navigation.
