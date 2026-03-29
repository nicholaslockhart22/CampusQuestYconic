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

export type PostReactionKind = "nod" | "hype" | "verify" | "assist";

export interface FeedPostReactions {
  nod: number;
  hype: number;
  verify: number;
  assist: number;
}

export interface FeedComment {
  id: string;
  author: string;
  body: string;
  timestamp: string;
}

export interface FeedPost {
  id: string;
  author: string;
  title: string;
  body: string;
  category: string;
  reactions: FeedPostReactions;
  timestamp: string;
  /** Campus-relative path (e.g. /feed/x.svg) or JPEG data URL from composer */
  imageUrl?: string;
  /** Ramarks: hashtag text without #, lowercase */
  ramarks: string[];
  comments: FeedComment[];
  /** @handle without @ */
  authorHandle?: string;
  /** Shown as streak line when positive */
  streakDays?: number;
  /** Optional mood emoji before the author name */
  postEmoji?: string;
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
  /** Pinned to top of the notifications list when true */
  starred?: boolean;
  /** Higher = newer; used to sort within starred / non-starred groups */
  recencyRank?: number;
}

export interface DirectMessageThread {
  id: string;
  peerName: string;
  /** Without @; omit for group chats */
  peerHandle?: string;
  lastMessage: string;
  lastAt: string;
  unread: boolean;
  /** Pinned to top of the messages list when true */
  starred?: boolean;
  /** Guild / group thread */
  isGroup?: boolean;
  /** Higher = newer; used to sort within starred / non-starred groups */
  recencyRank?: number;
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
  /**
   * Legacy boss list — migrated into `recruitedBosses` on load when that list was empty.
   * Kept empty in normalized state; use `recruitedBosses` for UI.
   */
  bossBattles: BossBattle[];
  /** User-created bosses (max 4) on the Battle screen */
  recruitedBosses: BossBattle[];
  /** Only this boss gains prep from `logActivity` when set */
  activeRecruitedBossId: string | null;
  /** Campus-wide discovery feed */
  feed: FeedPost[];
  /** People you follow (classmates & guildmates) */
  feedFollowing: FeedPost[];
  inventory: InventoryItem[];
  leaderboard: LeaderboardEntry[];
  notifications: NotificationItem[];
  /** Direct message conversation previews */
  directMessageThreads: DirectMessageThread[];
  guilds: GuildSummary[];
}
