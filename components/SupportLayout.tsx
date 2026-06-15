"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SupportFooter from "./SupportFooter";

interface Props {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

export default function SupportLayout({ children, backHref = "/dashboard", backLabel = "Back" }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-purple-700 dark:text-purple-400 font-bold text-base"
          >
            Angel 11+
          </Link>
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={15} />
            {backLabel}
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <SupportFooter />
    </div>
  );
}
