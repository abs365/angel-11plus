# ANGEL 11+ — Homepage Final Image + Footer Completion

Concise report, per the governing instruction's own "report concisely" framing.

## Image asset
- **Location:** `public/images/hero-preparation.png` — copied byte-for-byte from the Founder-supplied
  file (2,181,824 bytes, identical checksum to source). Not regenerated, recropped at the source, or
  altered.
- **Source dimensions:** 1536×1024 (3:2 landscape) — a single image containing two photographs side
  by side.

## Optimisation method
Served via `next/image` (`components/public/HeroPhoto.tsx`), which handles responsive resizing,
format negotiation (AVIF/WebP where the browser supports it) and quality automatically at request
time — no manual pre-conversion of the source file. `priority` is set (above the fold), with a
`sizes="(min-width: 768px) 40vw, 100vw"` hint matching the image's real rendered width in the hero's
`md:col-span-5` column.

## Desktop crop / object-position
**Disclosed deliberate deviation from Increment 1B's documented 4:5 portrait spec** — the supplied
asset is 3:2 landscape, not the assumed single-subject portrait. Forcing a 4:5 crop onto a 3:2 source
would cut a narrow vertical slice through the middle of the frame, landing almost exactly on the
boundary between the two photographs and cutting into both — which would violate the governing
instruction's own explicit "do not crop faces, heads or important learning activity" rule. Instead,
the container's aspect ratio (`aspect-[3/2]`) matches the source almost exactly, so `object-fit: cover`
crops nothing meaningful and the whole approved image displays intact. `object-position: center`.
Corner radius: a restrained `rounded-lg` (no heavy border, no shadow, no card treatment), directly
per the governing instruction's §4.

## Tablet behaviour
Same container/ratio, narrower column width (verified live at 998px viewport width: the hero renders
as the established two-column layout with the full image visible and undistorted).

## Mobile crop / object-position
Same `aspect-[3/2]` container, same `object-position: center`, full column width. No separate mobile
crop override was introduced — one ratio is used at every breakpoint, since none of them requires
cropping this particular image (verified live at 390px width).

## Alt text
"A girl in school uniform holding a stack of books in a home study room, and the same girl helping a
younger child with handwriting practice at a desk with English, Mathematics, Reasoning and Vocabulary
workbooks." — descriptive of the visible scene, no marketing language, no names, no claim that it is
a real learner's data or a documented tutoring session.

## Component change
`components/public/StudyIllustration.tsx` (the temporary SVG) is removed outright — confirmed unused
anywhere else in the codebase before deletion — replaced by `components/public/HeroPhoto.tsx`.

## Footer changes
Presentation and alignment only; the legal/independence wording is byte-identical to before. Two rows
on the same `max-w-7xl` content grid as the rest of the homepage:
- **Top row:** "Angel 11+" + "Independent 11+ preparation shaped around your child." on the left;
  Privacy / Terms / Contact and support / Sign in on the right.
- **Divider**, then **bottom row:** the independence statement (left/main), copyright (right).
- **Mobile:** stacks top-to-bottom (wordmark+descriptor → links → divider → independence statement →
  copyright), independence statement before copyright, no horizontal overflow, no cards/icons/badges
  introduced — verified live at 390px width.

## Tests / build
Clean-checkout gate (genuine `git worktree` of the exact commit below, not the local working
directory): typecheck 0 errors; tests 4,736/4,737 pass, 0 failures, 1 pre-existing skip (matches the
established baseline exactly); migration-sql-guard PASS (257 files); ESLint 114 problems and Copy
Quality Guard 51 violations, both confirmed unchanged from the pre-existing baseline (zero new
issues); **genuine `next build` PASS**, no bypass flag, all 72 routes including `/`, `/robots.txt`,
`/sitemap.xml` — `/` remains statically prerendered even with `next/image` in the hero. New-purple and
new-AI-terminology scans: zero matches in every file this pass touched. No layout-shift risk: the
image sits in a `fill`-mode `next/image` inside a CSS `aspect-ratio`-defined container, so its box is
sized before the image itself loads. No broken asset path: verified live (`naturalWidth`/`naturalHeight`
confirmed non-zero, `complete: true`) on both the local production build and the actual deployment.

## Commit
`56762c1` — `feat(public): homepage final image + footer completion`.

## Deployment status
Pushed to `origin/main`, deployed automatically through the existing Vercel production process (no
manual deploy). Deployment `dpl_AKAifVgKTUbCieBcsvUSRgihFMML`, status Ready, automatically aliased to
`https://angel-11plus.vercel.app`. `angel11plus.com`, Cloudflare, SMTP and Supabase Auth were not
touched.

## Production evidence captured (real screenshots, not DOM text)
Desktop hero with the approved image; desktop hero + preparation journey; corrected desktop footer;
tablet hero (998px, genuine iframe-verified viewport); mobile hero (390px); mobile footer (390px) —
all captured directly against `https://angel-11plus.vercel.app`.

---

**TECHNICAL STATUS: GO.**
**HERO IMAGE INTEGRATION: GO.**
**FOOTER: GO.**
**FINAL VISUAL FOUNDER ACCEPTANCE: PENDING FOUNDER REVIEW.**
