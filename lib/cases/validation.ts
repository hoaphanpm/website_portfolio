/**
 * Comma-separated tags input -> text[], with server-side trimming and
 * empty-value removal (approved Milestone 3 decision #2).
 */
export function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

/**
 * Case-study redesign milestone: the optional artifact link. Absolute
 * http(s) only — rejects javascript:, data:, file:, relative paths, and
 * anything `new URL()` can't parse. Mirrored at the DB layer by
 * cases_artifact_url_check (defense-in-depth, never the sole boundary).
 */
export function isValidArtifactUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return parsed.protocol === "https:" || parsed.protocol === "http:";
}
