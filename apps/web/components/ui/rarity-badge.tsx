import type { Rarity } from "@/lib/types";

const rarityClasses: Record<Rarity, string> = {
  common: "bg-cq-keaneyIce text-cq-navy ring-1 ring-cq-keaney/30",
  uncommon: "bg-cq-keaneySoft text-cq-navy ring-1 ring-cq-keaney/40",
  rare: "bg-cq-keaney/45 text-cq-navy ring-1 ring-cq-navy/15",
  legendary: "bg-uri-gold/35 text-cq-navy ring-1 ring-uri-gold/50"
};

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${rarityClasses[rarity]}`}>
      {rarity}
    </span>
  );
}
