import { localDateKey, localMondayDateKey } from "@/lib/calendar-local";
import { syncLeaderboard } from "@/lib/game-logic";
import { getSampleState } from "@/lib/sample-data";
import type { CampusQuestState, StatBlock } from "@/lib/types";

const ZERO: StatBlock = {
  strength: 0,
  stamina: 0,
  knowledge: 0,
  social: 0,
  focus: 0
};

function toHandle(displayName: string): string {
  const s = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return (s || "ram").slice(0, 24);
}

/** New Ram: level 1, 0 XP, all stats zero; demo feed kept for Quad discovery. */
export function createFreshGameState(email: string, displayName: string): CampusQuestState {
  const sample = getSampleState();
  const name = displayName.trim();
  const profile = {
    name,
    email: email.toLowerCase(),
    handle: toHandle(name),
    avatarClass: "Rookie Ram",
    level: 1,
    xp: 0,
    xpToNext: 500,
    streakDays: 0,
    rank: 1,
    bio: "New Ram — time to level up.",
    skillPoints: 0,
    stats: { ...ZERO },
    achievements: []
  };

  const leaderboard = syncLeaderboard(
    [{ id: "me", name: profile.name, xp: 0, streak: 0 }],
    profile
  );

  return {
    ...sample,
    profile,
    activities: [],
    quests: sample.quests.map((q) => ({ ...q, progress: 0, rewardClaimed: false })),
    bossBattles: [],
    recruitedBosses: [],
    activeRecruitedBossId: null,
    inventory: [],
    leaderboard,
    notifications: [],
    directMessageThreads: [],
    equipmentLoadout: { hat: null, glasses: null, backpack: null },
    trainingDayKey: localDateKey(),
    trainingPlaysUsed: 0,
    campusRaidWeekKey: localMondayDateKey(),
    campusRaidContributions: {}
  };
}
