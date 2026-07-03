# Angel Loading Experience — V3

**Status:** Approved, implemented as `components/PremiumLoader.tsx`, used by all four adaptive routes.

---

## 1. What was actually there

Four loading states, one per adaptive route, all the same shape — a centred, single line of small gray text, no icon, no motion beyond the browser's default page paint:

| Route | Old copy |
|---|---|
| `app/mocks/adaptive/gl/page.tsx` | "Building your adaptive mock…" |
| `app/mocks/adaptive/maths/page.tsx` | "Building your adaptive practice session…" |
| `app/mocks/adaptive/english/page.tsx` | "Choosing your passage…" |
| `app/mocks/adaptive/vocabulary/page.tsx` | "Choosing your word…" |

These read exactly like what they are — a developer's placeholder describing the internal selection step (`selectLearningUnit()`/`buildAdaptiveSection()` running), not a moment designed for a 9–11 year old to sit through. They also each named the ALI mechanism ("adaptive") directly, violating the invisibility rule on the one screen every single practice session passes through.

## 2. New design: `components/PremiumLoader.tsx`

One shared component, not four copy-pasted `<p>` tags:

- **A gently pulsing icon in a soft rounded container** (reuses the Lucide icon set already in place — a `Sparkles` icon by default, subject icon optionally, per `ANGEL_DESIGN_LANGUAGE.md` §2), using a slow, calm `animate-pulse`-based motion — no spinner-chasing-its-tail, which reads as "system busy" rather than "something good is being prepared."
- **One line of warm, encouraging copy**, never a description of the mechanism.
- **A subtle animated progress indicator** (three dots, staggered pulse) so the screen doesn't feel static even during a longer real-network wait.

### Copy replacements (direct swap, same meaning, zero jargon)

| Route | New copy |
|---|---|
| GL adaptive mock | "Preparing your practice session…" |
| Maths adaptive practice | "Getting your questions ready…" |
| English adaptive practice | "Finding the perfect passage…" |
| Vocabulary adaptive practice | "Picking today's word…" |

Every one of these describes the *outcome the student is waiting for*, not the *internal step happening* — "finding the perfect passage" is what's actually true from the student's point of view; "choosing your passage" was true from the code's point of view. Same fact, different audience.

## 3. Component API

```tsx
<PremiumLoader message="Preparing your practice session…" />
```

A single required `message` prop keeps this trivial to drop into any of the four routes (or any future loading state) without inventing per-route variants. No illustration asset was added this phase (would require new image assets outside this phase's scope) — the icon-in-a-soft-container-plus-pulse treatment achieves "premium, not a developer placeholder" without a new asset pipeline, and can be upgraded to a real illustration later without changing the component's API.

## 4. Where this does NOT apply

- The intro screens ("Start Adaptive Practice" buttons, now renamed per `ANGEL_NAVIGATION_ARCHITECTURE.md` §4) are unchanged in structure — they were already well-designed, description-plus-CTA screens, not loading states.
- The "sample practice data" banner (shown while a subject runs on its synthetic dev fixture, `ALI_SEEDING_PLAN.md`) is not a loading state and is out of scope here — its copy is softened separately (dropping "hand-tagged," an internal term) but its function is unchanged.
- Error states (`mode === "error"`) are unchanged — they already show a clear, honest message and a way back, which is the correct pattern for a failure, distinct from the "make waiting pleasant" goal this document covers.
