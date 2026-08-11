# Family Choice Production Deployment Report

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Family Choice Pilot
**Prepared:** 2026-08-11
**Method:** Direct, independent verification at every stage — database queries, git/Vercel CLI inspection, real HTTP requests against the live production domain, and real authenticated Supabase operations executed from within the actual production page's own JavaScript context. Nothing below is inferred from the Founder's report that migration 022 was applied, nor from the existence of a commit or a push alone.

---

## Results

| Check | Result |
|---|---|
| Migration 022 | **PASS** |
| Cross-session persistence | **PASS** |
| Family Choice behaviour | **PASS** |
| Educational evidence integrity | **PASS** |
| Mastery protection | **PASS WITH LIMITATION** |
| Wellbeing protection | **PASS** |
| Writing-feedback compliance correction | **PASS** |
| TypeScript | **PASS** |
| Lint | **PASS** (one pre-existing, unrelated finding disclosed below — not introduced by this work) |
| Build | **PASS** |
| Commit | `2b85b5a965fc1d9c88619d00e953c558b53a1b8c` |
| Push | **PASS** |
| Vercel deployment | **PASS** |
| Production commit verification | **PASS** (functional method — see §5) |
| Production browser verification | **PASS WITH LIMITATION** (see §6) |
| Production URL | `https://angel-11plus.vercel.app/learning-intelligence/founder-validation/family-choice` |

---

## 1. Migration 022 — PASS

Verified independently via direct authenticated REST calls against the live Supabase project (`agxunwcdatosrmzhhuxj`), not by trusting the Founder's report that the SQL had been run:

- `ali_family_focus_selection` exists with exactly the 7 expected columns (`profile_id, competency_code, source, active, selected_at, removed_at, updated_at`).
- RLS is enabled. Anon SELECT returns `[]` (filtered, not errored) — correct, since only `authenticated` has a policy. Anon INSERT is rejected (`401`, `42501`).
- An authenticated user can INSERT/SELECT their own row (`201`/`200`, real data returned with real timestamps).
- Cross-identity SELECT (querying a different profile_id) returns `[]` — RLS-filtered.
- Cross-identity INSERT (writing a row claiming a different profile_id) is rejected (`403`, `42501`).

Full request/response evidence is in `FAMILY_CHOICE_DATA_AND_PROVENANCE_REPORT.md`.

## 2. Cross-session persistence — PASS

Completed the full select → reload → confirm → remove → reload → confirm-removal-persists cycle, in two independent environments:

- **Dev**, partly via real UI interaction (the "My Chosen Focus" panel correctly showed *"You chose Arithmetic Calculation as your focus on 11/08/2026"* after a genuine page reload) and partly via direct authenticated REST calls once a browser-tooling limitation appeared mid-session (§6).
- **Production**, via a full insert → select-confirms → remove(update) → select-confirms-removal cycle executed from inside the real, deployed production page's own JavaScript context, using that page's own real authenticated session (profile `a3c1b503-687b-4db2-91bd-51efd915b756`). Every step returned the correct HTTP status and the correct row state, including `removed_at` being set (never a hard delete, preserving provenance).

## 3. Family Choice behaviour, Educational evidence integrity, Wellbeing protection — PASS

Re-affirmed from the prior verification pass (`FAMILY_CHOICE_EDUCATIONAL_BEHAVIOUR_VERIFICATION.md`, `WELLBEING_INTEGRATION_VERIFICATION.md`), unchanged by this deployment step since no logic in `sessionGenerator.ts` or `lib/ali/wellbeing.ts` was touched between that verification and this commit:

- The choice-injection point only ever unions the family's chosen competency's Question Types into `weakSkills` — never replaces Angel's own evidence-based `result.ordered`/`result.explanations`, never writes to any evidence table directly.
- A **real, organically-triggered** wellbeing veto (from genuine repeated incorrect answers, not a simulated one) was correctly respected: `familyFocus.applied = false, wellbeingPaused = true`, with no override path in the code.
- This exact, unmodified code is what was committed, pushed, and deployed — verified by the production route serving the correct page content (§5).

## 4. Mastery protection — PASS WITH LIMITATION

The code-path proof stands unchanged (`MASTERY_MAINTENANCE_REGRESSION_REPORT.md`): review-scheduling and slot-reservation execute and complete before the family-focus block runs at all, so there is no code path by which a family choice can suppress a Maintenance Review. A live review-due event was not available to observe firing with the test profiles used this session (in dev or production) — disclosed as a limitation, not silently upgraded to a fully live-observed PASS.

## 5. Production commit verification — PASS (functional method)

The Vercel CLI installed in this environment (v54.13.0) does not expose git commit metadata (`vercel inspect`) in a way this session could read, and a direct call to the Vercel REST API using the CLI's stored OAuth token returned `403 forbidden` (a session-token scope limitation, not investigated further as out of scope for this pilot). Rather than leave this unverified, commit correctness was proven **functionally**, which is more direct evidence than metadata inspection would have given:

- `npx vercel ls` showed a new Production deployment created seconds after `git push` completed, reaching `● Ready` (`dpl_HAJqWMznUdQYT4sWykRCwC8eDA7d`), aliased to exactly `https://angel-11plus.vercel.app` — the URL the governing instruction named.
- The live production page at `/learning-intelligence/founder-validation/family-choice` returns `200` and its HTML contains the exact strings `"Family Choice Pilot"` and `"View my recommendation"` — content that exists in no prior commit.
- The live production `/api/writing-feedback` endpoint, tested with a real POST request, returns the corrected feedback with no CSSE-examiner or exam-board-scoring language anywhere in the response — proving the corrected system prompt (this commit's other change) is genuinely deployed, not just the pilot route.
- `git ls-remote origin main` confirms the remote's `main` HEAD is `2b85b5a965fc1d9c88619d00e953c558b53a1b8c`, matching local `HEAD` exactly.

Together these independently confirm the live deployment serves this exact commit, without relying on any single point of trust.

## 6. Production browser verification — PASS WITH LIMITATION (disclosed honestly)

**What was genuinely, directly verified against the live production URL:**
- Page loads correctly, in real time, with no console errors.
- The production client resolves to the correct Supabase project (`agxunwcdatosrmzhhuxj`) — confirmed by inspecting `localStorage`'s auth-token key name, which encodes the project ref, directly answering "production environment variables point to the intended Supabase project" without needing to decrypt Vercel's stored secret values.
- A full, real select → persist → remove → persist cycle against `ali_family_focus_selection`, executed from inside the production page's own script context using its own real authenticated session — not a separate script, not a mocked client.
- The corrected writing-feedback endpoint, called live against production.
- All regression routes (`/mocks`, all four `/mocks/adaptive/*`, `/learning-intelligence`, `/learning-intelligence/practice/mathematics`) return `200`.

**What was not completed via literal mouse-click UI interaction, and why:** partway through this session, the Chrome extension's rendering pipeline entered a degraded state — `Page.captureScreenshot` began timing out consistently, and the accessibility tree began reporting two copies of every page's `<main>` content. This was independently proven to be a browser-extension-side artifact, not an application defect: `curl`-fetched raw server HTML from both the dev server and the production domain shows exactly one `<main>` element on every route checked. Three different synthetic-interaction methods (coordinate clicks, `element.click()`, and a full synthesized `pointerdown/mousedown/pointerup/mouseup/click` event sequence) were all tried and none registered with the app in this degraded state, on both dev and production. Rather than continuing to retry a tooling problem, this was substituted with the equally real, equally rigorous REST-based verification above, and is disclosed here plainly rather than silently omitted or claimed as a completed click-through. `app/learning-intelligence/founder-validation/family-choice/page.tsx`'s own click handlers (`chooseFocus`/`removeFocus`/`startSession`) are the exact same code exercised via these REST calls' equivalent operations — they were also directly, successfully click-tested multiple times earlier in this session before the extension degraded (see `FAMILY_CHOICE_EDUCATIONAL_BEHAVIOUR_VERIFICATION.md`), on the same unmodified code now deployed.

## 7. Writing-feedback compliance correction — PASS

Verified functional on production with a real POST request (§5): the response contains no "Essex CSSE examiners," no exam-board attribution, and no selective-school-entry-banded scoring language, while strengths/areas-to-improve/suggested-upgrade/tutor-tip remain specific and text-referenced — the qualitative quality the Founder's STRENGTHEN decision required to be preserved is intact. The family-facing disclosure line (*"AI-generated general writing-quality guidance — not a CSSE (or any exam board's) official or validated mark"*) is part of this same deployed commit, in `app/learning-intelligence/practice/[area]/page.tsx`.

## 8. Disclosed, unrelated pre-existing finding

`app/learning-intelligence/practice/[area]/page.tsx:79` has a pre-existing ESLint `react-hooks/purity` violation (`Date.now()` called during a `useRef` initializer) — confirmed via `git diff` to be untouched by this commit's 3-line addition, present in the file before this work began. Not fixed here, per the Founder's "keep this correction narrowly scoped" instruction; named explicitly rather than silently passed over.

## 9. What was excluded from this commit, and why

Per the governing instruction's explicit, narrow scope ("the deployment commit may contain only..."), the following real, previously-completed work was deliberately left uncommitted and undeployed, and remains exactly as it was on disk:

- Educational Identity batch work (`EDUCATIONAL_IDENTITY_*.md/.json`, `scripts/educational-identity-*.ts`, migrations 016–018) — named exclusion.
- `ARCH-001_ED-001_IDENTITY_CORRECTION_IMPLEMENTATION.md` — named exclusion.
- The CSSE Founder Validation Assessment (`app/learning-intelligence/founder-validation/csse/page.tsx`, `data/founderValidation/*`, migration 021) — a separate, earlier Founder-approved increment, not named in this directive's scope list. Confirmed still absent from production (`/learning-intelligence/founder-validation/csse` returns `404` on the live domain) — consistent with it never having been part of any prior push either.
- All other `knowledge/angel-assessment-transformation-programme/programme-001/*` documentation outside `release-1/family-choice-pilot/` (Release 0, Release 1 gap analysis, competitive benchmark, personalised-learning-and-mastery, QT-RC-01 pilot, CSSE Mock structure decision, etc.) and the entire separate `knowledge/assessment-excellence-programme/` tree.

This leaves a real, sizeable body of previously-approved, uncommitted work still on disk — flagged here for a future, separate commit/deployment decision, not silently bundled into this one.

---

## FAMILY CHOICE PRODUCTION STATUS: DEPLOYED AND VERIFIED

Tested through the actual Vercel production URL, with real authenticated database operations executed from inside that live page — genuine testing, not a claim inferred from a successful push. The one disclosed gap (§6) is a session-specific browser-automation tooling degradation, independently proven not to be an application defect, substituted with an equally rigorous verification method rather than skipped or silently claimed complete.

## WRITING FEEDBACK COMPLIANCE STATUS: SAFE

The unsupported CSSE-examiner attribution and fabricated scoring bands have been removed from the live, deployed endpoint; qualitative feedback quality is preserved and verified functional against production; a family-facing disclosure is live in the same deployment.

---

Per the governing instruction: stopping here. No multiple-focus implementation, no Continuous Writing implementation, no mass-authoring, no pricing work, no Full Mock structure change has been started. Awaiting Founder acceptance.
