/**
 * Increment 1A — Hero visual, revised. Two Founder-directed changes from
 * Increment 1's version:
 *
 * 1. Reduced dominance. Increment 1 wrapped this in a large, heavily
 *    padded, rounded, bordered panel — itself an instance of the exact
 *    "rounded bordered card" pattern the Founder's visual review flagged
 *    as generic-SaaS. This version drops the card treatment entirely: the
 *    illustration sits directly in a fixed-aspect image slot with no
 *    border and a quiet fill, so it reads as an image position, not a
 *    decorative box.
 *
 * 2. PHOTOGRAPHY-READY, NOT A PERMANENT ASSET. This remains an original,
 *    hand-authored SVG (no photograph exists with cleared commercial-use
 *    rights yet — see the governing instruction §10/§23 and the Increment
 *    1A report's Photography section). The wrapping container below is
 *    deliberately built to the exact aspect ratio and crop-safety rules a
 *    real photograph should use, so swapping in a licensed photo later is
 *    a one-line change (replace this component's contents with a
 *    next/image using the same `aspect-[4/5]` container), never a layout
 *    restructure:
 *      - Aspect ratio: 4:5 portrait (matches this slot on desktop).
 *      - Recommended source resolution: at least 2400x3000px, so it can
 *        be re-cropped for other placements later without upscaling.
 *      - Desktop crop: the full 4:5 frame, object-fit: cover.
 *      - Mobile crop: the same source image at object-fit: cover inside a
 *        wider ~4:3 frame (this component's aspect ratio would need a
 *        `max-sm:aspect-[4/3]` override at that point) — keep the
 *        subject centred/upper-third so both crops stay usable from one
 *        source file.
 *      - Safe subject area: keep the main subject (the child, their
 *        hands/work) within the centre 80% of the frame on all sides, so
 *        neither crop nor a future focal-point adjustment cuts them off.
 *      - Format/loading: serve as WebP/AVIF via next/image, `priority`
 *        (it's above the fold), a real `sizes` attribute, and a
 *        `placeholder="blur"` blurDataURL once the real asset exists.
 *        Target file weight under ~150KB optimised.
 */
export default function StudyIllustration() {
  return (
    <div
      role="img"
      aria-label="An open book with a pencil resting across the pages"
      className="aspect-[4/5] w-full max-w-sm mx-auto md:mx-0 rounded-xl bg-[var(--angel-ivory)] flex items-center justify-center p-10"
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
