# New Learn Model (CSSE Pathway)

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, New Learner Experience Migration
**Prepared:** 2026-08-11
**Status:** Design only, per governing instruction §17 ("Do NOT yet mass-rebuild educational content," "Do NOT invent missing learning material"). This document defines the target model and the honest interim state this release actually ships — it does not build new learning content.

---

## 1. Why Learn cannot simply reuse the old system for CSSE

`/learn` → `/english`/`/maths`/`/vocabulary`/`/writing` is organised around old UK-school-year difficulty tiers with no relationship to the approved CSSE Assessment Brain (13 competencies, 27 Question Types, EMC 1-4 evidence-maturity ratings). Its flagship content — "The Lighthouse Mystery" and its sibling lessons — is explicitly named by the Founder as material not to reintroduce into the new journey (see `LEGACY_CONTENT_RETIREMENT_REGISTER.md` §1-2).

## 2. Target organising principle (design, for future implementation)

Learn should be organised around the same structure already governing every other CSSE-evidence-led surface in this codebase — Assessment Brain's four components (`lib/learningEngine/assessmentBrainMap.ts`):

- **English Comprehension** — the CSSE comprehension format and the reading/reasoning skills it tests
- **Applied Reasoning** — deferred; Gate 3/AR-01 remains blocked, no Learn content until that evidence gate resolves (unchanged from all prior Release 1 governance)
- **Mathematics** — the CSSE arithmetic/reasoning/geometry/algebra skill set
- **Continuous Writing** — teaching and practice stages only (per `CONTINUOUS_WRITING_EXCELLENCE_MODEL_V1.md`'s already-approved TEACHING/PRACTICE/ASSESSMENT split); scoring remains evidence-gated

For each, the target experience should make explicit (per governing instruction §7):
- **What** is being learned, in plain learner language
- **Why** it matters for the exam (grounded in real CSSE evidence, e.g. "this shows up in every CSSE paper we've reviewed" — the kind of claim `RELEASE_1_CSSE_AUTHENTIC_QUESTION_SPECIFICATION.md` already substantiates)
- **What the learner needs to understand**, before attempting Practice
- **How it connects to Practice** — a direct link into `/learning-intelligence/practice/{area}`
- **When enough learning evidence exists to progress** — reusing the existing Evidence Tier / Educational State model (`lib/learningEngine/*`), never a new metric

**No internal Question Type codes** (e.g. `QT-RC-01`) are ever shown to a learner — `lib/ali/labels.ts`'s existing `competencyLabel()` human-readable mapping is the correct, already-built mechanism for this; Learn content authoring must route every learner-facing string through it or an equivalent, never a raw code.

## 3. What this release actually ships (the honest interim state)

Per the Content Safety Rule (§3 of the governing instruction: "if evidence-led replacement content does not yet exist, HIDE the legacy content, present an honest controlled state instead"), the CSSE-pathway "Learn" top-nav destination this release is **not** the target model above (no content exists yet to organise) and **not** the old `/learn` hub (explicitly excluded). It is a small, honest interim page stating plainly that Learn is being rebuilt around real, evidence-led CSSE preparation content, with:
- A direct link into `/learning-intelligence/practice` (real, working, evidence-driven practice available today)
- A direct link into `/learning-intelligence` (the CSSE Learning Report — real competency/evidence data)
- No fabricated lesson cards, no old-system content, no invented "coming soon" curriculum detail beyond what's true today

This is a deliberate, disclosed placeholder — matching the discipline already established elsewhere in this programme (the production Mock's own "still being expanded" banner, AEP4-D18's disclosure banner).

## 4. What is explicitly out of scope this release

- Authoring any new Learn content (teaching material, explanations, worked examples).
- Building the four-component Learn structure described in §2.
- Any change to Applied Reasoning's Gate 3 status.
- Any change to `/learn`/`/english`/`/maths`/`/vocabulary`/`/writing` for non-CSSE-pathway learners — untouched.

## 5. Recommended next increment

Building real Learn content for one CSSE component (Mathematics is the strongest candidate — see the Family Choice Pilot's own finding that MR-01/Mathematics has by far the deepest existing evidence base) is the natural next step once this experience-migration foundation ships, but is explicitly not authorised or attempted in this release.
