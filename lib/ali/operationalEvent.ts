import type {
  OperationalEvent,
  AggregatedEventCount,
} from "@/types/ali/operationalEvent";

/**
 * Work Package WP-11 (Implementation Programme) — Operational Events,
 * including the retention strategy specified in
 * `EAW-ERR-HOTFIX-001_ENGINEERING_READINESS_DEFECT_CORRECTION_REPORT.md`
 * (Engineering Action 2): raw events retained for a bounded rolling
 * window, then rolled up into aggregated, learner-identifier-free counts.
 *
 * Calibration provenance (APD-017/APD-022): RETENTION_WINDOW_DAYS is a
 * provisional interim value, not a validated finding — chosen as "weeks,
 * not indefinitely" per the hotfix's own framing, without real data on
 * how long raw per-event detail is actually useful for diagnostics.
 */
const RETENTION_WINDOW_DAYS = 60;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function createOperationalEvent(
  eventType: string,
  learnerId: string,
  competencyCode: string,
  timestamp: string
): OperationalEvent {
  return { eventType, learnerId, competencyCode, timestamp };
}

function monthBucket(isoTimestamp: string): string {
  return isoTimestamp.slice(0, 7); // "YYYY-MM"
}

/**
 * Splits a set of Operational Events into those still within the raw
 * retention window (kept as-is, with learner_id intact, for near-term
 * diagnostics) and those beyond it (rolled up into learner-identifier-free
 * monthly aggregates for longer-term analytics trend purposes). Pure
 * function; `now` is an explicit parameter for the same testability reason
 * every other time-aware function in this programme takes one
 * (lib/ali/durableMastery.ts's isMaintenanceReviewDue()).
 */
export function partitionOperationalEvents(
  events: OperationalEvent[],
  now: Date
): { retained: OperationalEvent[]; aggregated: AggregatedEventCount[] } {
  const retained: OperationalEvent[] = [];
  const toAggregate: OperationalEvent[] = [];

  for (const event of events) {
    const ageDays = (now.getTime() - new Date(event.timestamp).getTime()) / MS_PER_DAY;
    if (ageDays <= RETENTION_WINDOW_DAYS) {
      retained.push(event);
    } else {
      toAggregate.push(event);
    }
  }

  const counts = new Map<string, AggregatedEventCount>();
  for (const event of toAggregate) {
    const timeBucket = monthBucket(event.timestamp);
    const key = `${event.eventType}::${event.competencyCode}::${timeBucket}`;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { eventType: event.eventType, competencyCode: event.competencyCode, timeBucket, count: 1 });
    }
  }

  return { retained, aggregated: Array.from(counts.values()) };
}
