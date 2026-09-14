import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Mirrors the cases_case_id_slug_check DB constraint exactly (see
// supabase/migrations/20260911140003_cases.sql) — this is the friendly,
// server-side pre-check; the DB constraint remains the authoritative one.
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining accents (after NFKD above)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return base || "case";
}

/**
 * Generates a unique case_id for a new case: slugify(caseName), then
 * append -2, -3, ... if taken. This is a server-side convenience only — a
 * genuine race is still caught by the database's own unique constraint
 * (cases_case_id_key), which createCase() surfaces as a plain error if it
 * ever fires (accepted limitation for a single-admin MVP, consistent with
 * supabase/README.md's existing "no concurrency testing" note).
 */
export async function generateUniqueCaseId(
  supabase: SupabaseServerClient,
  caseName: string,
): Promise<string> {
  const base = slugify(caseName);
  let candidate = base;
  let suffix = 2;

  for (let attempts = 0; attempts < 50; attempts++) {
    const { data, error } = await supabase
      .from("cases")
      .select("id")
      .eq("case_id", candidate)
      .maybeSingle();

    if (error) {
      throw new Error("Could not check case_id uniqueness.");
    }
    if (!data) {
      return candidate;
    }
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  throw new Error("Could not generate a unique case_id.");
}
