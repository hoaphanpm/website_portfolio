import { SECTION_LABELS, type SectionId } from "@/lib/cases/constants";

/**
 * MoMo v2 page configuration — the two values that decide how this static
 * page participates in analytics. Both are deliberately inert for the
 * visual-skeleton iteration.
 */

/**
 * PLACEHOLDER. The real value must be the existing MoMo CMS case_id so v2
 * shares the production funnel (approved decision #3). It is not stored in
 * the repo (content lives in Supabase) — fill in after the final-content
 * milestone. Do not ship events with this placeholder.
 */
export const MOMO_V2_CASE_ID = "TODO-existing-momo-case-id";
export const MOMO_V2_CASE_NAME = "TODO-existing-momo-case-name";
export const MOMO_V2_DISPLAY_POSITION = 0;

/**
 * Master switch for case_study_opened / case_section_viewed /
 * case_study_completed on this page. Kept false until the real case_id above
 * is set and the content is approved, so the draft skeleton can never send
 * events into the production funnel. All gating from lib/analytics/gating.ts
 * (production env, no admin, no ?preview=true) still applies on top of this.
 */
export const MOMO_V2_EVENTS_ENABLED = false;

/** Section the existing funnel treats as completion (spec §6 default). */
export const MOMO_V2_COMPLETION_SECTION = "reflection";

/**
 * Miro board for the full product analysis. Leave empty until the real
 * share URL exists — the reference block on the page stays hidden while
 * this is empty or not a valid https URL. Never put an invented URL here.
 */
export const MIRO_CASE_STUDY_URL = "";

/**
 * Visible section labels for this page only. The shared SECTION_LABELS
 * (used by every case study) still says "Experience"; the section id and
 * tracking value stay `experience`.
 */
export const MOMO_SECTION_LABELS: Record<SectionId, string> = {
  ...SECTION_LABELS,
  experience: "Experiment",
};
