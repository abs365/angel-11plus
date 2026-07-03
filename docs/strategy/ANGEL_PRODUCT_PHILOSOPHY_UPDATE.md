# Angel Product Philosophy Update

**Title:** Angel Product Philosophy Update
**Version:** 1.0
**Status:** Approved
**Project:** Angel 11+
**Phase:** Foundation Version 1
**Owner:** ELBOLD
**Last Updated:** July 2026
**Purpose:** Refines Angel's language philosophy — distinguishing ALI's hidden mechanism from trusted educational vocabulary (Mock Exam, Assessment, Practice) that must remain visible — and evaluates future navigation pillars.

---

**Date:** 2026-07-03
**Status:** Strategic refinement, permanent going forward. This document corrects a scope error made during UX V3 — not a reversal of UX V3's core goal, which remains correct. No code, no implementation, no commits. This document guides future UX decisions; it does not itself change the product.

---

## The Refined Philosophy

UX V3 set out, correctly, to make ALI's *mechanism* invisible — "Adaptive," "Learning Unit," "Competency," "Beta" as an internal status badge have no place in front of a family. That goal stands, unchanged, permanently.

But the same pass also renamed genuinely trusted educational vocabulary alongside the actual jargon — "Mock Tests" became "Practice" in the navigation; "Adaptive Maths Practice" became "Maths Practice"; the mocks hub's own section header became "Recommended Practice" where it had named specific, real exam concepts before. This conflated two different things that only looked similar because both were "renamed to sound less technical": **ALI's internal engineering vocabulary** (which genuinely needed to disappear) and **the UK's shared educational vocabulary** (which never needed to disappear, and which disappearing quietly cost the product some of its instant legibility to parents).

The corrected rule, now permanent (`ANGEL_EXPERIENCE_MANIFESTO.md`, "Respect Familiar Educational Language"):

> **Innovation happens in the experience, not in replacing educational language that parents already understand.**

Mock Exam, Mock Test, Practice Paper, Assessment, and Exam Readiness are not ALI's mechanism. They are what a parent already searches for, what a school and a tutor already say, and what tells a family in one word that Angel understands the world they're actually preparing their child for. Hiding them was never necessary to hide ALI — the two were never the same problem, and treating them as one problem during UX V3 was the actual mistake, not the underlying instinct to reduce jargon.

**The operating rule going forward, stated as simply as it should be applied:**

> **Keep the language parents already trust. Hide the complexity they don't need to see.**

Mock Exam, Assessment, Exam Readiness, and Practice stay because they instantly communicate value. Adaptive selection, competency tracking, learning units, recommendation engines, and profile generation stay invisible because they are engineering, not education — genuinely what makes Angel special, but only valuable to a family in the *effortlessness* they produce, never in being named.

## The Role of Mock Exams

Mock Exams are not a feature to justify or a term to manage — they are one of the two or three concepts every UK parent preparing a child for selective entry already organises their thinking around, alongside "which pathway" and "how ready is my child." A product that gets this word right, prominently, is a product that has already communicated 80% of its value proposition before a parent reads a single sentence of copy.

This reframes their correct position in the product: **Mock Exams should be positioned as one of Angel's flagship experiences, not one card among several inside a generic "Practice" page.** They deserve their own clear identity in the navigation and their own moment of arrival, distinct from — not hidden inside — quicker personalised practice. This is a genuine repositioning from where UX V3 left them (nested two levels deep: nav "Practice" → page section "Choose a Mock"), and it is the central navigation recommendation of this document, detailed below.

## The Role of Angel Learning Intelligence

ALI's job does not change: it remains the thing that makes a Mock Exam's question selection smarter, that quietly determines what a "Quick Practice" session should contain today, that computes Exam Readiness from real evidence rather than a naive average. What changes is *where the boundary is drawn*. ALI stays invisible; Mock Exam, Assessment, Practice, and Exam Readiness — the trusted words describing what ALI is quietly improving — stay fully visible, permanently, as the vocabulary the entire product is organised around.

Put concretely: a parent should never see the word "adaptive." A parent should always see the word "Mock Exam." Angel Learning Intelligence is the reason the Mock Exam a child sits feels like it was built for them specifically — the intelligence is real and load-bearing, and it is never the headline.

## Recommended Product Pillars — Learn / Practice / Assess

**Evaluated, and recommended, with refinements.** The proposed three-pillar structure is a genuine simplification over the current post-UX-V3 navigation, for a specific, concrete reason: today, "Practice" exists at two different levels of the hierarchy pointing at two different scopes — a nav item called "Practice" leads to a page containing both quick personalised sessions *and* full timed mocks, so the same word means two different things four inches apart on the same screen. A clean three-pillar split removes that overlap entirely by giving each activity type exactly one home:

- **Learn** — subject lessons: English, Maths, Vocabulary, Writing, Reasoning. The already-shipped Reasoning Hub slots into this pillar naturally and needs no further change — it already behaves exactly like a Learn destination.
- **Practice** — personalised, lower-stakes sessions: Daily Practice, Revision, Missions, Smart Practice. This is where ALI's personalisation is most active and most invisible, and where the current four "Recommended Practice" cards (GL Verbal Reasoning, Maths Practice, Reading Practice, Vocabulary Practice) belong on their own, without full Mock Exams sharing the page.
- **Assess** — Mock Exams, Timed Assessments, Exam Readiness, Results, Progress History. The formal, higher-stakes, confidence-building side of the product, deserving its own clear identity rather than being folded under "Practice."

**One real discrepancy found during this review, worth flagging directly:** the suggested Learn pillar lists "Voice Reading" as a peer subject alongside English/Maths/Vocabulary/Writing/Reasoning. In the actual product, Voice Reading (the text-to-speech "Listen"/"Read aloud" control bar, `components/PassagePlayer.tsx`) is a *feature embedded inside* the English/Reading Comprehension experience, not a standalone destination a student navigates to on its own. The recommendation here is to keep it embedded rather than promote it to a peer-level pillar item — it's a capability that makes English practice more accessible, not a separate subject a child would ever choose to "go do" in isolation. Listing it as a standalone Learn item would misrepresent what it actually is and add a nav destination with nothing distinct to show once opened.

**A second refinement worth making while adopting this structure:** the current product has two places showing overlapping streak/XP/session statistics — the Dashboard's Achievements section and the standalone `/progress` page — with no signal for which is authoritative (flagged independently in `ANGEL_PRODUCT_EXCELLENCE_REVIEW.md`). Adopting the three-pillar structure is a natural moment to resolve this: **Progress History becomes the one canonical home for all historical stats**, under Assess, with the Dashboard showing only a lightweight forward-looking preview (today's mission, current streak) rather than a second full stats view.

**Where Family and Support sit:** unchanged, outside the three pillars — Parent Hub and Support-type pages are not "things a student learns, practises, or is assessed on," and folding them into the three-pillar model would blur the one boundary this whole review is trying to sharpen (the parent/student journeys should feel related, not merged).

**Verdict:** yes, recommend adopting this structure for a future navigation phase — it is simpler (fewer overlapping meanings for the same word), more scalable (a sixth Learn subject or a new Assess concept both have an obvious, uncontested home), and it directly resolves the "Practice means two things" ambiguity this review surfaced independently before this refinement was proposed. **Not to be implemented in this phase** — this is evaluation and documentation only, per explicit instruction.

## Assessment Centre — Evaluated and Refined

The proposed structure (Quick Practice, Topic Practice, Weekly Mock, Full Mock Exam, Exam Readiness, Previous Results, all inside one "Assessment Centre") was challenged against the three-pillar model above and found to have one internal tension worth resolving before it becomes a real design target: **Quick Practice and Topic Practice are Practice-pillar activities, not Assessment activities**, by the same logic used to build the three pillars in the first place. Placing them inside "Assessment Centre" recreates exactly the "Practice means two different things in two different places" problem this whole document exists to fix — just moved one level deeper in the hierarchy rather than resolved.

**Recommended Assessment Centre structure**, refined:

```
Assessment Centre
  Weekly Mock            ← new concept, not yet built — see note below
  Full Mock Exam          (today's pathway-based GL/CEM/CSSE/ISEB mocks)
  Exam Readiness          (currently Parent Hub-only — recommend also surfacing a
                           student-appropriate version here, see Mock Experience below)
  Previous Results        (today's per-pathway best-score tracking, made into its own destination)
```

Quick Practice and Topic Practice move to the **Practice** pillar instead, alongside Daily Practice/Revision/Missions/Smart Practice — resolving the tension rather than carrying it forward into the new structure.

**"Weekly Mock" is a genuinely new concept, not a rename of anything that exists today.** The current product has full pathway mocks (on-demand, not scheduled) and ALI personalised practice (on-demand, single-subject) — nothing today creates a recurring weekly cadence. This is worth naming honestly as a real, plausible future capability rather than quietly implying it already exists by including it in a structure diagram. **Not scoped or approved for implementation here** — flagged for a future phase to evaluate on its own merits.

## Mock Experience — Full Journey Review

Reviewed against the standard this document sets: **parents buy confidence, children experience encouragement, ALI stays invisible, and the parent should simply feel "Angel always seems to know what my child needs next."**

- **Entering a mock:** strong today — a clear intro screen states time commitment and content scope in one glance, consistent across all four practice routes and the pathway mocks alike.
- **Preparing for a mock:** the loading experience (`PremiumLoader`, shipped this month) already turns this into a considered moment rather than a stall. No further gap found here.
- **Completing a mock:** functionally solid — timed sections, clear progress indication, consistent shape across subjects.
- **Reviewing results:** shows a real percentage and a section-by-section breakdown — appropriately numeric for the age band that most uses full mocks (see the 11-year-old walkthrough in `ANGEL_PRODUCT_EXCELLENCE_REVIEW.md`).
- **Understanding strengths:** exists, but only in Parent Hub's competency summaries — not attached to the moment a mock actually finishes.
- **Next recommendations:** **this is the one real gap found in the entire mock journey, and it is the most important finding in this document.** The results screen a child sees the instant they finish — the single highest-engagement moment in the entire product — ends with a score and a choice to retry or go back. It does not say what happens next. Behind the scenes, that mock's outcome genuinely does feed Daily Mission's prioritisation and Parent Hub's competency signal — the intelligence is real and already working — but nothing in the experience *tells* the family that anything happened as a result. The loop closes in the data; it does not close in the story.

**This is the single highest-leverage improvement available to make ALI's invisible intelligence actually *felt*, without ever naming it.** A results screen that closes with something like "tomorrow's practice will focus a little more on [X]" — using the same plain, already-established competency language Parent Hub uses, never a mechanism name — would be the moment a parent's read of the product shifts from "this app has good content" to "Angel always seems to know what my child needs next," which is exactly the target feeling this document was asked to define. This is a real, concrete, low-complexity opportunity discovered during this review, not previously documented anywhere, and it belongs at the top of any future list of experience improvements — well ahead of any navigation restructuring, because it's the moment where trust is either built or missed entirely.

## The Long-Term Principle

Angel is not trying to replace education. Angel is trying to become the most trusted learning companion for children preparing for selective education. Every principle in this document — which words to keep, which structure to consider, where the mock journey still falls short — exists only in service of that one sentence. A future decision that makes Angel feel smarter but less trusted, or more feature-rich but less familiar to a parent who already knows what a Mock Exam is, has moved away from the mission, not toward it.

## Improvements Discovered During This Review

1. **The mock-completion "what happens next" gap** (above) — the single most valuable, most immediately actionable finding in this document.
2. **"Practice" currently means two different things at two levels of the same page** — resolved conceptually by the three-pillar recommendation, not yet implemented.
3. **Voice Reading should stay embedded in English/Reading practice, not become a standalone Learn destination** — a correction to the illustrative pillar structure as given, not a new problem.
4. **Progress History consolidation** — the dashboard/`/progress` redundancy flagged independently in the Product Excellence Review has a natural, permanent home once Assess exists as a pillar.
5. **"Assessment Centre" as drafted would recreate the "Practice means two things" problem one level deeper** — resolved by keeping Quick/Topic Practice in the Practice pillar and Assessment Centre strictly to Mock Exams, Exam Readiness, and Results.
6. **"Weekly Mock" is new, not existing** — flagged honestly as a future capability to evaluate on its own merits, not folded silently into a structure diagram as if it already existed.

## One Closing Note on Naming, Going Forward

The founder's instinct that surfaced this correction — thinking in the customer's own vocabulary rather than an internal engineering one — is now a standing rule for every future naming decision on this product, not a one-off correction: **keep the language parents already trust; hide the complexity they don't need to see.** Every future feature name should be tested against that sentence before it ships.
