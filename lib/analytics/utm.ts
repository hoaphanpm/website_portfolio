/**
 * Current-session UTM capture — portfolio-tracking-spec.md §8.2/§8.5.
 * Reads the landing URL once per page load; if it carries no UTM, reuses
 * whatever was already captured earlier this browser session rather than
 * re-reading an empty URL and losing attribution on internal navigation
 * (Homepage → case → case → Download CV must all share the landing UTM).
 * Never fabricates a value: an absent property is omitted, never "" or
 * "unknown".
 *
 * New-tab fallback: a tab with no UTM of its own may adopt a recent record
 * (localStorage) only when it was opened from this site (same-origin
 * referrer), the record is under 30 minutes old, and the record is not
 * ambiguous (two different campaigns seen in this browser within the
 * window). Explicit URL UTM and the tab's own sessionStorage always win.
 */
export type SessionUtm = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
};

const STORAGE_KEY = "analytics_session_utm";
const RECENT_KEY = "analytics_recent_utm";

/** Maximum age of the shared record a new tab may adopt. */
export const RECENT_UTM_WINDOW_MS = 30 * 60 * 1000;

export type RecentUtmRecord = {
  utm: SessionUtm;
  at: number;
  /** True once a different campaign was seen while this record was live. */
  ambiguous: boolean;
};

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
] as const;

function hasUtm(utm: SessionUtm): boolean {
  return UTM_KEYS.some((key) => Boolean(utm[key]));
}

export function sameUtmSet(a: SessionUtm, b: SessionUtm): boolean {
  return UTM_KEYS.every((key) => (a[key] ?? "") === (b[key] ?? ""));
}

function isLive(record: RecentUtmRecord | null, now: number): boolean {
  if (!record) return false;
  const age = now - record.at;
  return age >= 0 && age < RECENT_UTM_WINDOW_MS;
}

/**
 * The record to store after this browser sees `utm` at `now`. A different
 * set while a live record exists marks the record ambiguous; an expired
 * record starts fresh.
 */
export function nextRecentRecord(
  prev: RecentUtmRecord | null,
  utm: SessionUtm,
  now: number,
): RecentUtmRecord {
  if (!prev || !isLive(prev, now)) {
    return { utm, at: now, ambiguous: false };
  }
  if (sameUtmSet(prev.utm, utm)) {
    return { utm, at: now, ambiguous: prev.ambiguous };
  }
  return { utm, at: now, ambiguous: true };
}

/** Same-origin check; any parse failure (empty/foreign referrer) is false. */
export function isSameOriginReferrer(referrer: string, origin: string): boolean {
  if (!referrer) return false;
  try {
    return new URL(referrer).origin === origin;
  } catch {
    return false;
  }
}

/**
 * The UTM set a brand-new tab may adopt, or null. Rejects: no/expired/
 * ambiguous record, and any referrer that is not this site (direct, typed,
 * bookmarked, pasted, or external/shared links).
 */
export function selectFallbackUtm(
  record: RecentUtmRecord | null,
  referrer: string,
  origin: string,
  now: number,
): SessionUtm | null {
  if (!record || record.ambiguous || !isLive(record, now)) return null;
  if (!hasUtm(record.utm)) return null;
  if (!isSameOriginReferrer(referrer, origin)) return null;
  return record.utm;
}

function readFromUrl(): SessionUtm {
  const params = new URLSearchParams(window.location.search);
  const utm: SessionUtm = {};

  const source = params.get("utm_source");
  const medium = params.get("utm_medium");
  const campaign = params.get("utm_campaign");
  const content = params.get("utm_content");

  if (source) utm.utm_source = source;
  if (medium) utm.utm_medium = medium;
  if (campaign) utm.utm_campaign = campaign;
  if (content) utm.utm_content = content;

  return utm;
}

/** null = this tab has never decided; {} = decided "no attribution". */
function readFromStorage(): SessionUtm | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw === null ? null : (JSON.parse(raw) as SessionUtm);
  } catch {
    return null;
  }
}

function writeToStorage(utm: SessionUtm): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
  } catch {
    // Ignore — the in-memory value captureLandingUtm() returns still
    // works for merging into events fired during this same page load.
  }
}

function readRecent(): RecentUtmRecord | null {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as RecentUtmRecord) : null;
  } catch {
    return null;
  }
}

function touchRecent(utm: SessionUtm, now: number): void {
  try {
    window.localStorage.setItem(
      RECENT_KEY,
      JSON.stringify(nextRecentRecord(readRecent(), utm, now)),
    );
  } catch {
    // Fail-open: without storage there is simply no cross-tab fallback.
  }
}

/** Internal QA mode: forget any stored attribution. */
export function clearStoredUtm(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
  try {
    window.localStorage.removeItem(RECENT_KEY);
  } catch {
    // Ignore.
  }
}

export function captureLandingUtm(): SessionUtm {
  const now = Date.now();

  const fromUrl = readFromUrl();
  if (hasUtm(fromUrl)) {
    writeToStorage(fromUrl);
    touchRecent(fromUrl, now);
    return fromUrl;
  }

  const own = readFromStorage();
  if (own !== null) {
    if (hasUtm(own)) touchRecent(own, now);
    return own;
  }

  // First load of this tab with no UTM of its own.
  const referrer = typeof document === "undefined" ? "" : document.referrer;
  const fallback = selectFallbackUtm(
    readRecent(),
    referrer,
    window.location.origin,
    now,
  );
  if (fallback) {
    writeToStorage(fallback);
    touchRecent(fallback, now);
    return fallback;
  }

  // Remember the decision so later loads in this tab (e.g. after the
  // browser opens it from a direct visit) never adopt another campaign.
  writeToStorage({});
  return {};
}
