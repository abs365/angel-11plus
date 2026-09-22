# ANGEL 11+ — EXPERIENCE GAP AUDIT V1

**Mode:** Read-only product/UX/educational-experience audit. No code was changed, no migration was created, no production or database state was touched. This report is evidence-only and makes no implementation.

**Date:** 2026-09-22
**Scope:** Full current-state audit against the target north star — "a high-quality personal 11+ tutor delivered digitally," not a question bank, software dashboard, AI application, or generic SaaS template.

**Method:** Six parallel evidence-gathering passes — (1) route/IA mapping and RETIRE-candidate analysis, (2) visual design/copy-tone/imagery audit, (3) live production browser walkthrough, (4) fresh external competitor research (Atom Learning, Bond/CENTURY, Eleven Plus Exams), (5) synthesis of ~18 prior internal Angel experience/design documents, (6) code-level depth audit of the Learn/Practise/Mock/Progress/Parent Dashboard teaching loop, plus lightweight accessibility and trust/privacy spot-checks. All findings are cited to file:line where the claim is code-level, or explicitly marked as inference/limitation where it is not. Per this repo's own standing rule (`AGENTS.md`: "production evidence outranks implementation assumptions and outranks prior reports"), this audit treats current code as ground truth over any prior report, including this platform's own design-standard documents where they disagree with what is actually deployed.

---

## 1. Executive Finding

Angel 11+'s underlying educational architecture and its most recent product-experience work are materially stronger than the audit brief's own risk list assumes. The primary navigation already closely matches the brief's proposed target (Today / Learn / Practise / Mock / Progress) — closer, in fact, than any of this codebase's own prior "canonical" navigation documents, none of which anticipated it. The Mock Centre and the CSSE Parent Dashboard are genuinely well-built, evidence-honest surfaces with real, working guardrails against fabricated metrics and false promises. There is a live, enforced Zero-Purple/no-gradient/no-AI-language design discipline, backed by real automated tooling (a copy-quality lint guard), not just documentation.

Against that strength, four structural problems recur across almost every section of this audit and account for most of the real user-facing risk:

1. **There is no public first-impression surface.** `app/page.tsx` is a bare `redirect("/dashboard")` — Angel 11+ currently has no homepage a prospective parent can land on. Journey A (public/first impression) does not functionally exist today.
2. **Two undisclosed parallel learner experiences exist.** A learner on the CSSE pathway gets a newer, evidence-rich experience (`/learning-intelligence/*`); every other pathway (GL/CEM/ISEB) gets an older, thinner experience (`/learn`, `/reasoning`, `/progress`) — including a Parent Dashboard that is the single clearest instance of "generic AI/SaaS template" appearance found anywhere in this audit. Nothing in the product discloses to a family which experience they're in or why.
3. **Built capability is sometimes unreachable.** Two substantial, evidence-tagged English lessons exist in code and are simply not linked from anywhere, directly contradicting the Learn hub's own honest "the rest of the curriculum isn't ready yet" copy — some of it already is.
4. **A real, documented design rule (Zero-Purple) is violated live in six places**, including inside the CSSE Mock Report and on the CSSE Mock card itself — the two highest-trust surfaces in the product.

None of these require touching the Educational Intelligence Engine, the Question Factory, or any protected architecture. All four are evidenced, bounded, and fixable without a redesign.

**Evidence limitation, stated up front:** the live production site (`https://angel11plus.com`) could not be reached from this environment — neither the browser tool nor a plain network request could resolve the domain (DNS resolution failure, not an HTTP error). This looks like a sandbox/environment network restriction rather than confirmed evidence the site is actually down, but it could not be distinguished from an outage with the tools available here. **The Founder should independently confirm the production site is live** before this is dismissed as an environment artifact. Every finding below that would normally rely on live rendering instead relies on code-level evidence, with that substitution flagged inline.

---

## 2. Current Learner Journey Map (code-evidenced)

| Stage | What exists today | Evidence |
|---|---|---|
| First arrival (signed out) | No dedicated arrival page — `app/page.tsx` redirects straight to `/dashboard`, which itself requires a registered account (recent access-control tightening, see §22) | `app/page.tsx`; recent commits `c10faef`, `2430edb`, `175a581` |
| Orientation | `Today` (`/dashboard`) shows a warm, plain-language orientation header and an honest empty state ("Start your first session… Complete any practice to unlock your personalised admission mission") | `app/dashboard/page.tsx:214-223, 751-754` |
| Diagnostic/placement | Exists for CSSE pathway (`/learning-intelligence/placement`); not established for other pathways in this pass | route inventory |
| First lesson | CSSE: `/learning-intelligence/learn` — hub honestly discloses only ~3 Maths lessons are ready; 2 real English lessons exist but are unlinked (see §14) | `app/learning-intelligence/learn/page.tsx:90-93` |
| First practice | CSSE: `/learning-intelligence/practice` — flat list (Reading Comprehension/Mathematics/Continuous Writing), no recommended-vs-browse split; Vocabulary explicitly and honestly disclosed as not yet integrated into this view | `app/learning-intelligence/practice/page.tsx:32-38, 118-123` |
| Returning learner | `Today` re-entry; active learner shown once via `LearnerSwitcher` in the shared header on every page | `components/LearnerSwitcher.tsx` |
| Mock | `/mocks` — single, well-built entry point for every pathway including CSSE; live availability discovery, no false promises | `app/mocks/page.tsx` (see §15) |
| Progress | Pathway-branching: CSSE → `/learning-intelligence` (evidence-only, clinically-worded headings); non-CSSE → `/progress` (older, localStorage-derived) | `components/Navigation.tsx:86-94` |

Non-CSSE learner journey (GL/CEM/ISEB) runs on a **materially different, older set of pages** for Learn/Practise/Progress. See §7 for the full two-parallel-experience finding.

---

## 3. Current Parent Journey Map (code-evidenced)

| Stage | What exists today | Evidence |
|---|---|---|
| Sign up | `/login` (email+password primary, passwordless secondary), `/getting-started` | recent commit `8927680` |
| First child setup | `/add-child` | route inventory |
| Preparation/pathway selection | `/pathways` ("School Intelligence") — independently confirmed by a prior internal evidence pass as genuinely good first-run UX | prior-docs synthesis, LR-02 2026-09-18 |
| Parent Dashboard (single entry, all pathways) | `/learning-intelligence/parent` — branches internally by pathway (FD-020 "Permanent Principle") into two structurally different implementations | `app/learning-intelligence/parent/page.tsx:19-27` |
| — CSSE branch | Strong: answers all six of the brief's framing questions plainly, real data only, categorical (never fabricated-percentage) mock readiness, progressive disclosure | `components/parent/CssePathwayParentContent.tsx` |
| — Legacy branch (GL/CEM/ISEB/Independent/core-foundation/not-sure) | Weak: raw "Confidence X%" badges shown directly to parents, 9-colour icon-square subject grid, badge/pill star chips, blended guided+independent "Overall Score," CTA literally labelled "Go to Student App" | `components/parent/LegacyPathwayParentContent.tsx:54-76, 113, 289-291, 361, 572-592` |
| Mock history | Shared across both branches, answers "what happened in the latest Mock" | `MockHistorySection` |
| Multi-child switching | `LearnerSwitcher` in shared header, confirmed to read the same underlying learner context as the account menu — no risk of the two disagreeing | `components/LearnerSwitcher.tsx`, `lib/useChildName.ts` |

**Commercial read:** the brief calls the Parent Dashboard "commercially critical." The evidence shows Angel already built the right pattern once (CSSE branch) — the gap is that most non-CSSE families are not receiving it.

---

## 4. Current Navigation Map

**Primary (desktop top bar + mobile bottom bar, pathway-branching on a client-only `localStorage` read):**

| Label | CSSE destination | Non-CSSE destination |
|---|---|---|
| Today | `/dashboard` | `/dashboard` (same) |
| Learn | `/learning-intelligence/learn` | `/learn` |
| Practise | `/learning-intelligence/practice` | `/reasoning` |
| Mock | `/mocks` | `/mocks` (same — genuinely unified) |
| Progress | `/learning-intelligence` (exact match) | `/progress` |

*Source: `components/Navigation.tsx:86-94`.*

**Secondary — "Journey":** `/learning-intelligence` ("Learning Report"), `/pathways` ("School Intelligence")
**Secondary — "Family":** `/learning-intelligence/parent` (Parent Dashboard), `/angel-plus` (badge "Soon" — no premium features exist anywhere in the codebase; the badge is honest, not deceptive)
**Collapsed "Help and support" disclosure:** `/getting-started`, `/feedback`, `/testimonial`, `/contact`
**Footer-only:** `/beta` → `/beta-family`
**Tertiary, reachable only from within `getting-started` page content:** `/report-bug`, `/feature-request`
**Auth:** `/login`, `/reset-password`, `/add-child`
**Admin/founder-gated, correctly out of the family-facing IA:** `/admin-beta/*`, `/learning-intelligence/founder-validation/*`
**Legal:** `/privacy`, `/terms`

**Orphaned (zero inbound links anywhere in `app/`):**
- `/mock-test` — a full standalone English+Maths timed test that self-scores via `lib/progress.ts`, completely bypassing the Educational Intelligence evidence pipeline. Duplicates `/mocks`. No route links to it anywhere.
- `app/learning-intelligence/learn/english/reading-inference`, `.../reading-retrieval` — real, built, evidence-tagged lessons, unreachable from any nav.

**Retired-in-place stub redirects still in the route tree (self-documented "RETIRED" in code, 2026-09-02 Gate 3 Closure Wave):** `/mocks/adaptive/english`, `/mocks/adaptive/maths` — correctly redirect, not a live defect, but permanent route-tree debt worth removing once confidence is high no bookmark still hits them.

**The single most important IA fact in this audit** is the *branch itself*: nothing in the nav chrome, copy, or badges tells a family which of the two parallel experiences (§7) they are in.

---

## 5. "What Do I Do Next?" Audit

Live rendering could not be verified (§1 evidence limitation), so this section relies on code-level copy inspection, applied against the brief's own standard.

**Learner (5-second test):**
- `Today` passes: warm orientation copy, an honest empty state that names the next action, clear single next step. (`app/dashboard/page.tsx:214-223, 751-754`)
- `Learn` hub passes for what's linked, but a learner who somehow reaches the two orphaned English lessons directly would find no path back into "what's next" — they're dead ends outside the hub's own flow.
- `Practise` (CSSE) passes: flat list is at least self-explanatory, though it doesn't yet answer "why this one" the way a Recommended-for-you framing would.

**Parent (10-second test):**
- CSSE Parent Dashboard passes cleanly: "How is my child doing?", "What needs attention?", "What should they do next?", "Are they ready for a mock?" are answered on the first screen.
- Legacy Parent Dashboard does **not** cleanly pass: a raw "Confidence 73%" badge and a blended "Overall Score" require the parent to already understand the platform's internal scoring model to interpret correctly — this is architecture exposed as product, exactly what this audit section is designed to catch.
- Progress page (`/learning-intelligence`) is evidence-honest but its section headings ("Diagnostic Overview & Coverage Gaps") require the parent to parse assessment-report language rather than answering the question in plain terms — see §16.

---

## 6. Information Architecture Findings

- Navigation has already converged, in production, on very close to the brief's proposed 5-destination model — this happened independently of, and is not reflected in, any of this codebase's own prior "canonical" navigation documents (see §26). Treat the live `Navigation.tsx` as the actual current IA, not any prior doc.
- The CSSE/non-CSSE pathway branch is a deliberate, documented architectural decision (a 2026-09-02-era code comment cites an established "collapse by mental model" precedent) — not an oversight. But it was never designed to be *disclosed*, and it now means "Learn," "Practise," and "Progress" are four different pages with the same three labels depending on which pathway a family is on.
- Subject-level navigation (English/Maths/Vocabulary/Verbal Reasoning/etc.) is fully subordinate to the mode-based primary nav for non-CSSE learners (collapsed into `/learn` and `/reasoning` hubs) — this collapse is good and already done, contrary to what the audit brief worried might still be a problem.
- No internal engine terminology is exposed as primary or secondary navigation. The one historical instance found (the dashboard once literally rendering `Top-priority competency "MR-02" (trigger: weak-competency-remediation)`) was found and fixed same-day per this project's own state log (2026-09-18) — no comparable live instance was found in this pass.
- Admin/founder surfaces are properly gated and excluded from the family-facing IA.
- The Help/support cluster is already well-consolidated behind one collapsed disclosure — a genuinely good execution of exactly the kind of simplification this audit would otherwise be recommending.

---

## 7. AI / Developer / Template Appearance Findings

**The literal-language risk is low.** A repo-wide grep of rendered JSX text (not code comments, not internal variable names) found no material AI/developer-language leakage into the learner or parent product surfaces. The only "AI"/"Supabase"/"OpenAI" mentions in the entire `app/` tree are on the Privacy page itself, as legitimate processor disclosures (`app/privacy/page.tsx:44, 96-97`) — in scope and appropriate there, not a defect.

**The visual/pattern risk is concentrated and real, chiefly in one surface: the non-CSSE Parent Dashboard.** `components/parent/LegacyPathwayParentContent.tsx` is the clearest instance found anywhere in this audit of the generic-AI/SaaS-template pattern the brief warns against:
- 9 subject icons, each in its own colour-coded square (`SUBJECT_ICONS`/`SUBJECT_COLORS`, lines 54-76)
- Raw internal metric shown directly to a parent: `"Confidence X%"` (line 361)
- Badge/pill chips with Star icons for earned achievements (lines 572-592)
- A CTA literally labelled **"Go to Student App"** (line 113) — developer/product terminology, not something a tutor would say

**"AI-magic" sparkle iconography contradicts the platform's own documented rule.** `ANGEL_DESIGN_LANGUAGE.md` §0 explicitly rejects "decorative/AI-magic iconography (sparkle-style icons)," yet the `Sparkles` icon is:
- the *default* icon for the shared `PremiumLoader` component (`components/PremiumLoader.tsx:33`), used unmodified on the legacy GL/Vocabulary adaptive routes
- used as a literal marker for "this section is adaptive" on `app/mocks/adaptive/gl/page.tsx:453,529,710` — the single most direct violation of the rule found: flagging the AI-driven mechanism to the user with a magic-sparkle icon
- used as a "just mastered" celebration icon on the legacy Parent Dashboard — a more defensible use, but still the same rejected icon

All three sparkle instances are confined to legacy/non-CSSE pathway surfaces; the CSSE primary experience does not appear to use it.

**Icon-in-coloured-square repetition exists but is disciplined, not garish.** `SubjectCard.tsx` repeats the same coloured-chip-icon-title-description-pill shape ~10 times across the app — it is the single most repeated visual motif in the product, but executed with real restraint (flat colours, muted shades, a documented 5-type card taxonomy) rather than a templated, undesigned feel.

**No gradients found anywhere** in `app/`, `components/`, `lib/`, or `data/` (verified, fully enforced). One restrained `backdrop-blur` instance on the sticky header — not glassmorphism in the pejorative sense.

**Repo scaffold signal (low user-visibility, worth cleaning up regardless):** `public/` still contains five unreferenced create-next-app boilerplate SVGs (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) — confirmed zero references anywhere in `app/`/`components/`. Not visible to users, but a genuine "unfinished template" signal to anyone inspecting the deployed assets.

---

## 8. Human-Language Findings

**Strong, and backed by real tooling, not just intent.** `ANGEL_DESIGN_LANGUAGE.md` §7 codifies an "ALI-invisible" rule (never show "Adaptive/Learning Unit/Competency/Intelligence/Recommendation Engine/Beta") and a no-dash-punctuation rule, both enforced by an automated lint guard (`scripts/copy-quality-guard.mjs`, wired into `npm run lint`) — a working guardrail, not aspirational documentation.

**Standout examples (KEEP as the house style):**
- Dashboard orientation copy: *"Your consistency is building real, lasting confidence." / "Welcome back. Let's make today count."* (`app/dashboard/page.tsx:214-223`) — passes the "would a teacher say this" test cleanly.
- The child-facing "Why does Angel suggest this?" popover: *"Angel remembers how you're getting on with each topic you practise… If you write something for feedback, a computer program helps check it and give you tips… Not sure about something? Ask your parent or carer."* (`app/dashboard/page.tsx:678-692`) — an honest, age-appropriate AI-disclosure that never once says "AI." One of the strongest single pieces of copy found in this audit.
- The Writing feedback disclosure: *"AI-generated general writing-quality guidance, not a CSSE… official or validated mark"* (`app/learning-intelligence/practice/[area]/page.tsx:1643`) — a correct, necessary, legally-honest exception to the no-AI-language rule, paired with a qualitative rubric breakdown rather than a bare score.

**Real violations found:**
- `/learning-intelligence` (the "Progress" nav destination) uses clinical, assessment-report language for its section headings: **"Skills Profile," "Evidence Profile," "Diagnostic Overview & Coverage Gaps," "Recommendations," "Recent Learning Activity"** (`app/learning-intelligence/page.tsx:178-203`). "Diagnostic Overview & Coverage Gaps" in particular reads like an internal report, not something a tutor would say to a parent or child — and it sits on the exact page the primary nav labels plainly as "Progress." Notably, **the same underlying evidence data is already given friendlier framing on the Parent Dashboard** ("How is my child doing?", "What needs attention?") — the plain-language pass reached one surface but not the other, despite sharing data.
- `/mocks/mock-report/[attemptId]` uses internal-flavoured word choice: *"…these are reported on their own rather than combined into one figure"* refers to exam "components" — technically accurate, reads like an internal caveat rather than a tutor's natural framing.
- The Legacy Parent Dashboard's "Go to Student App" (§7) is the clearest single copy violation found.

---

## 9. Visual Design Findings

**Governing standard, in force order:** `DESIGN_SYSTEM.md` (historical) → `ANGEL_DESIGN_LANGUAGE.md` V3 (current) → `PRODUCT_EXPERIENCE_STANDARD_V1.md` (marked FROZEN, overrides V3 only on gradients and XP/Level/Streak visibility). Stated direction: blue-only primary, zero purple/violet/indigo, no gradients, flat elevation by default, warm stone/ivory backgrounds, a fixed subject-identity colour table.

**Colour-token layer is clean at the source.** `app/globals.css:72-76` confirms `--color-primary`/`--color-primary-hover` are blue-600/blue-700 (light) and blue-400/blue-500 (dark).

**But the Zero-Purple rule is violated live in six places**, found by direct grep of the codebase (this is the single most concrete, fixable visual defect in this audit):

| File | Line(s) | Violation |
|---|---|---|
| `app/verbal-reasoning/page.tsx` | 14 | `themeColor="violet"` |
| `app/reasoning/page.tsx` | 30, 39 | `color: "violet"` for the Verbal Reasoning card |
| `app/mocks/[pathway]/page.tsx` | 130 | `color: "purple"` — **the CSSE Mock card's own badge colour** |
| `app/learning-intelligence/mock-report/[attemptId]/page.tsx` | 426 | `border-purple-200 dark:border-purple-900` — **inside the CSSE Mock Report**, on the Writing result card |
| `app/english/[id]/page.tsx` | 288 | `ProgressBar color="purple"` |
| `app/learn/page.tsx` | 129 | `ProgressBar color="purple"` |

Two of these six sit inside the CSSE pathway's own flagship surfaces (the Mock card and the Mock Report) — the platform's own stated identity is violated precisely where trust matters most, not just in legacy corners.

**Documentation itself has drifted.** `PRODUCT_EXPERIENCE_STANDARD_V1.md` — marked FROZEN — still literally states purple/indigo as the primary/secondary colour tokens and describes the system font stack as "unchanged," both contradicted by later, Founder-directed passes (the 2026-08-31 Zero-Purple pass; the 2026-08-18 Lexend typeface adoption) that were never logged as corrections in that document, unlike the gradient and XP/Level/Streak corrections which *were* explicitly logged. This is a documentation-hygiene finding distinct from the live code violations above — the "frozen" doc is factually wrong about current reality and should be corrected or explicitly superseded, independent of any product change.

**No gradients found anywhere** (fully verified, cleanly enforced). One restrained `backdrop-blur` on the sticky header only.

**Loading experience** (`PremiumLoader.tsx`) is well-built — rotating reassuring messages every 3 seconds with `aria-live="polite"`, genuinely premium in structure — undermined only by its sparkle default icon (§7).

**No stat-grid overload found** on the CSSE surfaces sampled; the dashboard was explicitly, deliberately refactored across several passes specifically to remove redundant stat cards. The stat-tile-overload pattern the brief warns about is real, but confined to the Legacy Parent Dashboard (§7), not systemic.

---

## 10. Image & Photography Inventory

**There is no photography or illustration anywhere in the product.** Zero `next/image` usages found anywhere in `app/` or `components/`. `public/` contains only PWA icons, `manifest.json`, `offline.html`, `sw.js`, and the five unreferenced boilerplate SVGs noted in §7.

This is a **documented, deliberate policy**, not an oversight: `ANGEL_DESIGN_LANGUAGE.md` §0 states the product itself is the primary visual material — "not stock photography, not generic illustration. No fabricated children, parents, schools, testimonials… ever." Classification: **MISSING across the board relative to the brief's target imagery direction**, but by design — the audit's job is to surface that the target direction's imagery wishlist (children studying, books, workbooks, parent+child) is currently 100% unrealised, and to note that closing this gap is a policy decision for the Founder, not a code defect.

This is compounded by the fact that there is currently no homepage (§1, §11) for any such imagery to appear on even if the policy changed.

---

## 11. Today Experience Gap

`app/dashboard/page.tsx` already implements much of the brief's target TODAY concept: warm greeting-style orientation copy, an honest empty state naming the next action, and a "why does Angel suggest this?" disclosure that is genuinely one of the best pieces of copy in the product (§8). What is not yet present, based on code inspection: a single explicit "your plan for today" list with per-item time estimates (Learn/Practise/Quick Review with minutes each) as sketched in the brief. Building that honestly would require the underlying recommendation-priority and time-estimation data to actually exist and be reliable — this was not independently verified in this pass and should be checked before promising per-item time estimates to a parent.

---

## 12. Learn Experience Gap

The CSSE Learn hub honestly discloses its own incompleteness: *"Angel's CSSE Learn experience is being rebuilt one real lesson at a time… The rest of the curriculum isn't yet [ready]"* (`app/learning-intelligence/learn/page.tsx:90-93`) — genuinely good, teacher-like honesty, worth preserving as a pattern.

Three Maths lessons are linked and follow a UNDERSTAND→EXAMPLE→GUIDED→INDEPENDENT→CHECK structure (code cites a "MODEL/GUIDED/INDEPENDENT/REFLECT" pattern).

**Real defect:** two substantial, evidence-tagged English lessons — `app/learning-intelligence/learn/english/reading-inference/page.tsx` and `.../reading-retrieval/page.tsx` — exist and follow the same rigorous teaching pattern, but are linked from nowhere (zero references anywhere outside their own files). A learner can only reach them by typing the exact URL. This directly contradicts the hub's own honest "not ready yet" copy: some of it *is* ready, it's just unreachable. This is the cheapest, highest-confidence fix in this entire audit — wiring two existing links.

No internal-machinery leakage (competency IDs, tier codes) was found rendered on the lesson pages sampled.

---

## 13. Practise Experience Gap

`app/learning-intelligence/practice/page.tsx` ("Choose a Practice Area") is a flat, undifferentiated list (Reading Comprehension / Mathematics / Continuous Writing) — no "Recommended for you" vs. "choose what to practise" split exists today. Availability is computed live and honestly (a 2026-09-era fix, Decision 258, explicitly treats "undefined" as unavailable rather than falsely claiming availability — a real anti-broken-promise guardrail).

Vocabulary is explicitly and honestly disclosed as disconnected from this dashboard: *"Vocabulary isn't part of this skills structure yet… still available from the main Learn hub, it just won't appear on this dashboard"* (lines 118-123) — honest, but confirms Vocabulary is a structurally separate, un-integrated island from the CSSE Practice/Progress loop.

The Writing picture-stimulus flow enforces `alt` text at the type level (`isValidWritingPromptStimulus` requires `altText`, lines 1533-1538) — a genuine, structural accessibility guarantee. Given this audit brief's own explicit real-user evidence ("nothing to write" complaint about the Riverboat stimulus), this type-level enforcement is a meaningful mitigation, though it doesn't by itself guarantee every stimulus is genuinely rich enough to write about — that remains a content-quality question, not a code one.

Session progress is clearly labelled ("Question progress," "{index+1} of {activities.length}"). Writing's AI-feedback score disclosure is a correct, honest exception to the no-AI-language rule (§8), paired with a rubric breakdown rather than a bare number.

---

## 14. Mock Experience Gap

`app/mocks/page.tsx` is the strongest surface found in this audit. Availability is discovered live per exam form, never hardcoded; CTAs fall back to "Go to Practice" rather than ever repeating a false "start a mock" prompt when nothing is deliverable — multiple code comments cite specific, previously Founder-caught defects this pattern now prevents. Mock cards never claim a combined English+Maths sitting until both papers are independently confirmed active. Disclaimers are present and honest ("original practice papers… not affiliated with… any school"). The Practice-teaches/Mock-measures distinction is well communicated in copy (the readiness banner explains *why*, not just *whether*, a mock is available).

This audit found no material gap here beyond the one live Zero-Purple violation on the CSSE Mock card itself (§9) — otherwise, **KEEP as the house standard** for the rest of the product to be brought up to.

---

## 15. My Progress Experience Gap

`app/learning-intelligence/page.tsx` is genuinely evidence-only — its own header comment states "No value on this page is hardcoded, randomised, or a placeholder," and this was independently spot-checked, not just taken on faith.

The real gap is language, not data (§8): the section headings ("Skills Profile," "Diagnostic Overview & Coverage Gaps") read like an internal assessment report rather than the plain, tutor-like framing already used for the same data one click away on the Parent Dashboard.

The brief's proposed plain-language tiers ("Going well / Working on next / Recently improved / Needs more independent practice / Revisit later") are **not implemented today**, but the underlying evidence categories (evidence tiers, durable mastery, development areas, recent activity) could honestly support them without inventing new scoring — this is a real, low-risk opportunity, not a fabrication risk.

---

## 16. Parent Dashboard Gap (commercially critical)

See §3 and §7 for full detail. Summary:

- **CSSE branch: KEEP.** Answers all six of the brief's framing questions plainly on first load, uses only real fetched data with explicit "no fabricated score" guarantees in the code, and defers detail behind progressive disclosure rather than dumping everything at once.
- **Legacy branch (GL/CEM/ISEB/Independent/core-foundation/not-sure): the clearest concrete "generic AI/SaaS dashboard" instance in the whole audit.** Raw confidence percentages, a 9-colour icon grid, badge/pill star chips, and "Go to Student App" language — none of which a parent should need internal knowledge to interpret.
- **A rigor gap, not just a style gap:** the Legacy branch's headline "Overall Score" blends guided (supported) and independent correctness into one number with no visible separation — unlike the CSSE branch's evidence-tier model, which keeps these apart. This risks quietly contradicting this codebase's own core rule ("supported success is not independent mastery," `AGENTS.md`) specifically for the pathway that most families are likely still on. This is worth flagging to product/engineering as a possible scoring-honesty issue, not purely a visual one.
- Both branches correctly avoid fabricated defaults — explicit "No signs of concern," "Not yet a clear signal" fallback copy appears throughout rather than a made-up number.
- Mock history is shared and correctly answers "what happened in the latest Mock" on both branches.

Given the brief's own framing of this surface as commercially critical, and that most families are likely on a non-CSSE pathway today, this is the highest-leverage single gap in the audit.

---

## 17. Multi-Learner UX Findings

`LearnerSwitcher.tsx` is shown once, in the shared `Header`, on every learner-facing page, and is well-built (keyboard-accessible popover, inline "Add another child"). `useChildName()` — used elsewhere for the account-menu "Viewing: X" line — was confirmed to read the *same* underlying learner context as `LearnerSwitcher`, not a stale duplicate; there is no risk of the switcher and the account menu disagreeing about who is active. No defect was found in the "is the active learner always obvious" test at the code level for the surfaces inspected. This is a genuinely resolved area — **KEEP**.

---

## 18. Desktop / Tablet / Mobile Findings

Live rendering could not be verified (§1). From code inspection of `components/Navigation.tsx`:
- Desktop/tablet top bar: real, deliberate responsive handling — a tablet-width icon-only rail (`collapsed` prop) with the accessible label preserved via a sr-only/not-sr-only toggle rather than a hard `display:none`, specifically to avoid removing the accessible name at that width. A prior real defect ("Progress" clipping to "Progr" at tablet width) is documented as found-and-fixed with `shrink-0`/`whitespace-nowrap`.
- Mobile: a fixed 5-item bottom bar plus a "More" drawer with real keyboard/focus-trap handling (Escape to close, focus restoration to the trigger, background-scroll lock).

This is a well-engineered responsive nav. Whether the *content* of individual pages (cards, tables, forms) holds up at 390px width was not independently verified live in this pass — flagged as a limitation, not a finding of a defect.

---

## 19. Competitor Experience Comparison

Evidence basis: public marketing/product pages, App Store/Trustpilot reviews, Mumsnet threads, and platforms' own support documentation for Atom Learning, Bond Online/CENTURY, and Eleven Plus Exams VLE (no authenticated dashboard access to any competitor). No content was copied verbatim; all comparisons are paraphrased pattern-level observations.

**A. Market conventions Angel should meet:**
1. A hard practice/mock distinction with exam-grade scoring — Atom's Standardised Age Score + national percentile + subtopic breakdown is the current market bar for mock reporting; a bare "% correct" will read as thin by comparison.
2. Difficulty tiering as a first-class practice dimension (Eleven Plus Exams' Beginner/Intermediate/Advanced, Bond's Stretch/Up to Speed) — parents expect to see and choose a level, not just a subject.
3. A real plain-language progress tier layered over any raw score (Atom's Needs Practice/Good/Strong/Master) — directly relevant to closing §15's gap.
4. Frictionless, honest account/subscription mechanics — the single most consistently damaging failure mode found across competitor reviews (Atom's cancellation/refund complaints, Bond's login/support complaints) was a trust failure, not a feature gap. Given Angel's "parent-trustworthy" positioning, this is a low-cost differentiator if the platform simply doesn't repeat it.
5. A visible content-authority signal near the top of the parent experience (who wrote/verified the content) — every credible competitor leads with this.

**B. Areas Angel can legitimately exceed competitors:**
1. Wrong-answer explanation depth — an independently corroborated, recurring competitor gap (a Mumsnet parent and a separate CENTURY teacher-reviewer both flagged that competitors give a score without explaining *why* an answer was wrong). If Angel's evidence-tier model can deliver genuine per-question misconception feedback, that's a real, evidenced differentiator.
2. A true diagnostic entry point — no researched competitor clearly offers a formal "let's find out where your child is now" diagnostic moment at onboarding.
3. A true daily "Today" landing screen — competitors researched frame their home experience around a weekly plan, not a single day's plan; Angel's existing `Today` destination (§11) is already structurally ahead of this pattern if it reliably answers "what should my child do right now."
4. Closing the mock→practice feedback loop automatically — no researched competitor clearly demonstrates mock results reshaping the next practice/teaching plan.
5. Tone discipline around "AI" — Bond leans hard into "AI-driven" marketing; Atom (the more premium-feeling of the two) notably avoids foregrounding the word. This validates Angel's own no-AI-language rule directly against market evidence, not just as an internal preference.

**C. Competitor patterns Angel should deliberately avoid:**
1. A Duolingo-style streak/badge/creature game layer (CENTURY) — exactly the "gamified for its own sake," childish-not-child-friendly line this audit's own brief warns against.
2. Marketing-site-shaped in-product navigation (Bond mixes "Shop"/"Guidance" with actual product links) — Angel's existing 5-destination nav is already structurally ahead of this; worth protecting by keeping commerce/marketing entirely out of the authenticated surfaces.
3. Score-without-explanation (the CENTURY/Bond gap noted in B1) — worth naming explicitly as an anti-pattern, not just an opportunity.
4. Aggressive/ambiguous subscription mechanics (Atom's Trustpilot pattern).

**Cross-check against Angel's own prior internal competitor benchmark** (`ANGEL_SELECTIVE_PREP_COMPETITOR_BENCHMARK.md`, 2026-09-05): "we are adaptive" is table-stakes, not a differentiator — most competitors already claim it. CSSE-specific depth is Angel's one currently uncontested competitive position (CSSE's own site reportedly points families toward Atom, a generalist). The recommendation to lead on "provable diagnostic honesty" plus CSSE specialism, rather than raw question count or a bare "adaptive" claim, is corroborated by this fresh pass and should stand.

---

## 20. Accessibility Concerns (spot-check only — not a full WCAG audit)

Positive, verified findings: the Writing picture-stimulus flow enforces `alt` text at the type level, not just by convention (§13). Status indicators pair colour with a text label consistently, never colour-only. `aria-live="polite"` is used consistently on loading states across every file sampled. No icon-only, unlabeled buttons were found in the files sampled. The mobile nav drawer has real keyboard/focus-trap handling (§18).

Not verified in this pass, flagged as a gap: `components/mockAttempt/*` (the mock timer and question palette) were not accessibility-audited — these are exactly the kind of time-pressured, high-stakes interactive components where accessibility gaps matter most, and should be checked directly before any further accessibility claim is made about the Mock experience.

---

## 21. Trust / Privacy Presentation Concerns

`app/privacy/page.tsx` is clear, plain-English, and appropriately restrained — it limits child data collection to first-name/nickname only (no DOB, photo, school, or address), and names OpenAI and Supabase as sub-processors, which is the correct, legally-appropriate place for that vendor disclosure (this audit's brief explicitly permits this — it is not user-facing product surface).

**A real, concrete flag, not fully verified live:** the privacy policy states a parent "can use Angel 11+ without creating an account" and describes local-only usage as the default. Very recent commits (within the last day of this repo's history: `fix(access-control): require a Supabase session for /api/writing-feedback`, a "registered-parent gate" for learner surfaces, and "familiar parent login — email + password primary") suggest account/session requirements have tightened materially and recently. This audit could not confirm live signed-out behaviour (§1), so this is flagged as a **possible privacy-policy accuracy drift requiring direct Founder/legal verification**, not a confirmed defect. Given it's a legal-copy accuracy question, it should be checked before this audit's other, lower-stakes findings.

---

## 22. Top 10 Material Experience Problems, Ranked by Learner/Parent Impact

1. **No public first-impression surface exists.** `app/page.tsx` is a bare redirect to `/dashboard`. There is currently no homepage for a prospective parent to land on — Journey A does not functionally exist. Highest-impact single gap: it affects every new family before anything else in this report matters.
2. **The Legacy (non-CSSE) Parent Dashboard reads as a generic AI/SaaS dashboard and blends guided/independent scoring**, on the single surface the brief itself calls commercially critical, for what is likely still most families.
3. **Two undisclosed parallel learner experiences (CSSE vs. non-CSSE)**, with no indicator anywhere telling a family which one they're in or why quality differs between them.
4. **Two real, built, evidence-tagged English lessons are completely unreachable**, directly contradicting the Learn hub's own honest "not ready yet" copy.
5. **The Zero-Purple design rule is violated live in six places, two of them inside the CSSE Mock Report and Mock card** — the platform's own stated identity is broken exactly where trust matters most.
6. **The Progress page's clinical section headings** ("Diagnostic Overview & Coverage Gaps") are inconsistent with the friendlier tone already used for the same data on the Parent Dashboard.
7. **An orphaned `/mock-test` route bypasses the Educational Intelligence evidence pipeline entirely** — dead today, but a latent data-integrity risk if ever accidentally linked back in.
8. **No photography or imagery exists anywhere in the product** — a deliberate policy, but one that leaves the (currently nonexistent) homepage, onboarding, and celebration moments without any of the warmth the brief's target direction calls for.
9. **"AI-magic" sparkle iconography contradicts the platform's own documented rule**, including literally flagging "this is adaptive" with a sparkle icon on legacy routes.
10. **Possible privacy-policy drift** — the policy describes account-free/local-only usage as the default while very recent commits materially tightened the account gate. Flagged for urgent, direct Founder/legal verification given the legal-accuracy stakes, separate from this report's UX findings.

---

## 23. Proposed Future Information Architecture

The current primary nav (Today / Learn / Practise / Mock / Progress) already matches the brief's target model closely enough that **no primary-nav restructuring is recommended.** The proposed changes are consolidation and disclosure, not a new structure:

- Keep the 5-item primary nav unchanged.
- Add an explicit, honest disclosure of which pathway experience a family is in, wherever Learn/Practise/Progress differ by pathway — even a single line of copy would close most of the trust gap in §7's core finding.
- Fold the two orphaned English lessons into the CSSE Learn hub's existing list (no new IA needed — the hub already exists and already lists what's ready).
- Retire `/mock-test` outright (zero inbound links, duplicates `/mocks`, bypasses the evidence pipeline — meets the brief's own RETIRE evidence bar cleanly).
- Remove the two RETIRED redirect-stub routes (`/mocks/adaptive/english`, `/mocks/adaptive/maths`) once confidence is high no external bookmark still targets them.
- Keep the Journey/Family secondary sections, the collapsed Help/support disclosure, and the honest "Soon" Angel Plus placeholder — all already well-executed.
- Longer-term (explicitly **not** part of the first increment, §24): bring the Legacy Parent Dashboard's presentation in line with the CSSE branch's already-approved pattern, and decide, as a product question, whether the two-pathway architecture should eventually converge on one shared experience shell or remain deliberately separate but clearly labelled.

---

## 24. Capabilities That Must Be Preserved

Cross-checked directly against this repo's own `AGENTS.md` and confirmed still in active use in the code inspected during this audit:

- The Educational Intelligence Engine / ALI (Angel Learning Intelligence) — must remain invisible to users, never rendered by name.
- The Diagnose → Prioritise → Teach → Practise → Assess → Review → Maintain Mastery → Rebalance loop.
- The Preparation Horizon model (year as a horizon, not fixed ability).
- The mastery/evidence model, and the "supported success is not independent mastery" rule specifically — this audit found a live risk to this exact rule in the Legacy Parent Dashboard's blended score (§16) and flags it for protection, not removal.
- The support ladder and spaced-retrieval/durable-mastery model.
- The Question Factory and the validated question bank.
- Mock-reserved governance — Practice teaches, Mock measures, and the two must stay sealed from each other. `/mocks` is the strongest evidence in this audit that this rule is being honoured well; do not weaken it in pursuit of interface simplification.
- The Writing assessment architecture, including its honest, narrowly-scoped AI-disclosure pattern (§8) — this is a model to extend, not remove.
- The CSSE pathway and its specific, validated depth — per the competitor comparison (§19), this is currently Angel's one uncontested market position.
- The multi-learner household architecture, and the single-source-of-truth `LearnerSwitcher` pattern (§17).
- RLS/security and the recently-tightened access-control gates — do not loosen these in pursuit of a smoother public-facing experience; reconcile the privacy-policy wording instead (§21).
- Privacy controls and question telemetry.

---

## 25. Evidence Limitations

- **The production site could not be reached from this environment** — neither the browser automation tool nor a direct network request could resolve `angel11plus.com` (DNS resolution failure, consistent with a sandboxed environment's network restrictions rather than confirmed evidence of an outage). All findings that would normally rely on live rendering rely on code-level evidence instead, flagged inline throughout. **Recommend the Founder verify the production domain is reachable from an ordinary browser before treating this as anything beyond an environment limitation.**
- No authenticated learner or parent session was available to this audit; all learner/parent-surface findings are code-level, not click-through-verified. Code that computes values honestly (e.g., "no hardcoded/placeholder values" comments) was spot-checked but not exhaustively traced end-to-end for every metric.
- Accessibility review was a spot-check of a handful of components, not a WCAG audit; `components/mockAttempt/*` (timer, question palette) was explicitly not reviewed (§20).
- Competitor research relied entirely on public marketing pages, reviews, and support documentation — no competitor's authenticated dashboard was accessible. Visual/layout claims about competitors are inferred from copy and reviewer language, not direct inspection, and are flagged as such in §19.
- This codebase carries a substantial, only-partially-reconciled history of prior experience/design programmes (AXT-001–004, three successive "canonical" navigation documents, a `PRODUCT_EXPERIENCE_STANDARD_V1.md` marked FROZEN that is nonetheless factually stale on colour and typography). This audit treated live code as ground truth throughout per this repo's own standing rule, and flags the documentation layer itself as needing a reconciliation pass — a documentation-hygiene task, separate from any product change.
- Non-CSSE pathway readiness (Vocabulary, Verbal/Non-Verbal/Spatial/Numerical Reasoning) was assessed only at the IA/routing level in this pass, not for underlying content depth or correctness — `AGENTS.md`'s own caution ("do not assume other pathways are production-ready without checking") should be treated as still standing for anything beyond what this report specifically verified.

---

## 26. Recommendation for the First Transformation Increment

**One increment, bounded, no redesign: a "Parent Trust & Consistency Pass."**

**Primary scope:** Bring the Legacy Parent Dashboard's presentation to the CSSE branch's already-built, already-Founder-approved pattern — replacing the raw confidence percentages, the 9-colour icon grid, the badge/pill star chips, and the "Go to Student App" language with the CSSE branch's calm, plain-language, progressive-disclosure pattern. Reuse the existing component, don't invent a new one. Separately from the presentation change, flag the blended guided/independent "Overall Score" to product/engineering as a scoring-honesty question requiring a decision (§16) — resolving it may be in-scope for this increment or may need its own follow-up depending on how much of the evidence-tier data already exists for non-CSSE pathways.

**Bundled in the same increment (each independently small, code-confirmed, zero architectural risk):**
- Fix the six live Zero-Purple violations (§9) — two of them sit inside the CSSE's own highest-trust surfaces and should be treated as the most urgent of the six.
- Replace `PremiumLoader`'s default Sparkles icon and remove the sparkle-as-"adaptive"-marker usage on the legacy GL/Vocabulary routes (§7).
- Link the two existing, built English lessons into the CSSE Learn hub (§12) — the cheapest, highest-confidence fix in this audit.
- Retire the orphaned `/mock-test` route (§4, §22).
- Rename the Progress page's clinical section headings to match the Parent Dashboard's already-approved tone (§8, §15).

**Explicitly out of scope for this first increment** (each is a larger product/architecture decision, not a bounded fix, and should be a separate, deliberate increment or Founder decision):
- Whether and how to disclose the CSSE/non-CSSE pathway branch to families (§7).
- Building a public marketing homepage — there currently is none (§1, §22).
- Any new photography/imagery programme (§10) — this is a policy decision, not a code fix.
- The privacy-policy accuracy question (§21) — this needs direct Founder/legal verification first, independent of any UX work.

This increment was chosen over a broader redesign because it targets the audit's single highest-confidence, highest-impact, lowest-risk gap (the Parent Dashboard, which the brief itself calls commercially critical) using a pattern the codebase has already built and approved once, while bundling a handful of trivial, already-pinpointed fixes that would otherwise sit unfixed indefinitely. It touches no protected architecture (§24) and requires no new design decisions — only applying decisions already made.

---

*End of report. Per the governing instruction: no implementation, no migration, no production change, and no Increment 1 has been started. This report and its file path are the deliverable; the Founder and programme lead will review the evidence and decide the transformation sequence.*
