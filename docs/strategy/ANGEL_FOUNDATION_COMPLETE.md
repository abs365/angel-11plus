# Angel 11+ — Foundation Complete

**Title:** Angel 11+ — Foundation Complete
**Version:** 1.0
**Status:** Approved
**Project:** Angel 11+
**Phase:** Foundation Version 1
**Owner:** ELBOLD
**Last Updated:** July 2026
**Purpose:** Marks the completion of Angel's foundation build and documents the platform's current state — architecture, ALI, UX, and commercial position — for future reference.

---

**Date:** 2026-07-03
**Status:** Foundation Version 1.0 complete. Feature development paused by explicit founder decision. This document marks the milestone and the pause — not a launch announcement.

---

## Executive Summary

Angel 11+ started as a static 11+ exam-prep app: fixed practice content across English, Maths, Vocabulary, Writing and four reasoning disciplines, organised around exam pathways (GL, CEM, CSSE, ISEB, Independent). Over thirteen build phases it became something categorically different: a platform with its own adaptive learning engine (Angel Learning Intelligence — ALI) that selects what a child practises next based on their real, evidenced performance, wrapped in a product experience that was rebuilt this month (UX V3) so that intelligence never has to announce itself to be felt.

What Angel has become, concretely:

- A **4-subject adaptive engine** (Verbal Reasoning, Mathematics, Reading Comprehension, Vocabulary) that is subject-agnostic by construction — every new subject added required zero changes to the shared selection/mastery/history logic, proven four separate times, not asserted once.
- A **premium, coherent product surface** — one navigation architecture, one card language, one colour-and-icon identity system, ALI's mechanism named nowhere a user can see it.
- A **real parent-facing trust layer** — Parent Hub, competency-level insights in plain English, exam readiness signal, all backed by genuine Supabase-authenticated admin/beta infrastructure, not a prototype's placeholder screens.
- A product that has been **audited by itself**, twice — once by an independent enterprise audit (73/100, "Needs Minor Work"), once by this UX pass — rather than only ever describing its own progress in its own voice.

What Angel has not become, and should not be mistaken for having become: a live, production-seeded, revenue-generating product. The engine is built and internally validated; it has never been run against a real family's real data outside a developer's own device. That gap — not a capability gap, an *activation* gap — is the single most important fact in this document, and it recurs throughout every section below rather than being buried once and forgotten.

## Foundation Timeline

| Phase | What it delivered | Load-bearing decision made |
|---|---|---|
| Pre-ALI static platform | English/Maths/Vocabulary/Writing/4 Reasoning disciplines, 5 exam pathways, gamification (XP/streaks/badges), Parent Hub v1, PWA shell | Fixed, non-randomised mock assembly — same questions every time, the ceiling that motivated everything after |
| ALI Slice 1 (Verbal Reasoning) | First adaptive subject: question bank + per-student history + selection + mastery, isolated route, dual-write bridge into legacy `UserProgress` | Learning Intelligence as a *layer*, not a feature bolted onto the mock runner — mock assembly became one consumer of a shared engine |
| ALI 1.1–1.4 (Validation → Missions → Parent Intelligence) | Live-simulation validation methodology (real pure functions, not mocks of them); Daily Mission and Parent Hub both made ALI-aware with zero mock-runner changes | Every ALI signal is additive to existing systems — nothing downstream regresses for subjects ALI doesn't yet cover |
| ALI 2.0–2.2 (Maths → Reading Comprehension → Vocabulary) | Three more subjects, each proving the architecture needed no redesign; **Learning Unit** introduced as a permanent concept (a passage or a word is never split apart mid-selection) | Subject-agnostic by construction is now a four-times-proven claim, not a one-off result |
| Cross-Subject Recommendations + Learning Profiles | Real, tested, deliberately **not wired into any UI** | Built ahead of need, shipped behind the scenes — the discipline of not exposing what isn't ready |
| Foundation Audit + Phase 5A | Independent 73/100 audit; hardened admin auth (Supabase magic-link, RLS-backed), 5 beta-submission tables moved off localStorage onto real RLS-protected Supabase tables, dead code removed, docs corrected | The most consequential finding of the whole project to date: **11 commits of ALI work had never been pushed to GitHub** — nothing built was live. Caught by verification, not assumption. |
| UX V3 (this month) | Full navigation redesign, ALI made linguistically invisible everywhere a user can see it, unified design language, premium loading experience | "This feels like one product" became a design requirement with its own test, not a vibe |

## Enterprise Architecture

Next.js 16 (App Router) / React 19 / TypeScript strict / Tailwind v4, Supabase (Postgres + Auth) as the sole backend, OpenAI `gpt-4o-mini` for writing feedback only, hand-written service worker for offline PWA support, hosted on Vercel with GitHub-integrated deployment.

The architecture's one genuinely distinguishing property: **ALI is a layer, not a feature.** `lib/ali/*` (question bank, history, selection, mastery, weakness, learning unit, observability) and `types/ali/*` know nothing about which subject is calling them. The four adaptive routes, the Daily Mission engine, and Parent Insights are all *consumers* of that layer, not owners of adaptive logic duplicated per-subject. This was validated, not just designed — each new subject was a real test of whether the shared layer would need to change, and four times it didn't.

Data model: content (`ali_question_bank`, global stats) is separated from per-student state (`ali_student_question_history`, `ali_student_adaptive_state`) — the same aggregate-vs-per-relationship pattern used successfully elsewhere in this account's portfolio. Row Level Security is deliberately scoped, not blanket: enabled on the 5 beta-submission tables (public insert, admin-only select via a `SECURITY DEFINER` function) since Phase 5A; still deliberately disabled on `profiles`/`user_stats`/`lesson_progress`, a scoped decision to avoid regressing the existing anonymous device-based sync rather than an oversight.

## ALI Foundation

**Current capabilities:** four subjects (Verbal Reasoning, Mathematics, Reading Comprehension, Vocabulary) fully wired end-to-end — question selection, cooldown/anti-repetition, weak-competency override, evidence-based mastery (not consecutive-attempt-based), Daily Mission prioritisation, and Parent Hub competency summaries all work identically across all four. Learning Unit generalises correctly across three distinct shapes (one question, one passage, one word-plus-generated-items) without special-casing. Two internal-only extensions exist and work — Cross-Subject Recommendations and Learning Profiles — deliberately not exposed to any UI yet, the same discipline that has governed every "built ahead of need" decision on this project.

**Current limitations, stated plainly rather than smoothed over:**
- **100% synthetic content.** Every subject runs on developer-authored fixture data with an in-app banner disclosing this. The real hand-tagging passes (VR: 52 questions, Maths: 20, English: 10, Vocabulary: 12) are outstanding — a human, subject-matter-expert task by explicit design decision (metadata generation was never automated).
- **Migrations 004–008 are unapplied to production.** The schema exists as files; it has never been run against the live Supabase project.
- **Difficulty tuning is subject-level, not competency-level**, for the first-slice architecture — a named, accepted simplification, not a bug.
- **4 of 8 Learning Profile dimensions are typed `null`**, not fabricated, because the raw per-attempt timing data needed to compute them doesn't exist anywhere in the app yet.

**Production activation status: not activated.** Every phase since Slice 1 has flagged the same unclosed gap. A complete, ready-to-execute activation path exists (`ALI_PRODUCTION_ACTIVATION_CHECKLIST.md`, `ALI_HAND_TAGGING_WORKFLOW.md`, `ALI_SEEDING_PLAN.md`, `ALI_LIVE_VALIDATION_PROTOCOL.md`) — what's missing is a human with real Supabase Dashboard access running it, not further design or code work.

## UX Philosophy

**Student-first experience:** the dashboard opens with purpose (Today's Mission) before it opens with statistics; the four reasoning disciplines collapsed into one Reasoning Hub because that's how a child actually thinks about the activity, not how a taxonomy diagram would group it; every loading state was rebuilt to be a considered moment rather than a placeholder string.

**Invisible intelligence:** "Adaptive," "Learning Unit," "Competency," "Beta" as an ALI-status badge — none of these are permitted in user-facing copy anywhere in the product. A child sees "Personalised," "Your weak spots come back around" — never the mechanism producing that behaviour. This is a permanent constraint on future copy, not a one-time cleanup.

**Refined this phase — mechanism hidden, trusted vocabulary kept:** UX V3's jargon-removal pass correctly retired ALI's internal mechanism names, but in doing so also renamed genuinely trusted educational terms — "Mock Tests" became "Practice" in the nav, "Adaptive Maths Practice" became "Maths Practice." Further strategic review (`ANGEL_PRODUCT_PHILOSOPHY_UPDATE.md`) concluded this over-corrected: Mock Exam, Assessment, Practice Paper, and Exam Readiness are not ALI's mechanism, they're the vocabulary UK parents already search for and schools already use, and hiding them alongside "Adaptive"/"Beta" was solving the wrong problem. The permanent rule going forward (`ANGEL_EXPERIENCE_MANIFESTO.md`, "Respect Familiar Educational Language") is narrower and clearer than UX V3's first pass: hide the engineering, keep the education.

**Parent confidence:** Parent Hub gives named competency strengths/improvements/focus areas in plain English, never raw percentages or mastery-state codes for their own sake. The trust infrastructure behind it is real — Supabase-authenticated admin access, RLS-enforced data separation — not a cosmetic promise.

## Commercial Position

**Current strengths:** a genuinely working adaptive engine (not a marketing claim — independently audited and internally validated four times over); a product surface that was just brought to a premium, coherent standard on its own explicit merits, not as a launch afterthought; an unusually disciplined build history — every phase's actual gaps are documented in the same document that describes its wins.

**Current differentiation:** most UK 11+ prep products are static question banks with a subscription wrapper. Angel's differentiation is that the underlying selection engine actually adapts per-student, per-competency, with anti-repetition and evidence-based mastery — and, as of this month, that intelligence doesn't cost the product any of its polish or simplicity to deliver. The two things (real adaptivity, premium simplicity) are usually a trade-off; Angel's foundation phase was specifically about proving they don't have to be.

## Launch Readiness

- **Controlled beta: architecturally ready, operationally not yet activated.** The code, security model (Phase 5A), and UX (V3) are all beta-appropriate. What's missing before even one real family can meaningfully use ALI is the activation sequence above — migrations applied, content hand-tagged, real validation run against a live network. Angel could run a controlled beta today on the *static* platform (which has always worked); it cannot yet run one that exercises ALI for real.
- **National beta: not ready, and premature to plan around.** No real family has used ALI yet. Every scaling decision belongs after the first genuine cohort's data exists, not before.
- **Future App Store readiness:** the PWA foundation (offline shell, service worker, installable manifest) is real infrastructure already in place, which is the hard part done early — but App Store packaging itself was explicitly out of scope for this phase and remains a distinct, later decision, not implied by anything in this document.
