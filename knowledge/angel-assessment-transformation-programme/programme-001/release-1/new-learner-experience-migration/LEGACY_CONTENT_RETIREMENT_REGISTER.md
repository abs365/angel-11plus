# Legacy Content Retirement Register

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, New Learner Experience Migration
**Prepared:** 2026-08-11
**Method:** Direct codebase investigation (three parallel exhaustive searches), not inference. Every "reachable today" claim below was verified against real, current route/component code.

---

## Classification key

- **KEEP ENGINE** — the underlying mechanism/data stays exactly as-is; nothing about it changes.
- **MIGRATE** — the underlying mechanism is reused but re-presented under new organisation/navigation.
- **REPLACE CONTENT** — the mechanism stays; the actual content shown needs to change (not done in this release).
- **HIDE** — no longer reachable from the active learner journey; not deleted; can return once a genuine evidence-led replacement exists.
- **RETIRE** — the route/link itself is removed as a reachable path (underlying data files are not deleted).

---

## 1. "The Lighthouse Mystery" (`eng-001`, `data/lessons.ts`)

**Currently reachable via:** `/english` (lesson card) → `/english/eng-001`; and conditionally via the Daily Mission engine (`lib/adaptiveEngine.ts`) surfacing `/mock-test`, which hardcodes `englishLessons[0]` — i.e. this exact lesson — as its English section.

**Classification: HIDE (from the CSSE journey specifically), RETIRE (the `/mock-test` reachability path)**

- The governing instruction explicitly names this item as material that must not be reintroduced into the new preparation journey (§3). This is a direct, current Founder decision — not an inference.
- Not evidence-led CSSE content (no CSSE Asset ID, no primary-source traceability of the kind the Founder Validation Assessment content was held to).
- **This release:** sever the Daily Mission engine's recommendation edge that can surface `/mock-test` (the one concrete path by which this content reaches the "new" active journey via a recommendation, not just a hub-page browse). The new CSSE-pathway "Learn" destination (see `NEW_ANGEL_INFORMATION_ARCHITECTURE.md`) does not link to `/english` at all for CSSE-pathway learners.
- **Not retired:** `/english/eng-001` itself, and `data/lessons.ts`'s `eng-001` entry, remain on disk and remain reachable for non-CSSE-pathway learners via the existing `/learn` hub — see §4 below for why this distinction matters.

## 2. "The Boy Who Collected Silence" (`eng-002`) and "Letters from the Trenches" (`eng-003`)

**Currently reachable via:** `/english` (lesson cards) → `/english/eng-002`, `/english/eng-003`. Not used by `/mock-test` (which only ever reads index 0).

**Classification: HIDE (from the CSSE journey specifically) — not independently named by the Founder, so not retired further than that**

- Unlike "The Lighthouse Mystery," these two are not individually named in the governing instruction. They are the same *class* of content (old, non-CSSE-evidence-authentic English lessons) and are excluded from the new CSSE-pathway "Learn" destination for the same reason (§3's Content Safety Rule — no evidence-led replacement content exists yet, so nothing from this old system is presented as if it were CSSE preparation).
- Left untouched on `/english` for non-CSSE-pathway learners, for the same architectural reason as §1.

## 3. "Year 4 Advanced" / "Year 5 Core" / "Year 5 Advanced" difficulty-tier labels

**Defined:** `types/index.ts`'s `Difficulty` type. **Displayed:** `app/english/page.tsx` (filter chips + lesson badges) and `app/vocabulary/page.tsx` (per-word tag) only — `app/maths/page.tsx` never displays these labels despite using the same underlying `difficulty` field.

**Classification: KEEP ENGINE (the `Difficulty` type itself, used elsewhere), HIDE (the two display sites, as a consequence of §1/§2/§4's treatment)**

- These are a pre-CSSE, UK-school-year framing with no relationship to the approved CSSE competency/Question-Type/EMC model. They are not independently retired here — they disappear from the CSSE-pathway journey as a direct consequence of `/english` and `/vocabulary` not being linked from the new CSSE "Learn" destination (see §4), not via a separate code change to the labels themselves.
- The `Difficulty` type stays exactly as-is; `data/maths.ts` and other data files continue to use it internally.

## 4. The broader old Learn/Practice system (`/learn`, `/reasoning` hubs → `/english`, `/maths`, `/vocabulary`, `/writing`, `/verbal-reasoning`, `/non-verbal-reasoning`, `/spatial-reasoning`, `/numerical-reasoning`)

**Classification: KEEP ENGINE — explicitly NOT retired or hidden wholesale in this release. Flagged as an architectural decision requiring separate Founder direction.**

This is the single largest classification decision in this register, and it is deliberately conservative. Reasoning:

- These eight routes are the **entire currently-functioning practice experience for every non-CSSE pathway** (GL, CEM, ISEB, "not sure," "none"). `components/parent/LegacyPathwayParentContent.tsx` (611 lines, the Parent Dashboard branch every non-CSSE family sees) is built entirely on evidence these routes produce. There is no CSSE-evidence-led equivalent for any non-CSSE pathway today, and building one is explicitly out of scope for this release (§17: "Do NOT yet mass-rebuild educational content," "Do NOT invent missing learning material").
- Hiding or retiring these routes wholesale would leave every non-CSSE-pathway family with **no practice content at all** — a materially worse outcome than the inconsistency the Founder is asking to fix, and not something named or implied anywhere in the governing instruction. The Founder's screenshots and named examples are drawn from the CSSE-pathway experience specifically (the Lighthouse Mystery, old year-tier labels — both visible primarily through the "Learn" path a CSSE-track family would use if the new unified top navigation pointed there unchanged).
- The correct, narrowly-scoped resolution (implemented this release, see `NEW_ANGEL_INFORMATION_ARCHITECTURE.md` §2): the new top navigation's "Learn" and "Practise" destinations **branch by selected pathway**, reusing the exact `getSelectedPathwayId() === "csse"` pattern already established throughout this codebase (Parent Dashboard, Practice session runner, Recommendation Engine). CSSE-pathway learners are routed to the new, evidence-safe destinations (an honest interim Learn state; the real `/learning-intelligence/practice` for Practise). Non-CSSE-pathway learners continue to reach the existing `/learn`/`/reasoning` hubs exactly as before — nothing about their experience changes in this release.
- **Escalated, not decided:** whether the old Learn/Practice system should eventually be retired, migrated to a genuinely evidence-led non-CSSE model, or intentionally kept as a permanently separate offering for non-CSSE pathways is a real product decision this register does not have the authority to make unilaterally. Recorded here for explicit Founder attention.

## 5. `app/mock-test/page.tsx`

**Currently reachable via:** direct URL only; not linked from `Navigation.tsx`, `/learn`, `/reasoning`, or `/mocks`; conditionally surfaced by the Daily Mission engine's recommendation (`lib/adaptiveEngine.ts`) once a learner has 5+ sessions and no mock attempt.

**Classification: RETIRE the one active reachability path (the Daily Mission recommendation edge); leave the route itself un-deleted**

- This route hardcodes "The Lighthouse Mystery" (§1) and a fixed Maths subset, uses none of the real evidence pipeline (no Supabase writes at all — confirmed via investigation), and structurally duplicates both the old Maths/English system and the Mock Centre without being part of either.
- Severing its one recommendation-engine reachability path is the concrete, low-risk action this release takes (also required to fully satisfy §1's "do not reintroduce Lighthouse Mystery into the new journey," since the Daily Mission strip appears on `/dashboard`, which IS part of the new "Today" experience).
- The route file itself is left on disk, reachable only by a user typing the exact URL — an acceptable residual, consistent with "do not delete valuable underlying engines/content merely because their old UI is being removed," pending a future explicit decision to delete it outright.

## 6. Duplicate/parallel systems

**Classification: KEEP ENGINE (both), MIGRATE navigation only**

Two genuinely duplicate systems exist, both real and both currently serving distinct populations, per §4's reasoning:
- **Practice**: old (`/reasoning` → 4 reasoning-subject routes, non-CSSE) vs. new (`/learning-intelligence/practice`, CSSE-only, Learning Engine V1). Not consolidated in this release — see §4.
- **Mock**: `/mocks/[pathway]` (legacy, all 4 pathways including a still-reachable but no-longer-carded `csse` variant) vs. `/learning-intelligence/mock-exam` (the real Educational Intelligence CSSE Mock, already the one the Mock Centre's CSSE card points to — confirmed via investigation, this re-routing already happened in an earlier increment). No further change needed here; the CSSE mock experience is already correctly consolidated. GL/CEM/ISEB continue to use `/mocks/[pathway]` as their only mock experience — unchanged, out of scope.

## 7. Placeholder / illustrative / seeded content markers (code, not docs)

**Classification: KEEP ENGINE, no action** — every marker found (migration 013's "illustrative content," the ALI synthetic fixtures in `data/ali/*SyntheticFixture.ts`, the four "small sample set" disclosures already live on `/mocks`) is **already honestly disclosed** in-context (either as a code comment for engineers or, in the `/mocks` case, as real, live, user-facing disclosure text). None of these were found to be silently presented as if authentic. No retirement action required; recorded here to close out §2's explicit instruction to investigate this category.

---

## Summary table

| Item | Reachable today via | Classification |
|---|---|---|
| The Lighthouse Mystery (eng-001) | `/english`, `/mock-test` (via Daily Mission) | HIDE from CSSE journey; RETIRE the `/mock-test` recommendation path |
| The Boy Who Collected Silence (eng-002) | `/english` | HIDE from CSSE journey |
| Letters from the Trenches (eng-003) | `/english` | HIDE from CSSE journey |
| Year 4 Advanced / Year 5 Core / Year 5 Advanced labels | `/english`, `/vocabulary` | HIDE from CSSE journey (consequence of above) |
| `/learn`, `/reasoning` hubs + 8 subject routes | Primary nav ("Learn"/"Practice") | KEEP ENGINE — unchanged for non-CSSE pathways; new nav branches CSSE learners away from them |
| `/mock-test` | Direct URL / Daily Mission | RETIRE the recommendation path; route left un-deleted |
| Old vs. new Practice/Mock duplication | Various | KEEP ENGINE both; no consolidation this release |
| Illustrative/synthetic/placeholder markers | Various (already disclosed) | No action — already honest |

No item in this register has evidence-led CSSE replacement content ready today, so per the Content Safety Rule, nothing has been replaced with newly invented material — items are hidden from the new journey, not swapped for unproven substitutes.
