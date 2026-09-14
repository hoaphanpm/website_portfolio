"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SECTION_LABELS, type SectionId } from "@/lib/cases/constants";

import { addSection } from "./actions";
import { sectionFormInitialState } from "./types";

export function AddSectionForm({
  caseId,
  availableSectionIds,
}: {
  caseId: string;
  availableSectionIds: SectionId[];
}) {
  const [state, formAction, isPending] = useActionState(
    addSection,
    sectionFormInitialState,
  );

  return (
    <form
      action={formAction}
      className="max-w-xl space-y-3 rounded-md border border-dashed border-border p-4"
    >
      <input type="hidden" name="case_row_id" value={caseId} />

      <div className="space-y-2">
        <Label htmlFor="section_id">Section type</Label>
        <Select id="section_id" name="section_id" defaultValue={availableSectionIds[0]}>
          {availableSectionIds.map((id) => (
            <option key={id} value={id}>
              {SECTION_LABELS[id]}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-heading">Heading</Label>
        <Input id="new-heading" name="heading" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-body">Body</Label>
        <Textarea id="new-body" name="body" rows={3} />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : state.success ? (
        <p className="text-sm text-emerald-600" role="status">
          Section added.
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding…" : "Add section"}
      </Button>
    </form>
  );
}
