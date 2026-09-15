import { getPublishedCases } from "@/lib/cases/public-queries";

import { CaseCard } from "./case-card";

export async function SelectedWork() {
  const { cases, error } = await getPublishedCases();

  return (
    <section id="case-studies" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h2 className="text-2xl font-semibold">Case Studies</h2>

      {error ? (
        <p className="mt-4 text-sm text-destructive">
          Could not load case studies right now.
        </p>
      ) : cases.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Case studies are coming soon.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {cases.map((caseItem) => (
            <CaseCard key={caseItem.case_id} caseItem={caseItem} />
          ))}
        </div>
      )}
    </section>
  );
}
