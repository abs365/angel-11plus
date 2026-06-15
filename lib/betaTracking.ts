// Lightweight beta usage tracking — localStorage now, Supabase-ready later.
// All calls are fire-and-forget and silently swallow errors so they can never
// break the app.  To migrate: replace appendItem with a supabase.from().insert().

export type EventType =
  | "mock_started"
  | "mock_completed"
  | "subject_visited"
  | "pathway_selected"
  | "feedback_submitted"
  | "bug_reported"
  | "feature_requested"
  | "testimonial_submitted"
  | "beta_family_registered";

export interface TrackingEvent {
  id: string;
  type: EventType;
  data?: Record<string, string | number | boolean>;
  timestamp: string;
}

const EVENTS_KEY = "angel11plus_beta_events";
const MAX_EVENTS = 500;

export function trackEvent(
  type: EventType,
  data?: Record<string, string | number | boolean>
): void {
  try {
    const existing = getBetaEvents();
    const next: TrackingEvent = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: new Date().toISOString(),
    };
    const trimmed = [...existing, next].slice(-MAX_EVENTS);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));
  } catch {
    // Silently fail — tracking must never break the app
  }
}

export function getBetaEvents(): TrackingEvent[] {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) ?? "[]") as TrackingEvent[];
  } catch {
    return [];
  }
}

export function clearBetaEvents(): void {
  try {
    localStorage.removeItem(EVENTS_KEY);
  } catch {
    // ignore
  }
}

export function countEventsByType(events: TrackingEvent[]): Record<EventType, number> {
  const counts = {} as Record<EventType, number>;
  for (const e of events) {
    counts[e.type] = (counts[e.type] ?? 0) + 1;
  }
  return counts;
}
