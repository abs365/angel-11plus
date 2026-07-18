import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * Sprint 1 (Angel V2.0 Enterprise UI Foundation) — Navigation Components.
 * A genuinely new primitive: no page in this product currently shows a
 * breadcrumb trail. Built as a standalone, unwired component only — per
 * this sprint's "do not redesign pages" constraint, no existing page is
 * retrofitted to use it here. Available for a future page to adopt.
 */
export interface Breadcrumb {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap gap-1.5 text-xs text-gray-400 dark:text-gray-500">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={isLast ? "text-gray-600 dark:text-gray-300 font-medium" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight size={12} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
