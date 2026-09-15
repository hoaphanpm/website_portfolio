"use client";

import Link from "next/link";

/**
 * Milestone 7 correction #8: a genuine database/query failure must be
 * distinguishable from "not found," but must never leak raw Supabase/
 * Postgres error detail to a visitor. This deliberately never reads or
 * renders the `error`/`error.message` prop Next.js passes here — the
 * real failure was already logged server-side in
 * lib/cases/public-queries.ts. Only this fixed, generic message is shown,
 * regardless of what actually failed.
 */
export default function CaseStudyError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">
        We couldn&apos;t load this case study right now. Please try again
        shortly.
      </p>
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="text-sm font-medium underline-offset-4 hover:underline"
        >
          Try again
        </button>
        <Link
          href="/#case-studies"
          className="text-sm font-medium underline-offset-4 hover:underline"
        >
          ← Back to homepage
        </Link>
      </div>
    </div>
  );
}
