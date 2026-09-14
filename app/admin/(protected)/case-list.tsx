"use client";

import Link from "next/link";
import { useState } from "react";

import { reorderCases } from "./actions";

type CaseRow = {
  id: string;
  case_id: string;
  case_name: string;
  status: string;
};

function StatusBadge({ status }: { status: string }) {
  const isPublished = status === "published";
  return (
    <span
      className={
        isPublished
          ? "rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          : "rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
      }
    >
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}

/**
 * Plain HTML5 drag-and-drop, no added dependency (approved decision #2).
 * Only the grip handle is draggable, not the whole row, so the case-name
 * link stays clickable. Persists immediately on drop (decision #3); on
 * failure, reverts to the last known-good order and shows an error.
 */
export function CaseList({
  cases,
  sectionCounts,
}: {
  cases: CaseRow[];
  sectionCounts: Record<string, number>;
}) {
  const [items, setItems] = useState(cases);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function handleDragOver(event: React.DragEvent, overIndex: number) {
    event.preventDefault();
    if (dragIndex === null || dragIndex === overIndex) return;
    setItems((current) => {
      const next = [...current];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(overIndex, 0, moved);
      return next;
    });
    setDragIndex(overIndex);
  }

  async function handleDragEnd() {
    setDragIndex(null);
    setError(null);
    const result = await reorderCases(items.map((c) => c.id));
    if (result.error) {
      setItems(cases); // revert to the last server-confirmed order
      setError(result.error);
    }
  }

  return (
    <div>
      {error ? (
        <p className="mb-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="divide-y divide-border rounded-md border border-border">
        {items.map((c, index) => {
          const count = sectionCounts[c.id] ?? 0;
          return (
            <li
              key={c.id}
              onDragOver={(event) => handleDragOver(event, index)}
              className="flex items-center gap-3 p-4"
            >
              <span
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragEnd={() => void handleDragEnd()}
                className="cursor-grab select-none px-1 text-muted-foreground active:cursor-grabbing"
                role="button"
                aria-label={`Drag to reorder ${c.case_name}`}
                title="Drag to reorder"
              >
                ⠿
              </span>

              <div className="flex flex-1 items-center justify-between gap-4">
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
                <StatusBadge status={c.status} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
