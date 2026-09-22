import Link from "next/link";

/**
 * The homepage's own footer. Deliberately separate from SupportFooter.tsx
 * (the compact four-link strip used inside the authenticated app shell):
 * the public homepage needs its own independence statement and a full
 * Sign in link.
 *
 * Homepage Final Image + Footer Completion pass — corrects presentation
 * and alignment only, per Founder review; the legal/independence wording
 * itself is unchanged (same sentence, same links). Two rows on the same
 * max-w-7xl content grid as the rest of the page: a top row pairing the
 * wordmark with the navigation links, a divider, then a bottom row
 * pairing the independence statement with the copyright line. Both rows
 * stack (top-to-bottom, independence statement before copyright) on
 * mobile rather than spreading across the width. No footer cards, icons
 * or badges were introduced.
 */
export default function PublicFooter() {
  return (
    <footer className="border-t border-[var(--angel-border)] bg-[var(--angel-paper)]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="text-lg font-bold text-[var(--angel-navy)]">Angel 11+</span>
            <p className="mt-1 text-sm text-[var(--angel-muted)]">
              Independent 11+ preparation shaped around your child.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-[var(--angel-muted)]">
            <Link href="/privacy" className="hover:text-[var(--angel-navy)] transition-colors motion-reduce:transition-none">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[var(--angel-navy)] transition-colors motion-reduce:transition-none">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-[var(--angel-navy)] transition-colors motion-reduce:transition-none">
              Contact and support
            </Link>
            <Link href="/login?mode=signin" className="hover:text-[var(--angel-navy)] transition-colors motion-reduce:transition-none">
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--angel-border)] flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <p className="text-xs text-[var(--angel-muted)] leading-relaxed max-w-2xl">
            Angel 11+ is an independent preparation platform. It is not affiliated with or endorsed by the
            Consortium of Selective Schools in Essex (CSSE), or by any school, exam board or awarding body.
          </p>
          <p className="text-xs text-[var(--angel-muted)] whitespace-nowrap">© 2026 Angel Digital</p>
        </div>
      </div>
    </footer>
  );
}
