# New Angel Experience Inventory

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, New Learner Experience Migration
**Prepared:** 2026-08-11
**Method:** Direct codebase investigation. CURRENT EXPERIENCE columns are verified facts, not summaries from memory.

---

## Legend

KEEP = unchanged this release · MIGRATE = reused under new organisation · REPLACE = content changes (not this release) · HIDE = no longer in the active journey, not deleted · RETIRE = reachability path removed

---

## Primary navigation

| Current route | Current label/position | New experience | Action |
|---|---|---|---|
| `/dashboard` | "Today" (primary nav 1) | Becomes the real "Today" experience per `NEW_ANGEL_INFORMATION_ARCHITECTURE.md` — Today's Plan, Angel Recommended Focus, Family Chosen Focus | MIGRATE (structure evolves; underlying data sources — Daily Mission, Recommendations — reused) |
| `/learn` | "Learn" (primary nav 2) | For CSSE pathway: new honest-interim Learn destination (no old lessons). For non-CSSE pathway: unchanged. | MIGRATE (CSSE) / KEEP (non-CSSE) |
| `/reasoning` | "Practice" (primary nav 3) | For CSSE pathway: top nav "Practise" points to `/learning-intelligence/practice` instead. For non-CSSE pathway: unchanged, still reachable (no longer top-level for CSSE users). | MIGRATE (CSSE) / KEEP (non-CSSE) |
| `/mocks` | "Mock Centre" (primary nav 4) | Top nav "Mock" — same destination, unchanged content this release | KEEP |
| *(none — 4 items only)* | — | New 5th top-level item "Progress" | MIGRATE (existing `/progress` route promoted to top-level) |

## Journey / Family sections (sidebar, to be removed)

| Current route | Current label | New experience | Action |
|---|---|---|---|
| `/progress` | "Progress" (Journey section) | Promoted to top-level nav item | MIGRATE |
| `/learning-intelligence` | "Learning Report" (Journey section) | Remains reachable — from Progress or Today, not top-level | KEEP, MIGRATE placement |
| `/pathways` | "School Intelligence" (Journey section) | Remains reachable, deliberately not competing visually with daily journey (per §4 of governing instruction) | KEEP, MIGRATE placement |
| `/learning-intelligence/parent` | "Parent Dashboard" (Family section) | Remains reachable ("Parent access should remain clearly available") — top bar, not buried in a mobile drawer only | KEEP, MIGRATE placement (more prominent) |
| `/angel-plus` | "Angel Plus" (Family section, badge "Soon") | Unchanged | KEEP |
| Help/support links (4 items) | Collapsed disclosure | Unchanged, remains low-priority | KEEP |

## Legacy learning content (see `LEGACY_CONTENT_RETIREMENT_REGISTER.md` for full detail)

| Current route | Content | New experience (CSSE pathway) | New experience (non-CSSE pathway) |
|---|---|---|---|
| `/english`, `/english/eng-001` (Lighthouse Mystery) | Old illustrative lesson | Not linked; HIDE | Unchanged; KEEP |
| `/english/eng-002`, `/english/eng-003` | Old illustrative lessons | Not linked; HIDE | Unchanged; KEEP |
| `/maths` | Old Maths practice | Not linked from new CSSE Learn (Mathematics is covered by `/learning-intelligence/practice/mathematics` instead) | Unchanged; KEEP |
| `/vocabulary` | Old vocabulary quiz | Not linked; HIDE (also carries the old Year-tier labels) | Unchanged; KEEP |
| `/writing` | Old writing prompts | Not linked (Continuous Writing practice remains CSSE-Practise-model territory per `NEW_PRACTISE_MODEL.md`) | Unchanged; KEEP |
| `/verbal-reasoning`, `/non-verbal-reasoning`, `/spatial-reasoning`, `/numerical-reasoning` | Old reasoning practice | Not linked (Applied Reasoning is CSSE-gated/deferred; these are GL/CEM/ISEB-style reasoning, not CSSE Applied Reasoning) | Unchanged; KEEP |
| `/mock-test` | Orphaned combined mock (hardcodes Lighthouse Mystery) | RETIRE the one reachability path (Daily Mission recommendation edge) | Unchanged (was never linked here either) |

## New CSSE evidence-led experiences (already exist, being organised, not rebuilt)

| Route | What it is | New experience | Action |
|---|---|---|---|
| `/learning-intelligence/practice` | CSSE Practice area chooser | Becomes the "Practise" destination for CSSE-pathway top nav | MIGRATE (placement only) |
| `/learning-intelligence/practice/[area]` | CSSE evidence-driven session runner | Unchanged | KEEP ENGINE |
| `/learning-intelligence/mock-exam` | Real Educational Intelligence CSSE Mock | Becomes "Mock" destination for CSSE-pathway (already the card target from `/mocks`) | KEEP |
| `/learning-intelligence/founder-validation/csse` | Founder Validation Assessment | Unchanged; isolation fix applied (see `FOUNDER_VALIDATION_ISOLATION_ASSESSMENT.md`) | KEEP ENGINE, fix isolation |
| `/learning-intelligence/founder-validation/family-choice` | Family Choice Pilot | Unchanged this release | KEEP |
| `/learning-intelligence/parent/*` (6 sub-pages) | Revision Planner, Weekly Report, Admissions Readiness, Mock Readiness, Journey, Readiness Timeline | Remain reachable via progressive disclosure from the simplified Parent Dashboard first screen | KEEP ENGINE, MIGRATE placement |

## Mock experiences

| Route | What it is | Action |
|---|---|---|
| `/mocks` (Mock Centre) | Card-based mock/practice chooser | KEEP — unchanged content this release |
| `/mocks/[pathway]` | Legacy per-pathway mock runner (GL/CEM/ISEB; CSSE variant no longer carded but still reachable) | KEEP ENGINE — no action this release |
| `/mocks/adaptive/{gl,maths,english,vocabulary}` | Adaptive personalised-practice routes | KEEP — unchanged |

## Dashboard sections (`/dashboard`)

| Section | Action |
|---|---|
| Admission Hero | MIGRATE into new "Today" structure |
| Daily Mission ("Today's Admission Mission") | KEEP ENGINE; sever the `/mock-test` recommendation edge specifically (see Legacy Content Retirement Register §5) |
| Progress Snapshot | MIGRATE — becomes part of "Today's Plan" / links to Progress |
| Mock Examinations Available | MIGRATE — becomes Mock Readiness reference where evidence-ready (CSSE), otherwise unchanged |
| Continue Learning shortcuts | MIGRATE into new top nav (redundant once top nav exists) |

## Parent Dashboard (`/learning-intelligence/parent`)

See `PARENT_DASHBOARD_SIMPLIFICATION_SPEC.md` for the full redesign. Summary: `CssePathwayParentContent` (10 sections) gets a new 4-question first screen with progressive disclosure to its existing sections (nothing deleted). `LegacyPathwayParentContent` (15 sections, GL/CEM/ISEB) is **not** touched this release — flagged as a future, separate simplification pass, same reasoning as the Learn/Practice branching decision in the Legacy Content Retirement Register §4.

## Defects (see dedicated documents)

| Defect | Document |
|---|---|
| Founder Validation contamination of Mock history/best score | `FOUNDER_VALIDATION_ISOLATION_ASSESSMENT.md` |
| React duplicate-key warning (`MockHistorySection.tsx` and `/mocks`' own inline list) | `FOUNDER_VALIDATION_ISOLATION_ASSESSMENT.md` (same root cause) |
