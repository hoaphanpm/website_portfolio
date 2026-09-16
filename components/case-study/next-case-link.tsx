"use client";

import Link from "next/link";

import { markEntrySource } from "@/lib/analytics/entry-source";

export function NextCaseLink({ caseId }: { caseId: string }) {
  return (
    <Link
      href={`/work/${caseId}`}
      onClick={() => markEntrySource("next_case", caseId)}
      className="text-sm font-medium underline-offset-4 hover:underline"
    >
      Next case →
    </Link>
  );
}
