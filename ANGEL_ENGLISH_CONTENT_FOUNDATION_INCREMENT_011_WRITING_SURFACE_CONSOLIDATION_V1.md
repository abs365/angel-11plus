# Angel 11+ English — Programme Completion Increment 011: Writing Learner Surface Consolidation and Final Activation

**Session date:** 3 September 2026. **Commit:** `0efa28f`, pushed to `origin/main`. **Production deploy: not yet confirmed** (see §14).

## 1. `/writing` architectural purpose

The pre-CSSE-pathway-migration Writing Practice route. Reachable only via `/learn`'s legacy, non-CSSE navigation branch — `components/Navigation.tsx`'s own `primaryItemsFor(isCsse)` sends the "Practise" tab to `/learning-intelligence/practice` whenever a learner is on the CSSE pathway, and only falls back to `/reasoning`/`/learn` for non-CSSE. Its own evidence-recording helper lives in a file literally named `lib/learningEngine/legacyPracticeEvidence.ts` — a prior session had already recognised and labelled this path "legacy."

## 2. Other Practice surface purpose

`/learning-intelligence/practice/continuous-writing` (`app/learning-intelligence/practice/[area]/page.tsx`, `WritingActivity`) — the one real, canonical Practice engine, genuinely shared across Reading, Mathematics, and Writing: the same `generatePersonalisedSession`/`fetchQuestionBank` content fetch, the same `recordAndAdvance → recordOutcome → processEvidenceForCompetency` evidence pipeline, the same `WritingFeedback` display component. It is the only place `presentWritingChecklistForContext` (Guided/Independent core-vs-coaching separation) and the corrected teaching-scaffold mapping (Increment 006) are actually wired in.

## 3. Canonical route decision

`/learning-intelligence/practice/continuous-writing` is canonical. All Writing content in `ali_question_bank` is CSSE-pathway content without exception (`pathway = ['csse']`), so this decision changes nothing about what a learner can reach — only how it's presented and how evidence is recorded.

## 4. Duplicate/legacy determination

**Duplicate, legacy, direct-practice route** — not a hub. It independently re-implemented content fetching (`fetchEligibleWritingPrompts`, exclusive to this route), the checklist (always full, no Guided/Independent distinction — Increment 010's finding), and evidence recording (`recordLegacyPracticeEvidence`, a second entry point into the same underlying primitives the canonical page's `recordAndAdvance` already used directly).

## 5. Exact correction made

`app/writing/page.tsx` replaced with a bare server-component redirect (`next/navigation`'s `redirect()`, matching `app/page.tsx`'s own established convention) to `/learning-intelligence/practice/continuous-writing`. The route itself is **preserved, not deleted** — `/learn`, `lib/parentInsights.ts`, and `lib/replayEngine.ts` all still link to a valid `/writing` URL. No eligibility logic, rubric, feedback API, evidence pipeline, checklist classification, or learning-state logic was forked further — the redirect removes the fork instead of adding to it. `writingPracticeContent.ts`/`data/writing.ts` are left in place, unreachable but harmless, per this codebase's own "don't delete unless asked" convention — a separate cleanup decision, not bundled here.

## 6–8. Guided Practice / Independent Practice / instruction-coaching separation evidence

All three are owned by the canonical route and were already verified correct at the code/test level in Increments 005–006 (unchanged, re-confirmed by source inspection this increment): `presentWritingChecklistForContext` strips `coaching`-classified items under `independent`, keeps only `core` items under `mock`, and `WritingActivity`'s own `guidedMode` toggle drives which context is shown. **Live UI verification of this specific interaction (clicking the toggle, watching the checklist visibly change) was not performed this increment** — the browser automation tool remained unavailable (see §9–10). This is now a single, non-contradictory implementation, not two.

## 9–10. Mobile / tablet evidence

**Genuinely NOT VERIFIABLE this session.** The Chrome browser tool was retried four times across the session (including after the code fix was pushed) and never connected. Per instruction, I did not stop there:

- Confirmed via `curl` that the deployed page currently returns HTTP 200 with **no redirect** — production has not yet picked up this increment's fix (§14).
- Performed a source-level responsive-design audit of `WritingActivity`'s markup as the best available substitute, clearly distinguished from real visual verification: the textarea is `w-full` with no fixed pixel width, the checklist and buttons use relative Tailwind spacing (`px-5 py-2.5`, `rounded-xl`) with no hardcoded desktop-only dimensions, and the whole component is wrapped in the same `InfoCard` container Reading and Mathematics already use successfully on this identical page. **This is source review, not visual proof — it does not by itself satisfy the standing visual-gate requirement**, and is not reported as PASS for mobile/tablet.

## 11. UI-generated evidence-flow result

**Not performed.** This requires an authenticated learner session driven through the real UI, which needs the browser tool. Not substituted with a direct API call this time, since a genuine UI-originated attempt (not a raw endpoint call) is what this item specifically asks for, and creating one via curl against `/api/writing-feedback` alone (as Increment 010 did) would not exercise `recordAndAdvance`'s own session/profile wiring — the part actually in question here.

## 12. Defects found/fixed

One: the `/writing` vs. canonical-Practice divergence itself (§5) — fixed. No other defect found this increment; nothing else was touched.

## 13. Tests/build/guards

| Guard | Result |
|---|---|
| `tsc --noEmit` | Clean |
| `npm test` | **3220/3220** passing (old readiness-gate test for the removed implementation replaced; two other tests updated to match the closed gap) |
| ESLint, full repo | **71/23** — one fewer error than the established baseline (net improvement from removing ~530 lines of retired page code), zero net-new |
| `npm run migration-sql-guard` | PASS — 205 files, unchanged |
| `npm run copy-guard` | PASS — 0 violations, 264 files |
| `npm run build` | PASS, exit 0; `/writing` now prerenders as a static redirect (`○`) |

## 14. Deployment evidence

Pushed: `0efa28f` on `origin/main`. Directly checked via `curl` against `https://angel-11plus.vercel.app/writing`, twice, several minutes apart: **still HTTP 200 with no redirect both times** — the fix has not yet gone live. No `.github/workflows` deploy pipeline or documented auto-deploy trigger was found in the repo; whether/when Vercel picks up this push is outside what this session can trigger or confirm. **This is now the operative blocker**, not an open architecture question.

## 15. WRITING PRACTICE ACTIVATION = HOLD

## 16. Exact remaining blocker

Two items, both narrow, neither a content/architecture/governance question any more:
1. **Confirm the deploy.** Production must actually serve the redirect before the "one canonical journey" claim is true in production, not just in the repo.
2. **Visual/device verification**, once deployed: mobile viewport, tablet viewport, and one real UI-driven learner journey through `/learning-intelligence/practice/continuous-writing` (Guided toggle, checklist separation visibly correct, submission, feedback) — all blocked on the browser tool reconnecting.

## 17. Updated whole-programme completion position

Writing's content, review governance, database eligibility, and now its learner-facing architecture are all resolved and consistent — a single canonical journey, backed by real production data, confirmed defect-free everywhere this session could actually test. The sole remaining gate before calling Writing Practice complete is operational verification (deploy confirmation + visual/device check), not further design, content, or governance work.

## 18. Next bounded action

Confirm the Vercel deploy has picked up commit `0efa28f`, then re-attempt visual/device verification. If the browser tool is back, that single pass — mobile, tablet, one real Guided→Independent→submit→feedback journey — closes every remaining item and resolves the PASS/HOLD decision. No other Writing work is implicated.
