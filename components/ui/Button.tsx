"use client";

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Sprint 1 (Angel V2.0 Enterprise UI Foundation) — Button System.
 * Consolidates the button treatments already documented per-usage
 * (DESIGN_SYSTEM.md §4: Primary/Secondary/Ghost/Success/Warning CTA) into
 * one real, reusable component — every variant below reuses those exact
 * existing colour/radius/motion classes, none is a new visual treatment.
 * "Danger" reuses the existing Warning Button's red/rose family already
 * used for destructive actions (Report a Bug's submit button); "Outline"
 * formalises the existing Ghost Button pattern's bordered-only treatment
 * under the more conventional enterprise name.
 */
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * AN-108 had recoloured "primary" from purple to a deep forest green, then
 * a later pass moved it to blue-600 (this component's own de facto choice
 * even while `--color-primary` in `app/globals.css` was still purple at the
 * time — a real, if minor, pre-existing inconsistency, not introduced by
 * the Zero-Purple pass). Zero-Purple pass (2026-08-31, Founder directive):
 * purple/violet/indigo retired Angel-wide; blue-600 is now also the token
 * layer's own `--color-primary` value, so this component's colour and the
 * token finally agree — see ANGEL_DESIGN_LANGUAGE.md §0a for the full
 * decision record. blue-600 against white is ~5.17:1, comfortably AA for
 * normal text; used as the base shade in both modes.
 */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-sm",
  secondary:
    "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300",
  outline:
    "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 bg-transparent",
  ghost:
    "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 bg-transparent",
  danger:
    "bg-red-500 hover:bg-red-600 text-white shadow-sm",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-xs rounded-lg gap-1.5",
  md: "px-5 py-3 text-sm rounded-xl gap-2",
  lg: "px-6 py-3.5 text-base rounded-xl gap-2.5",
};

const ICON_ONLY_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "p-2 rounded-lg",
  md: "p-3 rounded-xl",
  lg: "p-3.5 rounded-xl",
};

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Renders as a square icon-only button (ICON_ONLY_SIZE_CLASSES) — `children` must be a single icon in this mode, and `aria-label` becomes required for accessibility (no visible text to name the action). */
  iconOnly?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export type ButtonProps = BaseButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> &
  (
    | { iconOnly: true; "aria-label": string }
    | { iconOnly?: false | undefined }
  );

/**
 * Loading and disabled are both real, distinct states, not just a style:
 * `loading` forces `disabled` (a loading action cannot be re-triggered) and
 * swaps in the existing spinner treatment already used at /login ("Sending
 * link…"), not a new spinner design.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, iconOnly = false, leftIcon, rightIcon, disabled, className, children, ...rest },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        iconOnly ? ICON_ONLY_SIZE_CLASSES[size] : SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className
      )}
      {...rest}
    >
      {loading ? (
        <span
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      ) : (
        leftIcon
      )}
      {!iconOnly && children}
      {iconOnly && !loading && children}
      {!loading && !iconOnly && rightIcon}
    </button>
  );
});

export default Button;

interface ButtonLinkProps extends BaseButtonProps, AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

/**
 * Sprint 3 (Admission Journey Experience) — a navigation-flavoured sibling
 * to `Button`, added because the Quick Actions section needs real Next.js
 * client-side routing (`next/link`), not a full page reload via
 * `window.location`, and a `<button>` cannot legally nest inside an `<a>`.
 * Reuses `VARIANT_CLASSES`/`SIZE_CLASSES` from `Button` directly — this is
 * the same visual system, not a second button design.
 */
export function ButtonLink({ variant = "primary", size = "md", leftIcon, rightIcon, className, children, href, ...rest }: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-colors active:scale-[0.98]",
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className
      )}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}
