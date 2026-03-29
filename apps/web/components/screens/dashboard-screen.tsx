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
  const {
    state,
    logActivity,
    markNotificationRead,
    toggleNotificationStar,
    claimQuestReward,
    reactToFeedPost
  } = useGameState();

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
          <FeedPanel posts={state.feed} onReact={reactToFeedPost} />
        </div>

        <div className="space-y-6">
          {state.recruitedBosses.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-uri-navy/20 bg-white/60 px-4 py-6 text-sm text-uri-navy/60">
              No bosses yet — recruit up to four on the <strong className="text-uri-navy">Battle</strong> tab and set
              which one is active to earn prep from logs.
            </p>
          ) : (
            state.recruitedBosses.map((boss) => <BossBattlePanel key={boss.id} boss={boss} />)
          )}
          <LeaderboardPanel entries={state.leaderboard} />
          <InventoryPanel items={state.inventory} />
          <NotificationsPanel
            notifications={state.notifications}
            onMarkRead={markNotificationRead}
            onToggleStar={toggleNotificationStar}
          />
        </div>
      </div>
    </AppShell>
  );
}
