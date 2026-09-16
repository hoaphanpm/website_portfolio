"use client";

import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { markEntrySource } from "@/lib/analytics/entry-source";
import type { PublicCaseSummary } from "@/lib/cases/public-queries";

/**
 * Milestone 7 (correction #10): activated now that /work/[case_id] exists.
 * Milestone 9: "use client" so it can mark entry_source = "homepage" on
 * click, before the <Link> navigation completes (architecture.md §5).
 */
export function CaseCard({ caseItem }: { caseItem: PublicCaseSummary }) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold">{caseItem.case_name}</h3>
        {caseItem.summary ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {caseItem.summary}
          </p>
        ) : null}
        {caseItem.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {caseItem.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        <Link
          href={`/work/${caseItem.case_id}`}
          onClick={() => markEntrySource("homepage", caseItem.case_id)}
          className="mt-4 inline-block text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Explore case →
        </Link>
      </CardContent>
    </Card>
  );
}
