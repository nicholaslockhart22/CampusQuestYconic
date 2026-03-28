"use client";

import { AppShell } from "@/components/ui/app-shell";
import { ActivityLogPanel } from "@/components/dashboard/activity-log-panel";
import { BossBattlePanel } from "@/components/dashboard/boss-battle-panel";
import { FeedPanel } from "@/components/dashboard/feed-panel";
import { HeroPanel } from "@/components/dashboard/hero-panel";
import { InventoryPanel } from "@/components/dashboard/inventory-panel";
import { LeaderboardPanel } from "@/components/dashboard/leaderboard-panel";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";
import { ProfileStats } from "@/components/dashboard/profile-stats";
import { QuestBoard } from "@/components/dashboard/quest-board";
import { useGameState } from "@/components/providers/game-state-provider";

export function DashboardScreen() {
  const { state, logActivity, markNotificationRead, claimQuestReward, confirmFeedPost } = useGameState();

  return (
    <AppShell
      title="URI student growth, reimagined as a fantasy RPG."
      subtitle="A polished college-life dashboard for logging progress, clearing quests, preparing for boss battles, and building campus momentum."
    >
      <HeroPanel profile={state.profile} />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <ProfileStats profile={state.profile} />
          <ActivityLogPanel onLogActivity={logActivity} />
          <QuestBoard quests={state.quests} onClaimReward={claimQuestReward} />
          <FeedPanel posts={state.feed} onConfirm={confirmFeedPost} />
        </div>

        <div className="space-y-6">
          <BossBattlePanel boss={state.bossBattle} />
          <LeaderboardPanel entries={state.leaderboard} />
          <InventoryPanel items={state.inventory} />
          <NotificationsPanel
            notifications={state.notifications}
            onMarkRead={markNotificationRead}
          />
        </div>
      </div>
    </AppShell>
  );
}
