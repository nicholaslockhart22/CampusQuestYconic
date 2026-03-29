/**
 * Quad media: `public/images/quad/*` — photo PNGs for WBB / Keaney / Union; SVGs for other placeholders.
 * Legacy paths normalize here; never force `.png` → `.svg` (that broke real photos).
 */

export const QUAD_IMAGE_BASE = "/images/quad" as const;

/** Canonical filenames under `public/images/quad/`. */
export const QUAD_MEDIA_FILES = [
  "wbb-arena.png",
  "keaney-lift.png",
  "memorial-union.png",
  "library-night.svg",
  "involvement-fair.svg",
  "quad-sunset.svg",
  "lab-science.svg"
] as const;

/** Old sample data used `.svg` for posts that now ship as photos. */
const LEGACY_SVG_TO_CANONICAL: Record<string, string> = {
  "wbb-arena.svg": "wbb-arena.png",
  "keaney-lift.svg": "keaney-lift.png",
  "memorial-union.svg": "memorial-union.png"
};

const LEGACY_ALIASES: Record<string, string> = {
  "/feed/wbb-arena.png": `${QUAD_IMAGE_BASE}/wbb-arena.png`,
  "/feed/keaney-gym.png": `${QUAD_IMAGE_BASE}/keaney-lift.png`,
  "/feed/memorial-union.png": `${QUAD_IMAGE_BASE}/memorial-union.png`,
  "/feed/library-carothers.png": `${QUAD_IMAGE_BASE}/library-night.svg`,
  "/feed/wbb-arena.svg": `${QUAD_IMAGE_BASE}/wbb-arena.png`,
  "/feed/keaney-lift.svg": `${QUAD_IMAGE_BASE}/keaney-lift.png`,
  "/feed/memorial-union.svg": `${QUAD_IMAGE_BASE}/memorial-union.png`,
  "/feed/library-night.svg": `${QUAD_IMAGE_BASE}/library-night.svg`,
  "/feed/involvement-fair.svg": `${QUAD_IMAGE_BASE}/involvement-fair.svg`,
  "/feed/quad-sunset.svg": `${QUAD_IMAGE_BASE}/quad-sunset.svg`,
  "/feed/lab-science.svg": `${QUAD_IMAGE_BASE}/lab-science.svg`,
  "/cq/wbb-arena.png": `${QUAD_IMAGE_BASE}/wbb-arena.png`,
  "/cq/keaney-gym.png": `${QUAD_IMAGE_BASE}/keaney-lift.png`,
  "/cq/memorial-union.png": `${QUAD_IMAGE_BASE}/memorial-union.png`,
  "/cq/library-carothers.png": `${QUAD_IMAGE_BASE}/library-night.svg`,
  "/cq/wbb-arena.svg": `${QUAD_IMAGE_BASE}/wbb-arena.png`,
  "/cq/keaney-lift.svg": `${QUAD_IMAGE_BASE}/keaney-lift.png`,
  "/cq/memorial-union.svg": `${QUAD_IMAGE_BASE}/memorial-union.png`,
  "/cq/library-night.svg": `${QUAD_IMAGE_BASE}/library-night.svg`,
  "/cq/involvement-fair.svg": `${QUAD_IMAGE_BASE}/involvement-fair.svg`,
  "/cq/quad-sunset.svg": `${QUAD_IMAGE_BASE}/quad-sunset.svg`,
  "/cq/lab-science.svg": `${QUAD_IMAGE_BASE}/lab-science.svg`,
  "/quad-media/wbb-arena.png": `${QUAD_IMAGE_BASE}/wbb-arena.png`,
  "/quad-media/keaney-gym.png": `${QUAD_IMAGE_BASE}/keaney-lift.png`,
  "/quad-media/memorial-union.png": `${QUAD_IMAGE_BASE}/memorial-union.png`,
  "/quad-media/library-carothers.png": `${QUAD_IMAGE_BASE}/library-night.svg`,
  "/quad-media/wbb-arena.svg": `${QUAD_IMAGE_BASE}/wbb-arena.png`,
  "/quad-media/keaney-lift.svg": `${QUAD_IMAGE_BASE}/keaney-lift.png`,
  "/quad-media/memorial-union.svg": `${QUAD_IMAGE_BASE}/memorial-union.png`,
  "/quad-media/library-night.svg": `${QUAD_IMAGE_BASE}/library-night.svg`,
  "/quad-media/involvement-fair.svg": `${QUAD_IMAGE_BASE}/involvement-fair.svg`,
  "/quad-media/quad-sunset.svg": `${QUAD_IMAGE_BASE}/quad-sunset.svg`,
  "/quad-media/lab-science.svg": `${QUAD_IMAGE_BASE}/lab-science.svg`
};

function toQuadImagePath(path: string): string {
  if (path.startsWith("/quad-media/")) {
    return `${QUAD_IMAGE_BASE}/${path.slice(12)}`;
  }
  if (path.startsWith("/cq/") && path.length > 4) {
    return `${QUAD_IMAGE_BASE}/${path.slice(4)}`;
  }
  if (path.startsWith("/feed/") && path.length > 6) {
    return `${QUAD_IMAGE_BASE}/${path.slice(6)}`;
  }
  return path;
}

function canonicalQuadAsset(path: string): string {
  const clean = path.split("?")[0].split("#")[0];
  const base = clean.split("/").pop();
  if (!base) return path;
  const mapped = LEGACY_SVG_TO_CANONICAL[base];
  const file = mapped ?? base;
  if ((QUAD_MEDIA_FILES as readonly string[]).includes(file)) {
    return `${QUAD_IMAGE_BASE}/${file}`;
  }
  return path;
}

export function resolveFeedImageUrl(url: string | undefined): string | undefined {
  if (!url || typeof url !== "string") return url;
  const raw = url.trim();
  if (raw.startsWith("data:") || raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }
  if (raw.startsWith("/_next/")) {
    for (const f of QUAD_MEDIA_FILES) {
      if (raw.includes(f)) {
        return `${QUAD_IMAGE_BASE}/${f}`;
      }
    }
    for (const [legacySvg, canon] of Object.entries(LEGACY_SVG_TO_CANONICAL)) {
      if (raw.includes(legacySvg)) {
        return `${QUAD_IMAGE_BASE}/${canon}`;
      }
    }
    return raw;
  }

  const pathOnly = raw.split(/[?#]/)[0] ?? raw;
  const suffix = raw.slice(pathOnly.length);
  let p = pathOnly.replace(/\/{2,}/g, "/");
  if (!p.startsWith("/")) {
    p = `/${p.replace(/^\/+/, "")}`;
  }

  let out = LEGACY_ALIASES[p] ?? LEGACY_ALIASES[pathOnly] ?? p;
  out = toQuadImagePath(out);

  if (out.startsWith(`${QUAD_IMAGE_BASE}/`)) {
    out = canonicalQuadAsset(out);
  }

  return out + suffix;
}

/** If a quad URL 404s, try the other extension (e.g. legacy `.svg` → photo `.png`). */
export function quadFallbackFromFailedUrl(failedPath: string): string | undefined {
  const base = failedPath.split("/").pop()?.split("?")[0];
  if (!base) return undefined;
  if (base.endsWith(".png")) {
    const stem = base.slice(0, -4);
    const svg = `${stem}.svg`;
    if ((QUAD_MEDIA_FILES as readonly string[]).includes(svg)) {
      return `${QUAD_IMAGE_BASE}/${svg}`;
    }
  }
  if (base.endsWith(".svg")) {
    const canon = LEGACY_SVG_TO_CANONICAL[base];
    if (canon && (QUAD_MEDIA_FILES as readonly string[]).includes(canon)) {
      return `${QUAD_IMAGE_BASE}/${canon}`;
    }
  }
  return undefined;
}
