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
  return (
    <div className="min-h-screen bg-[#f8f7ff] dark:bg-gray-950">
      <Navigation />
      {/* Main content — offset for sidebar on md+ */}
      <main className="md:ml-64 pb-nav-safe md:pb-0 min-h-screen flex flex-col">
        <Header breadcrumbs={breadcrumbs} />
        <div className="flex-1">{children}</div>
        <SupportFooter />
      </main>
    </div>
  );
}
