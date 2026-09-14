"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SECTION_LABELS, type SectionId } from "@/lib/cases/constants";

import { updateCaseFields } from "./actions";
import { caseFieldsInitialState } from "./types";

type CaseRow = {
  id: string;
  case_id: string;
  case_name: string;
  headline: string | null;
  summary: string | null;
  tags: string[];
  completion_section: string | null;
};

type SectionRow = { section_id: string };

export function CaseFieldsForm({
  caseRow,
  sections,
}: {
  caseRow: CaseRow;
  sections: SectionRow[];
}) {
  const [state, formAction, isPending] = useActionState(
    updateCaseFields,
    caseFieldsInitialState,
  );

  // D9: pre-select "reflection" when nothing is set yet and that section
  // already exists on this case.
  const defaultCompletionSection =
    caseRow.completion_section ??
    (sections.some((s) => s.section_id === "reflection") ? "reflection" : "");

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <input type="hidden" name="case_row_id" value={caseRow.id} />

      <div className="space-y-2">
        <Label htmlFor="case_name">Case name</Label>
        <Input
          id="case_name"
          name="case_name"
          defaultValue={caseRow.case_name}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="case_id">Case ID (URL slug)</Label>
        <Input
          id="case_id"
          name="case_id"
          defaultValue={caseRow.case_id}
          required
        />
        <p className="text-xs text-muted-foreground">
          Lowercase letters, numbers and single hyphens only. Editable until
          this case is first published.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="headline">Headline</Label>
        <Input id="headline" name="headline" defaultValue={caseRow.headline ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Summary</Label>
        <Textarea
          id="summary"
          name="summary"
          defaultValue={caseRow.summary ?? ""}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          name="tags"
          defaultValue={caseRow.tags.join(", ")}
          placeholder="Lending, JTBD, Product Discovery"
        />
        <p className="text-xs text-muted-foreground">Comma-separated.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="completion_section">Completion section</Label>
        <Select
          id="completion_section"
          name="completion_section"
          defaultValue={defaultCompletionSection}
        >
          <option value="">— None —</option>
          {sections.map((s) => (
            <option key={s.section_id} value={s.section_id}>
              {SECTION_LABELS[s.section_id as SectionId] ?? s.section_id}
            </option>
          ))}
        </Select>
        <p className="text-xs text-muted-foreground">
          Only sections currently added to this case can be chosen.
        </p>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : state.success ? (
        <p className="text-sm text-emerald-600" role="status">
          Saved.
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save case details"}
      </Button>
    </form>
  );
}
