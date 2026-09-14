import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

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

  const sectionCounts = new Map<string, number>();
  for (const row of sectionRows ?? []) {
    sectionCounts.set(row.case_id, (sectionCounts.get(row.case_id) ?? 0) + 1);
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
          <ul className="mt-3 divide-y divide-border rounded-md border border-border">
            {cases.map((c) => {
              const count = sectionCounts.get(c.id) ?? 0;
              return (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div>
                    <Link
                      href={`/admin/cases/${c.id}`}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {c.case_name}
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      {c.case_id} · {count} section{count === 1 ? "" : "s"}
                    </div>
                  </div>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                    {c.status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
