# Repository Impact Assessment — Family Choice Pilot

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Family Choice Pilot
**Prepared:** 2026-08-11
**Method:** Direct `git status`/`git diff` inspection at the time of writing, not recalled from earlier in the session.

---

## 1. Existing files modified

Exactly two existing source files were changed, both additively (no existing behaviour removed):

| File | Change | Backward compatibility |
|---|---|---|
| `lib/learningEngine/sessionGenerator.ts` | Added one optional 5th parameter (`familyFocusCompetencyId?`) to `generatePersonalisedSession()`, plus the `FamilyFocusSessionInfo` type and injection logic (65 lines added, 4 modified, per `git diff --stat`) | **Full.** Every existing caller (the production Practice pages) omits the new parameter and is provably unaffected — verified live in browser (see `FAMILY_CHOICE_EDUCATIONAL_BEHAVIOUR_VERIFICATION.md`), not merely inferred from the diff. |
| `types/supabase.ts` | Added the `ali_family_focus_selection` table shape (`Row`/`Insert`/`Update`/`Relationships`) | **Full.** A new dictionary key; no existing table type touched. |

(`ARCH-001_ED-001_IDENTITY_CORRECTION_IMPLEMENTATION.md`'s modification, also shown in `git status`, predates this pilot and is unrelated — from earlier work this session on the Live Question Bank Reconciliation.)

## 2. New files added

| File | Purpose |
|---|---|
| `supabase/migrations/022_family_focus_selection.sql` | The additive-only schema change — see `FAMILY_CHOICE_DATA_AND_PROVENANCE_REPORT.md` |
| `types/ali/familyFocus.ts` | The `FamilyFocusSelection` type |
| `lib/ali/persistence/familyFocusStore.ts` | Fetch/save/remove persistence functions |
| `app/learning-intelligence/founder-validation/family-choice/page.tsx` | The controlled, isolated pilot UI |
| `knowledge/.../family-choice-pilot/*.md` (this folder) | The 8 required deliverable reports |

No other application file was created or modified. `app/api/writing-feedback/route.ts` was read but not written to (see `WRITING_FEEDBACK_EVIDENCE_COMPLIANCE_ASSESSMENT.md`).

## 3. Production surfaces — confirmed unaffected

- `app/learning-intelligence/practice/[area]/page.tsx` (all three areas) — not modified; calls `generatePersonalisedSession()` with its original 4-argument form; live-tested after this change and behaves identically (a fresh Mathematics session generated and a real answer recorded with no errors).
- `/mocks` (Mock Centre) — not modified, not touched by any file in this pilot; live-tested, renders identically including prior session history.
- Every other `lib/ali/*` module (`selection.ts`, `wellbeing.ts`, `recommendationOrchestration.ts`, `explainability.ts`, `durableMastery.ts`, `history.ts`) and `lib/learningEngine/educationalIntelligenceService.ts` — read for reference, none modified.

## 4. Verification performed on this footprint

- `npx tsc --noEmit -p .` — clean, exit 0 (run twice: once after initial implementation, once after the temporary verification patch was reverted).
- `npx eslint <every new/changed file>` — clean (two real issues found and fixed during development: an impure `Date.now()` call inside a `useRef` initializer, and a `setState`-in-effect pattern; both resolved by following this codebase's own established "intro screen + explicit button" convention rather than auto-fetching on mount).
- `npm run build` (`next build`, Turbopack) — succeeds; the new route appears correctly in the route manifest as `○ /learning-intelligence/founder-validation/family-choice` (static).

## 5. Deployment/rollback

- **To deploy:** the Founder applies `supabase/migrations/022_family_focus_selection.sql` via the Supabase Dashboard SQL Editor (elevated DB privileges required — this environment's anon key cannot run `create table`/`enable row level security`/`create policy`, confirmed by the absence of any service-role credential in `.env.local`). No application redeploy step beyond the normal one is required — the code already handles the table's absence gracefully.
- **To roll back:** the migration file's own commented-out rollback section drops the trigger, the three policies, and the table. The application code changes are additive and optional-parameter-based, so no code rollback is required even if the table is removed — `familyFocusStore.ts`'s functions would simply resume their graceful-failure behaviour.

## 6. Nothing committed to git

Per standing instruction, no `git add`/`git commit` has been performed as part of this pilot. All files listed above exist on disk, untracked or modified, exactly as `git status` shows.
