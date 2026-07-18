"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Sprint 2 (Platform Shell) — a minimal, dependency-free popover used by the
 * new Header for the notification and user-menu triggers. No new dependency
 * added (Reuse Before Rebuild extends to tooling): plain useState + a
 * click-outside/Escape listener, the same level of mechanism this codebase
 * already uses elsewhere (e.g. PremiumLoader's own setTimeout-driven state).
 */
interface PopoverProps {
  trigger: (props: { onClick: () => void; "aria-expanded": boolean; "aria-haspopup": "dialog" }) => ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  label: string;
}

export default function Popover({ trigger, children, align = "right", label }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {trigger({ onClick: () => setOpen((v) => !v), "aria-expanded": open, "aria-haspopup": "dialog" })}
      {open && (
        <div
          role="dialog"
          aria-label={label}
          className={`absolute z-50 mt-2 ${align === "right" ? "right-0" : "left-0"}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
