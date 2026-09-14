"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SECTION_LABELS, type SectionId } from "@/lib/cases/constants";

import { deleteSection, updateSectionContent } from "./actions";
import { sectionFormInitialState } from "./types";

type SectionRow = {
  id: string;
  section_id: string;
  section_index: number;
  content: Record<string, unknown> | null;
};

export function SectionItem({
  caseId,
  section,
}: {
  caseId: string;
  section: SectionRow;
}) {
  const [updateState, updateAction, updatePending] = useActionState(
    updateSectionContent,
    sectionFormInitialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteSection,
    sectionFormInitialState,
  );

  const heading =
    typeof section.content?.heading === "string" ? section.content.heading : "";
  const body =
    typeof section.content?.body === "string" ? section.content.body : "";

  return (
    <li>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {section.section_index}.{" "}
            {SECTION_LABELS[section.section_id as SectionId] ?? section.section_id}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={updateAction} className="space-y-3">
            <input type="hidden" name="case_row_id" value={caseId} />
            <input type="hidden" name="section_row_id" value={section.id} />
            <div className="space-y-2">
              <Label htmlFor={`heading-${section.id}`}>Heading</Label>
              <Input id={`heading-${section.id}`} name="heading" defaultValue={heading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`body-${section.id}`}>Body</Label>
              <Textarea
                id={`body-${section.id}`}
                name="body"
                defaultValue={body}
                rows={4}
              />
            </div>
            {updateState.error ? (
              <p className="text-sm text-destructive" role="alert">
                {updateState.error}
              </p>
            ) : updateState.success ? (
              <p className="text-sm text-emerald-600" role="status">
                Saved.
              </p>
            ) : null}
            <Button type="submit" size="sm" disabled={updatePending}>
              {updatePending ? "Saving…" : "Save section"}
            </Button>
          </form>

          <form
            action={deleteAction}
            onSubmit={(event) => {
              const confirmed = window.confirm(
                `Delete the "${SECTION_LABELS[section.section_id as SectionId] ?? section.section_id}" section? This cannot be undone.`,
              );
              if (!confirmed) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name="case_row_id" value={caseId} />
            <input type="hidden" name="section_row_id" value={section.id} />
            <input type="hidden" name="section_id" value={section.section_id} />
            {deleteState.error ? (
              <p className="mb-2 text-sm text-destructive" role="alert">
                {deleteState.error}
              </p>
            ) : null}
            <Button type="submit" variant="outline" size="sm" disabled={deletePending}>
              {deletePending ? "Deleting…" : "Delete section"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </li>
  );
}
