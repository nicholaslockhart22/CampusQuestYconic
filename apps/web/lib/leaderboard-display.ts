/** Metrics used for “Rank by” on the mobile leaderboard screen. */
export type LeaderboardRankMetric =
  | "level"
  | "strength"
  | "stamina"
  | "knowledge"
  | "social"
  | "focus"
  | "bosses"
  | "finalBosses"
  | "guildLevel";

export const LEADERBOARD_FILTERS: {
  id: LeaderboardRankMetric;
  label: string;
  emoji: string;
}[] = [
  { id: "level", label: "Level", emoji: "⭐" },
  { id: "strength", label: "Strength", emoji: "💪" },
  { id: "stamina", label: "Stamina", emoji: "🏃" },
  { id: "knowledge", label: "Knowledge", emoji: "📚" },
  { id: "social", label: "Social", emoji: "👥" },
  { id: "focus", label: "Focus", emoji: "🎯" },
  { id: "bosses", label: "Bosses defeated", emoji: "⚔️" },
  { id: "finalBosses", label: "Final bosses defeated", emoji: "👑" },
  { id: "guildLevel", label: "Guild level", emoji: "🛡️" }
];

export interface LeaderboardStatsRow {
  id: string;
  name: string;
  handle: string;
  emoji: string;
  level: number;
  xp: number;
  strength: number;
  stamina: number;
  knowledge: number;
  social: number;
  focus: number;
  bossesDefeated: number;
  finalBossesDefeated: number;
  guildLevel: number;
}

export function metricValue(row: LeaderboardStatsRow, metric: LeaderboardRankMetric): number {
  switch (metric) {
    case "level":
      return row.level;
    case "strength":
      return row.strength;
    case "stamina":
      return row.stamina;
    case "knowledge":
      return row.knowledge;
    case "social":
      return row.social;
    case "focus":
      return row.focus;
    case "bosses":
      return row.bossesDefeated;
    case "finalBosses":
      return row.finalBossesDefeated;
    case "guildLevel":
      return row.guildLevel;
    default:
      return 0;
  }
}

export function filterLabel(metric: LeaderboardRankMetric): string {
  return LEADERBOARD_FILTERS.find((f) => f.id === metric)?.label ?? "Level";
}

/** Placeholder campus leaderboard (top students). */
export const CAMPUS_LEADERBOARD_PLACEHOLDERS: LeaderboardStatsRow[] = [
  {
    id: "campus-jordan-blake",
    name: "Jordan Blake",
    handle: "jordan_blake",
    emoji: "🎓",
    level: 24,
    xp: 8520,
    strength: 78,
    stamina: 82,
    knowledge: 88,
    social: 74,
    focus: 80,
    bossesDefeated: 14,
    finalBossesDefeated: 2,
    guildLevel: 6
  },
  {
    id: "campus-sam-rivera",
    name: "Sam Rivera",
    handle: "sam_rivera",
    emoji: "🦉",
    level: 22,
    xp: 7200,
    strength: 72,
    stamina: 76,
    knowledge: 85,
    social: 80,
    focus: 77,
    bossesDefeated: 12,
    finalBossesDefeated: 1,
    guildLevel: 5
  },
  {
    id: "campus-alex-chen",
    name: "Alex Chen",
    handle: "alex_chen",
    emoji: "🐏",
    level: 21,
    xp: 6800,
    strength: 80,
    stamina: 70,
    knowledge: 78,
    social: 72,
    focus: 75,
    bossesDefeated: 11,
    finalBossesDefeated: 1,
    guildLevel: 5
  },
  {
    id: "campus-morgan-taylor",
    name: "Morgan Taylor",
    handle: "morgan_t",
    emoji: "⚡",
    level: 19,
    xp: 5900,
    strength: 68,
    stamina: 74,
    knowledge: 82,
    social: 76,
    focus: 88,
    bossesDefeated: 9,
    finalBossesDefeated: 1,
    guildLevel: 4
  },
  {
    id: "campus-riley-foster",
    name: "Riley Foster",
    handle: "riley_foster",
    emoji: "🌟",
    level: 18,
    xp: 5400,
    strength: 65,
    stamina: 80,
    knowledge: 79,
    social: 85,
    focus: 70,
    bossesDefeated: 8,
    finalBossesDefeated: 0,
    guildLevel: 4
  },
  {
    id: "campus-casey-kim",
    name: "Casey Kim",
    handle: "casey_kim",
    emoji: "🔥",
    level: 17,
    xp: 4950,
    strength: 88,
    stamina: 72,
    knowledge: 70,
    social: 68,
    focus: 73,
    bossesDefeated: 10,
    finalBossesDefeated: 0,
    guildLevel: 3
  },
  {
    id: "campus-quinn-davis",
    name: "Quinn Davis",
    handle: "quinn_d",
    emoji: "📚",
    level: 16,
    xp: 4500,
    strength: 58,
    stamina: 65,
    knowledge: 92,
    social: 70,
    focus: 84,
    bossesDefeated: 7,
    finalBossesDefeated: 0,
    guildLevel: 4
  },
  {
    id: "campus-jamie-walsh",
    name: "Jamie Walsh",
    handle: "jamie_walsh",
    emoji: "🏃",
    level: 15,
    xp: 4100,
    strength: 70,
    stamina: 90,
    knowledge: 72,
    social: 74,
    focus: 68,
    bossesDefeated: 8,
    finalBossesDefeated: 0,
    guildLevel: 3
  },
  {
    id: "campus-skyler-hayes",
    name: "Skyler Hayes",
    handle: "skyler_h",
    emoji: "🎯",
    level: 14,
    xp: 3700,
    strength: 62,
    stamina: 68,
    knowledge: 76,
    social: 66,
    focus: 91,
    bossesDefeated: 6,
    finalBossesDefeated: 0,
    guildLevel: 2
  },
  {
    id: "campus-drew-martinez",
    name: "Drew Martinez",
    handle: "drew_m",
    emoji: "💪",
    level: 13,
    xp: 3300,
    strength: 86,
    stamina: 78,
    knowledge: 64,
    social: 72,
    focus: 66,
    bossesDefeated: 9,
    finalBossesDefeated: 0,
    guildLevel: 3
  },
  {
    id: "campus-parker-jones",
    name: "Parker Jones",
    handle: "parker_j",
    emoji: "🧠",
    level: 12,
    xp: 2900,
    strength: 55,
    stamina: 62,
    knowledge: 89,
    social: 78,
    focus: 80,
    bossesDefeated: 5,
    finalBossesDefeated: 0,
    guildLevel: 2
  },
  {
    id: "campus-avery-smith",
    name: "Avery Smith",
    handle: "avery_smith",
    emoji: "👟",
    level: 11,
    xp: 2550,
    strength: 74,
    stamina: 84,
    knowledge: 68,
    social: 70,
    focus: 64,
    bossesDefeated: 6,
    finalBossesDefeated: 0,
    guildLevel: 2
  },
  {
    id: "campus-reese-brown",
    name: "Reese Brown",
    handle: "reese_b",
    emoji: "🎓",
    level: 10,
    xp: 2200,
    strength: 60,
    stamina: 66,
    knowledge: 80,
    social: 82,
    focus: 72,
    bossesDefeated: 4,
    finalBossesDefeated: 0,
    guildLevel: 2
  },
  {
    id: "campus-cameron-lee",
    name: "Cameron Lee",
    handle: "cameron_lee",
    emoji: "🦉",
    level: 9,
    xp: 1850,
    strength: 64,
    stamina: 70,
    knowledge: 74,
    social: 76,
    focus: 69,
    bossesDefeated: 4,
    finalBossesDefeated: 0,
    guildLevel: 1
  },
  {
    id: "campus-finley-clark",
    name: "Finley Clark",
    handle: "finley_c",
    emoji: "🐏",
    level: 8,
    xp: 1520,
    strength: 58,
    stamina: 64,
    knowledge: 71,
    social: 74,
    focus: 67,
    bossesDefeated: 3,
    finalBossesDefeated: 0,
    guildLevel: 1
  }
];

const FRIEND_EMOJIS = ["🎓", "🦉", "🐏", "⚡", "🌟", "🔥", "📚", "🏃", "🎯", "💪", "🧠", "👟"];

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Synthetic stats for friends list (only name/handle persisted). */
export function statsForFriend(id: string, name: string): Omit<LeaderboardStatsRow, "id" | "name" | "handle"> {
  const h = hashSeed(`${id}:${name}`);
  const level = 6 + (h % 14);
  return {
    emoji: FRIEND_EMOJIS[h % FRIEND_EMOJIS.length],
    level,
    xp: level * 220 + (h % 800),
    strength: 35 + (h % 50),
    stamina: 35 + ((h >> 3) % 50),
    knowledge: 35 + ((h >> 6) % 50),
    social: 35 + ((h >> 9) % 50),
    focus: 35 + ((h >> 12) % 50),
    bossesDefeated: h % 12,
    finalBossesDefeated: h % 3,
    guildLevel: 1 + (h % 5)
  };
}

export function sortByMetric(rows: LeaderboardStatsRow[], metric: LeaderboardRankMetric): LeaderboardStatsRow[] {
  return [...rows].sort(
    (a, b) => metricValue(b, metric) - metricValue(a, metric) || b.xp - a.xp
  );
}
