import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sprint 4 Completion Package (FD-020, WP4B) — /parent's content was
  // migrated into the unified Parent Dashboard at /learning-intelligence/
  // parent (one shared shell, pathway-specific content branch). This
  // redirect keeps every existing bookmark/link working.
  async redirects() {
    return [
      {
        source: "/parent",
        destination: "/learning-intelligence/parent",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
