"use client";

import Link from "next/link";
import {
  Mail,
  MessageSquare,
  Bug,
  Lightbulb,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import SupportLayout from "@/components/SupportLayout";

export default function ContactPage() {
  return (
    <SupportLayout backHref="/dashboard" backLabel="Back">
      {/* Header */}
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
          <Mail size={22} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
          Contact & Support
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
          We&apos;re in beta and we read everything. The fastest way to get help or share feedback is email.
        </p>
      </div>

      {/* Email card */}
      <section className="mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
              <Mail size={17} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-0.5">Support email</p>
              <a
                href="mailto:hello@angel11plus.co.uk"
                className="text-base font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                hello@angel11plus.co.uk
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-4">
            <Clock size={13} />
            <span>Beta response time: within 48 hours, usually sooner</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-xl px-3 py-2.5">
            <Sparkles size={13} className="text-amber-500 shrink-0" />
            We are in beta. Your message goes directly to the founder.
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Quicker options
        </h2>
        <div className="space-y-2">
          {[
            {
              href: "/feedback",
              icon: MessageSquare,
              color: "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
              title: "Send feedback",
              desc: "Suggestions, positive feedback or general comments",
            },
            {
              href: "/report-bug",
              icon: Bug,
              color: "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400",
              title: "Report a bug",
              desc: "Something broken or behaving unexpectedly",
            },
            {
              href: "/feature-request",
              icon: Lightbulb,
              color: "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
              title: "Request a feature",
              desc: "What would make Angel 11+ more useful for your family",
            },
          ].map(({ href, icon: Icon, color, title, desc }) => (
            <Link
              key={href}
              href={href}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 hover:shadow-sm transition-shadow block"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
              </div>
              <ChevronRight size={15} className="text-gray-300 dark:text-gray-600 shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* What to include */}
      <section>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">When emailing, it helps to include:</p>
          <ul className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            <li>• The device and browser you were using (e.g. iPad, Safari)</li>
            <li>• Which page or section you were on</li>
            <li>• What you expected to happen and what happened instead</li>
            <li>• Any error messages you saw</li>
          </ul>
        </div>
      </section>
    </SupportLayout>
  );
}
