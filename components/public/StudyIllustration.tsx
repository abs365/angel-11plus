/**
 * Increment 1 (Public Experience Foundation) — the hero's "one strong
 * educational visual" (ANGEL_11PLUS_EXPERIENCE_TRANSFORMATION Increment 1
 * §4B). This is an original, hand-authored flat-line illustration, not a
 * photograph and not a fake product dashboard.
 *
 * Why illustration, not photography, in this increment: the Experience Gap
 * Audit's photography direction calls for real, natural imagery of children
 * studying — and the same audit's own licensing rule (§7) is explicit that
 * no image may be introduced without established commercial-use rights, and
 * that a real child must never be fabricated and presented as if
 * photographed. No such licensed asset was available during this increment.
 * This illustration is the documented, deliberately-neutral placeholder that
 * rule calls for: it depicts objects only (a book, a pencil), never a
 * person, so it cannot misrepresent anyone. See the Increment 1 report's
 * "Photography requirement" section for the real photography brief this
 * should be replaced with once production-licensed imagery is available.
 *
 * No gradients, no purple, no glow/sparkle effects — flat shapes and the
 * same restrained blue/warm-accent palette as the rest of the product.
 */
export default function StudyIllustration() {
  return (
    <div
      role="img"
      aria-label="An open book with a pencil resting across the pages"
      className="w-full rounded-3xl border border-[var(--border)] bg-[#F5EFE3] p-6 md:p-10"
    >
      <svg viewBox="0 0 480 320" className="w-full h-auto" aria-hidden="true" focusable="false">
        {/* Left page */}
        <polygon points="240,58 78,92 78,256 240,278" fill="#ffffff" stroke="#1a1a2e" strokeWidth="3" strokeLinejoin="round" />
        {/* Right page */}
        <polygon points="240,58 402,92 402,256 240,278" fill="#ffffff" stroke="#1a1a2e" strokeWidth="3" strokeLinejoin="round" />
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
          <rect x="230" y="182" width="150" height="16" rx="5" fill="#d97706" />
          <polygon points="380,182 402,190 380,198" fill="#f3d19a" />
          <polygon points="392,186 402,190 392,194" fill="#3f3f46" />
          <rect x="230" y="182" width="14" height="16" rx="3" fill="#e11d48" />
        </g>
      </svg>
    </div>
  );
}
