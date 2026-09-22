import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";

/**
 * Increment 1 (Public Experience Foundation) — the first robots.txt this
 * product has ever needed. Before this increment "/" redirected straight
 * into the gated app, so there was nothing public worth crawling. Only the
 * genuinely public, informational routes (lib/registeredAccess.ts's
 * PUBLIC_TOP_LEVEL_ROUTES) are allowed; every learner/parent surface stays
 * disallowed, matching the root layout's own default `robots: { index:
 * false }` for anything that doesn't explicitly override it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacy", "/terms", "/getting-started", "/contact"],
      disallow: [
        "/dashboard",
        "/learn",
        "/learning-intelligence",
        "/english",
        "/maths",
        "/vocabulary",
        "/writing",
        "/verbal-reasoning",
        "/non-verbal-reasoning",
        "/numerical-reasoning",
        "/spatial-reasoning",
        "/reasoning",
        "/mocks",
        "/mock-test",
        "/progress",
        "/pathways",
        "/add-child",
        "/admin-beta",
        "/api",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
