"use client";

import { useCallback, useEffect, useState } from "react";
import { activityPrimaryStat } from "@/lib/activity-primary-stat";
import { localDateKey, localMondayDateKey } from "@/lib/calendar-local";
import { clearSession, getSession } from "@/lib/campus-auth";
import { applyXpGain, rankForPlayer, syncLeaderboard } from "@/lib/game-logic";
import { createFreshGameState } from "@/lib/fresh-game-state";
import { resolveFeedImageUrl } from "@/lib/feed-image-url";
import { EMPTY_REACTIONS, normalizeFeedPost } from "@/lib/post-reactions";
import { formatStatDeltaLine } from "@/lib/activity-stat-deltas";
import { rollBossLootItem } from "@/lib/boss-victory-loot";
import { getSampleState } from "@/lib/sample-data";
import { getGameStorageKey, loadState, saveState } from "@/lib/storage";
import type {
  ActivityLog,
  BossBattle,
  BossVictoryPending,
  BossWeakness,
  CampusQuestState,
  CharacterProfile,
  EquipmentLoadout,
  EquipmentSlot,
  FeedPost,
  PostReactionKind,
  StatBlock,
  GuildSummary
} from "@/lib/types";

type RawPersisted = Partial<CampusQuestState> & { bossBattle?: BossBattle };

const defaultGuilds = getSampleState().guilds;

/** Ignore persisted saves that still use the expanded guild model (roster / guildQuest). */
function normalizeGuildsList(list: GuildSummary[] | undefined): GuildSummary[] {
  if (!list?.length) return defaultGuilds;
  const first = list[0] as unknown as Record<string, unknown>;
  if ("roster" in first || "guildQuest" in first) return defaultGuilds;
  return list;
}

function mergeStats(base: StatBlock, delta: Partial<StatBlock>): StatBlock {
  return {
    strength: base.strength + (delta.strength ?? 0),
    stamina: base.stamina + (delta.stamina ?? 0),
    knowledge: base.knowledge + (delta.knowledge ?? 0),
    social: base.social + (delta.social ?? 0),
    focus: base.focus + (delta.focus ?? 0)
  };
}

function ensureStatBlock(raw: Partial<StatBlock> | StatBlock | undefined): StatBlock {
  return {
    strength: Math.max(0, Math.round(Number(raw?.strength) || 0)),
    stamina: Math.max(0, Math.round(Number(raw?.stamina) || 0)),
    knowledge: Math.max(0, Math.round(Number(raw?.knowledge) || 0)),
    social: Math.max(0, Math.round(Number(raw?.social) || 0)),
    focus: Math.max(0, Math.round(Number(raw?.focus) || 0))
  };
}

function normalizePendingBossVictory(raw: unknown): BossVictoryPending | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const loot = o.lootItem;
  if (
    typeof o.id !== "string" ||
    typeof o.bossName !== "string" ||
    typeof o.activityTitle !== "string" ||
    typeof o.activityType !== "string" ||
    typeof o.xpReward !== "number" ||
    !loot ||
    typeof loot !== "object"
  ) {
    return null;
  }
  const L = loot as Record<string, unknown>;
  if (
    typeof L.id !== "string" ||
    typeof L.name !== "string" ||
    typeof L.rarity !== "string" ||
    typeof L.source !== "string"
  ) {
    return null;
  }
  return raw as BossVictoryPending;
}

const MAX_RECRUITED_BOSSES = 4;

function defaultRecruitedLoot(): BossBattle["lootPreview"] {
  return [
    { name: "Campus Loot Cache", rarity: "common" },
    { name: "Rhody Sigil", rarity: "uncommon" },
    { name: "Dean's Spark", rarity: "legendary" }
  ];
}

type LegacyBossPersisted = {
  id: string;
  name: string;
  theme?: string;
  prepProgress?: number;
  prepGoal?: number;
  maxHp?: number;
  hpRemaining?: number;
  weakness?: BossWeakness;
  lootPreview?: BossBattle["lootPreview"];
};

function migrateBossBattle(raw: LegacyBossPersisted): BossBattle {
  const lootPreview =
    raw.lootPreview?.length ? raw.lootPreview : defaultRecruitedLoot();
  if (
    typeof raw.maxHp === "number" &&
    typeof raw.hpRemaining === "number" &&
    raw.weakness != null
  ) {
    const maxHp = Math.max(250, Math.round(raw.maxHp));
    const hpRemaining = Math.min(maxHp, Math.max(0, Math.round(raw.hpRemaining)));
    return {
      id: raw.id,
      name: raw.name,
      theme:
        raw.theme?.trim() ||
        (maxHp >= 500 ? "Final-tier threat — better loot odds" : "Campus boss"),
      maxHp,
      hpRemaining,
      weakness: raw.weakness,
      lootPreview
    };
  }
  const prepGoal = Math.max(1, Number(raw.prepGoal) || 10);
  const prepProgress = Math.max(0, Number(raw.prepProgress) || 0);
  const maxHp = Math.max(250, prepGoal * 25);
  const dealt = Math.min(maxHp, Math.round((prepProgress / prepGoal) * maxHp));
  return {
    id: raw.id,
    name: raw.name,
    theme: raw.theme?.trim() || "Campus boss",
    maxHp,
    hpRemaining: maxHp - dealt,
    weakness: "random",
    lootPreview
  };
}

const BOSS_BASE_DAMAGE_FRAC = 0.02;
const BOSS_RANDOM_CRIT_CHANCE = 0.28;
const DAILY_TRAINING_MAX_PLAYS = 2;
const DAILY_TRAINING_XP = 22;

function normalizeEquipmentLoadout(
  inventoryIds: Set<string>,
  raw?: Partial<EquipmentLoadout> | null
): EquipmentLoadout {
  const pick = (id: string | null | undefined) =>
    id && inventoryIds.has(id) ? id : null;
  const r = raw ?? {};
  return {
    hat: pick(r.hat),
    glasses: pick(r.glasses),
    backpack: pick(r.backpack)
  };
}

function normalizeTraining(dayKey: string | undefined, used: number | undefined) {
  const today = localDateKey();
  if (dayKey !== today) {
    return { trainingDayKey: today, trainingPlaysUsed: 0 };
  }
  return {
    trainingDayKey: today,
    trainingPlaysUsed: Math.min(DAILY_TRAINING_MAX_PLAYS, Math.max(0, used ?? 0))
  };
}

function normalizeCampusRaid(base: {
  campusRaidWeekKey?: string;
  campusRaidContributions?: Record<string, number>;
}): {
  campusRaidWeekKey: string;
  campusRaidContributions: Record<string, number>;
} {
  const monday = localMondayDateKey();
  const raw = base.campusRaidContributions;
  let contributions: Record<string, number> =
    typeof raw === "object" && raw !== null && !Array.isArray(raw)
      ? { ...(raw as Record<string, number>) }
      : {};
  let weekKey = typeof base.campusRaidWeekKey === "string" ? base.campusRaidWeekKey : monday;
  if (weekKey !== monday) {
    contributions = {};
    weekKey = monday;
  }
  return { campusRaidWeekKey: weekKey, campusRaidContributions: contributions };
}

/** Campus demo posts always stay in "For you"; saved state merges by id (reactions, etc.) and appends user-only posts. */
function mergeQuadFeedWithSample(persisted: FeedPost[] | undefined): FeedPost[] {
  const sampleFeed = getSampleState().feed;
  const persistedArr = Array.isArray(persisted) ? persisted : [];
  if (persistedArr.length === 0) {
    return sampleFeed;
  }
  const sampleIds = new Set(sampleFeed.map((p) => p.id));
  const persistedById = new Map(persistedArr.map((p) => [p.id, p]));
  return [
    ...sampleFeed.map((post) => {
      const saved = persistedById.get(post.id);
      if (!saved) return post;
      const mergedImage =
        typeof saved.imageUrl === "string" && saved.imageUrl.trim() !== ""
          ? saved.imageUrl
          : post.imageUrl;
      return { ...post, ...saved, imageUrl: mergedImage } as FeedPost;
    }),
    ...persistedArr.filter((p) => !sampleIds.has(p.id)),
  ];
}

function computeBossDamage(
  b: BossBattle,
  activity: ActivityLog
): { damage: number; bonus: boolean } {
  const base = Math.max(10, Math.round(b.maxHp * BOSS_BASE_DAMAGE_FRAC));
  let damage = base;
  let bonus = false;
  if (b.weakness === "random") {
    if (Math.random() < BOSS_RANDOM_CRIT_CHANCE) {
      damage += base;
      bonus = true;
    }
  } else if (activityPrimaryStat(activity) === b.weakness) {
    damage += base;
    bonus = true;
  }
  damage = Math.min(damage, b.hpRemaining);
  return { damage, bonus };
}

function normalizeLoadedState(raw: CampusQuestState | RawPersisted): CampusQuestState {
  const legacy = raw as RawPersisted;
  const base = raw as CampusQuestState;

  let recruitedBosses: BossBattle[] = Array.isArray(base.recruitedBosses)
    ? base.recruitedBosses.map((b) => ({ ...b }))
    : [];

  const legacyBosses: BossBattle[] =
    Array.isArray(legacy.bossBattles) && legacy.bossBattles.length > 0
      ? legacy.bossBattles.map((b) => ({ ...b }))
      : legacy.bossBattle
        ? [{ ...legacy.bossBattle }]
        : [];

  if (recruitedBosses.length === 0 && legacyBosses.length > 0) {
    recruitedBosses = legacyBosses.slice(0, MAX_RECRUITED_BOSSES);
  }

  recruitedBosses = recruitedBosses
    .slice(0, MAX_RECRUITED_BOSSES)
    .map((b) => migrateBossBattle(b as LegacyBossPersisted));

  let activeRecruitedBossId: string | null =
    typeof base.activeRecruitedBossId === "string" ? base.activeRecruitedBossId : null;
  if (activeRecruitedBossId && !recruitedBosses.some((b) => b.id === activeRecruitedBossId)) {
    activeRecruitedBossId = recruitedBosses[0]?.id ?? null;
  }
  if (!activeRecruitedBossId && recruitedBosses.length > 0) {
    activeRecruitedBossId = recruitedBosses[0].id;
  }

  const feedFollowingRaw =
    Array.isArray(base.feedFollowing) && base.feedFollowing.length > 0
      ? base.feedFollowing
      : getSampleState().feedFollowing;

  const feedRaw = mergeQuadFeedWithSample(base.feed);

  const inventory = Array.isArray(base.inventory) ? base.inventory : getSampleState().inventory;
  const inventoryIds = new Set(inventory.map((i) => i.id));
  const trainingNorm = normalizeTraining(base.trainingDayKey, base.trainingPlaysUsed);
  const campusRaidNorm = normalizeCampusRaid(base);
  const sessionEmail = getSession()?.email;

  return {
    ...base,
    profile: {
      ...base.profile,
      handle: base.profile.handle ?? "",
      skillPoints: base.profile.skillPoints ?? 0,
      stats: ensureStatBlock(base.profile.stats),
      ...(sessionEmail && !base.profile.email ? { email: sessionEmail } : {})
    },
    quests: (base.quests || []).map((quest) => ({
      ...quest,
      rewardClaimed: quest.rewardClaimed ?? false
    })),
    guilds: normalizeGuildsList(base.guilds),
    bossBattles: [],
    recruitedBosses,
    activeRecruitedBossId,
    inventory,
    equipmentLoadout: normalizeEquipmentLoadout(inventoryIds, base.equipmentLoadout),
    trainingDayKey: trainingNorm.trainingDayKey,
    trainingPlaysUsed: trainingNorm.trainingPlaysUsed,
    campusRaidWeekKey: campusRaidNorm.campusRaidWeekKey,
    campusRaidContributions: campusRaidNorm.campusRaidContributions,
    feed: feedRaw.map((p) =>
      normalizeFeedPost(p as FeedPost & { confirmations?: number })
    ),
    feedFollowing: feedFollowingRaw.map((p) =>
      normalizeFeedPost(p as FeedPost & { confirmations?: number })
    ),
    directMessageThreads:
      Array.isArray(base.directMessageThreads) && base.directMessageThreads.length > 0
        ? base.directMessageThreads
        : getSampleState().directMessageThreads,
    pendingBossVictory: normalizePendingBossVictory(base.pendingBossVictory),
    activityLogBanner: null
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

function getInitialGameState(): CampusQuestState {
  if (typeof window === "undefined") {
    return normalizeLoadedState(getSampleState());
  }
  const session = getSession();
  if (!session) {
    return normalizeLoadedState(getSampleState());
  }
  const persisted = loadState();
  if (persisted) {
    return normalizeLoadedState(persisted);
  }
  return normalizeLoadedState(createFreshGameState(session.email, session.displayName));
}

export function useLocalGameState() {
  const [state, setState] = useState<CampusQuestState>(() => getInitialGameState());

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    const persisted = loadState();
    if (persisted) {
      setState(normalizeLoadedState(persisted));
    } else {
      setState(normalizeLoadedState(createFreshGameState(session.email, session.displayName)));
    }
  }, []);

  useEffect(() => {
    if (!getSession()) return;
    saveState(state);
  }, [state]);

  function logActivity(activity: ActivityLog) {
    setState((current) => {
      const ts = Date.now();
      let nextInventory = current.inventory;
      let nextPendingVictory: BossVictoryPending | null = current.pendingBossVictory ?? null;

      const grown = applyXpGain(current.profile, activity.xpReward);
      const stats = mergeStats(ensureStatBlock(grown.stats), activity.statDelta);
      const profile = { ...grown, streakDays: grown.streakDays + 1, stats };
      const nextQuests = current.quests.map((quest) => {
        if (!questAdvancesForActivity(quest, activity)) {
          return quest;
        }
        return { ...quest, progress: Math.min(quest.goal, quest.progress + 1) };
      });

      const recruitedBosses = current.recruitedBosses.map((b) => ({ ...b }));
      const activeId = current.activeRecruitedBossId;
      const activeIdx =
        activeId != null ? recruitedBosses.findIndex((b) => b.id === activeId) : -1;
      let bossDefeated = false;
      let defeatedBossName = "";
      let prepLine = "";
      if (activeIdx >= 0) {
        const b = recruitedBosses[activeIdx];
        if (b.hpRemaining > 0) {
          const prevHp = b.hpRemaining;
          const { damage, bonus } = computeBossDamage(b, activity);
          const newHp = Math.max(0, prevHp - damage);
          recruitedBosses[activeIdx] = { ...b, hpRemaining: newHp };
          bossDefeated = newHp === 0 && prevHp > 0;
          defeatedBossName = b.name;
          prepLine = `-${damage} HP on ${b.name}${bonus ? " (weakness!)" : ""} · ${newHp}/${b.maxHp} left`;
        } else {
          prepLine = `${b.name} already at 0 HP`;
        }
      } else if (recruitedBosses.length === 0) {
        prepLine = "Recruit a boss on Battle to deal damage";
      } else {
        prepLine = "No active boss — set one on Battle";
      }

      if (bossDefeated && activeIdx >= 0) {
        const defeatedBoss = recruitedBosses[activeIdx]!;
        const lootItem = rollBossLootItem(defeatedBoss, String(ts));
        nextInventory = [lootItem, ...nextInventory];
        nextPendingVictory = {
          id: `bv-${ts}`,
          bossName: defeatedBossName,
          activityTitle: activity.title,
          activityType: activity.type,
          xpReward: activity.xpReward,
          statDelta: { ...activity.statDelta },
          lootItem
        };
      }

      const leaderboard = syncLeaderboard(current.leaderboard, profile);
      const rank = rankForPlayer(leaderboard, profile.name);
      const rankedProfile = rank > 0 ? { ...profile, rank } : profile;

      const raidMonday = localMondayDateKey();
      let campusRaidContributions = { ...(current.campusRaidContributions ?? {}) };
      if ((current.campusRaidWeekKey ?? "") !== raidMonday) {
        campusRaidContributions = {};
      }
      const contributorName = rankedProfile.name;
      campusRaidContributions = {
        ...campusRaidContributions,
        [contributorName]:
          (campusRaidContributions[contributorName] ?? 0) + activity.xpReward
      };

      const statLine = formatStatDeltaLine(activity.statDelta);
      const topNotifications = [
        {
          id: `n-${ts}`,
          title: `${activity.title} logged`,
          body: `You earned ${activity.xpReward} XP${statLine ? `. Stats: ${statLine}` : ""}. ${prepLine}.`,
          createdAt: "just now",
          read: false,
          starred: false,
          recencyRank: ts + 1
        },
        ...(bossDefeated
          ? [
              {
                id: `n-boss-${ts}`,
                title: "Boss defeated",
                body: `${defeatedBossName} hit 0 HP — tap your screen to open the victory loot chest!`,
                createdAt: "just now",
                read: false,
                starred: false,
                recencyRank: ts
              }
            ]
          : [])
      ];

      return {
        ...current,
        profile: rankedProfile,
        activities: [activity, ...current.activities],
        quests: nextQuests,
        recruitedBosses,
        bossBattles: [],
        leaderboard,
        campusRaidWeekKey: raidMonday,
        campusRaidContributions,
        inventory: nextInventory,
        pendingBossVictory: nextPendingVictory,
        activityLogBanner: {
          id: ts,
          activityTitle: activity.title,
          xpReward: activity.xpReward,
          ...(statLine ? { statsText: statLine } : {}),
          ...(prepLine ? { detailLine: prepLine } : {})
        },
        notifications: [...topNotifications, ...current.notifications]
      };
    });
  }

  const clearActivityLogBanner = useCallback(() => {
    setState((c) => ({ ...c, activityLogBanner: null }));
  }, []);

  function dismissBossVictory() {
    setState((c) => ({ ...c, pendingBossVictory: null }));
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
        const tsLoot = Date.now();
        notifications.unshift({
          id: `n-loot-${tsLoot}`,
          title: "Quest loot acquired",
          body: `${drop.name} (${drop.rarity}) added to inventory.`,
          createdAt: "just now",
          read: false,
          starred: false,
          recencyRank: tsLoot
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

  function markDirectMessageRead(threadId: string) {
    setState((current) => ({
      ...current,
      directMessageThreads: current.directMessageThreads.map((t) =>
        t.id === threadId ? { ...t, unread: false } : t
      )
    }));
  }

  function toggleNotificationStar(id: string) {
    setState((current) => ({
      ...current,
      notifications: current.notifications.map((item) =>
        item.id === id ? { ...item, starred: !item.starred } : item
      )
    }));
  }

  function toggleDirectMessageStar(id: string) {
    setState((current) => ({
      ...current,
      directMessageThreads: current.directMessageThreads.map((t) =>
        t.id === id ? { ...t, starred: !t.starred } : t
      )
    }));
  }

  function addFeedComment(postId: string, body: string) {
    const text = body.trim();
    if (!text) return;
    setState((current) => {
      const comment = {
        id: `c-${Date.now()}`,
        author: current.profile.name,
        body: text,
        timestamp: "just now"
      };
      const mapPost = (post: FeedPost) =>
        post.id === postId ? { ...post, comments: [...post.comments, comment] } : post;
      return {
        ...current,
        feed: current.feed.map(mapPost),
        feedFollowing: current.feedFollowing.map(mapPost)
      };
    });
  }

  function reactToFeedPost(postId: string, kind: PostReactionKind) {
    setState((current) => ({
      ...current,
      feed: current.feed.map((post) =>
        post.id === postId
          ? {
              ...post,
              reactions: { ...post.reactions, [kind]: post.reactions[kind] + 1 }
            }
          : post
      ),
      feedFollowing: current.feedFollowing.map((post) =>
        post.id === postId
          ? {
              ...post,
              reactions: { ...post.reactions, [kind]: post.reactions[kind] + 1 }
            }
          : post
      )
    }));
  }

  function addFeedPost(payload: {
    title: string;
    body: string;
    category: string;
    audience: "foryou" | "friends";
    ramarks: string[];
    imageUrl?: string;
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
      reactions: { ...EMPTY_REACTIONS },
      timestamp: "just now",
      ramarks: payload.ramarks,
      comments: [],
      ...(payload.imageUrl
        ? { imageUrl: resolveFeedImageUrl(payload.imageUrl) ?? payload.imageUrl }
        : {})
    };

    setState((current) => {
      const withAuthor = { ...post, author: current.profile.name };
      const isFriends = payload.audience === "friends";
      const tsPost = Date.now();
      const notif = isFriends
        ? {
            id: `n-post-${tsPost}`,
            title: "Shared with friends",
            body: "Your update is on the Following feed.",
            createdAt: "just now" as const,
            read: false as const,
            starred: false as const,
            recencyRank: tsPost
          }
        : {
            id: `n-post-${tsPost}`,
            title: "Posted to the Quad",
            body: "Your update is live on For you.",
            createdAt: "just now" as const,
            read: false as const,
            starred: false as const,
            recencyRank: tsPost
          };
      return {
        ...current,
        feed: isFriends ? current.feed : [withAuthor, ...current.feed],
        feedFollowing: isFriends ? [withAuthor, ...current.feedFollowing] : current.feedFollowing,
        notifications: [notif, ...current.notifications]
      };
    });
  }

  function updateProfile(
    patch: Partial<Pick<CharacterProfile, "name" | "bio" | "avatarClass" | "handle" | "skillPoints">>
  ) {
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

  function recruitBoss(payload: { name: string; maxHp: number; weakness: BossWeakness }) {
    const name = payload.name.trim();
    if (!name) return;
    setState((current) => {
      if (current.recruitedBosses.length >= MAX_RECRUITED_BOSSES) return current;
      const rawHp = Number(payload.maxHp);
      const maxHp = Number.isFinite(rawHp)
        ? Math.max(250, Math.min(99999, Math.round(rawHp)))
        : 250;
      const theme =
        maxHp >= 500 ? "Final-tier threat — better loot odds" : "Campus boss";
      const newBoss: BossBattle = {
        id: `rb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        theme,
        maxHp,
        hpRemaining: maxHp,
        weakness: payload.weakness,
        lootPreview: defaultRecruitedLoot()
      };
      const recruitedBosses = [...current.recruitedBosses, newBoss];
      const activeRecruitedBossId = current.activeRecruitedBossId ?? newBoss.id;
      return { ...current, recruitedBosses, activeRecruitedBossId, bossBattles: [] };
    });
  }

  function deleteRecruitedBoss(bossId: string) {
    setState((current) => {
      const recruitedBosses = current.recruitedBosses.filter((b) => b.id !== bossId);
      let activeRecruitedBossId = current.activeRecruitedBossId;
      if (activeRecruitedBossId === bossId) {
        activeRecruitedBossId = recruitedBosses[0]?.id ?? null;
      }
      return { ...current, recruitedBosses, activeRecruitedBossId, bossBattles: [] };
    });
  }

  function setActiveRecruitedBoss(bossId: string | null) {
    setState((current) => {
      if (bossId === null) {
        return { ...current, activeRecruitedBossId: null, bossBattles: [] };
      }
      if (!current.recruitedBosses.some((b) => b.id === bossId)) return current;
      return { ...current, activeRecruitedBossId: bossId, bossBattles: [] };
    });
  }

  function setEquipmentSlot(slot: EquipmentSlot, itemId: string | null) {
    setState((current) => {
      if (itemId != null && !current.inventory.some((i) => i.id === itemId)) {
        return current;
      }
      return {
        ...current,
        equipmentLoadout: { ...current.equipmentLoadout, [slot]: itemId }
      };
    });
  }

  function playDailyTraining() {
    setState((current) => {
      const today = localDateKey();
      let used = current.trainingPlaysUsed;
      let dayKey = current.trainingDayKey;
      if (dayKey !== today) {
        used = 0;
        dayKey = today;
      }
      if (used >= DAILY_TRAINING_MAX_PLAYS) return current;

      const grown = applyXpGain(current.profile, DAILY_TRAINING_XP);
      const leaderboard = syncLeaderboard(current.leaderboard, grown);
      const rank = rankForPlayer(leaderboard, grown.name);
      const profile = rank > 0 ? { ...grown, rank } : grown;
      const nextUsed = used + 1;
      const ts = Date.now();
      const complete = nextUsed >= DAILY_TRAINING_MAX_PLAYS;
      const trainNotif = {
        id: `n-train-${ts}`,
        title: complete ? "Daily training complete" : "Daily training",
        body: complete
          ? `+${DAILY_TRAINING_XP} XP — both plays used today. Streak mult ×1.02 after full training days.`
          : `+${DAILY_TRAINING_XP} XP. One more play left today.`,
        createdAt: "just now" as const,
        read: false as const,
        starred: false as const,
        recencyRank: ts
      };

      return {
        ...current,
        profile,
        leaderboard,
        trainingDayKey: dayKey,
        trainingPlaysUsed: nextUsed,
        notifications: [trainNotif, ...current.notifications]
      };
    });
  }

  function logOut() {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(getGameStorageKey());
      } catch {
        /* ignore */
      }
      clearSession();
      window.location.href = "/";
    }
  }

  return {
    state,
    logActivity,
    claimQuestReward,
    markNotificationRead,
    markDirectMessageRead,
    toggleNotificationStar,
    toggleDirectMessageStar,
    reactToFeedPost,
    addFeedComment,
    addFeedPost,
    updateProfile,
    recruitBoss,
    deleteRecruitedBoss,
    setActiveRecruitedBoss,
    setEquipmentSlot,
    playDailyTraining,
    dismissBossVictory,
    clearActivityLogBanner,
    logOut
  };
}
