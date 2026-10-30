// Run with: npm test  (Node's built-in test runner; no extra dependencies)
import assert from "node:assert/strict";
import test from "node:test";

import {
  RECENT_UTM_WINDOW_MS,
  captureLandingUtm,
  clearStoredUtm,
  isSameOriginReferrer,
  nextRecentRecord,
  sameUtmSet,
  selectFallbackUtm,
} from "./utm.ts";

const ORIGIN = "https://hoakimphan-portfolio.vercel.app";
const A = { utm_source: "company_a", utm_medium: "resume", utm_campaign: "oct", utm_content: "pm" };
const B = { utm_source: "company_b", utm_medium: "resume", utm_campaign: "oct", utm_content: "pm" };
const T0 = 1_000_000;

function store() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}

/** One browser profile: shared localStorage; each tab has its own sessionStorage. */
function browser() {
  return { local: store() };
}
function openTab(b, { search = "", referrer = "" } = {}) {
  globalThis.window = {
    location: { search, origin: ORIGIN },
    sessionStorage: b.sessions?.current ?? store(),
    localStorage: b.local,
  };
  globalThis.document = { referrer };
}
function newTab(b, opts) {
  const session = store();
  b.sessions = { current: session };
  openTab(b, opts);
  return session;
}
function useTab(b, session, opts = {}) {
  b.sessions = { current: session };
  openTab(b, opts);
}
function qs(utm) {
  return "?" + new URLSearchParams(utm).toString();
}
function at(ms, fn) {
  const real = Date.now;
  Date.now = () => ms;
  try {
    return fn();
  } finally {
    Date.now = real;
  }
}

test("pure: window is 30 minutes and sets compare by all four keys", () => {
  assert.equal(RECENT_UTM_WINDOW_MS, 30 * 60 * 1000);
  assert.equal(sameUtmSet(A, { ...A }), true);
  assert.equal(sameUtmSet(A, { ...A, utm_content: "other" }), false);
  assert.equal(sameUtmSet(A, { utm_source: A.utm_source }), false);
});

test("pure: only a same-origin referrer qualifies", () => {
  assert.equal(isSameOriginReferrer(`${ORIGIN}/`, ORIGIN), true);
  assert.equal(isSameOriginReferrer("", ORIGIN), false);
  assert.equal(isSameOriginReferrer("https://mail.example.com/x", ORIGIN), false);
  assert.equal(isSameOriginReferrer("not a url", ORIGIN), false);
});

test("pure: different campaign inside the window makes the record ambiguous; expiry resets", () => {
  const r1 = nextRecentRecord(null, A, T0);
  assert.equal(r1.ambiguous, false);
  assert.equal(nextRecentRecord(r1, A, T0 + 1000).ambiguous, false);
  const r2 = nextRecentRecord(r1, B, T0 + 1000);
  assert.equal(r2.ambiguous, true);
  assert.equal(nextRecentRecord(r2, A, T0 + 2000).ambiguous, true);
  const fresh = nextRecentRecord(r2, B, r2.at + RECENT_UTM_WINDOW_MS);
  assert.equal(fresh.ambiguous, false);
});

test("pure: fallback rejects ambiguous, expired, and non-same-origin cases", () => {
  const rec = nextRecentRecord(null, A, T0);
  assert.deepEqual(selectFallbackUtm(rec, `${ORIGIN}/`, ORIGIN, T0 + 1000), A);
  assert.equal(selectFallbackUtm(rec, "", ORIGIN, T0 + 1000), null);
  assert.equal(selectFallbackUtm(rec, "https://x.example/", ORIGIN, T0 + 1000), null);
  assert.equal(selectFallbackUtm(rec, `${ORIGIN}/`, ORIGIN, T0 + RECENT_UTM_WINDOW_MS), null);
  assert.equal(selectFallbackUtm({ ...rec, ambiguous: true }, `${ORIGIN}/`, ORIGIN, T0 + 1000), null);
  assert.equal(selectFallbackUtm(null, `${ORIGIN}/`, ORIGIN, T0), null);
});

test("same tab: landing, then navigation without UTM, keeps attribution", () => {
  const b = browser();
  const s = newTab(b, { search: qs(A) });
  assert.deepEqual(at(T0, captureLandingUtm), A);
  useTab(b, s, { search: "", referrer: `${ORIGIN}/` });
  assert.deepEqual(at(T0 + 5000, captureLandingUtm), A);
});

test("new tab opened from the site inherits the attribution", () => {
  const b = browser();
  newTab(b, { search: qs(A) });
  at(T0, captureLandingUtm);
  newTab(b, { search: "", referrer: `${ORIGIN}/` });
  assert.deepEqual(at(T0 + 60_000, captureLandingUtm), A);
});

test("copied/typed/bookmarked or externally shared case links get nothing", () => {
  const b = browser();
  newTab(b, { search: qs(A) });
  at(T0, captureLandingUtm);
  for (const referrer of ["", "https://mail.example.com/thread", "https://www.linkedin.com/"]) {
    newTab(b, { search: "", referrer });
    assert.deepEqual(at(T0 + 60_000, captureLandingUtm), {}, `referrer=${referrer}`);
  }
});

test("expired record is not adopted (30 minutes)", () => {
  const b = browser();
  newTab(b, { search: qs(A) });
  at(T0, captureLandingUtm);
  newTab(b, { search: "", referrer: `${ORIGIN}/` });
  assert.deepEqual(at(T0 + RECENT_UTM_WINDOW_MS, captureLandingUtm), {});
});

test("sliding window: activity in the attributed tab keeps the record alive", () => {
  const b = browser();
  const s = newTab(b, { search: qs(A) });
  at(T0, captureLandingUtm);
  useTab(b, s, { referrer: `${ORIGIN}/` });
  at(T0 + 25 * 60_000, captureLandingUtm);
  newTab(b, { search: "", referrer: `${ORIGIN}/` });
  assert.deepEqual(at(T0 + 50 * 60_000, captureLandingUtm), A);
});

test("explicit UTM always wins over the fallback and own session", () => {
  const b = browser();
  newTab(b, { search: qs(A) });
  at(T0, captureLandingUtm);
  newTab(b, { search: qs(B), referrer: `${ORIGIN}/` });
  assert.deepEqual(at(T0 + 1000, captureLandingUtm), B);
});

test("never assigns campaign A to campaign B: two campaigns => ambiguous => no fallback", () => {
  const b = browser();
  const sa = newTab(b, { search: qs(A) });
  at(T0, captureLandingUtm);
  const sb = newTab(b, { search: qs(B) });
  assert.deepEqual(at(T0 + 1000, captureLandingUtm), B);
  // each tab keeps its own attribution
  useTab(b, sa, { referrer: `${ORIGIN}/` });
  assert.deepEqual(at(T0 + 2000, captureLandingUtm), A);
  useTab(b, sb, { referrer: `${ORIGIN}/` });
  assert.deepEqual(at(T0 + 3000, captureLandingUtm), B);
  // a brand-new tab cannot know which campaign it belongs to => rejected
  newTab(b, { search: "", referrer: `${ORIGIN}/` });
  assert.deepEqual(at(T0 + 4000, captureLandingUtm), {});
});

test("a tab that started direct never adopts a campaign on later loads", () => {
  const b = browser();
  newTab(b, { search: qs(A) });
  at(T0, captureLandingUtm);
  const direct = newTab(b, { search: "", referrer: "" });
  assert.deepEqual(at(T0 + 1000, captureLandingUtm), {});
  useTab(b, direct, { search: "", referrer: `${ORIGIN}/` });
  assert.deepEqual(at(T0 + 2000, captureLandingUtm), {});
});

test("storage unavailable: explicit UTM still works, nothing throws (fail-open)", () => {
  const broken = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
  globalThis.window = { location: { search: qs(A), origin: ORIGIN }, sessionStorage: broken, localStorage: broken };
  globalThis.document = { referrer: "" };
  assert.deepEqual(at(T0, captureLandingUtm), A);
  globalThis.window.location.search = "";
  assert.deepEqual(at(T0 + 1, captureLandingUtm), {});
});

test("clearStoredUtm removes both copies", () => {
  const b = browser();
  newTab(b, { search: qs(A) });
  at(T0, captureLandingUtm);
  clearStoredUtm();
  newTab(b, { search: "", referrer: `${ORIGIN}/` });
  assert.deepEqual(at(T0 + 1000, captureLandingUtm), {});
});
