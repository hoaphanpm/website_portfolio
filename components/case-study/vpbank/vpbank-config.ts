/**
 * VPBank static page configuration. Deliberately inert: the case_id is a
 * placeholder and events are disabled, so this unlisted draft can never send
 * events into the production funnel. Decide the case_id mapping (CMS
 * case_id `vpbank-ai-debt-management` vs this page's URL slug) before
 * enabling events.
 */

/** Working URL slug of this static page: /case-studies/<slug>. */
export const VPBANK_SLUG = "vpbank-ai-debt-management-v2";

/** PLACEHOLDER — do not ship events with this value. */
export const VPBANK_CASE_ID = "TODO-vpbank-case-id";
export const VPBANK_CASE_NAME = "VPBank - AI-Assisted Debt Management";
export const VPBANK_DISPLAY_POSITION = 0;

/** Master switch for the three case events on this page. */
export const VPBANK_EVENTS_ENABLED = false;

/** Section the existing funnel treats as completion (CMS: reflection). */
export const VPBANK_COMPLETION_SECTION = "reflection";

export const VPBANK_IMAGE_BASE = "/images/case-studies/vpbank";
