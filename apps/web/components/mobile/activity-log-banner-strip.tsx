"use client";

import { useEffect } from "react";
import { useGameState } from "@/components/providers/game-state-provider";

export function ActivityLogBannerStrip() {
  const { state, clearActivityLogBanner } = useGameState();
  const b = state.activityLogBanner;

  useEffect(() => {
    if (!b) return;
    const t = window.setTimeout(() => clearActivityLogBanner(), 4500);
    return () => window.clearTimeout(t);
  }, [b?.id, clearActivityLogBanner]);

  if (!b) return null;

  return (
    <div className="sticky top-0 z-20 -mx-0 animate-cq-banner-in border-b border-cq-keaney/35 bg-gradient-to-r from-emerald-950/92 via-cq-navy to-cq-navy shadow-[0_8px_28px_rgba(16,185,129,0.18)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_50%_0%,rgba(52,211,153,0.14),transparent_55%)]"
        aria-hidden
      />
      <div className="relative flex items-start gap-2 px-4 py-2.5 pr-2 pt-3">
        <div className="min-w-0 flex-1" role="status" aria-live="polite">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300/95">Activity logged</p>
          <p className="mt-0.5 truncate text-sm font-bold text-white">{b.activityTitle}</p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
            <span className="font-black tabular-nums text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.45)]">
              +{b.xpReward} XP
            </span>
            {b.statsText ? (
              <span className="text-[12px] font-semibold text-cq-keaneyIce/95">{b.statsText}</span>
            ) : null}
          </p>
          {b.detailLine ? (
            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-cq-keaneyBright/88">{b.detailLine}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => clearActivityLogBanner()}
          className="shrink-0 rounded-lg p-1.5 text-cq-keaney/80 transition hover:bg-white/10 hover:text-white"
          aria-label="Dismiss activity summary"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
