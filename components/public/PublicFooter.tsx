import Link from "next/link";

/**
 * Increment 1 (Public Experience Foundation) — the homepage's own footer.
 * Deliberately separate from SupportFooter.tsx (the compact four-link strip
 * used inside the authenticated app shell): the public homepage needs its
 * own independence statement and a full Sign in link, per ANGEL_11PLUS_
 * EXPERIENCE_TRANSFORMATION Increment 1 §4K. No developer/platform branding
 * (no "built with"/"powered by" credit) — the product is Angel 11+, not the
 * tools it happens to be built with.
 *
 * Increment 1A — retokenised onto the Brand Foundation (--angel-*) roles;
 * no visual regression, same structure and copy, just Academic Navy/Ink/
 * Slate in place of the generic --text-* aliases, matching the header.
 */
export default function PublicFooter() {
  return (
    <footer className="border-t border-[var(--angel-border)] bg-[var(--angel-paper)]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-[var(--angel-muted)]">
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

        <p className="mt-6 text-xs text-[var(--angel-muted)] leading-relaxed max-w-2xl">
          Angel 11+ is an independent preparation platform. It is not affiliated with or endorsed by the Consortium
          of Selective Schools in Essex (CSSE), or by any school, exam board or awarding body.
        </p>

        <p className="mt-4 text-xs text-[var(--angel-muted)]">© 2026 Angel Digital</p>
      </div>
    </footer>
  );
}
