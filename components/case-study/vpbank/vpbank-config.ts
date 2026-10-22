/**
 * VPBank static page configuration. The case_id is the page's URL slug, so
 * the case events, homepage entry source and footer attribution all agree.
 * All gating from lib/analytics/gating.ts (production env, no admin, no
 * ?preview=true) still applies on top of the events flag.
 */

/** Working URL slug of this static page: /case-studies/<slug>. */
export const VPBANK_SLUG = "vpbank-ai-debt-management-v2";

export const VPBANK_CASE_ID = "vpbank-ai-debt-management-v2";
export const VPBANK_CASE_NAME = "VPBank – AI-Assisted Debt Management";
export const VPBANK_DISPLAY_POSITION = 2;

/** Master switch for the three case events on this page. */
export const VPBANK_EVENTS_ENABLED = true;

/** Section the existing funnel treats as completion (CMS: reflection). */
export const VPBANK_COMPLETION_SECTION = "reflection";

export const VPBANK_IMAGE_BASE = "/images/case-studies/vpbank";
