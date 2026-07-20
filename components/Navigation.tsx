"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  BarChart2,
  Compass,
  LogIn,
  User,
  Users,
  MapPin,
  Trophy,
  Puzzle,
  HelpCircle,
  MessageSquare,
  Mail,
  Sparkles,
  Crown,
  Brain,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import UserMenu from "@/components/ui/UserMenu";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

// EEP-001 (Navigation Excellence) — the primary sidebar hierarchy.
// Sprint-by-sprint rationale for how each label/grouping was chosen lives
// in git history (Sprints 2/4/5/7); this comment describes the current,
// settled structure only, per this refinement sprint's own "review all
// navigation items" objective. Four labelled primary sections — Journey
// (overview + progress tracking), Learn, Practice (practice, mocks,
// school intelligence) — followed by Family and Support. Every route is
// unchanged; only grouping and labels are in scope here.
//
// EEP-001 change: "Progress" moves out of its own unlabelled section
// (previously an orphaned single-item group with no header, a real
// grouping inconsistency) into Journey, alongside My Admission Journey —
// both are "where am I in this journey" destinations. "Target Schools" is
// renamed "School Intelligence" to match the label this same destination
// already uses everywhere else it's referenced (the /pathways page's own
// H1 since Sprint 7, and Sprint 9's Angel Plus journey grid) — the nav
// was the one remaining place still using the older Sprint 2 label.
const navSections: NavSection[] = [
  {
    label: "Journey",
    items: [
      { href: "/dashboard", label: "My Admission Journey", icon: Compass },
      { href: "/progress", label: "Progress", icon: BarChart2 },
      { href: "/learning-intelligence", label: "Learning Intelligence", icon: Brain },
    ],
  },
  {
    label: "Learn",
    items: [
      { href: "/learn", label: "Learn", icon: BookOpen },
    ],
  },
  {
    label: "Practice",
    items: [
      { href: "/reasoning", label: "Practice", icon: Puzzle },
      { href: "/mocks", label: "Mock Centre", icon: Trophy },
      { href: "/pathways", label: "School Intelligence", icon: MapPin },
    ],
  },
];

const parentItem: NavItem = {
  href: "/parent",
  label: "Parent Hub",
  icon: Users,
};

/** Angel Plus — Sprint 9 (Angel Plus Value Experience) built out app/angel-plus/page.tsx into a real Value Overview of the existing free journey; the "Soon" badge remains accurate because the Angel Plus tier itself still has no premium features, billing, or business logic anywhere in this codebase — that page says so honestly rather than fabricating a feature list. */
const angelPlusItem: NavItem = {
  href: "/angel-plus",
  label: "Angel Plus",
  icon: Crown,
  badge: "Soon",
};

const supportItems: NavItem[] = [
  { href: "/getting-started", label: "Getting Started", icon: HelpCircle },
  { href: "/feedback", label: "Send Feedback", icon: MessageSquare },
  { href: "/testimonial", label: "Share Experience", icon: Sparkles },
  { href: "/contact", label: "Contact", icon: Mail },
];

const mobileNavItems = [
  { href: "/dashboard", label: "Journey", icon: Compass },
  // Sprint 4 — "English"/"Maths" individual slots collapse into one "Learn"
  // slot pointing to the new Learning Hub, matching the desktop nav's
  // collapse; both underlying routes remain one tap away from the hub.
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/mocks", label: "Mock Centre", icon: Trophy },
  { href: "/progress", label: "Progress", icon: BarChart2 },
];

function SidebarLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const basePath = item.href.split("#")[0];
  const active = pathname === basePath || pathname.startsWith(basePath + "/");
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
        active
          ? "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200"
      }`}
    >
      <item.icon
        size={17}
        className={active ? "text-purple-600 dark:text-purple-400" : "text-gray-400 dark:text-gray-500"}
      />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="text-[9px] font-semibold bg-purple-100 dark:bg-purple-900 text-purple-500 dark:text-purple-300 px-1.5 py-0.5 rounded-full leading-none">
          {item.badge}
        </span>
      )}
      {active && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400 shrink-0" />}
    </Link>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push("/dashboard");
  }

  return (
    <>
      {/* Desktop / Tablet sidebar */}
      <nav className="hidden md:flex flex-col w-64 min-h-screen bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 px-3 py-6 fixed left-0 top-0 z-40">
        {/* Brand */}
        <div className="mb-5 px-3">
          <h1 className="text-xl font-bold text-purple-700 dark:text-purple-400">Angel 11+</h1>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">Smart UK 11+ Prep</p>
        </div>

        {/* Sectioned nav */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* EEP-001 — every group divider below (primary sections after
              the first, Family, Support) now shares one consistent
              mt-2 pt-3 rhythm; previously these three ad-hoc values
              (mt-1/pt-2, mt-3/pt-3, mt-2/pt-2) gave otherwise-identical
              group separators a subtly uneven vertical rhythm. The
              account footer below keeps its own, deliberately larger gap
              (mt-4 pt-4) since it closes a different tier — the pinned
              account area, not another nav group. */}
          {navSections.map((section, idx) => (
            <div
              key={section.label || `section-${idx}`}
              className={idx > 0 ? "mt-2 pt-3 border-t border-gray-100 dark:border-gray-800" : ""}
            >
              {section.label && (
                <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-600">
                  {section.label}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <SidebarLink key={item.href} item={item} pathname={pathname} />
                ))}
              </div>
            </div>
          ))}

          {/* Family — Parent Hub + Angel Plus, always separated from student learning items */}
          <div className="mt-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-600">
              Family
            </p>
            <div className="flex flex-col gap-0.5">
              <SidebarLink item={parentItem} pathname={pathname} />
              <SidebarLink item={angelPlusItem} pathname={pathname} />
            </div>
          </div>

          {/* Support — beta & help links */}
          <div className="mt-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-600">
              Support
            </p>
            <div className="flex flex-col gap-0.5">
              {supportItems.map((item) => (
                <SidebarLink key={item.href} item={item} pathname={pathname} />
              ))}
            </div>
          </div>
        </div>

        {/* User auth — pinned at very bottom. Sprint 2: extracted into the
            reusable UserMenu component (components/ui/UserMenu.tsx) — same
            markup and behaviour, not a new pattern. */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <UserMenu email={user?.email} loading={loading} onSignOut={handleSignOut} />
          {!loading && !user && (
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-1 px-2">Powered by Angel Digital</p>
          )}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 px-1 pb-safe">
        <div className="flex justify-around items-center h-16">
          {mobileNavItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                /* EEP-001 — active tabs now get the same subtle background
                   pill the desktop sidebar already uses for its active
                   item, instead of a colour-only change, so "where am I"
                   reads at a glance on mobile too. */
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[52px] transition-colors ${
                  active ? "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300" : "text-gray-400"
                }`}
              >
                <Icon size={20} className={active ? "text-purple-600 dark:text-purple-400" : "text-gray-400"} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
          {/* Parent / login */}
          <Link
            href={user ? "/parent" : "/login"}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[52px] transition-colors ${
              pathname === "/parent" || pathname === "/login" ? "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300" : "text-gray-400"
            }`}
          >
            {user ? (
              <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                <User size={12} className="text-purple-600" />
              </div>
            ) : (
              <LogIn size={20} />
            )}
            <span className="text-[10px] font-medium">{user ? "Parent" : "Login"}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
