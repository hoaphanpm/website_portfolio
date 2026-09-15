/**
 * Central analytics lists — docs/portfolio-tracking-spec.md §2/§4/§7/§13.
 * No event, property, action, or location is ever created outside these
 * lists; nothing in this app hardcodes an ad-hoc string for any of them.
 *
 * Section IDs are intentionally NOT redefined here — they're reused
 * verbatim from the existing SECTION_IDS/SectionId in lib/cases/constants.ts
 * (Milestone 3), which is already the single source of truth.
 */

/** Exactly these 5 events — portfolio-tracking-spec.md §2. Never add a 6th. */
export const EVENT_NAMES = {
  PORTFOLIO_VIEWED: "portfolio_viewed",
  CASE_STUDY_OPENED: "case_study_opened",
  CASE_SECTION_VIEWED: "case_section_viewed",
  CASE_STUDY_COMPLETED: "case_study_completed",
  HIGH_INTENT_ACTION: "high_intent_action",
} as const;

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];

/** portfolio-tracking-spec.md §5 / architecture.md §5 "entry_source". */
export const ENTRY_SOURCES = [
  "homepage",
  "next_case",
  "direct_or_external",
] as const;

export type EntrySource = (typeof ENTRY_SOURCES)[number];

/**
 * portfolio-tracking-spec.md §7. "book_call" is explicitly listed there as
 * "Future" — not an active value yet, since nothing in this app emits it.
 * Adding it later means appending one string here, no component changes.
 */
export const HIGH_INTENT_ACTIONS = [
  "download_cv",
  "linkedin_click",
  "email_click",
] as const;

export type HighIntentAction = (typeof HIGH_INTENT_ACTIONS)[number];

/**
 * portfolio-tracking-spec.md §7 ("V4 — tránh typo phá funnel") plus
 * docs/architecture.md decision D9's addition of homepage_contact for the
 * design's Contact section.
 */
export const HIGH_INTENT_LOCATIONS = [
  "homepage_hero",
  "navbar",
  "homepage_contact",
  "homepage_footer",
  "case_footer",
] as const;

export type HighIntentLocation = (typeof HIGH_INTENT_LOCATIONS)[number];
