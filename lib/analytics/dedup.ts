/**
 * Generic page-level/section-level event dedup — portfolio-tracking-spec.md
 * §2 ("Deduplication theo browser session") and §5 ("In-memory Set dùng để
 * chống duplicate khi page đang mở. sessionStorage dùng để giữ trạng thái
 * deduplication sau khi refresh hoặc điều hướng").
 *
 * Nothing calls markTrackedOnce() anywhere yet — that's Milestone 9, which
 * will decide *when* each of the 5 events has qualified. This module only
 * provides the primitive and the exact key formats the spec defines.
 */

const sessionTracked = new Set<string>();

export function hasTrackedOnce(key: string): boolean {
  if (sessionTracked.has(key)) {
    return true;
  }
  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    // sessionStorage unavailable (private browsing, etc.) — the in-memory
    // Set is still authoritative for the current page load.
    return false;
  }
}

export function markTrackedOnce(key: string): void {
  sessionTracked.add(key);
  try {
    window.sessionStorage.setItem(key, "1");
  } catch {
    // Ignore — same-page-load dedup via the in-memory Set still holds;
    // only cross-refresh/navigation dedup is lost.
  }
}

/** portfolio-tracking-spec.md §2 dedup key table. */
export const DEDUP_KEYS = {
  portfolioViewed: () => "viewed_portfolio",
  caseStudyOpened: (caseId: string) => `opened_case:${caseId}`,
  // §5: "Deduplication key phải kết hợp case_id + section_id" — never
  // section_id alone, since two different cases can share a section_id.
  caseSectionViewed: (caseId: string, sectionId: string) =>
    `viewed_section:${caseId}:${sectionId}`,
} as const;
