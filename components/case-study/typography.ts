/**
 * Shared case-study layout/typography tokens. One source of truth so the
 * hero, every section card, and image captions can never drift apart.
 * (Plain module, not a client file, so server components can import it.)
 */

/** Outer width of the hero card, every section card, and the bottom nav row. */
export const CASE_CONTAINER_CLASS = "mx-auto max-w-[1400px] px-4 sm:px-6";

/** Readable inner text column inside a full-width card (left-aligned). */
export const CASE_TEXT_WIDTH_CLASS = "w-full max-w-[58rem]";

/** The one body-copy size/leading: 17px on phones, 20px from `sm` up. */
export const CASE_BODY_SIZE_CLASS = "text-[17px] leading-[1.65] sm:text-xl sm:leading-[1.7]";

/** Image captions: clearly secondary, but only slightly below body size. */
export const CASE_CAPTION_SIZE_CLASS = "text-[15px] leading-snug sm:text-[17px]";

/**
 * Body paragraph: justified (a last line stays left-aligned per the CSS
 * spec), safe wrapping for very narrow widths, bright body color.
 */
export const CASE_BODY_TEXT_CLASS = `${CASE_TEXT_WIDTH_CLASS} whitespace-pre-line text-justify [text-justify:inter-word] [overflow-wrap:anywhere] font-normal text-body-foreground ${CASE_BODY_SIZE_CLASS}`;
