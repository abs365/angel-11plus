import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import PWAProvider from "@/components/PWAProvider";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://angel11plus.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: "Angel 11+ — Smart UK 11+ Preparation",
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
    title: "Angel 11+ — Smart UK 11+ Preparation",
    description:
      "Original exam-style practice for UK 11+ preparation. Adaptive learning across English, Maths, Reasoning, Writing and Reading Fluency.",
    url: APP_URL,
    // og:image — add /og-image.png (1200×630) once brand assets are ready
    // images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },

  twitter: {
    card: "summary",
    title: "Angel 11+ — Smart UK 11+ Preparation",
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
  maximumScale: 1,
  userScalable: false,
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
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">
        <AuthProvider>{children}</AuthProvider>
        <PWAProvider />
      </body>
    </html>
  );
}
