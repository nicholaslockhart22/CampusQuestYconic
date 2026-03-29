"use client";

import { useEffect, useState } from "react";
import {
  QUAD_IMAGE_BASE,
  QUAD_MEDIA_FILES,
  quadFallbackFromFailedUrl,
  resolveFeedImageUrl
} from "@/lib/feed-image-url";

const QUAD_W = 800;
const QUAD_H = 520;

export function FeedPostImage({
  src,
  alt,
  className,
  placeholderClassName
}: {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
}) {
  const canonical = resolveFeedImageUrl(src) ?? src;
  const [activeSrc, setActiveSrc] = useState(canonical);
  const [ok, setOk] = useState(true);

  useEffect(() => {
    setActiveSrc(resolveFeedImageUrl(src) ?? src);
    setOk(true);
  }, [src]);

  if (!ok) {
    return (
      <div
        className={
          placeholderClassName ??
          "flex min-h-32 w-full items-center justify-center bg-neutral-100 text-xs font-medium text-neutral-500"
        }
        role="img"
        aria-label={alt}
      >
        Image unavailable
      </div>
    );
  }

  function onError() {
    const cur = activeSrc.split(/[?#]/)[0] ?? activeSrc;
    const fallback = quadFallbackFromFailedUrl(cur);
    if (fallback) {
      setActiveSrc(fallback);
      return;
    }
    if (
      cur.endsWith(".png") &&
      (cur.includes(`${QUAD_IMAGE_BASE}/`) ||
        cur.includes("/cq/") ||
        cur.includes("/feed/") ||
        cur.includes("/quad-media/"))
    ) {
      setActiveSrc(`${cur.slice(0, -4)}.svg`);
      return;
    }
    const base = cur.split("/").pop()?.split("?")[0];
    if (base && (QUAD_MEDIA_FILES as readonly string[]).includes(base)) {
      setActiveSrc(`${QUAD_IMAGE_BASE}/${base}`);
      return;
    }
    if (cur.includes("/_next/")) {
      for (const f of QUAD_MEDIA_FILES) {
        if (cur.includes(f)) {
          setActiveSrc(`${QUAD_IMAGE_BASE}/${f}`);
          return;
        }
      }
    }
    if (cur.includes("/quad-media/")) {
      setActiveSrc(cur.replace("/quad-media/", `${QUAD_IMAGE_BASE}/`));
      return;
    }
    if (cur.startsWith("/cq/")) {
      setActiveSrc(cur.replace(/^\/cq\//, `${QUAD_IMAGE_BASE}/`));
      return;
    }
    if (cur.startsWith("/feed/")) {
      setActiveSrc(cur.replace(/^\/feed\//, `${QUAD_IMAGE_BASE}/`));
      return;
    }
    setOk(false);
  }

  return (
    <img
      key={activeSrc}
      src={activeSrc}
      alt={alt}
      className={className}
      width={QUAD_W}
      height={QUAD_H}
      loading="eager"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={onError}
    />
  );
}
