"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { clearHeroImage, deleteImage, setHeroImage } from "./image-actions";
import { imageActionInitialState } from "./types";

type ImageRow = {
  id: string;
  alt_text: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
};

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

export function ImageItem({
  caseId,
  image,
  isHero,
}: {
  caseId: string;
  image: ImageRow;
  isHero: boolean;
}) {
  // Approved decision #4: hero selection always requires an explicit
  // action — this form is either "Set as hero" or "Clear hero image",
  // never automatic.
  const [heroState, heroAction, heroPending] = useActionState(
    isHero ? clearHeroImage : setHeroImage,
    imageActionInitialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteImage,
    imageActionInitialState,
  );

  return (
    <li>
      <Card>
        <CardContent className="flex items-start gap-4 p-4">
          {/* Approved decision #5: plain <img>, never a raw Storage URL —
              /media/[id] re-checks authorization on every request. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/media/${image.id}`}
            alt={image.alt_text ?? ""}
            className="h-24 w-24 shrink-0 rounded-md border border-border object-cover"
          />

          <div className="flex-1 space-y-2">
            <p className="text-sm">{image.alt_text}</p>
            <p className="text-xs text-muted-foreground">
              {image.mime_type} · {formatBytes(image.size_bytes)}
              {image.width && image.height
                ? ` · ${image.width}×${image.height}`
                : ""}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {isHero ? (
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                  Currently hero
                </span>
              ) : null}

              <form action={heroAction}>
                <input type="hidden" name="case_row_id" value={caseId} />
                <input type="hidden" name="image_id" value={image.id} />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={heroPending}
                >
                  {heroPending
                    ? "Saving…"
                    : isHero
                      ? "Clear hero image"
                      : "Set as hero"}
                </Button>
              </form>

              <form
                action={deleteAction}
                onSubmit={(event) => {
                  if (
                    !window.confirm(
                      "Delete this image? This cannot be undone.",
                    )
                  ) {
                    event.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="case_row_id" value={caseId} />
                <input type="hidden" name="image_id" value={image.id} />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={deletePending}
                >
                  {deletePending ? "Deleting…" : "Delete"}
                </Button>
              </form>
            </div>

            {heroState.error ? (
              <p className="text-sm text-destructive" role="alert">
                {heroState.error}
              </p>
            ) : null}
            {deleteState.error ? (
              <p className="text-sm text-destructive" role="alert">
                {deleteState.error}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </li>
  );
}
