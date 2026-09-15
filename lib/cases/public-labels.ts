import type { SectionId } from "./constants";

/**
 * Public-facing section titles, matching docs/design-reference.png's own
 * copy exactly. Deliberately separate from lib/cases/constants.ts's
 * SECTION_LABELS (the admin's plain Title-Case labels, e.g. "Overview") —
 * that file is untouched by this milestone. section_id itself remains the
 * single fixed identifier throughout; this is display copy only.
 */
export const PUBLIC_SECTION_LABELS: Record<SectionId, string> = {
  overview: "At a Glance",
  problem: "The Challenge",
  evidence: "Finding the Real Problem",
  insight: "Key Insight",
  decision: "Product Decision",
  solution: "The Solution",
  experience: "Experience",
  measure: "Validation & Metrics",
  reflection: "Reflection",
};
