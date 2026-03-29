"use client";

import { formatRamark } from "@/lib/ramarks";

export function RamarkChips({
  ramarks,
  className = ""
}: {
  ramarks: string[];
  className?: string;
}) {
  if (ramarks.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label="Ramarks">
      {ramarks.map((tag) => (
        <li key={tag}>
          <span className="inline-block rounded-full bg-cq-keaney/15 px-2.5 py-0.5 text-xs font-semibold text-cq-navy ring-1 ring-cq-keaney/30">
            {formatRamark(tag)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function RamarkChipsUri({ ramarks, className = "" }: { ramarks: string[]; className?: string }) {
  if (ramarks.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label="Ramarks">
      {ramarks.map((tag) => (
        <li key={tag}>
          <span className="inline-block rounded-full bg-uri-sky/40 px-2.5 py-0.5 text-xs font-semibold text-uri-navy ring-1 ring-uri-navy/15">
            {formatRamark(tag)}
          </span>
        </li>
      ))}
    </ul>
  );
}
