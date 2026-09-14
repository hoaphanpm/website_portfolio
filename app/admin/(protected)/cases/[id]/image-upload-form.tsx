"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  buildStoragePath,
  isAllowedImageMimeType,
} from "@/lib/cases/images";
import { createClient } from "@/lib/supabase/client";

import { recordUploadedImage } from "./image-actions";

/** Approved decision #1: read width/height client-side after the browser
 * decodes the image. Display metadata only, never a security boundary. */
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

export function ImageUploadForm({ caseId }: { caseId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [justUploaded, setJustUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setJustUploaded(false);

    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const altInput = form.elements.namedItem("alt_text") as HTMLInputElement;
    const file = fileInput.files?.[0];
    const altText = altInput.value.trim();

    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    // Client-side pre-checks for fast feedback only — the bucket's own
    // config and the server action's re-derivation from Storage remain the
    // authoritative enforcement (approved decision #2).
    if (!isAllowedImageMimeType(file.type)) {
      setError("Only JPG, PNG and WebP images are allowed.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("File is larger than 4 MB.");
      return;
    }
    // Clarification: non-empty alt text is required before recording.
    if (!altText) {
      setError("Alt text is required.");
      return;
    }

    setIsUploading(true);
    try {
      const { width, height } = await readImageDimensions(file);

      const imageId = crypto.randomUUID();
      const storagePath = buildStoragePath(caseId, imageId, file.type);

      // File bytes go straight to Storage, bypassing any Server Action
      // body-size limit (docs/architecture.md §3 Uploads).
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("case-images")
        .upload(storagePath, file, { contentType: file.type });

      if (uploadError) {
        setError("Upload failed. Please try again.");
        return;
      }

      const result = await recordUploadedImage({
        caseId,
        imageId,
        storagePath,
        altText,
        width,
        height,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      formRef.current?.reset();
      setJustUploaded(true);
    } catch {
      setError("Could not read that file. Please try a different image.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="max-w-xl space-y-3 rounded-md border border-dashed border-border p-4"
    >
      <div className="space-y-2">
        <Label htmlFor="file">Image file</Label>
        <Input
          id="file"
          name="file"
          type="file"
          accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
        />
        <p className="text-xs text-muted-foreground">
          JPG, PNG or WebP, up to 4 MB.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="alt_text">Alt text</Label>
        <Input id="alt_text" name="alt_text" required />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : justUploaded ? (
        <p className="text-sm text-emerald-600" role="status">
          Image uploaded.
        </p>
      ) : null}

      <Button type="submit" disabled={isUploading}>
        {isUploading ? "Uploading…" : "Upload image"}
      </Button>
    </form>
  );
}
