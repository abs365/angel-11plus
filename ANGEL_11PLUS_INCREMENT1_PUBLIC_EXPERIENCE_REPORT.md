# ANGEL 11+ — Increment 1: Public Experience + Human Design Foundation

**Status: PARTIAL. Homepage is implemented, isolated, and verified working (typecheck, tests,
lint, copy-guard, and a real rendered browser check against the local dev server all pass). Two
verification gates could not be completed in this environment (live production check, and live
mobile-viewport screenshot) and are disclosed below, not converted into a false PASS. A
pre-existing, unrelated repository issue blocks a full `next build` today and is flagged for the
Founder separately.**

---

## 1. What was built

- **A real public homepage at `/`**, replacing the unconditional `redirect("/dashboard")` that
  previously sent every visitor, signed in or not, straight past any first impression. `""` was
  already listed as a public route in `lib/registeredAccess.ts` and already covered by its own
  test (`tests/lib/registeredAccess.test.ts`), so no access-control change was needed, only real
  content.
- **An isolated public design shell**: `components/public/PublicHeader.tsx`,
  `components/public/PublicFooter.tsx`, `components/public/StudyIllustration.tsx`. None of these
  touch or extend the authenticated app shell (`Navigation.tsx`, `Header.tsx`, `PageLayout.tsx`,
  `SupportFooter.tsx`) — per the governing instruction's isolation preference, this cannot
  accidentally restyle a learner/parent surface.
- **Canonical-domain readiness**: `lib/siteUrl.ts` is now the single source of truth for the
  production URL (`NEXT_PUBLIC_APP_URL`, falling back to `https://angel11plus.com`), used by
  `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`, and the homepage's own metadata. This was
  already correctly defaulted to `angel11plus.com` before this increment (confirmed by direct
  read of `app/layout.tsx`); the change here is consolidating one duplicated constant into one
  file, not fixing a wrong value. No hard-coded `*.vercel.app` URL was found anywhere in the
  codebase (repo-wide grep, zero matches).
- **`app/robots.ts` and `app/sitemap.ts`** — this product had neither before (there was nothing
  public worth crawling). Both allow only the genuinely public, informational routes and disallow
  every learner/parent surface, matching the root layout's existing `robots: { index: false }`
  default for everything else.
- **Homepage-specific metadata** (`app/page.tsx`): an absolute title bypassing the layout's
  `%s | Angel 11+` template, a description matching the new positioning, `alternates.canonical`,
  and an explicit `robots: { index: true, follow: true }` override, since this is the one route
  that should now be found.

## 2. Positioning and copy

Headline: "11+ preparation that knows what your child needs next." Every section follows the
brief's IA (A–K) in order. No banned claim was used (no "best", "number one", "guaranteed",
"official CSSE platform", "scientifically proven", "AI-powered", "supercharge", "unlock your
potential", "intelligent insights"). The independence statement is carried close to verbatim from
the governing instruction, generalised to cover every exam board, not only CSSE, since Angel 11+
serves GL/CEM/ISEB pathways too:

> "Angel 11+ is an independent preparation platform. It is not affiliated with or endorsed by the
> Consortium of Selective Schools in Essex (CSSE), or by any school, exam board or awarding body."

"What children practise" and the Mock Tests section deliberately do not overclaim: CSSE is named
as the most deeply developed pathway (matching `AGENTS.md`'s own standing caution not to imply
equivalent validation of every pathway), and the Mock Tests copy carries the same honest
disclaimer pattern already used in production at `/mocks` ("original preparation papers... not
affiliated with... any school").

## 3. Photography requirement (outstanding, documented, not filled with placeholders)

No photography was introduced. The Experience Gap Audit's own licensing rule is explicit: no image
may be used without established commercial-use rights, and no real child may be fabricated and
presented as photographed. No licensed asset was available during this increment.

**What was built instead**: `components/public/StudyIllustration.tsx`, an original, hand-authored
flat-line SVG illustration (an open book and a pencil, objects only, no depicted person). This is
the hero's "one strong educational visual." It is explicitly documented in its own file header as
a placeholder pending real photography, not a permanent design decision.

**Exact photography brief for the next increment** (to hand to a photographer or a rights-cleared
stock source):

| Slot | Subject | Notes |
|---|---|---|
| Hero (homepage) | A child of approximately 10–11 reading or writing at a home desk, natural light, genuine concentration | Currently filled by the SVG illustration above |
| Onboarding / getting-started | A parent and child looking at a workbook or screen together | Not yet built in this increment |
| Milestone / celebration state | A child's genuine, unexaggerated expression on completing a Mock or lesson | Belongs to Increment 2+, not built here |

No irrelevant decorative stock imagery, no robots, no glowing-brain or futuristic-classroom
imagery, no exaggerated stock-photo expressions, per the governing instruction §7.

## 4. Zero-Purple violation inventory (from the Experience Gap Audit; not touched this increment)

The audit found six live violations. All six sit inside existing Mock/Reasoning/Learn surfaces
this increment was explicitly told not to redesign, and none originates from a shared global
token — `app/globals.css` has been fully Zero-Purple at the token layer since the 2026-08-31
Founder pass (confirmed by direct read; no purple/violet/indigo token exists there today). Per
§14 of the governing instruction, since there is no shared root token to correct, all six are
deferred to the appropriate later increment rather than touched here:

| File | Line(s) | Violation |
|---|---|---|
| `app/verbal-reasoning/page.tsx` | 14 | `themeColor="violet"` |
| `app/reasoning/page.tsx` | 30, 39 | `color: "violet"` (Verbal Reasoning card) |
| `app/mocks/[pathway]/page.tsx` | 130 | `color: "purple"` — the CSSE Mock card's own badge colour |
| `app/learning-intelligence/mock-report/[attemptId]/page.tsx` | 426 | `border-purple-200 dark:border-purple-900` — inside the CSSE Mock Report |
| `app/english/[id]/page.tsx` | 288 | `ProgressBar color="purple"` |
| `app/learn/page.tsx` | 129 | `ProgressBar color="purple"` |

**No purple was introduced by any new Increment 1 file** — verified by a direct grep of every file
touched this increment (`app/page.tsx`, `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`,
`lib/siteUrl.ts`, `components/public/*.tsx`) for `purple|violet|indigo|gradient`: the only matches
are code comments describing the absence of these things, not rendered classes.

## 5. Increment 2 carry-forward list (recorded, not solved here)

Per the governing instruction, these are confirmed as Increment 2 inputs, not solved in this
increment:

1. **The six Zero-Purple violations above**, once a Mock/Reasoning-surface-touching increment is
   scheduled.
2. **The two unreachable English lessons** (`app/learning-intelligence/learn/english/
   reading-inference`, `.../reading-retrieval`) — not deleted, not linked, not advertised on the
   homepage (the "What children practise" section describes the platform truthfully at a category
   level and does not claim these two specific lessons).
3. **The CSSE / non-CSSE parallel-experience split** — the homepage represents Angel 11+ truthfully
   at platform level (English, Mathematics, Vocabulary, Writing, Mock Tests) without exposing or
   implying resolution of the internal split; CSSE is named as the most deeply developed pathway,
   per §16 of the governing instruction.
4. **Real photography** to replace the placeholder illustration (§3 above).
5. **A pre-existing, unrelated repository blocker found during this increment's testing** (§7
   below) — not introduced by, or in scope for, Increment 1, but it will block any real `next
   build`/deploy until resolved.

## 6. Founder configuration required for `angel11plus.com`

Nothing in this increment requires Cloudflare or SMTP configuration, and none was attempted, per
the governing instruction. Once the Founder has connected the domain in Cloudflare and Vercel:

1. **Confirm `NEXT_PUBLIC_APP_URL=https://angel11plus.com`** is set in the Vercel project's
   environment variables. The application already falls back to this exact value if the variable
   is unset, so this is a safety confirmation, not a hard requirement.
2. **Supabase → Authentication → URL Configuration**: update **Site URL** to
   `https://angel11plus.com`, and add `https://angel11plus.com/dashboard` (and any other
   currently-listed preview/production redirect URLs) to **Redirect URLs**. This is documented
   in `DEPLOYMENT.md`'s existing "Authentication: Redirect URLs" section and was not modified by
   this increment; sign-in/magic-link flows will not correctly return to the new domain until this
   is done.
3. **Verify indexing behaviour once live**: `/robots.txt` and `/sitemap.xml` are ready
   (`app/robots.ts`, `app/sitemap.ts`); no search-console action is required by this increment, but
   the Founder may wish to submit the sitemap once the domain is confirmed live.

## 7. Pre-existing, unrelated repository issue found during testing (flagged, not fixed)

While running the full test/typecheck/build gate, eleven **untracked** files under
`lib/ali/questionFactory/` (English question-family content and MR-03 coordinate blueprints, none
part of git history, none created or modified by this increment) were found to already fail
`tsc --noEmit` and two associated test files, and to block a full `next build`. Confirmed
unrelated to this increment by `git status` (they were untracked before this session touched
anything) and by content (Question Factory question-authoring files, not public/homepage code) —
this is protected architecture this increment was explicitly told not to touch, so it was left
exactly as found. **This will block any real `next build` or Vercel deploy right now, independent
of this increment's own changes**, and is worth the Founder's separate attention before this
homepage (or anything else) is next deployed.

## 8. Testing (§17 of the governing instruction)

| Check | Result |
|---|---|
| Typecheck (`npx tsc --noEmit`) | **Zero errors in any file this increment touched.** 44 pre-existing errors remain in the unrelated untracked files above (§7) — confirmed by grepping the output for every touched file path: no match. |
| ESLint, scoped to every file this increment touched | **Clean, zero warnings or errors.** |
| Copy Quality Guard (`npm run copy-guard`, dash-punctuation rule) | **Zero violations in any file this increment touched.** All reported violations are pre-existing, in files this increment did not create or edit. |
| Zero-Purple / gradient scan, new homepage code | **Clean** — see §4. |
| Internal/AI-terminology scan, new homepage code (AI, OpenAI, GPT, Claude, LLM, Supabase, Vercel, "Educational Intelligence Engine", sparkle, "intelligent insights", "AI-powered", "supercharge", "unlock your potential", "number one", "guaranteed", "scientifically proven") | **Clean** — zero matches in rendered copy. |
| Full test suite (`npm test`) | **4,782 tests: 4,779 pass, 2 fail, 1 skipped.** Both failures are in the same two pre-existing, unrelated, untracked files as §7 (`candidateStoreMapping.test.ts`, `mr03CoordinateBlueprints.test.ts`) — 0 regressions caused by this increment. `tests/lib/registeredAccess.test.ts` (the test most directly relevant to this increment's access-control-adjacent change) passes in full. |
| Production build (`next build`) | **Blocked by the pre-existing, unrelated typecheck failure in §7**, not by this increment's own code. Verified in isolation instead: with `typescript.ignoreBuildErrors` temporarily set (a local, uncommitted diagnostic only — confirmed reverted via `git diff -- next.config.ts` showing no residual change), the build compiled successfully and statically prerendered `/`, `/robots.txt` and `/sitemap.xml` (all listed `○ Static` in the build output) alongside every other existing route. |
| Homepage public-access check | **Pass**, verified live against a local dev server (`next dev`): `/` renders the full homepage for a signed-out session, does not redirect, and the browser tab title correctly reads the new metadata ("Angel 11+ \| 11+ Preparation Built Around Your Child"). |
| Authenticated learner regression check | **Pass** — `/dashboard`, visited signed-out on the same local dev server, still shows the unmodified `RegisteredAccountGate` "Create your free parent account" panel inside the full existing app shell (Navigation/Header/SupportFooter), byte-for-byte the same behaviour as before this increment. |
| Anonymous gate regression check | **Pass** — same evidence as above; `lib/registeredAccess.ts` was not modified. |
| Navigation/link check | **Pass** — clicked the homepage's "Start preparing" button live; it correctly routed to `/login` and rendered the real account-creation form. `/robots.txt` was independently loaded and its content verified. |
| Accessibility spot-check | Semantic heading order (h1 → h2 → h3), all interactive elements are real `<button>`/`<Link>` elements (not `<div onClick>`), the hero illustration is wrapped with `role="img"` and a real `aria-label` with its inner SVG marked `aria-hidden`, decorative icons throughout are `aria-hidden="true"`, colour is never the only signal (every icon pairs with a text label), and `Button`/`ButtonLink` (reused, not reinvented) already carry the app's existing 44px minimum touch-target rule. No `prefers-reduced-motion` concern: this page uses no animation beyond the existing sitewide `transition-colors`, already gated by the codebase's own `motion-reduce:transition-none` convention, reused unchanged. Not independently verified: screen-reader walkthrough and colour-contrast measurement were not performed live (spot-check only, per the governing instruction's own "at minimum" framing). |
| Console errors, local dev server | **None found**, checked immediately after a fresh navigation to `/`. |
| Mobile/tablet visual rendering | **Not verified live — tooling limitation, disclosed, not converted into a PASS.** `resize_window` reported success but `window.innerWidth` remained 958px regardless (confirmed directly via a JS check), so no true narrow-viewport screenshot could be captured in this environment. Responsiveness instead rests on code-level review: every section uses this codebase's own already-shipped, already-tested responsive conventions (`hidden md:flex` for the header's secondary nav, collapsing to wordmark + Sign in + primary CTA below the `md` breakpoint; `grid sm:grid-cols-2 lg:grid-cols-3` card grids; `px-4 md:px-8` side padding throughout, matching the audit's own "≥16px gutter" finding; no fixed pixel widths anywhere in the new files; a responsive hero heading scale, `text-3xl md:text-5xl`). **A manual check in a real mobile browser is recommended before or shortly after this ships, and is not something this session's tooling could substitute.** |

## 9. Production verification (§18 of the governing instruction)

**Could not be performed. Stated explicitly, not converted into a PASS.** Both this increment's
own attempt and the earlier Experience Gap Audit's independent attempt found `https://
angel11plus.com` unreachable from this environment: the Chrome browser tool returns "Frame with ID
0 is showing error page" for both the apex and `www.` hosts, and a direct network request
(`curl`) fails with "Couldn't resolve host" (DNS resolution failure). This is consistent with a
sandboxed environment's network restrictions rather than confirmed evidence the live site is down,
but this session's tooling cannot tell the two apart. **The Founder should check
`https://angel11plus.com` from an ordinary browser** once DNS is connected, and independently
confirm: the homepage renders (not the account-required panel), `/robots.txt` and `/sitemap.xml`
resolve, the "Start preparing" and "Sign in" links work, and the page renders correctly on an
actual phone.

Live rendering evidence was instead gathered against a local `next dev` server (identical
compiled output for every file this increment touched, differing from production only in domain
and build mode) — see §8's results above, all genuinely observed via real browser screenshots and
link clicks, not inferred from source alone.

## 10. Commit, deployment, and homepage URL

- **Commit**: not yet created at the time of writing this report — see the final message
  accompanying this report for the exact commit hash once made.
- **Deployment status**: not deployed. No push, no Vercel deploy, and no Cloudflare/DNS action was
  taken, per the governing instruction.
- **Homepage URL**: `https://angel11plus.com/` once deployed and DNS-connected; verified locally
  at `http://localhost:3000/` in this session.

## 11. GO / PARTIAL / NO-GO for Increment 1 only

**PARTIAL.**

The homepage, public design foundation, and metadata/canonical-domain readiness are complete,
internally consistent with the Experience Gap Audit's findings, isolated from the authenticated
product (§13 of the governing instruction), and verified working end-to-end against a real
rendered browser at desktop width with zero regressions to the existing access-control model.
Typecheck, lint, copy-guard, and the test suite are clean for every file this increment touched.

It is not a full GO because two of the governing instruction's own required checks could not be
completed in this environment — production reachability (§9) and a live mobile-viewport
screenshot (§8's last row) — and because a pre-existing, unrelated repository issue (§7) currently
blocks a literal `next build`. None of these three items were caused by this increment's own
work, and none require reopening any of the protected surfaces this increment was told to leave
alone; they require, respectively, the Founder checking the domain directly, a brief manual phone
check once deployed, and someone resolving the unrelated Question Factory content files before
the next deploy.

Per the governing instruction's stop condition: implementation, testing and the permitted
production verification are now complete for Increment 1. **Stopping here.** Increment 2 has not
been started; Cloudflare and SMTP were not touched; the CSSE/non-CSSE split was not merged; the
two unreachable English lessons were not connected; Today, Learn, Practice, the Mock Centre and
the Parent Dashboard were not redesigned.
