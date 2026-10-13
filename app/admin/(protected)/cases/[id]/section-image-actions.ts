"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { MAX_IMAGE_SIZE_BYTES, isAllowedImageMimeType } from "@/lib/cases/images";
import { createClient } from "@/lib/supabase/server";

import type { ImageActionState } from "./types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const BUCKET = "case-images";

/** Best-effort cleanup only — same reasoning as image-actions.ts's version:
 * a file without a case_images row can never be read publicly, so a failed
 * cleanup here is a storage hygiene issue only, never a correctness one. */
async function deleteStorageObjectSafely(
  supabase: SupabaseServerClient,
  path: string,
) {
  try {
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // Ignore — see comment above.
  }
}

/** Re-derives size/mime type from Storage's own listing rather than trusting
 * the client — same pattern and same reasoning as image-actions.ts's
 * recordUploadedImage. Returns null (with the object already cleaned up) if
 * the upload can't be verified or fails the size/type check. */
async function verifyUploadedObject(
  supabase: SupabaseServerClient,
  caseId: string,
  storagePath: string,
): Promise<{ mimeType: string; size: number } | null> {
  const filename = storagePath.slice(caseId.length + 1);
  const { data: listing, error: listError } = await supabase.storage
    .from(BUCKET)
    .list(caseId);

  const objectInfo = listing?.find((entry) => entry.name === filename);

  if (listError || !objectInfo?.metadata) {
    await deleteStorageObjectSafely(supabase, storagePath);
    return null;
  }

  const mimeType = String(objectInfo.metadata.mimetype ?? "");
  const size = Number(objectInfo.metadata.size ?? NaN);

  if (!isAllowedImageMimeType(mimeType)) {
    await deleteStorageObjectSafely(supabase, storagePath);
    return null;
  }
  if (!Number.isFinite(size) || size > MAX_IMAGE_SIZE_BYTES) {
    await deleteStorageObjectSafely(supabase, storagePath);
    return null;
  }

  return { mimeType, size };
}

/**
 * Records metadata for one section-gallery image the browser has already
 * uploaded directly to Storage (same direct-to-Storage flow as the
 * case-level image-actions.ts). Appends to the end of the section's
 * existing order (max(display_order) + 1) — reordering happens separately
 * via reorderSectionImagesAction. Called as a plain function from the
 * upload form's client-side flow, one call per selected file, not via
 * useActionState.
 */
export async function recordSectionImage(input: {
  caseId: string;
  sectionRowId: string;
  imageId: string;
  storagePath: string;
  altText: string;
  caption: string;
  isDecorative: boolean;
  width: number | null;
  height: number | null;
}): Promise<{ error: string | null }> {
  const altText = input.altText.trim();
  const caption = input.caption.trim();
  const supabase = await createClient();

  if (!(await requireAdmin(supabase))) {
    return { error: "Not authorized." };
  }

  // Alt text is not required at upload time (a multi-file selection has no
  // per-file text input before the browser even starts uploading) — it's
  // required before *publish* instead, enforced by validate_case's
  // image_alt_text_missing check, exactly like every other publish rule.
  // Edit alt text afterward in the gallery, or mark the image decorative.

  const verified = await verifyUploadedObject(
    supabase,
    input.caseId,
    input.storagePath,
  );
  if (!verified) {
    return { error: "Could not verify the uploaded file. Please try again." };
  }

  const { data: sectionRow, error: sectionError } = await supabase
    .from("case_sections")
    .select("id")
    .eq("id", input.sectionRowId)
    .eq("case_id", input.caseId)
    .maybeSingle();

  if (sectionError || !sectionRow) {
    await deleteStorageObjectSafely(supabase, input.storagePath);
    return { error: "Section not found." };
  }

  const { data: existingImages } = await supabase
    .from("case_images")
    .select("display_order")
    .eq("section_id", input.sectionRowId)
    .order("display_order", { ascending: false })
    .limit(1);

  const nextOrder = (existingImages?.[0]?.display_order ?? 0) + 1;

  const { error: insertError } = await supabase.from("case_images").insert({
    id: input.imageId,
    case_id: input.caseId,
    section_id: input.sectionRowId,
    storage_path: input.storagePath,
    alt_text: altText || null,
    caption: caption || null,
    is_decorative: input.isDecorative,
    display_order: nextOrder,
    mime_type: verified.mimeType,
    size_bytes: verified.size,
    width: input.width,
    height: input.height,
  });

  if (insertError) {
    await deleteStorageObjectSafely(supabase, input.storagePath);
    return { error: "Could not save the image. Please try again." };
  }

  revalidatePath(`/admin/cases/${input.caseId}`);
  return { error: null };
}

/** Edits alt text / caption / decorative flag for one existing section
 * image — never touches the file itself. */
export async function updateSectionImageDetails(
  _prevState: ImageActionState,
  formData: FormData,
): Promise<ImageActionState> {
  const caseRowId = String(formData.get("case_row_id") ?? "");
  const imageId = String(formData.get("image_id") ?? "");
  const altText = String(formData.get("alt_text") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  const isDecorative = formData.get("is_decorative") === "on";

  if (!caseRowId || !imageId) {
    return { error: "Missing reference.", success: false };
  }
  if (!altText && !isDecorative) {
    return {
      error: "Alt text is required unless the image is marked decorative.",
      success: false,
    };
  }

  const supabase = await createClient();
  if (!(await requireAdmin(supabase))) {
    return { error: "Not authorized.", success: false };
  }

  const { error } = await supabase
    .from("case_images")
    .update({
      alt_text: altText || null,
      caption: caption || null,
      is_decorative: isDecorative,
    })
    .eq("id", imageId)
    .eq("case_id", caseRowId);

  if (error) {
    return { error: "Could not save the image. Please try again.", success: false };
  }

  revalidatePath(`/admin/cases/${caseRowId}`);
  return { error: null, success: true };
}

/** Deletes one section image: DB row first, then best-effort Storage
 * cleanup — same ordering/reasoning as image-actions.ts's deleteImage. A
 * section image is never a case's hero image (hero images always have
 * section_id null), so no hero-image guard is needed here. */
export async function deleteSectionImage(
  _prevState: ImageActionState,
  formData: FormData,
): Promise<ImageActionState> {
  const caseRowId = String(formData.get("case_row_id") ?? "");
  const imageId = String(formData.get("image_id") ?? "");

  if (!caseRowId || !imageId) {
    return { error: "Missing reference.", success: false };
  }

  const supabase = await createClient();
  if (!(await requireAdmin(supabase))) {
    return { error: "Not authorized.", success: false };
  }

  const { data: imageRow, error: loadError } = await supabase
    .from("case_images")
    .select("storage_path")
    .eq("id", imageId)
    .eq("case_id", caseRowId)
    .maybeSingle();

  if (loadError || !imageRow) {
    return { error: "Image not found.", success: false };
  }

  const { error: deleteError } = await supabase
    .from("case_images")
    .delete()
    .eq("id", imageId);

  if (deleteError) {
    return { error: "Could not delete the image. Please try again.", success: false };
  }

  await deleteStorageObjectSafely(supabase, imageRow.storage_path);

  revalidatePath(`/admin/cases/${caseRowId}`);
  return { error: null, success: true };
}

/**
 * Replaces one section image's underlying file, keeping the same row id,
 * alt text, caption, decorative flag, and position. The new file is
 * uploaded (by the caller, client-side, to a fresh path) and verified
 * *before* anything about the old file is touched — if verification or the
 * DB update fails, the old row and its file are left completely intact,
 * and the newly-uploaded object is cleaned up instead.
 */
export async function replaceSectionImage(input: {
  caseId: string;
  imageId: string;
  newStoragePath: string;
  width: number | null;
  height: number | null;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();

  if (!(await requireAdmin(supabase))) {
    await deleteStorageObjectSafely(supabase, input.newStoragePath);
    return { error: "Not authorized." };
  }

  const verified = await verifyUploadedObject(
    supabase,
    input.caseId,
    input.newStoragePath,
  );
  if (!verified) {
    return { error: "Could not verify the uploaded file. Please try again." };
  }

  const { data: existing, error: loadError } = await supabase
    .from("case_images")
    .select("storage_path")
    .eq("id", input.imageId)
    .eq("case_id", input.caseId)
    .maybeSingle();

  if (loadError || !existing) {
    await deleteStorageObjectSafely(supabase, input.newStoragePath);
    return { error: "Image not found." };
  }

  const oldStoragePath = existing.storage_path;

  const { error: updateError } = await supabase
    .from("case_images")
    .update({
      storage_path: input.newStoragePath,
      mime_type: verified.mimeType,
      size_bytes: verified.size,
      width: input.width,
      height: input.height,
    })
    .eq("id", input.imageId)
    .eq("case_id", input.caseId);

  if (updateError) {
    // The DB still points at the old file — leave it alone and clean up
    // only the new, now-orphaned upload.
    await deleteStorageObjectSafely(supabase, input.newStoragePath);
    return { error: "Could not save the replacement. Please try again." };
  }

  // Only now, after the DB row genuinely points at the new file, remove
  // the old one.
  await deleteStorageObjectSafely(supabase, oldStoragePath);

  revalidatePath(`/admin/cases/${input.caseId}`);
  return { error: null };
}

/**
 * Persists a full reorder of one section's images via the admin-only
 * reorder_section_images() RPC — same pattern as the top-level
 * reorderCases()/reorder_cases(): the client always sends every image id
 * in that section exactly once. Called as a plain function from the
 * gallery's drag-and-drop handler, not via useActionState.
 */
export async function reorderSectionImagesAction(
  caseId: string,
  sectionRowId: string,
  orderedImageIds: string[],
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  if (!(await requireAdmin(supabase))) {
    return { error: "Not authorized." };
  }

  const { error } = await supabase.rpc("reorder_section_images", {
    p_section_id: sectionRowId,
    p_image_ids: orderedImageIds,
  });

  if (error) {
    return { error: "Could not save the new order. Please try again." };
  }

  revalidatePath(`/admin/cases/${caseId}`);
  return { error: null };
}
