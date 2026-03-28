import { rankForPlayer, syncLeaderboard } from "@/lib/game-logic";
import type { CampusQuestState, StatBlock } from "@/lib/types";

function addStats(base: StatBlock, delta: Partial<StatBlock>): StatBlock {
  return {
    strength: base.strength + (delta.strength ?? 0),
    stamina: base.stamina + (delta.stamina ?? 0),
    knowledge: base.knowledge + (delta.knowledge ?? 0),
    social: base.social + (delta.social ?? 0),
    focus: base.focus + (delta.focus ?? 0)
  };
}

export function getSampleState(): CampusQuestState {
  const baseStats: StatBlock = {
    strength: 61,
    stamina: 68,
    knowledge: 82,
    social: 56,
    focus: 79
  };

  const activities = [
    {
      id: "a1",
      type: "study" as const,
      title: "Library grind session",
      durationMinutes: 95,
      notes: "Finished economics review and knocked out practice questions.",
      xpReward: 130,
      statDelta: { knowledge: 6, focus: 5 },
      loggedAt: "Today, 8:10 AM"
    },
    {
      id: "a2",
      type: "workout" as const,
      title: "Keaney lift session",
      durationMinutes: 50,
      notes: "Upper body day before afternoon class.",
      xpReward: 90,
      statDelta: { strength: 5, stamina: 4 },
      loggedAt: "Yesterday, 6:45 PM"
    },
    {
      id: "a3",
      type: "event" as const,
      title: "URI career center panel",
      durationMinutes: 70,
      notes: "Networked with two alumni in data roles.",
      xpReward: 110,
      statDelta: { social: 5, knowledge: 3 },
      loggedAt: "Yesterday, 2:30 PM"
    }
  ];

  const profileBase = {
    name: "Avery Rhody",
    avatarClass: "Scholar Ranger",
    level: 12,
    xp: 2480,
    xpToNext: 3000,
    streakDays: 9,
    rank: 2,
    bio: "URI honors student building a balanced run across academics, fitness, and campus leadership.",
    stats: activities.reduce((stats, activity) => addStats(stats, activity.statDelta), baseStats),
    achievements: [
      {
        id: "ach-1",
        name: "Ram Rising",
        description: "Logged five consecutive days of productive activity."
      },
      {
        id: "ach-2",
        name: "Guild Spark",
        description: "Helped a friend complete their first weekly quest."
      }
    ]
  };

  const leaderboardRaw = [
    { id: "l1", name: "Noah Kingston", xp: 9200, streak: 14 },
    { id: "l2", name: "Avery Rhody", xp: 0, streak: 9 },
    { id: "l3", name: "Emma Hall", xp: 7000, streak: 8 }
  ];
  const leaderboard = syncLeaderboard(leaderboardRaw, profileBase);
  const rank = rankForPlayer(leaderboard, profileBase.name);
  const profile = { ...profileBase, rank: rank || profileBase.rank };

  return {
    profile,
    activities,
    quests: [
      {
        id: "q1",
        title: "Win the Morning",
        description: "Complete one study session before noon.",
        frequency: "daily",
        progress: 1,
        goal: 1,
        xpReward: 80,
        tag: "Focus",
        rewardClaimed: false
      },
      {
        id: "q2",
        title: "Show Up for Rhody",
        description: "Attend one URI event or club meeting.",
        frequency: "daily",
        progress: 0,
        goal: 1,
        xpReward: 65,
        tag: "Campus",
        rewardClaimed: false
      },
      {
        id: "q3",
        title: "Balanced Build Week",
        description: "Log three different activity categories this week.",
        frequency: "weekly",
        progress: 2,
        goal: 3,
        xpReward: 180,
        tag: "Momentum",
        rewardClaimed: false
      },
      {
        id: "q4",
        title: "Rhody Welcome Quest",
        description: "Visit a campus event, gym session, and study block in the same week.",
        frequency: "special",
        progress: 2,
        goal: 3,
        xpReward: 240,
        tag: "URI",
        rewardClaimed: false
      }
    ],
    bossBattle: {
      id: "boss-1",
      name: "Midterm Hydra",
      theme: "Three exams in five days",
      prepProgress: 7,
      prepGoal: 10,
      lootPreview: [
        { name: "Common Notes Cache", rarity: "common" },
        { name: "Rare Focus Sigil", rarity: "rare" },
        { name: "Legendary Dean's Favor", rarity: "legendary" }
      ]
    },
    feed: [
      {
        id: "f1",
        author: "Jordan Keaney",
        title: "Study win",
        body: "Knocked out 40 chem flashcards and still made it to the rec center.",
        category: "Knowledge",
        confirmations: 11,
        timestamp: "12m ago"
      },
      {
        id: "f2",
        author: "Mia Rhody",
        title: "Guild quest clear",
        body: "Our guild finished the community service quest at the Memorial Union.",
        category: "Social",
        confirmations: 8,
        timestamp: "44m ago"
      }
    ],
    inventory: [
      {
        id: "i1",
        name: "Hydra Scale Notebook",
        rarity: "rare",
        source: "Midterm Hydra"
      },
      {
        id: "i2",
        name: "Rhody Crest Charm",
        rarity: "uncommon",
        source: "Campus Welcome Quest"
      },
      {
        id: "i3",
        name: "Finals Lantern",
        rarity: "legendary",
        source: "Boss Drop"
      }
    ],
    leaderboard,
    notifications: [
      {
        id: "n1",
        title: "Daily quest complete",
        body: "Win the Morning has been cleared. Claim 80 XP.",
        createdAt: "8m ago",
        read: false
      },
      {
        id: "n2",
        title: "Boss battle alert",
        body: "Midterm Hydra begins in 2 days. Complete three prep tasks to gain advantage.",
        createdAt: "1h ago",
        read: false
      }
    ],
    guilds: [
      {
        id: "g1",
        name: "Keaney Lifters Guild",
        focus: "Strength + stamina accountability",
        members: 42,
        momentum: "High"
      },
      {
        id: "g2",
        name: "Library Circle",
        focus: "Deep work sprints and knowledge runs",
        members: 68,
        momentum: "Rising"
      },
      {
        id: "g3",
        name: "Rhody Service Collective",
        focus: "Campus events and community quests",
        members: 31,
        momentum: "Steady"
      }
    ]
  };
}
