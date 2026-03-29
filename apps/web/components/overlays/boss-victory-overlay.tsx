"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useGameState } from "@/components/providers/game-state-provider";
import { RarityBadge } from "@/components/ui/rarity-badge";
import { activityTypeEmoji } from "@/lib/activity-type-emoji";
import { formatStatDeltaLine } from "@/lib/activity-stat-deltas";

const CHEST_SRC = "/branding/treasure-chest-loot.png";

function lootEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("sunglasses")) return "😎";
  if (n.includes("shard") || n.includes("sigil") || n.includes("fragment")) return "✨";
  if (n.includes("lantern")) return "🏮";
  if (n.includes("notebook") || n.includes("hydra")) return "📓";
  if (n.includes("charm") || n.includes("crest")) return "🎖️";
  return "🎁";
}

const SPARKLE_STYLE: { left: string; top: string; delay: string }[] = [
  { left: "8%", top: "12%", delay: "0s" },
  { left: "22%", top: "8%", delay: "0.2s" },
  { left: "78%", top: "10%", delay: "0.4s" },
  { left: "88%", top: "22%", delay: "0.1s" },
  { left: "5%", top: "45%", delay: "0.5s" },
  { left: "92%", top: "48%", delay: "0.3s" },
  { left: "15%", top: "72%", delay: "0.6s" },
  { left: "50%", top: "6%", delay: "0.25s" },
  { left: "48%", top: "88%", delay: "0.35s" },
  { left: "72%", top: "78%", delay: "0.15s" },
  { left: "35%", top: "38%", delay: "0.55s" },
  { left: "62%", top: "42%", delay: "0.45s" }
];

export function BossVictoryOverlay() {
  const { state, dismissBossVictory } = useGameState();
  const pending = state.pendingBossVictory;
  const [phase, setPhase] = useState<"chest" | "reveal">("chest");

  useEffect(() => {
    if (pending) setPhase("chest");
  }, [pending?.id]);

  useEffect(() => {
    if (!pending) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [pending]);

  if (!pending) return null;

  const statLine = formatStatDeltaLine(pending.statDelta);
  const actEmoji = activityTypeEmoji(pending.activityType);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="boss-victory-title"
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-cq-navy via-[#0a1628] to-black/95 backdrop-blur-md"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(250,204,21,0.25),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_80%,rgba(107,184,232,0.2),transparent_50%)]" />
        {SPARKLE_STYLE.map((s, i) => (
          <span
            key={i}
            className="absolute h-2 w-2 rounded-full bg-yellow-200 shadow-[0_0_12px_3px_rgba(253,224,71,0.9)] animate-cq-sparkle"
            style={{ left: s.left, top: s.top, animationDelay: s.delay }}
          />
        ))}
      </div>

      <div
        className="relative z-10 flex max-h-[min(92dvh,820px)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-yellow-400/40 shadow-[0_0_80px_rgba(250,204,21,0.35)] sm:max-h-[min(88dvh,760px)] sm:rounded-3xl animate-cq-victory-glow"
        style={{ background: "linear-gradient(165deg, #1a2744 0%, #0b1528 45%, #060d18 100%)" }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-t-3xl sm:rounded-3xl">
          <div
            className="absolute -inset-1 bg-gradient-to-r from-transparent via-yellow-300/25 to-transparent animate-cq-shine"
            style={{ width: "40%" }}
          />
        </div>

        {phase === "chest" ? (
          <div className="relative flex flex-col items-center px-5 pb-8 pt-10 text-center">
            <p
              id="boss-victory-title"
              className="bg-gradient-to-r from-yellow-200 via-amber-100 to-yellow-300 bg-clip-text text-4xl font-black tracking-tight text-transparent drop-shadow-[0_0_24px_rgba(250,204,21,0.8)] sm:text-5xl"
            >
              Victory!
            </p>
            <p className="mt-3 text-lg font-bold text-cq-keaneyBright">A loot box awaits</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-cq-keaneyIce/85">
              You defeated a boss. Open it to see what you earned.
            </p>

            <button
              type="button"
              onClick={() => setPhase("reveal")}
              className="group relative mt-8 flex flex-col items-center focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400/60"
            >
              <span className="absolute inset-0 -m-8 rounded-full bg-yellow-400/15 blur-3xl transition group-hover:bg-yellow-300/25" />
              <div className="relative animate-cq-float">
                <div className="animate-cq-victory-pulse rounded-2xl p-2">
                  <Image
                    src={CHEST_SRC}
                    alt="Treasure chest — tap to open"
                    width={280}
                    height={220}
                    unoptimized
                    className="mx-auto h-auto max-h-[min(38vh,220px)] w-auto max-w-[85vw] object-contain drop-shadow-[0_0_28px_rgba(253,224,71,0.65)] transition group-hover:drop-shadow-[0_0_48px_rgba(253,224,71,0.95)] mix-blend-screen"
                  />
                </div>
              </div>
              <span className="mt-4 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-2.5 text-sm font-black uppercase tracking-widest text-cq-navy shadow-lg ring-2 ring-yellow-200/50 transition group-hover:scale-105 group-active:scale-95">
                Tap the chest to open
              </span>
            </button>
          </div>
        ) : (
          <div className="relative flex max-h-[min(92dvh,820px)] flex-col overflow-y-auto px-5 pb-8 pt-8 sm:max-h-[min(88dvh,760px)]">
            <div className="animate-cq-pop text-center">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-yellow-300/90">Boss down</p>
              <h2 className="mt-2 bg-gradient-to-r from-yellow-200 via-white to-cq-keaneyBright bg-clip-text text-3xl font-black uppercase tracking-wide text-transparent drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] sm:text-4xl">
                Boss defeated!
              </h2>
              <p className="mt-3 text-base font-semibold text-cq-keaneyIce">
                You defeated{" "}
                <span className="font-bold text-white">{pending.bossName}</span>
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-cq-keaney/40 bg-cq-navy/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-yellow-400/20">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cq-keaney">Activity</p>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-lg font-bold text-white">
                  <span aria-hidden>{actEmoji}</span>
                  {pending.activityTitle}
                </p>
                <p className="mt-2 text-xl font-black tabular-nums text-yellow-300">+{pending.xpReward} XP</p>
                {statLine ? (
                  <p className="mt-1 text-sm font-semibold text-cq-keaneyBright">📚 {statLine}</p>
                ) : null}
              </div>

              <div className="rounded-2xl border border-yellow-500/35 bg-gradient-to-br from-cq-navy/80 to-black/40 p-4 shadow-[0_0_32px_rgba(250,204,21,0.15)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-200/90">Loot dropped</p>
                <div className="mt-3 flex items-start gap-3">
                  <span className="text-4xl drop-shadow-[0_0_12px_rgba(253,224,71,0.5)]" aria-hidden>
                    {lootEmoji(pending.lootItem.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-white">{pending.lootItem.name}</p>
                    <div className="mt-2">
                      <RarityBadge rarity={pending.lootItem.rarity} />
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-cq-keaneyIce/80">
                      When equipped: Cosmetic only (no XP or streak bonus)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => dismissBossVictory()}
              className="mt-8 w-full rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 py-4 text-base font-black uppercase tracking-widest text-cq-navy shadow-[0_8px_32px_rgba(250,204,21,0.45)] ring-2 ring-yellow-200/60 transition hover:brightness-110 active:scale-[0.98]"
            >
              Awesome!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
