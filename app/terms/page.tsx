"use client";

import SupportLayout from "@/components/SupportLayout";

const LAST_UPDATED = "June 2026";

export default function TermsPage() {
  return (
    <SupportLayout backHref="/contact" backLabel="Contact">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
          Terms of Use
        </h1>
        <p className="text-xs text-gray-400 dark:text-gray-500">Last updated: {LAST_UPDATED} · Beta version</p>
      </div>

      <div className="space-y-8">

        <section>
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-xl px-4 py-3 mb-6">
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              Angel 11+ is currently in beta. These terms apply to beta users. By using the platform you accept these terms.
            </p>
          </div>
        </section>

        <Section title="1. About Angel 11+">
          <p>Angel 11+ is an educational practice platform operated by Angel Digital, United Kingdom. The platform provides original exam-style practice content designed to help children prepare for UK 11+ entrance examinations.</p>
          <p className="mt-2">Contact: <a href="mailto:hello@angel11plus.co.uk" className="text-purple-600 dark:text-purple-400 hover:underline">hello@angel11plus.co.uk</a></p>
        </Section>

        <Section title="2. Beta status">
          <p>Angel 11+ is currently in a beta phase. During this period:</p>
          <ul className="mt-2 space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <li>• Features may change without notice</li>
            <li>• The platform may experience downtime or errors</li>
            <li>• Content is provided as-is and we make no guarantees of completeness</li>
            <li>• Beta access may be free or subsidised — pricing for public launch will be communicated separately</li>
          </ul>
        </Section>

        <Section title="3. Who can use Angel 11+">
          <p>Angel 11+ is designed for use by children aged 8–13, under the supervision and with the consent of a parent or guardian.</p>
          <ul className="mt-2 space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <li>• Children must have parental permission to use the platform</li>
            <li>• Accounts (where applicable) must be set up by a parent or guardian</li>
            <li>• Use is for personal, non-commercial educational purposes only</li>
          </ul>
        </Section>

        <Section title="4. Original content — not affiliated with exam boards">
          <p className="font-semibold text-amber-700 dark:text-amber-400 mb-2">Important disclaimer</p>
          <p>All questions, passages, writing prompts, vocabulary, mock exams and other content on Angel 11+ are <strong>original content</strong> created by Angel Digital. This platform is:</p>
          <ul className="mt-2 space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <li>• Not affiliated with GL Assessment, CEM (Durham University), CSSE, ISEB or any exam board</li>
            <li>• Not endorsed by any grammar school, independent school or academy trust</li>
            <li>• Not a substitute for official past papers where these are available</li>
            <li>• Not a guarantee of any exam result</li>
          </ul>
          <p className="mt-3">Practice on Angel 11+ is intended to complement a child&apos;s preparation, not replace it. Final responsibility for exam readiness remains with the family and any tutors engaged.</p>
        </Section>

        <Section title="5. Acceptable use">
          <p>You agree to use Angel 11+ for lawful educational purposes only. You must not:</p>
          <ul className="mt-2 space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <li>• Reproduce, copy or distribute our content without written permission</li>
            <li>• Use the platform for commercial tutoring purposes without agreement</li>
            <li>• Attempt to reverse-engineer or access parts of the system not intended for users</li>
            <li>• Submit false or misleading information in feedback or registration forms</li>
          </ul>
        </Section>

        <Section title="6. Intellectual property">
          <p>All content on Angel 11+ — including questions, passages, explanations, design and software — is the intellectual property of Angel Digital. You may not reproduce any content without prior written consent.</p>
        </Section>

        <Section title="7. No warranties">
          <p>Angel 11+ is provided &quot;as is&quot; during the beta phase. We make no warranties, express or implied, regarding:</p>
          <ul className="mt-2 space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <li>• Accuracy or completeness of practice content</li>
            <li>• Continuous availability of the platform</li>
            <li>• Fitness for any particular exam or school</li>
            <li>• Outcomes in actual 11+ examinations</li>
          </ul>
        </Section>

        <Section title="8. Limitation of liability">
          <p>To the fullest extent permitted by UK law, Angel Digital is not liable for any indirect, consequential, or incidental damages arising from your use of Angel 11+, including exam results or reliance on our practice content.</p>
        </Section>

        <Section title="9. Data and privacy">
          <p>Our <a href="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">Privacy Policy</a> explains how we handle data. By using Angel 11+ you accept our privacy practices.</p>
        </Section>

        <Section title="10. Changes to terms">
          <p>We may update these terms at any time. Beta families will be notified of material changes by email where possible. Continued use of the platform constitutes acceptance of updated terms.</p>
        </Section>

        <Section title="11. Governing law">
          <p>These terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
        </Section>

        <Section title="12. Contact">
          <p>Questions about these terms: <a href="mailto:hello@angel11plus.co.uk" className="text-purple-600 dark:text-purple-400 hover:underline">hello@angel11plus.co.uk</a></p>
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
