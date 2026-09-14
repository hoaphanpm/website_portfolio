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
