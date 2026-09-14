/**
 * The fixed 9 section IDs, in the fixed order the database itself uses to
 * assign section_index (docs/architecture.md decision D1; mirrors the
 * case_sections_section_id_check constraint in
 * supabase/migrations/20260911140004_case_sections.sql). Single source of
 * truth for the admin UI — never allow free-text section_id input.
 */
export const SECTION_IDS = [
  "overview",
  "problem",
  "evidence",
  "insight",
  "decision",
  "solution",
  "experience",
  "measure",
  "reflection",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export function isSectionId(value: string): value is SectionId {
  return (SECTION_IDS as readonly string[]).includes(value);
}

export const SECTION_LABELS: Record<SectionId, string> = {
  overview: "Overview",
  problem: "Problem",
  evidence: "Evidence",
  insight: "Insight",
  decision: "Decision",
  solution: "Solution",
  experience: "Experience",
  measure: "Measure",
  reflection: "Reflection",
};
