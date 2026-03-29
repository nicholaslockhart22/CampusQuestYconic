import { localDateKey, localMondayDateKey } from "@/lib/calendar-local";
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
    handle: "averyrhody",
    avatarClass: "Scholar Ranger",
    level: 12,
    xp: 2480,
    xpToNext: 3000,
    streakDays: 9,
    rank: 2,
    bio: "URI honors student building a balanced run across academics, fitness, and campus leadership.",
    skillPoints: 2,
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
        id: "qd1",
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
        id: "qd2",
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
        id: "qd3",
        title: "Log Today's Win",
        description: "Record any study, workout, club, or campus activity.",
        frequency: "daily",
        progress: 0,
        goal: 1,
        xpReward: 55,
        tag: "Momentum",
        rewardClaimed: false
      },
      {
        id: "qd-career",
        title: "Career spark",
        description: "Office hours or volunteer / org meeting (+32 XP)",
        frequency: "daily",
        progress: 0,
        goal: 1,
        xpReward: 32,
        tag: "Campus",
        rewardClaimed: false
      },
      {
        id: "qe1",
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
        id: "qe2",
        title: "Campus Double-Up",
        description: "Attend two URI events or club meetings this week.",
        frequency: "weekly",
        progress: 1,
        goal: 2,
        xpReward: 150,
        tag: "Campus",
        rewardClaimed: false
      },
      {
        id: "qe3",
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
    bossBattles: [],
    recruitedBosses: [],
    activeRecruitedBossId: null,
    feed: [
      {
        id: "f-wbb-jordan-kim",
        author: "Jordan Kim",
        title: "Women's basketball night",
        body: "Went to the women's basketball game last night — the energy in the arena was unreal. URI played tough, the crowd was loud, and I left already counting down to the next home game. What a night.",
        category: "Campus",
        imageUrl: "/images/quad/wbb-arena.png",
        ramarks: ["wbb", "ramnation", "uri"],
        reactions: { nod: 12, hype: 18, verify: 5, assist: 4 },
        timestamp: "last night",
        comments: [
          {
            id: "c-wbb-1",
            author: "Alex T.",
            body: "The bench energy was insane!",
            timestamp: "6h ago"
          },
          {
            id: "c-wbb-2",
            author: "URI Spirit Club",
            body: "See you Saturday — bring the noise!",
            timestamp: "5h ago"
          }
        ]
      },
      {
        id: "f-keaney-alex-rivera",
        author: "Alex Rivera",
        authorHandle: "alex_rivera",
        streakDays: 7,
        title: "Morning lift at Keaney Gym",
        body: "Morning lift at Keaney Gym — new PR on bench! Nothing like URI's home court energy.",
        category: "Strength",
        imageUrl: "/images/quad/keaney-lift.png",
        ramarks: ["gym", "ramnation"],
        reactions: { nod: 5, hype: 12, verify: 3, assist: 4 },
        timestamp: "3h ago",
        comments: []
      },
      {
        id: "f-union-casey-lee",
        author: "Casey Lee",
        authorHandle: "casey_lee",
        streakDays: 3,
        postEmoji: "☕",
        title: "Coffee + flashcards at the union",
        body: "Midterms are coming but we're ready.",
        category: "Study",
        imageUrl: "/images/quad/memorial-union.png",
        ramarks: ["study", "coffee"],
        reactions: { nod: 2, hype: 0, verify: 0, assist: 0 },
        timestamp: "5h ago",
        comments: []
      },
      {
        id: "f-library-late",
        author: "Taylor Brooks",
        authorHandle: "taylor_b",
        title: "Library until midnight",
        body: "Carrels on 4th floor hit different when the whole row is in grind mode. Shout-out to whoever brought the quiet snacks.",
        category: "Study",
        imageUrl: "/images/quad/library-night.svg",
        ramarks: ["library", "finals"],
        reactions: { nod: 9, hype: 6, verify: 2, assist: 1 },
        timestamp: "8h ago",
        comments: [
          {
            id: "c-lib-1",
            author: "Morgan Ellis",
            body: "Same floor — see you tomorrow?",
            timestamp: "7h ago"
          }
        ]
      },
      {
        id: "f1",
        author: "Jordan Keaney",
        title: "Study win",
        body: "Knocked out 40 chem flashcards and still made it to the rec center.",
        category: "Knowledge",
        ramarks: ["study"],
        reactions: { nod: 4, hype: 3, verify: 2, assist: 2 },
        timestamp: "12m ago",
        comments: []
      },
      {
        id: "f2",
        author: "Mia Rhody",
        title: "Guild quest clear",
        body: "Our guild finished the community service quest at the Memorial Union.",
        category: "Social",
        ramarks: ["guild", "service"],
        reactions: { nod: 2, hype: 1, verify: 3, assist: 2 },
        timestamp: "44m ago",
        comments: []
      },
      {
        id: "f3",
        author: "URI Rec Sports",
        title: "Intramural signup week",
        body: "Volleyball and 5v5 soccer slots are open—grab a team before Friday.",
        category: "Campus",
        imageUrl: "/images/quad/involvement-fair.svg",
        ramarks: ["recsports", "intramurals"],
        reactions: { nod: 8, hype: 10, verify: 4, assist: 2 },
        timestamp: "2h ago",
        comments: []
      },
      {
        id: "f-quad-sunset",
        author: "Noah Kingston",
        authorHandle: "noah_k",
        postEmoji: "🌅",
        title: "Golden hour on the Quad",
        body: "Took the long way back from class — sometimes you need the sky to remind you why you picked this campus.",
        category: "Campus",
        imageUrl: "/images/quad/quad-sunset.svg",
        ramarks: ["quad", "uri"],
        reactions: { nod: 15, hype: 22, verify: 6, assist: 3 },
        timestamp: "yesterday",
        comments: [
          {
            id: "c-quad-1",
            author: "Emma Hall",
            body: "This belongs in the field notes feed 🔥",
            timestamp: "20h ago"
          }
        ]
      }
    ],
    feedFollowing: [
      {
        id: "ff1",
        author: "Sam Kingston",
        title: "Morning lift PR",
        body: "New squat max at Keaney before my 9 a.m. Never thought I'd be that person.",
        category: "Strength",
        imageUrl: "/images/quad/keaney-lift.png",
        ramarks: ["gym"],
        reactions: { nod: 1, hype: 2, verify: 2, assist: 1 },
        timestamp: "18m ago",
        comments: []
      },
      {
        id: "ff2",
        author: "Riley Chen",
        title: "Lab report submitted",
        body: "Finally shipped bio lab. Celebrating with ramen at the Union.",
        category: "Knowledge",
        imageUrl: "/images/quad/lab-science.svg",
        ramarks: ["bio", "lab"],
        reactions: { nod: 3, hype: 1, verify: 3, assist: 2 },
        timestamp: "1h ago",
        comments: [
          {
            id: "c-ff2-1",
            author: "Avery Rhody",
            body: "Huge — that protocol was brutal.",
            timestamp: "50m ago"
          }
        ]
      },
      {
        id: "ff3",
        author: "Dev Moore",
        title: "Hack night build",
        body: "Shipped a rough prototype for our capstone demo. Sleep is tomorrow's problem.",
        category: "Focus",
        imageUrl: "/images/quad/lab-science.svg",
        ramarks: ["capstone", "code"],
        reactions: { nod: 2, hype: 5, verify: 4, assist: 3 },
        timestamp: "3h ago",
        comments: []
      },
      {
        id: "ff4",
        author: "Casey Ruiz",
        authorHandle: "casey.uri",
        title: "Fair tabling for debate",
        body: "Signed up 20+ first-years at Involvement Fair — if you missed us, DM for the Discord.",
        category: "Social",
        imageUrl: "/images/quad/involvement-fair.svg",
        ramarks: ["clubs", "debate"],
        reactions: { nod: 6, hype: 4, verify: 2, assist: 0 },
        timestamp: "5h ago",
        comments: []
      },
      {
        id: "ff5",
        author: "Jordan Kim",
        title: "Quad study picnic",
        body: "Brought blankets, playlists, and problem sets. Open invite next Sunday same time.",
        category: "Study",
        imageUrl: "/images/quad/quad-sunset.svg",
        ramarks: ["study", "quad"],
        reactions: { nod: 4, hype: 7, verify: 1, assist: 5 },
        timestamp: "6h ago",
        comments: []
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
        read: false,
        starred: true,
        recencyRank: 900
      },
      {
        id: "n2",
        title: "Boss battle alert",
        body: "Midterm Hydra begins in 2 days. Complete three prep tasks to gain advantage.",
        createdAt: "1h ago",
        read: false,
        starred: false,
        recencyRank: 860
      },
      {
        id: "n3",
        title: "Streak milestone",
        body: "You're on a 9-day run—one more day unlocks the Ram Rising bonus track.",
        createdAt: "3h ago",
        read: true,
        starred: false,
        recencyRank: 800
      },
      {
        id: "n4",
        title: "Guild ping: Library Circle",
        body: "Mia started a deep-work thread: “Finals sprint — who’s in tonight?”",
        createdAt: "5h ago",
        read: false,
        starred: false,
        recencyRank: 760
      },
      {
        id: "n5",
        title: "Leaderboard shift",
        body: "You moved up to #2 on the campus XP board. Noah Kingston is still ahead.",
        createdAt: "Yesterday",
        read: true,
        starred: false,
        recencyRank: 700
      },
      {
        id: "n6",
        title: "Campus event RSVP",
        body: "Involvement Fair starts Friday 11am at the Quad. Tap Friends to squad up.",
        createdAt: "Yesterday",
        read: false,
        starred: false,
        recencyRank: 690
      },
      {
        id: "n7",
        title: "Weekly quest reminder",
        body: "Campus Double-Up: one more event or club meeting to finish the pair.",
        createdAt: "2d ago",
        read: true,
        starred: false,
        recencyRank: 600
      },
      {
        id: "n8",
        title: "Rhody Athletics",
        body: "Women’s basketball home stand this week — #ramnation student section theme night Thursday.",
        createdAt: "2d ago",
        read: true,
        starred: false,
        recencyRank: 590
      },
      {
        id: "n9",
        title: "Career Fair Golem prep",
        body: "Boss prep 2/6. Polish your resume before the employer queue opens.",
        createdAt: "3d ago",
        read: true,
        starred: false,
        recencyRank: 500
      },
      {
        id: "n10",
        title: "Keaney drop-in hours",
        body: "Rec staff added Sunday open gym blocks — log a workout and keep your stamina streak warm.",
        createdAt: "4h ago",
        read: false,
        starred: false,
        recencyRank: 575
      },
      {
        id: "n11",
        title: "Carothers study rooms",
        body: "Same-day group rooms just opened for finals week. Book early if you’re hosting a cram squad.",
        createdAt: "5h ago",
        read: true,
        starred: false,
        recencyRank: 560
      },
      {
        id: "n12",
        title: "Quad pop-up: free coffee",
        body: "Student org tabling near the Union steps until 2pm — quick social XP if you say hi to two tables.",
        createdAt: "Yesterday",
        read: false,
        starred: false,
        recencyRank: 545
      },
      {
        id: "n13",
        title: "Dining balance heads-up",
        body: "Rhody Bucks look thin for the week. Ram Account top-off is one tap in the dining app.",
        createdAt: "Yesterday",
        read: true,
        starred: false,
        recencyRank: 535
      },
      {
        id: "n14",
        title: "Writing center slots",
        body: "The Writing Center has same-night appointments. Bring a draft — great for knowledge + focus quests.",
        createdAt: "2d ago",
        read: false,
        starred: true,
        recencyRank: 525
      },
      {
        id: "n15",
        title: "Shuttle detour (temporary)",
        body: "Loop B skips Fine Arts for two days. Plan +5 minutes if you’re catching class from the dorms.",
        createdAt: "2d ago",
        read: true,
        starred: false,
        recencyRank: 515
      },
      {
        id: "n16",
        title: "Mindfulness @ Memorial Union",
        body: "20-minute guided reset Thursday noon. Low-key stamina recovery between lectures.",
        createdAt: "3d ago",
        read: false,
        starred: false,
        recencyRank: 505
      },
      {
        id: "n17",
        title: "Brightspace sync reminder",
        body: "Two syllabi updated overnight. Skim announcements so quest-sized deadlines don’t sneak up.",
        createdAt: "3d ago",
        read: true,
        starred: false,
        recencyRank: 495
      }
    ],
    directMessageThreads: [
      {
        id: "dm1",
        peerName: "Jordan Kim",
        peerHandle: "jordan_kim",
        lastMessage: "See you at the next home game!",
        lastAt: "2h ago",
        unread: true,
        starred: false,
        recencyRank: 880
      },
      {
        id: "dm2",
        peerName: "Alex Rivera",
        peerHandle: "alex_rivera",
        lastMessage: "Spot me tomorrow at Keaney?",
        lastAt: "Yesterday",
        unread: true,
        starred: true,
        recencyRank: 700
      },
      {
        id: "dm3",
        peerName: "Casey Lee",
        peerHandle: "casey_lee",
        lastMessage: "Thanks for the study guide link.",
        lastAt: "3d ago",
        unread: false,
        starred: false,
        recencyRank: 500
      },
      {
        id: "dm4",
        peerName: "Sam Kingston",
        peerHandle: "sam_kingston",
        lastMessage: "Want to split an Uber to the career panel?",
        lastAt: "4h ago",
        unread: false,
        starred: false,
        recencyRank: 840
      },
      {
        id: "dm5",
        peerName: "Riley Chen",
        peerHandle: "riley_chen",
        lastMessage: "Lab write-up submitted — celebrating with ramen if you’re free.",
        lastAt: "6h ago",
        unread: true,
        starred: false,
        recencyRank: 820
      },
      {
        id: "dm6",
        peerName: "Dev Moore",
        peerHandle: "dev_moore",
        lastMessage: "Capstone repo access sent. Check your URI email.",
        lastAt: "1d ago",
        unread: false,
        starred: false,
        recencyRank: 680
      },
      {
        id: "dm-guild-keaney",
        peerName: "Keaney Lifters Guild",
        lastMessage: "Jordan: Leg day crew meeting at 6 — who’s in?",
        lastAt: "30m ago",
        unread: true,
        starred: true,
        isGroup: true,
        recencyRank: 950
      },
      {
        id: "dm7",
        peerName: "Mia Rhody",
        peerHandle: "mia_rhody",
        lastMessage: "Guild service hours count if we log before Sunday, right?",
        lastAt: "1d ago",
        unread: false,
        starred: false,
        recencyRank: 670
      },
      {
        id: "dm8",
        peerName: "Emma Hall",
        peerHandle: "emma_hall",
        lastMessage: "Congrats on the rank jump 🎉",
        lastAt: "2d ago",
        unread: true,
        starred: false,
        recencyRank: 600
      },
      {
        id: "dm9",
        peerName: "Noah Kingston",
        peerHandle: "noah_k",
        lastMessage: "Friendly rivalry — see you on the leaderboard.",
        lastAt: "2d ago",
        unread: false,
        starred: false,
        recencyRank: 590
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
    ],
    equipmentLoadout: { hat: null, glasses: null, backpack: null },
    trainingDayKey: localDateKey(),
    trainingPlaysUsed: 0,
    campusRaidWeekKey: localMondayDateKey(),
    campusRaidContributions: {},
    pendingBossVictory: null,
    activityLogBanner: null
  };
}
