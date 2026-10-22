/**
 * Central SEO constants. The canonical site URL is the verified Production
 * domain; it is a constant (not an env var) so canonical URLs can never
 * resolve to localhost or a preview deployment.
 *
 * Homepage wording is the approved launch copy (title, description and the
 * shorter social description).
 */
export const SITE_URL = "https://hoakimphan-portfolio.vercel.app";
export const SITE_NAME = "Hoa Phan Portfolio";
export const OWNER_NAME = "Hoa Phan";

export const HOME_TITLE = "Hoa Phan | Product Manager";
export const HOME_DESCRIPTION =
  "Product Manager with a quality engineering background, exploring fintech, lending, product strategy, and customer-centered growth through case studies and writing.";
export const HOME_SOCIAL_DESCRIPTION =
  "Product case studies and writing on fintech, lending, customer behavior, and turning complex business problems into clear product decisions.";

/** Public, indexable static routes (also used by app/sitemap.ts). */
export const PUBLIC_PATHS = [
  "/",
  "/case-studies/momo-salary-v2",
  "/case-studies/vpbank-ai-debt-management-v2",
] as const;
