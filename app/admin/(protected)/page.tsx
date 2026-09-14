import { createClient } from "@/lib/supabase/server";

import { CaseList } from "./case-list";
import { NewCaseForm } from "./new-case-form";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: cases, error } = await supabase
    .from("cases")
    .select("id, case_id, case_name, status, display_position")
    .order("display_position", { ascending: true });

  // case_sections.case_id is the uuid FK to cases.id (not the text slug —
  // cases.case_id is a different column with the same name). Counted
  // separately rather than via a relational embed, to keep this simple and
  // easy to verify without depending on exact PostgREST count-embed syntax.
  const { data: sectionRows } = await supabase
    .from("case_sections")
    .select("case_id");

  const sectionCounts: Record<string, number> = {};
  for (const row of sectionRows ?? []) {
    sectionCounts[row.case_id] = (sectionCounts[row.case_id] ?? 0) + 1;
  }

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-xl font-semibold">New case</h1>
        <div className="mt-3">
          <NewCaseForm />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Cases</h2>
        {error ? (
          <p className="mt-2 text-sm text-destructive">
            Could not load cases.
          </p>
        ) : !cases || cases.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No cases yet. Create one above.
          </p>
        ) : (
          <div className="mt-3">
            <CaseList cases={cases} sectionCounts={sectionCounts} />
          </div>
        )}
      </section>
    </div>
  );
}
