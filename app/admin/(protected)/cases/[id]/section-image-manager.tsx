"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  buildStoragePath,
  isAllowedImageMimeType,
} from "@/lib/cases/images";
import { createClient } from "@/lib/supabase/client";

import { recordSectionImage, reorderSectionImagesAction } from "./section-image-actions";
import { SectionImageCard, type SectionImageRow } from "./section-image-card";

type UploadStatus = {
  name: string;
  state: "uploading" | "done" | "error";
  error?: string;
};

function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read the image."));
    };
    img.src = url;
  });
}

/**
 * Per-section "Add images" + ordered gallery. Multiple files upload one at
 * a time (sequential, so each gets its own clear progress line rather than
 * an ambiguous combined percentage); alt text/caption are edited afterward
 * per image in SectionImageCard (see section-image-actions.ts's
 * recordSectionImage comment on why alt text isn't collected up front).
 *
 * Reorder uses the exact same plain-HTML5-drag-and-drop pattern already
 * used for case reordering (app/admin/(protected)/case-list.tsx) — no
 * added dependency, only the grip handle is draggable, persists on drop,
 * reverts to the last known-good order on failure.
 */
export function SectionImageManager({
  caseId,
  sectionRowId,
  images,
}: {
  caseId: string;
  sectionRowId: string;
  images: SectionImageRow[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(images);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep local order state in sync whenever the server sends fresh props
  // (after a revalidatePath from any of the actions below), without
  // clobbering an in-progress local drag.
  if (
    dragIndex === null &&
    (images.length !== items.length ||
      images.some((img, i) => img.id !== items[i]?.id))
  ) {
    setItems(images);
  }

  async function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setIsUploading(true);
    setUploads(files.map((f) => ({ name: f.name, state: "uploading" })));

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!isAllowedImageMimeType(file.type)) {
        setUploads((current) =>
          current.map((u, idx) =>
            idx === i
              ? { ...u, state: "error", error: "Not an allowed image type." }
              : u,
          ),
        );
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setUploads((current) =>
          current.map((u, idx) =>
            idx === i ? { ...u, state: "error", error: "Larger than 4 MB." } : u,
          ),
        );
        continue;
      }

      try {
        const { width, height } = await readImageDimensions(file);
        const imageId = crypto.randomUUID();
        const storagePath = buildStoragePath(caseId, imageId, file.type);

        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
          .from("case-images")
          .upload(storagePath, file, { contentType: file.type });

        if (uploadError) {
          setUploads((current) =>
            current.map((u, idx) =>
              idx === i ? { ...u, state: "error", error: "Upload failed." } : u,
            ),
          );
          continue;
        }

        const result = await recordSectionImage({
          caseId,
          sectionRowId,
          imageId,
          storagePath,
          altText: "",
          caption: "",
          isDecorative: false,
          width,
          height,
        });

        if (result.error) {
          setUploads((current) =>
            current.map((u, idx) =>
              idx === i ? { ...u, state: "error", error: result.error ?? undefined } : u,
            ),
          );
          continue;
        }

        setUploads((current) =>
          current.map((u, idx) => (idx === i ? { ...u, state: "done" } : u)),
        );
      } catch {
        setUploads((current) =>
          current.map((u, idx) =>
            idx === i ? { ...u, state: "error", error: "Could not read that file." } : u,
          ),
        );
      }
    }

    setIsUploading(false);
    router.refresh();
  }

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
    const dragged = dragIndex;
    setDragIndex(null);
    if (dragged === null) return;
    setReorderError(null);

    const result = await reorderSectionImagesAction(
      caseId,
      sectionRowId,
      items.map((i) => i.id),
    );
    if (result.error) {
      setItems(images); // revert to the last server-confirmed order
      setReorderError(result.error);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">No images in this section yet.</p>
      ) : (
        <>
          {reorderError ? (
            <p className="text-xs text-destructive" role="alert">
              {reorderError}
            </p>
          ) : null}
          <ul className="space-y-2">
            {items.map((image, index) => (
              <div
                key={image.id}
                onDragOver={(event) => handleDragOver(event, index)}
              >
                <SectionImageCard
                  caseId={caseId}
                  image={image}
                  dragHandleProps={{
                    draggable: true,
                    onDragStart: () => setDragIndex(index),
                    onDragEnd: () => void handleDragEnd(),
                  }}
                />
              </div>
            ))}
          </ul>
        </>
      )}

      <div className="space-y-2 rounded-md border border-dashed border-border p-3">
        <Label htmlFor={`add-images-${sectionRowId}`} className="text-xs">
          Add images
        </Label>
        <p className="text-xs text-muted-foreground">
          JPG, PNG or WebP, up to 4 MB each. Select multiple files at once —
          add alt text and a caption for each below after it uploads.
        </p>
        <input
          id={`add-images-${sectionRowId}`}
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
          multiple
          onChange={handleFilesSelected}
          disabled={isUploading}
          className="hidden"
        />

        {uploads.length > 0 ? (
          <ul className="space-y-1 text-xs">
            {uploads.map((u, i) => (
              <li
                key={`${u.name}-${i}`}
                className={
                  u.state === "error"
                    ? "text-destructive"
                    : u.state === "done"
                      ? "text-emerald-600"
                      : "text-muted-foreground"
                }
              >
                {u.name} —{" "}
                {u.state === "uploading"
                  ? "uploading…"
                  : u.state === "done"
                    ? "done"
                    : `failed: ${u.error}`}
              </li>
            ))}
          </ul>
        ) : null}

        <Button
          type="button"
          size="sm"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? "Uploading…" : "Choose files"}
        </Button>
      </div>
    </div>
  );
}
