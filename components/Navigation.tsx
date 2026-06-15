"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Calculator,
  Pencil,
  BookMarked,
  BarChart2,
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
  Users,
  MapPin,
  Hash,
  Target,
  Puzzle,
  Shapes,
  Compass,
  HelpCircle,
  MessageSquare,
  Mail,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

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

const navSections: NavSection[] = [
  {
    label: "Learning",
    items: [
      { href: "/dashboard", label: "Home", icon: LayoutDashboard },
      { href: "/english", label: "English", icon: BookOpen },
      { href: "/maths", label: "Maths", icon: Calculator },
      { href: "/vocabulary", label: "Vocabulary", icon: BookMarked },
      { href: "/writing", label: "Writing", icon: Pencil },
      { href: "/progress", label: "Progress", icon: BarChart2 },
    ],
  },
  {
    label: "Reasoning",
    items: [
      { href: "/verbal-reasoning", label: "Verbal Reasoning", icon: Puzzle },
      { href: "/non-verbal-reasoning", label: "Non-Verbal", icon: Shapes },
      { href: "/spatial-reasoning", label: "Spatial", icon: Compass },
      { href: "/numerical-reasoning", label: "Numerical", icon: Hash },
    ],
  },
  {
    label: "Exams",
    items: [
      { href: "/mocks", label: "Mock Tests", icon: Target },
      { href: "/pathways", label: "Exam Pathways", icon: MapPin },
    ],
  },
];

const parentItem: NavItem = {
  href: "/parent",
  label: "Parent Hub",
  icon: Users,
  badge: "Beta",
};

const supportItems: NavItem[] = [
  { href: "/getting-started", label: "Getting Started", icon: HelpCircle },
  { href: "/feedback", label: "Send Feedback", icon: MessageSquare },
  { href: "/testimonial", label: "Share Experience", icon: Sparkles },
  { href: "/contact", label: "Contact", icon: Mail },
];

const mobileNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/english", label: "English", icon: BookOpen },
  { href: "/maths", label: "Maths", icon: Calculator },
  { href: "/mocks", label: "Exams", icon: Target },
  { href: "/progress", label: "Progress", icon: BarChart2 },
];

function SidebarLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
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
          {navSections.map((section, idx) => (
            <div
              key={section.label}
              className={idx > 0 ? "mt-1 pt-2 border-t border-gray-100 dark:border-gray-800" : ""}
            >
              <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-600">
                {section.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <SidebarLink key={item.href} item={item} pathname={pathname} />
                ))}
              </div>
            </div>
          ))}

          {/* Parent Area — separated at bottom of nav list */}
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-600">
              Parent Area
            </p>
            <SidebarLink item={parentItem} pathname={pathname} />
          </div>

          {/* Support — beta & help links */}
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
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

        {/* User auth — pinned at very bottom */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          {!loading && user ? (
            <div className="px-3 py-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
                  <User size={14} className="text-purple-600 dark:text-purple-300" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate flex-1">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 py-1.5 px-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          ) : (
            <div className="px-3 py-1">
              <Link
                href="/login"
                className="flex items-center gap-2 w-full text-xs text-purple-600 dark:text-purple-400 font-medium py-1.5 px-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors"
              >
                <LogIn size={13} />
                Sign in to sync progress
              </Link>
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-1 px-2">Powered by Angel Digital</p>
            </div>
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
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg min-w-[52px] transition-colors ${
                  active ? "text-purple-700" : "text-gray-400"
                }`}
              >
                <Icon size={20} className={active ? "text-purple-600" : "text-gray-400"} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
          {/* Parent / login */}
          <Link
            href={user ? "/parent" : "/login"}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg min-w-[52px] transition-colors ${
              pathname === "/parent" || pathname === "/login" ? "text-purple-700" : "text-gray-400"
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
