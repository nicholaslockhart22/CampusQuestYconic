import type { Rarity } from "@/lib/types";

const rarityClasses: Record<Rarity, string> = {
  common: "bg-slate-100 text-slate-700",
  uncommon: "bg-emerald-100 text-emerald-800",
  rare: "bg-sky-100 text-sky-800",
  legendary: "bg-amber-100 text-amber-800"
};

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${rarityClasses[rarity]}`}>
      {rarity}
    </span>
  );
}
