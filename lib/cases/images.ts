/**
 * Mirrors the case-images Storage bucket config exactly (see
 * supabase/migrations/20260911140009_storage.sql). Single source of truth
 * for the admin upload UI's client-side pre-check — the bucket's own
 * config remains the authoritative enforcement.
 */
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export function isAllowedImageMimeType(
  value: string,
): value is AllowedImageMimeType {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(value);
}

export const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

const EXTENSION_BY_MIME_TYPE: Record<AllowedImageMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function extensionForMimeType(mimeType: AllowedImageMimeType): string {
  return EXTENSION_BY_MIME_TYPE[mimeType];
}

/**
 * Storage path format: {cases.id}/{case_images.id}.{ext} — see
 * supabase/migrations/20260911140005_case_images.sql's comment on
 * case_images.storage_path. Uses the case's internal uuid, so editing
 * case_id never moves files.
 */
export function buildStoragePath(
  caseId: string,
  imageId: string,
  mimeType: AllowedImageMimeType,
): string {
  return `${caseId}/${imageId}.${extensionForMimeType(mimeType)}`;
}
