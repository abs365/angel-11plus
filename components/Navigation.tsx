"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Calculator,
  Pencil,
  BookMarked,
  BarChart2,
  ClipboardList,
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/english", label: "English", icon: BookOpen },
  { href: "/maths", label: "Maths", icon: Calculator },
  { href: "/vocabulary", label: "Vocab", icon: BookMarked },
  { href: "/writing", label: "Writing", icon: Pencil },
  { href: "/mock-test", label: "Mock", icon: ClipboardList },
  { href: "/progress", label: "Progress", icon: BarChart2 },
  { href: "/parent", label: "Parent", icon: Users, sidebarOnly: true, badge: "Beta" },
];

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
      <nav className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 px-4 py-6 fixed left-0 top-0 z-40">
        <div className="mb-8 px-2">
          <h1 className="text-xl font-bold text-purple-700">Angel 11+</h1>
          <p className="text-xs text-gray-400 mt-0.5">Selective School Prep</p>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          {navItems.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-purple-50 text-purple-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <Icon
                  size={18}
                  className={active ? "text-purple-600" : "text-gray-400"}
                />
                {label}
                {badge && (
                  <span className="text-[9px] font-semibold bg-purple-100 text-purple-500 px-1.5 py-0.5 rounded-full leading-none">
                    {badge}
                  </span>
                )}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500" />
                )}
              </Link>
            );
          })}
        </div>

        {/* User section */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          {!loading && user ? (
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <User size={14} className="text-purple-600" />
                </div>
                <p className="text-xs text-gray-600 font-medium truncate flex-1">
                  {user.email}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full text-xs text-gray-400 hover:text-gray-700 py-1.5 px-1 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          ) : (
            <div className="px-3 py-2">
              <Link
                href="/login"
                className="flex items-center gap-2 w-full text-xs text-purple-600 font-medium py-1.5 px-2 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <LogIn size={13} />
                Sign in to sync progress
              </Link>
              <p className="text-xs text-gray-300 mt-1 px-2">Powered by Angel Digital</p>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 px-2 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.filter((item) => !item.sidebarOnly).map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg min-w-[44px] transition-colors ${
                  active ? "text-purple-700" : "text-gray-400"
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
          {/* Login / user avatar on mobile */}
          <Link
            href={user ? "/progress" : "/login"}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg min-w-[44px] transition-colors ${
              pathname === "/login" ? "text-purple-700" : "text-gray-400"
            }`}
          >
            {user ? (
              <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                <User size={12} className="text-purple-600" />
              </div>
            ) : (
              <LogIn size={20} />
            )}
            <span className="text-[10px] font-medium">{user ? "Me" : "Login"}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
