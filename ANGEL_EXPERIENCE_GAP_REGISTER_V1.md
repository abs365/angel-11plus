# ANGEL 11+ — Experience Gap Register, V1

**Status:** Prioritised findings only. No implementation. Scored against learner friction, educational impact, commercial trust, conversion, retention, accessibility, architectural inconsistency, and implementation dependency — not visual ugliness alone.

---

## CRITICAL

**C1 — Practice has zero keyboard support.** `app/learning-intelligence/practice/[area]/page.tsx`: 16 `onClick` handlers, 0 keyboard handlers, on the single highest-volume interaction surface in the entire product. **Learner friction:** severe, repeated hundreds/thousands of times. **Educational impact:** none directly, but real fatigue/attrition risk over sustained use. **Dependency:** blocks nothing else; can be fixed independently and early. Directly named by the Founder as "not optional polish."

**C2 — No custom typeface.** `app/globals.css:233` uses the OS system font stack, unchanged through multiple prior visual-refinement passes that touched colour instead. **Commercial trust:** high impact — this is close to the literal definition of "template-like." **Dependency:** none; a single-file, low-risk, high-visibility change; the correct first foundation step.

**C3 — Seven fragmented card primitives, including two colliding colour-key names for "purple."** `components/ui/Card.tsx`. **Architectural inconsistency:** high — every new feature currently has to choose among seven inconsistent existing patterns or invent an eighth. **Dependency:** foundational; every other surface's IMPROVE work is cheaper once this is fixed first.

---

## HIGH

**H1 — Decorative icon density in specific, checkable places** (`CssePathwayParentContent.tsx`'s `Sparkles`/`Target`/`HelpCircle` beside already-clear headers). **Commercial trust:** moderate-high — a direct, named symptom of the "AI-generated" concern. **Dependency:** low; a policy + sweep, not a rebuild.

**H2 — Repeated generic page-header pattern** (icon-box + h1 + subtitle) across nearly every surface audited. **Commercial trust:** moderate — consistency read as template-sameness rather than brand identity. **Dependency:** depends on C2/C3 landing first (a new type + card system changes what a "better" header looks like).

**H3 — No shared question-rendering shell** — Practice, Learn, and Mock each historically maintain independent implementations. **Educational impact:** real — a fix made in one place doesn't propagate; **implementation dependency:** high — this is genuinely structural work, not a quick win, and should follow the design-system foundation, not precede it.

**H4 — Loading states are consistent but visually under-designed** (bare `aria-live` text everywhere, no skeleton treatment on content-heavy surfaces). **Commercial trust:** moderate. **Dependency:** low; cosmetic once the type/card foundation exists.

---

## MEDIUM

**M1 — Dashboard information hierarchy** (per the directive's own Part 10 concern) — not independently re-audited page-by-page this session beyond what the Benchmark document already covers structurally; flagged for direct hierarchy work once the design-system foundation exists, not before.

**M2 — Responsive/tablet-specific question layout** — no evidence of dedicated tablet treatment found; not yet a proven, high-volume failure (mobile Mock is already explicitly out of scope per 008V), but real for Practice/Learn on tablet.

**M3 — Motion/reduced-motion consistency** — `motion-reduce:` found in at least one component (`SchoolCard`) but not confirmed universal; needs a repo-wide sweep, not a redesign.

---

## LOW

**L1 — Loading-state skeletons** (already covered under H4's dependency, listed here as the specific low-effort/low-risk sub-item).
**L2 — Icon stroke-weight/sizing formalisation into named roles** — the library itself is already consistent (lucide-react, 86 files); this is a naming/documentation task once the icon governance policy (K, Experience System) is agreed, not a visual change.

---

## Not scored (explicitly out of this increment's protected boundary)

Educational Intelligence, mastery, readiness, Mock scoring/security, database schema, and the 008P evidence-provenance question are all unaffected by every gap above — none requires touching any of them, per 008P's own explicit protection and this increment's own directive.

---

*Document version: V1. Date: 2026-08-18. Every gap traces to a specific, cited finding in `ANGEL_PRODUCT_EXPERIENCE_COMMERCIAL_BENCHMARK_V1.md` — none is asserted independently here.*
