"use client";

import { useEffect, useRef, useState } from "react";
import { getSelectedPathwayId } from "@/lib/progress";
import { getRealPathways, isRealPathway, switchActivePathway, type RealPathwayId } from "@/lib/activePathway";
import PathwaySwitchConfirmDialog from "@/components/PathwaySwitchConfirmDialog";
import type { Pathway } from "@/types/pathway";

/**
 * Active Pathway Context — the compact top-bar target switcher (Section 5).
 * Deliberately restrained: plain text label, no per-pathway colour fill,
 * per Section 12's colour-role guidance ("pathway identity should
 * primarily come from name/context, not a rainbow of card colours"). Never
 * lists Core Foundation or Not Sure Yet (getRealPathways() excludes them).
 *
 * SSR-safe deferred read, same pattern as Navigation.tsx's useCssePathway().
 *
 * Deliberately uses plain text glyphs instead of lucide-react icons: this
 * component sits inside Navigation.tsx, which already imports a large
 * number of icons from lucide-react. Confirmed by direct, repeated,
 * cache-cleared build+production testing that importing lucide-react
 * icons here (even a single, otherwise-unused one) causes the entire page
 * tree to render twice client-side — a genuine bundler-level defect in
 * this project's Next.js 16 / Turbopack setup, not a logic bug in this
 * component. See AGENTS.md's own warning that this Next.js version has
 * undocumented breaking changes from the version most training data
 * assumes. Avoiding the import sidesteps the defect entirely.
 */
export default function PathwaySwitcher() {
  const [currentId, setCurrentId] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Pathway | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    Promise.resolve().then(() => setCurrentId(getSelectedPathwayId()));
  }, []);

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

  const realPathways = getRealPathways();
  const current = isRealPathway(currentId) ? realPathways.find((p) => p.id === currentId) : undefined;

  async function handlePick(pathway: Pathway) {
    setOpen(false);
    if (pathway.id === current?.id) return;
    if (current) {
      // A real pathway is already active — this is a genuine switch, not a
      // first choice. Section 6: must be deliberate, not a single click.
      setConfirmTarget(pathway);
      return;
    }
    // No real pathway active yet — nothing to lose, apply immediately.
    // Awaited (capped at 1.5s inside switchActivePathway): a fire-and-forget
    // write here raced the reload below and always lost, confirmed directly
    // against the database — the client-side switch succeeded every time
    // but the server row never updated, since page unload aborts an
    // in-flight fetch.
    await switchActivePathway(pathway.id as RealPathwayId);
    // Full reload, not router.push: Navigation.tsx's own useCssePathway()
    // reads the pathway once on mount only (empty deps) since it is a
    // persistent layout component that never remounts on a client-side
    // route change. A soft push would leave Learn/Practise nav links (and
    // any other pathway-branched UI already on screen) stale until the
    // next full reload. Confirmed by direct testing, not theoretical.
    // eslint-disable-next-line react-hooks/immutability -- deliberate full navigation inside an event handler, not a render-time mutation.
    window.location.href = "/dashboard";
  }

  async function handleConfirmSwitch() {
    if (!confirmTarget) return;
    await switchActivePathway(confirmTarget.id as RealPathwayId);
    window.location.href = "/dashboard";
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 h-11 px-3 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 transition-colors motion-reduce:transition-none"
      >
        <span aria-hidden="true" className="shrink-0">📍</span>
        <span className="hidden lg:inline">Target:</span>
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          {current ? current.shortName : "Choose target"}
        </span>
        <span aria-hidden="true" className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-1.5 z-50"
        >
          <p className="px-2.5 pt-1.5 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            {current ? "Change target" : "Choose your target"}
          </p>
          {realPathways.map((pathway) => (
            <button
              key={pathway.id}
              role="menuitem"
              onClick={() => handlePick(pathway)}
              className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span>{pathway.name}</span>
              {pathway.id === current?.id && <span aria-hidden="true" className="text-purple-600 dark:text-purple-400 shrink-0">✓</span>}
            </button>
          ))}
        </div>
      )}

      {confirmTarget && current && (
        <PathwaySwitchConfirmDialog
          from={current}
          to={confirmTarget}
          onCancel={() => setConfirmTarget(null)}
          onConfirm={handleConfirmSwitch}
        />
      )}
    </div>
  );
}
