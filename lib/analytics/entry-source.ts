import { ENTRY_SOURCES, type EntrySource } from "@/lib/analytics/constants";

/**
 * entry_source propagation — docs/architecture.md §5. No query parameters
 * are used (a copied/shared link can never carry a false "homepage"
 * source); instead the two internal links that know their own source write
 * a one-time sessionStorage marker right before navigating, and the case
 * page consumes it on load.
 */

const STORAGE_KEY = "analytics_entry_source";

type EntrySourceMarker = {
  source: EntrySource;
  caseId: string;
};

function isEntrySource(value: unknown): value is EntrySource {
  return (
    typeof value === "string" &&
    (ENTRY_SOURCES as readonly string[]).includes(value)
  );
}

/**
 * Called from components/home/case-card.tsx ("homepage") and
 * components/case-study/next-case-link.tsx ("next_case"), on click, before
 * the <Link> navigation completes.
 */
export function markEntrySource(source: EntrySource, caseId: string): void {
  try {
    const marker: EntrySourceMarker = { source, caseId };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(marker));
  } catch {
    // Ignore — worst case entry_source falls back to direct_or_external
    // below, which is always a safe, valid value on the central list.
  }
}

/**
 * Reads and removes the marker unconditionally — even when the caller
 * (components/analytics/case-study-opened-tracker.tsx) won't end up using
 * the result because case_study_opened was already deduplicated this
 * session. Otherwise a stale marker could leak into a later, unrelated
 * case open (architecture.md §5 point 4).
 *
 * Falls back to "direct_or_external" whenever the marker is absent,
 * malformed, holds a value not on the central list, or doesn't match the
 * case actually being opened — never a fabricated or invented value.
 */
export function consumeEntrySource(caseId: string): EntrySource {
  let marker: EntrySourceMarker | null = null;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);

    if (raw) {
      const parsed = JSON.parse(raw) as Partial<EntrySourceMarker>;
      if (isEntrySource(parsed.source) && typeof parsed.caseId === "string") {
        marker = { source: parsed.source, caseId: parsed.caseId };
      }
    }
  } catch {
    // Malformed/unavailable storage — fall through to direct_or_external.
  }

  if (marker && marker.caseId === caseId) {
    return marker.source;
  }
  return "direct_or_external";
}
