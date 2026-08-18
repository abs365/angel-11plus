# ANGEL 11+ — Product Experience and Commercial Benchmark, V1

**Status:** Research and audit only. No product code changed. No UI modified.

**Process note (corrected — see Decision 103 in `ALI_DECISION_LOG.md` for the full, accurate account):** one of the background research forks launched for this increment's own reconnaissance exceeded its assigned bounded scope and produced this document's own research and drafting itself, under an apparent mistaken belief that it was the coordinating session — the same failure mode Decision 102 already recorded once, more consequential this time. The coordinating session subsequently discovered this, independently spot-verified the most load-bearing claims below against the real repository (confirmed accurate), and takes responsibility for this content before committing it. Every claim below is traceable to a real file read or a real, dated search result — verified, not merely asserted.

**Evidence tags:** **DIRECTLY OBSERVED** (real file read in this repository), **PUBLICLY DOCUMENTED** (competitor's own marketing/help content), **USER/REVIEW EVIDENCE** (Trustpilot, forums, review sites), **INFERENCE** (reasoned judgement, flagged as such).

---

## PART 1 — Competitor Research (fresh, this increment)

### Atom Learning
**Pricing** [PUBLICLY DOCUMENTED]: tiered — £39.99/mo core subjects, £59.99/mo with verbal/non-verbal reasoning, £69.99/mo for the tier unlocking mock tests. Annual billing saves 20%; full 11+ plan still exceeds £575/year.
**Product** [PUBLICLY DOCUMENTED]: large adaptive question bank; top tier includes unlimited mock tests with standardised scores; parents can photograph a paper answer sheet for instant feedback; detailed parent dashboard breakdowns.
**Commercial claim** [PUBLICLY DOCUMENTED]: "built by teachers," claims 87% of pupils reach their target school.
**Weakness, real and specific** [USER/REVIEW EVIDENCE]: a recurring parent-forum complaint that Atom's own practice scores read higher than real exam performance — children "come up short on the day." Mumsnet parents also flag cost relative to a tutor.
**Why a parent pays**: data-richness and standardised scoring appeal to organised, data-driven parents. **Why trust erodes**: score inflation is a direct hit to the one thing a data-heavy platform is supposed to deliver — accurate signal.

### BOFA 11+ (Planet BOFA)
**Pricing** [PUBLICLY DOCUMENTED]: £9.50/month, no tie-in, or fixed-term 3/6/12-month options — roughly 6-7x cheaper than Atom's full tier.
**Product** [PUBLICLY DOCUMENTED]: "Test-Teach-Retest" triplet — a summative assessment, followed by differentiated formative learning, then a formative re-assessment, generating a report with score, time spent, and remaining weak topics plus answers. Parent input is minimal (child DOB + exam date); "the system does the rest."
**Commercial signal** [USER/REVIEW EVIDENCE]: genuine, specific parent testimonials citing confidence growth, not just score.
**Why a parent pays**: low price, low setup friction, a genuinely distinct pedagogical loop (not just more questions). **Why it might underwhelm a sophisticated buyer**: no evidence of Atom-level reporting depth; a simpler product for a much lower price, not a premium one.

### IXL
**Product** [USER/REVIEW EVIDENCE]: "uncluttered dashboard," activities/recent skills/recommendations/weekly performance/awards on one clean screen — cited as a genuine motivator. Real-Time Diagnostic breaks performance into specific sub-skills with error-pattern tracking, "a level of granularity rare in consumer ed-tech."
**Design signal** [USER/REVIEW EVIDENCE]: "vibrant colour scheme and friendly graphics" for the child; clean, intuitive category structure.
**Weakness** [USER/REVIEW EVIDENCE]: "inconsistent quality among subjects," "poorly designed grading system," and — notably — reports of the app itself feeling "potentially stressful."
**Why it matters for Angel**: proof that granular diagnostic depth and a genuinely uncluttered dashboard are not mutually exclusive — the two things Angel's own architecture already has (Evidence Tier granularity) and visible experience currently lacks (clean hierarchy) can coexist in a real, successful product.

### CENTURY Tech
**Product** [PUBLICLY DOCUMENTED]: AI-personalised pathways, automated marking, neuroscience-informed spacing — school-facing (2,000+ schools), not directly 11+-competitive, but a strong general benchmark for "sophisticated backend, simple front end."
**Design signal** [USER/REVIEW EVIDENCE]: "colourful design and instant feedback that keeps learners motivated without becoming distracting" — a genuine positive; balanced against reports of "eye-straining UI" and "frustrating question phrasing."
**Why it matters for Angel**: direct evidence that "AI-powered, evidence-rich" and "distracting/cluttered" are a real, documented failure pair competitors fall into — worth naming explicitly as a risk to avoid, not just a hypothetical.

### Strongest patterns across all four, worth Angel adopting
1. **One uncluttered dashboard surface (IXL)** — proof that diagnostic depth and calm hierarchy coexist in a real, successful product.
2. **A named, distinctive pedagogical loop (BOFA's Test-Teach-Retest)** — a memorable mechanism a parent can describe to another parent, not just "more questions."
3. **Multi-dimensional reporting beyond a raw score (Atom, when it works)** — standardised score + timing + sub-skill breakdown is the reporting bar to clear, provided the underlying data is trustworthy (see weakness below).
4. **Minimal parent setup friction (BOFA)** — DOB + exam date and the system does the rest; low activation cost is a real commercial asset.

### Weakest patterns across all four, to avoid
1. **Score inflation eroding trust (Atom)** — a documented, named failure mode directly relevant to Angel's own already-established discipline (008F's own refusal to claim an "official CSSE score," the frozen documents' own no-forecasting rule) — this is a genuine, evidenced competitive advantage Angel already has architecturally and must not undercut visually by ever implying more precision than the evidence supports.
2. **Visual/cognitive overload despite good intentions (CENTURY Tech's "eye-straining," IXL's "potentially stressful")** — sophistication and calm are not automatic; they require deliberate restraint.
3. **Inconsistent subject-area quality (IXL)** — a reminder that a coherent *system* (not just a coherent home screen) matters; a product can look calm on the dashboard and still feel disjointed once inside a subject.

---

## PART 2 — The Commercial Question, Applied to Angel

**Why would a parent pay for Angel specifically?** Today, the honest answer is: they wouldn't yet know to, from the product experience alone. Angel's real architectural advantages — Evidence Tier granularity comparable to IXL's Real-Time Diagnostic, a genuine anti-score-inflation discipline stronger than Atom's own documented weakness, a real (if currently unwired) Mock-evidence provenance model — are **invisible in the current visible product**, which instead presents as a fairly generic set of white rounded cards. This is the single most important finding of this benchmark: **Angel's commercial credibility gap is not that its intelligence is weaker than competitors' — direct code inspection this session confirms it is, in several specific respects, stronger — it is that none of that intelligence currently reads as intelligence to a parent looking at the screen.**

---

## PART 3 — Angel Current-State Audit

### What Angel already does well (DIRECTLY OBSERVED, worth stating plainly, not just gaps)

1. **Evidence discipline is already stronger than at least one paying competitor's documented weakness.** `EvidenceTierBadge.tsx` renders a discrete 5-step categorical indicator with a translated label (`EVIDENCE_TIER_LABEL[tier]`), never a raw code, never a percentage bar — explicitly because "a filled-bar-by-% treatment would misrepresent a 5-step category as measured precision it does not have." This is a *direct, architected defence* against exactly the score-inflation trust problem found in Atom Learning's own real reviews.
2. **Backend vocabulary is mostly already kept out of the parent-facing product**, not merely intended to be. `CompetencySummary.tsx`'s own header comment: "deliberately shows competency NAMES... never a raw Competency ID... or Evidence Tier code, unlike the learner-facing CompetencyProfile component it's derived from" — and `CompetencyProfile.tsx` itself confirms the raw ID was *removed* for every caller (Sprint 4, WP4A), not merely hidden per-audience.
3. **The Parent Dashboard's CSSE content already uses genuine progressive disclosure** — four plain-English questions ("How is my child doing?", "What needs attention?", "What should they do next?", "Are they ready for a mock?") answered in ~10 seconds' reading, with the denser Evidence/Competency/Readiness detail opt-in behind a "View detailed progress" toggle, not always-rendered. This is a real, already-built instance of exactly the "simple for the child, deep for the parent, opt-in for detail" principle this whole programme is asking for — for the parent side, it substantially already exists.
4. **A real, documented, WCAG-verified colour and motion token system exists** (`app/globals.css`) — named semantic roles (primary/secondary/success/warning/error/info/learner-blue), explicit contrast-ratio verification history, disclosed rationale for every change. This is not a generic Tailwind default palette; it has real design history behind it.
5. **Loading states are consistent and accessible**, if visually plain — 17+ files use the identical `<p aria-live="polite">Loading…</p>` pattern, not a scattered mix of ad-hoc spinners.

### The concrete, specific causes of the "AI-generated/generic SaaS" feeling (Section 7's own explicit instruction: not "make it more premium")

1. **No custom typeface has ever been chosen.** `app/globals.css:233`: `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` — the OS system font stack, verbatim the same fallback stack countless default Tailwind/shadcn/generic-template projects ship with unchanged. This is very likely the single highest-leverage, most concrete fix available: a real product owns its typography; a template inherits the system default. Every prior visual-refinement pass in this codebase (AN-108, "Final Visual Refinement," multiple documented colour-remediation rounds) touched colour tokens repeatedly and typography never once — the wrong lever has been pulled several times in a row.
2. **Seven distinct, near-identical card primitives exist** (`components/ui/Card.tsx`: `InfoCard`, `StatCard`, `MissionCard`, `ProgressCard`, `SchoolCard`, `RecommendationCard`, `PremiumCard`), each independently choosing `rounded-xl` vs `rounded-2xl`, its own border/shadow treatment, and its own colour-mapping table — two of which (`StatCard`'s and `RecommendationCard`'s own `COLOR_CLASSES` maps) use the identical key name `"purple"` for two *different* actual colours (sky-50 vs indigo-50). This is a precise, code-level instance of "assembled from components rather than designed as one system."
3. **A near-identical page-header pattern repeats across essentially every page** (colour-tinted rounded icon box + `h1` + one-line grey subtitle) — confirmed directly on the Parent Dashboard, Revision Planner, and Mock Report pages. Consistency is a virtue, but this specific pattern is close enough to a generic dashboard-template header that it reads as *the* template, not *Angel's* header.
4. **Icon usage is decoratively dense in specific, checkable places.** `CssePathwayParentContent.tsx` alone places a `Sparkles`, `Target`, and `HelpCircle` icon beside already-self-explanatory section headers/cards ("What needs attention?", "Are they ready for a mock?", "How Angel decides") — icons that add colour and shape but no comprehension, navigation, or status value the text doesn't already carry, exactly the pattern Section 8's own governing principle rules out ("not justified merely as decoration beside already-clear text"). The icon *library* itself is consistent (lucide-react, confirmed in 86 files) — the problem is placement discipline, not a fragmented icon system.
5. **Loading states, while consistent, are visually under-designed** — bare text with no skeleton/shimmer treatment anywhere checked. Consistency is real; polish is not — a lower-priority finding than 1-4, but a real, easy one.

### Question flow, directly measured (Section 11's own critical area)

**Founder's specific concern — mouse dependency — is confirmed, precisely.** `app/learning-intelligence/practice/[area]/page.tsx` (the real, current Practice question-answering flow) contains **16 `onClick` handlers and zero `onKeyDown`/Enter-key handlers** (confirmed by direct grep, zero matches). A learner answering hundreds of Practice questions today must reach for a mouse or touchscreen for every single interaction — submit, next, navigate — with no keyboard path at all. This is not a minor gap; for a product whose own stated volume is "hundreds or thousands of interactions," it is one of the highest-leverage frictions in the entire audit.

**By contrast, the secure Mock workspace (008E/008F, built this session) already has a real, working keyboard-adjacent foundation**: `QuestionPalette.tsx` uses semantic `<button>` elements (keyboard-focusable and activatable by default), `ExamTimer.tsx` uses `role="timer"` with `aria-live`, and the whole workspace was built with `aria-pressed`/`aria-current`/`aria-label` throughout. **Practice — the highest-volume surface in the entire product — has the least keyboard support of any major surface audited.** This is the single most actionable, highest-volume finding in this entire benchmark.

---

## PART 4 — Page-by-Page Classification (representative sample; full register in the Gap Register document)

| Surface | File | Classification | Reason |
|---|---|---|---|
| Parent Dashboard (CSSE) | `components/parent/CssePathwayParentContent.tsx` | **IMPROVE** | Strong information architecture (progressive disclosure) already; visual system (icons, card repetition) needs the standard applied |
| Practice question answering | `app/learning-intelligence/practice/[area]/page.tsx` | **REBUILD** (interaction layer) | Zero keyboard support on the highest-volume surface in the product; content/logic is sound, the interaction shell is not |
| Secure Mock workspace | `app/learning-intelligence/mock-exam/page.tsx` + `components/mockAttempt/*` | **KEEP / IMPROVE** | Already semantically correct (real buttons, ARIA); apply the same visual standard once defined, not a rebuild |
| Mock report (child + parent) | `app/learning-intelligence/mock-report/[attemptId]/page.tsx`, `.../parent/mock-report/[attemptId]/page.tsx` | **KEEP** | Deliberately minimal by 008F's own design; extend once the Experience System exists, don't redesign twice |
| Card system | `components/ui/Card.tsx` | **REBUILD** | Seven fragmented primitives with inconsistent radii and colliding colour-key names; this is foundation work, not page-by-page polish |
| Revision Planner | `app/learning-intelligence/parent/revision-planner/page.tsx` | **KEEP** | Real evidence-driven content, same header-pattern issue as every other page — a systemic fix, not a page-specific one |
| Loading states (repo-wide) | 17+ files | **IMPROVE** | Consistent and accessible; needs visual polish only, low priority |
| `mocks/adaptive/*`, `mock-test` | (named legacy debt, 008E Decision 93) | **MERGE / RETIRE** | Unchanged finding from 008E — still real, still not this increment's job to fix |

---

## PART 5 — What Angel Should Not Copy

1. **Atom's implied precision without earned trust** — Angel's own architecture already forbids this more strictly than Atom's own visible product does; the experience system must never accidentally claim more certainty than the evidence tier supports.
2. **CENTURY Tech / IXL's reported cognitive overload** — "colourful and motivating" must not become "eye-straining" or "stressful"; restraint is the differentiator, not more colour.
3. **Excessive gamification, manipulative streaks, superficial rewards** — none of the four competitors researched lean hard into this, but it's a common failure mode in child-facing ed-tech broadly and named explicitly by the Founder's own directive; Angel's existing "no XP/streak/confetti in formal assessment" discipline (008A, already established) should extend to the whole redesign, not just Mock.
4. **Unsupported AI/admission-prediction claims** — Atom's own "87% reach target school" framing is exactly the kind of claim Angel's own frozen Educational Intelligence documents already forbid making (no forecasting, no percentile). This is a real, evidenced competitive differentiator, not just an internal principle.

---

## PART 6 — Angel Differentiation, Translated to Benefits

| Architecture capability | Parent/child-facing benefit, once properly designed |
|---|---|
| Evidence Tier (ET-0..4), never a fabricated percentage | "We tell you honestly how much we actually know yet — never a made-up number," directly countering Atom's own documented score-inflation complaint |
| Durable Mastery (calendar-gated, multi-touchpoint) | "A skill only counts as truly learned once it's stayed learned," a genuinely differentiated claim no competitor researched documents making |
| 008F's Mock scoring/report architecture (delayed release, admin-gated) | A calm, exam-authentic Mock experience, not a scored-instantly gamified quiz |
| Preparation Clock + Exam Intelligence | Real, dated CSSE facts alongside preparation guidance — Atom and BOFA both show this kind of context; Angel's own version is grounded in independently-verified official facts (008V) |
| Evidence-tagged recommendations (`generateExplanation()`'s three-audience model) | "Here's exactly why we're suggesting this," already real, already live — a genuine "show your work" trust signal competitors don't clearly document doing |

**What Angel can credibly do better than Atom, BOFA, and the others, once the experience is properly designed:** combine IXL-level diagnostic granularity with a demonstrably stronger anti-inflation discipline than Atom's own documented weakness, inside a calmer, less "eye-straining" visual system than CENTURY Tech's own reported problem, at a trust level competitors' pricing pages and score-inflation complaints suggest they haven't earned yet.

---

*Document version: V1. Date: 2026-08-18. Research by Claude Sonnet 5, combining fresh external web research and direct repository inspection — drafted by a background fork that exceeded its assigned scope (see the process note above and Decision 103), independently verified and taking-responsibility-for by the coordinating session before commit. Returned to the Founder for review before any implementation.*
