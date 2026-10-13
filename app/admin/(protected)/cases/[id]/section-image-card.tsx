"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MAX_IMAGE_SIZE_BYTES,
  buildStoragePath,
  isAllowedImageMimeType,
} from "@/lib/cases/images";
import { createClient } from "@/lib/supabase/client";

import { deleteSectionImage, replaceSectionImage, updateSectionImageDetails } from "./section-image-actions";
import { imageActionInitialState } from "./types";

export type SectionImageRow = {
  id: string;
  alt_text: string | null;
  caption: string | null;
  is_decorative: boolean;
  display_order: number;
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

export function SectionImageCard({
  caseId,
  image,
  dragHandleProps,
}: {
  caseId: string;
  image: SectionImageRow;
  /** Spread onto the drag handle — supplied by the parent gallery, which
   * owns the actual drag-and-drop reorder state (one shared pattern, not
   * duplicated per card). */
  dragHandleProps: {
    draggable: true;
    onDragStart: () => void;
    onDragEnd: () => void;
  };
}) {
  const router = useRouter();
  const [updateState, updateAction, updatePending] = useActionState(
    updateSectionImageDetails,
    imageActionInitialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteSectionImage,
    imageActionInitialState,
  );
  const [replaceError, setReplaceError] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Bug fix: alt text/caption/decorative must be CONTROLLED state, not
  // uncontrolled <input defaultValue>. Root cause of "alt text disappears
  // after Save" — React automatically resets a `<form action={...}>`'s
  // uncontrolled fields back to their original mount-time defaultValue
  // once the bound action finishes (the same native `form.reset()`
  // behavior a plain HTML form gets after a successful submit). The
  // update itself was always reaching the database correctly; only the
  // DOM's displayed value was being reset out from under it. Initialized
  // once from `image` here (this component is never remounted by a
  // revalidatePath refresh — its key is the stable image.id — so this
  // correctly reflects a page load/draft reopen and then simply persists
  // across re-renders like any other React state, which a controlled
  // input's value is immune to the form-reset gotcha above).
  const [altText, setAltText] = useState(image.alt_text ?? "");
  const [caption, setCaption] = useState(image.caption ?? "");
  const [isDecorative, setIsDecorative] = useState(image.is_decorative);

  async function handleReplace(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setReplaceError(null);
    if (!isAllowedImageMimeType(file.type)) {
      setReplaceError("Only JPG, PNG and WebP images are allowed.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setReplaceError("File is larger than 4 MB.");
      return;
    }

    setIsReplacing(true);
    try {
      const { width, height } = await readImageDimensions(file);
      // A fresh id for the new file's storage path — the DB row keeps its
      // own existing id (and alt text / caption / decorative flag / order)
      // throughout; only the underlying file changes, and only once the
      // new upload is verified (see replaceSectionImage's own comment).
      const newStorageId = crypto.randomUUID();
      const newStoragePath = buildStoragePath(caseId, newStorageId, file.type);

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("case-images")
        .upload(newStoragePath, file, { contentType: file.type });

      if (uploadError) {
        setReplaceError("Upload failed. The original image is unchanged.");
        return;
      }

      const result = await replaceSectionImage({
        caseId,
        imageId: image.id,
        newStoragePath,
        width,
        height,
      });

      if (result.error) {
        setReplaceError(result.error);
        return;
      }

      router.refresh();
    } catch {
      setReplaceError("Could not read that file. The original image is unchanged.");
    } finally {
      setIsReplacing(false);
    }
  }

  return (
    <li className="flex items-start gap-3 rounded-md border border-border bg-card p-3">
      <span
        {...dragHandleProps}
        className="mt-1 cursor-grab select-none px-1 text-muted-foreground active:cursor-grabbing"
        role="button"
        aria-label={`Drag to reorder image ${altText || "(no alt text)"}`}
        title="Drag to reorder"
      >
        ⠿
      </span>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/media/${image.id}`}
        alt={altText}
        className="h-20 w-20 shrink-0 rounded-md border border-border object-cover"
      />

      <div className="flex-1 space-y-3">
        <p className="text-xs text-muted-foreground">
          {image.mime_type} · {formatBytes(image.size_bytes)}
          {image.width && image.height ? ` · ${image.width}×${image.height}` : ""}
        </p>

        <form action={updateAction} className="space-y-2">
          <input type="hidden" name="case_row_id" value={caseId} />
          <input type="hidden" name="image_id" value={image.id} />

          <div className="space-y-1">
            <Label htmlFor={`alt-${image.id}`} className="text-xs">
              Alt text{" "}
              {!isDecorative ? (
                <span className="text-destructive">(required unless decorative)</span>
              ) : null}
            </Label>
            <Input
              id={`alt-${image.id}`}
              name="alt_text"
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor={`caption-${image.id}`} className="text-xs">
              Caption (optional)
            </Label>
            <Input
              id={`caption-${image.id}`}
              name="caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              className="h-8 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              name="is_decorative"
              checked={isDecorative}
              onChange={(event) => setIsDecorative(event.target.checked)}
              className="h-3.5 w-3.5 rounded border-input"
            />
            Decorative (carries no meaning — alt text not required)
          </label>

          {updateState.error ? (
            <p className="text-xs text-destructive" role="alert">
              {updateState.error}
            </p>
          ) : updateState.success ? (
            <p className="text-xs text-emerald-600" role="status">
              Saved.
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" size="sm" disabled={updatePending}>
              {updatePending ? "Saving…" : "Save"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isReplacing}
              onClick={() => replaceInputRef.current?.click()}
            >
              {isReplacing ? "Replacing…" : "Replace"}
            </Button>
            <input
              ref={replaceInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleReplace}
              className="hidden"
            />
          </div>
          {replaceError ? (
            <p className="text-xs text-destructive" role="alert">
              {replaceError}
            </p>
          ) : null}
        </form>

        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (!window.confirm("Remove this image? This cannot be undone.")) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="case_row_id" value={caseId} />
          <input type="hidden" name="image_id" value={image.id} />
          {deleteState.error ? (
            <p className="mb-1 text-xs text-destructive" role="alert">
              {deleteState.error}
            </p>
          ) : null}
          <Button type="submit" variant="outline" size="sm" disabled={deletePending}>
            {deletePending ? "Removing…" : "Remove"}
          </Button>
        </form>
      </div>
    </li>
  );
}
