"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  BarChart2,
  Compass,
  LogIn,
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
  ChevronDown,
  MoreHorizontal,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import UserMenu from "@/components/ui/UserMenu";
import PathwaySwitcher from "@/components/PathwaySwitcher";
import { cn } from "@/lib/cn";
import { getSelectedPathwayId } from "@/lib/progress";

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

/**
 * New Learner Experience Migration — top navigation. Replaces the AN-101
 * permanent left sidebar (see NEW_ANGEL_INFORMATION_ARCHITECTURE.md). Five
 * primary items now, not four: Progress is promoted from the old "Journey"
 * group to a primary top-level destination, matching the governing
 * instruction's named top nav (Today/Learn/Practise/Mock/Progress).
 *
 * "Today" is the single entry for /dashboard — unchanged reasoning from
 * AN-101 (no separate "My Admission Journey" route exists; the admissions
 * journey stays a concept within /dashboard's content).
 *
 * Learn/Practise are pathway-branching (see useCssePathway() below): a CSSE-
 * pathway learner is routed to the new evidence-safe destinations; every
 * other pathway continues to reach the existing /learn and /reasoning hubs
 * completely unchanged — see LEGACY_CONTENT_RETIREMENT_REGISTER.md §4 for
 * why this is deliberately conservative rather than a wholesale retirement.
 */
const CSSE_LEARN_HREF = "/learning-intelligence/learn";
const CSSE_PRACTISE_HREF = "/learning-intelligence/practice";

function primaryItemsFor(isCsse: boolean): NavItem[] {
  return [
    { href: "/dashboard", label: "Today", icon: Compass },
    { href: isCsse ? CSSE_LEARN_HREF : "/learn", label: "Learn", icon: BookOpen },
    { href: isCsse ? CSSE_PRACTISE_HREF : "/reasoning", label: "Practise", icon: Puzzle },
    { href: "/mocks", label: "Mock", icon: Trophy },
    { href: "/progress", label: "Progress", icon: BarChart2 },
  ];
}

/**
 * SSR-safe pathway read (New Learner Experience Migration). getSelectedPathwayId()
 * reads localStorage, which is unavailable during server rendering — reading
 * it directly during render would make the server-rendered Learn/Practise
 * hrefs disagree with the client's real value on first paint. Defaulting to
 * `false` (non-CSSE, i.e. today's unchanged /learn and /reasoning hrefs) for
 * the server render and the client's first render keeps both identical;
 * the real value is applied one client-only render later, the standard-safe
 * pattern for this class of hydration mismatch.
 */
function useCssePathway(): boolean {
  const [isCsse, setIsCsse] = useState(false);
  useEffect(() => {
    // Deferred via a resolved microtask, matching this codebase's established
    // pattern for a post-mount external-value read (e.g. CssePathwayParentContent's
    // getSelectedPathwayId() usage) — avoids a synchronous setState directly in
    // the effect body.
    Promise.resolve().then(() => setIsCsse(getSelectedPathwayId() === "csse"));
  }, []);
  return isCsse;
}

const journeySection: NavSection = {
  label: "Journey",
  items: [
    // Product Experience Standard V1 §7 — "Learning Intelligence" used a
    // word this platform's calm-tone rule forbids showing to users;
    // route/component names are unchanged, only this label reads plainly.
    { href: "/learning-intelligence", label: "Learning Report", icon: Brain },
    { href: "/pathways", label: "School Intelligence", icon: MapPin },
  ],
};

const familySection: NavSection = {
  label: "Family",
  items: [
    // FD-020 (Sprint 4 Completion Package, WP4B) — /learning-intelligence/parent
    // is the single, unified Parent Dashboard for every pathway.
    { href: "/learning-intelligence/parent", label: "Parent Dashboard", icon: Users },
    // Angel Plus tier has no premium features, billing or business logic
    // anywhere in this codebase — the "Soon" badge is honest, not a fabricated feature list.
    { href: "/angel-plus", label: "Angel Plus", icon: Crown, badge: "Soon" },
  ],
};

const supportItems: NavItem[] = [
  { href: "/getting-started", label: "Getting Started", icon: HelpCircle },
  { href: "/feedback", label: "Send Feedback", icon: MessageSquare },
  { href: "/testimonial", label: "Share Experience", icon: Sparkles },
  { href: "/contact", label: "Contact", icon: Mail },
];

function isActive(pathname: string, href: string): boolean {
  const basePath = href.split("#")[0];
  return pathname === basePath || pathname.startsWith(basePath + "/");
}

/**
 * A single navigation destination. Renders identically inside the desktop
 * sidebar and the mobile "More" drawer — one definition, not two hand-kept-
 * in-sync copies (AN-101 discovery found the pre-existing desktop/mobile nav
 * arrays had exactly that problem).
 *
 * `collapsed` (tablet icon-rail, 768–1023px) keeps the label in the
 * accessibility tree at all times via the sr-only/not-sr-only toggle below —
 * true `display:none` would remove a screen reader's only copy of the
 * destination's name at that width, which a plain responsive-hidden span
 * would have done.
 */
function SidebarLink({
  item,
  pathname,
  collapsed = false,
}: {
  item: NavItem;
  pathname: string;
  collapsed?: boolean;
}) {
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 h-[var(--nav-item-height)] px-3 rounded-[var(--nav-radius)] text-sm transition-colors motion-reduce:transition-none",
        collapsed && "md:justify-center md:px-0",
        active
          ? "font-semibold"
          : "font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200"
      )}
      style={
        active
          ? { backgroundColor: "var(--nav-accent-soft-bg)", color: "var(--nav-accent-soft-text)" }
          : undefined
      }
    >
      <item.icon
        aria-hidden="true"
        className={cn(
          "w-[var(--nav-icon-size)] h-[var(--nav-icon-size)] shrink-0",
          !active && "text-gray-400 dark:text-gray-500"
        )}
        style={active ? { color: "var(--nav-accent-soft-text)" } : undefined}
      />
      <span className={cn("flex-1", collapsed && "md:sr-only lg:not-sr-only")}>{item.label}</span>
      {item.badge && (
        <span
          className={cn(
            "text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full leading-none",
            collapsed && "hidden lg:inline-block"
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function SectionGroup({
  section,
  pathname,
  collapsed = false,
  bordered = true,
}: {
  section: NavSection;
  pathname: string;
  collapsed?: boolean;
  bordered?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={section.label}
      className={bordered ? "mt-2 pt-3 border-t border-gray-100 dark:border-gray-800" : ""}
    >
      <p
        className={cn(
          "px-3 pb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400",
          collapsed && "hidden lg:block"
        )}
      >
        {section.label}
      </p>
      <div className="flex flex-col gap-0.5">
        {section.items.map((item) => (
          <SidebarLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
        ))}
      </div>
    </div>
  );
}

/**
 * Help and support — Step 3's approved consolidation of four permanently-
 * visible links into one calm, collapsed-by-default entry. Uses the native
 * <details>/<summary> disclosure rather than hand-built expand/collapse
 * state: it is keyboard-operable (Enter/Space on the focused summary),
 * self-announcing to screen readers ("button, collapsed"/"expanded" —
 * no manual ARIA needed), and requires no new dependency or custom logic —
 * Reuse Before Rebuild extended to a native HTML primitive instead of a
 * hand-rolled one.
 */
function HelpSupportDisclosure({ pathname, collapsed = false }: { pathname: string; collapsed?: boolean }) {
  return (
    <details className="group/details mt-2 pt-3 border-t border-gray-100 dark:border-gray-800">
      <summary
        className={cn(
          "flex items-center gap-3 h-[var(--nav-item-height)] px-3 rounded-[var(--nav-radius)] text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 transition-colors motion-reduce:transition-none cursor-pointer list-none [&::-webkit-details-marker]:hidden",
          collapsed && "md:justify-center md:px-0"
        )}
        title={collapsed ? "Help and support" : undefined}
      >
        <HelpCircle aria-hidden="true" className="w-[var(--nav-icon-size)] h-[var(--nav-icon-size)] shrink-0 text-gray-400 dark:text-gray-500" />
        <span className={cn("flex-1", collapsed && "md:sr-only lg:not-sr-only")}>Help and support</span>
        <ChevronDown
          aria-hidden="true"
          size={15}
          className={cn(
            "shrink-0 text-gray-400 dark:text-gray-500 transition-transform motion-reduce:transition-none group-open/details:rotate-180",
            collapsed && "hidden lg:block"
          )}
        />
      </summary>
      <div className={cn("flex flex-col gap-0.5 mt-0.5", !collapsed && "pl-1")}>
        {supportItems.map((item) => (
          <SidebarLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
        ))}
      </div>
    </details>
  );
}

/**
 * Mobile "More" drawer — reaches every destination the 4-tab bottom bar
 * can't fit (Journey, Family, Help and support, Account). Step 6/7 require
 * real keyboard open/close/escape behaviour, background-scroll prevention
 * and focus restoration for whatever opens it — implemented directly
 * (useState + a scoped keydown/focus-trap listener) rather than via
 * components/ui/Popover.tsx, which is an anchored dropdown, not a full-
 * height modal sheet; the escape-to-close mechanism below is deliberately
 * the same shape as Popover's own (Reuse Before Rebuild extended to pattern,
 * not just code, where the component itself doesn't fit).
 */
function MobileMoreDrawer({
  open,
  onClose,
  pathname,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    onClose();
    router.push("/dashboard");
  }

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const triggerEl = triggerRef.current;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      triggerEl?.focus();
    };
  }, [open, onClose, triggerRef]);

  if (!open) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50">
      <button
        aria-label="Close navigation"
        onClick={onClose}
        className="absolute inset-0 w-full h-full bg-black/40"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="More navigation"
        className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-950 rounded-t-2xl border-t border-gray-100 dark:border-gray-800 px-3 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-between px-2 pb-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">More</span>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors motion-reduce:transition-none"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Active Pathway Context — discoverable on mobile too (Section 19),
            without crowding the fixed bottom-tab bar. */}
        <div className="px-1 pb-2 mb-1 border-b border-gray-100 dark:border-gray-800">
          <PathwaySwitcher />
        </div>

        <SectionGroup section={journeySection} pathname={pathname} bordered={false} />
        <SectionGroup section={familySection} pathname={pathname} />
        <HelpSupportDisclosure pathname={pathname} />

        <div className="mt-2 pt-3 border-t border-gray-100 dark:border-gray-800">
          <UserMenu email={user?.email} loading={loading} onSignOut={handleSignOut} />
        </div>
      </div>
    </div>
  );
}

/**
 * Desktop/tablet top-bar destination — New Learner Experience Migration's
 * replacement for the collapsed-rail SidebarLink usage. Larger type and a
 * taller click target than the old sidebar rows, per the governing
 * instruction's typography/touch-target direction.
 *
 * Stage 2 (tablet navigation correction) — reuses SidebarLink's existing,
 * previously-unwired `collapsed` (768–1023px icon-rail) pattern verbatim
 * rather than inventing a second one: same `md:`-to-`lg:` icon-only band,
 * same sr-only/not-sr-only label toggle so the accessible name never
 * disappears, same `title` tooltip. Founder real-device evidence showed
 * "Progress" clipped to "Progr" at tablet width — root cause was this
 * primary row's items each having no `shrink-0`/`whitespace-nowrap`, so a
 * shrunk flex item wrapped its label onto a second line that the row's
 * fixed h-11 then clipped. `shrink-0` + `whitespace-nowrap` close that
 * structurally, and the icon-only band removes the crowding that forced
 * the shrink in the first place.
 */
function TopBarLink({ item, pathname, collapsed = false }: { item: NavItem; pathname: string; collapsed?: boolean }) {
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-2 h-11 px-3.5 rounded-xl text-[15px] shrink-0 transition-colors motion-reduce:transition-none",
        collapsed && "md:justify-center md:px-0 md:w-11 lg:w-auto lg:px-3.5",
        active
          ? "font-semibold"
          : "font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200"
      )}
      style={
        active
          ? { backgroundColor: "var(--nav-accent-soft-bg)", color: "var(--nav-accent-soft-text)" }
          : undefined
      }
    >
      <item.icon
        aria-hidden="true"
        size={19}
        className={cn("shrink-0", !active && "text-gray-400 dark:text-gray-500")}
        style={active ? { color: "var(--nav-accent-soft-text)" } : undefined}
      />
      <span className={cn("whitespace-nowrap", collapsed && "md:sr-only lg:not-sr-only")}>{item.label}</span>
      {item.badge && (
        <span
          className={cn(
            "text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full leading-none",
            collapsed && "hidden lg:inline-block"
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

/**
 * Overflow menu — School Intelligence, Angel Plus, Help/support. Kept
 * reachable but deliberately not competing visually with the 5 primary
 * daily-journey items, per the governing instruction's explicit direction.
 */
function MoreMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current?.contains(e.target as Node) || buttonRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const allItems = [...journeySection.items, ...familySection.items.filter((i) => i.href !== "/learning-intelligence/parent"), ...supportItems];

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 h-11 px-3 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 transition-colors motion-reduce:transition-none"
      >
        More
        <ChevronDown aria-hidden="true" size={15} className={cn("transition-transform motion-reduce:transition-none", open && "rotate-180")} />
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-1.5 z-50"
        >
          {allItems.map((item) => (
            <SidebarLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const moreTabRef = useRef<HTMLButtonElement>(null);
  const isCsse = useCssePathway();
  const primaryItems = primaryItemsFor(isCsse);

  async function handleSignOut() {
    await signOut();
    router.push("/dashboard");
  }

  return (
    <>
      {/* Desktop/tablet top bar — New Learner Experience Migration's
          replacement for the permanent left sidebar. Reclaims the ~256px of
          horizontal width the sidebar previously consumed on every page. */}
      <nav
        aria-label="Learning navigation"
        className="hidden md:flex items-center h-[var(--topbar-height)] w-full bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 px-4 lg:px-6 fixed left-0 top-0 z-40 gap-2 lg:gap-4"
      >
        {/* Brand — Final Visual Refinement: this is navigation chrome, not
            page content, so it must never be an <h1>. It was one before
            this pass, which meant every page had two level-1 headings (this
            plus the page's own real h1) — a genuine accessibility defect,
            not a false positive. A <span> inside the brand <Link> carries
            the same accessible name (via the link's text content) without
            asserting a document-structure claim it doesn't own. Colour
            corrected from indigo (the navigation/wayfinding accent) to
            purple — the brand mark is Angel's identity, not a nav state,
            per the Founder's "PURPLE = Angel brand identity" direction. */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0 mr-1 lg:mr-2">
          <span className="text-xl font-bold text-purple-700 dark:text-purple-400">
            <span className="lg:hidden" aria-hidden="true">A11+</span>
            <span className="hidden lg:inline">Angel 11+</span>
          </span>
        </Link>

        {/* Primary — the 5 daily-journey destinations */}
        <div role="group" aria-label="Primary" className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto">
          {primaryItems.map((item) => (
            <TopBarLink key={item.href} item={item} pathname={pathname} collapsed />
          ))}
        </div>

        {/* Active Pathway Context — compact target switcher, not a
            catalogue; sits alongside the 5 primary items, never replacing
            them or restoring a permanent sidebar (Section 5). */}
        <div className="hidden md:block shrink-0">
          <PathwaySwitcher />
        </div>

        {/* Parent access — clearly available, not buried, per governing instruction */}
        <Link
          href="/learning-intelligence/parent"
          className="hidden lg:flex items-center gap-1.5 h-11 px-3.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 transition-colors motion-reduce:transition-none shrink-0"
        >
          <Users size={18} aria-hidden="true" />
          Parent Dashboard
        </Link>
        <Link
          href="/learning-intelligence/parent"
          aria-label="Parent Dashboard"
          title="Parent Dashboard"
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors motion-reduce:transition-none shrink-0"
        >
          <Users size={18} aria-hidden="true" />
        </Link>

        <MoreMenu pathname={pathname} />

        {/* Account — right edge */}
        <div className="shrink-0 pl-2 ml-1 border-l border-gray-100 dark:border-gray-800">
          {!loading && user ? (
            <button
              onClick={handleSignOut}
              title={`Signed in as ${user.email}. Sign out`}
              aria-label={`Signed in as ${user.email}. Sign out`}
              className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center text-sky-700 dark:text-sky-300 text-sm font-semibold hover:bg-sky-200 dark:hover:bg-sky-800 transition-colors motion-reduce:transition-none"
            >
              {user.email?.[0]?.toUpperCase() ?? "?"}
            </button>
          ) : (
            !loading && (
              <Link
                href="/login"
                title="Sign in"
                aria-label="Sign in"
                className="w-10 h-10 rounded-full flex items-center justify-center text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950 transition-colors motion-reduce:transition-none"
              >
                <LogIn size={18} aria-hidden="true" />
              </Link>
            )
          )}
        </div>
      </nav>

      {/* Mobile bottom nav — the five primary daily actions plus "More" for
          everything else. Parent Dashboard and Account remain in the More
          drawer at this width: family/support capabilities shouldn't
          compete visually with the child's immediate learning actions, so
          the fixed tabs stay purely about today's practice. */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 px-1 pb-safe"
      >
        <div className="flex justify-around items-center h-16">
          {primaryItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[52px] transition-colors motion-reduce:transition-none",
                  active ? "font-semibold" : "text-gray-400"
                )}
                style={active ? { backgroundColor: "var(--nav-accent-soft-bg)", color: "var(--nav-accent-soft-text)" } : undefined}
              >
                <Icon size={20} aria-hidden="true" className={active ? undefined : "text-gray-400"} style={active ? { color: "var(--nav-accent-soft-text)" } : undefined} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
          <button
            ref={moreTabRef}
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            aria-haspopup="dialog"
            aria-controls="mobile-more-drawer"
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[52px] text-gray-400 transition-colors motion-reduce:transition-none"
          >
            <MoreHorizontal size={20} aria-hidden="true" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      <div id="mobile-more-drawer">
        <MobileMoreDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} pathname={pathname} triggerRef={moreTabRef} />
      </div>
    </>
  );
}
