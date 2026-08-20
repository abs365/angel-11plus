"use client";

import Link from "next/link";
import SupportLayout from "@/components/SupportLayout";

const LAST_UPDATED = "June 2026";

export default function PrivacyPage() {
  return (
    <SupportLayout backHref="/contact" backLabel="Contact">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-gray-400 dark:text-gray-500">Last updated: {LAST_UPDATED} · Beta version</p>
      </div>

      <div className="prose-custom space-y-8">

        <section>
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-xl px-4 py-3 mb-6">
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              Angel 11+ is in beta. This policy reflects our current data practices during the beta phase and will be updated before general public launch.
            </p>
          </div>
        </section>

        <Section title="1. Who we are">
          <p>Angel 11+ is an educational preparation platform operated by Angel Digital, based in the United Kingdom. We create practice content to help children prepare for 11+ grammar and independent school entrance exams.</p>
          <p className="mt-2">Contact: <Link href="/contact" className="text-purple-600 dark:text-purple-400 hover:underline">our contact page</Link></p>
        </Section>

        <Section title="2. What data we collect">
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Data stored on your device (localStorage)</p>
          <p>By default, all practice progress, session results, streaks, badges and settings are stored locally on the device used. This data never leaves your device unless you choose to sync.</p>
          <ul className="mt-2 space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <li>• Practice session results and scores</li>
            <li>• Streaks, XP and earned badges</li>
            <li>• Selected exam pathway</li>
            <li>• Mock exam results</li>
            <li>• Vocabulary progress</li>
          </ul>

          <p className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">Optional: account sync (Supabase)</p>
          <p>If you choose to create an account or sign in with email, your progress is synced to a secure cloud database so it can be accessed across multiple devices. This is optional and you can use Angel 11+ without creating an account.</p>
          <p className="mt-2">Data synced if you sign in: email address, progress records, session history.</p>

          <p className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">Beta feedback forms</p>
          <p>If you submit feedback, report a bug, request a feature or register as a beta family, we collect only what you enter in those forms. During beta this is stored locally; it may be transferred to a secure server as part of our beta operations.</p>
        </Section>

        <Section title="3. How we use data">
          <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <li>• To show you and your child their learning progress</li>
            <li>• To adapt difficulty based on performance</li>
            <li>• To generate parent insights and readiness scores</li>
            <li>• To improve the platform based on aggregate usage patterns</li>
            <li>• To respond to support requests and feedback</li>
          </ul>
          <p className="mt-3">We do <strong>not</strong> use your data for advertising. We do not sell your data to third parties. We do not share individual data with exam boards or schools.</p>
        </Section>

        <Section title="4. Children's privacy">
          <p>Angel 11+ is used by children under 13, supervised by parents or guardians. We are committed to children's privacy.</p>
          <ul className="mt-2 space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <li>• We do not require children to create accounts to use the platform</li>
            <li>• We do not collect children's names, photos or personal identifiers</li>
            <li>• We do not display advertising to any users</li>
            <li>• Parent or guardian consent is required before account creation</li>
          </ul>
          <p className="mt-3">If you believe we have inadvertently collected personal data from a child without appropriate consent, please <Link href="/contact" className="text-purple-600 dark:text-purple-400 hover:underline">contact us</Link> immediately.</p>
        </Section>

        <Section title="5. Data retention">
          <p>Local data (localStorage) stays on your device until you clear your browser or app storage.</p>
          <p className="mt-2">Cloud-synced data (if you create an account) is retained while your account is active. You can request deletion at any time by emailing us.</p>
          <p className="mt-2">Beta feedback submissions are retained for the duration of the beta period and used to improve the platform.</p>
        </Section>

        <Section title="6. Your rights (UK GDPR)">
          <p>Under UK data protection law you have the right to:</p>
          <ul className="mt-2 space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <li>• Access personal data we hold about you</li>
            <li>• Request correction of inaccurate data</li>
            <li>• Request deletion of your data</li>
            <li>• Object to processing of your data</li>
            <li>• Data portability</li>
          </ul>
          <p className="mt-3">To exercise any of these rights, <Link href="/contact" className="text-purple-600 dark:text-purple-400 hover:underline">contact us</Link>. We will respond within 30 days.</p>
        </Section>

        <Section title="7. Third party services">
          <p>During beta, Angel 11+ may use the following services:</p>
          <ul className="mt-2 space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <li>• <strong>Supabase</strong>: cloud database and authentication (optional sync only)</li>
            <li>• <strong>OpenAI</strong>: AI-powered writing feedback (writing sessions only; no personal data sent)</li>
            <li>• <strong>Vercel</strong>: platform hosting</li>
          </ul>
          <p className="mt-3">We do not use Google Analytics, Facebook Pixel, or any advertising trackers.</p>
        </Section>

        <Section title="8. Cookies">
          <p>Angel 11+ uses no advertising cookies. The platform may use essential session cookies for authentication (only if you sign in) and localStorage for progress data.</p>
        </Section>

        <Section title="9. Changes to this policy">
          <p>We will update this policy before our public launch. Significant changes will be communicated to registered beta families by email.</p>
        </Section>

        <Section title="10. Contact">
          <p>For any privacy questions: <Link href="/contact" className="text-purple-600 dark:text-purple-400 hover:underline">our contact page</Link></p>
        </Section>

      </div>
    </SupportLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">{title}</h2>
      <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {children}
      </div>
    </section>
  );
}
