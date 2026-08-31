"use client";

import { useState } from "react";
import { Star, CheckCircle, Users } from "lucide-react";
import SupportLayout from "@/components/SupportLayout";
import ErrorState from "@/components/ErrorState";
import { saveBetaFamilyApplication } from "@/lib/feedback";
import { PATHWAYS } from "@/lib/pathways";

const YEAR_GROUPS = ["Year 3", "Year 4", "Year 5", "Year 6", "Year 7", "Not sure yet"];

export default function BetaFamilyPage() {
  const [parentName, setParentName] = useState("");
  const [yearGroup, setYearGroup] = useState("");
  const [pathway, setPathway] = useState("");
  const [email, setEmail] = useState("");
  const [contactPermission, setContactPermission] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!parentName.trim() || parentName.trim().length < 2) e.parentName = "Please enter your name";
    if (!yearGroup) e.yearGroup = "Please select your child's year group";
    if (!pathway) e.pathway = "Please select a pathway";
    if (!email.trim() || !email.includes("@")) e.email = "Please enter a valid email address";
    if (!contactPermission) e.contactPermission = "Please confirm you agree to be contacted";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    const { error } = await saveBetaFamilyApplication({
      parentName: parentName.trim(),
      yearGroup,
      pathway,
      email: email.trim().toLowerCase(),
      contactPermission,
    });
    setSubmitting(false);
    if (error) {
      setErrors({ email: error });
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <SupportLayout backHref="/dashboard" backLabel="Student App">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
            <CheckCircle size={30} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome to the beta!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs leading-relaxed mb-6">
            Thank you for registering. We&apos;ll be in touch at the email address you provided with next steps.
          </p>
          <div className="bg-blue-50 dark:bg-blue-950 rounded-2xl border border-blue-100 dark:border-blue-900 p-5 max-w-sm text-left">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">While you wait…</p>
            <ul className="space-y-1.5 text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              <li>• Start practising now: the full platform is available immediately</li>
              <li>• Choose a pathway to personalise your experience</li>
              <li>• Progress is saved on this device automatically</li>
            </ul>
          </div>
          <a
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Start learning now
          </a>
        </div>
      </SupportLayout>
    );
  }

  return (
    <SupportLayout backHref="/beta" backLabel="Beta Info">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
          <Star size={22} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
          Join as a Beta Family
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
          Register to become an official Angel 11+ beta family. You get early access, a free beta period, and your feedback shapes what we build.
        </p>
      </div>

      {/* What you get */}
      <div className="bg-blue-50 dark:bg-blue-950 rounded-2xl border border-blue-100 dark:border-blue-900 p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-blue-600 dark:text-blue-400" />
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Beta family benefits</p>
        </div>
        <ul className="space-y-1.5">
          {[
            "Full platform access: all subjects, pathways and mock exams",
            "Free beta period: no charges while we are in beta",
            "Direct line to the founder: your feedback is always read",
            "Priority onboarding for future paid features",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle size={13} className="text-blue-500 shrink-0 mt-0.5" />
              <span className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">

        {/* Parent name */}
        <div>
          <label htmlFor="parentName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Your name (parent / guardian)
          </label>
          <input
            id="parentName"
            type="text"
            value={parentName}
            onChange={(e) => { setParentName(e.target.value); setErrors((p) => ({ ...p, parentName: "" })); }}
            placeholder="First name is fine"
            autoComplete="name"
            aria-describedby={errors.parentName ? "parentName-error" : undefined}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <ErrorState id="parentName-error" message={errors.parentName} />
        </div>

        {/* Year group */}
        <div>
          <label htmlFor="yearGroup" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Child&apos;s current year group
          </label>
          <select
            id="yearGroup"
            value={yearGroup}
            onChange={(e) => { setYearGroup(e.target.value); setErrors((p) => ({ ...p, yearGroup: "" })); }}
            aria-describedby={errors.yearGroup ? "yearGroup-error" : undefined}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none"
          >
            <option value="">Select year group…</option>
            {YEAR_GROUPS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <ErrorState id="yearGroup-error" message={errors.yearGroup} />
        </div>

        {/* Pathway */}
        <div>
          <label htmlFor="pathway" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Target exam pathway
          </label>
          <select
            id="pathway"
            value={pathway}
            onChange={(e) => { setPathway(e.target.value); setErrors((p) => ({ ...p, pathway: "" })); }}
            aria-describedby={errors.pathway ? "pathway-error" : undefined}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none"
          >
            <option value="">Select pathway…</option>
            {PATHWAYS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <ErrorState id="pathway-error" message={errors.pathway} />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
            placeholder="your@email.com"
            autoComplete="email"
            aria-describedby={errors.email ? "email-error" : undefined}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">We&apos;ll use this to follow up on your beta registration only.</p>
          <ErrorState id="email-error" message={errors.email} />
        </div>

        {/* Permission */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={contactPermission}
                onChange={(e) => { setContactPermission(e.target.checked); setErrors((p) => ({ ...p, contactPermission: "" })); }}
                aria-describedby={errors.contactPermission ? "contactPermission-error" : undefined}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              I give permission for Angel Digital to contact me at the email address above about my beta family registration and Angel 11+ updates.
            </span>
          </label>
          <ErrorState id="contactPermission-error" message={errors.contactPermission} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Registering…" : "Register as Beta Family"}
        </button>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed">
          Your information is stored securely. We will not share it with third parties.
          See our <a href="/privacy" className="underline">Privacy Policy</a>.
        </p>
      </form>
    </SupportLayout>
  );
}
