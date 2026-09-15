import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { CaseRenderer } from "@/components/case-study/case-renderer";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getCaseForPublicView } from "@/lib/cases/public-queries";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ case_id: string }>;
  searchParams: Promise<{ preview?: string }>;
};

/**
 * Memoized per request (React cache()) so generateMetadata and the page
 * body share one set of queries instead of loading the case twice.
 *
 * Admin draft preview (docs/architecture.md §4 step 5; Milestone 7
 * correction #7): a draft is visible ONLY when ?preview=true is present
 * AND the caller is a confirmed admin — not merely because an admin
 * session exists. Visiting a draft's bare URL, even as admin, still
 * 404s (see app/admin/(protected)/cases/[id]/preview-link.tsx, which is
 * the only place that ever links to the ?preview=true form). This is an
 * application-layer choice on top of RLS, which would technically allow
 * an admin to read the row regardless.
 */
const loadCaseForPage = cache(async (caseId: string, isPreview: boolean) => {
  let allowDraft = false;

  if (isPreview) {
    const supabase = await createClient();
    allowDraft = await requireAdmin(supabase);
  }

  return getCaseForPublicView(caseId, allowDraft);
});

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { case_id: caseId } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";

  // Deliberately never throws here, even for a genuine query failure
  // ("error"), and treats it the same as "not_found" for metadata
  // purposes. Next.js's metadata-resolution phase is separate from the
  // page's own render tree, so a throw here does NOT reach the co-located
  // error.tsx boundary the way a throw from the page component does
  // (confirmed empirically — see supabase/README.md-style verification
  // notes in the Milestone 7 report). Only the page component below
  // distinguishes "not found" from "error"; this function's only job is
  // to never produce a broken/misleading response of its own.
  let result: Awaited<ReturnType<typeof loadCaseForPage>>;
  try {
    result = await loadCaseForPage(caseId, isPreview);
  } catch {
    return { title: "Case study" };
  }

  if (result.kind !== "found") {
    return { title: "Case study" };
  }

  return {
    title: result.case.case_name,
    description: result.case.summary ?? undefined,
    // Always noindex while ?preview=true, regardless of case status or
    // viewer — cheap, harmless, and matches architecture.md step 5.
    ...(isPreview ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function CaseStudyPage({
  params,
  searchParams,
}: PageProps) {
  const { case_id: caseId } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";

  const result = await loadCaseForPage(caseId, isPreview);

  if (result.kind === "not_found") {
    // Missing, draft, unpublished, or preview-without-admin — all
    // identical, per approved decision #5 / correction #8.
    notFound();
  }

  if (result.kind === "error") {
    // A genuine query failure, not "no such case". Caught by the sibling
    // error.tsx, which renders a fixed generic message and never this
    // (or any) error detail — see lib/cases/public-queries.ts, where the
    // real error was already logged server-side.
    throw new Error("Failed to load case for public view");
  }

  return <CaseRenderer caseDetail={result.case} />;
}
