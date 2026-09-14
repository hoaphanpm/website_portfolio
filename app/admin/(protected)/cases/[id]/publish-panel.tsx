"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { publishCase, unpublishCase } from "./publish-actions";
import { publishInitialState } from "./types";

export function PublishPanel({
  caseId,
  status,
}: {
  caseId: string;
  status: string;
}) {
  const [publishState, publishAction, publishPending] = useActionState(
    publishCase,
    publishInitialState,
  );
  const [unpublishState, unpublishAction, unpublishPending] = useActionState(
    unpublishCase,
    publishInitialState,
  );

  const isPublished = status === "published";

  return (
    <div className="space-y-3 rounded-md border border-border p-4">
      <div className="flex items-center justify-between gap-4">
        <span
          className={
            isPublished
              ? "rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              : "rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
          }
        >
          {isPublished ? "Published" : "Draft"}
        </span>

        {isPublished ? (
          <form action={unpublishAction}>
            <input type="hidden" name="case_row_id" value={caseId} />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={unpublishPending}
            >
              {unpublishPending ? "Unpublishing…" : "Unpublish"}
            </Button>
          </form>
        ) : (
          <form action={publishAction}>
            <input type="hidden" name="case_row_id" value={caseId} />
            <Button type="submit" size="sm" disabled={publishPending}>
              {publishPending ? "Publishing…" : "Publish"}
            </Button>
          </form>
        )}
      </div>

      {publishState.error ? (
        <p className="text-sm text-destructive" role="alert">
          {publishState.error}
        </p>
      ) : null}

      {publishState.checklist.length > 0 ? (
        <div className="text-sm text-destructive" role="alert">
          <p className="font-medium">Cannot publish yet:</p>
          <ul className="mt-1 list-disc pl-5">
            {publishState.checklist.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {publishState.success ? (
        <p className="text-sm text-emerald-600" role="status">
          Published.
        </p>
      ) : null}

      {unpublishState.error ? (
        <p className="text-sm text-destructive" role="alert">
          {unpublishState.error}
        </p>
      ) : null}

      {unpublishState.success ? (
        <p className="text-sm text-emerald-600" role="status">
          Unpublished.
        </p>
      ) : null}
    </div>
  );
}
