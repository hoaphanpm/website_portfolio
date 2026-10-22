import { SECTION_LABELS } from "@/lib/cases/constants";

/**
 * MoMo v2 page configuration — how this static page participates in
 * analytics. The case_id is the page's URL slug (/case-studies/<slug>), so
 * the case events, homepage entry source and footer attribution all agree.
 */

export const MOMO_V2_CASE_ID = "momo-salary-v2";
export const MOMO_V2_CASE_NAME = "Turning Payday Cash-Out Into a First Savings Habit";
export const MOMO_V2_DISPLAY_POSITION = 1;

/**
 * Master switch for case_study_opened / case_section_viewed /
 * case_study_completed on this page. All gating from lib/analytics/gating.ts
 * (production env, no admin, no ?preview=true) still applies on top of this.
 */
export const MOMO_V2_EVENTS_ENABLED = true;

/** Section the existing funnel treats as completion (spec §6 default). */
export const MOMO_V2_COMPLETION_SECTION = "reflection";

/**
 * Miro board for the full product analysis. Leave empty until the real
 * share URL exists — the reference block on the page stays hidden while
 * this is empty or not a valid https URL. Never put an invented URL here.
 */
export const MIRO_CASE_STUDY_URL = "";

/**
 * Page-local section ids: the seventh section is `experiment` (DOM anchor,
 * navigation and the `section_id` tracking value). The shared SECTION_IDS /
 * SECTION_LABELS (CMS) keep `experience` and are intentionally untouched.
 */
export const MOMO_SECTION_IDS = [
  "overview",
  "problem",
  "evidence",
  "insight",
  "decision",
  "solution",
  "experiment",
  "measure",
  "reflection",
] as const;

export type MomoSectionId = (typeof MOMO_SECTION_IDS)[number];

export const MOMO_SECTION_LABELS: Record<MomoSectionId, string> = {
  overview: SECTION_LABELS.overview,
  problem: SECTION_LABELS.problem,
  evidence: SECTION_LABELS.evidence,
  insight: SECTION_LABELS.insight,
  decision: SECTION_LABELS.decision,
  solution: SECTION_LABELS.solution,
  experiment: "Experiment",
  measure: SECTION_LABELS.measure,
  reflection: SECTION_LABELS.reflection,
};
