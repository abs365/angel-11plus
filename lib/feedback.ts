// Feedback storage — currently persists to localStorage.
// To migrate to Supabase: swap each localStorage block with a supabase.from(...).insert() call
// and change the signatures to async. The shape of each type is already Supabase-insert-ready.

import { trackEvent } from "./betaTracking";

export type FeedbackType = "suggestion" | "positive" | "general";

export interface FeedbackEntry {
  id: string;
  type: FeedbackType;
  subject: string;
  message: string;
  submittedAt: string;
}

export interface BugReport {
  id: string;
  page: string;
  issueType: string;
  description: string;
  submittedAt: string;
}

export interface FeatureRequest {
  id: string;
  feature: string;
  why: string;
  submittedAt: string;
}

export interface BetaFamilyApplication {
  id: string;
  parentName: string;
  yearGroup: string;
  pathway: string;
  email: string;
  contactPermission: boolean;
  submittedAt: string;
}

export interface Testimonial {
  id: string;
  parentName: string;
  yearGroup: string;
  feedback: string;
  publishPermission: boolean;
  submittedAt: string;
}

const KEYS = {
  feedback: "angel11plus_feedback",
  bugs: "angel11plus_bugs",
  features: "angel11plus_features",
  betaFamilies: "angel11plus_beta_families",
  testimonials: "angel11plus_testimonials",
} as const;

function readList<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}

function appendItem<T>(key: string, item: T): void {
  localStorage.setItem(key, JSON.stringify([...readList<T>(key), item]));
}

export function saveFeedback(data: Omit<FeedbackEntry, "id" | "submittedAt">): void {
  appendItem<FeedbackEntry>(KEYS.feedback, {
    ...data,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  });
  trackEvent("feedback_submitted", { type: data.type });
}

export function saveBugReport(data: Omit<BugReport, "id" | "submittedAt">): void {
  appendItem<BugReport>(KEYS.bugs, {
    ...data,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  });
  trackEvent("bug_reported", { page: data.page, issueType: data.issueType });
}

export function saveFeatureRequest(data: Omit<FeatureRequest, "id" | "submittedAt">): void {
  appendItem<FeatureRequest>(KEYS.features, {
    ...data,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  });
  trackEvent("feature_requested");
}

export function saveBetaFamilyApplication(data: Omit<BetaFamilyApplication, "id" | "submittedAt">): void {
  appendItem<BetaFamilyApplication>(KEYS.betaFamilies, {
    ...data,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  });
  trackEvent("beta_family_registered", { pathway: data.pathway, yearGroup: data.yearGroup });
}

export function saveTestimonial(data: Omit<Testimonial, "id" | "submittedAt">): void {
  appendItem<Testimonial>(KEYS.testimonials, {
    ...data,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  });
  trackEvent("testimonial_submitted", { publishPermission: data.publishPermission });
}

export function getFeedback(): FeedbackEntry[] {
  return readList<FeedbackEntry>(KEYS.feedback);
}

export function getBugReports(): BugReport[] {
  return readList<BugReport>(KEYS.bugs);
}

export function getFeatureRequests(): FeatureRequest[] {
  return readList<FeatureRequest>(KEYS.features);
}

export function getBetaFamilyApplications(): BetaFamilyApplication[] {
  return readList<BetaFamilyApplication>(KEYS.betaFamilies);
}

export function getTestimonials(): Testimonial[] {
  return readList<Testimonial>(KEYS.testimonials);
}
