"use client";

import { useGameState } from "@/components/providers/game-state-provider";
import { BossBattlePanel } from "@/components/dashboard/boss-battle-panel";
import { QuestBoard } from "@/components/dashboard/quest-board";
import { AppShell } from "@/components/ui/app-shell";
import { Card } from "@/components/ui/card";

export function QuestsScreen() {
  const { state, claimQuestReward } = useGameState();

  return (
    <AppShell
      title="Quest board & boss prep"
      subtitle="Clear dailies, push weekly momentum, finish URI specials, and prime boss battles from one screen."
    >
      <Card className="border-uri-gold/40 bg-gradient-to-r from-white to-[#fff9ec]">
        <p className="text-xs uppercase tracking-[0.24em] text-uri-navy/52">Rhody tip</p>
        <p className="mt-2 text-sm leading-7 text-uri-navy/72">
          Logging study, focus sprints, events, and workouts advances different quest tags. When a bar fills, claim your XP—loot rolls can drop straight into inventory.
        </p>
      </Card>
      <BossBattlePanel boss={state.bossBattle} />
      <QuestBoard quests={state.quests} onClaimReward={claimQuestReward} />
    </AppShell>
  );
}
