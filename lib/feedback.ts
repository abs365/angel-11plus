// Beta submission storage — Phase 5A: primary persistence is Supabase
// (feedback_submissions / bug_reports / feature_requests /
// beta_family_applications / testimonials, migration 008), so the founder
// can review every beta family's submissions, not just this device's.
// A local echo is still written to localStorage as a harmless offline-
// friendly cache (matches the app's existing localStorage-first,
// Supabase-background-sync convention) but is no longer read by
// app/admin-beta/page.tsx — Supabase (gated by real RLS + admin check,
// not this file) is the source of truth for the admin dashboard.

import { trackEvent } from "./betaTracking";
import { getSupabaseClient } from "./supabase";
import { ensureProfile } from "./supabaseProgress";

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

export interface SubmitResult {
  error: string | null;
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
  try {
    localStorage.setItem(key, JSON.stringify([...readList<T>(key), item]));
  } catch {
    // Best-effort local cache only — never blocks or fails the real submission.
  }
}

const GENERIC_ERROR = "We couldn't save this right now. Please check your connection and try again.";

export async function saveFeedback(data: Omit<FeedbackEntry, "id" | "submittedAt">): Promise<SubmitResult> {
  const submittedAt = new Date().toISOString();
  appendItem<FeedbackEntry>(KEYS.feedback, { ...data, id: crypto.randomUUID(), submittedAt });

  const supabase = getSupabaseClient();
  if (!supabase) return { error: GENERIC_ERROR };

  const profileId = await ensureProfile().catch(() => null);
  const { error } = await supabase.from("feedback_submissions").insert({
    profile_id: profileId,
    type: data.type,
    subject: data.subject,
    message: data.message,
  });
  if (error) {
    console.warn("[Feedback] saveFeedback failed:", error.message);
    return { error: GENERIC_ERROR };
  }

  trackEvent("feedback_submitted", { type: data.type });
  return { error: null };
}

export async function saveBugReport(data: Omit<BugReport, "id" | "submittedAt">): Promise<SubmitResult> {
  const submittedAt = new Date().toISOString();
  appendItem<BugReport>(KEYS.bugs, { ...data, id: crypto.randomUUID(), submittedAt });

  const supabase = getSupabaseClient();
  if (!supabase) return { error: GENERIC_ERROR };

  const profileId = await ensureProfile().catch(() => null);
  const { error } = await supabase.from("bug_reports").insert({
    profile_id: profileId,
    page: data.page,
    issue_type: data.issueType,
    description: data.description,
  });
  if (error) {
    console.warn("[Feedback] saveBugReport failed:", error.message);
    return { error: GENERIC_ERROR };
  }

  trackEvent("bug_reported", { page: data.page, issueType: data.issueType });
  return { error: null };
}

export async function saveFeatureRequest(data: Omit<FeatureRequest, "id" | "submittedAt">): Promise<SubmitResult> {
  const submittedAt = new Date().toISOString();
  appendItem<FeatureRequest>(KEYS.features, { ...data, id: crypto.randomUUID(), submittedAt });

  const supabase = getSupabaseClient();
  if (!supabase) return { error: GENERIC_ERROR };

  const profileId = await ensureProfile().catch(() => null);
  const { error } = await supabase.from("feature_requests").insert({
    profile_id: profileId,
    feature: data.feature,
    why: data.why,
  });
  if (error) {
    console.warn("[Feedback] saveFeatureRequest failed:", error.message);
    return { error: GENERIC_ERROR };
  }

  trackEvent("feature_requested");
  return { error: null };
}

export async function saveBetaFamilyApplication(
  data: Omit<BetaFamilyApplication, "id" | "submittedAt">
): Promise<SubmitResult> {
  const submittedAt = new Date().toISOString();
  appendItem<BetaFamilyApplication>(KEYS.betaFamilies, { ...data, id: crypto.randomUUID(), submittedAt });

  const supabase = getSupabaseClient();
  if (!supabase) return { error: GENERIC_ERROR };

  const profileId = await ensureProfile().catch(() => null);
  const { error } = await supabase.from("beta_family_applications").insert({
    profile_id: profileId,
    parent_name: data.parentName,
    year_group: data.yearGroup,
    pathway: data.pathway,
    email: data.email,
    contact_permission: data.contactPermission,
  });
  if (error) {
    console.warn("[Feedback] saveBetaFamilyApplication failed:", error.message);
    return { error: GENERIC_ERROR };
  }

  trackEvent("beta_family_registered", { pathway: data.pathway, yearGroup: data.yearGroup });
  return { error: null };
}

export async function saveTestimonial(data: Omit<Testimonial, "id" | "submittedAt">): Promise<SubmitResult> {
  const submittedAt = new Date().toISOString();
  appendItem<Testimonial>(KEYS.testimonials, { ...data, id: crypto.randomUUID(), submittedAt });

  const supabase = getSupabaseClient();
  if (!supabase) return { error: GENERIC_ERROR };

  const profileId = await ensureProfile().catch(() => null);
  const { error } = await supabase.from("testimonials").insert({
    profile_id: profileId,
    parent_name: data.parentName,
    year_group: data.yearGroup,
    feedback: data.feedback,
    publish_permission: data.publishPermission,
  });
  if (error) {
    console.warn("[Feedback] saveTestimonial failed:", error.message);
    return { error: GENERIC_ERROR };
  }

  trackEvent("testimonial_submitted", { publishPermission: data.publishPermission });
  return { error: null };
}

// ─── Admin reads (RLS-gated — only resolves rows for a confirmed admin) ────
// These are the ONLY reads app/admin-beta/page.tsx performs for beta
// submissions. Access control is enforced by Postgres (migration 008's
// is_current_user_admin()-gated SELECT policies), not by this file —
// a non-admin calling these simply gets an empty array back, the same
// as an empty table, per Supabase's standard RLS behaviour.

export async function fetchFeedback(): Promise<FeedbackEntry[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("feedback_submissions")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({ id: r.id, type: r.type, subject: r.subject, message: r.message, submittedAt: r.submitted_at }));
}

export async function fetchBugReports(): Promise<BugReport[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("bug_reports")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({ id: r.id, page: r.page, issueType: r.issue_type, description: r.description, submittedAt: r.submitted_at }));
}

export async function fetchFeatureRequests(): Promise<FeatureRequest[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("feature_requests")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({ id: r.id, feature: r.feature, why: r.why, submittedAt: r.submitted_at }));
}

export async function fetchBetaFamilyApplications(): Promise<BetaFamilyApplication[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("beta_family_applications")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id, parentName: r.parent_name, yearGroup: r.year_group, pathway: r.pathway,
    email: r.email, contactPermission: r.contact_permission, submittedAt: r.submitted_at,
  }));
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id, parentName: r.parent_name, yearGroup: r.year_group, feedback: r.feedback,
    publishPermission: r.publish_permission, submittedAt: r.submitted_at,
  }));
}

/** Calls migration 008's is_current_user_admin() RPC — the real, server-enforced admin check. */
export async function checkIsAdmin(): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { data, error } = await supabase.rpc("is_current_user_admin");
  if (error) {
    console.warn("[Feedback] checkIsAdmin failed:", error.message);
    return false;
  }
  return data === true;
}
