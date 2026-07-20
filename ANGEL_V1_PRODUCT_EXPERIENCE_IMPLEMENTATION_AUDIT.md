# Angel Version 1 — Product Experience Implementation Audit

**Repository:** `C:\Users\Admin\Workspace\projects\angel-11plus`
**Production commit under audit:** `9cffb7a` (confirmed live on Vercel per this mission's brief)
**Status:** Audit only. No code changed, no UI redesigned, no deployment performed. This is a factual comparison of what is written in `PRODUCT_EXPERIENCE_STANDARD_V1.md` / `CAP4_LAUNCH_ACCEPTANCE_PACK.md` / `ANGEL_V1_RELEASE_CERTIFICATION.md` against what is actually rendered by the code on disk today.

---

## 0. Method

The three governing documents were read in full, then every route reachable from `components/Navigation.tsx` (the real, live nav — desktop sidebar + mobile bar) was mapped to its file, and each was read in full or targeted (with confirming repo-wide greps for the two most load-bearing, mechanical rules: gradients and raw XP/streak numeric displays, which were checked across **all 43** `app/**/page.tsx` routes, not just the ones named in this mission). `git log`/`git show` was used to determine exactly what the Wave 4 commit (`ea7d8af`) did and did not touch on specific files, so "claimed fixed" could be checked against "actually diffed."

Nav → route map used throughout this report (source: `components/Navigation.tsx:55-109`):

| Nav label | Route |
|---|---|
| My Admission Journey | `/dashboard` |
| Progress | `/progress` |
| Learning Intelligence | `/learning-intelligence` (+6 subroutes) |
| Learn | `/learn` |
| Practice | `/reasoning` |
| Mock Centre | `/mocks` |
| School Intelligence | `/pathways` |
| Parent Hub | `/parent` |
| Support (Getting Started, Send Feedback, Share Experience, Contact) | `/getting-started`, `/feedback`, `/testimonial`, `/contact` |

Note: "Vocabulary" is not a nav-level destination in its own right — it's reached via the Learn hub (`/learn` → `/vocabulary`, `app/learn/page.tsx:38`). Audited directly at `/vocabulary` per this mission's explicit route list.

---

## 1. Headline finding — the platform's single biggest Product Experience deliverable violates its own retained rule

**Route(s):** `/learning-intelligence`, `/learning-intelligence/practice`, `/learning-intelligence/practice/[area]`, `/learning-intelligence/parent`, `/learning-intelligence/recommendations`, `/learning-intelligence/timeline`, `/learning-intelligence/mock-exam` — 7 of the app's 43 routes, all built by this same Capability 3 programme (Waves 1-4).

**Expected behaviour** (`PRODUCT_EXPERIENCE_STANDARD_V1.md` §7, "Calm educational tone" — explicitly *retained*, not corrected, from `ANGEL_DESIGN_LANGUAGE.md` §7): *"never show 'Adaptive/Learning Unit/Competency/Intelligence/Recommendation Engine/Beta' to users; prefer 'Practice/Recommended Practice/Today's Session/Your Next Goal.'"*

**Actual behaviour:** Every one of these 7 routes shows the words "Intelligence" and/or "Competency" directly to the learner or parent, in the page's own H1, its breadcrumb (present on every page via `PageLayout`), and/or its section headers:

- `app/learning-intelligence/page.tsx:65` — H1: `"Learning Intelligence"`; `:141` — H2: `"Competency Profile"`; `:76/85/93` — body copy repeats "Learning Intelligence" / "School Intelligence" three more times.
- `app/learning-intelligence/practice/page.tsx:31,36` — breadcrumb "Learning Intelligence"; body copy "updates your **Competency Profile**, Evidence Profile, Readiness and Recommendations."
- `app/learning-intelligence/practice/[area]/page.tsx:236-237,334,361` — "updates your **Competency Profile**... on your **Learning Intelligence** dashboard"; H2 "Updated Competency Profile"; footer link "Full Learning Intelligence dashboard →".
- `app/learning-intelligence/parent/page.tsx:57,107` — breadcrumb "Learning Intelligence"; H2 "**Competency Summary**" — shown to a **parent**, the exact audience §7's source rule was written to protect (Wave 3's own memory record confirms the parent-facing-language rule was otherwise deliberately enforced on this exact page — see Section 5 below for the contradiction this creates).
- `app/learning-intelligence/recommendations/page.tsx:29` — breadcrumb "Learning Intelligence".
- `app/learning-intelligence/timeline/page.tsx:53` — breadcrumb "Learning Intelligence".
- `app/learning-intelligence/mock-exam/page.tsx:215,227,328,342` — breadcrumb "Learning Intelligence"; body copy "your **Learning Intelligence** profile updates"; H2 "**Competency Profile**"; footer link "Full Learning Intelligence dashboard →".

The nav item itself is also named this way: `components/Navigation.tsx:61` — `{ href: "/learning-intelligence", label: "Learning Intelligence", icon: Brain }`.

**Root cause:** The feature was named and built (Capability 3, Waves 1-4, 2026-07-20) *before* `PRODUCT_EXPERIENCE_STANDARD_V1.md` existed as a document, but the calm-tone rule it violates is not new — it is `ANGEL_DESIGN_LANGUAGE.md` §7, a pre-existing rule the Standard explicitly chose to **retain unmodified** rather than correct (`PRODUCT_EXPERIENCE_STANDARD_V1.md` §7 cites it directly as binding). Every subsequent verification pass (`CAP4_LAUNCH_ACCEPTANCE_PACK.md` §4, `ANGEL_V1_RELEASE_CERTIFICATION.md` §3) checked Product Experience compliance only against gradients, XP/Level/Streak, one-CTA, and Title/sentence case — **never against the calm-tone forbidden-word list**, even though that list was sitting in the same document, one section below the checks that were actually run. No one cross-checked the programme's own newest and largest deliverable against its own Standard's most distinctive naming rule.

**Classification: B — Partially implemented.** (The pages correctly avoid gradients, correctly use one primary CTA in most cases, and correctly use plain-language "Practice now" copy in places — but they fail the calm-tone rule pervasively and by name, not by omission of a minor detail.)

---

## 2. Per-route findings

### `/dashboard` — "My Admission Journey" (Journey section)

**File:** `app/dashboard/page.tsx`

**What's implemented:** A post-Wave-4 homepage (rewritten across EEP-001→003, then finished by Wave 4 itself — `git log --oneline -- app/dashboard/page.tsx` shows `ea7d8af` Wave 4 is the *most recent* commit on this file, confirming the Standard's corrections were applied last, not bypassed by later work). `PremiumCard` Hero is flat purple (`components/ui/Card.tsx:190`, no gradient). Hero shows only a session count (`app/dashboard/page.tsx:184`, `{progress.completedLessons.length} sessions`) — no XP/Level/Streak number anywhere in the Hero. Exactly one solid-purple CTA ("Start Today's Mission", `:343-347`); "Continue" in the Continue Learning row is correctly demoted to `variant="secondary"` (`:501`), matching the fix `CAP4_LAUNCH_ACCEPTANCE_PACK.md` §4 claims.

**Gap found:** Two button labels violate the Standard's own sentence-case rule for body/button copy (§2): `"View Full Progress →"` (`:429`) and `"Take a Mock"` (`:511`) are Title Case, not sentence case. Minor, but real — neither was on the list of instances `CAP4_LAUNCH_ACCEPTANCE_PACK.md` §4 claims were fixed.

**Classification: B — Partially implemented** (structure/CTA/gradient/XP corrections genuinely done; sentence-case pass incomplete even on the one page Wave 4 most directly worked on).

### `/progress` — "Progress" (Journey section)

**File:** `app/progress/page.tsx`, `components/BadgeCard.tsx`

**What's implemented:** Gradient correctly removed (`CAP4_LAUNCH_ACCEPTANCE_PACK.md`'s "3 gradient declarations total" claim holds — confirmed by repo-wide grep, zero `bg-gradient-to-*` remain in `app/` or `components/` outside a code comment). No raw "XP: N" or "Streak: N days" number is rendered anywhere on the page.

**Gap found:** The "Achievements" section (`app/progress/page.tsx:465-539`) renders `BADGE_DEFINITIONS` (`lib/gamification.ts:11-134`) via `BadgeCard`, which prints `badge.name` and `badge.description` **verbatim** (`components/BadgeCard.tsx:62,64,79,81`). Three of those names are literally `"3-Day Streak"`, `"Week Warrior"`, `"Fortnight Focus"` (`lib/gamification.ts:15,23,31`), and three descriptions literally read `"Earned 100 XP"` / `"Earned 500 XP"` / `"Earned 1,000 XP"` (`:118,126,134`). The category header above them is relabelled "Consistency" (`app/progress/page.tsx:518`), but the individual badge cards underneath still show the word "Streak" and the literal string "XP" to the learner, in a normal (non-hidden, non-locked) state whenever earned.

**Root cause:** `CAP4_LAUNCH_ACCEPTANCE_PACK.md` §4/§6 **already discloses this exact gap** ("Achievement/Badge system deliberately left untouched... 3 badges whose description text literally states an XP threshold") and correctly frames it as a distinct, bounded, Founder-decision item, not a silent omission. This audit confirms that disclosure is accurate and the gap is still live in production-bound code today.

**Classification: B — Partially implemented** (numeric XP/streak displays removed everywhere else on this page; the Badge system's own name/description strings were explicitly out of scope and remain non-compliant, as already disclosed).

### `/learning-intelligence` (+6 subroutes) — "Learning Intelligence" (Journey section)

Covered in Section 1. **Classification: B.**

### `/learn` — "Learn"

**File:** `app/learn/page.tsx`

**What's implemented:** No gradient, no XP/streak, exactly one CTA ("Continue Learning", `:78-80`, only shown when a mission item exists), calm language throughout ("Learning Hub", "Your core subjects" — no forbidden words). Subject cards use real, already-computed data (`ProgressBar` fed by `analytics.avgScore`, `:112`) — no fabricated completion percentage.

**Gap found:** `"Continue Learning"` (`:79`) is Title Case; per §2 it should be `"Continue learning"` as button/CTA text (the header above it, `"Quick Resume"`, correctly stays as a label but isn't itself a named feature so is arguably also miscased — minor).

**Classification: B — Partially implemented**, closest to fully compliant of any route audited.

### `/vocabulary` — reached via Learn

**File:** `app/vocabulary/page.tsx`

**What's implemented:** Gradient removed (`git show ea7d8af -- app/vocabulary/page.tsx` confirms `bg-gradient-to-br from-green-600 to-emerald-500` → flat `bg-emerald-600 dark:bg-emerald-700`, line 302). The "+X XP earned" results pill was removed in the same commit (diff shows the `Star`/`xpGained` UI deleted, `:68-76` region).

**Gap found:** Every button label on this page is Title Case, and **none of them were touched by the same Wave 4 commit that edited this exact file for the XP/gradient fixes**: `"Back to Vocabulary"` (`:100`), `"Try Again"` (`:106`), `"Start Flashcard Session"` (`:318`), `"Submit Sentence"` (`:230`). This directly contradicts the specific claim in `CAP4_LAUNCH_ACCEPTANCE_PACK.md` §4 that `"'Try Again' → 'Try again'"` was fixed "on the pages this Wave directly touched" — Wave 4 *did* directly touch this exact file (confirmed via `git show`), for a different reason, and left this particular "Try Again" instance in Title Case. The pack's claim is not false — a different "Try Again" instance elsewhere (one of the newer Wave 2 practice pages) was very likely the one actually fixed — but read plainly, the claim implies broader coverage than what the diff shows.

Header wording is also not calm/minimal by the Standard's own §7 standard for empty/completion states: `"Vocab Session Done!"` (`:70`, exclamation mark, abbreviation "Vocab") reads as more enthusiastic/gamified in tone than the deliberately calm phrasing used on the newer Wave 2-4 completion screens (e.g. `/learning-intelligence/practice`'s "Practice complete", per `CAP4_LAUNCH_ACCEPTANCE_PACK.md` §4's own before/after list).

**Classification: A — Never implemented** (for the sentence-case and tone rules specifically on this route). This is the oldest, most completely un-refreshed of the routes named in this mission — only the two mechanical corrections that happened to be edited in the same commit for other reasons were applied; nothing else about this page has ever been brought into line with the Standard.

### `/mocks` — "Mock Centre"

**File:** `app/mocks/page.tsx`

**What's implemented:** No gradients. No XP/streak displays. Calm framing of the ALI-adaptive practice cards is genuinely good: `:121-123`'s own code comment states "ALI is invisible here... nothing on this page says 'adaptive,' 'beta,' or names the mechanism" — and it's true, confirmed by reading the rendered copy (the section is labelled "Personalised Practice", not "Adaptive Practice").

**Gap found — a clear, material violation of §6 (One primary CTA per page):** this single page contains **eight** solid, fully-saturated colour buttons, each visually competing for primary attention:
- Four "Start Practice" buttons, each in a different solid colour: violet-700 (`:151`), blue-700 (`:180`), purple-700 (`:209`), emerald-700 (`:238`).
- Four "Start Mock" buttons, each a different solid colour matching its card: blue-600, indigo-600, purple-600, emerald-600 (`:311-317`, driven by `card.btnBg` at `:36,49,62,75`).

The Standard is explicit: *"exactly one visually-dominant call-to-action... secondary actions use text links or outline/ghost buttons, never a second competing solid-purple element"* (§6). This page has eight, in four different hues, stacked in one scroll. Button copy is also mixed-case: "Start Practice"/"Start Mock" (Title Case) vs. "Start another mock" (`:551`, sentence case) vs. "View all" (`:494`, sentence case) — three different casing conventions on one page.

**Root cause:** `PRODUCT_EXPERIENCE_STANDARD_V1.md` §6 states plainly this rule was *"applied to the pages this Wave directly touched... not independently re-audited on every one of the app's ~40 routes"* — Mock Centre was never one of the pages Wave 4 touched for this rule (its own commit diff, not shown here for brevity, does not include `app/mocks/page.tsx`), and this audit is the first time it has actually been checked against §6. It fails, clearly.

**Classification: B — Partially implemented** (calm-tone and no-gradient rules pass; one-CTA and sentence-case rules fail outright).

### `/parent` — "Parent Hub" (legacy hub, distinct from `/learning-intelligence/parent`)

**File:** `app/parent/page.tsx`

**What's implemented:** No gradients. No raw "XP: N"/"Level N" display. `computeParentReport()`'s existing plain-language insight groupings ("Doing Well" / "Areas to Support" / "Suggested Actions") are genuinely calm and non-alarmist (`:646` — "Needs Attention" was deliberately reworded to "Areas to Support" per an earlier EEP-004 sprint, confirmed in the code's own comment).

**Gap found — two separate, direct violations of the calm-tone rule this route's own Standard document retains as binding:**
1. **`"Beta"` is shown to the user twice**, in exactly the form §7 names as forbidden: a badge next to the H1 reading literally `"Beta"` (`app/parent/page.tsx:178`), and a whole callout section titled `"Parent Dashboard — Beta"` (`:749`) whose body text says *"This dashboard is in beta"* (`:751`). §7's rule (`ANGEL_DESIGN_LANGUAGE.md` §7, retained verbatim by `PRODUCT_EXPERIENCE_STANDARD_V1.md` §7) lists "Beta" as one of five specific words never to show a user — this is the single most literal, unambiguous instance of that exact rule being broken anywhere in the audited surface.
2. **The Badges Earned section** (`:719-740`) renders `report.earnedBadges` (sourced from the same `BADGE_DEFINITIONS` as `/progress`, via `computeGamification()`) showing `badge.name` directly in a chip, with `badge.description` as its hover tooltip (`title={badge.description}`, `:730`) — meaning a parent viewing this page can see a badge chip literally reading "3-Day Streak" or hover to see "Earned 500 XP". Same underlying defect as `/progress`, on a second, parent-facing surface.

**Classification: B — Partially implemented.** The insight/tone work from the EEP-004 sprint is real and predates this Standard by weeks but happens to already satisfy it in most places; the two findings above were never touched by any wave of this Standard's rollout.

### `/pathways` — "School Intelligence"

**File:** `app/pathways/page.tsx`

**What's implemented:** No gradients. No XP/streak/badge UI of any kind on this page. Calm, single-purpose copy throughout ("Your target exam pathway, what it assesses..."). The one interactive button outside the pathway-selector cards ("Save", `:264`) is correctly sentence case and is not competing with any other solid CTA — the pathway cards themselves are the primary interaction, and `"Save"` is a small, secondary, outline-style control for the optional exam-date field.

**Gap found:** None material. Named-feature headers ("School Intelligence", "Choose Your Pathway", "Target School Overview") are correctly Title Case per §2's own carve-out for named features.

**Classification: — Fully implemented.** The only fully clean route found in this audit among the ones this mission explicitly named.

### Support pages — `/getting-started`, `/feedback`, `/testimonial`, `/contact`

**Files:** `app/getting-started/page.tsx` (read in full), `app/feedback/page.tsx` (grep-checked)

**What's implemented:** `/getting-started` is calm, sentence-case body copy throughout, single solid-purple CTA per numbered step is a text link, not a competing solid button (`:33-38`, `:70-75`) — compliant. `CAP4_LAUNCH_ACCEPTANCE_PACK.md` itself lists "Getting Started's promotional copy" as one of the XP/streak removals already made here — confirmed, no XP/streak references remain in this file. `/feedback` uses one single solid-purple submit button (`:151`) — compliant with §6.

**Classification: — Fully implemented** (for the two pages directly checked; `/testimonial` and `/contact` were not independently read this session — see Section 4, Known Limitations, honestly disclosed rather than assumed clean).

---

## 3. Confirmed fully compliant, repo-wide (not just on the named routes)

Two of the Standard's corrections were checked with a repo-wide grep across **all 43** `app/**/page.tsx` files, not just the ones this mission named, because both are mechanical, unambiguous string patterns:

- **Gradients (`bg-gradient-to-*`):** zero matches anywhere in `app/` or `components/`, except the one line of prose inside `components/ui/Card.tsx`'s own comment describing what used to be there. `CAP4_LAUNCH_ACCEPTANCE_PACK.md`'s claim of "3 gradient declarations total... genuinely small" and its removal is **fully accurate and still true today**.
- **Raw "+X XP earned" result pills:** zero matches anywhere in `app/`. The claimed "9 near-duplicate instances... across the legacy and adaptive mock/practice pages" removal is **fully accurate and still true today**.

These are the two most mechanical, highest-confidence claims in the three governing documents, and both hold up under direct, exhaustive verification. The parts of the prior certifications that are wrong are not these two corrections — they are the claim (never explicitly made, but implied by "Recommend NOT deploying Version 1 yet" framing the database as the *only* remaining blocker) that Product Experience work was otherwise essentially finished pending a database fix.

---

## 4. Known Limitations of this audit (disclosed, not glossed over)

1. Not every one of the 43 routes was read in full. `/testimonial`, `/contact`, `/mock-test`, `/english`, `/maths`, `/writing`, `/reasoning`, the four `/mocks/adaptive/*` routes, `/mocks/[pathway]`, `/angel-plus`, `/login`, `/beta*`, `/report-bug`, `/feature-request`, and the legal pages were not individually read this session. The two mechanical rules (gradients, XP-pills) were still verified against all of them via repo-wide grep; the qualitative rules (calm tone, one-CTA, sentence case, premium card styling) were not independently checked on these routes and may contain further findings of the same kind documented above. This mirrors the exact scope limitation `PRODUCT_EXPERIENCE_STANDARD_V1.md` §6 and `CAP4_LAUNCH_ACCEPTANCE_PACK.md` §6 item 2 already disclosed — this audit closes part of that gap (the mission-named routes) but not all of it.
2. Accessibility, performance, and educational-integrity claims from the three governing documents were **not** re-verified here — this audit's scope is Product Experience implementation only, per the mission brief.
3. Production database state (RLS/migration status) is unchanged and out of scope for this audit — it is a separate, already-exhaustively-documented blocker (`RR001_PRODUCTION_DATABASE_RECOVERY_REPORT.md`, `PRODUCTION_DEPLOYMENT_V1.sql`).

---

## 5. Conclusions

### 5.1 Overall implementation percentage

**Estimated 55-60% of Product Experience Standard V1 is genuinely, verifiably implemented across the routes this mission named.**

This is not a single uniform number because compliance is bimodal by rule, not by page:

| Rule | Compliance across audited routes |
|---|---|
| No gradients | **~100%** (repo-wide verified) |
| No raw XP/Level/Streak numbers | **~95%** (repo-wide verified; only the Badge system's own name/description strings remain) |
| One primary CTA per page | **~70%** (Dashboard, Learn, Learning Intelligence hub, School Intelligence, Getting Started, Feedback all comply; Mock Centre fails outright with 8 competing CTAs) |
| Sentence case for body/buttons | **~50%** (newer Wave 2-4-authored copy mostly complies; legacy Vocabulary, Mock Centre, and even some Wave-4-edited files like Dashboard retain Title-Case button labels) |
| Calm tone / forbidden-word list | **~25%** (the single worst-performing rule — violated by name across the entire 7-route Learning Intelligence surface and twice, explicitly, on Parent Hub) |

Weighting these evenly, and toward the low end because the calm-tone rule is violated on the platform's single largest and newest feature (not a minor corner), **55-60%** is the fair overall figure.

### 5.2 Was the previous Version 1 completion declaration accurate?

**Yes, narrowly — and no, in the impression it left.** Every specific claim in `CAP4_LAUNCH_ACCEPTANCE_PACK.md` and `ANGEL_V1_RELEASE_CERTIFICATION.md` that this audit re-checked was **factually true as stated**: gradients are gone, the specific XP-pill instances named are gone, the Dashboard dual-CTA fix holds, the specific sentence-case examples given were indeed fixed (on the specific pages implied). Both documents also **explicitly and honestly disclosed** their own scope limit — "NOT independently re-verified on every one of the app's ~40 routes" appears near-verbatim in both.

Where the declaration falls short is not dishonesty but **scope framing**: both documents' overall recommendation ("the code is ready; the database is not") implies Product Experience is essentially done pending the database. This audit shows that framing was too generous — a rule the Standard itself chose to keep, on a page one section below the checks that were actually run, was never checked against the programme's own flagship feature. **The previous declarations are accurate about what they checked, and materially incomplete about what "Product Experience is ready" means for the product as a whole.**

### 5.3 Remaining implementation work required for genuine Version 1 completion

1. **Rename or re-copy the entire Learning Intelligence surface's user-visible strings** (7 routes) to remove "Intelligence" and "Competency" from every H1, breadcrumb, and body-copy instance a learner or parent sees — the underlying route path/component names do not need to change, only the rendered text (headings, breadcrumb labels, inline copy). This is the largest single piece of remaining work and the only one classified as a systemic, cross-cutting gap rather than a page-level nit.
2. **Remove the two literal "Beta" surfaces on `/parent`** (`app/parent/page.tsx:178`, `:749-751`) — either genuinely graduate the feature out of beta or rephrase without the forbidden word, consistent with how `/mocks/page.tsx` already avoids it for its own adaptive features.
3. **Rework or hide the Badge system's Streak-named/XP-valued badges** (`lib/gamification.ts:15,23,31,118,126,134`) on both surfaces that render them (`/progress`, `/parent`) — already a known, Founder-flagged decision (`CAP4_LAUNCH_ACCEPTANCE_PACK.md` §7 item 3), still outstanding.
4. **Fix Mock Centre's 8-competing-CTA violation** (`app/mocks/page.tsx`) — demote seven of the eight solid buttons to a single consistent secondary/outline style, keeping one true primary action per section (or per page, per the strictest reading of §6).
5. **Complete the sentence-case pass** on the specific instances named in Section 2 (Dashboard's two, Vocabulary's four, Mock Centre's mixed-case set) plus whatever the same pass finds on the ~30 routes this audit did not individually read (Section 4, Known Limitation 1).
6. **Decide whether `/vocabulary` (the oldest, least-touched named route) gets a full pass or is deliberately deprioritised** — right now it sits at roughly "gradient/XP-pill only" compliance, the shallowest of any route this mission named.

### 5.4 Recommended implementation sequence, ordered by business value

1. **Learning Intelligence calm-tone rename (Section 5.3 item 1).** Highest business value: this is the platform's most-built, most-differentiated feature (4 full Waves of engineering investment) and the one most likely to be shown to a parent or reviewer first; shipping it under words the product's own Standard calls out by name as things to avoid undermines the calm, premium positioning the whole Product Experience programme exists to create.
2. **`/parent` "Beta" removal (item 2).** Second-highest: Parent Hub is the one surface explicitly aimed at the paying/deciding adult, and "Beta" undermines trust exactly where trust matters most commercially.
3. **Mock Centre one-CTA fix (item 4).** High visual impact, low engineering cost (styling-only change, no logic touched) — a fast, cheap win that removes a genuinely jarring, first-glance visual defect from a heavily-trafficked page.
4. **Badge system rework decision (item 3).** Medium value, needs a Founder decision on direction before any code changes — sequence the decision now so implementation isn't blocked later.
5. **Remaining sentence-case sweep (item 5) and Vocabulary full pass (item 6).** Lowest urgency: cosmetic-only, no trust or positioning risk, best done as a single consolidated cleanup pass once items 1-4 are settled (to avoid re-touching the same files twice).

---

Per the mission: this report is the only artefact created. No code was modified, no UI was redesigned, no deployment was performed.
