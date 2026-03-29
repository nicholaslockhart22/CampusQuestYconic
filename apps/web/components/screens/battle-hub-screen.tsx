"use client";

import { useGameState } from "@/components/providers/game-state-provider";
import { ActivityLogPanel } from "@/components/dashboard/activity-log-panel";
import { BossBattlePanel } from "@/components/dashboard/boss-battle-panel";
export function BattleHubScreen() {
  const { state, logActivity } = useGameState();

  return (
    <div className="space-y-4 px-3 pb-4 pt-1">
      <div className="rounded-xl border border-cq-keaney/35 bg-gradient-to-br from-cq-keaneyIce to-cq-white px-3 py-3 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">Battle hub</p>
        <p className="text-lg font-bold text-cq-navy">Boss prep & standings</p>
        <p className="mt-1 text-sm text-ig-secondary">
          Log IRL wins to advance prep on your active boss. Open Daily / Events from the top menu for quest claims. Check
          the Leaderboard tab for standings.
        </p>
      </div>

      <ActivityLogPanel onLogActivity={logActivity} />

      <section>
        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-cq-keaney">Boss battles</h2>
        <div className="space-y-4">
          {state.bossBattles.map((boss) => (
            <BossBattlePanel key={boss.id} boss={boss} />
          ))}
        </div>
      </section>
    </div>
  );
}
