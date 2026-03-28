"use client";

import { useGameState } from "@/components/providers/game-state-provider";
import { InventoryPanel } from "@/components/dashboard/inventory-panel";
import { AppShell } from "@/components/ui/app-shell";
import { Card } from "@/components/ui/card";

export function InventoryScreen() {
  const { state } = useGameState();

  return (
    <AppShell
      title="Inventory & loot"
      subtitle="Boss prep, quest claims, and special URI events can drop rarity-tier loot. Collect the set."
    >
      <Card className="bg-white/80">
        <p className="text-xs uppercase tracking-[0.24em] text-uri-navy/52">Collection power</p>
        <p className="mt-2 text-sm text-uri-navy/72">
          You are carrying <strong>{state.inventory.length}</strong> items. Legendary drops are rare—keep clearing quests and finishing boss prep windows.
        </p>
      </Card>
      <InventoryPanel items={state.inventory} />
    </AppShell>
  );
}
