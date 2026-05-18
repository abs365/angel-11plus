import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://angel11plus.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: "Angel 11+ — Selective School Preparation",
    template: "%s | Angel 11+",
  },
  description:
    "Premium 11+ preparation platform for Essex CSSE and selective school entry. Adaptive practice in English, Maths, Vocabulary and Writing.",

  manifest: "/manifest.json",

  openGraph: {
    type: "website",
    siteName: "Angel 11+",
    title: "Angel 11+ — Selective School Preparation",
    description:
      "Adaptive 11+ exam preparation for Essex CSSE. English comprehension, Maths reasoning, Vocabulary and AI-powered writing coaching.",
    url: APP_URL,
    // og:image — add /og-image.png (1200×630) once brand assets are ready
    // images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },

  twitter: {
    card: "summary",
    title: "Angel 11+ — Selective School Preparation",
    description:
      "Adaptive 11+ exam prep for Essex CSSE. English, Maths, Vocabulary, AI writing coach.",
    // images: ["/og-image.png"],  // uncomment when brand asset exists
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },

  robots: {
    index: false,  // private educational platform — keep out of search engines
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#7c3aed",
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
      </body>
    </html>
  );
}
