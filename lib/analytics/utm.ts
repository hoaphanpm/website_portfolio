/**
 * Current-session UTM capture — portfolio-tracking-spec.md §8.2/§8.5.
 * Reads the landing URL once per page load; if it carries no UTM, reuses
 * whatever was already captured earlier this browser session rather than
 * re-reading an empty URL and losing attribution on internal navigation
 * (Homepage → case → case → Download CV must all share the landing UTM).
 * Never fabricates a value: an absent property is omitted, never "" or
 * "unknown".
 */
export type SessionUtm = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

const STORAGE_KEY = "analytics_session_utm";

function readFromUrl(): SessionUtm {
  const params = new URLSearchParams(window.location.search);
  const utm: SessionUtm = {};

  const source = params.get("utm_source");
  const medium = params.get("utm_medium");
  const campaign = params.get("utm_campaign");

  if (source) utm.utm_source = source;
  if (medium) utm.utm_medium = medium;
  if (campaign) utm.utm_campaign = campaign;

  return utm;
}

function readFromStorage(): SessionUtm {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionUtm) : {};
  } catch {
    return {};
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

export function captureLandingUtm(): SessionUtm {
  const fromUrl = readFromUrl();
  if (Object.keys(fromUrl).length > 0) {
    writeToStorage(fromUrl);
    return fromUrl;
  }
  return readFromStorage();
}
