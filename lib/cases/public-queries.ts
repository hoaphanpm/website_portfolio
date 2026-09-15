import { createClient } from "@/lib/supabase/server";

import type { SectionId } from "./constants";

export type PublicCaseSummary = {
  case_id: string;
  case_name: string;
  summary: string | null;
  tags: string[];
  display_position: number;
};

export type PublicCaseSection = {
  section_id: SectionId;
  section_index: number;
  content: { heading?: string; body?: string } & Record<string, unknown>;
};

export type PublicCaseDetail = {
  id: string;
  case_id: string;
  case_name: string;
  headline: string | null;
  summary: string | null;
  tags: string[];
  hero_image_id: string | null;
  heroImageAlt: string | null;
  completion_section: string | null;
  display_position: number;
  status: string;
  sections: PublicCaseSection[];
};

/**
 * Distinguishes "no such visible case" from a genuine operational failure
 * (Milestone 7 correction #8) — the former is a 404, the latter is not.
 */
export type PublicCaseViewResult =
  | { kind: "found"; case: PublicCaseDetail }
  | { kind: "not_found" }
  | { kind: "error" };

/**
 * Published cases only, for the homepage's Selected Work section.
 *
 * No new authorization logic: this runs through the same cookie-bound
 * client (lib/supabase/server.ts) used everywhere else in the app. For a
 * non-logged-in visitor that's simply the anon role, and the existing RLS
 * policy on `cases` (Milestone 1: `status = 'published' OR is_admin()`) is
 * the actual enforcement — this query can't return a draft regardless of
 * the `.eq("status", "published")` filter below, which is here only for a
 * smaller result set, not as the security boundary.
 */
export async function getPublishedCases(): Promise<{
  cases: PublicCaseSummary[];
  error: boolean;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cases")
    .select("case_id, case_name, summary, tags, display_position")
    .eq("status", "published")
    .order("display_position", { ascending: true });

  if (error) {
    return { cases: [], error: true };
  }

  return { cases: data ?? [], error: false };
}

/**
 * Loads one case for the public /work/[case_id] page, plus its sections
 * and (if set) its hero image's alt text.
 *
 * allowDraft is computed by the caller (admin session + ?preview=true —
 * see app/(public)/work/[case_id]/page.tsx) and is the only thing that
 * changes which rows are visible; RLS (Milestone 1) remains the actual
 * enforcement either way. A genuine query failure at any of the three
 * steps returns "error" rather than being treated as "not found" — the
 * page must not turn a real outage into a misleading 404.
 */
export async function getCaseForPublicView(
  caseId: string,
  allowDraft: boolean,
): Promise<PublicCaseViewResult> {
  const supabase = await createClient();

  let query = supabase
    .from("cases")
    .select(
      "id, case_id, case_name, headline, summary, tags, hero_image_id, completion_section, display_position, status",
    )
    .eq("case_id", caseId);

  if (!allowDraft) {
    query = query.eq("status", "published");
  }

  const { data: caseRow, error: caseError } = await query.maybeSingle();

  if (caseError) {
    console.error("getCaseForPublicView: cases query failed:", caseError);
    return { kind: "error" };
  }
  if (!caseRow) {
    return { kind: "not_found" };
  }

  const { data: sections, error: sectionsError } = await supabase
    .from("case_sections")
    .select("section_id, section_index, content")
    .eq("case_id", caseRow.id)
    .order("section_index", { ascending: true });

  if (sectionsError) {
    console.error(
      "getCaseForPublicView: sections query failed:",
      sectionsError,
    );
    return { kind: "error" };
  }

  let heroImageAlt: string | null = null;
  if (caseRow.hero_image_id) {
    const { data: heroImage, error: heroImageError } = await supabase
      .from("case_images")
      .select("alt_text")
      .eq("id", caseRow.hero_image_id)
      .maybeSingle();

    if (heroImageError) {
      console.error(
        "getCaseForPublicView: hero image query failed:",
        heroImageError,
      );
      return { kind: "error" };
    }
    heroImageAlt = heroImage?.alt_text ?? null;
  }

  return {
    kind: "found",
    case: {
      ...caseRow,
      heroImageAlt,
      sections: (sections ?? []) as PublicCaseSection[],
    },
  };
}

/**
 * Next published case by display_position, wrapping last -> first. Reuses
 * getPublishedCases() rather than a separate query. Returns null when
 * there's only one published case (Next case is hidden entirely — decision
 * #9) or when the current case isn't itself in the published list (e.g.
 * previewing a draft — see components/case-study/case-renderer.tsx, which
 * only calls this for a published case in the first place).
 */
export async function getAdjacentPublishedCase(
  currentCaseId: string,
): Promise<{ case_id: string } | null> {
  const { cases, error } = await getPublishedCases();

  if (error || cases.length <= 1) {
    return null;
  }

  const currentIndex = cases.findIndex((c) => c.case_id === currentCaseId);
  if (currentIndex === -1) {
    return null;
  }

  const nextIndex = (currentIndex + 1) % cases.length;
  return { case_id: cases[nextIndex].case_id };
}
