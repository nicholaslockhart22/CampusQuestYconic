import { Card } from "@/components/ui/card";
import { RarityBadge } from "@/components/ui/rarity-badge";
import { SectionHeading } from "@/components/ui/section-heading";
import type { InventoryItem } from "@/lib/types";

export function InventoryPanel({ items }: { items: InventoryItem[] }) {
  return (
    <Card>
      <SectionHeading
        eyebrow="Inventory"
        title="Boss drops and collectibles"
        description="A Pokédex-style collection panel for loot, rare drops, and campus unlocks."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-3xl border border-uri-navy/10 bg-white/70 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-uri-ink">{item.name}</h3>
                <p className="mt-2 text-sm text-uri-navy/62">{item.source}</p>
              </div>
              <RarityBadge rarity={item.rarity} />
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}
