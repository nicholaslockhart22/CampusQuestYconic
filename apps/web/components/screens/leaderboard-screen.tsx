"use client";

import { useGameState } from "@/components/providers/game-state-provider";
import { LeaderboardPanel } from "@/components/dashboard/leaderboard-panel";

export function LeaderboardScreen() {
  const { state } = useGameState();

  return (
    <div className="space-y-4 px-3 pb-4 pt-1">
      <div className="rounded-xl border border-cq-keaney/35 bg-gradient-to-br from-cq-keaneyIce to-cq-white px-3 py-3 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">Leaderboard</p>
        <p className="text-lg font-bold text-cq-navy">Campus standings</p>
        <p className="mt-1 text-sm text-ig-secondary">
          Friendly XP and streak competition—log activities on Battle to climb the board.
        </p>
      </div>
      <LeaderboardPanel entries={state.leaderboard} />
    </div>
  );
}
