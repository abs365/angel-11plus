import Navigation from "./Navigation";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f8f7ff] dark:bg-gray-950">
      <Navigation />
      {/* Main content — offset for sidebar on md+ */}
      <main className="md:ml-64 pb-nav-safe md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
