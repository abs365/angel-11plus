import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Sprint 1 (Angel V2.0 Enterprise UI Foundation) — Typography System.
 * Extends, not replaces, the existing scale (DESIGN_SYSTEM.md §1, confirmed
 * still correct by ANGEL_DESIGN_LANGUAGE.md §1's audit): `display`, `h1`,
 * `h2`, `h3`, `body`, `small`, `micro` already existed. This adds the four
 * named levels the enterprise scale requires that had no formal home yet —
 * `h4`, `bodyLg`, `caption`, `button`, `label` — as sensible interpolations
 * consistent with the existing scale's own size/weight/line-height ratios,
 * not arbitrary new values. Every existing level keeps its exact prior
 * classes.
 */
export type TypographyVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "bodyLg"
  | "body"
  | "bodySm"
  | "caption"
  | "button"
  | "label";

const VARIANT_CLASSES: Record<TypographyVariant, string> = {
  display: "text-3xl font-bold leading-tight",        // existing `display` — unchanged
  h1: "text-2xl font-bold leading-snug",               // existing `h1` — unchanged
  h2: "text-xl font-bold leading-snug",                // existing `h2` — unchanged
  h3: "text-base font-bold leading-normal",            // existing `h3` — unchanged
  h4: "text-sm font-bold leading-normal",              // new — one step below h3, same weight
  bodyLg: "text-base font-normal leading-relaxed",     // new — one step above body
  body: "text-sm font-normal leading-relaxed",         // existing `body` — unchanged
  bodySm: "text-xs font-normal leading-normal",        // existing `small` — unchanged, renamed for the enterprise scale
  caption: "text-xs font-medium leading-normal text-[var(--text-tertiary)]", // new — muted metadata text
  button: "text-sm font-semibold leading-none",        // new — matches existing button label sizing across the Button System
  label: "text-[10px] font-bold uppercase tracking-widest leading-none", // existing `micro` — unchanged, renamed for the enterprise scale
};

const DEFAULT_ELEMENT: Record<TypographyVariant, ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  bodyLg: "p",
  body: "p",
  bodySm: "p",
  caption: "p",
  button: "span",
  label: "span",
};

interface TypographyProps {
  variant: TypographyVariant;
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

/**
 * Responsive scaling: `display`/`h1` step down one size on mobile, matching
 * the existing mobile-sizing rule (DESIGN_SYSTEM.md §1 — "Page titles:
 * text-xl on mobile, text-2xl on md+"). Every other level is already
 * comfortably readable unchanged at every width, per the same existing rule.
 */
const RESPONSIVE_OVERRIDE: Partial<Record<TypographyVariant, string>> = {
  display: "text-2xl md:text-3xl",
  h1: "text-xl md:text-2xl",
};

export default function Typography({ variant, children, className, as }: TypographyProps) {
  const Element = as ?? DEFAULT_ELEMENT[variant];
  const responsive = RESPONSIVE_OVERRIDE[variant];
  const base = responsive ? VARIANT_CLASSES[variant].replace(/text-\S+/, responsive) : VARIANT_CLASSES[variant];

  return <Element className={cn(base, className)}>{children}</Element>;
}
