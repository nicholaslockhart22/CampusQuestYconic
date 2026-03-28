"use client";

import { useEffect, useState } from "react";
import { applyXpGain, rankForPlayer, syncLeaderboard } from "@/lib/game-logic";
import { getSampleState } from "@/lib/sample-data";
import { loadState, saveState } from "@/lib/storage";
import type { ActivityLog, CampusQuestState, CharacterProfile, StatBlock } from "@/lib/types";

const defaultGuilds = getSampleState().guilds;

function mergeStats(base: StatBlock, delta: Partial<StatBlock>): StatBlock {
  return {
    strength: base.strength + (delta.strength ?? 0),
    stamina: base.stamina + (delta.stamina ?? 0),
    knowledge: base.knowledge + (delta.knowledge ?? 0),
    social: base.social + (delta.social ?? 0),
    focus: base.focus + (delta.focus ?? 0)
  };
}

function normalizeLoadedState(raw: CampusQuestState): CampusQuestState {
  return {
    ...raw,
    quests: raw.quests.map((quest) => ({
      ...quest,
      rewardClaimed: quest.rewardClaimed ?? false
    })),
    guilds: raw.guilds?.length ? raw.guilds : defaultGuilds
  };
}

function questAdvancesForActivity(
  quest: { tag: string; rewardClaimed?: boolean; progress: number; goal: number },
  activity: ActivityLog
): boolean {
  if (quest.rewardClaimed || quest.progress >= quest.goal) {
    return false;
  }
  const activeTags = [
    activity.type === "study" || activity.type === "focus" ? "Focus" : null,
    activity.type === "event" || activity.type === "club" ? "Campus" : null
  ];
  if (quest.tag === "Focus" && activeTags.includes("Focus")) {
    return true;
  }
  if (quest.tag === "Campus" && activeTags.includes("Campus")) {
    return true;
  }
  if (quest.tag === "Momentum") {
    return true;
  }
  if (
    quest.tag === "URI" &&
    (activity.type === "study" || activity.type === "workout" || activity.type === "event" || activity.type === "club")
  ) {
    return true;
  }
  return false;
}

export function useLocalGameState() {
  const [state, setState] = useState<CampusQuestState>(() => normalizeLoadedState(getSampleState()));

  useEffect(() => {
    const persisted = loadState();
    if (persisted) {
      setState(normalizeLoadedState(persisted));
    }
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  function logActivity(activity: ActivityLog) {
    setState((current) => {
      const grown = applyXpGain(current.profile, activity.xpReward);
      const profile = { ...grown, streakDays: grown.streakDays + 1 };
      const nextQuests = current.quests.map((quest) => {
        if (!questAdvancesForActivity(quest, activity)) {
          return quest;
        }
        return { ...quest, progress: Math.min(quest.goal, quest.progress + 1) };
      });

      const prevPrep = current.bossBattle.prepProgress;
      const prepGoal = current.bossBattle.prepGoal;
      const newPrep = Math.min(prepGoal, prevPrep + 1);
      const bossBattle = { ...current.bossBattle, prepProgress: newPrep };
      const prepComplete = newPrep >= prepGoal && prevPrep < prepGoal;

      const leaderboard = syncLeaderboard(current.leaderboard, profile);
      const rank = rankForPlayer(leaderboard, profile.name);
      const rankedProfile = rank > 0 ? { ...profile, rank } : profile;

      const topNotifications = [
        {
          id: `n-${Date.now()}`,
          title: `${activity.title} logged`,
          body: `You earned ${activity.xpReward} XP. Boss prep ${newPrep}/${prepGoal}.`,
          createdAt: "just now",
          read: false
        },
        ...(prepComplete
          ? [
              {
                id: `n-boss-${Date.now()}`,
                title: "Boss prep complete",
                body: `${bossBattle.name} is fully primed. Claim your advantage before the battle window.`,
                createdAt: "just now",
                read: false
              }
            ]
          : [])
      ];

      return {
        ...current,
        profile: rankedProfile,
        activities: [activity, ...current.activities],
        quests: nextQuests,
        bossBattle,
        leaderboard,
        notifications: [...topNotifications, ...current.notifications]
      };
    });
  }

  function claimQuestReward(questId: string) {
    setState((current) => {
      const quest = current.quests.find((entry) => entry.id === questId);
      if (!quest || quest.progress < quest.goal || quest.rewardClaimed) {
        return current;
      }

      const profile = applyXpGain(current.profile, quest.xpReward);
      const leaderboard = syncLeaderboard(current.leaderboard, profile);
      const rank = rankForPlayer(leaderboard, profile.name);
      const rankedProfile = rank > 0 ? { ...profile, rank } : profile;

      const bonusRoll = Math.random();
      let inventory = current.inventory;
      const notifications = [...current.notifications];
      if (bonusRoll > 0.55) {
        const drop = {
          id: `loot-${Date.now()}`,
          name: bonusRoll > 0.85 ? "Dean's Favor Shard" : "Focus Sigil Fragment",
          rarity: bonusRoll > 0.85 ? ("legendary" as const) : ("rare" as const),
          source: quest.title
        };
        inventory = [drop, ...inventory];
        notifications.unshift({
          id: `n-loot-${Date.now()}`,
          title: "Quest loot acquired",
          body: `${drop.name} (${drop.rarity}) added to inventory.`,
          createdAt: "just now",
          read: false
        });
      }

      return {
        ...current,
        profile: rankedProfile,
        quests: current.quests.map((entry) =>
          entry.id === questId ? { ...entry, rewardClaimed: true } : entry
        ),
        leaderboard,
        inventory,
        notifications
      };
    });
  }

  function markNotificationRead(id: string) {
    setState((current) => ({
      ...current,
      notifications: current.notifications.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    }));
  }

  function confirmFeedPost(postId: string) {
    setState((current) => ({
      ...current,
      feed: current.feed.map((post) =>
        post.id === postId ? { ...post, confirmations: post.confirmations + 1 } : post
      )
    }));
  }

  function updateProfile(patch: Partial<Pick<CharacterProfile, "name" | "bio" | "avatarClass">>) {
    setState((current) => {
      const nextProfile = { ...current.profile, ...patch };
      const leaderboard = syncLeaderboard(current.leaderboard, nextProfile);
      const rank = rankForPlayer(leaderboard, nextProfile.name);
      return {
        ...current,
        profile: rank > 0 ? { ...nextProfile, rank } : nextProfile,
        leaderboard
      };
    });
  }

  return {
    state,
    logActivity,
    claimQuestReward,
    markNotificationRead,
    confirmFeedPost,
    updateProfile
  };
}
