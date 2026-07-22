import Navigation from "./Navigation";
import SupportFooter from "./SupportFooter";
import Header from "./Header";
import type { Breadcrumb } from "./ui/Breadcrumbs";

interface PageLayoutProps {
  children: React.ReactNode;
  /** Sprint 2 (Platform Shell) — optional breadcrumb trail rendered in the new Header. Omitted by default; no existing page is required to supply one. */
  breadcrumbs?: Breadcrumb[];
}

export default function PageLayout({ children, breadcrumbs }: PageLayoutProps) {
  // AN-108 — reads var(--background) instead of a second, independently
  // hardcoded copy of the same hex; the CSS variable itself already branches
  // light/dark (globals.css's own prefers-color-scheme block), so a separate
  // dark: class isn't needed and previously left dark mode on an unrelated
  // cool gray-950 rather than the token's actual dark value — this also
  // closes that mismatch.
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navigation />
      {/* Main content — offset to match Navigation's responsive width
          (AN-101: collapsed icon rail 768–1023px, full sidebar 1024px+).
          Both this offset and Navigation's own width now read from the
          same --nav-width-collapsed / --nav-width tokens instead of two
          independently hardcoded values. */}
      <main className="md:ml-[var(--nav-width-collapsed)] lg:ml-[var(--nav-width)] pb-nav-safe md:pb-0 min-h-screen flex flex-col">
        <Header breadcrumbs={breadcrumbs} />
        <div className="flex-1">{children}</div>
        <SupportFooter />
      </main>
    </div>
  );
}
