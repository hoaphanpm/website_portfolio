import mixpanel from "mixpanel-browser";
import { getDeviceType } from "@/lib/analytics/device";
import {
  INTERNAL_QA_STORAGE_KEY,
  isClientHostAllowed,
  resolveInternalMode,
} from "@/lib/analytics/environment";
import {
  captureLandingUtm,
  clearStoredUtm,
  type SessionUtm,
} from "@/lib/analytics/utm";
import type { EventName } from "@/lib/analytics/constants";

/**
 * Low-level analytics service — portfolio-tracking-spec.md §3 ("central
 * trackEvent wrapper") and §8 (session UTM as super properties, first-touch
 * UTM via people.set_once). This is the ONLY module in the app allowed to
 * call mixpanel.init/track/register/people.set_once — nothing else may
 * import "mixpanel-browser" directly.
 *
 * Milestone 9 wires the 5 events using three exports added below
 * (isAnalyticsInitialized, ensureAnalyticsReady, attemptTrackedEvent) on
 * top of the Milestone 8 core (initAnalytics, trackEvent), whose behavior
 * and signatures are unchanged.
 */

let initialized = false;

// This tab's UTM attribution (sessionStorage-backed, see utm.ts), attached
// directly to every event. Deliberately NOT a Mixpanel super property:
// those persist in localStorage, shared across tabs and sessions, which
// leaks one tab's or visit's campaign into another.
let sessionUtm: SessionUtm = {};

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
] as const;

export function initAnalytics(): void {
  if (initialized) return;

  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token) {
    // No token configured — analytics stays disabled. Never throw, never
    // warn loudly; a missing public env var must never break the site.
    return;
  }

  try {
    mixpanel.init(token, {
      autocapture: false,
      persistence: "localStorage",
    });
  } catch {
    // A blocked script, ad-blocker, or malformed token must never crash
    // the page. Leave `initialized` false so trackEvent() stays a no-op.
    return;
  }

  initialized = true;

  const utm = captureLandingUtm();

  sessionUtm = utm;

  // Clear UTM super properties left in shared localStorage (by earlier
  // visits or versions) so they can't leak onto this session's events.
  for (const key of UTM_KEYS) {
    try {
      mixpanel.unregister(key);
    } catch {
      // Non-fatal.
    }
  }

  if (Object.keys(utm).length > 0) {
    // Anonymous first-touch UTA — set_once() never overwrites a value
    // already recorded for this distinct_id on an earlier visit. No PII,
    // no mixpanel.identify() call anywhere in this app.
    try {
      mixpanel.people.set_once(utm);
    } catch {
      // Non-fatal.
    }
  }
}

export type TrackOptions = {
  /** Page is hiding/unloading: bypass batching and use sendBeacon. */
  unloading?: boolean;
};

export function trackEvent(
  eventName: EventName,
  properties: Record<string, unknown> = {},
  options: TrackOptions = {},
): void {
  if (!initialized) {
    return;
  }

  const payload = {
    ...sessionUtm,
    ...properties,
    device_type: getDeviceType(),
  };

  try {
    if (options.unloading) {
      // The SDK's own visibilitychange flush runs before ours, so an event
      // queued here would miss it; send it directly instead.
      mixpanel.track(eventName, payload, {
        transport: "sendBeacon",
        send_immediately: true,
      });
    } else {
      mixpanel.track(eventName, payload);
    }
  } catch {
    // Never let a tracking failure affect the page.
  }

  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", eventName, payload);
  }
}

/** Whether initAnalytics() has actually run and Mixpanel is ready to track. */
export function isAnalyticsInitialized(): boolean {
  return initialized;
}

let internalParamApplied = false;
let internalForPage: boolean | null = null;

function readInternalFlag(): string | null {
  try {
    return window.localStorage.getItem(INTERNAL_QA_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Internal QA opt-out (?internal=1 / ?internal=0). localStorage is the
 * source of truth; the URL parameter is applied once per page load. When
 * on, analytics is never initialized, so no SDK request is ever made. If
 * storage is unavailable the parameter still applies to this page load
 * (fail-open afterwards).
 */
function isInternalQaMode(): boolean {
  if (typeof window === "undefined") return false;

  if (!internalParamApplied) {
    internalParamApplied = true;
    const decision = resolveInternalMode(
      window.location.search,
      readInternalFlag(),
    );
    if (decision.write === "set") {
      internalForPage = true;
      try {
        window.localStorage.setItem(INTERNAL_QA_STORAGE_KEY, "1");
      } catch {
        // Non-fatal.
      }
      clearStoredUtm();
    } else if (decision.write === "clear") {
      internalForPage = false;
      try {
        window.localStorage.removeItem(INTERNAL_QA_STORAGE_KEY);
      } catch {
        // Non-fatal.
      }
    }
  }

  const stored = readInternalFlag();
  if (stored !== null) return stored === "1";
  return internalForPage ?? false;
}

/**
 * Client-side defense-in-depth re-check (Milestone 8 decision #8): even
 * when the server already computed trackingAllowed, never track on a
 * localhost hostname or a URL carrying ?preview=true.
 */
function isClientTrackingAllowed(): boolean {
  if (typeof window === "undefined") return false;
  if (isInternalQaMode()) return false;

  return isClientHostAllowed(window.location.hostname, window.location.search);
}

/**
 * Lazily initializes analytics if allowed. Safe to call from every
 * tracking component independently (not just <AnalyticsInit>) — each
 * caller becomes self-sufficient rather than depending on another
 * component having already run, and initAnalytics()'s own `initialized`
 * guard makes repeated calls idempotent regardless of how many components
 * call this.
 */
export function ensureAnalyticsReady(trackingAllowed: boolean): void {
  if (!trackingAllowed) return;
  if (!isClientTrackingAllowed()) return;
  initAnalytics();
}

/**
 * The single place every event-firing component goes through. Ensures
 * analytics is ready, then tracks only if it actually is — returning
 * whether the event was dispatched, so callers can mark a deduplication
 * key ONLY after analytics was initialized and the event dispatch was
 * attempted (portfolio-tracking-spec.md §2: "Deduplication key chỉ được
 * ghi sau khi event thực sự được gửi").
 */
export function attemptTrackedEvent(
  trackingAllowed: boolean,
  eventName: EventName,
  properties: Record<string, unknown>,
  options: TrackOptions = {},
): boolean {
  // Re-checked per event so switching to internal mode mid-session stops
  // an already-initialized SDK as well.
  if (typeof window !== "undefined" && isInternalQaMode()) return false;
  ensureAnalyticsReady(trackingAllowed);
  if (!isAnalyticsInitialized()) return false;
  trackEvent(eventName, properties, options);
  return true;
}
