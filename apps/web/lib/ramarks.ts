const MAX_RAMARKS = 12;
const MAX_TAG_LEN = 32;

/** Normalize user input into unique Ramark slugs (no #, lowercase). */
export function parseRamarksInput(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const parts = raw.split(/[\s,]+/u);
  for (const part of parts) {
    if (out.length >= MAX_RAMARKS) break;
    let t = part.trim().replace(/^#+/, "").toLowerCase();
    if (!t) continue;
    t = t.replace(/[^a-z0-9_-]/g, "");
    if (!t || t.length > MAX_TAG_LEN) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

export function formatRamark(tag: string): string {
  return `#${tag}`;
}
