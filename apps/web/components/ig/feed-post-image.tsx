"use client";

import { useState } from "react";

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
  const [ok, setOk] = useState(true);

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

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setOk(false)}
    />
  );
}
