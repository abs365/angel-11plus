# ANGEL 11+ — App Icon / Favicon Brand Correction

Concise report, per the governing instruction's own "report concisely" framing.

## Root cause
`app/favicon.ico` was the literal, unreplaced **default Next.js/Vercel scaffold icon** (a black
circle with a white triangle) — dated to this project's original scaffolding, predating every
branding pass in this codebase's history (Zero-Purple, Brand Foundation v1.0, all four homepage
increments). Next.js's file-based convention automatically serves any `app/favicon.ico` at the
well-known `/favicon.ico` URL, and `app/layout.tsx`'s own `metadata.icons.icon` already pointed at
that same path — so this was never a wiring problem, only a content problem: the file itself was
never swapped for a real Angel 11+ mark. Confirmed by direct inspection (`file`, then decoded with
Pillow) — the served image was unambiguously the old black/white triangle mark.

The PWA manifest icons (`public/icon-192.png`, `public/icon-512.png`, correctly referenced by both
`public/manifest.json` and `app/layout.tsx`'s `metadata.icons.apple`) were **already** a real,
deliberate Angel "A" mark on Angel Blue — not part of the problem, and used as the source design for
the new favicon.

## Files changed
- `app/favicon.ico` — regenerated (binary replacement, no code change).
- `public/sw.js` — `CACHE_VER` bumped `v3` → `v4` (see caching note below).

No other file was touched. `app/layout.tsx`'s icon metadata was already correct and needed no change.

## New icon design
The existing Angel "A" pixel-mark (white "A" on Angel Blue `#2563EB`) was reused unchanged, rendered
into a proper multi-resolution `.ico` (16, 32, 48, 64, 256px) from the 512px source for crisp
downsampling. This keeps the favicon visually identical to the already-correct PWA/Apple-touch icon
rather than introducing a second, different mark. Verified legible at true 16×16 favicon scale.
Zero purple, zero gradient, no AI/robot/brain/sparkle imagery, no attempt to cram the full wordmark
into a tiny square — a single simple letterform, per the governing instruction's own preference.

## Favicon / app-icon / metadata locations
| Purpose | Location | Status |
|---|---|---|
| Browser tab favicon | `app/favicon.ico` (auto-served at `/favicon.ico`) | **Fixed this pass** |
| `<link rel="icon">` metadata | `app/layout.tsx` → `metadata.icons.icon: "/favicon.ico"` | Already correct, unchanged |
| Apple touch icon | `app/layout.tsx` → `metadata.icons.apple: "/icon-192.png"` | Already correct, unchanged |
| PWA manifest icons | `public/manifest.json` → `/icon-192.png`, `/icon-512.png` | Already correct, unchanged |
| Open Graph / Twitter image | Not wired (deliberately commented out in `app/layout.tsx`, "add once brand assets are ready") | Unchanged — out of this task's scope; no OG image currently exists to be wrong, and creating one wasn't requested |

## Tests / build
Clean-checkout gate (genuine `git worktree` of the exact commit below): typecheck 0 errors; tests
4,736/4,737 pass, 0 failures, 1 pre-existing skip (matches the established baseline exactly);
migration-sql-guard PASS (257 files); ESLint 114 problems and Copy Quality Guard 51 violations, both
confirmed unchanged from the pre-existing baseline; **genuine `next build` PASS**, no bypass flag.
Locally verified by fetching `/favicon.ico` from a real running production build and decoding it —
confirmed the new Angel "A" mark, all 5 sizes present.

## Production verification
`https://www.angel11plus.com/` is now genuinely reachable and resolving (the permanent domain has
been connected since this task's predecessors — confirmed directly, not assumed). Fetched
`https://www.angel11plus.com/favicon.ico` directly (not through the browser) and decoded it:
**confirmed the new Angel "A" mark is being served**, with `Last-Modified` matching this deployment's
exact timestamp — this is the fresh file, not a stale edge cache. Also reloaded the live homepage in
a real browser tab: page renders correctly, unchanged (homepage remains frozen, as instructed).
`manifest.json`, `icon-192.png` and `icon-512.png` all still serve correctly (HTTP 200) on the
permanent domain, confirming no regression to the already-correct PWA/Apple-touch wiring.

## Commit
`72ab3ec` — `fix(brand): replace default Next.js favicon with Angel 11+ mark`.

## Deployment status
Pushed to `origin/main`, deployed automatically through the existing Vercel production process (no
manual deploy). Deployment Ready, aliased to `https://angel-11plus.vercel.app`, and independently
confirmed live and correct on the connected permanent domain,
`https://www.angel11plus.com/`. Cloudflare DNS, SMTP, Supabase Auth, and the homepage itself were not
touched.

## Remaining cache limitations (disclosed, not a production defect)
- **Service worker:** addressed directly — `CACHE_VER` was bumped specifically because
  `favicon.ico` is served cache-first from `STATIC_CACHE` at runtime (though not precached at
  install), so a returning visitor's installed service worker would otherwise keep serving its old
  cached copy indefinitely. The version bump forces every client's next activation to drop the stale
  cache.
- **Browser-level favicon caching:** browsers are known to cache favicons unusually aggressively,
  sometimes beyond what standard HTTP cache headers would normally justify, independent of the
  service worker entirely. A small number of returning visitors' browser tab icons may not update
  until a hard refresh, a new tab, or the browser's own favicon cache naturally expires. This is a
  client-side behaviour outside application control, not a sign of a lingering server-side problem —
  confirmed by the direct fetch above that the server itself is now correctly serving the new icon.
- **Messaging-app / link-preview caching:** applications that generate link previews (e.g. chat
  apps) commonly cache a site's icon/preview data for some period after first seeing a link, and may
  continue showing the old icon in previously-shared links until their own cache expires or is
  manually refreshed on their end. Not something this deployment can force.

---

**ANGEL 11+ APP ICON BRAND CORRECTION: GO.**
