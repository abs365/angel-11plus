"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Below this rendered width (px) the structured-stimulus figures switch to a phone layout whose SVG user units are
 * (about) real pixels, so axis, tick and value text stays at a readable size instead of shrinking with the viewBox.
 * At or above it the original desktop/tablet geometry is used unchanged (it already renders at 11px or more).
 */
export const NARROW_FIGURE_MAX = 420;

/** Smallest rendered SVG text (px) the phone layouts aim for. */
export const MIN_FIGURE_TEXT_PX = 10;

/** Measures the width of the element the ref is attached to. `null` until measured (server render, first paint), which callers treat as "desktop layout". */
export function useFigureWidth() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(Math.round(el.getBoundingClientRect().width));
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** True when a measured width calls for the phone layout. */
export const isNarrowFigure = (width: number | null): width is number => width !== null && width > 0 && width < NARROW_FIGURE_MAX;
