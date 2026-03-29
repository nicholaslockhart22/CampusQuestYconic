"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const LOAD_MS = 4200;

export function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);

  const safeComplete = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setProgress(100);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(100);
      const t = window.setTimeout(() => safeComplete(), 600);
      return () => clearTimeout(t);
    }

    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / LOAD_MS);
      setProgress(Math.round(t * 1000) / 10);
      if (t >= 1) {
        safeComplete();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [safeComplete]);

  /** Same horizontal position as the yellow fill (leading edge of progress). */
  const barRamLeftPct = Math.min(100, Math.max(0, progress));

  return (
    <div className="flex min-h-dvh min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-b from-cq-navy via-cq-navyMid to-[#0a1830] px-4 pb-12 pt-8">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center">
        <p className="text-center text-xs font-bold uppercase tracking-[0.35em] text-cq-keaneyBright/90">
          Welcome to
        </p>
        <div
          className="relative mx-auto mt-3 w-full max-w-[min(100%,280px)] px-2 cq-welcome-logo-fade"
          style={{ animationDuration: `${LOAD_MS}ms` }}
        >
          {/* mix-blend-lighten: black raster background reads as transparent on dark navy */}
          <Image
            src="/branding/campusquest-logo.png"
            alt="CampusQuest — CQ crest with URI banner"
            width={1024}
            height={1024}
            className="h-auto w-full mix-blend-lighten drop-shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
            priority
            sizes="280px"
          />
        </div>
        <p className="mt-5 max-w-sm text-center text-sm leading-relaxed text-cq-keaneyIce/85">
          Your fantasy campus adventure starts here. Grab your schedule, rally your guild, and turn real effort into
          XP.
        </p>

        <div className="mt-10 w-full max-w-md">
          <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-cq-keaney/90">
            Loading your realm…
          </p>
          <div className="overflow-hidden rounded-2xl border-2 border-[#002147]/80 shadow-[0_8px_32px_rgba(0,0,0,0.35)] ring-1 ring-[#FFC20E]/25">
            <div className="h-6 bg-gradient-to-b from-sky-400/35 to-emerald-900/20" aria-hidden />
            <div className="relative h-[5.5rem] overflow-hidden bg-gradient-to-b from-emerald-800 via-emerald-600 to-emerald-700">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.35]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 2px 2px, rgba(20,83,45,0.9) 1px, transparent 0)",
                  backgroundSize: "10px 10px"
                }}
                aria-hidden
              />
              <div
                className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-[#14532d] to-transparent opacity-80"
                aria-hidden
              />
            </div>
          </div>

          <div className="relative mt-4 w-full">
            <div
              className="pointer-events-none absolute bottom-full z-10 mb-1 -translate-x-1/2 transition-[left] duration-75 ease-linear"
              style={{ left: `${barRamLeftPct}%` }}
            >
              <span
                className="inline-block -scale-x-100 text-[2.35rem] leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                role="img"
                aria-label="Rhody ram"
              >
                🐏
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-cq-navy/50 ring-1 ring-cq-keaney/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FFC20E] via-[#e6a800] to-[#cba135] shadow-[0_0_12px_rgba(255,194,14,0.45)] transition-[width] duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-center text-xs tabular-nums text-cq-keaneySoft/80">{Math.round(progress)}%</p>
          </div>
        </div>

        <button
          type="button"
          className="mt-8 text-sm font-semibold text-cq-keaney/80 underline decoration-cq-keaney/40 underline-offset-4 hover:text-cq-keaneyBright"
          onClick={safeComplete}
        >
          Skip intro
        </button>
      </div>
    </div>
  );
}
