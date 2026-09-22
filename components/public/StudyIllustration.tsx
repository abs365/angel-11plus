/**
 * Hero visual. Increment 1A dropped the heavy rounded/bordered card
 * treatment; Increment 1B (Final Visual Finish) enlarges the slot itself —
 * the Founder's review of the 1A production screenshots found the image
 * area too small relative to the surrounding whitespace, making the hero
 * feel unfinished. This removes the `max-w-sm` cap so the slot fills its
 * full grid column (see app/page.tsx's hero, `md:col-span-5` of a
 * `max-w-7xl` container) and softens the corner radius slightly
 * (`rounded-xl` → `rounded-lg`) for a calmer, less "card" edge, per the
 * governing instruction's explicit "avoid a photo frame that looks like a
 * card" direction (no thick border, no shadow, no decorative treatment
 * behind it).
 *
 * PHOTOGRAPHY-READY, STILL NOT A PERMANENT ASSET. This remains an original,
 * hand-authored SVG — no licensed photograph exists yet (governing
 * instruction §3/§10/§23). The container is built to the exact spec a real
 * photograph should use, so replacing this component's contents with a
 * `next/image` inside the same wrapper is a one-line change, never a
 * layout restructure:
 *
 *   - Aspect ratio: 4:5 portrait on tablet/desktop, 4:3 landscape on mobile
 *     (`aspect-[4/5] max-sm:aspect-[4/3]`, already implemented below).
 *   - Desktop container size: fills `md:col-span-5` of the hero's
 *     `max-w-7xl` grid — roughly 480-620px wide at typical desktop
 *     viewports (1280-1920px), height following from the 4:5 ratio
 *     (~600-780px). Not a fixed pixel box; it scales with the column.
 *   - Tablet (≈768-1023px, still `md:` and up): same 4:5 ratio, narrower
 *     column width (the hero's two columns are more even at this range),
 *     roughly 300-380px wide.
 *   - Mobile (<768px): full-width, 4:3 landscape crop (shorter, wider —
 *     avoids an overly tall image pushing the CTAs far down the page).
 *   - Recommended source resolution: at least 2400x3000px, so one file
 *     covers both crops without upscaling.
 *   - Safe subject area: keep the child and their work within the centre
 *     80% of the frame on all sides, so neither the 4:5 nor the 4:3 crop
 *     (nor a future focal-point adjustment) cuts them off.
 *   - object-fit / object-position: `object-fit: cover`,
 *     `object-position: center 30%` — biases the crop toward the upper
 *     third, where a child's face/hands doing the work will usually sit,
 *     rather than a dead-centre crop that risks cutting the top of the
 *     frame.
 *   - Format/loading: WebP/AVIF via `next/image`, `priority` (above the
 *     fold), a real `sizes` attribute matching the column's actual
 *     rendered width, `placeholder="blur"` once the asset exists. Target
 *     file weight under ~150KB optimised.
 */
export default function StudyIllustration() {
  return (
    <div
      role="img"
      aria-label="An open book with a pencil resting across the pages"
      className="aspect-[4/5] max-sm:aspect-[4/3] w-full rounded-lg bg-[var(--angel-ivory)] flex items-center justify-center p-8 md:p-10"
    >
      <svg viewBox="0 0 480 320" className="w-full h-auto" aria-hidden="true" focusable="false">
        {/* Left page */}
        <polygon points="240,58 78,92 78,256 240,278" fill="#ffffff" stroke="#14213D" strokeWidth="3" strokeLinejoin="round" />
        {/* Right page */}
        <polygon points="240,58 402,92 402,256 240,278" fill="#ffffff" stroke="#14213D" strokeWidth="3" strokeLinejoin="round" />
        {/* Spine */}
        <line x1="240" y1="58" x2="240" y2="278" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />

        {/* Left page text lines */}
        <line x1="104" y1="122" x2="206" y2="112" stroke="#9ca3af" strokeWidth="4" strokeLinecap="round" />
        <line x1="102" y1="148" x2="208" y2="140" stroke="#9ca3af" strokeWidth="4" strokeLinecap="round" />
        <line x1="100" y1="174" x2="210" y2="168" stroke="#9ca3af" strokeWidth="4" strokeLinecap="round" />
        <line x1="99" y1="200" x2="196" y2="196" stroke="#9ca3af" strokeWidth="4" strokeLinecap="round" />

        {/* Right page text lines (mirrored) */}
        <line x1="274" y1="112" x2="376" y2="122" stroke="#9ca3af" strokeWidth="4" strokeLinecap="round" />
        <line x1="272" y1="140" x2="378" y2="148" stroke="#9ca3af" strokeWidth="4" strokeLinecap="round" />
        <line x1="270" y1="168" x2="380" y2="174" stroke="#9ca3af" strokeWidth="4" strokeLinecap="round" />
        <line x1="284" y1="196" x2="381" y2="200" stroke="#9ca3af" strokeWidth="4" strokeLinecap="round" />

        {/* Pencil, resting diagonally across the right page */}
        <g transform="rotate(-38 300 190)">
          <rect x="230" y="182" width="150" height="16" rx="5" fill="#C58A2A" />
          <polygon points="380,182 402,190 380,198" fill="#f3d19a" />
          <polygon points="392,186 402,190 392,194" fill="#3f3f46" />
          <rect x="230" y="182" width="14" height="16" rx="3" fill="#14213D" />
        </g>
      </svg>
    </div>
  );
}
