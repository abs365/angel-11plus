import Link from "next/link";

export default function SupportFooter() {
  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 py-5 mt-8">
      <div className="max-w-3xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <Link href="/privacy" className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          Privacy
        </Link>
        <Link href="/terms" className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          Terms
        </Link>
        <Link href="/contact" className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          Contact
        </Link>
        <Link href="/beta" className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          About Angel 11+
        </Link>
        <span className="text-xs text-gray-300 dark:text-gray-700">© 2026 Angel Digital</span>
      </div>
    </footer>
  );
}
