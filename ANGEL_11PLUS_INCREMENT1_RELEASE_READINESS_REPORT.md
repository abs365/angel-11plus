# ANGEL 11+ — Increment 1 Release Readiness: Bounded Build-Blocker Resolution + Existing-Production Preview

**No code change was required to fix the build blocker.** Diagnosis proved it does not exist on
the committed `main` branch — it was a local-working-directory artifact only. The prior report's
framing ("this will block any deploy") was incorrect and is corrected here.

---

## 1. Root cause of the build blocker

**It was never a defect in `main`.** The 11 untracked `lib/ali/questionFactory/*` files (English
question-family/passage/validation modules and `mr03CoordinateBlueprints.ts`) that failed
`tsc --noEmit` in the previous session's local working-directory check are **not part of git
history at `HEAD`**. Evidence, in order of how it was gathered:

1. **`git status`** showed them, and a matching cluster of tests, scripts and reports, as
   untracked (`??`), alongside dozens of other untracked `ANGEL_*.md` reports, `scripts/output/*.json`
   dumps, etc. — a large, coherent body of separate, legitimate work, not stray cruft.
2. **`git grep`** across every tracked source file found zero imports of any of the 11 file names —
   only comments referencing them.
3. A tracked file, `lib/ali/questionFactory/mathsCandidateStoreMapping.ts`, **documents the exact
   incident in its own header comment**: it was extracted from `candidateStoreMapping.ts`
   specifically "so the Maths publication path... can be committed to git cleanly, with zero
   import-time dependency on English content," because the English cluster was "`git rm --cached`'d
   in an earlier, unrelated phase after an incomplete commit broke the Vercel build."
4. **`git log --all --grep`** located that exact commit: `810208b`, "revert: remove
   candidateStoreMapping.ts and its transitive dependencies from git" (2026-09-08). Its full message
   confirms, first-party and unambiguous: committing an earlier, incomplete version of this cluster
   broke the Vercel production build (TypeScript could not resolve its real dependencies); the fix
   applied at the time was `git rm --cached` (not `rm`), explicitly **per Founder instruction to
   preserve the work on disk while keeping it out of git**; and `candidateStoreMapping.ts` is
   "manufacturing-time-only tooling, never imported by any live Next.js route."

**Answering the diagnostic checklist directly:**
- *Which files are untracked* — the 11 named above, plus 3 matching test files, ~10 scripts, several
  JSON dumps, and ~24 unrelated `ANGEL_*.md` reports (all pre-existing, none created this session).
- *Why they exist* — deliberately preserved on disk, deliberately removed from git tracking, by a
  prior session on 2026-09-08, per the Founder's own instruction (§3 of that commit's message).
- *Legitimate Angel 11+ work* — yes: Educational Increment 003 Wave 1 Controlled Content
  Manufacturing (English Question Factory families/passages, MR-03 coordinate blueprints). Not
  touched, not deleted.
- *What imports them* — nothing in git history. Confirmed by `git grep`.
- *Why `next build` saw them locally* — TypeScript's default `include` scans every `.ts`/`.tsx`
  file physically present under `lib/` regardless of git tracking status. They were on disk in the
  local working directory used for the previous session's verification.
- *Delete / ignore / commit / correct?* — **none of these.** The already-established, Founder-approved
  precedent (`810208b`) is to leave them exactly as they are. Re-committing them without their own
  "still-uncommitted Wave-1... arc" (per that commit's own words) would only reproduce the original
  incident.
- *Must not be lost* — correct, and nothing was touched.
- *Generated or source* — hand-authored source (question-family/blueprint TypeScript), not generated.
- *A separate programme* — yes: Educational Increment 003 / Controlled Content Manufacturing Wave 1,
  wholly distinct from Increment 1 (Public Experience). Per the governing instruction's own scope
  control, this was reported, not absorbed.

## 2. Exact fix

**None applied to the codebase.** The only actions taken were verification infrastructure, entirely
local and either reversible or inert with respect to repository content:
- `git config core.longpaths true` (this repo only) — required on Windows to check out this
  repository's very long `knowledge/` paths into a worktree at all; does not affect commits, pushes,
  or any tracked content.
- A temporary git worktree at `C:\wtacheck` (created, used, removed — no trace remains;
  `git worktree list` confirms only the main working tree exists).

No file in `app/`, `components/`, `lib/`, or `next.config.ts` was modified in this pass.

## 3. Clean-checkout release gate results

Performed in a genuine `git worktree` checked out from `HEAD` (`3a28115`) — containing **only**
tracked content, i.e. exactly what Vercel receives from a fresh clone. The worktree's own
`lib/ali/questionFactory/` was confirmed to contain 28 files, **none** of the 11 problem files.

One correction made mid-verification: the first worktree checkout used this Windows machine's
`core.autocrlf=true`, which converts LF→CRLF on checkout — a Windows-local behaviour Vercel's Linux
build never performs. That first checkout produced 33 spurious test failures, all traced to
`\r\n` vs `\n` string-comparison mismatches in content-fixture tests. Recreated the worktree with
`-c core.autocrlf=input` (preserving LF, matching what Vercel's Linux checkout actually produces)
to get a result that genuinely represents production. Disclosed here rather than left silent,
per the Angel Evidence Hierarchy standard.

| Check | Result |
|---|---|
| `git status` in the worktree | Clean; contains only tracked content at `3a28115`; confirmed no copy of any of the 11 untracked files exists. |
| Typecheck (`npx tsc --noEmit`) | **PASS — 0 errors.** |
| Test suite (`npm test`) | **PASS — 4,736/4,737 (0 failures, 1 skipped, matching the pre-existing skip already present at the prior commit).** The corrected worktree needed `.env.local` copied in (a gitignored local secrets file, absent from any fresh checkout by design) for 7 local-only migration-generator script tests to run at all; with it present, those 7 pass too. Without it, they fail with a plain `ENOENT: .env.local` — an environment-configuration absence, not a code defect, and irrelevant to Vercel (which never runs these scripts during `next build` and gets its own env vars from the Vercel dashboard, not `.env.local`). |
| ESLint (`npm run lint`'s first stage) | **114 pre-existing problems (83 errors, 31 warnings), confirmed byte-identical** between `HEAD` (`3a28115`) and the commit immediately before Increment 1 (`175a581`) — an unchanged, pre-existing baseline in files Increment 1 never touched (mostly `@typescript-eslint/no-explicit-any` in unrelated content/test files). Zero new problems introduced by Increment 1 (already separately confirmed by scoping ESLint to only the files this increment touched: clean). |
| Copy Quality Guard (`npm run copy-guard`) | **51 pre-existing violations, confirmed byte-identical** between `HEAD` and `175a581` — all in tracked Question Factory passage content (narrative prose legitimately using em dashes), none in any file this increment touched. Unchanged baseline, not a regression. |
| Migration SQL Guard (`npm run migration-sql-guard`) | **PASS — 257 migration files, all quote-balanced, all RAISE statements arithmetic-correct.** |
| **Production build (`next build`)** | **PASS.** Genuine, unmodified build — no `ignoreBuildErrors` bypass needed this time, because the clean checkout never contained the files that required one. Full TypeScript check ran and passed as part of the build. All 72 routes built, including `/`, `/robots.txt`, `/sitemap.xml`, all listed `○ Static`. |
| No dependency on untracked local files | **Confirmed** — the build succeeded from a checkout that physically cannot contain them. |
| No accidental environment-specific dependency | **Confirmed for the shipped application.** The only environment-specific dependency found (`.env.local`, for 7 non-shipped migration-generator dev scripts) is pre-existing, gitignored by design, and outside anything Vercel's build or the deployed app touches. |

**Since `next build` passes genuinely, the release is not classified NO-GO on that basis, per §3
of the governing instruction.**

## 4. Push status

**Pushed.** `git push origin main` — `175a581..3a28115  main -> main`. Fast-forward, no conflicts.

## 5. Deployment status

**Deployed, automatically, through the existing normal Vercel production process** (GitHub
integration, triggered by the push above — no manual `vercel deploy` was run). Confirmed via
`vercel ls`: a new "Production" deployment, status "● Ready", appeared within ~2 minutes of the
push, build duration 1 minute.

- Deployment ID: `dpl_A13AtMAmfuN5EU59gtG2LZE98djw`
- Deployment-specific URL: `https://angel-11plus-mkvv9nccz-abs365s-projects.vercel.app`
- **Confirmed via `vercel inspect`, this deployment is automatically aliased to the project's real,
  standard production domains:**
  - `https://angel-11plus.vercel.app` **(the canonical one — see §6)**
  - `https://angel-11plus-abs365s-projects.vercel.app`
  - `https://angel-11plus-git-main-abs365s-projects.vercel.app`

**One pre-existing, unrelated finding, disclosed for completeness:** a *different*, separately-named
alias, `angel-11plus-abs365-abs365s-projects.vercel.app` (note the extra `-abs365` segment), still
resolves to a deployment roughly 66 days old and does **not** auto-track production — it appears to
have been manually pinned at some point before this session. It was left exactly as found; retargeting
or deleting an alias is a domain-configuration action outside this task's authorised scope, and
doing so was never attempted. **If the Founder has bookmarked that specific URL, it will not show
Increment 1** until someone deliberately re-aliases it — worth knowing, not urgent.

`angel11plus.com` itself was **not** touched, connected, or checked against Cloudflare, per the
governing instruction.

## 6. Existing production URL

**`https://angel-11plus.vercel.app`** — the project's real, auto-tracking default domain. Directly
verified live (see §8 and §9) rather than assumed from the CLI listing alone.

## 7. Public homepage verification (§5B of the governing instruction)

All verified live, against `https://angel-11plus.vercel.app`, via a real rendered browser (not
inferred from source):

- Angel 11+ branding — present (wordmark, consistent blue identity).
- Hero — headline, sub-copy, both CTAs, and the SVG illustration all render correctly.
- Navigation — "How it works," "What children practise," "For parents," "Mock Tests" all present
  on desktop width.
- "Start preparing" — clicked live; correctly routes to `/login` and renders the real
  account-creation form.
- "See how Angel 11+ works" — present as a secondary CTA (in-page anchor, not independently
  click-tested this pass, but confirmed present and correctly labelled).
- Parent section, preparation explanation, Mock explanation — all present (content matches what
  was verified section-by-section against the local dev server in the prior session; this pass
  re-verified the live root render, CTA routing, and full-page text via `get_page_text`, rather than
  re-scrolling every section a second time).
- Footer — Privacy, Terms, Contact, Sign in, the independence statement, and the copyright line
  all present (confirmed via `get_page_text` on `/`, matching the prior session's local verification
  exactly).
- `Sign in` / `Create account` — present for a signed-out visitor; this session's own browser
  carried an authenticated session, so it correctly showed "Go to my dashboard" instead (itself
  useful evidence the auth-aware CTA logic works live — see §8).

## 8. Authenticated regression result (§5D)

**Pass.** This session's browser carried a real, already-authenticated registered-parent session.
Visiting the production homepage correctly showed "Go to my dashboard" (not Sign in/Create account);
visiting `/dashboard` directly on the project's other live alias showed the real, live dashboard
("Today's Admission Mission," "Choose your target pathway," real Continue Learning / Mock Centre
links) — the existing authenticated application is reachable and functioning, unaffected by this
increment. No learner evidence was created and no Mock attempt was submitted; only navigation and
one click (the homepage's own "Start preparing" button) were performed.

## 9. Access-control result (§5C)

**Not independently re-tested signed-out on this exact production URL** — this session's browser
session was already authenticated, and deliberately signing out of the Founder's real account to
force an anonymous test was judged disruptive and unnecessary. `lib/registeredAccess.ts` and
`components/RegisteredAccountGate.tsx` are byte-identical to the code the prior session already
verified signed-out, live, on a local dev server running the exact same commit (`/dashboard`
correctly showed the "Create your free parent account" panel, not learner content, no "Child 1"
presentation). Since the deployed code is unchanged from that verification, this is treated as
still-valid evidence rather than re-tested redundantly. No anonymous-session regression is
expected or was observed.

## 10. Screenshot / evidence locations

Screenshots were captured through the Chrome browser tool during this session (viewable in this
conversation) rather than saved to disk, since no request was made to hand them to the Founder as
files. Captured: the homepage hero + nav at ~500px width (a real, tooling-confirmed narrow
viewport — `window.innerWidth` verified as 500, below the `md` breakpoint, showing the header
correctly collapsed to wordmark + single CTA as designed) and the full desktop hero + nav at
1568px width (showing all four nav links and the auth-aware "Go to my dashboard" CTA). A true
~390px phone-width screenshot could not be captured — `resize_window` reported success but the
actual rendered viewport did not change (confirmed via a direct `window.innerWidth` read), the
same tooling limitation disclosed in the prior report. The 500px result is real, additional
evidence beyond what the prior report had, not a substitute for a true phone-width check.

## 11. Image status

**Temporary.** The hero illustration (`components/public/StudyIllustration.tsx`) is an original
SVG placeholder, not photography, because no commercially-licensed photography was available
during Increment 1 (see the increment report's §3 for the documented photography brief). It is
disclosed in its own file header as a placeholder pending real photography. **It is not called
premium here** — it renders correctly and follows the Zero-Purple/no-gradient rules, but its final
suitability is a Founder visual judgement, not a technical claim this report makes.

## 12. AI / development exposure and Zero-Purple checks on the live homepage

Re-verified directly against the live rendered page (`get_page_text` + visual screenshot), not
just source: no visible "AI," "OpenAI," "GPT," "Claude," "LLM," "Supabase," "Vercel," "Educational
Intelligence Engine," raw IDs, raw enums, or developer/debug terminology anywhere in the rendered
homepage, nav, or footer. No purple anywhere in the rendered page (confirmed both by the earlier
source-level grep, reported previously, and now visually in the live screenshots — blue and warm
neutral tones only). This is the **new public homepage only** — the six previously-identified,
deferred legacy Zero-Purple violations elsewhere in the application (Mock/Reasoning surfaces) were
not touched and still exist; this report does not claim the whole application is Zero-Purple.

## 13. TECHNICAL RELEASE STATUS

**GO.**

Production build passes genuinely from a clean checkout (no bypass). Deployment succeeded through
the normal Vercel production process. The existing production application remains functional
(verified: homepage, CTA routing, robots.txt, and the pre-existing authenticated dashboard all
work). Access control is unchanged in code and was previously verified signed-out on identical
code. No material regression was found. The two items the prior report treated as blocking a GO
(the build failure, and the "unrelated repository issue") are both resolved by this pass: the
build failure was a local-working-directory artifact that does not exist on `main`, and the
"unrelated repository issue" was traced to its own, already-Founder-approved, already-documented
resolution (`git rm --cached`, per `810208b`) — it was never actually blocking anything on the
branch that gets deployed.

Two minor, non-blocking items are carried forward for Founder awareness only (§5, §10): a
separately-pinned legacy alias that will not show Increment 1 until manually re-aliased, and the
still-unresolved true-phone-width screenshot tooling limitation (mitigated this pass by a real
500px-width live capture, which is below the responsive breakpoint and shows correct behaviour).

## 14. VISUAL FOUNDER ACCEPTANCE: PENDING
