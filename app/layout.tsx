import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import PWAProvider from "@/components/PWAProvider";

/**
 * Experience Programme, Stage 1 — typography foundation. Replaces the bare
 * OS system-font stack (the single most concrete, evidence-cited cause of
 * the "AI-generated/generic SaaS" concern — see ANGEL_PRODUCT_EXPERIENCE_
 * COMMERCIAL_BENCHMARK_V1.md Part 3). One family only, per the Experience
 * System's own "own the typography... not multiple decorative families"
 * principle — weight range alone (300-700 in active use) carries the full
 * hierarchy, no second display family.
 *
 * Lexend, not a taste pick: it is the one widely-available production
 * typeface whose entire design brief is reading-proficiency research (the
 * Lexend Reading Acceleration project, university reading-rate studies),
 * making it the one candidate with a real evidentiary rationale for a
 * product whose own brand promise is evidence-based education — the same
 * criterion this codebase already applies to its own educational claims,
 * applied here to a typography decision instead of an ad-hoc preference.
 * Self-hosted via next/font/google (zero runtime request, zero layout
 * shift, automatic subsetting) — the correct, current Next.js integration
 * pattern, not a <link> tag.
 */
const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://angel11plus.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: "Angel 11+: Smart UK 11+ Preparation",
    template: "%s | Angel 11+",
  },
  description:
    "Original exam-style practice for UK 11+ preparation across English, Maths, Reasoning, Writing and Reading Fluency. Covers GL, CEM, CSSE, ISEB and Independent pathways.",

  manifest: "/manifest.json",

  // iOS PWA — enables "Add to Home Screen" full-screen mode.
  appleWebApp: {
    capable: true,
    title: "Angel 11+",
    statusBarStyle: "black-translucent",
  },

  openGraph: {
    type: "website",
    siteName: "Angel 11+",
    title: "Angel 11+: Smart UK 11+ Preparation",
    description:
      "Original exam-style practice for UK 11+ preparation. Adaptive learning across English, Maths, Reasoning, Writing and Reading Fluency.",
    url: APP_URL,
    // og:image — add /og-image.png (1200×630) once brand assets are ready
    // images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },

  twitter: {
    card: "summary",
    title: "Angel 11+: Smart UK 11+ Preparation",
    description:
      "Original exam-style 11+ practice for GL, CEM, CSSE, ISEB and Independent pathways. Adaptive learning, Smart Feedback.",
    // images: ["/og-image.png"],  // uncomment when brand asset exists
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },

  robots: {
    index: false, // private educational platform — keep out of search engines
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Experience Programme, Stage 1 — accessibility foundation fix:
  // maximumScale: 1 + userScalable: false disabled pinch-zoom entirely,
  // failing WCAG 2.1 SC 1.4.4 (Resize Text — must allow zoom to at least
  // 200%). Removed; the app's own layout already tolerates zoom (rem-based
  // type scale, no fixed-width containers found on the audited surfaces).
  themeColor: "#7c3aed",
  // Needed for iOS safe-area env() variables to work correctly in standalone mode.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${lexend.variable}`}>
      <body className="min-h-full antialiased">
        <AuthProvider>{children}</AuthProvider>
        <PWAProvider />
      </body>
    </html>
  );
}
