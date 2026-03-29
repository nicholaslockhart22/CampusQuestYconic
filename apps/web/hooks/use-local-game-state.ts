"use client";

import { useEffect, useState } from "react";
import { applyXpGain, rankForPlayer, syncLeaderboard } from "@/lib/game-logic";
import { getSampleState } from "@/lib/sample-data";
import { loadState, saveState } from "@/lib/storage";
import type {
  ActivityLog,
  BossBattle,
  CampusQuestState,
  CharacterProfile,
  FeedPost,
  StatBlock
} from "@/lib/types";

type RawPersisted = Partial<CampusQuestState> & { bossBattle?: BossBattle };

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

function normalizeLoadedState(raw: CampusQuestState | RawPersisted): CampusQuestState {
  const legacy = raw as RawPersisted;
  const bossBattles =
    Array.isArray(legacy.bossBattles) && legacy.bossBattles.length > 0
      ? legacy.bossBattles
      : legacy.bossBattle
        ? [legacy.bossBattle]
        : getSampleState().bossBattles;

  const base = raw as CampusQuestState;
  return {
    ...base,
    quests: (base.quests || []).map((quest) => ({
      ...quest,
      rewardClaimed: quest.rewardClaimed ?? false
    })),
    guilds: base.guilds?.length ? base.guilds : defaultGuilds,
    bossBattles,
    feedFollowing:
      Array.isArray(base.feedFollowing) && base.feedFollowing.length > 0
        ? base.feedFollowing
        : getSampleState().feedFollowing
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

      const bossBattles = current.bossBattles.map((b) => ({ ...b }));
      const activeIdx = bossBattles.findIndex((b) => b.prepProgress < b.prepGoal);
      let prepComplete = false;
      let completedBossName = "";
      let prepLine = "";
      if (activeIdx >= 0) {
        const b = bossBattles[activeIdx];
        const prevPrep = b.prepProgress;
        const newPrep = Math.min(b.prepGoal, prevPrep + 1);
        bossBattles[activeIdx] = { ...b, prepProgress: newPrep };
        prepComplete = newPrep >= b.prepGoal && prevPrep < b.prepGoal;
        completedBossName = b.name;
        prepLine = `${newPrep}/${b.prepGoal} on ${b.name}`;
      } else {
        prepLine = "All bosses primed";
      }

      const leaderboard = syncLeaderboard(current.leaderboard, profile);
      const rank = rankForPlayer(leaderboard, profile.name);
      const rankedProfile = rank > 0 ? { ...profile, rank } : profile;

      const topNotifications = [
        {
          id: `n-${Date.now()}`,
          title: `${activity.title} logged`,
          body: `You earned ${activity.xpReward} XP. ${prepLine}.`,
          createdAt: "just now",
          read: false
        },
        ...(prepComplete
          ? [
              {
                id: `n-boss-${Date.now()}`,
                title: "Boss prep complete",
                body: `${completedBossName} is fully primed. Open Battle to claim your edge.`,
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
        bossBattles,
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
      ),
      feedFollowing: current.feedFollowing.map((post) =>
        post.id === postId ? { ...post, confirmations: post.confirmations + 1 } : post
      )
    }));
  }

  function addFeedPost(payload: {
    title: string;
    body: string;
    category: string;
    audience: "foryou" | "friends";
  }) {
    const title = payload.title.trim() || "Quad update";
    const body = payload.body.trim();
    if (!body) {
      return;
    }
    const post: FeedPost = {
      id: `f-user-${Date.now()}`,
      author: "",
      title,
      body,
      category: payload.category.trim() || "Campus",
      confirmations: 0,
      timestamp: "just now"
    };

    setState((current) => {
      const withAuthor = { ...post, author: current.profile.name };
      const isFriends = payload.audience === "friends";
      const notif = isFriends
        ? {
            id: `n-post-${Date.now()}`,
            title: "Shared with friends",
            body: "Your update is on the Following feed.",
            createdAt: "just now" as const,
            read: false as const
          }
        : {
            id: `n-post-${Date.now()}`,
            title: "Posted to the Quad",
            body: "Your update is live on For you.",
            createdAt: "just now" as const,
            read: false as const
          };
      return {
        ...current,
        feed: isFriends ? current.feed : [withAuthor, ...current.feed],
        feedFollowing: isFriends ? [withAuthor, ...current.feedFollowing] : current.feedFollowing,
        notifications: [notif, ...current.notifications]
      };
    });
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
    addFeedPost,
    updateProfile
  };
}
