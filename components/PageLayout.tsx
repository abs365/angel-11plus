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
      {/* Main content — offset to clear Navigation's fixed top bar (desktop/
          tablet, New Learner Experience Migration) and bottom bar (mobile).
          Both this offset and Navigation's own height read from the same
          --topbar-height token so they never drift out of sync. */}
      <main className="md:pt-[var(--topbar-height)] pb-nav-safe md:pb-0 min-h-screen flex flex-col">
        <Header breadcrumbs={breadcrumbs} />
        <div className="flex-1">{children}</div>
        <SupportFooter />
      </main>
    </div>
  );
}
