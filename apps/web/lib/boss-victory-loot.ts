import type { BossBattle, InventoryItem, Rarity } from "./types";

/** Roll a boss drop: mix of preview table + occasional cosmetic. */
export function rollBossLootItem(boss: BossBattle, idSuffix: string): InventoryItem {
  const source = `Defeated ${boss.name}`;
  if (Math.random() < 0.42) {
    return {
      id: `loot-boss-${idSuffix}-cosmetic`,
      name: "Sunglasses",
      rarity: "common",
      source
    };
  }
  const previews = boss.lootPreview;
  const pick =
    previews.length > 0
      ? previews[Math.floor(Math.random() * previews.length)]!
      : { name: "Campus Loot Cache", rarity: "common" as Rarity };
  return {
    id: `loot-boss-${idSuffix}`,
    name: pick.name,
    rarity: pick.rarity,
    source
  };
}
