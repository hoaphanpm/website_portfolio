import mixpanel from "mixpanel-browser";
import { getDeviceType } from "@/lib/analytics/device";
import { captureLandingUtm } from "@/lib/analytics/utm";
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

  // Session-scoped: attached to every event for the rest of this browser
  // session via Mixpanel's own super-property persistence.
  if (Object.keys(utm).length > 0) {
    try {
      mixpanel.register(utm);
    } catch {
      // Non-fatal — events will simply lack UTM super properties.
    }

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

export function trackEvent(
  eventName: EventName,
  properties: Record<string, unknown> = {},
): void {
  if (!initialized) {
    return;
  }

  const payload = {
    ...properties,
    device_type: getDeviceType(),
  };

  try {
    mixpanel.track(eventName, payload);
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

/**
 * Client-side defense-in-depth re-check (Milestone 8 decision #8): even
 * when the server already computed trackingAllowed, never track on a
 * localhost hostname or a URL carrying ?preview=true.
 */
function isClientTrackingAllowed(): boolean {
  if (typeof window === "undefined") return false;

  const { hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") return false;

  const params = new URLSearchParams(window.location.search);
  if (params.get("preview") === "true") return false;

  return true;
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
): boolean {
  ensureAnalyticsReady(trackingAllowed);
  if (!isAnalyticsInitialized()) return false;
  trackEvent(eventName, properties);
  return true;
}
