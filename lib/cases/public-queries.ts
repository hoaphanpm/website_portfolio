import { createClient } from "@/lib/supabase/server";

export type PublicCaseSummary = {
  case_id: string;
  case_name: string;
  summary: string | null;
  tags: string[];
  display_position: number;
};

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
