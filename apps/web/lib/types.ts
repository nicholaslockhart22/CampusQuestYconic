export type StatKey = "strength" | "stamina" | "knowledge" | "social" | "focus";

export type ActivityType =
  | "study"
  | "workout"
  | "club"
  | "networking"
  | "event"
  | "focus";

export type QuestFrequency = "daily" | "weekly" | "special";
export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export interface StatBlock {
  strength: number;
  stamina: number;
  knowledge: number;
  social: number;
  focus: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
}

export interface CharacterProfile {
  name: string;
  avatarClass: string;
  level: number;
  xp: number;
  xpToNext: number;
  streakDays: number;
  rank: number;
  bio: string;
  stats: StatBlock;
  achievements: Achievement[];
}

export interface ActivityLog {
  id: string;
  type: ActivityType;
  title: string;
  durationMinutes: number;
  notes: string;
  xpReward: number;
  statDelta: Partial<StatBlock>;
  loggedAt: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  frequency: QuestFrequency;
  progress: number;
  goal: number;
  xpReward: number;
  tag: string;
  /** After claiming the reward for the current cycle */
  rewardClaimed?: boolean;
}

export interface BossBattle {
  id: string;
  name: string;
  theme: string;
  prepProgress: number;
  prepGoal: number;
  lootPreview: {
    name: string;
    rarity: Rarity;
  }[];
}

export interface FeedPost {
  id: string;
  author: string;
  title: string;
  body: string;
  category: string;
  confirmations: number;
  timestamp: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  rarity: Rarity;
  source: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  streak: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface GuildSummary {
  id: string;
  name: string;
  focus: string;
  members: number;
  momentum: string;
}

export interface CampusQuestState {
  profile: CharacterProfile;
  activities: ActivityLog[];
  quests: Quest[];
  bossBattle: BossBattle;
  feed: FeedPost[];
  inventory: InventoryItem[];
  leaderboard: LeaderboardEntry[];
  notifications: NotificationItem[];
  guilds: GuildSummary[];
}
