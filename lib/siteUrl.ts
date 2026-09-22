/**
 * Increment 1 (Public Experience Foundation) — single source of truth for the
 * canonical application URL. Previously duplicated as a local constant inside
 * app/layout.tsx only; now also needed by app/robots.ts and app/sitemap.ts, so
 * it lives here once rather than as three independently-typed copies of the
 * same fallback string. Same value, same env var, same fallback as before —
 * this is an extraction, not a behaviour change.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://angel11plus.com";
