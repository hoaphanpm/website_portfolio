import Link from "next/link";

/**
 * Scoped to /work/[case_id] only (approved decision #4) — a missing,
 * draft, unpublished, or unauthorized-preview case all render this exact
 * same page, indistinguishably. Bare /work is unaffected and keeps
 * Next.js's default 404.
 */
export default function CaseNotFound() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-2xl font-semibold">Case study not found</h1>
      <p className="mt-2 text-muted-foreground">
        This case study doesn&apos;t exist or isn&apos;t published.
      </p>
      <Link
        href="/#case-studies"
        className="mt-6 inline-block text-sm font-medium underline-offset-4 hover:underline"
      >
        ← Back to homepage
      </Link>
    </div>
  );
}
